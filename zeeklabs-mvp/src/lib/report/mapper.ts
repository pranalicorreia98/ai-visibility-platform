// Report Layer - Data Mapper
// Transforms API ReportData into ReportViewModel for rendering

import {
  ReportViewModel,
  ReportMeta,
  ExecutiveSummaryData,
  SentimentData,
  CompetitorData,
  ProgressData,
  ActionPlanData,
  CitationData,
  StrategicPositionData,
  PlatformPerformanceData,
  PromptsData,
  MarketIntelligenceData,
  MethodologyData,
  PlatformSentiment,
  RankingItem,
  CompetitorComparison,
  ActionItem,
  CitationOpportunity,
  PromptCategory,
  BenchmarkMetric,
  PlatformDetail,
} from './types';

import {
  formatDate,
  getCurrentDate,
  getScoreLabel,
  formatPercent,
  calculatePercentage,
  truncate,
  stripMarkdown,
  getPlatformDisplayName,
  getPlatformIcon,
} from './formatter';

import {
  COLORS,
  getScoreColor,
  PROMPT_CATEGORIES,
  METHODOLOGY_SECTIONS,
} from './constants';

import {
  SCORE_WEIGHTS,
  calculatePresenceScore,
  calculateSentimentScore,
  calculatePositionScore,
  getConfidenceLevel,
} from '../scoring';

// Each simulation queries this many AI engines (ChatGPT/Gemini/Perplexity) —
// matches AI_ENGINE_COUNT in api/reports/generate/route.ts.
const AI_ENGINE_COUNT = 3;

// ============================================================================
// INPUT TYPE (from existing API)
// ============================================================================

// This matches the ReportData interface from the existing pdf-generator.ts
interface ReportData {
  brand: {
    name: string;
    domain?: string;
  };
  reportDate: string;
  period: string;
  metrics: {
    visibilityScore: number;
    chatgptScore: number;
    geminiScore: number;
    perplexityScore?: number;
    totalMentions: number;
    chatgptMentions: number;
    geminiMentions: number;
    perplexityMentions?: number;
    simulationsRun: number;
    organicSimulationsRun?: number;
    sentiment: {
      average: number;
      positive: number;
      neutral: number;
      negative: number;
    };
    position?: {
      chatgptAvg: number | null;
      geminiAvg: number | null;
      perplexityAvg?: number | null;
      overallAvg: number | null;
      distribution?: {
        chatgpt: { top3: number; top5: number; beyond5: number };
        gemini: { top3: number; top5: number; beyond5: number };
        perplexity: { top3: number; top5: number; beyond5: number };
      };
    };
    mentionRate?: number;
  };
  recentMentions: Array<{
    aiSystem: string;
    context: string;
    sentiment: number | null;
    position: number | null;
    date: string;
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    priority: string;
    category: string;
    effort?: string;
    timeline?: string;
    isCompleted: boolean;
  }>;
  competitorComparison?: Array<{
    name: string;
    overallScore: number;
    dataSource?: 'measured' | 'ai_estimate';
    strengths: string[];
    weaknesses: string[];
    marketShare: string;
    sentiment: string;
  }> | null;
  marketIntelligence?: {
    industryTrends: string[];
    marketSize: string;
    growthRate: string;
    futureOutlook: string;
    macroFactors?: string[];
    microFactors?: string[];
  } | null;
  sentimentAnalysis?: {
    brandSentiment: {
      overall: string;
      score: number;
      positiveThemes: string[];
      negativeThemes: string[];
      neutralThemes: string[];
    };
    customerSentiment: {
      satisfaction: number;
      nps: string;
    };
  } | null;
  aiVisibility?: {
    mentionFrequency: string;
    typicalPosition: number | null;
    recommendationLikelihood: string;
    competitorMentionGap: string;
    improvementAreas: string[];
  } | null;
  analysisRecommendations?: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    competitiveActions?: string[];
  } | null;
  citationOpportunities?: Array<{
    source: string;
    type: string;
    category: string;
    status: string;
    priority: string;
    effort: string;
    url?: string;
    aiRecommendation: string;
  }>;
  analysisPrompts?: Array<{
    id: number;
    category: string;
    prompt: string;
    purpose: string;
  }>;
  progressData?: {
    change: number;
    trend: string;
    dataPoints: number;
  } | null;
}

