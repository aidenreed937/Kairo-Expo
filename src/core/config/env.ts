import Constants from 'expo-constants';

declare const process: {
  env: {
    EXPO_PUBLIC_SENTRY_DSN?: string;
  };
};

/**
 * Environment types
 */
export type Environment = 'development' | 'staging' | 'production';

/**
 * Environment configuration interface
 */
export interface EnvConfig {
  env: Environment;
  apiBaseUrl: string;
  sentryDsn: string;
  enableLogging: boolean;
}

/**
 * Get current environment
 */
const getEnvironment = (): Environment => {
  const releaseChannel = Constants.expoConfig?.extra?.releaseChannel;

  if (releaseChannel === 'production') {
    return 'production';
  }
  if (releaseChannel === 'staging') {
    return 'staging';
  }
  return 'development';
};

/**
 * Environment configurations
 */
const configs: Record<Environment, EnvConfig> = {
  development: {
    env: 'development',
    apiBaseUrl: 'http://localhost:3000/api',
    sentryDsn: '',
    enableLogging: true,
  },
  staging: {
    env: 'staging',
    apiBaseUrl: 'https://staging-api.example.com/api',
    sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
    enableLogging: true,
  },
  production: {
    env: 'production',
    apiBaseUrl: 'https://api.example.com/api',
    sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
    enableLogging: false,
  },
};

/**
 * Current environment configuration
 */
export const env: EnvConfig = configs[getEnvironment()];

/**
 * Check if running in development mode
 */
export const isDevelopment = () => env.env === 'development';

/**
 * Check if running in staging mode
 */
export const isStaging = () => env.env === 'staging';

/**
 * Check if running in production mode
 */
export const isProduction = () => env.env === 'production';

/**
 * Check if running in dev mode (alias for isDevelopment)
 */
export const isDev = isDevelopment();
