import React, { useId } from "react";
import { ArrowRight } from "lucide-react";
import { media, type Language, type MarketId } from "@/blackfriday/redesign/data/catalog";
import {
  blackFridayCopy,
  offerStage,
  offerTemplate,
  type OfferQuantity,
} from "@/blackfriday/redesign/data/blackFriday";
import {
  getPotOfferTier,
  getPotOfferTiers,
  regionalOfferCopy,
} from "@/blackfriday/redesign/data/regionalOffers";

export type OfferTierChoicesProps = {
  language: Language;
  quantity: OfferQuantity;
  onChange: (quantity: OfferQuantity) => void;
  compact?: boolean;
  market?: MarketId | "";
};

/** Controlled native radios: each instance has its own SSR-safe group name. */
export function OfferTierChoices({
  language,
  quantity,
  onChange,
  compact = false,
  market = "",
}: OfferTierChoicesProps) {
  const groupId = useId();
  const c = blackFridayCopy[language];
  const regional = regionalOfferCopy[language];
  const afMarket = market === "AF";
  const direction = language === "en" ? "ltr" : "rtl";

  return (
    <fieldset
      className={`bf-tier-choices${compact ? " bf-tier-choices--compact" : ""}`}
      dir={direction}
      lang={language}
    >
      <legend className="bf-tier-legend">
        {c.quantity}
        {afMarket ? ` · ${regional.heroLine2}` : ""}
      </legend>
      <div className="bf-tier-grid">
        {getPotOfferTiers(market).map((tier, index) => {
          const id = `${groupId}-${tier.quantity}`;
          const photo = media.offerPots[tier.quantity];
          const selected = quantity === tier.quantity;
          const highest = !afMarket && tier.quantity === 3;
          const percent = offerTemplate(
            c.percent,
            tier.quantity,
            tier.discount,
            language
          );
          const [rate, ...description] = percent.split(" ");

          return (
            <label
              className={`bf-tier-label${highest ? " bf-tier-label--highest" : ""}`}
              htmlFor={id}
              key={tier.quantity}
            >
              <input
                className="bf-tier-input"
                type="radio"
                name={`${groupId}-quantity`}
                id={id}
                value={tier.quantity}
                checked={selected}
                onChange={() => onChange(tier.quantity)}
                aria-labelledby={`${id}-count ${id}-percent`}
                aria-describedby={`${id}-note${highest ? ` ${id}-highest` : ""}`}
              />
              <span className="bf-tier-card">
                <span className="bf-tier-top">
                  <span className="bf-tier-count" id={`${id}-count`}>
                    {offerTemplate(
                      c.count,
                      tier.quantity,
                      tier.discount,
                      language
                    )}
                  </span>
                  <span className="bf-tier-radio" aria-hidden="true" />
                </span>
                <span className="bf-tier-photo">
                  <img
                    src={photo.src}
                    width={photo.width}
                    height={photo.height}
                    alt=""
                    aria-hidden="true"
                    data-offer-quantity={tier.quantity}
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <span className="bf-tier-percent" id={`${id}-percent`}>
                  <bdi dir="ltr" className="bf-tier-rate">
                    {rate}
                  </bdi>{" "}
                  <span className="bf-tier-discount-label">
                    {description.join(" ")}
                  </span>
                </span>
                <span className="bf-tier-note" id={`${id}-note`}>
                  {c.tierNotes[index]}
                </span>
                <span className="bf-tier-bottom">
                  <span className="bf-tier-selection" aria-hidden="true">
                    {selected ? c.selected : c.select}
                  </span>
                  {highest && (
                    <span className="bf-tier-highest" id={`${id}-highest`}>
                      {c.highest}
                    </span>
                  )}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export type BlackFridayOffersProps = {
  language: Language;
  quantity: OfferQuantity;
  onQuantityChange: (quantity: OfferQuantity) => void;
  onContinue: () => void;
  market: MarketId | "";
};

export default function BlackFridayOffers({
  language,
  quantity,
  onQuantityChange,
  onContinue,
  market,
}: BlackFridayOffersProps) {
  const headingId = useId();
  const c = blackFridayCopy[language];
  const regional = regionalOfferCopy[language];
  const afMarket = market === "AF";
  const tier = getPotOfferTier(quantity, market) ?? getPotOfferTiers(market)[0];
  // Unconfirmed market configuration always yields "planned", including SSR.
  // Advertised calendar dates alone do not imply a timezone or an active offer.
  const stage = offerStage(market, Date.now());
  const stageCopy = {
    planned: c.planned,
    upcoming: c.before,
    active: c.active,
    ended: c.ended,
  }[stage];

  return (
    <section
      id="black-friday"
      className="black-friday-section"
      aria-labelledby={headingId}
      dir={language === "en" ? "ltr" : "rtl"}
      lang={language}
    >
      <div className="bf-shell">
        <div className="bf-masthead">
          <p className="bf-brand" dir="ltr" lang="en">
            {c.brand}
          </p>
          <div className="bf-calendar">
            <span className="bf-dates">
              <span className="bf-date-label">{c.dateLabel}</span>
              {c.dates}
            </span>
            <span className="bf-duration">{c.duration}</span>
          </div>
        </div>
        <div className="bf-intro">
          <div>
            <p className="bf-eyebrow">{c.eyebrow}</p>
            <h2 className="bf-title font-serif" id={headingId}>
              {afMarket ? regional.afTitle : c.title}
            </h2>
          </div>
          <div className="bf-intro-copy">
            <p className="bf-body">{afMarket ? regional.afBody : c.body}</p>
            <p className="bf-planned">{stageCopy}</p>
          </div>
        </div>
        <OfferTierChoices
          language={language}
          quantity={quantity}
          onChange={onQuantityChange}
          market={market}
        />
        <p className="bf-image-note">{c.imageNote}</p>
        <div className="bf-action-row">
          <div
            className="bf-selection-summary"
            aria-live="polite"
            aria-atomic="true"
          >
            <p className="bf-summary">
              {offerTemplate(c.summary, tier.quantity, tier.discount, language)}
            </p>
          </div>
          <button className="bf-continue" type="button" onClick={onContinue}>
            <span>
              {stage === "active"
                ? c.activeAction
                : stage === "ended"
                  ? c.endedAction
                  : c.action}
            </span>
            <ArrowRight size={19} aria-hidden="true" />
          </button>
        </div>
        <div className="bf-closing">
          <p className="bf-signature" dir="ltr" lang="en">
            {c.signature}
          </p>
        </div>
      </div>
    </section>
  );
}
