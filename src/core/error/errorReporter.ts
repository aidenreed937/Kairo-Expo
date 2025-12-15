import * as Sentry from '@sentry/react-native';
import { appConfig } from '@core/config/appConfig';
import { isAppError } from './appError';

/**
 * Initialize error reporter
 */
export function initErrorReporter() {
  if (!appConfig.sentryDsn) {
    console.warn('[ErrorReporter] Sentry DSN not configured, error reporting disabled');
    return;
  }

  Sentry.init({
    dsn: appConfig.sentryDsn,
    environment: appConfig.env,
    enabled: appConfig.features.enableAnalytics,
    debug: appConfig.enableLogging,
    tracesSampleRate: appConfig.env === 'production' ? 0.2 : 1.0,
  });
}

/**
 * Report error to Sentry
 */
export function reportError(error: unknown, context?: Record<string, unknown>) {
  if (!appConfig.sentryDsn || !appConfig.features.enableAnalytics) {
    return;
  }

  // Add context if provided
  if (context) {
    Sentry.setContext('error_context', context);
  }

  // Add AppError specific information
  if (isAppError(error)) {
    Sentry.setContext('app_error', {
      code: error.code,
      statusCode: error.statusCode,
      data: error.data,
    });

    // Set fingerprint for better grouping using withScope
    Sentry.withScope((scope) => {
      scope.setFingerprint([error.code, error.message]);
      if (error.originalError) {
        Sentry.captureException(error.originalError);
      } else {
        Sentry.captureException(error);
      }
    });
    return;
  }

  // Report error
  if (error instanceof Error) {
    Sentry.captureException(error);
  } else {
    Sentry.captureMessage(String(error));
  }
}

/**
 * Set user context for error reporting
 */
export function setUserContext(user: { id: string; email?: string; username?: string }) {
  if (!appConfig.sentryDsn || !appConfig.features.enableAnalytics) {
    return;
  }

  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
}

/**
 * Clear user context
 */
export function clearUserContext() {
  if (!appConfig.sentryDsn || !appConfig.features.enableAnalytics) {
    return;
  }

  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message: string, data?: Record<string, unknown>) {
  if (!appConfig.sentryDsn || !appConfig.features.enableAnalytics) {
    return;
  }

  Sentry.addBreadcrumb({
    message,
    data,
    level: 'info',
  });
}
