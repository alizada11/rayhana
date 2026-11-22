import {
  formatCapacity,
  getMarketLabel,
  markets,
  type Language,
  type MarketId,
  type ProductId,
} from "./catalog";
import type { OfferQuantity } from "./blackFriday";
import {
  getMandolineOfferDiscount,
  getPotOfferTier,
  isProductUnavailable,
} from "./regionalOffers";

export const purchasePlannerCopy = {
  en: {
    title: "Choose your product and store",
    intro:
      "Start with the delivery country, then choose your product, size and quantity.",
    plannerLabel: "Your buying selection",
    summary: "Your selection",
    quantity: "Quantity",
    capacity: "Capacity",
    store: "Store",
    discount: "Announced discount",
    percent: "{number}%",
    preview: "Offer preview",
    previewNote: "Discount application at the store is not yet confirmed.",
    chooseCountry: "Choose a delivery country",
    unavailable: "Unavailable in Afghanistan",
    finalPrice:
      "Final product price, shipping/tax, delivery and returns are determined at the selected store.",
    viewProduct: "View selected product on {store}",
    contact: "Ask Rayhana for the product link",
    missingLink:
      "This product’s link for the selected store is not yet confirmed; ask Rayhana for the buying route.",
    listingScope:
      "The link opens a product-family page, not a preselected size, colour or quantity; it does not apply the offer or add anything to a cart. Confirm your exact selection at the store.",
    conditions: "Offer and purchase conditions",
    amazonPotRules:
      "Amazon pot rates: {q1} pot — {one}; {q2} pots — {two}; {q3} pots — {three}. Only pots count toward these tiers.",
    afPotRules:
      "Shopino24’s rate stays at {rate} for {q1}, {q2} or {q3} eligible pots; quantity does not increase the discount.",
    mandolineRules:
      "The mandoline offer is separate from the pot offer; mandolines do not count toward pot quantity tiers.",
    mandolineDates: "Mandoline offer dates are not yet confirmed.",
    sellerResponsibility:
      "Payment, order fulfilment and returns are the seller’s responsibility and follow its terms. Check the exact model, stock and delivery to your address before ordering. No order or payment is taken here.",
    support: "Product-use questions:",
    enquirySubject: "Rayhana product-link enquiry",
    enquiryBody:
      "Hello Rayhana,\nPlease share the confirmed buying link for this selection:\n{summary}\nPlease confirm offer redemption steps and exact timing.\nThank you.",
  },
  fa: {
    title: "محصول و فروشگاه را انتخاب کنید",
    intro: "اول کشور تحویل، سپس محصول، گنجایش و تعداد را انتخاب کنید.",
    plannerLabel: "انتخاب شما برای خرید",
    summary: "انتخاب شما",
    quantity: "تعداد",
    capacity: "گنجایش",
    store: "فروشگاه",
    discount: "تخفیف اعلام‌شده",
    percent: "{number}٪",
    preview: "پیش‌نمایش آفر",
    previewNote: "اجرای تخفیف در فروشگاه هنوز تأیید نشده است.",
    chooseCountry: "کشور تحویل را انتخاب کنید",
    unavailable: "در افغانستان موجود نیست",
    finalPrice:
      "قیمت نهایی محصول، هزینهٔ ارسال و مالیات، تحویل و شرایط برگشت در فروشگاه انتخابی مشخص می‌شوند.",
    viewProduct: "دیدن محصول انتخابی در {store}",
    contact: "پرسش از ریحانه برای پیوند محصول",
    missingLink:
      "پیوند این محصول در فروشگاه انتخابی هنوز تأیید نشده است؛ راه خرید را از ریحانه بپرسید.",
    listingScope:
      "پیوند، صفحهٔ محصول را باز می‌کند؛ گنجایش، رنگ و تعداد از پیش انتخاب نشده‌اند، آفر اعمال نمی‌شود و چیزی به سبد خرید اضافه نمی‌شود. انتخاب دقیق را در فروشگاه بررسی کنید.",
    conditions: "شرایط آفر و خرید",
    amazonPotRules:
      "تخفیف دیگ در آمازون: {q1} دیگ — {one}؛ {q2} دیگ — {two}؛ {q3} دیگ — {three}. فقط تعداد دیگ‌ها در این تخفیف حساب می‌شود.",
    afPotRules:
      "تخفیف شاپینو۲۴ برای {q1}، {q2} یا {q3} دیگ شامل آفر، همان {rate} است؛ با افزایش تعداد، درصد تخفیف بیشتر نمی‌شود.",
    mandolineRules:
      "آفر ماندولین جدا از آفر دیگ است؛ ماندولین در تعداد دیگ‌ها حساب نمی‌شود.",
    mandolineDates: "تاریخ آفر ماندولین هنوز تأیید نشده است.",
    sellerResponsibility:
      "پرداخت، تحویل سفارش و برگشت کالا با فروشنده و تابع شرایط اوست. پیش از سفارش، مدل دقیق، موجودی و امکان تحویل به نشانی خود را بررسی کنید. اینجا سفارش یا پرداختی انجام نمی‌شود.",
    support: "پرسش دربارهٔ استفاده از محصول:",
    enquirySubject: "پرسش از ریحانه دربارهٔ پیوند محصول",
    enquiryBody:
      "سلام ریحانه،\nلطفاً پیوند تأییدشدهٔ خرید را برای این انتخاب بفرستید:\n{summary}\nلطفاً روش استفاده از آفر و ساعت دقیق اجرا را هم تأیید کنید.\nتشکر.",
  },
  ps: {
    title: "محصول او پلورنځی وټاکئ",
    intro: "لومړی د سپارلو هېواد، بیا محصول، اندازه او شمېر وټاکئ.",
    plannerLabel: "د پېرود لپاره ستاسو انتخاب",
    summary: "ستاسو انتخاب",
    quantity: "شمېر",
    capacity: "اندازه",
    store: "پلورنځی",
    discount: "اعلان شوی تخفیف",
    percent: "{number}٪",
    preview: "د وړاندیز مخکتنه",
    previewNote: "په پلورنځي کې د تخفیف پلي کېدل لا نه دي تایید شوي.",
    chooseCountry: "د سپارلو هېواد وټاکئ",
    unavailable: "په افغانستان کې نشته",
    finalPrice:
      "د محصول وروستۍ بیه، د لېږد لګښت او مالیه، سپارل او د بېرته ستنولو شرطونه په ټاکلي پلورنځي کې معلومېږي.",
    viewProduct: "ټاکلی محصول په {store} کې وګورئ",
    contact: "د محصول پیوند له ریحانې وپوښتئ",
    missingLink:
      "په ټاکلي پلورنځي کې د دې محصول پیوند لا نه دی تایید شوی؛ د پېرود لار له ریحانې وپوښتئ.",
    listingScope:
      "پیوند د محصول پاڼه پرانیزي؛ اندازه، رنګ او شمېر له مخکې نه ټاکي، تخفیف نه پلي کوي او سبد ته څه نه زیاتوي. خپل کره انتخاب په پلورنځي کې وګورئ.",
    conditions: "د وړاندیز او پېرود شرطونه",
    amazonPotRules:
      "په آمازون کې د دیګ تخفیف: {q1} دیګ — {one}؛ {q2} دیګونه — {two}؛ {q3} دیګونه — {three}. یوازې دیګونه په دې شمېر کې حسابېږي.",
    afPotRules:
      "د شاپینو۲۴ تخفیف د {q1}، {q2} یا {q3} شاملو دیګونو لپاره هماغه {rate} دی؛ د شمېر په زیاتېدو تخفیف نه زیاتېږي.",
    mandolineRules:
      "د ماندولین وړاندیز د دیګ له وړاندیزه جلا دی؛ ماندولین د دیګونو په شمېر کې نه حسابېږي.",
    mandolineDates: "د ماندولین د وړاندیز نېټې لا نه دي تایید شوې.",
    sellerResponsibility:
      "تادیه، د فرمایش سپارل او بېرته ستنول د پلورونکي مسوولیت دی او د هغه له شرطونو سره سم ترسره کېږي. تر فرمایش مخکې کره ماډل، موجودیت او خپلې پتې ته د سپارلو امکان وګورئ. دلته نه فرمایش او نه تادیه کېږي.",
    support: "د محصول د کارولو پوښتنې:",
    enquirySubject: "له ریحانې د محصول د پیوند پوښتنه",
    enquiryBody:
      "سلام ریحانه،\nمهرباني وکړئ د دې انتخاب د پېرود تایید شوی پیوند راولېږئ:\n{summary}\nد تخفیف د کارولو طریقه او دقیق وختونه هم تایید کړئ.\nمننه.",
  },
} satisfies Record<Language, Record<string, string>>;

