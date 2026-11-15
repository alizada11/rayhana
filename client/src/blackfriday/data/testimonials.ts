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
    title: "پیش از انتخاب،\nحرف خریداران را بشنوید.",
    body: "دیگ در پخت‌وپز روزمره چطور بوده؟ خریداران از کدام گنجایش و مدل استفاده کرده‌اند؟ تجربه‌های مثبت و نکته‌های انتقادی را در آمازون بخوانید؛ بعد، با نیاز آشپزخانهٔ خودتان تصمیم بگیرید.",
    ratingTitle: "امتیاز در آمازون آمریکا",
    outOf: "از ۵",
    ratings: "امتیاز ثبت‌شده",
    checked: "بررسی در",
    scope:
      "امتیاز مربوط به صفحهٔ آمازون آمریکای دیگ ریحانه است؛ نه همهٔ بازارها. آمازون ممکن است امتیاز چند مدل را یک‌جا نمایش بدهد.",
    sourceAction: "دیدن امتیاز در آمازون",
    reviewsAction: "خواندن نظرهای اصلی خریداران",
    sourceNote:
      "امتیازها با نظرهای تازه تغییر می‌کنند؛ مقدار به‌روز را در آمازون ببینید. آمازون ممکن است برای خواندن نظرها ورود بخواهد.",
    empty: "برای خواندن تجربه‌ها، صفحهٔ اصلی نظرهای آمازون را باز کنید.",
    translation: "ترجمهٔ دری از متن اصلی",
    original: "متن اصلی نظر",
    verifiedPurchase: "خرید تأییدشده در آمازون",
    quoteSource: "نظرهای این محصول در آمازون آمریکا",
    quoteScope: "تجربهٔ همین خریدار؛ نه تضمین نتیجه برای همه.",
    selectedNote:
      "گزیده‌ای از نظرهای ارسالی آمازون آمریکا؛ این انتخاب، نمایندهٔ تمام نظرهای مشتریان نیست.",
    fullReview: "متن کامل نظر و اصل انگلیسی",
    fullTranslation: "ترجمهٔ کامل دری",
    translatedExcerpt: "گزیدهٔ نظر؛ ترجمهٔ دری از متن اصلی",
    originalExcerpt: "گزیدهٔ متن اصلی",
    marketplace: "نظر ثبت‌شده در آمازون آمریکا",
    viewMore: "دیدن ۲ نظر دیگر",
    viewLess: "نمایش کمتر",
    principle: "انتخاب خوب، با خواندن همهٔ جوانب شروع می‌شود.",
  },
  en: {
    eyebrow: "03 / CUSTOMER EXPERIENCES",
    title: "Before you choose,\nhear from other buyers.",
    body: "How did the pot fit into everyday cooking? Which size and model did buyers use? Read the positive experiences and critical details on Amazon, then choose for your own kitchen.",
    ratingTitle: "Rating on Amazon US",
    outOf: "out of 5",
    ratings: "ratings",
    checked: "Checked on",
    scope:
      "The score is from this Rayhana pot page on Amazon US, not all marketplaces. Amazon may display ratings pooled across variations.",
    sourceAction: "View the rating on Amazon",
    reviewsAction: "Read the original buyer reviews",
    sourceNote:
      "Ratings change as new feedback arrives. See Amazon for the current score. Amazon may require sign-in to read reviews.",
    empty: "Open the original Amazon review page to read buyers’ experiences.",
    translation: "English translation of the original",
    original: "Original review text",
    verifiedPurchase: "Verified Purchase on Amazon",
    quoteSource: "This product’s reviews on Amazon US",
    quoteScope: "This buyer’s experience, not a guarantee for everyone.",
    selectedNote:
      "Selected reviews from the Amazon US screenshots provided to us, not a representative sample of all customer feedback.",
    fullReview: "Read the full review",
    fullTranslation: "Full English translation",
    translatedExcerpt: "Excerpt translated into English",
    originalExcerpt: "Excerpt from the original review",
    marketplace: "Reviewed on Amazon US",
    viewMore: "Show 2 more reviews",
    viewLess: "Show fewer reviews",
    principle: "A considered choice starts with the full picture.",
  },
  ps: {
    eyebrow: "۰۳ / د پېرودونکو تجربې",
    title: "له انتخاب مخکې،\nد پېرودونکو خبرې واورئ.",
    body: "دیګ په ورځني پخلي کې څنګه و؟ پېرودونکو کومه اندازه او ماډل کارولی؟ په آمازون کې ښې تجربې او انتقادي خبرې ولولئ، بیا د خپل پخلنځي د اړتیا له مخې انتخاب وکړئ.",
    ratingTitle: "په آمازون امریکا کې امتیاز",
    outOf: "له ۵ څخه",
    ratings: "ثبت شوي امتیازونه",
    checked: "د کتنې نېټه",
    scope:
      "دا امتیاز په آمازون امریکا کې د ریحانې د دیګ د همدې پاڼې دی، نه د ټولو بازارونو. آمازون ښايي د څو ماډلونو امتیازونه یوځای وښيي.",
    sourceAction: "په آمازون کې امتیاز وګورئ",
    reviewsAction: "د پېرودونکو اصلي نظرونه ولولئ",
    sourceNote:
      "امتیازونه له نویو نظرونو سره بدلېږي؛ تازه امتیاز په آمازون کې وګورئ. د نظرونو لوستلو لپاره ښايي ننوتل وغواړي.",
    empty: "د تجربو لوستلو لپاره د آمازون د اصلي نظرونو پاڼه پرانیزئ.",
    translation: "د اصلي متن پښتو ژباړه",
    original: "د نظر اصلي متن",
    verifiedPurchase: "په آمازون کې تایید شوی پېرود",
    quoteSource: "په آمازون امریکا کې د دې محصول نظرونه",
    quoteScope: "د همدې پېرودونکي تجربه؛ د ټولو لپاره تضمین نه دی.",
    selectedNote:
      "د آمازون امریکا له رالېږل شوو انځورونو ټاکل شوي نظرونه؛ دا د ټولو پېرودونکو د نظرونو استازیتوب نه کوي.",
    fullReview: "بشپړ نظر او اصلي انګلیسي متن",
    fullTranslation: "بشپړه پښتو ژباړه",
    translatedExcerpt: "د نظر یوه برخه؛ د اصلي متن پښتو ژباړه",
    originalExcerpt: "د اصلي نظر یوه برخه",
    marketplace: "په آمازون امریکا کې ثبت شوی نظر",
    viewMore: "۲ نور نظرونه وګورئ",
    viewLess: "لږ نظرونه وښایئ",
    principle: "ښه انتخاب د ټولو اړخونو په لوستلو پیلېږي.",
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
