import { CacheFeature, ContentType, EncodingType } from '@services/infinispanRefData';
import { Either, left, right } from '@services/either';
import { ConsoleServices } from '@services/ConsoleServices';
import { convertToMilliseconds } from '@app/utils/convertToMilliseconds';

export const Distributed = 'distributed-cache';
export const Replicated = 'replicated-cache';
export const Invalidated = 'invalidation-cache';
export const Local = 'local-cache';
export const LOCAL = 'LOCAL';
export const REPL_SYNC = 'REPL_SYNC';
export const REPL_ASYNC = 'REPL_ASYNC';
export const INVALIDATION_SYNC = 'INVALIDATION_SYNC';
export const INVALIDATION_ASYNC = 'INVALIDATION_ASYNC';
export const DIST_SYNC = 'DIST_SYNC';
export const DIST_ASYNC = 'DIST_ASYNC';

/**
 * Utility class to map cache configuration
 */
export class CacheConfigUtils {
  /**
   * Validates a configuration of cache may have a correct format and detects if it's
   * a valid formatted json or a xml.
   *
   * @param config
   */
  public static validateConfig(config: string): Either<string, 'xml' | 'json' | 'yaml'> {
    const trimmedConf = config.trim();

    if (trimmedConf.length == 0) {
      return left("Configuration can't be empty");
    }
    try {
      JSON.parse(trimmedConf);
      return right('json');
    } catch (ex) {
      /* empty */
    }

    try {
      const oDOM = new DOMParser().parseFromString(trimmedConf, 'text/xml');
      if (oDOM.getElementsByTagName('parsererror').length == 0) {
        return right('xml');
      }
    } catch (ex) {
      /* empty */
    }

    return right('yaml');
  }

  public static toEncoding(encodingConf: string | undefined): EncodingType {
    if (!encodingConf) return EncodingType.Empty;

    if (encodingConf.includes('protostream')) {
      return EncodingType.Protobuf;
    } else if (encodingConf.includes('java-object')) {
      return EncodingType.Java;
    } else if (encodingConf.includes('java-serialized')) {
      return EncodingType.JavaSerialized;
    } else if (encodingConf.includes('jboss')) {
      return EncodingType.JBoss;
    } else if (encodingConf.includes('text')) {
      return EncodingType.Text;
    } else if (encodingConf.includes('xml')) {
      return EncodingType.XML;
    } else if (encodingConf.includes('json')) {
      return EncodingType.JSON;
    } else if (encodingConf.includes('octet')) {
      return EncodingType.Octet;
    } else if (encodingConf.includes('unknown')) {
      return EncodingType.Unknown;
    }

    return EncodingType.Empty;
  }

  /**
   * Map cache name from cache mode
   * @param mode or cache type name
   */
  public static mapCacheTypeFromCacheMode(mode: string): string {
    if (mode.includes('DIST')) {
      return 'Distributed';
    }

    if (mode.includes('REPL')) {
      return 'Replicated';
    }

    if (mode.includes('LOCAL')) {
      return 'Local';
    }

    if (mode.includes('INVALIDATION')) {
      return 'Invalidated';
    }

    return 'Unknown';
  }

  /**
   * Map cache name from json configuration or from the label in the conf
   * @param config or cache type name
   */
  public static mapCacheType(type: string | undefined): string {
    let cacheType = 'Unknown';
    if (!type) {
      return cacheType;
    }

    if (type.includes('DIST') || type == Distributed) {
      cacheType = 'Distributed';
    } else if (type.includes('REPL') || type == Replicated) {
      cacheType = 'Replicated';
    } else if (type.includes('LOCAL') || type == Local) {
      cacheType = 'Local';
    } else if (type.includes('INVALIDATION') || type == Invalidated) {
      cacheType = 'Invalidated';
    }
    return cacheType;
  }

  /**
   * Retruns true if the cache transfer of data is ASYNC
   *
   * @param type
   */
  public static isAsync(type: string): boolean {
    return type.includes('ASYNC');
  }

