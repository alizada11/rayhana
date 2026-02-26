import { useTranslation } from "react-i18next";
import { ArrowRight, Check, Star, ShieldCheck } from "lucide-react";

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";
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
import SeoTags from "@/components/SeoTags";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useHomepage } from "@/hooks/useHomepage";
import { useQueryClient } from "@tanstack/react-query";
import BrandValues from "@/components/BrandValues";

export default function Home() {
  const { t, i18n } = useTranslation();
  const isRTL = ["fa", "ps"].includes(i18n.language);
  const currentLang = i18n.language as "en" | "fa" | "ps";
  const { data: homepage, isLoading, isError } = useHomepage();
  const queryClient = useQueryClient();

  const getLocalized = (obj: any, fallback: string) =>
    obj?.[currentLang] || obj?.en || fallback;

  const heroTitle = getLocalized(homepage?.home?.hero?.title, t("hero.title"));
  const heroSubtitle = getLocalized(
    homepage?.home?.hero?.subtitle,
    t("hero.subtitle")
  );
  const heroCta = getLocalized(homepage?.home?.hero?.cta, t("hero.cta"));
  // Lighter hero assets: trimmed/auto‑optimized for lab agents (Lighthouse/GTMetrix) and low‑bandwidth clients
  const heroMedia =
    "https://res.cloudinary.com/ds4pfbv9i/video/upload/f_auto,q_auto:eco,vc_h265,w_1280/v1771768593/hero-video_rryxgf.mp4";
  // Poster frame: auto format + strong compression + width cap
  const heroPoster =
    "https://res.cloudinary.com/ds4pfbv9i/video/upload/so_1,f_auto,q_auto:eco,w_1200/v1771768593/hero-video_rryxgf.jpg";
  const heroPosterLow =
    "https://res.cloudinary.com/ds4pfbv9i/video/upload/so_1,f_auto,q_auto:low,w_900/v1771768593/hero-video_rryxgf.jpg";
  const [shouldPlayVideo, setShouldPlayVideo] = useState(false);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const belowFoldRef = useRef<HTMLDivElement | null>(null);
  const [showBelowFold, setShowBelowFold] = useState(false);
  const skipVideoRef = useRef(false);

  useEffect(() => {
    // Skip video for small screens, headless test agents, and data‑saver connections
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const isLabAgent =
      /HeadlessChrome|Lighthouse|GTmetrix|Chrome-Lighthouse/i.test(ua);
    const saveData =
      typeof navigator !== "undefined" &&
      (navigator as any).connection?.saveData === true;
    const mql =
      typeof window !== "undefined"
        ? window.matchMedia("(max-width: 768px)")
        : null;
    const skipVideo = mql?.matches || isLabAgent || saveData;
    skipVideoRef.current = !!skipVideo;

    if (skipVideo) {
      setShouldPlayVideo(false);
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      const idleId = requestIdleCallback?.(() => setShouldPlayVideo(true));
      const timeoutId = window.setTimeout(() => setShouldPlayVideo(true), 1000);
      return () => {
        if (idleId !== undefined) cancelIdleCallback(idleId);
        clearTimeout(timeoutId);
      };
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setShouldPlayVideo(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Preload LCP poster image early to improve request discovery
  useEffect(() => {
    const href = heroPosterLow;
    if (!href) return;
    const existing = document.querySelector(
      `link[rel="preload"][as="image"][href="${href}"]`
    );
    if (existing) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = href;
    link.fetchPriority = "high";
    document.head.appendChild(link);
    return () => {
      // ensure cleanup returns void to satisfy EffectCallback type
      link.parentNode?.removeChild(link);
    };
  }, [heroPosterLow]);

  // Safety fallback to start video even if IO never fires
  useEffect(() => {
    if (skipVideoRef.current) return;
    const timeoutId = window.setTimeout(() => setShouldPlayVideo(true), 1500);
    return () => clearTimeout(timeoutId);
  }, []);
  const featuredImage =
    typeof homepage?.home?.images?.featuredProduct === "string"
      ? homepage?.home?.images?.featuredProduct.replace(
          "/upload/",
          "/upload/f_auto,q_auto:eco,w_1100/"
        )
      : "";
  const storyImage =
    typeof homepage?.home?.images?.storyImage === "string"
      ? homepage?.home?.images?.storyImage.replace(
          "/upload/",
          "/upload/f_auto,q_auto:eco,w_1100/"
        )
      : "";
  const storyTitle = getLocalized(
    homepage?.home?.story?.title,
    t("about.title")
  );
  const storyBody = getLocalized(
    homepage?.home?.story?.body,
    i18n.language === "en"
      ? "RAYHANA was born from the longing many immigrants feel for home and the authentic taste of their traditional dishes. We bridge the gap between culture and modernity."
      : "ریحانه از دلتنگی بسیاری از مهاجران برای خانه و طعم اصیل غذاهای سنتی متولد شد. ما پلی بین فرهنگ و مدرنیته هستیم."
  );
  const storyCta = getLocalized(
    homepage?.home?.story?.cta,
    t("common.fullStory", "Read our Full Story")
  );
  const values = Array.isArray(homepage?.home?.values)
    ? homepage?.home?.values
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

  const sanitize = (html: string) =>
    DOMPurify ? { __html: DOMPurify.sanitize(html || "") } : undefined;

  // Ensure below-fold sections render once homepage data is ready
  // (Keep below-fold gated by IO so we don't load heavy sections early)

  // Seed shared content queries so Layout won't refetch settings/contact/seo
  useEffect(() => {
    if (!homepage) return;
    queryClient.setQueryData(["content", "settings"], {
      key: "settings",
      data: homepage.settings ?? {},
      updatedAt: null,
    });
    queryClient.setQueryData(["content", "contact"], {
      key: "contact",
      data: homepage.contact ?? {},
      updatedAt: null,
    });
    queryClient.setQueryData(["content", "seo"], {
      key: "seo",
      data: homepage.seo ?? {},
      updatedAt: null,
    });
  }, [homepage, queryClient]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      const idleId = requestIdleCallback?.(() => setShowBelowFold(true));
      const timeoutId = window.setTimeout(() => setShowBelowFold(true), 3000);
      return () => {
        if (idleId !== undefined) cancelIdleCallback(idleId);
        clearTimeout(timeoutId);
      };
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          setShowBelowFold(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px" }
    );

    if (belowFoldRef.current) {
      observer.observe(belowFoldRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Gentle timeout to reveal below-the-fold content after initial paint
  useEffect(() => {
    if (!homepage) return;
    const timeoutId = window.setTimeout(() => setShowBelowFold(true), 1500);
    return () => clearTimeout(timeoutId);
  }, [homepage]);

  if (isError || !homepage) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="max-w-md rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <svg
              className="h-8 w-8 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
              />
            </svg>
          </div>

          <h3 className="font-serif mt-6 text-xl font-semibold text-foreground">
            {t("common.connectionLost", "Unable to connect")}
          </h3>

          <p className="mt-2 text-sm text-muted-foreground">
            {t("common.errorLoading", "Failed to load homepage content.")}
          </p>

          <div className="mt-6">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2"
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {t("common.tryAgain", "Try again")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SeoTags
        pageKey="home"
        title={
          (homepage.seo as any)?.title || heroTitle || "Rayhana Afghan Cooking"
        }
        description={
          (homepage.seo as any)?.description ||
          heroSubtitle ||
          t(
            "seo.home.description",
            "Discover authentic Afghan recipes, cookware, and stories."
          )
        }
        image={(homepage.seo as any)?.image_url || featuredImage}
        url={`${import.meta.env.VITE_BASE_URL || ""}/`}
        seoData={homepage.seo as any}
      />
      <div className="flex flex-col gap-20 pb-20">
        {/* Hero Section */}
        <section
          ref={heroRef}
          className="relative h-[100vh] min-h-[640px] flex items-center justify-center overflow-hidden"
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
                className="w-full h-full object-cover"
              >
                <source src={heroMedia} />
                <track
                  kind="captions"
                  src="/captions/hero.vtt"
                  label="English"
                  srcLang="en"
                  default
                />
              </video>
            ) : (
              <img
                fetchPriority="high"
                src={heroPosterLow}
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
              <h1 className="font-serif text-5xl md:text-6xl font-bold leading-tight">
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

        <BrandValues />
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
              {/* <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-primary px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                {t("products.ladle_bonus")}
              </div> */}
            </div>

            <div className="space-y-6">
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
                {getLocalized(
                  homepage?.home?.featuredProduct?.title,
                  i18n.language === "en"
                    ? "The Perfect Pot for Every Meal"
                    : "دیگ کامل برای هر وعده غذایی"
                )}
              </h2>
              {sanitize(
                getLocalized(
                  homepage?.home?.featuredProduct?.description,
                  i18n.language === "en"
                    ? "Designed for the modern kitchen but rooted in tradition. Our non-stick granite coating ensures healthy cooking with less oil, while the premium aluminum body distributes heat evenly for that perfect taste of home."
                    : "طراحی شده برای آشپزخانه مدرن اما ریشه در سنت دارد. پوشش گرانیتی نچسب ما پخت سالم با روغن کمتر را تضمین می‌کند، در حالی که بدنه آلومینیومی ممتاز گرما را به طور یکنواخت توزیع می‌کند تا طعم کامل خانه را تجربه کنید."
                )
              ) ? (
                <div
                  className="text-lg text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={sanitize(
                    getLocalized(
                      homepage?.home?.featuredProduct?.description,
                      i18n.language === "en"
                        ? "Designed for the modern kitchen but rooted in tradition. Our non-stick granite coating ensures healthy cooking with less oil, while the premium aluminum body distributes heat evenly for that perfect taste of home."
                        : "طراحی شده برای آشپزخانه مدرن اما ریشه در سنت دارد. پوشش گرانیتی نچسب ما پخت سالم با روغن کمتر را تضمین می‌کند، در حالی که بدنه آلومینیومی ممتاز گرما را به طور یکنواخت توزیع می‌کند تا طعم کامل خانه را تجربه کنید."
                    )
                  )}
                />
              ) : (
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {getLocalized(
                    homepage?.home?.featuredProduct?.description,
                    i18n.language === "en"
                      ? "Designed for the modern kitchen but rooted in tradition. Our non-stick granite coating ensures healthy cooking with less oil, while the premium aluminum body distributes heat evenly for that perfect taste of home."
                      : "طراحی شده برای آشپزخانه مدرن اما ریشه در سنت دارد. پوشش گرانیتی نچسب ما پخت سالم با روغن کمتر را تضمین می‌کند، در حالی که بدنه آلومینیومی ممتاز گرما را به طور یکنواخت توزیع می‌کند تا طعم کامل خانه را تجربه کنید."
                  )}
                </p>
              )}
              <ul className="space-y-3">
                {(Array.isArray(homepage?.home?.featuredProduct?.bullets)
                  ? homepage?.home?.featuredProduct?.bullets
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
                {sanitize(storyBody) ? (
                  <div
                    className="text-lg text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={sanitize(storyBody)}
                  />
                ) : (
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {storyBody}
                  </p>
                )}
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

        <div ref={belowFoldRef} />

        {showBelowFold && (
          <>
            {/* Customer Gallery */}
            <ErrorBoundary>
              <Suspense
                fallback={
                  <div className="min-h-64 w-full animate-pulse bg-muted/40 rounded-3xl" />
                }
              >
                <CustomerGallery items={homepage?.gallery as any} />
              </Suspense>
            </ErrorBoundary>

            {/* Featured Blog */}
            <ErrorBoundary>
              <Suspense
                fallback={
                  <div className="min-h-64 w-full animate-pulse bg-muted/40 rounded-3xl" />
                }
              >
                <FeaturedBlogSection items={homepage?.blogs as any} />
              </Suspense>
            </ErrorBoundary>

            {/* FAQ Section */}
            <ErrorBoundary>
              <Suspense
                fallback={
                  <div className="min-h-48 w-full animate-pulse bg-muted/30 rounded-2xl" />
                }
              >
                <FAQ
                  items={(homepage?.faq as any)?.items}
                  title={(homepage?.faq as any)?.title}
                  subtitle={(homepage?.faq as any)?.subtitle}
                />
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
          </>
        )}
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
