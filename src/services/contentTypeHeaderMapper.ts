import { ProtobufDataUtils } from '@services/protobufDataUtils';
import { ContentType, EncodingType } from '@services/infinispanRefData';

/**
 * Maps between Content Types and HTTP headers to be sent to the
 * REST API
 */
export class ContentTypeHeaderMapper {
  /**
   * Calculates the key content type header value to send ot the REST API
   * @param contentType
   */
  public static fromContentType(contentType: ContentType): string {
    let stringContentType = '';
    switch (contentType) {
      case ContentType.StringContentType:
      case ContentType.DoubleContentType:
      case ContentType.IntegerContentType:
      case ContentType.LongContentType:
      case ContentType.FloatContentType:
      case ContentType.BooleanContentType:
        stringContentType =
          'application/x-java-object;type=java.lang.' + contentType.toString();
        break;
      case ContentType.XML:
        stringContentType = 'application/xml';
        break;
      case ContentType.YAML:
        stringContentType = 'application/yaml';
        break;
      default:
        stringContentType = 'application/json';
    }

    return stringContentType;
  }

  /**
   * Translate from string to ContentType
   *
   * @param contentTypeHeader
   * @param defaultContentType
   */
  public static toContentType(
    contentTypeHeader: string | null | undefined,
    defaultContentType?: ContentType
  ): ContentType {
    if (contentTypeHeader == null) {
      return defaultContentType
        ? defaultContentType
        : ContentType.StringContentType;
    }
    if (
      contentTypeHeader.startsWith('application/x-java-object;type=java.lang.')
    ) {
      const contentType = contentTypeHeader.replace(
        'application/x-java-object;type=java.lang.',
        ''
      );
      return contentType as ContentType;
    }

    if (contentTypeHeader == 'application/json') {
      return ContentType.JSON;
    }

    if (contentTypeHeader == 'application/xml') {
      return ContentType.XML;
    }

    if (contentTypeHeader == 'application/yaml') {
      return ContentType.YAML;
    }

    return ContentType.StringContentType;
  }

  public static fromEncodingAndContentTypeToHeader(
    encodingType: EncodingType,
    content: string,
    contentType: ContentType
  ): string {
    if (encodingType == EncodingType.XML) {
      return ContentTypeHeaderMapper.fromContentType(ContentType.XML);
    }

    if (
      encodingType == EncodingType.JSON ||
      encodingType == EncodingType.Protobuf
    ) {
      return ContentTypeHeaderMapper.fromContentType(ContentType.JSON);
    }

    return ContentTypeHeaderMapper.fromContentType(contentType);
  }
}
