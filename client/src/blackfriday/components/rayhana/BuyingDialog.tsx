import React, { useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowUpRight,
  Check,
  Globe2,
  Mail,
  PackageCheck,
  X,
} from "lucide-react";
import {
  formatCapacity,
  getPurchaseUrl,
  Language,
  MarketId,
  markets,
  media,
  ProductId,
  translatedAlt,
} from "@/blackfriday/data/catalog";
import en from "@/blackfriday/data/en.json";
import type { MarketPreference } from "@/blackfriday/data/marketPreference";
import { formatLocationTemplate, locationCopy } from "@/blackfriday/data/locationCopy";
import MarketRecommendation from "./MarketRecommendation";
import MarketFlag, { marketFlagEmoji } from "./MarketFlag";
import {
  blackFridayCopy,
  getOfferTier,
  offerTemplate,
  type OfferQuantity,
} from "@/blackfriday/data/blackFriday";
import { OfferTierChoices } from "./BlackFridayOffers";

export type Copy = typeof en;

export function MarketSelect({
  language,
  value,
  onChange,
  copy,
  id = "market",
}: {
  language: Language;
  value: MarketId | "";
  onChange: (value: MarketId) => void;
  copy: Copy;
  id?: string;
}) {
  return (
    <div className="market-field">
      <label htmlFor={id}>{copy.destination}</label>
      <div className="select-wrap">
        {value ? (
          <MarketFlag market={value} />
        ) : (
          <Globe2 size={18} aria-hidden="true" />
        )}
        <select
          id={id}
          value={value}
          onChange={e => onChange(e.target.value as MarketId)}
        >
          <option value="" disabled>
            {copy.chooseCountry}
          </option>
          {markets.map(m => (
            <option key={m.id} value={m.id}>
              {marketFlagEmoji(m.id)} {copy.marketAmazon} {m.country[language]}{" "}
              · {m.domain}
            </option>
          ))}
        </select>
        <span className="select-chevron" aria-hidden="true">
          ⌄
        </span>
      </div>
    </div>
  );
}

