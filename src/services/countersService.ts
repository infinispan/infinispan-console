import utils from './utils';

class CountersService {
  endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  public getCounters(): Promise<Counter[]> {
    return utils
      .restCall(this.endpoint + '/counters/', 'GET')
      .then(response => response.json())
      .then(counters =>
        Promise.all(counters.map(name => this.getCounter(name)))
      );
  }

  private getCounter(name: string): Promise<Counter> {
    let counter: Promise<Counter> = utils
      .restCall(this.endpoint + '/counters/' + name, 'GET')
      .then(response => response.json())
      .then(value => <Counter>{name: name, value: value});

    let counterConfig: Promise<CounterConfig> = this.getCounterConfig(name);
    let promises = Promise.all([counter, counterConfig]);

    // combine config into counter
    return promises.then(data => {
      data[0].config = data[1];
      return data[0]
    });
  }

  private getCounterConfig(name: string): Promise<CounterConfig> {
    return utils
      .restCall(this.endpoint + '/counters/' + name + '/config', 'GET')
      .then(response => response.json())
      .then(value => {
        let counterConfig: CounterConfig;
        if (value.hasOwnProperty('weak-counter')) {
          const weakCounter = value['weak-counter'];
          counterConfig = <CounterConfig>{
            name: name,
            type: 'Weak',
            initialValue: weakCounter['initial-value'],
            storage: weakCounter.storage,
            concurrencyLevel: weakCounter['concurrency-level']
          }
        } else {
          const strongCounter = value['strong-counter'];
          counterConfig = <CounterConfig>{
            name: name,
            type: 'Strong',
            initialValue: strongCounter['initial-value'],
            storage: strongCounter.storage,
            lowerBound: strongCounter['lower-bound'],
            upperBound: strongCounter['upper-bound'],
          }
        }
        return counterConfig;
      });
  }
}

const countersService: CountersService = new CountersService(utils.endpoint());

export default countersService;
