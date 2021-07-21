import { FetchCaller } from './fetchCaller';
import { Either, left, right } from './either';
import { CacheConfigUtils } from '@services/cacheConfigUtils';
import { ContentTypeHeaderMapper } from '@services/contentTypeHeaderMapper';
import { CacheRequestResponseMapper } from '@services/cacheRequestResponseMapper';
import { ContentType, EncodingType } from '@services/infinispanRefData';

/**
 * Cache Service calls Infinispan endpoints related to Caches
 * @author Katia Aresti
 */
export class CacheService {
  endpoint: string;
  fetchCaller: FetchCaller;

  constructor(endpoint: string, fetchCaller: FetchCaller) {
    this.endpoint = endpoint;
    this.fetchCaller = fetchCaller;
  }

  /**
   * Retrieves all the properties to be displayed in the cache detail in a single rest call
   *
   * @param cacheName
   */
  public retrieveFullDetail(
    cacheName: string
  ): Promise<Either<ActionResponse, DetailedInfinispanCache>> {
    return this.fetchCaller.get(
      this.endpoint + '/caches/' + encodeURIComponent(cacheName),
      (data) => {
        let cacheStats;
        if (data['stats']) {
          cacheStats = <CacheStats>{
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
              data.stats.required_minimum_number_of_nodes,
          };
        }

        let keyValueEncoding = CacheConfigUtils.mapEncoding(data.configuration);
        return <DetailedInfinispanCache>{
          name: cacheName,
          started: true,
          type: CacheConfigUtils.mapCacheType(data.configuration),
          encoding: keyValueEncoding,
          size: data['size'],
          rehash_in_progress: data['rehash_in_progress'],
          indexing_in_progress: data['indexing_in_progress'],
          editable:
            CacheConfigUtils.isEditable(keyValueEncoding.key as EncodingType) &&
            CacheConfigUtils.isEditable(keyValueEncoding.value as EncodingType),
          queryable: data.queryable,
          features: <Features>{
            bounded: data.bounded,
            indexed: data.indexed,
            persistent: data.persistent,
            transactional: data.transactional,
            secured: data.secured,
            hasRemoteBackup: data['has_remote_backup'],
          },
          configuration: <CacheConfig>{
            name: cacheName,
            config: JSON.stringify(data.configuration, null, 2),
          },
          stats: cacheStats,
        };
      }
    );
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
    const createCacheByConfig =
      this.endpoint +
      '/caches/' +
      encodeURIComponent(cacheName) +
      '?template=' +
      encodeURIComponent(configName);

    return this.fetchCaller.post({
      url: createCacheByConfig,
      successMessage: `Cache ${cacheName} successfully created with ${configName}.`,
      errorMessage: `Unexpected error when creating cache ${configName}.`,
    });
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
    let contentType = ContentType.JSON;
    try {
      JSON.parse(config);
    } catch (e) {
      contentType = ContentType.XML;
    }
    let customHeaders = new Headers();
    customHeaders.append(
      'Content-Type',
      ContentTypeHeaderMapper.fromContentType(contentType)
    );

    const urlCreateCache =
      this.endpoint + '/caches/' + encodeURIComponent(cacheName);
    return this.fetchCaller.post({
      url: urlCreateCache,
      successMessage: `Cache ${cacheName} created with the provided configuration.`,
      errorMessage:
        'Unexpected error creating the cache with the provided configuration.',
      customHeaders: customHeaders,
      body: config,
    });
  }

  /**
   * Delete cache by name
   *
   * @param cacheName, to be deleted if such exists
   */
  public async deleteCache(cacheName: string): Promise<ActionResponse> {
    return this.fetchCaller.delete({
      url: this.endpoint + '/caches/' + encodeURIComponent(cacheName),
      successMessage: `Cache ${cacheName} deleted.`,
      errorMessage: `Unexpected error deleting cache ${cacheName}.`,
    });
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
    return this.fetchCaller.post({
      url:
        this.endpoint +
        '/server/ignored-caches/' +
        cacheManager +
        '/' +
        encodeURIComponent(cacheName),
      successMessage: `Cache ${cacheName} hidden.`,
      errorMessage: `Unexpected error hidding cache ${cacheName}.`,
    });
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
    return this.fetchCaller.delete({
      url:
        this.endpoint +
        '/server/ignored-caches/' +
        cacheManager +
        '/' +
        encodeURIComponent(cacheName),
      successMessage: `Cache ${cacheName} is now visible.`,
      errorMessage: `Unexpected error making cache ${cacheName} visible again.`,
    });
  }