export function plannerTemplate(
  template: string,
  values: Record<string, string>
): string {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value),
    template
  );
}

export function plannerPercent(value: number, language: Language): string {
  return plannerTemplate(purchasePlannerCopy[language].percent, {
    number: formatCapacity(value, language),
  });
}

/** No country is not an Amazon market; unavailable products never have a rate. */
export function getPlannerDiscount(
  product: ProductId,
  market: MarketId | "",
  quantity: OfferQuantity
): number | null {
  if (!market || isProductUnavailable(product, market)) return null;
  return product === "pot"
    ? (getPotOfferTier(quantity, market)?.discount ?? null)
    : getMandolineOfferDiscount(market);
}

/** The same localized selection is shown on screen and included in an enquiry. */
export function getPurchasePlannerSummary({
  language,
  market,
  product,
  productName,
  capacity,
  litres,
  quantity,
}: {
  language: Language;
  market: MarketId | "";
  product: ProductId;
  productName: string;
  capacity: number;
  litres: string;
  quantity: OfferQuantity;
}): string {
  const c = purchasePlannerCopy[language];
  const selected = markets.find(item => item.id === market);
  const discount = getPlannerDiscount(product, market, quantity);
  return [
    productName,
    ...(product === "pot"
      ? [`${c.capacity}: ${formatCapacity(capacity, language)} ${litres}`]
      : []),
    `${c.quantity}: ${formatCapacity(quantity, language)}`,
    selected
      ? `${c.store}: ${getMarketLabel(market, language)} (${selected.domain})`
      : c.chooseCountry,
    ...(isProductUnavailable(product, market)
      ? [c.unavailable]
      : discount === null
        ? []
        : [`${c.discount}: ${plannerPercent(discount, language)}`]),
  ].join(" · ");
}
