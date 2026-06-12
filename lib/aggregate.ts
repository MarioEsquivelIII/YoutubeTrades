import type { Stock, Video } from "./types";
import type { RawVideo } from "./youtube";
import { extractSource, extractTickers, KNOWN } from "./extract";
import { getQuotes } from "./yahoo";

// Turns the raw videos (title + description + transcript) into the same Stock[]
// shape the UI already renders. One file = the whole "videos -> stocks" step.

// Yahoo Finance has no rate limit for batch requests, so fetch prices for all
// ranked stocks in a single call.
const MAX_STOCKS = 150;

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

/** Straight-line sparkline from prev close to current price (multi-point so it draws nicely). */
function buildSpark(from: number, to: number, n = 6): number[] {
  const a = from || to || 0;
  const b = to || from || 0;
  if (a === b) return [a, b];
  return Array.from({ length: n }, (_, i) =>
    Number((a + (b - a) * (i / (n - 1))).toFixed(2)),
  );
}

/**
 * Proxy for "buzz" (week-over-week mention change) when we have no history yet:
 * how much of a stock's attention is concentrated in the last few days.
 * Fresh, surging coverage reads positive; stale coverage reads negative.
 */
function hypeProxy(videos: Video[]): number {
  const total = videos.reduce((s, v) => s + v.views, 0) || 1;
  const cutoff = daysAgoISO(3);
  const recent = videos
    .filter((v) => v.publishedAt >= cutoff)
    .reduce((s, v) => s + v.views, 0);
  return Math.round((recent / total) * 100 - 40);
}

export async function buildStocks(rawVideos: RawVideo[]): Promise<Stock[]> {
  // Group videos under every ticker they mention.
  const byTicker = new Map<string, Video[]>();

  for (const rv of rawVideos) {
    const titleDesc = `${rv.title}\n${rv.description}`;
    const fullText = `${titleDesc}\n${rv.transcript ?? ""}`;
    const tickers = extractTickers(fullText);
    if (tickers.length === 0) continue;

    // Tickers present in the title/description; anything else came from the transcript.
    const inTitleDesc = new Set(extractTickers(titleDesc));
    const source = extractSource(fullText);
    const base = {
      id: rv.id,
      title: rv.title,
      channel: rv.channel,
      channelId: rv.channelId,
      url: rv.url,
      publishedAt: rv.publishedAt,
      views: rv.views,
      source,
    };

    for (const t of tickers) {
      const list = byTicker.get(t) ?? [];
      list.push({ ...base, mentionedInTranscript: !inTitleDesc.has(t) });
      byTicker.set(t, list);
    }
  }

  const ranked = [...byTicker.entries()]
    .map(([ticker, videos]) => ({
      ticker,
      videos,
      views: videos.reduce((s, v) => s + v.views, 0),
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, MAX_STOCKS);

  // Batch-fetch all ranked tickers in one Yahoo Finance request.
  const quotes = await getQuotes(ranked.map((r) => r.ticker));

  return ranked.map(({ ticker, videos }): Stock => {
    const quote = quotes.get(ticker) ?? null;
    const price = quote?.price ?? 0;
    const changePct = quote?.changePct ?? 0;
    const prevClose = quote?.prevClose ?? price;
    return {
      ticker,
      name: KNOWN[ticker]?.name ?? ticker,
      price,
      changePct,
      spark: buildSpark(prevClose, price),
      hypeDelta: hypeProxy(videos),
      videos,
      type: KNOWN[ticker]?.type ?? "stock",
      trends: KNOWN[ticker]?.trends ?? [],
    };
  });
}
