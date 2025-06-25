import { convertToSizeAndUnit } from '@app/utils/convertToSizeAndUnit';
import { MaxSizeUnit } from '@services/infinispanRefData';

describe('Convert to Size and Unit', () => {
  test('from size quantity string to value and unit - decimal units', () => {
    expect(convertToSizeAndUnit('23KB')).toStrictEqual([23, MaxSizeUnit.KB]);
    expect(convertToSizeAndUnit('23MB')).toStrictEqual([23, MaxSizeUnit.MB]);
    expect(convertToSizeAndUnit('23GB')).toStrictEqual([23, MaxSizeUnit.GB]);
    expect(convertToSizeAndUnit('23TB')).toStrictEqual([23, MaxSizeUnit.TB]);
  });

  test('from size quantity string to value and unit - binary units', () => {
    expect(convertToSizeAndUnit('23KiB')).toStrictEqual([23, MaxSizeUnit.KiB]);
    expect(convertToSizeAndUnit('23MiB')).toStrictEqual([23, MaxSizeUnit.MiB]);
    expect(convertToSizeAndUnit('23GiB')).toStrictEqual([23, MaxSizeUnit.GiB]);
    expect(convertToSizeAndUnit('23TiB')).toStrictEqual([23, MaxSizeUnit.TiB]);
  });

  test('handles decimal numbers', () => {
    expect(convertToSizeAndUnit('2.5MB')).toStrictEqual([2.5, MaxSizeUnit.MB]);
    expect(convertToSizeAndUnit('10.75GiB')).toStrictEqual([10.75, MaxSizeUnit.GiB]);
    expect(convertToSizeAndUnit('0.5TB')).toStrictEqual([0.5, MaxSizeUnit.TB]);
  });

  test('handles case insensitive units', () => {
    expect(convertToSizeAndUnit('23mb')).toStrictEqual([23, MaxSizeUnit.MB]);
    expect(convertToSizeAndUnit('5GB')).toStrictEqual([5, MaxSizeUnit.GB]);
    expect(convertToSizeAndUnit('1kib')).toStrictEqual([1, MaxSizeUnit.KiB]);
    expect(convertToSizeAndUnit('2MIB')).toStrictEqual([2, MaxSizeUnit.MiB]);
  });

  test('handles whitespace', () => {
    expect(convertToSizeAndUnit(' 23MB ')).toStrictEqual([23, MaxSizeUnit.MB]);
    expect(convertToSizeAndUnit('  5GiB  ')).toStrictEqual([5, MaxSizeUnit.GiB]);
  });

  test('handles special case -1', () => {
    expect(convertToSizeAndUnit('-1')).toStrictEqual([-1, MaxSizeUnit.KB]);
    expect(convertToSizeAndUnit(' -1 ')).toStrictEqual([-1, MaxSizeUnit.KB]);
  });

  test('throws error for invalid formats', () => {
    expect(() => convertToSizeAndUnit('23')).toThrow('Invalid size format');
    expect(() => convertToSizeAndUnit('MB')).toThrow('Invalid size format');
    expect(() => convertToSizeAndUnit('23XX')).toThrow('Invalid size format');
    expect(() => convertToSizeAndUnit('abc23MB')).toThrow('Invalid size format');
  });

  test('throws error for negative numbers', () => {
    expect(() => convertToSizeAndUnit('-5MB')).toThrow('Invalid size format');
    expect(() => convertToSizeAndUnit('-10.5GB')).toThrow('Invalid size format');
  });

  test('throws error for unknown units', () => {
    expect(() => convertToSizeAndUnit('23PB')).toThrow('Invalid size format');
    expect(() => convertToSizeAndUnit('5XB')).toThrow('Invalid size format');
  });
});
