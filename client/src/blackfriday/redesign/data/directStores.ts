import {
  getMarketLabel,
  getPurchaseUrl,
  markets,
  type Language,
  type MarketId,
  type ProductId,
} from "./catalog";
import type { MarketPreference } from "./marketPreference";

// Improved-only copy and supplied routes. The approved original catalog is unchanged.
export const directStoreCopy = {
  fa: {
    title: "فروشگاه‌تان را انتخاب کنید؛ خرید را همان‌جا انجام بدهید.",
    body: "با یک کلیک، صفحهٔ محصول را در فروشگاه مقصد ببینید. رنگ، گنجایش و تعداد را در همان فروشگاه انتخاب کنید.",
    primary: "دیدن فروشگاه‌های خرید",
    mandolinePrimary: "دیدن فروشگاه‌های ماندولین",
    potAt: "دیدن دیگ در {store}",
    mandolineAt: "دیدن ماندولین در {store}",
    amazon: "آمازون‌های ریحانه",
    af: "خرید از شاپینو۲۴ افغانستان",
    recommended: "پیشنهاد برای کشور تحویل شما",
    selected: "فروشگاه انتخابی شما",
    missing: "پیوند محصول در انتظار تأیید",
    missingBody:
      "پیوند خرید این محصول در این بازار هنوز تأیید نشده است؛ این به معنی ناموجودبودن محصول نیست.",
    contact: "پرسش دربارهٔ پیوند خرید",
    unavailable: "ماندولین در افغانستان موجود نیست.",
    product: "محصول مورد نظر",
    shortPot: "دیدن دیگ",
    shortMandoline: "دیدن ماندولین",
    finalChoice:
      "انتخاب نهایی رنگ، گنجایش و تعداد در فروشگاه انجام می‌شود؛ این دکمه‌ها مدل یا تعداد را از پیش انتخاب نمی‌کنند.",
    finalTerms:
      "قیمت نهایی، موجودی، ارسال و شرایط برگشت را پیش از پرداخت در فروشگاه مقصد بررسی کنید.",
    offer:
      "آفرها اعلام‌شده‌اند؛ اعمال تخفیف و شیوهٔ استفاده را در فروشگاه بررسی کنید.",
    countryChoice: "انتخاب این مقصد",
    chooseOther: "دیدن فروشگاه‌های دیگر",
    enquiry: "پرسش دربارهٔ پیوند خرید {product} در {store}",
  },
  en: {
    title: "Choose your store. Shop directly there.",
    body: "Open the product page in one click. Choose colour, size and quantity at the destination store.",
    primary: "View buying stores",
    mandolinePrimary: "View mandoline stores",
    potAt: "View the pot on {store}",
    mandolineAt: "View the mandoline on {store}",
    amazon: "Rayhana’s Amazon markets",
    af: "Shopino24 Afghanistan",
    recommended: "Suggested for your delivery country",
    selected: "Your selected store",
    missing: "Product link awaiting verification",
    missingBody:
      "This product’s purchase link for this market has not yet been verified. That does not mean it is out of stock.",
    contact: "Ask about the purchase link",
    unavailable: "The mandoline is unavailable in Afghanistan.",
    product: "Your product",
    shortPot: "View pot",
    shortMandoline: "View mandoline",
    finalChoice:
      "Choose the final colour, size and quantity at the store. These links do not preselect a variant or quantity.",
    finalTerms:
      "Check the final price, stock, shipping and return terms at the destination store before paying.",
    offer:
      "Offers are announced; confirm applicability and redemption at the store.",
    countryChoice: "Choose this destination",
    chooseOther: "View other stores",
    enquiry: "Purchase link enquiry for {product} at {store}",
  },
  ps: {
    title: "پلورنځی وټاکئ؛ پېرود هلته مستقیم وکړئ.",
    body: "په یوه کلیک د محصول پاڼه پرانیزئ. رنګ، اندازه او شمېر په هماغه پلورنځي کې وټاکئ.",
    primary: "د پېرود پلورنځي وګورئ",
    mandolinePrimary: "د ماندولین پلورنځي وګورئ",
    potAt: "په {store} کې دېګ وګورئ",
    mandolineAt: "په {store} کې ماندولین وګورئ",
    amazon: "د ریحانې آمازون بازارونه",
    af: "د افغانستان شاپینو۲۴",
    recommended: "ستاسو د سپارلو هېواد لپاره وړاندیز",
    selected: "ستاسو ټاکلی پلورنځی",
    missing: "د محصول پیوند تایید ته په تمه دی",
    missingBody:
      "په دې بازار کې د دې محصول د پېرود پیوند لا نه دی تایید شوی؛ دا د محصول د نه‌موجودیت معنا نه لري.",
    contact: "د پېرود پیوند په اړه پوښتنه",
    unavailable: "ماندولین په افغانستان کې نشته.",
    product: "ستاسو محصول",
    shortPot: "دېګ وګورئ",
    shortMandoline: "ماندولین وګورئ",
    finalChoice:
      "وروستی رنګ، اندازه او شمېر په پلورنځي کې وټاکئ؛ دا پیوندونه ماډل یا شمېر له مخکې نه ټاکي.",
    finalTerms:
      "له تادیې مخکې په ټاکلي پلورنځي کې وروستۍ بیه، موجودي، لېږد او د بېرته ستنولو شرطونه وګورئ.",
    offer:
      "آفرونه اعلان شوي؛ د پلي کېدو او کارولو طریقه په پلورنځي کې تایید کړئ.",
    countryChoice: "دا مقصد وټاکئ",
    chooseOther: "نور پلورنځي وګورئ",
    enquiry: "په {store} کې د {product} د پېرود پیوند په اړه پوښتنه",
  },
} satisfies Record<Language, Record<string, string>>;

