import type { RankedStock, Stock } from "./types";

export type SortBy = "views" | "change";

export type FilterState = {
  priceMin: number;
  priceMax: number;
  /** "etf" = any fund, "index" = index funds only, null = no type filter. */
  securityType?: "etf" | "index" | null;
  /** Theme id to filter by (from TRENDS), or null. */
  trend?: string | null;
  /** Ranking: by aggregate views (hype) or by daily price change. */
  sortBy?: SortBy;
};

/**
 * Apply price / security-type / trend filters and rank what remains. Ranking is
 * by total aggregate views (hype) by default, or by daily % change when the
 * user flips the sort toggle. Which creators are tracked is decided upstream.
 */
export function applyFilters(stocks: Stock[], f: FilterState): RankedStock[] {
  const sortBy = f.sortBy ?? "views";
  return stocks
    .filter((s) => s.price >= f.priceMin && s.price <= f.priceMax)
    .filter((s) => {
      if (!f.securityType) return true;
      // "ETFs" surfaces any fund (etf or index); "Index funds" = index only.
      return f.securityType === "etf"
        ? s.type === "etf" || s.type === "index"
        : s.type === "index";
    })
    .filter((s) => (!f.trend ? true : (s.trends ?? []).includes(f.trend)))
    .map((s): RankedStock => {
      const totalViews = s.videos.reduce((sum, v) => sum + v.views, 0);
      return {
        ...s,
        visibleVideos: s.videos,
        totalViews,
        videoCount: s.videos.length,
        rank: 0,
      };
    })
    .sort((a, b) =>
      sortBy === "change"
        ? b.changePct - a.changePct
        : b.totalViews - a.totalViews,
    )
    .map((s, i) => ({ ...s, rank: i + 1 }));
}

/** Min/max price across the dataset (kept for reference; the slider now spans a fixed range). */
export function priceBounds(stocks: Stock[]): [number, number] {
  const prices = stocks.map((s) => s.price).filter((p) => p > 0);
  if (prices.length === 0) return [0, 1000];
  return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))];
}
