// Yahoo Finance price client — free, no API key required.
// Uses yahoo-finance2 v3 with batch quote fetching so all tickers resolve in
// one network round-trip instead of serial per-symbol calls.

import createYahooFinance from "yahoo-finance2";

const yf = new createYahooFinance({ suppressNotices: ["yahooSurvey"] });

export type Quote = {
  price: number;
  changePct: number;
  prevClose: number;
};

const quoteCache = new Map<string, { at: number; quote: Quote | null }>();
const QUOTE_TTL = 1000 * 60 * 10; // 10 min

/** Fetch quotes for a batch of symbols, returning a map keyed by symbol. */
export async function getQuotes(
  symbols: string[],
): Promise<Map<string, Quote | null>> {
  if (symbols.length === 0) return new Map();

  const now = Date.now();
  const toFetch: string[] = [];
  const result = new Map<string, Quote | null>();

  for (const sym of symbols) {
    const hit = quoteCache.get(sym);
    if (hit && now - hit.at < QUOTE_TTL) {
      result.set(sym, hit.quote);
    } else {
      toFetch.push(sym);
    }
  }

  if (toFetch.length > 0) {
    try {
      const raw = await yf.quote(toFetch);
      const list = Array.isArray(raw) ? raw : [raw];
      for (const q of list) {
        const sym = q.symbol;
        if (!sym) continue;
        const price = q.regularMarketPrice ?? 0;
        if (!price) {
          quoteCache.set(sym, { at: now, quote: null });
          result.set(sym, null);
          continue;
        }
        const quote: Quote = {
          price,
          changePct: q.regularMarketChangePercent ?? 0,
          prevClose: q.regularMarketPreviousClose ?? price,
        };
        quoteCache.set(sym, { at: now, quote });
        result.set(sym, quote);
      }
      // Mark any symbol Yahoo didn't return as a miss
      for (const sym of toFetch) {
        if (!result.has(sym)) {
          quoteCache.set(sym, { at: now, quote: null });
          result.set(sym, null);
        }
      }
    } catch {
      for (const sym of toFetch) {
        quoteCache.set(sym, { at: now, quote: null });
        result.set(sym, null);
      }
    }
  }

  return result;
}

/** Single-symbol convenience wrapper. */
export async function getQuote(symbol: string): Promise<Quote | null> {
  const m = await getQuotes([symbol]);
  return m.get(symbol) ?? null;
}
