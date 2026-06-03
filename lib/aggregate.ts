import type { Stock, Video } from "./types";
import type { RawVideo } from "./youtube";
import { mapLimit } from "./async";
import { extractSource, extractTickers, KNOWN } from "./extract";
import { getQuote } from "./finnhub";

// Turns the raw videos (title + description + transcript) into the same Stock[]
// shape the UI already renders. One file = the whole "videos -> stocks" step.

// Return up to this many ranked stocks (so trend/category filters have a real
// pool), but only fetch live prices for the top slice to stay within Finnhub's
// free-tier rate limit. Tickers past PRICE_TOP still appear (price "—").
const MAX_STOCKS = 150;
const PRICE_TOP = 60;

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

  // Rank tickers by total views (hype), keep the long tail up to MAX_STOCKS, but
  // only spend Finnhub quota on the top PRICE_TOP — the rest still show as "—".
  const ranked = [...byTicker.entries()]
    .map(([ticker, videos]) => ({
      ticker,
      videos,
      views: videos.reduce((s, v) => s + v.views, 0),
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, MAX_STOCKS);

  const quoteEntries = await mapLimit(
    ranked.slice(0, PRICE_TOP),
    5,
    async ({ ticker }) => [ticker, await getQuote(ticker)] as const,
  );
  const quotes = new Map(quoteEntries);

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
