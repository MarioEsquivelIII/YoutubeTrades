"use client";

import { useState } from "react";
import type { RankedStock } from "@/lib/types";
import { compactNumber, money, pct } from "@/lib/format";
import Sparkline from "./Sparkline";
import HypeBadge from "./HypeBadge";
import TrendNote from "./TrendNote";
import VideoList from "./VideoList";

// Match the reference: #1 highlighted gold, everyone else muted gray.
function rankColor(rank: number): string {
  return rank === 1 ? "text-amber-400" : "text-gray-500";
}

export default function StockRow({ stock }: { stock: RankedStock }) {
  const [open, setOpen] = useState(false);
  const up = stock.changePct >= 0;
  const videoWord = stock.videoCount === 1 ? "video" : "videos";

  return (
    <div className="rounded-2xl border border-white/5 bg-[#1a1a1a] transition hover:border-white/10">
      {/* Main row — click anywhere to expand the videos */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left sm:gap-4 sm:px-5"
      >
        <div
          className={`w-9 shrink-0 text-base font-bold sm:text-lg ${rankColor(stock.rank)}`}
        >
          #{stock.rank}
        </div>

        <div className="w-24 shrink-0 sm:w-36">
          <div className="text-lg font-extrabold tracking-tight text-[#d24b4b]">
            {`$${stock.ticker}`}
          </div>
          <div className="truncate text-xs text-gray-500">{stock.name}</div>
        </div>

        <div className="w-24 shrink-0 sm:w-28">
          {stock.price > 0 ? (
            <>
              <div className="font-semibold text-white">{money(stock.price)}</div>
              <div
                className={`text-xs font-medium ${up ? "text-emerald-400" : "text-red-400"}`}
              >
                {pct(stock.changePct)}
              </div>
            </>
          ) : (
            <>
              <div className="font-semibold text-white">—</div>
              <div className="text-xs font-medium text-gray-600">no price</div>
            </>
          )}
        </div>

        <div className="hidden shrink-0 sm:block">
          <Sparkline points={stock.spark} up={up} />
        </div>

        <div className="hidden w-16 shrink-0 text-center md:block">
          <div className="font-semibold text-white">
            {compactNumber(stock.totalViews)}
          </div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
            Views
          </div>
        </div>

        <div className="hidden w-16 shrink-0 text-center md:block">
          <div className="font-semibold text-white">{stock.videoCount}</div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
            Videos
          </div>
        </div>

        <div className="ml-auto shrink-0">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300">
            {stock.videoCount} {videoWord}
            <span
              className={`transition-transform ${open ? "rotate-180" : ""}`}
              aria-hidden
            >
              ▾
            </span>
          </span>
        </div>
      </button>

      {/* Combined trend signal: buzz badge (mentions) + auto description */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 pb-3 sm:px-5">
        <HypeBadge hypeDelta={stock.hypeDelta} />
        <TrendNote changePct={stock.changePct} hypeDelta={stock.hypeDelta} />
      </div>

      {open ? (
        <div className="px-4 pb-4 sm:px-5">
          <VideoList videos={stock.visibleVideos} />
        </div>
      ) : null}
    </div>
  );
}
