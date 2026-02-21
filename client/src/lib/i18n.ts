import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '../locales/en.json';

const localeLoaders: Record<string, () => Promise<any>> = {
  en: () => import('../locales/en.json'),
  fa: () => import('../locales/fa.json'),
  ps: () => import('../locales/ps.json'),
};

async function ensureLocaleLoaded(lng: string) {
  const loader = localeLoaders[lng];
  if (!loader) return;
  if (i18n.hasResourceBundle(lng, 'translation')) return;
  const mod = await loader();
  const resources = mod.default || mod;
  i18n.addResourceBundle(lng, 'translation', resources, true, true);
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
    },
    interpolation: {
      escapeValue: false,
    },
    load: 'languageOnly',
    supportedLngs: ['en', 'fa', 'ps'],
    nonExplicitSupportedLngs: true,
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'sessionStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      lookupSessionStorage: 'i18nextLng',
    },
  })
  .then(() => {
    const current = (i18n.language || i18n.resolvedLanguage || 'en').split('-')[0];
    ensureLocaleLoaded(current);
  });

i18n.on('languageChanged', lng => {
  const code = (lng || 'en').split('-')[0];
  ensureLocaleLoaded(code);
});

export default i18n;
