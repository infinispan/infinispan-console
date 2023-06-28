/**
 * Formats a given date string into a friendly age format.
 * The friendly age format includes hours, minutes, and seconds.
 * @param dateString The date string to format.
 * @returns The formatted age string.
 */
export function formatAge(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();

  if (date > now) {
    return ''; // Return an empty string for future dates
  }

  const diff = Math.abs(now.getTime() - date.getTime());

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  let formattedAge = '';

  if (hours > 0) {
    formattedAge += hours + ' hr';
  }

  if (minutes > 0) {
    formattedAge += ' ' + minutes + ' min';
  }

  if (seconds > 0) {
    formattedAge += ' ' + seconds + ' s';
  }

  return formattedAge.trim();
}
