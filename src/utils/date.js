// ─────────────────────────────────────────
//  DATE UTILITIES
// ─────────────────────────────────────────

/**
 * Format a date to a readable string
 * @param {string|Date} date
 * @param {Object} options - Intl.DateTimeFormat options
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d)) return '';
  const defaults = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Intl.DateTimeFormat('en-US', { ...defaults, ...options }).format(d);
};

/**
 * Format date as short: Jan 5, 2024
 */
export const formatShort = (date) =>
  formatDate(date, { year: 'numeric', month: 'short', day: 'numeric' });

/**
 * Format date as numeric: 01/05/2024
 */
export const formatNumeric = (date) =>
  formatDate(date, { year: 'numeric', month: '2-digit', day: '2-digit' });

/**
 * Format date with time: Jan 5, 2024, 3:45 PM
 */
export const formatDateTime = (date) =>
  formatDate(date, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

/**
 * Relative time: "2 hours ago", "3 days ago"
 * @param {string|Date} date
 */
export const timeAgo = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d)) return '';
  const seconds = Math.floor((Date.now() - d) / 1000);

  const intervals = [
    { label: 'year',   secs: 31536000 },
    { label: 'month',  secs: 2592000  },
    { label: 'week',   secs: 604800   },
    { label: 'day',    secs: 86400    },
    { label: 'hour',   secs: 3600     },
    { label: 'minute', secs: 60       },
  ];

  for (const { label, secs } of intervals) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) return `${count} ${label}${count > 1 ? 's' : ''} ago`;
  }
  return 'just now';
};

/**
 * Return ISO date string (for API calls)
 */
export const toISO = (date) => new Date(date).toISOString();

/**
 * Check if a date is in the past
 */
export const isPast = (date) => new Date(date) < new Date();

/**
 * Format reading time from word count
 * @param {string} content
 */
export const readingTime = (content) => {
  if (!content) return '1 min read';
  const words = content.trim().split(/\s+/).length;
  const mins  = Math.ceil(words / 200);
  return `${mins} min read`;
};