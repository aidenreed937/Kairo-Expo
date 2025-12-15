import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PrimaryButton } from '@core/components/PrimaryButton';

type Props = {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onReset: () => void;
};

export function CounterView({
  value,
  onIncrement,
  onDecrement,
  onReset,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.value}>{value}</Text>

      <View style={styles.buttonRow}>
        <View style={styles.buttonWrapper}>
          <PrimaryButton title="-" onPress={onDecrement} size="lg" />
        </View>
        <View style={styles.buttonWrapper}>
          <PrimaryButton title="+" onPress={onIncrement} size="lg" />
        </View>
      </View>

      <View style={styles.resetButton}>
        <PrimaryButton
          title="Reset"
          onPress={onReset}
          variant="outline"
          size="md"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  value: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#262626',
    marginBottom: 32,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  buttonWrapper: {
    flex: 1,
    minWidth: 80,
  },
  resetButton: {
    width: '100%',
    maxWidth: 200,
  },
});
