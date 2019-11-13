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
  started?: boolean;
  type: string;
  persistent: boolean;
  transactional: boolean;
  bounded: boolean;
  indexed: boolean,
  secured: boolean,
  hasRemoteBackup: boolean;
  timeSinceStart: number;
  timeSinceReset: number;
  rehashInProgress: boolean;
  indexingInProgress: boolean;
  opsPerformance?: OpsPerformance;
  backupSites?: [XSite];
  cacheContent?: CacheContent;
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
  hits: number;
  misses: number;
  retrievals: number;
  stores: number;
  evictions: number;
  removeHits: number;
  removeMisses: number;
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

interface CacheContent {
  size: number;
  currentNumberOfEntries: number;
  currentNumberOfEntriesInMemory: number;
  totalNumberOfEntries: number;
  requiredMinimumNumberOfNodes: number;
}

interface XSite {
  name: string;
  capacity?: number;
}
