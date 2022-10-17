import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

import enBundle from '@languages/en.json';

const DEFAULT_LOCALE = 'en';

const langDetectorOptions = {
  // order and from where user language should be detected
  order: ['cookie', 'localStorage', 'navigator'],

  // keys or params to lookup language from
  lookupCookie: 'locale',
  lookupLocalStorage: 'locale',

  // cache user language on
  caches: ['localStorage', 'cookie'],
  excludeCacheFor: ['cimode'], // languages to not persist (cookie, localStorage)

  // only detect languages that are in the whitelist
  checkWhitelist: true
};

const backendOptions = {
  loadPath: '{{lng}}|{{ns}}', // used to pass language and namespace to custom XHR function
  request: (options, url, payload, callback) => {
    Promise.resolve(enBundle).then((data) => {
      callback(null, {
        data: JSON.stringify(data),
        status: 200
      });
    });
  }
};

i18n
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // use HTTP backend to async load translated strings
  .use(HttpApi)
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    fallbackLng: DEFAULT_LOCALE,
    debug: true,
    detection: langDetectorOptions,
    interpolation: {
      escapeValue: false // not needed for react as it escapes by default
    },
    backend: backendOptions
  });

export default i18n;
