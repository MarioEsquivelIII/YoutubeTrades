// Core domain types for YouTubeTrades.
// Everything is YouTube-driven: stocks are ranked by how much finance
// creators are talking about them, and every claim traces back to a video.

/** An external source a video cites (e.g. an earnings call, Bloomberg, an analyst note). */
export type Source = {
  name: string;
  url?: string;
};

/** A single YouTube video that mentions a stock. */
export type Video = {
  id: string;
  title: string;
  /** Display name of the channel / YouTuber. */
  channel: string;
  channelId: string;
  url: string;
  /** ISO date string (YYYY-MM-DD) — kept timezone-free to avoid hydration drift. */
  publishedAt: string;
  views: number;
  /** Optional source the video references for its claim about the stock. */
  source?: Source;
  /** True when this ticker was found only in the spoken transcript (not title/description). */
  mentionedInTranscript?: boolean;
};

/** A seed finance YouTuber the user can filter by. */
export type Channel = {
  id: string;
  name: string;
  /** YouTube @handle (without the @) used to resolve the channel via the Data API. */
  handle?: string;
};

/** A stock mentioned across one or more YouTube videos. */
export type Stock = {
  ticker: string;
  name: string;
  /** Latest price in USD. */
  price: number;
  /** Daily percentage move. */
  changePct: number;
  /** 7 recent price points used to draw the sparkline. */
  spark: number[];
  /** Week-over-week change in mention volume (%). Drives the "buzz" badge. */
  hypeDelta: number;
  /** Every video that mentions this ticker. */
  videos: Video[];
  /** Curated security classification. Defaults to "stock". */
  type?: "stock" | "etf" | "index";
  /** Curated investment-theme ids this ticker belongs to (e.g. "ai", "semiconductors"). */
  trends?: string[];
};

/** A stock after filtering + ranking, with derived hype metrics attached. */
export type RankedStock = Stock & {
  rank: number;
  totalViews: number;
  videoCount: number;
  /** Videos that survive the active YouTuber filter (all videos when no filter). */
  visibleVideos: Video[];
};
