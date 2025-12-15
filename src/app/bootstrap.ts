import '@core/i18n';
import { initErrorReporter } from '@core/error';

export const bootstrap = async (): Promise<void> => {
  try {
    console.log('[Bootstrap] Initializing application...');

    // Initialize error reporter
    initErrorReporter();
    console.log('[Bootstrap] Error reporter initialized');

    // i18n is already initialized via import
    console.log('[Bootstrap] i18n initialized');

    console.log('[Bootstrap] Application initialized successfully');
  } catch (error) {
    console.error('[Bootstrap] Failed to initialize application:', error);
    throw error;
  }
};
