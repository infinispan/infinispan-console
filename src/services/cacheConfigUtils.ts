import { ContentType, EncodingType } from '@services/infinispanRefData';
import { Either, left, right } from '@services/either';
import { ConsoleServices } from '@services/ConsoleServices';

export const Distributed = 'distributed-cache';
export const Replicated = 'replicated-cache';
export const Invalidated = 'invalidation-cache';
export const Local = 'local-cache';
export const Scattered = 'scattered-cache';

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
  public static validateConfig(
    config: string
  ): Either<string, 'xml' | 'json' | 'yaml'> {
    const trimmedConf = config.trim();

    if (trimmedConf.length == 0) {
      return left("Configuration can't be empty");
    }
    try {
      JSON.parse(trimmedConf);
      return right('json');
    } catch (ex) {}

    try {
      let oDOM = new DOMParser().parseFromString(trimmedConf, 'text/xml');
      if (oDOM.getElementsByTagName('parsererror').length == 0) {
        return right('xml');
      }
    } catch (ex) {}

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
    }

    return EncodingType.Empty;
  }

  /**
   * Map cache name from json configuration or from the label in the conf
   * @param config or cache type name
   */
  public static mapCacheType(config: JSON | string): string {
    let cacheType: string = 'Unknown';
    if (config.hasOwnProperty(Distributed) || config == Distributed) {
      cacheType = 'Distributed';
    } else if (config.hasOwnProperty(Replicated) || config == Replicated) {
      cacheType = 'Replicated';
    } else if (config.hasOwnProperty(Local) || config == Local) {
      cacheType = 'Local';
    } else if (config.hasOwnProperty(Invalidated) || config == Invalidated) {
      cacheType = 'Invalidated';
    } else if (config.hasOwnProperty(Scattered) || config == Scattered) {
      cacheType = 'Scattered';
    }
    return cacheType;
  }

  /**
   * Retrieve if an encoding is editable or not
   *
   * @param encoding
   */
  public static isEditable(encoding: EncodingType): boolean {
    return (
      encoding != EncodingType.Empty &&
      encoding != EncodingType.JavaSerialized &&
      encoding != EncodingType.Octet
    );
  }

  /**
   * Map accepted content types to encoding
   *
   * @param encodingType
   */
  public static getContentTypeOptions(
    encodingType: EncodingType
  ): ContentType[] {
    let contentTypes: ContentType[] = [];

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
    } else if (encodingType == EncodingType.Text) {
      contentTypes.push(ContentType.StringContentType);
    }

    return contentTypes;
  }

  public static createCacheConfigFromData(data: CacheConfiguration): string {
    let cache;

    const featureBounded = () => {
      cache['distributed-cache']['indexing'] = {
        storage: data.feature.storageType,
      };

      cache['distributed-cache']['memory'] = {
        'max-count': data.advanced.maxCount,
        'max-size': data.advanced.maxSize,
        'when-full': data.advanced.evictionStrategy,
      };
    };

    if (data.basic.topology === 'Distributed') {
      cache = {
        'distributed-cache': {
          mode: data.basic.mode,
          owners: data.basic.numberOfOwners,
          statistics: data.basic.statistics,
          encoding: {
            'media-type': data.basic.encoding,
          },
          locking: {
            isolation: data.advanced.isolationLevel,
            striping: data.advanced.striping,
            'concurrency-level': data.advanced.concurrencyLevel,
            'acquire-timeout': data.advanced.lockAcquisitionTimeout,
          },
        },
      };
    } else if (data.basic.topology === 'Replicated') {
      cache = {
        'replicated-cache': {
          mode: data.basic.mode,
          statistics: data.basic.statistics,
          encoding: {
            'media-type': data.basic.encoding,
          },
          locking: {
            isolation: data.advanced.isolationLevel,
            striping: data.advanced.striping,
            'concurrency-level': data.advanced.concurrencyLevel,
            'acquire-timeout': data.advanced.lockAcquisitionTimeout,
          },
        },
      };
    }

    data.feature.cacheFeatureSelected.includes('BOUNDED') && featureBounded();

    return JSON.stringify(cache, null, 2);
  }

  public static createCacheWithEditorStep(
    data: CacheEditorStep,
    cacheName: string
  ) : Promise<ActionResponse> {
    const name = cacheName.trim();

    // Validate Name
    const isValidName: 'success' | 'error' =
      name.length > 0 ? 'success' : 'error';

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
        success: false,
      });
    }

    let createCacheCall: Promise<ActionResponse>;

    if (data.selectedConfig != '') {
      createCacheCall = ConsoleServices.caches().createCacheByConfigName(
        cacheName,
        data.selectedConfig
      );
    } else {
      createCacheCall = ConsoleServices.caches().createCacheWithConfiguration(
        cacheName,
        data.editorConfig,
        'json'
      );
    }

    return createCacheCall;
  }

  public static createCacheWithWizardStep(
    data: CacheConfiguration,
    cacheName: string
  ) : Promise<ActionResponse> {
    const name = cacheName.trim();
    const config = CacheConfigUtils.createCacheConfigFromData(data);

    // Validate Name
    const isValidName: 'success' | 'error' =
      name.length > 0 ? 'success' : 'error';

    // Validate the config
    const configValidation = CacheConfigUtils.validateConfig(config);
    const isValidConfig: 'success' | 'error' = configValidation.isRight()
      ? 'success'
      : 'error';

    if (isValidName == 'error' || isValidConfig == 'error') {
      return Promise.resolve(<ActionResponse>{
        message: `Unable to create cache ${cacheName}.`,
        success: false,
      });
    }

    const createCacheCall: Promise<ActionResponse> = ConsoleServices.caches().createCacheWithConfiguration(
      cacheName,
      CacheConfigUtils.createCacheConfigFromData(data),
      'json'
    );

    return createCacheCall;
  }
}
