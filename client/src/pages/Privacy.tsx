import { Link } from "wouter";
import { useContent } from "@/hooks/useContent";
import { useTranslation } from "react-i18next";
import DOMPurify from "dompurify";
import SeoTags from "@/components/SeoTags";

export default function Privacy() {
  const { data } = useContent("privacy");
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language as "en" | "fa" | "ps";

  const getLocalized = (obj: any, fallback: string) =>
    obj?.[currentLang] || obj?.en || fallback;

  const effectiveDate = data?.data?.effectiveDate || "February 7, 2026";
  const title = getLocalized(data?.data?.title, "Privacy Policy");
  const intro = getLocalized(
    data?.data?.intro,
    "This Privacy Policy explains how we collect, use, and protect your information."
  );
  const sanitizedIntro = DOMPurify.sanitize(intro);
  const sections = Array.isArray(data?.data?.sections)
    ? data?.data?.sections
    : [];
  const plainIntro = intro.replace(/<[^>]*>/g, "").trim();
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <SeoTags
        pageKey="privacy"
        title={title}
        description={plainIntro}
        url={`${import.meta.env.VITE_BASE_URL || ""}/privacy`}
      />
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary">
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
              key={`${section.title}-${index}`}
              className="bg-card border rounded-xl p-6"
            >
              <h2 className="font-serif text-xl font-semibold text-foreground">
                {getLocalized(section.title, `Section ${index + 1}`)}
              </h2>
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
          {t("privacy.needHelp", "Need help? Visit the")}{" "}
          <Link href="/help" className="text-primary hover:underline">
            {t("help.centerTitle", "Help Center")}
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
