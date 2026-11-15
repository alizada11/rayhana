import type { Language, MarketId } from "./catalog";
import type { MarketSuggestion } from "@shared/marketSuggestion";

export const locationCopy = {
  fa: {
    suggested: "آمازون پیشنهادی برای شما",
    chosen: "کشور تحویل شما",
    checking: "داریم آمازون مناسب منطقهٔ شما را بررسی می‌کنیم…",
    unknown: "دیگ را به کدام کشور بفرستیم؟",
    unknownBody:
      "کشور شما را تشخیص ندادیم. کشور تحویل را انتخاب کنید تا مسیر خرید مناسب را ببینید.",
    outside:
      "برای این منطقه هنوز بازار پیشنهادی مشخصی نداریم؛ کشور تحویل را خودتان انتخاب کنید.",
    change: "تغییر کشور تحویل",
    choose: "انتخاب کشور تحویل",
    approximate:
      "بر اساس کشور تقریبیِ اتصال شما؛ کشور تحویل را پیش از خرید بررسی کنید.",
    timezone:
      "این پیشنهاد از تنظیم منطقهٔ زمانی دستگاه شماست و ممکن است با محل فعلی‌تان فرق داشته باشد.",
    regional:
      "یک پیشنهاد منطقه‌ای است؛ تحویل به نشانی شما را در آمازون بررسی کنید.",
    pending: "پیوند خرید این بازار هنوز تأیید نشده است.",
    manual:
      "انتخاب خودتان در اولویت است؛ هر وقت خواستید می‌توانید آن را تغییر دهید.",
    privacy:
      "موقعیت دقیق و نشانی شما را درخواست نمی‌کنیم. پیشنهاد کشور فقط در همین صفحه محاسبه می‌شود و در پایگاه داده‌ای ذخیره نمی‌شود.",
    amazon: "آمازون {country}",
    buy: "دیدن دیگ در آمازون {country}",
    genericBuy: "دیدن دیگ در آمازون",
    generalBuy: "گزینه‌های خرید در آمازون",
    pendingBuy: "بررسی خرید در آمازون {country}",
    badge: "پیشنهاد ما",
    from: "کشور تقریبی شما: {country}",
    notDelivery: "پیشنهاد بازار به معنی موجودی، قیمت بهتر یا تضمین تحویل نیست.",
  },
  en: {
    suggested: "Your suggested Amazon marketplace",
    chosen: "Your delivery country",
    checking: "Finding a marketplace for your region…",
    unknown: "Where should your pot be delivered?",
    unknownBody:
      "We could not estimate your country. Choose your delivery country to see the right purchase route.",
    outside:
      "We do not have a regional suggestion for this location yet. Please choose your delivery country.",
    change: "Change delivery country",
    choose: "Choose delivery country",
    approximate:
      "Based on an approximate region inferred from your browser time-zone setting. Check your delivery country before buying.",
    timezone:
      "Suggested from your device’s time-zone setting, which may differ from your current location.",
    regional:
      "A regional suggestion. Check delivery to your address on Amazon.",
    pending: "This marketplace’s purchase link is not yet confirmed.",
    manual: "Your own choice takes priority. You can change it at any time.",
    privacy:
      "We do not request your precise location or address. The suggested region is inferred from your browser time-zone setting and is not sent to a server.",
    amazon: "Amazon {country}",
    buy: "View the pot on Amazon {country}",
    genericBuy: "View the pot on Amazon",
    generalBuy: "Amazon buying options",
    pendingBuy: "Check buying options for Amazon {country}",
    badge: "Suggested",
    from: "Approximate country: {country}",
    notDelivery:
      "A marketplace suggestion does not confirm stock, a better price or delivery.",
  },
  ps: {
    suggested: "ستاسو لپاره وړاندیز شوی آمازون",
    chosen: "ستاسو د سپارلو هېواد",
    checking: "ستاسو سیمې ته مناسب بازار ګورو…",
    unknown: "دیګ کوم هېواد ته ولېږو؟",
    unknownBody:
      "ستاسو هېواد مو اټکل نه کړ. د سپارلو هېواد وټاکئ، څو د پېرود مناسبه لار وګورئ.",
    outside:
      "د دې سیمې لپاره لا بازار نه شو وړاندیزولای؛ د سپارلو هېواد پخپله وټاکئ.",
    change: "د سپارلو هېواد بدل کړئ",
    choose: "د سپارلو هېواد وټاکئ",
    approximate:
      "ستاسو د انټرنېټ د نږدې هېواد پر بنسټ؛ له پېرود مخکې د سپارلو هېواد وګورئ.",
    timezone:
      "دا وړاندیز د وسیلې د وخت سیمې له تنظیم څخه دی؛ ښايي له اوسني ځای سره مو توپیر ولري.",
    regional:
      "د سیمې لپاره یو وړاندیز دی؛ خپلې پتې ته سپارل په آمازون کې وګورئ.",
    pending: "د دې بازار د پېرود پیوند لا نه دی تایید شوی.",
    manual: "ستاسو خپل انتخاب لومړیتوب لري؛ هر وخت یې بدلولای شئ.",
    privacy:
      "ستاسو دقیق ځای یا پته نه غواړو. د هېواد وړاندیز یوازې د همدې پاڼې لپاره محاسبه کېږي او په ډیټابېس کې نه ساتل کېږي.",
    amazon: "د {country} آمازون",
    buy: "دیګ د {country} په آمازون کې وګورئ",
    genericBuy: "دیګ په آمازون کې وګورئ",
    generalBuy: "په آمازون کې د پېرود انتخابونه",
    pendingBuy: "د {country} په آمازون کې پېرود وګورئ",
    badge: "وړاندیز",
    from: "ستاسو اټکلي هېواد: {country}",
    notDelivery: "د بازار وړاندیز موجودیت، ښه بیه یا سپارل نه تضمینوي.",
  },
};

export function formatLocationTemplate(template: string, country: string) {
  return template.replace("{country}", country);
}

export function displayDetectedCountry(
  suggestion: MarketSuggestion | null,
  language: Language
): string | null {
  if (!suggestion?.countryCode) return null;
  try {
    return (
      new Intl.DisplayNames(
        [language === "fa" ? "fa-AF" : language === "ps" ? "ps-AF" : "en"],
        { type: "region" }
      ).of(suggestion.countryCode) ?? null
    );
  } catch {
    return null;
  }
}

/** Buttons still open the exact-model confirmation dialog; they do not
 * silently navigate to Amazon or promise that an unknown link exists. */
export function potAmazonLabel(
  language: Language,
  market: MarketId | "",
  countryName?: string,
  hasLink = false
) {
  const c = locationCopy[language];
  if (!market || !countryName) return c.genericBuy;
  return formatLocationTemplate(hasLink ? c.buy : c.pendingBuy, countryName);
}
