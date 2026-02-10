import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { useContent } from "@/hooks/useContent";
import DOMPurify from "dompurify";

export default function FAQ() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as "en" | "fa" | "ps";
  const { data: faqContent } = useContent("faq");

  const getLocalized = (obj: any, fallback: string) =>
    obj?.[currentLang] || obj?.en || fallback;
  const toPlainText = (value?: string) =>
    typeof value === "string"
      ? DOMPurify.sanitize(value, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim()
      : "";

  type Question = { id: string; question: string; answer: string };

  const questions: Question[] = faqContent?.data?.items?.map(
    (item: any, index: number): Question => ({
      id: item?.id || `q${index + 1}`,
      question: toPlainText(
        getLocalized(item?.question, t(`faq.q${index + 1}`))
      ),
      answer: toPlainText(getLocalized(item?.answer, t(`faq.a${index + 1}`))),
    })
  ) ?? [
    { id: "q1", question: toPlainText(t("faq.q1")), answer: toPlainText(t("faq.a1")) },
    { id: "q2", question: toPlainText(t("faq.q2")), answer: toPlainText(t("faq.a2")) },
    { id: "q3", question: toPlainText(t("faq.q3")), answer: toPlainText(t("faq.a3")) },
    { id: "q4", question: toPlainText(t("faq.q4")), answer: toPlainText(t("faq.a4")) },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-4">
            {getLocalized(faqContent?.data?.title, t("faq.title"))}
          </h2>
          <p className="text-muted-foreground text-lg">
            {getLocalized(faqContent?.data?.subtitle, t("faq.subtitle"))}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="w-full space-y-4">
            {questions.map((item: Question, index: number) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="bg-card border rounded-lg px-4 shadow-sm"
              >
                <AccordionTrigger className="text-left font-medium text-lg py-4 hover:no-underline hover:text-primary transition-colors">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
