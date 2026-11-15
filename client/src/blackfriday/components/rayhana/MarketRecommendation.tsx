import React from "react";
import { Globe2 } from "lucide-react";
import { getPurchaseUrl, markets, type Language } from "@/blackfriday/data/catalog";
import type { MarketPreference } from "@/blackfriday/data/marketPreference";
import {
  displayDetectedCountry,
  formatLocationTemplate,
  locationCopy,
} from "@/blackfriday/data/locationCopy";
import MarketFlag from "./MarketFlag";

export default function MarketRecommendation({
  language,
  preference,
  onChange,
  compact = false,
}: {
  language: Language;
  preference: MarketPreference;
  onChange: () => void;
  compact?: boolean;
}) {
  const c = locationCopy[language];
  const selected = markets.find(m => m.id === preference.market);
  const suggested = preference.origin === "automatic";
  const detected = displayDetectedCountry(preference.suggestion, language);
  const ready = !!selected && !!getPurchaseUrl("pot", selected.id, 9);
  return (
    <div
      className={`market-recommendation ${compact ? "is-compact" : ""}`}
      aria-busy={preference.loading}
    >
      <div className="recommendation-top">
        {selected ? (
          <MarketFlag market={selected.id} />
        ) : (
          <Globe2 size={17} aria-hidden="true" />
        )}
        <div aria-live="polite" aria-atomic="true">
          <span className="recommendation-caption">
            {selected
              ? suggested
                ? c.suggested
                : c.chosen
              : preference.loading
                ? c.checking
                : c.unknown}
          </span>
          {selected && (
            <strong>
              {formatLocationTemplate(c.amazon, selected.country[language])}
              <small dir="ltr">{selected.domain}</small>
            </strong>
          )}
        </div>
        <button
          type="button"
          className="recommendation-change"
          onClick={onChange}
        >
          {selected ? c.change : c.choose}
        </button>
      </div>
      {!preference.loading && (
        <p className="recommendation-note">
          {selected
            ? suggested
              ? preference.suggestion?.source === "timezone"
                ? c.timezone
                : c.approximate
              : c.manual
            : preference.suggestion?.countryCode
              ? c.outside
              : c.unknownBody}
        </p>
      )}
      {suggested && preference.suggestion?.regional && (
        <p className="recommendation-note">
          {detected && (
            <span>{formatLocationTemplate(c.from, detected)}. </span>
          )}
          {c.regional}
        </p>
      )}
      {selected && !ready && (
        <p className="recommendation-pending">{c.pending}</p>
      )}
      {!compact && <p className="recommendation-privacy">{c.privacy}</p>}
    </div>
  );
}
