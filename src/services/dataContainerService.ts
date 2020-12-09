import utils from './utils';
import { Either, left, right } from './either';
import displayUtils from './displayUtils';

class ContainerService {
  endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  /**
   * For now there is a single cache manager
   */
  public getDefaultCacheManager(): Promise<
    Either<ActionResponse, CacheManager>
  > {
    return utils
      .restCall(this.endpoint + '/server/cache-managers/', 'GET')
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw response;
      })
      .then((names) => this.getCacheManager(names[0]).then((cm) => right(cm) as Either<ActionResponse, CacheManager>))
      .catch((err) =>
        left(
          utils.mapError(
            err,
            'Cannot connect. Check the navigator logs for errors.'
          )
        )
      );
  }

  private getCacheManager(name: string): Promise<CacheManager> {
    let healthPromise: Promise<String> = utils
      .restCall(this.endpoint + '/cache-managers/' + name + '/health', 'GET')
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw response;
      })
      .then((data) => data.cluster_health.health_status);

    return healthPromise.then((heath) =>
      utils
        .restCall(this.endpoint + '/cache-managers/' + name, 'GET')
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw response;
        })
        .then(
          (data) =>
            <CacheManager>{
              name: data.name,
              physical_addresses: data.physical_addresses,
              coordinator: data.coordinator,
              cluster_name: data.cluster_name,
              cache_manager_status: data.cache_manager_status,
              cluster_size: data.cluster_size,
              defined_caches: this.removeInternalCaches(data.defined_caches),
              cache_configuration_names: this.removeInternalTemplate(
                data.cache_configuration_names
              ),
              cluster_members: this.clusterMembers(
                data.cluster_members,
                data.cluster_members_physical_addresses
              ),
              health: heath,
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
    return utils
      .restCall(this.endpoint + '/cache-managers/' + name + '/stats', 'GET')
      .then((response) => response.json())
      .then((data) => right(<CacheManagerStats>data) as Either<ActionResponse, CacheManagerStats>)
      .catch((err) =>
        left(utils.mapError(err, 'Error retrieving cache manager statistics.'))
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
    return utils
      .restCall(
        this.endpoint + '/cache-managers/' + name + '/cache-configs/templates',
        'GET'
      )
      .then((response) => response.json())
      .then((arr) => {
        const configs: [CacheConfig] = arr.map(
          (config) =>
            <CacheConfig>{
              name: config.name,
              config: JSON.stringify(config.configuration, undefined, 2),
            }
        );
        return right(configs) as Either<ActionResponse, CacheConfig[]>;
      })
      .catch((err) =>
        left(utils.mapError(err, 'Error retrieving configuration templates.'))
      );
  }

  /**
   * Get all caches for a cache manager
   * @param name
   */
  public async getCaches(
    name: string
  ): Promise<Either<ActionResponse, CacheInfo[]>> {
    return utils
      .restCall(this.endpoint + '/cache-managers/' + name + '/caches', 'GET')
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw response;
      })
      .then((infos) =>
        right(
          infos
            .map(
              (cacheInfo) =>
                <CacheInfo>{
                  name: cacheInfo.name,
                  status: displayUtils.capitalize(cacheInfo.status),
                  type: this.mapCacheType(cacheInfo.type),
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
        ) as Either<ActionResponse, CacheInfo[]>
      )
      .catch((err) => left(utils.mapError(err, 'Error retrieving caches.')));
  }

  private mapCacheType(type: string) {
    let cacheType: string = 'Unknown';
    if (type == 'distributed-cache') {
      cacheType = 'Distributed';
    } else if (type == 'replicated-cache') {
      cacheType = 'Replicated';
    } else if (type == 'local-cache') {
      cacheType = 'Local';
    } else if (type == 'invalidation-cache') {
      cacheType = 'Invalidated';
    } else if (type == 'scattered-cache') {
      cacheType = 'Scattered';
    }
    return cacheType;
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

const dataContainerService: ContainerService = new ContainerService(
  utils.endpoint()
);

export default dataContainerService;
