import { signedPct } from "@/lib/format";

// Small pill showing how YouTube mention-volume is trending week-over-week.
// This is the "hype" half of the combined trend signal (price is the other).

export default function HypeBadge({ hypeDelta }: { hypeDelta: number }) {
  const rising = hypeDelta >= 0;
  const cls = rising
    ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20"
    : "bg-red-500/10 text-red-400 ring-red-500/20";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${cls}`}
      title="Change in YouTube mentions vs last week"
    >
      <span aria-hidden>{rising ? "▲" : "▼"}</span>
      {signedPct(hypeDelta)} buzz
    </span>
  );
}