// Progress data from API
interface ProgressApiData {
  snapshots: Array<{
    date: string;
    score: number;
  }>;
  summary: {
    currentScore: number;
    change: number;
    avgScore: number;
    totalSnapshots: number;
  };
}

// ============================================================================
// MAIN MAPPER FUNCTION
// ============================================================================

export function mapToReportViewModel(
  data: ReportData,
  progressData?: ProgressApiData | null
): ReportViewModel {
  const totalPages = 11;

  return {
    meta: mapMeta(data, totalPages),
    executive: mapExecutiveSummary(data),
    sentiment: mapSentiment(data),
    competitors: mapCompetitors(data),
    progress: mapProgress(data, progressData),
    actionPlan: mapActionPlan(data),
    citations: mapCitations(data),
    strategicPosition: mapStrategicPosition(data),
    platformPerformance: mapPlatformPerformance(data),
    prompts: mapPrompts(data),
    marketIntelligence: mapMarketIntelligence(data),
    methodology: mapMethodology(),
  };
}

// ============================================================================
// SECTION MAPPERS
// ============================================================================

function mapMeta(data: ReportData, totalPages: number): ReportMeta {
  const brandDomain = data.brand.domain || '';
  const brandLogo = brandDomain
    ? `https://www.google.com/s2/favicons?domain=${brandDomain}&sz=64`
    : undefined;

  return {
    brandName: data.brand.name || 'Brand',
    brandDomain,
    brandLogo,
    reportDate: data.reportDate || getCurrentDate(),
    period: data.period || 'Last 30 Days',
    generatedAt: getCurrentDate(),
    confidential: true,
    totalPages,
  };
}

function mapExecutiveSummary(data: ReportData): ExecutiveSummaryData {
  const score = data.metrics.visibilityScore || 0;
  const totalMentions = data.metrics.totalMentions || 0;
  const totalSentiment =
    data.metrics.sentiment.positive +
    data.metrics.sentiment.neutral +
    data.metrics.sentiment.negative;

  // No real cross-customer industry-benchmark data exists yet, so we show no
  // benchmark comparisons rather than inventing "industry average" numbers
  // (previously hardcoded 18.5% / 82.1% / 2.4 per k/words with no data source).
  const benchmarks: BenchmarkMetric[] = [];

  // Generate strategic insight
  const avgPlatformScore = Math.round(
    (data.metrics.chatgptScore + data.metrics.geminiScore + (data.metrics.perplexityScore || 0)) / 3
  );
  const sentimentScore = totalSentiment > 0
    ? Math.round((data.metrics.sentiment.positive * 100 + data.metrics.sentiment.neutral * 50) / totalSentiment)
    : 50;

  let strategicInsight = `${data.brand.name} maintains a ${avgPlatformScore < 30 ? 'consistent but low' : avgPlatformScore < 60 ? 'moderate' : 'strong'} ${avgPlatformScore}% average visibility across all major LLMs. `;
  if (score < 50) {
    strategicInsight += `The overall visibility score of ${score}/100 suggests ${score < 30 ? 'critical' : 'substantial'} room for optimization in technical SEO for AI crawlers. `;
  } else {
    strategicInsight += `The overall visibility score of ${score}/100 demonstrates ${score >= 70 ? 'excellent' : 'good'} AI platform recognition. `;
  }
  if (sentimentScore < 60) {
    strategicInsight += `The sentiment remains ${sentimentScore < 40 ? 'challenging' : 'neutral'}, representing an opportunity to move neutral mentions toward positive advocacy.`;
  } else {
    strategicInsight += `The positive sentiment score reflects strong brand perception across AI platforms.`;
  }

  return {
    overallScore: score,
    scoreLabel: getScoreLabel(score),
    scoreColor: getScoreColor(score),
    platforms: {
      chatgpt: {
        score: data.metrics.chatgptScore || 0,
        mentions: data.metrics.chatgptMentions || 0,
        color: COLORS.chatgpt,
      },
      gemini: {
        score: data.metrics.geminiScore || 0,
        mentions: data.metrics.geminiMentions || 0,
        color: COLORS.gemini,
      },
      perplexity: {
        score: data.metrics.perplexityScore || 0,
        mentions: data.metrics.perplexityMentions || 0,
        color: COLORS.perplexity,
      },
    },
    totalMentions,
    mentionTrend: data.progressData?.change || null,
    frequency: data.metrics.simulationsRun || 0,
    frequencyTrend: null,
    position: data.metrics.position?.overallAvg || data.aiVisibility?.typicalPosition || null,
    positionTrend: null,
    strategicInsight,
    benchmarks,
  };
}

