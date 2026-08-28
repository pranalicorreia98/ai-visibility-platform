// Report Layer - TypeScript Type Definitions
// These types define the ViewModel structure for the report rendering layer

// ============================================================================
// CORE TYPES
// ============================================================================

export interface ReportViewModel {
  meta: ReportMeta;
  executive: ExecutiveSummaryData;
  sentiment: SentimentData;
  competitors: CompetitorData;
  progress: ProgressData;
  actionPlan: ActionPlanData;
  citations: CitationData;
  strategicPosition: StrategicPositionData;
  platformPerformance: PlatformPerformanceData;
  prompts: PromptsData;
  marketIntelligence: MarketIntelligenceData;
  methodology: MethodologyData;
}

// ============================================================================
// META DATA
// ============================================================================

export interface ReportMeta {
  brandName: string;
  brandDomain?: string;
  brandLogo?: string;
  reportDate: string;
  period: string;
  generatedAt: string;
  confidential: boolean;
  totalPages: number;
}

// ============================================================================
// PAGE 2: EXECUTIVE SUMMARY
// ============================================================================

export interface ExecutiveSummaryData {
  overallScore: number;
  scoreLabel: ScoreLabel;
  scoreColor: string;
  platforms: PlatformMetrics;
  totalMentions: number;
  mentionTrend: number | null;
  frequency: number;
  frequencyTrend: number | null;
  position: number | null;
  positionTrend: number | null;
  strategicInsight: string;
  benchmarks: BenchmarkMetric[];
}

export interface PlatformMetrics {
  chatgpt: PlatformScore;
  gemini: PlatformScore;
  perplexity: PlatformScore;
}

export interface PlatformScore {
  score: number;
  mentions: number;
  color: string;
}

export interface BenchmarkMetric {
  label: string;
  value: string;
  industryAvg: string;
  delta: number;
  deltaFormatted: string;
  isPositive: boolean;
}

export type ScoreLabel = 'Excellent' | 'Strong' | 'Moderate' | 'Developing' | 'Critical';

// ============================================================================
// PAGE 3: SENTIMENT
// ============================================================================

export interface SentimentData {
  overallScore: number;
  scoreLabel: string;
  breakdown: SentimentBreakdown;
  byPlatform: PlatformSentiment[];
  positiveThemes: ThemeItem[];
  negativeThemes: ThemeItem[];
  neutralThemes: string[];
  customerSatisfaction?: number;
  nps?: string;
}

export interface SentimentBreakdown {
  positive: number;
  neutral: number;
  negative: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  total: number;
}

export interface PlatformSentiment {
  platform: string;
  icon: string;
  positive: number;
  neutral: number;
  negative: number;
}

export interface ThemeItem {
  theme: string;
  description?: string;
}

// ============================================================================
// PAGE 4: COMPETITORS
// ============================================================================

export interface CompetitorData {
  ranking: RankingItem[];
  yourRank: number;
  totalCompetitors: number;
  marketLeaderGap: number;
  marketLeaderName: string;
  executiveSummary: string;
  growthTrajectory: string;
  comparison: CompetitorComparison[];
  matrix: ComparisonMatrix;
  insights: CompetitorInsights;
}

export interface RankingItem {
  rank: number;
  name: string;
  score: number;
  isYou: boolean;
  scoreLabel?: string;
}

