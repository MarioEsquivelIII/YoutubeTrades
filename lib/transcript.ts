import { execFile } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

// Transcript fetcher. yt-dlp is the primary path (it actually works against the
// current YouTube; youtubei.js's transcript endpoint is returning HTTP 400). We
// still keep youtubei.js as a silent fallback in case yt-dlp is unavailable.
// Any failure yields "" so the caller falls back to title + description.

// yt-dlp's PATH entry isn't active until the user re-logs in after install, so
// resolve its real location (env override → winget Links shim → winget Packages).
function resolveYtDlp(): string {
  const candidates: string[] = [];
  if (process.env.YT_DLP_PATH) candidates.push(process.env.YT_DLP_PATH);
  const local = process.env.LOCALAPPDATA;
  if (local) {
    candidates.push(join(local, "Microsoft", "WinGet", "Links", "yt-dlp.exe"));
    const pkgRoot = join(local, "Microsoft", "WinGet", "Packages");
    try {
      const dir = readdirSync(pkgRoot).find((d) => d.startsWith("yt-dlp.yt-dlp"));
      if (dir) candidates.push(join(pkgRoot, dir, "yt-dlp.exe"));
    } catch {
      /* packages dir not present */
    }
  }
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  return "yt-dlp"; // assume it's on PATH (e.g. after a fresh login, or non-Windows)
}

const YT_DLP = resolveYtDlp();

// Persist transcripts to disk (keyed by video id) so server restarts and repeat
// loads don't re-run the slow yt-dlp scrape for videos we've already read.
const CACHE_DIR = join(tmpdir(), "ytt-transcripts");

async function cacheGet(videoId: string): Promise<string | null> {
  try {
    return await readFile(join(CACHE_DIR, `${videoId}.txt`), "utf8");
  } catch {
    return null;
  }
}

async function cacheSet(videoId: string, text: string): Promise<void> {
  if (!text) return; // don't cache empty/failed results — let them retry later
  try {
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(join(CACHE_DIR, `${videoId}.txt`), text, "utf8");
  } catch {
    /* cache is best-effort */
  }
}

export async function getTranscript(videoId: string): Promise<string> {
  const id = videoId.replace(/[^A-Za-z0-9_-]/g, "");
  const cached = await cacheGet(id);
  if (cached !== null) return cached;

  const text = (await tryYtDlp(id)) || (await tryInnertube(id));
  await cacheSet(id, text);
  return text;
}

async function tryYtDlp(videoId: string): Promise<string> {
  let dir: string | null = null;
  try {
    dir = await mkdtemp(join(tmpdir(), "ytt-"));
    try {
      await execFileAsync(
        YT_DLP,
        [
          "--skip-download",
          "--write-auto-subs",
          "--write-subs",
          // Limit to English variants only — requesting "en.*" pulls dozens of
          // auto-translated tracks and trips YouTube's 429 rate limit.
          "--sub-langs",
          "en,en-orig,en-US",
          "--sub-format",
          "json3",
          "--no-warnings",
          "-o",
          join(dir, "%(id)s.%(ext)s"),
          `https://www.youtube.com/watch?v=${videoId}`,
        ],
        { timeout: 30_000 },
      );
    } catch {
      // A non-zero exit (e.g. one language 429'd) can still leave a good track
      // on disk — fall through and read whatever was written.
    }

    const files = await readdir(dir);
    const sub =
      files.find((f) => f.endsWith(".en.json3")) ??
      files.find((f) => f.endsWith(".json3"));
    if (!sub) return "";

    const json = JSON.parse(await readFile(join(dir, sub), "utf8"));
    return (json.events ?? [])
      .flatMap((e: any) => (e.segs ?? []).map((s: any) => s.utf8 ?? ""))
      .join("")
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    return "";
  } finally {
    if (dir) await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

async function tryInnertube(videoId: string): Promise<string> {
  try {
    const { Innertube, Log } = await import("youtubei.js");
    try {
      // Silence the library's noisy parser warnings.
      (Log as any).setLevel?.((Log as any).Level?.NONE ?? 0);
    } catch {
      /* logging API differs across versions — ignore */
    }
    const yt = await Innertube.create({ retrieve_player: false });
    const info = await yt.getInfo(videoId);
    const transcript = await info.getTranscript();
    const segments =
      transcript?.transcript?.content?.body?.initial_segments ?? [];
    return segments
      .map((s: any) => s?.snippet?.text ?? "")
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    return "";
  }
}
