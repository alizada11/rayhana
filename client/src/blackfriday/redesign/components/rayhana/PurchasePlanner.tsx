import React, { useId } from "react";
import {
  formatCapacity,
  getMarketLabel,
  getPurchaseUrl,
  getStoreLabel,
  markets,
  type Language,
  type MarketId,
  type ProductId,
} from "@/blackfriday/redesign/data/catalog";
import {
  blackFridayCopy,
  offerTiers,
  type OfferQuantity,
} from "@/blackfriday/redesign/data/blackFriday";
import { locationCopy } from "@/blackfriday/redesign/data/locationCopy";
import { isProductUnavailable, regionalOfferCopy } from "@/blackfriday/redesign/data/regionalOffers";
import {
  getPlannerDiscount,
  getPurchasePlannerSummary,
  plannerPercent,
  plannerTemplate,
  purchasePlannerCopy,
} from "@/blackfriday/redesign/data/purchasePlannerCopy";
import { MarketSelect, type Copy as ExistingCopy } from "./BuyingDialog";

/** Existing dictionaries work unchanged; improved-page warnings can be supplied. */
export type Copy = ExistingCopy & { safety?: string };
export type PurchasePlannerProps = {
  language: Language;
  copy: Copy;
  market: MarketId | "";
  onMarketChange: (value: MarketId) => void;
  product: ProductId;
  onProductChange: (value: ProductId) => void;
  capacity: number;
  onCapacityChange: (value: number) => void;
  quantity: OfferQuantity;
  onQuantityChange: (value: OfferQuantity) => void;
  compact?: boolean;
};

