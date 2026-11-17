export type Language = "fa" | "ps" | "en";
export type ProductId = "pot" | "mandoline";
export type MarketId = "US" | "CA" | "AU" | "DE" | "UK" | "AF";

export const languages: {
  id: Language;
  label: string;
  direction: "rtl" | "ltr";
}[] = [
  { id: "fa", label: "دری", direction: "rtl" },
  { id: "ps", label: "پښتو", direction: "rtl" },
  { id: "en", label: "English", direction: "ltr" },
];

export const markets: {
  id: MarketId;
  country: Record<Language, string>;
  domain: string;
  currency: string;
  mark: string;
  retailer: "amazon" | "shopino24";
}[] = [
  {
    id: "US",
    country: { fa: "آمریکا", ps: "امریکا", en: "United States" },
    domain: "amazon.com",
    currency: "USD",
    mark: "US",
    retailer: "amazon",
  },
  {
    id: "CA",
    country: { fa: "کانادا", ps: "کاناډا", en: "Canada" },
    domain: "amazon.ca",
    currency: "CAD",
    mark: "CA",
    retailer: "amazon",
  },
  {
    id: "AU",
    country: { fa: "استرالیا", ps: "استرالیا", en: "Australia" },
    domain: "amazon.com.au",
    currency: "AUD",
    mark: "AU",
    retailer: "amazon",
  },
  {
    id: "DE",
    country: { fa: "جرمنی", ps: "جرمني", en: "Germany" },
    domain: "amazon.de",
    currency: "EUR",
    mark: "DE",
    retailer: "amazon",
  },
  {
    id: "UK",
    country: { fa: "بریتانیا", ps: "بریتانیا", en: "United Kingdom" },
    domain: "amazon.co.uk",
    currency: "GBP",
    mark: "UK",
    retailer: "amazon",
  },
  {
    id: "AF",
    country: { fa: "افغانستان", ps: "افغانستان", en: "Afghanistan" },
    domain: "shopino24.com",
    currency: "USD",
    mark: "AF",
    retailer: "shopino24",
  },
];

/** Published by the official Rayhana catalogue. These are product-family links,
 * not preselected capacities, approved offers or evidence of current stock.
 * Unknown is intentionally different from out of stock. */
export type Listing = { url: string; verified: boolean; source?: string };
export const listings: Partial<
  Record<ProductId, Partial<Record<MarketId, Listing>>>
> = {
  pot: {
    US: {
      url: "https://www.amazon.com/dp/B0GDWXN2ZK",
      verified: true,
      source: "https://rayhana.com/api/products",
    },
    CA: {
      url: "https://www.amazon.ca/dp/B0GDWM1PZV",
      verified: true,
      source: "https://rayhana.com/api/products",
    },
    AU: {
      url: "https://www.amazon.com.au/dp/B0GDWR2TND",
      verified: true,
      source: "https://rayhana.com/api/products",
    },
    DE: {
      url: "https://www.amazon.de/dp/B0GDWR2TND",
      verified: true,
    },
    UK: {
      url: "https://www.amazon.co.uk/dp/B0GDWXN2ZK",
      verified: true,
    },
    AF: {
      url: "https://shopino24.com/products/dyg-kably-ryhanh",
      verified: true,
    },
  },
};

export function getPurchaseUrl(
  product: ProductId,
  market: MarketId | "",
  capacity?: number
): string | undefined {
  if (!market) return undefined;
  const item = listings[product]?.[market];
  const expected = markets.find(m => m.id === market)?.domain;
  if (!item?.verified || !expected || (product === "pot" && !capacity))
    return undefined;
  try {
    const url = new URL(item.url);
    return url.protocol === "https:" &&
      (url.hostname === expected || url.hostname === `www.${expected}`)
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

export const media = {
  logo: "/images/logo.png",
  potHero: "/images/rayhana-pot-cutout.webp",
  potDetail: "/images/rayhana-pot-cutout.webp",
  offerPots: {
    1: {
      src: "/images/black-friday-pot-single-cutout.webp",
      width: 1850,
      height: 1275,
    },
    2: {
      src: "/images/black-friday-pots-pair-cutout.webp",
      width: 1983,
      height: 909,
    },
    3: {
      src: "/images/black-friday-pots-trio-cutout.webp",
      width: 2020,
      height: 691,
    },
  },
  potStory: "/images/rayhana-memory-table.png",
  mandoline: "/images/mandoline-product.jpg",
  mandolineGallery: [
    "/images/mandoline-product.jpg",
    "/images/mandoline-prep.jpg",
    "/images/mandoline-thickness.jpg",
    "/images/mandoline-use.jpg",
  ],
  demo: "/videos/mandoline-demo.mp4",
  demoPoster: "/images/mandoline-product.jpg",
  potDemo: "/videos/Videos2026-11-03_110720_071.mp4",
  potDemoPoster: "/images/hero-poster.jpg",
};

export const translatedAlt: Record<
  Language,
  { pot: string; story: string; mandoline: string[] }
> = {
  fa: {
    pot: "دیگ قابلی ریحانه؛ فرم آشنای دیگ وطنی",
    story: "قابلی‌پلو، غذای آشنای دسترخوانِ خانه",
    mandoline: [
      "ماندولین ریحانه کنار سبزیجات تازه",
      "ماندولین ریحانه برای آماده‌سازی سبزیجات",
      "نمای نزدیک پیچ تنظیم ضخامت برش ماندولین ریحانه",
      "استفاده از ماندولین ریحانه برای برش سبزیجات",
    ],
  },
  ps: {
    pot: "د ریحانې قابلي دیګ، د وطنی پخلي اشنا بڼه",
    story: "قابلي پلو، د کور د دسترخوان اشنا خواړه",
    mandoline: [
      "د تازه سبزیو ترڅنګ د ریحانې ماندولین",
      "د سبزیو د چمتو کولو لپاره د ریحانې ماندولین",
      "د ریحانې ماندولین د پرې کولو د اندازې غوټه نږدې انځور",
      "د سبزیو د پرې کولو لپاره د ریحانې ماندولین کارول",
    ],
  },
  en: {
    pot: "Rayhana Qabili Pilaf Pot in its familiar Afghan shape",
    story: "Qabili pilaf, a familiar dish for a shared family table",
    mandoline: [
      "Rayhana mandoline slicer with fresh vegetables",
      "Rayhana mandoline prepared for vegetable slicing",
      "Close-up of the Rayhana mandoline thickness adjustment dial",
      "Using the Rayhana mandoline to slice vegetables",
    ],
  },
};

export function formatCapacity(value: number, language: Language) {
  return new Intl.NumberFormat(
    language === "fa" ? "fa-AF" : language === "ps" ? "ps-AF" : "en-US"
  ).format(value);
}
