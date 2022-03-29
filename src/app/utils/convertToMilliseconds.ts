import { TimeUnits } from '@services/infinispanRefData';

export function convertToMilliseconds(time: number, format: string) {
  if (format === TimeUnits.seconds) {
    return time * 1000;
  } else if (format === TimeUnits.minutes) {
    return time * 1000 * 60;
  } else if (format === TimeUnits.hours) {
    return time * 1000 * 60 * 60;
  } else {
    return time;
  }
}
