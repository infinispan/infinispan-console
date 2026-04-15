/**
 * Global type declarations for Infinispan Console.
 *
 * The actual type definitions live in domain-specific files:
 *   - common.ts       (ComponentStatusType, ActionResponse, ServiceCall, PaginationType)
 *   - cache.ts         (CacheInfo, CacheEntry, DetailedInfinispanCache, CacheStats, ...)
 *   - cache-configuration.ts (BasicCacheConfig, CacheConfiguration, BoundedCache, ...)
 *   - cluster.ts       (CacheManager, ClusterMember, ClusterMembers, ConnectedClients, ...)
 *   - security.ts      (ConnectedUser, Acl, Role, Principal, AuthInfo, ...)
 *   - counter.ts       (Counter, CounterConfig)
 *   - search.ts        (SearchResult, SearchStats, IndexMetamodel, QueryHistoryItem, ...)
 *   - server.ts        (Task, ProtoSchema, ProtoSchemaDetail, ProtoError)
 *
 * New code should import from '@types/index' or the specific domain file.
 * These global declarations exist for backwards compatibility.
 */

import type {
  ComponentStatusType as _ComponentStatusType,
  ActionResponse as _ActionResponse,
  ServiceCall as _ServiceCall,
  PaginationType as _PaginationType,
} from './common';

import type {
  CacheConfig as _CacheConfig,
  FormattedCacheConfig as _FormattedCacheConfig,
  Features as _Features,
  CacheInfo as _CacheInfo,
  CacheEntry as _CacheEntry,
  CacheKey as _CacheKey,
  CacheEncoding as _CacheEncoding,
  DetailedInfinispanCache as _DetailedInfinispanCache,
  CacheMemory as _CacheMemory,
  CacheStats as _CacheStats,
  EditableConfig as _EditableConfig,
  DataDistribution as _DataDistribution,
  XSite as _XSite,
  StateTransferStatus as _StateTransferStatus,
  SiteNode as _SiteNode,
} from './cache';

import type {
  TemplateOptionSelect as _TemplateOptionSelect,
  GettingStartedState as _GettingStartedState,
  CacheEditorStep as _CacheEditorStep,
  BasicCacheConfig as _BasicCacheConfig,
  BoundedCache as _BoundedCache,
  IndexReader as _IndexReader,
  IndexWriter as _IndexWriter,
  IndexMerge as _IndexMerge,
  IndexedCache as _IndexedCache,
  SecuredCache as _SecuredCache,
  TracingCache as _TracingCache,
  BackupTakeOffline as _BackupTakeOffline,
  BackupStateTransfer as _BackupStateTransfer,
  BackupSite as _BackupSite,
  BackupFor as _BackupFor,
  BackupSiteBasic as _BackupSiteBasic,
  BackupSetting as _BackupSetting,
  BackupsCache as _BackupsCache,
  TransactionalCache as _TransactionalCache,
  TransactionalCacheAdvance as _TransactionalCacheAdvance,
  PersistentCache as _PersistentCache,
  CacheFeatureStep as _CacheFeatureStep,
  AdvancedConfigurationStep as _AdvancedConfigurationStep,
  CacheConfiguration as _CacheConfiguration,
} from './cache-configuration';

import type {
  ClusterMember as _ClusterMember,
  ClusterMembers as _ClusterMembers,
  ClusterDistribution as _ClusterDistribution,
  CacheManager as _CacheManager,
  CacheManagerStats as _CacheManagerStats,
  DefinedCache as _DefinedCache,
  ConnectedClients as _ConnectedClients,
} from './cluster';

import type {
  CacheAcl as _CacheAcl,
  Acl as _Acl,
  ConnectedUser as _ConnectedUser,
  Role as _Role,
  Principal as _Principal,
  Realm as _Realm,
  AuthInfo as _AuthInfo,
} from './security';

import type {
  Counter as _Counter,
  CounterConfig as _CounterConfig,
} from './counter';

