import { CacheRequestResponseMapper } from '@services/cacheRequestResponseMapper';
import { ContentType, EncodingType } from '@services/infinispanRefData';

describe('CacheResponse mapper test', () => {
  test('getEntries empty', () => {
    const data = [];
    let cacheResponseMapper = CacheRequestResponseMapper.toEntries(data, {
      key: EncodingType.JSON,
      value: EncodingType.JSON,
    });
    expect(cacheResponseMapper.length).toBe(0);
  });

  test('getEntries JSON Data', () => {
    const data = [
      {
        key: 1,
        value: 1,
        timeToLiveSeconds: -1,
        maxIdleTimeSeconds: -1,
        created: -1,
        lastUsed: -1,
        expireTime: -1,
      },
      {
        key: 'w',
        value: 'w',
        timeToLiveSeconds: -1,
        maxIdleTimeSeconds: -1,
        created: -1,
        lastUsed: -1,
        expireTime: -1,
      },
      {
        key: { pepe: 'pepe' },
        value: { pepe: 'pepe' },
        timeToLiveSeconds: -1,
        maxIdleTimeSeconds: -1,
        created: -1,
        lastUsed: -1,
        expireTime: -1,
      },
    ];
    let cacheResponseMapper = CacheRequestResponseMapper.toEntries(data, {
      key: EncodingType.JSON,
      value: EncodingType.JSON,
    });
    expect(cacheResponseMapper.length).toBe(3);
  });

  test('getEntries xml', () => {
    const data = [
      {
        key: '<foo>11</foo>',
        value: '<bar>pepe</bar>',
        timeToLiveSeconds: 12,
        maxIdleTimeSeconds: 30,
        created: -1,
        lastUsed: -1,
        expireTime: -1,
      },
    ];
    let cacheResponseMapper = CacheRequestResponseMapper.toEntries(data, {
      key: EncodingType.XML,
      value: EncodingType.XML,
    });
    expect(cacheResponseMapper.length).toBe(1);
    expect(cacheResponseMapper[0].key).toBe('<foo>11</foo>');
    expect(cacheResponseMapper[0].value).toBe('<bar>pepe</bar>');
    expect(cacheResponseMapper[0].timeToLive).toBe('12');
    expect(cacheResponseMapper[0].maxIdle).toBe('30');
  });

  test('toEntry xml', () => {
    const key = '<foo>11</foo>';
    const keyContentType = ContentType.XML;
    const value = '<bar>pepe</bar>';
    const headers = new Headers();
    let cacheEntry = CacheRequestResponseMapper.toEntry(
      key,
      keyContentType,
      { key: EncodingType.XML, value: EncodingType.XML },
      value,
      headers
    );
    expect(cacheEntry.key).toBe(key);
    expect(cacheEntry.keyContentType).toBe(keyContentType);
    expect(cacheEntry.value).toBe(value);
    expect(cacheEntry.valueContentType).toBe(ContentType.XML);
  });

  test('toEntry protobuf basic type', () => {
    const key = 'foo';
    const keyContentType = ContentType.StringContentType;
    const value = JSON.stringify({
      _type: 'string',
      _value: 'bar',
    });
    const headers = new Headers();
    let cacheEntry = CacheRequestResponseMapper.toEntry(
      key,
      keyContentType,
      { key: EncodingType.Protobuf, value: EncodingType.Protobuf },
      value,
      headers
    );
    expect(cacheEntry.key).toBe(key);
    expect(cacheEntry.keyContentType).toBe(keyContentType);
    expect(cacheEntry.value).toBe('bar');
    expect(cacheEntry.valueContentType).toBe(ContentType.string);
  });

  test('toEntry protobuf complex type', () => {
    const key = 'foo';
    const keyContentType = ContentType.string;
    const value = JSON.stringify({
      _type: 'org.infinispan.People',
      name: 'Elaia',
      age: 12,
    });
    const headers = new Headers();
    let cacheEntry = CacheRequestResponseMapper.toEntry(
      key,
      keyContentType,
      { key: EncodingType.Protobuf, value: EncodingType.Protobuf },
      value,
      headers
    );
    expect(cacheEntry.key).toBe(key);
    expect(cacheEntry.keyContentType).toBe(keyContentType);
    expect(cacheEntry.value).toBe(value);
    expect(cacheEntry.valueContentType).toBe(ContentType.customType);
  });

  test('format key or value to call rest api', () => {
    // Json values
    expect(
      CacheRequestResponseMapper.formatContent(
        'foo',
        ContentType.JSON,
        EncodingType.JSON
      ).value
    ).toBe('"foo"');
    expect(
      CacheRequestResponseMapper.formatContent(
        '123',
        ContentType.JSON,
        EncodingType.JSON
      ).value
    ).toBe('123');
    expect(
      CacheRequestResponseMapper.formatContent(
        '"123"',
        ContentType.JSON,
        EncodingType.JSON
      ).value
    ).toBe('"123"');
    expect(
      CacheRequestResponseMapper.formatContent(
        'true',
        ContentType.JSON,
        EncodingType.JSON
      ).value
    ).toBe('true');
    expect(
      CacheRequestResponseMapper.formatContent(
        'false',
        ContentType.JSON,
        EncodingType.JSON
      ).value
    ).toBe('false');
    expect(
      CacheRequestResponseMapper.formatContent(
        '"false"',
        ContentType.JSON,
        EncodingType.JSON
      ).value
    ).toBe('"false"');
    expect(
      CacheRequestResponseMapper.formatContent(
        '"true"',
        ContentType.JSON,
        EncodingType.JSON
      ).value
    ).toBe('"true"');
    expect(
      CacheRequestResponseMapper.formatContent(
        '[]',
        ContentType.JSON,
        EncodingType.JSON
      ).value
    ).toBe('[]');
    expect(
      CacheRequestResponseMapper.formatContent(
        '{}',
        ContentType.JSON,
        EncodingType.JSON
      ).value
    ).toBe('{}');
    expect(
      CacheRequestResponseMapper.formatContent(
        '{llll',
        ContentType.JSON,
        EncodingType.JSON
      ).isLeft()
    ).toBeTruthy();
    // Protobuf values
    expect(
      CacheRequestResponseMapper.formatContent(
        'foo',
        ContentType.string,
        EncodingType.Protobuf
      ).value
    ).toBe('{"_type":"string","_value":"foo"}');
    expect(
      CacheRequestResponseMapper.formatContent(
        'true',
        ContentType.bool,
        EncodingType.Protobuf
      ).value
    ).toBe('{"_type":"bool","_value":true}');
    expect(
      CacheRequestResponseMapper.formatContent(
        'false',
        ContentType.bool,
        EncodingType.Protobuf
      ).value
    ).toBe('{"_type":"bool","_value":false}');
    expect(
      CacheRequestResponseMapper.formatContent(
        '42',
        ContentType.int32,
        EncodingType.Protobuf
      ).value
    ).toBe('{"_type":"int32","_value":"42"}');
    expect(
      CacheRequestResponseMapper.formatContent(
        '42',
        ContentType.int64,
        EncodingType.Protobuf
      ).value
    ).toBe('{"_type":"int64","_value":"42"}');
    expect(
      CacheRequestResponseMapper.formatContent(
        '42',
        ContentType.sint32,
        EncodingType.Protobuf
      ).value
    ).toBe('{"_type":"sint32","_value":"42"}');
    expect(
      CacheRequestResponseMapper.formatContent(
        '42',
        ContentType.sint64,
        EncodingType.Protobuf
      ).value
    ).toBe('{"_type":"sint64","_value":"42"}');
    expect(
      CacheRequestResponseMapper.formatContent(
        '42',
        ContentType.fixed32,
        EncodingType.Protobuf
      ).value
    ).toBe('{"_type":"fixed32","_value":"42"}');
    expect(
      CacheRequestResponseMapper.formatContent(
        '42',
        ContentType.fixed64,
        EncodingType.Protobuf
      ).value
    ).toBe('{"_type":"fixed64","_value":"42"}');
    expect(
      CacheRequestResponseMapper.formatContent(
        'bbbb',
        ContentType.bytes,
        EncodingType.Protobuf
      ).value
    ).toBe('{"_type":"bytes","_value":"bbbb"}');
    expect(
      CacheRequestResponseMapper.formatContent(
        '12.34',
        ContentType.float,
        EncodingType.Protobuf
      ).value
    ).toBe('{"_type":"float","_value":"12.34"}');
    expect(
      CacheRequestResponseMapper.formatContent(
        '42',
        ContentType.sfixed32,
        EncodingType.Protobuf
      ).value
    ).toBe('{"_type":"sfixed32","_value":"42"}');
    expect(
      CacheRequestResponseMapper.formatContent(
        '42',
        ContentType.sfixed64,
        EncodingType.Protobuf
      ).value
    ).toBe('{"_type":"sfixed64","_value":"42"}');
    expect(
      CacheRequestResponseMapper.formatContent(
        '42.99',
        ContentType.double,
        EncodingType.Protobuf
      ).value
    ).toBe('{"_type":"double","_value":"42.99"}');
    expect(
      CacheRequestResponseMapper.formatContent(
        '42',
        ContentType.uint32,
        EncodingType.Protobuf
      ).value
    ).toBe('{"_type":"uint32","_value":"42"}');
    expect(
      CacheRequestResponseMapper.formatContent(
        '42',
        ContentType.uint64,
        EncodingType.Protobuf
      ).value
    ).toBe('{"_type":"uint64","_value":"42"}');
    expect(
      CacheRequestResponseMapper.formatContent(
        '{"_type":"org.infinispan.Person", "name":"Elaia"}',
        ContentType.customType,
        EncodingType.Protobuf
      ).value
    ).toBe('{"_type":"org.infinispan.Person", "name":"Elaia"}');
  });
});
