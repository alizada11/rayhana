import { useTranslation } from "react-i18next";
import { ArrowRight, Check, Star, ShieldCheck } from "lucide-react";

import { lazy, Suspense, useEffect, useRef, useState } from "react";
const CustomerGallery = lazy(() =>
  import("@/components/CustomerGallery").then(mod => ({
    default: mod.CustomerGallery,
  }))
);
const FeaturedBlogSection = lazy(
  () => import("@/components/FeaturedBlogSection")
);
const Newsletter = lazy(() =>
  import("@/components/Newsletter").then(mod => ({ default: mod.Newsletter }))
);
const FAQ = lazy(() => import("@/components/FAQ"));
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useContent } from "@/hooks/useContent";
import SeoTags from "@/components/SeoTags";
import ErrorBoundary from "@/components/ErrorBoundary";

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
  const heroMedia = "/images/hero-video.mp4";
  const heroPoster = "/images/hero-poster.jpg";
  const [shouldPlayVideo, setShouldPlayVideo] = useState(false);
  const heroRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mql =
      typeof window !== "undefined"
        ? window.matchMedia("(max-width: 768px)")
        : null;
    const skipVideo = mql?.matches;

    if (skipVideo) {
      setShouldPlayVideo(false);
      return;
    }

    const observer =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            entries => {
              const entry = entries[0];
              if (entry?.isIntersecting) {
                setShouldPlayVideo(true);
                observer.disconnect();
              }
            },
            { threshold: 0.2 }
          )
        : null;

    if (heroRef.current && observer) {
      observer.observe(heroRef.current);
    } else {
      // Fallback: load after idle if IntersectionObserver not available
      requestIdleCallback?.(() => setShouldPlayVideo(true));
    }

    return () => observer?.disconnect();
  }, []);
  const featuredImage =
    typeof homeContent?.data?.images?.featuredProduct === "string"
      ? homeContent.data.images.featuredProduct
      : "";
  const storyImage =
    typeof homeContent?.data?.images?.storyImage === "string"
      ? homeContent.data.images.storyImage
      : "";
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
    t("common.fullStory", "Read our Full Story")
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

  const [purify, setPurify] = useState<typeof import("dompurify").default>();

  useEffect(() => {
    import("dompurify").then(mod =>
      setPurify(mod.default ? mod.default : (mod as any))
    );
  }, []);

  const sanitize = (html: string) =>
    purify ? { __html: purify.sanitize(html || "") } : undefined;

  return (
    <>
      <SeoTags
        pageKey="home"
        title={heroTitle || "Rayhana Afghan Cooking"}
        description={
          heroSubtitle ||
          t(
            "seo.home.description",
            "Discover authentic Afghan recipes, cookware, and stories."
          )
        }
        image={featuredImage}
        url={`${import.meta.env.VITE_BASE_URL || ""}/`}
      />
      <div className="flex flex-col gap-20 pb-20">
        {/* Hero Section */}
        <section
          ref={heroRef}
          className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden"
        >
          {/* Background Video with Overlay */}
          <div className="absolute inset-0 z-0">
            {shouldPlayVideo ? (
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="none"
                poster={heroPoster}
                className="w-full h-full object-cover"
              >
                <source src={heroMedia} />
              </video>
            ) : (
              <img
                fetchPriority="high"
                src={heroPoster}
                alt="Rayhana hero"
                className="w-full h-full object-cover"
                loading="eager"
              />
            )}
            <div className="absolute inset-0 bg-black/50" />
          </div>

          {/* Content */}
          <div className="container relative z-10 text-center text-white">
            <div className="max-w-3xl mx-auto space-y-6">
              <h1 className="font-serif text-5xl md:text-7xl font-bold leading-tight">
                {heroTitle}
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-light">
                {heroSubtitle}
              </p>
              <div className="pt-4">
                <Link href="/products">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-white border-none text-lg px-6 py-3 h-auto rounded-full"
                  >
                    {heroCta}
                    {isRTL ? (
                      <ArrowRight className="mr-2 h-5 w-5 rotate-180" />
                    ) : (
                      <ArrowRight className="ml-2 h-5 w-5" />
                    )}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
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
                  {/* biome-ignore: lint/security/noDangerouslySetInnerHtml -- sanitized via DOMPurify */}
                  {sanitize(valueBody || "") ? (
                    <div
                      className="text-muted-foreground text-sm mb-4 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={sanitize(valueBody || "")}
                    />
                  ) : (
                    <p className="text-muted-foreground text-sm mb-4">
                      {valueBody}
                    </p>
                  )}
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
                </div>
              );
            })}
          </div>
        </section>

        {/* Featured Product */}
        <section className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
              {featuredImage ? (
                <img
                  loading="lazy"
                  src={featuredImage}
                  alt="Rayhana Red Pot"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full bg-gradient-to-br from-primary/10 via-secondary/30 to-background"
                  aria-hidden="true"
                />
              )}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-primary px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                {t("products.ladle_bonus")}
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
                {getLocalized(
                  homeContent?.data?.featuredProduct?.title,
                  i18n.language === "en"
                    ? "The Perfect Pot for Every Meal"
                    : "دیگ کامل برای هر وعده غذایی"
                )}
              </h2>
              {/* biome-ignore: lint/security/noDangerouslySetInnerHtml -- sanitized via DOMPurify */}
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
                      {
                        text: { en: "Durable Granite Coating", fa: "", ps: "" },
                      },
                      {
                        text: { en: "Heat Resistant Handles", fa: "", ps: "" },
                      },
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
              <Link href="/products">
                <Button size="lg" variant="outline" className="mt-4">
                  {t("products.view_details")}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="bg-secondary/30 py-20">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 space-y-6">
                <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
                  {storyTitle}
                </h2>
                {/* biome-ignore: lint/security/noDangerouslySetInnerHtml -- sanitized via DOMPurify */}
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
              </div>
              <div className="order-1 md:order-2 relative aspect-video rounded-3xl overflow-hidden shadow-xl">
                {storyImage ? (
                  <img
                    loading="lazy"
                    src={storyImage}
                    alt="Rayhana Story"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full bg-gradient-to-br from-primary/10 via-secondary/30 to-background"
                    aria-hidden="true"
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Customer Gallery */}
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="min-h-64 w-full animate-pulse bg-muted/40 rounded-3xl" />
            }
          >
            <CustomerGallery />
          </Suspense>
        </ErrorBoundary>

        {/* Featured Blog */}
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="min-h-64 w-full animate-pulse bg-muted/40 rounded-3xl" />
            }
          >
            <FeaturedBlogSection />
          </Suspense>
        </ErrorBoundary>

        {/* FAQ Section */}
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="min-h-48 w-full animate-pulse bg-muted/30 rounded-2xl" />
            }
          >
            <FAQ />
          </Suspense>
        </ErrorBoundary>

        {/* Newsletter */}
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="min-h-40 w-full animate-pulse bg-muted/20 rounded-2xl" />
            }
          >
            <Newsletter />
          </Suspense>
        </ErrorBoundary>
      </div>
    </>
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
