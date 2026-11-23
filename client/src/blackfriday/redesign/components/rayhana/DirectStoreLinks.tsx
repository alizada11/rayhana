import React, { useId, useRef } from "react";
import { ArrowUpRight, Check, Globe2 } from "lucide-react";
import { type Language, type ProductId } from "@/blackfriday/redesign/data/catalog";
import {
  displayDetectedCountry,
  formatLocationTemplate,
} from "@/blackfriday/redesign/data/locationCopy";
import { regionalOfferCopy } from "@/blackfriday/redesign/data/regionalOffers";
import {
  directMarkets,
  getDirectMarket,
  getDirectMarketLabel,
  getDirectMarketsForProduct,
  resolveDirectStoreMarket,
  type DirectMarketId,
  type DirectMarketPreference,
  directStoreCopy,
  directTemplate,
  getDirectActionLabel,
  getDirectStoreUrl,
} from "@/blackfriday/redesign/data/directStores";
import type { Copy } from "./BuyingDialog";
import DirectMarketFlag from "./DirectMarketFlag";

export default function DirectStoreLinks({
  language,
  copy,
  preference,
  product,
  onProductChange,
  onMarketChange,
}: {
  language: Language;
  copy: Copy;
  preference: DirectMarketPreference;
  product: ProductId;
  onProductChange: (product: ProductId) => void;
  onMarketChange: (market: DirectMarketId) => void;
}) {
  const id = useId();
  const featuredHeading = useRef<HTMLDivElement>(null);
  const guidanceId = `ds-guidance-${id}`;
  const c = directStoreCopy[language];
  const markets = getDirectMarketsForProduct(product);
  const selected = getDirectMarket(
    resolveDirectStoreMarket(
      product,
      preference.directMarket ?? preference.market
    )
  );
  const productName = product === "pot" ? copy.potName : copy.mandolineName;
  const detected = displayDetectedCountry(preference.suggestion, language);
  const automatic = preference.origin === "automatic";
  const countryNote = selected
    ? automatic
      ? preference.suggestion?.source === "timezone"
        ? location.timezone
        : location.approximate
      : location.manual
    : preference.loading
      ? location.checking
      : preference.suggestion?.countryCode
        ? location.outside
        : location.unknownBody;

  function contactUrl(market: DirectMarketId) {
    const subject = directTemplate(c.enquiry, {
      product: productName,
      store: getDirectMarketLabel(market, language),
    });
    return `mailto:info@rayhana.com?subject=${encodeURIComponent(subject)}`;
  }
  function choosePendingMarket(market: DirectMarketId) {
    onMarketChange(market);
    requestAnimationFrame(() => featuredHeading.current?.focus());
  }
  function renderDestination(market: DirectMarketId, featured = false) {
    const url = getDirectStoreUrl(product, market);
    const unavailable = product === "mandoline" && market === "AF";
    const store = getDirectMarket(market)!;
    const name = getDirectMarketLabel(market, language);
    const identity = (
      <>
        <DirectMarketFlag market={market} />
        <span className="ds-store-identity">
          <strong>{name}</strong>
          <small dir="ltr">{store.domain}</small>
        </span>
      </>
    );
    if (!featured) {
      return url ? (
        <a
          key={market}
          className="ds-store-row"
          data-market={market}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onMarketChange(market)}
          aria-describedby={guidanceId}
          aria-label={getDirectActionLabel(language, product, market)}
        >
          {identity}
          <span className="ds-store-row-action">
            {product === "pot" ? c.shortPot : c.shortMandoline}
            <ArrowUpRight size={18} aria-hidden="true" />
          </span>
        </a>
      ) : (
        <button
          key={market}
          type="button"
          className="ds-store-row ds-store-row--pending"
          data-market={market}
          onClick={() => choosePendingMarket(market)}
          aria-label={`${name} · ${unavailable ? c.unavailable : c.missing} · ${c.countryChoice}`}
        >
          {identity}
          <span className="ds-store-row-action">
            {unavailable ? c.unavailable : c.missing}
          </span>
        </button>
      );
    }
    return (
      <article
        className={`ds-featured${market === "AF" ? " ds-shopino" : ""}`}
        data-market={market}
        data-product={product}
      >
        <div
          className="ds-featured-heading"
          ref={featuredHeading}
          tabIndex={-1}
        >
          <span>{automatic ? c.recommended : c.selected}</span>
          <Check size={17} aria-hidden="true" />
        </div>
        <div className="ds-featured-identity">{identity}</div>
        {url ? (
          <a
            className="button primary ds-primary"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onMarketChange(preference.directMarket || market)}
            aria-describedby={guidanceId}
          >
            {getDirectActionLabel(language, product, market)}
            <ArrowUpRight size={20} aria-hidden="true" />
          </a>
        ) : unavailable ? (
          <p className="ds-unavailable">{c.unavailable}</p>
        ) : (
          <>
            <p className="ds-missing">{c.missingBody}</p>
            <a className="ds-contact" href={contactUrl(market)}>
              {c.contact}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </>
        )}
        {market === "AF" && product === "pot" && (
          <div className="ds-af-availability">
            <p className="ds-af-offer">
              <strong>{regionalOfferCopy[language].heroLine2}</strong>
            </p>
          </div>
        )}
      </article>
    );
  }

  return (
    <div className="ds-panel" data-product={product}>
      <div className="ds-products" role="group" aria-label={c.product}>
        {(["pot", "mandoline"] as const).map(value => (
          <button
            key={value}
            type="button"
            aria-pressed={product === value}
            className={product === value ? "is-active" : ""}
            onClick={() => onProductChange(value)}
          >
            {value === "pot" ? copy.potName : copy.mandolineName}
          </button>
        ))}
      </div>
      <div
        className="ds-location"
        aria-busy={preference.loading}
        aria-live="polite"
      >
        <Globe2 size={16} aria-hidden="true" />
        <div>
          <p>{countryNote}</p>
          {automatic &&
            selected?.id === "DE" &&
            preference.suggestion?.regional && (
              <p>
                {detected &&
                  `${formatLocationTemplate(location.from, detected)}. `}
                {location.regional}
              </p>
            )}
        </div>
      </div>
      {selected && renderDestination(selected.id, true)}
      <div className="ds-other-stores">
        <h3 className="font-serif">{c.amazon}</h3>
        <div className="ds-store-list">
          {directMarkets
            .filter(
              item => item.marketkind === "amazon" && item.id !== selected?.id
            )
            .map(item => renderDestination(item.id))}
        </div>
      </div>
      {selected?.id !== "AF" && (
        <div className="ds-af-section">
          <h3 className="font-serif">{c.af}</h3>
          {renderDestination("AF")}
          {product === "pot" && (
            <div className="ds-af-availability">
              <p className="ds-af-offer">
                <strong>{regionalOfferCopy[language].heroLine2}</strong>
              </p>
            </div>
          )}
        </div>
      )}
      <div className="ds-guidance" id={guidanceId}>
        <p>{c.finalChoice}</p>
        <p>{c.finalTerms}</p>
        <p>{c.offer}</p>
      </div>
    </div>
  );
}
