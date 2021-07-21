import { FetchCaller } from './fetchCaller';
import { Either, left } from './either';
import { CacheConfigUtils } from '@services/cacheConfigUtils';
import displayUtils from '@services/displayUtils';

export class ContainerService {
  endpoint: string;
  utils: FetchCaller;

  constructor(endpoint: string, restUtils: FetchCaller) {
    this.endpoint = endpoint;
    this.utils = restUtils;
  }

  /**
   * For now there is a single cache manager
   */
  public getDefaultCacheManager(): Promise<
    Either<ActionResponse, CacheManager>
  > {
    return this.utils
      .get(this.endpoint + '/server/cache-managers/', (data) => data[0])
      .then((maybeCmName) => {
        if (maybeCmName.isRight()) {
          return this.getCacheManager(maybeCmName.value);
        }
        return left(maybeCmName);
      });
  }

  private getCacheManager(
    name: string
  ): Promise<Either<ActionResponse, CacheManager>> {
    let healthPromise: Promise<Either<ActionResponse, String>> = this.utils.get(
      this.endpoint + '/cache-managers/' + name + '/health',
      (data) => data.cluster_health.health_status
    );

    return healthPromise.then((maybeHealth) =>
      this.utils.get(
        this.endpoint + '/cache-managers/' + name,
        (data) =>
          <CacheManager>{
            name: data.name,
            physical_addresses: data.physical_addresses,
            coordinator: data.coordinator,
            cluster_name: data.cluster_name,
            cache_manager_status: displayUtils.parseComponentStatus(
              data.cache_manager_status
            ),
            cluster_size: data.cluster_size,
            defined_caches: this.removeInternalCaches(data.defined_caches),
            cache_configuration_names: this.removeInternalTemplate(
              data.cache_configuration_names
            ),
            cluster_members: this.clusterMembers(
              data.cluster_members,
              data.cluster_members_physical_addresses
            ),
            health: maybeHealth.isRight()
              ? maybeHealth.value
              : maybeHealth.value.message,
            local_site: data.local_site,
          }
      )
    );
  }

  private removeInternalCaches(caches: DefinedCache[]) {
    return caches.filter((cache) => !cache.name.startsWith('___'));
  }

  private removeInternalTemplate(templates: string[]) {
    return templates.filter((template) => !template.startsWith('___'));
  }

  /**
   * Retrieve the cache manager stats
   *
   * @param name, the name of the cache manager
   */
  public async getCacheManagerStats(
    name: string
  ): Promise<Either<ActionResponse, CacheManagerStats>> {
    return this.utils.get(
      this.endpoint + '/cache-managers/' + name + '/stats',
      (data) => <CacheManagerStats>data
    );
  }

  /**
   * Get cache configuration templates for in the cache manager name
   *
   * @param name, the name of the cache manager
   */
  public async getCacheConfigurationTemplates(
    name: string
  ): Promise<Either<ActionResponse, CacheConfig[]>> {
    return this.utils.get(
      this.endpoint + '/cache-managers/' + name + '/cache-configs/templates',
      (data) =>
        data.map(
          (config) =>
            <CacheConfig>{
              name: config.name,
              config: JSON.stringify(config.configuration, undefined, 2),
            }
        )
    );
  }

  /**
   * Get all caches for a cache manager
   * @param name
   */
  public async getCaches(
    name: string
  ): Promise<Either<ActionResponse, CacheInfo[]>> {
    return this.utils.get(
      this.endpoint + '/cache-managers/' + name + '/caches',
      (data) =>
        data
          .map(
            (cacheInfo) =>
              <CacheInfo>{
                name: cacheInfo.name,
                status: cacheInfo.status,
                type: CacheConfigUtils.mapCacheType(cacheInfo.type),
                simpleCache: cacheInfo.simpleCache,
                features: <Features>{
                  transactional: cacheInfo.transactional,
                  persistent: cacheInfo.persistent,
                  bounded: cacheInfo.bounded,
                  secured: cacheInfo.secured,
                  indexed: cacheInfo.indexed,
                  hasRemoteBackup: cacheInfo.has_remote_backup,
                },
                health: cacheInfo.health,
              }
          )
          .filter((cacheInfo) => !cacheInfo.name.startsWith('___'))
    );
  }

  private clusterMembers(
    cluster_members: [string],
    cluster_members_physical_addresses: [string]
  ): ClusterMember[] {
    return cluster_members.map(
      (mem, index) =>
        <ClusterMember>{
          name: mem,
          physical_address: cluster_members_physical_addresses[index],
        }
    );
  }
}
