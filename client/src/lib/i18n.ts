import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "../locales/en.json";
import fa from "../locales/fa.json";
import ps from "../locales/ps.json";
import { SUPPORTED_LOCALES } from "./locales";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fa: { translation: fa },
      ps: { translation: ps },
    },
    interpolation: {
      escapeValue: false,
    },
    load: "languageOnly",
    supportedLngs: [...SUPPORTED_LOCALES],
    nonExplicitSupportedLngs: true,
    fallbackLng: "en",
    detection: {
      order: ["path", "localStorage", "sessionStorage", "navigator"],
      caches: ["localStorage"],
      lookupFromPathIndex: 0,
      lookupLocalStorage: "i18nextLng",
      lookupSessionStorage: "i18nextLng",
    },
  });

export default i18n;
