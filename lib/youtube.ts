import { CHANNELS } from "./channels";

// Thin wrapper over the official YouTube Data API v3 (key-based, read-only).
// Used for the parts that must be rock-solid: which videos each channel posted
// and their view counts (the core of the hype ranking). Transcripts come from
// lib/transcript.ts instead — the Data API can't read other people's captions.

const API = "https://www.googleapis.com/youtube/v3";

export type RawVideo = {
  id: string;
  title: string;
  description: string;
  channel: string;
  channelId: string;
  url: string;
  publishedAt: string; // YYYY-MM-DD
  views: number;
  transcript?: string; // filled in later by lib/transcript.ts
};

export function hasYouTubeKey(): boolean {
  return Boolean(process.env.YOUTUBE_API_KEY);
}

/** Channels to track: from the YOUTUBE_CHANNELS env override, else the seed list. */
export function targetChannels(): { name: string; handle: string }[] {
  const env = process.env.YOUTUBE_CHANNELS?.trim();
  if (env) {
    return env
      .split(",")
      .map((h) => h.trim().replace(/^@/, ""))
      .filter(Boolean)
      .map((handle) => ({ name: handle, handle }));
  }
  return CHANNELS.filter((c) => c.handle).map((c) => ({
    name: c.name,
    handle: c.handle as string,
  }));
}

async function getJson(url: string): Promise<any> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`YouTube API ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

/** Resolve an @handle to its channel id, title, and uploads playlist. */
async function resolveChannel(handle: string, key: string) {
  const url = `${API}/channels?part=contentDetails,snippet&forHandle=${encodeURIComponent(
    handle,
  )}&key=${key}`;
  const data = await getJson(url);
  const item = data.items?.[0];
  if (!item) return null;
  return {
    channelId: item.id as string,
    title: (item.snippet?.title as string) ?? handle,
    uploads: item.contentDetails?.relatedPlaylists?.uploads as string | undefined,
  };
}

/**
 * Recent uploads for one channel, with view counts.
 * Cost: 1 (channels) + 1 (playlistItems) + 1 (videos) = ~3 units per channel,
 * so a 10-channel refresh is ~30 of the 10,000 daily free units.
 */
export async function listChannelVideos(
  handle: string,
  max = 6,
): Promise<RawVideo[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return [];

  const ch = await resolveChannel(handle, key);
  if (!ch?.uploads) return [];

  const plUrl = `${API}/playlistItems?part=contentDetails&playlistId=${ch.uploads}&maxResults=${max}&key=${key}`;
  const pl = await getJson(plUrl);
  const ids: string[] = (pl.items ?? [])
    .map((i: any) => i.contentDetails?.videoId)
    .filter(Boolean);
  if (ids.length === 0) return [];

  const vUrl = `${API}/videos?part=snippet,statistics&id=${ids.join(",")}&key=${key}`;
  const vids = await getJson(vUrl);

  return (vids.items ?? []).map(
    (v: any): RawVideo => ({
      id: v.id,
      title: v.snippet?.title ?? "",
      description: v.snippet?.description ?? "",
      channel: ch.title,
      channelId: ch.channelId,
      url: `https://www.youtube.com/watch?v=${v.id}`,
      publishedAt: (v.snippet?.publishedAt ?? "").slice(0, 10),
      views: Number(v.statistics?.viewCount ?? 0),
    }),
  );
}
