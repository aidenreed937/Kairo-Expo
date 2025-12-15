import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { en } from './locales/en';
import { zh } from './locales/zh';

const resources = {
  en,
  zh,
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: Localization.getLocales()[0]?.languageCode || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v4',
  })
  .catch((error) => {
    console.error('i18n initialization failed:', error);
  });

export default i18n;
