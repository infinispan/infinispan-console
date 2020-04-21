/**
 * Cache Service calls Infinispan endpoints related to Caches
 * @author Katia Aresti
 * @since 1.0
 */
import utils from './utils';

class CacheService {
  endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  public retrieveFullDetail(
    cacheName: string
  ): Promise<DetailedInfinispanCache> {
    return utils
      .restCall(this.endpoint + '/caches/' + cacheName, 'GET')
      .then(response => response.json())
      .then(data => {
        const cacheStats = <CacheStats>{
          enabled: data.stats.current_number_of_entries == -1 ? false : true,
          misses: data.stats.misses,
          time_since_start: data.stats.time_since_start,
          time_since_reset: data.stats.time_since_reset,
          hits: data.stats.hits,
          current_number_of_entries: data.stats.current_number_of_entries,
          current_number_of_entries_in_memory:
            data.stats.current_number_of_entries_in_memory,
          total_number_of_entries: data.stats.total_number_of_entries,
          stores: data.stats.stores,
          off_heap_memory_used: data.stats.off_heap_memory_used,
          data_memory_used: data.stats.data_memory_used,
          retrievals: data.stats.retrievals,
          remove_hits: data.stats.remove_hits,
          remove_misses: data.stats.remove_misses,
          evictions: data.stats.evictions,
          average_read_time: data.stats.average_read_time,
          average_read_time_nanos: data.stats.average_read_time_nanos,
          average_write_time: data.stats.average_write_time,
          average_write_time_nanos: data.stats.average_write_time_nanos,
          average_remove_time: data.stats.average_remove_time,
          average_remove_time_nanos: data.stats.average_remove_time_nanos,
          required_minimum_number_of_nodes:
            data.stats.required_minimum_number_of_nodes
        };

        return <DetailedInfinispanCache>{
          name: cacheName,
          started: true,
          type: this.mapCacheType(data.configuration),
          size: data.size,
          rehash_in_progress: data.rehash_in_progress,
          indexing_in_progress: data.indexing_in_progress,
          bounded: data.bounded,
          indexed: data.indexed,
          persistent: data.persistent,
          transactional: data.transactional,
          secured: data.secured,
          has_remote_backup: data.has_remote_backup,
          configuration: data.configuration,
          stats: cacheStats
        };
      });
  }

  public async createCacheByConfigName(
    cacheName: string,
    configName: string
  ): Promise<ActionResponse> {
    return utils
      .restCall(
        this.endpoint + '/caches/' + cacheName + '?template=' + configName,
        'POST'
      )
      .then(response => response.text())
      .then(text =>
        text == ''
          ? <ActionResponse>{
              message: 'Cache ' + cacheName + ' created with success',
              success: true
            }
          : <ActionResponse>{ message: text, success: false }
      )
      .catch(
        error => <ActionResponse>{ message: error.toString(), success: false }
      );
  }

  public async createCacheWithConfiguration(
    cacheName: string,
    config: string
  ): Promise<ActionResponse> {
    let contentType = 'application/json';
    try {
      JSON.parse(config);
    } catch (e) {
      contentType = 'application/xml';
    }
    return utils
      .restCallWithBody(
        this.endpoint + '/caches/' + cacheName,
        'POST',
        config,
        contentType
      )
      .then(response => response.text())
      .then(text =>
        text == ''
          ? <ActionResponse>{
              message: 'Cache ' + cacheName + ' created with success',
              success: true
            }
          : <ActionResponse>{ message: text, success: false }
      )
      .catch(
        error => <ActionResponse>{ message: error.toString(), success: false }
      );
  }

  public async retrieveXSites(cacheName: string): Promise<XSite[]> {
    return utils
      .restCall(
        this.endpoint + '/caches/' + cacheName + '/x-site/backups/',
        'GET'
      )
      .then(response => response.json())
      .then(data => {
        let xsites: XSite[] = [];
        for (const [key, value] of Object.entries(data)) {
          xsites.push(<XSite>{ name: key, status: value });
        }
        return xsites;
      });
  }

  public async retrieveConfig(cacheName: string): Promise<CacheConfig> {
    return utils
      .restCall(
        this.endpoint + '/caches/' + cacheName + '?action=config',
        'GET'
      )
      .then(response => response.json())
      .then(
        data =>
          <CacheConfig>{
            name: cacheName,
            config: JSON.stringify(data, null, 2)
          }
      );
  }

  private mapCacheType(config: JSON): string {
    let cacheType: string = 'Unknown';
    if (config.hasOwnProperty('distributed-cache')) {
      cacheType = 'Distributed';
    } else if (config.hasOwnProperty('replicated-cache')) {
      cacheType = 'Replicated';
    } else if (config.hasOwnProperty('local-cache')) {
      cacheType = 'Local';
    } else if (config.hasOwnProperty('invalidation-cache')) {
      cacheType = 'Invalidated';
    } else if (config.hasOwnProperty('scattered-cache')) {
      cacheType = 'Scattered';
    }
    return cacheType;
  }
}

const cacheService: CacheService = new CacheService(utils.endpoint());

export default cacheService;
