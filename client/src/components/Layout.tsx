import { ReactNode, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useSearch } from "wouter";
import { Goal, Menu, X, Globe, Moon, Sun, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useContent } from "@/hooks/useContent";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import i18nInstance from "@/lib/i18n";
import {
  type SupportedLocale,
  normalizeLocale,
  stripLocaleFromPath,
  withLocalePath,
} from "@/lib/locales";

interface LayoutProps {
  children: ReactNode;
}

type LocalizedLabel = string | Record<string, string>;
type NavItem = { href: string; label: LocalizedLabel };

export default function Layout({ children }: LayoutProps) {
  const { t, i18n } = useTranslation();
  const [location, navigate] = useLocation();
  const search = useSearch();
  const isHome = location === "/";
  const isBlackFriday = stripLocaleFromPath(location).path === "/black-friday";
  const { data: settingsContent } = useContent("settings");
  const [footerLogoBroken, setFooterLogoBroken] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(!isHome);
  const { theme, setTheme } = useTheme();
  const isBlackFridayDark = isBlackFriday && theme === "dark";
  const langCode = normalizeLocale(i18n.language || i18n.resolvedLanguage);
  const isRTL = ["fa", "ps"].includes(langCode);
  const currentLang = langCode;

  const apiBase = import.meta.env.VITE_API_URL?.replace(/\/api$/, "") || "";
  const resolveAsset = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${apiBase}${url}`;
  };

  // Logo asset (served from public/images). Keep explicit dimensions for CLS.
  const headerLogoUrl = "/images/logo.png";
  const footerLogoUrl = "/images/logo.png";
  const logoWidth = 256;
  const logoHeight = 70;

  const defaultImgFallback =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
  const customFallback = resolveAsset(settingsContent?.data?.fallbackImage);

  const gscVerification = settingsContent?.data?.gscVerification?.trim();
  const gaMeasurementId = settingsContent?.data?.gaMeasurementId?.trim();

  useEffect(() => {
    setFooterLogoBroken(false);
  }, [footerLogoUrl]);

  useEffect(() => {
    if (!isHome) {
      setIsScrolled(true);
      return;
    }
    const onScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  // Reset scroll to top on route changes to avoid landing mid-page
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location]);

  // Inject Google Search Console verification meta
  useEffect(() => {
    if (!gscVerification) return;
    let meta = document.querySelector('meta[name="google-site-verification"]');
    let created = false;
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "google-site-verification");
      created = true;
    }
    meta.setAttribute("content", gscVerification);
    if (created || !meta.parentNode) {
      document.head.appendChild(meta);
    }
    return () => {
      if (created && meta?.parentNode) meta.parentNode.removeChild(meta);
    };
  }, [gscVerification]);

  // Inject Google Analytics if Measurement ID provided
  useEffect(() => {
    const gaRegex = /^G-[A-Z0-9]{6,12}$/;
    if (!gaMeasurementId || !gaRegex.test(gaMeasurementId)) return;
    const existing = document.querySelector(
      `script[data-ga-id="${gaMeasurementId}"]`
    );
    if (existing) return;
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`;
    script.dataset.gaId = gaMeasurementId;
    const inline = document.createElement("script");
    inline.textContent = `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaMeasurementId}');`;
    document.head.appendChild(script);
    document.head.appendChild(inline);
    return () => {
      script.parentNode?.removeChild(script);
      inline.parentNode?.removeChild(inline);
    };
  }, [gaMeasurementId]);

  useEffect(() => {
    document.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = langCode;
  }, [langCode, isRTL]);

  useEffect(() => {
    const handler = (event: Event) => {
      const target = event.target as HTMLImageElement | null;
      if (!target || target.tagName !== "IMG") return;
      if (target.dataset.reactHasOnError === "1") return;
      if (target.dataset.skipGlobalFallback === "1") return;
      if (target.dataset.fallbackApplied === "1") return;
      target.dataset.fallbackApplied = "1";
      const fallbackSrc = customFallback || defaultImgFallback;
      target.src = fallbackSrc;
      target.addEventListener(
        "load",
        () => {
          target.dataset.fallbackApplied = "";
        },
        { once: true }
      );
    };
    window.addEventListener("error", handler, true);
    return () => window.removeEventListener("error", handler, true);
  }, [customFallback, defaultImgFallback]);

  const languages: Array<{ code: SupportedLocale; name: string; dir: string }> =
    [
      { code: "en", name: "English", dir: "ltr" },
      { code: "fa", name: "فارسی", dir: "rtl" },
      { code: "ps", name: "پښتو", dir: "rtl" },
    ];

  const [showLangMenu, setShowLangMenu] = useState(false);

  const changeLanguage = (newLang: SupportedLocale) => {
    const inst =
      i18n && typeof i18n.changeLanguage === "function" ? i18n : i18nInstance;
    inst.changeLanguage(newLang);
    try {
      window.localStorage.setItem("i18nextLng", newLang);
    } catch {
      /* ignore storage errors */
    }
    const targetPath = withLocalePath(location, newLang);
    navigate(`~${targetPath}${search ? `?${search}` : ""}`);
    setShowLangMenu(false);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  const navItems: NavItem[] = Array.isArray(settingsContent?.data?.nav)
    ? settingsContent.data.nav
    : [
        { href: "/", label: t("nav.home") },
        { href: "/products", label: t("nav.products") },
        { href: "/about", label: t("nav.about") },
        { href: "/blog", label: t("nav.blog") },
        { href: "/contact", label: t("nav.contact") },
      ];
  const footerLinks: NavItem[] = Array.isArray(
    settingsContent?.data?.footerLinks
  )
    ? settingsContent.data.footerLinks
    : [
        { href: "/privacy", label: "Privacy Policy" },
        { href: "/terms", label: "Terms of Service" },
        { href: "/help", label: "Help Center" },
      ];
  const socialLinks: NavItem[] = Array.isArray(settingsContent?.data?.social)
    ? settingsContent.data.social
    : [
        { href: "https://www.instagram.com", label: "Instagram" },
        { href: "https://www.facebook.com", label: "Facebook" },
      ];

  const { data: contactContent } = useContent("contact", {
    enabled: !isHome,
  });
  const contactInfo = useMemo(() => {
    const fallback = {
      email: t("contact_page.email_value"),
      phone: t("contact_page.phone_value"),
    };

    const info = contactContent?.data?.info;
    const pickValue = (icons: string[]) => {
      if (!Array.isArray(info)) return null;
      const match = info.find((item: any) =>
        icons.includes((item?.icon || "").toLowerCase())
      );
      if (!match?.value) return null;
      return (
        match.value?.[currentLang] ||
        match.value?.en ||
        match.value?.fa ||
        match.value?.ps ||
        null
      );
    };

    return {
      email: pickValue(["mail", "email"]) || fallback.email,
      phone: pickValue(["phone", "call"]) || fallback.phone,
    };
  }, [contactContent, currentLang, t]);

  const getLocalizedLabel = (label: LocalizedLabel) => {
    if (typeof label === "string") return label;
    return label?.[currentLang] || label?.en || "";
  };
  const worldCupHref = `~${withLocalePath("/world-cup-prediction", currentLang)}`;
  const blackFridayBanner = {
    en: { message: "Black Friday · Up to 20% off", link: "Shop now" },
    fa: { message: "جمعه سیاه · تا ۲۰٪ تخفیف", link: "مشاهده پیشنهاد" },
    ps: { message: "توره جمعه · تر ۲۰٪ تخفیف", link: "وړاندیز وګورئ" },
  }[currentLang];

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col font-sans",
        isRTL ? "font-vazir" : "font-poppins"
      )}
    >
      <div
        className={cn(
          "relative z-[60] border-b",
          isBlackFridayDark
            ? "border-white/10 bg-[#171717] text-white"
            : isBlackFriday
              ? "border-[#de1020]/15 bg-[#fff8f5] text-foreground"
              : "border-primary/20 bg-primary text-primary-foreground"
        )}
      >
        <div className="container flex h-10 items-center justify-center gap-3 px-3 text-xs font-medium sm:text-sm">
          <span className="whitespace-nowrap">{blackFridayBanner.message}</span>
          <Link
            href="/black-friday"
            className={cn(
              "inline-flex shrink-0 items-center gap-1 whitespace-nowrap font-semibold transition-colors",
              isBlackFridayDark
                ? "text-[#ff6971] hover:text-white"
                : isBlackFriday
                  ? "text-primary hover:opacity-80"
                : "underline underline-offset-2 hover:opacity-80"
            )}
          >
            {blackFridayBanner.link}
            <ArrowRight
              aria-hidden="true"
              className={cn("h-3.5 w-3.5", isRTL && "rotate-180")}
            />
          </Link>
        </div>
      </div>

      {/* Header */}
      <header
        className={cn(
          isBlackFriday
            ? "sticky top-0 translate-y-0 delay-150"
            : isHome && !isScrolled
            ? "absolute top-10 translate-y-2"
            : "sticky top-0 translate-y-0 delay-150",
          "z-50 w-full transition-[transform,background-color,border-color,box-shadow] duration-300 ease-out will-change-transform",
          isBlackFridayDark
            ? "border-b border-white/10 bg-[#0d0d0d]/90 text-[#f5efe0] shadow-sm backdrop-blur-md"
            : isBlackFriday
              ? "border-b border-border bg-background/90 text-foreground shadow-sm backdrop-blur-md"
            : isHome && !isScrolled
              ? "bg-transparent border-b-transparent shadow-none"
              : "border-b bg-background/70 backdrop-blur-md supports-[backdrop-filter]:bg-background/50 shadow-sm"
        )}
      >
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2 font-serif text-2xl font-bold",
              isBlackFridayDark
                ? "text-[#f5efe0]"
                : isHome && !isScrolled
                  ? "text-white"
                  : "text-primary"
            )}
          >
            {headerLogoUrl ? (
              <img
                loading="eager"
                src={headerLogoUrl}
                alt="Rayhana logo"
                width={logoWidth}
                height={logoHeight}
                className="h-9 w-auto object-contain block"
                data-skip-global-fallback="1"
                onError={e => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.classList.remove(
                    "hidden"
                  );
                }}
              />
            ) : null}
            <span className={headerLogoUrl ? "hidden" : ""}>RAYHANA</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  isBlackFridayDark
                    ? "text-[#f5efe0] hover:text-white"
                    : isBlackFriday
                      ? "text-foreground hover:text-primary"
                    : isHome && !isScrolled
                    ? "text-white hover:text-white/80"
                    : "text-foreground hover:text-primary",
                  location === item.href &&
                    (isBlackFriday
                      ? "text-primary font-bold"
                      : isHome && !isScrolled
                        ? "text-white font-bold"
                        : "text-primary font-bold")
                )}
              >
                {getLocalizedLabel(item.label)}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex h-10 items-center gap-2">
            <div className="relative">
              <Button
                variant="ghost"
                onClick={() => setShowLangMenu(!showLangMenu)}
                title="Change Language"
                className={cn(
                  "h-10 min-w-10 gap-1.5 rounded-full border border-[#d5d2ca] px-2.5",
                  isBlackFridayDark
                    ? "border-white/20 text-[#f5efe0] hover:bg-white/10 hover:text-white"
                    : isBlackFriday
                      ? "border-border text-foreground hover:bg-muted/60"
                    : isHome && !isScrolled
                    ? "text-white hover:text-white/90 hover:bg-white/15"
                    : "text-foreground hover:bg-muted/60"
                )}
              >
                <Globe className="h-5 w-5" />
                <span
                  aria-hidden="true"
                  className={cn(
                    "inline-flex h-5 min-w-6 items-center justify-center rounded-full border px-1.5 text-[10px] font-bold leading-none tracking-tight shadow-sm",
                    isHome && !isScrolled
                      ? "bg-white/90 text-primary border-white/60"
                      : "bg-primary text-primary-foreground border-primary/70"
                  )}
                >
                  {langCode.toUpperCase()}
                </span>
              </Button>

              {showLangMenu && (
                <div
                  className={cn(
                    `absolute top-full ${isRTL ? "left-0" : "right-0"} z-50 mt-2 w-40 rounded-lg border py-2 shadow-lg`,
                    isBlackFridayDark
                      ? "border-white/10 bg-[#171717] text-[#f5efe0]"
                      : isBlackFriday
                        ? "border-border bg-card text-foreground"
                      : "bg-card"
                  )}
                >
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={cn(
                        "flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors",
                        isBlackFridayDark ? "hover:bg-white/10" : "hover:bg-muted",
                        langCode === lang.code &&
                          "text-primary font-bold bg-primary/5"
                      )}
                    >
                      <span>{lang.name}</span>
                      {langCode === lang.code && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              title="Toggle Theme"
              className={cn(
                "h-10 w-10 rounded-full",
                  isBlackFridayDark
                    ? "text-[#f5efe0] hover:bg-white/10 hover:text-white"
                    : isBlackFriday
                      ? "text-foreground hover:bg-muted/60"
                    : isHome && !isScrolled
                  ? "text-white hover:text-white/90 hover:bg-white/15"
                  : "text-foreground hover:bg-muted/60"
              )}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle Theme</span>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-10 w-10 rounded-full md:hidden",
                isBlackFridayDark
                  ? "text-[#f5efe0] hover:bg-white/10 hover:text-white"
                  : isBlackFriday
                    ? "text-foreground hover:bg-muted/60"
                  : isHome && !isScrolled
                  ? "text-white hover:text-white/90 hover:bg-white/15"
                  : "text-foreground hover:bg-muted/60"
              )}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div
            className={cn(
              "border-t md:hidden",
              isBlackFridayDark
                ? "border-white/10 bg-[#171717]"
                : isBlackFriday
                  ? "border-border bg-background"
                : "bg-background"
            )}
          >
            <div className="container py-4 flex flex-col gap-4">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md p-2 text-sm font-medium transition-colors hover:text-primary",
                    isBlackFridayDark ? "hover:bg-white/10" : "hover:bg-muted",
                    location === item.href
                      ? isBlackFridayDark
                        ? "bg-white/10 text-primary"
                        : "bg-muted text-primary"
                      : isBlackFriday
                        ? isBlackFridayDark
                          ? "text-[#f5efe0]"
                          : "text-foreground"
                        : "text-foreground"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {getLocalizedLabel(item.label)}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer
        className={cn(
          "border-t site-footer",
          isBlackFridayDark
            ? "border-white/10 bg-[#0d0d0d] text-[#f5efe0]"
            : isBlackFriday
              ? "border-border bg-muted/60 text-foreground"
            : "bg-muted/60"
        )}
      >
        <div className="container py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="font-serif text-xl font-bold text-primary mb-4">
                {footerLogoUrl && !footerLogoBroken ? (
                  <img
                    loading="lazy"
                    src={footerLogoUrl}
                    alt="Rayhana logo"
                    width={logoWidth}
                    height={logoHeight}
                    className="h-10 w-auto object-contain block"
                    data-skip-global-fallback="1"
                    onError={() => setFooterLogoBroken(true)}
                  />
                ) : (
                  <span>RAYHANA</span>
                )}
              </h3>
              <p
                className={cn(
                  "max-w-xs",
                  isBlackFridayDark ? "text-white/70" : "text-foreground/80"
                )}
              >
                {t("hero.subtitle")}
              </p>
            </div>
            <div>
              <h4 className={cn("mb-4 font-serif font-bold", isBlackFridayDark && "text-[#f5efe0]")}>
                {t("nav.quickLinks")}
              </h4>
              <ul className={cn("space-y-2 text-sm", isBlackFridayDark ? "text-white/80" : "text-foreground")}>
                {footerLinks.map((item: any, idx: number) => (
                  <li key={`${item.href}-${idx}`}>
                    <Link
                      href={item.href}
                      className="transition-colors hover:text-primary"
                    >
                      {getLocalizedLabel(item.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className={isRTL ? "text-right" : "text-left"}>
              <h4 className={cn("mb-4 font-serif font-bold", isBlackFridayDark && "text-[#f5efe0]")}>
                {t("contact.title")}
              </h4>

              <ul className={cn("space-y-2 text-sm", isBlackFridayDark ? "text-white/80" : "text-foreground")}>
                <li>{contactInfo.email}</li>

                {/* Phone: LTR content, RTL position */}
                <li dir="ltr" className={isRTL ? "text-right" : "text-left"}>
                  {contactInfo.phone}
                </li>

                {/* Social links */}
                <li className="flex gap-4 mt-4 ">
                  {socialLinks.map((item: any, idx: number) => (
                    <a
                      key={`${item.href}-${idx}`}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary"
                      aria-label={`Visit us on ${getLocalizedLabel(item.label)}`}
                    >
                      {getLocalizedLabel(item.label)}
                    </a>
                  ))}
                </li>
              </ul>
            </div>
          </div>
          <div
            className={cn(
              "mt-8 border-t pt-8 text-center text-sm",
              isBlackFridayDark
                ? "border-white/10 text-white/70"
                : "text-foreground/80"
            )}
          >
            {t("footer.rights")}
          </div>
        </div>
      </footer>
    </div>
  );
}
