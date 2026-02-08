import { Link } from "wouter";
import type { ComponentType } from "react";
import {
  ArrowRight,
  LifeBuoy,
  Package,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useContent } from "@/hooks/useContent";
import { useTranslation } from "react-i18next";
import DOMPurify from "dompurify";

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  lifeBuoy: LifeBuoy,
  package: Package,
  refresh: RefreshCw,
  shield: ShieldCheck,
};

export default function HelpCenter() {
  const { data } = useContent("help");
  const { i18n } = useTranslation();
  const currentLang = i18n.language as "en" | "fa" | "ps";

  const getLocalized = (obj: any, fallback: string) =>
    obj?.[currentLang] || obj?.en || fallback;

  const title = getLocalized(data?.data?.center?.title, "Help Center");
  const subtitle = getLocalized(
    data?.data?.center?.subtitle,
    "Find quick answers or browse detailed help articles."
  );
  const contactEmail = data?.data?.center?.contactEmail || "info@rayhana.com";
  const helpSections = Array.isArray(data?.data?.center?.sections)
    ? data?.data?.center?.sections
    : [];
  const faqs = Array.isArray(data?.data?.center?.faqs)
    ? data?.data?.center?.faqs
    : [];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary">
            {title}
          </h1>
          <p className="text-muted-foreground mt-3">
            {subtitle}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {helpSections.map((section: any) => {
            const Icon = ICONS[section.icon] || LifeBuoy;
            return (
              <Link
                key={section.slug}
                href={`/help/${section.slug || ""}`}
                className="group border rounded-2xl p-6 bg-card hover:border-primary/60 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-foreground group-hover:text-primary">
                      {getLocalized(section.title, "Help Topic")}
                    </h2>
                    <p className="text-muted-foreground mt-2">
                      {getLocalized(section.description, "")}
                    </p>
                    <div className="mt-4 inline-flex items-center text-sm text-primary">
                      Read more <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 bg-muted/40 border rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-serif font-bold text-foreground">
            Popular Questions
          </h2>
          <div className="mt-4 space-y-4">
            {faqs.map((item: any, index: number) => (
              <div key={`${item.question}-${index}`} className="border-b border-border pb-4">
                <p className="font-medium text-foreground">
                  {getLocalized(item.question, "Question")}
                </p>
                <div
                  className="text-muted-foreground mt-2 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      getLocalized(item.answer, "")
                    ),
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 text-sm text-muted-foreground">
          Need more help? Email us at{" "}
          <span className="font-medium text-foreground">{contactEmail}</span>.
        </div>
      </div>
    </div>
  );
}
