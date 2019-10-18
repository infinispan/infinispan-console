interface Cluster {
  health: string;
}

interface CacheManager {
  name: string;
  physical_addresses: [string];
  coordinator: boolean;
  cluster_name: string;
  cache_manager_status: string
  cluster_size: number;
  defined_caches: [DefinedCache];
  cache_configuration_names: [string];
}

interface CacheManagerStats {
  statistics_enabled: boolean;
  number_of_entries?: number;
  hit_ratio?: number;
  read_write_ratio?: number;
  time_since_start?: number;
  time_since_reset?: number;
  current_number_of_entries?: number;
  current_number_of_entries_in_memory?: number;
  total_number_of_entries?: number;
  off_heap_memory_used?: number;
  data_memory_used?: number;
  stores?: number;
  retrievals?: number;
  hits?: number;
  misses?: number;
  remove_hits?: number;
  remove_misses?: number;
  evictions?: number;
  average_read_time?: number;
  average_read_time_nanos?: number;
  average_write_time?: number;
  average_write_time_nanos?: number;
  average_remove_time?: number;
  average_remove_time_nanos?: number;
  required_minimum_number_of_nodes?: number;
}

interface DefinedCache {
  name: string;
  started: boolean;
}

interface InfinispanServer {
  version: string;
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
}

interface CmStats {
  statistics_enabled: boolean;
}

interface InfinispanCache {
  name: string;
  started: boolean;
  size?: number;
  type: string;
}

interface DetailedInfinispanCache {
  name: string;
  started?: boolean;
  type?: string;
  persisted?: boolean;
  transactional?: boolean;
  bounded?: boolean;
  opsPerformance?: OpsPerformance;
  backupSites?: [XSite];
  cacheContent?: CacheContent;
  cacheActivity?: CacheActivity;
  entriesLifecycle?: EntriesLifecycle;
  cacheLoader?: CacheLoader;
  locking?: Locking;
  memoryUsage?: MemoryUsage;
}

interface MemoryUsage {
  maxJVM: number;
  maxOffHeap: number;
  usedJVM: number;
  usedOffHeap: number;
}

interface CacheLoader {
  loads: number;
  misses: number;
  stores: number;
}

interface Locking {
  locksAvailable: number;
  locksHeld: number;
}

interface EntriesLifecycle {
  activations: number;
  evictions: number;
  invalidations: number;
  passivations: number;
}

interface OpsPerformance {
  avgReads: number;
  avgWrites: number;
  avgRemoves: number;
}

interface CacheActivity {
  readHits: number;
  readMisses: number;
  removeHits: number;
  removeMisses: number;
}

interface CacheContent {
  size: number;
  readWriteRatio: number;
  hitRatio: number;
  maxCapacity: number
}

interface XSite {
  name: string;
  capacity?: number;
}
