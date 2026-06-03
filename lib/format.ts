// Small, dependency-free formatting helpers.
// All are deterministic (no locale/timezone surprises) so server and client
// markup match and React doesn't complain about hydration.

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** $1,694.98 */
export function money(n: number): string {
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** "▲ 3.75%" / "▼ 13.40%" (sign-aware, always 2dp). */
export function pct(n: number): string {
  const arrow = n >= 0 ? "▲" : "▼";
  return `${arrow} ${Math.abs(n).toFixed(2)}%`;
}

/** "+18%" / "−12%" for the hype/buzz delta. */
export function signedPct(n: number): string {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${Math.abs(Math.round(n))}%`;
}

/** 1_240_000 -> "1.2M", 12_400 -> "12.4K". */
export function compactNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

/** "2026-05-28" -> "May 28" without constructing a Date (timezone-safe). */
export function dateShort(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${MONTHS[m - 1]} ${d}`;
}
