import type { Language, MarketId } from "./catalog";

export const offerTiers = [
  { quantity: 1, discount: 10 },
  { quantity: 2, discount: 15 },
  { quantity: 3, discount: 20 },
] as const;
export type OfferQuantity = (typeof offerTiers)[number]["quantity"];
export type OfferActivation = {
  eligible: boolean;
  confirmed: boolean;
  startsAt: string | null;
  endsAt: string | null;
  method: "automatic" | "code" | "bundle" | null;
};
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
    eyebrow: "آفر ویژهٔ بلک‌فرایدی ریحانه",
    title: "این بلک‌فرایدی،\nسهم شما از یک پیشنهاد ویژه!",
    body: "لحظه‌های خوشمزه، دسترخوان‌های رنگین و دورهمی‌های خانوادگی؛ برای همین پخت‌وپزهاست که دیگ ریحانه را انتخاب می‌کنیم. این بلک‌فرایدی، می‌توانید دیگ قابلی‌پلوی ریحانه را برای آشپزخانهٔ خودتان در نظر بگیرید یا به عزیزانتان هدیه دهید.",
    dates: "۲۷ تا ۳۰ نوامبر ۲۰۲۶ (۶ تا ۹ قوس ۱۴۰۵)",
    duration: "یک پیشنهاد چهارروزه",
    planned:
      "طرح تخفیف اعلام‌شدهٔ ریحانه؛ فروشگاه‌های شرکت‌کننده، روش استفاده و ساعت دقیق شروع و پایان به‌زودی اعلام می‌شود.",
    before: "کمپین هنوز شروع نشده است.",
    ended: "این آفر به پایان رسیده است.",
    active: "شرایط آفر این فروشگاه را پیش از خرید بررسی کنید.",
    imageNote:
      "عکس‌ها تعداد دیگ‌ها را نشان می‌دهند؛ رنگ و سایز هر دیگ را در فروشگاه انتخاب و موجودی‌اش را بررسی کنید.",
    quantity: "تعداد دیگ موردنظرتان",
    count: "{quantity} دیگ",
    percent: "{discount}٪ تخفیف",
    highest: "بیشترین درصد تخفیف",
    tierNotes: [
      "برای آشپزخانهٔ خودتان",
      "یکی برای شما، یکی برای هدیه",
      "برای خودتان و عزیزانتان",
    ],
    selected: "پیشنهاد انتخابی شما",
    select: "این پیشنهاد را انتخاب می‌کنم",
    action: "انتخاب دیگ و بررسی آفر",
    teaser: "آفر چهارروزهٔ بلک‌فرایدی",
    link: "دیدن آفر ویژه",
    summary: "{quantity} دیگ؛ {discount}٪ در طرح آفر بلک‌فرایدی",
    notCart:
      "این انتخاب به سبد آمازون اضافه نشده است؛ تعداد و مدل را در آمازون تنظیم کنید.",
    notApplied:
      "این درصدها طرح اعلام‌شدهٔ ریحانه‌اند؛ جزئیات اجرا در هر فروشگاه هنوز تأیید نشده است.",
    knownOffers:
      "طرح بلک‌فرایدی ریحانه: ۱ دیگ ۱۰٪، ۲ دیگ ۱۵٪، ۳ دیگ ۲۰٪؛ فروشگاه‌های شرکت‌کننده و روش استفاده به‌زودی اعلام می‌شوند.",
    sellerAction: "دیدن محصول در فروشگاه",
    pendingAction: "پرسش دربارهٔ اجرای آفر",
    ordinaryListing:
      "این پیوند صفحهٔ عادی محصول است؛ تخفیف یا تعداد انتخابی را اعمال نمی‌کند.",
    story:
      "از قابلی‌پلوی اصیل تا غذاهای خوش‌عطر و خاطره‌انگیز؛ ریحانه همراه غذاهایی است که دورشان جمع می‌شویم.",
    signature: "RAYHANA — Roots in Modern Life",
  },
  en: {
    brand: "BLACK FRIDAY | RAYHANA",
    eyebrow: "RAYHANA’S SPECIAL BLACK FRIDAY OFFER",
    title: "This Black Friday,\na special offer for your table.",
    body: "Good food, a colourful table and time with family. Choose a Rayhana Qabili Pot for the meals you share—or as a thoughtful gift for someone you love.",
    dates: "27–30 November 2026",
    duration: "A four-day offer",
    planned:
      "Rayhana’s announced discount plan is shown here. Participating stores, redemption steps and exact start/end times will be announced.",
    before: "The campaign has not started yet.",
    ended: "This offer has ended.",
    active: "Check this store’s offer conditions before buying.",
    imageNote:
      "Photos illustrate the number of pots, not a fixed colour bundle. Choose the exact colours and sizes and check availability with the store.",
    quantity: "How many pots are you considering?",
    count: "{quantity} {unit}",
    percent: "{discount}% off",
    highest: "Highest discount",
    tierNotes: [
      "For your own kitchen",
      "One for you, one to give",
      "For you and the people you love",
    ],
    selected: "Your selected offer",
    select: "Choose this offer",
    action: "Choose pots & check the offer",
    teaser: "A four-day Black Friday offer",
    link: "Explore the special offer",
    summary:
      "{quantity} {unit} · {discount}% in the planned Black Friday offer",
    notCart:
      "This selection has not been added to an Amazon cart. Set the quantity and exact model on Amazon.",
    notApplied:
      "These percentages are Rayhana’s announced plan. Store participation and redemption details are not yet confirmed.",
    knownOffers:
      "Rayhana’s Black Friday plan: 1 pot, 10%; 2 pots, 15%; 3 pots, 20%. Participating stores and redemption steps will be announced.",
    sellerAction: "View the product at the store",
    pendingAction: "Ask about offer redemption",
    ordinaryListing:
      "This is the regular product page; it does not apply the discount or your selected quantity.",
    story:
      "From traditional qabili pilaf to fragrant dishes worth remembering. Rayhana is made for the meals that bring us together.",
    signature: "RAYHANA — Roots in Modern Life",
  },
  ps: {
    brand: "BLACK FRIDAY | RAYHANA",
    eyebrow: "د ریحانې د بلک‌فرایډې ځانګړی وړاندیز",
    title: "دا بلک‌فرایډې،\nستاسو لپاره یو ځانګړی وړاندیز!",
    body: "خوندور خواړه، رنګین دسترخوان او له کورنۍ سره خوږې شېبې. د ریحانې قابلي دیګ د خپل پخلنځي لپاره وټاکئ یا یې خپل عزیز ته ډالۍ کړئ.",
    dates: "د ۲۰۲۶ د نومبر له ۲۷ تر ۳۰ پورې",
    duration: "څلور ورځنی وړاندیز",
    planned:
      "دلته د ریحانې اعلان شوی د تخفیف پلان دی؛ ګډون کوونکي پلورنځي، د کارولو طریقه او دقیق وختونه به اعلان شي.",
    before: "کمپاین لا نه دی پیل شوی.",
    ended: "دا وړاندیز پای ته رسېدلی دی.",
    active: "له پېرود مخکې د دې پلورنځي د وړاندیز شرطونه وګورئ.",
    imageNote:
      "انځورونه د دیګونو شمېر ښيي، نه په ټاکلو رنګونو کې یوه بسته. په پلورنځي کې رنګونه او اندازې وټاکئ او موجودیت وګورئ.",
    quantity: "څو دیګونه غواړئ؟",
    count: "{quantity} {unit}",
    percent: "{discount}٪ تخفیف",
    highest: "تر ټولو لوړ تخفیف",
    tierNotes: [
      "د خپل پخلنځي لپاره",
      "یو ستاسو، یو د ډالۍ لپاره",
      "ستاسو او عزیزانو لپاره",
    ],
    selected: "ستاسو ټاکلی وړاندیز",
    select: "دا وړاندیز ټاکم",
    action: "دیګونه او وړاندیز وګورئ",
    teaser: "د بلک‌فرایډې څلور ورځنی وړاندیز",
    link: "ځانګړی وړاندیز وګورئ",
    summary: "{quantity} {unit}؛ {discount}٪ د بلک‌فرایډې په پلان کې",
    notCart:
      "دا انتخاب د آمازون سبد ته نه دی اضافه شوی؛ هلته شمېر او دقیق ماډل وټاکئ.",
    notApplied:
      "دا سلنې د ریحانې اعلان شوی پلان دی؛ په هر پلورنځي کې د پلي کېدو جزئیات لا نه دي تایید شوي.",
    knownOffers:
      "د ریحانې د بلک‌فرایډې پلان: ۱ دیګ ۱۰٪، ۲ دیګونه ۱۵٪، ۳ دیګونه ۲۰٪؛ ګډون کوونکي پلورنځي او د کارولو طریقه به اعلان شي.",
    sellerAction: "محصول په پلورنځي کې وګورئ",
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
