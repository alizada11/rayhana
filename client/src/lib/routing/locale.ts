export const SUPPORTED_LOCALES = ["en", "fa", "ps"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const RTL_LOCALES = new Set<Locale>(["fa", "ps"]);

export const isSupportedLocale = (value?: string | null): value is Locale =>
  Boolean(value && SUPPORTED_LOCALES.includes(value as Locale));

export const normalizeLocale = (value?: string | null): Locale =>
  isSupportedLocale(value) ? value : DEFAULT_LOCALE;

export const getLocalePrefix = (locale: Locale) =>
  locale === DEFAULT_LOCALE ? "" : `/${locale}`;

export const stripLocaleFromPath = (pathname: string) => {
  const [, maybeLocale, ...rest] = pathname.split("/");
  if (!isSupportedLocale(maybeLocale)) {
    return {
      locale: DEFAULT_LOCALE,
      pathname,
      hadLocalePrefix: false,
    };
  }

  const nextPath = `/${rest.join("/")}`.replace(/\/{2,}/g, "/") || "/";
  return {
    locale: maybeLocale,
    pathname: nextPath === "/" ? "/" : nextPath.replace(/\/+$/, "") || "/",
    hadLocalePrefix: true,
  };
};

export const localizePath = (locale: Locale, pathname: string) => {
  const cleanPath = pathname === "/" ? "" : pathname.replace(/\/+$/, "");
  return `${getLocalePrefix(locale)}${cleanPath || "/"}`.replace(/\/{2,}/g, "/");
};
