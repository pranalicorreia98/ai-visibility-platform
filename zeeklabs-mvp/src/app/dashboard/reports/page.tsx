"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Download,
  Calendar,
  Globe,
  Link2,
  Briefcase,
  Package,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  MessageSquare,
  Target,
  Lightbulb,
  RefreshCw,
  Loader2,
  BarChart3,
  BookOpen,
  ClipboardList,
  ExternalLink,
  Hash,
  Info,
  ListChecks,
  Quote,
  Zap,
  Trophy,
} from "lucide-react";
import { useBrand } from "@/contexts/brand-context";

interface ReportData {
  brand: {
    name: string;
    domain?: string;
    alternateNames?: string[];
    createdAt?: string;
  };
  generatedAt: string;
  reportDate: string;
  period: string;
  metrics: {
    visibilityScore: number;
    chatgptScore: number;
    geminiScore: number;
    perplexityScore?: number;
    totalMentions: number;
    totalMentionsIncludingBiased?: number;
    chatgptMentions: number;
    geminiMentions: number;
    perplexityMentions?: number;
    biasedMentionsExcluded?: number;
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
      overallAvg: number | null;
      distribution: {
        chatgpt: { top3: number; top5: number; beyond5: number };
        gemini: { top3: number; top5: number; beyond5: number };
      };
    };
    scoreBreakdown?: {
      presence: number;
      sentiment: number;
      position: number;
      weights: { presence: number; sentiment: number; position: number };
    };
    mentionRate?: number;
  };
  recentMentions: Array<{
    id?: string;
    aiSystem: string;
    prompt?: string;
    response?: string;
    context: string;
    sentiment: number | null;
    position: number | null;
    date: string;
    simulationId?: string;
  }>;
  promptsTested?: Array<{
    id: number;
    prompt: string;
    mentionCount: number;
    systems: string[];
  }>;
  citations?: Array<{
    id: number;
    source: string;
    type: string;
    url?: string;
  }>;
  recommendations: Array<{
    id?: string;
    title: string;
    description: string;
    priority: string;
    category: string;
    effort?: string;
    timeline?: string;
    expectedImpact?: string;
    actionUrl?: string;
    guideUrl?: string;
    competitorGap?: string;
    isCompleted: boolean;
    completedAt?: string;
  }>;
  backreferences?: Array<{
    platform: string;
    tier: string;
    status: string;
    details?: string;
    profileUrl?: string;
    competitorStatus?: string;
    priority: string;
    claimedAt?: string;
  }>;
  competitors: Array<{
    name: string;
    domain?: string;
  }>;
  // =============================================
  // FULL ANALYSIS DATA FROM AI VISIBILITY ANALYSIS
  // =============================================
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
    macroFactors: string[];
    microFactors: string[];
    futureOutlook: string;
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
    marketSentiment: {
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
    growthTrajectory: string;
  }> | null;
  productAnalysis?: {
    featureGaps: string[];
    featureAdvantages: string[];
  } | null;
  analysisCitations?: Array<{
    source: string;
    type: string;
    relevance: string;
    url?: string;
  }> | null;
  analysisRecommendations?: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    competitiveActions: string[];
  } | null;
  aiVisibility?: {
    mentionFrequency: string;
    typicalPosition: number | null;
    recommendationLikelihood: string;
    competitorMentionGap: string;
    improvementAreas: string[];
  } | null;
  analysisTimestamp?: string | null;
  // =============================================
  improvementPlan?: {
    totalRecommendations: number;
    completed: number;
    pending: number;
    highPriority: number;
    mediumPriority: number;
    lowPriority: number;
    byCategory: {
      entity: number;
      content: number;
      authority: number;
      technical: number;
      community: number;
    };
    platformsNeeded: number;
    platformsPresent: number;
  };
  methodology?: {
    dataPeriod: string;
    dataCollectionMethod: string;
    aiSystemsTested: string[];
    scoringFormula: string;
    sentimentAnalysis: string;
    positionTracking: string;
    dataQuality?: string;
    citationSources?: string;
  };
}

// Circular Progress Bar Component
function CircularProgress({
  value,
  size = 160,
  strokeWidth = 10,
  showLabel = true,
  labelSize = "large",
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  labelSize?: "small" | "large";
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const getColor = (score: number) => {
    if (score >= 70) return { start: "#22c55e", end: "#16a34a" }; // Green
    if (score >= 40) return { start: "#f59e0b", end: "#d97706" }; // Orange
    return { start: "#ef4444", end: "#dc2626" }; // Red
  };

  const colors = getColor(value);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={`gradient-${value}-${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.start} />
            <stop offset="100%" stopColor={colors.end} />
          </linearGradient>
        </defs>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#gradient-${value}-${size})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold ${labelSize === "large" ? "text-3xl" : "text-lg"}`}>
            {value}
            {labelSize === "large" && <span className="text-sm text-muted-foreground">/100</span>}
          </span>
        </div>
      )}
    </div>
  );
}

// AI Model Card
function AIModelCard({
  name,
  score,
  mentioned,
  icon,
}: {
  name: string;
  score: number;
  mentioned: boolean;
  icon: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-bold">
        {icon}
      </div>
      {mentioned ? (
        <CheckCircle className="h-5 w-5 text-emerald-500" />
      ) : (
        <XCircle className="h-5 w-5 text-red-500" />
      )}
      <span className="font-medium">{score}</span>
    </div>
  );
}

