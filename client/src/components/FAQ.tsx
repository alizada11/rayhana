import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

export default function FAQ() {
  const { t } = useTranslation();

  const questions = [
    { id: "q1", question: t("faq.q1"), answer: t("faq.a1") },
    { id: "q2", question: t("faq.q2"), answer: t("faq.a2") },
    { id: "q3", question: t("faq.q3"), answer: t("faq.a3") },
    { id: "q4", question: t("faq.q4"), answer: t("faq.a4") },
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
            {t("faq.title")}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t("faq.subtitle")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="w-full space-y-4">
            {questions.map((item, index) => (
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
