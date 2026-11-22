import type { Language, MarketId, ProductId } from "./catalog";
import {
  mandolineOfferDiscount,
  offerTiers,
  type OfferQuantity,
} from "./blackFriday";

export const afPotDiscount = 15;
export type RegionalPotOfferTier = {
  quantity: OfferQuantity;
  discount: number;
};

/** Product-family availability; the green pot restriction is colour-specific. */
export function isProductUnavailable(
  product: ProductId,
  market: MarketId | ""
): boolean {
  return product === "mandoline" && market === "AF";
}

/** Quantity remains a choice in Afghanistan, but never increases the discount. */
export function getPotOfferTiers(
  market: MarketId | "" = ""
): RegionalPotOfferTier[] {
  return offerTiers.map(tier => ({
    quantity: tier.quantity,
    discount: market === "AF" ? afPotDiscount : tier.discount,
  }));
}

export function getPotOfferTier(
  quantity: number,
  market: MarketId | "" = ""
): RegionalPotOfferTier | undefined {
  return getPotOfferTiers(market).find(tier => tier.quantity === quantity);
}

export function getMandolineOfferDiscount(
  market: MarketId | "" = ""
): number | null {
  return market === "AF" ? null : mandolineOfferDiscount;
}

// Keep the same fields in each language so all campaign surfaces can use this
// regional exception without deriving availability from a missing seller link.
// Redemption steps and exact times remain unconfirmed in blackFriday.ts.
export const regionalOfferCopy = {
  en: {
    heroLine2: "15% special offer",
    announcement:
      "Shopino24 Afghanistan: a flat 15% special offer on eligible Qabili Pots, whether you choose 1, 2 or 3. The mandoline and green pot are unavailable in Afghanistan.",
    scope:
      "Amazon US, Canada, Australia, Germany and UK: 10% off 1 pot, 15% off 2 pots, 25% off 3 pots; a separate 25% mandoline offer. Shopino24 Afghanistan: flat 15% on eligible pots for any of these quantities; no mandoline or green pot.",
    afTitle: "Shopino24 Afghanistan · 15% special offer",
    afBody:
      "Choose 1, 2 or 3 eligible Qabili Pots: the special offer stays at 15% for every quantity. This is a flat discount, not a quantity-tiered offer.",
    unavailableTitle: "Mandoline unavailable in Afghanistan",
    unavailableBody:
      "The Mandoline Slicer is unavailable in Afghanistan. Change the delivery country to explore other markets, and check the selected store’s availability.",
    potAvailability: "The green Qabili Pot is unavailable in Afghanistan.",
    afAvailability:
      "The mandoline and green Qabili Pot are unavailable in Afghanistan.",
    otherMarketsAction: "See other delivery markets",
    amazonLabel: "Amazon markets",
    afLabel: "Shopino24 Afghanistan",
    knownOffers:
      "Amazon US, Canada, Australia, Germany and UK: Qabili Pots — 10% off 1, 15% off 2, 25% off 3; the Mandoline Slicer has an independent 25% offer. Shopino24 Afghanistan: a flat 15% special offer on eligible pots for 1, 2 or 3 pots; the green pot and mandoline are unavailable. The pot offer dates are 27–30 November 2026. Redemption steps and exact times are pending confirmation for the selected store; check its conditions and availability.",
  },
  fa: {
    heroLine2: "۱۵٪ آفر ویژه",
    announcement:
      "شاپینو۲۴ افغانستان: آفر ویژهٔ ثابت ۱۵٪ روی دیگ‌های قابلی شامل آفر، برای انتخاب ۱، ۲ یا ۳ دیگ. ماندولین و دیگ سبز در افغانستان موجود نیستند.",
    scope:
      "آمازون‌های آمریکا، کانادا، استرالیا، جرمنی و بریتانیا: ۱ دیگ ۱۰٪، ۲ دیگ ۱۵٪، ۳ دیگ ۲۵٪؛ آفر مستقل ۲۵٪ ماندولین. شاپینو۲۴ افغانستان: ۱۵٪ ثابت روی دیگ‌های شامل آفر برای هر یک از این تعدادها؛ ماندولین و دیگ سبز موجود نیستند.",
    afTitle: "شاپینو۲۴ افغانستان؛ ۱۵٪ آفر ویژه",
    afBody:
      "۱، ۲ یا ۳ دیگ قابلی شامل آفر را انتخاب کنید؛ آفر ویژه برای هر تعداد همان ۱۵٪ است. تخفیف ثابت است و با تعداد دیگ‌ها افزایش نمی‌یابد.",
    unavailableTitle: "ماندولین در افغانستان موجود نیست",
    unavailableBody:
      "ماندولین در افغانستان موجود نیست. کشور تحویل را تغییر دهید تا بازارهای دیگر را بررسی کنید؛ موجودی را در فروشگاه انتخابی بررسی کنید.",
    potAvailability: "دیگ قابلی سبز در افغانستان موجود نیست.",
    afAvailability: "ماندولین و دیگ قابلی سبز در افغانستان موجود نیستند.",
    otherMarketsAction: "دیدن بازارهای دیگر برای تحویل",
    amazonLabel: "بازارهای آمازون",
    afLabel: "شاپینو۲۴ افغانستان",
    knownOffers:
      "آمازون‌های آمریکا، کانادا، استرالیا، جرمنی و بریتانیا: دیگ قابلی — ۱ عدد ۱۰٪، ۲ عدد ۱۵٪، ۳ عدد ۲۵٪؛ ماندولین آفر مستقل ۲۵٪ دارد. شاپینو۲۴ افغانستان: آفر ویژهٔ ثابت ۱۵٪ روی دیگ‌های شامل آفر برای ۱، ۲ یا ۳ دیگ؛ دیگ سبز و ماندولین موجود نیستند. تاریخ آفر دیگ ۲۷ تا ۳۰ نوامبر ۲۰۲۶ (۶ تا ۹ قوس ۱۴۰۵) است. روش استفاده و ساعت دقیق اجرا در فروشگاه انتخابی در انتظار تأیید است؛ شرایط و موجودی فروشگاه را بررسی کنید.",
  },
  ps: {
    heroLine2: "۱۵٪ ځانګړی وړاندیز",
    announcement:
      "د افغانستان شاپینو۲۴: پر هغو قابلي دیګونو چې په وړاندیز کې شامل دي ثابت ۱۵٪ ځانګړی تخفیف، که ۱، ۲ یا ۳ دیګونه وټاکئ. ماندولین او شین دیګ په افغانستان کې نشته.",
    scope:
      "د امریکا، کاناډا، اسټرالیا، جرمني او بریتانیا آمازون: ۱ دیګ ۱۰٪، ۲ دیګونه ۱۵٪، ۳ دیګونه ۲۵٪؛ د ماندولین جلا ۲۵٪ وړاندیز. د افغانستان شاپینو۲۴: په وړاندیز کې پر شاملو دیګونو د دې هر شمېر لپاره ثابت ۱۵٪؛ ماندولین او شین دیګ نشته.",
    afTitle: "د افغانستان شاپینو۲۴؛ ۱۵٪ ځانګړی وړاندیز",
    afBody:
      "په وړاندیز کې شامل ۱، ۲ یا ۳ قابلي دیګونه وټاکئ؛ د هر شمېر لپاره ځانګړی تخفیف هماغه ۱۵٪ دی. دا ثابت تخفیف دی او د دیګونو له شمېر سره نه زیاتېږي.",
    unavailableTitle: "ماندولین په افغانستان کې نشته",
    unavailableBody:
      "ماندولین په افغانستان کې نشته. د سپارلو هېواد بدل کړئ ترڅو نور بازارونه وګورئ؛ په ټاکلي پلورنځي کې موجودیت وګورئ.",
    potAvailability: "شین قابلي دیګ په افغانستان کې نشته.",
    afAvailability: "ماندولین او شین قابلي دیګ په افغانستان کې نشته.",
    otherMarketsAction: "د سپارلو نور بازارونه وګورئ",
    amazonLabel: "د آمازون بازارونه",
    afLabel: "د افغانستان شاپینو۲۴",
    knownOffers:
      "د امریکا، کاناډا، اسټرالیا، جرمني او بریتانیا آمازون: قابلي دیګ — ۱ دیګ ۱۰٪، ۲ دیګونه ۱۵٪، ۳ دیګونه ۲۵٪؛ ماندولین جلا ۲۵٪ وړاندیز لري. د افغانستان شاپینو۲۴: په وړاندیز کې پر شاملو دیګونو د ۱، ۲ یا ۳ دیګونو لپاره ثابت ۱۵٪ ځانګړی تخفیف؛ شین دیګ او ماندولین نشته. د دیګ وړاندیز د ۲۰۲۶ د نومبر له ۲۷ تر ۳۰ پورې دی. په ټاکلي پلورنځي کې د تخفیف طریقه او دقیق وختونه د تایید په تمه دي؛ د پلورنځي شرطونه او موجودیت وګورئ.",
  },
} satisfies Record<Language, Record<string, string>>;
