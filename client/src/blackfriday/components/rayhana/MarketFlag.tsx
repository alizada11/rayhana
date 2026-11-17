import React from "react";
import type { MarketId } from "@/blackfriday/data/catalog";

type FlagId = MarketId;

/** Drawn as SVG so flags render consistently across Windows, macOS and Linux. */
export function marketFlagEmoji(market: MarketId) {
  const codes: Record<MarketId, string> = {
    US: "US",
    CA: "CA",
    AU: "AU",
    DE: "DE",
    UK: "UK",
    AF: "AF",
  };
  return codes[market];
}

export function MarketFlag({
  market,
  className,
}: {
  market: FlagId;
  className?: string;
}) {
  const classes = className ? `market-flag ${className}` : "market-flag";

  return (
    <svg
      className={classes}
      viewBox="0 0 36 24"
      role="img"
      aria-label={`${market} flag`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {market === "US" && (
        <>
          <rect width="36" height="24" fill="#fff" />
          {[0, 4, 8, 12, 16, 20].map(y => (
            <rect key={y} y={y} width="36" height="2" fill="#c92736" />
          ))}
          <rect width="16" height="13" fill="#23406f" />
          {[3, 7, 11].map(x =>
            [3, 7, 11].map(y => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="0.7" fill="#fff" />
            ))
          )}
        </>
      )}
      {market === "CA" && (
        <>
          <rect width="36" height="24" fill="#fff" />
          <rect width="8" height="24" fill="#d62839" />
          <rect x="28" width="8" height="24" fill="#d62839" />
          <path d="m18 4 1.5 3.2 2.4-1.4-.8 3 2.4 1-.9 1.6 1.3 2.5-4.1-.5-.4 5.1h-.8l-.4-5.1-4.1.5 1.3-2.5-.9-1.6 2.4-1-.8-3 2.4 1.4z" fill="#d62839" />
        </>
      )}
      {market === "AU" && (
        <>
          <rect width="36" height="24" fill="#173568" />
          <FlagUnionJack x={0} y={0} width={16} height={12} />
          <circle cx="26" cy="6" r="1" fill="#fff" />
          <circle cx="31" cy="12" r="1" fill="#fff" />
          <circle cx="25" cy="17" r="1" fill="#fff" />
          <circle cx="19" cy="19" r=".8" fill="#fff" />
        </>
      )}
      {market === "DE" && (
        <>
          <rect width="36" height="8" fill="#171717" />
          <rect y="8" width="36" height="8" fill="#d32932" />
          <rect y="16" width="36" height="8" fill="#f3c844" />
        </>
      )}
      {market === "UK" && <FlagUnionJack x={0} y={0} width={36} height={24} />}
      {market === "AF" && (
        <>
          <rect width="12" height="24" fill="#171717" />
          <rect x="12" width="12" height="24" fill="#c92736" />
          <rect x="24" width="12" height="24" fill="#16804a" />
          <circle cx="18" cy="12" r="3.2" fill="none" stroke="#fff" strokeWidth=".7" />
          <path d="M16 13h4m-3.5-2h3m-2.5-2v6" stroke="#fff" strokeWidth=".6" />
        </>
      )}
      <rect x=".35" y=".35" width="35.3" height="23.3" rx="1.5" fill="none" stroke="#17202c" strokeOpacity=".14" strokeWidth=".7" />
    </svg>
  );
}

function FlagUnionJack({
  x,
  y,
  width,
  height,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={width} height={height} fill="#173568" />
      <path d={`M0 0L${width} ${height}M${width} 0L0 ${height}`} stroke="#fff" strokeWidth={height * 0.25} />
      <path d={`M0 0L${width} ${height}M${width} 0L0 ${height}`} stroke="#c92736" strokeWidth={height * 0.1} />
      <path d={`M${width / 2} 0V${height}M0 ${height / 2}H${width}`} stroke="#fff" strokeWidth={height * 0.38} />
      <path d={`M${width / 2} 0V${height}M0 ${height / 2}H${width}`} stroke="#c92736" strokeWidth={height * 0.19} />
    </g>
  );
}

export default MarketFlag;