  /**
   * Retrieve if an encoding can display entries
   *
   * @param encoding
   */
  public static canUpdateEntries(encoding: EncodingType): boolean {
    return (
      encoding == EncodingType.Text ||
      encoding == EncodingType.JSON ||
      encoding == EncodingType.XML ||
      encoding == EncodingType.Protobuf
    );
  }

  /**
   * Retrieve if an encoding can display entries
   *
   * @param encoding
   */
  public static canDeleteEntries(encoding: EncodingType): boolean {
    return (
      encoding == EncodingType.Text ||
      encoding == EncodingType.JSON ||
      encoding == EncodingType.XML ||
      encoding == EncodingType.Protobuf
    );
  }

  /**
   * Retrieve if an encoding is editable or not
   *
   * @param encoding
   */
  public static isEditable(encoding: EncodingType): boolean {
    return encoding != EncodingType.Empty && encoding != EncodingType.Unknown;
  }

  /**
   * Map accepted content types to encoding
   *
   * @param encodingType
   */
  public static getContentTypeOptions(encodingType: EncodingType): ContentType[] {
    const contentTypes: ContentType[] = [];

    if (
      encodingType == EncodingType.Java ||
      encodingType == EncodingType.JavaSerialized ||
      encodingType == EncodingType.JBoss
    ) {
      contentTypes.push(ContentType.StringContentType);
      contentTypes.push(ContentType.IntegerContentType);
      contentTypes.push(ContentType.LongContentType);
      contentTypes.push(ContentType.FloatContentType);
      contentTypes.push(ContentType.DoubleContentType);
      contentTypes.push(ContentType.BooleanContentType);
      contentTypes.push(ContentType.JSON);
    } else if (encodingType == EncodingType.Protobuf) {
      contentTypes.push(ContentType.string);
      contentTypes.push(ContentType.customType);
      contentTypes.push(ContentType.int32);
      contentTypes.push(ContentType.int64);
      contentTypes.push(ContentType.double);
      contentTypes.push(ContentType.float);
      contentTypes.push(ContentType.bool);
      contentTypes.push(ContentType.bytes);
      contentTypes.push(ContentType.uint32);
      contentTypes.push(ContentType.uint64);
      contentTypes.push(ContentType.sint32);
      contentTypes.push(ContentType.sint64);
      contentTypes.push(ContentType.fixed32);
      contentTypes.push(ContentType.fixed64);
      contentTypes.push(ContentType.sfixed32);
      contentTypes.push(ContentType.sfixed64);
    } else if (encodingType == EncodingType.XML) {
      contentTypes.push(ContentType.XML);
    } else if (encodingType == EncodingType.JSON) {
      contentTypes.push(ContentType.JSON);
    } else {
      contentTypes.push(ContentType.StringContentType);
    }

    return contentTypes;
  }

