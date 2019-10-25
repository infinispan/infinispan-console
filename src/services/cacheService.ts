/**
 * Cache Service calls Infinispan endpoints related to Caches
 * @author Katia Aresti
 * @since 1.0
 */
import utils from "./utils";

class CacheService {
  endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  public retrieveFullDetail(cacheName: string): Promise<DetailedInfinispanCache> {
    return fetch(this.endpoint + '/caches/' + cacheName)
      .then(response => response.json())
      .then(data => {
          const cacheContent: CacheContent = {
            size: data.size,
            readWriteRatio: data.stats.averageReadTime,
            hitRatio: 49.4,
            maxCapacity: 458.4544
          };
          const opsPerformance: OpsPerformance = {
            avgReads: data.stats.averageReadTime,
            avgRemoves: data.stats.averageRemoveTime,
            avgWrites: data.stats.averageWriteTime
          };
          const cacheActivity: CacheActivity = {
            readHits: data.stats.hits,
            readMisses: data.stats.misses,
            removeHits: data.stats.removeHits,
            removeMisses: data.stats.removeMisses,
          };

          const cacheLoader: CacheLoader = {
            evictions: data.stats.evictions,
            misses: data.stats.misses,
            hits: data.stats.hits,
            retrievals: data.stats.retrievals,
            stores: data.stats.stores
          };

          return <DetailedInfinispanCache>{
            name: cacheName,
            started: data.started,
            size: data.size,
            type: this.mapCacheType(data),
            opsPerformance: opsPerformance,
            cacheActivity: cacheActivity,
            cacheContent: cacheContent,
            cacheLoader: cacheLoader,
            persisted: false,
            transactional: false,
            persistent: false,
            bounded: false,
            indexed: false,
            secured: false,
            hasRemoteBackup: false
          }
        }
      );
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

  public createCacheByConfigName(cacheName: string, configName: string): Promise<string> {
    return fetch(this.endpoint + '/caches/' + cacheName + '?template=' + configName, {
      method: 'POST'
    }).then(response => response.ok ? '' : response.statusText)
      .catch(error => error.toString());
  };

  public createCacheWithConfiguration(cacheName: string, config: string): Promise<string> {
    let headers = new Headers();
    try {
      JSON.parse(config);
      headers.append('Content-Type', 'application/json');
    } catch (e) {
      console.log(e);
      headers.append('Content-Type', 'application/xml');
    }
    return fetch(this.endpoint + '/caches/' + cacheName, {
      method: 'POST',
      body: config,
      headers: headers
    })
      .then(response => response.ok ? '' : response.statusText)
      .catch(error => error.toString());
  }
}

const cacheService: CacheService = new CacheService(utils.endpoint());

export default cacheService;
