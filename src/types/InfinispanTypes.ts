interface Status {
  name: string;
  color: string;
  icon: string;
}

interface CacheManager {
  name: string;
  physical_addresses: string[];
  coordinator: boolean;
  cluster_name: string;
  cache_manager_status: Status;
  cluster_size: number;
  defined_caches: DefinedCache[];
  cache_configuration_names: string[];
  cluster_members: ClusterMember[];
  health: string;
  local_site?: string;
  rebalancing_enabled?: boolean;
  backups_enabled: boolean;
  sites_view: string[];
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
  rebalancing_enabled?: boolean;
}

interface CacheEntry {
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

interface CacheKey {
  key: string;
  keyContentType: string;
}

interface CacheEncoding {
  key: string;
  value: string;
}

interface DetailedInfinispanCache {
  name: string;
  configuration: CacheConfig;
  encoding: CacheEncoding;
  type: string;
  started: boolean;
  size?: number;
  rehash_in_progress?: boolean;
  indexing_in_progress?: boolean;
  rebalancing_enabled?: boolean;
  editable: boolean;
  queryable: boolean;
  features: Features;
  backupSites?: [XSite];
  stats?: CacheStats;
}

interface CacheStats {
  enabled: boolean;
  time_since_start: number;
  time_since_reset: number;
  approximate_entries: number;
  approximate_entries_in_memory: number;
  approximate_entries_unique: number;
  current_number_of_entries: number; // usually -1
  current_number_of_entries_in_memory: number; // usually -1
  total_number_of_entries: number; // deprecated
  off_heap_memory_used: number; // Memory
  data_memory_used: number; // Memory
  stores: number; // Stats for pie chart
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

interface StateTransferStatus {
  site: string;
  status: Status;
}

interface SiteNode {
  name: string;
  status: string;
}

interface XSite {
  name: string;
  status: string;
  relay_node: boolean;
}

interface CacheAcl {
  name: string;
  acl: string[];
}

interface Acl {
  user: string;
  global: string[];
  caches: Map<string, CacheAcl>;
}

interface ConnectedUser {
  name: string;
  acl?: Acl;
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
  data?: string;
}

interface SearchResut {
  total: number;
  values: string[];
}

interface ProtoError {
  message: string;
  cause: string;
}

interface ProtoSchema {
  name: string;
  error?: ProtoError;
}

interface AuthInfo {
  mode: string;
  ready: boolean;
  digest: boolean;
  keycloakConfig?: Keycloak.KeycloakConfig;
}

interface IndexStat {
  name: string;
  count: string;
  size: string;
}
interface QueryStat {
  name: string;
  count: string;
  average: string;
  max: string;
  slowest?: string;
}

interface SearchStats {
  index: IndexStat[];
  query: QueryStat[];
  reindexing: boolean;
}

interface ServiceCall {
  url: string;
  successMessage: string;
  errorMessage: string;
  customHeaders?: Headers;
  body?: string;
}

interface TemplateOptionSelect {
  value: string;
  disabled?: boolean;
  isPlaceholder?: boolean;
}

interface GettingStartedState {
  cacheName: '';
  createType: 'configure' | 'edit';
  valid: boolean;
}

interface CacheEditorStep {
  editorConfig: string;
  configs: TemplateOptionSelect[];
  validConfig: 'success' | 'error' | 'default';
  errorConfig: string;
  selectedConfig: string;
  configExpanded: boolean;
  editorExpanded: boolean;
}

interface BasicCacheConfig {
  topology: string;
  mode: string;
  numberOfOwners?: number;
  encoding: string;
  statistics: boolean;
  expiration: boolean;
  lifeSpanNumber: number;
  lifeSpanUnit: string;
  maxIdleNumber: number;
  maxIdleUnit: string;
  valid: boolean;
}

interface BoundedCache {
  evictionType: 'size' | 'count';
  maxSize: number;
  maxSizeUnit: string;
  maxCount: number;
  evictionStrategy: string;
  valid: boolean;
}

interface IndexWriter {
  commitInterval?: number;
  lowLevelTrace?: boolean;
  maxBufferedEntries?: number;
  queueCount?: number;
  queueSize?: number;
  ramBufferSize?: number;
  threadPoolSize?: number;
}
interface IndexMerge {
  calibrateByDeletes?: boolean;
  factor?: number;
  maxEntries?: number;
  minSize?: number;
  maxSize?: number;
  maxForcedSize?: number;
}
interface IndexedCache {
  indexedStorage: 'filesystem' | 'local-heap';
  indexedStartupMode?: string;
  indexedEntities: string[];
  valid: boolean;
}

interface SecuredCache {
  roles: string[];
  valid: boolean;
}
interface BackupTakeOffline {
  afterFailures?: number;
  minWait?: number;
}

interface BackupStateTransfer {
  chunckSize?: number;
  timeout?: number;
  maxRetries?: number;
  waitTime?: number;
  mode?: 'MANUAL' | 'AUTO';
}
interface BackupSite {
  site?: string;
  failurePolicy?: 'IGNORE' | 'WARN' | 'FAIL' | 'CUSTOM';
  timeout?: number;
  twoPhaseCommit?: boolean;
  failurePolicyClass?: string;
  takeOffline?: BackupTakeOffline;
  stateTransfer?: BackupStateTransfer;
}

interface BackupFor {
  enabled: boolean;
  remoteCache: string;
  remoteSite: string;
}

interface BackupSiteBasic {
  siteName?: string;
  siteStrategy?: string;
}

interface BackupSetting {
  mergePolicy?: string;
  maxCleanupDelay?: number;
  tombstoneMapSize?: number;
}

interface BackupsCache {
  sites: BackupSiteBasic[];
  backupFor: BackupFor;
  valid: boolean;
}

interface TransactionalCache {
  mode?: string;
  locking?: string;
  valid: boolean;
}

interface TransactionalCacheAdvance {
  stopTimeout?: number;
  completeTimeout?: number;
  reaperInterval?: number;
  isolationLevel?: string;
}

interface PersistentCache {
  storage: string;
  config: string;
  valid: boolean;
  passivation: boolean;
  connectionAttempts?: number;
  connectionInterval?: number;
  availabilityInterval?: number;
}

interface CacheFeatureStep {
  cacheFeatureSelected: string[];
  boundedCache: BoundedCache;
  indexedCache: IndexedCache;
  securedCache: SecuredCache;
  backupsCache: BackupsCache;
  transactionalCache: TransactionalCache;
  persistentCache: PersistentCache;
}

interface AdvancedConfigurationStep {
  storage?: string;
  concurrencyLevel?: number;
  lockAcquisitionTimeout?: number;
  striping?: boolean;
  indexReader?: number;
  indexWriter: IndexWriter;
  indexMerge: IndexMerge;
  backupSetting?: BackupSetting;
  backupSiteData?: BackupSite[];
  transactionalAdvance?: TransactionalCacheAdvance;
  valid: boolean;
}

interface CacheConfiguration {
  start: GettingStartedState;
  basic: BasicCacheConfig;
  feature: CacheFeatureStep;
  advanced: AdvancedConfigurationStep;
}

interface DataDistribution {
  node_name: string;
  node_addresses: string[];
  memory_entries: number;
  total_entries: number;
}

interface ClusterDistribution {
  node_name: string;
  node_addresses: string[];
  memory_available: number;
  memory_used: number;
}
