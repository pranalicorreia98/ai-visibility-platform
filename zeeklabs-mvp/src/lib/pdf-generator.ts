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
    category?: string;
    status?: string;
    priority?: string;
    effort?: string;
    aiRecommendation?: string;
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
  // New: Analysis recommendations from AI
  analysisRecommendations?: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    competitiveActions?: string[];
  } | null;
  // New: Analysis prompts used
  analysisPrompts?: Array<{
    id: string;
    category: string;
    prompt: string;
    purpose: string;
  }>;
  // New: Citation opportunities
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
}

// Helper function to truncate text safely
function truncate(text: string, maxLength: number): string {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// Helper function to generate the Queries section HTML
function generateQueriesSection(promptsTested: ReportData['promptsTested']): string {
  if (!promptsTested || promptsTested.length === 0) {
    return `
    <div class="sec"><div class="sec-icon">Q</div><div><div class="sec-title">Queries Tested</div></div></div>
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
  const testedRows = testedPrompts.slice(0, 8).map(p => {
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
        <td style="font-size: 7px; line-height: 1.4;">${truncate(promptText, 50)}</td>
        <td style="text-align: center;"><span class="badge badge-green" style="font-size: 6px;">TESTED</span></td>
        <td style="text-align: center;">
          <span class="badge badge-${rateColor}">${mentionCount}/${maxPossible}</span>
        </td>
        <td>${platformBadges}</td>
      </tr>`;
  }).join('');

  // Generate suggested prompts rows
  const suggestedRows = suggestedPrompts.slice(0, 4).map(p => {
    const promptText = p.prompt || 'Unknown query';
    const category = p.category || 'general';
    const categoryLabel = category === 'comparison' ? 'Compare' : category === 'recommendation' ? 'Recommend' : category === 'reviews' ? 'Review' : category === 'features' ? 'Features' : 'Market';
    const categoryColor = category === 'comparison' ? 'blue' : category === 'recommendation' ? 'purple' : category === 'reviews' ? 'orange' : category === 'features' ? 'green' : 'gray';

    return `
      <tr style="background: #f8fafc;">
        <td style="font-size: 7px; line-height: 1.4; color: #6b7280;">${truncate(promptText, 50)}</td>
        <td style="text-align: center;"><span style="background: #e5e7eb; color: #6b7280; padding: 2px 6px; border-radius: 8px; font-size: 5px; font-weight: 600;">SUGGESTED</span></td>
        <td style="text-align: center;"><span style="font-size: 6px; color: #9ca3af;">Run test</span></td>
        <td><span class="badge badge-${categoryColor}" style="font-size: 5px;">${categoryLabel}</span></td>
      </tr>`;
  }).join('');

  return `
    <div class="sec"><div class="sec-icon">Q</div><div><div class="sec-title">AI Query Analysis (${testedCount} tested${suggestedCount > 0 ? `, ${suggestedCount} suggested` : ''})</div><div class="sec-sub">Tested queries show actual mention results</div></div></div>
    <table class="table">
      <thead><tr><th style="width: 45%;">Query Prompt</th><th style="width: 15%; text-align: center;">Status</th><th style="width: 15%; text-align: center;">Results</th><th style="width: 25%;">Platforms</th></tr></thead>
      <tbody>
        ${testedRows}
        ${suggestedRows}
      </tbody>
    </table>`;
}

// Helper function to generate Citation Opportunities section
function generateCitationOpportunitiesSection(citations: ReportData['citationOpportunities'], brandName: string): string {
  if (!citations || citations.length === 0) {
    return '';
  }

  // Group by priority
  const highPriority = citations.filter(c => c.priority === 'high').slice(0, 6);
  const mediumPriority = citations.filter(c => c.priority === 'medium').slice(0, 4);

  const citationRows = [...highPriority, ...mediumPriority].map(c => {
    const priorityColor = c.priority === 'high' ? 'red' : c.priority === 'medium' ? 'orange' : 'gray';
    const statusColor = c.status === 'present' ? 'green' : c.status === 'partial' ? 'orange' : 'gray';
    const effortColor = c.effort === 'low' ? 'green' : c.effort === 'medium' ? 'orange' : 'red';

    return `
      <tr>
        <td style="font-weight: 600; font-size: 8px;">${c.source}</td>
        <td><span class="badge badge-gray" style="font-size: 6px;">${c.category}</span></td>
        <td style="text-align: center;"><span class="badge badge-${priorityColor}" style="font-size: 6px;">${c.priority}</span></td>
        <td style="text-align: center;"><span class="badge badge-${statusColor}" style="font-size: 6px;">${c.status}</span></td>
        <td style="text-align: center;"><span class="badge badge-${effortColor}" style="font-size: 6px;">${c.effort}</span></td>
        <td style="font-size: 6px; color: #6b7280; line-height: 1.3;">${truncate(c.aiRecommendation, 80)}</td>
      </tr>`;
  }).join('');

  return `
    <div class="sec"><div class="sec-icon">C</div><div><div class="sec-title">Citation Opportunities (${citations.length} sources)</div><div class="sec-sub">Platforms to improve AI visibility for ${brandName}</div></div></div>
    <table class="table">
      <thead><tr><th style="width: 15%;">Source</th><th style="width: 15%;">Category</th><th style="width: 10%; text-align: center;">Priority</th><th style="width: 10%; text-align: center;">Status</th><th style="width: 10%; text-align: center;">Effort</th><th style="width: 40%;">AI Recommendation</th></tr></thead>
      <tbody>${citationRows}</tbody>
    </table>`;
}

