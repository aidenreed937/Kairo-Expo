import axios, { AxiosError } from 'axios';
import { AppError, ErrorCode } from './appError';

/**
 * Map axios error to AppError
 */
export function mapAxiosError(error: AxiosError): AppError {
  // Network errors (no response received)
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return new AppError('Request timeout. Please try again.', ErrorCode.TIMEOUT, {
        originalError: error,
      });
    }

    return new AppError('Network error. Please check your connection.', ErrorCode.NETWORK_ERROR, {
      originalError: error,
    });
  }

  // Server returned error response
  const { status, data } = error.response;
  const message = (data as any)?.message || error.message || 'An error occurred';

  switch (status) {
    case 400:
      return new AppError(message, ErrorCode.VALIDATION_ERROR, {
        statusCode: status,
        data,
        originalError: error,
      });

    case 401:
      return new AppError(message || 'Unauthorized. Please login.', ErrorCode.UNAUTHORIZED, {
        statusCode: status,
        data,
        originalError: error,
      });

    case 403:
      return new AppError(message || 'Access forbidden.', ErrorCode.FORBIDDEN, {
        statusCode: status,
        data,
        originalError: error,
      });

    case 404:
      return new AppError(message || 'Resource not found.', ErrorCode.NOT_FOUND, {
        statusCode: status,
        data,
        originalError: error,
      });

    case 500:
    case 502:
    case 503:
    case 504:
      return new AppError(message || 'Server error. Please try again later.', ErrorCode.SERVER_ERROR, {
        statusCode: status,
        data,
        originalError: error,
      });

    default:
      return new AppError(message, ErrorCode.UNKNOWN, {
        statusCode: status,
        data,
        originalError: error,
      });
  }
}

/**
 * Map unknown error to AppError
 */
export function mapError(error: unknown): AppError {
  // Already an AppError
  if (error instanceof AppError) {
    return error;
  }

  // Axios error
  if (axios.isAxiosError(error)) {
    return mapAxiosError(error);
  }

  // Standard Error
  if (error instanceof Error) {
    return new AppError(error.message, ErrorCode.UNKNOWN, {
      originalError: error,
    });
  }

  // Unknown error type
  return new AppError('An unexpected error occurred', ErrorCode.UNKNOWN, {
    data: error,
  });
}
