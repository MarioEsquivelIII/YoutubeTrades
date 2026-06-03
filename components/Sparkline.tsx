// Inline SVG sparkline. Green when the move is up, red when down — matching the
// RedditTrades reference. Pure render, no state.

type Props = {
  points: number[];
  up: boolean;
  width?: number;
  height?: number;
};

export default function Sparkline({ points, up, width = 96, height = 34 }: Props) {
  const color = up ? "#22c55e" : "#ef4444";
  const pad = 3;

  if (points.length < 2) {
    return <svg width={width} height={height} aria-hidden />;
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const stepX = (width - pad * 2) / (points.length - 1);

  const coords = points.map((p, i) => {
    const x = pad + i * stepX;
    const y = height - pad - ((p - min) / span) * (height - pad * 2);
    return [x, y] as const;
  });

  const line = coords
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");

  // Soft area fill under the line.
  const area = `${line} L${coords[coords.length - 1][0].toFixed(1)},${height} L${coords[0][0].toFixed(1)},${height} Z`;
  const gradId = `spark-${up ? "up" : "down"}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-label={up ? "Trending up" : "Trending down"}
      className="overflow-visible"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} stroke="none" />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
