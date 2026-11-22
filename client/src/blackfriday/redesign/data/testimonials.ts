import type { Language } from "./catalog";
import screenshotReviews from "./amazonReviewScreenshots.json";
import screenshotTranslations from "./amazonReviewTranslations.json";

export type AmazonRatingSnapshot = {
  asin: string;
  marketplace: string;
  sourceUrl: string;
  observedAt: string;
  score: number | null;
  scoreVerified: boolean;
  ratingCount: number | null;
  countVerified: boolean;
};
export type CustomerTestimonial = {
  id: string;
  asin: string;
  sourceUrl: string;
  verified: boolean;
  originalText: string;
  originalLanguage: Language;
  translations: Partial<Record<Language, string>>;
  displayName: string;
  reviewedAt: string;
  variant: string | null;
  score: number | null;
  scoreVerified: boolean;
  verifiedPurchase: boolean;
  verifiedPurchaseEvidence: string | null;
  originalTitle?: string;
  titleTranslations?: Partial<Record<Language, string>>;
  excerpt?: string;
  excerptTranslations?: Partial<Record<Language, string>>;
  variantTranslations?: Partial<Record<Language, string>>;
  evidenceFile?: string;
  capturedAt?: string;
};

export const amazonRating: AmazonRatingSnapshot = {
  asin: "B0GDWM1PZV",
  marketplace: "Amazon.com (US)",
  sourceUrl:
    "https://www.amazon.com/RAYHANA-Traditional-Aluminum-Non-Stick-Compatible/dp/B0GDWM1PZV",
  observedAt: "2026-11-06",
  score: 4.3,
  scoreVerified: true,
  ratingCount: null,
  countVerified: false,
};

// User-supplied Amazon US screenshots, received 2026-11-07.
// This is a curated selection, NOT the total rating count or a live API feed.
export const customerTestimonials: CustomerTestimonial[] =
  screenshotReviews.map(review => {
    const translation = screenshotTranslations.find(t => t.id === review.id);
    return {
      ...review,
      asin: amazonRating.asin,
      sourceUrl: `https://www.amazon.com/product-reviews/${amazonRating.asin}`,
      verified: true,
      originalLanguage: "en",
      translations: translation?.translations || {},
      excerptTranslations: translation?.excerptTranslations || {},
      titleTranslations: translation?.titleTranslations || {},
      variantTranslations: translation?.variantTranslations || {},
      scoreVerified: true,
      verifiedPurchase: true,
      verifiedPurchaseEvidence: `${review.evidenceFile}: explicit Verified Purchase label beside the review’s color and size in the supplied screenshot.`,
      capturedAt: "2026-11-07",
    };
  });

export function isAmazonReviewSource(sourceUrl: string, asin: string): boolean {
  try {
    const url = new URL(sourceUrl);
    return (
      url.protocol === "https:" &&
      url.hostname === "www.amazon.com" &&
      /^[A-Z0-9]{10}$/.test(asin) &&
      url.pathname.split("/").includes(asin)
    );
  } catch {
    return false;
  }
}
export function verifiedRatingScore(data: AmazonRatingSnapshot): number | null {
  return data.scoreVerified &&
    typeof data.score === "number" &&
    Number.isFinite(data.score) &&
    data.score >= 0 &&
    data.score <= 5 &&
    /^\d{4}-\d{2}-\d{2}$/.test(data.observedAt) &&
    isAmazonReviewSource(data.sourceUrl, data.asin)
    ? data.score
    : null;
}
export function verifiedRatingCount(data: AmazonRatingSnapshot): number | null {
  return verifiedRatingScore(data) !== null &&
    data.countVerified &&
    Number.isInteger(data.ratingCount) &&
    data.ratingCount! > 0
    ? data.ratingCount
    : null;
}
export function publishableTestimonials(
  data: CustomerTestimonial[]
): CustomerTestimonial[] {
  return data.filter(
    t =>
      t.verified &&
      isAmazonReviewSource(t.sourceUrl, t.asin) &&
      t.originalText.trim().length > 0 &&
      t.displayName.trim().length > 0 &&
      /^\d{4}-\d{2}-\d{2}$/.test(t.reviewedAt) &&
      (!t.excerpt || t.originalText.includes(t.excerpt))
  );
}
export function hasVerifiedPurchase(t: CustomerTestimonial): boolean {
  return t.verifiedPurchase && !!t.verifiedPurchaseEvidence?.trim();
}

