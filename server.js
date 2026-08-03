import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import fs from "node:fs";
import { Readable } from "node:stream";
import { Blob } from "node:buffer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicPath = join(__dirname, "public");

const binaryName = process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp";
const binaryPath = join(__dirname, binaryName);

const fastify = Fastify();

const LRCLIB_BASE = "https://lrclib.net/api";
const LRCLIB_UA = "THPMusic/1.0 (+https://thehtmlproject.com)";
const LRCLIB_TIMEOUT_MS = 7000;
const LYRICS_TTL_MS = 6 * 60 * 60 * 1000;
const LYRICS_MISS_TTL_MS = 10 * 60 * 1000;
const LYRICS_CACHE_LIMIT = 400;

if (typeof global.File === "undefined") {
  global.File = class File extends Blob {
    constructor(parts, name, options = {}) {
      super(parts, options);
      this.name = String(name || "");
      this.lastModified = options.lastModified ?? Date.now();
    }
    get [Symbol.toStringTag]() {
      return "File";
    }
  };
}

const { default: fetch } = await import("node-fetch");
const { default: ytSearch } = await import("yt-search");
const { default: YTDlpWrap } = await import("yt-dlp-wrap");

let ytDlpWrap;
(async () => {
  try {
    if (!fs.existsSync(binaryPath)) {
      console.log("[Engine] Downloading binary...");
      await YTDlpWrap.default.downloadFromGithub(binaryPath);
      if (process.platform !== "win32") fs.chmodSync(binaryPath, "755");
    }
    ytDlpWrap = new YTDlpWrap.default(binaryPath);
    console.log("[Engine] Ready.");
  } catch (e) {
    console.error("[Engine] Error:", e);
  }
})();

