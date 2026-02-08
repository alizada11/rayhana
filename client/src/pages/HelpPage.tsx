import { Link, useRoute } from "wouter";
import { useContent } from "@/hooks/useContent";
import { useTranslation } from "react-i18next";
import DOMPurify from "dompurify";

export default function HelpPage() {
  const [match, params] = useRoute("/help/:slug");
  const { data } = useContent("help");
  const { i18n } = useTranslation();
  const currentLang = i18n.language as "en" | "fa" | "ps";
  const contactEmail = data?.data?.center?.contactEmail || "info@rayhana.com";

  if (!match || !params?.slug) return null;

  const getLocalized = (obj: any, fallback: string) =>
    obj?.[currentLang] || obj?.en || fallback;

  const articles = Array.isArray(data?.data?.articles) ? data?.data?.articles : [];
  const article = articles.find((item: any) => item.slug === params.slug);

  if (!article) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl font-serif font-bold text-primary">
            Help Article Not Found
          </h1>
          <p className="text-muted-foreground mt-3">
            The help page you are looking for does not exist.
          </p>
          <Link
            href="/help"
            className="inline-flex mt-6 text-primary hover:underline"
          >
            Back to Help Center
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-sm text-muted-foreground">
          <Link href="/help" className="hover:underline">
            Help Center
          </Link>{" "}
          / {getLocalized(article.title, "Help Article")}
        </div>

        <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mt-4">
          {getLocalized(article.title, "Help Article")}
        </h1>
        <p className="text-muted-foreground mt-2">
          Last updated: {article.updated || "February 7, 2026"}
        </p>

        <div className="mt-8 bg-card border rounded-2xl p-6">
          <div
            className="text-foreground prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                getLocalized(article.intro, "")
              ),
            }}
          />
        </div>

        <div className="mt-8 space-y-6">
          <section className="bg-white border rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-foreground">
              Step-by-step
            </h2>
            <div
              className="mt-3 text-muted-foreground prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  getLocalized(article.steps, "")
                ),
              }}
            />
          </section>

          <section className="bg-white border rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-foreground">Tips</h2>
            <div
              className="mt-3 text-muted-foreground prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  getLocalized(article.tips, "")
                ),
              }}
            />
          </section>
        </div>

        <div className="mt-10 text-sm text-muted-foreground">
          Still need help? Email{" "}
          <span className="font-medium text-foreground">{contactEmail}</span>.
        </div>
      </div>
    </div>
  );
}
