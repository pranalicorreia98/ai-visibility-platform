// PDF Report Generator - Comprehensive AI Visibility Report

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
  citations?: Array<{
    source: string;
    type: string;
    url?: string;
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
  backreferences?: Array<{
    platform: string;
    tier: string;
    status: string;
    priority: string;
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
  improvementPlan?: {
    totalRecommendations: number;
    completed: number;
    pending: number;
    highPriority: number;
    platformsNeeded: number;
    platformsPresent: number;
  };
}

// Helper function to generate the Queries section HTML
function generateQueriesSection(promptsTested: ReportData['promptsTested']): string {
  if (!promptsTested || promptsTested.length === 0) {
    return `
    <div class="sec"><div class="sec-icon" style="font-size: 9px;">Q</div><div><div class="sec-title">Queries Tested</div></div></div>
    <div style="background: #f8fafc; border-radius: 6px; padding: 16px; text-align: center; border: 1px solid #e2e8f0;">
      <div style="font-size: 9px; font-weight: 600; color: #6b7280;">No Queries Tested Yet</div>
      <div style="font-size: 7px; color: #9ca3af; margin-top: 4px;">Run simulations in the Prompt Lab to see which queries mention your brand</div>
    </div>`;
  }

  const testedPrompts = promptsTested.filter(p => !p.isSuggested);
  const suggestedPrompts = promptsTested.filter(p => p.isSuggested);
  const testedCount = testedPrompts.length;
  const suggestedCount = suggestedPrompts.length;

  // Generate tested prompts rows
  const testedRows = testedPrompts.slice(0, 5).map(p => {
    const promptText = p.prompt || 'Unknown query';
    const mentionCount = typeof p.mentionCount === 'number' ? p.mentionCount : 0;
    const systems = Array.isArray(p.systems) ? p.systems : [];
    const maxPossible = 3;
    const mentionRate = Math.round((mentionCount / maxPossible) * 100);
    const rateColor = mentionRate >= 67 ? 'green' : mentionRate >= 33 ? 'orange' : 'gray';
    const platformBadges = systems.length > 0
      ? systems.map((s: string) => `<span class="badge badge-${s === 'chatgpt' ? 'green' : s === 'gemini' ? 'blue' : 'purple'}" style="margin-right: 2px;">${s === 'chatgpt' ? 'GPT' : s === 'gemini' ? 'Gem' : 'Pplx'}</span>`).join('')
      : '<span style="font-size: 6px; color: #9ca3af;">No mentions</span>';

    return `
      <tr>
        <td style="font-size: 7px; line-height: 1.4;">${promptText.substring(0, 55)}${promptText.length > 55 ? '...' : ''}</td>
        <td style="text-align: center;"><span class="badge badge-green" style="font-size: 6px;">TESTED</span></td>
        <td style="text-align: center;">
          <span class="badge badge-${rateColor}">${mentionCount}/${maxPossible}</span>
          <div style="font-size: 5px; color: #6b7280; margin-top: 1px;">${mentionRate}%</div>
        </td>
        <td>${platformBadges}</td>
      </tr>`;
  }).join('');

  // Generate suggested prompts rows
  const suggestedRows = suggestedPrompts.slice(0, 5).map(p => {
    const promptText = p.prompt || 'Unknown query';
    const category = p.category || 'general';
    const categoryLabel = category === 'comparison' ? 'Compare' : category === 'recommendation' ? 'Recommend' : category === 'reviews' ? 'Review' : category === 'features' ? 'Features' : 'Market';
    const categoryColor = category === 'comparison' ? 'blue' : category === 'recommendation' ? 'purple' : category === 'reviews' ? 'orange' : category === 'features' ? 'green' : 'gray';

    return `
      <tr style="background: #f8fafc;">
        <td style="font-size: 7px; line-height: 1.4; color: #6b7280;">${promptText.substring(0, 55)}${promptText.length > 55 ? '...' : ''}</td>
        <td style="text-align: center;"><span style="background: #e5e7eb; color: #6b7280; padding: 2px 6px; border-radius: 8px; font-size: 5px; font-weight: 600;">SUGGESTED</span></td>
        <td style="text-align: center;"><span style="font-size: 6px; color: #9ca3af;">Run test</span></td>
        <td><span class="badge badge-${categoryColor}" style="font-size: 5px;">${categoryLabel}</span></td>
      </tr>`;
  }).join('');

  const suggestedNote = suggestedCount > 0
    ? '<div style="font-size: 6px; color: #6b7280; margin-top: 6px; padding: 6px; background: #f0f9ff; border-radius: 4px; border-left: 2px solid #3b82f6;">Suggested queries are high-value prompts commonly asked by users. Test them in the Prompt Lab to improve your AI visibility.</div>'
    : '';

  return `
    <div class="sec"><div class="sec-icon" style="font-size: 9px;">Q</div><div><div class="sec-title">AI Query Analysis (${testedCount} tested${suggestedCount > 0 ? `, ${suggestedCount} suggested` : ''})</div><div class="sec-sub">Tested queries show actual mention results; suggested queries are recommended for testing</div></div></div>
    <table class="table">
      <thead><tr><th style="width: 45%;">Query Prompt</th><th style="width: 15%; text-align: center;">Status</th><th style="width: 15%; text-align: center;">Results</th><th style="width: 25%;">Platforms</th></tr></thead>
      <tbody>
        ${testedRows}
        ${suggestedRows}
      </tbody>
    </table>
    ${suggestedNote}`;
}

export function generatePDFReport(reportData: ReportData): void {
  // Get unique recommendations
  const uniqueRecommendations = reportData.recommendations
    .filter((rec, index, self) => index === self.findIndex(r => r.title === rec.title))
    .filter(rec => !rec.title.toLowerCase().includes('simulation') && !rec.title.toLowerCase().includes('prompt'));

  const highPriorityRecs = uniqueRecommendations.filter(r => r.priority === 'high' && !r.isCompleted).slice(0, 4);
  const mediumPriorityRecs = uniqueRecommendations.filter(r => r.priority === 'medium' && !r.isCompleted).slice(0, 4);
  const lowPriorityRecs = uniqueRecommendations.filter(r => r.priority === 'low' && !r.isCompleted).slice(0, 2);

  const hasPositionData = reportData.metrics.position && (
    reportData.metrics.position.chatgptAvg !== null ||
    reportData.metrics.position.geminiAvg !== null ||
    reportData.metrics.position.perplexityAvg !== null
  );

  const activePlatforms = [
    { name: 'ChatGPT', score: reportData.metrics.chatgptScore, mentions: reportData.metrics.chatgptMentions, color: '#22c55e', bg: '#dcfce7', icon: 'GPT' },
    { name: 'Gemini', score: reportData.metrics.geminiScore, mentions: reportData.metrics.geminiMentions, color: '#3b82f6', bg: '#dbeafe', icon: 'G' },
    { name: 'Perplexity', score: reportData.metrics.perplexityScore || 0, mentions: reportData.metrics.perplexityMentions || 0, color: '#8b5cf6', bg: '#f3e8ff', icon: 'P' },
  ].filter(p => p.mentions > 0 || p.score > 0);

  // Citations by type
  const citationsByType = reportData.citations?.reduce((acc, c) => {
    acc[c.type] = (acc[c.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Backreferences summary
  const backrefPresent = reportData.backreferences?.filter(b => b.status === 'present').length || 0;
  const backrefTotal = reportData.backreferences?.length || 0;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>AI Visibility Report - ${reportData.brand.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4; margin: 10mm; }
    body { font-family: 'Segoe UI', -apple-system, sans-serif; background: #fff; color: #1f2937; line-height: 1.35; font-size: 9px; }
    .container { max-width: 210mm; margin: 0 auto; }

    /* Cover */
    .cover { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; page-break-after: always; padding: 30px; }
    .cover-logo { font-size: 36px; font-weight: 800; }
    .cover-tag { font-size: 12px; opacity: 0.9; margin-bottom: 40px; }
    .cover-title { font-size: 24px; font-weight: 700; margin-bottom: 10px; }
    .cover-brand { font-size: 18px; font-weight: 600; padding: 10px 28px; background: rgba(255,255,255,0.15); border-radius: 8px; margin-bottom: 28px; }
    .cover-score { width: 110px; height: 110px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; flex-direction: column; align-items: center; justify-content: center; border: 3px solid rgba(255,255,255,0.4); }
    .cover-score-val { font-size: 38px; font-weight: 800; }
    .cover-score-lbl { font-size: 10px; opacity: 0.8; }
    .cover-date { font-size: 10px; opacity: 0.8; margin-top: 20px; }

    /* Page */
    .page { padding: 16px 20px; page-break-after: always; }
    .page:last-child { page-break-after: auto; }

    /* Section */
    .sec { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 2px solid #6366f1; }
    .sec-icon { width: 24px; height: 24px; border-radius: 6px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; display: flex; align-items: center; justify-content: center; font-size: 11px; }
    .sec-title { font-size: 13px; font-weight: 700; }
    .sec-sub { font-size: 8px; color: #6b7280; }

    /* Summary */
    .summary { background: #f8fafc; border-radius: 8px; padding: 14px; margin-bottom: 14px; border: 1px solid #e2e8f0; display: grid; grid-template-columns: 80px 1fr; gap: 14px; }
    .score-ring { width: 70px; height: 70px; border-radius: 50%; background: conic-gradient(${reportData.metrics.visibilityScore >= 70 ? '#22c55e' : reportData.metrics.visibilityScore >= 40 ? '#f59e0b' : '#ef4444'} ${reportData.metrics.visibilityScore * 3.6}deg, #e5e7eb ${reportData.metrics.visibilityScore * 3.6}deg); display: flex; align-items: center; justify-content: center; }
    .score-inner { width: 56px; height: 56px; border-radius: 50%; background: white; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .score-val { font-size: 20px; font-weight: 800; }
    .score-lbl { font-size: 6px; color: #6b7280; }
    .summary-brand { font-size: 13px; font-weight: 700; margin-bottom: 2px; }
    .summary-meta { font-size: 8px; color: #6b7280; margin-bottom: 8px; }
    .stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
    .stat { background: white; padding: 6px; border-radius: 4px; text-align: center; border: 1px solid #e5e7eb; }
    .stat-val { font-size: 12px; font-weight: 700; color: #6366f1; }
    .stat-lbl { font-size: 6px; color: #6b7280; text-transform: uppercase; }

    /* Score Breakdown */
    .breakdown { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 14px; }
    .breakdown-item { background: white; border-radius: 6px; padding: 10px; border: 1px solid #e5e7eb; text-align: center; }
    .breakdown-val { font-size: 18px; font-weight: 800; }
    .breakdown-lbl { font-size: 7px; color: #6b7280; }
    .breakdown-weight { font-size: 6px; color: #9ca3af; }

    /* Platforms */
    .platforms { display: grid; grid-template-columns: repeat(${Math.min(activePlatforms.length || 1, 3)}, 1fr); gap: 8px; margin-bottom: 14px; }
    .platform { background: white; border-radius: 6px; padding: 10px; border: 1px solid #e5e7eb; }
    .platform-head { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
    .platform-icon { width: 20px; height: 20px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 8px; }
    .platform-name { font-weight: 600; font-size: 9px; }
    .platform-score { font-size: 22px; font-weight: 800; }
    .platform-bar { height: 4px; background: #f3f4f6; border-radius: 2px; overflow: hidden; margin-bottom: 4px; }
    .platform-fill { height: 100%; border-radius: 2px; }
    .platform-info { font-size: 7px; color: #6b7280; }

    /* AI Visibility Box */
    .ai-vis { background: linear-gradient(135deg, #eef2ff, #e0e7ff); border-radius: 8px; padding: 12px; margin-bottom: 14px; border: 1px solid #c7d2fe; }
    .ai-vis-title { font-size: 10px; font-weight: 700; color: #4338ca; margin-bottom: 8px; }
    .ai-vis-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
    .ai-vis-item { text-align: center; }
    .ai-vis-val { font-size: 12px; font-weight: 700; color: #1f2937; }
    .ai-vis-lbl { font-size: 7px; color: #6b7280; }

    /* Table */
    .table { width: 100%; border-collapse: collapse; font-size: 8px; margin-bottom: 12px; }
    .table th { background: #f8fafc; padding: 5px 6px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb; font-size: 7px; text-transform: uppercase; }
    .table td { padding: 5px 6px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
    .table tr:nth-child(even) { background: #fafafa; }

    /* Badges */
    .badge { padding: 2px 5px; border-radius: 3px; font-size: 7px; font-weight: 600; }
    .badge-green { background: #dcfce7; color: #166534; }
    .badge-blue { background: #dbeafe; color: #1e40af; }
    .badge-purple { background: #f3e8ff; color: #6d28d9; }
    .badge-orange { background: #fef3c7; color: #92400e; }
    .badge-red { background: #fee2e2; color: #991b1b; }
    .badge-gray { background: #f3f4f6; color: #4b5563; }

    /* Recommendations */
    .rec-sec { margin-bottom: 12px; }
    .rec-header { font-size: 10px; font-weight: 700; margin-bottom: 6px; display: flex; align-items: center; gap: 5px; }
    .rec-dot { width: 7px; height: 7px; border-radius: 50%; }
    .recs { display: flex; flex-direction: column; gap: 6px; }
    .rec { padding: 8px 10px; border-radius: 6px; border-left: 3px solid; }
    .rec.high { border-color: #ef4444; background: #fef2f2; }
    .rec.medium { border-color: #f59e0b; background: #fffbeb; }
    .rec.low { border-color: #6366f1; background: #eef2ff; }
    .rec-title { font-weight: 700; font-size: 9px; margin-bottom: 3px; color: #1f2937; }
    .rec-desc { font-size: 7px; color: #4b5563; line-height: 1.3; margin-bottom: 4px; }
    .rec-meta { display: flex; gap: 10px; font-size: 6px; }
    .rec-meta-item { display: flex; align-items: center; gap: 2px; }
    .rec-meta-lbl { color: #9ca3af; }
    .rec-meta-val { color: #374151; font-weight: 600; }

    /* Competitors */
    .comp-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 12px; }
    .comp { background: white; border-radius: 6px; padding: 8px; border: 1px solid #e5e7eb; }
    .comp-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .comp-name { font-weight: 600; font-size: 9px; }
    .comp-score { font-weight: 700; font-size: 11px; padding: 2px 6px; border-radius: 8px; }
    .comp-details { font-size: 7px; color: #6b7280; }
    .comp-list { font-size: 6px; color: #4b5563; margin-top: 4px; padding-left: 10px; }

    /* Market */
    .market-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
    .market-card { background: white; border-radius: 6px; padding: 8px; border: 1px solid #e5e7eb; }
    .market-title { font-weight: 600; font-size: 8px; color: #6366f1; margin-bottom: 4px; }
    .market-stat { font-size: 14px; font-weight: 700; }
    .market-text { font-size: 7px; color: #4b5563; line-height: 1.25; }

    /* Sentiment Deep Dive */
    .sentiment-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px; }
    .sentiment-card { background: white; border-radius: 6px; padding: 8px; border: 1px solid #e5e7eb; }
    .sentiment-title { font-weight: 600; font-size: 8px; margin-bottom: 6px; }
    .theme { display: inline-block; padding: 2px 5px; border-radius: 3px; margin: 1px; font-size: 6px; }
    .theme-pos { background: #dcfce7; color: #166534; }
    .theme-neg { background: #fee2e2; color: #991b1b; }
    .theme-neu { background: #f3f4f6; color: #4b5563; }

    /* Backreferences */
    .backref-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 12px; }
    .backref { background: white; border-radius: 5px; padding: 6px; border: 1px solid #e5e7eb; text-align: center; }
    .backref-platform { font-weight: 600; font-size: 8px; margin-bottom: 2px; }
    .backref-status { font-size: 7px; }

    /* Citations */
    .citation-grid { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 12px; }
    .citation { background: white; border: 1px solid #e5e7eb; border-radius: 4px; padding: 4px 8px; font-size: 7px; }

    /* Trends */
    .trends { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 12px; }
    .trend { background: #eef2ff; color: #4338ca; padding: 3px 8px; border-radius: 10px; font-size: 7px; }

    /* Footer */
    .footer { text-align: center; padding: 16px 0; border-top: 1px solid #e5e7eb; margin-top: 16px; }
    .footer-logo { font-size: 12px; font-weight: 800; color: #6366f1; }
    .footer-text { font-size: 7px; color: #9ca3af; margin-top: 2px; }

    @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } .cover { min-height: 100vh; } }
  </style>
</head>
<body>
<div class="container">

  <!-- COVER -->
  <div class="cover">
    <div class="cover-logo">ZeekLabs.ai</div>
    <div class="cover-tag">AI Visibility Intelligence Platform</div>
    <div class="cover-title">AI Visibility Report</div>
    <div class="cover-brand">${reportData.brand.name}</div>
    <div class="cover-score">
      <div class="cover-score-val">${reportData.metrics.visibilityScore}</div>
      <div class="cover-score-lbl">Visibility Score</div>
    </div>
    <div class="cover-date">Generated: ${reportData.reportDate} | Period: ${reportData.period}</div>
  </div>

  <!-- PAGE 1: EXECUTIVE SUMMARY -->
  <div class="page">
    <div class="sec">
      <div class="sec-icon">📊</div>
      <div><div class="sec-title">Executive Summary</div><div class="sec-sub">Key metrics and performance overview</div></div>
    </div>

    <div class="summary">
      <div class="score-ring"><div class="score-inner"><div class="score-val">${reportData.metrics.visibilityScore}</div><div class="score-lbl">OVERALL</div></div></div>
      <div>
        <div class="summary-brand">${reportData.brand.name}</div>
        <div class="summary-meta">${reportData.brand.domain ? `🌐 ${reportData.brand.domain} | ` : ''}📅 ${reportData.reportDate}</div>
        <div class="stats">
          <div class="stat"><div class="stat-val">${reportData.metrics.totalMentions}</div><div class="stat-lbl">Mentions</div></div>
          <div class="stat"><div class="stat-val">${reportData.metrics.simulationsRun}</div><div class="stat-lbl">Queries</div></div>
          <div class="stat"><div class="stat-val">${reportData.metrics.sentiment.average > 0 ? '+' : ''}${reportData.metrics.sentiment.average}%</div><div class="stat-lbl">Sentiment</div></div>
          <div class="stat"><div class="stat-val">${reportData.metrics.position?.overallAvg ? '#' + reportData.metrics.position.overallAvg : '-'}</div><div class="stat-lbl">Avg Rank</div></div>
          <div class="stat"><div class="stat-val">${reportData.metrics.mentionRate || 0}%</div><div class="stat-lbl">Mention Rate</div></div>
        </div>
      </div>
    </div>

    ${reportData.metrics.scoreBreakdown ? `
    <div class="breakdown">
      <div class="breakdown-item">
        <div class="breakdown-val" style="color: #22c55e;">${reportData.metrics.scoreBreakdown.presence}%</div>
        <div class="breakdown-lbl">Presence Score</div>
        <div class="breakdown-weight">Weight: 40%</div>
      </div>
      <div class="breakdown-item">
        <div class="breakdown-val" style="color: #f59e0b;">${reportData.metrics.scoreBreakdown.sentiment}%</div>
        <div class="breakdown-lbl">Sentiment Score</div>
        <div class="breakdown-weight">Weight: 25%</div>
      </div>
      <div class="breakdown-item">
        <div class="breakdown-val" style="color: #3b82f6;">${reportData.metrics.scoreBreakdown.position}%</div>
        <div class="breakdown-lbl">Position Score</div>
        <div class="breakdown-weight">Weight: 35%</div>
      </div>
    </div>
    ` : ''}

    <!-- AI Visibility Insights Section - Professional Design without emoji dependencies -->
    ${(reportData.aiVisibility || reportData.aiScores) ? `
    <div style="background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 50%, #c7d2fe 100%); border-radius: 10px; padding: 14px; margin-bottom: 14px; border: 1px solid #a5b4fc; box-shadow: 0 2px 8px rgba(99,102,241,0.1);">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #c7d2fe;">
        <span style="display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 5px; color: white; font-size: 10px; font-weight: 700;">AI</span>
        <span style="font-size: 11px; font-weight: 700; color: #4338ca;">AI Visibility Insights</span>
        <span style="font-size: 7px; color: #6366f1; margin-left: auto;">Powered by AI Analysis</span>
      </div>

      <!-- Primary Metrics Row -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 12px;">
        ${reportData.aiVisibility?.mentionFrequency && reportData.aiVisibility.mentionFrequency !== 'N/A' ? `
        <div style="background: white; border-radius: 8px; padding: 10px; text-align: center; border: 1px solid #e0e7ff;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; background: #dbeafe; border-radius: 50%; color: #3b82f6; font-size: 9px; font-weight: 700; margin-bottom: 4px;">M</div>
          <div style="font-size: 12px; font-weight: 700; color: #4338ca;">${reportData.aiVisibility.mentionFrequency}</div>
          <div style="font-size: 7px; color: #6b7280;">Mention Frequency</div>
        </div>
        ` : ''}
        ${reportData.aiVisibility?.typicalPosition !== null && reportData.aiVisibility?.typicalPosition !== undefined ? `
        <div style="background: white; border-radius: 8px; padding: 10px; text-align: center; border: 1px solid #e0e7ff;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; background: ${reportData.aiVisibility.typicalPosition <= 3 ? '#dcfce7' : reportData.aiVisibility.typicalPosition <= 5 ? '#fef3c7' : '#fee2e2'}; border-radius: 50%; color: ${reportData.aiVisibility.typicalPosition <= 3 ? '#22c55e' : reportData.aiVisibility.typicalPosition <= 5 ? '#f59e0b' : '#ef4444'}; font-size: 9px; font-weight: 700; margin-bottom: 4px;">#</div>
          <div style="font-size: 12px; font-weight: 700; color: ${reportData.aiVisibility.typicalPosition <= 3 ? '#22c55e' : reportData.aiVisibility.typicalPosition <= 5 ? '#f59e0b' : '#ef4444'};">#${reportData.aiVisibility.typicalPosition}</div>
          <div style="font-size: 7px; color: #6b7280;">Typical Position</div>
        </div>
        ` : ''}
        ${reportData.aiVisibility?.recommendationLikelihood && reportData.aiVisibility.recommendationLikelihood !== 'N/A' ? `
        <div style="background: white; border-radius: 8px; padding: 10px; text-align: center; border: 1px solid #e0e7ff;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; background: #dcfce7; border-radius: 50%; color: #22c55e; font-size: 11px; font-weight: 700; margin-bottom: 4px;">*</div>
          <div style="font-size: 12px; font-weight: 700; color: #22c55e;">${reportData.aiVisibility.recommendationLikelihood}</div>
          <div style="font-size: 7px; color: #6b7280;">AI Recommends</div>
        </div>
        ` : ''}
        ${reportData.aiVisibility?.competitorMentionGap && reportData.aiVisibility.competitorMentionGap !== 'N/A' ? `
        <div style="background: white; border-radius: 8px; padding: 10px; text-align: center; border: 1px solid #e0e7ff;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; background: #f3e8ff; border-radius: 50%; color: #8b5cf6; font-size: 11px; font-weight: 700; margin-bottom: 4px;">^</div>
          <div style="font-size: 12px; font-weight: 700; color: #6366f1;">${reportData.aiVisibility.competitorMentionGap}</div>
          <div style="font-size: 7px; color: #6b7280;">vs Competitors</div>
        </div>
        ` : ''}
      </div>

      ${reportData.aiScores ? `
      <!-- AI Scores Grid -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px;">
        <div style="background: white; border-radius: 6px; padding: 8px; border: 1px solid #e0e7ff;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 7px; color: #6b7280;">Brand Awareness</span>
            <span style="font-size: 9px; font-weight: 700; color: #4338ca;">${reportData.aiScores.brandAwareness || 0}%</span>
          </div>
          <div style="height: 4px; background: #e5e7eb; border-radius: 2px; overflow: hidden;">
            <div style="height: 100%; width: ${reportData.aiScores.brandAwareness || 0}%; background: linear-gradient(90deg, #6366f1, #8b5cf6); border-radius: 2px;"></div>
          </div>
        </div>
        <div style="background: white; border-radius: 6px; padding: 8px; border: 1px solid #e0e7ff;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 7px; color: #6b7280;">Market Position</span>
            <span style="font-size: 9px; font-weight: 700; color: #4338ca;">${reportData.aiScores.marketPosition || 0}%</span>
          </div>
          <div style="height: 4px; background: #e5e7eb; border-radius: 2px; overflow: hidden;">
            <div style="height: 100%; width: ${reportData.aiScores.marketPosition || 0}%; background: linear-gradient(90deg, #6366f1, #8b5cf6); border-radius: 2px;"></div>
          </div>
        </div>
        <div style="background: white; border-radius: 6px; padding: 8px; border: 1px solid #e0e7ff;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 7px; color: #6b7280;">Authority Score</span>
            <span style="font-size: 9px; font-weight: 700; color: #4338ca;">${reportData.aiScores.authorityScore || 0}%</span>
          </div>
          <div style="height: 4px; background: #e5e7eb; border-radius: 2px; overflow: hidden;">
            <div style="height: 100%; width: ${reportData.aiScores.authorityScore || 0}%; background: linear-gradient(90deg, #6366f1, #8b5cf6); border-radius: 2px;"></div>
          </div>
        </div>
        <div style="background: white; border-radius: 6px; padding: 8px; border: 1px solid #e0e7ff;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 7px; color: #6b7280;">Content Visibility</span>
            <span style="font-size: 9px; font-weight: 700; color: #4338ca;">${reportData.aiScores.contentVisibility || 0}%</span>
          </div>
          <div style="height: 4px; background: #e5e7eb; border-radius: 2px; overflow: hidden;">
            <div style="height: 100%; width: ${reportData.aiScores.contentVisibility || 0}%; background: linear-gradient(90deg, #6366f1, #8b5cf6); border-radius: 2px;"></div>
          </div>
        </div>
        <div style="background: white; border-radius: 6px; padding: 8px; border: 1px solid #e0e7ff;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 7px; color: #6b7280;">Social Presence</span>
            <span style="font-size: 9px; font-weight: 700; color: #4338ca;">${reportData.aiScores.socialPresence || 0}%</span>
          </div>
          <div style="height: 4px; background: #e5e7eb; border-radius: 2px; overflow: hidden;">
            <div style="height: 100%; width: ${reportData.aiScores.socialPresence || 0}%; background: linear-gradient(90deg, #6366f1, #8b5cf6); border-radius: 2px;"></div>
          </div>
        </div>
        <div style="background: white; border-radius: 6px; padding: 8px; border: 1px solid #e0e7ff;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 7px; color: #6b7280;">Sentiment Score</span>
            <span style="font-size: 9px; font-weight: 700; color: #4338ca;">${reportData.aiScores.sentimentScore || 0}%</span>
          </div>
          <div style="height: 4px; background: #e5e7eb; border-radius: 2px; overflow: hidden;">
            <div style="height: 100%; width: ${reportData.aiScores.sentimentScore || 0}%; background: linear-gradient(90deg, #6366f1, #8b5cf6); border-radius: 2px;"></div>
          </div>
        </div>
      </div>
      ` : ''}

      ${reportData.aiVisibility?.improvementAreas && reportData.aiVisibility.improvementAreas.length > 0 ? `
      <!-- Improvement Areas -->
      <div style="background: rgba(255,255,255,0.7); border-radius: 6px; padding: 8px; border: 1px solid #e0e7ff;">
        <div style="font-size: 8px; font-weight: 600; color: #4338ca; margin-bottom: 6px;">Key Improvement Areas</div>
        <div style="display: flex; flex-wrap: wrap; gap: 4px;">
          ${reportData.aiVisibility.improvementAreas.slice(0, 6).map((area: string) => `
            <span style="background: linear-gradient(135deg, #fef3c7, #fde68a); color: #92400e; padding: 3px 8px; border-radius: 10px; font-size: 7px; font-weight: 500; border: 1px solid #fcd34d;">${area}</span>
          `).join('')}
        </div>
      </div>
      ` : ''}
    </div>
    ` : reportData.metrics.totalMentions > 0 ? `
    <!-- Prompt to run AI Analysis -->
    <div style="background: linear-gradient(135deg, #f5f3ff, #ede9fe); border-radius: 8px; padding: 12px; margin-bottom: 14px; border: 1px dashed #c4b5fd; text-align: center;">
      <span style="display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 5px; color: white; font-size: 10px; font-weight: 700; margin-right: 6px;">AI</span>
      <span style="font-size: 9px; color: #6d28d9; font-weight: 600;">Run AI Visibility Analysis for deeper insights</span>
      <div style="font-size: 7px; color: #7c3aed; margin-top: 4px;">Get detailed AI scores, competitor comparison, and improvement recommendations</div>
    </div>
    ` : ''}

    ${activePlatforms.length > 0 ? `
    <div class="sec">
      <div class="sec-icon">🤖</div>
      <div><div class="sec-title">Platform Performance</div></div>
    </div>
    <div class="platforms">
      ${activePlatforms.map(p => `
        <div class="platform">
          <div class="platform-head">
            <div class="platform-icon" style="background: ${p.bg}; color: ${p.color};">${p.icon}</div>
            <div class="platform-name">${p.name}</div>
          </div>
          <div class="platform-score" style="color: ${p.color};">${p.score}%</div>
          <div class="platform-bar"><div class="platform-fill" style="width: ${p.score}%; background: ${p.color};"></div></div>
          <div class="platform-info">${p.mentions} mentions | Avg #${reportData.metrics.position?.[p.name.toLowerCase() + 'Avg' as keyof typeof reportData.metrics.position] || '-'}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${hasPositionData ? `
    <div class="sec"><div class="sec-icon">#</div><div><div class="sec-title">Position Analysis</div></div></div>
    <table class="table">
      <thead><tr><th>Platform</th><th>Avg Position</th><th>Top 3</th><th>Pos 4-5</th><th>Pos 6+</th></tr></thead>
      <tbody>
        ${reportData.metrics.position?.chatgptAvg !== null ? `<tr><td><strong style="color:#22c55e;">ChatGPT</strong></td><td>#${reportData.metrics.position?.chatgptAvg}</td><td><span class="badge badge-green">${reportData.metrics.position?.distribution.chatgpt.top3}</span></td><td><span class="badge badge-orange">${reportData.metrics.position?.distribution.chatgpt.top5}</span></td><td><span class="badge badge-red">${reportData.metrics.position?.distribution.chatgpt.beyond5}</span></td></tr>` : ''}
        ${reportData.metrics.position?.geminiAvg !== null ? `<tr><td><strong style="color:#3b82f6;">Gemini</strong></td><td>#${reportData.metrics.position?.geminiAvg}</td><td><span class="badge badge-green">${reportData.metrics.position?.distribution.gemini.top3}</span></td><td><span class="badge badge-orange">${reportData.metrics.position?.distribution.gemini.top5}</span></td><td><span class="badge badge-red">${reportData.metrics.position?.distribution.gemini.beyond5}</span></td></tr>` : ''}
        ${reportData.metrics.position?.perplexityAvg !== null ? `<tr><td><strong style="color:#8b5cf6;">Perplexity</strong></td><td>#${reportData.metrics.position?.perplexityAvg}</td><td><span class="badge badge-green">${reportData.metrics.position?.distribution.perplexity?.top3 || 0}</span></td><td><span class="badge badge-orange">${reportData.metrics.position?.distribution.perplexity?.top5 || 0}</span></td><td><span class="badge badge-red">${reportData.metrics.position?.distribution.perplexity?.beyond5 || 0}</span></td></tr>` : ''}
      </tbody>
    </table>
    ` : ''}

    ${reportData.metrics.totalMentions > 0 ? `
    <div class="sec"><div class="sec-icon">💭</div><div><div class="sec-title">Sentiment Distribution</div></div></div>
    <div style="display: grid; grid-template-columns: 100px 1fr; gap: 10px; margin-bottom: 14px;">
      <div style="background: white; border-radius: 6px; padding: 12px; border: 1px solid #e5e7eb; text-align: center;">
        <div style="font-size: 24px; font-weight: 800; color: ${reportData.metrics.sentiment.average > 20 ? '#22c55e' : reportData.metrics.sentiment.average > -20 ? '#f59e0b' : '#ef4444'};">${reportData.metrics.sentiment.average > 0 ? '+' : ''}${reportData.metrics.sentiment.average}%</div>
        <div style="font-size: 8px; color: #6b7280;">Avg Sentiment</div>
      </div>
      <div style="background: white; border-radius: 6px; padding: 10px; border: 1px solid #e5e7eb;">
        <div style="margin-bottom: 6px;"><div style="display: flex; justify-content: space-between; font-size: 8px; margin-bottom: 2px;"><span style="color: #22c55e;">Positive</span><span>${reportData.metrics.sentiment.positive}</span></div><div style="height: 4px; background: #f3f4f6; border-radius: 2px;"><div style="height: 100%; background: #22c55e; border-radius: 2px; width: ${reportData.metrics.totalMentions > 0 ? (reportData.metrics.sentiment.positive / reportData.metrics.totalMentions) * 100 : 0}%;"></div></div></div>
        <div style="margin-bottom: 6px;"><div style="display: flex; justify-content: space-between; font-size: 8px; margin-bottom: 2px;"><span style="color: #f59e0b;">Neutral</span><span>${reportData.metrics.sentiment.neutral}</span></div><div style="height: 4px; background: #f3f4f6; border-radius: 2px;"><div style="height: 100%; background: #f59e0b; border-radius: 2px; width: ${reportData.metrics.totalMentions > 0 ? (reportData.metrics.sentiment.neutral / reportData.metrics.totalMentions) * 100 : 0}%;"></div></div></div>
        <div><div style="display: flex; justify-content: space-between; font-size: 8px; margin-bottom: 2px;"><span style="color: #ef4444;">Negative</span><span>${reportData.metrics.sentiment.negative}</span></div><div style="height: 4px; background: #f3f4f6; border-radius: 2px;"><div style="height: 100%; background: #ef4444; border-radius: 2px; width: ${reportData.metrics.totalMentions > 0 ? (reportData.metrics.sentiment.negative / reportData.metrics.totalMentions) * 100 : 0}%;"></div></div></div>
      </div>
    </div>
    ` : ''}
  </div>

  <!-- PAGE 2: ANALYSIS & COMPETITORS -->
  <div class="page">
    ${reportData.sentimentAnalysis ? `
    <div class="sec"><div class="sec-icon">💬</div><div><div class="sec-title">Sentiment Deep Dive</div></div></div>
    <div class="sentiment-grid">
      <div class="sentiment-card">
        <div class="sentiment-title" style="color: #22c55e;">✅ What AI Says Positively</div>
        ${reportData.sentimentAnalysis.brandSentiment.positiveThemes.slice(0, 5).map(t => `<span class="theme theme-pos">${t}</span>`).join('')}
      </div>
      <div class="sentiment-card">
        <div class="sentiment-title" style="color: #ef4444;">⚠️ Areas of Concern</div>
        ${reportData.sentimentAnalysis.brandSentiment.negativeThemes.slice(0, 5).map(t => `<span class="theme theme-neg">${t}</span>`).join('')}
      </div>
      <div class="sentiment-card">
        <div class="sentiment-title">💡 Customer Perception</div>
        <div style="font-size: 8px;"><strong>Satisfaction:</strong> ${reportData.sentimentAnalysis.customerSentiment.satisfaction}%</div>
        <div style="font-size: 8px;"><strong>NPS:</strong> ${reportData.sentimentAnalysis.customerSentiment.nps}</div>
        ${reportData.sentimentAnalysis.customerSentiment.commonPraises.slice(0, 2).map(p => `<span class="theme theme-pos">${p}</span>`).join('')}
      </div>
    </div>
    ` : ''}

    ${reportData.competitorComparison && reportData.competitorComparison.length > 0 ? `
    <div class="sec"><div class="sec-icon">👥</div><div><div class="sec-title">Competitive Landscape</div></div></div>
    <div class="comp-grid">
      ${reportData.competitorComparison.slice(0, 4).map(c => `
        <div class="comp">
          <div class="comp-head">
            <div class="comp-name">${c.name}</div>
            <div class="comp-score" style="background: ${c.overallScore >= 70 ? '#dcfce7' : c.overallScore >= 40 ? '#fef3c7' : '#fee2e2'}; color: ${c.overallScore >= 70 ? '#166534' : c.overallScore >= 40 ? '#92400e' : '#991b1b'};">${c.overallScore}%</div>
          </div>
          <div class="comp-details">Market: ${c.marketShare} | Sentiment: ${c.sentiment}</div>
          ${c.strengths.length > 0 ? `<ul class="comp-list">${c.strengths.slice(0, 2).map(s => `<li>✓ ${s}</li>`).join('')}</ul>` : ''}
        </div>
      `).join('')}
    </div>
    ` : reportData.competitors.length > 0 ? `
    <div class="sec"><div class="sec-icon">👥</div><div><div class="sec-title">Tracked Competitors</div></div></div>
    <div style="display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 12px;">
      ${reportData.competitors.map(c => `<div style="background: white; border: 1px solid #e5e7eb; border-radius: 5px; padding: 5px 10px; font-size: 8px; font-weight: 500;">${c.name}</div>`).join('')}
    </div>
    ` : ''}

    ${reportData.marketIntelligence ? `
    <div class="sec"><div class="sec-icon">📈</div><div><div class="sec-title">Market Intelligence</div></div></div>
    <div class="market-grid">
      <div class="market-card"><div class="market-title">📊 Market Size</div><div class="market-stat">${reportData.marketIntelligence.marketSize}</div><div class="market-text">Growth: ${reportData.marketIntelligence.growthRate}</div></div>
      <div class="market-card"><div class="market-title">🔮 Outlook</div><div class="market-text">${reportData.marketIntelligence.futureOutlook}</div></div>
    </div>
    ${reportData.marketIntelligence.industryTrends.length > 0 ? `
    <div style="background: white; border-radius: 6px; padding: 8px; border: 1px solid #e5e7eb; margin-bottom: 12px;">
      <div style="font-weight: 600; font-size: 8px; color: #6366f1; margin-bottom: 6px;">🔥 Industry Trends</div>
      <div class="trends">${reportData.marketIntelligence.industryTrends.slice(0, 6).map(t => `<span class="trend">${t}</span>`).join('')}</div>
    </div>
    ` : ''}
    ` : ''}

    ${reportData.productAnalysis && (reportData.productAnalysis.featureAdvantages.length > 0 || reportData.productAnalysis.featureGaps.length > 0) ? `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
      ${reportData.productAnalysis.featureAdvantages.length > 0 ? `<div style="background: #dcfce7; border-radius: 6px; padding: 8px;"><div style="font-weight: 600; font-size: 8px; color: #166534; margin-bottom: 4px;">✅ Your Strengths</div><ul style="font-size: 7px; color: #166534; margin: 0; padding-left: 12px;">${reportData.productAnalysis.featureAdvantages.slice(0, 4).map(a => `<li>${a}</li>`).join('')}</ul></div>` : ''}
      ${reportData.productAnalysis.featureGaps.length > 0 ? `<div style="background: #fef3c7; border-radius: 6px; padding: 8px;"><div style="font-weight: 600; font-size: 8px; color: #92400e; margin-bottom: 4px;">⚠️ Gaps to Address</div><ul style="font-size: 7px; color: #92400e; margin: 0; padding-left: 12px;">${reportData.productAnalysis.featureGaps.slice(0, 4).map(g => `<li>${g}</li>`).join('')}</ul></div>` : ''}
    </div>
    ` : ''}

    ${reportData.emergingPlayers && reportData.emergingPlayers.length > 0 ? `
    <div class="sec"><div class="sec-icon">⚡</div><div><div class="sec-title">Emerging Threats</div></div></div>
    <table class="table">
      <thead><tr><th>Company</th><th>Threat Level</th><th>Unique Advantage</th></tr></thead>
      <tbody>
        ${reportData.emergingPlayers.slice(0, 4).map(p => `
          <tr>
            <td><strong>${p.name}</strong><br><span style="font-size: 6px; color: #6b7280;">${p.description.substring(0, 50)}...</span></td>
            <td><span class="badge badge-${p.threatLevel === 'High' ? 'red' : p.threatLevel === 'Medium' ? 'orange' : 'green'}">${p.threatLevel}</span></td>
            <td style="font-size: 7px;">${p.uniqueAdvantage}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    ` : ''}

    ${reportData.backreferences && reportData.backreferences.length > 0 ? `
    <div class="sec"><div class="sec-icon">🔗</div><div><div class="sec-title">Platform Presence (${backrefPresent}/${backrefTotal} claimed)</div></div></div>
    <div class="backref-grid">
      ${reportData.backreferences.slice(0, 8).map(b => `
        <div class="backref">
          <div class="backref-platform">${b.platform}</div>
          <div class="backref-status"><span class="badge badge-${b.status === 'present' ? 'green' : b.status === 'claimed' ? 'blue' : 'gray'}">${b.status}</span></div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${reportData.citations && reportData.citations.length > 0 ? `
    <div class="sec"><div class="sec-icon">📚</div><div><div class="sec-title">Citation Sources (${reportData.citations.length} found)</div></div></div>
    <div class="citation-grid">
      ${reportData.citations.slice(0, 12).map(c => `<div class="citation"><strong>${c.source}</strong> <span class="badge badge-gray">${c.type}</span></div>`).join('')}
    </div>
    ` : ''}
  </div>

  <!-- PAGE 3: RECOMMENDATIONS -->
  <div class="page">
    ${(highPriorityRecs.length > 0 || mediumPriorityRecs.length > 0) ? `
    <div class="sec"><div class="sec-icon">🎯</div><div><div class="sec-title">Strategic Recommendations</div><div class="sec-sub">Actionable steps to improve AI visibility</div></div></div>

    ${highPriorityRecs.length > 0 ? `
    <div class="rec-sec">
      <div class="rec-header" style="color: #ef4444;"><span class="rec-dot" style="background: #ef4444;"></span>High Priority - Do This Week</div>
      <div class="recs">${highPriorityRecs.map(r => `
        <div class="rec high">
          <div class="rec-title">${r.title || 'Untitled Recommendation'}</div>
          <div class="rec-desc">${r.description || 'No description available'}</div>
          <div class="rec-meta">
            ${r.effort ? `<div class="rec-meta-item"><span class="rec-meta-lbl">Effort:</span><span class="rec-meta-val">${r.effort}</span></div>` : ''}
            ${r.timeline ? `<div class="rec-meta-item"><span class="rec-meta-lbl">Timeline:</span><span class="rec-meta-val">${r.timeline}</span></div>` : ''}
            ${r.expectedImpact ? `<div class="rec-meta-item"><span class="rec-meta-lbl">Impact:</span><span class="rec-meta-val">${r.expectedImpact}</span></div>` : ''}
            ${r.category ? `<div class="rec-meta-item"><span class="rec-meta-lbl">Category:</span><span class="rec-meta-val">${r.category}</span></div>` : ''}
          </div>
        </div>
      `).join('')}</div>
    </div>
    ` : ''}

    ${mediumPriorityRecs.length > 0 ? `
    <div class="rec-sec">
      <div class="rec-header" style="color: #f59e0b;"><span class="rec-dot" style="background: #f59e0b;"></span>Medium Priority - Do This Month</div>
      <div class="recs">${mediumPriorityRecs.map(r => `
        <div class="rec medium">
          <div class="rec-title">${r.title || 'Untitled Recommendation'}</div>
          <div class="rec-desc">${r.description || 'No description available'}</div>
          <div class="rec-meta">
            ${r.effort ? `<div class="rec-meta-item"><span class="rec-meta-lbl">Effort:</span><span class="rec-meta-val">${r.effort}</span></div>` : ''}
            ${r.timeline ? `<div class="rec-meta-item"><span class="rec-meta-lbl">Timeline:</span><span class="rec-meta-val">${r.timeline}</span></div>` : ''}
            ${r.expectedImpact ? `<div class="rec-meta-item"><span class="rec-meta-lbl">Impact:</span><span class="rec-meta-val">${r.expectedImpact}</span></div>` : ''}
            ${r.category ? `<div class="rec-meta-item"><span class="rec-meta-lbl">Category:</span><span class="rec-meta-val">${r.category}</span></div>` : ''}
          </div>
        </div>
      `).join('')}</div>
    </div>
    ` : ''}

    ${lowPriorityRecs.length > 0 ? `
    <div class="rec-sec">
      <div class="rec-header" style="color: #6366f1;"><span class="rec-dot" style="background: #6366f1;"></span>Long-term - This Quarter</div>
      <div class="recs">${lowPriorityRecs.map(r => `
        <div class="rec low">
          <div class="rec-title">${r.title || 'Untitled Recommendation'}</div>
          <div class="rec-desc">${r.description || 'No description available'}</div>
          <div class="rec-meta">
            ${r.effort ? `<div class="rec-meta-item"><span class="rec-meta-lbl">Effort:</span><span class="rec-meta-val">${r.effort}</span></div>` : ''}
            ${r.timeline ? `<div class="rec-meta-item"><span class="rec-meta-lbl">Timeline:</span><span class="rec-meta-val">${r.timeline}</span></div>` : ''}
            ${r.expectedImpact ? `<div class="rec-meta-item"><span class="rec-meta-lbl">Impact:</span><span class="rec-meta-val">${r.expectedImpact}</span></div>` : ''}
            ${r.category ? `<div class="rec-meta-item"><span class="rec-meta-lbl">Category:</span><span class="rec-meta-val">${r.category}</span></div>` : ''}
          </div>
        </div>
      `).join('')}</div>
    </div>
    ` : ''}
    ` : ''}

    ${reportData.aiVisibility?.improvementAreas && reportData.aiVisibility.improvementAreas.length > 0 ? `
    <div style="background: #fef3c7; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 600; font-size: 9px; color: #92400e; margin-bottom: 6px;">Key Improvement Areas from AI Analysis</div>
      <div class="trends">${reportData.aiVisibility.improvementAreas.slice(0, 6).map((a: string) => `<span style="background: white; color: #92400e; padding: 3px 8px; border-radius: 10px; font-size: 7px; border: 1px solid #fcd34d;">${a}</span>`).join('')}</div>
    </div>
    ` : ''}

    ${generateQueriesSection(reportData.promptsTested)}
  </div>

  <!-- PAGE 4: MENTIONS -->
  <div class="page">
    ${reportData.recentMentions && reportData.recentMentions.length > 0 ? `
    <div class="sec"><div class="sec-icon" style="font-size: 9px;">M</div><div><div class="sec-title">Recent AI Mentions (${reportData.recentMentions.length} total)</div><div class="sec-sub">Where and how AI systems mentioned your brand</div></div></div>
    <table class="table">
      <thead><tr><th style="width: 55px;">Platform</th><th style="width: 50px;">Date</th><th style="width: 40px;">Rank</th><th style="width: 55px;">Sentiment</th><th>Query & AI Response Context</th></tr></thead>
      <tbody>
        ${reportData.recentMentions.slice(0, 12).map(m => {
          // Safe data extraction with fallbacks
          const aiSystem = m.aiSystem || 'unknown';
          const dateStr = m.date ? new Date(m.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'N/A';
          const position = m.position !== null && m.position !== undefined ? '#' + m.position : 'Not ranked';
          const sentimentVal = m.sentiment;
          const sentimentLabel = sentimentVal !== null && sentimentVal !== undefined
            ? (sentimentVal > 0.2 ? 'Positive' : sentimentVal < -0.2 ? 'Negative' : 'Neutral')
            : 'Unknown';
          const sentimentClass = sentimentVal !== null && sentimentVal !== undefined
            ? (sentimentVal > 0.2 ? 'green' : sentimentVal < -0.2 ? 'red' : 'orange')
            : 'gray';
          const promptText = m.prompt || '';
          const contextText = m.context || m.response || 'No context available';

          return `
          <tr>
            <td><span class="badge badge-${aiSystem === 'chatgpt' ? 'green' : aiSystem === 'gemini' ? 'blue' : aiSystem === 'perplexity' ? 'purple' : 'gray'}">${aiSystem === 'chatgpt' ? 'ChatGPT' : aiSystem === 'gemini' ? 'Gemini' : aiSystem === 'perplexity' ? 'Perplexity' : aiSystem}</span></td>
            <td style="font-size: 7px;">${dateStr}</td>
            <td style="text-align: center; font-weight: 600; font-size: 7px;">${position === 'Not ranked' ? '--' : position}</td>
            <td><span class="badge badge-${sentimentClass}">${sentimentLabel}</span></td>
            <td style="font-size: 7px; line-height: 1.4;">
              ${promptText ? `<strong>Q:</strong> ${promptText.substring(0, 60)}${promptText.length > 60 ? '...' : ''}<br>` : ''}
              <strong>A:</strong> ${contextText.substring(0, 120)}${contextText.length > 120 ? '...' : ''}
            </td>
          </tr>
        `}).join('')}
      </tbody>
    </table>
    ${reportData.recentMentions.length > 12 ? `
    <div style="font-size: 7px; color: #6b7280; text-align: right; margin-top: 6px;">Showing 12 of ${reportData.recentMentions.length} mentions. See full list in dashboard.</div>
    ` : ''}
    ` : `
    <div class="sec"><div class="sec-icon" style="font-size: 9px;">M</div><div><div class="sec-title">Recent AI Mentions</div></div></div>
    <div style="background: #f8fafc; border-radius: 6px; padding: 24px; text-align: center; border: 1px solid #e2e8f0;">
      <div style="font-size: 10px; font-weight: 600; color: #6b7280;">No Mentions Found</div>
      <div style="font-size: 8px; color: #9ca3af; margin-top: 4px;">Run queries in the Prompt Lab to track when AI systems mention your brand.</div>
      <div style="font-size: 7px; color: #9ca3af; margin-top: 8px;">Tip: Try industry-relevant queries like "best [your category] tools" or "top companies in [your industry]"</div>
    </div>
    `}

    <div class="footer">
      <div class="footer-logo">ZeekLabs.ai</div>
      <div class="footer-text">AI Visibility Intelligence Platform | Generated: ${reportData.reportDate} | © ${new Date().getFullYear()}</div>
    </div>
  </div>

</div>
</body>
</html>`;

  // Open print dialog in new window - properly handle to avoid page freeze
  const printWindow = window.open("", "_blank", "width=800,height=600");
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 300);
    };

    // Fallback if onload doesn't fire
    setTimeout(() => {
      try {
        printWindow.focus();
        printWindow.print();
      } catch (e) {
        console.error("Print error:", e);
      }
    }, 800);
  }
}