fastify.get("/music/meta", async (req, reply) => {
  const { q } = req.query;
  if (!q) return reply.status(400).send({ error: "Missing query" });
  try {
    const [itunesRes, ytRes] = await Promise.allSettled([
      fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(
          q
        )}&media=music&entity=song&limit=15`
      ).then((r) => r.json()),
      ytSearch(q),
    ]);

    let results = [];

    if (itunesRes.status === "fulfilled" && itunesRes.value.results) {
      results = results.concat(itunesRes.value.results);
    }

    if (ytRes.status === "fulfilled" && ytRes.value.videos) {
      const ytVideos = ytRes.value.videos.slice(0, 15).map((v) => ({
        trackName: v.title,
        artistName: v.author.name,
        artworkUrl100: v.thumbnail,
        artworkUrl60: v.thumbnail,
        trackId: v.videoId,
        videoId: v.videoId,
        collectionName: "YouTube",
        source: "youtube",
        trackTimeMillis: v.seconds * 1000,
      }));
      results = results.concat(ytVideos);
    }

    return reply.send({ resultCount: results.length, results });
  } catch (e) {
    console.error(e);
    return reply.status(500).send({ error: "Meta failed" });
  }
});

const OFF_TOPIC = /\b(cover|remix|karaoke|instrumental|reaction|sped\s*up|slowed|nightcore|8d\s*audio|tutorial|lesson|mashup|parody)\b/i;
const LIVE_HINT = /\b(live|concert|tour|festival|session)\b/i;

function scoreVideoCandidate(video, targetSeconds, query) {
  const title = String(video.title || "");
  const author = String(video.author?.name || "");
  const seconds = Number(video.seconds) || 0;
  const lowerQuery = String(query || "").toLowerCase();
  let score = 0;

  if (targetSeconds && seconds) {
    const diff = Math.abs(seconds - targetSeconds);
    if (diff <= 1) score += 60;
    else if (diff <= 3) score += 45;
    else if (diff <= 6) score += 25;
    else if (diff <= 12) score += 5;
    else score -= Math.min(45, diff);
  }

  if (/-\s*topic\s*$/i.test(author)) score += 28;
  if (/official\s*audio|full\s*audio/i.test(title)) score += 10;
  if (/official\s*(music\s*)?video/i.test(title)) score += 4;

  if (LIVE_HINT.test(title) && !LIVE_HINT.test(lowerQuery)) score -= 25;
  if (OFF_TOPIC.test(title) && !OFF_TOPIC.test(lowerQuery)) score -= 22;
  if (seconds > 0 && seconds < 45) score -= 30;
  if (seconds > 900) score -= 25;

  const views = Number(video.views) || 0;
  if (views > 0) score += Math.min(10, Math.log10(views));

  return score;
}

fastify.get("/music/search", async (req, reply) => {
  const q = req.query.q;
  if (!q) return reply.status(400).send({ error: "Query required" });
  const targetSeconds = Number(req.query.duration) > 0 ? Number(req.query.duration) : null;
  try {
    const result = await ytSearch(q);
    const videos = Array.isArray(result?.videos) ? result.videos.slice(0, 12) : [];
    if (!videos.length) return reply.status(404).send({ error: "No results" });

    let best = videos[0];
    let bestScore = -Infinity;
    for (const video of videos) {
      const score = scoreVideoCandidate(video, targetSeconds, q);
      if (score > bestScore) {
        bestScore = score;
        best = video;
      }
    }

    return reply.send({
      videoId: best.videoId,
      duration: Number(best.seconds) || null,
      title: best.title || "",
      author: best.author?.name || "",
    });
  } catch (e) {
    return reply.status(500).send({ error: "Search failed" });
  }
});

fastify.get("/music/lyrics", async (req, reply) => {
  const { artist = "", title = "", duration = "" } = req.query || {};
  if (!artist && !title) return reply.status(400).send({ error: "Missing artist or title" });

  const durationSec = Number(duration) > 0 ? Number(duration) : null;
  const cacheKey = lyricsCacheKey(artist, title, durationSec);
  const cached = readLyricsCache(cacheKey);
  if (cached) {
    if (!cached.value) return reply.status(404).send({ error: "No lyrics" });
    return reply.send(cached.value);
  }

  try {
    const found = await resolveLyrics(artist, title, durationSec);
    if (!found) {
      writeLyricsCache(cacheKey, null, LYRICS_MISS_TTL_MS);
      return reply.status(404).send({ error: "No lyrics" });
    }
    writeLyricsCache(cacheKey, found, LYRICS_TTL_MS);
    return reply.send(found);
  } catch (e) {
    console.error("[Lyrics]", e.message || e);
    return reply.status(500).send({ error: "Lyrics failed" });
  }
});

fastify.get("/music/radio", async (req, reply) => {
  const { q } = req.query || {};
  if (!q) return reply.status(400).send({ error: "Missing query" });
  try {
    const res = await ytSearch(q);
    const videos = Array.isArray(res?.videos) ? res.videos.slice(0, 15) : [];
    const mapped = videos.map((v) => ({
      trackName: v.title,
      artistName: v.author?.name || "",
      artworkUrl100: v.thumbnail,
      artworkUrl60: v.thumbnail,
      trackId: v.videoId,
      videoId: v.videoId,
      collectionName: "Radio",
      source: "youtube",
      trackTimeMillis: v.seconds * 1000,
    }));
    return reply.send({ resultCount: mapped.length, results: mapped });
  } catch (e) {
    console.error("[Radio]", e.message || e);
    return reply.status(500).send({ error: "Radio failed" });
  }
});

const directUrlCache = new Map();
const DIRECT_URL_TTL_MS = 5 * 60 * 1000;

async function execYtDlpForText(args) {
  if (ytDlpWrap && typeof ytDlpWrap.execPromise === "function") {
    return await ytDlpWrap.execPromise(args);
  }
  return await new Promise((resolve, reject) => {
    try {
      const child = ytDlpWrap.exec(args);
      let out = "";
      let err = "";
      if (child.stdout) child.stdout.on("data", (d) => (out += d.toString()));
      if (child.stderr) child.stderr.on("data", (d) => (err += d.toString()));
      child.on("error", reject);
      child.on("close", (code) => {
        if (code === 0) resolve(out);
        else reject(new Error(err || `yt-dlp exited with code ${code}`));
      });
    } catch (e) {
      reject(e);
    }
  });
}

async function resolveDirectAudioUrl(id) {
  const now = Date.now();
  const cached = directUrlCache.get(id);
  if (cached && cached.expiresAt > now) return cached.url;

  const args = [
    `https://www.youtube.com/watch?v=${id}`,
    "-f",
    "bestaudio[ext=m4a]/bestaudio[ext=mp4]/bestaudio",
    "--no-playlist",
    "--no-warnings",
    "-g",
  ];

  const out = await execYtDlpForText(args);
  const url = String(out).trim().split(/\r?\n/).filter(Boolean).pop();

  if (!url) throw new Error("no-direct-url");

  directUrlCache.set(id, { url, expiresAt: now + DIRECT_URL_TTL_MS });
  return url;
}

const lyricsCache = new Map();

const LYRIC_NOISE_WORDS =
  "official|officiel|video|videoclip|audio|lyric|lyrics|letra|visualizer|visualiser|hd|hq|4k|1080p|remaster|remastered|explicit|clean|mv|m\\/v|music\\s*video|full\\s*song|with\\s*lyrics|color\\s*coded|sub\\s*espa\\u00f1ol|legendado";

const LYRIC_NOISE_PARENS = new RegExp(
  `\\((?:[^()]*(?:${LYRIC_NOISE_WORDS})[^()]*)\\)|\\[(?:[^\\[\\]]*(?:${LYRIC_NOISE_WORDS})[^\\[\\]]*)\\]`,
  "gi"
);

const LYRIC_NOISE_TRAILING = new RegExp(
  `\\s*[-|\\u2013\\u2014]\\s*(?:${LYRIC_NOISE_WORDS})[^-|\\u2013\\u2014]*$`,
  "gi"
);

const LYRIC_FEATURE = /\s*[([]?\s*(?:feat\.?|ft\.?|featuring|with)\s+[^)\]]*[)\]]?\s*$/gi;

