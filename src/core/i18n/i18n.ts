import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { appConfig } from '@core/config/appConfig';
import en from './locales/en.json';
import zh from './locales/zh.json';

/**
 * Available languages
 */
export const languages = {
  en: { translation: en },
  zh: { translation: zh },
} as const;

/**
 * Get device language
 */
function getDeviceLanguage(): string {
  const locales = getLocales();
  const deviceLanguage = locales[0]?.languageCode || appConfig.defaultLanguage;

  // Check if device language is supported
  if (appConfig.supportedLanguages.includes(deviceLanguage)) {
    return deviceLanguage;
  }

  return appConfig.defaultLanguage;
}

/**
 * Initialize i18n
 */
i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  resources: languages,
  lng: getDeviceLanguage(),
  fallbackLng: appConfig.defaultLanguage,
  interpolation: {
    escapeValue: false, // React already escapes values
  },
});

export default i18n;
