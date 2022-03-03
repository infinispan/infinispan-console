export enum ComponentHealth {
  HEALTHY = 'HEALTHY',
  HEALTHY_REBALANCING = 'HEALTHY_REBALANCING',
  DEGRADED = 'DEGRADED',
  FAILED = 'FAILED',
}
/**
 * Cache configuration utils class
 *
 * @author Katia Aresti
 */
export enum ContentType {
  StringContentType = 'String', //'application/x-java-object;type=java.lang.String'
  IntegerContentType = 'Integer', //'application/x-java-object;type=java.lang.Integer'
  DoubleContentType = 'Double', //'application/x-java-object;type=java.lang.Double'
  FloatContentType = 'Float', //'application/x-java-object;type=java.lang.Float'
  LongContentType = 'Long', //'application/x-java-object;type=java.lang.Long'
  BooleanContentType = 'Boolean', //'application/x-java-object;type=java.lang.Boolean'
  JSON = 'Json', //'application/json'
  XML = 'Xml', //'application/xml',
  YAML = 'Yaml', //'application/yaml'

  // Protobuf types
  string = 'string',
  int32 = 'int32',
  int64 = 'int64',
  double = 'double',
  float = 'float',
  bool = 'bool',
  bytes = 'bytes',
  uint32 = 'uint32',
  uint64 = 'uint64',
  sint32 = 'sint32',
  sint64 = 'sint64',
  fixed32 = 'fixed32',
  fixed64 = 'fixed64',
  sfixed32 = 'sfixed32',
  sfixed64 = 'sfixed64',
  customType = 'Custom Type',
}

export enum CacheType {
  Distributed = 'Distributed',
  Replicated = 'Replicated',
  Local = 'Local',
  Invalidated = 'Invalidated',
  Scattered = 'Scattered',
}

export enum EncodingType {
  Protobuf = 'application/x-protostream',
  Java = 'application/x-java-object',
  JavaSerialized = 'application/x-java-serialized',
  XML = 'application/xml; charset=UTF-8',
  JSON = 'application/json',
  Text = 'text/plain',
  JBoss = 'application/x-jboss-marshalling',
  Octet = 'application/octet-stream',
  Empty = 'Empty',
}

export enum InfinispanFlags {
  CACHE_MODE_LOCAL = 'CACHE_MODE_LOCAL',
  FAIL_SILENTLY = 'FAIL_SILENTLY',
  FORCE_ASYNCHRONOUS = 'FORCE_ASYNCHRONOUS',
  FORCE_SYNCHRONOUS = 'FORCE_SYNCHRONOUS',
  FORCE_WRITE_LOCK = 'FORCE_WRITE_LOCK',
  IGNORE_RETURN_VALUES = 'IGNORE_RETURN_VALUES',
  IGNORE_TRANSACTION = 'IGNORE_TRANSACTION',
  PUT_FOR_EXTERNAL_READ = 'PUT_FOR_EXTERNAL_READ',
  REMOTE_ITERATION = 'REMOTE_ITERATION',
  SKIP_CACHE_LOAD = 'SKIP_CACHE_LOAD',
  SKIP_CACHE_STORE = 'SKIP_CACHE_STORE',
  SKIP_INDEX_CLEANUP = 'SKIP_INDEX_CLEANUP',
  SKIP_INDEXING = 'SKIP_INDEXING',
  SKIP_LISTENER_NOTIFICATION = 'SKIP_LISTENER_NOTIFICATION',
  SKIP_LOCKING = 'SKIP_LOCKING',
  SKIP_OWNERSHIP_CHECK = 'SKIP_OWNERSHIP_CHECK',
  SKIP_REMOTE_LOOKUP = 'SKIP_REMOTE_LOOKUP',
  SKIP_SHARED_CACHE_STORE = 'SKIP_SHARED_CACHE_STORE',
  SKIP_SIZE_OPTIMIZATION = 'SKIP_SIZE_OPTIMIZATION',
  SKIP_STATISTICS = 'SKIP_STATISTICS',
  SKIP_XSITE_BACKUP = 'SKIP_XSITE_BACKUP',
  ZERO_LOCK_ACQUISITION_TIMEOUT = 'ZERO_LOCK_ACQUISITION_TIMEOUT',
}

export enum EvictionStrategy {
  NONE = 'NONE',
  REMOVE = 'REMOVE',
  MANUAL = 'MANUAL',
  EXCEPTION = 'EXCEPTION',
}

export enum IsolationLevel {
  NONE = 'NONE',
  SERIALIZABLE = 'SERIALIZABLE',
  REPEATABLE_READ = 'REPEATABLE_READ',
  READ_COMMITTED = 'READ_COMMITTED',
  READ_UNCOMMITTED = 'READ_UNCOMMITTED',
}

export enum StorageType {
  HEAP = 'heap',
  OFF_HEAP = 'off_heap',
}

export enum CacheMode {
  ASYNC = 'ASYNC',
  SYNC = 'SYNC',
}