export default function BuyingDialog({
  open,
  onOpenChange,
  language,
  copy,
  market,
  onMarketChange,
  preference,
  product,
  onProductChange,
  capacity,
  onCapacityChange,
  quantity,
  onQuantityChange,
  portalContainer,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  language: Language;
  copy: Copy;
  market: MarketId | "";
  onMarketChange: (value: MarketId) => void;
  preference?: MarketPreference;
  product: ProductId;
  onProductChange: (value: ProductId) => void;
  capacity: number;
  onCapacityChange: (value: number) => void;
  quantity: OfferQuantity;
  onQuantityChange: (value: OfferQuantity) => void;
  portalContainer?: HTMLElement | null;
}) {
  const returnFocus = useRef<HTMLElement | null>(null);
  const selected = markets.find(m => m.id === market);
  const url = getPurchaseUrl(product, market, capacity);
  const productName = product === "pot" ? copy.potName : copy.mandolineName;
  const offer = blackFridayCopy[language];
  const tier = getOfferTier(quantity)!;
  const subject = encodeURIComponent(
    `Rayhana buying enquiry — ${product} — ${market || "market not selected"}`
  );
  const body = encodeURIComponent(
    `Hello Rayhana,\nPlease share the confirmed product link, price and delivery information for:\nProduct: ${productName}\nCapacity: ${product === "pot" ? `${capacity} L` : "not applicable"}\nQuantity: ${product === "pot" ? quantity : "not applicable"}\nPlanned offer: ${product === "pot" ? `${tier.discount}% for ${quantity} pots; please confirm redemption steps and timing` : "not applicable"}\nMarketplace: ${selected?.domain || "not selected"}\nPreferred language: ${language}\nThank you.`
  );
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal container={portalContainer ?? undefined}>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content
          className="buy-dialog"
          dir={language === "en" ? "ltr" : "rtl"}
          onOpenAutoFocus={() => {
            returnFocus.current = document.activeElement as HTMLElement;
          }}
          onCloseAutoFocus={event => {
            event.preventDefault();
            returnFocus.current?.focus();
          }}
        >
          <Dialog.Close className="dialog-close" aria-label={copy.close}>
            <X size={20} />
          </Dialog.Close>
          <span className="eyebrow">{copy.campaign}</span>
          <Dialog.Title>{copy.purchaseTitle}</Dialog.Title>
          <Dialog.Description className="dialog-intro">
            {copy.purchaseBody}
          </Dialog.Description>
          {preference && (
            <MarketRecommendation
              language={language}
              preference={preference}
              compact
              onChange={() => document.getElementById("dialog-market")?.focus()}
            />
          )}
          <div
            className="product-choice"
            role="group"
            aria-label={copy.selectProduct}
          >
            {(["pot", "mandoline"] as const).map(p => (
              <button
                key={p}
                className={product === p ? "selected" : ""}
                aria-pressed={product === p}
                onClick={() => onProductChange(p)}
              >
                {p === "pot" ? copy.potName : copy.mandolineName}
                {product === p && <Check size={17} aria-hidden="true" />}
              </button>
            ))}
          </div>
          {product === "mandoline" && (
            <figure className="dialog-product-preview">
              <img
                src={media.mandoline}
                alt={translatedAlt[language].mandoline[0]}
                width="1500"
                height="1000"
                loading="lazy"
                decoding="async"
              />
            </figure>
          )}
          {product === "pot" && (
            <div className="dialog-capacity">
              <span>{copy.capacity}</span>
              <div className="size-buttons">
                {[7, 9, 12].map(size => (
                  <button
                    key={size}
                    aria-pressed={capacity === size}
                    className={capacity === size ? "active" : ""}
                    onClick={() => onCapacityChange(size)}
                  >
                    {formatCapacity(size, language)} {copy.litres}
                  </button>
                ))}
              </div>
              <p className="microcopy">{copy.capacityHint}</p>
            </div>
          )}
          {product === "pot" && (
            <div className="dialog-offer-plan">
              <OfferTierChoices
                language={language}
                quantity={quantity}
                onChange={onQuantityChange}
                compact
              />
              <p className="dialog-offer-summary">
                {offerTemplate(
                  offer.summary,
                  quantity,
                  tier.discount,
                  language
                )}
              </p>
              <p className="microcopy">{offer.dates}</p>
              <p className="microcopy">{offer.notApplied}</p>
              <p className="microcopy">{offer.notCart}</p>
            </div>
          )}
          <MarketSelect
            language={language}
            value={market}
            onChange={onMarketChange}
            copy={copy}
            id="dialog-market"
          />
          <p className="microcopy">{copy.marketNote}</p>
          {!market ? (
            <div className="purchase-state">
              <Globe2 size={22} />
              <p>{copy.noCountry}</p>
            </div>
          ) : url ? (
            <div className="purchase-state confirmed">
              <PackageCheck size={23} />
              <p>{copy.sellerNote}</p>
            </div>
          ) : (
            <div className="purchase-state">
              <PackageCheck size={23} />
              <div>
                <strong>{copy.purchasePendingTitle}</strong>
                <p>{copy.purchasePendingBody}</p>
              </div>
            </div>
          )}
          {url && (
            <p className="microcopy listing-scope-note">
              {copy.listingScopeNote}
              {product === "pot" && <> {offer.ordinaryListing}</>}
            </p>
          )}
          {url ? (
            <a
              className="button primary dialog-action"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {product === "pot"
                ? offer.sellerAction
                : selected
                  ? formatLocationTemplate(
                      locationCopy[language].amazon,
                      selected.country[language]
                    )
                  : copy.continueAmazon}
              <ArrowUpRight size={18} />
            </a>
          ) : (
            <a
              className="button primary dialog-action"
              href={`mailto:info@rayhana.com?subject=${subject}&body=${body}`}
            >
              {product === "pot" ? offer.pendingAction : copy.supportAction}
              <Mail size={18} />
            </a>
          )}
          <span className="dialog-support" dir="ltr">
            info@rayhana.com
          </span>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
