import { ProtobufDataUtils } from '@services/protobufDataUtils';
import { ContentType, EncodingType } from '@services/infinispanRefData';
import { Either, left, right } from '@services/either';
import { WrappedMessageService } from '@services/wrappedMessageService';
import json_bigint from 'json-bigint';
const JSONbigString = json_bigint({ storeAsString: true });

/**
 * Entries mappings
 */
export class CacheRequestResponseMapper {
  /**
   * Used to prepare a content to be sent in the url or the body
   * according to the content type and the encoding of the cache
   *
   * @param content
   * @param contentType
   * @param encoding
   */
  public static formatContent(
    content: string,
    contentType: ContentType,
    encoding: EncodingType
  ): Either<ActionResponse, string> {
    // if the encoding is JSON, validate if it's "" for strings
    if (encoding == EncodingType.JSON) {
      if (
        isNaN(Number(content)) &&
        content != 'true' &&
        content != 'false' &&
        !(content.startsWith('{') || content.startsWith('['))
      ) {
        return content.startsWith('"') && content.endsWith('"') ? right(content) : right(JSON.stringify(content));
      } else if (content.startsWith('{') || content.startsWith('[')) {
        try {
          JSON.parse(content);
        } catch (e) {
          return left({
            message: 'Provided Json content is not correctly formed.',
            success: false
          });
        }
      }
    } else if (encoding == EncodingType.Protobuf && contentType != ContentType.customType) {
      const protobufType = contentType;
      let contentToPut: unknown = content;
      if (protobufType == ContentType.bool) {
        contentToPut = content == 'true';
      }

      const entry = { _type: protobufType, _value: contentToPut };
      return right(JSON.stringify(entry));
    }

    return right(content);
  }

  // TODO: Deal parsing headers better
  /**
   * Json to Entry mapper
   *
   * @param key
   * @param keyContentType
   * @param encoding
   * @param value, in string format
   * @param headers, to grab metadata
   */
  public static toEntry(
    key: string,
    keyContentType: ContentType,
    encoding: CacheEncoding,
    value: string,
    headers: Headers
  ): CacheEntry {
    const timeToLive = headers.get('timeToLiveSeconds');
    const maxIdleTimeSeconds = headers.get('maxIdleTimeSeconds');
    const created = headers.get('created');
    const lastUsed = headers.get('lastUsed');
    const lastModified = headers.get('Last-Modified');
    const expires = headers.get('Expires');
    const cacheControl = headers.get('Cache-Control');
    const etag = headers.get('Etag');

    const entry = <CacheEntry>{
      key: key,
      keyContentType: keyContentType,
      // We need to specifically ask to parse if it's json since the value is string typed and not JSON
      value: this.extractData(value, encoding.value as EncodingType, true),
      valueContentType: this.extractContentType(value, encoding.value as EncodingType, true),
      timeToLive: this.parseMetadataNumber(timeToLive),
      maxIdle: this.parseMetadataNumber(maxIdleTimeSeconds),
      created: this.parseMetadataDate(created),
      lastUsed: this.parseMetadataDate(lastUsed),
      lastModified: lastModified ? this.parseMetadataDate(Date.parse(lastModified)) : undefined,
      expires: expires ? this.parseMetadataDate(Date.parse(expires)) : undefined,
      cacheControl: cacheControl,
      eTag: etag
    };

    return entry;
  }

  /**
   * Json list to Entry list mapper
   *
   * @param data
   * @param encoding
   */
  public static toEntries(data: any, encoding: CacheEncoding): CacheEntry[] {
    return JSONbigString.parse(data).map(
      (entry) =>
        <CacheEntry>{
          key: this.extractData(entry.key, encoding.key as EncodingType),
          keyContentType: this.extractContentType(entry.key, encoding.key as EncodingType),
          value: this.extractData(entry.value, encoding.value as EncodingType),
          valueContentType: this.extractContentType(entry.value, encoding.value as EncodingType),
          timeToLive: this.parseMetadataNumber(entry.timeToLiveSeconds),
          maxIdle: this.parseMetadataNumber(entry.maxIdleTimeSeconds),
          created: this.parseMetadataDate(entry.created),
          lastUsed: this.parseMetadataDate(entry.lastUsed),
          expires: this.parseMetadataDate(entry.expireTime)
        }
    );
  }

