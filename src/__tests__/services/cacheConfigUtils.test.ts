import {
  CacheConfigUtils,
  Distributed,
  Invalidated,
  Local,
  Replicated,
  Scattered
} from "@services/cacheConfigUtils";
import {ContentType, EncodingType} from "@services/infinispanRefData";

describe('Cache Config Utils tests', () => {
  test('cache topology', () => {
    let distributed =
      '{\n' +
      '  "distributed-cache": {\n' +
      '  }\n' +
      '}';

    expect(CacheConfigUtils.mapCacheType(JSON.parse(distributed))).toBe('Distributed');

    let replicated =
      '{\n' +
      '  "replicated-cache": {\n' +
      '  }\n' +
      '}';

    expect(CacheConfigUtils.mapCacheType(JSON.parse(replicated))).toBe('Replicated');

    expect(CacheConfigUtils.mapCacheType(Distributed)).toBe('Distributed');
    expect(CacheConfigUtils.mapCacheType(Replicated)).toBe('Replicated');
    expect(CacheConfigUtils.mapCacheType(Local)).toBe('Local');
    expect(CacheConfigUtils.mapCacheType(Invalidated)).toBe('Invalidated');
    expect(CacheConfigUtils.mapCacheType(Scattered)).toBe('Scattered');
  });

  test('cache encoding', () => {
    let baseConfig =
      '{\n' +
      '  "CACHE_TYPE": {\n' +
      '    "encoding": {\n' +
      '      "key": {\n' +
      '        "media-type": "KEY_TYPE"\n' +
      '      },\n' +
      '      "value": {\n' +
      '        "media-type": "VALUE_TYPE"\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '}';

    let cacheTypes = [Distributed, Replicated];
    let encodings = [EncodingType.JSON,
      EncodingType.XML,
      EncodingType.Text,
      EncodingType.Protobuf,
      EncodingType.Java,
      EncodingType.JavaSerialized,
      EncodingType.JBoss,
      EncodingType.Octet
    ];

    for (let cacheType of cacheTypes) {
      let cacheTypeConf = baseConfig.replace('CACHE_TYPE', cacheType);
      for (let encoding of encodings) {
        let config = JSON.parse(cacheTypeConf
          .replace('KEY_TYPE', encoding)
          .replace('VALUE_TYPE', encoding)
        );
        expect(CacheConfigUtils.mapEncoding(config)).toStrictEqual({key: encoding, value: encoding});
      }
    }
  });

  test('editable', () => {
    expect(CacheConfigUtils.isEditable(EncodingType.Protobuf)).toBeTruthy();
    expect(CacheConfigUtils.isEditable(EncodingType.JBoss)).toBeTruthy();
    expect(CacheConfigUtils.isEditable(EncodingType.XML)).toBeTruthy();
    expect(CacheConfigUtils.isEditable(EncodingType.Text)).toBeTruthy();
    expect(CacheConfigUtils.isEditable(EncodingType.JSON)).toBeTruthy();
    expect(CacheConfigUtils.isEditable(EncodingType.Java)).toBeTruthy()
    expect(CacheConfigUtils.isEditable(EncodingType.JavaSerialized)).toBeFalsy();
    expect(CacheConfigUtils.isEditable(EncodingType.Octet)).toBeFalsy();
    expect(CacheConfigUtils.isEditable(EncodingType.Empty)).toBeFalsy();
  });

  test('content types depending on encoding', () => {
    expect(CacheConfigUtils.getContentTypeOptions(EncodingType.Text)).toStrictEqual([ContentType.StringContentType]);
    expect(CacheConfigUtils.getContentTypeOptions(EncodingType.JSON)).toStrictEqual([ContentType.JSON]);
    expect(CacheConfigUtils.getContentTypeOptions(EncodingType.XML)).toStrictEqual([ContentType.XML]);
    const javaContentTypes = [ContentType.StringContentType,
      ContentType.IntegerContentType,
      ContentType.LongContentType,
      ContentType.FloatContentType,
      ContentType.DoubleContentType,
      ContentType.BooleanContentType,
      ContentType.JSON,
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