  /**
   * Add or Update an entry
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
  public async createOrUpdateEntry(
    cacheName: string,
    cacheEncoding: CacheEncoding,
    key: string,
    keyContentType: ContentType,
    value: string,
    valueContentType: ContentType,
    maxIdle: string,
    timeToLive: string,
    flags: string[],
    create: boolean
  ): Promise<ActionResponse> {
    let headers = new Headers();
    let keyContentTypeHeader = ContentTypeHeaderMapper.fromEncodingAndContentTypeToHeader(
      cacheEncoding.key as EncodingType,
      key,
      keyContentType
    );
    let contentTypeHeader = ContentTypeHeaderMapper.fromEncodingAndContentTypeToHeader(
      cacheEncoding.value as EncodingType,
      value,
      valueContentType
    );
    headers.append('Key-Content-Type', keyContentTypeHeader);
    headers.append('Content-Type', contentTypeHeader);
    if (timeToLive.length > 0) headers.append('timeToLiveSeconds', timeToLive);
    if (maxIdle.length > 0) headers.append('maxIdleTimeSeconds', maxIdle);
    if (flags.length > 0) headers.append('flags', flags.join(','));

    // treat key to send in the url
    let keyForUrl = '';
    const maybeKeyForUrl = CacheRequestResponseMapper.formatContent(
      key,
      keyContentType,
      cacheEncoding.key as EncodingType
    );
    if (maybeKeyForUrl.isRight()) {
      keyForUrl = maybeKeyForUrl.value;
    } else {
      return Promise.resolve(maybeKeyForUrl.value);
    }

    // treat value to send in the body
    let body = '';
    const maybeBody = CacheRequestResponseMapper.formatContent(
      value,
      valueContentType,
      cacheEncoding.value as EncodingType
    );
    if (maybeBody.isRight()) {
      body = maybeBody.value;
    } else {
      return Promise.resolve(maybeBody.value);
    }

    const urlCreateOrUpdate =
      this.endpoint +
      '/caches/' +
      encodeURIComponent(cacheName) +
      '/' +
      encodeURIComponent(keyForUrl);

    return create
      ? this.fetchCaller.post({
          url: urlCreateOrUpdate,
          successMessage: `Entry added to cache ${cacheName}.`,
          errorMessage: `Unexpected error creating an entry in cache ${cacheName}.`,
          customHeaders: headers,
          body: body,
        })
      : this.fetchCaller.put({
          url: urlCreateOrUpdate,
          successMessage: `Entry updated in cache ${cacheName}.`,
          errorMessage: `Unexpected error updating an entry in cache ${cacheName}.`,
          customHeaders: headers,
          body: body,
        });
  }

  /**
   * List of entries.
   *
   * @param cacheName, the cache name
   * @param limit, maximum number of entries to be retrieved
   */
  public async getEntries(
    cacheName: string,
    encoding: CacheEncoding,
    limit: string
  ): Promise<Either<ActionResponse, CacheEntry[]>> {
    const entriesUrl =
      this.endpoint +
      '/caches/' +
      encodeURIComponent(cacheName) +
      '?action=entries&content-negotiation=true&metadata=true&limit=' +
      limit;

    const customHeaders = new Headers();
    customHeaders.set(
      'Accept',
      ContentTypeHeaderMapper.fromContentType(ContentType.JSON)
    );
    return this.fetchCaller.get(
      entriesUrl,
      (data) => CacheRequestResponseMapper.toEntries(data, encoding),
      customHeaders
    );
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
    encoding: CacheEncoding,
    key: string,
    keyContentType: ContentType
  ): Promise<Either<ActionResponse, CacheEntry[]>> {
    let customHeaders = new Headers();

    if ((encoding.value as EncodingType) == EncodingType.XML) {
      customHeaders.append('Accept', 'application/xml');
    } else if (
      (encoding.value as EncodingType) == EncodingType.JSON ||
      (encoding.value as EncodingType) == EncodingType.Protobuf
    ) {
      customHeaders.append('Accept', 'application/json');
    } else {
      customHeaders.append('Accept', 'text/plain');
    }

    let keyContentTypeHeader;
    let keyForURL;
    if (
      encoding.key == EncodingType.Protobuf ||
      encoding.key == EncodingType.JSON
    ) {
      keyContentTypeHeader = ContentTypeHeaderMapper.fromContentType(
        ContentType.JSON
      );
      let keyProtobuffed = CacheRequestResponseMapper.formatContent(
        key,
        keyContentType,
        encoding.key as EncodingType
      );
      if (keyProtobuffed.isLeft()) {
        // Return the error
        return Promise.resolve(left(keyProtobuffed.value));
      }
      keyForURL = keyProtobuffed.value;
    } else {
      keyContentTypeHeader = ContentTypeHeaderMapper.fromContentType(
        keyContentType
      );
      keyForURL = key;
    }

    customHeaders.append('Key-Content-Type', keyContentTypeHeader);

    const getEntryUrl =
      this.endpoint +
      '/caches/' +
      encodeURIComponent(cacheName) +
      '/' +
      encodeURIComponent(keyForURL);

    return this.fetchCaller
      .fetch(getEntryUrl, 'GET', customHeaders)
      .then((response) => {
        if (response.ok) {
          return response
            .text()
            .then((value) => [
              CacheRequestResponseMapper.toEntry(
                key,
                keyContentType,
                encoding,
                value,
                response.headers
              ),
            ]);
        }

        if (response.status == 404) {
          // Just return empty array if not found
          return [];
        }

        return response.text().then((text) => {
          throw text;
        });
      })
      .then((data) => right(data) as Either<ActionResponse, CacheEntry[]>)
      .catch((err) => {
        return left(
          this.fetchCaller.mapError(
            err,
            'An error occurred retrieving key ' + key
          )
        );
      });
  }

