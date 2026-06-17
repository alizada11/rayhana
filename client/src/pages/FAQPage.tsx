import FAQ from "@/components/FAQ";
import SeoTags from "@/components/SeoTags";
import { useContent } from "@/hooks/useContent";
import { useTranslation } from "react-i18next";

export default function FAQPage() {
  const { data } = useContent("faq");
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as "en" | "fa" | "ps";
  const getLocalized = (obj: any, fallback: string) =>
    obj?.[currentLang] || obj?.en || fallback;

  const title = getLocalized(data?.data?.title, t("faq.title"));
  const subtitle = getLocalized(data?.data?.subtitle, t("faq.subtitle"));
  const items = Array.isArray(data?.data?.items) ? data?.data?.items : undefined;

  return (
    <div className="min-h-screen bg-background">
      <SeoTags
        pageKey="faq"
        title={title}
        description={subtitle}
        url={`${import.meta.env.VITE_BASE_URL || ""}/faq`}
      />
      <FAQ
        items={items}
        title={data?.data?.title}
        subtitle={data?.data?.subtitle}
        showPageLink={false}
      />
    </div>
  );
}
