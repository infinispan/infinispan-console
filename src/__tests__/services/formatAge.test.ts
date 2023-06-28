import { formatAge } from '@app/utils/formatAge';

describe('formatAge', () => {
  test('should return the formatted age in hours, minutes, and seconds', () => {
    const currentTimestamp = new Date().getTime();

    // Mock the current date to be 5 hours, 30 minutes, and 45 seconds ahead of the input date
    const inputTimestamp = currentTimestamp - (5 * 60 * 60 * 1000 + 30 * 60 * 1000 + 45 * 1000);
    const expectedOutput = '5 hr 30 min 45 s';

    expect(formatAge(new Date(inputTimestamp).toISOString())).toEqual(expectedOutput);
  });

  test('should return only the formatted age in minutes and seconds', () => {
    const currentTimestamp = new Date().getTime();

    // Mock the current date to be 3 minutes and 20 seconds ahead of the input date
    const inputTimestamp = currentTimestamp - (3 * 60 * 1000 + 20 * 1000);
    const expectedOutput = '3 min 20 s';

    expect(formatAge(new Date(inputTimestamp).toISOString())).toEqual(expectedOutput);
  });

  test('should return only the formatted age in seconds', () => {
    const currentTimestamp = new Date().getTime();

    // Mock the current date to be 15 seconds ahead of the input date
    const inputTimestamp = currentTimestamp - 15 * 1000;
    const expectedOutput = '15 s';

    expect(formatAge(new Date(inputTimestamp).toISOString())).toEqual(expectedOutput);
  });

  test('should return an empty string for future dates', () => {
    const currentTimestamp = new Date().getTime();

    // Mock the input date to be 10 minutes ahead of the current date
    const inputTimestamp = currentTimestamp + 10 * 60 * 1000;
    console.log('inputTimestamp', inputTimestamp);
    const expectedOutput = '';

    expect(formatAge(new Date(inputTimestamp).toISOString())).toEqual(expectedOutput);
  });
});
