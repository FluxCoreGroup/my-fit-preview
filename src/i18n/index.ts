import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// FR
import commonFr from './locales/fr/common.json';
import landingFr from './locales/fr/landing.json';

// EN
import commonEn from './locales/en/common.json';
import landingEn from './locales/en/landing.json';

// NL
import commonNl from './locales/nl/common.json';
import landingNl from './locales/nl/landing.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { common: commonFr, landing: landingFr },
      en: { common: commonEn, landing: landingEn },
      nl: { common: commonNl, landing: landingNl },
    },
    fallbackLng: 'fr',
    defaultNS: 'common',
    ns: ['common', 'landing'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
  });

export default i18n;
