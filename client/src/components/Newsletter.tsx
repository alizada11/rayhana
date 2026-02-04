import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Mail, ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function Newsletter() {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const isRTL = i18n.language === 'fa';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus("loading");
    // Simulate API call
    setTimeout(() => {
      setStatus("success");
      setEmail("");
      // Reset status after 5 seconds
      setTimeout(() => setStatus("idle"), 5000);
    }, 1500);
  };

  return (
    <section className="py-20 relative overflow-hidden bg-amber-900/5 dark:bg-amber-900/10">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-900/20 dark:via-amber-500/20 to-transparent" />
      
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white dark:bg-stone-900 rounded-3xl p-8 md:p-12 border border-amber-900/10 dark:border-amber-500/10 shadow-xl relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />

          <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
            <div className="space-y-4 text-center md:text-start">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 mb-2">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-amber-900 dark:text-amber-500">
                {t('newsletter.title')}
              </h2>
              <p className="text-stone-600 dark:text-stone-400">
                {t('newsletter.subtitle')}
              </p>
            </div>

            <div className="w-full">
              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-xl p-6 text-center"
                  >
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Check className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="font-bold text-amber-800 dark:text-amber-300 mb-1">
                      {t('newsletter.success_title')}
                    </h3>
                    <p className="text-sm text-amber-700 dark:text-amber-400/80">
                      {t('newsletter.success_message')}
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
                        placeholder={t('newsletter.placeholder')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`h-14 rounded-full bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 focus:border-amber-500 focus:ring-amber-500 pl-6 ${isRTL ? 'pr-6 pl-16' : 'pr-16 pl-6'} text-base`}
                        required
                      />
                      <Button 
                        type="submit" 
                        disabled={status === "loading"}
                        className={`absolute top-1.5 bottom-1.5 ${isRTL ? 'left-1.5' : 'right-1.5'} rounded-full aspect-square p-0 bg-amber-700 hover:bg-amber-800 text-white h-11 w-11 shadow-md`}
                      >
                        {status === "loading" ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 text-center md:text-start px-2">
                      {t('newsletter.disclaimer')}
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
