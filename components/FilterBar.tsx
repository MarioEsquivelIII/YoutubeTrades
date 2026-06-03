"use client";

import PriceRangeSlider from "./PriceRangeSlider";
import ChannelManager, { type TrackedChannel } from "./ChannelManager";
import CategoryFilter from "./CategoryFilter";

type Props = {
  priceBounds: [number, number];
  priceMin: number;
  priceMax: number;
  onPriceChange: (lo: number, hi: number) => void;
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  channels: TrackedChannel[];
  onAddChannel: (handle: string) => void;
  onRemoveChannel: (handle: string) => void;
  onToggleChannel: (handle: string) => void;
  onRestoreChannels: () => void;
};

const fmtMoney = (n: number) => `$${n.toLocaleString("en-US")}`;

export default function FilterBar(props: Props) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#1a1a1a] p-4 sm:p-5">
      <CategoryFilter
        active={props.activeCategory}
        onSelect={props.onSelectCategory}
      />

      <div className="mt-5 grid gap-x-8 gap-y-6 border-t border-white/5 pt-5 md:grid-cols-2">
        <PriceRangeSlider
          min={props.priceBounds[0]}
          max={props.priceBounds[1]}
          valueMin={props.priceMin}
          valueMax={props.priceMax}
          step={25}
          onChange={props.onPriceChange}
          format={fmtMoney}
        />
        <ChannelManager
          channels={props.channels}
          onAdd={props.onAddChannel}
          onRemove={props.onRemoveChannel}
          onToggle={props.onToggleChannel}
          onRestore={props.onRestoreChannels}
        />
      </div>
    </div>
  );
}
