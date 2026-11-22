import React from "react";
import type { MarketId } from "@/blackfriday/redesign/data/catalog";

const flagAssets = {
  US: "/flags/us.svg",
  CA: "/flags/ca.svg",
  AU: "/flags/au.svg",
  DE: "/flags/de.svg",
};

const nativeOptionFlags: Record<MarketId, string> = {
  US: "🇺🇸",
  CA: "🇨🇦",
  AU: "🇦🇺",
  DE: "🇩🇪",
  UK: "🇬🇧",
  AF: "🇦🇫",
};

/** Native options cannot contain images; selected flags use lightweight SVGs. */
export function marketFlagEmoji(market: MarketId) {
  return nativeOptionFlags[market];
}

/** Decorative flag: the adjacent localized label identifies the country.
 * Afghanistan uses the familiar national tricolour represented by the AF emoji. */
export function MarketFlag({
  market,
  className,
}: {
  market: MarketId;
  className?: string;
}) {
  const flagClass = className ? `market-flag ${className}` : "market-flag";
  if (market === "UK") {
    return (
      <svg
        className={flagClass}
        width={30}
        height={20}
        viewBox="0 0 60 40"
        aria-hidden="true"
        focusable="false"
      >
        <svg
          x="0"
          y="0"
          width="60"
          height="40"
          viewBox="0 0 60 40"
          overflow="hidden"
        >
          <path fill="#012169" d="M0 0h60v40H0z" />
          <path stroke="#fff" strokeWidth="8" d="m0 0 60 40M60 0 0 40" />
          <path
            stroke="#c8102e"
            strokeWidth="3"
            d="m0-1 30 20m30 22L30 21M60-1 30 19M0 41l30-20"
          />
          <path stroke="#fff" strokeWidth="13" d="M30 0v40M0 20h60" />
          <path stroke="#c8102e" strokeWidth="8" d="M30 0v40M0 20h60" />
        </svg>
      </svg>
    );
  }
  if (market === "AF") {
    return (
      <svg
        className={flagClass}
        width={30}
        height={20}
        viewBox="0 0 60 40"
        aria-hidden="true"
        focusable="false"
      >
        <path fill="#000" d="M0 0h20v40H0z" />
        <path fill="#d32030" d="M20 0h20v40H20z" />
        <path fill="#007a36" d="M40 0h20v40H40z" />
        <g
          fill="none"
          stroke="#fff"
          strokeWidth=".8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M24 29c-7-7-5-15 0-20m12 20c7-7 5-15 0-20M23 28l-3-1m2-3-3-2m3-1-3-2m3-2-2-2m17 13 3-1m-2-3 3-2m-3-1 3-2m-3-2 2-2M25 30q5 3 10 0M24 27h12M24 25h12M25 25V15h10v10M24 15h12M27 15c0-4 6-4 6 0M30 11V8m-2 1h4M28 25v-5q2-3 4 0v5M26 17v5m8-5v5M22 15l-3-3v9m19-6 3-3v9" />
          <path d="M27 6h6M26 7h8M27 33h6" />
        </g>
      </svg>
    );
  }
  return (
    <img
      className={flagClass}
      src={flagAssets[market]}
      width={30}
      height={20}
      alt=""
      aria-hidden="true"
    />
  );
}

export default MarketFlag;
