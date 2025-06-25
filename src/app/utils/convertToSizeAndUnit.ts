import { MaxSizeUnit } from '@services/infinispanRefData';

/**
 * Converts a size string with unit to separate number and unit
 * Supports: KB, MB, GB, TB (decimal) and KiB, MiB, GiB, TiB (binary)
 * @param maxSize - String containing a number followed by a unit (e.g., "5MB", "1.5GiB", "500KB")
 * @returns Tuple [number, MaxSizeUnit] - The number and corresponding unit
 * @throws Error if the format is invalid
 */
export function convertToSizeAndUnit(maxSize: string | undefined): [number, MaxSizeUnit] {
  // Handle special case for -1 (similar to time functions)
  if (!maxSize || (maxSize && maxSize.trim() === '-1')) {
    return [-1, MaxSizeUnit.KB];
  }

  const match = maxSize.trim().match(/^(\d+(?:\.\d+)?)(KB|MB|GB|TB|KiB|MiB|GiB|TiB)$/i);

  if (!match) {
    throw new Error(`Invalid size format: ${maxSize}. Expected format: number + unit (KB|MB|GB|TB|KiB|MiB|GiB|TiB)`);
  }

  const [, numberStr, unit] = match;
  const number = parseFloat(numberStr);

  if (isNaN(number) || number < 0) {
    throw new Error(`Invalid number in size: ${numberStr}`);
  }

  // Normalize unit case and validate
  const normalizedUnit = unit.toUpperCase();
  let sizeUnit: MaxSizeUnit;

  switch (normalizedUnit) {
    case 'KB':
      sizeUnit = MaxSizeUnit.KB;
      break;
    case 'MB':
      sizeUnit = MaxSizeUnit.MB;
      break;
    case 'GB':
      sizeUnit = MaxSizeUnit.GB;
      break;
    case 'TB':
      sizeUnit = MaxSizeUnit.TB;
      break;
    case 'KIB':
      sizeUnit = MaxSizeUnit.KiB;
      break;
    case 'MIB':
      sizeUnit = MaxSizeUnit.MiB;
      break;
    case 'GIB':
      sizeUnit = MaxSizeUnit.GiB;
      break;
    case 'TIB':
      sizeUnit = MaxSizeUnit.TiB;
      break;
    default:
      throw new Error(`Unknown size unit: ${unit}`);
  }

  return [number, sizeUnit];
}

export function convertToMaxSizeUnit(maxSize?: number, unit?: MaxSizeUnit): string {
  if (!maxSize || !unit) {
    return 'null';
  }
  return maxSize + unit.toString();
}
