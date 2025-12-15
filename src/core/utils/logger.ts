import { isDev } from '@core/config/env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LoggerConfig = {
  enabled: boolean;
  minLevel: LogLevel;
};

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      enabled: config.enabled ?? isDev,
      minLevel: config.minLevel ?? 'debug',
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return (
      this.config.enabled &&
      LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel]
    );
  }

  private formatMessage(level: LogLevel, tag: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] [${tag}] ${message}`;
  }

  debug(tag: string, message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', tag, message), ...args);
    }
  }

  info(tag: string, message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', tag, message), ...args);
    }
  }

  warn(tag: string, message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', tag, message), ...args);
    }
  }

  error(tag: string, message: string, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', tag, message), ...args);
    }
  }
}

export const logger = new Logger();

export function createLogger(tag: string) {
  return {
    debug: (message: string, ...args: unknown[]) =>
      logger.debug(tag, message, ...args),
    info: (message: string, ...args: unknown[]) =>
      logger.info(tag, message, ...args),
    warn: (message: string, ...args: unknown[]) =>
      logger.warn(tag, message, ...args),
    error: (message: string, ...args: unknown[]) =>
      logger.error(tag, message, ...args),
  };
}