  public static createCacheConfigFromData(data: CacheConfiguration): string {
    let cache;
    let cacheType;

    const distributedCache = 'distributed-cache';
    const replicatedCache = 'replicated-cache';

    // Default cache configuration
    const generalCache = {
      mode: data.basic.mode,
      owners: data.basic.numberOfOwners,
      statistics: data.basic.statistics,
      encoding: {
        'media-type': data.basic.encoding
      }
    };

    // Choose topology and add to the configuration
    data.basic.topology === 'Distributed'
      ? ((cache = { [distributedCache]: generalCache }), (cacheType = distributedCache))
      : ((cache = { [replicatedCache]: generalCache }), (cacheType = replicatedCache));

    const locking = () => {
      cache[cacheType].locking = {
        striping: data.advanced.striping,
        'concurrency-level': data.advanced.concurrencyLevel,
        'acquire-timeout': data.advanced.lockAcquisitionTimeout
      };
    };

    // config for Expiration cache
    const expiration = () => {
      cache[cacheType]['expiration'] = {
        lifespan: convertToMilliseconds(data.basic.lifeSpanNumber, data.basic.lifeSpanUnit),
        'max-idle': convertToMilliseconds(data.basic.maxIdleNumber, data.basic.maxIdleUnit)
      };
    };

    // config for Memory and Bounded cache
    const memoryConfiguration = () => {
      if (data.feature.cacheFeatureSelected.includes(CacheFeature.BOUNDED)) {
        if (data.feature.boundedCache.evictionType === 'size') {
          cache[cacheType]['memory'] = {
            'max-size': data.feature.boundedCache.maxSize + data.feature.boundedCache.maxSizeUnit,
            'when-full': data.feature.boundedCache.evictionStrategy
          };
        } else {
          cache[cacheType]['memory'] = {
            'max-count': data.feature.boundedCache.maxCount,
            'when-full': data.feature.boundedCache.evictionStrategy
          };
        }
        if (data.advanced.storage) {
          cache[cacheType]['memory'].storage = data.advanced.storage;
        }
      } else {
        if (data.feature.boundedCache && data.advanced.storage) {
          cache[cacheType]['memory'] = {
            storage: data.advanced.storage
          };
        }
      }
    };

    // config for Indexed cache
    const featureIndexed = () => {
      cache[cacheType]['indexing'] = {
        enabled: true,
        'indexing-mode': data.feature.indexedCache.indexingMode,
        storage: data.feature.indexedCache.indexedStorage,
        'startup-mode': data.feature.indexedCache.indexedStartupMode,
        'indexed-entities': data.feature.indexedCache.indexedEntities
      };
    };

    const indexReader = () => {
      cache[cacheType]['indexing']['index-reader'] = {
        'refresh-interval': data.advanced.indexReader
      };
    };

    const indexWriter = () => {
      cache[cacheType]['indexing']['index-writer'] = {
        'commit-interval': data.advanced.indexWriter.commitInterval,
        'max-buffered-entries': data.advanced.indexWriter.maxBufferedEntries,
        'queue-count': data.advanced.indexWriter.queueCount,
        'queue-size': data.advanced.indexWriter.queueSize,
        'ram-buffer-size': data.advanced.indexWriter.ramBufferSize,
        'thread-pool-size': data.advanced.indexWriter.threadPoolSize,
        'low-level-trace': data.advanced.indexWriter.lowLevelTrace
      };
    };

    const indexMerge = () => {
      // Add index merge config to the configuration
      !cache[cacheType]['indexing']['index-writer'] && (cache[cacheType]['indexing']['index-writer'] = {});

      cache[cacheType]['indexing']['index-writer']['index-merge'] = {
        factor: data.advanced.indexMerge.factor,
        'max-entries': data.advanced.indexMerge.maxEntries,
        'min-size': data.advanced.indexMerge.minSize,
        'max-size': data.advanced.indexMerge.maxSize,
        'max-forced-size': data.advanced.indexMerge.maxForcedSize,
        'calibrate-by-deletes': data.advanced.indexMerge.calibrateByDeletes
      };
    };

    const indexSharding = () => {
      cache[cacheType]['indexing']['index-sharding'] = {
        shards: data.feature.indexedCache.indexedSharding
      };
    };

    const featureSecured = () => {
      cache[cacheType]['security'] = {
        authorization: {
          enabled: true,
          roles: data.feature.securedCache.roles
        }
      };
    };

    const backups = () => {
      cache[cacheType]['backups'] = {
        'merge-policy': data.advanced.backupSetting?.mergePolicy,
        'tombstone-map-size': data.advanced.backupSetting?.tombstoneMapSize,
        'max-cleanup-delay': data.advanced.backupSetting?.maxCleanupDelay
      };
    };

    const helperBackups = () => {
      data.feature.backupsCache.sites.forEach((site, index) => {
        cache[cacheType]['backups'][site.siteName!] = {
          backup: {
            strategy: site.siteStrategy,
            'failure-policy': data.advanced.backupSiteData![index].failurePolicy,
            timeout: data.advanced.backupSiteData![index].timeout,
            'two-phase-commit': data.advanced.backupSiteData![index].twoPhaseCommit,
            'failure-policy-class': data.advanced.backupSiteData![index].failurePolicyClass
          }
        };
        if (
          data.advanced.backupSiteData![index].takeOffline?.afterFailures ||
          data.advanced.backupSiteData![index].takeOffline?.minWait
        ) {
          cache[cacheType]['backups'][site.siteName!].backup['take-offline'] = {
            'after-failures': data.advanced.backupSiteData![index].takeOffline?.afterFailures,
            'min-wait': data.advanced.backupSiteData![index].takeOffline?.minWait
          };
        }
        if (
          data.advanced.backupSiteData![index].stateTransfer?.chunckSize ||
          data.advanced.backupSiteData![index].stateTransfer?.maxRetries ||
          data.advanced.backupSiteData![index].stateTransfer?.timeout ||
          data.advanced.backupSiteData![index].stateTransfer?.mode ||
          data.advanced.backupSiteData![index].stateTransfer?.waitTime
        ) {
          cache[cacheType]['backups'][site.siteName!].backup['state-transfer'] = {
            'chunk-size': data.advanced.backupSiteData![index].stateTransfer?.chunckSize,
            'max-retries': data.advanced.backupSiteData![index].stateTransfer?.maxRetries,
            timeout: data.advanced.backupSiteData![index].stateTransfer?.timeout,
            mode: data.advanced.backupSiteData![index].stateTransfer?.mode,
            'wait-time': data.advanced.backupSiteData![index].stateTransfer?.waitTime
          };
        }
      });
    };

    const helperBackupsFor = () => {
      cache[cacheType]['backup-for'] = {
        'remote-cache': data.feature.backupsCache.backupFor.remoteCache,
        'remote-site': data.feature.backupsCache.backupFor.remoteSite
      };
    };

    const featureTransactional = () => {
      cache[cacheType]['transaction'] = {
        mode: data.feature.transactionalCache.mode,
        locking: data.feature.transactionalCache.locking,
        'stop-timeout': data.advanced.transactionalAdvance?.stopTimeout,
        'complete-timeout': data.advanced.transactionalAdvance?.completeTimeout,
        'reaper-interval': data.advanced.transactionalAdvance?.reaperInterval
      };
    };

    const featurePersistent = () => {
      try {
        cache[cacheType]['persistence'] = JSON.parse(data.feature.persistentCache.config);
      } catch (e) {
        // unable to parse
        cache[cacheType]['persistence'] = {};
      }
      cache[cacheType]['persistence'].passivation = data.feature.persistentCache.passivation;
      if (data.feature.persistentCache.connectionAttempts) {
        cache[cacheType]['persistence']['connection-attempts'] = data.feature.persistentCache.connectionAttempts;
      }
      if (data.feature.persistentCache.connectionInterval) {
        cache[cacheType]['persistence']['connection-interval'] = data.feature.persistentCache.connectionInterval;
      }
      if (data.feature.persistentCache.availabilityInterval) {
        cache[cacheType]['persistence']['availability-interval'] = data.feature.persistentCache.availabilityInterval;
      }
    };

    if (data.advanced.concurrencyLevel || data.advanced.striping || data.advanced.lockAcquisitionTimeout) locking();

    data.basic.expiration === true && expiration();
    memoryConfiguration();

    if (data.advanced.aliases.length > 0) {
      cache[cacheType]['aliases'] = data.advanced.aliases;
    }

    if (data.feature.cacheFeatureSelected.includes(CacheFeature.INDEXED)) {
      featureIndexed();
      data.feature.indexedCache.indexedSharding && indexSharding();
      data.advanced.indexReader && indexReader();
      if (
        data.advanced.indexWriter.commitInterval ||
        data.advanced.indexWriter.maxBufferedEntries ||
        data.advanced.indexWriter.queueCount ||
        data.advanced.indexWriter.queueSize ||
        data.advanced.indexWriter.ramBufferSize ||
        data.advanced.indexWriter.threadPoolSize ||
        data.advanced.indexWriter.lowLevelTrace
      )
        indexWriter();

      if (
        data.advanced.indexMerge.factor ||
        data.advanced.indexMerge.maxEntries ||
        data.advanced.indexMerge.minSize ||
        data.advanced.indexMerge.maxSize ||
        data.advanced.indexMerge.maxForcedSize ||
        data.advanced.indexMerge.calibrateByDeletes
      )
        indexMerge();
    }

    if (data.feature.cacheFeatureSelected.includes(CacheFeature.BACKUPS)) {
      backups();
      helperBackups();
      if (data.feature.backupsCache.backupFor.enabled) {
        helperBackupsFor();
      }
    }

    data.feature.cacheFeatureSelected.includes(CacheFeature.SECURED) && featureSecured();

    if (data.feature.cacheFeatureSelected.includes(CacheFeature.TRANSACTIONAL)) {
      featureTransactional();
      !cache[cacheType]['locking'] && (cache[cacheType]['locking'] = {});
      cache[cacheType]['locking'].isolation = data.advanced.transactionalAdvance?.isolationLevel;
    }

    if (data.feature.cacheFeatureSelected.includes(CacheFeature.PERSISTENCE)) {
      featurePersistent();
    }

    if (data.advanced.tracing.globalEnabled) {
      cache[cacheType]['tracing'] = {};
      cache[cacheType]['tracing'].enabled = data.advanced.tracing.enabled;
      if (data.advanced.tracing.categories.length > 0) {
        cache[cacheType]['tracing'].categories = data.advanced.tracing.categories;
      }
    }

    return JSON.stringify(cache, null, 2);
  }

