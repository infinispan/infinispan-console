import { TimeUnits } from '@services/infinispanRefData';

/**
 * ms (milliseconds), s (seconds), m (minutes), h (hours), d (days)
 * @param time
 * @param format
 */
export function convertToTimeQuantity(time?: number, format?: string) : string | undefined {
  if (!time) {
    return undefined;
  }

  let label = '';
  switch (format) {
    case TimeUnits.milliseconds: label = 'ms'; break
    case TimeUnits.seconds: label = 's'; break;
    case TimeUnits.minutes: label = 'm'; break;
    case TimeUnits.hours: label = 'h';break;
    case TimeUnits.days: label = 'd';break;
    default: label = 'ms';
  }
  return time + label;
}
