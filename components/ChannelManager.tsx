"use client";

import { useState } from "react";

export type TrackedChannel = { handle: string; name: string; enabled: boolean };

type Props = {
  channels: TrackedChannel[];
  onAdd: (handle: string) => void;
  onRemove: (handle: string) => void;
  onToggle: (handle: string) => void;
  onRestore: () => void;
};

// Accept a full URL, an @handle, or a bare handle and return the clean handle.
function cleanHandle(input: string): string {
  let h = input.trim();
  const url = h.match(/youtube\.com\/@?([A-Za-z0-9._-]+)/i);
  if (url) h = url[1];
  return h.replace(/^@/, "").trim();
}

export default function ChannelManager({
  channels,
  onAdd,
  onRemove,
  onToggle,
  onRestore,
}: Props) {
  const [text, setText] = useState("");
  const activeCount = channels.filter((c) => c.enabled).length;

  const add = () => {
    const h = cleanHandle(text);
    if (h) onAdd(h);
    setText("");
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="text-gray-400">Tracked YouTubers</span>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">
            {activeCount} of {channels.length} active
          </span>
          <button
            type="button"
            onClick={onRestore}
            title="Restore the full default channel list"
            className="text-gray-500 underline decoration-dotted underline-offset-2 transition hover:text-gray-300"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {channels.length === 0 ? (
          <span className="text-xs text-gray-600">None — add a channel below.</span>
        ) : (
          channels.map((c) => (
            <span
              key={c.handle}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition ${
                c.enabled
                  ? "bg-white/5 text-gray-300 ring-white/10"
                  : "bg-transparent text-gray-600 ring-white/5"
              }`}
            >
              <button
                type="button"
                onClick={() => onToggle(c.handle)}
                aria-label={`${c.enabled ? "Disable" : "Enable"} ${c.name}`}
                title={c.enabled ? "Click to pause this channel" : "Click to enable"}
                className="flex items-center gap-1.5"
              >
                <span
                  className={`inline-block h-2 w-2 shrink-0 rounded-full ${
                    c.enabled
                      ? "bg-[#ff0000]"
                      : "border border-gray-600 bg-transparent"
                  }`}
                  aria-hidden
                />
                <span className={c.enabled ? "" : "line-through"}>{c.name}</span>
              </button>
              <button
                type="button"
                onClick={() => onRemove(c.handle)}
                aria-label={`Remove ${c.name}`}
                className="text-gray-500 transition hover:text-[#ff4d4d]"
              >
                ×
              </button>
            </span>
          ))
        )}
      </div>

      <div className="mt-2 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Add a channel — @handle or URL"
          className="w-full rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 outline-none transition focus:border-[#ff0000]/50"
        />
        <button
          type="button"
          onClick={add}
          className="shrink-0 rounded-lg bg-[#ff0000] px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-[#ff3333]"
        >
          Add
        </button>
      </div>
      <p className="mt-1.5 text-[11px] text-gray-600">
        Click a channel to pause/enable · × removes it. Changes re-scrape (cached,
        so it&apos;s quick).
      </p>
    </div>
  );
}
