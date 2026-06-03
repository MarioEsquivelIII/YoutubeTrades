"use client";

import { TRENDS } from "@/lib/extract";

// Quick-filter presets. Selecting one is reported to the parent as an id string;
// the page maps it to price range / security-type / trend filter state.
const PILLS = [
  { id: "all", label: "All" },
  { id: "low", label: "Low cost" },
  { id: "medium", label: "Medium" },
  { id: "expensive", label: "Expensive" },
  { id: "etf", label: "ETFs" },
  { id: "index", label: "Index funds" },
];

type Props = {
  /** Active category id for highlight: "all" | "low" | ... | "trend:<id>" | "" (custom). */
  active: string;
  onSelect: (category: string) => void;
};

export default function CategoryFilter({ active, onSelect }: Props) {
  const trendValue = active.startsWith("trend:") ? active.slice(6) : "";

  return (
    <div>
      <div className="mb-2 text-xs text-gray-400">Quick filters</div>
      <div className="flex flex-wrap items-center gap-1.5">
        {PILLS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              active === p.id
                ? "bg-[#ff0000] text-white"
                : "bg-white/5 text-gray-400 ring-1 ring-inset ring-white/10 hover:bg-white/10 hover:text-gray-200"
            }`}
          >
            {p.label}
          </button>
        ))}

        <div className="relative">
          <select
            aria-label="Filter by investment trend"
            value={trendValue}
            onChange={(e) =>
              onSelect(e.target.value ? `trend:${e.target.value}` : "all")
            }
            className={`cursor-pointer appearance-none rounded-full py-1 pl-3 pr-7 text-xs font-medium outline-none transition ${
              trendValue
                ? "bg-[#ff0000] text-white"
                : "bg-white/5 text-gray-400 ring-1 ring-inset ring-white/10 hover:bg-white/10 hover:text-gray-200"
            }`}
          >
            <option value="" className="bg-[#1a1a1a] text-gray-200">
              Trends
            </option>
            {TRENDS.map((t) => (
              <option
                key={t.id}
                value={t.id}
                className="bg-[#1a1a1a] text-gray-200"
              >
                {t.label}
              </option>
            ))}
          </select>
          <span
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px]"
            aria-hidden
          >
            ▾
          </span>
        </div>
      </div>
    </div>
  );
}
