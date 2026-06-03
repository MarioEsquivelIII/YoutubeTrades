import type { RankedStock } from "@/lib/types";
import type { SortBy } from "@/lib/filters";
import StockRow from "./StockRow";

export default function StockList({
  stocks,
  totalCount,
  loading,
  sortBy,
  onSortChange,
}: {
  stocks: RankedStock[];
  totalCount: number;
  loading: boolean;
  sortBy: SortBy;
  onSortChange: (s: SortBy) => void;
}) {
  return (
    <section className="mt-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
          Top {stocks.length}{" "}
          {sortBy === "views" ? "most hyped" : "biggest moving"} stock
          {stocks.length === 1 ? "" : "s"} this week
        </h2>
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-lg bg-white/5 p-0.5 ring-1 ring-inset ring-white/10">
            {(["views", "change"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onSortChange(opt)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
                  sortBy === opt
                    ? "bg-[#ff0000] text-white"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {opt === "views" ? "Hype" : "Price move"}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-600">
            {stocks.length} of {totalCount}
          </span>
        </div>
      </div>

      {loading && stocks.length === 0 ? (
        <div className="space-y-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[78px] animate-pulse rounded-2xl border border-white/5 bg-[#1a1a1a]"
            />
          ))}
        </div>
      ) : stocks.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-[#1a1a1a] px-6 py-12 text-center text-sm text-gray-500">
          No stocks to show yet. Try widening the price range, clearing a filter,
          or adding more YouTubers.
        </div>
      ) : (
        <div className="space-y-2.5">
          {stocks.map((s) => (
            <StockRow key={s.ticker} stock={s} />
          ))}
        </div>
      )}
    </section>
  );
}
