import type { ComponentStatusType } from './common';

export interface CacheConfig {
  name: string;
  config: string;
}

export interface FormattedCacheConfig {
  json: string;
  xml: string;
  yaml: string;
}

export interface Features {
  transactional: boolean;
  persistent: boolean;
  bounded: boolean;
  secured: boolean;
  indexed: boolean;
  hasRemoteBackup: boolean;
}

export interface CacheInfo {
  status: string;
  name: string;
  type: string;
  simpleCache: boolean;
  health: ComponentStatusType;
  features: Features;
  rebalancing_enabled?: boolean;
  tracing: boolean;
  aliases: string[];
}

export interface CacheEntry {
  key: string;
  keyDisplay: string;
  keyContentType?: string;
  value: string;
  valueContentType?: string;
  timeToLive?: string;
  maxIdle?: string;
  created?: string;
  lastUsed?: string;
  lastModified?: string;
  expires?: string;
  cacheControl?: string;
  eTag?: string;
}

export interface CacheKey {
  key: string;
  keyContentType: string;
}

export interface CacheEncoding {
  key: string;
  value: string;
}

export interface DetailedInfinispanCache {
  name: string;
  configuration?: CacheConfig;
  encoding?: CacheEncoding;
  type?: string;
  started: boolean;
  health?: ComponentStatusType;
  size?: number;
  rehash_in_progress?: boolean;
  indexing_in_progress?: boolean;
  rebalancing_enabled?: boolean;
  editable?: boolean;
  updateEntry?: boolean;
  deleteEntry?: boolean;
  queryable?: boolean;
  features?: Features;
  backupSites?: [XSite];
  stats?: CacheStats;
  mode?: string;
  memory?: CacheMemory;
  async?: boolean;
  tracing?: boolean;
  aliases?: string[];
}

export interface CacheMemory {
  storage_type: string;
  max_size: string;
  max_size_bytes: number;
}

export interface CacheStats {
  enabled: boolean;
  time_since_start: number;
  time_since_reset: number;
  approximate_entries: number;
  approximate_entries_in_memory: number;
  approximate_entries_unique: number;
  current_number_of_entries: number;
  current_number_of_entries_in_memory: number;
  total_number_of_entries: number;
  off_heap_memory_used: number;
  data_memory_used: number;
  stores: number;
  retrievals: number;
  hits: number;
  misses: number;
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

export interface EditableConfig {
  lifespan: string;
  maxIdle: string;
  memoryMaxSize?: string;
  memoryMaxCount?: number;
  indexedEntities: string[];
  securityAuthorizationRoles: string[];
  tracingEnabled: boolean;
  tracingCategories: string[];
}

export interface DataDistribution {
  node_name: string;
  node_addresses: string[];
  memory_entries: number;
  total_entries: number;
  memory_used: number;
}

export interface XSite {
  name: string;
  status: string;
  relay_node: boolean;
}

export interface StateTransferStatus {
  site: string;
  status: ComponentStatusType;
}

export interface SiteNode {
  name: string;
  status: string;
}
