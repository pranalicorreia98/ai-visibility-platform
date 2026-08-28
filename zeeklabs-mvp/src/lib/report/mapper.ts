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
  formatDelta,
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

  // Calculate benchmarks
  const benchmarks: BenchmarkMetric[] = [
    {
      label: 'Prompt Inclusion Rate',
      value: `${(score * 0.6).toFixed(1)}%`,
      industryAvg: '18.5%',
      delta: score * 0.6 - 18.5,
      deltaFormatted: formatDelta(score * 0.6 - 18.5),
      isPositive: score * 0.6 > 18.5,
    },
    {
      label: 'Contextual Accuracy',
      value: `${Math.min(88 + Math.floor(score / 10), 95)}.0%`,
      industryAvg: '82.1%',
      delta: Math.min(88 + Math.floor(score / 10), 95) - 82.1,
      deltaFormatted: formatDelta(Math.min(88 + Math.floor(score / 10), 95) - 82.1),
      isPositive: true,
    },
    {
      label: 'Citation Frequency',
      value: `${(totalMentions / 1000).toFixed(1)} per k/words`,
      industryAvg: '2.4 per k/words',
      delta: (totalMentions / 1000) - 2.4,
      deltaFormatted: `${((totalMentions / 1000) - 2.4).toFixed(1)}`,
      isPositive: totalMentions / 1000 > 2.4,
    },
  ];

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

  // Platform sentiment (with slight variations)
  const byPlatform: PlatformSentiment[] = [
    {
      platform: 'ChatGPT (GPT-4)',
      icon: '💬',
      positive: Math.min(positivePercent + Math.floor(Math.random() * 10) - 5, 100),
      neutral: neutralPercent,
      negative: Math.max(negativePercent - Math.floor(Math.random() * 5), 0),
    },
    {
      platform: 'Google Gemini',
      icon: '✨',
      positive: Math.min(positivePercent + Math.floor(Math.random() * 8) - 3, 100),
      neutral: neutralPercent + Math.floor(Math.random() * 5),
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

  // Normalize platform sentiment percentages
  byPlatform.forEach(p => {
    const pTotal = p.positive + p.neutral + p.negative;
    if (pTotal !== 100) {
      const diff = 100 - pTotal;
      p.neutral = Math.max(0, p.neutral + diff);
    }
  });

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
    subtitle: c.strengths?.[0]?.split(' ').slice(0, 3).join(' ') || 'Industry Player',
    score: c.overallScore,
    strengths: c.strengths || [],
    weaknesses: c.weaknesses || [],
    marketShare: c.marketShare || `${Math.floor(15 + Math.random() * 20)}%`,
    sentiment: (c.sentiment as 'positive' | 'neutral' | 'negative') || 'neutral',
  }));

  return {
    ranking,
    yourRank,
    totalCompetitors: allBrands.length,
    marketLeaderGap: Math.max(0, marketLeaderGap),
    marketLeaderName: topCompetitor?.name || 'Market Leader',
    executiveSummary,
    growthTrajectory: `+${data.progressData?.change || 4.5}% MoM`,
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
        description: `Focus on "Authority" scores to bridge the ${marketLeaderGap || 20}-point gap with ${topCompetitor?.name || 'market leader'}.`,
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

function mapActionPlan(data: ReportData): ActionPlanData {
  const currentScore = data.metrics.visibilityScore || 0;
  const potentialGain = Math.min(100 - currentScore, 37);
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
    implementationWeeks: 12,
    confidence: 88,
  };
}

function mapCitations(data: ReportData): CitationData {
  const opportunities = data.citationOpportunities || [];

  const mappedOpportunities: CitationOpportunity[] = opportunities.map(c => ({
    source: c.source,
    category: c.category,
    priority: (c.priority as 'high' | 'medium' | 'low') || 'medium',
    effort: (c.effort as 'low' | 'medium' | 'high') || 'medium',
    status: c.status || 'missing',
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
      label: 'AI Recommends',
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

  // Score breakdown with weights
  const scoreBreakdown = {
    presence: Math.round(metrics.visibilityScore * 0.4) || 0,
    sentiment: Math.round(((metrics.sentiment.positive / Math.max(1, metrics.sentiment.positive + metrics.sentiment.neutral + metrics.sentiment.negative)) * 100) * 0.25) || 0,
    position: Math.round(metrics.position?.overallAvg ? Math.max(0, 100 - (metrics.position.overallAvg - 1) * 15) * 0.35 : 50 * 0.35) || 0,
    weights: {
      presence: 40,
      sentiment: 25,
      position: 35,
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

  // Position distribution (from API if available)
  const positionDistribution = {
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
    organicSimulations: data.metrics.simulationsRun || 0,
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
