import type { Language, MarketId } from "./catalog";

export const offerTiers = [
  { quantity: 1, discount: 10 },
  { quantity: 2, discount: 15 },
  { quantity: 3, discount: 25 },
] as const;
export const mandolineOfferDiscount = 25;
export type OfferQuantity = (typeof offerTiers)[number]["quantity"];
export type OfferActivation = {
  eligible: boolean;
  confirmed: boolean;
  startsAt: string | null;
  endsAt: string | null;
  method: "automatic" | "code" | "bundle" | null;
};

// Eligibility confirms the campaign's scope, not a live discount at checkout.
// Each store still needs its own verified redemption method and exact times.
export const offerMarketActivation: Record<MarketId, OfferActivation> = {
  US: {
    eligible: true,
    confirmed: false,
    startsAt: null,
    endsAt: null,
    method: null,
  },
  CA: {
    eligible: true,
    confirmed: false,
    startsAt: null,
    endsAt: null,
    method: null,
  },
  AU: {
    eligible: true,
    confirmed: false,
    startsAt: null,
    endsAt: null,
    method: null,
  },
  DE: {
    eligible: true,
    confirmed: false,
    startsAt: null,
    endsAt: null,
    method: null,
  },
  UK: {
    eligible: true,
    confirmed: false,
    startsAt: null,
    endsAt: null,
    method: null,
  },
  AF: {
    eligible: true,
    confirmed: false,
    startsAt: null,
    endsAt: null,
    method: null,
  },
};

export function getOfferTier(quantity: number) {
  return offerTiers.find(tier => tier.quantity === quantity);
}
export function isOfferQuantity(value: number): value is OfferQuantity {
  return [1, 2, 3].includes(value);
}

/** Only absolute offset-bearing dates approved for a market can activate an offer.
 * The advertised inclusive calendar dates are not silently assigned a timezone. */
export function offerStage(
  market: MarketId | "",
  now: number
): "planned" | "upcoming" | "active" | "ended" {
  const c = market ? offerMarketActivation[market] : undefined;
  if (
    !c?.eligible ||
    !c.confirmed ||
    !c.method ||
    !c.startsAt ||
    !c.endsAt ||
    !/(Z|[+-]\d{2}:\d{2})$/.test(c.startsAt) ||
    !/(Z|[+-]\d{2}:\d{2})$/.test(c.endsAt)
  )
    return "planned";
  const start = Date.parse(c.startsAt),
    end = Date.parse(c.endsAt);
  if (
    !Number.isFinite(now) ||
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    end <= start
  )
    return "planned";
  return now < start ? "upcoming" : now < end ? "active" : "ended";
}

