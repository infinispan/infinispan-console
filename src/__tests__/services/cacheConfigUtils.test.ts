import {
  CacheConfigUtils,
  DIST_ASYNC,
  DIST_SYNC,
  Distributed,
  Invalidated,
  INVALIDATION_ASYNC,
  INVALIDATION_SYNC,
  LOCAL,
  Local,
  REPL_ASYNC,
  REPL_SYNC,
  Replicated
} from '@services/cacheConfigUtils';
import { ContentType, EncodingType } from '@services/infinispanRefData';

describe('Cache Config Utils tests', () => {
  test('cache topology', () => {
    expect(CacheConfigUtils.mapCacheType(DIST_SYNC)).toBe('Distributed');
    expect(CacheConfigUtils.mapCacheType(DIST_ASYNC)).toBe('Distributed');
    expect(CacheConfigUtils.mapCacheType(REPL_SYNC)).toBe('Replicated');
    expect(CacheConfigUtils.mapCacheType(REPL_ASYNC)).toBe('Replicated');
    expect(CacheConfigUtils.mapCacheType(LOCAL)).toBe('Local');
    expect(CacheConfigUtils.mapCacheType(INVALIDATION_ASYNC)).toBe('Invalidated');
    expect(CacheConfigUtils.mapCacheType(INVALIDATION_SYNC)).toBe('Invalidated');

    expect(CacheConfigUtils.mapCacheType(Distributed)).toBe('Distributed');
    expect(CacheConfigUtils.mapCacheType(Replicated)).toBe('Replicated');
    expect(CacheConfigUtils.mapCacheType(Invalidated)).toBe('Invalidated');
    expect(CacheConfigUtils.mapCacheType(Local)).toBe('Local');
  });

  test('cache sync or async', () => {
    expect(CacheConfigUtils.isAsync(DIST_SYNC)).toBe(false);
    expect(CacheConfigUtils.isAsync(DIST_ASYNC)).toBe(true);
    expect(CacheConfigUtils.isAsync(REPL_SYNC)).toBe(false);
    expect(CacheConfigUtils.isAsync(REPL_ASYNC)).toBe(true);
    expect(CacheConfigUtils.isAsync(LOCAL)).toBe(false);
    expect(CacheConfigUtils.isAsync(INVALIDATION_ASYNC)).toBe(true);
    expect(CacheConfigUtils.isAsync(INVALIDATION_SYNC)).toBe(false);
  });

  test('editable', () => {
    expect(CacheConfigUtils.isEditable(EncodingType.Protobuf)).toBeTruthy();
    expect(CacheConfigUtils.isEditable(EncodingType.JBoss)).toBeTruthy();
    expect(CacheConfigUtils.isEditable(EncodingType.XML)).toBeTruthy();
    expect(CacheConfigUtils.isEditable(EncodingType.Text)).toBeTruthy();
    expect(CacheConfigUtils.isEditable(EncodingType.JSON)).toBeTruthy();
    expect(CacheConfigUtils.isEditable(EncodingType.Java)).toBeTruthy();
    expect(CacheConfigUtils.isEditable(EncodingType.JavaSerialized)).toBeFalsy();
    expect(CacheConfigUtils.isEditable(EncodingType.Octet)).toBeFalsy();
    expect(CacheConfigUtils.isEditable(EncodingType.Empty)).toBeFalsy();
  });

  test('content types depending on encoding', () => {
    expect(CacheConfigUtils.getContentTypeOptions(EncodingType.Text)).toStrictEqual([ContentType.StringContentType]);
    expect(CacheConfigUtils.getContentTypeOptions(EncodingType.JSON)).toStrictEqual([ContentType.JSON]);
    expect(CacheConfigUtils.getContentTypeOptions(EncodingType.XML)).toStrictEqual([ContentType.XML]);
    const javaContentTypes = [
      ContentType.StringContentType,
      ContentType.IntegerContentType,
      ContentType.LongContentType,
      ContentType.FloatContentType,
      ContentType.DoubleContentType,
      ContentType.BooleanContentType,
      ContentType.JSON
    ];

    expect(CacheConfigUtils.getContentTypeOptions(EncodingType.Java)).toStrictEqual(javaContentTypes);
    expect(CacheConfigUtils.getContentTypeOptions(EncodingType.JavaSerialized)).toStrictEqual(javaContentTypes);
    expect(CacheConfigUtils.getContentTypeOptions(EncodingType.JBoss)).toStrictEqual(javaContentTypes);
    expect(CacheConfigUtils.getContentTypeOptions(EncodingType.Protobuf)).toStrictEqual([
      ContentType.string,
      ContentType.customType,
      ContentType.int32,
      ContentType.int64,
      ContentType.double,
      ContentType.float,
      ContentType.bool,
      ContentType.bytes,
      ContentType.uint32,
      ContentType.uint64,
      ContentType.sint32,
      ContentType.sint64,
      ContentType.fixed32,
      ContentType.fixed64,
      ContentType.sfixed32,
      ContentType.sfixed64
    ]);
  });

  test('minim validation of the configuration json or xml', () => {
    expect(CacheConfigUtils.validateConfig('').isLeft()).toBeTruthy();
    expect(CacheConfigUtils.validateConfig('    ').isLeft()).toBeTruthy();
    expect(CacheConfigUtils.validateConfig('{}').isRight()).toBeTruthy();
    expect(CacheConfigUtils.validateConfig('<xml>foo</xml>').isRight()).toBeTruthy();
    expect(CacheConfigUtils.validateConfig('something').isRight()).toBeTruthy();
  });
});
