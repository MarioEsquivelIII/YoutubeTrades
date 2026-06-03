import { describeTrend } from "@/lib/trend";

// One-line, auto-generated description blending price move + hype direction.
export default function TrendNote({
  changePct,
  hypeDelta,
}: {
  changePct: number;
  hypeDelta: number;
}) {
  return (
    <p className="text-xs leading-relaxed text-gray-500">
      {describeTrend(changePct, hypeDelta)}
    </p>
  );
}
