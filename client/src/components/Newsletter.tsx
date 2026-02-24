import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Mail, ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useSubscribeNewsletter } from "@/hooks/useNewsletter";
import { toast } from "sonner";

export function Newsletter() {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const mutation = useSubscribeNewsletter();
  const isRTL = ["fa", "ps"].includes(i18n.language);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    mutation.mutate(
      { email },
      {
        onSuccess: () => {
          setStatus("success");
          setEmail("");
          toast.success(t("newsletter.success_message"));
          setTimeout(() => setStatus("idle"), 4000);
        },
        onError: () => {
          setStatus("idle");
          toast.error(t("common.error", "Failed to subscribe"));
        },
      }
    );
  };

  return (
    <section className="py-20 relative overflow-hidden bg-primary/5 dark:bg-primary/15">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 dark:via-primary/25 to-transparent" />

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white dark:bg-stone-900 rounded-3xl p-8 md:p-12 border border-primary/10 dark:border-primary/15 shadow-xl relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/12 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/12 rounded-full blur-3xl" />

          <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
            <div className="space-y-4 text-center md:text-start">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/25 text-primary dark:text-primary mb-2">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary dark:text-primary">
                {t("newsletter.title")}
              </h2>
              <p className="text-stone-600 dark:text-stone-400">
                {t("newsletter.subtitle")}
              </p>
            </div>

            <div className="w-full">
              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 rounded-xl p-6 text-center"
                  >
                    <div className="w-12 h-12 bg-primary/15 dark:bg-primary/30 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Check className="w-6 h-6 text-primary dark:text-primary" />
                    </div>
                    <h3 className="font-serif font-bold text-primary dark:text-primary mb-1">
                      {t("newsletter.success_title")}
                    </h3>
                    <p className="text-sm text-primary/80 dark:text-primary/80">
                      {t("newsletter.success_message")}
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    <div className="relative">
                      <Input
                        type="email"
                        placeholder={t("newsletter.placeholder")}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className={`
                                h-14 rounded-full bg-stone-50 dark:bg-stone-800
                                border-stone-200 dark:border-stone-700
                                focus:border-primary focus:ring-primary
                                text-base
                                ${isRTL ? "pr-6 pl-16" : "pl-6 pr-16"}
                              `}
                      />

                      <Button
                        type="submit"
                        disabled={status === "loading"}
                        className={`
      absolute top-1.5 bottom-1.5
      ${isRTL ? "left-1.5" : "right-1.5"}
      rounded-full aspect-square p-0
      bg-primary hover:bg-primary/90
      text-white h-11 w-11 shadow-md
      flex items-center justify-center
    `}
                      >
                        {status === "loading" ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <ArrowRight
                            className={`w-5 h-5 transition-transform ${
                              isRTL ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </Button>
                    </div>

                    <p className="text-xs text-stone-500 dark:text-stone-400 text-center md:text-start px-2">
                      {t("newsletter.disclaimer")}
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
