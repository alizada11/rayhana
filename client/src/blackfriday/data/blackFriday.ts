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
      "برای تمام بازارهای آمازون ریحانه؛ روش استفاده از تخفیف و ساعت دقیق شروع و پایان به‌زودی اعلام می‌شود.",
    before: "کمپین هنوز شروع نشده است.",
    ended: "این آفر به پایان رسیده است.",
    active: "شرایط آفر این بازار را در آمازون بررسی کنید.",
    imageNote:
      "عکس‌ها تعداد دیگ‌ها را نشان می‌دهند؛ رنگ و گنجایش هر دیگ را در آمازون انتخاب و موجودی‌اش را بررسی کنید.",
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
      "درصدها مربوط به طرح اعلام‌شدهٔ ریحانه‌اند؛ اعمال تخفیف در این بازار تأیید شده است.",
    knownOffers:
      "طرح بلک‌فرایدی: ۱ دیگ ۱۰٪، ۲ دیگ ۱۵٪، ۳ دیگ ۲۰٪؛ شامل تمام بازارهای آمازون ریحانه؛ روش استفاده به‌زودی اعلام می‌شود.",
    sellerAction: "دیدن محصول عادی در آمازون",
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
      "All Rayhana Amazon marketplaces are included. Redemption steps and exact start/end times will be announced.",
    before: "The campaign has not started yet.",
    ended: "This offer has ended.",
    active: "Check this marketplace’s offer conditions on Amazon.",
    imageNote:
      "Photos illustrate the number of pots, not a fixed colour bundle. Choose the exact colours and sizes and check availability on Amazon.",
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
      "These tiers are Rayhana’s announced offer plan. Discount redemption in this marketplace is confirmed.",
    knownOffers:
      "Black Friday plan: 1 pot, 10%; 2 pots, 15%; 3 pots, 20%. All Rayhana Amazon marketplaces are included; redemption steps will be announced.",
    sellerAction: "View the regular Amazon listing",
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
      "د ریحانې ټول آمازون بازارونه شامل دي؛ د تخفیف کارولو طریقه او د پیل او پای دقیق ساعتونه به اعلان شي.",
    before: "کمپاین لا نه دی پیل شوی.",
    ended: "دا وړاندیز پای ته رسېدلی دی.",
    active: "د دې بازار د وړاندیز شرطونه په آمازون کې وګورئ.",
    imageNote:
      "انځورونه د دیګونو شمېر ښيي، نه په ټاکلو رنګونو کې یوه بسته. په آمازون کې رنګونه او اندازې وټاکئ او موجودیت وګورئ.",
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
      "دا د ریحانې اعلان شوی پلان دی؛ په دې بازار کې د تخفیف کارول تایید شوي دي.",
    knownOffers:
      "د بلک‌فرایډې پلان: ۱ دیګ ۱۰٪، ۲ دیګونه ۱۵٪، ۳ دیګونه ۲۰٪؛ د هر بازار شرطونه به اعلان شي.",
    sellerAction: "د آمازون عادي محصول وګورئ",
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
