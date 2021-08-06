import { ContentType, EncodingType } from '@services/infinispanRefData';
import {Either, left, right} from "@services/either";

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
  public static validateConfig (config: string): Either<string, 'xml' | 'json'> {
    const trimmedConf = config.trim();

    if (trimmedConf.length == 0) {
      return left('Configuration can\'t be empty');
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
    return left('The provided configuration is not a valid XML or JSON.');
  };

  /**
   * Map the encoding type of the cache
   * @param config, config of the cache
   */
  public static mapEncoding(config: JSON): CacheEncoding {
    let cacheConfigHead: any = {};
    if (config.hasOwnProperty(Distributed)) {
      cacheConfigHead = config[Distributed];
    } else if (config.hasOwnProperty(Replicated)) {
      cacheConfigHead = config[Replicated];
    } else if (config.hasOwnProperty(Invalidated)) {
      cacheConfigHead = config[Invalidated];
    } else if (config.hasOwnProperty(Local)) {
      cacheConfigHead = config[Local];
    } else if (config.hasOwnProperty(Scattered)) {
      cacheConfigHead = config[Scattered];
    }

    if (cacheConfigHead.hasOwnProperty('encoding')) {
      return {
        key: CacheConfigUtils.toEncoding(
          cacheConfigHead.encoding.key['media-type']
        ),
        value: CacheConfigUtils.toEncoding(
          cacheConfigHead.encoding.value['media-type']
        ),
      };
    }

    return { key: EncodingType.Empty, value: EncodingType.Empty };
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
}
