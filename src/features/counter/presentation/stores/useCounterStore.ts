import { create } from 'zustand';

type CounterState = {
  value: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  inc: () => void;
  dec: () => void;
  reset: () => void;
  setValue: (value: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
};

const initialState = {
  value: 0,
  isLoading: false,
  error: null,
};

export const useCounterStore = create<CounterState>((set) => ({
  ...initialState,

  inc: () => set((s) => ({ value: s.value + 1 })),
  dec: () => set((s) => ({ value: s.value - 1 })),
  reset: () => set(initialState),
  setValue: (value) => set({ value }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
