export interface Counter {
  value: number;
}

export const createCounter = (initialValue: number = 0): Counter => ({
  value: initialValue,
});

export const incrementCounter = (counter: Counter): Counter => ({
  value: counter.value + 1,
});

export const decrementCounter = (counter: Counter): Counter => ({
  value: counter.value - 1,
});

export const resetCounter = (): Counter => ({
  value: 0,
});

export const setCounterValue = (value: number): Counter => ({
  value,
});
