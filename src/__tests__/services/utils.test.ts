import utils, {ContentType} from '@services/utils';

describe('Utils tests', () => {
  test('from ContentType to string', () => {
    expect(utils.fromContentType(ContentType.StringContentType)).toBe(
      'application/x-java-object;type=java.lang.String'
    );
    expect(utils.fromContentType(ContentType.IntegerContentType)).toBe(
      'application/x-java-object;type=java.lang.Integer'
    );
    expect(utils.fromContentType(ContentType.DoubleContentType)).toBe(
      'application/x-java-object;type=java.lang.Double'
    );
    expect(utils.fromContentType(ContentType.BooleanContentType)).toBe(
      'application/x-java-object;type=java.lang.Boolean'
    );
    expect(utils.fromContentType(ContentType.LongContentType)).toBe(
      'application/x-java-object;type=java.lang.Long'
    );
    expect(utils.fromContentType(ContentType.JSON)).toBe('application/json');
    expect(utils.fromContentType(ContentType.XML)).toBe('application/xml');
    expect(utils.fromContentType(ContentType.OctetStream)).toBe(
      'application/octet-stream'
    );
    expect(utils.fromContentType(ContentType.OctetStreamHex)).toBe(
      'application/octet-stream; encoding=hex'
    );
  });

  test('from string to ContentType', () => {
    expect(utils.toContentType('unknown')).toBe(ContentType.StringContentType);
    expect(utils.toContentType(null)).toBe(ContentType.StringContentType);
    expect(utils.toContentType(undefined)).toBe(ContentType.StringContentType);
    expect(utils.toContentType(null, ContentType.JSON)).toBe(ContentType.JSON);
    expect(
      utils.toContentType('application/x-java-object;type=java.lang.String')
    ).toBe(ContentType.StringContentType);
    expect(
      utils.toContentType('application/x-java-object;type=java.lang.Long')
    ).toBe(ContentType.LongContentType);
    expect(
      utils.toContentType('application/x-java-object;type=java.lang.Integer')
    ).toBe(ContentType.IntegerContentType);
    expect(
      utils.toContentType('application/x-java-object;type=java.lang.Boolean')
    ).toBe(ContentType.BooleanContentType);
    expect(
      utils.toContentType('application/x-java-object;type=java.lang.Double')
    ).toBe(ContentType.DoubleContentType);
    expect(utils.toContentType('application/json')).toBe(ContentType.JSON);
    expect(utils.toContentType('application/xml')).toBe(ContentType.XML);
    expect(utils.toContentType('application/octet-stream')).toBe(
      ContentType.OctetStream
    );
    expect(utils.toContentType('application/octet-stream; encoding=hex')).toBe(
      ContentType.OctetStreamHex
    );
  });

  test('is protobuf config', () => {
    let protobufConfigDist =
      '{\n' +
      '  "distributed-cache": {\n' +
      '    "mode": "SYNC",\n' +
      '    "remote-timeout": 17500,\n' +
      '    "state-transfer": {\n' +
      '      "timeout": 60000\n' +
      '    },\n' +
      '    "encoding": {\n' +
      '      "key": {\n' +
      '        "media-type": "application/x-protostream"\n' +
      '      },\n' +
      '      "value": {\n' +
      '        "media-type": "application/x-protostream"\n' +
      '      }\n' +
      '    },\n' +
      '    "statistics": true\n' +
      '  }\n' +
      '}';

    expect(utils.isProtobufCache(protobufConfigDist)).toStrictEqual([
      true,
      true,
    ]);

    let protobufConfigReplicated =
      '{\n' +
      '  "replicated-cache": {\n' +
      '    "mode": "SYNC",\n' +
      '    "remote-timeout": 17500,\n' +
      '    "state-transfer": {\n' +
      '      "timeout": 60000\n' +
      '    },\n' +
      '    "encoding": {\n' +
      '      "key": {\n' +
      '        "media-type": "application/x-protostream"\n' +
      '      },\n' +
      '      "value": {\n' +
      '        "media-type": "application/x-protostream"\n' +
      '      }\n' +
      '    },\n' +
      '    "statistics": true\n' +
      '  }\n' +
      '}';

    expect(utils.isProtobufCache(protobufConfigReplicated)).toStrictEqual([
      true,
      true,
    ]);

    let protobufConfigLocal =
      '{\n' +
      '  "local-cache": {\n' +
      '    "encoding": {\n' +
      '      "key": {\n' +
      '        "media-type": "application/x-protostream"\n' +
      '      },\n' +
      '      "value": {\n' +
      '        "media-type": "application/x-protostream"\n' +
      '      }\n' +
      '    },\n' +
      '    "statistics": true\n' +
      '  }\n' +
      '}';

    expect(utils.isProtobufCache(protobufConfigLocal)).toStrictEqual([
      true,
      true,
    ]);

    let protobufConfigInvalidated =
      '{\n' +
      '  "invalidation-cache": {\n' +
      '    "encoding": {\n' +
      '      "key": {\n' +
      '        "media-type": "application/x-protostream"\n' +
      '      },\n' +
      '      "value": {\n' +
      '        "media-type": "application/x-protostream"\n' +
      '      }\n' +
      '    },\n' +
      '    "statistics": true\n' +
      '  }\n' +
      '}';

    expect(utils.isProtobufCache(protobufConfigInvalidated)).toStrictEqual([
      true,
      true,
    ]);

    let notProtobufKey =
      '{\n' +
      '  "distributed-cache": {\n' +
      '    "mode": "SYNC",\n' +
      '    "encoding": {\n' +
      '      "value": {\n' +
      '        "media-type": "application/x-protostream"\n' +
      '      }\n' +
      '    },\n' +
      '    "statistics": true\n' +
      '  }\n' +
      '}';

    expect(utils.isProtobufCache(notProtobufKey)).toStrictEqual([false, true]);

    let notProtobufValue =
      '{\n' +
      '  "distributed-cache": {\n' +
      '    "mode": "SYNC",\n' +
      '    "encoding": {\n' +
      '      "key": {\n' +
      '        "media-type": "application/x-protostream"\n' +
      '      }\n' +
      '    },\n' +
      '    "statistics": true\n' +
      '  }\n' +
      '}';

    expect(utils.isProtobufCache(notProtobufValue)).toStrictEqual([
      true,
      false,
    ]);

    const notProtobuf =
      '{\n' +
      '  "distributed-cache": {\n' +
      '    "mode": "ASYNC",\n' +
      '    "state-transfer": {\n' +
      '      "timeout": 60000\n' +
      '    }\n' +
      '  }\n' +
      '}';

    expect(utils.isProtobufCache(notProtobuf)).toStrictEqual([false, false]);
  });

  test('from protobuf type to ContentType', () => {
    expect(utils.fromProtobufType('string')).toStrictEqual(ContentType.StringContentType);
    expect(utils.fromProtobufType('float')).toStrictEqual(ContentType.FloatContentType);
    expect(utils.fromProtobufType('double')).toStrictEqual(ContentType.DoubleContentType);
    expect(utils.fromProtobufType('int32')).toStrictEqual(ContentType.IntegerContentType);
    expect(utils.fromProtobufType('int64')).toStrictEqual(ContentType.LongContentType);
    expect(utils.fromProtobufType('uint32')).toStrictEqual(ContentType.IntegerContentType);
    expect(utils.fromProtobufType('uint64')).toStrictEqual(ContentType.LongContentType);
    expect(utils.fromProtobufType('sint32')).toStrictEqual(ContentType.IntegerContentType);
    expect(utils.fromProtobufType('sint64')).toStrictEqual(ContentType.LongContentType);
    expect(utils.fromProtobufType('fixed32')).toStrictEqual(ContentType.IntegerContentType);
    expect(utils.fromProtobufType('fixed64')).toStrictEqual(ContentType.LongContentType);
    expect(utils.fromProtobufType('sfixed32')).toStrictEqual(ContentType.IntegerContentType);
    expect(utils.fromProtobufType('sfixed64')).toStrictEqual(ContentType.LongContentType);
    expect(utils.fromProtobufType('bool')).toStrictEqual(ContentType.BooleanContentType);

  });
});
