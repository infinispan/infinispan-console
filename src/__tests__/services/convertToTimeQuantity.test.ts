import { TimeUnits } from '@services/infinispanRefData';
import {
  convertFromTimeQuantity,
  convertTimeToMilliseconds,
  convertToTimeQuantity
} from '@utils/convertToTimeQuantity';

describe('Convert from and to Time Quantity - string', () => {
  test('from value and unit to time quantity', () => {
    expect(convertToTimeQuantity(23, TimeUnits.milliseconds)).toStrictEqual('23ms');
    expect(convertToTimeQuantity(23, TimeUnits.seconds)).toStrictEqual('23s');
    expect(convertToTimeQuantity(23, TimeUnits.minutes)).toStrictEqual('23m');
    expect(convertToTimeQuantity(23, TimeUnits.hours)).toStrictEqual('23h');
  });
  test('from time quantity string to value and unit', () => {
    expect(convertFromTimeQuantity('23ms')).toStrictEqual([23, TimeUnits.milliseconds]);
    expect(convertFromTimeQuantity('23s')).toStrictEqual([23, TimeUnits.seconds]);
    expect(convertFromTimeQuantity('23m')).toStrictEqual([23, TimeUnits.minutes]);
    expect(convertFromTimeQuantity('23h')).toStrictEqual([23, TimeUnits.hours]);
    expect(convertFromTimeQuantity('23d')).toStrictEqual([23, TimeUnits.days]);
  });

  test('handles decimal numbers', () => {
    expect(convertFromTimeQuantity('2.5h')).toStrictEqual([2.5, TimeUnits.hours]);
    expect(convertFromTimeQuantity('10.75m')).toStrictEqual([10.75, TimeUnits.minutes]);
    expect(convertFromTimeQuantity('0.5s')).toStrictEqual([0.5, TimeUnits.seconds]);
  });

  test('handles whitespace', () => {
    expect(convertFromTimeQuantity(' 23ms ')).toStrictEqual([23, TimeUnits.milliseconds]);
    expect(convertFromTimeQuantity('  5h  ')).toStrictEqual([5, TimeUnits.hours]);
  });

  test('throws error for invalid formats', () => {
    expect(() => convertFromTimeQuantity('23')).toThrow('Invalid time quantity format');
    expect(() => convertFromTimeQuantity('ms')).toThrow('Invalid time quantity format');
    expect(() => convertFromTimeQuantity('23x')).toThrow('Invalid time quantity format');
    expect(() => convertFromTimeQuantity('abc23ms')).toThrow('Invalid time quantity format');
  });

  test('from value and unit to milliseconds', () => {
    expect(convertTimeToMilliseconds(23, TimeUnits.milliseconds)).toStrictEqual(23);
    expect(convertTimeToMilliseconds(23, TimeUnits.seconds)).toStrictEqual(23000);
    expect(convertTimeToMilliseconds(23, TimeUnits.minutes)).toStrictEqual(1380000);
    expect(convertTimeToMilliseconds(23, TimeUnits.hours)).toStrictEqual(82800000);
    expect(convertTimeToMilliseconds(23, TimeUnits.days)).toStrictEqual(1987200000);
  });

  test('handles invalid numeric inputs', () => {
    expect(convertTimeToMilliseconds(-1, TimeUnits.seconds)).toStrictEqual(-1);
    expect(convertTimeToMilliseconds(NaN, TimeUnits.minutes)).toStrictEqual(-1);
    expect(convertTimeToMilliseconds(Infinity, TimeUnits.hours)).toStrictEqual(-1);
  });
});
