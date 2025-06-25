/**
 * Validates if a string represents a valid positive number (integer or decimal)
 * Supports: integers (1, 23, 100) and decimals (1.5, 2.75, 0.5)
 * @param test - String to validate as a number
 * @param integerOnly - If true, only accepts integers (no decimals)
 * @returns Tuple ['success' | 'error', number] - Status and parsed number (or -1 on error)
 */
export function validateNumber(test: string, integerOnly: boolean = false): ['success' | 'error', number] {
  // Choose regex based on integerOnly parameter
  const regex = integerOnly ? /^\d+$/ : /^\d+(\.\d+)?$/;

  if (regex.test(test)) {
    const number = parseFloat(test);
    if (number > 0 && Number.isFinite(number)) {
      return ['success', number];
    }
  }
  return ['error', -1];
}
