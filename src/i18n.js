import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';
import defaultBundle from '@languages/en.json';

const DEFAULT_LOCALE = 'en';

i18n
  .use(LanguageDetector)
  .use(HttpApi)
  .use(initReactI18next)
  .on('languageChanged', (lng) => {
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    const dir = rtlLanguages.includes(lng) ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = lng;
  })
  .init({
    fallbackLng: DEFAULT_LOCALE,
    interpolation: { escapeValue: false },
    debug: true,
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'locale',
      caches: ['localStorage'],
      excludeCacheFor: ['cimode'],
    },
    resources: {
      en: {
        translation: defaultBundle
      }
    },
    backend: {
      loadPath: '/languages/{{lng}}.json',
    },
    partialBundledLanguages: true
  });

export default i18n;
