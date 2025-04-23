/**
 * Utility functions for date handling and formatting in the analytics components
 */

/**
 * Format a date string to a readable format
 * @param dateString - ISO date string
 * @param includeTime - Whether to include time in the output
 * @returns Formatted date string
 */
export function formatDate(dateString: string | null | undefined, includeTime: boolean = false): string {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return 'Invalid date';
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(includeTime && { hour: '2-digit', minute: '2-digit' })
  };
  
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

/**
 * Format a date for displaying in charts
 * @param dateString - ISO date string
 * @returns Formatted date string for charts
 */
export function formatChartDate(dateString: string): string {
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return 'Invalid';
  
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

/**
 * Get a relative time string (e.g., "2 days ago")
 * @param dateString - ISO date string
 * @returns Relative time string
 */
export function getRelativeTimeString(dateString: string | null | undefined): string {
  if (!dateString) return 'Never';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return 'Invalid date';
  
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInSecs < 60) {
    return 'Just now';
  } else if (diffInMins < 60) {
    return `${diffInMins} minute${diffInMins > 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  } else {
    return formatDate(dateString, false);
  }
}

/**
 * Get date range for different time periods
 * @param period - Period identifier (e.g., 'today', 'last7days')
 * @returns Object with startDate and endDate
 */
export function getDateRangeForPeriod(period: string): { startDate: Date, endDate: Date } {
  const now = new Date();
  const startDate = new Date();
  const endDate = new Date();
  
  switch (period) {
    case 'today':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'yesterday':
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(endDate.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'last7days':
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'last30days':
      startDate.setDate(startDate.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'thisMonth':
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'lastMonth':
      startDate.setMonth(startDate.getMonth() - 1);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(0); // Last day of previous month
      endDate.setHours(23, 59, 59, 999);
      break;
    default:
      startDate.setDate(startDate.getDate() - 30); // Default to last 30 days
      startDate.setHours(0, 0, 0, 0);
  }
  
  return { startDate, endDate };
}

/**
 * Format currency values
 * @param value - Numeric value to format as currency
 * @returns Formatted currency string
 */
export function formatCurrency(value: string | number): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
}

/**
 * Format large numbers with K/M suffix
 * @param value - Numeric value to format
 * @returns Formatted number string
 */
export function formatLargeNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}