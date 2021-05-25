import {
  CacheConfigUtils,
  Distributed,
  EncodingType,
  Invalidated,
  Local,
  Replicated,
  Scattered
} from "@services/cacheConfigUtils";

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
      EncodingType.Java];

    for (let cacheType of cacheTypes) {
      let cacheTypeConf = baseConfig.replace('CACHE_TYPE', cacheType);
      for (let encoding of encodings) {
        let config = JSON.parse(cacheTypeConf
          .replace('KEY_TYPE', encoding)
          .replace('VALUE_TYPE', encoding)
        );
        expect(CacheConfigUtils.mapEncoding(config)).toStrictEqual([encoding, encoding]);
      }
    }
  });

  test('editable', () => {
    expect(CacheConfigUtils.isEditable(EncodingType.Protobuf)).toBeTruthy();
    expect(CacheConfigUtils.isEditable(EncodingType.XML)).toBeTruthy();
    expect(CacheConfigUtils.isEditable(EncodingType.Text)).toBeTruthy();
    expect(CacheConfigUtils.isEditable(EncodingType.JSON)).toBeTruthy();
    expect(CacheConfigUtils.isEditable(EncodingType.Java)).toBeTruthy()
    expect(CacheConfigUtils.isEditable(EncodingType.Empty)).toBeFalsy();
  })
});
