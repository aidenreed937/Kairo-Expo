import { Counter } from '../entities/counter';

export interface CounterRepository {
  get(): Promise<Counter>;
  save(counter: Counter): Promise<void>;
  increment(): Promise<Counter>;
  decrement(): Promise<Counter>;
  reset(): Promise<Counter>;
  setValue(value: number): Promise<Counter>;
}
