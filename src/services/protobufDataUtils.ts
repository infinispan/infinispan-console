import { ContentType } from '@services/infinispanRefData';

/**
 * Protobuf data types utility methods
 */
export class ProtobufDataUtils {
  /**
   * Returns true if the content is a basic protobuf type
   *
   * @param protobufType
   */
  public static isProtobufBasicType(protobufType: string | undefined): boolean {
    if (protobufType == undefined) {
      return false;
    }

    switch (protobufType) {
      case 'string':
      case 'float':
      case 'double':
      case 'int32':
      case 'uint32':
      case 'sint32':
      case 'fixed32':
      case 'sfixed32':
      case 'int64':
      case 'uint64':
      case 'sint64':
      case 'fixed64':
      case 'sfixed64':
      case 'bool':
      case 'bytes':
        return true;
    }
    return false;
  }

  /**
   * Maps from protobuf to content type
   *
   * @param protobufType
   */
  public static fromProtobufType(protobufType: string): ContentType {
    let contentType;
    try {
      contentType = ContentType[protobufType];
    } catch (e) {
      // Nothing to do, unknown type
    }

    return contentType ? contentType : ContentType.customType;
  }
}
