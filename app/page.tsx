"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CHANNELS } from "@/lib/channels";
import { applyFilters, type SortBy } from "@/lib/filters";
import type { Stock } from "@/lib/types";
import Header from "@/components/Header";
import FilterBar from "@/components/FilterBar";
import StockList from "@/components/StockList";
import type { TrackedChannel } from "@/components/ChannelManager";

type ApiPayload = {
  ok: boolean;
  error?: string;
  updated: string;
  pricesLive: boolean;
  stocks: Stock[];
};

const PRICE_MIN = 0;
const PRICE_MAX = 10000;
const PRICE_BANDS: Record<string, [number, number]> = {
  all: [PRICE_MIN, PRICE_MAX],
  under25: [0, 25],
  mid: [50, 150],
  over200: [200, PRICE_MAX],
};

const DEFAULT_TRACKED: TrackedChannel[] = CHANNELS.filter((c) => c.handle).map(
  (c) => ({ handle: c.handle as string, name: c.name, enabled: true }),
);
const STORAGE_KEY = "ytt:tracked";
const REMOVED_KEY = "ytt:removed";

/** Add any default channels missing from `current`, skipping ones the user removed. */
function mergeDefaults(
  current: TrackedChannel[],
  removed: string[],
): TrackedChannel[] {
  const removedSet = new Set(removed.map((h) => h.toLowerCase()));
  const have = new Set(current.map((c) => c.handle.toLowerCase()));
  const additions = DEFAULT_TRACKED.filter(
    (d) =>
      !have.has(d.handle.toLowerCase()) &&
      !removedSet.has(d.handle.toLowerCase()),
  );
  return additions.length ? [...current, ...additions] : current;
}

