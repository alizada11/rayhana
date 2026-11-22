import React from "react";
import { ArrowUpRight, MessageSquare, Star } from "lucide-react";
import type { Language } from "@/blackfriday/redesign/data/catalog";
import { reviewSource } from "@/blackfriday/redesign/data/campaign";
import {
  amazonRating,
  customerTestimonials,
  hasVerifiedPurchase,
  publishableTestimonials,
  reviewDate,
  testimonialCopy,
  verifiedRatingCount,
  verifiedRatingScore,
  type CustomerTestimonial,
} from "@/blackfriday/redesign/data/testimonials";

function RatingStars({ score }: { score: number }) {
  return (
    <span className="tm-stars" aria-hidden="true" dir="ltr">
      {Array.from({ length: 5 }, (_, i) => (
        <span className="tm-one-star" key={i}>
          <Star
            size={24}
            fill="currentColor"
            strokeWidth={1.2}
            className="tm-star-base"
          />
          <span
            className="tm-single-fill"
            style={{ width: `${Math.min(1, Math.max(0, score - i)) * 100}%` }}
          >
            <Star size={24} fill="currentColor" strokeWidth={1.2} />
          </span>
        </span>
      ))}
    </span>
  );
}

function ReviewCard({
  review: q,
  language,
}: {
  review: CustomerTestimonial;
  language: Language;
}) {
  const c = testimonialCopy[language];
  const isTranslated =
    language !== q.originalLanguage && !!q.translations[language];
  const isExcerpt = !!q.excerpt && q.excerpt !== q.originalText;
  const fullText = isTranslated ? q.translations[language]! : q.originalText;
  const shortText = isExcerpt
    ? isTranslated
      ? q.excerptTranslations?.[language] || fullText
      : q.excerpt!
    : fullText;
  const title = isTranslated
    ? q.titleTranslations?.[language] || q.originalTitle
    : q.originalTitle;
  const individualScore =
    q.scoreVerified &&
    typeof q.score === "number" &&
    Number.isFinite(q.score) &&
    q.score >= 0 &&
    q.score <= 5
      ? q.score
      : null;
  const number = new Intl.NumberFormat(
    language === "en" ? "en" : language === "fa" ? "fa-AF" : "ps-AF"
  );
  const bodyLanguage = isTranslated ? language : q.originalLanguage;
  const variant = q.variantTranslations?.[language] || q.variant;
  return (
    <article className="tm-quote" data-review-id={q.id}>
      <header>
        <span className="tm-reviewer" dir="auto">
          {q.displayName}
        </span>
        <time dateTime={q.reviewedAt}>
          {reviewDate(q.reviewedAt, language)}
        </time>
      </header>
      {title && (
        <h3
          className="tm-quote-title font-serif"
          lang={bodyLanguage}
          dir={bodyLanguage === "en" ? "ltr" : "rtl"}
        >
          {title}
        </h3>
      )}
      <div className="tm-review-meta">
        {individualScore !== null && (
          <span className="tm-individual-score">
            <Star size={15} fill="currentColor" aria-hidden="true" />
            <span>
              {number.format(individualScore)} {c.outOf}
            </span>
          </span>
        )}
        {hasVerifiedPurchase(q) && (
          <span className="tm-verified">{c.verifiedPurchase}</span>
        )}
      </div>
      <blockquote
        lang={bodyLanguage}
        dir={bodyLanguage === "en" ? "ltr" : "rtl"}
      >
        {shortText}
      </blockquote>
      {isTranslated && (
        <p className="tm-translation-label">
          {isExcerpt ? c.translatedExcerpt : c.translation}
        </p>
      )}
      {!isTranslated && isExcerpt && (
        <p className="tm-translation-label">{c.originalExcerpt}</p>
      )}
      {(isTranslated || isExcerpt) && (
        <details className="tm-full-review">
          <summary>{isExcerpt ? c.fullReview : c.original}</summary>
          {isTranslated && isExcerpt && (
            <>
              <p className="tm-full-label">{c.fullTranslation}</p>
              <p lang={language} dir={language === "en" ? "ltr" : "rtl"}>
                {fullText}
              </p>
            </>
          )}
          {isExcerpt && <p className="tm-full-label">{c.original}</p>}
          {q.originalTitle && (
            <p
              className="tm-original-title"
              lang={q.originalLanguage}
              dir={q.originalLanguage === "en" ? "ltr" : "rtl"}
            >
              {q.originalTitle}
            </p>
          )}
          <p
            lang={q.originalLanguage}
            dir={q.originalLanguage === "en" ? "ltr" : "rtl"}
          >
            {q.originalText}
          </p>
        </details>
      )}
      {variant && <p className="tm-variant">{variant}</p>}
      <a
        href={q.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="tm-source-action"
      >
        {c.quoteSource}
        <ArrowUpRight size={15} aria-hidden="true" />
      </a>
    </article>
  );
}

export default function Testimonials({ language }: { language: Language }) {
  const c = testimonialCopy[language];
  const score = verifiedRatingScore(amazonRating);
  const count = verifiedRatingCount(amazonRating);
  const quotes = publishableTestimonials(customerTestimonials);
  const number = new Intl.NumberFormat(
    language === "en" ? "en" : language === "fa" ? "fa-AF" : "ps-AF",
    { maximumFractionDigits: 1 }
  );
  return (
    <section
      id="reviews"
      className="testimonials-section"
      dir={language === "en" ? "ltr" : "rtl"}
      aria-labelledby="testimonials-title"
    >
      <div className="section-shell">
        <header className="tm-intro">
          <p className="eyebrow">{c.eyebrow}</p>
          <h2 className="font-serif" id="testimonials-title">{c.title}</h2>
          <p>{c.body}</p>
        </header>
        <div
          className={`tm-layout${score === null ? " tm-layout--no-score" : ""}`}
        >
          {score !== null && (
            <aside className="tm-rating" aria-labelledby="amazon-rating-title">
              <p className="tm-rating-label" id="amazon-rating-title">
                {c.ratingTitle}
              </p>
              <span className="tm-market" dir="ltr">
                {amazonRating.marketplace}
              </span>
              <div className="tm-score">
                <strong>{number.format(score)}</strong>
                <span>{c.outOf}</span>
              </div>
              <RatingStars score={score} />
              {count !== null && (
                <p className="tm-rating-count">
                  {number.format(count)} {c.ratings}
                </p>
              )}
              <p className="tm-observed">
                {c.checked}{" "}
                <time dateTime={amazonRating.observedAt}>
                  {reviewDate(amazonRating.observedAt, language)}
                </time>
              </p>
              <p className="tm-scope">{c.scope}</p>
              <a
                className="tm-source-action"
                href={amazonRating.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {c.sourceAction}
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </aside>
          )}
          <div className="tm-experiences">
            {quotes.length > 0 ? (
              <>
                <p className="tm-selected-note">{c.selectedNote}</p>
                <div className="tm-quotes">
                  {quotes.slice(0, 3).map(q => (
                    <ReviewCard key={q.id} review={q} language={language} />
                  ))}
                </div>
                {quotes.length > 3 && (
                  <details className="tm-more-reviews">
                    <summary>
                      <span className="tm-more-closed">{c.viewMore}</span>
                      <span className="tm-more-open">{c.viewLess}</span>
                    </summary>
                    <div className="tm-quotes">
                      {quotes.slice(3).map(q => (
                        <ReviewCard key={q.id} review={q} language={language} />
                      ))}
                    </div>
                  </details>
                )}
              </>
            ) : (
              <div className="tm-read-invitation">
                <MessageSquare size={32} strokeWidth={1.2} aria-hidden="true" />
                <p>{c.empty}</p>
              </div>
            )}
            <a
              href={reviewSource}
              className="button outline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {c.reviewsAction}
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
            <p className="tm-current-note">{c.sourceNote}</p>
          </div>
        </div>
        <p className="tm-principle">
          {c.quoteScope} {c.principle}
        </p>
      </div>
    </section>
  );
}
