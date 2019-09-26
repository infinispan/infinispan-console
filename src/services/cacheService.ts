class CacheService {
  endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  public createCacheByConfigName(cacheName: string, configName: string): Promise<String> {
    return fetch('http://localhost:11222/rest/v2/caches/' + cacheName + '?template=' + configName, {
      method: 'POST'
    }).then(function (response) {
      // display error here somewhere
      console.log(response.json());
      return "";
    })
  };

  public createCacheWithConfiguration(cacheName: string, config: string): Promise<String> {
    let headers = new Headers();
    try {
      JSON.parse(config);
      headers.append('Content-Type', 'application/json');
    } catch (e) {
      console.log(e);
      headers.append('Content-Type', 'application/xml');
    }
    return fetch('http://localhost:11222/rest/v2/caches/' + cacheName, {
      method: 'POST',
      body: config,
      headers: headers
    }).then(function (response) {
      // display error here somewhere
      console.log(response.json());
      return "";
    })
  };
}

const cacheService: CacheService = new CacheService("http://localhost:11222/rest/v2");

export default cacheService;
