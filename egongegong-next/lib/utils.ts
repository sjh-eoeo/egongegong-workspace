/**
 * Format number with thousand separators
 */
export const formatNumber = (num: number | string | undefined | null): string => {
  if (num === undefined || num === null || num === '') return '0';
  const n = typeof num === 'string' ? parseFloat(num.replace(/,/g, '')) : num;
  if (isNaN(n)) return '0';
  return n.toLocaleString('en-US');
};

/**
 * Format currency in USD ($1,234)
 */
export const formatCurrency = (num: number | string | undefined | null): string => {
  if (num === undefined || num === null || num === '') return '$0';
  const n = typeof num === 'string' ? parseFloat(num.replace(/,/g, '')) : num;
  if (isNaN(n)) return '$0';
  return `$${n.toLocaleString('en-US')}`;
};

/**
 * Format currency in KRW (₩1,234)
 */
export const formatKRW = (num: number | string | undefined | null): string => {
  if (num === undefined || num === null || num === '') return '₩0';
  const n = typeof num === 'string' ? parseFloat(num.replace(/,/g, '')) : num;
  if (isNaN(n)) return '₩0';
  return `₩${n.toLocaleString('en-US')}`;
};

/**
 * Format with K/M suffix (1,234 -> 1.2K, 1,234,567 -> 1.2M)
 */
export const formatCompact = (num: number | string | undefined | null): string => {
  if (num === undefined || num === null || num === '') return '0';
  const n = typeof num === 'string' ? parseFloat(num.replace(/,/g, '')) : num;
  if (isNaN(n)) return '0';
  
  if (n >= 1000000) {
    return `${(n / 1000000).toFixed(1)}M`;
  }
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1)}K`;
  }
  return n.toLocaleString('en-US');
};

/**
 * Extract and format numbers from input (for input fields)
 */
export const formatInputNumber = (value: string): string => {
  // Keep only numbers and decimal point
  const numbersOnly = value.replace(/[^\d.]/g, '');
  if (!numbersOnly) return '';
  
  // Handle decimal point
  const parts = numbersOnly.split('.');
  const intPart = parts[0];
  const decPart = parts.length > 1 ? '.' + parts[1] : '';
  
  return parseInt(intPart || '0').toLocaleString('en-US') + decPart;
};

/**
 * Extract raw number from formatted string
 */
export const parseFormattedNumber = (value: string): number => {
  const cleaned = value.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
};