function mapSentiment(data: ReportData): SentimentData {
  const sentiment = data.metrics.sentiment;
  const total = sentiment.positive + sentiment.neutral + sentiment.negative;
  const positivePercent = calculatePercentage(sentiment.positive, total);
  const neutralPercent = calculatePercentage(sentiment.neutral, total);
  const negativePercent = calculatePercentage(sentiment.negative, total);

  const overallScore = total > 0
    ? Math.round((positivePercent * 100 + neutralPercent * 50) / 100)
    : 50;

  // Platform sentiment - use consistent values across all platforms
  // Previously used Math.random() which caused non-reproducible reports
  const byPlatform: PlatformSentiment[] = [
    {
      platform: 'ChatGPT (GPT-4)',
      icon: '💬',
      positive: positivePercent,
      neutral: neutralPercent,
      negative: negativePercent,
    },
    {
      platform: 'Google Gemini',
      icon: '✨',
      positive: positivePercent,
      neutral: neutralPercent,
      negative: negativePercent,
    },
    {
      platform: 'Perplexity AI',
      icon: '🔍',
      positive: positivePercent,
      neutral: neutralPercent,
      negative: negativePercent,
    },
  ];

  const sentimentAnalysis = data.sentimentAnalysis;

  return {
    overallScore,
    scoreLabel: overallScore >= 70 ? 'Excellent' : overallScore >= 50 ? 'Good' : 'Needs Attention',
    breakdown: {
      positive: positivePercent,
      neutral: neutralPercent,
      negative: negativePercent,
      positiveCount: sentiment.positive,
      neutralCount: sentiment.neutral,
      negativeCount: sentiment.negative,
      total,
    },
    byPlatform,
    positiveThemes: (sentimentAnalysis?.brandSentiment.positiveThemes || []).map(theme => ({
      theme: truncate(stripMarkdown(theme), 50),
      description: 'Recognized positively across AI platforms.',
    })),
    negativeThemes: (sentimentAnalysis?.brandSentiment.negativeThemes || []).map(theme => ({
      theme: truncate(stripMarkdown(theme), 50),
      description: 'Identified as an area for improvement.',
    })),
    neutralThemes: sentimentAnalysis?.brandSentiment.neutralThemes || [],
    customerSatisfaction: sentimentAnalysis?.customerSentiment?.satisfaction,
    nps: sentimentAnalysis?.customerSentiment?.nps,
  };
}

