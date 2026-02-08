import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowRight, Check, Star, ShieldCheck } from "lucide-react";

import { CustomerGallery } from "@/components/CustomerGallery";
import FeaturedBlogSection from "@/components/FeaturedBlogSection";
import { Newsletter } from "@/components/Newsletter";
import FAQ from "@/components/FAQ";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useContent } from "@/hooks/useContent";
import DOMPurify from "dompurify";

export default function Home() {
  const { t, i18n } = useTranslation();
  const isRTL = ["fa", "ps"].includes(i18n.language);
  const currentLang = i18n.language as "en" | "fa" | "ps";
  const { data: homeContent } = useContent("home");

  const getLocalized = (obj: any, fallback: string) =>
    obj?.[currentLang] || obj?.en || fallback;

  const heroTitle = getLocalized(
    homeContent?.data?.hero?.title,
    t("hero.title")
  );
  const heroSubtitle = getLocalized(
    homeContent?.data?.hero?.subtitle,
    t("hero.subtitle")
  );
  const heroCta = getLocalized(homeContent?.data?.hero?.cta, t("hero.cta"));
  const heroMedia =
    typeof homeContent?.data?.images?.heroVideo === "string"
      ? homeContent.data.images.heroVideo
      : "/images/hero-video.mp4";
  const isHeroVideo = /\.(mp4|webm|ogg)$/i.test(heroMedia);
  const featuredImage =
    homeContent?.data?.images?.featuredProduct || "/images/home-hero-pot.jpg";
  const storyImage =
    homeContent?.data?.images?.storyImage ||
    "/images/home-cooking-experience.jpg";
  const storyTitle = getLocalized(
    homeContent?.data?.story?.title,
    t("about.title")
  );
  const storyBody = getLocalized(
    homeContent?.data?.story?.body,
    i18n.language === "en"
      ? "RAYHANA was born from the longing many immigrants feel for home and the authentic taste of their traditional dishes. We bridge the gap between culture and modernity."
      : "ریحانه از دلتنگی بسیاری از مهاجران برای خانه و طعم اصیل غذاهای سنتی متولد شد. ما پلی بین فرهنگ و مدرنیته هستیم."
  );
  const storyCta = getLocalized(
    homeContent?.data?.story?.cta,
    i18n.language === "en" ? "Read Our Full Story" : "خواندن داستان کامل ما"
  );
  const values = Array.isArray(homeContent?.data?.values)
    ? homeContent.data.values
    : [
        {
          title: t("about.authenticity"),
          body:
            i18n.language === "en"
              ? "Keeping immigrants' cultural roots alive in our products."
              : "حفظ ریشه‌های فرهنگی مهاجران در محصولات ما.",
          icon: "star",
        },
        {
          title: t("about.quality"),
          body:
            i18n.language === "en"
              ? "Certified by SGS for safety and durability."
              : "دارای گواهی SGS برای ایمنی و دوام.",
          icon: "shield",
        },
        {
          title: t("about.connection"),
          body:
            i18n.language === "en"
              ? "Connecting immigrants with the flavors and stories of their homeland."
              : "اتصال مهاجران با طعم‌ها و داستان‌های سرزمین مادری.",
          icon: "globe",
        },
      ];

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Video with Overlay */}
        <div className="absolute inset-0 z-0">
          {isHeroVideo ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            >
              <source src={heroMedia} />
            </video>
          ) : (
            <img
              src={heroMedia}
              alt="Hero"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Content */}
        <div className="container relative z-10 text-center text-white">
          <motion.div
            initial="initial"
            animate="animate"
            variants={stagger}
            className="max-w-3xl mx-auto space-y-6"
          >
            <motion.h1
              variants={fadeIn}
              className="font-serif text-5xl md:text-7xl font-bold leading-tight"
            >
              {heroTitle}
            </motion.h1>
            <motion.p
              variants={fadeIn}
              className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-light"
            >
              {heroSubtitle}
            </motion.p>
            <motion.div variants={fadeIn} className="pt-4">
              <Link href="/products">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white border-none text-lg px-8 py-6 h-auto rounded-full"
                >
                  {heroCta}
                  {isRTL ? (
                    <ArrowRight className="mr-2 h-5 w-5 rotate-180" />
                  ) : (
                    <ArrowRight className="ml-2 h-5 w-5" />
                  )}
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="container">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
        >
          {values.map((value: any, index: number) => {
            const Icon =
              value.icon === "shield"
                ? ShieldCheck
                : value.icon === "globe"
                  ? Globe
                  : Star;
            const valueTitle =
              typeof value.title === "object"
                ? getLocalized(value.title, "")
                : value.title;
            const valueBody =
              typeof value.body === "object"
                ? getLocalized(value.body, "")
                : value.body;
            return (
              <div
                key={`${value.title}-${index}`}
                className="p-6 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors relative overflow-hidden group"
              >
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-2">
                  {valueTitle}
                </h3>
                <div
                  className="text-muted-foreground text-sm mb-4 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(valueBody || ""),
                  }}
                />
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
              </div>
            );
          })}
        </motion.div>
      </section>

      {/* Featured Product */}
      <section className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl"
          >
            <img
              src={featuredImage}
              alt="Rayhana Red Pot"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-primary px-4 py-2 rounded-full text-sm font-bold shadow-lg">
              {t("products.ladle_bonus")}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
              {getLocalized(
                homeContent?.data?.featuredProduct?.title,
                i18n.language === "en"
                  ? "The Perfect Pot for Every Meal"
                  : "دیگ کامل برای هر وعده غذایی"
              )}
            </h2>
            <div
              className="text-lg text-muted-foreground leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  getLocalized(
                    homeContent?.data?.featuredProduct?.description,
                    i18n.language === "en"
                      ? "Designed for the modern kitchen but rooted in tradition. Our non-stick granite coating ensures healthy cooking with less oil, while the premium aluminum body distributes heat evenly for that perfect taste of home."
                      : "طراحی شده برای آشپزخانه مدرن اما ریشه در سنت دارد. پوشش گرانیتی نچسب ما پخت سالم با روغن کمتر را تضمین می‌کند، در حالی که بدنه آلومینیومی ممتاز گرما را به طور یکنواخت توزیع می‌کند تا طعم کامل خانه را تجربه کنید."
                  )
                ),
              }}
            />
            <ul className="space-y-3">
              {(Array.isArray(homeContent?.data?.featuredProduct?.bullets)
                ? homeContent.data.featuredProduct.bullets
                : [
                    { text: { en: "PFOA Free", fa: "", ps: "" } },
                    { text: { en: "FDA Approved", fa: "", ps: "" } },
                    { text: { en: "Durable Granite Coating", fa: "", ps: "" } },
                    { text: { en: "Heat Resistant Handles", fa: "", ps: "" } },
                  ]
              ).map((item: any, index: number) => {
                const text =
                  typeof item === "string"
                    ? item
                    : getLocalized(item.text || item, "");
                return (
                  <li
                    key={`${text}-${index}`}
                    className="flex items-center gap-3 text-foreground/80"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <Check className="w-4 h-4" />
                    </div>
                    {text}
                  </li>
                );
              })}
            </ul>
            <Button size="lg" variant="outline" className="mt-4">
              {t("products.view_details")}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="bg-secondary/30 py-20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="order-2 md:order-1 space-y-6"
            >
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
              {storyTitle}
            </h2>
            <div
              className="text-lg text-muted-foreground leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(storyBody),
              }}
            />
              <Link href="/about">
                <Button
                  variant="link"
                  className="text-primary p-0 text-lg h-auto font-bold"
                >
                  {storyCta}
                  {isRTL ? (
                    <ArrowRight className="mr-2 h-5 w-5 rotate-180" />
                  ) : (
                    <ArrowRight className="ml-2 h-5 w-5" />
                  )}
                </Button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="order-1 md:order-2 relative aspect-video rounded-3xl overflow-hidden shadow-xl"
            >
              <img
                src={storyImage}
                alt="Rayhana Story"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Customer Gallery */}
      <CustomerGallery />

      {/* Featured Blog */}
      <FeaturedBlogSection />

      {/* FAQ Section */}
      <FAQ />

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}

function Globe(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" x2="22" y1="12" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
