import { ContentType } from '@services/infinispanRefData';

export class ProtobufDataTransformer {
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
        return true;
    }
    return false;
  }

  public static fromProtobufType(protobufType: string): ContentType {
    let contentType;

    switch (protobufType) {
      case 'string':
        contentType = ContentType.StringContentType;
        break;
      case 'float':
        contentType = ContentType.FloatContentType;
        break;
      case 'double':
        contentType = ContentType.DoubleContentType;
        break;
      case 'int32':
      case 'uint32':
      case 'sint32':
      case 'fixed32':
      case 'sfixed32':
        contentType = ContentType.IntegerContentType;
        break;
      case 'int64':
      case 'uint64':
      case 'sint64':
      case 'fixed64':
      case 'sfixed64':
        contentType = ContentType.LongContentType;
        break;
      case 'bool':
        contentType = ContentType.BooleanContentType;
        break;
      default:
        contentType = ContentType.StringContentType;
    }
    return contentType;
  }
}
