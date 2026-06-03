"use client";

type Props = {
  channels: string[];
  updated: string;
  onRefresh: () => void;
  ok: boolean;
  note?: string;
  loading: boolean;
  pricesLive: boolean;
};

export default function Header({
  channels,
  updated,
  onRefresh,
  ok,
  note,
  loading,
  pricesLive,
}: Props) {
  const chips = channels.length > 0 ? channels : ["No channels"];
  const badgeLabel = !ok
    ? "Not connected"
    : pricesLive
      ? "Live data"
      : "Live (no prices)";
  const badgeClass = ok
    ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20"
    : "bg-red-500/10 text-red-400 ring-red-500/20";

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <span
            className="flex h-6 w-9 items-center justify-center rounded-md bg-[#ff0000]"
            aria-hidden
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="#ffffff">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight">
            <span className="text-white">YouTube</span>
            <span className="text-[#ff0000]">Trades</span>
          </h1>
        </div>
        <p className="mt-0.5 text-xs text-gray-500">
          Stocks ranked by what finance YouTubers are hyping this week
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <span
              key={c}
              className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-gray-400 ring-1 ring-inset ring-white/10"
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-start gap-2 sm:items-end">
        <div className="flex items-center gap-2">
          <span
            title={note}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${badgeClass}`}
          >
            <span aria-hidden>●</span> {badgeLabel}
          </span>
          <span className="text-xs text-gray-500">
            {loading ? "Updating…" : `Updated ${updated}`}
          </span>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#ff0000] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#ff3333] active:scale-[0.98] disabled:opacity-60"
        >
          <span aria-hidden className={loading ? "inline-block animate-spin" : ""}>
            ↻
          </span>{" "}
          {loading ? "Loading" : "Refresh Data"}
        </button>
      </div>
    </header>
  );
}
