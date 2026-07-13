import SeoTags from "@/components/SeoTags";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, FileText, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";

type TermsSection = {
  title: string;
  body: string;
};

function DirectionArrow({ dir }: { dir: string }) {
  const Icon = dir === "rtl" ? ArrowLeft : ArrowRight;
  return <Icon aria-hidden="true" className="h-4 w-4" />;
}

export default function WorldCupTerms() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split("-")[0] || "en";
  const dir = ["fa", "ps"].includes(lang) ? "rtl" : "ltr";
  const predictionHref = ["en", "fa", "ps"].includes(lang)
    ? `~/${lang}/world-cup-prediction`
    : "~/world-cup-prediction";
  const sections = t("world_cup_terms.sections", {
    returnObjects: true,
  }) as TermsSection[];

  return (
    <div
      className={cn(
        "wc-terms-page",
        dir === "rtl" ? "font-vazir" : "font-poppins"
      )}
      dir={dir}
    >
      <SeoTags
        title={t("world_cup_terms.meta_title")}
        description={t("world_cup_terms.subtitle")}
      />
      <header className="wc-terms-header">
        <div className="wc-campaign-container wc-terms-hero">
          <span>
            <FileText className="h-4 w-4" />
            {t("world_cup_terms.kicker")}
          </span>
          <h1 className="font-serif">{t("world_cup_terms.title")}</h1>
          <p>{t("world_cup_terms.subtitle")}</p>
          <div className="wc-terms-hero-actions">
            <span>{t("world_cup_terms.updated")}</span>
            <Button asChild variant="outline" className="wc-terms-hero-button">
              <Link href={predictionHref}>
                {t("world_cup_terms.back")}
                <DirectionArrow dir={dir} />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="wc-campaign-container wc-terms-layout">
        <aside className="wc-terms-sidebar">
          <strong>{t("world_cup_terms.title")}</strong>
          {sections.map((section, index) => (
            <a key={section.title} href={`#term-${index + 1}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {section.title}
            </a>
          ))}
        </aside>

        <article>
          <div className="wc-terms-summary">
            <ShieldCheck className="h-6 w-6" />
            <div>
              <strong>{t("world_cup_terms.summary_title")}</strong>
              <p>{t("world_cup_terms.summary")}</p>
            </div>
          </div>

          {sections.map((section, index) => (
            <section
              key={section.title}
              className="wc-terms-section"
              id={`term-${index + 1}`}
            >
              <div className="wc-terms-section-title">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h2 className="font-serif">{section.title}</h2>
              </div>
              <div className="wc-terms-section-body">
                <p>{section.body}</p>
              </div>
            </section>
          ))}

          <div className="wc-terms-final">
            <strong>{t("world_cup_terms.summary_title")}</strong>
            <p>{t("world_cup_terms.summary")}</p>
            <Button asChild>
              <Link href={predictionHref}>
                {t("world_cup_terms.back")}
                <DirectionArrow dir={dir} />
              </Link>
            </Button>
          </div>
        </article>
      </main>
    </div>
  );
}
