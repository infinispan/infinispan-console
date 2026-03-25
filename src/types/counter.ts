export interface Counter {
  name: string;
  value: string;
  config: CounterConfig;
}

export interface CounterConfig {
  name: string;
  type: string;
  initialValue: number;
  storage: string;
  lowerBound?: number;
  upperBound?: number;
  concurrencyLevel?: number;
}