function cleanLyricTitle(raw) {
  let value = String(raw || "");
  value = value.replace(LYRIC_NOISE_PARENS, " ");
  value = value.replace(LYRIC_NOISE_TRAILING, " ");
  value = value.replace(LYRIC_FEATURE, " ");
  value = value.replace(/[“”"]/g, "");
  value = value.replace(/\s{2,}/g, " ").trim();
  value = value.replace(/[\s\-\u2013\u2014|]+$/g, "").trim();
  return value;
}

function cleanLyricArtist(raw) {
  let value = String(raw || "");
  value = value.replace(/\s*-\s*Topic\s*$/i, "");
  value = value.replace(/VEVO$/i, "");
  value = value.replace(/\s*(?:official|music|records|channel|tv)\s*$/i, "");
  value = value.replace(LYRIC_NOISE_PARENS, " ");
  value = value.replace(/\s{2,}/g, " ").trim();
  return value;
}

function splitArtistTitle(value) {
  const match = String(value || "").match(/^\s*(.+?)\s+[-\u2013\u2014]\s+(.+?)\s*$/);
  if (!match) return null;
  return { artist: match[1].trim(), title: match[2].trim() };
}

function buildLyricCandidates(rawArtist, rawTitle) {
  const candidates = [];
  const push = (artist, title) => {
    const a = String(artist || "").trim();
    const t = String(title || "").trim();
    if (!t) return;
    const dupe = candidates.some(
      (c) => c.artist.toLowerCase() === a.toLowerCase() && c.title.toLowerCase() === t.toLowerCase()
    );
    if (dupe) return;
    candidates.push({ artist: a, title: t });
  };

  const cleanArtist = cleanLyricArtist(rawArtist);
  const cleanTitle = cleanLyricTitle(rawTitle);
  const combined = splitArtistTitle(cleanTitle);

  if (combined) {
    push(cleanLyricArtist(combined.artist), cleanLyricTitle(combined.title));
    push(cleanArtist, cleanLyricTitle(combined.title));
  }
  push(cleanArtist, cleanTitle);
  push(String(rawArtist || "").trim(), String(rawTitle || "").trim());
  if (combined) push("", cleanLyricTitle(combined.title));
  push("", cleanTitle);

  return candidates.slice(0, 6);
}

async function lrcLibRequest(path, params) {
  const url = `${LRCLIB_BASE}${path}?${params.toString()}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LRCLIB_TIMEOUT_MS);
  try {
    const resp = await fetch(url, {
      headers: { "User-Agent": LRCLIB_UA, Accept: "application/json" },
      signal: controller.signal,
    });
    if (!resp.ok) return null;
    return await resp.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function scoreLyricRow(row, candidate, durationSec) {
  if (!row || (!row.syncedLyrics && !row.plainLyrics)) return -Infinity;
  let score = 0;
  if (row.syncedLyrics) score += 100;
  else score += 20;

  if (Number.isFinite(durationSec) && durationSec > 0 && Number.isFinite(row.duration)) {
    const diff = Math.abs(row.duration - durationSec);
    if (diff <= 2) score += 40;
    else if (diff <= 5) score += 25;
    else if (diff <= 12) score += 10;
    else score -= Math.min(30, diff / 3);
  }

  const rowTitle = String(row.trackName || "").toLowerCase();
  const rowArtist = String(row.artistName || "").toLowerCase();
  const wantTitle = candidate.title.toLowerCase();
  const wantArtist = candidate.artist.toLowerCase();

  if (wantTitle && rowTitle === wantTitle) score += 15;
  else if (wantTitle && rowTitle.includes(wantTitle)) score += 6;

  if (wantArtist && rowArtist === wantArtist) score += 15;
  else if (wantArtist && rowArtist.includes(wantArtist)) score += 6;

  if (row.instrumental) score -= 60;
  return score;
}

function shapeLyricResult(row, via) {
  if (!row) return null;
  if (!row.syncedLyrics && !row.plainLyrics) return null;
  return {
    syncedLyrics: row.syncedLyrics || null,
    plainLyrics: row.plainLyrics || null,
    instrumental: Boolean(row.instrumental),
    source: "lrclib",
    via,
    matched: {
      artist: row.artistName || "",
      title: row.trackName || "",
      album: row.albumName || "",
      duration: Number.isFinite(row.duration) ? row.duration : null,
    },
  };
}

async function resolveLyrics(rawArtist, rawTitle, durationSec) {
  const candidates = buildLyricCandidates(rawArtist, rawTitle);
  if (!candidates.length) return null;

  if (Number.isFinite(durationSec) && durationSec > 0) {
    for (const candidate of candidates) {
      if (!candidate.artist) continue;
      const params = new URLSearchParams({
        artist_name: candidate.artist,
        track_name: candidate.title,
        duration: String(Math.round(durationSec)),
      });
      const exact = await lrcLibRequest("/get", params);
      const shaped = shapeLyricResult(exact, "get");
      if (shaped && shaped.syncedLyrics) return shaped;
    }
  }

  let best = null;
  let bestScore = -Infinity;

  for (const candidate of candidates) {
    const params = new URLSearchParams();
    params.set("track_name", candidate.title);
    if (candidate.artist) params.set("artist_name", candidate.artist);
    const rows = await lrcLibRequest("/search", params);
    if (Array.isArray(rows)) {
      for (const row of rows.slice(0, 20)) {
        const score = scoreLyricRow(row, candidate, durationSec);
        if (score > bestScore) {
          bestScore = score;
          best = row;
        }
      }
    }
    if (best && best.syncedLyrics && bestScore >= 130) break;
  }

  if (!best) {
    const first = candidates[0];
    const query = [first.artist, first.title].filter(Boolean).join(" ");
    const rows = await lrcLibRequest("/search", new URLSearchParams({ q: query }));
    if (Array.isArray(rows)) {
      for (const row of rows.slice(0, 20)) {
        const score = scoreLyricRow(row, first, durationSec);
        if (score > bestScore) {
          bestScore = score;
          best = row;
        }
      }
    }
  }

  return shapeLyricResult(best, "search");
}

function lyricsCacheKey(artist, title, durationSec) {
  const bucket = Number.isFinite(durationSec) && durationSec > 0 ? Math.round(durationSec / 5) : "x";
  return `${String(artist || "").toLowerCase()}|${String(title || "").toLowerCase()}|${bucket}`;
}

function readLyricsCache(key) {
  const hit = lyricsCache.get(key);
  if (!hit) return null;
  if (hit.expiresAt <= Date.now()) {
    lyricsCache.delete(key);
    return null;
  }
  return hit;
}

function writeLyricsCache(key, value, ttl) {
  if (lyricsCache.size >= LYRICS_CACHE_LIMIT) {
    const oldest = lyricsCache.keys().next().value;
    if (oldest !== undefined) lyricsCache.delete(oldest);
  }
  lyricsCache.set(key, { value, expiresAt: Date.now() + ttl });
}

fastify.get("/music/stream", async (req, reply) => {
  const { id } = req.query;

  if (!id || !ytDlpWrap) {
    return reply.status(400).send({ error: "Unavailable" });
  }

  try {
    reply.header("Content-Type", "audio/mp4");
    reply.header("Cache-Control", "no-store");
    reply.header("Accept-Ranges", "none");

    const stream = ytDlpWrap.execStream([
      `https://www.youtube.com/watch?v=${id}`,
      "-f",
      "bestaudio[ext=m4a]/bestaudio[ext=mp4]/bestaudio",
      "--no-playlist",
      "--no-warnings",
      "-o",
      "-"
    ]);

    stream.on("error", (e) => {
      console.error(e);
      if (!reply.sent) {
        reply.status(500).send({ error: "Stream failed" });
      }
    });

    return reply.send(stream);
  } catch (e) {
    console.error(e);
    return reply.status(500).send({ error: "Stream failed" });
  }
});

