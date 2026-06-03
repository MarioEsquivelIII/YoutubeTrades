// Finnhub price client (free tier). Two endpoints used:
//   /quote          → current price + daily % change
//   /stock/profile2 → company display name
// Both return null on any failure so the aggregator can degrade gracefully.

const BASE = "https://finnhub.io/api/v1";

export function hasFinnhubKey(): boolean {
  return Boolean(process.env.FINNHUB_API_KEY);
}

export type Quote = {
  price: number;
  changePct: number;
  prevClose: number;
};

// Cache quotes so a broad board (100+ tickers) doesn't re-hit Finnhub's 60/min
// free-tier limit on every load. Successes cached 10 min; misses retried sooner.
const quoteCache = new Map<string, { at: number; quote: Quote | null }>();
const QUOTE_OK_TTL = 1000 * 60 * 10;
const QUOTE_MISS_TTL = 1000 * 60;

export async function getQuote(symbol: string): Promise<Quote | null> {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) return null;

  const hit = quoteCache.get(symbol);
  if (hit && Date.now() - hit.at < (hit.quote ? QUOTE_OK_TTL : QUOTE_MISS_TTL)) {
    return hit.quote;
  }

  const quote = await fetchQuote(symbol, key);
  quoteCache.set(symbol, { at: Date.now(), quote });
  return quote;
}

async function fetchQuote(symbol: string, key: string): Promise<Quote | null> {
  try {
    const res = await fetch(
      `${BASE}/quote?symbol=${encodeURIComponent(symbol)}&token=${key}`,
    );
    if (!res.ok) return null;
    const q = await res.json();
    // q = { c: current, h, l, o, pc: prevClose, d: change, dp: %change, t }
    if (!q || typeof q.c !== "number" || q.c === 0) return null;
    const prevClose = typeof q.pc === "number" && q.pc > 0 ? q.pc : q.c;
    const changePct =
      typeof q.dp === "number" ? q.dp : ((q.c - prevClose) / prevClose) * 100;
    return { price: q.c, changePct, prevClose };
  } catch {
    return null;
  }
}

export async function getCompanyName(symbol: string): Promise<string | null> {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `${BASE}/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${key}`,
    );
    if (!res.ok) return null;
    const p = await res.json();
    return typeof p?.name === "string" && p.name ? p.name : null;
  } catch {
    return null;
  }
}
