import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { Menu, X, Globe, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useContent } from "@/hooks/useContent";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
} from "@clerk/clerk-react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { t, i18n } = useTranslation();
  const { data: settingsContent } = useContent("settings");
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const isRTL = ["fa", "ar", "ps", "ku"].includes(i18n.language);

  useEffect(() => {
    document.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
  }, [i18n.language, isRTL]);

  const languages = [
    { code: "en", name: "English", dir: "ltr" },
    { code: "fa", name: "فارسی", dir: "rtl" },
    { code: "ps", name: "پښتو", dir: "rtl" },
  ];

  const [showLangMenu, setShowLangMenu] = useState(false);

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setShowLangMenu(false);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const navItems =
    settingsContent?.data?.nav ??
    [
      { href: "/", label: t("nav.home") },
      { href: "/products", label: t("nav.products") },
      { href: "/about", label: t("nav.about") },
      { href: "/blog", label: t("nav.blog") },
      { href: "/contact", label: t("nav.contact") },
    ];
  const footerLinks =
    settingsContent?.data?.footerLinks ??
    [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/help", label: "Help Center" },
    ];
  const socialLinks =
    settingsContent?.data?.social ??
    [
      { href: "https://www.instagram.com", label: "Instagram" },
      { href: "https://www.facebook.com", label: "Facebook" },
    ];

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
          <Link href="/">
            <a className="flex items-center gap-2 font-serif text-2xl font-bold text-primary">
              <span className="hidden sm:inline">RAYHANA</span>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map(item => (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    location === item.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </a>
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
                <div className="absolute top-full right-0 mt-2 w-40 bg-card border rounded-lg shadow-lg py-2 z-50">
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
                <Link key={item.href} href={item.href}>
                  <a
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary p-2 rounded-md hover:bg-muted",
                      location === item.href
                        ? "text-primary bg-muted"
                        : "text-foreground"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </a>
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
                RAYHANA
              </h3>
              <p className="text-muted-foreground max-w-xs">
                {t("hero.subtitle")}
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">{t("nav.products")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {footerLinks.map((item: any, idx: number) => (
                  <li key={`${item.href}-${idx}`}>
                    <Link href={item.href}>
                      <a className="hover:text-primary transition-colors">
                        {item.label}
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">{t("contact.title")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>info@rayhana.com</li>
                <li dir="ltr">+86 13867932870</li>
                <li className="flex gap-4 mt-4">
                  {socialLinks.map((item: any, idx: number) => (
                    <a
                      key={`${item.href}-${idx}`}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary"
                    >
                      {item.label}
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
