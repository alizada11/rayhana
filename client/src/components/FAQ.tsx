import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { decodeHtml, sanitizeHtml, stripHtml } from "@/lib/safeHtml";

type FAQItem = { id?: string; question: any; answer: any };

export default function FAQ({
  items,
  title,
  subtitle,
  showPageLink = true,
  maxItems,
}: {
  items?: FAQItem[];
  title?: any;
  subtitle?: any;
  showPageLink?: boolean;
  maxItems?: number;
}) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as "en" | "fa" | "ps";

  const getLocalized = (obj: any, fallback: string) =>
    obj?.[currentLang] || obj?.en || fallback;
  const toPlainText = (value?: string) =>
    typeof value === "string" ? stripHtml(value) : "";
  const toSafeHtml = (value?: string) =>
    typeof value === "string" ? sanitizeHtml(decodeHtml(value)) : "";

  type Question = { id: string; question: string; answer: string };

  const fromContent = items?.map((item, index): Question => ({
    id: item?.id || `q${index + 1}`,
    question: toPlainText(getLocalized(item?.question, t(`faq.q${index + 1}`))),
    answer: toSafeHtml(getLocalized(item?.answer, t(`faq.a${index + 1}`))),
  }));

  const questions: Question[] = fromContent ?? [
    { id: "q1", question: toPlainText(t("faq.q1")), answer: toSafeHtml(t("faq.a1")) },
    { id: "q2", question: toPlainText(t("faq.q2")), answer: toSafeHtml(t("faq.a2")) },
    { id: "q3", question: toPlainText(t("faq.q3")), answer: toSafeHtml(t("faq.a3")) },
    { id: "q4", question: toPlainText(t("faq.q4")), answer: toSafeHtml(t("faq.a4")) },
  ];
  const visibleQuestions = maxItems ? questions.slice(0, maxItems) : questions;

  return (
    <section className="py-20 bg-muted/30">
      <div className="container max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-4">
            {getLocalized(title, t("faq.title"))}
          </h2>
          <p className="text-muted-foreground text-lg">
            {getLocalized(subtitle, t("faq.subtitle"))}
          </p>
          {showPageLink && (
            <Link
              href="/faq"
              className="mt-4 inline-flex text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              {t("faq.view_all")}
            </Link>
          )}
        </div>

        <div>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {visibleQuestions.map((item: Question, index: number) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="bg-card border rounded-lg px-4 shadow-sm"
              >
                <AccordionTrigger className="text-left font-medium text-lg py-4 hover:no-underline hover:text-primary transition-colors">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                  <div
                    className="prose prose-sm max-w-none text-muted-foreground prose-ol:list-decimal prose-ul:list-disc prose-li:my-1"
                    dangerouslySetInnerHTML={{ __html: item.answer }}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
