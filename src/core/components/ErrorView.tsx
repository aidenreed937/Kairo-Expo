import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { AppError, ErrorCode } from '@core/error/appError';

type Props = {
  error: AppError | Error | string;
  onRetry?: () => void;
  fullScreen?: boolean;
};

export function ErrorView({ error, onRetry, fullScreen = false }: Props) {
  const getMessage = (): string => {
    if (typeof error === 'string') return error;
    if ('code' in error) {
      const errorMessages: Record<ErrorCode, string> = {
        [ErrorCode.NETWORK_ERROR]: 'Network error, please check your connection',
        [ErrorCode.TIMEOUT]: 'Request timeout, please try again',
        [ErrorCode.SERVER_ERROR]: 'Server error, please try again later',
        [ErrorCode.UNAUTHORIZED]: 'Please login first',
        [ErrorCode.FORBIDDEN]: 'You do not have permission',
        [ErrorCode.TOKEN_EXPIRED]: 'Session expired, please login again',
        [ErrorCode.VALIDATION_ERROR]: error.message,
        [ErrorCode.NOT_FOUND]: 'Resource not found',
        [ErrorCode.CONFLICT]: error.message,
        [ErrorCode.UNKNOWN]: 'An unknown error occurred',
      };
      return errorMessages[error.code] ?? 'An error occurred';
    }
    return error.message ?? 'An error occurred';
  };

  const content = (
    <View style={styles.container}>
      <Text style={styles.message}>{getMessage()}</Text>
      {onRetry && (
        <Pressable onPress={onRetry} style={styles.button}>
          <Text style={styles.buttonText}>Retry</Text>
        </Pressable>
      )}
    </View>
  );

  if (fullScreen) {
    return <View style={styles.fullScreen}>{content}</View>;
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 24,
  },
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  message: {
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 16,
    color: '#404040',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
});
