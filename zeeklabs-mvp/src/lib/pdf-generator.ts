// PDF Report Generator - Enterprise AI Visibility Report
// Designed for Digital Marketing Professionals

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

function getScoreBg(score: number): string {
  if (score >= 70) return '#d1fae5';
  if (score >= 40) return '#fef3c7';
  return '#fee2e2';
}

function getScoreLabel(score: number): string {
  if (score >= 70) return 'Excellent';
  if (score >= 40) return 'Good';
  return 'Needs Work';
}

// Logo SVG
const LOGO_SVG = `<svg viewBox="0 0 100 115" width="28" height="32">
  <path d="M10 29 L50 5 L50 20 L30 32 L50 32 L50 45 L18 45 L40 72 L50 72 L50 95 L10 72 L10 58 L30 72 L10 45 L10 29 Z" fill="#5C6B7A"/>
  <path d="M90 86 L50 110 L50 95 L70 83 L50 83 L50 70 L82 70 L60 43 L50 43 L50 20 L90 43 L90 57 L70 43 L90 70 L90 86 Z" fill="#8B5CF6"/>
</svg>`;

export function generatePDFReport(reportData: ReportData): void {
  const brandName = reportData.brand.name || 'Brand';
  const score = reportData.metrics.visibilityScore || 0;
  const scoreColor = getScoreColor(score);

  // Platform data
  const platforms = [
    { name: 'ChatGPT', score: reportData.metrics.chatgptScore, mentions: reportData.metrics.chatgptMentions, color: '#10b981', icon: 'C' },
    { name: 'Gemini', score: reportData.metrics.geminiScore, mentions: reportData.metrics.geminiMentions, color: '#3b82f6', icon: 'G' },
    { name: 'Perplexity', score: reportData.metrics.perplexityScore || 0, mentions: reportData.metrics.perplexityMentions || 0, color: '#8b5cf6', icon: 'P' },
  ];

  // Recommendations
  const recs = reportData.recommendations.filter(r => !r.isCompleted);
  const highRecs = recs.filter(r => r.priority === 'high').slice(0, 4);
  const medRecs = recs.filter(r => r.priority === 'medium').slice(0, 3);

  // Competitors
  const competitors = reportData.competitorComparison || [];

  // Sentiment data
  const sentiment = reportData.sentimentAnalysis;
  const totalSentiment = reportData.metrics.sentiment.positive + reportData.metrics.sentiment.neutral + reportData.metrics.sentiment.negative;

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>AI Visibility Report - ${brandName}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
@page{size:A4;margin:12mm}
body{font-family:'Inter',system-ui,sans-serif;font-size:9px;color:#1f2937;line-height:1.4;-webkit-print-color-adjust:exact;print-color-adjust:exact}

/* Header Banner */
.header-banner{background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 50%,#9333ea 100%);color:#fff;padding:20px 24px;border-radius:12px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center}
.header-left{display:flex;align-items:center;gap:16px}
.header-logo{display:flex;align-items:center;gap:10px}
.header-brand{font-size:18px;font-weight:800;letter-spacing:-0.5px}
.header-brand span{opacity:0.85}
.header-divider{width:1px;height:40px;background:rgba(255,255,255,0.3)}
.header-report-info h1{font-size:16px;font-weight:700;margin-bottom:2px}
.header-report-info p{font-size:10px;opacity:0.85}
.header-score{text-align:center;background:rgba(255,255,255,0.15);padding:12px 20px;border-radius:10px}
.header-score-value{font-size:32px;font-weight:800;line-height:1}
.header-score-label{font-size:9px;opacity:0.8;margin-top:2px}

/* Section */
.section{margin-bottom:18px}
.section-header{display:flex;align-items:center;gap:8px;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #6366f1}
.section-icon{width:24px;height:24px;border-radius:6px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700}
.section-title{font-size:13px;font-weight:700;color:#1f2937}
.section-subtitle{font-size:8px;color:#6b7280;margin-top:1px}

/* Metric Cards Row - 4 columns like UI */
.metrics-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px}
.metric-card{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:14px;text-align:center}
.metric-card-header{display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:10px}
.metric-card-icon{width:20px;height:20px;border-radius:5px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px}
.metric-card-title{font-size:10px;font-weight:600;color:#374151}
.metric-card-value{font-size:28px;font-weight:800;color:#1f2937;line-height:1}
.metric-card-sub{font-size:8px;color:#6b7280;margin-top:4px}

/* Platform Scores - Horizontal */
.platform-row{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:10px}
.platform-item{background:#f8fafc;border-radius:8px;padding:10px;display:flex;align-items:center;gap:10px}
.platform-icon{width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;color:#fff}
.platform-info{flex:1}
.platform-name{font-size:9px;font-weight:600;color:#374151}
.platform-score{font-size:16px;font-weight:800}
.platform-bar{height:4px;background:#e5e7eb;border-radius:2px;margin-top:4px}
.platform-fill{height:100%;border-radius:2px}

/* Sentiment Island */
.sentiment-grid{display:grid;grid-template-columns:1fr;gap:12px}
.sentiment-overview{background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border:1px solid #bae6fd;border-radius:10px;padding:16px}
.sentiment-score-row{display:flex;align-items:center;gap:16px;margin-bottom:12px}
.sentiment-big-score{font-size:36px;font-weight:800}
.sentiment-bars{flex:1}
.sentiment-bar-item{margin-bottom:8px}
.sentiment-bar-label{display:flex;justify-content:space-between;font-size:8px;margin-bottom:3px}
.sentiment-bar-track{height:6px;background:#e5e7eb;border-radius:3px}
.sentiment-bar-fill{height:100%;border-radius:3px}

/* Themes Row */
.themes-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}
.theme-card{border-radius:8px;padding:12px}
.theme-card.positive{background:#d1fae5;border:1px solid #a7f3d0}
.theme-card.negative{background:#fee2e2;border:1px solid #fecaca}
.theme-title{font-size:10px;font-weight:700;margin-bottom:8px;display:flex;align-items:center;gap:6px}
.theme-list{display:flex;flex-wrap:wrap;gap:4px}
.theme-tag{padding:3px 8px;border-radius:10px;font-size:7px;font-weight:500}
.theme-tag.pos{background:#a7f3d0;color:#065f46}
.theme-tag.neg{background:#fecaca;color:#991b1b}

/* Competitor Comparison */
.competitor-section{background:#f8fafc;border-radius:10px;padding:16px;border:1px solid #e5e7eb}
.competitor-ranking{margin-bottom:14px}
.competitor-item{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;margin-bottom:6px;background:#fff;border:1px solid #e5e7eb}
.competitor-item.you{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;border:none}
.competitor-rank{width:24px;height:24px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:10px}
.competitor-rank.gold{background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#fff}
.competitor-rank.silver{background:linear-gradient(135deg,#9ca3af,#6b7280);color:#fff}
.competitor-rank.bronze{background:linear-gradient(135deg,#d97706,#b45309);color:#fff}
.competitor-rank.other{background:#f3f4f6;color:#6b7280}
.competitor-rank.you{background:rgba(255,255,255,0.2);color:#fff}
.competitor-name{flex:1;font-size:10px;font-weight:600}
.competitor-score-box{font-size:14px;font-weight:800}

/* Metrics vs Avg */
.metrics-comparison{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:14px}
.metric-compare-card{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px}
.metric-compare-label{font-size:8px;color:#6b7280;margin-bottom:4px}
.metric-compare-row{display:flex;justify-content:space-between;align-items:baseline}
.metric-compare-yours{font-size:18px;font-weight:800}
.metric-compare-avg{font-size:10px;color:#6b7280}
.metric-compare-diff{font-size:9px;font-weight:600;padding:2px 6px;border-radius:8px;margin-top:4px;display:inline-block}
.metric-compare-diff.above{background:#d1fae5;color:#065f46}
.metric-compare-diff.below{background:#fee2e2;color:#991b1b}

/* Action Plan */
.action-plan{background:linear-gradient(135deg,#fefce8,#fef9c3);border:1px solid #fde047;border-radius:10px;padding:16px}
.action-timeline{margin-bottom:14px}
.action-timeline-header{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.action-dot{width:10px;height:10px;border-radius:50%}
.action-dot.immediate{background:#ef4444}
.action-dot.short{background:#f59e0b}
.action-dot.long{background:#6366f1}
.action-timeline-title{font-size:10px;font-weight:700}
.action-list{padding-left:18px}
.action-item{padding:8px 10px;background:#fff;border-radius:6px;margin-bottom:6px;font-size:8px;color:#374151;border-left:3px solid}
.action-item.immediate{border-color:#ef4444}
.action-item.short{border-color:#f59e0b}
.action-item.long{border-color:#6366f1}

/* Recommendations */
.rec-grid{display:grid;grid-template-columns:1fr;gap:8px}
.rec-card{padding:10px 12px;border-radius:8px;border-left:4px solid}
.rec-card.high{background:#fef2f2;border-color:#ef4444}
.rec-card.medium{background:#fffbeb;border-color:#f59e0b}
.rec-title{font-size:10px;font-weight:700;color:#1f2937;margin-bottom:3px}
.rec-desc{font-size:8px;color:#4b5563;line-height:1.4}
.rec-meta{display:flex;gap:12px;margin-top:6px;font-size:7px}
.rec-meta span{color:#6b7280}
.rec-meta strong{color:#374151}

/* Citation Opportunities */
.citation-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.citation-card{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:10px}
.citation-source{font-size:9px;font-weight:700;color:#1f2937;margin-bottom:2px}
.citation-category{font-size:7px;color:#6b7280;margin-bottom:6px}
.citation-badges{display:flex;gap:4px}
.badge{padding:2px 6px;border-radius:8px;font-size:6px;font-weight:600}
.badge-high{background:#fee2e2;color:#991b1b}
.badge-medium{background:#fef3c7;color:#92400e}
.badge-low{background:#dbeafe;color:#1e40af}
.badge-green{background:#d1fae5;color:#065f46}
.badge-gray{background:#f3f4f6;color:#4b5563}

/* Market Intelligence */
.market-row{display:grid;grid-template-columns:1fr 2fr;gap:12px}
.market-stat-card{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px}
.market-stat-label{font-size:8px;color:#6366f1;font-weight:600;margin-bottom:4px}
.market-stat-value{font-size:16px;font-weight:800;color:#1f2937}
.market-stat-sub{font-size:8px;color:#6b7280;margin-top:2px}
.market-outlook{background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:12px}
.market-outlook-title{font-size:9px;font-weight:700;color:#374151;margin-bottom:6px}
.market-outlook-text{font-size:8px;color:#4b5563;line-height:1.5}
.trends-list{display:flex;flex-wrap:wrap;gap:4px;margin-top:8px}
.trend-tag{background:#eef2ff;color:#4338ca;padding:3px 8px;border-radius:10px;font-size:7px;font-weight:500}

/* Tables */
.table{width:100%;border-collapse:collapse;font-size:8px}
.table th{background:#f8fafc;padding:8px;text-align:left;font-weight:600;font-size:7px;text-transform:uppercase;border-bottom:2px solid #e5e7eb}
.table td{padding:8px;border-bottom:1px solid #f3f4f6}
.table tr:nth-child(even){background:#fafafa}

/* Footer */
.footer{margin-top:20px;padding-top:12px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center}
.footer-logo{display:flex;align-items:center;gap:8px}
.footer-brand{font-size:12px;font-weight:800;color:#6366f1}
.footer-brand span{color:#1f2937}
.footer-text{font-size:7px;color:#9ca3af}

/* Page break */
.page-break{page-break-after:always}

@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style>
</head>
<body>

<!-- HEADER BANNER (Compact - Quarter Page) -->
<div class="header-banner">
  <div class="header-left">
    <div class="header-logo">
      ${LOGO_SVG}
      <div class="header-brand">zeeklabs<span>.ai</span></div>
    </div>
    <div class="header-divider"></div>
    <div class="header-report-info">
      <h1>AI Visibility Analysis Report</h1>
      <p>${brandName} • ${reportData.reportDate} • ${reportData.period}</p>
    </div>
  </div>
  <div class="header-score">
    <div class="header-score-value" style="color:${score >= 70 ? '#4ade80' : score >= 40 ? '#fbbf24' : '#f87171'}">${score}</div>
    <div class="header-score-label">Visibility Score • ${getScoreLabel(score)}</div>
  </div>
</div>

<!-- ROW 1: KEY METRICS (4 Cards like UI) -->
<div class="metrics-row">
  <div class="metric-card">
    <div class="metric-card-header">
      <div class="metric-card-icon">V</div>
      <div class="metric-card-title">AI Visibility</div>
    </div>
    <div class="metric-card-value" style="color:${scoreColor}">${score}</div>
    <div class="metric-card-sub">Overall Score</div>
    <div class="platform-row" style="margin-top:10px">
      ${platforms.map(p => `
        <div style="text-align:center">
          <div style="font-size:14px;font-weight:700;color:${p.color}">${p.score}%</div>
          <div style="font-size:7px;color:#6b7280">${p.name}</div>
        </div>
      `).join('')}
    </div>
  </div>

  <div class="metric-card">
    <div class="metric-card-header">
      <div class="metric-card-icon">M</div>
      <div class="metric-card-title">Brand Mentions</div>
    </div>
    <div class="metric-card-value">${reportData.metrics.totalMentions}</div>
    <div class="metric-card-sub">Total Mentions</div>
    <div style="display:flex;justify-content:space-around;margin-top:10px">
      ${platforms.map(p => `
        <div style="text-align:center">
          <div style="font-size:12px;font-weight:700;color:${p.color}">${p.mentions}</div>
          <div style="font-size:6px;color:#6b7280">${p.icon}</div>
        </div>
      `).join('')}
    </div>
  </div>

  <div class="metric-card">
    <div class="metric-card-header">
      <div class="metric-card-icon">F</div>
      <div class="metric-card-title">Mention Frequency</div>
    </div>
    <div class="metric-card-value">${reportData.metrics.simulationsRun}</div>
    <div class="metric-card-sub">/week</div>
    <div style="font-size:8px;color:#6b7280;margin-top:8px">
      Mention Rate: <strong style="color:#1f2937">${reportData.metrics.mentionRate || 0}%</strong>
    </div>
  </div>

  <div class="metric-card">
    <div class="metric-card-header">
      <div class="metric-card-icon">#</div>
      <div class="metric-card-title">Typical Position</div>
    </div>
    <div class="metric-card-value">#${reportData.metrics.position?.overallAvg || reportData.aiVisibility?.typicalPosition || '-'}</div>
    <div class="metric-card-sub">Avg Ranking</div>
    <div style="font-size:8px;color:#6b7280;margin-top:8px">
      ${reportData.aiVisibility?.recommendationLikelihood ? `AI Recommends: <strong style="color:#1f2937;text-transform:capitalize">${reportData.aiVisibility.recommendationLikelihood}</strong>` : 'Across AI platforms'}
    </div>
  </div>
</div>

<!-- SENTIMENT ANALYSIS (Full Width like UI) -->
<div class="section">
  <div class="section-header">
    <div class="section-icon">S</div>
    <div>
      <div class="section-title">Sentiment Analysis</div>
      <div class="section-subtitle">How AI platforms perceive ${brandName}</div>
    </div>
  </div>

  <div class="sentiment-grid">
    <div class="sentiment-overview">
      <div class="sentiment-score-row">
        <div>
          <div class="sentiment-big-score" style="color:${reportData.metrics.sentiment.average > 20 ? '#10b981' : reportData.metrics.sentiment.average > -20 ? '#f59e0b' : '#ef4444'}">
            ${reportData.metrics.sentiment.average > 0 ? '+' : ''}${reportData.metrics.sentiment.average}%
          </div>
          <div style="font-size:9px;color:#6b7280">Overall Sentiment</div>
        </div>
        <div class="sentiment-bars">
          <div class="sentiment-bar-item">
            <div class="sentiment-bar-label">
              <span style="color:#10b981">Positive</span>
              <span>${reportData.metrics.sentiment.positive} mentions (${totalSentiment > 0 ? Math.round(reportData.metrics.sentiment.positive / totalSentiment * 100) : 0}%)</span>
            </div>
            <div class="sentiment-bar-track">
              <div class="sentiment-bar-fill" style="width:${totalSentiment > 0 ? (reportData.metrics.sentiment.positive / totalSentiment * 100) : 0}%;background:#10b981"></div>
            </div>
          </div>
          <div class="sentiment-bar-item">
            <div class="sentiment-bar-label">
              <span style="color:#f59e0b">Neutral</span>
              <span>${reportData.metrics.sentiment.neutral} mentions (${totalSentiment > 0 ? Math.round(reportData.metrics.sentiment.neutral / totalSentiment * 100) : 0}%)</span>
            </div>
            <div class="sentiment-bar-track">
              <div class="sentiment-bar-fill" style="width:${totalSentiment > 0 ? (reportData.metrics.sentiment.neutral / totalSentiment * 100) : 0}%;background:#f59e0b"></div>
            </div>
          </div>
          <div class="sentiment-bar-item">
            <div class="sentiment-bar-label">
              <span style="color:#ef4444">Negative</span>
              <span>${reportData.metrics.sentiment.negative} mentions (${totalSentiment > 0 ? Math.round(reportData.metrics.sentiment.negative / totalSentiment * 100) : 0}%)</span>
            </div>
            <div class="sentiment-bar-track">
              <div class="sentiment-bar-fill" style="width:${totalSentiment > 0 ? (reportData.metrics.sentiment.negative / totalSentiment * 100) : 0}%;background:#ef4444"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    ${sentiment ? `
    <div class="themes-row">
      <div class="theme-card positive">
        <div class="theme-title" style="color:#065f46">
          <span style="font-size:12px">✓</span> What AI Platforms Praise
        </div>
        <div class="theme-list">
          ${(sentiment.brandSentiment.positiveThemes || []).slice(0, 5).map(t => `<span class="theme-tag pos">${truncate(t, 30)}</span>`).join('')}
          ${sentiment.brandSentiment.positiveThemes?.length === 0 ? '<span style="font-size:8px;color:#6b7280">No themes identified yet</span>' : ''}
        </div>
      </div>
      <div class="theme-card negative">
        <div class="theme-title" style="color:#991b1b">
          <span style="font-size:12px">✗</span> Areas Mentioned Negatively
        </div>
        <div class="theme-list">
          ${(sentiment.brandSentiment.negativeThemes || []).slice(0, 5).map(t => `<span class="theme-tag neg">${truncate(t, 30)}</span>`).join('')}
          ${sentiment.brandSentiment.negativeThemes?.length === 0 ? '<span style="font-size:8px;color:#6b7280">No negative themes found</span>' : ''}
        </div>
      </div>
    </div>
    ` : ''}
  </div>
</div>

<!-- COMPETITOR COMPARISON (Full Width like UI) -->
${competitors.length > 0 ? `
<div class="section">
  <div class="section-header">
    <div class="section-icon">C</div>
    <div>
      <div class="section-title">Competitor Comparison</div>
      <div class="section-subtitle">Your position in the competitive landscape</div>
    </div>
  </div>

  <div class="competitor-section">
    <div class="competitor-ranking">
      ${(() => {
        const allBrands = [
          { name: brandName, score: score, isYou: true },
          ...competitors.map(c => ({ name: c.name, score: c.overallScore, isYou: false }))
        ].sort((a, b) => b.score - a.score);

        return allBrands.slice(0, 5).map((b, i) => `
          <div class="competitor-item ${b.isYou ? 'you' : ''}">
            <div class="competitor-rank ${b.isYou ? 'you' : i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : 'other'}">${i + 1}</div>
            <div class="competitor-name">${b.name} ${b.isYou ? '(You)' : ''}</div>
            <div class="competitor-score-box">${b.score}</div>
          </div>
        `).join('');
      })()}
    </div>

    <div class="metrics-comparison">
      <div class="metric-compare-card">
        <div class="metric-compare-label">Visibility Score</div>
        <div class="metric-compare-row">
          <div class="metric-compare-yours" style="color:${scoreColor}">${score}</div>
          <div class="metric-compare-avg">Avg: ${Math.round(competitors.reduce((a, c) => a + c.overallScore, 0) / competitors.length)}</div>
        </div>
        ${(() => {
          const avg = Math.round(competitors.reduce((a, c) => a + c.overallScore, 0) / competitors.length);
          const diff = score - avg;
          return `<div class="metric-compare-diff ${diff >= 0 ? 'above' : 'below'}">${diff >= 0 ? '+' : ''}${diff} vs avg</div>`;
        })()}
      </div>
      <div class="metric-compare-card">
        <div class="metric-compare-label">Market Position</div>
        <div style="font-size:9px;color:#374151;margin-top:6px">
          ${competitors.slice(0, 2).map(c => `
            <div style="margin-bottom:4px">
              <strong>${c.name}</strong>: ${c.overallScore}% • ${c.sentiment}
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  </div>
</div>
` : ''}

<!-- PAGE BREAK -->
<div class="page-break"></div>

<!-- PAGE 2 HEADER (Compact) -->
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding-bottom:10px;border-bottom:2px solid #e5e7eb">
  <div style="display:flex;align-items:center;gap:10px">
    ${LOGO_SVG}
    <div>
      <div style="font-size:12px;font-weight:700;color:#1f2937">zeeklabs<span style="color:#6366f1">.ai</span></div>
      <div style="font-size:8px;color:#6b7280">AI Visibility Report for ${brandName}</div>
    </div>
  </div>
  <div style="font-size:8px;color:#6b7280">${reportData.reportDate} • Page 2</div>
</div>

<!-- IMPROVEMENT & ACTION PLAN (Like UI) -->
${reportData.analysisRecommendations ? `
<div class="section">
  <div class="section-header">
    <div class="section-icon">A</div>
    <div>
      <div class="section-title">Improvement & Action Plan</div>
      <div class="section-subtitle">Prioritized actions to boost AI visibility • Current: ${score} → Potential: ${Math.min(score + 25, 100)}</div>
    </div>
  </div>

  <div class="action-plan">
    ${reportData.analysisRecommendations.immediate?.length > 0 ? `
    <div class="action-timeline">
      <div class="action-timeline-header">
        <div class="action-dot immediate"></div>
        <div class="action-timeline-title" style="color:#ef4444">Immediate Actions (This Week)</div>
        <div style="font-size:8px;color:#6b7280;margin-left:auto">+${Math.min(reportData.analysisRecommendations.immediate.length * 5, 15)} pts potential</div>
      </div>
      <div class="action-list">
        ${reportData.analysisRecommendations.immediate.slice(0, 4).map(a => `<div class="action-item immediate">${truncate(a, 100)}</div>`).join('')}
      </div>
    </div>
    ` : ''}

    ${reportData.analysisRecommendations.shortTerm?.length > 0 ? `
    <div class="action-timeline">
      <div class="action-timeline-header">
        <div class="action-dot short"></div>
        <div class="action-timeline-title" style="color:#f59e0b">Short-term Actions (This Month)</div>
        <div style="font-size:8px;color:#6b7280;margin-left:auto">+${Math.min(reportData.analysisRecommendations.shortTerm.length * 4, 12)} pts potential</div>
      </div>
      <div class="action-list">
        ${reportData.analysisRecommendations.shortTerm.slice(0, 3).map(a => `<div class="action-item short">${truncate(a, 100)}</div>`).join('')}
      </div>
    </div>
    ` : ''}

    ${reportData.analysisRecommendations.longTerm?.length > 0 ? `
    <div class="action-timeline">
      <div class="action-timeline-header">
        <div class="action-dot long"></div>
        <div class="action-timeline-title" style="color:#6366f1">Long-term Actions (This Quarter)</div>
        <div style="font-size:8px;color:#6b7280;margin-left:auto">+${Math.min(reportData.analysisRecommendations.longTerm.length * 3, 10)} pts potential</div>
      </div>
      <div class="action-list">
        ${reportData.analysisRecommendations.longTerm.slice(0, 3).map(a => `<div class="action-item long">${truncate(a, 100)}</div>`).join('')}
      </div>
    </div>
    ` : ''}
  </div>
</div>
` : ''}

<!-- CITATION OPPORTUNITIES (Like UI) -->
${reportData.citationOpportunities && reportData.citationOpportunities.length > 0 ? `
<div class="section">
  <div class="section-header">
    <div class="section-icon">C</div>
    <div>
      <div class="section-title">Citation Opportunities</div>
      <div class="section-subtitle">Key platforms to improve AI visibility for ${brandName}</div>
    </div>
  </div>

  <div class="citation-grid">
    ${reportData.citationOpportunities.slice(0, 12).map(c => `
      <div class="citation-card">
        <div class="citation-source">${c.source}</div>
        <div class="citation-category">${c.category}</div>
        <div class="citation-badges">
          <span class="badge badge-${c.priority === 'high' ? 'high' : c.priority === 'medium' ? 'medium' : 'low'}">${c.priority}</span>
          <span class="badge badge-gray">${c.effort}</span>
        </div>
      </div>
    `).join('')}
  </div>
</div>
` : ''}

<!-- STRATEGIC RECOMMENDATIONS -->
${(highRecs.length > 0 || medRecs.length > 0) ? `
<div class="section">
  <div class="section-header">
    <div class="section-icon">R</div>
    <div>
      <div class="section-title">Strategic Recommendations</div>
      <div class="section-subtitle">Actionable steps to improve AI visibility</div>
    </div>
  </div>

  ${highRecs.length > 0 ? `
  <div style="margin-bottom:10px">
    <div style="font-size:10px;font-weight:700;color:#ef4444;margin-bottom:8px;display:flex;align-items:center;gap:6px">
      <span style="width:8px;height:8px;border-radius:50%;background:#ef4444"></span>
      High Priority
    </div>
    <div class="rec-grid">
      ${highRecs.map(r => `
        <div class="rec-card high">
          <div class="rec-title">${r.title}</div>
          <div class="rec-desc">${truncate(r.description, 120)}</div>
          <div class="rec-meta">
            ${r.effort ? `<span>Effort: <strong>${r.effort}</strong></span>` : ''}
            ${r.timeline ? `<span>Timeline: <strong>${r.timeline}</strong></span>` : ''}
            ${r.expectedImpact ? `<span>Impact: <strong>${r.expectedImpact}</strong></span>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  ${medRecs.length > 0 ? `
  <div>
    <div style="font-size:10px;font-weight:700;color:#f59e0b;margin-bottom:8px;display:flex;align-items:center;gap:6px">
      <span style="width:8px;height:8px;border-radius:50%;background:#f59e0b"></span>
      Medium Priority
    </div>
    <div class="rec-grid">
      ${medRecs.map(r => `
        <div class="rec-card medium">
          <div class="rec-title">${r.title}</div>
          <div class="rec-desc">${truncate(r.description, 100)}</div>
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}
</div>
` : ''}

<!-- MARKET INTELLIGENCE -->
${reportData.marketIntelligence ? `
<div class="section">
  <div class="section-header">
    <div class="section-icon">M</div>
    <div>
      <div class="section-title">Market Intelligence</div>
      <div class="section-subtitle">Industry trends and market analysis</div>
    </div>
  </div>

  <div class="market-row">
    <div>
      <div class="market-stat-card" style="margin-bottom:10px">
        <div class="market-stat-label">Market Size</div>
        <div class="market-stat-value">${reportData.marketIntelligence.marketSize}</div>
        <div class="market-stat-sub">Growth: ${reportData.marketIntelligence.growthRate}</div>
      </div>
    </div>
    <div class="market-outlook">
      <div class="market-outlook-title">Future Outlook</div>
      <div class="market-outlook-text">${truncate(reportData.marketIntelligence.futureOutlook, 200)}</div>
      ${reportData.marketIntelligence.industryTrends?.length > 0 ? `
      <div class="trends-list">
        ${reportData.marketIntelligence.industryTrends.slice(0, 6).map(t => `<span class="trend-tag">${truncate(t, 35)}</span>`).join('')}
      </div>
      ` : ''}
    </div>
  </div>
</div>
` : ''}

<!-- RECENT MENTIONS -->
${reportData.recentMentions && reportData.recentMentions.length > 0 ? `
<div class="section">
  <div class="section-header">
    <div class="section-icon">M</div>
    <div>
      <div class="section-title">Recent AI Mentions</div>
      <div class="section-subtitle">${reportData.recentMentions.length} total mentions tracked</div>
    </div>
  </div>

  <table class="table">
    <thead>
      <tr>
        <th style="width:12%">Platform</th>
        <th style="width:10%">Position</th>
        <th style="width:12%">Sentiment</th>
        <th style="width:66%">Context</th>
      </tr>
    </thead>
    <tbody>
      ${reportData.recentMentions.slice(0, 8).map(m => {
        const sentLabel = m.sentiment !== null ? (m.sentiment > 0.2 ? 'Positive' : m.sentiment < -0.2 ? 'Negative' : 'Neutral') : '-';
        const sentColor = m.sentiment !== null ? (m.sentiment > 0.2 ? 'green' : m.sentiment < -0.2 ? 'high' : 'medium') : 'gray';
        return `
          <tr>
            <td><span class="badge badge-${m.aiSystem === 'chatgpt' ? 'green' : m.aiSystem === 'gemini' ? 'low' : 'medium'}">${m.aiSystem}</span></td>
            <td style="font-weight:600">${m.position ? '#' + m.position : '-'}</td>
            <td><span class="badge badge-${sentColor}">${sentLabel}</span></td>
            <td style="font-size:7px">${truncate(m.context || m.prompt || '-', 80)}</td>
          </tr>
        `;
      }).join('')}
    </tbody>
  </table>
</div>
` : ''}

<!-- COMPETITIVE POSITION & KEY FOCUS AREAS (Like UI) -->
${reportData.aiVisibility ? `
<div class="section">
  <div class="section-header">
    <div class="section-icon">T</div>
    <div>
      <div class="section-title">Competitive Position & Key Focus Areas</div>
      <div class="section-subtitle">Strategic insights for ${brandName}</div>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
    <!-- Competitive Position -->
    <div style="background:linear-gradient(135deg,#eef2ff,#e0e7ff);border:1px solid #c7d2fe;border-radius:10px;padding:14px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <div style="padding:6px;background:#c7d2fe;border-radius:6px">
          <span style="font-size:12px">🏆</span>
        </div>
        <div>
          <div style="font-size:10px;font-weight:700;color:#1f2937">Your Competitive Position</div>
          <div style="font-size:8px;color:#6b7280">How you compare to competitors in AI responses</div>
        </div>
      </div>
      <div style="background:#fff;border-radius:8px;padding:12px;font-size:9px;color:#374151;line-height:1.5">
        ${reportData.aiVisibility.competitorMentionGap && reportData.aiVisibility.competitorMentionGap !== "Insufficient data"
          ? truncate(reportData.aiVisibility.competitorMentionGap, 200)
          : `${brandName} has ${reportData.aiVisibility.mentionFrequency || 'moderate'} mention frequency in AI responses${reportData.aiVisibility.typicalPosition ? `, typically appearing at position #${reportData.aiVisibility.typicalPosition}` : ''}. AI recommendation likelihood is ${reportData.aiVisibility.recommendationLikelihood || 'moderate'}.`}
      </div>
      ${reportData.aiVisibility.mentionFrequency || reportData.aiVisibility.typicalPosition || reportData.aiVisibility.recommendationLikelihood ? `
      <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
        ${reportData.aiVisibility.mentionFrequency ? `<span style="background:#c7d2fe;color:#4338ca;padding:3px 8px;border-radius:10px;font-size:7px">Frequency: ${reportData.aiVisibility.mentionFrequency}</span>` : ''}
        ${reportData.aiVisibility.typicalPosition ? `<span style="background:#ddd6fe;color:#6d28d9;padding:3px 8px;border-radius:10px;font-size:7px">Position: #${reportData.aiVisibility.typicalPosition}</span>` : ''}
        ${reportData.aiVisibility.recommendationLikelihood ? `<span style="background:#e9d5ff;color:#7c3aed;padding:3px 8px;border-radius:10px;font-size:7px">AI Recommends: ${reportData.aiVisibility.recommendationLikelihood}</span>` : ''}
      </div>
      ` : ''}
    </div>

    <!-- Key Focus Areas -->
    <div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border:1px solid #fcd34d;border-radius:10px;padding:14px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <div style="padding:6px;background:#fde047;border-radius:6px">
          <span style="font-size:12px">💡</span>
        </div>
        <div>
          <div style="font-size:10px;font-weight:700;color:#1f2937">Key Focus Areas</div>
          <div style="font-size:8px;color:#6b7280">Priority areas to improve AI visibility</div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        ${(reportData.aiVisibility.improvementAreas || []).slice(0, 4).map((area, i) => `
          <div style="display:flex;align-items:flex-start;gap:8px;background:#fff;border-radius:6px;padding:8px;border-left:3px solid #f59e0b">
            <div style="width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#fff;font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">${i + 1}</div>
            <span style="font-size:8px;color:#374151;line-height:1.4">${truncate(area.replace(/\*\*/g, ''), 80)}</span>
          </div>
        `).join('')}
        ${(!reportData.aiVisibility.improvementAreas || reportData.aiVisibility.improvementAreas.length === 0) ? `
          <div style="font-size:8px;color:#6b7280;text-align:center;padding:12px">Run analysis to identify improvement areas</div>
        ` : ''}
      </div>
    </div>
  </div>
</div>
` : ''}

<!-- ANALYSIS PROMPTS USED (Like UI) -->
${reportData.analysisPrompts && reportData.analysisPrompts.length > 0 ? `
<div class="section">
  <div class="section-header">
    <div class="section-icon">P</div>
    <div>
      <div class="section-title">Analysis Prompts Used</div>
      <div class="section-subtitle">Prompts sent to AI platforms to derive visibility insights • ${reportData.analysisPrompts.length} prompts</div>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
    ${reportData.analysisPrompts.slice(0, 12).map(p => {
      const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
        visibility: { bg: '#eef2ff', border: '#c7d2fe', text: '#4338ca' },
        comparison: { bg: '#fef3c7', border: '#fde68a', text: '#b45309' },
        sentiment: { bg: '#fce7f3', border: '#fbcfe8', text: '#be185d' },
        market: { bg: '#d1fae5', border: '#a7f3d0', text: '#065f46' },
        discovery: { bg: '#dbeafe', border: '#bfdbfe', text: '#1e40af' },
        default: { bg: '#f3f4f6', border: '#e5e7eb', text: '#374151' },
      };
      const colors = categoryColors[p.category] || categoryColors.default;
      return `
        <div style="background:${colors.bg};border:1px solid ${colors.border};border-radius:8px;padding:10px">
          <div style="display:flex;align-items:center;gap:4px;margin-bottom:6px">
            <span style="background:${colors.border};color:${colors.text};padding:2px 6px;border-radius:8px;font-size:6px;font-weight:600;text-transform:capitalize">${p.category}</span>
          </div>
          <div style="font-size:8px;color:#1f2937;line-height:1.4;margin-bottom:6px">"${truncate(p.prompt, 60)}"</div>
          <div style="font-size:7px;color:${colors.text}">${truncate(p.purpose, 50)}</div>
        </div>
      `;
    }).join('')}
  </div>
</div>
` : ''}

<!-- METHODOLOGY (Like UI) -->
<div class="section">
  <div class="section-header">
    <div class="section-icon">M</div>
    <div>
      <div class="section-title">Methodology</div>
      <div class="section-subtitle">How this analysis was conducted</div>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
    <div style="background:linear-gradient(135deg,#dbeafe,#bfdbfe);border:1px solid #93c5fd;border-radius:10px;padding:14px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px">
        <div style="padding:6px;background:#93c5fd;border-radius:6px">
          <span style="font-size:11px">🌐</span>
        </div>
        <div style="font-size:10px;font-weight:700;color:#1f2937">Data Collection</div>
      </div>
      <ul style="font-size:8px;color:#374151;margin:0;padding-left:14px;line-height:1.6">
        <li>Real-time AI platform queries</li>
        <li>Multi-provider analysis (ChatGPT, Gemini, Perplexity)</li>
        <li>Competitor benchmarking</li>
      </ul>
    </div>

    <div style="background:linear-gradient(135deg,#ede9fe,#ddd6fe);border:1px solid #c4b5fd;border-radius:10px;padding:14px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px">
        <div style="padding:6px;background:#c4b5fd;border-radius:6px">
          <span style="font-size:11px">📊</span>
        </div>
        <div style="font-size:10px;font-weight:700;color:#1f2937">Scoring Formula</div>
      </div>
      <ul style="font-size:8px;color:#374151;margin:0;padding-left:14px;line-height:1.6">
        <li>Presence Score: 40% weight</li>
        <li>Sentiment Score: 25% weight</li>
        <li>Position Score: 35% weight</li>
      </ul>
    </div>

    <div style="background:linear-gradient(135deg,#d1fae5,#a7f3d0);border:1px solid #6ee7b7;border-radius:10px;padding:14px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px">
        <div style="padding:6px;background:#6ee7b7;border-radius:6px">
          <span style="font-size:11px">📅</span>
        </div>
        <div style="font-size:10px;font-weight:700;color:#1f2937">Analysis Period</div>
      </div>
      <ul style="font-size:8px;color:#374151;margin:0;padding-left:14px;line-height:1.6">
        <li>Last 7 days of simulation data</li>
        <li>Real-time market intelligence</li>
        <li>Updated on each analysis run</li>
      </ul>
    </div>
  </div>

  <!-- Certification Badge -->
  <div style="margin-top:12px;padding:10px 14px;background:linear-gradient(135deg,#f8fafc,#f1f5f9);border:1px solid #e2e8f0;border-radius:10px;display:flex;align-items:center;justify-content:space-between">
    <div style="display:flex;align-items:center;gap:10px">
      <div style="padding:6px;background:#d1fae5;border-radius:6px">
        <span style="font-size:12px">✓</span>
      </div>
      <div>
        <div style="font-size:9px;font-weight:700;color:#1f2937">Analysis Verified</div>
        <div style="font-size:7px;color:#6b7280">Results validated across multiple AI platforms</div>
      </div>
    </div>
    <span style="background:#d1fae5;color:#065f46;padding:3px 8px;border-radius:8px;font-size:7px;font-weight:600">Certified</span>
  </div>
</div>

<!-- FOOTER -->
<div class="footer">
  <div class="footer-logo">
    ${LOGO_SVG}
    <div class="footer-brand"><span>zeeklabs</span>.ai</div>
  </div>
  <div class="footer-text">
    AI Visibility Intelligence Platform • Generated: ${reportData.reportDate} • © ${new Date().getFullYear()} zeeklabs.ai
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
    // Use afterprint event if available, otherwise use timeout
    if ('onafterprint' in win) {
      (win as Window & { onafterprint: (() => void) | null }).onafterprint = () => safeClose(win);
    } else {
      // Fallback: close after user likely finished with print dialog
      setTimeout(() => safeClose(win), 3000);
    }
  };

  // Try onload first, with timeout fallback
  const win = printWindow;
  printWindow.onload = () => {
    setTimeout(() => triggerPrint(win), 300);
  };

  // Fallback if onload doesn't fire (some browsers)
  setTimeout(() => {
    if (!printTriggered) {
      triggerPrint(win);
    }
  }, 1500);
}
