/**
 * Cache configuration utils class
 *
 * @author Katia Aresti
 */
export const Distributed = 'distributed-cache';
export const Replicated = 'replicated-cache';
export const Invalidated = 'invalidation-cache';
export const Local = 'local-cache';
export const Scattered = 'scattered-cache';

export enum EncodingType {
  Protobuf = 'application/x-protostream',
  Java = 'application/x-java-object',
  XML = 'application/xml; charset=UTF-8',
  JSON = 'application/json',
  Text = 'text/plain',
  Empty = 'Empty',
}

export class CacheConfigUtils {
  public static mapEncoding(config: JSON): [EncodingType, EncodingType] {
    let cacheConfigHead;
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
    } else {
      throw new Error('The configuration of the cache is not correct');
    }

    if (cacheConfigHead.hasOwnProperty('encoding')) {
      return [
        CacheConfigUtils.toEncoding(cacheConfigHead.encoding.key['media-type']),
        CacheConfigUtils.toEncoding(
          cacheConfigHead.encoding.value['media-type']
        ),
      ];
    }

    return [EncodingType.Empty, EncodingType.Empty];
  }

  public static toEncoding(encodingConf: string | undefined): EncodingType {
    if (!encodingConf) return EncodingType.Empty;

    if (encodingConf.includes('protostream')) {
      return EncodingType.Protobuf;
    } else if (encodingConf.includes('java')) {
      return EncodingType.Java;
    } else if (encodingConf.includes('text')) {
      return EncodingType.Text;
    } else if (encodingConf.includes('xml')) {
      return EncodingType.XML;
    } else if (encodingConf.includes('json')) {
      return EncodingType.JSON;
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
    return encoding != EncodingType.Empty;
  }
}
