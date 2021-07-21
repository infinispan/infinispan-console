import { ContentTypeHeaderMapper} from '@services/contentTypeHeaderMapper';
import {ContentType} from "@services/infinispanRefData";

describe('Encoding Utility tests', () => {
  test('from ContentType to string', () => {
    expect(ContentTypeHeaderMapper.fromContentType(ContentType.StringContentType)).toBe(
      'application/x-java-object;type=java.lang.String'
    );
    expect(ContentTypeHeaderMapper.fromContentType(ContentType.IntegerContentType)).toBe(
      'application/x-java-object;type=java.lang.Integer'
    );
    expect(ContentTypeHeaderMapper.fromContentType(ContentType.DoubleContentType)).toBe(
      'application/x-java-object;type=java.lang.Double'
    );
    expect(ContentTypeHeaderMapper.fromContentType(ContentType.BooleanContentType)).toBe(
      'application/x-java-object;type=java.lang.Boolean'
    );
    expect(ContentTypeHeaderMapper.fromContentType(ContentType.LongContentType)).toBe(
      'application/x-java-object;type=java.lang.Long'
    );
    expect(ContentTypeHeaderMapper.fromContentType(ContentType.FloatContentType)).toBe(
      'application/x-java-object;type=java.lang.Float'
    );
    expect(ContentTypeHeaderMapper.fromContentType(ContentType.JSON)).toBe('application/json');
    expect(ContentTypeHeaderMapper.fromContentType(ContentType.XML)).toBe('application/xml');
  });

  test('from string to ContentType', () => {
    expect(ContentTypeHeaderMapper.toContentType('unknown')).toBe(ContentType.StringContentType);
    expect(ContentTypeHeaderMapper.toContentType(null)).toBe(ContentType.StringContentType);
    expect(ContentTypeHeaderMapper.toContentType(undefined)).toBe(ContentType.StringContentType);
    expect(ContentTypeHeaderMapper.toContentType(null, ContentType.JSON)).toBe(ContentType.JSON);
    expect(
      ContentTypeHeaderMapper.toContentType('application/x-java-object;type=java.lang.String')
    ).toBe(ContentType.StringContentType);
    expect(
      ContentTypeHeaderMapper.toContentType('application/x-java-object;type=java.lang.Long')
    ).toBe(ContentType.LongContentType);
    expect(
      ContentTypeHeaderMapper.toContentType('application/x-java-object;type=java.lang.Integer')
    ).toBe(ContentType.IntegerContentType);
    expect(
      ContentTypeHeaderMapper.toContentType('application/x-java-object;type=java.lang.Boolean')
    ).toBe(ContentType.BooleanContentType);
    expect(
      ContentTypeHeaderMapper.toContentType('application/x-java-object;type=java.lang.Double')
    ).toBe(ContentType.DoubleContentType);
    expect(ContentTypeHeaderMapper.toContentType('application/json')).toBe(ContentType.JSON);
    expect(ContentTypeHeaderMapper.toContentType('application/xml')).toBe(ContentType.XML);
  });
});
