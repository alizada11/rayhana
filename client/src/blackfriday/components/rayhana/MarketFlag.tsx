import React from "react";
import type { MarketId } from "@/blackfriday/data/catalog";

const nativeOptionFlags: Record<MarketId, string> = {
  US: "🇺🇸",
  CA: "🇨🇦",
  AU: "🇦🇺",
  DE: "🇩🇪",
};

/** Emoji flags keep the selector self-contained across all supported markets. */
export function marketFlagEmoji(market: MarketId) {
  return nativeOptionFlags[market];
}

export function MarketFlag({
  market,
  className,
}: {
  market: MarketId;
  className?: string;
}) {
  return (
    <span
      className={className ? `market-flag ${className}` : "market-flag"}
      aria-hidden="true"
    >
      {nativeOptionFlags[market]}
    </span>
  );
}

export default MarketFlag;
