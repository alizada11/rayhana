export const SUPPORTED_LOCALES = ["en", "fa", "ps"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = "en";

export const RTL_LOCALES: SupportedLocale[] = ["fa", "ps"];

export function isSupportedLocale(value?: string | null): value is SupportedLocale {
  return Boolean(
    value && SUPPORTED_LOCALES.includes(value.split("-")[0] as SupportedLocale)
  );
}

export function normalizeLocale(value?: string | null): SupportedLocale {
  const code = value?.split("-")[0];
  return isSupportedLocale(code) ? code : DEFAULT_LOCALE;
}

export function stripLocaleFromPath(pathname: string) {
  const path = pathname || "/";
  const parts = path.split("/");
  const maybeLocale = parts[1];

  if (!isSupportedLocale(maybeLocale)) {
    return { locale: null, path: path || "/" };
  }

  const stripped = `/${parts.slice(2).join("/")}`.replace(/\/+$/, "") || "/";
  return { locale: maybeLocale, path: stripped };
}

export function withLocalePath(pathname: string, locale: SupportedLocale) {
  const { path } = stripLocaleFromPath(pathname || "/");
  const cleanPath = path === "/" ? "" : path.replace(/\/+$/, "");
  return `/${locale}${cleanPath}`;
}

export function localeDirection(locale: string) {
  return RTL_LOCALES.includes(normalizeLocale(locale)) ? "rtl" : "ltr";
}
