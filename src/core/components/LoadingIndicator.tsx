import React from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';

type Props = {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  fullScreen?: boolean;
};

export function LoadingIndicator({
  size = 'large',
  color = '#3b82f6',
  message,
  fullScreen = false,
}: Props) {
  const content = (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {message !== undefined && (
        <Text style={styles.message}>{message}</Text>
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
    justifyContent: 'center',
    padding: 16,
  },
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  message: {
    marginTop: 8,
    color: '#737373',
    fontSize: 14,
  },
});