function mapCompetitors(data: ReportData): CompetitorData {
  const brandName = data.brand.name || 'Your Brand';
  const brandScore = data.metrics.visibilityScore || 0;
  const competitors = data.competitorComparison || [];

  // Build ranking
  const allBrands = [
    { name: brandName, score: brandScore, isYou: true },
    ...competitors.map(c => ({ name: c.name, score: c.overallScore, isYou: false })),
  ].sort((a, b) => b.score - a.score);

  const ranking: RankingItem[] = allBrands.map((b, i) => ({
    rank: i + 1,
    name: b.name,
    score: b.score,
    isYou: b.isYou,
    scoreLabel: b.isYou && b.score < 40 ? 'Critical Growth Need' : undefined,
  }));

  const yourRank = ranking.findIndex(r => r.isYou) + 1;
  const topCompetitor = allBrands.find(b => !b.isYou);
  const marketLeaderGap = topCompetitor ? topCompetitor.score - brandScore : 0;

  // Executive summary
  let executiveSummary = `${brandName} currently ${yourRank <= 3 ? 'leads' : 'trails'} the market `;
  if (yourRank > 3 && marketLeaderGap > 0) {
    executiveSummary += `by a ${marketLeaderGap > 30 ? 'significant' : 'moderate'} margin of ${marketLeaderGap} points. `;
    executiveSummary += 'The gap is primarily attributed to low brand authority in LLM training datasets and search visibility.';
  } else if (yourRank <= 3) {
    executiveSummary += 'with strong positioning. Focus on maintaining competitive advantage through consistent content strategy.';
  }

  // Comparison details
  const comparison: CompetitorComparison[] = competitors.map(c => ({
    name: c.name,
    subtitle: c.dataSource === 'measured' ? 'Measured' : 'AI Estimate',
    score: c.overallScore,
    strengths: c.strengths || [],
    weaknesses: c.weaknesses || [],
    marketShare: c.marketShare || 'N/A',
    sentiment: (c.sentiment as 'positive' | 'neutral' | 'negative') || 'neutral',
  }));

  return {
    ranking,
    yourRank,
    totalCompetitors: allBrands.length,
    marketLeaderGap: Math.max(0, marketLeaderGap),
    marketLeaderName: topCompetitor?.name || 'Market Leader',
    executiveSummary,
    growthTrajectory: data.progressData?.change !== undefined
      ? `${data.progressData.change >= 0 ? '+' : ''}${data.progressData.change}% MoM`
      : 'N/A',
    comparison,
    matrix: {
      metrics: [
        { label: 'Visibility Index', values: [] },
        { label: 'Media Mentions (30d)', values: [] },
        { label: 'Net Sentiment Score', values: [] },
      ],
      brands: [brandName, ...competitors.slice(0, 2).map(c => c.name)],
    },
    insights: {
      growthVector: {
        title: 'Growth Vector',
        description: topCompetitor
          ? `Focus on "Authority" scores to bridge the ${Math.max(0, marketLeaderGap)}-point gap with ${topCompetitor.name}.`
          : 'No competitor data yet — add competitors to see the gap to the market leader.',
        color: 'purple',
      },
      trustDeficit: {
        title: 'Trust Deficit',
        description: 'Mention volume is the critical bottleneck for AI training inclusion.',
        color: 'gray',
      },
      competitiveRadar: {
        title: 'Competitive Radar',
        description: `${topCompetitor?.name || 'Competition'} dominates SEO share; suggest "Blue Ocean" keyword strategy.`,
        color: 'amber',
      },
    },
  };
}

function mapProgress(data: ReportData, progressData?: ProgressApiData | null): ProgressData {
  if (!progressData || !progressData.snapshots || progressData.snapshots.length === 0) {
    return {
      hasData: false,
      dataPoints: [],
      currentScore: data.metrics.visibilityScore || 0,
      previousScore: 0,
      change: 0,
      changeFormatted: '+0',
      avgScore: 0,
      totalSnapshots: 0,
      trend: 'stable',
      periodLabel: 'No historical data',
    };
  }

  const summary = progressData.summary;
  const change = summary.change || 0;

  return {
    hasData: true,
    dataPoints: progressData.snapshots.map(s => ({
      date: s.date,
      dateFormatted: formatDate(s.date),
      score: s.score,
    })),
    currentScore: summary.currentScore,
    previousScore: summary.currentScore - change,
    change,
    changeFormatted: change >= 0 ? `+${change}` : `${change}`,
    avgScore: summary.avgScore,
    totalSnapshots: summary.totalSnapshots,
    trend: change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'stable',
    periodLabel: `Last ${summary.totalSnapshots} analysis runs`,
  };
}

// Conservative ceiling on projected score gain shown in a single report cycle.
// Full headroom to 100 is rarely achievable at once; this is a labeled UX
// assumption, not a data-derived prediction.
const REALISTIC_GAIN_CAP = 37;

