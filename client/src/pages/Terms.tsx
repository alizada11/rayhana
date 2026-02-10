import { Link } from "wouter";
import { useContent } from "@/hooks/useContent";
import { useTranslation } from "react-i18next";
import DOMPurify from "dompurify";

export default function Terms() {
  const { data } = useContent("terms");
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as "en" | "fa" | "ps";
  const isRTL = ["fa", "ps"].includes(currentLang);

  const getLocalized = (obj: any, fallback: string) =>
    obj?.[currentLang] || obj?.en || fallback;

  const effectiveDate = data?.data?.effectiveDate || "February 7, 2026";
  const title = getLocalized(data?.data?.title, "Terms of Service");
  const intro = getLocalized(
    data?.data?.intro,
    "Welcome to Rayhana. These Terms of Service govern your use of our website, products, and services."
  );
  const sanitizedIntro = DOMPurify.sanitize(intro);
  const sections = Array.isArray(data?.data?.sections)
    ? data?.data?.sections
    : [];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-10">
          <h1
            className={`font-serif text-4xl md:text-5xl font-bold text-primary ${
              isRTL ? "font-vazir" : "font-serif"
            }`}
          >
            {title}
          </h1>
          <p className="text-muted-foreground mt-3">
            {t("privacy.effectiveDate", "Effective Date")}: {effectiveDate}
          </p>
        </div>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml -- sanitized via DOMPurify */}
        <div
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizedIntro }}
        />
        <div className="mt-8 space-y-6">
          {sections.map((section: any, index: number) => (
            <section
              key={section?.id ? String(section.id) : `section-${index}`}
              className="bg-card border rounded-xl p-6"
            >
              <h2
                className={`font-serif text-xl font-semibold text-foreground ${
                  isRTL ? "font-vazir" : "font-serif"
                }`}
              >
                {getLocalized(section.title, `Section ${index + 1}`)}
              </h2>
              {/* biome-ignore lint/security/noDangerouslySetInnerHtml -- sanitized via DOMPurify */}
              <div
                className="text-muted-foreground mt-2 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(getLocalized(section.body, "")),
                }}
              />
            </section>
          ))}
        </div>
        <div className="mt-10 text-sm text-muted-foreground">
          {t("terms.footer.needHelp", "Need help? Visit the")}{" "}
          <Link href="/help" className="text-primary hover:underline">
            {t("terms.footer.helpCenter", "Help Center")}
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
