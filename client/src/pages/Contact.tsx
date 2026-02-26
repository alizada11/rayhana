import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  MapPin,
  Phone,
  Instagram,
  Facebook,
  Globe,
  MessageSquare,
} from "lucide-react";
import { useContent } from "@/hooks/useContent";
import { useSendContactMessage } from "@/hooks/useContactMessages";
import { toast } from "sonner";
import SeoTags from "@/components/SeoTags";
import { TikTokIcon } from "@/components/TikTokIcon";

type LangKey = "en" | "fa" | "ps";
type LangValue = Record<LangKey, string>;
type IconName =
  | "mapPin"
  | "phone"
  | "mail"
  | "globe"
  | "messageSquare"
  | "instagram"
  | "facebook"
  | "tiktok";

type Hero = { title: LangValue; subtitle: LangValue };
type InfoItem = {
  icon: IconName;
  title: LangValue;
  value: LangValue;
};
type SocialItem = { icon: IconName; label: LangValue; url: string };
type FormContent = {
  nameLabel: LangValue;
  emailLabel: LangValue;
  subjectLabel: LangValue;
  messageLabel: LangValue;
  submitLabel: LangValue;
  successMessage: LangValue;
  errorMessage: LangValue;
};
type Content = {
  hero: Hero;
  info: InfoItem[];
  socials: SocialItem[];
  form: FormContent;
};
export default function Contact() {
  const { t, i18n } = useTranslation();
  const rtlLangs = ["fa", "ps", "ar", "ku"];
  const isRTL = rtlLangs.includes(i18n.language) || i18n.dir?.() === "rtl";
  const supportedLangs: LangKey[] = ["en", "fa", "ps"];
  const currentLang: LangKey = supportedLangs.includes(
    i18n.language as LangKey
  )
    ? (i18n.language as LangKey)
    : "en";
  const { data } = useContent("contact");
  const mutation = useSendContactMessage();
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    website: "", // honeypot
  });

  const content = useMemo<Content>(() => {
    const fallback = {
      hero: {
        title: { en: t("contact_page.title"), fa: "", ps: "" },
        subtitle: { en: t("contact_page.subtitle"), fa: "", ps: "" },
      },
      info: [
        {
          icon: "mapPin",
          title: { en: t("contact_page.address"), fa: "", ps: "" },
          value: { en: t("contact_page.address_value"), fa: "", ps: "" },
        },
        {
          icon: "phone",
          title: { en: t("contact_page.phone"), fa: "", ps: "" },
          value: { en: t("contact_page.phone_value"), fa: "", ps: "" },
        },
        {
          icon: "mail",
          title: { en: t("contact_page.email"), fa: "", ps: "" },
          value: { en: t("contact_page.email_value"), fa: "", ps: "" },
        },
      ],
      socials: [
        {
          icon: "instagram",
          label: { en: "Instagram", fa: "", ps: "" },
          url: "https://instagram.com/rayhanafamily",
        },
        {
          icon: "facebook",
          label: { en: "Facebook", fa: "", ps: "" },
          url: "https://facebook.com/rayhanafamily",
        },
      ],
      form: {
        nameLabel: { en: t("contact_page.form_name"), fa: "", ps: "" },
        emailLabel: { en: t("contact_page.form_email"), fa: "", ps: "" },
        subjectLabel: { en: t("contact_page.form_subject"), fa: "", ps: "" },
        messageLabel: { en: t("contact_page.form_message"), fa: "", ps: "" },
        submitLabel: { en: t("contact_page.form_submit"), fa: "", ps: "" },
        successMessage: {
          en: "Message sent",
          fa: "پیام شما با موفقیت ارسال شد",
          ps: "ستاسو پیام په بریالیتوب سره ثبت شو",
        },
        errorMessage: {
          en: t("common.error", "Failed to send"),
          fa: "",
          ps: "",
        },
      },
    };

    const d = data?.data || {};
    const mergeLang = (src: any, fb: any) => ({
      en: src?.en || fb?.en || "",
      fa: src?.fa || fb?.fa || "",
      ps: src?.ps || fb?.ps || "",
    });

    const hero = {
      title: mergeLang(d?.hero?.title, fallback.hero.title),
      subtitle: mergeLang(d?.hero?.subtitle, fallback.hero.subtitle),
    };

    const info = Array.isArray(d.info)
      ? d.info.map((item: any, idx: number) => ({
          icon: item?.icon || fallback.info[idx % fallback.info.length].icon,
          title: mergeLang(
            item?.title,
            fallback.info[idx % fallback.info.length].title
          ),
          value: mergeLang(
            item?.value,
            fallback.info[idx % fallback.info.length].value
          ),
        }))
      : fallback.info;

    const socials = Array.isArray(d.socials)
      ? d.socials.map((item: any, idx: number) => ({
          icon:
            item?.icon || fallback.socials[idx % fallback.socials.length].icon,
          label: mergeLang(
            item?.label,
            fallback.socials[idx % fallback.socials.length].label
          ),
          url: item?.url || fallback.socials[idx % fallback.socials.length].url,
        }))
      : fallback.socials;

    const form = (Object.keys(fallback.form) as Array<keyof FormContent>).reduce(
      (acc, key) => {
        acc[key] = mergeLang(d?.form?.[key], fallback.form[key]);
        return acc;
      },
      {} as FormContent
    );

    return { hero, info, socials, form };
  }, [data, t, i18n.language]);

  const iconMap: Record<IconName, React.ComponentType<any>> = {
    mapPin: MapPin,
    phone: Phone,
    mail: Mail,
    globe: Globe,
    messageSquare: MessageSquare,
    instagram: Instagram,
    facebook: Facebook,
    tiktok: TikTokIcon,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error(t("common.error", "Please fill required fields"));
      return;
    }
    mutation.mutate(form, {
      onSuccess: () => {
        toast.success(
          content.form.successMessage[currentLang] ||
            t("toast.contact_sent", "Message sent")
        );
        setForm({ name: "", email: "", subject: "", message: "", website: "" });
      },
      onError: () => {
        toast.error(
          content.form.errorMessage[currentLang] ||
            t("common.error", "Failed to send")
        );
      },
    });
  };

  return (
    <div className="min-h-screen py-20">
      <SeoTags
        pageKey="contact"
        title={
          content?.hero?.title?.[currentLang] ||
          t("contact_page.title", "Contact Rayhana")
        }
        description={
          content?.hero?.subtitle?.[currentLang] ||
          t(
            "contact_page.subtitle",
            "Get in touch for support, partnerships, or questions."
          )
        }
        url={`${import.meta.env.VITE_BASE_URL || ""}/contact`}
      />
      <div className="container">
        {/* Header */}
        <div className="text-center mb-20 space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-4xl md:text-6xl font-bold text-primary"
          >
            {content.hero.title[currentLang] || content.hero.title.en}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            {content.hero.subtitle[currentLang] || content.hero.subtitle.en}
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
                {t("contact_page.info_title")}
              </h2>
              <div className="space-y-8">
                {content.info.map(
                  (item: (typeof content.info)[number], idx: number) => {
                    const Icon = iconMap[item.icon] || MapPin;
                    return (
                      <div className="flex items-start gap-4" key={idx}>
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-serif font-bold mb-1">
                            {item.title[currentLang] || item.title.en}
                          </h3>
                          <p
                            dir="ltr"
                            className={
                              isRTL
                                ? "text-right text-muted-foreground"
                                : "text-left text-muted-foreground"
                            }
                          >
                            {item.value[currentLang] || item.value.en}
                          </p>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            <div>
              <h3 className="font-serif font-bold mb-4">
                {t("contact_page.socials")}
              </h3>
              <div className="flex gap-4">
                {content.socials.map((social, idx) => {
                  const SocialIcon = iconMap[social.icon] || Globe;
                  return (
                    <a
                      key={`${social.icon}-${idx}`}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={
                        social.label[currentLang] ||
                        social.label.en ||
                        social.icon
                      }
                      className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-colors"
                    >
                      <SocialIcon className="w-5 h-5" />
                    </a>
                  );
                })}
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
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Honeypot field for bots */}
              <input
                type="text"
                name="website"
                value={form.website}
                onChange={e =>
                  setForm(prev => ({ ...prev, website: e.target.value }))
                }
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="contact-name" className="text-sm font-medium">
                    {content.form.nameLabel[currentLang] ||
                      content.form.nameLabel.en}
                  </label>
                  <Input
                    id="contact-name"
                    placeholder={
                      content.form.nameLabel[currentLang] ||
                      content.form.nameLabel.en
                    }
                    value={form.name}
                    onChange={e =>
                      setForm(prev => ({ ...prev, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="contactemail" className="text-sm font-medium">
                    {content.form.emailLabel[currentLang] ||
                      content.form.emailLabel.en}
                  </label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder={
                      content.form.emailLabel[currentLang] ||
                      content.form.emailLabel.en
                    }
                    value={form.email}
                    onChange={e =>
                      setForm(prev => ({ ...prev, email: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">
                  {content.form.subjectLabel[currentLang] ||
                    content.form.subjectLabel.en}
                </label>
                <Input
                  id="contact-subjec"
                  placeholder={
                    content.form.subjectLabel[currentLang] ||
                    content.form.subjectLabel.en
                  }
                  value={form.subject}
                  onChange={e =>
                    setForm(prev => ({ ...prev, subject: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="contact-message"
                  className="text-sm font-medium"
                >
                  {content.form.messageLabel[currentLang] ||
                    content.form.messageLabel.en}
                </label>
                <Textarea
                  id="contact-message"
                  placeholder={
                    content.form.messageLabel[currentLang] ||
                    content.form.messageLabel.en
                  }
                  className="min-h-[150px] resize-none"
                  value={form.message}
                  onChange={e =>
                    setForm(prev => ({ ...prev, message: e.target.value }))
                  }
                  required
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={mutation.isPending}
              >
                {mutation.isPending
                  ? t("contact.sending", "Sending...")
                  : content.form.submitLabel[currentLang] ||
                    content.form.submitLabel.en}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
