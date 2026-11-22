import React from "react";
import { ArrowUpRight, Check } from "lucide-react";
import type { Copy } from "./BuyingDialog";
import { type Language, type MarketId, media } from "@/blackfriday/redesign/data/catalog";
import {
  getPotOfferTiers,
  getMandolineOfferDiscount,
  regionalOfferCopy,
} from "@/blackfriday/redesign/data/regionalOffers";
import {
  blackFridayCopy,
  offerTemplate,
  type OfferQuantity,
} from "@/blackfriday/redesign/data/blackFriday";

export default function CampaignHeroOffers({
  language,
  copy,
  quantity,
  onQuantityChange,
  market = "",
}: {
  language: Language;
  copy: Copy;
  quantity: OfferQuantity;
  onQuantityChange: (quantity: OfferQuantity) => void;
  market?: MarketId | "";
}) {
  const offer = blackFridayCopy[language];
  const regional = regionalOfferCopy[language];
  const mandolineDiscount = getMandolineOfferDiscount(market);

  return (
    <div className="hero-offer-display">
      <div className="hero-pot-tiers" role="group" aria-label={offer.quantity}>
        {getPotOfferTiers(market).map(tier => {
          const photo = media.offerPots[tier.quantity];
          const selected = tier.quantity === quantity;
          const count = offerTemplate(
            offer.count,
            tier.quantity,
            tier.discount,
            language
          );
          const discount = offerTemplate(
            offer.percent,
            tier.quantity,
            tier.discount,
            language
          );

          return (
            <button
              key={tier.quantity}
              type="button"
              aria-pressed={selected}
              aria-label={`${count} · ${discount} · ${selected ? offer.selected : offer.select}`}
              onClick={() => onQuantityChange(tier.quantity)}
              className={`hero-tier ${tier.quantity === 3 && market !== "AF" ? "highest-tier" : ""} ${selected ? "is-selected" : ""}`}
            >
              <span className="hero-tier-check" aria-hidden="true">
                {selected && <Check size={12} />}
              </span>
              <img
                src={photo.src}
                width={photo.width}
                height={photo.height}
                alt=""
                decoding="async"
              />
              <span className="hero-tier-count">{count}</span>
              <strong>{discount}</strong>
              <span className="hero-tier-purpose">
                {offer.tierNotes[tier.quantity - 1]}
              </span>
            </button>
          );
        })}
      </div>
      <a
        className={`hero-mandoline-offer${mandolineDiscount === null ? " is-unavailable" : ""}`}
        href="#mandoline"
      >
        <img
          className="hero-mandoline-backdrop"
          src={media.mandolineFoodScene}
          alt=""
          aria-hidden="true"
          width="1200"
          height="670"
          decoding="async"
        />
        <div className="hero-mandoline-offer-copy">
          <span className="hero-mandoline-new">
            {copy.heroMandolineNewLabel}
          </span>
          <span className="hero-mandoline-label">
            {copy.heroMandolineOfferLabel}
          </span>
          <strong>
            {mandolineDiscount === null
              ? regional.unavailableTitle
              : offerTemplate(offer.percent, 1, mandolineDiscount, language)}
          </strong>
          <span className="hero-mandoline-link">
            {mandolineDiscount === null
              ? regional.otherMarketsAction
              : copy.heroSecondary}
            <ArrowUpRight size={16} aria-hidden="true" />
          </span>
        </div>
        <div className="hero-mandoline-visual">
          <img
            className="hero-mandoline-product"
            src={media.mandolineHero}
            alt=""
            width="1400"
            height="843"
            decoding="async"
          />
        </div>
      </a>
      <div className="hero-offer-footer">
        <p className="hero-offer-scope">{copy.heroOfferScope}</p>
        <span className="hero-footer-rule" aria-hidden="true" />
        <span className="hero-footer-signature" lang="en" dir="ltr">
          ROOTS IN MODERN LIFE
        </span>
      </div>
    </div>
  );
}
