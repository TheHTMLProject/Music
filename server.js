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

try {
  if (typeof process.loadEnvFile === "function") process.loadEnvFile(join(__dirname, ".env"));
} catch {
  try {
    const raw = fs.readFileSync(join(__dirname, ".env"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  } catch {}
}

const binaryName = process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp";
const binaryPath = join(__dirname, binaryName);

const GEMINI_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
const GEMINI_FALLBACK = "gemini-3.1-flash-lite";
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_TIMEOUT_MS = 20000;
const GEMINI_MAX_RPM = 12;

const geminiCalls = [];

function geminiRateAvailable() {
  const cutoff = Date.now() - 60000;
  while (geminiCalls.length && geminiCalls[0] < cutoff) geminiCalls.shift();
  return geminiCalls.length < GEMINI_MAX_RPM;
}

async function callGeminiModel(model, { system, prompt, schema, temperature = 0.9 }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);
  try {
    const resp = await fetch(`${GEMINI_BASE}/${model}:generateContent?key=${GEMINI_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature,
        },
      }),
    });
    if (!resp.ok) {
      const detail = await resp.text();
      const error = new Error(`gemini-${resp.status}`);
      error.status = resp.status;
      error.detail = detail.slice(0, 300);
      throw error;
    }
    const json = await resp.json();
    const text = json?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
    if (!text) return null;
    return JSON.parse(text);
  } finally {
    clearTimeout(timer);
  }
}

async function callGemini(options) {
  if (!GEMINI_KEY) return null;
  if (!geminiRateAvailable()) {
    const error = new Error("gemini-rate-limited");
    error.status = 429;
    throw error;
  }
  geminiCalls.push(Date.now());
  try {
    return await callGeminiModel(GEMINI_MODEL, options);
  } catch (e) {
    if (e.status === 404 || e.status === 429 || (e.status >= 500 && e.status < 600)) {
      console.warn("[Gemini] primary failed, trying fallback:", e.message);
      return await callGeminiModel(GEMINI_FALLBACK, options);
    }
    throw e;
  }
}

const TRACK_LIST_SCHEMA = {
  type: "OBJECT",
  properties: {
    title: { type: "STRING" },
    description: { type: "STRING" },
    tracks: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          artist: { type: "STRING" },
          title: { type: "STRING" },
        },
        required: ["artist", "title"],
      },
    },
  },
  required: ["title", "tracks"],
};

const MIXES_SCHEMA = {
  type: "OBJECT",
  properties: {
    mixes: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          artist: { type: "STRING" },
          title: { type: "STRING" },
          mixType: { type: "STRING" },
          description: { type: "STRING" },
          tracks: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                artist: { type: "STRING" },
                title: { type: "STRING" },
              },
              required: ["artist", "title"],
            },
          },
        },
        required: ["artist", "title", "mixType", "tracks"],
      },
    },
  },
  required: ["mixes"],
};

const TRANSLATE_SCHEMA = {
  type: "OBJECT",
  properties: {
    sourceLanguage: { type: "STRING" },
    sameLanguage: { type: "BOOLEAN" },
    lines: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: ["sourceLanguage", "sameLanguage", "lines"],
};

const CURATOR_SYSTEM = [
  "You are an expert music curator building listening queues for a music player.",
  "Rules you must always follow:",
  "1. Only suggest real, commercially released songs that exist on streaming services.",
  "2. Never invent song titles, never suggest podcasts, interviews, tutorials or non music audio.",
  "3. Use the exact primary artist name and the exact official track title, with no extra words such as Official Video, Remix, Live or Lyrics.",
  "4. Build a queue that flows: keep energy, tempo and mood coherent from one track to the next, and vary the artists so no artist dominates.",
  "5. Mix familiar picks with a few well chosen deeper cuts that genuinely match the taste shown.",
  "6. Never repeat a track that is listed as already played or excluded.",
].join(" ");

function normalizeMatchText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\(.*?\)|\[.*?\]/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function textsRelated(a, b) {
  const left = normalizeMatchText(a);
  const right = normalizeMatchText(b);
  if (!left || !right) return false;
  if (left === right) return true;
  if (left.includes(right) || right.includes(left)) return true;
  const leftWords = new Set(left.split(" "));
  const rightWords = right.split(" ");
  const shared = rightWords.filter((w) => leftWords.has(w)).length;
  return shared / Math.max(1, rightWords.length) >= 0.7;
}

async function resolveSuggestedTrack(candidate) {
  const artist = String(candidate?.artist || "").trim();
  const title = String(candidate?.title || "").trim();
  if (!artist || !title) return null;

  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
      `${artist} ${title}`
    )}&media=music&entity=song&limit=6`;
    const resp = await fetch(url);
    if (resp.ok) {
      const json = await resp.json();
      const rows = Array.isArray(json?.results) ? json.results : [];
      for (const row of rows) {
        if (textsRelated(row.trackName, title) && textsRelated(row.artistName, artist)) {
          return { ...row, source: "catalog", aiSuggested: true };
        }
      }
    }
  } catch {}

  try {
    const res = await ytSearch(`${artist} ${title} audio`);
    const videos = Array.isArray(res?.videos) ? res.videos.slice(0, 6) : [];
    for (const video of videos) {
      const classified = classifyYouTubeResult(video);
      if (classified.kind === "reject") continue;
      if (!textsRelated(video.title, title)) continue;
      return {
        trackName: title,
        artistName: artist,
        artworkUrl100: video.thumbnail,
        artworkUrl60: video.thumbnail,
        trackId: video.videoId,
        videoId: video.videoId,
        collectionName: "YouTube",
        source: "youtube",
        trackTimeMillis: (Number(video.seconds) || 0) * 1000,
        trackExplicitness: /\bexplicit\b/i.test(String(video.title || "")) ? "explicit" : "notExplicit",
        aiSuggested: true,
      };
    }
  } catch {}

  return null;
}

async function resolveSuggestions(candidates, excludeKeys) {
  const seen = new Set(excludeKeys || []);
  const limit = 5;
  const resolved = [];

  for (let i = 0; i < candidates.length; i += limit) {
    const slice = candidates.slice(i, i + limit);
    const batch = await Promise.all(slice.map((c) => resolveSuggestedTrack(c).catch(() => null)));
    for (const track of batch) {
      if (!track) continue;
      const key = normalizeMatchText(`${track.artistName} ${track.trackName}`);
      if (seen.has(key)) continue;
      seen.add(key);
      resolved.push(track);
    }
  }
  return resolved;
}

function describeTrackList(list, label) {
  const items = (Array.isArray(list) ? list : [])
    .slice(0, 25)
    .map((t) => `${t.artist || t.artistName || ""} - ${t.title || t.trackName || ""}`.trim())
    .filter((line) => line.length > 2);
  if (!items.length) return "";
  return `${label}:\n${items.join("\n")}`;
}

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

const NON_MUSIC_PATTERN =
  /\b(reaction|reacts?|review|tutorial|lesson|how\s+to|interview|podcast|vlog|trailer|gameplay|walkthrough|unboxing|documentary|behind\s+the\s+scenes|making\s+of|explained|analysis|breakdown|top\s+\d+|compilation|dj\s+set|radio\s+show|episode|news|asmr|guitar\s+tab|announcement|teaser|shorts|flashmob|flash\s+mob|movie\s+scene|film\s+scene|muppet|got\s+talent|the\s+voice|x\s+factor|american\s+idol|talent\s+show|audition|wedding|proposal|commercial|advert|sketch|comedy|meme|prank|first\s+time\s+hearing|blind\s+rank|tier\s+list|full\s+album|greatest\s+hits|mix\s+\d+\s*hour|nonstop|megamix)\b/i;

const COMMUNITY_PATTERN =
  /\b(remix|cover|sped\s*up|speed\s*up|slowed|reverb|nightcore|8d\s*audio|bass\s*boosted|mashup|karaoke|instrumental|acapella|a\s*cappella|vocals?\s*only|ai\s+cover|bootleg|refix|extended\s+mix|tribute|piano\s+version|guitar\s+version|violin|orchestral|choir|marching\s+band|loop|1\s*hour|10\s*hours|fan\s*made|unofficial)\b/i;

const OFFICIAL_PATTERN =
  /\b(official\s+(music\s+)?video|official\s+audio|official\s+visualizer|official\s+lyric|lyric\s+video|visualizer|audio\s+oficial|video\s+oficial)\b/i;

const REMASTER_HINT = /\b(remaster(ed)?|anniversary|deluxe)\b/i;

function classifyYouTubeResult(video, hints) {
  const title = String(video?.title || "");
  const author = String(video?.author?.name || "");
  const seconds = Number(video?.seconds) || 0;

  if (seconds > 0 && (seconds < 60 || seconds > 900)) return { kind: "reject", reason: "duration" };
  if (NON_MUSIC_PATTERN.test(title)) return { kind: "reject", reason: "non-music" };

  const isTopic = /-\s*topic\s*$/i.test(author);
  const isVevo = /vevo$/i.test(author);
  const isOfficialChannel = isTopic || isVevo;

  if (isOfficialChannel) return { kind: "song", reason: "official-channel" };

  if (COMMUNITY_PATTERN.test(title)) {
    return { kind: "community", reason: "derivative" };
  }

  if (hints) {
    const normalizedAuthor = normalizeMatchText(author);
    const normalizedTitle = normalizeMatchText(title);

    if (normalizedAuthor) {
      for (const artist of hints.artists || []) {
        if (!artist) continue;
        if (normalizedAuthor === artist || normalizedAuthor.includes(artist) || artist.includes(normalizedAuthor)) {
          return { kind: "song", reason: "catalog-artist" };
        }
      }
    }

    if (normalizedAuthor && hints.query && hints.query.includes(normalizedAuthor)) {
      return { kind: "song", reason: "query-artist" };
    }
  }

  if (OFFICIAL_PATTERN.test(title)) return { kind: "community", reason: "unverified-official-label" };
  if (REMASTER_HINT.test(title)) return { kind: "community", reason: "unverified-remaster" };
  if (/.+\s[-\u2013\u2014]\s.+/.test(title)) return { kind: "community", reason: "artist-title" };

  return { kind: "community", reason: "unverified" };
}

function mapYouTubeVideo(video, kind) {
  return {
    trackName: video.title,
    artistName: video.author?.name || "",
    artworkUrl100: video.thumbnail,
    artworkUrl60: video.thumbnail,
    trackId: video.videoId,
    videoId: video.videoId,
    collectionName: "YouTube",
    source: "youtube",
    community: kind === "community",
    trackTimeMillis: (Number(video.seconds) || 0) * 1000,
    trackExplicitness: /\bexplicit\b/i.test(String(video.title || "")) ? "explicit" : "notExplicit",
  };
}

fastify.get("/music/meta", async (req, reply) => {
  const { q } = req.query;
  if (!q) return reply.status(400).send({ error: "Missing query" });
  const includeCommunity = String(req.query.community || "0") === "1";

  try {
    const [itunesSongs, itunesArtists, ytRes] = await Promise.allSettled([
      fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=song&limit=20`
      ).then((r) => r.json()),
      fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=musicArtist&limit=8`
      ).then((r) => r.json()),
      ytSearch(q),
    ]);

    const songs = [];
    const artists = [];
    const playlists = [];
    let rejected = 0;

    if (itunesSongs.status === "fulfilled" && Array.isArray(itunesSongs.value?.results)) {
      for (const row of itunesSongs.value.results) {
        songs.push({ ...row, source: "catalog", community: false });
      }
    }

    if (itunesArtists.status === "fulfilled" && Array.isArray(itunesArtists.value?.results)) {
      for (const row of itunesArtists.value.results) {
        if (!row.artistName) continue;
        artists.push({
          artistName: row.artistName,
          artistId: row.artistId,
          primaryGenreName: row.primaryGenreName || "",
          source: "catalog",
        });
      }
    }

    const hints = {
      artists: new Set(
        [...songs.map((s) => s.artistName), ...artists.map((a) => a.artistName)]
          .map(normalizeMatchText)
          .filter((v) => v.length > 2)
      ),
      titles: new Set(songs.map((s) => normalizeMatchText(s.trackName)).filter((v) => v.length > 3)),
      query: normalizeMatchText(q),
    };

    if (ytRes.status === "fulfilled") {
      const videos = Array.isArray(ytRes.value?.videos) ? ytRes.value.videos.slice(0, 20) : [];
      for (const video of videos) {
        const classified = classifyYouTubeResult(video, hints);
        if (classified.kind === "reject") {
          rejected++;
          continue;
        }
        if (classified.kind === "community" && !includeCommunity) continue;
        songs.push(mapYouTubeVideo(video, classified.kind));
      }

      const lists = Array.isArray(ytRes.value?.playlists) ? ytRes.value.playlists.slice(0, 10) : [];
      for (const list of lists) {
        const listId = list.listId || list.playlistId;
        if (!listId) continue;
        playlists.push({
          listId,
          title: list.title || "Playlist",
          author: list.author?.name || "YouTube",
          thumbnail: list.thumbnail || "",
          videoCount: Number(list.videoCount) || null,
          source: "community",
        });
      }
    }

    const ranked = songs
      .map((song, index) => {
        const title = String(song.trackName || "");
        const artistName = String(song.artistName || "");
        let rank = 0;
        if (DERIVATIVE_PATTERN.test(title)) rank += 4;
        if (DERIVATIVE_ARTIST.test(artistName)) rank += 5;
        if (LIVE_HINT.test(title)) rank += 2;
        if (song.community) rank += 1;
        if (hints.query && normalizeMatchText(artistName) && hints.query.includes(normalizeMatchText(artistName))) rank -= 2;
        return { song, rank, index };
      })
      .sort((a, b) => a.rank - b.rank || a.index - b.index)
      .map((entry) => entry.song);

    return reply.send({
      resultCount: ranked.length,
      results: ranked,
      songs: ranked,
      artists,
      playlists,
      rejected,
    });
  } catch (e) {
    console.error(e);
    return reply.status(500).send({ error: "Meta failed" });
  }
});

const playlistCache = new Map();
const PLAYLIST_TTL_MS = 30 * 60 * 1000;

fastify.get("/music/playlist", async (req, reply) => {
  const { listId } = req.query || {};
  if (!listId || !/^[A-Za-z0-9_-]{10,64}$/.test(String(listId))) {
    return reply.status(400).send({ error: "Invalid listId" });
  }
  if (!ytDlpWrap) return reply.status(503).send({ error: "Engine not ready" });

  const cached = playlistCache.get(listId);
  if (cached && cached.expiresAt > Date.now()) return reply.send(cached.value);

  try {
    const out = await execYtDlpForText([
      `https://www.youtube.com/playlist?list=${listId}`,
      "--flat-playlist",
      "--dump-single-json",
      "--playlist-end",
      "100",
      "--no-warnings",
    ]);

    const data = JSON.parse(String(out));
    const entries = Array.isArray(data?.entries) ? data.entries : [];
    const tracks = entries
      .filter((entry) => entry?.id)
      .map((entry) => {
        const thumb = Array.isArray(entry.thumbnails) && entry.thumbnails.length
          ? entry.thumbnails[entry.thumbnails.length - 1].url
          : `https://i.ytimg.com/vi/${entry.id}/hqdefault.jpg`;
        return {
          trackName: entry.title || "Unknown",
          artistName: entry.uploader || entry.channel || data.uploader || "",
          artworkUrl100: thumb,
          artworkUrl60: thumb,
          trackId: entry.id,
          videoId: entry.id,
          collectionName: data.title || "Playlist",
          source: "youtube",
          community: true,
          trackTimeMillis: (Number(entry.duration) || 0) * 1000,
        };
      })
      .filter((track) => {
        const seconds = track.trackTimeMillis / 1000;
        if (seconds > 0 && (seconds < 45 || seconds > 900)) return false;
        return !NON_MUSIC_PATTERN.test(track.trackName);
      });

    const value = { title: data?.title || "Playlist", resultCount: tracks.length, results: tracks };

    if (playlistCache.size > 40) {
      const oldest = playlistCache.keys().next().value;
      if (oldest !== undefined) playlistCache.delete(oldest);
    }
    playlistCache.set(listId, { value, expiresAt: Date.now() + PLAYLIST_TTL_MS });

    return reply.send(value);
  } catch (e) {
    console.error("[Playlist]", e.message || e);
    return reply.status(502).send({ error: "Playlist failed" });
  }
});

const DERIVATIVE_PATTERN =
  /\b(acapella|a\s*cappella|vocals?\s*only|instrumental|karaoke|backing\s*track|cover|remix|mashup|nightcore|sped\s*up|speed\s*up|slowed|reverb|8d\s*audio|bass\s*boosted|reversed|remake|rendition|tribute|fingerstyle|finger\s*style|piano\s+version|guitar\s+version|violin|cello|flute|saxophone|orchestral|string\s+quartet|marching\s+band|music\s+box|lullaby|8\s*bit|chiptune|midi|meditation|sleep\s+version|study\s+version|ai\s+cover|parody|in\s+the\s+style\s+of|made\s+famous\s+by|originally\s+performed)\b/i;

const DERIVATIVE_ARTIST =
  /\b(string\s+quartet|quartet\s+tribute|tribute\s+(band|players|orchestra)|piano\s+tribute|lullaby|rockabye|kidz\s+bop|karaoke|the\s+karaoke|instrumental\s+(band|players)|8\s*bit|chiptune|music\s+box|meditation|relaxing|study\s+music|cover\s+band|made\s+famous|sleep\s+baby|baby\s+lullaby|guitar\s+tribute|vitamin\s+string)\b/i;

const LIVE_HINT =
  /\b(live|concert|tour|festival|session|unplugged|gala|awards?|tiny\s+desk|npr|fallon|colbert|kimmel|snl|glastonbury|coachella|lollapalooza|live\s+lounge|acoustic|performance|residency|halftime|super\s*bowl)\b/i;

const ARTIST_CHANNEL_SUFFIX = /^(vevo|official|music|band|tv|records|channel|hd|topic)$/i;

function authorIsArtist(author, artist) {
  const normalizedAuthor = normalizeMatchText(author);
  const normalizedArtist = normalizeMatchText(artist);
  if (!normalizedAuthor || normalizedArtist.length < 3) return "none";
  if (normalizedAuthor === normalizedArtist) return "exact";

  if (normalizedAuthor.startsWith(normalizedArtist)) {
    const rest = normalizedAuthor.slice(normalizedArtist.length).trim();
    if (!rest) return "exact";
    if (rest.split(" ").every((word) => ARTIST_CHANNEL_SUFFIX.test(word))) return "exact";
  }

  if (normalizedAuthor.includes(normalizedArtist) || normalizedArtist.includes(normalizedAuthor)) return "loose";
  return "none";
}

function scoreVideoCandidate(video, targetSeconds, query, artist) {
  const title = String(video.title || "");
  const author = String(video.author?.name || "");
  const seconds = Number(video.seconds) || 0;
  const lowerQuery = String(query || "").toLowerCase();
  let score = 0;

  if (targetSeconds && seconds) {
    const delta = seconds - targetSeconds;
    const diff = Math.abs(delta);
    if (diff <= 1) score += 70;
    else if (diff <= 3) score += 52;
    else if (diff <= 6) score += 28;
    else if (diff <= 12) score += 4;
    else score -= Math.min(60, diff * 1.5);
    if (delta > 8) score -= Math.min(45, (delta - 8) * 2);
  }

  const isTopic = /-\s*topic\s*$/i.test(author);
  const isVevo = /vevo$/i.test(author);
  const authorMatch = authorIsArtist(author, artist);

  if (isTopic) score += 50;
  else if (isVevo) score += 34;
  else if (authorMatch === "exact") score += 32;
  else if (authorMatch === "loose") score += 8;

  if (/official\s*audio|full\s*audio|\baudio\b/i.test(title)) score += 20;
  if (/official\s*visualizer|visualizer/i.test(title)) score += 8;
  if (/lyric\s*video|\(lyrics\)/i.test(title)) score += 6;
  if (/official\s*(music\s*)?video/i.test(title)) score -= 6;
  if (REMASTER_HINT.test(title)) score += 3;

  if (DERIVATIVE_PATTERN.test(title) && !DERIVATIVE_PATTERN.test(lowerQuery)) score -= 85;
  if (LIVE_HINT.test(title) && !LIVE_HINT.test(lowerQuery)) score -= 30;
  if (NON_MUSIC_PATTERN.test(title)) score -= 90;
  if (seconds > 0 && seconds < 45) score -= 40;
  if (seconds > 900) score -= 30;

  const views = Number(video.views) || 0;
  if (views > 0) score += Math.min(10, Math.log10(views));

  return score;
}

fastify.get("/music/search", async (req, reply) => {
  const q = req.query.q;
  if (!q) return reply.status(400).send({ error: "Query required" });
  const targetSeconds = Number(req.query.duration) > 0 ? Number(req.query.duration) : null;
  const artist = String(req.query.artist || "");
  try {
    const result = await ytSearch(q);
    const videos = Array.isArray(result?.videos) ? result.videos.slice(0, 15) : [];
    if (!videos.length) return reply.status(404).send({ error: "No results" });

    const wantsDerivative = DERIVATIVE_PATTERN.test(q);
    const clean = wantsDerivative
      ? videos
      : videos.filter((v) => {
          const title = String(v.title || "");
          if (NON_MUSIC_PATTERN.test(title)) return false;
          if (DERIVATIVE_PATTERN.test(title)) return false;
          return true;
        });

    const pool = clean.length ? clean : videos;

    let best = pool[0];
    let bestScore = -Infinity;
    for (const video of pool) {
      const score = scoreVideoCandidate(video, targetSeconds, q, artist);
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
      score: Math.round(bestScore),
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
  const includeCommunity = String(req.query.community || "0") === "1";

  try {
    const [ytRes, itunesRes] = await Promise.allSettled([
      ytSearch(q),
      fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=song&limit=20`
      ).then((r) => r.json()),
    ]);

    const results = [];

    if (itunesRes.status === "fulfilled" && Array.isArray(itunesRes.value?.results)) {
      for (const row of itunesRes.value.results) {
        const title = String(row.trackName || "");
        const artist = String(row.artistName || "");
        if (DERIVATIVE_PATTERN.test(title) || DERIVATIVE_ARTIST.test(artist)) continue;
        results.push({ ...row, source: "catalog", community: false, collectionName: row.collectionName || "Radio" });
      }
    }

    if (ytRes.status === "fulfilled") {
      const videos = Array.isArray(ytRes.value?.videos) ? ytRes.value.videos.slice(0, 20) : [];
      const hints = {
        artists: new Set(results.map((r) => normalizeMatchText(r.artistName)).filter((v) => v.length > 2)),
        titles: new Set(results.map((r) => normalizeMatchText(r.trackName)).filter((v) => v.length > 3)),
        query: normalizeMatchText(q),
      };

      for (const video of videos) {
        const classified = classifyYouTubeResult(video, hints);
        if (classified.kind === "reject") continue;
        if (classified.kind === "community" && !includeCommunity) continue;
        const title = String(video.title || "");
        if (DERIVATIVE_PATTERN.test(title)) continue;
        if (LIVE_HINT.test(title) && !LIVE_HINT.test(q)) continue;
        results.push({ ...mapYouTubeVideo(video, classified.kind), collectionName: "Radio" });
      }
    }

    const seen = new Set();
    const unique = [];
    for (const row of results) {
      const key = `${normalizeMatchText(row.artistName)}|${normalizeMatchText(row.trackName)}`;
      if (!key.trim() || seen.has(key)) continue;
      seen.add(key);
      unique.push(row);
    }

    return reply.send({ resultCount: unique.length, results: unique });
  } catch (e) {
    console.error("[Radio]", e.message || e);
    return reply.status(500).send({ error: "Radio failed" });
  }
});

const directUrlCache = new Map();
const DIRECT_URL_TTL_MS = 30 * 60 * 1000;
const pendingDirectUrl = new Map();

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

  const inFlight = pendingDirectUrl.get(id);
  if (inFlight) return await inFlight;

  const task = resolveDirectAudioUrlUncached(id);
  pendingDirectUrl.set(id, task);
  try {
    return await task;
  } finally {
    pendingDirectUrl.delete(id);
  }
}

const INVIDIOUS_URL = String(process.env.INVIDIOUS_URL || "").trim().replace(/\/+$/, "");

const INVIDIOUS_ITAGS = [140, 251];
const INVIDIOUS_PROBE_TIMEOUT_MS = 8000;
const INVIDIOUS_BREAKER_THRESHOLD = 3;
const INVIDIOUS_BREAKER_COOLDOWN_MS = 5 * 60 * 1000;

const invidiousBreaker = { failures: 0, openUntil: 0 };

function invidiousAvailable() {
  if (!INVIDIOUS_URL) return false;
  if (invidiousBreaker.openUntil > Date.now()) return false;
  return true;
}

function noteInvidiousResult(ok) {
  if (ok) {
    invidiousBreaker.failures = 0;
    invidiousBreaker.openUntil = 0;
    return;
  }
  invidiousBreaker.failures += 1;
  if (invidiousBreaker.failures >= INVIDIOUS_BREAKER_THRESHOLD) {
    invidiousBreaker.openUntil = Date.now() + INVIDIOUS_BREAKER_COOLDOWN_MS;
    invidiousBreaker.failures = 0;
    console.warn("[Invidious] breaker open, pausing for 5 minutes");
  }
}

function invidiousStreamUrls(id, itag) {
  const base = `${INVIDIOUS_URL}/latest_version?id=${encodeURIComponent(id)}&itag=${itag}`;
  return [`${base}&local=true`, base];
}

async function resolveViaInvidious(id) {
  if (!invidiousAvailable()) return null;

  for (const itag of INVIDIOUS_ITAGS) {
    for (const url of invidiousStreamUrls(id, itag)) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), INVIDIOUS_PROBE_TIMEOUT_MS);
      try {
        const resp = await fetch(url, {
          headers: { Range: "bytes=0-1024", Accept: "*/*" },
          redirect: "follow",
          signal: controller.signal,
        });
        const type = resp.headers.get("content-type") || "";
        if ((resp.status === 206 || resp.status === 200) && type.startsWith("audio")) {
          if (resp.body && typeof resp.body.cancel === "function") resp.body.cancel().catch(() => {});
          noteInvidiousResult(true);
          return url;
        }
      } catch {
        continue;
      } finally {
        clearTimeout(timer);
      }
    }
  }

  noteInvidiousResult(false);
  return null;
}

const EXTRACT_STRATEGIES = [
  [],
  ["--extractor-args", "youtube:player_client=default,android_vr"],
  ["--extractor-args", "youtube:player_client=web_safari,tv"],
  ["--extractor-args", "youtube:player_client=ios"],
];

async function resolveViaYtDlp(id) {
  const baseArgs = [
    `https://www.youtube.com/watch?v=${id}`,
    "-f",
    "bestaudio[ext=m4a]/bestaudio[ext=mp4]/bestaudio/best[acodec!=none]",
    "--no-playlist",
    "--no-warnings",
    "-g",
  ];

  let lastError = null;
  for (const strategy of EXTRACT_STRATEGIES) {
    try {
      const out = await execYtDlpForText([...baseArgs, ...strategy]);
      const url = String(out)
        .trim()
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.startsWith("http"))
        .pop();

      if (url) {
        directUrlCache.set(id, { url, expiresAt: Date.now() + DIRECT_URL_TTL_MS });
        if (strategy.length) console.log(`[Extract] ${id} recovered via ${strategy[1]}`);
        return url;
      }
      lastError = new Error("no-direct-url");
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError || new Error("no-direct-url");
}

async function resolveDirectAudioUrlUncached(id) {
  if (invidiousAvailable()) {
    const fastUrl = await resolveViaInvidious(id);
    if (fastUrl) {
      console.log(`[Extract] ${id} via Invidious`);
      directUrlCache.set(id, { url: fastUrl, expiresAt: Date.now() + DIRECT_URL_TTL_MS });
      return fastUrl;
    }
    console.warn(`[Extract] ${id} Invidious unavailable, using yt-dlp`);
  }

  let lastError = null;
  try {
    return await resolveViaYtDlp(id);
  } catch (e) {
    lastError = e;
  }

  const invidiousUrl = await resolveViaInvidious(id);
  if (invidiousUrl) {
    console.log(`[Extract] ${id} recovered via Invidious`);
    directUrlCache.set(id, { url: invidiousUrl, expiresAt: Date.now() + DIRECT_URL_TTL_MS });
    return invidiousUrl;
  }

  console.error(`[Extract] all strategies failed for ${id}:`, lastError?.message || lastError);
  throw lastError || new Error("no-direct-url");
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

function lyricCandidatesKey(candidate) {
  return `${String(candidate?.artist || "").toLowerCase()}|${String(candidate?.title || "").toLowerCase()}`;
}

function mergeLyricCandidates(...groups) {
  const seen = new Set();
  const merged = [];
  for (const group of groups) {
    for (const candidate of group || []) {
      const artist = String(candidate?.artist || "").trim();
      const title = String(candidate?.title || "").trim();
      if (!title) continue;
      const key = lyricCandidatesKey({ artist, title });
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push({ artist, title });
    }
  }
  return merged;
}

function lyricTitleVariants(value) {
  const clean = cleanLyricTitle(value);
  if (!clean) return [];
  const variants = [clean];
  for (const part of clean.split(/[·•]/)) {
    const trimmed = part.trim();
    if (trimmed.length > 1) variants.push(trimmed);
  }
  for (const match of clean.matchAll(/[\(\[]([^\)\]]+)[\)\]]/g)) {
    const trimmed = cleanLyricTitle(match[1]);
    if (trimmed.length > 1) variants.push(trimmed);
  }
  const withoutParenthetical = cleanLyricTitle(clean.replace(/\s*[\(\[].*?[\)\]]\s*/g, " "));
  if (withoutParenthetical.length > 1) variants.push(withoutParenthetical);
  const scriptSeparated = clean
    .replace(/([\p{Script=Han}])(?=[A-Za-z])/gu, "$1|")
    .replace(/([A-Za-z])(?=[\p{Script=Han}])/gu, "$1|");
  for (const part of scriptSeparated.split("|")) {
    const trimmed = cleanLyricTitle(part);
    if (trimmed.length > 1) variants.push(trimmed);
  }
  return [...new Set(variants.map((item) => item.toLowerCase()))].map((item) => {
    const original = variants.find((value) => value.toLowerCase() === item);
    return original || item;
  });
}

async function discoverLyricCandidates(rawArtist, rawTitle, durationSec) {
  const query = [rawArtist, rawTitle].filter(Boolean).join(" ").trim();
  if (!query) return [];

  try {
    const result = await ytSearch(query);
    const videos = Array.isArray(result?.videos) ? result.videos.slice(0, 8) : [];
    const discovered = [];

    for (const video of videos) {
      const seconds = Number(video?.seconds) || 0;
      if (Number.isFinite(durationSec) && durationSec > 0 && seconds > 0 && Math.abs(seconds - durationSec) > 20) continue;

      const videoTitle = cleanLyricTitle(video?.title);
      const parsed = splitArtistTitle(videoTitle);
      const reversed = parsed && lyricTextsRelated(parsed.artist, rawTitle) && lyricTextsRelated(parsed.title, rawArtist);
      const split = reversed ? { artist: parsed.title, title: parsed.artist } : parsed;
      const artists = [
        cleanLyricArtist(rawArtist),
        cleanLyricArtist(video?.author?.name),
        cleanLyricArtist(split?.artist),
      ];
      const titles = [...lyricTitleVariants(videoTitle), ...lyricTitleVariants(split?.title)];

      for (const artist of artists) {
        for (const title of titles) discovered.push({ artist, title });
      }
    }

    return mergeLyricCandidates(discovered).slice(0, 24);
  } catch {
    return [];
  }
}

async function findLyricsForCandidates(candidates, durationSec) {
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
      if (shaped && shaped.syncedLyrics) return { row: exact, via: "get" };
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

  return best ? { row: best, via: "search" } : null;
}

function normalizeLyricMatchText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\(.*?\)|\[.*?\]/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function lyricTextsRelated(a, b) {
  const left = normalizeLyricMatchText(a);
  const right = normalizeLyricMatchText(b);
  if (!left || !right) return false;
  if (left === right || left.includes(right) || right.includes(left)) return true;
  const leftWords = new Set(left.split(" "));
  const rightWords = right.split(" ");
  const shared = rightWords.filter((word) => leftWords.has(word)).length;
  return shared / Math.max(1, rightWords.length) >= 0.7;
}

async function resolveLyrics(rawArtist, rawTitle, durationSec) {
  const candidates = buildLyricCandidates(rawArtist, rawTitle);
  if (!candidates.length) return null;

  let found = await findLyricsForCandidates(candidates, durationSec);
  if (found && (found.via === "get" || lyricRowMatchesRequest(found.row, candidates, durationSec))) {
    return shapeLyricResult(found.row, found.via);
  }

  const discovered = await discoverLyricCandidates(rawArtist, rawTitle, durationSec);
  if (!discovered.length) return null;

  const expandedCandidates = mergeLyricCandidates(candidates, discovered);
  found = await findLyricsForCandidates(discovered, durationSec);
  if (!found) return null;
  if (found.via !== "get" && !lyricRowMatchesRequest(found.row, expandedCandidates, durationSec)) return null;

  return shapeLyricResult(found.row, found.via === "get" ? "alias-get" : "alias-search");
}

function lyricRowMatchesRequest(row, candidates, durationSec) {
  const rowTitle = row.trackName || "";
  const rowArtist = row.artistName || "";

  for (const candidate of candidates) {
    const titleOk = lyricTextsRelated(rowTitle, candidate.title);
    if (!titleOk) continue;

    if (!candidate.artist) {
      if (Number.isFinite(durationSec) && Number.isFinite(row.duration) && Math.abs(row.duration - durationSec) <= 15) {
        return true;
      }
      continue;
    }

    if (lyricTextsRelated(rowArtist, candidate.artist)) return true;
  }

  return false;
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

fastify.get("/music/prewarm", async (req, reply) => {
  const { id } = req.query || {};
  if (!id) return reply.status(400).send({ error: "Missing id" });
  try {
    await resolveDirectAudioUrl(id);
    return reply.send({ ok: true, id });
  } catch (e) {
    console.error("[Prewarm]", e.message || e);
    return reply.status(500).send({ ok: false });
  }
});

async function fetchUpstreamAudio(url, clientRange) {
  const headers = {
    Range: clientRange || "bytes=0-",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    Accept: "*/*",
    "Accept-Encoding": "identity",
  };
  return await fetch(url, { headers });
}

fastify.get("/music/direct-audio", async (req, reply) => {
  const { id } = req.query;
  if (!id) return reply.status(400).send({ error: "Missing id" });

  const clientRange = req.headers.range || null;

  try {
    let url = await resolveDirectAudioUrl(id);
    let resp = await fetchUpstreamAudio(url, clientRange);
    const retryableStatuses = new Set([400, 403, 410, 429, 500, 502, 503, 504]);

    if (retryableStatuses.has(resp.status)) {
      console.warn(`[DirectAudio] ${id} upstream ${resp.status}, re-resolving`);
      directUrlCache.delete(id);
      if (INVIDIOUS_URL && url.startsWith(INVIDIOUS_URL)) {
        try {
          url = await resolveViaYtDlp(id);
        } catch {
          url = await resolveDirectAudioUrl(id);
        }
      } else {
        url = await resolveDirectAudioUrl(id);
      }
      resp = await fetchUpstreamAudio(url, clientRange);

      if (retryableStatuses.has(resp.status) && INVIDIOUS_URL && !url.startsWith(INVIDIOUS_URL)) {
        const fallbackUrl = await resolveViaInvidious(id);
        if (fallbackUrl) {
          console.warn(`[DirectAudio] ${id} falling back to Invidious`);
          directUrlCache.set(id, { url: fallbackUrl, expiresAt: Date.now() + DIRECT_URL_TTL_MS });
          resp = await fetchUpstreamAudio(fallbackUrl, clientRange);
        }
      }
    }

    if (!resp.ok && resp.status !== 206) {
      console.error(`[DirectAudio] ${id} upstream ${resp.status}`);
      return reply.status(502).send({ error: "Upstream rejected" });
    }

    const contentRange = resp.headers.get("content-range");
    const contentType = resp.headers.get("content-type") || "audio/mp4";

    if (!clientRange && resp.status === 206) {
      const total = contentRange && contentRange.includes("/") ? contentRange.split("/").pop().trim() : null;
      reply.status(200);
      reply.header("Content-Type", contentType);
      reply.header("Accept-Ranges", "bytes");
      if (total && /^\d+$/.test(total)) reply.header("Content-Length", total);
    } else {
      reply.status(resp.status);
      resp.headers.forEach((val, key) => {
        const lower = key.toLowerCase();
        if (["connection", "transfer-encoding", "content-encoding", "content-length"].includes(lower)) return;
        reply.header(key, val);
      });
      const rangeMatch = contentRange && contentRange.match(/^bytes\s+(\d+)-(\d+)\/(\d+|\*)$/i);
      if (rangeMatch) reply.header("Content-Length", String(Number(rangeMatch[2]) - Number(rangeMatch[1]) + 1));
      reply.header("Accept-Ranges", "bytes");
    }

    reply.header("Cache-Control", "no-store");

    let body = resp.body || null;
    if (body && typeof body.getReader === "function") {
      body = Readable.fromWeb(body);
    }
    return reply.send(body);
  } catch (e) {
    console.error("[DirectAudio]", e.message || e);
    return reply.status(502).send({ error: "Direct audio failed" });
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

const catalogCache = new Map();
const CATALOG_TTL_MS = 60 * 60 * 1000;

async function cachedCatalog(key, loader) {
  const hit = catalogCache.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.value;
  const value = await loader();
  if (catalogCache.size > 150) {
    const oldest = catalogCache.keys().next().value;
    if (oldest !== undefined) catalogCache.delete(oldest);
  }
  catalogCache.set(key, { value, expiresAt: Date.now() + CATALOG_TTL_MS });
  return value;
}

function shapeCatalogSong(row) {
  return { ...row, source: "catalog", community: false };
}

fastify.get("/music/suggest", async (req, reply) => {
  const query = String(req.query.q || "").trim().slice(0, 120);
  if (!query) return reply.send({ suggestions: [] });

  try {
    const key = `suggest:${query.toLowerCase()}`;
    const suggestions = await cachedCatalog(key, async () => {
      const songUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=8`;
      const artistUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=musicArtist&limit=4`;
      const [songResponse, artistResponse] = await Promise.all([fetch(songUrl), fetch(artistUrl)]);
      const [songData, artistData] = await Promise.all([
        songResponse.ok ? songResponse.json() : { results: [] },
        artistResponse.ok ? artistResponse.json() : { results: [] },
      ]);
      const output = [];
      const seen = new Set();
      const add = (item) => {
        const key = `${item.kind}|${item.label.toLowerCase()}|${String(item.secondary || "").toLowerCase()}`;
        if (seen.has(key)) return;
        seen.add(key);
        output.push(item);
      };

      for (const row of Array.isArray(songData.results) ? songData.results : []) {
        if (!row.trackName || !row.artistName) continue;
        add({
          kind: "song",
          label: row.trackName,
          secondary: row.artistName,
          query: `${row.trackName} ${row.artistName}`,
        });
      }
      for (const row of Array.isArray(artistData.results) ? artistData.results : []) {
        if (!row.artistName) continue;
        add({ kind: "artist", label: row.artistName, secondary: "Artist", query: row.artistName });
      }
      return output.slice(0, 8);
    });
    return reply.send({ suggestions });
  } catch (error) {
    console.error("[Suggestions]", error.message || error);
    return reply.send({ suggestions: [] });
  }
});

fastify.get("/music/catalog/artist", async (req, reply) => {
  const artistId = String(req.query.artistId || "").trim();
  const artistName = String(req.query.artist || "").trim();
  const limit = Math.max(5, Math.min(50, Number(req.query.limit) || 25));
  if (!artistId && !artistName) return reply.status(400).send({ error: "Missing artist" });

  try {
    const key = `artist:${artistId || artistName}:${limit}`;
    const results = await cachedCatalog(key, async () => {
      const url = artistId
        ? `https://itunes.apple.com/lookup?id=${encodeURIComponent(artistId)}&entity=song&limit=${limit}`
        : `https://itunes.apple.com/search?term=${encodeURIComponent(artistName)}&attribute=artistTerm&entity=song&limit=${limit}`;
      const resp = await fetch(url);
      if (!resp.ok) return [];
      const json = await resp.json();
      const rows = Array.isArray(json?.results) ? json.results : [];
      return rows.filter((r) => r.wrapperType === "track" || r.kind === "song").map(shapeCatalogSong);
    });
    return reply.send({ resultCount: results.length, results });
  } catch (e) {
    console.error("[Catalog artist]", e.message || e);
    return reply.status(502).send({ error: "Catalog failed" });
  }
});

fastify.get("/music/catalog/genre", async (req, reply) => {
  const genre = String(req.query.genre || "").trim();
  const limit = Math.max(5, Math.min(50, Number(req.query.limit) || 25));
  if (!genre) return reply.status(400).send({ error: "Missing genre" });

  try {
    const key = `genre:${genre}:${limit}`;
    const results = await cachedCatalog(key, async () => {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(genre)}&media=music&entity=song&limit=${limit}`;
      const resp = await fetch(url);
      if (!resp.ok) return [];
      const json = await resp.json();
      const rows = Array.isArray(json?.results) ? json.results : [];
      return rows
        .map((row, index) => ({ row, index, match: textsRelated(row.primaryGenreName, genre) ? 0 : 1 }))
        .sort((a, b) => a.match - b.match || a.index - b.index)
        .map((entry) => shapeCatalogSong(entry.row));
    });
    return reply.send({ resultCount: results.length, results });
  } catch (e) {
    console.error("[Catalog genre]", e.message || e);
    return reply.status(502).send({ error: "Catalog failed" });
  }
});

fastify.get("/music/ai/status", async (req, reply) => {
  return reply.send({
    enabled: Boolean(GEMINI_KEY),
    model: GEMINI_KEY ? GEMINI_MODEL : null,
    invidiousUrl: INVIDIOUS_URL || null,
  });
});

fastify.post("/music/ai/queue", async (req, reply) => {
  if (!GEMINI_KEY) return reply.status(503).send({ error: "AI disabled" });
  const body = req.body || {};
  const count = Math.max(4, Math.min(20, Number(body.count) || 12));
  const seed = body.seed || null;
  const mood = String(body.mood || "").slice(0, 200);

  const parts = [];
  if (seed?.title) parts.push(`Seed track: ${seed.artist || ""} - ${seed.title}`);
  if (mood) parts.push(`Requested vibe: ${mood}`);
  const recent = describeTrackList(body.recent, "Recently played");
  const favorites = describeTrackList(body.favorites, "Favorites");
  const exclude = describeTrackList(body.exclude, "Already queued, do not repeat");
  if (recent) parts.push(recent);
  if (favorites) parts.push(favorites);
  if (exclude) parts.push(exclude);
  parts.push(
    `Build a queue of exactly ${count} songs that continues naturally from this taste. Give the queue a short evocative name of at most four words.`
  );

  try {
    const result = await callGemini({
      system: CURATOR_SYSTEM,
      prompt: parts.join("\n\n"),
      schema: TRACK_LIST_SCHEMA,
      temperature: 1,
    });
    if (!result?.tracks?.length) return reply.status(502).send({ error: "No suggestions" });

    const excludeKeys = [
      ...(Array.isArray(body.exclude) ? body.exclude : []),
      ...(Array.isArray(body.recent) ? body.recent : []),
      ...(seed ? [seed] : []),
    ].map((t) => normalizeMatchText(`${t.artist || t.artistName || ""} ${t.title || t.trackName || ""}`));

    const tracks = await resolveSuggestions(result.tracks, excludeKeys);
    if (!tracks.length) return reply.status(502).send({ error: "Nothing resolved" });

    return reply.send({
      title: result.title || "AI Queue",
      description: result.description || "",
      suggested: result.tracks.length,
      resolved: tracks.length,
      results: tracks,
    });
  } catch (e) {
    const status = e.status === 429 ? 429 : 502;
    console.error("[AI Queue]", e.message || e, e.detail || "");
    return reply.status(status).send({ error: e.message || "AI failed" });
  }
});

fastify.post("/music/ai/mixes", async (req, reply) => {
  if (!GEMINI_KEY) return reply.status(503).send({ error: "AI disabled" });
  const body = req.body || {};
  const artists = (Array.isArray(body.artists) ? body.artists : [])
    .map((artist) => ({
      name: String(artist?.name || "").trim().slice(0, 120),
      plays: Math.max(0, Number(artist?.plays) || 0),
      seeds: Array.isArray(artist?.seeds) ? artist.seeds.slice(0, 12) : [],
    }))
    .filter((artist) => artist.name && artist.plays >= 3)
    .slice(0, 4);
  const mixCount = Math.max(1, Math.min(artists.length || 1, Number(body.count) || artists.length || 1));
  const perMix = Math.max(15, Math.min(20, Number(body.perMix) || 18));

  const recent = describeTrackList(body.recent, "Recently played");
  const favorites = describeTrackList(body.favorites, "Favorites");
  if (!artists.length) return reply.status(400).send({ error: "No eligible artists" });

  const artistBriefs = artists.map((artist) => {
    const seeds = describeTrackList(artist.seeds, "Known tracks");
    return `Artist: ${artist.name}\nListens: ${artist.plays}${seeds ? `\n${seeds}` : ""}`;
  });

  const prompt = [
    recent,
    favorites,
    ...artistBriefs,
    `Create exactly one artist-focused mix for each of the ${mixCount} artists above. Every track in a mix must be a real commercially released song by that mix's named artist, including genuine collaborations but excluding covers by other performers. Gather as many distinct songs as you can confidently identify, aiming for ${perMix} and never exceeding 20. Choose a concise mixType such as Artist essentials, Deep cuts, High energy or Late night. The title should be the artist name followed by Mix. Do not include track counts in any text and do not reuse a song across mixes.`,
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    const result = await callGemini({
      system: CURATOR_SYSTEM,
      prompt,
      schema: MIXES_SCHEMA,
      temperature: 1,
    });
    if (!result?.mixes?.length) return reply.status(502).send({ error: "No mixes" });

    const seen = new Set();
    const mixes = [];
    for (const mix of result.mixes.slice(0, mixCount)) {
      const tracks = (await resolveSuggestions((mix.tracks || []).slice(0, perMix), [...seen]))
        .filter((track) => textsRelated(track.artistName, mix.artist))
        .slice(0, perMix);
      for (const track of tracks) seen.add(normalizeMatchText(`${track.artistName} ${track.trackName}`));
      if (tracks.length >= 3) {
        mixes.push({
          id: `artist-${normalizeMatchText(mix.artist || mix.title).replace(/\s+/g, "-") || mixes.length}`,
          artist: mix.artist || "",
          title: mix.title || `${mix.artist || "Artist"} Mix`,
          mixType: mix.mixType || "Artist essentials",
          description: mix.description || "",
          tracks,
        });
      }
    }
    if (!mixes.length) return reply.status(502).send({ error: "Nothing resolved" });
    return reply.send({ mixes });
  } catch (e) {
    const status = e.status === 429 ? 429 : 502;
    console.error("[AI Mixes]", e.message || e, e.detail || "");
    return reply.status(status).send({ error: e.message || "AI failed" });
  }
});

const translationCache = new Map();
const TRANSLATION_TTL_MS = 24 * 60 * 60 * 1000;

fastify.post("/music/ai/translate", async (req, reply) => {
  if (!GEMINI_KEY) return reply.status(503).send({ error: "AI disabled" });
  const body = req.body || {};
  const lines = Array.isArray(body.lines) ? body.lines.slice(0, 200).map((l) => String(l || "")) : [];
  const target = String(body.target || "en").slice(0, 12);
  if (!lines.length) return reply.status(400).send({ error: "No lines" });

  const cacheKey = `${target}|${body.trackKey || ""}|${lines.length}|${lines[0]}|${lines[lines.length - 1]}`;
  const cached = translationCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return reply.send(cached.value);

  const numbered = lines.map((line, i) => `${i + 1}. ${line || "(instrumental)"}`).join("\n");
  const prompt = [
    `Target language code: ${target}`,
    `Translate these song lyric lines into the target language.`,
    `Return exactly ${lines.length} lines in the same order, one translation per input line.`,
    `If an input line is empty or marked instrumental, return an empty string for it.`,
    `Set sameLanguage to true only if the lyrics are already written in the target language, and in that case still return the original lines.`,
    `Translate meaning and tone naturally rather than word for word, and keep each line short enough to read while the song plays.`,
    "",
    numbered,
  ].join("\n");

  try {
    const result = await callGemini({
      system:
        "You translate song lyrics accurately and naturally. You always return exactly one output line per input line, preserving order.",
      prompt,
      schema: TRANSLATE_SCHEMA,
      temperature: 0.3,
    });

    if (!result || !Array.isArray(result.lines)) return reply.status(502).send({ error: "Translation failed" });
    if (result.lines.length !== lines.length) {
      return reply.status(502).send({ error: "Line count mismatch" });
    }

    const value = {
      sourceLanguage: result.sourceLanguage || "unknown",
      sameLanguage: Boolean(result.sameLanguage),
      target,
      lines: result.lines,
    };

    if (translationCache.size > 200) {
      const oldest = translationCache.keys().next().value;
      if (oldest !== undefined) translationCache.delete(oldest);
    }
    translationCache.set(cacheKey, { value, expiresAt: Date.now() + TRANSLATION_TTL_MS });

    return reply.send(value);
  } catch (e) {
    const status = e.status === 429 ? 429 : 502;
    console.error("[AI Translate]", e.message || e, e.detail || "");
    return reply.status(status).send({ error: e.message || "Translation failed" });
  }
});

fastify.register(fastifyStatic, {
  root: publicPath,
  prefix: "/",
});

fastify.setNotFoundHandler((req, reply) => {
  reply.sendFile("index.html");
});

const requestedPort = Number.parseInt(process.env.PORT || "3333", 10);
const port = Number.isInteger(requestedPort) && requestedPort > 0 && requestedPort <= 65535
  ? requestedPort
  : 3333;
fastify
  .listen({ port, host: "0.0.0.0" })
  .then(() => {
    console.log(`Music App running on http://localhost:${port}`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
