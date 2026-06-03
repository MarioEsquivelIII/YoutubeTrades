// Standalone check: can we fetch a YouTube transcript from THIS machine/IP?
// Usage: node scripts/test-transcript.mjs [videoId]
import { Innertube } from "youtubei.js";

const VIDEO = process.argv[2] || "dQw4w9WgXcQ"; // default: a video known to have captions

try {
  const yt = await Innertube.create({ retrieve_player: false });
  const info = await yt.getInfo(VIDEO);
  const t = await info.getTranscript();
  const segs = t?.transcript?.content?.body?.initial_segments ?? [];
  const text = segs.map((s) => s?.snippet?.text ?? "").join(" ");
  console.log("[youtubei.js] OK — segments:", segs.length, "chars:", text.length);
  console.log("[youtubei.js] sample:", JSON.stringify(text.slice(0, 180)));
} catch (e) {
  console.log("[youtubei.js] FAILED:", e?.message ?? e);
}
