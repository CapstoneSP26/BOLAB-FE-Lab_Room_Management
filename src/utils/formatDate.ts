/**
 * Format date utility for consistent date formatting across the application
 */

/**
 * Format a date string to a human-readable format
 * @param dateStr - ISO 8601 date string (YYYY-MM-DD) or Date object
 * @param format - Output format pattern
 * @returns Formatted date string
 */
export const formatDate = (dateStr: string | Date, format: string = 'MMM DD, YYYY'): string => {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;

  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthsShort = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const dayOfWeek = date.getDay();

  // Replace tokens with values (from longest to shortest to avoid conflicts)
  let formatted = format;
  
  // Year
  formatted = formatted.replace('YYYY', year.toString());
  formatted = formatted.replace('YY', year.toString().slice(-2));
  
  // Month (replace longest first)
  formatted = formatted.replace('MMMM', months[month]);
  formatted = formatted.replace('MMM', monthsShort[month]);
  formatted = formatted.replace('MM', (month + 1).toString().padStart(2, '0'));
  // Don't replace single 'M' as it conflicts with month abbreviations
  
  // Day (replace longest first)
  formatted = formatted.replace('dddd', days[dayOfWeek]);
  formatted = formatted.replace('ddd', daysShort[dayOfWeek]);
  formatted = formatted.replace('DD', day.toString().padStart(2, '0'));
  // Don't replace single 'D' to avoid conflicts

  return formatted;
};

/**
 * Format a time string (HH:mm) to 12-hour format
 */
export const formatTime12Hour = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Get relative time string (e.g., "2 hours ago", "in 3 days")
 */
export const getRelativeTime = (dateStr: string | Date): string => {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  
  return formatDate(date, 'MMM DD, YYYY');
};
