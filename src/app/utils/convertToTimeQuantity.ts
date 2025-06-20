import { TimeUnits } from '@services/infinispanRefData';

/**
 * Converts a numeric time value with specified unit to milliseconds
 * @param time - The numeric time value
 * @param unit - The time unit
 * @returns The time value converted to milliseconds
 */
export function convertTimeToMilliseconds(time: number, unit: TimeUnits): number {
  if (time < 0 || !Number.isFinite(time)) {
    return -1;
  }

  const conversionFactors: Record<TimeUnits, number> = {
    [TimeUnits.milliseconds]: 1,
    [TimeUnits.seconds]: 1000,
    [TimeUnits.minutes]: 60 * 1000,
    [TimeUnits.hours]: 60 * 60 * 1000,
    [TimeUnits.days]: 24 * 60 * 60 * 1000
  };

  return time * conversionFactors[unit];
}

/**
 * ms (milliseconds), s (seconds), m (minutes), h (hours), d (days)
 * @param time
 * @param format
 */
export function convertToTimeQuantity(time?: number, format?: string): string | undefined {
  if (!time) {
    return undefined;
  }

  let label = '';
  switch (format) {
    case TimeUnits.milliseconds:
      label = 'ms';
      break;
    case TimeUnits.seconds:
      label = 's';
      break;
    case TimeUnits.minutes:
      label = 'm';
      break;
    case TimeUnits.hours:
      label = 'h';
      break;
    case TimeUnits.days:
      label = 'd';
      break;
    default:
      label = 'ms';
  }
  return time + label;
}

/**
 * Converts a time quantity string with unit to separate number and unit
 * Supports: ms (milliseconds), s (seconds), m (minutes), h (hours), d (days)
 * @param timeQuantity - String containing a number followed by a unit (e.g., "5m", "300ms", "2h")
 * @returns Tuple [number, TimeUnits] - The number and corresponding unit
 * @throws Error if the format is invalid
 */
export function convertFromTimeQuantity(timeQuantity: string): [number, TimeUnits] {
  if (!timeQuantity || timeQuantity.length == 0 || timeQuantity.substring(0, 2) == '-1') {
    return [-1, TimeUnits.milliseconds];
  }
  const match = timeQuantity.trim().match(/^(\d+(?:\.\d+)?)(ms|s|m|h|d)$/);

  if (!match) {
    throw new Error(`Invalid time quantity format: ${timeQuantity}. Expected format: number + unit (ms|s|m|h|d)`);
  }

  const [, numberStr, unit] = match;
  const number = parseFloat(numberStr);
  if (isNaN(number)) {
    throw new Error(`Invalid number in time quantity: ${numberStr}`);
  }

  let timeUnit: TimeUnits;
  switch (unit) {
    case 'ms':
      timeUnit = TimeUnits.milliseconds;
      break;
    case 's':
      timeUnit = TimeUnits.seconds;
      break;
    case 'm':
      timeUnit = TimeUnits.minutes;
      break;
    case 'h':
      timeUnit = TimeUnits.hours;
      break;
    case 'd':
      timeUnit = TimeUnits.days;
      break;
    default:
      throw new Error(`Unknown time unit: ${unit}`);
  }
  return [number, timeUnit];
}