// Helper function to generate Action Plan section
function generateActionPlanSection(recommendations: ReportData['analysisRecommendations'], currentScore: number): string {
  if (!recommendations) {
    return '';
  }

  const immediate = recommendations.immediate || [];
  const shortTerm = recommendations.shortTerm || [];
  const longTerm = recommendations.longTerm || [];
  const competitive = recommendations.competitiveActions || [];

  if (immediate.length === 0 && shortTerm.length === 0 && longTerm.length === 0) {
    return '';
  }

  const immediateGain = Math.min(immediate.length * 5, 15);
  const shortTermGain = Math.min(shortTerm.length * 4, 12);
  const longTermGain = Math.min(longTerm.length * 3, 10);
  const totalPotential = Math.min(currentScore + immediateGain + shortTermGain + longTermGain, 100);

  const generateActionList = (actions: string[], color: string, label: string, gain: number) => {
    if (actions.length === 0) return '';
    return `
      <div style="margin-bottom: 12px;">
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: ${color};"></span>
          <span style="font-size: 9px; font-weight: 600; color: ${color};">${label}</span>
          <span style="font-size: 7px; color: #6b7280; margin-left: auto;">+${gain} pts potential</span>
        </div>
        <div style="padding-left: 14px;">
          ${actions.slice(0, 4).map(a => `
            <div style="display: flex; align-items: flex-start; gap: 6px; margin-bottom: 4px; padding: 6px; background: ${color}10; border-radius: 4px; border-left: 2px solid ${color};">
              <span style="color: ${color}; font-size: 8px;">•</span>
              <span style="font-size: 7px; color: #374151; line-height: 1.3;">${truncate(a, 100)}</span>
            </div>
          `).join('')}
        </div>
      </div>`;
  };

  return `
    <div class="sec"><div class="sec-icon">P</div><div><div class="sec-title">Improvement & Action Plan</div><div class="sec-sub">Prioritized actions to boost AI visibility | Current: ${currentScore} → Potential: ${totalPotential}</div></div></div>
    <div style="background: white; border-radius: 8px; padding: 12px; border: 1px solid #e5e7eb;">
      ${generateActionList(immediate, '#ef4444', 'Immediate Actions (This Week)', immediateGain)}
      ${generateActionList(shortTerm, '#f59e0b', 'Short-term Actions (This Month)', shortTermGain)}
      ${generateActionList(longTerm, '#6366f1', 'Long-term Actions (This Quarter)', longTermGain)}
      ${competitive.length > 0 ? generateActionList(competitive, '#8b5cf6', 'Competitive Actions', 0) : ''}
    </div>`;
}

