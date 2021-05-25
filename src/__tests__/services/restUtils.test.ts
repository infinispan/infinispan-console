import { RestUtils, ContentType} from '@services/restUtils';

describe('RestUtils tests', () => {
  test('from ContentType to string', () => {
    expect(RestUtils.fromContentType(ContentType.StringContentType)).toBe(
      'application/x-java-object;type=java.lang.String'
    );
    expect(RestUtils.fromContentType(ContentType.IntegerContentType)).toBe(
      'application/x-java-object;type=java.lang.Integer'
    );
    expect(RestUtils.fromContentType(ContentType.DoubleContentType)).toBe(
      'application/x-java-object;type=java.lang.Double'
    );
    expect(RestUtils.fromContentType(ContentType.BooleanContentType)).toBe(
      'application/x-java-object;type=java.lang.Boolean'
    );
    expect(RestUtils.fromContentType(ContentType.LongContentType)).toBe(
      'application/x-java-object;type=java.lang.Long'
    );
    expect(RestUtils.fromContentType(ContentType.JSON)).toBe('application/json');
    expect(RestUtils.fromContentType(ContentType.XML)).toBe('application/xml');
  });

  test('from string to ContentType', () => {
    expect(RestUtils.toContentType('unknown')).toBe(ContentType.StringContentType);
    expect(RestUtils.toContentType(null)).toBe(ContentType.StringContentType);
    expect(RestUtils.toContentType(undefined)).toBe(ContentType.StringContentType);
    expect(RestUtils.toContentType(null, ContentType.JSON)).toBe(ContentType.JSON);
    expect(
      RestUtils.toContentType('application/x-java-object;type=java.lang.String')
    ).toBe(ContentType.StringContentType);
    expect(
      RestUtils.toContentType('application/x-java-object;type=java.lang.Long')
    ).toBe(ContentType.LongContentType);
    expect(
      RestUtils.toContentType('application/x-java-object;type=java.lang.Integer')
    ).toBe(ContentType.IntegerContentType);
    expect(
      RestUtils.toContentType('application/x-java-object;type=java.lang.Boolean')
    ).toBe(ContentType.BooleanContentType);
    expect(
      RestUtils.toContentType('application/x-java-object;type=java.lang.Double')
    ).toBe(ContentType.DoubleContentType);
    expect(RestUtils.toContentType('application/json')).toBe(ContentType.JSON);
    expect(RestUtils.toContentType('application/xml')).toBe(ContentType.XML);
  });

  test('from protobuf type to ContentType', () => {
    expect(RestUtils.fromProtobufType('string')).toStrictEqual(ContentType.StringContentType);
    expect(RestUtils.fromProtobufType('float')).toStrictEqual(ContentType.FloatContentType);
    expect(RestUtils.fromProtobufType('double')).toStrictEqual(ContentType.DoubleContentType);
    expect(RestUtils.fromProtobufType('int32')).toStrictEqual(ContentType.IntegerContentType);
    expect(RestUtils.fromProtobufType('int64')).toStrictEqual(ContentType.LongContentType);
    expect(RestUtils.fromProtobufType('uint32')).toStrictEqual(ContentType.IntegerContentType);
    expect(RestUtils.fromProtobufType('uint64')).toStrictEqual(ContentType.LongContentType);
    expect(RestUtils.fromProtobufType('sint32')).toStrictEqual(ContentType.IntegerContentType);
    expect(RestUtils.fromProtobufType('sint64')).toStrictEqual(ContentType.LongContentType);
    expect(RestUtils.fromProtobufType('fixed32')).toStrictEqual(ContentType.IntegerContentType);
    expect(RestUtils.fromProtobufType('fixed64')).toStrictEqual(ContentType.LongContentType);
    expect(RestUtils.fromProtobufType('sfixed32')).toStrictEqual(ContentType.IntegerContentType);
    expect(RestUtils.fromProtobufType('sfixed64')).toStrictEqual(ContentType.LongContentType);
    expect(RestUtils.fromProtobufType('bool')).toStrictEqual(ContentType.BooleanContentType);
  });
});
