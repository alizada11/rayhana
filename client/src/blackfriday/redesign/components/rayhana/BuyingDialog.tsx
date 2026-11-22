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
  getMarketLabel,
  getPurchaseUrl,
  Language,
  MarketId,
  markets,
  ProductId,
} from "@/blackfriday/redesign/data/catalog";
import en from "@/blackfriday/redesign/data/en.json";
import type { MarketPreference } from "@/blackfriday/redesign/data/marketPreference";
import { formatMarketTemplate, locationCopy } from "@/blackfriday/redesign/data/locationCopy";
import MarketRecommendation from "./MarketRecommendation";
import MarketFlag, { marketFlagEmoji } from "./MarketFlag";
import {
  blackFridayCopy,
  offerTemplate,
  type OfferQuantity,
} from "@/blackfriday/redesign/data/blackFriday";
import {
  getMandolineOfferDiscount,
  getPotOfferTier,
  isProductUnavailable,
  regionalOfferCopy,
} from "@/blackfriday/redesign/data/regionalOffers";
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
              {marketFlagEmoji(m.id)} {getMarketLabel(m.id, language)} ·{" "}
              {m.domain}
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
}) {
  const returnFocus = useRef<HTMLElement | null>(null);
  const selected = markets.find(m => m.id === market);
  const unavailable = isProductUnavailable(product, market);
  // Availability wins even if a catalogue listing is accidentally supplied.
  const url = unavailable
    ? undefined
    : getPurchaseUrl(product, market, capacity);
  const productName = product === "pot" ? copy.potName : copy.mandolineName;
  const offer = blackFridayCopy[language];
  const regional = regionalOfferCopy[language];
  const storeCopy = locationCopy[language];
  const storeText = (template: string) =>
    formatMarketTemplate(template, market, language);
  const tier = getPotOfferTier(quantity, market)!;
  const mandolineDiscount = getMandolineOfferDiscount(market);
  const focusMarket = () => document.getElementById("dialog-market")?.focus();
  const subject = encodeURIComponent(
    `Rayhana buying enquiry — ${product} — ${market || "market not selected"}`
  );
  const enquiry = unavailable
    ? "The Mandoline Slicer is unavailable in Afghanistan. Please share information about other delivery markets; I will check product availability with the selected store."
    : `Please share the confirmed product link, price and delivery information.\nAnnounced offer: ${product === "pot" ? `${tier.discount}% for ${quantity} pots${market === "AF" ? " (flat 15% for 1, 2 or 3 eligible pots; the green pot is unavailable in Afghanistan)" : ""}` : `${mandolineDiscount}% for the mandoline (independent of pot quantity)`}; please confirm redemption steps and exact timing.`;
  const body = encodeURIComponent(
    `Hello Rayhana,\n${enquiry}\nProduct: ${productName}\nCapacity: ${product === "pot" ? `${capacity} L` : "not applicable"}\nQuantity: ${product === "pot" ? quantity : "not applicable"}\nMarketplace: ${selected ? getMarketLabel(selected.id, language) + " — " + selected.domain : "not selected"}\nPreferred language: ${language}\nThank you.`
  );
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
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
          <Dialog.Title className="font-serif">{copy.purchaseTitle}</Dialog.Title>
          <Dialog.Description className="dialog-intro">
            {unavailable ? regional.unavailableBody : copy.purchaseBody}
          </Dialog.Description>
          {preference && !unavailable && (
            <MarketRecommendation
              language={language}
              preference={preference}
              product={product}
              compact
              onChange={focusMarket}
            />
          )}
          {preference && unavailable && (
            <div
              className="market-recommendation is-compact"
              aria-busy={preference.loading}
            >
              <div className="recommendation-top">
                <MarketFlag market="AF" />
                <div aria-live="polite" aria-atomic="true">
                  <span className="recommendation-caption">
                    {preference.origin === "automatic"
                      ? storeCopy.suggested
                      : storeCopy.chosen}
                  </span>
                  <strong>
                    {getMarketLabel("AF", language)}
                    <small dir="ltr">{selected?.domain}</small>
                  </strong>
                </div>
                <button
                  type="button"
                  className="recommendation-change"
                  onClick={focusMarket}
                >
                  {storeCopy.change}
                </button>
              </div>
            </div>
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
                market={market}
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
              {market === "AF" && (
                <>
                  <p className="microcopy">{regional.afBody}</p>
                  <p className="microcopy">{regional.potAvailability}</p>
                </>
              )}
              <p className="microcopy">{offer.dates}</p>
              <p className="microcopy">{storeCopy.offerPending}</p>
              <p className="microcopy">{storeText(storeCopy.notCart)}</p>
            </div>
          )}
          {product === "mandoline" && mandolineDiscount !== null && (
            <div className="dialog-offer-plan">
              <p className="dialog-offer-summary">
                {offerTemplate(
                  storeCopy.mandolineOfferSummary,
                  1,
                  mandolineDiscount,
                  language
                )}
              </p>
              <p className="microcopy">{storeCopy.offerPending}</p>
              <p className="microcopy">{storeText(storeCopy.notCart)}</p>
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
          ) : unavailable ? (
            <div className="purchase-state unavailable" role="status">
              <PackageCheck size={23} aria-hidden="true" />
              <div>
                <strong>{regional.unavailableTitle}</strong>
                <p>{regional.unavailableBody}</p>
              </div>
            </div>
          ) : url ? (
            <div className="purchase-state confirmed">
              <PackageCheck size={23} />
              <p>{storeText(storeCopy.sellerNote)}</p>
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
              {storeText(
                product === "pot"
                  ? storeCopy.potListingScope
                  : storeCopy.mandolineListingScope
              )}{" "}
              {offer.ordinaryListing}
            </p>
          )}
          {unavailable ? (
            <button
              type="button"
              className="button primary dialog-action"
              onClick={focusMarket}
            >
              {regional.otherMarketsAction}
              <Globe2 size={18} aria-hidden="true" />
            </button>
          ) : url ? (
            <a
              className="button primary dialog-action"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {storeText(storeCopy.regularAction)}
              <ArrowUpRight size={18} />
            </a>
          ) : (
            <a
              className="button primary dialog-action"
              href={`mailto:info@rayhana.com?subject=${subject}&body=${body}`}
            >
              {storeCopy.contactAction}
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
