import utils from "./utils";

class ContainerService {
  endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  public getCacheManagers(): Promise<CacheManager[]> {
    return fetch(this.endpoint + "/server/cache-managers/")
      .then(response => response.json())
      .then(names => Promise.all(names.map(name =>
        this.getCacheManager(name))));
  };

  public getCacheManager(name: string): Promise<CacheManager> {

    return fetch(this.endpoint + '/cache-managers/' + name)
      .then(response => response.json())
      .then(data =>
        <CacheManager>{
          name: data.name,
          physical_addresses: data.physical_addresses,
          coordinator: data.coordinator,
          cluster_name: data.cluster_name,
          cache_manager_status: data.cache_manager_status,
          cluster_size: data.cluster_size,
          defined_caches: this.removeInternalCaches(data.defined_caches),
          cache_configuration_names: this.removeInternalTemplate(data.cache_configuration_names),
          cluster_members: data.cluster_members
        });
  };

  private removeInternalCaches(caches: DefinedCache[]) {
    return caches.filter(cache => !cache.name.startsWith('___'));
  }

  private removeInternalTemplate(templates: string[]) {
    return templates.filter(template => !template.startsWith('___'));
  }

  public getCacheManagerStats(name: string): Promise<CacheManagerStats> {
    return fetch(this.endpoint + '/cache-managers/' + name + '/stats')
      .then(response => response.json())
      .then(data => <CacheManagerStats>(data));
  };

  public getCacheManagerConfigurations(name: string): Promise<[CacheConfig]> {
    return fetch(this.endpoint + '/cache-managers/' + name + '/cache-configs')
      .then(response => response.json())
      .then(arr => arr.map(config => <CacheConfig>{
        name: config.name,
        config: JSON.stringify(config.configuration, undefined, 2)
      }));
  };

  public getCaches(name: string): Promise<[CacheInfo]> {
    return fetch(this.endpoint + '/cache-managers/' + name + '/caches')
      .then(response => response.json())
      .then(infos => infos
        .map(cacheInfo => <CacheInfo>{
          name: cacheInfo.name,
          status: cacheInfo.status,
          type: cacheInfo.type,
          size: cacheInfo.size,
          simpleCache: cacheInfo.simpleCache,
          transactional: cacheInfo.transactional,
          persistent: cacheInfo.persistent,
          bounded: cacheInfo.bounded,
          secured: cacheInfo.secured,
          indexed: cacheInfo.indexed,
          hasRemoteBackup: cacheInfo.has_remote_backup
        }).filter(cacheInfo => !cacheInfo.name.startsWith('___')));
  }
}

const dataContainerService: ContainerService = new ContainerService(utils.endpoint());

export default dataContainerService;
