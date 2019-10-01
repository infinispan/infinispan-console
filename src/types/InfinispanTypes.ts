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
  cache_configuration_names:[string];
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
  opsPerformance?: [OpsPerformance];
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
  puts: number;
}

interface CacheContent {
  size?: number;
  readWriteRatio?: number;
  hitRatio?: number;
  maxCapacity?: number
}

interface XSite {
  name: string;
  capacity?: number;
}
