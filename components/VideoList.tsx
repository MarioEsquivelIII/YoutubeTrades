import type { Video } from "@/lib/types";
import { compactNumber, dateShort } from "@/lib/format";

// Expanded list of the videos behind a stock. Any video that cited an external
// source shows a "via <source>" chip so the claim can be traced back.

function SourceChip({ source }: { source: NonNullable<Video["source"]> }) {
  const label = `via ${source.name}`;
  const base =
    "inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[11px] font-medium text-gray-300 ring-1 ring-inset ring-white/10";
  if (source.url) {
    return (
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${base} transition hover:bg-white/10 hover:text-[#ff4d4d]`}
        onClick={(e) => e.stopPropagation()}
        title={`Source: ${source.name}`}
      >
        <span aria-hidden>🔗</span>
        {label}
      </a>
    );
  }
  return (
    <span className={base} title={`Source: ${source.name}`}>
      <span aria-hidden>◇</span>
      {label}
    </span>
  );
}

export default function VideoList({ videos }: { videos: Video[] }) {
  return (
    <ul className="mt-3 space-y-2 border-t border-white/5 pt-3">
      {videos.map((v) => (
        <li
          key={v.id}
          className="flex flex-col gap-1 rounded-lg bg-black/20 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <a
              href={v.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate text-sm font-medium text-gray-200 transition hover:text-[#ff4d4d]"
              title={v.title}
            >
              {v.title}
            </a>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
              <span className="font-medium text-gray-400">{v.channel}</span>
              <span aria-hidden>·</span>
              <span>{compactNumber(v.views)} views</span>
              <span aria-hidden>·</span>
              <span>{dateShort(v.publishedAt)}</span>
              {v.mentionedInTranscript ? (
                <span
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400/90 ring-1 ring-inset ring-emerald-500/20"
                  title="This ticker was mentioned in the spoken transcript, not the title or description"
                >
                  🎙 transcript
                </span>
              ) : null}
            </div>
          </div>
          {v.source ? (
            <div className="shrink-0">
              <SourceChip source={v.source} />
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
