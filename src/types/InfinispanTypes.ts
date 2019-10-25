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
  bounded:boolean;
  secured:boolean;
  indexed:boolean;
  hasRemoteBackup:boolean;
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

/**
 * averageReadTime: 0
 averageReadTimeNanos: 36350
 averageRemoveTime: 0
 averageRemoveTimeNanos: 0
 averageWriteTime: 0
 averageWriteTimeNanos: 115205
 currentNumberOfEntries: 195
 currentNumberOfEntriesInMemory: 195
 dataMemoryUsed: 0
 evictions: 0
 hits: 2
 misses: 0
 offHeapMemoryUsed: 0
 removeHits: 0
 removeMisses: 0
 requiredMinimumNumberOfNodes: 1
 retrievals: 2
 stores: 195
 timeSinceReset: 37800
 timeSinceStart: 37800
 totalNumberOfEntries: 195
 */

interface DetailedInfinispanCache {
  name: string;
  started?: boolean;
  type: string;
  persistent: boolean;
  transactional: boolean;
  bounded: boolean;
  indexed: boolean,
  secured: boolean,
  hasRemoteBackup: boolean,
  opsPerformance?: OpsPerformance;
  backupSites?: [XSite];
  cacheContent?: CacheContent;
  cacheActivity?: CacheActivity;
  cacheLoader?: CacheLoader;
  locking?: Locking;
  memoryUsage?: MemoryUsage;
};

interface MemoryUsage {
  maxJVM: number;
  maxOffHeap: number;
  usedJVM: number;
  usedOffHeap: number;
}

interface CacheLoader {
  hits: number;
  misses: number;
  retrievals: number;
  stores: number;
  evictions: number;
}

interface Locking {
  locksAvailable: number;
  locksHeld: number;
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
