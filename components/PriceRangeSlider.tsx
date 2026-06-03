"use client";

import { useCallback, useEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

type Props = {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  step?: number;
  onChange: (lo: number, hi: number) => void;
  format?: (n: number) => string;
};

// Dual-handle range slider built from pointer events (no library, no native
// <input type=range> thumb-alignment headaches). Lets the user carve out a price
// band — drag the left handle up to hide cheap stocks, the right handle down to
// hide expensive ones.
export default function PriceRangeSlider({
  min,
  max,
  valueMin,
  valueMax,
  step = 1,
  onChange,
  format = (n) => `${n}`,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<null | "min" | "max">(null);

  const clamp = useCallback(
    (n: number) => Math.min(max, Math.max(min, n)),
    [min, max],
  );

  const toPct = (n: number) =>
    max === min ? 0 : ((n - min) / (max - min)) * 100;

  const valueFromClientX = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return min;
      const rect = el.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const raw = min + ratio * (max - min);
      return clamp(Math.round(raw / step) * step);
    },
    [min, max, step, clamp],
  );

  useEffect(() => {
    function onMove(e: globalThis.PointerEvent) {
      if (!dragging.current) return;
      const v = valueFromClientX(e.clientX);
      if (dragging.current === "min") {
        onChange(Math.min(v, valueMax - step), valueMax);
      } else {
        onChange(valueMin, Math.max(v, valueMin + step));
      }
    }
    function onUp() {
      dragging.current = null;
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [valueFromClientX, onChange, valueMin, valueMax, step]);

  const startDrag =
    (which: "min" | "max") => (e: ReactPointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      dragging.current = which;
    };

  const leftPct = toPct(valueMin);
  const rightPct = toPct(valueMax);

  const handleClass =
    "absolute top-1/2 z-20 h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none rounded-full border-2 border-[#0f0f0f] bg-[#ff0000] shadow ring-1 ring-[#ff0000]/40 transition-transform hover:scale-110 active:cursor-grabbing";

  return (
    <div className="select-none">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="text-gray-400">Price range</span>
        <span className="font-semibold text-gray-200">
          {format(valueMin)} – {format(valueMax)}
        </span>
      </div>

      <div ref={trackRef} className="relative h-6">
        {/* base track */}
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#303030]" />
        {/* selected band */}
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#ff0000]"
          style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }}
        />
        <button
          type="button"
          aria-label="Minimum price"
          onPointerDown={startDrag("min")}
          className={handleClass}
          style={{ left: `${leftPct}%` }}
        />
        <button
          type="button"
          aria-label="Maximum price"
          onPointerDown={startDrag("max")}
          className={handleClass}
          style={{ left: `${rightPct}%` }}
        />
      </div>

      <div className="mt-1 flex justify-between text-[11px] text-gray-600">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}