export const blackFridayCopy = {
  fa: {
    brand: "BLACK FRIDAY | RAYHANA",
    eyebrow: "آفر ویژهٔ دیگ قابلی ریحانه",
    title: "برای آشپزخانهٔ خودتان؛\nیا هدیه به کسی که دوستش دارید.",
    body: "یکی برای آشپزخانهٔ خودتان، یکی برای هدیه. تعداد دیگ‌ها را انتخاب کنید.",
    dateLabel: "آفر دیگ قابلی",
    dates: "۲۷ تا ۳۰ نوامبر ۲۰۲۶ (۶ تا ۹ قوس ۱۴۰۵)",
    duration: "آفر چهارروزهٔ دیگ",
    planned:
      "آفر اعلام‌شدهٔ ریحانه؛ روش استفاده و ساعت دقیق اجرا در فروشگاه انتخابی در انتظار تأیید است.",
    before: "آفر دیگ هنوز شروع نشده است.",
    ended: "این آفر بلک‌فرایدی دیگ به پایان رسیده است.",
    active:
      "شرایط آفر این بازار و مبلغ نهایی را در فروشگاه انتخابی بررسی کنید.",
    imageNote:
      "عکس‌ها فقط تعداد دیگ‌ها را نشان می‌دهند، نه بسته‌ای با رنگ ثابت؛ رنگ، گنجایش و موجودی را در فروشگاه انتخاب کنید.",
    quantity: "تعداد دیگ موردنظرتان",
    count: "{quantity} دیگ",
    percent: "{discount}٪ تخفیف",
    highest: "بیشترین درصد تخفیف",
    tierNotes: [
      "برای آشپزخانهٔ خودتان",
      "یکی برای شما، یکی برای هدیه",
      "برای شما و عزیزان‌تان",
    ],
    selected: "آفر انتخابی شما",
    select: "این آفر را انتخاب می‌کنم",
    action: "انتخاب دیگ و دیدن آفر",
    activeAction: "خرید دیگ و بررسی تخفیف",
    endedAction: "دیدن راه خرید دیگ",
    teaser:
      "بلک‌فرایدی ریحانه؛ آمازون: دیگ ۱۰٪، ۱۵٪ یا ۲۵٪ و ماندولین مستقل ۲۵٪. شاپینو۲۴ افغانستان: دیگ ۱۵٪ ثابت؛ دیگ سبز و ماندولین موجود نیستند.",
    link: "دیدن آفرها",
    summary: "{quantity} دیگ؛ {discount}٪ تخفیف",
    notCart:
      "این صفحه چیزی به سبد خرید فروشگاه اضافه نمی‌کند؛ تعداد و مدل را در فروشگاه انتخابی تعیین کنید.",
    notApplied:
      "درصدها آفرهای تأییدشدهٔ ریحانه‌اند؛ روش استفاده و ساعت دقیق اجرای تخفیف در فروشگاه انتخابی باید تأیید شوند.",
    knownOffers:
      "آمازون‌های آمریکا، کانادا، استرالیا، جرمنی و بریتانیا: دیگ قابلی — ۱ عدد ۱۰٪، ۲ عدد ۱۵٪، ۳ عدد ۲۵٪؛ ماندولین آفر مستقل ۲۵٪ دارد. شاپینو۲۴ افغانستان: آفر ویژهٔ ثابت ۱۵٪ روی دیگ‌های شامل آفر برای ۱، ۲ یا ۳ دیگ؛ دیگ سبز و ماندولین موجود نیستند. تاریخ آفر دیگ ۲۷ تا ۳۰ نوامبر ۲۰۲۶ (۶ تا ۹ قوس ۱۴۰۵) است. روش استفاده و ساعت دقیق اجرا در فروشگاه انتخابی در انتظار تأیید است؛ شرایط و موجودی فروشگاه را بررسی کنید.",
    mandolineOffer: "ماندولین ریحانه؛ ۲۵٪ تخفیف ویژهٔ بلک‌فرایدی",
    mandolineIndependent:
      "آفر ماندولین مستقل است و در تعداد دیگ‌ها حساب نمی‌شود.",
    sellerAction: "دیدن محصول عادی در فروشگاه",
    pendingAction: "پرسش دربارهٔ اجرای آفر",
    ordinaryListing:
      "این پیوند صفحهٔ عادی محصول است؛ تخفیف یا تعداد انتخابی را اعمال نمی‌کند.",
    story:
      "از قابلی‌پلوی اصیل تا غذاهای خوش‌عطر؛ ریحانه همراه غذاهایی است که دورشان جمع می‌شویم.",
    signature: "RAYHANA — Roots in Modern Life",
  },
  en: {
    brand: "BLACK FRIDAY | RAYHANA",
    eyebrow: "RAYHANA QABILI POT · BLACK FRIDAY OFFER",
    title: "A pot for your kitchen.\nA gift for theirs.",
    body: "One for your kitchen, another to give. Choose your quantity.",
    dateLabel: "Qabili Pot offer",
    dates: "27–30 November 2026",
    duration: "A four-day pot offer",
    planned:
      "Rayhana’s announced offer. Redemption steps and exact times are pending confirmation for your chosen store.",
    before: "The pot offer has not started yet.",
    ended: "This Black Friday pot offer has ended.",
    active:
      "Check this market’s offer conditions and final price in your chosen store.",
    imageNote:
      "Photos show quantities, not a fixed colour bundle. Choose colours and sizes and check availability in the store.",
    quantity: "How many pots are you considering?",
    count: "{quantity} {unit}",
    percent: "{discount}% off",
    highest: "Highest pot discount",
    tierNotes: [
      "For your own kitchen",
      "One for you, one to give",
      "For you and the people you love",
    ],
    selected: "Your selected offer",
    select: "Choose this offer",
    action: "Choose pots & explore the offer",
    activeAction: "Shop pots & check the discount",
    endedAction: "See pot buying options",
    teaser:
      "Rayhana Black Friday · Amazon: pots 10/15/25%, independent mandoline 25%. Shopino24 Afghanistan: pots flat 15%; green pot and mandoline unavailable.",
    link: "Explore the offers",
    summary: "{quantity} {unit} · {discount}% off",
    notCart:
      "This selection has not been added to a store cart. Set the quantity and exact model in your chosen store.",
    notApplied:
      "These are Rayhana’s confirmed offers. Redemption steps and exact discount timing need confirmation for your chosen store.",
    knownOffers:
      "Amazon US, Canada, Australia, Germany and UK: Qabili Pots — 10% off 1, 15% off 2, 25% off 3; the Mandoline Slicer has an independent 25% offer. Shopino24 Afghanistan: a flat 15% special offer on eligible pots for 1, 2 or 3 pots; the green pot and mandoline are unavailable. The pot offer dates are 27–30 November 2026. Redemption steps and exact times are pending confirmation for the selected store; check its conditions and availability.",
    mandolineOffer: "Rayhana Mandoline Slicer · 25% off for Black Friday",
    mandolineIndependent:
      "The mandoline offer is separate from the pot offer. Two pots and one mandoline do not count as three pots.",
    sellerAction: "View the regular product listing",
    pendingAction: "Ask about offer redemption",
    ordinaryListing:
      "This is the regular product page; it does not apply the discount or your selected quantity.",
    story:
      "From traditional qabili to dishes worth remembering, Rayhana is made for the meals that bring us together.",
    signature: "RAYHANA — Roots in Modern Life",
  },
  ps: {
    brand: "BLACK FRIDAY | RAYHANA",
    eyebrow: "د ریحانې قابلي دیګ · د بلک‌فرایډې وړاندیز",
    title: "د خپل پخلنځي لپاره؛\nیا د خپل عزیز لپاره ډالۍ.",
    body: "یو د خپل پخلنځي لپاره، بل د ډالۍ لپاره. شمېر وټاکئ.",
    dateLabel: "د قابلي دیګ وړاندیز",
    dates: "د ۲۰۲۶ د نومبر له ۲۷ تر ۳۰ پورې",
    duration: "د دیګ څلور ورځنی وړاندیز",
    planned:
      "د ریحانې اعلان شوی وړاندیز؛ په ټاکلي پلورنځي کې د تخفیف طریقه او دقیق وختونه د تایید په تمه دي.",
    before: "د دیګ وړاندیز لا نه دی پیل شوی.",
    ended: "د دیګ دا د بلک‌فرایډې وړاندیز پای ته رسېدلی دی.",
    active:
      "د دې بازار د وړاندیز شرطونه او وروستۍ بیه په خپل ټاکلي پلورنځي کې وګورئ.",
    imageNote:
      "انځورونه یوازې شمېر ښيي، نه د ټاکلو رنګونو بسته؛ رنګ، اندازه او موجودیت په پلورنځي کې وګورئ.",
    quantity: "څو دیګونه په پام کې لرئ؟",
    count: "{quantity} {unit}",
    percent: "{discount}٪ تخفیف",
    highest: "د دیګ تر ټولو لوړ تخفیف",
    tierNotes: [
      "د خپل پخلنځي لپاره",
      "یو ستاسو، یو د ډالۍ لپاره",
      "ستاسو او عزیزانو لپاره",
    ],
    selected: "ستاسو ټاکلی وړاندیز",
    select: "دا وړاندیز ټاکم",
    action: "دیګونه وټاکئ او وړاندیز وګورئ",
    activeAction: "دیګونه واخلئ او تخفیف وګورئ",
    endedAction: "د دیګ د پېرلو لارې وګورئ",
    teaser:
      "د ریحانې بلک‌فرایډې؛ آمازون: دیګ ۱۰٪، ۱۵٪ یا ۲۵٪ او د ماندولین جلا ۲۵٪. د افغانستان شاپینو۲۴: دیګ ثابت ۱۵٪؛ شین دیګ او ماندولین نشته.",
    link: "وړاندیزونه وګورئ",
    summary: "{quantity} {unit}؛ {discount}٪ تخفیف",
    notCart:
      "دا انتخاب د پلورنځي سبد ته نه دی اضافه شوی؛ په خپل ټاکلي پلورنځي کې شمېر او دقیق ماډل وټاکئ.",
    notApplied:
      "دا د ریحانې تایید شوي وړاندیزونه دي؛ په ټاکلي پلورنځي کې د تخفیف طریقه او دقیق وختونه باید تایید شي.",
    knownOffers:
      "د امریکا، کاناډا، اسټرالیا، جرمني او بریتانیا آمازون: قابلي دیګ — ۱ دیګ ۱۰٪، ۲ دیګونه ۱۵٪، ۳ دیګونه ۲۵٪؛ ماندولین جلا ۲۵٪ وړاندیز لري. د افغانستان شاپینو۲۴: په وړاندیز کې پر شاملو دیګونو د ۱، ۲ یا ۳ دیګونو لپاره ثابت ۱۵٪ ځانګړی تخفیف؛ شین دیګ او ماندولین نشته. د دیګ وړاندیز د ۲۰۲۶ د نومبر له ۲۷ تر ۳۰ پورې دی. په ټاکلي پلورنځي کې د تخفیف طریقه او دقیق وختونه د تایید په تمه دي؛ د پلورنځي شرطونه او موجودیت وګورئ.",
    mandolineOffer: "د ریحانې ماندولین؛ د بلک‌فرایډې ځانګړی ۲۵٪ تخفیف",
    mandolineIndependent:
      "د ماندولین وړاندیز د دیګ له وړاندیزه جلا دی؛ دوه دیګونه او یو ماندولین درې دیګونه نه ګڼل کېږي.",
    sellerAction: "په پلورنځي کې عادي محصول وګورئ",
    pendingAction: "د تخفیف کارولو پوښتنه",
    ordinaryListing:
      "دا د عادي محصول پاڼه ده؛ تخفیف او ستاسو ټاکلی شمېر نه پلي کوي.",
    story:
      "له اصیل قابلي پلو څخه تر خوشبویه خوړو پورې؛ ریحانه د هغو خوړو ملګرې ده چې موږ سره راټولوي.",
    signature: "RAYHANA — Roots in Modern Life",
  },
} satisfies Record<Language, Record<string, unknown>>;

export function offerTemplate(
  template: string,
  quantity: number,
  discount: number,
  language: Language
) {
  const number = new Intl.NumberFormat(
    language === "fa" ? "fa-AF" : language === "ps" ? "ps-AF" : "en"
  );
  return template
    .replaceAll("{quantity}", number.format(quantity))
    .replaceAll("{discount}", number.format(discount))
    .replaceAll(
      "{unit}",
      language === "ps"
        ? quantity === 1
          ? "دیګ"
          : "دیګونه"
        : quantity === 1
          ? "pot"
          : "pots"
    );
}
