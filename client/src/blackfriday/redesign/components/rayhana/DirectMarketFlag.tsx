import React from "react";
import MarketFlag from "./MarketFlag";
import {
  isSupplementalDirectMarket,
  type DirectMarketId,
} from "@/blackfriday/redesign/data/directStores";

const supplementalFlags = {
  BE: "/flags/be.svg",
  NL: "/flags/nl.svg",
  IT: "/flags/it.svg",
  SE: "/flags/se.svg",
};
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
    <img
      className={`market-flag${className ? ` ${className}` : ""}`}
      src={supplementalFlags[market]}
      width={30}
      height={20}
      alt=""
      aria-hidden="true"
    />
  );
}