export default function Page() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [tracked, setTracked] = useState<TrackedChannel[]>(DEFAULT_TRACKED);
  const [error, setError] = useState<string | undefined>(undefined);
  const [pricesLive, setPricesLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState("…");

  // Filters
  const [priceMin, setPriceMin] = useState(PRICE_MIN);
  const [priceMax, setPriceMax] = useState(PRICE_MAX);
  const [activeCategory, setActiveCategory] = useState("all");
  const [securityType, setSecurityType] = useState<"etf" | "index" | null>(null);
  const [trend, setTrend] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("views");
  // Handles the user explicitly removed, so auto-merge doesn't resurrect them.
  const [removed, setRemoved] = useState<string[]>([]);

  const hydrated = useRef(false);

  const load = useCallback(
    async (channels: TrackedChannel[], refresh: boolean) => {
      setLoading(true);
      setError(undefined);
      try {
        const handles = channels
          .filter((c) => c.enabled)
          .map((c) => c.handle)
          .join(",");
        const res = await fetch(
          `/api/stocks?channels=${encodeURIComponent(handles)}${
            refresh ? "&refresh=1" : ""
          }`,
          { cache: "no-store" },
        );
        const data: ApiPayload = await res.json();
        setStocks(data.stocks);
        setError(data.ok ? undefined : data.error);
        setPricesLive(data.pricesLive);
        setUpdated(
          new Date(data.updated).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }),
        );
      } catch {
        setStocks([]);
        setError("Could not reach /api/stocks.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // On first mount, restore tracked channels from localStorage (migrating older
  // entries that predate `enabled`), then load.
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    let rem: string[] = [];
    try {
      const raw = localStorage.getItem(REMOVED_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed)) rem = parsed.map(String);
    } catch {
      /* ignore */
    }
    setRemoved(rem);

    let saved: TrackedChannel[] | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed) && parsed.length) {
        saved = parsed.map((c) => ({
          handle: String(c.handle),
          name: c.name ?? `@${c.handle}`,
          enabled: c.enabled !== false,
        }));
      }
    } catch {
      /* ignore bad localStorage */
    }

    // Merge in any newly-added default channels (without resurrecting removed ones).
    const initial = mergeDefaults(saved ?? DEFAULT_TRACKED, rem);
    setTracked(initial);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    } catch {
      /* ignore */
    }
    load(initial, false);
  }, [load]);

  const persist = (next: TrackedChannel[]) => {
    setTracked(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage disabled — keep in-memory */
    }
    load(next, false);
  };

  const saveRemoved = (list: string[]) => {
    setRemoved(list);
    try {
      localStorage.setItem(REMOVED_KEY, JSON.stringify(list));
    } catch {
      /* ignore */
    }
  };

  const addChannel = (handle: string) => {
    if (tracked.some((c) => c.handle.toLowerCase() === handle.toLowerCase()))
      return;
    // Re-adding clears any prior "removed" record so it isn't filtered out later.
    if (removed.some((h) => h.toLowerCase() === handle.toLowerCase())) {
      saveRemoved(
        removed.filter((h) => h.toLowerCase() !== handle.toLowerCase()),
      );
    }
    const def = DEFAULT_TRACKED.find(
      (d) => d.handle.toLowerCase() === handle.toLowerCase(),
    );
    persist([
      ...tracked,
      { handle, name: def?.name ?? `@${handle}`, enabled: true },
    ]);
  };
  const removeChannel = (handle: string) => {
    if (!removed.some((h) => h.toLowerCase() === handle.toLowerCase())) {
      saveRemoved([...removed, handle]);
    }
    persist(tracked.filter((c) => c.handle !== handle));
  };
  const toggleChannel = (handle: string) =>
    persist(
      tracked.map((c) =>
        c.handle === handle ? { ...c, enabled: !c.enabled } : c,
      ),
    );
  const restoreDefaults = () => {
    saveRemoved([]);
    persist(DEFAULT_TRACKED);
  };

  // Quick-filter / Trends selection → filter state.
  const selectCategory = (cat: string) => {
    setActiveCategory(cat);
    if (cat in PRICE_BANDS) {
      const [lo, hi] = PRICE_BANDS[cat];
      setPriceMin(lo);
      setPriceMax(hi);
      setSecurityType(null);
      setTrend(null);
    } else if (cat === "etf" || cat === "index") {
      setSecurityType(cat);
      setTrend(null);
      setPriceMin(PRICE_MIN);
      setPriceMax(PRICE_MAX);
    } else if (cat.startsWith("trend:")) {
      setTrend(cat.slice(6));
      setSecurityType(null);
      setPriceMin(PRICE_MIN);
      setPriceMax(PRICE_MAX);
    }
  };

  const onPriceChange = (lo: number, hi: number) => {
    setPriceMin(lo);
    setPriceMax(hi);
    // Dragging makes the price custom — drop a price-preset highlight, keep type/trend.
    setActiveCategory((cur) =>
      cur in PRICE_BANDS ? "" : cur,
    );
  };

  const ranked = useMemo(
    () =>
      applyFilters(stocks, { priceMin, priceMax, securityType, trend, sortBy }),
    [stocks, priceMin, priceMax, securityType, trend, sortBy],
  );

  // Show a clean top-25 board by default, but reveal the long tail (up to 60)
  // whenever a category/trend/price filter is narrowing the set.
  const filterActive =
    securityType !== null ||
    trend !== null ||
    priceMin > PRICE_MIN ||
    priceMax < PRICE_MAX;
  const displayed = ranked.slice(0, filterActive ? 150 : 50);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
      <Header
        channels={tracked.filter((c) => c.enabled).map((c) => c.name)}
        updated={updated}
        onRefresh={() => load(tracked, true)}
        ok={!error}
        note={error}
        loading={loading}
        pricesLive={pricesLive}
      />

      <div className="mt-5">
        <FilterBar
          priceBounds={[PRICE_MIN, PRICE_MAX]}
          priceMin={priceMin}
          priceMax={priceMax}
          onPriceChange={onPriceChange}
          activeCategory={activeCategory}
          onSelectCategory={selectCategory}
          channels={tracked}
          onAddChannel={addChannel}
          onRemoveChannel={removeChannel}
          onToggleChannel={toggleChannel}
          onRestoreChannels={restoreDefaults}
        />
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-5 py-4 text-sm text-amber-200/90">
          {error}
        </div>
      ) : null}

      <StockList
        stocks={displayed}
        totalCount={ranked.length}
        loading={loading}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <footer className="mt-10 border-t border-white/5 pt-4 text-center text-xs text-gray-600">
        YouTube-only hype tracker · live data · ranked by{" "}
        {sortBy === "views" ? "aggregate video views" : "daily price change"}
      </footer>
    </main>
  );
}