fastify.get("/music/direct-audio", async (req, reply) => {
  const { id } = req.query;
  if (!id) return reply.status(400).send({ error: "Missing id" });
  try {
    const url = await resolveDirectAudioUrl(id);
    const headers = {};
    if (req.headers.range) headers.Range = req.headers.range;
    const resp = await fetch(url, { headers });

    reply.status(resp.status);
    resp.headers.forEach((val, key) => {
      if (["connection", "transfer-encoding"].includes(key.toLowerCase())) return;
      reply.header(key, val);
    });
    reply.header("Cache-Control", "no-store");

    let body = resp.body || null;
    if (body && typeof body.getReader === "function") {
      body = Readable.fromWeb(body);
    }
    return reply.send(body);
  } catch (e) {
    console.error("[DirectAudio]", e.message || e);
    return reply.status(500).send({ error: "Direct audio failed" });
  }
});

fastify.get("/music/cover", async (req, reply) => {
  const { url } = req.query;
  if (!url) return reply.status(400).send("Missing url");
  try {
    const resp = await fetch(url);
    const buffer = await resp.arrayBuffer();
    reply.header("Content-Type", resp.headers.get("content-type"));
    reply.header("Cache-Control", "public, max-age=604800, stale-while-revalidate=86400");
    return reply.send(Buffer.from(buffer));
  } catch (e) {
    return reply.status(500).send("Error");
  }
});

fastify.register(fastifyStatic, {
  root: publicPath,
  prefix: "/",
});

fastify.setNotFoundHandler((req, reply) => {
  reply.sendFile("index.html");
});

const port = 3333;
fastify
  .listen({ port, host: "0.0.0.0" })
  .then(() => {
    console.log(`Music App running on http://localhost:${port}`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
