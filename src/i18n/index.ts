import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// FR
import commonFr from './locales/fr/common.json';
import landingFr from './locales/fr/landing.json';
import authFr from './locales/fr/auth.json';
import onboardingFr from './locales/fr/onboarding.json';
import trainingFr from './locales/fr/training.json';
import nutritionFr from './locales/fr/nutrition.json';
import coachFr from './locales/fr/coach.json';
import settingsFr from './locales/fr/settings.json';

// EN
import commonEn from './locales/en/common.json';
import landingEn from './locales/en/landing.json';
import authEn from './locales/en/auth.json';
import onboardingEn from './locales/en/onboarding.json';
import trainingEn from './locales/en/training.json';
import nutritionEn from './locales/en/nutrition.json';
import coachEn from './locales/en/coach.json';
import settingsEn from './locales/en/settings.json';

// NL
import commonNl from './locales/nl/common.json';
import landingNl from './locales/nl/landing.json';
import authNl from './locales/nl/auth.json';
import onboardingNl from './locales/nl/onboarding.json';
import trainingNl from './locales/nl/training.json';
import nutritionNl from './locales/nl/nutrition.json';
import coachNl from './locales/nl/coach.json';
import settingsNl from './locales/nl/settings.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: {
        common: commonFr,
        landing: landingFr,
        auth: authFr,
        onboarding: onboardingFr,
        training: trainingFr,
        nutrition: nutritionFr,
        coach: coachFr,
        settings: settingsFr,
      },
      en: {
        common: commonEn,
        landing: landingEn,
        auth: authEn,
        onboarding: onboardingEn,
        training: trainingEn,
        nutrition: nutritionEn,
        coach: coachEn,
        settings: settingsEn,
      },
      nl: {
        common: commonNl,
        landing: landingNl,
        auth: authNl,
        onboarding: onboardingNl,
        training: trainingNl,
        nutrition: nutritionNl,
        coach: coachNl,
        settings: settingsNl,
      },
    },
    fallbackLng: 'fr',
    defaultNS: 'common',
    ns: ['common', 'landing', 'auth', 'onboarding', 'training', 'nutrition', 'coach', 'settings'],
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
