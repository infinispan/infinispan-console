import { CounterStorage, CounterType } from '@services/infinispanRefData';
import { createCounterConfig } from '../../app/utils/counterUtils';

describe('Counter Config Utils tests', () => {
  test('strong counter', () => {
    const strongCounterConfig = {
      'strong-counter': {
        'initial-value': 1,
        'lower-bound': 0,
        storage: 'Persistent',
        'upper-bound': 100
      }
    };

    const strongCounter: CounterConfig = {
      name: 'test',
      type: CounterType.STRONG_COUNTER,
      initialValue: 1,
      storage: CounterStorage.PERSISTENT,
      lowerBound: 0,
      upperBound: 100
    };

    expect(createCounterConfig(strongCounter)).toStrictEqual(strongCounterConfig);
  });

  test('weak counter', () => {
    const weakCounterConfig = {
      'weak-counter': {
        'initial-value': 1,
        storage: 'Persistent',
        'concurrency-level': 100
      }
    };

    const weakCounter: CounterConfig = {
      name: 'test',
      type: CounterType.WEAK_COUNTER,
      initialValue: 1,
      storage: CounterStorage.PERSISTENT,
      concurrencyLevel: 100
    };

    expect(createCounterConfig(weakCounter)).toStrictEqual(weakCounterConfig);
  });
});