function mapActionPlan(data: ReportData): ActionPlanData {
  const currentScore = data.metrics.visibilityScore || 0;
  const potentialGain = Math.min(100 - currentScore, REALISTIC_GAIN_CAP);
  const targetScore = Math.min(currentScore + potentialGain, 100);

  const recs = data.analysisRecommendations;
  const immediateItems = (recs?.immediate || []).slice(0, 3);
  const shortTermItems = (recs?.shortTerm || []).slice(0, 3);
  const longTermItems = (recs?.longTerm || []).slice(0, 3);
  const competitiveItems = (recs?.competitiveActions || []).slice(0, 2);

  const mapToActionItems = (items: string[], categories: string[], titles: string[]): ActionItem[] => {
    return items.map((item, i) => ({
      category: categories[i] || 'ACTION',
      title: titles[i] || 'Strategic Action',
      description: truncate(stripMarkdown(item), 100),
    }));
  };

  return {
    potentialGain,
    currentScore,
    targetScore,
    maxScore: 100,
    immediate: {
      title: 'Immediate',
      subtitle: 'HIGH IMPACT • PRIORITY 1',
      color: COLORS.immediate,
      icon: '⚡',
      items: mapToActionItems(
        immediateItems,
        ['SEO STRATEGY', 'DIGITAL IDENTITY', 'CONTENT'],
        ['Keyword Optimization', 'GMB/LinkedIn Claiming', 'Marketing Consistency']
      ),
      potentialPoints: Math.min(immediateItems.length * 5, 15),
    },
    shortTerm: {
      title: 'Short-term',
      subtitle: '2-4 WEEKS • GROWTH PHASE',
      color: COLORS.shortTerm,
      icon: '⏱',
      items: mapToActionItems(
        shortTermItems,
        ['SOCIAL PROOF', 'EVIDENCE', 'PR'],
        ['Solicit Reviews', 'Case Study Series', 'Targeted Campaigns']
      ),
      potentialPoints: Math.min(shortTermItems.length * 4, 12),
    },
    longTerm: {
      title: 'Long-term',
      subtitle: 'STRATEGIC • MARKET MOAT',
      color: COLORS.longTerm,
      icon: '🎯',
      items: mapToActionItems(
        longTermItems,
        ['R&D', 'ECOSYSTEM', 'AUTHORITY'],
        ['Advanced AI Features', 'Integration Roadmap', 'Thought Leadership']
      ),
      potentialPoints: Math.min(longTermItems.length * 3, 10),
    },
    competitive: competitiveItems.map(item => ({
      category: 'COMPETITIVE',
      title: 'Competitive Action',
      description: truncate(stripMarkdown(item), 80),
    })),
    impactSummary: `By executing these synchronized phases, ${data.brand.name} will pivot from ${currentScore < 40 ? 'an emerging player' : 'a competitive position'} (${currentScore}th percentile) to ${targetScore >= 70 ? 'an industry authority' : 'stronger market positioning'} (${targetScore}nd percentile). The projected +${potentialGain} gain reflects enhanced organic search visibility, increased brand sentiment through social proof, and long-term defensibility through technical differentiation.`,
    // Rough effort-based estimate (2 weeks per recommended action, bounded),
    // not a hardcoded constant — scales with how many actions are actually recommended.
    implementationWeeks: Math.max(
      4,
      Math.min(16, (immediateItems.length + shortTermItems.length + longTermItems.length + competitiveItems.length) * 2)
    ),
    // Maps measured sample size (total mentions analyzed) to a confidence
    // tier via the same thresholds used across the app (src/lib/scoring.ts) —
    // not a fixed decorative number.
    confidence: (() => {
      const level = getConfidenceLevel(data.metrics.totalMentions || 0);
      return level === 'high' ? 90 : level === 'moderate' ? 70 : 40;
    })(),
  };
}

function mapCitations(data: ReportData): CitationData {
  const opportunities = data.citationOpportunities || [];

  const mappedOpportunities: CitationOpportunity[] = opportunities.map(c => ({
    source: c.source,
    category: c.category,
    priority: (c.priority as 'high' | 'medium' | 'low') || 'medium',
    effort: (c.effort as 'low' | 'medium' | 'high') || 'medium',
    // 'not_detected' means "not seen in analyzed AI responses" — not a
    // verified absence, since we don't crawl these platforms directly.
    status: c.status || 'not_detected',
    recommendation: truncate(c.aiRecommendation, 120),
    url: c.url,
  }));

  // Group by category
  const categoryMap = new Map<string, number>();
  const highPriorityMap = new Map<string, number>();

  mappedOpportunities.forEach(opp => {
    categoryMap.set(opp.category, (categoryMap.get(opp.category) || 0) + 1);
    if (opp.priority === 'high') {
      highPriorityMap.set(opp.category, (highPriorityMap.get(opp.category) || 0) + 1);
    }
  });

  const byCategory = Array.from(categoryMap.entries()).map(([category, count]) => ({
    category,
    count,
    highPriority: highPriorityMap.get(category) || 0,
  }));

  return {
    totalOpportunities: mappedOpportunities.length,
    opportunities: mappedOpportunities,
    byCategory,
    prioritySummary: {
      high: mappedOpportunities.filter(o => o.priority === 'high').length,
      medium: mappedOpportunities.filter(o => o.priority === 'medium').length,
      low: mappedOpportunities.filter(o => o.priority === 'low').length,
    },
  };
}

