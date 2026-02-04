import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone, Instagram, Facebook } from "lucide-react";

export default function Contact() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa';

  return (
    <div className="min-h-screen py-20">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-20 space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-4xl md:text-6xl font-bold text-primary"
          >
            {t('contact_page.title')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            {t('contact_page.subtitle')}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          {/* Contact Info */}
          <motion.div 
            initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div>
              <h2 className="font-serif text-2xl font-bold mb-8 text-foreground">
                {t('contact_page.info_title')}
              </h2>
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">{t('contact_page.address')}</h3>
                    <p className="text-muted-foreground">
                      {t('contact_page.address_value')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">{t('contact_page.phone')}</h3>
                    <p className="text-muted-foreground" dir="ltr">
                      +86 18480366600
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">{t('contact_page.email')}</h3>
                    <p className="text-muted-foreground">
                      {t('contact_page.email_value')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-4">{t('contact_page.socials')}</h3>
              <div className="flex gap-4">
                <a 
                  href="https://instagram.com/rayhanafamily" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a 
                  href="https://facebook.com/rayhanafamily" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-card p-8 rounded-3xl shadow-lg border border-border/50"
          >
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('contact_page.form_name')}</label>
                  <Input placeholder={t('contact_page.form_name')} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('contact_page.form_email')}</label>
                  <Input type="email" placeholder={t('contact_page.form_email')} />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('contact_page.form_subject')}</label>
                <Input placeholder={t('contact_page.form_subject')} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t('contact_page.form_message')}</label>
                <Textarea 
                  placeholder={t('contact_page.form_message')} 
                  className="min-h-[150px] resize-none"
                />
              </div>

              <Button type="submit" size="lg" className="w-full">
                {t('contact_page.form_submit')}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
