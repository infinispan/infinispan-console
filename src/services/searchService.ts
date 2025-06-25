import { FetchCaller } from './fetchCaller';
import { Either, left, right } from './either';
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
  ): Promise<SearchResult> {
    const url = this.endpoint + encodeURIComponent(cacheName) + '?action=search';
    const body = JSON.stringify({
      query: query,
      max_results: maxResults,
      offset: offset * maxResults
    });
    return this.utils
      .fetch(url, 'POST', undefined, body)
      .then((response) => {
        if (response.ok || response.status == 400) {
          // Ok or bad request
          return response.json();
        }

        return response.text().then((text) => {
          throw text;
        });
      })
      .then((data) => {
        // Parse the results
        if (data['hits']) {
          return <SearchResult>{
            total: data.hit_count,
            values: data.hits.map((hit) => JSON.stringify(hit.hit, null, 2)),
            error: false,
            cause: '',
            executed: true
          };
        }
        // Parse the error
        return <SearchResult>{
          total: 0,
          values: [],
          error: true,
          executed: true,
          cause: data['error'] ? data['error'].cause : JSON.stringify(data)
        };
      })
      .catch(
        (err) =>
          <SearchResult>{
            total: 0,
            values: [],
            error: true,
            cause: 'Error executing search',
            message: err,
            executed: true
          }
      );
  }

  /**
   * Delete by query
   *
   * @param cacheName
   * @param query
   */
  public async deleteByQuery(cacheName: string, query: string, message: string): Promise<ActionResponse> {
    const url = this.endpoint + encodeURIComponent(cacheName) + '?action=deleteByQuery';
    const body = JSON.stringify({
      query: query
    });
    return this.utils
      .fetch(url, 'POST', undefined, body)
      .then((response) => {
        if (response.ok || response.status == 400) {
          // Ok or bad request
          return response.json();
        }

        return response.text().then((text) => {
          throw text;
        });
      })
      .then(
        () =>
          <ActionResponse>{
            message: message,
            success: true
          }
      )
      .catch(
        (err) =>
          <ActionResponse>{
            message: err as string,
            success: false
          }
      );
  }

  /**
   * Retrieve index and query stats
   *
   * @param cacheName
   */
  public async retrieveStats(cacheName: string): Promise<Either<ActionResponse, SearchStats>> {
    return this.utils.get(this.endpoint + encodeURIComponent(cacheName) + '/search/stats', (data) => {
      const queryStats = Object.keys(data.query).map(
        (stat) =>
          <QueryStat>{
            name: (stat.charAt(0).toUpperCase() + stat.slice(1)).replace('_', ' '),
            count: displayUtils.formatNumber(data.query[stat].count) + ' ns',
            max: displayUtils.formatNumber(data.query[stat].max) + ' ns',
            average: displayUtils.formatNumber(data.query[stat].average) + ' ns',
            slowest: data.query[stat].slowest
          }
      );

      const indexStats = Object.keys(data.index.types).map(
        (indexType) =>
          <IndexStat>{
            name: indexType,
            count: displayUtils.formatNumber(data.index.types[indexType].count),
            size: displayUtils.formatBigNumber(data.index.types[indexType].size)
          }
      );
      return <SearchStats>{
        query: queryStats,
        index: indexStats,
        reindexing: data.reindexing
      };
    });
  }

  /**
   * Retrieve index metamodel
   *
   * @param cacheName
   */
  public async retrieveIndexMetamodel(cacheName: string): Promise<Either<ActionResponse, Map<string, IndexMetamodel>>> {
    return this.utils.get(this.endpoint + encodeURIComponent(cacheName) + '/search/indexes/metamodel', (data) => {
      const metamodels = new Map();
      data.forEach((metamodel) => {
        const name = metamodel['entity-name'];
        metamodels.set(name, <IndexMetamodel>{
          indexName: metamodel['index-name'],
          entityName: name,
          valueFields: Object.keys(metamodel['value-fields']).map(
            (valueField) =>
              <IndexValueField>{
                name: valueField,
                multiValued: metamodel['value-fields'][valueField]['multi-valued'],
                multiValuedInRoot: metamodel['value-fields'][valueField]['multi-valued-in-root'],
                type: metamodel['value-fields'][valueField]['type'],
                projectionType: metamodel['value-fields'][valueField]['projection-type'],
                argumentType: metamodel['value-fields'][valueField]['argument-type'],
                searchable: metamodel['value-fields'][valueField]['searchable'],
                sortable: metamodel['value-fields'][valueField]['sortable'],
                projectable: metamodel['value-fields'][valueField]['projectable'],
                aggregable: metamodel['value-fields'][valueField]['aggregable'],
                analyzer: metamodel['value-fields'][valueField]['analyzer']
              }
          )
        });
      });
      return metamodels;
    });
  }

  /**
   * Purge index for the cache name
   *
   * @param cacheName
   */
  public async purgeIndexes(cacheName: string): Promise<ActionResponse> {
    return this.utils.post({
      url: this.endpoint + encodeURIComponent(cacheName) + '/search/indexes?action=clear',
      successMessage: `Index of cache ${cacheName} cleared.`,
      errorMessage: `An error occurred when clearing the index for cache ${cacheName}.`
    });
  }

  /**
   * Update schema for the cache name
   *
   * @param cacheName
   */
  public async updateSchema(cacheName: string): Promise<ActionResponse> {
    return this.utils.post({
      url: this.endpoint + encodeURIComponent(cacheName) + '/search/indexes?action=updateSchema',
      successMessage: `Schema of cache ${cacheName} updated.`,
      errorMessage: `An error occurred when updating the schema for cache ${cacheName}.`
    });
  }

  /**
   * Reindex cache
   *
   * @param cacheName
   */
  public async reindex(cacheName: string): Promise<ActionResponse> {
    return this.utils.post({
      url: this.endpoint + encodeURIComponent(cacheName) + '/search/indexes?action=mass-index&mode=async',
      successMessage: `Reindexing cache ${cacheName} started.`,
      errorMessage: `An error occurred when starting to rebuild the index for cache ${cacheName}.`
    });
  }

  /**
   * Clears the cache query statistics
   *
   * @param cacheName
   */
  public async clearQueryStats(cacheName: string): Promise<ActionResponse> {
    return this.utils.post({
      url: this.endpoint + encodeURIComponent(cacheName) + '/search/stats?action=clear',
      successMessage: `Query statistics of cache ${cacheName} cleared.`,
      errorMessage: `Cannot clear query statistics of cache ${cacheName}.`
    });
  }
}
