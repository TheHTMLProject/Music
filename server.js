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

const LRCLIB_ENDPOINT = "https://lrclib.net/api/search";

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

fastify.get("/music/search", async (req, reply) => {
  const q = req.query.q;
  if (!q) return reply.status(400).send({ error: "Query required" });
  try {
    const result = await ytSearch(q);
    if (result && result.videos.length > 0)
      return reply.send({ videoId: result.videos[0].videoId });
    return reply.status(404).send({ error: "No results" });
  } catch (e) {
    return reply.status(500).send({ error: "Search failed" });
  }
});

fastify.get("/music/lyrics", async (req, reply) => {
  const { artist = "", title = "" } = req.query || {};
  if (!artist && !title) return reply.status(400).send({ error: "Missing artist or title" });
  try {
    const lyr = await fetchLyricsFromLrcLib(artist, title);
    if (!lyr) return reply.status(404).send({ error: "No lyrics" });
    return reply.send(lyr);
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

async function fetchLyricsFromLrcLib(artist, title) {
  if (!artist && !title) return null;
  const params = new URLSearchParams();
  if (title) params.set("track_name", title);
  if (artist) params.set("artist_name", artist);
  params.set("limit", "1");
  const url = `${LRCLIB_ENDPOINT}?${params.toString()}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`lyrics-${resp.status}`);
  const json = await resp.json();
  if (!Array.isArray(json) || json.length === 0) return null;
  const best = json[0];
  return {
    syncedLyrics: best.syncedLyrics || null,
    plainLyrics: best.plainLyrics || null,
    source: "lrclib",
  };
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
