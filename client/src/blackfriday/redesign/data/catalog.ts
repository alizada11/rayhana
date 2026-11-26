export type Language = "fa" | "ps" | "en";
export type ProductId = "pot" | "mandoline";
export type MarketId = "US" | "CA" | "AU" | "DE" | "UK" | "AF";
export type MarketKind = "amazon" | "shopino";

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
  marketkind: MarketKind;
}[] = [
  {
    id: "US",
    country: { fa: "آمریکا", ps: "امریکا", en: "United States" },
    domain: "amazon.com",
    currency: "USD",
    mark: "US",
    marketkind: "amazon",
  },
  {
    id: "CA",
    country: { fa: "کانادا", ps: "کاناډا", en: "Canada" },
    domain: "amazon.ca",
    currency: "CAD",
    mark: "CA",
    marketkind: "amazon",
  },
  {
    id: "AU",
    country: { fa: "استرالیا", ps: "استرالیا", en: "Australia" },
    domain: "amazon.com.au",
    currency: "AUD",
    mark: "AU",
    marketkind: "amazon",
  },
  {
    id: "DE",
    country: { fa: "آلمان", ps: "جرمني", en: "Germany" },
    domain: "amazon.de",
    currency: "EUR",
    mark: "DE",
    marketkind: "amazon",
  },
  {
    id: "UK",
    country: { fa: "بریتانیا", ps: "برېتانیا", en: "United Kingdom" },
    domain: "amazon.co.uk",
    currency: "GBP",
    mark: "UK",
    marketkind: "amazon",
  },
  {
    id: "AF",
    country: { fa: "افغانستان", ps: "افغانستان", en: "Afghanistan" },
    domain: "shopino24.com",
    currency: "AFN",
    mark: "AF",
    marketkind: "shopino",
  },
];

/** Store identity is independent of the visitor's interface language. */
export function getStoreLabel(
  market: MarketId | "",
  language: Language
): string {
  if (!market)
    return {
      en: "the selected store",
      fa: "فروشگاه انتخابی",
      ps: "ټاکلي پلورنځي",
    }[language];
  const shopino =
    markets.find(item => item.id === market)?.marketkind === "shopino";
  return shopino
    ? language === "en"
      ? "Shopino24"
      : "شاپینو۲۴"
    : language === "en"
      ? "Amazon"
      : "آمازون";
}

export function getMarketLabel(
  market: MarketId | "",
  language: Language
): string {
  const selected = markets.find(item => item.id === market);
  if (!selected)
    return {
      en: "Choose a buying market",
      fa: "انتخاب بازار خرید",
      ps: "د پېرود بازار وټاکئ",
    }[language];
  const store = getStoreLabel(market, language);
  return language === "ps"
    ? `د ${selected.country[language]} ${store}`
    : `${store} ${selected.country[language]}`;
}

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
    AF: {
      url: "https://shopino24.com/products/dyg-kably-ryhanh",
      verified: true,
      source: "https://rayhana.com/api/products",
    },
  },
};

