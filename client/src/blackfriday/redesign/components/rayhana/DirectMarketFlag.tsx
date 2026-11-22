import React from "react";
import MarketFlag from "./MarketFlag";
import {
  isSupplementalDirectMarket,
  type DirectMarketId,
} from "@/blackfriday/redesign/data/directStores";

const supplementalFlags = { BE: "🇧🇪", NL: "🇳🇱", IT: "🇮🇹" };
export default function DirectMarketFlag({
  market,
  className,
}: {
  market: DirectMarketId;
  className?: string;
}) {
  if (!isSupplementalDirectMarket(market))
    return <MarketFlag market={market} className={className} />;
  return (
    <span
      className={`market-flag${className ? ` ${className}` : ""}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 24,
        lineHeight: 1,
      }}
      aria-hidden="true"
    >
      {supplementalFlags[market]}
    </span>
  );
}
