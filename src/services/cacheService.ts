/**
 * Cache Service calls Infinispan endpoints related to Caches
 * @author Katia Aresti
 * @since 1.0
 */
class CacheService {
  endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  public retrieveFullDetail(cacheName: string): Promise<DetailedInfinispanCache> {
    return fetch(this.endpoint + '/caches/' + cacheName + '/?action=all')
      .then(response => {
        console.log(response.json());
        return response.json();
      })
      .then(data => <DetailedInfinispanCache>{
          name: cacheName,
          started: data.started,
          size: data.size,
          type: this.mapCacheType(data)
        }
      );
  };

  public retrieveCacheDetail(cacheName: string, started: boolean): Promise<InfinispanCache> {
    return fetch(this.endpoint + '/caches/' + cacheName + '/?action=size')
      .then(response => response.json())
      .then(size => fetch(this.endpoint + '/caches/' + cacheName + '/?action=config')
        .then(response => response.json())
        .then(config => <InfinispanCache>{
            name: cacheName,
            started: started,
            size: size,
            type: this.mapCacheType(config)
          }
        ).catch(error => <InfinispanCache>{
          name: cacheName,
          started: started,
          size: size,
          type: "unknown"
        })
      )
  };

  private mapCacheType(config: JSON): string {
    let cacheType: string = 'unknown';
    if (config.hasOwnProperty('distributed-cache')) {
      cacheType = 'distributed';
    } else if (config.hasOwnProperty('replicated-cache')) {
      cacheType = 'replicated';
    } else if (config.hasOwnProperty('local-cache')) {
      cacheType = 'local';
    }
    return cacheType;
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
    }).then(response => {
      // display error here somewhere
      console.log(response.json());
      return "";
    })
  };
}

const cacheService: CacheService = new CacheService("http://localhost:11222/rest/v2");

export default cacheService;
