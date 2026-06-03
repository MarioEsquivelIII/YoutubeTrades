// Generates the one-line trend description shown under each stock.
// It blends the price move (changePct) with the change in YouTube mention
// volume (hypeDelta) into a single human-readable sentence.

export function describeTrend(changePct: number, hypeDelta: number): string {
  const priceUp = changePct >= 0;
  const move = `${Math.abs(changePct).toFixed(1)}%`;

  // Treat near-zero hype movement as "steady" so we don't overclaim.
  const hypeRising = hypeDelta > 4;
  const hypeFalling = hypeDelta < -4;

  if (priceUp && hypeRising)
    return `Surging — up ${move} as YouTube coverage climbs.`;
  if (priceUp && hypeFalling)
    return `Up ${move}, but creator mentions are cooling off.`;
  if (priceUp)
    return `Up ${move} on steady creator interest.`;

  if (!priceUp && hypeRising)
    return `Down ${move} today, yet YouTube buzz is heating up.`;
  if (!priceUp && hypeFalling)
    return `Fading — down ${move} with thinning coverage.`;
  return `Down ${move} while creator chatter holds steady.`;
}
