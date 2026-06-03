import { NextResponse } from "next/server";
import type { Stock } from "@/lib/types";
import { mapLimit } from "@/lib/async";
import {
  hasYouTubeKey,
  listChannelVideos,
  targetChannels,
  type RawVideo,
} from "@/lib/youtube";
import { getTranscript } from "@/lib/transcript";
import { buildStocks } from "@/lib/aggregate";
import { hasFinnhubKey } from "@/lib/finnhub";

// youtubei.js / yt-dlp need the Node runtime (not edge); data is per-request.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = {
  ok: boolean;
  error?: string;
  updated: string; // ISO
  pricesLive: boolean;
  stocks: Stock[];
};

type Enriched = RawVideo & { transcript: string };

// Scan many recent videos per channel (titles + descriptions are free to read),
// but only pull transcripts for the most recent few — that's what makes the
// long-tail / niche-trend tickers actually surface without a huge yt-dlp bill.
const MAX_VIDEOS_PER_CHANNEL = 25;
const TRANSCRIBE_RECENT = 3;
const CHANNEL_TTL_MS = 1000 * 60 * 30; // 30 minutes
// Scrape at most this many channels at once. With ~2 transcript fetches per
// channel in flight, this caps concurrent yt-dlp processes at ~8 (was ~90 when
// every tracked channel ran via Promise.all — which overwhelmed the machine).
const CHANNEL_CONCURRENCY = 4;

// Cache per channel (videos + transcripts) so adding/removing a YouTuber only
// scrapes the newly-added channel — the rest comes straight from cache.
const channelCache = new Map<string, { at: number; videos: Enriched[] }>();

function err(error: string): Payload {
  return {
    ok: false,
    error,
    updated: new Date().toISOString(),
    pricesLive: false,
    stocks: [],
  };
}

function parseHandles(req: Request): string[] {
  const params = new URL(req.url).searchParams;
  // A present-but-empty `channels` param means "the user disabled/removed all" —
  // return [] so the route reports it, rather than falling back to defaults.
  if (params.has("channels")) {
    return (params.get("channels") ?? "")
      .split(",")
      .map((h) => h.trim().replace(/^@/, ""))
      .filter(Boolean);
  }
  return targetChannels().map((c) => c.handle);
}

async function getChannelVideos(
  handle: string,
  bypass: boolean,
): Promise<Enriched[]> {
  const hit = channelCache.get(handle);
  if (!bypass && hit && Date.now() - hit.at < CHANNEL_TTL_MS) return hit.videos;

  const raw = await listChannelVideos(handle, MAX_VIDEOS_PER_CHANNEL).catch(
    () => [] as RawVideo[],
  );
  // raw is newest-first; only the most recent few get a (slow) transcript fetch.
  const enriched = await mapLimit(raw, 2, async (v, i) => ({
    ...v,
    transcript: i < TRANSCRIBE_RECENT ? await getTranscript(v.id) : "",
  }));
  channelCache.set(handle, { at: Date.now(), videos: enriched });
  return enriched;
}

export async function GET(req: Request) {
  if (!hasYouTubeKey()) {
    return NextResponse.json(
      err("Add YOUTUBE_API_KEY to .env.local and restart the dev server."),
    );
  }

  const handles = parseHandles(req);
  if (handles.length === 0) {
    return NextResponse.json(
      err("No YouTubers are being tracked — add at least one channel."),
    );
  }

  const bypass = new URL(req.url).searchParams.get("refresh") === "1";

  try {
    const lists = await mapLimit(handles, CHANNEL_CONCURRENCY, (h) =>
      getChannelVideos(h, bypass),
    );
    const videos = lists.flat();
    if (videos.length === 0) {
      return NextResponse.json(
        err(
          "No videos came back from YouTube — check the channel handles, your API key, or quota.",
        ),
      );
    }

    // buildStocks already ranks by views and caps the long tail.
    const stocks = await buildStocks(videos);

    if (stocks.length === 0) {
      return NextResponse.json(
        err("Found videos, but none mentioned a recognizable stock ticker yet."),
      );
    }

    return NextResponse.json({
      ok: true,
      updated: new Date().toISOString(),
      pricesLive: hasFinnhubKey(),
      stocks,
    } satisfies Payload);
  } catch (e) {
    const reason = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json(err(`Live fetch failed: ${reason}`));
  }
}
