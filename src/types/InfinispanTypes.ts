interface CacheManager {
  name: string;
  physical_addresses: [string];
  coordinator: boolean;
  cluster_name: string;
  cache_manager_status: string
  cluster_size: number;
  defined_caches: [DefinedCache];
  cache_configuration_names: [string];
  cluster_members: [string];
  cluster_members_physical_addresses: [string];
  health: string;
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

interface CacheInfo {
  status: string;
  name: string;
  type: string;
  size: number;
  simpleCache: boolean;
  transactional: boolean;
  persistent: boolean;
  bounded: boolean;
  secured: boolean;
  indexed: boolean;
  hasRemoteBackup: boolean;
}

interface DetailedInfinispanCache {
  name: string;
  started: boolean;
  type: string;
  size: number;
  rehash_in_progress: boolean;
  indexing_in_progress: boolean;
  bounded: boolean;
  indexed: boolean;
  persistent: boolean;
  transactional: boolean;
  secured: boolean;
  has_remote_backup: boolean
  configuration: string;
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
}

interface CounterConfig {
  name: string;
  type: string;
  initialValue: number;
  storage: string;
  lowerBound: number;
  upperBound: number;
}
