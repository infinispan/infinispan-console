import { FetchCaller } from './fetchCaller';
import { Either } from './either';
import displayUtils from '@services/displayUtils';

/**
 * Search Service calls Infinispan endpoints related to Search
 * @author Katia Aresti
 */
export class SearchService {
  endpoint: string;
  utils: FetchCaller;

  constructor(endpoint: string, restUtils: FetchCaller) {
    this.endpoint = endpoint;
    this.utils = restUtils;
  }

  /**
   * Search in the values of a cache
   *
   * @param cacheName
   * @param query
   * @param maxResults
   * @param offset
   */
  public async searchValues(
    cacheName: string,
    query: string,
    maxResults: number,
    offset: number
  ): Promise<Either<ActionResponse, SearchResut>> {
    return this.utils.get(
      this.endpoint +
        encodeURIComponent(cacheName) +
        '?action=search' +
        '&query=' +
        encodeURIComponent(query) +
        '&max_results=' +
        maxResults +
        '&offset=' +
        offset * maxResults,
      (data) =>
        <SearchResut>{
          total: data.total_results,
          values: data.hits.map((hit) => JSON.stringify(hit.hit, null, 2)),
        }
    );
  }

  /**
   * Retrieve index and query stats
   *
   * @param cacheName
   */
  public async retrieveStats(
    cacheName: string
  ): Promise<Either<ActionResponse, SearchStats>> {
    return this.utils.get(
      this.endpoint + encodeURIComponent(cacheName) + '/search/stats',
      (data) => {
        const queryStats = Object.keys(data.query).map(
          (stat) =>
            <QueryStat>{
              name: (stat.charAt(0).toUpperCase() + stat.slice(1)).replace(
                '_',
                ' '
              ),
              count: displayUtils.formatNumber(data.query[stat].count),
              max: displayUtils.formatNumber(data.query[stat].max),
              average: displayUtils.formatNumber(data.query[stat].average),
              slowest: data.query[stat].slowest,
            }
        );

        const indexStats = Object.keys(data.index.types).map(
          (indexType) =>
            <IndexStat>{
              name: indexType,
              count: displayUtils.formatNumber(
                data.index.types[indexType].count
              ),
              size: displayUtils.formatBigNumber(
                data.index.types[indexType].size
              ),
            }
        );
        return <SearchStats>{
          query: queryStats,
          index: indexStats,
          reindexing: data.reindexing,
        };
      }
    );
  }

  /**
   * Purge index for the cache name
   *
   * @param cacheName
   */
  public async purgeIndexes(cacheName: string): Promise<ActionResponse> {
    return this.utils.post({
      url:
        this.endpoint +
        encodeURIComponent(cacheName) +
        '/search/indexes?action=clear',
      successMessage: `Index of cache ${cacheName} cleared.`,
      errorMessage: `An error occurred when clearing the index for cache ${cacheName}.`,
    });
  }

  /**
   * Reindex cache
   *
   * @param cacheName
   */
  public async reindex(cacheName: string): Promise<ActionResponse> {
    return this.utils.post({
      url:
        this.endpoint +
        encodeURIComponent(cacheName) +
        '/search/indexes?action=mass-index&mode=async',
      successMessage: `Reindexing cache ${cacheName} started.`,
      errorMessage: `An error occurred when starting to rebuild the index for cache ${cacheName}.`,
    });
  }

  /**
   * Clears the cache query statistics
   *
   * @param cacheName
   */
  public async clearQueryStats(cacheName: string): Promise<ActionResponse> {
    return this.utils.post({
      url:
        this.endpoint +
        encodeURIComponent(cacheName) +
        '/search/stats?action=clear',
      successMessage: `Query statistics of cache ${cacheName} cleared.`,
      errorMessage: `Cannot clear query statistics of cache ${cacheName}.`,
    });
  }
}
