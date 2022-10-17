import { ProtobufDataUtils } from '@services/protobufDataUtils';
import { ContentType } from '@services/infinispanRefData';

describe('ProtobufData tests', () => {
  test('from protobuf type to ContentType', () => {
    expect(ProtobufDataUtils.fromProtobufType('string')).toStrictEqual(
      ContentType.string
    );
    expect(ProtobufDataUtils.fromProtobufType('float')).toStrictEqual(
      ContentType.float
    );
    expect(ProtobufDataUtils.fromProtobufType('double')).toStrictEqual(
      ContentType.double
    );
    expect(ProtobufDataUtils.fromProtobufType('int32')).toStrictEqual(
      ContentType.int32
    );
    expect(ProtobufDataUtils.fromProtobufType('int64')).toStrictEqual(
      ContentType.int64
    );
    expect(ProtobufDataUtils.fromProtobufType('uint32')).toStrictEqual(
      ContentType.uint32
    );
    expect(ProtobufDataUtils.fromProtobufType('uint64')).toStrictEqual(
      ContentType.uint64
    );
    expect(ProtobufDataUtils.fromProtobufType('sint32')).toStrictEqual(
      ContentType.sint32
    );
    expect(ProtobufDataUtils.fromProtobufType('sint64')).toStrictEqual(
      ContentType.sint64
    );
    expect(ProtobufDataUtils.fromProtobufType('fixed32')).toStrictEqual(
      ContentType.fixed32
    );
    expect(ProtobufDataUtils.fromProtobufType('fixed64')).toStrictEqual(
      ContentType.fixed64
    );
    expect(ProtobufDataUtils.fromProtobufType('sfixed32')).toStrictEqual(
      ContentType.sfixed32
    );
    expect(ProtobufDataUtils.fromProtobufType('sfixed64')).toStrictEqual(
      ContentType.sfixed64
    );
    expect(ProtobufDataUtils.fromProtobufType('bool')).toStrictEqual(
      ContentType.bool
    );
    expect(ProtobufDataUtils.fromProtobufType('bytes')).toStrictEqual(
      ContentType.bytes
    );
    expect(
      ProtobufDataUtils.fromProtobufType('org.infinispan.Person')
    ).toStrictEqual(ContentType.customType);
  });
});
