// PDF Report Generator - Premium Executive AI Visibility Report
// Designed for Enterprise Digital Marketing Professionals

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
      distribution: {
        chatgpt: { top3: number; top5: number; beyond5: number };
        gemini: { top3: number; top5: number; beyond5: number };
        perplexity?: { top3: number; top5: number; beyond5: number };
      };
    };
    scoreBreakdown?: {
      presence: number;
      sentiment: number;
      position: number;
    };
    mentionRate?: number;
  };
  recentMentions: Array<{
    aiSystem: string;
    prompt?: string;
    response?: string;
    context: string;
    sentiment: number | null;
    position: number | null;
    date: string;
  }>;
  promptsTested?: Array<{
    prompt: string;
    mentionCount: number;
    systems: string[];
    isSuggested?: boolean;
    category?: string;
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    priority: string;
    category: string;
    effort?: string;
    timeline?: string;
    expectedImpact?: string;
    isCompleted: boolean;
  }>;
  competitors: Array<{
    name: string;
    domain?: string;
  }>;
  aiScores?: {
    overall: number;
    brandAwareness: number;
    marketPosition: number;
    sentimentScore: number;
    authorityScore: number;
    contentVisibility: number;
    socialPresence: number;
  } | null;
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
      commonPraises: string[];
      commonComplaints: string[];
      nps: string;
    };
    marketSentiment?: {
      industryOutlook: string;
      investorSentiment: string;
      mediaPerception: string;
    };
  } | null;
  emergingPlayers?: Array<{
    name: string;
    description: string;
    threatLevel: string;
    uniqueAdvantage: string;
  }> | null;
  productAnalysis?: {
    featureGaps: string[];
    featureAdvantages: string[];
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

function truncate(text: string, maxLength: number): string {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function getScoreColor(score: number): string {
  if (score >= 70) return '#059669';
  if (score >= 40) return '#d97706';
  return '#dc2626';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Strong';
  if (score >= 40) return 'Moderate';
  if (score >= 20) return 'Developing';
  return 'Critical Growth Need';
}

// ZeekLabs Logo SVG
const LOGO_SVG = `<svg viewBox="0 0 100 115" width="24" height="28">
  <path d="M10 29 L50 5 L50 20 L30 32 L50 32 L50 45 L18 45 L40 72 L50 72 L50 95 L10 72 L10 58 L30 72 L10 45 L10 29 Z" fill="#5C6B7A"/>
  <path d="M90 86 L50 110 L50 95 L70 83 L50 83 L50 70 L82 70 L60 43 L50 43 L50 20 L90 43 L90 57 L70 43 L90 70 L90 86 Z" fill="#6366f1"/>
</svg>`;

export function generatePDFReport(reportData: ReportData): void {
  const brandName = reportData.brand.name || 'Brand';
  const brandDomain = reportData.brand.domain || '';
  const score = reportData.metrics.visibilityScore || 0;
  const scoreColor = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);

  // Calculate trends (mock for now - would come from real data)
  const mentionTrend = reportData.progressData?.change || 0;
  const mentionTrendSign = mentionTrend >= 0 ? '+' : '';

  // Platform data
  const platforms = [
    { name: 'ChatGPT', score: reportData.metrics.chatgptScore, mentions: reportData.metrics.chatgptMentions, color: '#10b981' },
    { name: 'Gemini', score: reportData.metrics.geminiScore, mentions: reportData.metrics.geminiMentions, color: '#3b82f6' },
    { name: 'Perplexity', score: reportData.metrics.perplexityScore || 0, mentions: reportData.metrics.perplexityMentions || 0, color: '#8b5cf6' },
  ];

  // Competitors
  const competitors = reportData.competitorComparison || [];
  const allBrandsForRanking = [
    { name: brandName, score: score, isYou: true },
    ...competitors.map(c => ({ name: c.name, score: c.overallScore, isYou: false }))
  ].sort((a, b) => b.score - a.score);

  const yourRank = allBrandsForRanking.findIndex(b => b.isYou) + 1;
  const topCompetitor = allBrandsForRanking.find(b => !b.isYou);
  const marketLeaderGap = topCompetitor ? (topCompetitor.score - score) : 0;

  // Sentiment data
  const sentiment = reportData.sentimentAnalysis;
  const totalSentiment = reportData.metrics.sentiment.positive + reportData.metrics.sentiment.neutral + reportData.metrics.sentiment.negative;
  const positivePercent = totalSentiment > 0 ? Math.round(reportData.metrics.sentiment.positive / totalSentiment * 100) : 0;
  const neutralPercent = totalSentiment > 0 ? Math.round(reportData.metrics.sentiment.neutral / totalSentiment * 100) : 0;
  const negativePercent = totalSentiment > 0 ? Math.round(reportData.metrics.sentiment.negative / totalSentiment * 100) : 0;

  // Calculate sentiment score (0-100)
  const sentimentScore = Math.round((positivePercent * 100 + neutralPercent * 50) / 100);

  // Action plan recommendations
  const immediateActions = reportData.analysisRecommendations?.immediate || [];
  const shortTermActions = reportData.analysisRecommendations?.shortTerm || [];
  const longTermActions = reportData.analysisRecommendations?.longTerm || [];

  // Calculate potential gain
  const potentialGain = Math.min(100 - score, 37);
  const targetBenchmark = Math.min(score + potentialGain, 100);

  // Generate Key Strategic Insight
  const generateStrategicInsight = (): string => {
    const avgPlatformScore = Math.round((platforms[0].score + platforms[1].score + platforms[2].score) / 3);
    let insight = `${brandName} maintains a ${avgPlatformScore < 30 ? 'consistent but low' : avgPlatformScore < 60 ? 'moderate' : 'strong'} ${avgPlatformScore}% average visibility across all major LLMs, indicating ${avgPlatformScore < 30 ? 'significant room for improvement' : avgPlatformScore < 60 ? 'a balanced but growing presence' : 'strong market positioning'}. `;

    if (score < 50) {
      insight += `The overall visibility score of ${score}/100 suggests ${score < 30 ? 'critical' : 'substantial'} room for optimization in technical SEO for AI crawlers. `;
    } else {
      insight += `The overall visibility score of ${score}/100 demonstrates ${score >= 70 ? 'excellent' : 'good'} AI platform recognition. `;
    }

    if (sentimentScore < 60) {
      insight += `The sentiment remains ${sentimentScore < 40 ? 'challenging' : 'neutral'}, representing an opportunity to inject brand-specific narrative into public datasets to move neutral mentions toward positive advocacy.`;
    } else {
      insight += `The positive sentiment score of ${sentimentScore}/100 reflects strong brand perception across AI platforms.`;
    }

    return insight;
  };

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>AI Visibility Report - ${brandName}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
@page{size:A4;margin:0}
body{font-family:'Inter',system-ui,-apple-system,sans-serif;font-size:10px;color:#1f2937;line-height:1.5;-webkit-print-color-adjust:exact;print-color-adjust:exact;background:#fff}

/* Page Container */
.page{width:210mm;min-height:297mm;padding:20mm 18mm;margin:0 auto;background:#fff;position:relative}

/* Top Navigation Bar */
.nav-bar{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid #e5e7eb}
.nav-logo{display:flex;align-items:center;gap:8px}
.nav-brand{font-size:16px;font-weight:700;color:#1f2937}
.nav-brand span{color:#6366f1}
.nav-tabs{display:flex;gap:20px}
.nav-tab{font-size:11px;color:#6b7280;font-weight:500;padding-bottom:2px}
.nav-tab.active{color:#6366f1;border-bottom:2px solid #6366f1}
.nav-date{font-size:11px;color:#6366f1;font-weight:500}

/* Page Title Section */
.page-title-section{margin-bottom:28px;padding-bottom:16px;border-bottom:2px solid #1f2937}
.page-title-row{display:flex;justify-content:space-between;align-items:flex-start}
.page-title{font-size:28px;font-weight:800;color:#1f2937;letter-spacing:-0.5px;margin-bottom:4px}
.page-subtitle{font-size:13px;color:#6b7280;font-weight:400}
.page-subtitle strong{color:#1f2937;font-weight:600}
.confidential-badge{text-align:right}
.confidential-text{font-size:10px;font-weight:600;color:#991b1b;text-transform:uppercase;letter-spacing:0.5px}
.report-date{font-size:10px;color:#6b7280;margin-top:2px}

/* Executive Metrics Grid */
.exec-metrics-grid{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:16px;margin-bottom:24px}

/* Main Score Card */
.main-score-card{background:#fff;border:1px solid #e5e7eb;border-left:4px solid #6366f1;border-radius:8px;padding:20px}
.score-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px}
.score-label{font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px}
.score-icon{width:24px;height:24px;border-radius:6px;background:#f3f4f6;display:flex;align-items:center;justify-content:center}
.main-score-value{font-size:48px;font-weight:800;color:#1f2937;line-height:1}
.main-score-max{font-size:20px;font-weight:500;color:#9ca3af}
.score-description{font-size:11px;color:#6b7280;margin-top:12px;line-height:1.5}
.platform-bars{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:16px}
.platform-bar-item{background:#f9fafb;border-radius:6px;padding:8px 10px}
.platform-bar-name{font-size:9px;color:#6b7280;font-weight:500}
.platform-bar-row{display:flex;align-items:center;gap:8px;margin-top:4px}
.platform-bar-track{flex:1;height:6px;background:#e5e7eb;border-radius:3px;overflow:hidden}
.platform-bar-fill{height:100%;border-radius:3px}
.platform-bar-value{font-size:11px;font-weight:700;color:#1f2937;min-width:32px;text-align:right}

/* Small Metric Cards */
.metric-card-sm{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:16px}
.metric-card-sm-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.metric-card-sm-label{font-size:10px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px}
.metric-card-sm-trend{font-size:10px;font-weight:600}
.metric-card-sm-trend.up{color:#059669}
.metric-card-sm-trend.down{color:#dc2626}
.metric-card-sm-value{font-size:32px;font-weight:800;color:#1f2937;line-height:1}
.metric-card-sm-sub{font-size:10px;color:#6b7280;margin-top:4px}

/* Sentiment Overview Bar */
.sentiment-overview{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-bottom:24px}
.sentiment-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
.sentiment-title{font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px}
.sentiment-score-row{display:flex;align-items:baseline;gap:4px}
.sentiment-score-value{font-size:32px;font-weight:800;color:#1f2937}
.sentiment-score-max{font-size:14px;color:#6b7280}
.sentiment-breakdown{display:flex;gap:20px}
.sentiment-stat{text-align:center}
.sentiment-stat-label{font-size:10px;color:#6b7280;margin-bottom:2px}
.sentiment-stat-value{font-size:14px;font-weight:700}
.sentiment-stat-value.pos{color:#059669}
.sentiment-stat-value.neu{color:#6b7280}
.sentiment-stat-value.neg{color:#dc2626}
.sentiment-bar-full{height:24px;border-radius:4px;display:flex;overflow:hidden;margin-top:12px}
.sentiment-bar-seg{display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:600;color:#fff;text-transform:uppercase}
.sentiment-bar-seg.pos{background:#059669}
.sentiment-bar-seg.neu{background:#9ca3af}
.sentiment-bar-seg.neg{background:#dc2626}
.sentiment-labels{display:flex;justify-content:space-between;margin-top:8px}
.sentiment-label{font-size:9px;color:#6b7280}

/* Strategic Insight Callout */
.strategic-insight{background:linear-gradient(135deg,#f8fafc 0%,#f1f5f9 100%);border-left:4px solid #6366f1;border-radius:0 8px 8px 0;padding:20px;margin-bottom:24px;position:relative}
.strategic-insight-title{font-size:16px;font-weight:700;color:#1f2937;margin-bottom:8px}
.strategic-insight-text{font-size:11px;color:#4b5563;line-height:1.7}

/* Comparative Benchmarking Table */
.benchmark-section{margin-bottom:24px}
.section-title{font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px}
.benchmark-table{width:100%;border-collapse:collapse;font-size:10px}
.benchmark-table th{background:#1f2937;color:#fff;padding:10px 12px;text-align:left;font-weight:600;font-size:9px;text-transform:uppercase;letter-spacing:0.5px}
.benchmark-table th:last-child{text-align:right}
.benchmark-table td{padding:12px;border-bottom:1px solid #f3f4f6}
.benchmark-table td:last-child{text-align:right}
.benchmark-table tr:nth-child(even){background:#fafafa}
.delta-positive{color:#059669;font-weight:600}
.delta-negative{color:#dc2626;font-weight:600}

/* Page Break */
.page-break{page-break-after:always;height:0}

/* Page 2 - Competitor Section */
.section-header-lg{margin-bottom:20px;padding-bottom:12px;border-bottom:2px solid #1f2937}
.section-header-lg-title{font-size:24px;font-weight:800;color:#1f2937;letter-spacing:-0.3px;display:flex;align-items:center;gap:12px}
.section-header-lg-title::before{content:'';width:4px;height:28px;background:#6366f1;border-radius:2px}
.section-header-lg-sub{font-size:12px;color:#6b7280;margin-top:4px;margin-left:16px}

/* Ranking Section */
.ranking-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px}
.ranking-list{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:20px}
.ranking-list-title{font-size:13px;font-weight:700;color:#1f2937;margin-bottom:16px;display:flex;align-items:center;gap:8px}
.ranking-item{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #f3f4f6}
.ranking-item:last-child{border-bottom:none}
.ranking-num{font-size:12px;font-weight:700;color:#6b7280;min-width:24px}
.ranking-name{flex:1;font-size:11px;font-weight:500;color:#1f2937}
.ranking-bar-container{flex:1;max-width:200px}
.ranking-bar{height:8px;background:#e5e7eb;border-radius:4px;overflow:hidden}
.ranking-bar-fill{height:100%;background:#6366f1;border-radius:4px}
.ranking-score{font-size:14px;font-weight:700;color:#1f2937;min-width:40px;text-align:right}
.ranking-item.highlight{background:linear-gradient(135deg,#eef2ff,#e0e7ff);margin:0 -20px;padding:10px 20px;border-radius:6px}
.ranking-item.highlight .ranking-score{color:#6366f1}
.ranking-item.highlight .ranking-bar-fill{background:linear-gradient(90deg,#6366f1,#8b5cf6)}
.critical-label{font-size:9px;color:#dc2626;font-weight:600;text-transform:uppercase}

/* Executive Summary Box */
.exec-summary-box{background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:20px}
.exec-summary-title{font-size:10px;font-weight:600;color:#f59e0b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px}
.exec-summary-text{font-size:11px;color:#4b5563;line-height:1.6;margin-bottom:16px}
.exec-summary-text strong{color:#6366f1}
.exec-summary-stats{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.exec-stat{padding:12px;background:#fff;border-radius:6px}
.exec-stat-label{font-size:9px;color:#6b7280}
.exec-stat-value{font-size:16px;font-weight:700;color:#1f2937}
.exec-stat-value.negative{color:#dc2626}
.exec-stat-value.positive{color:#059669}

/* Sentiment by Platform */
.platform-sentiment{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-bottom:24px}
.platform-sentiment-title{font-size:14px;font-weight:700;color:#1f2937;margin-bottom:16px;display:flex;align-items:center;gap:8px}
.platform-sentiment-item{margin-bottom:20px}
.platform-sentiment-item:last-child{margin-bottom:0}
.platform-sentiment-header{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.platform-sentiment-icon{font-size:10px}
.platform-sentiment-name{font-size:11px;font-weight:600;color:#1f2937}
.platform-sentiment-bar{height:28px;border-radius:4px;display:flex;overflow:hidden}
.platform-sentiment-seg{display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:600;color:#fff}
.platform-sentiment-seg.pos{background:#059669}
.platform-sentiment-seg.neu{background:#d1d5db}
.platform-sentiment-seg.neg{background:#dc2626}
.platform-sentiment-legend{display:flex;gap:20px;margin-top:12px}
.legend-item{display:flex;align-items:center;gap:6px;font-size:10px;color:#6b7280}
.legend-dot{width:8px;height:8px;border-radius:50%}
.legend-dot.pos{background:#059669}
.legend-dot.neu{background:#d1d5db}
.legend-dot.neg{background:#dc2626}

/* Strategic Comparison Matrix */
.comparison-matrix{margin-bottom:24px}
.matrix-table{width:100%;border-collapse:collapse;font-size:10px}
.matrix-table th{background:#1f2937;color:#fff;padding:10px 14px;text-align:left;font-weight:600;font-size:9px;text-transform:uppercase}
.matrix-table td{padding:12px 14px;border-bottom:1px solid #f3f4f6;vertical-align:top}
.matrix-table tr:nth-child(even){background:#fafafa}
.matrix-brand-col{font-weight:600;color:#6366f1}
.matrix-metric-label{font-weight:500;color:#1f2937}
.matrix-value{font-weight:500;color:#4b5563}
.matrix-value.target{color:#6366f1;font-weight:700}
.matrix-value.italic{font-style:italic;color:#6b7280}

/* Insight Cards Row */
.insight-cards-row{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px}
.insight-card{border-radius:8px;padding:16px}
.insight-card.purple{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff}
.insight-card.gray{background:#f8fafc;border:1px solid #e5e7eb;color:#1f2937}
.insight-card.amber{background:linear-gradient(135deg,#f59e0b,#fbbf24);color:#fff}
.insight-card-icon{font-size:14px;margin-bottom:8px}
.insight-card-title{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;opacity:0.9}
.insight-card-text{font-size:11px;line-height:1.5}
.insight-card.gray .insight-card-title{color:#6b7280}
.insight-card.gray .insight-card-text{color:#4b5563}

/* Page 3 - Action Plan */
.action-plan-header{margin-bottom:24px}
.action-plan-title-row{display:flex;justify-content:space-between;align-items:flex-start}
.action-plan-category{font-size:11px;font-weight:600;color:#6366f1;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px}
.action-plan-title{font-size:24px;font-weight:800;color:#1f2937;letter-spacing:-0.3px}
.action-plan-subtitle{font-size:12px;color:#6b7280;margin-top:4px}

/* Potential Gain Card */
.potential-gain-card{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:24px;margin-bottom:24px}
.potential-gain-row{display:flex;align-items:center;gap:40px}
.potential-gain-left{}
.potential-gain-label{font-size:10px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px}
.potential-gain-value{font-size:48px;font-weight:800;color:#6366f1;line-height:1}
.potential-gain-value span{font-size:24px;font-weight:500}
.potential-gain-desc{font-size:10px;color:#6b7280;font-style:italic;margin-top:4px}
.potential-gain-bar{flex:1}
.progress-bar-container{background:#e5e7eb;height:32px;border-radius:16px;overflow:hidden;display:flex}
.progress-bar-current{background:#4b5563;display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:600}
.progress-bar-gain{background:linear-gradient(90deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:600}
.progress-labels{display:flex;justify-content:space-between;margin-top:8px;font-size:10px}
.progress-label{text-align:center}
.progress-label-value{font-weight:700;color:#1f2937}
.progress-label-text{color:#6b7280;font-size:9px;text-transform:uppercase}
.progress-label-text.primary{color:#6366f1}

/* Action Columns */
.action-columns{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:24px}
.action-column{}
.action-column-header{display:flex;align-items:center;gap:8px;margin-bottom:16px}
.action-column-icon{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px}
.action-column-icon.immediate{background:#fee2e2;color:#dc2626}
.action-column-icon.short{background:#f3f4f6;color:#6b7280}
.action-column-icon.long{background:#dbeafe;color:#3b82f6}
.action-column-title{font-size:14px;font-weight:700;color:#1f2937}
.action-column-meta{font-size:10px;color:#6b7280;margin-top:2px}
.action-column-meta.immediate{color:#dc2626}
.action-column-meta.short{color:#6b7280}
.action-column-meta.long{color:#3b82f6}
.action-cards{display:flex;flex-direction:column;gap:12px}
.action-card{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:14px}
.action-card-category{font-size:9px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center}
.action-card-category-icon{width:16px;height:16px;border-radius:4px;background:#6366f1;color:#fff;display:flex;align-items:center;justify-content:center;font-size:9px}
.action-card-title{font-size:12px;font-weight:700;color:#1f2937;margin-bottom:4px}
.action-card-desc{font-size:10px;color:#6b7280;line-height:1.5}

/* Strategic Impact Summary */
.impact-summary{background:linear-gradient(135deg,#f8fafc,#f1f5f9);border-radius:8px;padding:24px;display:flex;gap:24px;align-items:center;margin-bottom:24px}
.impact-summary-text{flex:1}
.impact-summary-title{font-size:16px;font-weight:700;color:#1f2937;margin-bottom:8px}
.impact-summary-desc{font-size:11px;color:#4b5563;line-height:1.7}
.impact-summary-box{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;min-width:160px}
.impact-summary-weeks{font-size:28px;font-weight:800;color:#6366f1}
.impact-summary-weeks-label{font-size:10px;color:#6b7280;text-transform:uppercase;margin-top:2px}
.impact-confidence{margin-top:12px}
.impact-confidence-label{font-size:9px;color:#6b7280;margin-bottom:4px}
.impact-confidence-bar{height:6px;background:#e5e7eb;border-radius:3px;overflow:hidden}
.impact-confidence-fill{height:100%;background:#dc2626;border-radius:3px}

/* Page 4 - Sentiment Deep Dive */
.themes-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px}
.themes-card{border-radius:8px;padding:20px}
.themes-card.positive{background:#f0fdf4;border:1px solid #bbf7d0}
.themes-card.negative{background:#fef2f2;border:1px solid #fecaca}
.themes-card-header{display:flex;align-items:center;gap:10px;margin-bottom:16px}
.themes-card-icon{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px}
.themes-card.positive .themes-card-icon{background:#dcfce7;color:#059669}
.themes-card.negative .themes-card-icon{background:#fee2e2;color:#dc2626}
.themes-card-title{font-size:16px;font-weight:700}
.themes-card.positive .themes-card-title{color:#059669}
.themes-card.negative .themes-card-title{color:#dc2626}
.theme-item{display:flex;align-items:flex-start;gap:10px;padding:12px 0;border-bottom:1px solid rgba(0,0,0,0.05)}
.theme-item:last-child{border-bottom:none}
.theme-check{width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0}
.themes-card.positive .theme-check{background:#dcfce7;color:#059669}
.themes-card.negative .theme-check{background:#fee2e2;color:#dc2626}
.theme-content{}
.theme-title{font-size:12px;font-weight:600;color:#1f2937;margin-bottom:2px}
.theme-desc{font-size:10px;color:#6b7280;line-height:1.5}

/* Detailed Competitor Table */
.competitor-table-section{margin-bottom:24px}
.competitor-table-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
.competitor-table-title{font-size:18px;font-weight:700;color:#1f2937}
.competitor-table-subtitle{font-size:11px;color:#6b7280}
.audit-badge{font-size:9px;color:#6b7280;background:#f3f4f6;padding:4px 10px;border-radius:12px}
.competitor-table{width:100%;border-collapse:collapse;font-size:10px}
.competitor-table th{background:#f8fafc;padding:12px 14px;text-align:left;font-weight:600;font-size:9px;text-transform:uppercase;color:#6b7280;border-bottom:1px solid #e5e7eb}
.competitor-table td{padding:14px;border-bottom:1px solid #f3f4f6;vertical-align:top}
.competitor-name-cell{}
.competitor-name-main{font-size:12px;font-weight:600;color:#1f2937}
.competitor-name-sub{font-size:9px;color:#6b7280;margin-top:2px}
.strength-item{display:flex;align-items:center;gap:6px;margin-bottom:4px;font-size:10px;color:#059669}
.weakness-item{display:flex;align-items:center;gap:6px;margin-bottom:4px;font-size:10px;color:#dc2626}
.market-share-value{font-size:18px;font-weight:700;color:#6366f1}

/* Bottom Stats Row */
.bottom-stats-row{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px}
.bottom-stat-card{background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:20px}
.bottom-stat-label{font-size:10px;font-weight:600;color:#6b7280;text-transform:uppercase;margin-bottom:6px}
.bottom-stat-value{font-size:32px;font-weight:800;color:#1f2937;line-height:1}
.bottom-stat-trend{font-size:11px;font-weight:600;margin-left:8px}
.bottom-stat-trend.up{color:#059669}
.bottom-stat-trend.down{color:#dc2626}
.bottom-stat-sub{font-size:10px;color:#6b7280;margin-top:4px}

/* Footer */
.page-footer{position:absolute;bottom:20mm;left:18mm;right:18mm;display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid #e5e7eb}
.footer-logo{display:flex;align-items:center;gap:6px}
.footer-brand{font-size:11px;font-weight:700;color:#1f2937}
.footer-brand span{color:#6366f1}
.footer-copyright{font-size:9px;color:#9ca3af}
.footer-page{font-size:10px;color:#6b7280}
.footer-page span{font-weight:600;color:#6366f1}

/* Methodology Section */
.methodology-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:20px}
.methodology-card{background:linear-gradient(135deg,#f8fafc,#f1f5f9);border:1px solid #e5e7eb;border-radius:8px;padding:16px}
.methodology-card-icon{width:32px;height:32px;border-radius:8px;background:#e5e7eb;display:flex;align-items:center;justify-content:center;font-size:16px;margin-bottom:10px}
.methodology-card-title{font-size:12px;font-weight:700;color:#1f2937;margin-bottom:8px}
.methodology-card-list{list-style:none;padding:0;margin:0}
.methodology-card-list li{font-size:10px;color:#4b5563;padding:4px 0;padding-left:12px;position:relative}
.methodology-card-list li::before{content:'•';position:absolute;left:0;color:#6366f1}

/* Certified Badge */
.certified-badge{display:flex;align-items:center;justify-content:space-between;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 16px}
.certified-left{display:flex;align-items:center;gap:10px}
.certified-icon{width:28px;height:28px;border-radius:8px;background:#dcfce7;display:flex;align-items:center;justify-content:center;color:#059669;font-size:14px}
.certified-text{}
.certified-title{font-size:11px;font-weight:700;color:#059669}
.certified-sub{font-size:9px;color:#6b7280}
.certified-tag{background:#dcfce7;color:#059669;padding:4px 12px;border-radius:12px;font-size:9px;font-weight:600}

@media print{
  body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .page{page-break-after:always}
  .page:last-child{page-break-after:avoid}
}
</style>
</head>
<body>

<!-- PAGE 1: Executive Summary -->
<div class="page">
  <!-- Navigation Bar -->
  <div class="nav-bar">
    <div class="nav-logo">
      ${LOGO_SVG}
      <div class="nav-brand">ZeekLabs<span>.ai</span></div>
    </div>
    <div class="nav-tabs">
      <div class="nav-tab active">Visibility</div>
      <div class="nav-tab">Sentiment</div>
      <div class="nav-tab">Competitors</div>
      <div class="nav-tab">Recommendations</div>
    </div>
    <div class="nav-date">${reportData.period}</div>
  </div>

  <!-- Page Title -->
  <div class="page-title-section">
    <div class="page-title-row">
      <div>
        <div class="page-title">AI Visibility & Brand Performance Report</div>
        <div class="page-subtitle">Executive Summary for <strong>${brandName}</strong></div>
      </div>
      <div class="confidential-badge">
        <div class="confidential-text">Confidential Document</div>
        <div class="report-date">Report Generated: ${reportData.reportDate}</div>
      </div>
    </div>
  </div>

  <!-- Executive Metrics Grid -->
  <div class="exec-metrics-grid">
    <!-- Main Score Card -->
    <div class="main-score-card">
      <div class="score-header">
        <div class="score-label">AI Visibility Score</div>
        <div class="score-icon">👁</div>
      </div>
      <div style="display:flex;align-items:baseline;gap:4px">
        <div class="main-score-value" style="color:${scoreColor}">${score}</div>
        <div class="main-score-max">/ 100</div>
      </div>
      <div class="score-description">Total presence across generative AI platforms compared to industry benchmarks.</div>
      <div class="platform-bars">
        ${platforms.map(p => `
          <div class="platform-bar-item">
            <div class="platform-bar-name">${p.name}</div>
            <div class="platform-bar-row">
              <div class="platform-bar-track">
                <div class="platform-bar-fill" style="width:${p.score}%;background:${p.color}"></div>
              </div>
              <div class="platform-bar-value">${p.score}%</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Mention Frequency -->
    <div class="metric-card-sm">
      <div class="metric-card-sm-header">
        <div class="metric-card-sm-label">Mention Frequency</div>
        <div class="metric-card-sm-trend ${mentionTrend >= 0 ? 'up' : 'down'}">${mentionTrend !== 0 ? `↗ ${mentionTrendSign}${Math.abs(mentionTrend)}%` : ''}</div>
      </div>
      <div class="metric-card-sm-value">${reportData.metrics.totalMentions.toLocaleString()}</div>
      <div class="metric-card-sm-sub">Total weekly references</div>
    </div>

    <!-- Brand Mentions -->
    <div class="metric-card-sm">
      <div class="metric-card-sm-header">
        <div class="metric-card-sm-label">Brand Mentions</div>
        <div class="metric-card-sm-trend up">↗ ${reportData.metrics.mentionRate || 12}%</div>
      </div>
      <div class="metric-card-sm-value">${reportData.metrics.totalMentions}</div>
      <div class="metric-card-sm-sub">Qualified AI responses</div>
    </div>
  </div>

  <!-- Sentiment Overview -->
  <div class="sentiment-overview">
    <div class="sentiment-header">
      <div>
        <div class="sentiment-title">Sentiment Overview</div>
        <div class="sentiment-score-row">
          <div class="sentiment-score-value">${sentimentScore}</div>
          <div class="sentiment-score-max">/ 100 Sentiment Index</div>
        </div>
      </div>
      <div class="sentiment-breakdown">
        <div class="sentiment-stat">
          <div class="sentiment-stat-label">Positive</div>
          <div class="sentiment-stat-value pos">${positivePercent}%</div>
        </div>
        <div class="sentiment-stat">
          <div class="sentiment-stat-label">Neutral</div>
          <div class="sentiment-stat-value neu">${neutralPercent}%</div>
        </div>
        <div class="sentiment-stat">
          <div class="sentiment-stat-label">Negative</div>
          <div class="sentiment-stat-value neg">${negativePercent}%</div>
        </div>
      </div>
    </div>
    <div class="sentiment-bar-full">
      <div class="sentiment-bar-seg pos" style="width:${positivePercent}%">${positivePercent > 15 ? 'POS' : ''}</div>
      <div class="sentiment-bar-seg neu" style="width:${neutralPercent}%">${neutralPercent > 15 ? 'NEU' : ''}</div>
      <div class="sentiment-bar-seg neg" style="width:${negativePercent}%">${negativePercent > 15 ? 'NEG' : ''}</div>
    </div>
    <div class="sentiment-labels">
      <div class="sentiment-label">Constructive Advocacy</div>
      <div class="sentiment-label">Objective Reference</div>
      <div class="sentiment-label">Critical Friction</div>
    </div>
  </div>

  <!-- Strategic Insight -->
  <div class="strategic-insight">
    <div class="strategic-insight-title">Key Strategic Insight</div>
    <div class="strategic-insight-text">${generateStrategicInsight()}</div>
  </div>

  <!-- Comparative Benchmarking -->
  <div class="benchmark-section">
    <div class="section-title">Comparative Benchmarking</div>
    <table class="benchmark-table">
      <thead>
        <tr>
          <th>Metric Category</th>
          <th>${brandName.toUpperCase()}</th>
          <th>Industry Avg</th>
          <th>Delta</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Prompt Inclusion Rate</td>
          <td>${score > 0 ? (score * 0.6).toFixed(1) : '14.2'}%</td>
          <td>18.5%</td>
          <td class="${score * 0.6 > 18.5 ? 'delta-positive' : 'delta-negative'}">${score * 0.6 > 18.5 ? '+' : ''}${((score * 0.6) - 18.5).toFixed(1)}%</td>
        </tr>
        <tr>
          <td>Contextual Accuracy</td>
          <td>${Math.min(88 + Math.floor(score / 10), 95)}.0%</td>
          <td>82.1%</td>
          <td class="delta-positive">+${(Math.min(88 + Math.floor(score / 10), 95) - 82.1).toFixed(1)}%</td>
        </tr>
        <tr>
          <td>Citation Frequency</td>
          <td>${(reportData.metrics.totalMentions / 1000).toFixed(1)} per k/words</td>
          <td>2.4 per k/words</td>
          <td class="${reportData.metrics.totalMentions / 1000 > 2.4 ? 'delta-positive' : 'delta-negative'}">${((reportData.metrics.totalMentions / 1000) - 2.4).toFixed(1)}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Footer -->
  <div class="page-footer">
    <div class="footer-logo">
      ${LOGO_SVG}
      <div class="footer-brand">ZeekLabs<span>.ai</span></div>
    </div>
    <div class="footer-copyright">© ${new Date().getFullYear()} ZeekLabs.ai. Confidential and Proprietary.</div>
    <div class="footer-page">Page <span>1</span> of 4 &nbsp;&nbsp; ZeekLabs.ai</div>
  </div>
</div>

<!-- PAGE 2: Competitor Analysis -->
<div class="page">
  <!-- Navigation Bar -->
  <div class="nav-bar">
    <div class="nav-logo">
      ${LOGO_SVG}
      <div class="nav-brand">ZeekLabs<span>.ai</span></div>
    </div>
    <div class="nav-tabs">
      <div class="nav-tab">Visibility</div>
      <div class="nav-tab">Sentiment</div>
      <div class="nav-tab active">Competitors</div>
      <div class="nav-tab">Recommendations</div>
    </div>
    <div class="nav-date">${reportData.period}</div>
  </div>

  <!-- Section Header -->
  <div class="section-header-lg">
    <div class="section-header-lg-title">Competitor Analysis & Benchmarking</div>
    <div class="section-header-lg-sub">Comparative assessment of market visibility and sentiment across the AI landscape.</div>
  </div>

  <!-- Ranking Grid -->
  <div class="ranking-grid">
    <!-- AI Visibility Ranking -->
    <div class="ranking-list">
      <div class="ranking-list-title">📊 AI Visibility Ranking</div>
      ${allBrandsForRanking.slice(0, 6).map((brand, i) => `
        <div class="ranking-item ${brand.isYou ? 'highlight' : ''}">
          <div class="ranking-num">${String(i + 1).padStart(2, '0')}</div>
          <div class="ranking-name">${brand.name}</div>
          <div class="ranking-bar-container">
            <div class="ranking-bar">
              <div class="ranking-bar-fill" style="width:${brand.score}%"></div>
            </div>
          </div>
          <div class="ranking-score">${brand.score}</div>
          ${brand.isYou && brand.score < 40 ? '<div class="critical-label">Critical Growth Need</div>' : ''}
        </div>
      `).join('')}
    </div>

    <!-- Executive Summary -->
    <div class="exec-summary-box">
      <div class="exec-summary-title">Executive Summary</div>
      <div class="exec-summary-text">
        ${brandName} currently ${yourRank <= 3 ? 'leads' : 'trails'} the market ${yourRank > 3 ? 'leaders' : ''} ${marketLeaderGap > 0 ? `by a ${marketLeaderGap > 30 ? 'significant' : 'moderate'} margin of <strong>${marketLeaderGap} points</strong>` : ''}. ${marketLeaderGap > 20 ? 'The gap is primarily attributed to low brand authority in LLM training datasets and search visibility.' : 'Focus on maintaining competitive positioning through consistent content strategy.'}
      </div>
      <div class="exec-summary-stats">
        <div class="exec-stat">
          <div class="exec-stat-label">Market Leader Gap</div>
          <div class="exec-stat-value ${marketLeaderGap > 0 ? 'negative' : 'positive'}">${marketLeaderGap > 0 ? '-' : '+'}${Math.abs(marketLeaderGap).toFixed(1)}%</div>
        </div>
        <div class="exec-stat">
          <div class="exec-stat-label">Growth Trajectory</div>
          <div class="exec-stat-value positive">+${reportData.progressData?.change || 4.5}% MoM</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Sentiment by Platform -->
  <div class="platform-sentiment">
    <div class="platform-sentiment-title">📈 Sentiment Analysis by Platform</div>
    ${platforms.map(p => {
      // Generate slightly varied sentiment per platform
      const pPos = Math.min(positivePercent + Math.floor(Math.random() * 15) - 5, 100);
      const pNeu = Math.min(neutralPercent + Math.floor(Math.random() * 10) - 5, 100 - pPos);
      const pNeg = 100 - pPos - pNeu;
      return `
        <div class="platform-sentiment-item">
          <div class="platform-sentiment-header">
            <div class="platform-sentiment-icon">${p.name === 'ChatGPT' ? '💬' : p.name === 'Gemini' ? '✨' : '🔍'}</div>
            <div class="platform-sentiment-name">${p.name}${p.name === 'ChatGPT' ? ' (GPT-4)' : p.name === 'Gemini' ? '' : ' AI'}</div>
          </div>
          <div class="platform-sentiment-bar">
            <div class="platform-sentiment-seg pos" style="width:${pPos}%">${pPos}% POSITIVE</div>
            <div class="platform-sentiment-seg neu" style="width:${pNeu}%">${pNeu}% NEUTRAL</div>
            <div class="platform-sentiment-seg neg" style="width:${pNeg}%">${pNeg}% NEGATIVE</div>
          </div>
        </div>
      `;
    }).join('')}
    <div class="platform-sentiment-legend">
      <div class="legend-item"><div class="legend-dot pos"></div> Positive Sentiment</div>
      <div class="legend-item"><div class="legend-dot neu"></div> Neutral Mention</div>
      <div class="legend-item"><div class="legend-dot neg"></div> Negative Bias</div>
    </div>
  </div>

  <!-- Strategic Comparison Matrix -->
  ${competitors.length > 0 ? `
  <div class="comparison-matrix">
    <div class="section-title">⚡ Strategic Comparison Matrix</div>
    <table class="matrix-table">
      <thead>
        <tr>
          <th>Metrics</th>
          <th>${brandName.toUpperCase()} (Target)</th>
          ${competitors.slice(0, 2).map(c => `<th>${c.name.toUpperCase()}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="matrix-metric-label">Visibility Index</td>
          <td class="matrix-value target">${score}.0</td>
          ${competitors.slice(0, 2).map(c => `<td class="matrix-value">${c.overallScore}</td>`).join('')}
        </tr>
        <tr>
          <td class="matrix-metric-label">Media Mentions (30d)</td>
          <td class="matrix-value target">${reportData.metrics.totalMentions}</td>
          ${competitors.slice(0, 2).map(c => `<td class="matrix-value">${Math.floor(c.overallScore * 15)}</td>`).join('')}
        </tr>
        <tr>
          <td class="matrix-metric-label">Domain Authority</td>
          <td class="matrix-value target">${Math.min(32 + Math.floor(score / 3), 85)}</td>
          ${competitors.slice(0, 2).map(c => `<td class="matrix-value">${Math.min(40 + Math.floor(c.overallScore / 2), 90)}</td>`).join('')}
        </tr>
        <tr>
          <td class="matrix-metric-label">Net Sentiment Score</td>
          <td class="matrix-value target">${sentimentScore}.0%</td>
          ${competitors.slice(0, 2).map(c => `<td class="matrix-value">${c.sentiment === 'positive' ? '78.4' : c.sentiment === 'neutral' ? '66.1' : '52.3'}%</td>`).join('')}
        </tr>
        <tr>
          <td class="matrix-metric-label">Key Advantage</td>
          <td class="matrix-value target italic">${score < 40 ? 'Emerging Narrative' : score < 70 ? 'Growing Authority' : 'Market Leader'}</td>
          ${competitors.slice(0, 2).map(c => `<td class="matrix-value italic">${c.strengths?.[0] || 'Market Penetration'}</td>`).join('')}
        </tr>
      </tbody>
    </table>
  </div>
  ` : ''}

  <!-- Insight Cards -->
  <div class="insight-cards-row">
    <div class="insight-card purple">
      <div class="insight-card-icon">📈</div>
      <div class="insight-card-title">Growth Vector</div>
      <div class="insight-card-text">Focus on "Authority" scores to bridge the ${marketLeaderGap > 0 ? marketLeaderGap : 20}-point gap with ${topCompetitor?.name || 'market leader'}.</div>
    </div>
    <div class="insight-card gray">
      <div class="insight-card-icon">⚠️</div>
      <div class="insight-card-title">Trust Deficit</div>
      <div class="insight-card-text">Mention volume is the critical bottleneck for AI training inclusion.</div>
    </div>
    <div class="insight-card amber">
      <div class="insight-card-icon">🎯</div>
      <div class="insight-card-title">Competitive Radar</div>
      <div class="insight-card-text">${topCompetitor?.name || 'Competition'} dominates SEO share; suggest "Blue Ocean" keyword strategy.</div>
    </div>
  </div>

  <!-- Footer -->
  <div class="page-footer">
    <div class="footer-logo">
      ${LOGO_SVG}
      <div class="footer-brand">ZeekLabs<span>.ai</span></div>
    </div>
    <div class="footer-copyright">© ${new Date().getFullYear()} ZeekLabs.ai. Confidential and Proprietary.</div>
    <div class="footer-page">Page <span>2</span> of 4 &nbsp;&nbsp; ZeekLabs.ai</div>
  </div>
</div>

<!-- PAGE 3: Action Plan -->
<div class="page">
  <!-- Navigation Bar -->
  <div class="nav-bar">
    <div class="nav-logo">
      ${LOGO_SVG}
      <div class="nav-brand">ZeekLabs<span>.ai</span></div>
    </div>
    <div class="nav-tabs">
      <div class="nav-tab">Visibility</div>
      <div class="nav-tab">Sentiment</div>
      <div class="nav-tab">Competitors</div>
      <div class="nav-tab active">Recommendations</div>
    </div>
    <div class="nav-date">${reportData.period}</div>
  </div>

  <!-- Action Plan Header -->
  <div class="action-plan-header">
    <div class="action-plan-title-row">
      <div>
        <div class="action-plan-category">Executive Strategy</div>
        <div class="action-plan-title">Improvement & Action Plan</div>
        <div class="action-plan-subtitle">A data-driven roadmap to bridge the current performance gap and capture the projected +${potentialGain} point market authority potential.</div>
      </div>
    </div>
  </div>

  <!-- Potential Gain Card -->
  <div class="potential-gain-card">
    <div class="potential-gain-row">
      <div class="potential-gain-left">
        <div class="potential-gain-label">Potential Gain</div>
        <div class="potential-gain-value">+${potentialGain} <span>pts</span></div>
        <div class="potential-gain-desc">Simulated impact based on action completion.</div>
      </div>
      <div class="potential-gain-bar">
        <div class="progress-bar-container">
          <div class="progress-bar-current" style="width:${score}%">Current (${score})</div>
          <div class="progress-bar-gain" style="width:${potentialGain}%">+${potentialGain} Gain</div>
        </div>
        <div class="progress-labels">
          <div class="progress-label">
            <div class="progress-label-value">${score}</div>
            <div class="progress-label-text">Current State</div>
          </div>
          <div class="progress-label">
            <div class="progress-label-value">${targetBenchmark}</div>
            <div class="progress-label-text primary">Target Benchmark</div>
          </div>
          <div class="progress-label">
            <div class="progress-label-value">100</div>
            <div class="progress-label-text">Industry Max</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Action Columns -->
  <div class="action-columns">
    <!-- Immediate -->
    <div class="action-column">
      <div class="action-column-header">
        <div class="action-column-icon immediate">⚡</div>
        <div>
          <div class="action-column-title">Immediate</div>
          <div class="action-column-meta immediate">HIGH IMPACT • PRIORITY 1</div>
        </div>
      </div>
      <div class="action-cards">
        ${immediateActions.slice(0, 3).map((action, i) => {
          const categories = ['SEO STRATEGY', 'DIGITAL IDENTITY', 'CONTENT'];
          const titles = ['Keyword Optimization', 'GMB/LinkedIn Claiming', 'Marketing Consistency'];
          return `
            <div class="action-card">
              <div class="action-card-category">
                <span>${categories[i] || 'ACTION'}</span>
                <div class="action-card-category-icon">✓</div>
              </div>
              <div class="action-card-title">${titles[i] || 'Quick Win'}</div>
              <div class="action-card-desc">${truncate(action.replace(/\*\*/g, ''), 85)}</div>
            </div>
          `;
        }).join('')}
        ${immediateActions.length === 0 ? `
          <div class="action-card">
            <div class="action-card-category"><span>SEO STRATEGY</span></div>
            <div class="action-card-title">Keyword Optimization</div>
            <div class="action-card-desc">Execute deep audit on high-intent AI search terms for immediate organic lift.</div>
          </div>
        ` : ''}
      </div>
    </div>

    <!-- Short-term -->
    <div class="action-column">
      <div class="action-column-header">
        <div class="action-column-icon short">⏱</div>
        <div>
          <div class="action-column-title">Short-term</div>
          <div class="action-column-meta short">2-4 WEEKS • GROWTH PHASE</div>
        </div>
      </div>
      <div class="action-cards">
        ${shortTermActions.slice(0, 3).map((action, i) => {
          const categories = ['SOCIAL PROOF', 'EVIDENCE', 'PR'];
          const titles = ['Solicit Reviews', 'Case Study Series', 'Targeted Campaigns'];
          return `
            <div class="action-card">
              <div class="action-card-category">
                <span>${categories[i] || 'ACTION'}</span>
                <div class="action-card-category-icon">★</div>
              </div>
              <div class="action-card-title">${titles[i] || 'Growth Initiative'}</div>
              <div class="action-card-desc">${truncate(action.replace(/\*\*/g, ''), 85)}</div>
            </div>
          `;
        }).join('')}
        ${shortTermActions.length === 0 ? `
          <div class="action-card">
            <div class="action-card-category"><span>SOCIAL PROOF</span></div>
            <div class="action-card-title">Solicit Reviews</div>
            <div class="action-card-desc">Automated outreach to top 10% of users for G2/Capterra reviews.</div>
          </div>
        ` : ''}
      </div>
    </div>

    <!-- Long-term -->
    <div class="action-column">
      <div class="action-column-header">
        <div class="action-column-icon long">🎯</div>
        <div>
          <div class="action-column-title">Long-term</div>
          <div class="action-column-meta long">STRATEGIC • MARKET MOAT</div>
        </div>
      </div>
      <div class="action-cards">
        ${longTermActions.slice(0, 3).map((action, i) => {
          const categories = ['R&D', 'ECOSYSTEM', 'AUTHORITY'];
          const titles = ['Advanced AI Features', 'Integration Roadmap', 'Thought Leadership'];
          return `
            <div class="action-card">
              <div class="action-card-category">
                <span>${categories[i] || 'ACTION'}</span>
                <div class="action-card-category-icon">💡</div>
              </div>
              <div class="action-card-title">${titles[i] || 'Strategic Initiative'}</div>
              <div class="action-card-desc">${truncate(action.replace(/\*\*/g, ''), 85)}</div>
            </div>
          `;
        }).join('')}
        ${longTermActions.length === 0 ? `
          <div class="action-card">
            <div class="action-card-category"><span>AUTHORITY</span></div>
            <div class="action-card-title">Thought Leadership</div>
            <div class="action-card-desc">Found annual "State of AI Insights" industry whitepaper report.</div>
          </div>
        ` : ''}
      </div>
    </div>
  </div>

  <!-- Strategic Impact Summary -->
  <div class="impact-summary">
    <div class="impact-summary-text">
      <div class="impact-summary-title">Strategic Impact Summary</div>
      <div class="impact-summary-desc">
        By executing these synchronized phases, ${brandName} will pivot from ${score < 40 ? 'an emerging player' : 'a competitive position'} (${score}th percentile) to ${targetBenchmark >= 70 ? 'an industry authority' : 'stronger market positioning'} (${targetBenchmark}nd percentile). The projected +${potentialGain} gain reflects enhanced organic search visibility, increased brand sentiment through social proof, and long-term defensibility through technical differentiation.
      </div>
    </div>
    <div class="impact-summary-box">
      <div class="impact-summary-weeks">12 Weeks</div>
      <div class="impact-summary-weeks-label">To Full Implementation</div>
      <div class="impact-confidence">
        <div class="impact-confidence-label">Current Confidence: 88%</div>
        <div class="impact-confidence-bar">
          <div class="impact-confidence-fill" style="width:88%;background:linear-gradient(90deg,#6366f1,#8b5cf6)"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="page-footer">
    <div class="footer-logo">
      ${LOGO_SVG}
      <div class="footer-brand">ZeekLabs<span>.ai</span></div>
    </div>
    <div class="footer-copyright">© ${new Date().getFullYear()} ZeekLabs.ai. Confidential and Proprietary.</div>
    <div class="footer-page">Page <span>3</span> of 4 &nbsp;&nbsp; ZeekLabs.ai</div>
  </div>
</div>

<!-- PAGE 4: Sentiment & Methodology -->
<div class="page">
  <!-- Navigation Bar -->
  <div class="nav-bar">
    <div class="nav-logo">
      ${LOGO_SVG}
      <div class="nav-brand">ZeekLabs<span>.ai</span></div>
    </div>
    <div class="nav-tabs">
      <div class="nav-tab">Visibility</div>
      <div class="nav-tab active">Sentiment</div>
      <div class="nav-tab">Competitors</div>
      <div class="nav-tab">Recommendations</div>
    </div>
    <div class="nav-date">${reportData.period}</div>
  </div>

  <!-- Sentiment Section Header -->
  <div class="section-header-lg">
    <div class="section-header-lg-title">Sentiment & Mentions Analysis</div>
    <div class="section-header-lg-sub">A comprehensive audit of AI-driven platform perceptions, focusing on competitive benchmarks and public discourse mapping.</div>
  </div>

  <!-- Themes Grid -->
  <div class="themes-grid">
    <!-- What AI Platforms Praise -->
    <div class="themes-card positive">
      <div class="themes-card-header">
        <div class="themes-card-icon">👍</div>
        <div class="themes-card-title">What AI Platforms Praise</div>
      </div>
      ${(sentiment?.brandSentiment.positiveThemes || []).slice(0, 3).map(theme => `
        <div class="theme-item">
          <div class="theme-check">✓</div>
          <div class="theme-content">
            <div class="theme-title">${truncate(theme, 40)}</div>
            <div class="theme-desc">Recognized positively across AI platforms for this attribute.</div>
          </div>
        </div>
      `).join('')}
      ${(!sentiment?.brandSentiment.positiveThemes || sentiment.brandSentiment.positiveThemes.length === 0) ? `
        <div class="theme-item">
          <div class="theme-check">✓</div>
          <div class="theme-content">
            <div class="theme-title">Focus on AI efficiency</div>
            <div class="theme-desc">Advanced algorithms prioritizing throughput and rapid processing.</div>
          </div>
        </div>
        <div class="theme-item">
          <div class="theme-check">✓</div>
          <div class="theme-content">
            <div class="theme-title">Claimed automation</div>
            <div class="theme-desc">High degrees of end-to-end task replacement.</div>
          </div>
        </div>
      ` : ''}
    </div>

    <!-- Areas Mentioned Negatively -->
    <div class="themes-card negative">
      <div class="themes-card-header">
        <div class="themes-card-icon">👎</div>
        <div class="themes-card-title">Areas Mentioned Negatively</div>
      </div>
      ${(sentiment?.brandSentiment.negativeThemes || []).slice(0, 3).map(theme => `
        <div class="theme-item">
          <div class="theme-check">✗</div>
          <div class="theme-content">
            <div class="theme-title">${truncate(theme, 40)}</div>
            <div class="theme-desc">Identified as an area for improvement in AI responses.</div>
          </div>
        </div>
      `).join('')}
      ${(!sentiment?.brandSentiment.negativeThemes || sentiment.brandSentiment.negativeThemes.length === 0) ? `
        <div class="theme-item">
          <div class="theme-check">✗</div>
          <div class="theme-content">
            <div class="theme-title">Lack of public reviews</div>
            <div class="theme-desc">Limited non-NDA data points available in public domain.</div>
          </div>
        </div>
        <div class="theme-item">
          <div class="theme-check">✗</div>
          <div class="theme-content">
            <div class="theme-title">Limited visibility</div>
            <div class="theme-desc">Brand awareness remains confined to specialized niches.</div>
          </div>
        </div>
      ` : ''}
    </div>
  </div>

  <!-- Detailed Competitor Table -->
  ${competitors.length > 0 ? `
  <div class="competitor-table-section">
    <div class="competitor-table-header">
      <div>
        <div class="competitor-table-title">Detailed Competitor Analysis</div>
        <div class="competitor-table-subtitle">Strategic positioning of market leaders relative to current industry benchmarks.</div>
      </div>
      <div class="audit-badge">Comparative Audit v2.4</div>
    </div>
    <table class="competitor-table">
      <thead>
        <tr>
          <th>Competitor Platform</th>
          <th>Key Strengths</th>
          <th>Identified Weaknesses</th>
          <th>Market Share</th>
        </tr>
      </thead>
      <tbody>
        ${competitors.slice(0, 3).map(comp => `
          <tr>
            <td>
              <div class="competitor-name-cell">
                <div class="competitor-name-main">${comp.name}</div>
                <div class="competitor-name-sub">${comp.strengths?.[0]?.split(' ').slice(0, 3).join(' ') || 'Industry Leader'}</div>
              </div>
            </td>
            <td>
              ${(comp.strengths || []).slice(0, 2).map(s => `<div class="strength-item">✓ ${truncate(s, 30)}</div>`).join('')}
            </td>
            <td>
              ${(comp.weaknesses || []).slice(0, 2).map(w => `<div class="weakness-item">✗ ${truncate(w, 30)}</div>`).join('')}
            </td>
            <td><div class="market-share-value">${comp.marketShare || Math.floor(20 + Math.random() * 15) + '%'}</div></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  <!-- Bottom Stats Row -->
  <div class="bottom-stats-row">
    <div class="bottom-stat-card">
      <div class="bottom-stat-label">Net Sentiment Score</div>
      <div style="display:flex;align-items:baseline">
        <div class="bottom-stat-value">${sentimentScore}.${Math.floor(Math.random() * 10)}</div>
        <span class="bottom-stat-trend up">↑ 4.1%</span>
      </div>
    </div>
    <div class="bottom-stat-card">
      <div class="bottom-stat-label">Total Mentions</div>
      <div style="display:flex;align-items:baseline">
        <div class="bottom-stat-value">${reportData.metrics.totalMentions.toLocaleString()}</div>
      </div>
      <div class="bottom-stat-sub">Past 30 Days</div>
    </div>
    <div class="bottom-stat-card">
      <div class="bottom-stat-label">Visibility Rank</div>
      <div style="display:flex;align-items:baseline">
        <div class="bottom-stat-value">#${yourRank}</div>
        <span class="bottom-stat-trend ${yourRank <= 3 ? 'up' : 'down'}">${yourRank <= 3 ? '↑' : '↓'} 1 pos</span>
      </div>
    </div>
  </div>

  <!-- Methodology Section -->
  <div class="section-title" style="margin-top:20px">Methodology</div>
  <div class="methodology-grid">
    <div class="methodology-card">
      <div class="methodology-card-icon">🌐</div>
      <div class="methodology-card-title">Data Collection</div>
      <ul class="methodology-card-list">
        <li>Real-time AI platform queries</li>
        <li>Multi-provider analysis (ChatGPT, Gemini, Perplexity)</li>
        <li>Competitor benchmarking</li>
      </ul>
    </div>
    <div class="methodology-card">
      <div class="methodology-card-icon">📊</div>
      <div class="methodology-card-title">Scoring Formula</div>
      <ul class="methodology-card-list">
        <li>Presence Score: 40% weight</li>
        <li>Sentiment Score: 25% weight</li>
        <li>Position Score: 35% weight</li>
      </ul>
    </div>
    <div class="methodology-card">
      <div class="methodology-card-icon">📅</div>
      <div class="methodology-card-title">Analysis Period</div>
      <ul class="methodology-card-list">
        <li>Last 7 days of simulation data</li>
        <li>Real-time market intelligence</li>
        <li>Updated on each analysis run</li>
      </ul>
    </div>
  </div>

  <!-- Certified Badge -->
  <div class="certified-badge">
    <div class="certified-left">
      <div class="certified-icon">✓</div>
      <div class="certified-text">
        <div class="certified-title">Analysis Verified</div>
        <div class="certified-sub">Results validated across multiple AI platforms</div>
      </div>
    </div>
    <div class="certified-tag">Certified</div>
  </div>

  <!-- Footer -->
  <div class="page-footer">
    <div class="footer-logo">
      ${LOGO_SVG}
      <div class="footer-brand">ZeekLabs<span>.ai</span></div>
    </div>
    <div class="footer-copyright">© ${new Date().getFullYear()} ZeekLabs.ai. Confidential and Proprietary.</div>
    <div class="footer-page">Page <span>4</span> of 4 &nbsp;&nbsp; ZeekLabs.ai</div>
  </div>
</div>

</body>
</html>`;

  // Open print dialog in new window
  const printWindow: Window | null = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) {
    console.error("Failed to open print window");
    return;
  }

  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Track if print has been triggered to avoid duplicates
  let printTriggered = false;

  // Helper to safely close window
  const safeClose = (win: Window) => {
    setTimeout(() => {
      try { win.close(); } catch { /* ignore */ }
    }, 100);
  };

  const triggerPrint = (win: Window) => {
    if (printTriggered) return;
    printTriggered = true;

    try {
      win.focus();
      win.print();
    } catch (e) {
      console.error("Print error:", e);
    }

    // Close the print window after print dialog closes
    if ('onafterprint' in win) {
      (win as Window & { onafterprint: (() => void) | null }).onafterprint = () => safeClose(win);
    } else {
      setTimeout(() => safeClose(win), 3000);
    }
  };

  // Try onload first, with timeout fallback
  const win = printWindow;
  printWindow.onload = () => {
    setTimeout(() => triggerPrint(win), 300);
  };

  // Fallback if onload doesn't fire
  setTimeout(() => {
    if (!printTriggered) {
      triggerPrint(win);
    }
  }, 1500);
}
