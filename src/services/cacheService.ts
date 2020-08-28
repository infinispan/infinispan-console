/**
 * Cache Service calls Infinispan endpoints related to Caches
 * @author Katia Aresti
 * @since 1.0
 */
import utils, {KeyContentType, ValueContentType} from './utils';
import {Either, left, right} from './either';

class CacheService {
  endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  /**
   * Retrieves all the properties to be displayed in the cache detail in a single rest call
   *
   * @param cacheName
   */
  public retrieveFullDetail(
    cacheName: string
  ): Promise<Either<ActionResponse, DetailedInfinispanCache>> {
    return utils
      .restCall(this.endpoint + '/caches/' + cacheName, 'GET')
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw response;
      })
      .then(data => {
        const cacheStats = <CacheStats>{
          enabled: data.statistics,
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

        return right(<DetailedInfinispanCache>{
          name: cacheName,
          started: true,
          type: this.mapCacheType(data.configuration),
          size: data.size,
          rehash_in_progress: data.rehash_in_progress,
          indexing_in_progress: data.indexing_in_progress,
          queryable: data.queryable,
          features: <Features>{
            bounded: data.bounded,
            indexed: data.indexed,
            persistent: data.persistent,
            transactional: data.transactional,
            secured: data.secured,
            hasRemoteBackup: data.has_remote_backup
          },
          configuration: <CacheConfig>{
            name: cacheName,
            config: JSON.stringify(data.configuration, null, 2)
          },
          stats: cacheStats
        });
      })
      .catch(err => {
        const errorMessage =
          'Unable to retrieve cache detail of cache ' + cacheName;
        if (err instanceof Response) {
          return err.text().then(errResponse => {
            if (errResponse == '') {
              errResponse = errorMessage;
            }
            return left(<ActionResponse>{
              message: errResponse,
              success: false
            });
          });
        }

        return left(<ActionResponse>{
          message: err.toString() == '' ? errorMessage : err.toString(),
          success: false
        });
      });
  }

  /**
   * Creates a cache by configuration name.
   * The template must be present in the server
   *
   * @param cacheName, the cache name
   * @param configName, the template name
   */
  public async createCacheByConfigName(
    cacheName: string,
    configName: string
  ): Promise<ActionResponse> {
    let createCachePromise = utils.restCall(
      this.endpoint + '/caches/' + cacheName + '?template=' + configName,
      'POST'
    );
    return utils.handleCRUDActionResponse(
      cacheName,
      'Cache ' + cacheName + ' created with success with ' + configName,
      createCachePromise
    );
  }

  /**
   * Create a cache with the configuration provided.
   * Config can be in json or xml format
   *
   * @param cacheName, the cache name
   * @param config, the configuration to send in the body
   */
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
    let createCachePromise = utils.restCallWithBody(
      this.endpoint + '/caches/' + cacheName,
      'POST',
      config,
      contentType
    );
    return utils.handleCRUDActionResponse(
      cacheName,
      'Cache ' +
        cacheName +
        ' created with success with the provided configuration',
      createCachePromise
    );
  }

  /**
   * Delete cache by name
   *
   * @param cacheName, to be deleted if such exists
   */
  public async deleteCache(cacheName: string): Promise<ActionResponse> {
    let deleteCachePromise = utils.restCall(
      this.endpoint + '/caches/' + cacheName,
      'DELETE'
    );

    return utils.handleCRUDActionResponse(
      cacheName,
      'Cache ' + cacheName + ' has been deleted',
      deleteCachePromise
    );
  }

  /**
   * Ignore cache by name
   *
   * @param cacheName, to be deleted if such exists
   */
  public async ignoreCache(
    cacheManager: string,
    cacheName: string
  ): Promise<ActionResponse> {
    let ignoreCachePromise = utils.restCall(
      this.endpoint +
        '/server/ignored-caches/' +
        cacheManager +
        '/' +
        cacheName,
      'POST'
    );

    return utils.handleCRUDActionResponse(
      cacheName,
      'Cache ' + cacheName + ' has been ignored',
      ignoreCachePromise
    );
  }

  /**
   * Undo ignore cache by name
   *
   * @param cacheName, to be deleted if such exists
   */
  public async undoIgnoreCache(
    cacheManager: string,
    cacheName: string
  ): Promise<ActionResponse> {
    let ignoreCachePromise = utils.restCall(
      this.endpoint +
        '/server/ignored-caches/' +
        cacheManager +
        '/' +
        cacheName,
      'DELETE'
    );

    return utils.handleCRUDActionResponse(
      cacheName,
      'Cache ' + cacheName + ' is not ignored',
      ignoreCachePromise
    );
  }

  /**
   * Add entry
   *
   * @param cacheName
   * @param key
   * @param keyContentType
   * @param value
   * @param valueContentType
   * @param maxIdle
   * @param timeToLive
   * @param flags
   */
  public async createOrUpdate(
    cacheName: string,
    key: string,
    keyContentType: KeyContentType,
    value: string,
    valueContentType: ValueContentType,
    maxIdle: string,
    timeToLive: string,
    flags: string[],
    create: boolean
  ): Promise<ActionResponse> {
    let headers = utils.createAuthenticatedHeader();

    if (keyContentType) {
      let keyContentTypeHeader = this.keyContentTypeHeader(keyContentType);
      headers.append('Key-Content-Type', keyContentTypeHeader);
    }

    if (valueContentType) {
      headers.append('Content-Type', valueContentType);
    } else {
      if (utils.isJSONObject(value)) {
        headers.append('Content-Type', ValueContentType.JSON);
      }
    }

    if (timeToLive.length > 0) {
      headers.append('timeToLiveSeconds', timeToLive);
    }
    if (maxIdle.length > 0) {
      headers.append('maxIdleTimeSeconds', maxIdle);
    }
    if (flags.length > 0) {
      headers.append('flags', flags.join(','));
    }

    let promise = fetch(this.endpoint + '/caches/' + cacheName + '/' + key, {
      method: create ? 'POST' : 'PUT',
      headers: headers,
      credentials: 'include',
      body: value
    });

    let message = create
      ? 'A new entry has been added to cache '
      : 'The entry has been updated in cache ';
    return utils.handleCRUDActionResponse(
      cacheName,
      message + cacheName,
      promise
    );
  }

  /**
   * Calculate the key content type header value to send ot the REST API
   * @param keyContentType
   */
  private keyContentTypeHeader(keyContentType: KeyContentType) {
    if (
      keyContentType == KeyContentType.StringContentType ||
      KeyContentType.DoubleContentType ||
      KeyContentType.IntegerContentType ||
      KeyContentType.LongContentType ||
      KeyContentType.BooleanContentType
    ) {
      return 'application/x-java-object;type=' + keyContentType.toString();
    }
    return keyContentType.toString();
  }

  /**
   * Get entry by key
   * @param cacheName
   * @param key
   * @param keyContentType
   * @return Entry or ActionResponse
   */
  public async getEntry(
    cacheName: string,
    key: string,
    keyContentType?: string
  ): Promise<Either<ActionResponse, CacheEntry>> {
    return utils
      .restCall(this.endpoint + '/caches/' + cacheName + '/' + key, 'GET')
      .then(response => {
        if (response.ok) {
          return response.text().then(value => {
            const timeToLive = response.headers.get('timeToLiveSeconds');
            const maxIdleTimeSeconds = response.headers.get(
              'maxIdleTimeSeconds'
            );
            const created = response.headers.get('created');
            const lastUsed = response.headers.get('lastUsed');
            const lastModified = response.headers.get('Last-Modified');
            const expires = response.headers.get('Expires');
            const cacheControl = response.headers.get('Cache-Control');
            const etag = response.headers.get('Etag');
            return <CacheEntry>{
              key: key,
              value: value,
              timeToLive: timeToLive,
              maxIdle: maxIdleTimeSeconds,
              created: created
                ? new Date(Number.parseInt(created)).toLocaleString()
                : created,
              lastUsed: lastUsed
                ? new Date(Number.parseInt(lastUsed)).toLocaleString()
                : lastUsed,
              lastModified: lastModified
                ? new Date(Date.parse(lastModified)).toLocaleString()
                : lastModified,
              expires: expires
                ? new Date(Date.parse(expires)).toLocaleString()
                : expires,
              cacheControl: cacheControl,
              eTag: etag
            };
          });
        }
        throw response;
      })
      .then(data => right(data))
      .catch(err => {
        let actionResponse = <ActionResponse>{
          message: 'An error happened',
          success: false
        };
        if (err instanceof TypeError) {
          actionResponse = <ActionResponse>{
            message: err.message,
            success: false
          };
        }
        if (err instanceof Response) {
          if (err.status.valueOf() == 404) {
            // Not Found
            actionResponse = <ActionResponse>{
              message: 'The entry key ' + key + ' does not exist',
              success: false
            };
          } else {
            return err.text().then(errorMessage =>
              left(<ActionResponse>{
                message:
                  errorMessage == '' ? 'An error happened' : errorMessage,
                success: false
              })
            );
          }
        }
        return left(actionResponse);
      });
  }

  /**
   * Clear cache
   * @param cacheName, the name of the cache
   */
  public async clear(cacheName: string): Promise<ActionResponse> {
    let clearPromise = utils.restCall(
      this.endpoint + '/caches/' + cacheName + '?action=clear',
      'POST'
    );

    return utils.handleCRUDActionResponse(
      cacheName,
      'Cache ' + cacheName + ' has been cleared',
      clearPromise
    );
  }

  /**
   * Delete entry from cache
   *
   * @param cacheName, cache name
   * @param entryKey, entry key
   */
  public async deleteEntry(
    cacheName: string,
    entryKey: string
  ): Promise<ActionResponse> {
    let deleteEntryPromise = utils.restCall(
      this.endpoint + '/caches/' + cacheName + '/' + entryKey,
      'DELETE'
    );

    return utils.handleCRUDActionResponse(
      cacheName,
      'Entry ' + entryKey + ' has been deleted',
      deleteEntryPromise
    );
  }

  /**
   * Retrieve backups sites for a cache
   *
   * @param cacheName
   */
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

  /**
   * Retrieve cache configuration
   *
   * @param cacheName
   */
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

  /**
   * Search entries by query
   *
   * @param cacheName
   * @param query
   * @return SearchResult or ActionResponse
   */
  public async searchValues(
    cacheName: string,
    query: string,
    maxResults: number,
    offset: number
  ): Promise<Either<ActionResponse, SearchResut>> {
    return utils
      .restCall(
        this.endpoint +
          '/caches/' +
          cacheName +
          '?action=search' +
          '&query=' +
          query +
          '&max_results=' +
          maxResults +
          '&offset=' +
          offset * maxResults,
        'GET',
        'application/json;q=0.8'
      )
      .then(response => {
        if (response.ok) {
          return response.json().then(
            json =>
              <SearchResut>{
                total: json.total_results,
                values: json.hits.map(hit => JSON.stringify(hit.hit, null, 2))
              }
          );
        }
        throw response;
      })
      .then(data => right(data))
      .catch(err => {
        if (err instanceof TypeError) {
          return left(<ActionResponse>{
            message: 'Unable to query. ' + err.message,
            success: false
          });
        }

        if (err instanceof Response) {
          if (err.status == 400) {
            return err.json().then(jsonError =>
              left(<ActionResponse>{
                message: jsonError.error.message + '\n' + jsonError.error.cause,
                success: false
              })
            );
          }

          return err
            .text()
            .then(errorMessage =>
              left(<ActionResponse>{ message: errorMessage, success: false })
            );
        }
        return left(<ActionResponse>{
          message: 'Unable to query',
          success: false
        });
      });
  }

  /**
   * Retrieve index stats for the cache name
   *
   * @param cacheName
   */
  public async retrieveIndexStats(
    cacheName: string
  ): Promise<Either<ActionResponse, IndexStats>> {
    return utils
      .restCall(
        this.endpoint + '/caches/' + cacheName + '/search/indexes/stats',
        'GET'
      )
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw response;
      })
      .then(data =>
        right(<IndexStats>{
          class_names: data.indexed_class_names,
          entities_count: this.mapToIndexValueArray(
            data.indexed_entities_count
          ),
          sizes: this.mapToIndexValueArray(data.index_sizes),
          reindexing: data.reindexing
        })
      )
      .catch(err => {
        if (err instanceof TypeError) {
          return left(<ActionResponse>{ message: err.message, success: false });
        }

        return err.text().then(errorMessage => {
          if (errorMessage == '') {
            errorMessage =
              'An error happened retrieving index stats for cache ' + cacheName;
          }

          return left(<ActionResponse>{
            message: errorMessage,
            success: false
          });
        });
      });
  }

  /**
   * Purge index for the cache name
   *
   * @param cacheName
   */
  public async purgeIndexes(cacheName: string): Promise<ActionResponse> {
    return utils
      .restCall(
        this.endpoint + '/caches/' + cacheName + '/search/indexes?action=clear',
        'POST'
      )
      .then(response => {
        if (response.ok) {
          return <ActionResponse>{
            message: 'Index of cache ' + cacheName + ' purged',
            success: true
          };
        }
        throw response;
      })
      .catch(err => {
        let genericError =
          'An error happened when purging index for cache ' + cacheName;
        if (err instanceof TypeError) {
          return <ActionResponse>{ message: err.message, success: false };
        }

        if (err instanceof Response) {
          return err.text().then(errorMessage => {
            if (errorMessage == '') {
              errorMessage = genericError;
            }

            return <ActionResponse>{
              message: errorMessage,
              success: false
            };
          });
        }

        return <ActionResponse>{
          message: genericError,
          success: false
        };
      });
  }

  /**
   * Reindex cache
   *
   * @param cacheName
   */
  public async reindex(cacheName: string): Promise<ActionResponse> {
    return utils
      .restCall(
        this.endpoint +
          '/caches/' +
          cacheName +
          '/search/indexes?action=mass-index&mode=async',
        'POST'
      )
      .then(response => {
        if (response.ok) {
          return <ActionResponse>{
            message: 'Indexing of cache ' + cacheName + ' started',
            success: true
          };
        }
        throw response;
      })
      .catch(err => {
        let genericError =
          'An error happened when starting reindex operation for cache ' +
          cacheName;
        if (err instanceof TypeError) {
          return <ActionResponse>{ message: err.message, success: false };
        }

        if (err instanceof Response) {
          return err.text().then(errorMessage => {
            if (errorMessage == '') {
              errorMessage = genericError;
            }

            return <ActionResponse>{
              message: errorMessage,
              success: false
            };
          });
        }

        return <ActionResponse>{
          message: genericError,
          success: false
        };
      });
  }

  private mapToIndexValueArray(data: JSON): IndexValue[] {
    return Object.keys(data).map(
      key => <IndexValue>{ entity: key as string, count: data[key] as number }
    );
  }

  public async retrieveQueryStats(
    cacheName: string
  ): Promise<Either<ActionResponse, QueryStats>> {
    return utils
      .restCall(
        this.endpoint + '/caches/' + cacheName + '/search/query/stats',
        'GET'
      )
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw response;
      })
      .then(data =>
        right(<QueryStats>{
          search_query_execution_count: data.search_query_execution_count,
          search_query_total_time: data.search_query_total_time,
          search_query_execution_max_time: data.search_query_execution_max_time,
          search_query_execution_avg_time: data.search_query_execution_avg_time,
          object_loading_total_time: data.object_loading_total_time,
          object_loading_execution_max_time:
            data.object_loading_execution_max_time,
          object_loading_execution_avg_time:
            data.object_loading_execution_avg_time,
          objects_loaded_count: data.objects_loaded_count,
          search_query_execution_max_time_query_string:
            data.search_query_execution_max_time_query_string
        })
      )
      .catch(err => {
        let genericError =
          'An error happened when starting reindex operation for cache ' +
          cacheName;
        if (err instanceof TypeError) {
          return left(<ActionResponse>{ message: err.message, success: false });
        }

        return err
          .text()
          .then(errorMessage =>
            left(<ActionResponse>{ message: errorMessage, success: false })
          );
      });
  }

  /**
   * Clears the cache query statistics
   *
   * @param cacheName
   */
  public async clearQueryStats(cacheName: string): Promise<ActionResponse> {
    return utils
      .restCall(
        this.endpoint +
          '/caches/' +
          cacheName +
          '/search/query/stats?action=clear',
        'POST'
      )
      .then(response => {
        let message = '';
        if (response.ok) {
          message = 'Query stats of cache ' + cacheName + ' have been cleared';
        } else {
          message = 'Unable to clear query stats of cache ' + cacheName;
        }

        return <ActionResponse>{ message: message, success: response.ok };
      })
      .catch(err => <ActionResponse>{ message: err.message, success: false });
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