  public static createCacheWithEditorStep(data: CacheEditorStep, cacheName: string): Promise<ActionResponse> {
    const name = cacheName.trim();

    // Validate Name
    const isValidName: 'success' | 'error' = name.length > 0 ? 'success' : 'error';

    // Validate the config
    let isValidConfig: 'success' | 'error';
    let configValidation;

    if (data.selectedConfig != '') {
      // User has chosen a template
      isValidConfig = 'success';
    } else {
      if (data.configs.length == 0 || data.editorExpanded) {
        // there are no templates or the expanded area is opened, we validate the text area content
        configValidation = CacheConfigUtils.validateConfig(data.editorConfig);

        isValidConfig = configValidation.isRight() ? 'success' : 'error';
        if (configValidation.isLeft()) {
          data.errorConfig = configValidation.value;
        }
      } else {
        // There are no templates chosen and the config text area is not visible
        isValidConfig = 'error';
      }
    }

    data.validConfig = isValidConfig;

    if (isValidName == 'error' || isValidConfig == 'error') {
      return Promise.resolve(<ActionResponse>{
        message: `Unable to create cache ${cacheName}.`,
        success: false
      });
    }

    let createCacheCall: Promise<ActionResponse>;

    if (data.selectedConfig != '') {
      createCacheCall = ConsoleServices.caches().createCacheByConfigName(cacheName, data.selectedConfig);
    } else {
      createCacheCall = ConsoleServices.caches().createCacheWithConfiguration(
        cacheName,
        data.editorConfig,
        configValidation.value
      );
    }

    return createCacheCall;
  }

  public static createCacheWithWizardStep(
    config: string,
    cacheName: string,
    contentType: 'json' | 'xml' | 'yaml'
  ): Promise<ActionResponse> {
    const name = cacheName.trim();
    // Validate Name
    const isValidName: 'success' | 'error' = name.length > 0 ? 'success' : 'error';

    // Validate the config
    const configValidation = CacheConfigUtils.validateConfig(config);
    const isValidConfig: 'success' | 'error' = configValidation.isRight() ? 'success' : 'error';

    if (isValidName == 'error' || isValidConfig == 'error') {
      return Promise.resolve(<ActionResponse>{
        message: `Unable to create cache ${cacheName}.`,
        success: false
      });
    }

    const createCacheCall: Promise<ActionResponse> = ConsoleServices.caches().createCacheWithConfiguration(
      cacheName,
      config,
      contentType
    );

    return createCacheCall;
  }
}
