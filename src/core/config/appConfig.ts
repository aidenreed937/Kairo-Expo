import { env, type EnvConfig } from './env';

/**
 * Application configuration
 */
export interface AppConfig extends EnvConfig {
  // App metadata
  appName: string;
  appVersion: string;

  // Network settings
  requestTimeout: number;
  maxRetries: number;

  // Storage settings
  storagePrefix: string;

  // UI settings
  defaultLanguage: string;
  supportedLanguages: string[];

  // Feature flags
  features: {
    enableBiometrics: boolean;
    enablePushNotifications: boolean;
    enableAnalytics: boolean;
  };
}

/**
 * Application configuration instance
 */
export const appConfig: AppConfig = {
  ...env,

  // App metadata
  appName: 'Kairo',
  appVersion: '1.0.0',

  // Network settings
  requestTimeout: 30000, // 30 seconds
  maxRetries: 3,

  // Storage settings
  storagePrefix: '@kairo:',

  // UI settings
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'zh'],

  // Feature flags
  features: {
    enableBiometrics: true,
    enablePushNotifications: true,
    enableAnalytics: env.env !== 'development',
  },
};