export function directTemplate(
  template: string,
  values: Record<string, string>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");
}

export type DirectMarketId = MarketId | "BE" | "NL" | "IT";
export type DirectMarketPreference = MarketPreference & {
  directMarket?: DirectMarketId | "";
};
export const SUPPLEMENTAL_MANUAL_MARKET_KEY = "rayhana-direct-market";
export const directMarkets: {
  id: DirectMarketId;
  country: Record<Language, string>;
  domain: string;
  marketkind: "amazon" | "shopino";
}[] = [
  ...markets,
  {
    id: "BE",
    country: { fa: "بلجیم", ps: "بلجیم", en: "Belgium" },
    domain: "amazon.com.be",
    marketkind: "amazon",
  },
  {
    id: "NL",
    country: { fa: "هلند", ps: "هالنډ", en: "Netherlands" },
    domain: "amazon.nl",
    marketkind: "amazon",
  },
  {
    id: "IT",
    country: { fa: "ایتالیا", ps: "ایټالیا", en: "Italy" },
    domain: "amazon.it",
    marketkind: "amazon",
  },
];

// Supplied by the user on 21 November 2026: two pot links in the message,
// and eight mandoline links in MandolineAmazonLinks.xlsx. Not proof of stock or discount activation.
export const suppliedDirectUrls: Partial<
  Record<ProductId, Partial<Record<DirectMarketId, string>>>
> = {
  pot: {
    DE: "https://www.amazon.de/dp/B0GDWR2TND",
    UK: "https://www.amazon.co.uk/dp/B0GDWXN2ZK",
  },
  mandoline: {
    US: "https://www.amazon.com/dp/B0HJL5XSS7",
    CA: "https://www.amazon.ca/dp/B0HJL5XSS7",
    AU: "https://www.amazon.com.au/dp/B0HJL5XSS7",
    DE: "https://www.amazon.de/dp/B0HJL5XSS7",
    UK: "https://www.amazon.co.uk/dp/B0HJL5XSS7",
    BE: "https://www.amazon.com.be/dp/B0HJL5XSS7",
    NL: "https://www.amazon.nl/dp/B0HJL5XSS7",
    IT: "https://www.amazon.it/dp/B0HJL5XSS7",
  },
};

export function isSupplementalDirectMarket(
  value: unknown
): value is "BE" | "NL" | "IT" {
  return value === "BE" || value === "NL" || value === "IT";
}
export function legacyMarketForDirectMarket(market: DirectMarketId): MarketId {
  return isSupplementalDirectMarket(market) ? "DE" : market;
}
export function getDirectDeliveryMarket(
  preference: MarketPreference,
  supplemental: DirectMarketId | "" = ""
): DirectMarketId | "" {
  if (preference.origin === "manual")
    return preference.market === "DE" &&
      isSupplementalDirectMarket(supplemental)
      ? supplemental
      : preference.market;
  const code = preference.suggestion?.countryCode;
  return preference.origin === "automatic" && isSupplementalDirectMarket(code)
    ? code
    : preference.market;
}
export function resolveDirectStoreMarket(
  product: ProductId,
  market: DirectMarketId | ""
): DirectMarketId | "" {
  return product === "pot" && isSupplementalDirectMarket(market)
    ? "DE"
    : market;
}
export function getDirectMarket(market: DirectMarketId | "") {
  return directMarkets.find(item => item.id === market);
}
export function getDirectMarketsForProduct(product: ProductId) {
  return directMarkets.filter(
    item => product === "mandoline" || !isSupplementalDirectMarket(item.id)
  );
}
export function getDirectMarketLabel(
  market: DirectMarketId | "",
  language: Language
): string {
  if (!isSupplementalDirectMarket(market))
    return getMarketLabel(market, language);
  const store = getDirectMarket(market)!;
  return language === "en"
    ? `Amazon ${store.country.en}`
    : language === "ps"
      ? `د ${store.country.ps} آمازون`
      : `آمازون ${store.country.fa}`;
}
export function isValidDirectStoreUrl(
  value: unknown,
  market: DirectMarketId
): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value),
      store = getDirectMarket(market);
    return (
      !!store &&
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.port &&
      !url.search &&
      !url.hash &&
      url.href === value &&
      [store.domain, `www.${store.domain}`].includes(url.hostname) &&
      (market === "AF"
        ? /^\/products\/[a-z0-9-]+$/.test(url.pathname)
        : /^\/dp\/[A-Z0-9]{10}$/.test(url.pathname))
    );
  } catch {
    return false;
  }
}
/** Product-family listings only: no capacity, colour, quantity or cart preselection. */
export function getDirectStoreUrl(
  product: ProductId,
  market: DirectMarketId | ""
): string | undefined {
  if (!market || (product === "mandoline" && market === "AF")) return undefined;
  const storeMarket = resolveDirectStoreMarket(
    product,
    market
  ) as DirectMarketId;
  const supplied = suppliedDirectUrls[product]?.[storeMarket];
  const existing = isSupplementalDirectMarket(storeMarket)
    ? undefined
    : getPurchaseUrl(product, storeMarket, product === "pot" ? 9 : undefined);
  const url = supplied ?? existing;
  return isValidDirectStoreUrl(url, storeMarket) ? url : undefined;
}

export function getDirectActionLabel(
  language: Language,
  product: ProductId,
  market: DirectMarketId | ""
): string {
  const c = directStoreCopy[language];
  return getDirectStoreUrl(product, market)
    ? directTemplate(product === "pot" ? c.potAt : c.mandolineAt, {
        store: getDirectMarketLabel(
          resolveDirectStoreMarket(product, market),
          language
        ),
      })
    : product === "pot"
      ? c.primary
      : market === "AF"
        ? c.chooseOther
        : c.mandolinePrimary;
}
