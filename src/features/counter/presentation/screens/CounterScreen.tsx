import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useCounterStore } from '../stores/useCounterStore';
import { CounterView } from '../components/CounterView';

export function CounterScreen() {
  const { value, inc, dec, reset } = useCounterStore();

  return (
    <View style={styles.container}>
      <CounterView
        value={value}
        onIncrement={inc}
        onDecrement={dec}
        onReset={reset}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
});
