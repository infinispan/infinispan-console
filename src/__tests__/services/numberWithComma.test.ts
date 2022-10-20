import { numberWithCommas } from '@app/utils/numberWithComma';

describe('Adding commas to large numbers', () => {
  test('numberWithCommas', () => {
    expect(numberWithCommas(1000)).toBe('1,000');
    expect(numberWithCommas(1000000000000)).toBe('1,000,000,000,000');
    expect(numberWithCommas(1000000000000000000)).toBe('1,000,000,000,000,000,000');
    expect(numberWithCommas(987)).toBe('987');
    expect(numberWithCommas(987.98)).toBe('987.98');
    expect(numberWithCommas(98765)).toBe('98,765');
    expect(numberWithCommas(987654.987654)).toBe('987,654.987654');
  });
});
