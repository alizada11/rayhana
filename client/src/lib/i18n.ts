import { createInstance, type i18n as I18nInstance } from "i18next";
import { initReactI18next, I18nextProvider } from "react-i18next";
import { createElement, useMemo, type PropsWithChildren } from "react";
import en from "../locales/en.json";
import fa from "../locales/fa.json";
import ps from "../locales/ps.json";
import { type Locale } from "@/lib/routing/locale";

const resources = {
  en: { translation: en },
  fa: { translation: fa },
  ps: { translation: ps },
} as const;

export async function createI18n(locale: Locale) {
  const instance = createInstance();
  await instance.use(initReactI18next).init({
    resources,
    lng: locale,
    fallbackLng: "en",
    supportedLngs: ["en", "fa", "ps"],
    nonExplicitSupportedLngs: true,
    load: "languageOnly",
    interpolation: {
      escapeValue: false,
    },
  });
  return instance;
}

export function I18nProvider({
  i18n,
  children,
}: PropsWithChildren<{ i18n: I18nInstance }>) {
  const value = useMemo(() => i18n, [i18n]);
  return createElement(I18nextProvider, { i18n: value }, children);
}