export default function PurchasePlanner({
  language,
  copy,
  market,
  onMarketChange,
  product,
  onProductChange,
  capacity,
  onCapacityChange,
  quantity,
  onQuantityChange,
  compact = false,
}: PurchasePlannerProps) {
  const id = useId();
  const marketId = `rp-market-${id}`;
  const c = purchasePlannerCopy[language];
  const regional = regionalOfferCopy[language];
  const selected = markets.find(item => item.id === market);
  const unavailable = isProductUnavailable(product, market);
  // The availability guard wins even if an accidental catalogue URL is supplied.
  const url = unavailable
    ? undefined
    : getPurchaseUrl(product, market, capacity);
  const discount = getPlannerDiscount(product, market, quantity);
  const productName = product === "pot" ? copy.potName : copy.mandolineName;
  const selection = getPurchasePlannerSummary({
    language,
    market,
    product,
    productName,
    capacity,
    litres: copy.litres,
    quantity,
  });
  const enquiryUrl = `mailto:info@rayhana.com?subject=${encodeURIComponent(c.enquirySubject)}&body=${encodeURIComponent(plannerTemplate(c.enquiryBody, { summary: selection }))}`;
  const focusMarket = () => document.getElementById(marketId)?.focus();
  const ruleValues = {
    q1: formatCapacity(1, language),
    q2: formatCapacity(2, language),
    q3: formatCapacity(3, language),
    one: plannerPercent(offerTiers[0].discount, language),
    two: plannerPercent(offerTiers[1].discount, language),
    three: plannerPercent(offerTiers[2].discount, language),
    rate: discount === null ? "" : plannerPercent(discount, language),
  };
  const safety =
    copy.safety ?? (product === "pot" ? copy.potSafety : copy.mandolineSafety);

  return (
    <section
      className={`rp-planner${compact ? " rp-planner--compact" : ""}`}
      aria-label={c.plannerLabel}
      dir={language === "en" ? "ltr" : "rtl"}
    >
      <div className="rp-country">
        <MarketSelect
          id={marketId}
          language={language}
          value={market}
          onChange={onMarketChange}
          copy={copy}
        />
      </div>
      <div className="rp-choices">
        <fieldset className="rp-fieldset rp-products">
          <legend className="rp-legend">{copy.selectProduct}</legend>
          <div className="rp-radio-row">
            {(["pot", "mandoline"] as const).map(value => (
              <label
                key={value}
                className={`rp-radio${product === value ? " rp-radio--selected" : ""}`}
                style={{ minHeight: 44, minWidth: 44 }}
              >
                <input
                  className="rp-radio-input"
                  type="radio"
                  name={`${id}-product`}
                  value={value}
                  checked={product === value}
                  onChange={() => onProductChange(value)}
                />
                <span className="rp-radio-label">
                  {value === "pot" ? copy.potName : copy.mandolineName}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        {product === "pot" && (
          <fieldset className="rp-fieldset rp-capacities">
            <legend className="rp-legend">{c.capacity}</legend>
            <div className="rp-radio-row">
              {[7, 9, 12].map(value => (
                <label
                  key={value}
                  className={`rp-radio${capacity === value ? " rp-radio--selected" : ""}`}
                  style={{ minHeight: 44, minWidth: 44 }}
                >
                  <input
                    className="rp-radio-input"
                    type="radio"
                    name={`${id}-capacity`}
                    value={value}
                    checked={capacity === value}
                    onChange={() => onCapacityChange(value)}
                  />
                  <span className="rp-radio-label">
                    {formatCapacity(value, language)} {copy.litres}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
        <fieldset className="rp-fieldset rp-quantities">
          <legend className="rp-legend">{c.quantity}</legend>
          <div className="rp-radio-row">
            {offerTiers.map(({ quantity: value }) => (
              <label
                key={value}
                className={`rp-radio${quantity === value ? " rp-radio--selected" : ""}`}
                style={{ minHeight: 44, minWidth: 44 }}
              >
                <input
                  className="rp-radio-input"
                  type="radio"
                  name={`${id}-quantity`}
                  value={value}
                  checked={quantity === value}
                  onChange={() => onQuantityChange(value)}
                />
                <span className="rp-radio-label">
                  {formatCapacity(value, language)}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="rp-summary" aria-live="polite" aria-atomic="true">
        <div className="rp-summary-heading">
          <h3 className="rp-summary-title font-serif">{c.summary}</h3>
          {!unavailable && <span className="rp-preview">{c.preview}</span>}
        </div>
        <p className="rp-selected-product">{productName}</p>
        <dl className="rp-summary-list">
          {product === "pot" && (
            <div className="rp-summary-item" data-rp-field="capacity">
              <dt>{c.capacity}</dt>
              <dd>
                {formatCapacity(capacity, language)} {copy.litres}
              </dd>
            </div>
          )}
          <div className="rp-summary-item" data-rp-field="quantity">
            <dt>{c.quantity}</dt>
            <dd>{formatCapacity(quantity, language)}</dd>
          </div>
          <div className="rp-summary-item" data-rp-field="store">
            <dt>{c.store}</dt>
            <dd>
              {selected ? (
                <>
                  {getMarketLabel(market, language)}
                  <bdi className="rp-domain" dir="ltr">
                    {selected.domain}
                  </bdi>
                </>
              ) : (
                c.chooseCountry
              )}
            </dd>
          </div>
          {discount !== null && (
            <div
              className="rp-summary-item rp-summary-rate"
              data-rp-field="rate"
            >
              <dt>{c.discount}</dt>
              <dd>
                <bdi>{plannerPercent(discount, language)}</bdi>
              </dd>
            </div>
          )}
        </dl>
        {unavailable ? (
          <p className="rp-unavailable">{regional.unavailableBody}</p>
        ) : (
          <>
            {market && <p className="rp-preview-note">{c.previewNote}</p>}
            <p className="rp-dates">
              {product === "pot"
                ? blackFridayCopy[language].dates
                : c.mandolineDates}
            </p>
            {market === "AF" && product === "pot" && (
              <p className="rp-availability-note">{regional.potAvailability}</p>
            )}
          </>
        )}
      </div>

      <div className="rp-action-area">
        <p className="rp-price-note">{c.finalPrice}</p>
        {url && <p className="rp-listing-scope">{c.listingScope}</p>}
        {market && !unavailable && !url && (
          <p className="rp-missing-link">{c.missingLink}</p>
        )}
        {!market || unavailable ? (
          <button
            type="button"
            className="rp-action rp-action--primary"
            style={{ minHeight: 44 }}
            onClick={focusMarket}
          >
            {unavailable ? regional.otherMarketsAction : c.chooseCountry}
          </button>
        ) : url ? (
          <a
            className="rp-action rp-action--primary"
            style={{ minHeight: 44 }}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {plannerTemplate(c.viewProduct, {
              store: getStoreLabel(market, language),
            })}
          </a>
        ) : (
          <a
            className="rp-action rp-action--primary"
            style={{ minHeight: 44 }}
            href={enquiryUrl}
          >
            {c.contact}
          </a>
        )}
      </div>

      <details className="rp-conditions">
        <summary className="rp-conditions-toggle" style={{ minHeight: 44 }}>
          {c.conditions}
        </summary>
        <div className="rp-conditions-body">
          {market && !unavailable && (
            <>
              <p className="rp-redemption-note">
                {locationCopy[language].offerPending}
              </p>
              <p className="rp-offer-rules">
                {product === "mandoline"
                  ? c.mandolineRules
                  : plannerTemplate(
                      market === "AF" ? c.afPotRules : c.amazonPotRules,
                      ruleValues
                    )}
              </p>
            </>
          )}
          <p className="rp-seller-note">{c.sellerResponsibility}</p>
          <p className="rp-safety-note">{safety}</p>
        </div>
      </details>
      <p className="rp-support">
        {c.support} <bdi dir="ltr">info@rayhana.com</bdi>
      </p>
    </section>
  );
}
