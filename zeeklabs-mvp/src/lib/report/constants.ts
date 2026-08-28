// Report Layer - Constants and Configuration
// Colors, dimensions, labels, and other static values

// ============================================================================
// BRAND COLORS
// ============================================================================

export const COLORS = {
  // Primary brand colors
  primary: '#6366f1',
  primaryLight: '#818cf8',
  primaryDark: '#4f46e5',

  // Score colors
  excellent: '#059669',
  strong: '#10b981',
  moderate: '#d97706',
  developing: '#f59e0b',
  critical: '#dc2626',

  // Sentiment colors
  positive: '#059669',
  neutral: '#6b7280',
  negative: '#dc2626',

  // Platform colors
  chatgpt: '#10b981',
  gemini: '#3b82f6',
  perplexity: '#8b5cf6',

  // UI colors
  text: {
    primary: '#1f2937',
    secondary: '#4b5563',
    muted: '#6b7280',
    light: '#9ca3af',
  },

  // Background colors
  background: {
    white: '#ffffff',
    light: '#f9fafb',
    muted: '#f3f4f6',
    dark: '#1f2937',
  },

  // Border colors
  border: {
    light: '#e5e7eb',
    medium: '#d1d5db',
    dark: '#9ca3af',
  },

  // Action plan colors
  immediate: '#ef4444',
  shortTerm: '#f59e0b',
  longTerm: '#6366f1',
} as const;

// ============================================================================
// DIMENSIONS
// ============================================================================

export const DIMENSIONS = {
  // A4 page dimensions in mm
  page: {
    width: '210mm',
    height: '297mm',
    marginTop: '15mm',
    marginBottom: '20mm',
    marginLeft: '12mm',
    marginRight: '12mm',
  },

  // Content area
  content: {
    width: '186mm', // 210 - 12 - 12
    maxWidth: '186mm',
  },

  // Header/Footer
  header: {
    height: '20mm',
  },
  footer: {
    height: '15mm',
  },
} as const;

// ============================================================================
// LABELS
// ============================================================================

export const LABELS = {
  // Score labels
  scoreLabels: {
    excellent: { min: 80, label: 'Excellent' },
    strong: { min: 60, label: 'Strong' },
    moderate: { min: 40, label: 'Moderate' },
    developing: { min: 20, label: 'Developing' },
    critical: { min: 0, label: 'Critical' },
  },

  // Platform names
  platforms: {
    chatgpt: 'ChatGPT',
    gemini: 'Google Gemini',
    perplexity: 'Perplexity AI',
  },

  // Section titles
  sections: {
    visibility: 'Visibility',
    sentiment: 'Sentiment',
    competitors: 'Competitors',
    recommendations: 'Recommendations',
    progress: 'Progress',
    citations: 'Citations',
    prompts: 'Prompts',
    market: 'Market',
    methodology: 'Methodology',
  },

  // Priority labels
  priority: {
    high: 'High Priority',
    medium: 'Medium Priority',
    low: 'Low Priority',
  },

  // Effort labels
  effort: {
    low: 'Low Effort',
    medium: 'Medium Effort',
    high: 'High Effort',
  },

  // Timeline labels
  timeline: {
    immediate: 'This Week',
    shortTerm: '2-4 Weeks',
    longTerm: 'This Quarter',
  },
} as const;

// ============================================================================
// PROMPT CATEGORIES
// ============================================================================

export const PROMPT_CATEGORIES = {
  visibility: {
    name: 'Visibility',
    color: '#4338ca',
    bgColor: '#eef2ff',
    borderColor: '#c7d2fe',
  },
  comparison: {
    name: 'Comparison',
    color: '#b45309',
    bgColor: '#fef3c7',
    borderColor: '#fde68a',
  },
  sentiment: {
    name: 'Sentiment',
    color: '#be185d',
    bgColor: '#fce7f3',
    borderColor: '#fbcfe8',
  },
  market: {
    name: 'Market',
    color: '#065f46',
    bgColor: '#d1fae5',
    borderColor: '#a7f3d0',
  },
  discovery: {
    name: 'Discovery',
    color: '#1e40af',
    bgColor: '#dbeafe',
    borderColor: '#bfdbfe',
  },
} as const;

// ============================================================================
// CITATION CATEGORIES
// ============================================================================

export const CITATION_CATEGORIES = [
  'Review Platform',
  'Business Directory',
  'Social Media',
  'Tech News',
  'Industry Publication',
  'Knowledge Base',
  'Podcast Directory',
  'Academic',
] as const;

// ============================================================================
// METHODOLOGY CONTENT
// ============================================================================

export const METHODOLOGY_SECTIONS = [
  {
    title: 'Data Collection',
    icon: '🌐',
    color: '#3b82f6',
    items: [
      'Real-time AI platform queries',
      'Multi-provider analysis (ChatGPT, Gemini, Perplexity)',
      'Competitor benchmarking',
      'Industry-specific prompt simulation',
    ],
  },
  {
    title: 'Scoring Formula',
    icon: '📊',
    color: '#8b5cf6',
    items: [
      'Presence Score: 40% weight',
      'Sentiment Score: 25% weight',
      'Position Score: 35% weight',
      'Weighted average calculation',
    ],
  },
  {
    title: 'Analysis Period',
    icon: '📅',
    color: '#10b981',
    items: [
      'Last 7 days of simulation data',
      'Real-time market intelligence',
      'Updated on each analysis run',
      '24-hour analysis cache',
    ],
  },
] as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Strong';
  if (score >= 40) return 'Moderate';
  if (score >= 20) return 'Developing';
  return 'Critical';
}

export function getScoreColor(score: number): string {
  if (score >= 80) return COLORS.excellent;
  if (score >= 60) return COLORS.strong;
  if (score >= 40) return COLORS.moderate;
  if (score >= 20) return COLORS.developing;
  return COLORS.critical;
}

export function getPlatformColor(platform: string): string {
  switch (platform.toLowerCase()) {
    case 'chatgpt':
      return COLORS.chatgpt;
    case 'gemini':
      return COLORS.gemini;
    case 'perplexity':
      return COLORS.perplexity;
    default:
      return COLORS.primary;
  }
}

export function getPriorityColor(priority: 'high' | 'medium' | 'low'): string {
  switch (priority) {
    case 'high':
      return COLORS.critical;
    case 'medium':
      return COLORS.moderate;
    case 'low':
      return COLORS.primary;
  }
}

export function getSentimentColor(sentiment: 'positive' | 'neutral' | 'negative'): string {
  return COLORS[sentiment];
}