// Helper function to generate Analysis Prompts section
function generateAnalysisPromptsSection(prompts: ReportData['analysisPrompts'], brandName: string): string {
  if (!prompts || prompts.length === 0) {
    return '';
  }

  // Group by category
  const categories = [...new Set(prompts.map(p => p.category))];

  return `
    <div class="sec"><div class="sec-icon">A</div><div><div class="sec-title">Analysis Prompts Used (${prompts.length} prompts)</div><div class="sec-sub">Prompts sent to AI platforms to analyze ${brandName}</div></div></div>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">
      ${prompts.slice(0, 15).map(p => `
        <div style="background: #f8fafc; border-radius: 6px; padding: 8px; border: 1px solid #e5e7eb;">
          <div style="font-size: 6px; color: #6366f1; font-weight: 600; margin-bottom: 3px; text-transform: uppercase;">${p.category}</div>
          <div style="font-size: 7px; color: #374151; line-height: 1.3; font-style: italic;">"${truncate(p.prompt, 60)}"</div>
          <div style="font-size: 6px; color: #9ca3af; margin-top: 3px;">${p.purpose}</div>
        </div>
      `).join('')}
    </div>
    ${prompts.length > 15 ? `<div style="font-size: 7px; color: #6b7280; text-align: center; margin-top: 8px;">+ ${prompts.length - 15} more prompts used in analysis</div>` : ''}`;
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
    @page { size: A4; margin: 8mm; }
    body { font-family: 'Segoe UI', -apple-system, sans-serif; background: #fff; color: #1f2937; line-height: 1.35; font-size: 8px; }
    .container { max-width: 210mm; margin: 0 auto; }

    /* Cover */
    .cover { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; page-break-after: always; padding: 30px; }
    .cover-logo { font-size: 32px; font-weight: 800; }
    .cover-tag { font-size: 11px; opacity: 0.9; margin-bottom: 35px; }
    .cover-title { font-size: 22px; font-weight: 700; margin-bottom: 10px; }
    .cover-brand { font-size: 16px; font-weight: 600; padding: 10px 24px; background: rgba(255,255,255,0.15); border-radius: 8px; margin-bottom: 24px; }
    .cover-score { width: 100px; height: 100px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; flex-direction: column; align-items: center; justify-content: center; border: 3px solid rgba(255,255,255,0.4); }
    .cover-score-val { font-size: 34px; font-weight: 800; }
    .cover-score-lbl { font-size: 9px; opacity: 0.8; }
    .cover-date { font-size: 9px; opacity: 0.8; margin-top: 18px; }

    /* Page */
    .page { padding: 12px 16px; page-break-after: always; }
    .page:last-child { page-break-after: auto; }

    /* Section */
    .sec { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid #6366f1; }
    .sec-icon { width: 20px; height: 20px; border-radius: 5px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; }
    .sec-title { font-size: 11px; font-weight: 700; }
    .sec-sub { font-size: 7px; color: #6b7280; }

    /* Summary */
    .summary { background: #f8fafc; border-radius: 8px; padding: 12px; margin-bottom: 12px; border: 1px solid #e2e8f0; display: grid; grid-template-columns: 70px 1fr; gap: 12px; }
    .score-ring { width: 60px; height: 60px; border-radius: 50%; background: conic-gradient(${reportData.metrics.visibilityScore >= 70 ? '#22c55e' : reportData.metrics.visibilityScore >= 40 ? '#f59e0b' : '#ef4444'} ${reportData.metrics.visibilityScore * 3.6}deg, #e5e7eb ${reportData.metrics.visibilityScore * 3.6}deg); display: flex; align-items: center; justify-content: center; }
    .score-inner { width: 48px; height: 48px; border-radius: 50%; background: white; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .score-val { font-size: 18px; font-weight: 800; }
    .score-lbl { font-size: 5px; color: #6b7280; }
    .summary-brand { font-size: 12px; font-weight: 700; margin-bottom: 2px; }
    .summary-meta { font-size: 7px; color: #6b7280; margin-bottom: 6px; }
    .stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; }
    .stat { background: white; padding: 5px; border-radius: 4px; text-align: center; border: 1px solid #e5e7eb; }
    .stat-val { font-size: 11px; font-weight: 700; color: #6366f1; }
    .stat-lbl { font-size: 5px; color: #6b7280; text-transform: uppercase; }

    /* Score Breakdown */
    .breakdown { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 12px; }
    .breakdown-item { background: white; border-radius: 6px; padding: 8px; border: 1px solid #e5e7eb; text-align: center; }
    .breakdown-val { font-size: 16px; font-weight: 800; }
    .breakdown-lbl { font-size: 6px; color: #6b7280; }
    .breakdown-weight { font-size: 5px; color: #9ca3af; }

    /* Platforms */
    .platforms { display: grid; grid-template-columns: repeat(${Math.min(activePlatforms.length || 1, 3)}, 1fr); gap: 6px; margin-bottom: 12px; }
    .platform { background: white; border-radius: 6px; padding: 8px; border: 1px solid #e5e7eb; }
    .platform-head { display: flex; align-items: center; gap: 5px; margin-bottom: 4px; }
    .platform-icon { width: 18px; height: 18px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 7px; }
    .platform-name { font-weight: 600; font-size: 8px; }
    .platform-score { font-size: 20px; font-weight: 800; }
    .platform-bar { height: 3px; background: #f3f4f6; border-radius: 2px; overflow: hidden; margin-bottom: 3px; }
    .platform-fill { height: 100%; border-radius: 2px; }
    .platform-info { font-size: 6px; color: #6b7280; }

    /* AI Visibility Box */
    .ai-vis { background: linear-gradient(135deg, #eef2ff, #e0e7ff); border-radius: 8px; padding: 10px; margin-bottom: 12px; border: 1px solid #c7d2fe; }
    .ai-vis-title { font-size: 9px; font-weight: 700; color: #4338ca; margin-bottom: 6px; }
    .ai-vis-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
    .ai-vis-item { text-align: center; }
    .ai-vis-val { font-size: 11px; font-weight: 700; color: #1f2937; }
    .ai-vis-lbl { font-size: 6px; color: #6b7280; }

    /* Table */
    .table { width: 100%; border-collapse: collapse; font-size: 7px; margin-bottom: 10px; }
    .table th { background: #f8fafc; padding: 4px 5px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb; font-size: 6px; text-transform: uppercase; }
    .table td { padding: 4px 5px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
    .table tr:nth-child(even) { background: #fafafa; }

    /* Badges */
    .badge { padding: 2px 4px; border-radius: 3px; font-size: 6px; font-weight: 600; display: inline-block; }
    .badge-green { background: #dcfce7; color: #166534; }
    .badge-blue { background: #dbeafe; color: #1e40af; }
    .badge-purple { background: #f3e8ff; color: #6d28d9; }
    .badge-orange { background: #fef3c7; color: #92400e; }
    .badge-red { background: #fee2e2; color: #991b1b; }
    .badge-gray { background: #f3f4f6; color: #4b5563; }

    /* Recommendations */
    .rec-sec { margin-bottom: 10px; }
    .rec-header { font-size: 9px; font-weight: 700; margin-bottom: 5px; display: flex; align-items: center; gap: 4px; }
    .rec-dot { width: 6px; height: 6px; border-radius: 50%; }
    .recs { display: flex; flex-direction: column; gap: 5px; }
    .rec { padding: 6px 8px; border-radius: 5px; border-left: 3px solid; }
    .rec.high { border-color: #ef4444; background: #fef2f2; }
    .rec.medium { border-color: #f59e0b; background: #fffbeb; }
    .rec.low { border-color: #6366f1; background: #eef2ff; }
    .rec-title { font-weight: 700; font-size: 8px; margin-bottom: 2px; color: #1f2937; }
    .rec-desc { font-size: 6px; color: #4b5563; line-height: 1.3; margin-bottom: 3px; }
    .rec-meta { display: flex; gap: 8px; font-size: 5px; }
    .rec-meta-item { display: flex; align-items: center; gap: 2px; }
    .rec-meta-lbl { color: #9ca3af; }
    .rec-meta-val { color: #374151; font-weight: 600; }

    /* Competitors */
    .comp-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; margin-bottom: 10px; }
    .comp { background: white; border-radius: 6px; padding: 6px; border: 1px solid #e5e7eb; }
    .comp-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px; }
    .comp-name { font-weight: 600; font-size: 8px; }
    .comp-score { font-weight: 700; font-size: 10px; padding: 2px 5px; border-radius: 6px; }
    .comp-details { font-size: 6px; color: #6b7280; }
    .comp-list { font-size: 5px; color: #4b5563; margin-top: 3px; padding-left: 8px; }

    /* Market */
    .market-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 10px; }
    .market-card { background: white; border-radius: 6px; padding: 6px; border: 1px solid #e5e7eb; }
    .market-title { font-weight: 600; font-size: 7px; color: #6366f1; margin-bottom: 3px; }
    .market-stat { font-size: 12px; font-weight: 700; }
    .market-text { font-size: 6px; color: #4b5563; line-height: 1.25; }

    /* Sentiment Deep Dive */
    .sentiment-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 10px; }
    .sentiment-card { background: white; border-radius: 6px; padding: 6px; border: 1px solid #e5e7eb; }
    .sentiment-title { font-weight: 600; font-size: 7px; margin-bottom: 4px; }
    .theme { display: inline-block; padding: 2px 4px; border-radius: 3px; margin: 1px; font-size: 5px; }
    .theme-pos { background: #dcfce7; color: #166534; }
    .theme-neg { background: #fee2e2; color: #991b1b; }
    .theme-neu { background: #f3f4f6; color: #4b5563; }

    /* Backreferences */
    .backref-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; margin-bottom: 10px; }
    .backref { background: white; border-radius: 4px; padding: 5px; border: 1px solid #e5e7eb; text-align: center; }
    .backref-platform { font-weight: 600; font-size: 7px; margin-bottom: 2px; }
    .backref-status { font-size: 6px; }

    /* Citations */
    .citation-grid { display: flex; flex-wrap: wrap; gap: 3px; margin-bottom: 10px; }
    .citation { background: white; border: 1px solid #e5e7eb; border-radius: 4px; padding: 3px 6px; font-size: 6px; }

    /* Trends */
    .trends { display: flex; flex-wrap: wrap; gap: 3px; margin-bottom: 10px; }
    .trend { background: #eef2ff; color: #4338ca; padding: 2px 6px; border-radius: 8px; font-size: 6px; }

    /* Footer */
    .footer { text-align: center; padding: 12px 0; border-top: 1px solid #e5e7eb; margin-top: 12px; }
    .footer-logo { font-size: 11px; font-weight: 800; color: #6366f1; }
    .footer-text { font-size: 6px; color: #9ca3af; margin-top: 2px; }

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
      <div class="sec-icon">S</div>
      <div><div class="sec-title">Executive Summary</div><div class="sec-sub">Key metrics and performance overview</div></div>
    </div>

    <div class="summary">
      <div class="score-ring"><div class="score-inner"><div class="score-val">${reportData.metrics.visibilityScore}</div><div class="score-lbl">OVERALL</div></div></div>
      <div>
        <div class="summary-brand">${reportData.brand.name}</div>
        <div class="summary-meta">${reportData.brand.domain ? `${reportData.brand.domain} | ` : ''}${reportData.reportDate}</div>
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

    <!-- AI Visibility Insights -->
    ${(reportData.aiVisibility || reportData.aiScores) ? `
    <div style="background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 50%, #c7d2fe 100%); border-radius: 8px; padding: 10px; margin-bottom: 12px; border: 1px solid #a5b4fc;">
      <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #c7d2fe;">
        <span style="display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 4px; color: white; font-size: 8px; font-weight: 700;">AI</span>
        <span style="font-size: 10px; font-weight: 700; color: #4338ca;">AI Visibility Insights</span>
      </div>

      <!-- Primary Metrics Row -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 10px;">
        ${reportData.aiVisibility?.mentionFrequency && reportData.aiVisibility.mentionFrequency !== 'N/A' ? `
        <div style="background: white; border-radius: 6px; padding: 8px; text-align: center; border: 1px solid #e0e7ff;">
          <div style="font-size: 10px; font-weight: 700; color: #4338ca;">${reportData.aiVisibility.mentionFrequency}</div>
          <div style="font-size: 6px; color: #6b7280;">Mention Frequency</div>
        </div>
        ` : ''}
        ${reportData.aiVisibility?.typicalPosition !== null && reportData.aiVisibility?.typicalPosition !== undefined ? `
        <div style="background: white; border-radius: 6px; padding: 8px; text-align: center; border: 1px solid #e0e7ff;">
          <div style="font-size: 10px; font-weight: 700; color: ${reportData.aiVisibility.typicalPosition <= 3 ? '#22c55e' : reportData.aiVisibility.typicalPosition <= 5 ? '#f59e0b' : '#ef4444'};">#${reportData.aiVisibility.typicalPosition}</div>
          <div style="font-size: 6px; color: #6b7280;">Typical Position</div>
        </div>
        ` : ''}
        ${reportData.aiVisibility?.recommendationLikelihood && reportData.aiVisibility.recommendationLikelihood !== 'N/A' ? `
        <div style="background: white; border-radius: 6px; padding: 8px; text-align: center; border: 1px solid #e0e7ff;">
          <div style="font-size: 10px; font-weight: 700; color: #22c55e;">${reportData.aiVisibility.recommendationLikelihood}</div>
          <div style="font-size: 6px; color: #6b7280;">AI Recommends</div>
        </div>
        ` : ''}
        ${reportData.aiVisibility?.competitorMentionGap && reportData.aiVisibility.competitorMentionGap !== 'N/A' ? `
        <div style="background: white; border-radius: 6px; padding: 8px; text-align: center; border: 1px solid #e0e7ff;">
          <div style="font-size: 10px; font-weight: 700; color: #6366f1;">${reportData.aiVisibility.competitorMentionGap}</div>
          <div style="font-size: 6px; color: #6b7280;">vs Competitors</div>
        </div>
        ` : ''}
      </div>

      ${reportData.aiScores ? `
      <!-- AI Scores Grid -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">
        <div style="background: white; border-radius: 5px; padding: 6px; border: 1px solid #e0e7ff;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
            <span style="font-size: 6px; color: #6b7280;">Brand Awareness</span>
            <span style="font-size: 8px; font-weight: 700; color: #4338ca;">${reportData.aiScores.brandAwareness || 0}%</span>
          </div>
          <div style="height: 3px; background: #e5e7eb; border-radius: 2px; overflow: hidden;">
            <div style="height: 100%; width: ${reportData.aiScores.brandAwareness || 0}%; background: linear-gradient(90deg, #6366f1, #8b5cf6); border-radius: 2px;"></div>
          </div>
        </div>
        <div style="background: white; border-radius: 5px; padding: 6px; border: 1px solid #e0e7ff;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
            <span style="font-size: 6px; color: #6b7280;">Market Position</span>
            <span style="font-size: 8px; font-weight: 700; color: #4338ca;">${reportData.aiScores.marketPosition || 0}%</span>
          </div>
          <div style="height: 3px; background: #e5e7eb; border-radius: 2px; overflow: hidden;">
            <div style="height: 100%; width: ${reportData.aiScores.marketPosition || 0}%; background: linear-gradient(90deg, #6366f1, #8b5cf6); border-radius: 2px;"></div>
          </div>
        </div>
        <div style="background: white; border-radius: 5px; padding: 6px; border: 1px solid #e0e7ff;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
            <span style="font-size: 6px; color: #6b7280;">Authority Score</span>
            <span style="font-size: 8px; font-weight: 700; color: #4338ca;">${reportData.aiScores.authorityScore || 0}%</span>
          </div>
          <div style="height: 3px; background: #e5e7eb; border-radius: 2px; overflow: hidden;">
            <div style="height: 100%; width: ${reportData.aiScores.authorityScore || 0}%; background: linear-gradient(90deg, #6366f1, #8b5cf6); border-radius: 2px;"></div>
          </div>
        </div>
        <div style="background: white; border-radius: 5px; padding: 6px; border: 1px solid #e0e7ff;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
            <span style="font-size: 6px; color: #6b7280;">Content Visibility</span>
            <span style="font-size: 8px; font-weight: 700; color: #4338ca;">${reportData.aiScores.contentVisibility || 0}%</span>
          </div>
          <div style="height: 3px; background: #e5e7eb; border-radius: 2px; overflow: hidden;">
            <div style="height: 100%; width: ${reportData.aiScores.contentVisibility || 0}%; background: linear-gradient(90deg, #6366f1, #8b5cf6); border-radius: 2px;"></div>
          </div>
        </div>
        <div style="background: white; border-radius: 5px; padding: 6px; border: 1px solid #e0e7ff;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
            <span style="font-size: 6px; color: #6b7280;">Social Presence</span>
            <span style="font-size: 8px; font-weight: 700; color: #4338ca;">${reportData.aiScores.socialPresence || 0}%</span>
          </div>
          <div style="height: 3px; background: #e5e7eb; border-radius: 2px; overflow: hidden;">
            <div style="height: 100%; width: ${reportData.aiScores.socialPresence || 0}%; background: linear-gradient(90deg, #6366f1, #8b5cf6); border-radius: 2px;"></div>
          </div>
        </div>
        <div style="background: white; border-radius: 5px; padding: 6px; border: 1px solid #e0e7ff;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
            <span style="font-size: 6px; color: #6b7280;">Sentiment Score</span>
            <span style="font-size: 8px; font-weight: 700; color: #4338ca;">${reportData.aiScores.sentimentScore || 0}%</span>
          </div>
          <div style="height: 3px; background: #e5e7eb; border-radius: 2px; overflow: hidden;">
            <div style="height: 100%; width: ${reportData.aiScores.sentimentScore || 0}%; background: linear-gradient(90deg, #6366f1, #8b5cf6); border-radius: 2px;"></div>
          </div>
        </div>
      </div>
      ` : ''}

      ${reportData.aiVisibility?.improvementAreas && reportData.aiVisibility.improvementAreas.length > 0 ? `
      <!-- Improvement Areas -->
      <div style="background: rgba(255,255,255,0.7); border-radius: 5px; padding: 6px; border: 1px solid #e0e7ff; margin-top: 8px;">
        <div style="font-size: 7px; font-weight: 600; color: #4338ca; margin-bottom: 4px;">Key Improvement Areas</div>
        <div style="display: flex; flex-wrap: wrap; gap: 3px;">
          ${reportData.aiVisibility.improvementAreas.slice(0, 6).map((area: string) => `
            <span style="background: linear-gradient(135deg, #fef3c7, #fde68a); color: #92400e; padding: 2px 6px; border-radius: 8px; font-size: 6px; font-weight: 500; border: 1px solid #fcd34d;">${area}</span>
          `).join('')}
        </div>
      </div>
      ` : ''}
    </div>
    ` : ''}

    ${activePlatforms.length > 0 ? `
    <div class="sec">
      <div class="sec-icon">P</div>
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
          <div class="platform-info">${p.mentions} mentions</div>
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
    <div class="sec"><div class="sec-icon">S</div><div><div class="sec-title">Sentiment Distribution</div></div></div>
    <div style="display: grid; grid-template-columns: 80px 1fr; gap: 8px; margin-bottom: 12px;">
      <div style="background: white; border-radius: 6px; padding: 10px; border: 1px solid #e5e7eb; text-align: center;">
        <div style="font-size: 20px; font-weight: 800; color: ${reportData.metrics.sentiment.average > 20 ? '#22c55e' : reportData.metrics.sentiment.average > -20 ? '#f59e0b' : '#ef4444'};">${reportData.metrics.sentiment.average > 0 ? '+' : ''}${reportData.metrics.sentiment.average}%</div>
        <div style="font-size: 7px; color: #6b7280;">Avg Sentiment</div>
      </div>
      <div style="background: white; border-radius: 6px; padding: 8px; border: 1px solid #e5e7eb;">
        <div style="margin-bottom: 5px;"><div style="display: flex; justify-content: space-between; font-size: 7px; margin-bottom: 2px;"><span style="color: #22c55e;">Positive</span><span>${reportData.metrics.sentiment.positive}</span></div><div style="height: 3px; background: #f3f4f6; border-radius: 2px;"><div style="height: 100%; background: #22c55e; border-radius: 2px; width: ${reportData.metrics.totalMentions > 0 ? (reportData.metrics.sentiment.positive / reportData.metrics.totalMentions) * 100 : 0}%;"></div></div></div>
        <div style="margin-bottom: 5px;"><div style="display: flex; justify-content: space-between; font-size: 7px; margin-bottom: 2px;"><span style="color: #f59e0b;">Neutral</span><span>${reportData.metrics.sentiment.neutral}</span></div><div style="height: 3px; background: #f3f4f6; border-radius: 2px;"><div style="height: 100%; background: #f59e0b; border-radius: 2px; width: ${reportData.metrics.totalMentions > 0 ? (reportData.metrics.sentiment.neutral / reportData.metrics.totalMentions) * 100 : 0}%;"></div></div></div>
        <div><div style="display: flex; justify-content: space-between; font-size: 7px; margin-bottom: 2px;"><span style="color: #ef4444;">Negative</span><span>${reportData.metrics.sentiment.negative}</span></div><div style="height: 3px; background: #f3f4f6; border-radius: 2px;"><div style="height: 100%; background: #ef4444; border-radius: 2px; width: ${reportData.metrics.totalMentions > 0 ? (reportData.metrics.sentiment.negative / reportData.metrics.totalMentions) * 100 : 0}%;"></div></div></div>
      </div>
    </div>
    ` : ''}
  </div>

  <!-- PAGE 2: SENTIMENT & COMPETITORS -->
  <div class="page">
    ${reportData.sentimentAnalysis ? `
    <div class="sec"><div class="sec-icon">T</div><div><div class="sec-title">Sentiment Deep Dive</div></div></div>
    <div class="sentiment-grid">
      <div class="sentiment-card">
        <div class="sentiment-title" style="color: #22c55e;">What AI Says Positively</div>
        ${reportData.sentimentAnalysis.brandSentiment.positiveThemes.slice(0, 5).map(t => `<span class="theme theme-pos">${truncate(t, 30)}</span>`).join('')}
      </div>
      <div class="sentiment-card">
        <div class="sentiment-title" style="color: #ef4444;">Areas of Concern</div>
        ${reportData.sentimentAnalysis.brandSentiment.negativeThemes.slice(0, 5).map(t => `<span class="theme theme-neg">${truncate(t, 30)}</span>`).join('')}
      </div>
      <div class="sentiment-card">
        <div class="sentiment-title">Customer Perception</div>
        <div style="font-size: 7px;"><strong>Satisfaction:</strong> ${reportData.sentimentAnalysis.customerSentiment.satisfaction}%</div>
        <div style="font-size: 7px;"><strong>NPS:</strong> ${reportData.sentimentAnalysis.customerSentiment.nps}</div>
        ${reportData.sentimentAnalysis.customerSentiment.commonPraises.slice(0, 2).map(p => `<span class="theme theme-pos">${truncate(p, 25)}</span>`).join('')}
      </div>
    </div>
    ` : ''}

    ${reportData.competitorComparison && reportData.competitorComparison.length > 0 ? `
    <div class="sec"><div class="sec-icon">C</div><div><div class="sec-title">Competitive Landscape</div></div></div>
    <div class="comp-grid">
      ${reportData.competitorComparison.slice(0, 4).map(c => `
        <div class="comp">
          <div class="comp-head">
            <div class="comp-name">${c.name}</div>
            <div class="comp-score" style="background: ${c.overallScore >= 70 ? '#dcfce7' : c.overallScore >= 40 ? '#fef3c7' : '#fee2e2'}; color: ${c.overallScore >= 70 ? '#166534' : c.overallScore >= 40 ? '#92400e' : '#991b1b'};">${c.overallScore}%</div>
          </div>
          <div class="comp-details">Market: ${c.marketShare} | Sentiment: ${c.sentiment}</div>
          ${c.strengths.length > 0 ? `<ul class="comp-list">${c.strengths.slice(0, 2).map(s => `<li>${truncate(s, 40)}</li>`).join('')}</ul>` : ''}
        </div>
      `).join('')}
    </div>
    ` : reportData.competitors.length > 0 ? `
    <div class="sec"><div class="sec-icon">C</div><div><div class="sec-title">Tracked Competitors</div></div></div>
    <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 10px;">
      ${reportData.competitors.map(c => `<div style="background: white; border: 1px solid #e5e7eb; border-radius: 4px; padding: 4px 8px; font-size: 7px; font-weight: 500;">${c.name}</div>`).join('')}
    </div>
    ` : ''}

    ${reportData.marketIntelligence ? `
    <div class="sec"><div class="sec-icon">M</div><div><div class="sec-title">Market Intelligence</div></div></div>
    <div class="market-grid">
      <div class="market-card"><div class="market-title">Market Size</div><div class="market-stat">${reportData.marketIntelligence.marketSize}</div><div class="market-text">Growth: ${reportData.marketIntelligence.growthRate}</div></div>
      <div class="market-card"><div class="market-title">Outlook</div><div class="market-text">${truncate(reportData.marketIntelligence.futureOutlook, 150)}</div></div>
    </div>
    ${reportData.marketIntelligence.industryTrends.length > 0 ? `
    <div style="background: white; border-radius: 6px; padding: 6px; border: 1px solid #e5e7eb; margin-bottom: 10px;">
      <div style="font-weight: 600; font-size: 7px; color: #6366f1; margin-bottom: 4px;">Industry Trends</div>
      <div class="trends">${reportData.marketIntelligence.industryTrends.slice(0, 6).map(t => `<span class="trend">${truncate(t, 30)}</span>`).join('')}</div>
    </div>
    ` : ''}
    ` : ''}

    ${reportData.productAnalysis && (reportData.productAnalysis.featureAdvantages.length > 0 || reportData.productAnalysis.featureGaps.length > 0) ? `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 10px;">
      ${reportData.productAnalysis.featureAdvantages.length > 0 ? `<div style="background: #dcfce7; border-radius: 6px; padding: 6px;"><div style="font-weight: 600; font-size: 7px; color: #166534; margin-bottom: 3px;">Your Strengths</div><ul style="font-size: 6px; color: #166534; margin: 0; padding-left: 10px;">${reportData.productAnalysis.featureAdvantages.slice(0, 4).map(a => `<li>${truncate(a, 40)}</li>`).join('')}</ul></div>` : ''}
      ${reportData.productAnalysis.featureGaps.length > 0 ? `<div style="background: #fef3c7; border-radius: 6px; padding: 6px;"><div style="font-weight: 600; font-size: 7px; color: #92400e; margin-bottom: 3px;">Gaps to Address</div><ul style="font-size: 6px; color: #92400e; margin: 0; padding-left: 10px;">${reportData.productAnalysis.featureGaps.slice(0, 4).map(g => `<li>${truncate(g, 40)}</li>`).join('')}</ul></div>` : ''}
    </div>
    ` : ''}

    ${reportData.emergingPlayers && reportData.emergingPlayers.length > 0 ? `
    <div class="sec"><div class="sec-icon">E</div><div><div class="sec-title">Emerging Threats</div></div></div>
    <table class="table">
      <thead><tr><th>Company</th><th>Threat Level</th><th>Unique Advantage</th></tr></thead>
      <tbody>
        ${reportData.emergingPlayers.slice(0, 4).map(p => `
          <tr>
            <td><strong>${p.name}</strong><br><span style="font-size: 5px; color: #6b7280;">${truncate(p.description, 45)}</span></td>
            <td><span class="badge badge-${p.threatLevel === 'High' ? 'red' : p.threatLevel === 'Medium' ? 'orange' : 'green'}">${p.threatLevel}</span></td>
            <td style="font-size: 6px;">${truncate(p.uniqueAdvantage, 50)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    ` : ''}

    ${reportData.backreferences && reportData.backreferences.length > 0 ? `
    <div class="sec"><div class="sec-icon">L</div><div><div class="sec-title">Platform Presence (${backrefPresent}/${backrefTotal} claimed)</div></div></div>
    <div class="backref-grid">
      ${reportData.backreferences.slice(0, 8).map(b => `
        <div class="backref">
          <div class="backref-platform">${b.platform}</div>
          <div class="backref-status"><span class="badge badge-${b.status === 'present' ? 'green' : b.status === 'claimed' ? 'blue' : 'gray'}">${b.status}</span></div>
        </div>
      `).join('')}
    </div>
    ` : ''}
  </div>

  <!-- PAGE 3: ACTION PLAN & CITATIONS -->
  <div class="page">
    ${generateActionPlanSection(reportData.analysisRecommendations, reportData.metrics.visibilityScore)}

    ${generateCitationOpportunitiesSection(reportData.citationOpportunities, reportData.brand.name)}

    ${(highPriorityRecs.length > 0 || mediumPriorityRecs.length > 0) ? `
    <div class="sec"><div class="sec-icon">R</div><div><div class="sec-title">Strategic Recommendations</div><div class="sec-sub">Actionable steps to improve AI visibility</div></div></div>

    ${highPriorityRecs.length > 0 ? `
    <div class="rec-sec">
      <div class="rec-header" style="color: #ef4444;"><span class="rec-dot" style="background: #ef4444;"></span>High Priority - Do This Week</div>
      <div class="recs">${highPriorityRecs.map(r => `
        <div class="rec high">
          <div class="rec-title">${r.title || 'Untitled Recommendation'}</div>
          <div class="rec-desc">${truncate(r.description || 'No description available', 120)}</div>
          <div class="rec-meta">
            ${r.effort ? `<div class="rec-meta-item"><span class="rec-meta-lbl">Effort:</span><span class="rec-meta-val">${r.effort}</span></div>` : ''}
            ${r.timeline ? `<div class="rec-meta-item"><span class="rec-meta-lbl">Timeline:</span><span class="rec-meta-val">${r.timeline}</span></div>` : ''}
            ${r.expectedImpact ? `<div class="rec-meta-item"><span class="rec-meta-lbl">Impact:</span><span class="rec-meta-val">${r.expectedImpact}</span></div>` : ''}
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
          <div class="rec-desc">${truncate(r.description || 'No description available', 120)}</div>
          <div class="rec-meta">
            ${r.effort ? `<div class="rec-meta-item"><span class="rec-meta-lbl">Effort:</span><span class="rec-meta-val">${r.effort}</span></div>` : ''}
            ${r.expectedImpact ? `<div class="rec-meta-item"><span class="rec-meta-lbl">Impact:</span><span class="rec-meta-val">${r.expectedImpact}</span></div>` : ''}
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
          <div class="rec-desc">${truncate(r.description || 'No description available', 100)}</div>
        </div>
      `).join('')}</div>
    </div>
    ` : ''}
    ` : ''}
  </div>

  <!-- PAGE 4: PROMPTS & MENTIONS -->
  <div class="page">
    ${generateAnalysisPromptsSection(reportData.analysisPrompts, reportData.brand.name)}

    ${generateQueriesSection(reportData.promptsTested)}

    ${reportData.recentMentions && reportData.recentMentions.length > 0 ? `
    <div class="sec"><div class="sec-icon">M</div><div><div class="sec-title">Recent AI Mentions (${reportData.recentMentions.length} total)</div><div class="sec-sub">Where and how AI systems mentioned your brand</div></div></div>
    <table class="table">
      <thead><tr><th style="width: 50px;">Platform</th><th style="width: 45px;">Date</th><th style="width: 35px;">Rank</th><th style="width: 50px;">Sentiment</th><th>Query & AI Response Context</th></tr></thead>
      <tbody>
        ${reportData.recentMentions.slice(0, 10).map(m => {
          const aiSystem = m.aiSystem || 'unknown';
          const dateStr = m.date ? new Date(m.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'N/A';
          const position = m.position !== null && m.position !== undefined ? '#' + m.position : '--';
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
            <td style="font-size: 6px;">${dateStr}</td>
            <td style="text-align: center; font-weight: 600; font-size: 6px;">${position}</td>
            <td><span class="badge badge-${sentimentClass}">${sentimentLabel}</span></td>
            <td style="font-size: 6px; line-height: 1.3;">
              ${promptText ? `<strong>Q:</strong> ${truncate(promptText, 50)}<br>` : ''}
              <strong>A:</strong> ${truncate(contextText, 80)}
            </td>
          </tr>
        `}).join('')}
      </tbody>
    </table>
    ${reportData.recentMentions.length > 10 ? `
    <div style="font-size: 6px; color: #6b7280; text-align: right; margin-top: 4px;">Showing 10 of ${reportData.recentMentions.length} mentions. See full list in dashboard.</div>
    ` : ''}
    ` : `
    <div class="sec"><div class="sec-icon">M</div><div><div class="sec-title">Recent AI Mentions</div></div></div>
    <div style="background: #f8fafc; border-radius: 6px; padding: 20px; text-align: center; border: 1px solid #e2e8f0;">
      <div style="font-size: 9px; font-weight: 600; color: #6b7280;">No Mentions Found</div>
      <div style="font-size: 7px; color: #9ca3af; margin-top: 4px;">Run queries in the Prompt Lab to track when AI systems mention your brand.</div>
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

  // Open print dialog in new window
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
