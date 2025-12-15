/**
 * Error codes for application errors
 */
export enum ErrorCode {
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',

  // Server errors
  SERVER_ERROR = 'SERVER_ERROR',

  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',

  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',

  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',

  // Unknown errors
  UNKNOWN = 'UNKNOWN',
}

/**
 * Application error class
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode?: number;
  public readonly data?: unknown;
  public readonly originalError?: Error;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN,
    options?: {
      statusCode?: number;
      data?: unknown;
      originalError?: Error;
    }
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = options?.statusCode;
    this.data = options?.data;
    this.originalError = options?.originalError;

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }

  /**
   * Check if error is a network error
   */
  isNetworkError(): boolean {
    return this.code === ErrorCode.NETWORK_ERROR || this.code === ErrorCode.TIMEOUT;
  }

  /**
   * Check if error is a server error
   */
  isServerError(): boolean {
    return this.code === ErrorCode.SERVER_ERROR;
  }

  /**
   * Check if error is an authentication error
   */
  isAuthError(): boolean {
    return this.code === ErrorCode.UNAUTHORIZED || this.code === ErrorCode.FORBIDDEN;
  }

  /**
   * Check if error is a validation error
   */
  isValidationError(): boolean {
    return this.code === ErrorCode.VALIDATION_ERROR;
  }

  /**
   * Check if error is retryable
   */
  isRetryable(): boolean {
    return (
      this.code === ErrorCode.NETWORK_ERROR ||
      this.code === ErrorCode.TIMEOUT ||
      (this.code === ErrorCode.SERVER_ERROR && (this.statusCode === 503 || this.statusCode === 504))
    );
  }

  /**
   * Convert to JSON representation
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      data: this.data,
    };
  }

  /**
   * Create error from plain object
   */
  static fromJSON(json: ReturnType<AppError['toJSON']>): AppError {
    return new AppError(json.message, json.code, {
      statusCode: json.statusCode,
      data: json.data,
    });
  }
}

/**
 * Type guard to check if error is AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