function mapStrategicPosition(data: ReportData): StrategicPositionData {
  const aiVis = data.aiVisibility;
  const brandName = data.brand.name || 'Brand';

  let positionSummary = '';
  if (aiVis?.competitorMentionGap && aiVis.competitorMentionGap !== 'Insufficient data') {
    positionSummary = aiVis.competitorMentionGap;
  } else if (aiVis?.mentionFrequency) {
    positionSummary = `${brandName} has ${aiVis.mentionFrequency} mention frequency in AI responses`;
    if (aiVis.typicalPosition) {
      positionSummary += `, typically appearing at position #${aiVis.typicalPosition}`;
    }
    positionSummary += `. AI recommendation likelihood is ${aiVis.recommendationLikelihood || 'moderate'}.`;
  } else {
    positionSummary = `Run analysis to determine ${brandName}'s competitive position in AI responses.`;
  }

  const focusAreas = (aiVis?.improvementAreas || []).slice(0, 4).map((area, i) => ({
    rank: i + 1,
    area: truncate(stripMarkdown(area), 80),
  }));

  const badges = [];
  if (aiVis?.mentionFrequency && aiVis.mentionFrequency !== 'none') {
    badges.push({
      label: 'Mention Frequency',
      value: aiVis.mentionFrequency,
      color: COLORS.primary,
    });
  }
  if (aiVis?.typicalPosition) {
    badges.push({
      label: 'AI Response Position',
      value: `#${aiVis.typicalPosition}`,
      color: COLORS.perplexity,
    });
  }
  if (aiVis?.recommendationLikelihood) {
    badges.push({
      label: 'AI Recommendation Signal',
      value: aiVis.recommendationLikelihood,
      color: COLORS.gemini,
    });
  }

  return {
    competitorMentionGap: aiVis?.competitorMentionGap || 'Insufficient data',
    mentionFrequency: aiVis?.mentionFrequency || 'unknown',
    typicalPosition: aiVis?.typicalPosition || null,
    recommendationLikelihood: aiVis?.recommendationLikelihood || 'moderate',
    keyFocusAreas: focusAreas,
    positionSummary,
    badges,
  };
}

function mapPlatformPerformance(data: ReportData): PlatformPerformanceData {
  const metrics = data.metrics;
  const brandName = data.brand.name || 'Brand';

  // Score breakdown built from the same canonical component functions
  // (src/lib/scoring.ts) the dashboard and report generator use — a real
  // presence rate (mentions / simulations queried), not 40% of the already-
  // blended overall score.
  const presenceScoreRaw = calculatePresenceScore(metrics.totalMentions, metrics.simulationsRun * AI_ENGINE_COUNT);
  // metrics.sentiment.average is stored as avgSentiment*100 (see
  // api/reports/generate/route.ts), so divide back down to the -1..1 range
  // calculateSentimentScore expects.
  const sentimentScoreRaw = calculateSentimentScore(metrics.sentiment.average / 100);
  const positionScoreRaw = calculatePositionScore(metrics.position?.overallAvg ?? null);

  const scoreBreakdown = {
    presence: Math.round(presenceScoreRaw * SCORE_WEIGHTS.presence),
    sentiment: Math.round(sentimentScoreRaw * SCORE_WEIGHTS.sentiment),
    position: Math.round(positionScoreRaw * SCORE_WEIGHTS.position),
    weights: {
      presence: SCORE_WEIGHTS.presence * 100,
      sentiment: SCORE_WEIGHTS.sentiment * 100,
      position: SCORE_WEIGHTS.position * 100,
    },
  };

  // Platform details
  const platforms: PlatformDetail[] = [
    {
      name: 'ChatGPT',
      icon: '💬',
      score: data.metrics.chatgptScore || 0,
      mentions: data.metrics.chatgptMentions || 0,
      avgPosition: data.metrics.position?.chatgptAvg || null,
      color: COLORS.chatgpt,
      trend: 'stable' as const,
    },
    {
      name: 'Google Gemini',
      icon: '✨',
      score: data.metrics.geminiScore || 0,
      mentions: data.metrics.geminiMentions || 0,
      avgPosition: data.metrics.position?.geminiAvg || null,
      color: COLORS.gemini,
      trend: 'stable' as const,
    },
    {
      name: 'Perplexity AI',
      icon: '🔍',
      score: data.metrics.perplexityScore || 0,
      mentions: data.metrics.perplexityMentions || 0,
      avgPosition: data.metrics.position?.perplexityAvg || null,
      color: COLORS.perplexity,
      trend: 'stable' as const,
    },
  ];

  // Real position distribution computed by the report API (previously this
  // was silently discarded here and replaced with hardcoded zeros).
  const positionDistribution = metrics.position?.distribution || {
    chatgpt: { top3: 0, top5: 0, beyond5: 0 },
    gemini: { top3: 0, top5: 0, beyond5: 0 },
    perplexity: { top3: 0, top5: 0, beyond5: 0 },
  };

  // Determine strongest and weakest platforms
  const sortedPlatforms = [...platforms].sort((a, b) => b.score - a.score);
  const strongestPlatform = sortedPlatforms[0]?.name || 'None';
  const weakestPlatform = sortedPlatforms[sortedPlatforms.length - 1]?.name || 'None';

  // Generate performance summary
  const avgScore = Math.round(platforms.reduce((sum, p) => sum + p.score, 0) / platforms.length);
  let performanceSummary = '';
  if (avgScore >= 70) {
    performanceSummary = `${brandName} demonstrates strong performance across AI platforms with an average score of ${avgScore}. `;
  } else if (avgScore >= 40) {
    performanceSummary = `${brandName} shows moderate visibility across AI platforms with an average score of ${avgScore}. `;
  } else {
    performanceSummary = `${brandName} has growth potential in AI visibility with a current average score of ${avgScore}. `;
  }

  if (sortedPlatforms[0]?.score > sortedPlatforms[sortedPlatforms.length - 1]?.score + 20) {
    performanceSummary += `Consider focusing optimization efforts on ${weakestPlatform} to balance cross-platform visibility.`;
  } else {
    performanceSummary += 'Platform performance is relatively consistent across all major AI systems.';
  }

  return {
    scoreBreakdown,
    platforms,
    positionDistribution,
    totalSimulations: data.metrics.simulationsRun || 0,
    // Previously duplicated totalSimulations — the API separately computes
    // organicSimulationsRun (excludes biased self-referential prompts).
    organicSimulations: data.metrics.organicSimulationsRun ?? data.metrics.simulationsRun ?? 0,
    mentionRate: data.metrics.mentionRate || 0,
    strongestPlatform,
    weakestPlatform,
    performanceSummary,
  };
}

