// Report Layer - Formatting Utilities
// Number, date, score, and text formatting functions

// ============================================================================
// NUMBER FORMATTING
// ============================================================================

/**
 * Format a number with comma separators
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Format a number as percentage
 */
export function formatPercent(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a number with sign (+ or -)
 */
export function formatWithSign(value: number, decimals: number = 1): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}`;
}

/**
 * Format a delta value with sign and percentage
 */
export function formatDelta(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * Format a score value (0-100)
 */
export function formatScore(value: number): string {
  return Math.round(value).toString();
}

/**
 * Format a position (e.g., #1, #2)
 */
export function formatPosition(value: number | null): string {
  if (value === null || value === undefined) return '-';
  return `#${value.toFixed(1)}`;
}

/**
 * Format a rank (01, 02, etc.)
 */
export function formatRank(value: number): string {
  return String(value).padStart(2, '0');
}

// ============================================================================
// DATE FORMATTING
// ============================================================================

/**
 * Format date as "Month DD, YYYY"
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format date as "MMM YYYY - MMM YYYY"
 */
export function formatDateRange(startDate: string | Date, endDate: string | Date): string {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  const startStr = start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const endStr = end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return `${startStr} - ${endStr}`;
}

/**
 * Format date as "MMM DD"
 */
export function formatShortDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get current date formatted
 */
export function getCurrentDate(): string {
  return formatDate(new Date());
}

/**
 * Get current year
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

// ============================================================================
// TEXT FORMATTING
// ============================================================================

/**
 * Truncate text to max length with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Convert to title case
 */
export function toTitleCase(text: string): string {
  if (!text) return '';
  return text
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Remove markdown bold markers
 */
export function stripMarkdown(text: string): string {
  if (!text) return '';
  return text.replace(/\*\*/g, '').replace(/\*/g, '');
}

/**
 * Format brand name for display
 */
export function formatBrandName(name: string): string {
  if (!name) return 'Brand';
  return name.trim();
}

// ============================================================================
// SCORE FORMATTING
// ============================================================================

/**
 * Get score label based on value
 */
export function getScoreLabel(score: number): 'Excellent' | 'Strong' | 'Moderate' | 'Developing' | 'Critical' {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Strong';
  if (score >= 40) return 'Moderate';
  if (score >= 20) return 'Developing';
  return 'Critical';
}

/**
 * Format trend value with appropriate label
 */
export function formatTrend(value: number | null, label: string = 'change'): string {
  if (value === null || value === undefined) return 'No data';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}% ${label}`;
}

/**
 * Get trend direction
 */
export function getTrendDirection(value: number | null): 'up' | 'down' | 'stable' {
  if (value === null || value === undefined) return 'stable';
  if (value > 0.5) return 'up';
  if (value < -0.5) return 'down';
  return 'stable';
}

// ============================================================================
// CALCULATION HELPERS
// ============================================================================

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Calculate delta between two values
 */
export function calculateDelta(current: number, previous: number): number {
  return current - previous;
}

/**
 * Calculate percentage change
 */
export function calculatePercentChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// ============================================================================
// PLATFORM HELPERS
// ============================================================================

/**
 * Get platform display name
 */
export function getPlatformDisplayName(platform: string): string {
  switch (platform.toLowerCase()) {
    case 'chatgpt':
      return 'ChatGPT (GPT-4)';
    case 'gemini':
      return 'Google Gemini';
    case 'perplexity':
      return 'Perplexity AI';
    default:
      return platform;
  }
}

/**
 * Get platform icon emoji
 */
export function getPlatformIcon(platform: string): string {
  switch (platform.toLowerCase()) {
    case 'chatgpt':
      return '💬';
    case 'gemini':
      return '✨';
    case 'perplexity':
      return '🔍';
    default:
      return '🤖';
  }
}

// ============================================================================
// PRIORITY/EFFORT HELPERS
// ============================================================================

/**
 * Get priority display text
 */
export function getPriorityLabel(priority: 'high' | 'medium' | 'low'): string {
  switch (priority) {
    case 'high':
      return 'High Priority';
    case 'medium':
      return 'Medium Priority';
    case 'low':
      return 'Low Priority';
  }
}

/**
 * Get effort display text
 */
export function getEffortLabel(effort: 'low' | 'medium' | 'high'): string {
  switch (effort) {
    case 'low':
      return 'Low Effort';
    case 'medium':
      return 'Medium Effort';
    case 'high':
      return 'High Effort';
  }
}