  /**
   * Convert bytes to entry (for octet-stream with WrappedMessage)
   *
   * @param key
   * @param keyContentType
   * @param encoding
   * @param bytes
   * @param headers
   */
  /**
   * STEP 3: Convert HTTP response bytes to CacheEntry
   *
   * This is the main entry point for converting raw bytes from the server into a CacheEntry object.
   *
   * Flow:
   * 1. Receives bytes from HTTP response (application/octet-stream)
   * 2. Attempts to decode as WrappedMessage protobuf
   * 3. If successful, formats the decoded data for display
   * 4. If failed, falls back to base64 encoding
   * 5. Extracts metadata from HTTP headers (TTL, maxIdle, etc.)
   * 6. Returns CacheEntry with formatted value and metadata
   */
  public static async toEntryFromBytes(
    key: string,
    keyContentType: ContentType,
    encoding: CacheEncoding,
    bytes: Uint8Array,
    headers: Headers
  ): Promise<CacheEntry> {
    // STEP 4: Try to decode as WrappedMessage
    const wrappedResult = await WrappedMessageService.decode(bytes);
    
    let value: string;
    let valueContentType: ContentType;
    let valueType: string | undefined;

    if (wrappedResult.isRight()) {
      const wrapped = wrappedResult.value;
      
      // STEP 8: Format value using formatForDisplay (which may use stringify functions from TYPE_ID_MAP)
      valueType = wrapped.typeName || wrapped.type;
      value = WrappedMessageService.formatForDisplay(wrapped);
      
      // Determine content type based on what was decoded
      if (wrapped.typeName && wrapped.displayValue !== undefined && wrapped.nativeValue !== undefined) {
        // Uniform bucket structure (JsonBucket, SetBucket, etc.)
        valueContentType = ContentType.customType;
      } else if (wrapped.type === 'message') {
        // Other message types
        valueContentType = ContentType.customType;
      } else {
        // Scalar types (string, int, etc.)
        valueContentType = this.mapWrappedTypeToContentType(wrapped.type);
      }
    } else {
      // Not a WrappedMessage or decode failed - show as base64
      value = this.bytesToBase64(bytes);
      valueContentType = ContentType.StringContentType;
      valueType = 'binary';
    }

    // Extract metadata from headers
    const timeToLive = headers.get('timeToLiveSeconds');
    const maxIdleTimeSeconds = headers.get('maxIdleTimeSeconds');
    const created = headers.get('created');
    const lastUsed = headers.get('lastUsed');
    const lastModified = headers.get('Last-Modified');
    const expires = headers.get('Expires');
    const cacheControl = headers.get('Cache-Control');
    const etag = headers.get('Etag');

    return <CacheEntry>{
      key: key,
      keyContentType: keyContentType,
      value: value,
      valueContentType: valueContentType,
      valueType: valueType,
      timeToLive: this.parseMetadataNumber(timeToLive),
      maxIdle: this.parseMetadataNumber(maxIdleTimeSeconds),
      created: this.parseMetadataDate(created),
      lastUsed: this.parseMetadataDate(lastUsed),
      lastModified: lastModified ? this.parseMetadataDate(Date.parse(lastModified)) : undefined,
      expires: expires ? this.parseMetadataDate(Date.parse(expires)) : undefined,
      cacheControl: cacheControl,
      eTag: etag
    };
  }

  /**
   * Map WrappedMessage type to ContentType
   */
  private static mapWrappedTypeToContentType(type: string): ContentType {
    const typeMap: Record<string, ContentType> = {
      'string': ContentType.string,
      'int32': ContentType.int32,
      'int64': ContentType.int64,
      'double': ContentType.double,
      'float': ContentType.float,
      'bool': ContentType.bool,
      'message': ContentType.customType,
      'enum': ContentType.customType
    };
    return typeMap[type] || ContentType.StringContentType;
  }

  /**
   * Convert bytes to base64 string
   */
  private static bytesToBase64(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private static extractData(data: any, dataEncoding: EncodingType, parse: boolean = false): string {
    if (data == null) {
      return '';
    }

    if (dataEncoding == EncodingType.JSON) {
      return parse ? JSONbigString.stringify(JSONbigString.parse(data)) : JSONbigString.stringify(data);
    }

    if (dataEncoding == EncodingType.Protobuf) {
      let protobufJson = data;
      if (parse) {
        protobufJson = JSONbigString.parse(data);
      }
      const dataType = protobufJson['_type'];
      const dataValue = protobufJson['_value'];
      if (ProtobufDataUtils.fromProtobufType(dataType) == ContentType.customType) {
        return JSONbigString.stringify(protobufJson);
      }
      return dataValue.toString();
    }

    const stringify = JSONbigString.stringify(data);
    if (stringify.startsWith('{') || stringify.startsWith('[')) {
      return stringify;
    }

    return data.toString();
  }

  private static extractContentType(
    content: any,
    encodingType: EncodingType,
    parseToJson: boolean = false
  ): ContentType {
    if (content == null) {
      return ContentType.StringContentType;
    }

    if (encodingType == EncodingType.XML) {
      return ContentType.XML;
    }
    if (encodingType == EncodingType.JSON) {
      return ContentType.JSON;
    }
    if (encodingType == EncodingType.Protobuf) {
      let protobufData = content;
      if (parseToJson) {
        protobufData = JSON.parse(content);
      }
      return ProtobufDataUtils.fromProtobufType(protobufData['_type']);
    }
    return ContentType.StringContentType;
  }

  private static parseMetadataDate(entryMetadata: string | number | undefined | null): string | undefined {
    if (!entryMetadata || entryMetadata == -1 || entryMetadata == '-1') {
      return undefined;
    }

    let entryMetadataNumber: number;

    if (Number.isInteger(entryMetadata)) {
      entryMetadataNumber = entryMetadata as number;
    } else {
      entryMetadataNumber = Number.parseInt(entryMetadata as string);
    }
    return new Date(entryMetadataNumber).toLocaleString();
  }

  private static parseMetadataNumber(entryMetadata: number | undefined | null | string): string | undefined {
    if (!entryMetadata || entryMetadata == -1 || entryMetadata == '-1') {
      return undefined;
    }
    let entryMetadataNumber: number;
    if (Number.isInteger(entryMetadata)) {
      entryMetadataNumber = entryMetadata as number;
    } else {
      entryMetadataNumber = Number.parseInt(entryMetadata as string);
    }
    return entryMetadataNumber.toLocaleString('en', {
      maximumFractionDigits: 0
    });
  }
}

// Made with Bob
