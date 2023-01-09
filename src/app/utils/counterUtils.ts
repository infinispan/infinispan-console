import { CounterType } from '@services/infinispanRefData';

export function createCounterConfig(counterConfig) {
  let config;

  if (counterConfig.type === CounterType.STRONG_COUNTER) {
    config = {
      'strong-counter': {
        'initial-value': counterConfig?.initialValue,
        storage: counterConfig.storage,
        'lower-bound': counterConfig?.lowerBound,
        'upper-bound': counterConfig?.upperBound
      }
    };
  } else if (counterConfig.type === CounterType.WEAK_COUNTER) {
    config = {
      'weak-counter': {
        'initial-value': counterConfig?.initialValue,
        storage: counterConfig.storage,
        'concurrency-level': counterConfig?.concurrencyLevel
      }
    };
  }

  return config;
}
