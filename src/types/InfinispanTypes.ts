interface CacheManager {
  name: string;
  physical_addresses: [string];
  coordinator: boolean;
  cluster_name: string;
  cache_manager_status: string;
  cluster_size: number;
  defined_caches: [DefinedCache];
  cache_configuration_names: [string];
  cluster_members: [ClusterMember];
  health: string;
  local_site?: string;
}

interface ClusterMember {
  name: string;
  physical_address: string;
}

interface CacheManagerStats {
  statistics_enabled: boolean;
  time_since_start?: number;
  time_since_reset?: number;
  number_of_entries?: number;
  current_number_of_entries_in_memory?: number;
  total_number_of_entries?: number;
  off_heap_memory_used?: number;
  data_memory_used?: number;
  required_minimum_number_of_nodes?: number;
  average_read_time?: number;
  average_read_time_nanos?: number;
  average_write_time?: number;
  average_write_time_nanos?: number;
  average_remove_time?: number;
  average_remove_time_nanos?: number;
  hit_ratio?: number;
  read_write_ratio?: number;
  hits: number;
  stores: number;
  evictions: number;
  retrievals: number;
  misses: number;
  remove_hits: number;
  remove_misses: number;
}

interface DefinedCache {
  name: string;
  started: boolean;
}

interface CacheConfig {
  name: string;
  config: string;
}

interface Features {
  transactional: boolean;
  persistent: boolean;
  bounded: boolean;
  secured: boolean;
  indexed: boolean;
  hasRemoteBackup: boolean;
}

interface CacheInfo {
  status: string;
  name: string;
  type: string;
  simpleCache: boolean;
  health: string;
  features: Features;
}

interface CacheEntry {
  key: string;
  value: string;
  timeToLive?: string;
  maxIdle?: string;
  created?: string;
  lastModified?: string;
  lastUsed?: string;
  expires?: string;
  cacheControl?: string;
  eTag?: string;
}

interface DetailedInfinispanCache {
  name: string;
  started: boolean;
  type: string;
  size: number;
  rehash_in_progress: boolean;
  indexing_in_progress: boolean;
  features: Features;
  configuration: CacheConfig;
  backupSites?: [XSite];
  stats?: CacheStats;
}

interface CacheStats {
  enabled: boolean;
  misses: number;
  time_since_start: number;
  time_since_reset: number;
  hits: number;
  current_number_of_entries: number;
  current_number_of_entries_in_memory: number;
  total_number_of_entries: number;
  stores: number;
  off_heap_memory_used: number;
  data_memory_used: number;
  retrievals: number;
  remove_hits: number;
  remove_misses: number;
  evictions: number;
  average_read_time: number;
  average_read_time_nanos: number;
  average_write_time: number;
  average_write_time_nanos: number;
  average_remove_time: number;
  average_remove_time_nanos: number;
  required_minimum_number_of_nodes: number;
}

interface XSite {
  name: string;
  status: string;
}

interface Task {
  parameters: [string];
  task_context_name: string;
  task_operation_name: string;
  name: string;
  type: string;
  execution_mode: string;
  allowed_role: string;
}

interface Counter {
  name: string;
  value: number;
  config: CounterConfig;
}

interface CounterConfig {
  name: string;
  type: string;
  initialValue: number;
  storage: string;
  lowerBound?: number;
  upperBound?: number;
  concurrencyLevel?: number;
}

interface ActionResponse {
  message: string;
  success: boolean;
}