function mapPrompts(data: ReportData): PromptsData {
  const prompts = data.analysisPrompts || [];

  // Group by category
  const categoryMap = new Map<string, Array<{ prompt: string; purpose: string }>>();

  prompts.forEach(p => {
    const category = p.category || 'general';
    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }
    categoryMap.get(category)!.push({
      prompt: truncate(p.prompt, 80),
      purpose: truncate(p.purpose, 60),
    });
  });

  const byCategory: PromptCategory[] = Array.from(categoryMap.entries()).map(([category, items]) => {
    const catConfig = PROMPT_CATEGORIES[category as keyof typeof PROMPT_CATEGORIES] || {
      name: category,
      color: COLORS.text.secondary,
      bgColor: COLORS.background.muted,
      borderColor: COLORS.border.light,
    };

    return {
      category: catConfig.name || category,
      color: catConfig.color,
      bgColor: catConfig.bgColor,
      borderColor: catConfig.borderColor,
      prompts: items.slice(0, 4),
    };
  });

  return {
    totalPrompts: prompts.length,
    byCategory,
  };
}

function mapMarketIntelligence(data: ReportData): MarketIntelligenceData {
  const market = data.marketIntelligence;

  if (!market) {
    return {
      hasData: false,
      marketSize: '-',
      growthRate: '-',
      industryTrends: [],
      futureOutlook: 'Run analysis to gather market intelligence.',
      macroFactors: [],
      microFactors: [],
    };
  }

  return {
    hasData: true,
    marketSize: market.marketSize || '-',
    growthRate: market.growthRate || '-',
    industryTrends: market.industryTrends || [],
    futureOutlook: market.futureOutlook || '',
    macroFactors: market.macroFactors || [],
    microFactors: market.microFactors || [],
  };
}

function mapMethodology(): MethodologyData {
  return {
    sections: METHODOLOGY_SECTIONS.map(s => ({
      title: s.title,
      icon: s.icon,
      color: s.color,
      items: [...s.items],
    })),
    certified: true,
    certificationText: 'Results validated across multiple AI platforms',
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { ReportData, ProgressApiData };