export const testimonialCopy = {
  fa: {
    eyebrow: "۰۳ / تجربهٔ خریداران",
    title: "تجربهٔ خریداران،\nاز زبان خودشان.",
    body: "برای دیدن تجربه‌های مثبت و نکته‌های انتقادی، نظرهای اصلی آمازون را بخوانید.",
    ratingTitle: "امتیاز در آمازون آمریکا",
    outOf: "از ۵",
    ratings: "امتیاز ثبت‌شده",
    checked: "مشاهده در",
    scope:
      "فقط همین صفحهٔ آمازون آمریکا، نه همهٔ بازارها؛ امتیازها ممکن است چند مدل را یک‌جا پوشش دهند.",
    sourceAction: "دیدن امتیاز در آمازون",
    reviewsAction: "خواندن نظرها در آمازون",
    sourceNote:
      "امتیاز ثبت‌شده است، نه نمایش زنده؛ ممکن است با نظرهای تازه تغییر کند. مقدار فعلی را در آمازون ببینید؛ خواندن نظرها ممکن است ورود بخواهد.",
    empty: "برای خواندن تجربه‌ها، صفحهٔ اصلی نظرهای آمازون را باز کنید.",
    translation: "ترجمهٔ دری از متن اصلی",
    original: "متن اصلی نظر",
    verifiedPurchase: "خرید تأییدشده در آمازون",
    quoteSource: "صفحهٔ نظرها در آمازون آمریکا",
    quoteScope: "تجربهٔ همین خریدار؛ نه تضمین نتیجه برای همه.",
    selectedNote:
      "گزیده از تصاویر ارسالی آمازون آمریکا؛ نمایندهٔ تمام نظرها نیست.",
    fullReview: "نظر کامل و اصل انگلیسی",
    fullTranslation: "ترجمهٔ کامل دری",
    translatedExcerpt: "گزیدهٔ نظر؛ ترجمهٔ دری از متن اصلی",
    originalExcerpt: "گزیدهٔ متن اصلی",
    marketplace: "نظر ثبت‌شده در آمازون آمریکا",
    viewMore: "دیدن ۲ نظر دیگر",
    viewLess: "نمایش کمتر",
    principle: "هر آشپزخانه، نیاز خودش را دارد.",
  },
  en: {
    eyebrow: "03 / CUSTOMER EXPERIENCES",
    title: "Real buyers.\nTheir own words.",
    body: "For positive experiences and critical details, explore the original Amazon reviews.",
    ratingTitle: "Rating on Amazon US",
    outOf: "out of 5",
    ratings: "ratings",
    checked: "Observed on",
    scope:
      "This Amazon US listing only, not a global score; ratings may combine variants.",
    sourceAction: "View Amazon rating",
    reviewsAction: "Read reviews on Amazon",
    sourceNote:
      "A recorded score, not a live update; new reviews may change it. Check Amazon for the current score. Sign-in may be required to read reviews.",
    empty: "Open the original Amazon review page to read buyers’ experiences.",
    translation: "English translation of the original",
    original: "Original review text",
    verifiedPurchase: "Verified Purchase on Amazon",
    quoteSource: "Amazon US review page",
    quoteScope: "This buyer’s experience, not a guarantee for everyone.",
    selectedNote:
      "Selected from supplied Amazon US screenshots; not representative of all reviews.",
    fullReview: "Read the full review",
    fullTranslation: "Full English translation",
    translatedExcerpt: "Excerpt translated into English",
    originalExcerpt: "Excerpt from the original review",
    marketplace: "Reviewed on Amazon US",
    viewMore: "Show 2 more reviews",
    viewLess: "Show fewer reviews",
    principle: "Every kitchen has its own needs.",
  },
  ps: {
    eyebrow: "۰۳ / د پېرودونکو تجربې",
    title: "د پېرودونکو تجربې،\nد هغوی په خپلو خبرو.",
    body: "د ښو تجربو او انتقادي ټکو لپاره د آمازون اصلي نظرونه ولولئ.",
    ratingTitle: "په آمازون امریکا کې امتیاز",
    outOf: "له ۵ څخه",
    ratings: "ثبت شوي امتیازونه",
    checked: "د کتنې نېټه",
    scope:
      "یوازې د آمازون امریکا همدا پاڼه، نه ټول بازارونه؛ امتیازونه ښايي څو ماډلونه یوځای رانغاړي.",
    sourceAction: "په آمازون کې امتیاز وګورئ",
    reviewsAction: "په آمازون کې نظرونه ولولئ",
    sourceNote:
      "دا ثبت شوی امتیاز دی، نه ژوندی تازه کېدونکی؛ نوي نظرونه یې بدلولی شي. اوسنی امتیاز په آمازون کې وګورئ؛ د نظرونو لوستل ښايي ننوتل وغواړي.",
    empty: "د تجربو لوستلو لپاره د آمازون د اصلي نظرونو پاڼه پرانیزئ.",
    translation: "د اصلي متن پښتو ژباړه",
    original: "د نظر اصلي متن",
    verifiedPurchase: "په آمازون کې تایید شوی پېرود",
    quoteSource: "په آمازون امریکا کې د نظرونو پاڼه",
    quoteScope: "د همدې پېرودونکي تجربه؛ د ټولو لپاره تضمین نه دی.",
    selectedNote:
      "د آمازون امریکا له رالېږل شوو انځورونو ټاکل شوي نظرونه؛ د ټولو نظرونو استازیتوب نه کوي.",
    fullReview: "بشپړ نظر او اصلي انګلیسي",
    fullTranslation: "بشپړه پښتو ژباړه",
    translatedExcerpt: "د نظر یوه برخه؛ د اصلي متن پښتو ژباړه",
    originalExcerpt: "د اصلي نظر یوه برخه",
    marketplace: "په آمازون امریکا کې ثبت شوی نظر",
    viewMore: "۲ نور نظرونه وګورئ",
    viewLess: "لږ نظرونه وښایئ",
    principle: "هر پخلنځی خپلې اړتیاوې لري.",
  },
};

export function reviewDate(value: string, language: Language): string {
  const date = new Date(`${value}T12:00:00Z`);
  if (!Number.isFinite(date.getTime())) return value;
  const gregorian = new Intl.DateTimeFormat(
    language === "fa"
      ? "fa-AF-u-ca-gregory"
      : language === "ps"
        ? "ps-AF-u-ca-gregory"
        : "en",
    { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }
  ).format(date);
  if (language !== "fa") return gregorian;
  const parts = new Intl.DateTimeFormat("en-u-ca-persian", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    timeZone: "UTC",
  }).formatToParts(date);
  const part = (type: string) =>
    Number(parts.find(p => p.type === type)?.value);
  const months = [
    "حمل",
    "ثور",
    "جوزا",
    "سرطان",
    "اسد",
    "سنبله",
    "میزان",
    "عقرب",
    "قوس",
    "جدی",
    "دلو",
    "حوت",
  ];
  const numbers = new Intl.NumberFormat("fa-AF", { useGrouping: false });
  const solar = `${numbers.format(part("day"))} ${months[part("month") - 1]} ${numbers.format(part("year"))}`;
  return `${gregorian} (${solar})`;
}
