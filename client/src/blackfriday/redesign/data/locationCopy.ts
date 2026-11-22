import {
  getMarketLabel,
  getStoreLabel,
  markets,
  type Language,
  type MarketId,
} from "./catalog";
import type { MarketSuggestion } from "@shared/marketSuggestion";

export const locationCopy = {
  fa: {
    suggested: "فروشگاه پیشنهادی برای شما",
    chosen: "کشور تحویل شما",
    checking: "داریم بازار مناسب منطقهٔ شما را بررسی می‌کنیم…",
    unknown: "محصول را به کدام کشور بفرستیم؟",
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
      "یک پیشنهاد منطقه‌ای است؛ تحویل به نشانی شما را در فروشگاه بررسی کنید.",
    germanyCoverage:
      "هم‌وطنان ما در بلجیم، هلند، اسپانیا و سوئد نیز می‌توانند از آمازون آلمان خرید کنند؛ امکان تحویل به نشانی خود را پیش از سفارش بررسی کنید.",
    germanyCoverageShort: "برای بلجیم، هلند، اسپانیا، سوئد هم",
    pending: "پیوند خرید این محصول در این بازار هنوز تأیید نشده است.",
    manual:
      "انتخاب خودتان در اولویت است؛ هر وقت خواستید می‌توانید آن را تغییر دهید.",
    privacy:
      "موقعیت دقیق و نشانی شما را درخواست نمی‌کنیم. اطلاعات پیشنهاد کشور در پایگاه دادهٔ ما ذخیره نمی‌شود.",
    amazon: "آمازون {country}",
    buy: "دیدن دیگ در {market}",
    genericBuy: "دیدن گزینه‌های خرید دیگ",
    generalBuy: "گزینه‌های خرید",
    pendingBuy: "بررسی خرید در {market}",
    badge: "پیشنهاد ما",
    from: "کشور تقریبی شما: {country}",
    notDelivery: "پیشنهاد بازار به معنی موجودی، قیمت بهتر یا تضمین تحویل نیست.",
    sellerNote:
      "پیش از سفارش در {store}، مدل دقیق، قیمت نهایی، امکان تحویل به نشانی و شرایط برگشت را بررسی کنید.",
    potListingScope:
      "این پیوند رسمی ریحانه، صفحهٔ دیگ را باز می‌کند؛ گنجایش، رنگ و تعداد از پیش انتخاب نشده‌اند. مدل دقیق را در {store} انتخاب و بررسی کنید.",
    mandolineListingScope:
      "این پیوند صفحهٔ عادی ماندولین است؛ مدل، قیمت نهایی و امکان تحویل را در {store} بررسی کنید.",
    regularAction: "دیدن محصول عادی در {market}",
    mandolineOfferSummary: "ماندولین؛ {discount}٪ در طرح آفر بلک‌فرایدی",
    offerPending:
      "درصد تخفیف اعلام شده است؛ روش استفاده و ساعت دقیق شروع و پایان هنوز تأیید نشده‌اند.",
    notCart:
      "این انتخاب به سبد خرید اضافه نشده است؛ تعداد و مدل دقیق را در {store} تنظیم کنید.",
    contactAction: "پرسش از ریحانه دربارهٔ خرید و آفر",
  },
  en: {
    suggested: "Your suggested buying market",
    chosen: "Your delivery country",
    checking: "Finding a marketplace for your region…",
    unknown: "Where should your product be delivered?",
    unknownBody:
      "We could not estimate your country. Choose your delivery country to see the right purchase route.",
    outside:
      "We do not have a regional suggestion for this location yet. Please choose your delivery country.",
    change: "Change delivery country",
    choose: "Choose delivery country",
    approximate:
      "Based on your approximate connection country. Check your delivery country before buying.",
    timezone:
      "Suggested from your device’s time-zone setting, which may differ from your current location.",
    regional:
      "A regional suggestion. Check delivery to your address at the store.",
    germanyCoverage:
      "Compatriots in Belgium, the Netherlands, Spain and Sweden can also buy from Amazon Germany; check delivery to your address before ordering.",
    germanyCoverageShort: "Also for Belgium, Netherlands, Spain, Sweden",
    pending:
      "This product’s purchase link in this market is not yet confirmed.",
    manual: "Your own choice takes priority. You can change it at any time.",
    privacy:
      "We do not request your precise location or address. Country-suggestion information is not saved in our database.",
    amazon: "Amazon {country}",
    buy: "View the pot on {market}",
    genericBuy: "View pot buying options",
    generalBuy: "Buying options",
    pendingBuy: "Check buying options for {market}",
    badge: "Suggested",
    from: "Approximate country: {country}",
    notDelivery:
      "A marketplace suggestion does not confirm stock, a better price or delivery.",
    sellerNote:
      "Review the exact model, final price, address eligibility and return conditions on {store} before ordering.",
    potListingScope:
      "This official Rayhana link opens the pot’s product page, not a preselected capacity, colour or quantity. Choose and confirm your exact model on {store}.",
    mandolineListingScope:
      "This is the regular mandoline product page. Check the exact model, final price and delivery eligibility on {store}.",
    regularAction: "View the regular listing on {market}",
    mandolineOfferSummary:
      "Mandoline · {discount}% in the announced Black Friday offer",
    offerPending:
      "The discount is announced; redemption steps and exact start/end times are not yet confirmed.",
    notCart:
      "This selection has not been added to a cart. Set the quantity and exact model on {store}.",
    contactAction: "Ask Rayhana about buying and the offer",
  },
  ps: {
    suggested: "ستاسو لپاره وړاندیز شوی بازار",
    chosen: "ستاسو د سپارلو هېواد",
    checking: "ستاسو سیمې ته مناسب بازار ګورو…",
    unknown: "محصول کوم هېواد ته ولېږو؟",
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
      "د سیمې لپاره یو وړاندیز دی؛ خپلې پتې ته سپارل په پلورنځي کې وګورئ.",
    germanyCoverage:
      "په بلجیم، هالنډ، هسپانیا او سویډن کې زموږ هېوادوال هم د جرمني له آمازون څخه پېرود کولای شي؛ تر فرمایش مخکې خپلې پتې ته د سپارلو امکان وګورئ.",
    germanyCoverageShort: "د بلجیم، هالنډ، هسپانیا، سویډن لپاره هم",
    pending: "په دې بازار کې د دې محصول د پېرود پیوند لا نه دی تایید شوی.",
    manual: "ستاسو خپل انتخاب لومړیتوب لري؛ هر وخت یې بدلولای شئ.",
    privacy:
      "ستاسو دقیق ځای یا پته نه غواړو. د هېواد د وړاندیز معلومات په ډیټابېس کې نه ساتل کېږي.",
    amazon: "د {country} آمازون",
    buy: "دیګ په {market} کې وګورئ",
    genericBuy: "د دیګ د پېرود انتخابونه وګورئ",
    generalBuy: "د پېرود انتخابونه",
    pendingBuy: "په {market} کې پېرود وګورئ",
    badge: "وړاندیز",
    from: "ستاسو اټکلي هېواد: {country}",
    notDelivery: "د بازار وړاندیز موجودیت، ښه بیه یا سپارل نه تضمینوي.",
    sellerNote:
      "تر فرمایش ورکولو مخکې په {store} کې کره ماډل، وروستۍ بیه، خپلې پتې ته د سپارلو امکان او د بېرته ستنولو شرطونه وګورئ.",
    potListingScope:
      "د ریحانې دا رسمي پیوند د دیګ پاڼه پرانیزي؛ اندازه، رنګ او شمېر پکې له مخکې نه دي ټاکل شوي. خپله دقیقه بڼه په {store} کې وټاکئ او وګورئ.",
    mandolineListingScope:
      "دا د ماندولین د عادي محصول پاڼه ده؛ په {store} کې کره ماډل، وروستۍ بیه او د سپارلو امکان وګورئ.",
    regularAction: "په {market} کې عادي محصول وګورئ",
    mandolineOfferSummary:
      "ماندولین؛ {discount}٪ د بلک‌فرایډې په اعلان شوي وړاندیز کې",
    offerPending:
      "د تخفیف سلنه اعلان شوې ده؛ د کارولو طریقه او د پیل او پای دقیق ساعتونه لا نه دي تایید شوي.",
    notCart:
      "دا انتخاب د پېرود سبد ته نه دی اضافه شوی؛ په {store} کې شمېر او دقیق ماډل وټاکئ.",
    contactAction: "له ریحانې د پېرود او وړاندیز پوښتنه وکړئ",
  },
};

