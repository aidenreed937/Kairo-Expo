import { useCounterStore } from '@features/counter/presentation/stores/useCounterStore';

describe('useCounterStore', () => {
  beforeEach(() => {
    useCounterStore.getState().reset();
  });

  it('should initialize with default state', () => {
    const state = useCounterStore.getState();
    expect(state.value).toBe(0);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should increment value', () => {
    useCounterStore.getState().inc();
    expect(useCounterStore.getState().value).toBe(1);

    useCounterStore.getState().inc();
    expect(useCounterStore.getState().value).toBe(2);
  });

  it('should decrement value', () => {
    useCounterStore.getState().setValue(5);
    useCounterStore.getState().dec();
    expect(useCounterStore.getState().value).toBe(4);
  });

  it('should allow negative values', () => {
    useCounterStore.getState().dec();
    expect(useCounterStore.getState().value).toBe(-1);
  });

  it('should reset to initial state', () => {
    useCounterStore.getState().setValue(10);
    useCounterStore.getState().setError('test error');
    useCounterStore.getState().setLoading(true);
    useCounterStore.getState().reset();

    const state = useCounterStore.getState();
    expect(state.value).toBe(0);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should set value directly', () => {
    useCounterStore.getState().setValue(42);
    expect(useCounterStore.getState().value).toBe(42);
  });

  it('should set loading state', () => {
    useCounterStore.getState().setLoading(true);
    expect(useCounterStore.getState().isLoading).toBe(true);

    useCounterStore.getState().setLoading(false);
    expect(useCounterStore.getState().isLoading).toBe(false);
  });

  it('should set error state', () => {
    useCounterStore.getState().setError('Something went wrong');
    expect(useCounterStore.getState().error).toBe('Something went wrong');

    useCounterStore.getState().setError(null);
    expect(useCounterStore.getState().error).toBeNull();
  });
});
