import { TimeUnits } from '@services/infinispanRefData';
import { convertToTimeQuantity } from '@utils/convertToTimeQuantity';

describe('Convert to Time Quantity', () => {
  test('from value and unit to time quantity', () => {
    expect(convertToTimeQuantity(23, TimeUnits.milliseconds)).toStrictEqual('23ms');
    expect(convertToTimeQuantity(23, TimeUnits.seconds)).toStrictEqual('23s');
    expect(convertToTimeQuantity(23, TimeUnits.minutes)).toStrictEqual('23m');
    expect(convertToTimeQuantity(23, TimeUnits.hours)).toStrictEqual('23h');
  });
});
