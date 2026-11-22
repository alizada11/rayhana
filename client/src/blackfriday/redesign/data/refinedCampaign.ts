import type { Copy } from "@/blackfriday/redesign/components/rayhana/BuyingDialog";
import type { Language } from "./catalog";
import { mandolineSpecCopy } from "./mandolineSpecs";

// Rayhana's current Customer Support link: https://linktr.ee/rayhanafamily (21 Nov 2026).
export const rayhanaSupportWhatsAppUrl = "https://wa.me/8618480366600";

// New-version copy only. Original dictionaries and approved product facts are unchanged.
export const refinedCampaignCopy = {
  fa: {
    preview: "پیش‌نمایش آفر",
    primary: "دیدن فروشگاه‌های خرید",
    mandolinePrimary: "دیدن فروشگاه‌های ماندولین",
    heroLine1: "دیگ قابلی ریحانه",
    heroEyebrow: "برای غذاهایی که دورشان جمع می‌شویم",
    heroBody:
      "دیگ نچسب در گنجایش‌های ۷، ۹ و ۱۲ لیتر؛ برای آشپزخانهٔ خودتان یا هدیه به یک عزیز. مدل دلخواه‌تان را در فروشگاه مقصد ببینید.",
    chooseEyebrow: "یک راه کوتاه تا فروشگاه شما",
    chooseTitle: "اول مقصد، بعد دیگِ دلخواه‌تان.",
    chooseBody:
      "کشور تحویل، گنجایش و تعداد را همین‌جا مشخص کنید؛ راه خرید و آفر اعلام‌شده مطابق انتخاب شما تغییر می‌کند.",
    stores: "فروشگاه‌ها و کشورهای تحت پوشش",
    guideDetails: "جزئیات فر و مراقبت از دیگ",
    mandolineFaqQuestion: "چطور از ماندولین یا اسلایسر استفاده کنم؟",
    score: "۴٫۳ از ۵؛ آمازون آمریکا",
    scoreDate: "مشاهده: ۶ نوامبر ۲۰۲۶؛ امتیاز ثبت‌شده، نه زنده یا جهانی.",
    storeTrust: "پرداخت در فروشگاه مقصد",
    supportTrust: "پشتیبانی محصول از ریحانه",
    specCapacity: "گنجایش دیگ",
    riskEyebrow: "پیش از پرداخت، خیال‌تان روشن باشد",
    riskTitle: "ارسال، برگشت و پشتیبانی.",
    shippingTitle: "تحویل به نشانی شما",
    shippingBody:
      "قیمت نهایی، هزینهٔ ارسال، مالیات و زمان تحویل را با ثبت نشانی‌تان در آمازون کشور انتخابی ببینید. برای سفارش‌های افغانستان، این اطلاعات را در شاپینو۲۴ بررسی کنید.",
    returnsTitle: "شرایط برگشت و ضمانت",
    returnsBody:
      "پیش از خرید، مهلت و هزینهٔ برگشت و هر ضمانت فروشنده را در آمازون کشور انتخابی یا شاپینو۲۴ افغانستان بررسی کنید.",
    supportTitle: "پرسش دربارهٔ محصول؟",
    supportBody:
      "برای انتخاب محصول، روش استفاده و مراقبت، در واتساپ از ریحانه بپرسید. پرداخت و پیگیری سفارش از طریق آمازون یا شاپینو۲۴ انجام می‌شود.",
    supportAction: "گفت‌وگو با ریحانه در واتساپ",
    storeDetails: "دیدن فروشگاه‌های خرید",
    navChoose: "فروشگاه‌های خرید",
    oldVersion: "طرح قبلی",
    newVersion: "طرح بهبودیافته",
    versionLabel: "مقایسهٔ دو طرح؛ فقط پیش‌نمایش",
  },
  en: {
    preview: "Offer preview",
    primary: "View buying stores",
    mandolinePrimary: "View mandoline stores",
    heroLine1: "The Rayhana Qabuli Pot",
    heroEyebrow: "Made for the meals that bring us together",
    heroBody:
      "A nonstick pot in 7, 9 and 12 litres, for your kitchen or someone you love. View your preferred model at the destination store.",
    chooseEyebrow: "A SHORTER WAY TO YOUR STORE",
    chooseTitle: "Your destination. Your pot.",
    chooseBody:
      "Choose the delivery country, size and quantity here. Your purchase route and announced offer follow your selection.",
    stores: "Stores & delivery coverage",
    guideDetails: "Oven use & pot care details",
    mandolineFaqQuestion: "How do I use the mandoline slicer?",
    score: "4.3 out of 5 · Amazon US",
    scoreDate: "Observed 6 Nov 2026; a recorded score, not live or global.",
    storeTrust: "Payment at the destination store",
    supportTrust: "Product support from Rayhana",
    specCapacity: "Pot capacity",
    riskEyebrow: "KNOW BEFORE YOU PAY",
    riskTitle: "Delivery, returns & support.",
    shippingTitle: "Delivery to your address",
    shippingBody:
      "Enter your address on your chosen Amazon marketplace to see the final price, shipping, taxes and delivery estimate. For orders in Afghanistan, check these details on Shopino24.",
    returnsTitle: "Returns & warranty terms",
    returnsBody:
      "Before buying, check the return window, return costs and any seller warranty on your chosen Amazon marketplace or Shopino24 Afghanistan.",
    supportTitle: "A question about the product?",
    supportBody:
      "Ask Rayhana on WhatsApp about choosing, using or caring for your product. Payments and order enquiries are handled through Amazon or Shopino24.",
    supportAction: "Chat with Rayhana on WhatsApp",
    storeDetails: "View buying stores",
    navChoose: "Buying stores",
    oldVersion: "Original design",
    newVersion: "Improved design",
    versionLabel: "Compare designs · preview only",
  },
  ps: {
    preview: "د آفر مخکتنه",
    primary: "د پېرود پلورنځي وګورئ",
    mandolinePrimary: "د ماندولین پلورنځي وګورئ",
    heroLine1: "د ریحانې قابلي دېګ",
    heroEyebrow: "د هغو خوړو لپاره چې موږ سره راټولوي",
    heroBody:
      "نه نښتونکی دېګ په ۷، ۹ او ۱۲ لیټره اندازو؛ د خپل پخلنځي یا یوه عزیز لپاره. د خوښې ماډل په ټاکلي پلورنځي کې وګورئ.",
    chooseEyebrow: "ستاسو پلورنځي ته لنډه لاره",
    chooseTitle: "لومړی مقصد، بیا د خوښې دېګ.",
    chooseBody:
      "د سپارلو هېواد، اندازه او شمېر دلته وټاکئ؛ د پېرود لاره او اعلان شوی آفر ستاسو له انتخاب سره بدلېږي.",
    stores: "پلورنځي او د سپارلو پوښښ",
    guideDetails: "په تنور کې کارول او د دېګ ساتنه",
    mandolineFaqQuestion: "ماندولین یا اسلایسر څنګه وکاروم؟",
    score: "له ۵ څخه ۴٫۳؛ آمازون امریکا",
    scoreDate:
      "د کتنې نېټه: ۶ نومبر ۲۰۲۶؛ ثبت شوی امتیاز دی، نه ژوندی یا نړیوال.",
    storeTrust: "په ټاکلي پلورنځي کې تادیه",
    supportTrust: "د ریحانې د محصول ملاتړ",
    specCapacity: "د دیګ اندازه",
    riskEyebrow: "له تادیې مخکې معلومات روښانه کړئ",
    riskTitle: "سپارل، بېرته ستنول او ملاتړ.",
    shippingTitle: "ستاسو پتې ته سپارل",
    shippingBody:
      "د ټاکلي هېواد په آمازون کې خپله پته ولیکئ او وروستۍ بیه، د لېږد لګښت، مالیه او د سپارلو اټکلي وخت وګورئ. په افغانستان کې د فرمایشونو لپاره دا معلومات په شاپینو۲۴ کې وګورئ.",
    returnsTitle: "د ستنولو او ضمانت شرطونه",
    returnsBody:
      "له پېرود مخکې د بېرته ستنولو موده، لګښت او د پلورونکي هر ضمانت د ټاکلي هېواد په آمازون یا د افغانستان په شاپینو۲۴ کې وګورئ.",
    supportTitle: "د محصول په اړه پوښتنه لرئ؟",
    supportBody:
      "د محصول د ټاکلو، کارولو او ساتنې په اړه په واتساپ کې له ریحانې وپوښتئ. تادیه او د فرمایش تعقیب د آمازون یا شاپینو۲۴ له لارې کېږي.",
    supportAction: "په واتساپ کې له ریحانې سره خبرې",
    storeDetails: "د پېرود پلورنځي",
    navChoose: "د پېرود پلورنځي",
    oldVersion: "پخوانۍ طرحه",
    newVersion: "ښه شوې طرحه",
    versionLabel: "د دواړو طرحو پرتله؛ یوازې مخکتنه",
  },
} satisfies Record<Language, Record<string, string>>;

export function refinedDictionary(base: Copy, language: Language): Copy {
  const r = refinedCampaignCopy[language];
  const m = mandolineSpecCopy[language];
  return {
    ...base,
    heroLine1: r.heroLine1,
    heroEyebrow: r.heroEyebrow,
    heroBody: r.heroBody,
    heroAction: r.primary,
    closingAction: r.primary,
    slicingBody: m.slicingBody,
    julienneBody: m.julienneBody,
    potatoBody: m.potatoBody,
    faqItems: base.faqItems.map((item, index) =>
      index === 4
        ? { ...item, q: r.mandolineFaqQuestion, a: m.faqAnswer }
        : item
    ),
  };
}
