import { ReactNode, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { Menu, X, Globe, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useContent } from "@/hooks/useContent";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

type LocalizedLabel = string | Record<string, string>;
type NavItem = { href: string; label: LocalizedLabel };

export default function Layout({ children }: LayoutProps) {
  const { t, i18n } = useTranslation();
  const { data: settingsContent } = useContent("settings");
  const [footerLogoBroken, setFooterLogoBroken] = useState(false);
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const isRTL = ["fa", "ar", "ps", "ku"].includes(i18n.language);
  const currentLang = i18n.language as "en" | "fa" | "ps";
  const LANG_KEY = "rayhana_lang";
  const LANG_TTL_MS = 24 * 60 * 60 * 1000;

  const apiBase = import.meta.env.VITE_API_URL?.replace(/\/api$/, "") || "";
  const resolveAsset = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${apiBase}${url}`;
  };

  const headerLogoUrl = "/images/logo.png";
  const footerLogoUrl = "/images/logo.png";

  const defaultImgFallback =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
  const customFallback = resolveAsset(settingsContent?.data?.fallbackImage);

  const gscVerification = settingsContent?.data?.gscVerification?.trim();
  const gaMeasurementId = settingsContent?.data?.gaMeasurementId?.trim();

  useEffect(() => {
    setFooterLogoBroken(false);
  }, [footerLogoUrl]);

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

  const saveLang = (code: string) => {
    const payload = { code, expiresAt: Date.now() + LANG_TTL_MS };
    sessionStorage.setItem(LANG_KEY, JSON.stringify(payload));
  };

  const loadLang = (): string | null => {
    const raw = sessionStorage.getItem(LANG_KEY);
    if (!raw) return null;
    try {
      const { code, expiresAt } = JSON.parse(raw);
      if (!expiresAt || expiresAt < Date.now()) {
        sessionStorage.removeItem(LANG_KEY);
        return null;
      }
      return code;
    } catch {
      sessionStorage.removeItem(LANG_KEY);
      return null;
    }
  };

  useEffect(() => {
    document.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
  }, [i18n.language, isRTL]);

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

  const languages = [
    { code: "en", name: "English", dir: "ltr" },
    { code: "fa", name: "فارسی", dir: "rtl" },
    { code: "ps", name: "پښتو", dir: "rtl" },
  ];

  const [showLangMenu, setShowLangMenu] = useState(false);

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    saveLang(langCode);
    setShowLangMenu(false);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  useEffect(() => {
    const stored = loadLang();
    if (stored && stored !== i18n.language) {
      i18n.changeLanguage(stored);
    }
  }, []);

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

  const { data: contactContent } = useContent("contact");
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

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col font-sans",
        isRTL ? "font-vazir" : "font-poppins"
      )}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-serif text-2xl font-bold text-primary"
          >
            {headerLogoUrl ? (
              <img
                loading="eager"
                src={headerLogoUrl}
                alt="Rayhana logo"
                className="h-9 w-auto object-contain"
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
                  "text-sm font-medium transition-colors hover:text-primary",
                  location === item.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {getLocalizedLabel(item.label)}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowLangMenu(!showLangMenu)}
                title="Change Language"
                className="relative"
              >
                <Globe className="h-5 w-5" />
                <span className="absolute -bottom-1 -right-1 text-[10px] font-bold bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center">
                  {i18n.language.toUpperCase()}
                </span>
              </Button>

              {showLangMenu && (
                <div
                  className={`absolute top-full ${isRTL ? "left-0" : "right-0"} mt-2 w-40 bg-card border rounded-lg shadow-lg py-2 z-50`}
                >
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={cn(
                        "w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center justify-between",
                        i18n.language === lang.code &&
                          "text-primary font-bold bg-primary/5"
                      )}
                    >
                      <span>{lang.name}</span>
                      {i18n.language === lang.code && (
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
              className="md:hidden"
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
          <div className="md:hidden border-t bg-background">
            <div className="container py-4 flex flex-col gap-4">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary p-2 rounded-md hover:bg-muted",
                    location === item.href
                      ? "text-primary bg-muted"
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
      <footer className="border-t bg-muted/30">
        <div className="container py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="font-serif text-xl font-bold text-primary mb-4">
                {footerLogoUrl && !footerLogoBroken ? (
                  <img
                    loading="lazy"
                    src={footerLogoUrl}
                    alt="Rayhana logo"
                    className="h-10 w-auto object-contain"
                    data-skip-global-fallback="1"
                    onError={() => setFooterLogoBroken(true)}
                  />
                ) : (
                  <span>RAYHANA</span>
                )}
              </h3>
              <p className="text-muted-foreground max-w-xs">
                {t("hero.subtitle")}
              </p>
            </div>
            <div>
              <h4 className="font-serif font-bold mb-4">
                {t("nav.quickLinks")}
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {footerLinks.map((item: any, idx: number) => (
                  <li key={`${item.href}-${idx}`}>
                    <Link
                      href={item.href}
                      className="hover:text-primary transition-colors"
                    >
                      {getLocalizedLabel(item.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className={isRTL ? "text-right" : "text-left"}>
              <h4 className="font-serif font-bold mb-4">
                {t("contact.title")}
              </h4>

              <ul className="space-y-2 text-sm text-muted-foreground">
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
                    >
                      {getLocalizedLabel(item.label)}
                    </a>
                  ))}
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            {t("footer.rights")}
          </div>
        </div>
      </footer>
    </div>
  );
}