import type {
  SearchResult as _SearchResult,
  DeleteByQueryResult as _DeleteByQueryResult,
  IndexStat as _IndexStat,
  QueryStat as _QueryStat,
  SearchStats as _SearchStats,
  IndexMetamodel as _IndexMetamodel,
  IndexValueField as _IndexValueField,
  QueryHistoryItem as _QueryHistoryItem,
  HistoryMap as _HistoryMap,
} from './search';

import type {
  Task as _Task,
  ProtoError as _ProtoError,
  ProtoSchema as _ProtoSchema,
  ProtoSchemaDetail as _ProtoSchemaDetail,
} from './server';

declare global {
  // common
  type ComponentStatusType = _ComponentStatusType;
  type ActionResponse = _ActionResponse;
  type ServiceCall = _ServiceCall;
  type PaginationType = _PaginationType;

  // cache
  type CacheConfig = _CacheConfig;
  type FormattedCacheConfig = _FormattedCacheConfig;
  type Features = _Features;
  type CacheInfo = _CacheInfo;
  type CacheEntry = _CacheEntry;
  type CacheKey = _CacheKey;
  type CacheEncoding = _CacheEncoding;
  type DetailedInfinispanCache = _DetailedInfinispanCache;
  type CacheMemory = _CacheMemory;
  type CacheStats = _CacheStats;
  type EditableConfig = _EditableConfig;
  type DataDistribution = _DataDistribution;
  type XSite = _XSite;
  type StateTransferStatus = _StateTransferStatus;
  type SiteNode = _SiteNode;

  // cache-configuration
  type TemplateOptionSelect = _TemplateOptionSelect;
  type GettingStartedState = _GettingStartedState;
  type CacheEditorStep = _CacheEditorStep;
  type BasicCacheConfig = _BasicCacheConfig;
  type BoundedCache = _BoundedCache;
  type IndexReader = _IndexReader;
  type IndexWriter = _IndexWriter;
  type IndexMerge = _IndexMerge;
  type IndexedCache = _IndexedCache;
  type SecuredCache = _SecuredCache;
  type TracingCache = _TracingCache;
  type BackupTakeOffline = _BackupTakeOffline;
  type BackupStateTransfer = _BackupStateTransfer;
  type BackupSite = _BackupSite;
  type BackupFor = _BackupFor;
  type BackupSiteBasic = _BackupSiteBasic;
  type BackupSetting = _BackupSetting;
  type BackupsCache = _BackupsCache;
  type TransactionalCache = _TransactionalCache;
  type TransactionalCacheAdvance = _TransactionalCacheAdvance;
  type PersistentCache = _PersistentCache;
  type CacheFeatureStep = _CacheFeatureStep;
  type AdvancedConfigurationStep = _AdvancedConfigurationStep;
  type CacheConfiguration = _CacheConfiguration;

  // cluster
  type ClusterMember = _ClusterMember;
  type ClusterMembers = _ClusterMembers;
  type ClusterDistribution = _ClusterDistribution;
  type CacheManager = _CacheManager;
  type CacheManagerStats = _CacheManagerStats;
  type DefinedCache = _DefinedCache;
  type ConnectedClients = _ConnectedClients;

  // security
  type CacheAcl = _CacheAcl;
  type Acl = _Acl;
  type ConnectedUser = _ConnectedUser;
  type Role = _Role;
  type Principal = _Principal;
  type Realm = _Realm;
  type AuthInfo = _AuthInfo;

  // counter
  type Counter = _Counter;
  type CounterConfig = _CounterConfig;

  // search
  type SearchResult = _SearchResult;
  type DeleteByQueryResult = _DeleteByQueryResult;
  type IndexStat = _IndexStat;
  type QueryStat = _QueryStat;
  type SearchStats = _SearchStats;
  type IndexMetamodel = _IndexMetamodel;
  type IndexValueField = _IndexValueField;
  type QueryHistoryItem = _QueryHistoryItem;
  type HistoryMap = _HistoryMap;

  // server
  type Task = _Task;
  type ProtoError = _ProtoError;
  type ProtoSchema = _ProtoSchema;
  type ProtoSchemaDetail = _ProtoSchemaDetail;
}
