export interface TemplateOptionSelect {
  value: string;
  disabled?: boolean;
  isPlaceholder?: boolean;
}

export interface GettingStartedState {
  cacheName: '';
  createType: 'configure' | 'edit';
  valid: boolean;
}

export interface CacheEditorStep {
  editorConfig: string;
  configs: TemplateOptionSelect[];
  validConfig: 'success' | 'error' | 'default';
  errorConfig: string;
  selectedConfig: string;
  configExpanded: boolean;
  editorExpanded: boolean;
}

export interface BasicCacheConfig {
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

export interface BoundedCache {
  evictionType: 'size' | 'count';
  maxSize: number;
  maxSizeUnit: string;
  maxCount: number;
  evictionStrategy: string;
  valid: boolean;
}

export interface IndexReader {
  refreshInterval?: number;
  refreshIntervalUnit?: string;
}

export interface IndexWriter {
  commitInterval?: number;
  commitIntervalUnit?: string;
  lowLevelTrace?: boolean;
  maxBufferedEntries?: number;
  queueCount?: number;
  queueSize?: number;
  ramBufferSize?: number;
  threadPoolSize?: number;
}

export interface IndexMerge {
  calibrateByDeletes?: boolean;
  factor?: number;
  maxEntries?: number;
  minSize?: number;
  maxSize?: number;
  maxForcedSize?: number;
}

export interface IndexedCache {
  indexingMode?: 'AUTO' | 'MANUAL';
  indexedSharding?: number;
  indexedStorage: 'filesystem' | 'local-heap';
  indexedStartupMode?: string;
  indexedEntities: string[];
  valid: boolean;
}

export interface SecuredCache {
  roles: string[];
  valid: boolean;
}

export interface TracingCache {
  globalEnabled: boolean;
  enabled: boolean;
  categories: string[];
}

export interface BackupTakeOffline {
  afterFailures?: number;
  minWait?: number;
  minWaitUnit?: string;
}

export interface BackupStateTransfer {
  chunckSize?: number;
  timeout?: number;
  timeoutUnit?: string;
  maxRetries?: number;
  waitTime?: number;
  waitTimeUnit?: string;
  mode?: 'MANUAL' | 'AUTO';
}

export interface BackupSite {
  site?: string;
  failurePolicy?: 'IGNORE' | 'WARN' | 'FAIL' | 'CUSTOM';
  timeout?: number;
  timeoutUnit?: string;
  twoPhaseCommit?: boolean;
  failurePolicyClass?: string;
  takeOffline?: BackupTakeOffline;
  stateTransfer?: BackupStateTransfer;
}

export interface BackupFor {
  enabled: boolean;
  remoteCache: string;
  remoteSite: string;
}

export interface BackupSiteBasic {
  siteName?: string;
  siteStrategy?: string;
}

export interface BackupSetting {
  mergePolicy?: string;
  maxCleanupDelay?: number;
  maxCleanupDelayUnit?: string;
  tombstoneMapSize?: number;
}

export interface BackupsCache {
  sites: BackupSiteBasic[];
  backupFor: BackupFor;
  valid: boolean;
}

export interface TransactionalCache {
  mode?: string;
  locking?: string;
  valid: boolean;
}

export interface TransactionalCacheAdvance {
  stopTimeout?: number;
  stopTimeoutUnit?: string;
  completeTimeout?: number;
  completeTimeoutUnit?: string;
  reaperInterval?: number;
  reaperIntervalUnit?: string;
  isolationLevel?: string;
}

export interface PersistentCache {
  storage: string;
  config: string;
  valid: boolean;
  passivation: boolean;
  connectionAttempts?: number;
  connectionInterval?: number;
  connectionIntervalUnit?: string;
  availabilityInterval?: number;
  availabilityIntervalUnit?: string;
}

export interface CacheFeatureStep {
  cacheFeatureSelected: string[];
  boundedCache: BoundedCache;
  indexedCache: IndexedCache;
  securedCache: SecuredCache;
  backupsCache: BackupsCache;
  transactionalCache: TransactionalCache;
  persistentCache: PersistentCache;
}

export interface AdvancedConfigurationStep {
  storage?: string;
  concurrencyLevel?: number;
  lockAcquisitionTimeout?: number;
  lockAcquisitionTimeoutUnit?: string;
  striping?: boolean;
  indexReader: IndexReader;
  indexWriter: IndexWriter;
  indexMerge: IndexMerge;
  backupSetting?: BackupSetting;
  backupSiteData?: BackupSite[];
  transactionalAdvance?: TransactionalCacheAdvance;
  tracing: TracingCache;
  aliases: string[];
  valid: boolean;
}

export interface CacheConfiguration {
  start: GettingStartedState;
  basic: BasicCacheConfig;
  feature: CacheFeatureStep;
  advanced: AdvancedConfigurationStep;
}