export interface CompetitorComparison {
  name: string;
  subtitle?: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  marketShare: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface ComparisonMatrix {
  metrics: MatrixMetric[];
  brands: string[];
}

export interface MatrixMetric {
  label: string;
  values: { brand: string; value: string; isTarget: boolean }[];
}

export interface CompetitorInsights {
  growthVector: InsightCard;
  trustDeficit: InsightCard;
  competitiveRadar: InsightCard;
}

export interface InsightCard {
  title: string;
  description: string;
  color: 'purple' | 'gray' | 'amber' | 'blue' | 'green' | 'red';
}

// ============================================================================
// PAGE 5: PROGRESS
// ============================================================================

export interface ProgressData {
  hasData: boolean;
  dataPoints: ProgressDataPoint[];
  currentScore: number;
  previousScore: number;
  change: number;
  changeFormatted: string;
  avgScore: number;
  totalSnapshots: number;
  trend: 'up' | 'down' | 'stable';
  periodLabel: string;
}

export interface ProgressDataPoint {
  date: string;
  dateFormatted: string;
  score: number;
}

// ============================================================================
// PAGE 6: ACTION PLAN
// ============================================================================

export interface ActionPlanData {
  potentialGain: number;
  currentScore: number;
  targetScore: number;
  maxScore: number;
  immediate: ActionCategory;
  shortTerm: ActionCategory;
  longTerm: ActionCategory;
  competitive: ActionItem[];
  impactSummary: string;
  implementationWeeks: number;
  confidence: number;
}

export interface ActionCategory {
  title: string;
  subtitle: string;
  color: string;
  icon: string;
  items: ActionItem[];
  potentialPoints: number;
}

export interface ActionItem {
  category: string;
  title: string;
  description: string;
  icon?: string;
  priority?: 'high' | 'medium' | 'low';
}

// ============================================================================
// PAGE 7: CITATIONS
// ============================================================================

export interface CitationData {
  totalOpportunities: number;
  opportunities: CitationOpportunity[];
  byCategory: CitationCategorySummary[];
  prioritySummary: {
    high: number;
    medium: number;
    low: number;
  };
}

export interface CitationOpportunity {
  source: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  status: string;
  recommendation: string;
  url?: string;
}

export interface CitationCategorySummary {
  category: string;
  count: number;
  highPriority: number;
}

// ============================================================================
// PAGE 4: PLATFORM PERFORMANCE (replaces Strategic Position)
// ============================================================================

export interface PlatformPerformanceData {
  // Score breakdown with weights
  scoreBreakdown: {
    presence: number;
    sentiment: number;
    position: number;
    weights: {
      presence: number;
      sentiment: number;
      position: number;
    };
  };
  // Per-platform performance
  platforms: PlatformDetail[];
  // Position distribution
  positionDistribution: {
    chatgpt: PositionDistributionItem;
    gemini: PositionDistributionItem;
    perplexity: PositionDistributionItem;
  };
  // Overall metrics
  totalSimulations: number;
  organicSimulations: number;
  mentionRate: number;
  // Insights
  strongestPlatform: string;
  weakestPlatform: string;
  performanceSummary: string;
}

export interface PlatformDetail {
  name: string;
  icon: string;
  score: number;
  mentions: number;
  avgPosition: number | null;
  color: string;
  trend: 'up' | 'down' | 'stable';
}

export interface PositionDistributionItem {
  top3: number;
  top5: number;
  beyond5: number;
}

// Legacy: Keep for backward compatibility
export interface StrategicPositionData {
  competitorMentionGap: string;
  mentionFrequency: string;
  typicalPosition: number | null;
  recommendationLikelihood: string;
  keyFocusAreas: FocusArea[];
  positionSummary: string;
  badges: PositionBadge[];
}

export interface FocusArea {
  rank: number;
  area: string;
  description?: string;
}

export interface PositionBadge {
  label: string;
  value: string;
  color: string;
}

// ============================================================================
// PAGE 9: PROMPTS
// ============================================================================

export interface PromptsData {
  totalPrompts: number;
  byCategory: PromptCategory[];
}

export interface PromptCategory {
  category: string;
  color: string;
  bgColor: string;
  borderColor: string;
  prompts: PromptItem[];
}

export interface PromptItem {
  prompt: string;
  purpose: string;
}

// ============================================================================
// PAGE 10: MARKET INTELLIGENCE
// ============================================================================

export interface MarketIntelligenceData {
  hasData: boolean;
  marketSize: string;
  growthRate: string;
  industryTrends: string[];
  futureOutlook: string;
  macroFactors: string[];
  microFactors: string[];
}

// ============================================================================
// PAGE 11: METHODOLOGY
// ============================================================================

export interface MethodologyData {
  sections: MethodologySection[];
  certified: boolean;
  certificationText: string;
}

export interface MethodologySection {
  title: string;
  icon: string;
  color: string;
  items: string[];
}

// ============================================================================
// SHARED COMPONENT PROPS
// ============================================================================

export interface ReportPageProps {
  pageNumber: number;
  totalPages: number;
  children: React.ReactNode;
  className?: string;
}

export interface HeaderProps {
  brandName: string;
  activeSection?: string;
  period: string;
}

export interface FooterProps {
  pageNumber: number;
  totalPages: number;
  brandName: string;
}

export interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: number | null;
  trendLabel?: string;
  icon?: React.ReactNode;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export interface DataTableProps {
  headers: string[];
  rows: (string | React.ReactNode)[][];
  highlightColumn?: number;
  className?: string;
}

export interface ProgressBarProps {
  current: number;
  target?: number;
  max: number;
  showLabels?: boolean;
  height?: 'sm' | 'md' | 'lg';
  className?: string;
}
