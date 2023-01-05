import { FetchCaller } from './fetchCaller';
import { Either, left, right } from '@services/either';

/**
 * REST API for counters
 */
export class CountersService {
  endpoint: string;
  utils: FetchCaller;

  constructor(endpoint: string, restUtils: FetchCaller) {
    this.endpoint = endpoint;
    this.utils = restUtils;
  }

  /**
   * Get counters list
   */
  public getCounters(): Promise<Either<ActionResponse, Counter[]>> {
    return this.utils
      .fetch(this.endpoint, 'GET')
      .then((response) => response.json())
      .then((jsonList) => {
        const counters: Promise<Counter>[] = jsonList.map((name) => this.getCounter(name));
        return Promise.all(counters);
      })
      .then((counters) => right(counters) as Either<ActionResponse, Counter[]>)
      .catch((err) => left(this.utils.mapError(err, 'Unable to retrieve counters')));
  }

  private getCounter(name: string): Promise<Counter> {
    let counter: Promise<Counter> = this.utils
      .fetch(this.endpoint + '/' + name, 'GET')
      .then((response) => response.text())
      .then((value) => <Counter>{ name: name, value: value });

    let counterConfig: Promise<CounterConfig> = this.getCounterConfig(name);
    let promises = Promise.all([counter, counterConfig]);

    // combine config into counter
    return promises.then((data) => {
      data[0].config = data[1];
      return data[0];
    });
  }

  private getCounterConfig(name: string): Promise<CounterConfig> {
    return this.utils
      .fetch(this.endpoint + '/' + name + '/config', 'GET')
      .then((response) => response.json())
      .then((value) => {
        let counterConfig: CounterConfig;
        if (value.hasOwnProperty('weak-counter')) {
          const weakCounter = value['weak-counter'];
          counterConfig = <CounterConfig>{
            name: name,
            type: 'Weak',
            initialValue: weakCounter['initial-value'],
            storage: weakCounter.storage,
            concurrencyLevel: weakCounter['concurrency-level']
          };
        } else {
          const strongCounter = value['strong-counter'];
          counterConfig = <CounterConfig>{
            name: name,
            type: 'Strong',
            initialValue: strongCounter['initial-value'],
            storage: strongCounter.storage,
            lowerBound: strongCounter['lower-bound'],
            upperBound: strongCounter['upper-bound']
          };
        }
        return counterConfig;
      });
  }

  /**
   * Delete counter
   *
   * @param name, counter to be deleted
   */
  public delete(name: string): Promise<ActionResponse> {
    return this.utils.delete({
      url: this.endpoint + '/' + name,
      successMessage: `Counter ${name} has been deleted.`,
      errorMessage: `Unexpected error deleting the counter ${name}.`
    });
  }

  /**
   * Set delta value for a counter
   * @param name, counter to be updated
   * @param deltaValue, delta value to be set
   */
  public setDelta(name: string, deltaValue: number): Promise<ActionResponse> {
    return this.utils.post({
      url: this.endpoint + '/' + name + '?action=add&delta=' + deltaValue,
      successMessage: `Delta value for counter ${name} has been set.`,
      errorMessage: `Unexpected error setting delta value for counter ${name}.`
    });
  }

  public resetCounter(name: string): Promise<ActionResponse> {
    return this.utils.post({
      url: this.endpoint + '/' + name + '?action=reset',
      successMessage: `Counter ${name} has been reset.`,
      errorMessage: `Unexpected error resetting counter ${name}.`
    });
  }
}
