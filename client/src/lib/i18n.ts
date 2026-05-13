import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "../locales/en.json";
import fa from "../locales/fa.json";
import ps from "../locales/ps.json";

const supportedLngs = ["en", "fa", "ps"] as const;
let initialized = false;

const detectClientLanguage = () => {
  if (typeof window === "undefined") return "en";
  try {
    const stored = window.localStorage.getItem("i18nextLng");
    if (stored && supportedLngs.includes(stored as (typeof supportedLngs)[number])) {
      return stored;
    }
  } catch {
    // Ignore storage failures and fall back to the browser locale.
  }
  const browserLanguage = window.navigator.language?.split("-")[0];
  return supportedLngs.includes(browserLanguage as (typeof supportedLngs)[number])
    ? browserLanguage
    : "en";
};

export async function initI18n(initialLanguage?: string) {
  const language =
    initialLanguage && supportedLngs.includes(initialLanguage as any)
      ? initialLanguage
      : detectClientLanguage();

  if (!initialized) {
    if (typeof window !== "undefined") {
      i18n.use(LanguageDetector);
    }

    await i18n.use(initReactI18next).init({
      resources: {
        en: { translation: en },
        fa: { translation: fa },
        ps: { translation: ps },
      },
      interpolation: {
        escapeValue: false,
      },
      load: "languageOnly",
      supportedLngs: [...supportedLngs],
      nonExplicitSupportedLngs: true,
      fallbackLng: "en",
      lng: language,
      detection:
        typeof window !== "undefined"
          ? {
              order: ["localStorage", "sessionStorage", "navigator"],
              caches: ["localStorage"],
              lookupLocalStorage: "i18nextLng",
              lookupSessionStorage: "i18nextLng",
            }
          : undefined,
    });
    initialized = true;
    return i18n;
  }

  if (i18n.resolvedLanguage !== language) {
    await i18n.changeLanguage(language);
  }

  return i18n;
}

void initI18n();

export default i18n;
