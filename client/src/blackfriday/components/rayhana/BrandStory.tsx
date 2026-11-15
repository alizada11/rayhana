import React from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { brandStoryCopy } from "@/blackfriday/data/brandStory";
import { media, type Language } from "@/blackfriday/data/catalog";

export default function BrandStory({
  language,
  imageAlt,
}: {
  language: Language;
  imageAlt: string;
}) {
  const c = brandStoryCopy[language];
  const Arrow = language === "en" ? ArrowRight : ArrowLeft;
  const number = new Intl.NumberFormat(
    language === "en" ? "en" : language === "fa" ? "fa-AF" : "ps-AF"
  );
  return (
    <section
      id="story"
      className="brand-story-section"
      dir={language === "en" ? "ltr" : "rtl"}
      aria-labelledby="brand-story-title"
    >
      <div className="section-shell">
        <header className="bs-intro">
          <div>
            <p className="eyebrow">{c.eyebrow}</p>
            <h2 id="brand-story-title">{c.title}</h2>
          </div>
          <p className="bs-intro-text">{c.intro}</p>
        </header>
        <div className="bs-layout">
          <figure className="bs-photo">
            <img
              src={media.potStory}
              alt={imageAlt}
              loading="lazy"
              width="1100"
              height="900"
            />
            <figcaption>{c.caption}</figcaption>
          </figure>
          <div className="bs-narrative">
            <ol className="bs-chapters">
              {c.chapters.map((chapter, index) => (
                <li key={chapter.label}>
                  <span className="bs-scene-number" aria-hidden="true">
                    {number.format(index + 1)}
                  </span>
                  <div>
                    <p className="bs-scene-label">{chapter.label}</p>
                    <h3>{chapter.title}</h3>
                    <p>{chapter.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="bs-actions">
              <a href="#community" className="button primary">
                {c.action}
                <Arrow size={18} aria-hidden="true" />
              </a>
              <a href="#pot" className="bs-secondary">
                {c.secondaryAction}
                <Arrow size={16} aria-hidden="true" />
              </a>
            </div>
            <p className="bs-signature" dir="ltr" lang="en">
              {c.signature}
            </p>
            <a
              href="https://www.rayhana.com/en/about"
              target="_blank"
              rel="noopener noreferrer"
              className="bs-source"
            >
              {c.sourceLabel}
              <ArrowUpRight size={13} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