export function getPurchaseUrl(
  product: ProductId,
  market: MarketId | "",
  capacity?: number
): string | undefined {
  // Confirmed campaign availability: no mandoline stock in Afghanistan.
  if (!market || (product === "mandoline" && market === "AF")) return undefined;
  const item = listings[product]?.[market];
  const expected = markets.find(m => m.id === market)?.domain;
  if (
    !item?.verified ||
    !expected ||
    (product === "pot" && ![7, 9, 12].includes(capacity ?? 0))
  )
    return undefined;
  try {
    const url = new URL(item.url);
    return url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.port &&
      (url.hostname === expected || url.hostname === `www.${expected}`)
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

export const media = {
  logo: "/rayhana-logo.png",
  potHero: "/images/rayhana-pot-cutout_44807e34.webp",
  heroKitchenScene: "/images/rayhana-kitchen-scene-web_9cd3cb79.webp",
  potDetail: "/images/rayhana-pot-cutout_44807e34.webp",
  offerPots: {
    1: {
      src: "/images/black-friday-pot-single-cutout_ddef0170.webp",
      width: 1850,
      height: 1275,
    },
    2: {
      src: "/images/black-friday-pots-pair-cutout_8f9a1836.webp",
      width: 1260,
      height: 655,
    },
    3: {
      src: "/images/black-friday-pots-trio-cutout_6a8a6c02.webp",
      width: 1340,
      height: 735,
    },
  },
  potStory:
    "https://res.cloudinary.com/ds4pfbv9i/image/upload/f_auto,q_auto:eco,w_1100/v1771806620/Image_2_fqjvjb.png",
  potStoryJxl: "/images/Image_2_fqjvjb.jxl",
  mandolineHero: "/images/mandoline-product-cutout-web_4aa604a4.webp",
  // Generated food-prep decoration only; the actual product photo is unchanged.
  mandolineFoodScene:
    "/images/mandoline-reference-no-potato-web_4cfc55d1.webp",
  mandoline: "/images/DSC03109_cb70ea18.jpg",
  mandolineGallery: [
    "/images/DSC03109_cb70ea18.jpg",
    "/images/DSC03097_b3760edf.jpg",
    "/images/DSC03129_f37c3cab.jpg",
    "/images/DSC03138_82e30f41.jpg",
  ],
  demo: "/videos/mandoline-demo-updated.mp4",
  demoPoster: "/images/DSC03109_cb70ea18.jpg",
  potDemo: "/videos/pot-cooking-safe-web_9b3f9908.mp4",
  potDemoPoster: "/images/rayhana-pot-cutout_44807e34.webp",
  potSectionVideo: "/videos/rayhana-pot-section-autoplay.mp4",
  potVideoSlides: [
    "/videos/pot-cooking-safe-web_9b3f9908.mp4",
    "/videos/4068976Be9d769511f36eba4287cc436.mp4",
    "/videos/40A905db6517ffab9c25e3347b156c80.mp4",
    "/videos/7455D229e665284ca3ce59ef2ba3722c.mp4",
    "/videos/Adacbb7403124bb439093d9a0ae7c43e.mp4",
    "/videos/Ca8d6207bd97422f6c56b8dbe471186d.mp4",
    "/videos/Ce47401323098c2d36a47d6094ed321f.mp4",
  ],
  potGuide: "/files/rayhana-qabili-pot-user-guide.pdf",
  mandolineGuide: "",
};

export const translatedAlt: Record<
  Language,
  { pot: string; story: string; mandoline: string[] }
> = {
  fa: {
    pot: "دیگ قابلی ریحانه؛ فرم آشنای دیگ وطنی",
    story: "قابلی‌پلو، غذای آشنای دسترخوانِ خانه",
    mandoline: [
      "ماندولین خاکستری و سرخ ریحانه با نگهدارندهٔ مواد غذایی",
      "نمای نزدیک تیغه و سازوکار ماندولین",
      "نمای نزدیک مواد غذایی و برش با ماندولین",
      "جزئیات ماندولین ریحانه",
    ],
  },
  ps: {
    pot: "د ریحانې قابلي دیګ، د وطنی پخلي اشنا بڼه",
    story: "قابلي پلو، د کور د دسترخوان اشنا خواړه",
    mandoline: [
      "د ریحانې خړ او سور ماندولین له خوراکي توکو نیوونکي سره",
      "د ماندولین د تیغ او تنظیموونکي نږدې انځور",
      "د ماندولین او پرې شوو خوراکي توکو نږدې انځور",
      "د ریحانې ماندولین جزئیات",
    ],
  },
  en: {
    pot: "Rayhana Qabili Pilaf Pot in its familiar Afghan shape",
    story: "Qabili pilaf, a familiar dish for a shared family table",
    mandoline: [
      "Grey and red Rayhana mandoline with its food holder",
      "Close-up of the mandoline blade and adjustment mechanism",
      "Close-up of ingredients and cuts with the mandoline",
      "Details of the Rayhana mandoline slicer",
    ],
  },
};

export function formatCapacity(value: number, language: Language) {
  return new Intl.NumberFormat(
    language === "fa" ? "fa-AF" : language === "ps" ? "ps-AF" : "en-US"
  ).format(value);
}
