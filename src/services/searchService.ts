import { RestUtils } from './utils';
import { Either, left, right } from './either';
import displayUtils from '@services/displayUtils';

/**
 * Search Service calls Infinispan endpoints related to Search
 * @author Katia Aresti
 */
export class SearchService {
  endpoint: string;
  utils: RestUtils;

  constructor(endpoint: string, restUtils: RestUtils) {
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
    return this.utils
      .restCall(
        this.endpoint +
          encodeURIComponent(cacheName) +
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
      .then((response) => {
        if (response.ok) {
          return response.json().then(
            (json) =>
              <SearchResut>{
                total: json.total_results,
                values: json.hits.map((hit) =>
                  JSON.stringify(hit.hit, null, 2)
                ),
              }
          );
        }
        throw response;
      })
      .then((data) => right(data) as Either<ActionResponse, SearchResut>)
      .catch((err) => {
        if (err instanceof TypeError) {
          return left(<ActionResponse>{
            message: 'Cannot perform query. ' + err.message,
            success: false,
          });
        }

        if (err instanceof Response) {
          if (err.status == 400) {
            return err.json().then((jsonError) =>
              left(<ActionResponse>{
                message: jsonError.error.message + '\n' + jsonError.error.cause,
                success: false,
              })
            );
          }

          return err
            .text()
            .then((errorMessage) =>
              left(<ActionResponse>{ message: errorMessage, success: false })
            );
        }
        return left(<ActionResponse>{
          message: 'Cannot perform query.',
          success: false,
        });
      });
  }

  /**
   * Retrieve index and query stats
   *
   * @param cacheName
   */
  public async retrieveStats(
    cacheName: string
  ): Promise<Either<ActionResponse, SearchStats>> {
    return this.utils
      .restCall(
        this.endpoint + encodeURIComponent(cacheName) + '/search/stats',
        'GET'
      )
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw response;
      })
      .then((data) => {
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
              size: displayUtils.formatBigNumber(data.index.types[indexType].size),
            }
        );
        return right(<SearchStats>{
          query: queryStats,
          index: indexStats,
          reindexing: data.reindexing,
        });
      })
      .catch((err) => {
        if (err instanceof TypeError) {
          return left(<ActionResponse>{ message: err.message, success: false });
        }

        return err.text().then((errorMessage) => {
          if (errorMessage == '') {
            errorMessage =
              'An error occurred when retrieving index statistics for cache ' +
              cacheName;
          }

          return left(<ActionResponse>{
            message: errorMessage,
            success: false,
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
    return this.utils
      .restCall(
        this.endpoint +
          encodeURIComponent(cacheName) +
          '/search/indexes?action=clear',
        'POST'
      )
      .then((response) => {
        if (response.ok) {
          return <ActionResponse>{
            message: 'Index of cache ' + cacheName + ' cleared.',
            success: true,
          };
        }
        throw response;
      })
      .catch((err) => {
        let genericError =
          'An error occurred when clearing the index for cache ' + cacheName;
        if (err instanceof TypeError) {
          return <ActionResponse>{ message: err.message, success: false };
        }

        if (err instanceof Response) {
          return err.text().then((errorMessage) => {
            if (errorMessage == '') {
              errorMessage = genericError;
            }

            return <ActionResponse>{
              message: errorMessage,
              success: false,
            };
          });
        }

        return <ActionResponse>{
          message: genericError,
          success: false,
        };
      });
  }

  /**
   * Reindex cache
   *
   * @param cacheName
   */
  public async reindex(cacheName: string): Promise<ActionResponse> {
    return this.utils
      .restCall(
        this.endpoint +
          encodeURIComponent(cacheName) +
          '/search/indexes?action=mass-index&mode=async',
        'POST'
      )
      .then((response) => {
        if (response.ok) {
          return <ActionResponse>{
            message: 'Indexing cache ' + cacheName + ' started.',
            success: true,
          };
        }
        throw response;
      })
      .catch((err) => {
        let genericError =
          'An error occurred when starting to rebuild the index for cache ' +
          cacheName;
        if (err instanceof TypeError) {
          return <ActionResponse>{ message: err.message, success: false };
        }

        if (err instanceof Response) {
          return err.text().then((errorMessage) => {
            if (errorMessage == '') {
              errorMessage = genericError;
            }

            return <ActionResponse>{
              message: errorMessage,
              success: false,
            };
          });
        }

        return <ActionResponse>{
          message: genericError,
          success: false,
        };
      });
  }

  /**
   * Clears the cache query statistics
   *
   * @param cacheName
   */
  public async clearQueryStats(cacheName: string): Promise<ActionResponse> {
    return this.utils
      .restCall(
        this.endpoint +
          encodeURIComponent(cacheName) +
          '/search/stats?action=clear',
        'POST'
      )
      .then((response) => {
        let message = '';
        if (response.ok) {
          message = 'Query statistics of cache ' + cacheName + ' cleared.';
        } else {
          message = 'Cannot clear query statistics of cache ' + cacheName;
        }

        return <ActionResponse>{ message: message, success: response.ok };
      })
      .catch((err) => <ActionResponse>{ message: err.message, success: false });
  }
}
