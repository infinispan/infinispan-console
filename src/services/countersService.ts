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
    return utils
      .restCall(this.endpoint + '/counters/' + name, 'GET')
      .then(response => response.json())
      .then(value => <Counter>{ name: name, value: value });
  }
}

const countersService: CountersService = new CountersService(utils.endpoint());

export default countersService;