  /**
   * Clear cache
   * @param cacheName, the name of the cache
   */
  public async clear(cacheName: string): Promise<ActionResponse> {
    const clearUrl =
      this.endpoint +
      '/caches/' +
      encodeURIComponent(cacheName) +
      '?action=clear';
    return this.fetchCaller.post({
      url: clearUrl,
      successMessage: `Cache ${cacheName} cleared.`,
      errorMessage: `Unexpected error when clearing the cache ${cacheName}.`,
    });
  }

  /**
   * Delete entry from cache
   *
   * @param cacheName, cache name
   * @param entryKey, entry key
   */
  public async deleteEntry(
    cacheName: string,
    key: string,
    keyEncoding: EncodingType,
    keyContentType: ContentType
  ): Promise<ActionResponse> {
    let headers = new Headers();
    let keyContentTypeHeader;
    let keyForURL;
    if (
      keyEncoding == EncodingType.Protobuf ||
      keyEncoding == EncodingType.JSON
    ) {
      keyContentTypeHeader = ContentTypeHeaderMapper.fromContentType(
        ContentType.JSON
      );
      let keyProtobuffed = CacheRequestResponseMapper.formatContent(
        key,
        keyContentType,
        keyEncoding
      );
      if (keyProtobuffed.isLeft()) {
        // Return the error
        return Promise.resolve({
          message: 'Unexpected issue to parse key value',
          success: false,
        });
      }
      keyForURL = keyProtobuffed.value;
    } else {
      keyContentTypeHeader = ContentTypeHeaderMapper.fromContentType(
        keyContentType
      );
      keyForURL = key;
    }

    headers.append('Key-Content-Type', keyContentTypeHeader);

    const deleteUrl =
      this.endpoint +
      '/caches/' +
      encodeURIComponent(cacheName) +
      '/' +
      encodeURIComponent(keyForURL);

    return this.fetchCaller.delete({
      url: deleteUrl,
      successMessage: `Entry ${key} deleted.`,
      errorMessage: 'Unexpected error deleting the entry.',
      customHeaders: headers,
    });
  }

  /**
   * Retrieve cache configuration
   *
   * @param cacheName
   */
  public async getConfiguration(
    cacheName: string
  ): Promise<Either<ActionResponse, CacheConfig>> {
    return this.fetchCaller.get(
      this.endpoint +
        '/caches/' +
        encodeURIComponent(cacheName) +
        '?action=config',
      (data) =>
        <CacheConfig>{
          name: cacheName,
          config: JSON.stringify(data, null, 2),
        }
    );
  }

  public async getSize(
    cacheName: string
  ): Promise<Either<ActionResponse, number>> {
    return this.fetchCaller
      .fetch(
        this.endpoint +
          '/caches/' +
          encodeURIComponent(cacheName) +
          '?action=size',
        'GET'
      )
      .then((response) => response.text())
      .then((data) => {
        if (Number.isNaN(data)) {
          return right(Number.parseInt(data)) as Either<ActionResponse, number>;
        } else {
          return left(<ActionResponse>{
            message: 'Size of cache ' + cacheName + ' is not a number :' + data,
            success: false,
          }) as Either<ActionResponse, number>;
        }
      })
      .catch((err) =>
        left(
          this.fetchCaller.mapError(
            err,
            'Cannot get size for cache ' + cacheName
          )
        )
      );
  }
}