// Strategy Bar
function StrategyBar({ label, value }: { label: string; value: number }) {
  const getBarColor = (score: number) => {
    if (score >= 70) return "bg-emerald-500";
    if (score >= 40) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${getBarColor(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { selectedBrand, selectedBrandId } = useBrand();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const generateReport = useCallback(async () => {
    if (!selectedBrandId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId: selectedBrandId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate report");
      }

      setReportData(data.report);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report");
    } finally {
      setLoading(false);
    }
  }, [selectedBrandId]);

  // Auto-generate report when brand changes
  useEffect(() => {
    if (selectedBrandId) {
      generateReport();
    }
  }, [selectedBrandId, generateReport]);

  const downloadAsPDF = async () => {
    if (!reportData) return;

    setDownloadingPdf(true);

    try {
      // Create professional HTML report with improved layout
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>AI Visibility Report - ${reportData.brand.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    @page {
      size: A4;
      margin: 15mm 15mm 20mm 15mm;
    }

    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
      background: #fff;
      color: #1f2937;
      line-height: 1.5;
      font-size: 11px;
    }

    .container {
      max-width: 210mm;
      margin: 0 auto;
      padding: 0;
    }

    /* Cover Page */
    .cover-page {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      page-break-after: always;
      padding: 40px;
    }
    .cover-logo {
      font-size: 48px;
      font-weight: 800;
      margin-bottom: 8px;
      letter-spacing: -1px;
    }
    .cover-tagline {
      font-size: 16px;
      opacity: 0.9;
      margin-bottom: 60px;
    }
    .cover-title {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 16px;
    }
    .cover-brand {
      font-size: 24px;
      font-weight: 600;
      padding: 16px 40px;
      background: rgba(255,255,255,0.15);
      border-radius: 12px;
      margin-bottom: 40px;
    }
    .cover-score {
      width: 160px;
      height: 160px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
      border: 4px solid rgba(255,255,255,0.4);
    }
    .cover-score-value { font-size: 56px; font-weight: 800; }
    .cover-score-label { font-size: 14px; opacity: 0.8; }
    .cover-date {
      font-size: 14px;
      opacity: 0.8;
      margin-top: 40px;
    }

    /* Table of Contents */
    .toc {
      padding: 40px;
      page-break-after: always;
    }
    .toc-title {
      font-size: 24px;
      font-weight: 700;
      color: #6366f1;
      margin-bottom: 30px;
      padding-bottom: 16px;
      border-bottom: 2px solid #e5e7eb;
    }
    .toc-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px dashed #e5e7eb;
      font-size: 13px;
    }
    .toc-number {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #6366f1;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 12px;
      margin-right: 16px;
    }
    .toc-text { flex: 1; font-weight: 500; }

    /* Main Content */
    .page {
      padding: 30px 40px;
      page-break-after: always;
    }
    .page:last-child {
      page-break-after: auto;
    }

    /* Section Headers */
    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 2px solid #6366f1;
    }
    .section-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }
    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: #1f2937;
    }
    .section-subtitle {
      font-size: 12px;
      color: #6b7280;
      margin-top: 2px;
    }

    /* Executive Summary */
    .executive-summary {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
      border: 1px solid #e2e8f0;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 24px;
    }
    .score-ring {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: conic-gradient(
        ${reportData.metrics.visibilityScore >= 70 ? '#22c55e' : reportData.metrics.visibilityScore >= 40 ? '#f59e0b' : '#ef4444'} ${reportData.metrics.visibilityScore * 3.6}deg,
        #e5e7eb ${reportData.metrics.visibilityScore * 3.6}deg
      );
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .score-ring-inner {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      background: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .score-ring-value { font-size: 32px; font-weight: 800; color: #1f2937; }
    .score-ring-label { font-size: 10px; color: #6b7280; }

    .summary-details { display: flex; flex-direction: column; gap: 12px; }
    .summary-brand { font-size: 18px; font-weight: 700; color: #1f2937; }
    .summary-meta { font-size: 11px; color: #6b7280; }
    .summary-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-top: 8px;
    }
    .summary-stat {
      background: white;
      padding: 12px;
      border-radius: 8px;
      text-align: center;
      border: 1px solid #e5e7eb;
    }
    .summary-stat-value { font-size: 20px; font-weight: 700; color: #6366f1; }
    .summary-stat-label { font-size: 9px; color: #6b7280; text-transform: uppercase; }

    /* Metric Cards */
    .metric-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .metric-card {
      background: white;
      border-radius: 12px;
      padding: 16px;
      border: 1px solid #e5e7eb;
      text-align: center;
    }
    .metric-card-value {
      font-size: 28px;
      font-weight: 700;
    }
    .metric-card-label {
      font-size: 11px;
      color: #6b7280;
      margin-top: 4px;
    }
    .metric-card-change {
      font-size: 10px;
      padding: 2px 8px;
      border-radius: 10px;
      margin-top: 8px;
      display: inline-block;
    }

    /* Platform Scores */
    .platform-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .platform-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      border: 1px solid #e5e7eb;
    }
    .platform-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
    }
    .platform-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 12px;
    }
    .platform-name { font-weight: 600; font-size: 13px; }
    .platform-score {
      font-size: 36px;
      font-weight: 800;
      margin-bottom: 8px;
    }
    .platform-bar {
      height: 6px;
      background: #f3f4f6;
      border-radius: 3px;
      overflow: hidden;
    }
    .platform-bar-fill {
      height: 100%;
      border-radius: 3px;
    }
    .platform-mentions {
      font-size: 10px;
      color: #6b7280;
      margin-top: 8px;
    }

    /* Data Tables */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      margin-bottom: 24px;
    }
    .data-table th {
      background: #f8fafc;
      padding: 10px 12px;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border-bottom: 2px solid #e5e7eb;
      font-size: 10px;
      text-transform: uppercase;
    }
    .data-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #f3f4f6;
      color: #4b5563;
    }
    .data-table tr:nth-child(even) {
      background: #fafafa;
    }

    /* Recommendation Cards */
    .rec-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 16px;
    }
    .rec-card {
      padding: 14px;
      border-radius: 10px;
      border-left: 4px solid;
      background: #fafafa;
    }
    .rec-card.high { border-color: #ef4444; background: #fef2f2; }
    .rec-card.medium { border-color: #f59e0b; background: #fffbeb; }
    .rec-card.low { border-color: #6366f1; background: #eef2ff; }
    .rec-title { font-weight: 600; font-size: 11px; margin-bottom: 4px; color: #1f2937; }
    .rec-desc { font-size: 10px; color: #6b7280; line-height: 1.4; }
    .rec-badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: 500;
      margin-top: 8px;
      text-transform: uppercase;
    }

    /* Glossary */
    .glossary {
      background: #f8fafc;
      border-radius: 12px;
      padding: 24px;
      margin-top: 30px;
    }
    .glossary-title {
      font-size: 16px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .glossary-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    .glossary-item {
      padding: 12px;
      background: white;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    .glossary-term {
      font-weight: 600;
      font-size: 11px;
      color: #6366f1;
      margin-bottom: 4px;
    }
    .glossary-def {
      font-size: 10px;
      color: #6b7280;
      line-height: 1.4;
    }

    /* Footer */
    .page-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 10px 40px;
      background: white;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9px;
      color: #9ca3af;
    }
    .page-footer-logo { font-weight: 700; color: #6366f1; }

    /* Print Styles */
    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
        font-size: 10px;
      }
      .cover-page {
        height: auto;
        min-height: 100vh;
        page-break-after: always;
      }
      .page { page-break-inside: avoid; }
      .glossary { page-break-inside: avoid; }
    }

    /* Status Colors */
    .text-green { color: #22c55e; }
    .text-red { color: #ef4444; }
    .text-orange { color: #f59e0b; }
    .text-purple { color: #8b5cf6; }
    .text-blue { color: #3b82f6; }
    .bg-green { background: #dcfce7; }
    .bg-red { background: #fee2e2; }
    .bg-orange { background: #fef3c7; }
  </style>
</head>
<body>
  <div class="container">

    <!-- COVER PAGE -->
    <div class="cover-page">
      <div class="cover-logo">zeeklabs.ai</div>
      <div class="cover-tagline">AI Visibility Intelligence Platform</div>
      <div class="cover-title">AI Visibility Report</div>
      <div class="cover-brand">${reportData.brand.name}</div>
      <div class="cover-score">
        <div class="cover-score-value">${reportData.metrics.visibilityScore}</div>
        <div class="cover-score-label">Visibility Score</div>
      </div>
      <div class="cover-date">
        Generated on ${reportData.reportDate}<br>
        Analysis Period: ${reportData.period}
      </div>
    </div>

    <!-- TABLE OF CONTENTS -->
    <div class="toc">
      <div class="toc-title">Table of Contents</div>
      <div class="toc-item">
        <div class="toc-number">1</div>
        <div class="toc-text">Executive Summary</div>
      </div>
      <div class="toc-item">
        <div class="toc-number">2</div>
        <div class="toc-text">Platform Performance</div>
      </div>
      <div class="toc-item">
        <div class="toc-number">3</div>
        <div class="toc-text">Sentiment Analysis</div>
      </div>
      <div class="toc-item">
        <div class="toc-number">4</div>
        <div class="toc-text">Position & Ranking</div>
      </div>
      ${reportData.competitors.length > 0 ? `
      <div class="toc-item">
        <div class="toc-number">5</div>
        <div class="toc-text">Competitive Landscape</div>
      </div>` : ''}
      <div class="toc-item">
        <div class="toc-number">${reportData.competitors.length > 0 ? '6' : '5'}</div>
        <div class="toc-text">Strategic Recommendations</div>
      </div>
      <div class="toc-item">
        <div class="toc-number">${reportData.competitors.length > 0 ? '7' : '6'}</div>
        <div class="toc-text">Recent AI Mentions</div>
      </div>
      <div class="toc-item">
        <div class="toc-number">${reportData.competitors.length > 0 ? '8' : '7'}</div>
        <div class="toc-text">Glossary & Metric Definitions</div>
      </div>
    </div>

    <!-- PAGE 1: EXECUTIVE SUMMARY -->
    <div class="page">
      <div class="section-header">
        <div class="section-icon">📊</div>
        <div>
          <div class="section-title">Executive Summary</div>
          <div class="section-subtitle">Key metrics and performance overview</div>
        </div>
      </div>

      <div class="executive-summary">
        <div class="summary-grid">
          <div class="score-ring">
            <div class="score-ring-inner">
              <div class="score-ring-value">${reportData.metrics.visibilityScore}</div>
              <div class="score-ring-label">OVERALL SCORE</div>
            </div>
          </div>
          <div class="summary-details">
            <div class="summary-brand">${reportData.brand.name}</div>
            <div class="summary-meta">
              ${reportData.brand.domain ? `🌐 ${reportData.brand.domain}` : ''} &nbsp;|&nbsp;
              📅 ${reportData.reportDate} &nbsp;|&nbsp;
              📊 ${reportData.period}
            </div>
            <div class="summary-stats">
              <div class="summary-stat">
                <div class="summary-stat-value">${reportData.metrics.totalMentions}</div>
                <div class="summary-stat-label">Total Mentions</div>
              </div>
              <div class="summary-stat">
                <div class="summary-stat-value">${reportData.metrics.simulationsRun}</div>
                <div class="summary-stat-label">Simulations</div>
              </div>
              <div class="summary-stat">
                <div class="summary-stat-value">${reportData.metrics.sentiment.average > 0 ? '+' : ''}${reportData.metrics.sentiment.average}%</div>
                <div class="summary-stat-label">Sentiment</div>
              </div>
              <div class="summary-stat">
                <div class="summary-stat-value">${reportData.metrics.position?.overallAvg ? '#' + reportData.metrics.position.overallAvg : 'N/A'}</div>
                <div class="summary-stat-label">Avg Position</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Platform Performance -->
      <div class="section-header" style="margin-top: 32px;">
        <div class="section-icon">🤖</div>
        <div>
          <div class="section-title">Platform Performance</div>
          <div class="section-subtitle">Visibility scores across AI platforms</div>
        </div>
      </div>

      <div class="platform-grid">
        <div class="platform-card">
          <div class="platform-header">
            <div class="platform-icon" style="background: #dcfce7; color: #166534;">GPT</div>
            <div class="platform-name">ChatGPT</div>
          </div>
          <div class="platform-score text-green">${reportData.metrics.chatgptScore}%</div>
          <div class="platform-bar">
            <div class="platform-bar-fill" style="width: ${reportData.metrics.chatgptScore}%; background: linear-gradient(90deg, #22c55e, #16a34a);"></div>
          </div>
          <div class="platform-mentions">${reportData.metrics.chatgptMentions} mentions detected</div>
        </div>
        <div class="platform-card">
          <div class="platform-header">
            <div class="platform-icon" style="background: #dbeafe; color: #1e40af;">G</div>
            <div class="platform-name">Google Gemini</div>
          </div>
          <div class="platform-score text-blue">${reportData.metrics.geminiScore}%</div>
          <div class="platform-bar">
            <div class="platform-bar-fill" style="width: ${reportData.metrics.geminiScore}%; background: linear-gradient(90deg, #3b82f6, #2563eb);"></div>
          </div>
          <div class="platform-mentions">${reportData.metrics.geminiMentions} mentions detected</div>
        </div>
        <div class="platform-card">
          <div class="platform-header">
            <div class="platform-icon" style="background: #f3e8ff; color: #7c3aed;">P</div>
            <div class="platform-name">Perplexity</div>
          </div>
          <div class="platform-score text-purple">${reportData.metrics.perplexityScore || 0}%</div>
          <div class="platform-bar">
            <div class="platform-bar-fill" style="width: ${reportData.metrics.perplexityScore || 0}%; background: linear-gradient(90deg, #8b5cf6, #7c3aed);"></div>
          </div>
          <div class="platform-mentions">${reportData.metrics.perplexityMentions || 0} mentions detected</div>
        </div>
      </div>

      <!-- Sentiment Analysis Section -->
      <div class="section-header" style="margin-top: 32px;">
        <div class="section-icon">💭</div>
        <div>
          <div class="section-title">Sentiment Analysis</div>
          <div class="section-subtitle">How AI platforms describe your brand</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 24px; margin-bottom: 24px;">
        <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb; text-align: center;">
          <div style="font-size: 48px; font-weight: 800; color: ${reportData.metrics.sentiment.average > 20 ? '#22c55e' : reportData.metrics.sentiment.average > -20 ? '#f59e0b' : '#ef4444'};">
            ${reportData.metrics.sentiment.average > 0 ? '+' : ''}${reportData.metrics.sentiment.average}%
          </div>
          <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Average Sentiment</div>
          <div style="margin-top: 12px; padding: 8px 16px; border-radius: 20px; display: inline-block; font-size: 11px; font-weight: 500;
            background: ${reportData.metrics.sentiment.average > 20 ? '#dcfce7' : reportData.metrics.sentiment.average > -20 ? '#fef3c7' : '#fee2e2'};
            color: ${reportData.metrics.sentiment.average > 20 ? '#166534' : reportData.metrics.sentiment.average > -20 ? '#92400e' : '#991b1b'};">
            ${reportData.metrics.sentiment.average > 20 ? 'Positive' : reportData.metrics.sentiment.average > -20 ? 'Neutral' : 'Negative'} Overall
          </div>
        </div>
        <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb;">
          <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-size: 12px; font-weight: 500; color: #22c55e;">Positive</span>
              <span style="font-size: 12px; font-weight: 600;">${reportData.metrics.sentiment.positive}</span>
            </div>
            <div style="height: 8px; background: #f3f4f6; border-radius: 4px; overflow: hidden;">
              <div style="height: 100%; background: linear-gradient(90deg, #22c55e, #16a34a); border-radius: 4px; width: ${reportData.metrics.totalMentions > 0 ? (reportData.metrics.sentiment.positive / reportData.metrics.totalMentions) * 100 : 0}%;"></div>
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-size: 12px; font-weight: 500; color: #f59e0b;">Neutral</span>
              <span style="font-size: 12px; font-weight: 600;">${reportData.metrics.sentiment.neutral}</span>
            </div>
            <div style="height: 8px; background: #f3f4f6; border-radius: 4px; overflow: hidden;">
              <div style="height: 100%; background: linear-gradient(90deg, #f59e0b, #d97706); border-radius: 4px; width: ${reportData.metrics.totalMentions > 0 ? (reportData.metrics.sentiment.neutral / reportData.metrics.totalMentions) * 100 : 0}%;"></div>
            </div>
          </div>
          <div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-size: 12px; font-weight: 500; color: #ef4444;">Negative</span>
              <span style="font-size: 12px; font-weight: 600;">${reportData.metrics.sentiment.negative}</span>
            </div>
            <div style="height: 8px; background: #f3f4f6; border-radius: 4px; overflow: hidden;">
              <div style="height: 100%; background: linear-gradient(90deg, #ef4444, #dc2626); border-radius: 4px; width: ${reportData.metrics.totalMentions > 0 ? (reportData.metrics.sentiment.negative / reportData.metrics.totalMentions) * 100 : 0}%;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- PAGE 2: POSITION & COMPETITORS -->
    <div class="page">
      ${reportData.metrics.position ? `
      <div class="section-header">
        <div class="section-icon">#</div>
        <div>
          <div class="section-title">Position & Ranking Analysis</div>
          <div class="section-subtitle">Where your brand appears in AI responses</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
        <div style="background: #dcfce7; border-radius: 12px; padding: 20px; text-align: center;">
          <div style="font-size: 32px; font-weight: 800; color: #166534;">${reportData.metrics.position.chatgptAvg !== null ? '#' + reportData.metrics.position.chatgptAvg : 'N/A'}</div>
          <div style="font-size: 11px; color: #166534; margin-top: 4px;">ChatGPT Avg Position</div>
        </div>
        <div style="background: #dbeafe; border-radius: 12px; padding: 20px; text-align: center;">
          <div style="font-size: 32px; font-weight: 800; color: #1e40af;">${reportData.metrics.position.geminiAvg !== null ? '#' + reportData.metrics.position.geminiAvg : 'N/A'}</div>
          <div style="font-size: 11px; color: #1e40af; margin-top: 4px;">Gemini Avg Position</div>
        </div>
        <div style="background: #f3e8ff; border-radius: 12px; padding: 20px; text-align: center;">
          <div style="font-size: 32px; font-weight: 800; color: #6d28d9;">${reportData.metrics.position.overallAvg !== null ? '#' + reportData.metrics.position.overallAvg : 'N/A'}</div>
          <div style="font-size: 11px; color: #6d28d9; margin-top: 4px;">Overall Avg Position</div>
        </div>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>Platform</th>
            <th style="text-align: center;">Top 3</th>
            <th style="text-align: center;">Position 4-5</th>
            <th style="text-align: center;">Position 6+</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>ChatGPT</strong></td>
            <td style="text-align: center;"><span style="background: #dcfce7; padding: 4px 10px; border-radius: 12px; color: #166534;">${reportData.metrics.position.distribution.chatgpt.top3}</span></td>
            <td style="text-align: center;"><span style="background: #fef3c7; padding: 4px 10px; border-radius: 12px; color: #92400e;">${reportData.metrics.position.distribution.chatgpt.top5}</span></td>
            <td style="text-align: center;"><span style="background: #fee2e2; padding: 4px 10px; border-radius: 12px; color: #991b1b;">${reportData.metrics.position.distribution.chatgpt.beyond5}</span></td>
          </tr>
          <tr>
            <td><strong>Gemini</strong></td>
            <td style="text-align: center;"><span style="background: #dcfce7; padding: 4px 10px; border-radius: 12px; color: #166534;">${reportData.metrics.position.distribution.gemini.top3}</span></td>
            <td style="text-align: center;"><span style="background: #fef3c7; padding: 4px 10px; border-radius: 12px; color: #92400e;">${reportData.metrics.position.distribution.gemini.top5}</span></td>
            <td style="text-align: center;"><span style="background: #fee2e2; padding: 4px 10px; border-radius: 12px; color: #991b1b;">${reportData.metrics.position.distribution.gemini.beyond5}</span></td>
          </tr>
        </tbody>
      </table>
      ` : ''}

      ${reportData.competitors.length > 0 ? `
      <div class="section-header" style="margin-top: 32px;">
        <div class="section-icon">👥</div>
        <div>
          <div class="section-title">Competitive Landscape</div>
          <div class="section-subtitle">Competitors being tracked for comparison</div>
        </div>
      </div>

      <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 24px;">
        ${reportData.competitors.map(c => `
          <div style="background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px 20px; display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 8px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; color: #6b7280;">${c.name.charAt(0)}</div>
            <div>
              <div style="font-weight: 600; font-size: 12px;">${c.name}</div>
              ${c.domain ? `<div style="font-size: 10px; color: #9ca3af;">${c.domain}</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
      ` : ''}
    </div>

    <!-- PAGE 3: STRATEGIC RECOMMENDATIONS -->
    <div class="page">
      <div class="section-header">
        <div class="section-icon">🎯</div>
        <div>
          <div class="section-title">Strategic Recommendations</div>
          <div class="section-subtitle">Prioritized action items to improve AI visibility</div>
        </div>
      </div>

      ${reportData.recommendations.length > 0 ? `
      <div style="margin-bottom: 24px;">
        <div style="font-size: 13px; font-weight: 600; color: #ef4444; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          <span style="width: 10px; height: 10px; border-radius: 50%; background: #ef4444;"></span>
          High Priority Actions
        </div>
        <div class="rec-grid">
          ${reportData.recommendations.filter(r => r.priority === 'high').slice(0, 4).map(r => `
            <div class="rec-card high">
              <div class="rec-title">${r.title}</div>
              <div class="rec-desc">${r.description}</div>
              <span class="rec-badge" style="background: #fee2e2; color: #991b1b;">${r.category}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div style="margin-bottom: 24px;">
        <div style="font-size: 13px; font-weight: 600; color: #f59e0b; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          <span style="width: 10px; height: 10px; border-radius: 50%; background: #f59e0b;"></span>
          Medium Priority Actions
        </div>
        <div class="rec-grid">
          ${reportData.recommendations.filter(r => r.priority === 'medium').slice(0, 4).map(r => `
            <div class="rec-card medium">
              <div class="rec-title">${r.title}</div>
              <div class="rec-desc">${r.description}</div>
              <span class="rec-badge" style="background: #fef3c7; color: #92400e;">${r.category}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div>
        <div style="font-size: 13px; font-weight: 600; color: #6366f1; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          <span style="width: 10px; height: 10px; border-radius: 50%; background: #6366f1;"></span>
          Strategic Goals
        </div>
        <div class="rec-grid">
          ${reportData.recommendations.filter(r => r.priority === 'low').slice(0, 4).map(r => `
            <div class="rec-card low">
              <div class="rec-title">${r.title}</div>
              <div class="rec-desc">${r.description}</div>
              <span class="rec-badge" style="background: #eef2ff; color: #4338ca;">${r.category}</span>
            </div>
          `).join('')}
        </div>
      </div>
      ` : '<p style="color: #6b7280; text-align: center; padding: 40px;">No recommendations available. Run AI Visibility analysis to generate recommendations.</p>'}
    </div>

    <!-- PAGE 4: RECENT MENTIONS -->
    <div class="page">
      <div class="section-header">
        <div class="section-icon">💬</div>
        <div>
          <div class="section-title">Recent AI Mentions</div>
          <div class="section-subtitle">Where AI platforms mentioned your brand</div>
        </div>
      </div>

      ${reportData.recentMentions.length > 0 ? `
      <table class="data-table">
        <thead>
          <tr>
            <th>Platform</th>
            <th>Date</th>
            <th>Position</th>
            <th>Sentiment</th>
            <th>Context</th>
          </tr>
        </thead>
        <tbody>
          ${reportData.recentMentions.slice(0, 10).map(m => `
            <tr>
              <td>
                <span style="padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 600;
                  background: ${m.aiSystem === 'chatgpt' ? '#dcfce7' : m.aiSystem === 'gemini' ? '#dbeafe' : '#f3e8ff'};
                  color: ${m.aiSystem === 'chatgpt' ? '#166534' : m.aiSystem === 'gemini' ? '#1e40af' : '#6d28d9'};">
                  ${m.aiSystem === 'chatgpt' ? 'ChatGPT' : m.aiSystem === 'gemini' ? 'Gemini' : 'Perplexity'}
                </span>
              </td>
              <td style="font-size: 10px;">${new Date(m.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
              <td style="text-align: center;">${m.position ? '#' + m.position : '-'}</td>
              <td>
                <span style="padding: 2px 8px; border-radius: 10px; font-size: 10px;
                  background: ${m.sentiment !== null && m.sentiment > 0.2 ? '#dcfce7' : m.sentiment !== null && m.sentiment < -0.2 ? '#fee2e2' : '#fef3c7'};
                  color: ${m.sentiment !== null && m.sentiment > 0.2 ? '#166534' : m.sentiment !== null && m.sentiment < -0.2 ? '#991b1b' : '#92400e'};">
                  ${m.sentiment !== null && m.sentiment > 0.2 ? 'Positive' : m.sentiment !== null && m.sentiment < -0.2 ? 'Negative' : 'Neutral'}
                </span>
              </td>
              <td style="font-size: 10px; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${(m.context || 'No context').substring(0, 80)}...</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      ` : '<p style="color: #6b7280; text-align: center; padding: 40px;">No mentions recorded yet. Run simulations to see how AI platforms mention your brand.</p>'}


      <!-- GLOSSARY PAGE -->
      <div class="glossary">
        <div class="glossary-title">
          📖 Glossary & Metric Definitions
        </div>
        <div class="glossary-grid">
          <div class="glossary-item">
            <div class="glossary-term">Visibility Score</div>
            <div class="glossary-def">A composite score (0-100) measuring how often and prominently your brand appears in AI responses. Higher scores indicate better AI visibility.</div>
          </div>
          <div class="glossary-item">
            <div class="glossary-term">Platform Score</div>
            <div class="glossary-def">Individual visibility score for each AI platform (ChatGPT, Gemini, Perplexity). Shows your brand's presence on specific platforms.</div>
          </div>
          <div class="glossary-item">
            <div class="glossary-term">Sentiment Analysis</div>
            <div class="glossary-def">Measures how positively or negatively AI platforms describe your brand. Positive sentiment indicates favorable recommendations.</div>
          </div>
          <div class="glossary-item">
            <div class="glossary-term">Position/Ranking</div>
            <div class="glossary-def">Where your brand appears in AI response lists. Lower numbers (e.g., #1, #2) indicate higher prominence.</div>
          </div>
          <div class="glossary-item">
            <div class="glossary-term">Total Mentions</div>
            <div class="glossary-def">The number of times your brand was mentioned across all AI simulations during the reporting period.</div>
          </div>
          <div class="glossary-item">
            <div class="glossary-term">Simulations</div>
            <div class="glossary-def">AI queries run to test how different platforms respond to industry-relevant prompts about your category.</div>
          </div>
          <div class="glossary-item">
            <div class="glossary-term">Recommendation Likelihood</div>
            <div class="glossary-def">Probability that AI will recommend your brand when users ask for suggestions in your category.</div>
          </div>
          <div class="glossary-item">
            <div class="glossary-term">Competitor Gap</div>
            <div class="glossary-def">The difference in AI visibility between your brand and competitors, indicating areas for improvement.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- FOOTER -->
    <div style="text-align: center; padding: 40px 0; border-top: 2px solid #e5e7eb; margin-top: 40px;">
      <div style="font-size: 20px; font-weight: 800; color: #6366f1; margin-bottom: 8px;">zeeklabs.ai</div>
      <div style="color: #6b7280; font-size: 12px;">AI Visibility Intelligence Platform</div>
      <div style="color: #9ca3af; font-size: 11px; margin-top: 12px;">
        Generated on ${reportData.reportDate} | © ${new Date().getFullYear()} zeeklabs.ai. All rights reserved.
      </div>
      <div style="margin-top: 16px; padding: 12px 24px; background: #f8fafc; border-radius: 8px; display: inline-block;">
        <span style="font-size: 10px; color: #6b7280;">Need help improving your AI visibility? Contact us at </span>
        <span style="font-size: 10px; color: #6366f1; font-weight: 500;">support@zeeklabs.ai</span>
      </div>
    </div>
  </div>
</body>
</html>`;

      // Open print dialog with fallback for reliable printing
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();

        // Use setTimeout as fallback since onload may not fire in all browsers
        setTimeout(() => {
          try {
            printWindow.focus();
            printWindow.print();
          } catch (e) {
            console.error("Print error:", e);
          }
          setDownloadingPdf(false);
        }, 500);
      } else {
        setDownloadingPdf(false);
      }
    } catch (err) {
      console.error("Error downloading PDF:", err);
      setDownloadingPdf(false);
    }
  };

  if (!selectedBrand) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analysis Report</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Generate professional AI visibility reports
          </p>
        </div>
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No Brand Selected</h3>
            <p className="text-muted-foreground text-sm">
              Please select a brand to generate an analysis report.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return <ReportSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analysis Report</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Generate professional AI visibility reports
          </p>
        </div>
        <Card className="border-destructive/50">
          <CardContent className="py-12 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Failed to Generate Report</h3>
            <p className="text-muted-foreground text-sm mb-4">{error}</p>
            <Button onClick={generateReport}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!reportData) {
    return null;
  }

  const metrics = reportData.metrics;

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analysis Report</h1>
          <p className="text-muted-foreground text-sm mt-1">
            AI visibility analysis for {reportData.brand.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={generateReport} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={downloadAsPDF} disabled={downloadingPdf} className="gradient-bg">
            {downloadingPdf ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download PDF
          </Button>
        </div>
      </div>

      {/* Main Score Card */}
      <Card className="card-premium overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Score Circle */}
            <CircularProgress value={metrics.visibilityScore} size={160} strokeWidth={12} />

            {/* Brand Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{reportData.brand.name}</h2>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{reportData.reportDate}</span>
                  </div>
                  {reportData.brand.domain && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span>{reportData.brand.domain}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4" />
                    <span>{reportData.period}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Industry: <span className="font-medium">Technology</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Simulations: <span className="font-medium">{metrics.simulationsRun}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* AI Presence */}
        <Card className="card-premium">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">AI Presence</CardTitle>
              <CircularProgress value={metrics.visibilityScore} size={50} strokeWidth={4} labelSize="small" />
            </div>
          </CardHeader>
          <CardContent>
            <AIModelCard
              name="ChatGPT"
              score={metrics.chatgptScore}
              mentioned={metrics.chatgptMentions > 0}
              icon="GPT"
            />
            <AIModelCard
              name="Gemini"
              score={metrics.geminiScore}
              mentioned={metrics.geminiMentions > 0}
              icon="G"
            />
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <Card className="card-premium">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Mentions</CardTitle>
              <CircularProgress
                value={Math.min(100, metrics.totalMentions * 10)}
                size={50}
                strokeWidth={4}
                labelSize="small"
                showLabel={false}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.totalMentions}</div>
            <div className="flex gap-4 mt-3 text-sm">
              <div>
                <span className="text-emerald-500 font-medium">{metrics.chatgptMentions}</span>
                <span className="text-muted-foreground ml-1">ChatGPT</span>
              </div>
              <div>
                <span className="text-blue-500 font-medium">{metrics.geminiMentions}</span>
                <span className="text-muted-foreground ml-1">Gemini</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Competitor Landscape */}
        <Card className="card-premium">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Competitors</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {reportData.competitors.length > 0 ? (
              <>
                <div className="text-3xl font-bold">{reportData.competitors.length}</div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {reportData.competitors.slice(0, 3).map((c, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {c.name}
                    </Badge>
                  ))}
                  {reportData.competitors.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{reportData.competitors.length - 3}
                    </Badge>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No competitors tracked</p>
            )}
          </CardContent>
        </Card>

        {/* Strategy Review */}
        <Card className="card-premium">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Sentiment</CardTitle>
              <CircularProgress
                value={Math.max(0, Math.min(100, 50 + metrics.sentiment.average / 2))}
                size={50}
                strokeWidth={4}
                labelSize="small"
                showLabel={false}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                Positive
              </span>
              <span className="font-medium">{metrics.sentiment.positive}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                Neutral
              </span>
              <span className="font-medium">{metrics.sentiment.neutral}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                Negative
              </span>
              <span className="font-medium">{metrics.sentiment.negative}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategy Review Section */}
      <Card className="card-premium">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle>Visibility Breakdown</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <StrategyBar label="ChatGPT Visibility" value={metrics.chatgptScore} />
              <StrategyBar label="Gemini Visibility" value={metrics.geminiScore} />
            </div>
            <div className="space-y-4">
              <StrategyBar
                label="Mention Rate"
                value={
                  metrics.simulationsRun > 0
                    ? Math.round((metrics.totalMentions / (metrics.simulationsRun * 2)) * 100)
                    : 0
                }
              />
              <StrategyBar
                label="Sentiment Score"
                value={Math.max(0, Math.min(100, 50 + metrics.sentiment.average / 2))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Breakdown Section */}
      {metrics.scoreBreakdown && (
        <Card className="card-premium">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle>Score Breakdown</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <div className="text-3xl font-bold text-primary">{metrics.scoreBreakdown.presence}</div>
                <div className="text-sm text-muted-foreground mt-1">Presence Score</div>
                <div className="text-xs text-muted-foreground">(Weight: {metrics.scoreBreakdown.weights.presence}%)</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <div className="text-3xl font-bold text-emerald-500">{metrics.scoreBreakdown.sentiment}</div>
                <div className="text-sm text-muted-foreground mt-1">Sentiment Score</div>
                <div className="text-xs text-muted-foreground">(Weight: {metrics.scoreBreakdown.weights.sentiment}%)</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <div className="text-3xl font-bold text-blue-500">{metrics.scoreBreakdown.position}</div>
                <div className="text-sm text-muted-foreground mt-1">Position Score</div>
                <div className="text-xs text-muted-foreground">(Weight: {metrics.scoreBreakdown.weights.position}%)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Position Analysis Section */}
      {metrics.position && (
        <Card className="card-premium">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-primary" />
              <CardTitle>Position Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-4">Average Ranking Position</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="font-medium">ChatGPT</span>
                    <span className="text-lg font-bold">
                      {metrics.position.chatgptAvg !== null ? `#${metrics.position.chatgptAvg}` : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <span className="font-medium">Gemini</span>
                    <span className="text-lg font-bold">
                      {metrics.position.geminiAvg !== null ? `#${metrics.position.geminiAvg}` : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <span className="font-medium">Overall Average</span>
                    <span className="text-lg font-bold">
                      {metrics.position.overallAvg !== null ? `#${metrics.position.overallAvg}` : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-4">Position Distribution</h4>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">ChatGPT Rankings</div>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600">
                        Top 3: {metrics.position.distribution.chatgpt.top3}
                      </Badge>
                      <Badge variant="secondary" className="bg-amber-500/15 text-amber-600">
                        4-5: {metrics.position.distribution.chatgpt.top5}
                      </Badge>
                      <Badge variant="secondary" className="bg-red-500/15 text-red-600">
                        6+: {metrics.position.distribution.chatgpt.beyond5}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Gemini Rankings</div>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600">
                        Top 3: {metrics.position.distribution.gemini.top3}
                      </Badge>
                      <Badge variant="secondary" className="bg-amber-500/15 text-amber-600">
                        4-5: {metrics.position.distribution.gemini.top5}
                      </Badge>
                      <Badge variant="secondary" className="bg-red-500/15 text-red-600">
                        6+: {metrics.position.distribution.gemini.beyond5}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* =========================================== */}
      {/* FULL ANALYSIS DATA FROM AI VISIBILITY */}
      {/* =========================================== */}

      {/* AI Visibility Scores (7 score types) */}
      {reportData.aiScores && (
        <Card className="card-premium border-primary/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                <CardTitle>AI Visibility Scores</CardTitle>
              </div>
              {reportData.analysisTimestamp && (
                <span className="text-xs text-muted-foreground">
                  Analysis: {new Date(reportData.analysisTimestamp).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
              <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="text-2xl font-bold text-primary">{reportData.aiScores.overall}</div>
                <div className="text-xs text-muted-foreground">Overall</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <div className="text-xl font-bold">{reportData.aiScores.brandAwareness}</div>
                <div className="text-xs text-muted-foreground">Brand Awareness</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <div className="text-xl font-bold">{reportData.aiScores.marketPosition}</div>
                <div className="text-xs text-muted-foreground">Market Position</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <div className="text-xl font-bold">{reportData.aiScores.sentimentScore}</div>
                <div className="text-xs text-muted-foreground">Sentiment</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <div className="text-xl font-bold">{reportData.aiScores.authorityScore}</div>
                <div className="text-xs text-muted-foreground">Authority</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <div className="text-xl font-bold">{reportData.aiScores.contentVisibility}</div>
                <div className="text-xs text-muted-foreground">Content</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <div className="text-xl font-bold">{reportData.aiScores.socialPresence}</div>
                <div className="text-xs text-muted-foreground">Social</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Visibility Details */}
      {reportData.aiVisibility && (
        <Card className="card-premium">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle>AI Recommendation Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <div className="text-sm text-muted-foreground">Mention Frequency</div>
                <div className="text-lg font-semibold capitalize">{reportData.aiVisibility.mentionFrequency}</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <div className="text-sm text-muted-foreground">AI Response Position</div>
                <div className="text-lg font-semibold">
                  {reportData.aiVisibility.typicalPosition ? `#${reportData.aiVisibility.typicalPosition}` : "Not ranked"}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <div className="text-sm text-muted-foreground">Recommendation Likelihood</div>
                <div className="text-lg font-semibold capitalize">{reportData.aiVisibility.recommendationLikelihood}</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <div className="text-sm text-muted-foreground">Competitor Gap</div>
                <div className="text-sm">{reportData.aiVisibility.competitorMentionGap}</div>
              </div>
            </div>
            {reportData.aiVisibility.improvementAreas && reportData.aiVisibility.improvementAreas.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  Improvement Areas
                </h4>
                <div className="grid gap-2 md:grid-cols-2">
                  {reportData.aiVisibility.improvementAreas.map((area, i) => (
                    <div key={i} className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm">
                      {area}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Competitor Comparison */}
      {reportData.competitorComparison && reportData.competitorComparison.length > 0 && (
        <Card className="card-premium">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>Competitor Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.competitorComparison.map((comp, i) => (
                <div key={i} className="p-4 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`text-center px-3 py-2 rounded-lg ${
                        comp.overallScore > metrics.visibilityScore
                          ? "bg-red-500/10 border border-red-500/30"
                          : comp.overallScore < metrics.visibilityScore
                          ? "bg-emerald-500/10 border border-emerald-500/30"
                          : "bg-muted/50"
                      }`}>
                        <div className={`text-xl font-bold ${
                          comp.overallScore > metrics.visibilityScore ? "text-red-500" :
                          comp.overallScore < metrics.visibilityScore ? "text-emerald-500" : ""
                        }`}>
                          {comp.overallScore}
                        </div>
                        <div className="text-[10px] text-muted-foreground">Score</div>
                      </div>
                      <div>
                        <div className="font-medium">{comp.name}</div>
                        <div className="text-xs text-muted-foreground">{comp.marketShare}</div>
                      </div>
                    </div>
                    <Badge variant={
                      comp.overallScore > metrics.visibilityScore ? "destructive" :
                      comp.overallScore < metrics.visibilityScore ? "default" : "secondary"
                    }>
                      {comp.overallScore > metrics.visibilityScore ? "Ahead" :
                       comp.overallScore < metrics.visibilityScore ? "Behind" : "Even"}
                    </Badge>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-2">
                        <CheckCircle className="h-3 w-3 text-emerald-500" />
                        Strengths
                      </div>
                      <div className="space-y-1">
                        {comp.strengths.slice(0, 3).map((s, j) => (
                          <div key={j} className="text-xs p-2 rounded bg-muted/50">{s}</div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-2">
                        <XCircle className="h-3 w-3 text-red-500" />
                        Weaknesses
                      </div>
                      <div className="space-y-1">
                        {comp.weaknesses.slice(0, 3).map((w, j) => (
                          <div key={j} className="text-xs p-2 rounded bg-muted/50">{w}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Market Intelligence */}
      {reportData.marketIntelligence && (
        <Card className="card-premium">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle>Market Intelligence</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <div className="text-sm text-muted-foreground">Market Size</div>
                <div className="text-lg font-semibold">{reportData.marketIntelligence.marketSize}</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <div className="text-sm text-muted-foreground">Growth Rate</div>
                <div className="text-lg font-semibold text-emerald-500">{reportData.marketIntelligence.growthRate}</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <div className="text-sm text-muted-foreground">Future Outlook</div>
                <div className="text-sm">{reportData.marketIntelligence.futureOutlook}</div>
              </div>
            </div>
            {reportData.marketIntelligence.industryTrends && reportData.marketIntelligence.industryTrends.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-2 text-sm">Industry Trends</h4>
                <div className="flex flex-wrap gap-2">
                  {reportData.marketIntelligence.industryTrends.map((trend, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-muted border border-border text-xs">
                      {trend}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-4">
              {reportData.marketIntelligence.macroFactors && reportData.marketIntelligence.macroFactors.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-sm">Macro Factors</h4>
                  <div className="space-y-1">
                    {reportData.marketIntelligence.macroFactors.map((f, i) => (
                      <div key={i} className="text-xs p-2 rounded bg-blue-500/10">{f}</div>
                    ))}
                  </div>
                </div>
              )}
              {reportData.marketIntelligence.microFactors && reportData.marketIntelligence.microFactors.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-sm">Micro Factors</h4>
                  <div className="space-y-1">
                    {reportData.marketIntelligence.microFactors.map((f, i) => (
                      <div key={i} className="text-xs p-2 rounded bg-primary/10">{f}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sentiment Analysis */}
      {reportData.sentimentAnalysis && (
        <Card className="card-premium">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <CardTitle>Detailed Sentiment Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Brand Sentiment */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  Brand Sentiment
                </h4>
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Overall</span>
                    <Badge className={
                      reportData.sentimentAnalysis.brandSentiment.overall === "positive" ? "bg-emerald-500/15 text-emerald-500" :
                      reportData.sentimentAnalysis.brandSentiment.overall === "negative" ? "bg-red-500/15 text-red-500" :
                      "bg-amber-500/15 text-amber-500"
                    }>
                      {reportData.sentimentAnalysis.brandSentiment.overall}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">Score: {reportData.sentimentAnalysis.brandSentiment.score}/100</div>
                </div>
                {reportData.sentimentAnalysis.brandSentiment.positiveThemes?.length > 0 && (
                  <div>
                    <span className="text-xs text-emerald-500 font-medium">Positive Themes</span>
                    <div className="mt-1 space-y-1">
                      {reportData.sentimentAnalysis.brandSentiment.positiveThemes.slice(0, 3).map((t, i) => (
                        <div key={i} className="text-xs p-1.5 rounded bg-emerald-500/10">{t}</div>
                      ))}
                    </div>
                  </div>
                )}
                {reportData.sentimentAnalysis.brandSentiment.negativeThemes?.length > 0 && (
                  <div>
                    <span className="text-xs text-red-500 font-medium">Negative Themes</span>
                    <div className="mt-1 space-y-1">
                      {reportData.sentimentAnalysis.brandSentiment.negativeThemes.slice(0, 3).map((t, i) => (
                        <div key={i} className="text-xs p-1.5 rounded bg-red-500/10">{t}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* Customer Sentiment */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  Customer Sentiment
                </h4>
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Satisfaction</span>
                    <span className="font-semibold">{reportData.sentimentAnalysis.customerSentiment.satisfaction}%</span>
                  </div>
                  <div className="text-xs text-muted-foreground">NPS: {reportData.sentimentAnalysis.customerSentiment.nps}</div>
                </div>
                {reportData.sentimentAnalysis.customerSentiment.commonPraises?.length > 0 && (
                  <div>
                    <span className="text-xs text-emerald-500 font-medium">Common Praises</span>
                    <div className="mt-1 space-y-1">
                      {reportData.sentimentAnalysis.customerSentiment.commonPraises.slice(0, 3).map((p, i) => (
                        <div key={i} className="text-xs p-1.5 rounded bg-emerald-500/10">{p}</div>
                      ))}
                    </div>
                  </div>
                )}
                {reportData.sentimentAnalysis.customerSentiment.commonComplaints?.length > 0 && (
                  <div>
                    <span className="text-xs text-red-500 font-medium">Common Complaints</span>
                    <div className="mt-1 space-y-1">
                      {reportData.sentimentAnalysis.customerSentiment.commonComplaints.slice(0, 3).map((c, i) => (
                        <div key={i} className="text-xs p-1.5 rounded bg-red-500/10">{c}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* Market Sentiment */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  Market Sentiment
                </h4>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-muted/30">
                    <div className="text-xs text-muted-foreground">Industry Outlook</div>
                    <div className="text-sm font-medium">{reportData.sentimentAnalysis.marketSentiment.industryOutlook}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30">
                    <div className="text-xs text-muted-foreground">Investor Sentiment</div>
                    <div className="text-sm font-medium">{reportData.sentimentAnalysis.marketSentiment.investorSentiment}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30">
                    <div className="text-xs text-muted-foreground">Media Perception</div>
                    <div className="text-sm font-medium">{reportData.sentimentAnalysis.marketSentiment.mediaPerception}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Analysis */}
      {reportData.productAnalysis && (
        <Card className="card-premium">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <CardTitle>Product Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {reportData.productAnalysis.featureAdvantages?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2 text-emerald-500">
                    <CheckCircle className="h-4 w-4" />
                    Feature Advantages
                  </h4>
                  <div className="space-y-2">
                    {reportData.productAnalysis.featureAdvantages.map((f, i) => (
                      <div key={i} className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm">
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {reportData.productAnalysis.featureGaps?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2 text-red-500">
                    <XCircle className="h-4 w-4" />
                    Feature Gaps
                  </h4>
                  <div className="space-y-2">
                    {reportData.productAnalysis.featureGaps.map((f, i) => (
                      <div key={i} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm">
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Emerging Players */}
      {reportData.emergingPlayers && reportData.emergingPlayers.length > 0 && (
        <Card className="card-premium border-amber-500/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-amber-500" />
              <CardTitle>Emerging Threats</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {reportData.emergingPlayers.map((player, i) => (
                <div key={i} className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{player.name}</span>
                    <Badge className={
                      player.threatLevel === "high" ? "bg-red-500/15 text-red-500" :
                      player.threatLevel === "medium" ? "bg-amber-500/15 text-amber-500" :
                      "bg-emerald-500/15 text-emerald-500"
                    }>
                      {player.threatLevel} threat
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{player.description}</p>
                  <div className="text-xs space-y-1">
                    <div><span className="font-medium">Advantage:</span> {player.uniqueAdvantage}</div>
                    <div><span className="font-medium">Growth:</span> {player.growthTrajectory}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real Citations from Analysis */}
      {reportData.analysisCitations && reportData.analysisCitations.length > 0 && (
        <Card className="card-premium border-primary/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              <CardTitle>AI Analysis Citations</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Sources referenced in the AI visibility analysis
            </p>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {reportData.analysisCitations.map((citation, i) => (
                <div key={i} className="p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{citation.source}</span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {citation.type}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">{citation.relevance}</div>
                  {citation.url && (
                    <a
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1 truncate"
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      {citation.url}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comprehensive Action Plan from Analysis */}
      {reportData.analysisRecommendations && (
        <Card className="card-premium border-primary/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle>Comprehensive Action Plan</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Immediate Actions */}
            {reportData.analysisRecommendations.immediate?.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  Do This Week
                </h4>
                <div className="grid md:grid-cols-2 gap-2">
                  {reportData.analysisRecommendations.immediate.map((rec, i) => (
                    <div key={i} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm">
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Short Term */}
            {reportData.analysisRecommendations.shortTerm?.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  Do This Month
                </h4>
                <div className="grid md:grid-cols-2 gap-2">
                  {reportData.analysisRecommendations.shortTerm.map((rec, i) => (
                    <div key={i} className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm">
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Long Term */}
            {reportData.analysisRecommendations.longTerm?.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  Strategic Goals
                </h4>
                <div className="grid md:grid-cols-2 gap-2">
                  {reportData.analysisRecommendations.longTerm.map((rec, i) => (
                    <div key={i} className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm">
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Competitive Actions */}
            {reportData.analysisRecommendations.competitiveActions?.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  Competitive Actions
                </h4>
                <div className="grid md:grid-cols-2 gap-2">
                  {reportData.analysisRecommendations.competitiveActions.map((rec, i) => (
                    <div key={i} className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-sm">
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* =========================================== */}
      {/* END FULL ANALYSIS DATA */}
      {/* =========================================== */}

      {/* Improvement Plan Section */}
      {reportData.improvementPlan && (
        <Card className="card-premium border-primary/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-primary" />
              <CardTitle>Improvement Plan</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <div className="text-center p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-2xl font-bold text-emerald-600">{reportData.improvementPlan.completed}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="text-2xl font-bold text-red-600">{reportData.improvementPlan.highPriority}</div>
                <div className="text-sm text-muted-foreground">High Priority</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="text-2xl font-bold text-amber-600">{reportData.improvementPlan.mediumPriority}</div>
                <div className="text-sm text-muted-foreground">Medium Priority</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="text-2xl font-bold text-blue-600">{reportData.improvementPlan.lowPriority}</div>
                <div className="text-sm text-muted-foreground">Low Priority</div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-3">Actions by Category</h4>
                <div className="space-y-2">
                  {Object.entries(reportData.improvementPlan.byCategory).map(([cat, count]) => (
                    <div key={cat} className="flex items-center justify-between p-2 rounded bg-muted/30">
                      <span className="capitalize text-sm">{cat}</span>
                      <Badge variant="secondary">{count} pending</Badge>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Platform Presence</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded bg-emerald-500/10">
                    <span className="text-sm">Platforms Present</span>
                    <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-600">
                      {reportData.improvementPlan.platformsPresent}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-red-500/10">
                    <span className="text-sm">Platforms Needed</span>
                    <Badge variant="secondary" className="bg-red-500/20 text-red-600">
                      {reportData.improvementPlan.platformsNeeded}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Two Column Layout - Recommendations & Mentions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Full Recommendations with Action Plan */}
        <Card className="card-premium">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <CardTitle>Action Plan & Recommendations</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {reportData.recommendations.length > 0 ? (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {reportData.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-lg border-l-4 ${
                      rec.isCompleted
                        ? "bg-muted/30 border-muted-foreground"
                        : rec.priority === "high"
                        ? "bg-red-500/5 border-red-500"
                        : rec.priority === "medium"
                        ? "bg-amber-500/5 border-amber-500"
                        : "bg-primary/5 border-primary"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-medium text-sm ${rec.isCompleted ? "line-through text-muted-foreground" : ""}`}>
                            {rec.title}
                          </h4>
                          {rec.isCompleted && <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {rec.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="text-xs capitalize">
                            {rec.category}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              rec.priority === "high"
                                ? "border-red-500 text-red-500"
                                : rec.priority === "medium"
                                ? "border-amber-500 text-amber-500"
                                : ""
                            }`}
                          >
                            {rec.priority} priority
                          </Badge>
                          {rec.effort && (
                            <Badge variant="outline" className="text-xs">
                              {rec.effort}
                            </Badge>
                          )}
                          {rec.expectedImpact && (
                            <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-500">
                              <Zap className="h-3 w-3 mr-1" />
                              {rec.expectedImpact}
                            </Badge>
                          )}
                        </div>
                        {rec.competitorGap && (
                          <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                            <Info className="h-3 w-3" />
                            {rec.competitorGap}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Lightbulb className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Run an analysis to get recommendations</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Mentions with Citations */}
        <Card className="card-premium">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <CardTitle>AI Mentions with Citations</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {reportData.recentMentions.length > 0 ? (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {reportData.recentMentions.slice(0, 10).map((mention, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        className={
                          mention.aiSystem === "chatgpt"
                            ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                            : "bg-blue-500/15 text-blue-500 border-blue-500/30"
                        }
                      >
                        {mention.aiSystem === "chatgpt" ? "ChatGPT" : "Gemini"}
                      </Badge>
                      {mention.position && (
                        <Badge variant="outline" className="text-xs">
                          <Hash className="h-3 w-3 mr-1" />
                          Rank #{mention.position}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(mention.date).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    {mention.prompt && (
                      <div className="mb-2 p-2 rounded bg-muted/50 border-l-2 border-primary/50">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Quote className="h-3 w-3" />
                          Prompt Used:
                        </div>
                        <p className="text-xs italic">{mention.prompt}</p>
                      </div>
                    )}
                    <p className="text-sm">{mention.context || "No context available"}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      {mention.sentiment !== null && (
                        <span
                          className={`flex items-center gap-1 ${
                            mention.sentiment > 0.2
                              ? "text-emerald-500"
                              : mention.sentiment < -0.2
                              ? "text-red-500"
                              : ""
                          }`}
                        >
                          Sentiment: {mention.sentiment > 0.2 ? "Positive" : mention.sentiment < -0.2 ? "Negative" : "Neutral"}
                          ({(mention.sentiment * 100).toFixed(0)}%)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No mentions yet</p>
                <p className="text-xs mt-1">Run simulations to see AI mentions</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Prompts Tested / Citation Reference */}
      {reportData.promptsTested && reportData.promptsTested.length > 0 && (
        <Card className="card-premium">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              <CardTitle>Prompts Tested (Citation Reference)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 font-medium">#</th>
                    <th className="text-left py-2 px-3 font-medium">Prompt</th>
                    <th className="text-center py-2 px-3 font-medium">Mentions</th>
                    <th className="text-center py-2 px-3 font-medium">AI Systems</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.promptsTested.map((pt) => (
                    <tr key={pt.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2 px-3 text-muted-foreground">{pt.id}</td>
                      <td className="py-2 px-3">{pt.prompt}</td>
                      <td className="py-2 px-3 text-center">
                        <Badge variant="secondary">{pt.mentionCount}</Badge>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex justify-center gap-1">
                          {pt.systems.map((sys) => (
                            <Badge
                              key={sys}
                              className={
                                sys === "chatgpt"
                                  ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                                  : "bg-blue-500/15 text-blue-500 border-blue-500/30"
                              }
                            >
                              {sys === "chatgpt" ? "GPT" : "Gemini"}
                            </Badge>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Citations - Real sources extracted from AI responses */}
      {reportData.citations && reportData.citations.length > 0 && (
        <Card className="card-premium border-primary/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              <CardTitle>Citations & Sources</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Real sources and platforms mentioned in AI responses about your brand.
            </p>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {reportData.citations.map((citation) => (
                <div
                  key={citation.id}
                  className="p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{citation.source}</span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {citation.type.replace("_", " ")}
                    </Badge>
                  </div>
                  {citation.url && (
                    <a
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1 truncate"
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      {citation.url}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Quality Notice */}
      {metrics.biasedMentionsExcluded && metrics.biasedMentionsExcluded > 0 && (
        <Card className="card-premium bg-amber-500/5 border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Data Quality Notice</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.biasedMentionsExcluded} biased prompts were excluded from scoring.
                  Prompts that explicitly mention your brand name (like &quot;analyze [brand]&quot;)
                  artificially inflate mention counts and are filtered out for accurate organic visibility measurement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Backreferences / Platform Status */}
      {reportData.backreferences && reportData.backreferences.length > 0 && (
        <Card className="card-premium">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-primary" />
              <CardTitle>Platform Presence Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {reportData.backreferences.map((br, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg border ${
                    br.status === "present"
                      ? "bg-emerald-500/5 border-emerald-500/30"
                      : br.status === "incomplete"
                      ? "bg-amber-500/5 border-amber-500/30"
                      : "bg-red-500/5 border-red-500/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{br.platform}</span>
                    <Badge
                      className={
                        br.status === "present"
                          ? "bg-emerald-500/15 text-emerald-600"
                          : br.status === "incomplete"
                          ? "bg-amber-500/15 text-amber-600"
                          : "bg-red-500/15 text-red-600"
                      }
                    >
                      {br.status}
                    </Badge>
                  </div>
                  {br.details && <p className="text-xs text-muted-foreground">{br.details}</p>}
                  {br.competitorStatus && (
                    <p className="text-xs text-amber-600 mt-1">{br.competitorStatus}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs capitalize">{br.tier}</Badge>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        br.priority === "high" ? "border-red-500 text-red-500" : ""
                      }`}
                    >
                      {br.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Methodology Section */}
      {reportData.methodology && (
        <Card className="card-premium bg-muted/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <CardTitle>Methodology & Data Sources</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-muted-foreground">Data Period</span>
                  <p className="text-sm font-medium">{reportData.methodology.dataPeriod}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Collection Method</span>
                  <p className="text-sm font-medium">{reportData.methodology.dataCollectionMethod}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">AI Systems Tested</span>
                  <p className="text-sm font-medium">{reportData.methodology.aiSystemsTested.join(", ")}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-muted-foreground">Scoring Formula</span>
                  <p className="text-sm font-medium">{reportData.methodology.scoringFormula}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Sentiment Analysis</span>
                  <p className="text-sm font-medium">{reportData.methodology.sentimentAnalysis}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Position Tracking</span>
                  <p className="text-sm font-medium">{reportData.methodology.positionTracking}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Growth Projection Banner */}
      {metrics.visibilityScore < 80 && (
        <Card className="bg-gradient-to-r from-primary/10 via-accent/5 to-transparent border-primary/20">
          <CardContent className="py-6">
            <div className="flex items-center gap-6">
              <div className="p-4 rounded-xl bg-primary/20">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg">Grow your AI Visibility</h4>
                <p className="text-muted-foreground text-sm mt-1">
                  Implement our recommendations to improve your visibility score. With consistent effort,
                  you could increase your AI presence by up to {Math.round((100 - metrics.visibilityScore) * 0.7)}% in the next 90 days.
                </p>
              </div>
              <Button asChild className="shrink-0">
                <a href="/dashboard/recommendations">
                  View Action Plan
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-8">
            <Skeleton className="h-40 w-40 rounded-full" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-48" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-12 w-12 rounded-full mb-4" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