export function formatLocationTemplate(template: string, country: string) {
  return template.replaceAll("{country}", country);
}

/** One formatter keeps the Afghan store distinct from Amazon in every language. */
export function formatMarketTemplate(
  template: string,
  market: MarketId | "",
  language: Language
) {
  return template
    .replaceAll("{market}", getMarketLabel(market, language))
    .replaceAll("{store}", getStoreLabel(market, language))
    .replaceAll(
      "{country}",
      markets.find(item => item.id === market)?.country[language] ?? ""
    );
}

export function displayDetectedCountry(
  suggestion: MarketSuggestion | null,
  language: Language
): string | null {
  if (!suggestion?.countryCode) return null;
  const market = markets.find(
    item =>
      item.id ===
      (suggestion.countryCode === "GB" ? "UK" : suggestion.countryCode)
  );
  if (market) return market.country[language];
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

/** Opens exact-model confirmation, never silently navigates or invents a link. */
export function potStoreLabel(
  language: Language,
  market: MarketId | "",
  hasLink = false
) {
  const c = locationCopy[language];
  return market
    ? formatMarketTemplate(hasLink ? c.buy : c.pendingBuy, market, language)
    : c.genericBuy;
}

/** Backward-compatible signature; canonical localized market names take priority. */
export function potAmazonLabel(
  language: Language,
  market: MarketId | "",
  _countryName?: string,
  hasLink = false
) {
  return potStoreLabel(language, market, hasLink);
}
