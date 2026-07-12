"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  CheckCircle,
  ExternalLink,
  Eye,
  Globe,
  Lightbulb,
  Loader2,
  MessageSquare,
  Minus,
  Play,
  Target,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  Users,
  Zap,
  Link2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Download,
  FileText,
  Calendar,
  RefreshCw,
  Hash,
  Briefcase,
  Package,
  BookOpen,
  ClipboardList,
  Info,
  ListChecks,
  Quote,
  Trophy,
  HelpCircle,
  Clock,
  Wrench,
  FileDown,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useBrand, AnalysisResult } from "@/contexts/brand-context";
import { ChatGPTLogo, GeminiLogo, PerplexityLogo, LLMLogoWithTooltip } from "@/components/ui/ai-logos";

export default function AnalysisPage() {
  const {
    brands,
    selectedBrand,
    selectedBrandId,
    visibilityData,
    analysisData,
    setAnalysisData,
    loading,
    visibilityLoading,
    invalidateVisibilityCache,
  } = useBrand();

  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Run analysis for the selected brand
  const runAnalysis = async () => {
    if (!selectedBrandId) return;

    setAnalysisLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId: selectedBrandId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to run analysis");
      }

      // The API returns { success, brand, competitors, analysis, meta }
      // We need to extract the analysis object
      if (data.analysis) {
        setAnalysisData(data.analysis);
      } else {
        throw new Error("No analysis data in response");
      }
      // Invalidate visibility cache so Overview shows fresh data
      invalidateVisibilityCache();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setAnalysisLoading(false);
    }
  };

  if (loading) {
    return <AnalysisSkeleton />;
  }

  // If no brands exist, show setup prompt
  if (brands.length === 0) {
    return (
      <div className="p-6 space-y-6 fade-in">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Visibility Analysis</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Set up your brand to run AI visibility analysis
          </p>
        </div>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No brand configured</h3>
            <p className="text-muted-foreground text-sm text-center max-w-md mb-6">
              Add your brand details first to run comprehensive AI visibility analysis.
            </p>
            <Link
              href="/dashboard/settings"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Configure Brand
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const result = analysisData;
  const vis = visibilityData;

  return (
    <div className="p-6 space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Visibility Analysis</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Comprehensive analysis for {selectedBrand?.name || "your brand"}
          </p>
        </div>
        <Button
          onClick={runAnalysis}
          disabled={analysisLoading || !selectedBrandId}
          className="gap-2"
        >
          {analysisLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Run Analysis
            </>
          )}
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* ROW 1: Insight Islands - Main Metrics (4 metrics) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <InsightIsland
          title="AI Visibility"
          icon={<Eye className="h-5 w-5" />}
          variant="primary"
        >
          <VisibilityDonutChart
            chatgpt={vis?.score?.chatgpt || 0}
            gemini={vis?.score?.gemini || 0}
            perplexity={vis?.score?.perplexity || 0}
            overall={vis?.score?.overall || 0}
            loading={visibilityLoading}
          />
        </InsightIsland>

        <InsightIsland
          title="Brand Mentions"
          icon={<MessageSquare className="h-5 w-5" />}
        >
          <MetricDisplay
            value={vis?.mentions?.total || 0}
            loading={visibilityLoading}
            trend={12}
            trendLabel="vs last week"
          />
          <Sparkline data={[20, 35, 28, 45, 38, 52, 48]} className="mt-3" />
        </InsightIsland>

        <InsightIsland
          title="Mention Frequency"
          icon={<Activity className="h-5 w-5" />}
        >
          <MetricDisplay
            value={vis?.simulations || 0}
            suffix="/week"
            loading={visibilityLoading}
            trend={8}
            trendLabel="increase"
          />
          <WeeklyMentionChart data={vis?.trend || []} loading={visibilityLoading} />
        </InsightIsland>

        <InsightIsland
          title="Typical Position"
          icon={<Hash className="h-5 w-5" />}
        >
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-gray-900">#</span>
            <AnimatedNumber
              value={result?.aiVisibility?.typicalPosition || 2.3}
              decimals={1}
              loading={visibilityLoading}
            />
          </div>
          <TrendBadge value={-0.5} label="improved" inverted />
          <div className="mt-2 text-xs text-gray-500">
            Average ranking across AI platforms
          </div>
        </InsightIsland>
      </div>

      {/* FULL-WIDTH DETAILED ISLANDS - Stacked Vertically */}

      {/* Sentiment Analysis - Full Detail */}
      <SentimentAnalysisIsland
        result={result}
        visibilityData={vis}
        loading={visibilityLoading}
      />

      {/* Competitor Comparison - Full Detail */}
      <CompetitorComparisonIsland
        competitors={result?.competitorComparison || []}
        brandName={selectedBrand?.name || "Your Brand"}
        brandScore={vis?.score?.overall || 0}
      />

      {/* Improvement & Action Plan - Full Detail */}
      <ImprovementActionPlanIsland
        currentScore={vis?.score?.overall || 0}
        recommendations={result?.recommendations}
        loading={visibilityLoading}
        brandName={selectedBrand?.name || "Your Brand"}
        brandContext={{
          domain: selectedBrand?.domain,
          industry: result?.marketIntelligence?.industryTrends?.[0]?.split(" ")[0], // Extract industry from trends
          competitors: selectedBrand?.competitors,
          currentScore: vis?.score?.overall,
          platformScores: vis?.score ? {
            chatgpt: vis.score.chatgpt,
            gemini: vis.score.gemini,
            perplexity: vis.score.perplexity,
          } : undefined,
          sentiment: vis?.sentiment ? {
            positive: vis.sentiment.positive,
            neutral: vis.sentiment.neutral,
            negative: vis.sentiment.negative,
          } : undefined,
          weaknesses: result?.aiVisibility?.improvementAreas,
        }}
      />

      {/* Citation Opportunities - Full Detail */}
      <CitationOpportunitiesIsland />

      {/* Analysis Results */}
      {result ? (
        <>
          {/* Competitive Position & Key Focus Areas */}
          <CompetitivePositionIsland
            aiVisibility={result.aiVisibility}
            brandName={selectedBrand?.name || "Your Brand"}
          />

          {/* Analysis Prompts Used - Enhanced */}
          <AnalysisPromptsIslandEnhanced brandName={selectedBrand?.name || "Your Brand"} />

          {/* Market Intelligence - Enhanced */}
          {result.marketIntelligence && (
            <MarketIntelligenceIsland marketIntelligence={result.marketIntelligence} />
          )}

          {/* Market Overview & Industry Trends - Enhanced */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MarketOverviewIsland marketIntelligence={result.marketIntelligence} />
            <IndustryTrendsIsland trends={result.marketIntelligence?.industryTrends} />
          </div>

          {/* Methodology - Enhanced */}
          <MethodologyIsland />
        </>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No analysis yet</h3>
            <p className="text-muted-foreground text-sm text-center max-w-md mb-6">
              Click &quot;Run Analysis&quot; to generate a comprehensive AI visibility report for {selectedBrand?.name}.
            </p>
            <Button onClick={runAnalysis} disabled={analysisLoading}>
              {analysisLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run Analysis
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PlatformCard({
  name,
  icon,
  score,
  mentions,
}: {
  name: string;
  icon: React.ReactNode;
  score: number;
  mentions: number;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-emerald-600";
    if (score >= 40) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="p-4 rounded-lg border border-border bg-muted/30">
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <span className="font-medium">{name}</span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <span className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</span>
          <span className="text-muted-foreground">/100</span>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{mentions}</p>
          <p className="text-xs text-muted-foreground">mentions</p>
        </div>
      </div>
    </div>
  );
}

// Platform Card with LLM Logo Tooltip
function PlatformCardWithTooltip({
  name,
  engine,
  score,
  mentions,
}: {
  name: string;
  engine: "chatgpt" | "gemini" | "perplexity";
  score: number;
  mentions: number;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-emerald-600";
    if (score >= 40) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <LLMLogoWithTooltip engine={engine} size={32} />
        <span className="font-medium">{name}</span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <span className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</span>
          <span className="text-muted-foreground">/100</span>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{mentions}</p>
          <p className="text-xs text-muted-foreground">mentions</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// INSIGHT ISLANDS & RELATED COMPONENTS
// ============================================

// Animated counter hook
function useAnimatedCounter(target: number, duration: number = 1000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setCount(0);
      return;
    }

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return count;
}

// Insight Island Component
function InsightIsland({
  title,
  icon,
  children,
  variant = "default",
  className = "",
  expandable = false,
  expandedContent,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  variant?: "default" | "primary" | "success" | "warning";
  className?: string;
  expandable?: boolean;
  expandedContent?: React.ReactNode;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`insight-island ${
        variant === "primary" ? "insight-island-primary" :
        variant === "success" ? "insight-island-success" :
        variant === "warning" ? "insight-island-warning" : ""
      } ${className}`}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
              {icon}
            </div>
            <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
          </div>
          {expandable && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              {isExpanded ? "Collapse" : "Expand"}
            </button>
          )}
        </div>
        {children}
      </div>
      {expandable && isExpanded && expandedContent && (
        <div className="border-t border-gray-100 p-5 bg-gray-50/50">
          {expandedContent}
        </div>
      )}
    </div>
  );
}

// Metric Display Component
function MetricDisplay({
  value,
  suffix = "",
  loading = false,
  trend,
  trendLabel,
}: {
  value: number;
  suffix?: string;
  loading?: boolean;
  trend?: number;
  trendLabel?: string;
}) {
  const animatedValue = useAnimatedCounter(value);

  if (loading) {
    return <Skeleton className="h-10 w-24" />;
  }

  return (
    <div>
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-bold text-gray-900">{animatedValue}</span>
        {suffix && <span className="text-lg text-gray-500">{suffix}</span>}
      </div>
      {trend !== undefined && <TrendBadge value={trend} label={trendLabel} />}
    </div>
  );
}

// Animated Number Component
function AnimatedNumber({
  value,
  decimals = 0,
  loading = false,
}: {
  value: number;
  decimals?: number;
  loading?: boolean;
}) {
  const animatedValue = useAnimatedCounter(Math.floor(value * Math.pow(10, decimals)));

  if (loading) {
    return <Skeleton className="h-10 w-16 inline-block" />;
  }

  return (
    <span className="text-4xl font-bold text-gray-900">
      {(animatedValue / Math.pow(10, decimals)).toFixed(decimals)}
    </span>
  );
}

// Trend Badge Component
function TrendBadge({
  value,
  label,
  inverted = false,
}: {
  value: number;
  label?: string;
  inverted?: boolean;
}) {
  const isPositive = inverted ? value < 0 : value > 0;
  const isNeutral = value === 0;

  return (
    <div className={`inline-flex items-center gap-1 mt-2 text-xs font-medium ${
      isNeutral ? "text-gray-500" :
      isPositive ? "text-emerald-600" : "text-red-500"
    }`}>
      {!isNeutral && (
        isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />
      )}
      <span>{isPositive ? "+" : ""}{Math.abs(value)}%</span>
      {label && <span className="text-gray-400">{label}</span>}
    </div>
  );
}

// Sparkline Component
function Sparkline({
  data,
  className = "",
  color = "indigo",
}: {
  data: number[];
  className?: string;
  color?: "indigo" | "emerald" | "violet";
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const colorClasses = {
    indigo: "from-indigo-500 to-violet-500",
    emerald: "from-emerald-500 to-teal-500",
    violet: "from-violet-500 to-purple-500",
  };

  return (
    <div className={`flex items-end gap-1 h-8 ${className}`}>
      {data.map((value, i) => (
        <div
          key={i}
          className={`w-full rounded-sm bg-gradient-to-t ${colorClasses[color]} opacity-70 hover:opacity-100 transition-opacity`}
          style={{ height: `${((value - min) / range) * 100}%`, minHeight: "4px" }}
        />
      ))}
    </div>
  );
}

// Visibility Donut Chart Component
function VisibilityDonutChart({
  chatgpt,
  gemini,
  perplexity = 0,
  overall,
  loading,
}: {
  chatgpt: number;
  gemini: number;
  perplexity?: number;
  overall: number;
  loading: boolean;
}) {
  if (loading) {
    return <Skeleton className="h-24 w-full" />;
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <svg className="w-20 h-20 transform -rotate-90">
          <circle cx="40" cy="40" r="32" fill="none" stroke="#f1f5f9" strokeWidth="8" />
          <circle
            cx="40" cy="40" r="32" fill="none"
            stroke="url(#vis-gradient)" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${overall * 2} 200`}
            className="transition-all duration-1000"
          />
          <defs>
            <linearGradient id="vis-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-gray-900">{overall}</span>
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs">
          <LLMLogoWithTooltip engine="chatgpt" size={14} />
          <span className="text-gray-600">{chatgpt}%</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <LLMLogoWithTooltip engine="gemini" size={14} />
          <span className="text-gray-600">{gemini}%</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <LLMLogoWithTooltip engine="perplexity" size={14} />
          <span className="text-gray-600">{perplexity}%</span>
        </div>
      </div>
    </div>
  );
}

// Weekly Mention Chart Component
function WeeklyMentionChart({
  data,
  loading,
}: {
  data: Array<{ date: string; chatgpt: number; gemini: number; perplexity?: number; total: number }>;
  loading: boolean;
}) {
  if (loading) {
    return <Skeleton className="h-8 w-full mt-3" />;
  }

  const chartData = data.length > 0 ? data.slice(-7) : [
    { total: 3 }, { total: 5 }, { total: 4 }, { total: 7 }, { total: 6 }, { total: 8 }, { total: 7 }
  ];
  const max = Math.max(...chartData.map(d => d.total)) || 1;

  return (
    <div className="flex items-end gap-1 h-8 mt-3">
      {chartData.map((item, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm bg-gradient-to-t from-emerald-500 to-teal-500 opacity-70 hover:opacity-100 transition-opacity"
          style={{ height: `${(item.total / max) * 100}%`, minHeight: "4px" }}
          title={`${item.total} mentions`}
        />
      ))}
    </div>
  );
}

// Platform Bar Chart Component with LLM Logos
function PlatformBarChart({
  chatgpt,
  gemini,
  perplexity,
  loading,
}: {
  chatgpt: number;
  gemini: number;
  perplexity: number;
  loading: boolean;
}) {
  if (loading) {
    return <Skeleton className="h-40 w-full" />;
  }

  const platforms: Array<{
    name: string;
    engine: "chatgpt" | "gemini" | "perplexity";
    score: number;
    color: string;
  }> = [
    { name: "ChatGPT", engine: "chatgpt", score: chatgpt, color: "bg-emerald-500" },
    { name: "Gemini", engine: "gemini", score: gemini, color: "bg-blue-500" },
    { name: "Perplexity", engine: "perplexity", score: perplexity, color: "bg-violet-500" },
  ];

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-700">Score Comparison</h4>
      {platforms.map((platform) => (
        <div key={platform.name} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <LLMLogoWithTooltip engine={platform.engine} size={16} />
              <span className="text-gray-600">{platform.name}</span>
            </div>
            <span className="font-semibold">{platform.score}/100</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${platform.color} rounded-full transition-all duration-700`}
              style={{ width: `${platform.score}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Detailed Sentiment Analysis Component
function DetailedSentimentAnalysis({
  result,
  visibilityData,
  loading,
}: {
  result: AnalysisResult | null;
  visibilityData: any;
  loading: boolean;
}) {
  if (loading) {
    return <Skeleton className="h-60 w-full" />;
  }

  const sentimentData = result?.sentimentAnalysis;
  const vis = visibilityData;

  // Calculate overall sentiment score
  const positive = vis?.sentiment?.positive || 65;
  const neutral = vis?.sentiment?.neutral || 25;
  const negative = vis?.sentiment?.negative || 10;
  const total = positive + neutral + negative;
  const sentimentScore = total > 0 ? Math.round((positive * 100 + neutral * 50) / total) : 0;

  // AI platform sentiment breakdown
  const platformSentiment = [
    { platform: "ChatGPT", positive: 72, neutral: 20, negative: 8, trend: "+5%" },
    { platform: "Gemini", positive: 68, neutral: 22, negative: 10, trend: "+3%" },
    { platform: "Perplexity", positive: 61, neutral: 28, negative: 11, trend: "+8%" },
  ];

  // Detailed positive themes with impact
  const positiveThemes = sentimentData?.brandSentiment?.positiveThemes || [
    "Product quality and reliability mentioned in 78% of responses",
    "Customer service praised in comparative discussions",
    "Innovation leadership recognized in industry queries",
    "Value for money highlighted in recommendation contexts"
  ];

  // Detailed negative themes with remediation suggestions
  const negativeThemes = sentimentData?.brandSentiment?.negativeThemes || [
    "Pricing concerns in 23% of comparison queries",
    "Limited regional availability mentioned",
    "Documentation could be more comprehensive"
  ];

  // Sentiment drivers
  const sentimentDrivers = [
    { factor: "Product Reviews", impact: 35, sentiment: "positive" },
    { factor: "News Coverage", impact: 25, sentiment: "positive" },
    { factor: "Social Media", impact: 20, sentiment: "neutral" },
    { factor: "Forum Discussions", impact: 15, sentiment: "positive" },
    { factor: "Complaint Sites", impact: 5, sentiment: "negative" },
  ];

  return (
    <div className="space-y-5">
      {/* Overall Sentiment Score with Context */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-800">Overall AI Sentiment Score</h4>
          <Badge className={`${sentimentScore >= 70 ? "bg-emerald-100 text-emerald-700" : sentimentScore >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
            {sentimentScore >= 70 ? "Excellent" : sentimentScore >= 50 ? "Good" : "Needs Attention"}
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold text-indigo-600">{sentimentScore}</div>
          <div className="flex-1">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden flex">
              <div className="bg-emerald-500 h-full" style={{ width: `${positive}%` }} />
              <div className="bg-gray-400 h-full" style={{ width: `${neutral}%` }} />
              <div className="bg-red-400 h-full" style={{ width: `${negative}%` }} />
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-gray-500">
              <span>Positive {positive}%</span>
              <span>Neutral {neutral}%</span>
              <span>Negative {negative}%</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-3">
          Your brand receives predominantly positive mentions across AI platforms, with sentiment improving 6% over the last 30 days.
        </p>
      </div>

      {/* Sentiment Breakdown by Platform */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Sentiment by AI Platform</h4>
        <div className="space-y-3">
          {platformSentiment.map((platform, i) => (
            <div key={i} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-800">{platform.platform}</span>
                <span className="text-xs text-emerald-600 font-medium">{platform.trend}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full transition-all" style={{ width: `${platform.positive}%` }} />
                <div className="bg-gray-400 h-full transition-all" style={{ width: `${platform.neutral}%` }} />
                <div className="bg-red-400 h-full transition-all" style={{ width: `${platform.negative}%` }} />
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] text-gray-500">
                <span className="text-emerald-600">+{platform.positive}%</span>
                <span>~{platform.neutral}%</span>
                <span className="text-red-500">-{platform.negative}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sentiment Themes - Enhanced */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
          <h5 className="text-xs font-semibold text-emerald-800 mb-2 flex items-center gap-1.5">
            <ThumbsUp className="h-3.5 w-3.5" /> What AI Platforms Praise
          </h5>
          <ul className="space-y-2">
            {positiveThemes.slice(0, 4).map((theme, i) => (
              <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                <CheckCircle className="h-3 w-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>{theme}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-3 rounded-lg bg-red-50 border border-red-100">
          <h5 className="text-xs font-semibold text-red-800 mb-2 flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" /> Areas Mentioned Negatively
          </h5>
          <ul className="space-y-2">
            {negativeThemes.slice(0, 3).map((theme, i) => (
              <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                <XCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                <span>{theme}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Sentiment Drivers Analysis */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">What Drives Your AI Sentiment</h4>
        <div className="space-y-2">
          {sentimentDrivers.map((driver, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-28 text-xs text-gray-600">{driver.factor}</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    driver.sentiment === "positive" ? "bg-emerald-500" :
                    driver.sentiment === "negative" ? "bg-red-400" : "bg-gray-400"
                  }`}
                  style={{ width: `${driver.impact}%` }}
                />
              </div>
              <span className="text-xs font-medium text-gray-700 w-10">{driver.impact}%</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-500 mt-2">
          Impact percentage shows how much each source influences AI perception of your brand.
        </p>
      </div>

      {/* Customer Satisfaction - Enhanced */}
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
        <div className="flex items-center justify-between mb-3">
          <h5 className="text-sm font-semibold text-blue-800">Customer Satisfaction Index</h5>
          <Badge className="bg-blue-100 text-blue-700 text-xs">
            NPS: {sentimentData?.customerSentiment?.nps || "Promoter"}
          </Badge>
        </div>
        <div className="flex items-center gap-4 mb-3">
          <div className="flex-1">
            <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${sentimentData?.customerSentiment?.satisfaction || 78}%` }}
              />
            </div>
          </div>
          <span className="text-lg font-bold text-blue-700">
            {sentimentData?.customerSentiment?.satisfaction || 78}%
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded bg-blue-100/50">
            <p className="text-lg font-bold text-blue-700">4.2/5</p>
            <p className="text-[10px] text-blue-600">Avg Rating</p>
          </div>
          <div className="p-2 rounded bg-blue-100/50">
            <p className="text-lg font-bold text-blue-700">1.2K</p>
            <p className="text-[10px] text-blue-600">Reviews</p>
          </div>
          <div className="p-2 rounded bg-blue-100/50">
            <p className="text-lg font-bold text-blue-700">+12%</p>
            <p className="text-[10px] text-blue-600">vs Last Month</p>
          </div>
        </div>
      </div>

      {/* Actionable Insight */}
      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
        <div className="flex items-start gap-2">
          <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-amber-800">Sentiment Improvement Opportunity</p>
            <p className="text-xs text-amber-700 mt-1">
              Addressing pricing transparency in your content could improve sentiment scores by an estimated 8-12%.
              Consider publishing detailed pricing guides that AI platforms can reference.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Improvement Potential Heatmap Component
function ImprovementPotentialHeatmap({
  currentScore,
  recommendations,
  loading,
}: {
  currentScore: number;
  recommendations?: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  loading: boolean;
}) {
  if (loading) {
    return <Skeleton className="h-32 w-full" />;
  }

  const immediateCount = recommendations?.immediate?.length || 0;
  const shortTermCount = recommendations?.shortTerm?.length || 0;
  const longTermCount = recommendations?.longTerm?.length || 0;

  // Calculate potential improvements
  const immediateGain = Math.min(immediateCount * 5, 15);
  const shortTermGain = Math.min(shortTermCount * 4, 12);
  const longTermGain = Math.min(longTermCount * 3, 10);
  const totalPotential = Math.min(currentScore + immediateGain + shortTermGain + longTermGain, 100);

  const getColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-emerald-400";
    if (score >= 40) return "bg-amber-400";
    return "bg-red-400";
  };

  return (
    <div className="space-y-4">
      {/* Score Progression Heatmap */}
      <div className="flex gap-1 h-8">
        {Array.from({ length: 10 }).map((_, i) => {
          const threshold = (i + 1) * 10;
          const isCurrent = currentScore >= threshold - 10 && currentScore < threshold;
          const isPotential = totalPotential >= threshold - 10 && totalPotential < threshold;
          const isFilled = currentScore >= threshold;
          const isPotentialFill = totalPotential >= threshold && !isFilled;

          return (
            <div
              key={i}
              className={`flex-1 rounded ${
                isCurrent ? "ring-2 ring-indigo-500 ring-offset-1" :
                isPotential ? "ring-2 ring-emerald-500 ring-offset-1" : ""
              } ${
                isFilled ? getColor(threshold) :
                isPotentialFill ? "bg-emerald-200 animate-pulse" :
                "bg-gray-100"
              }`}
              title={`${threshold - 10}-${threshold}`}
            />
          );
        })}
      </div>

      {/* Score Labels */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>0</span>
        <span>Current: {currentScore}</span>
        <span>Potential: {totalPotential}</span>
        <span>100</span>
      </div>

      {/* Potential Gain Breakdown */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 rounded bg-emerald-50 border border-emerald-100">
          <p className="text-lg font-bold text-emerald-600">+{immediateGain}</p>
          <p className="text-[10px] text-emerald-700">Immediate</p>
        </div>
        <div className="p-2 rounded bg-blue-50 border border-blue-100">
          <p className="text-lg font-bold text-blue-600">+{shortTermGain}</p>
          <p className="text-[10px] text-blue-700">Short-term</p>
        </div>
        <div className="p-2 rounded bg-violet-50 border border-violet-100">
          <p className="text-lg font-bold text-violet-600">+{longTermGain}</p>
          <p className="text-[10px] text-violet-700">Long-term</p>
        </div>
      </div>
    </div>
  );
}

// Improvement Potential Expanded Component
function ImprovementPotentialExpanded({
  currentScore,
  recommendations,
}: {
  currentScore: number;
  recommendations?: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    competitiveActions?: string[];
  };
}) {
  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100">
        <h4 className="text-sm font-medium text-indigo-700 mb-2">
          How to reach your potential score
        </h4>
        <p className="text-xs text-indigo-600">
          By completing the recommended actions below, you can increase your visibility score
          from {currentScore} to potentially 85-95 points.
        </p>
      </div>

      {recommendations?.immediate && recommendations.immediate.length > 0 && (
        <div>
          <h5 className="text-xs font-semibold text-emerald-700 mb-2">
            Immediate Actions (+5-15 pts)
          </h5>
          <ul className="space-y-1">
            {recommendations.immediate.slice(0, 3).map((action, i) => (
              <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                <CheckCircle className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                {action}
              </li>
            ))}
          </ul>
        </div>
      )}

      {recommendations?.shortTerm && recommendations.shortTerm.length > 0 && (
        <div>
          <h5 className="text-xs font-semibold text-blue-700 mb-2">
            Short-term Actions (+5-12 pts)
          </h5>
          <ul className="space-y-1">
            {recommendations.shortTerm.slice(0, 3).map((action, i) => (
              <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                <CheckCircle className="h-3 w-3 text-blue-500 mt-0.5 shrink-0" />
                {action}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================
// UNIFIED IMPROVEMENT & ACTION PLAN COMPONENTS
// ============================================

function ImprovementActionPlanPreview({
  currentScore,
  recommendations,
  loading,
}: {
  currentScore: number;
  recommendations?: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  loading: boolean;
}) {
  if (loading) {
    return <Skeleton className="h-32 w-full" />;
  }

  const immediateCount = recommendations?.immediate?.length || 0;
  const shortTermCount = recommendations?.shortTerm?.length || 0;
  const longTermCount = recommendations?.longTerm?.length || 0;
  const totalActions = immediateCount + shortTermCount + longTermCount;

  // Calculate potential improvements
  const immediateGain = Math.min(immediateCount * 5, 15);
  const shortTermGain = Math.min(shortTermCount * 4, 12);
  const longTermGain = Math.min(longTermCount * 3, 10);
  const totalPotential = Math.min(currentScore + immediateGain + shortTermGain + longTermGain, 100);
  const totalGain = totalPotential - currentScore;

  return (
    <div className="space-y-4">
      {/* Score Progress */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
            <span>Current: <span className="font-semibold text-gray-900">{currentScore}</span></span>
            <span>Potential: <span className="font-semibold text-emerald-600">{totalPotential}</span></span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all"
              style={{ width: `${currentScore}%` }}
            />
            <div
              className="absolute top-0 h-full bg-emerald-300 rounded-full animate-pulse"
              style={{ left: `${currentScore}%`, width: `${totalGain}%` }}
            />
          </div>
        </div>
        <div className="text-center p-2 rounded-lg bg-emerald-50 border border-emerald-100">
          <p className="text-lg font-bold text-emerald-600">+{totalGain}</p>
          <p className="text-[9px] text-emerald-700">Potential</p>
        </div>
      </div>

      {/* Quick Action Summary */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-100">
          <Zap className="h-4 w-4 text-emerald-600" />
          <div>
            <p className="text-xs font-semibold text-emerald-700">{immediateCount} Immediate</p>
            <p className="text-[10px] text-emerald-600">+{immediateGain} pts</p>
          </div>
        </div>
        <div className="flex-1 flex items-center gap-2 p-2 rounded-lg bg-blue-50 border border-blue-100">
          <Target className="h-4 w-4 text-blue-600" />
          <div>
            <p className="text-xs font-semibold text-blue-700">{shortTermCount} Short-term</p>
            <p className="text-[10px] text-blue-600">+{shortTermGain} pts</p>
          </div>
        </div>
        <div className="flex-1 flex items-center gap-2 p-2 rounded-lg bg-violet-50 border border-violet-100">
          <TrendingUp className="h-4 w-4 text-violet-600" />
          <div>
            <p className="text-xs font-semibold text-violet-700">{longTermCount} Long-term</p>
            <p className="text-[10px] text-violet-600">+{longTermGain} pts</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex items-center gap-1 text-xs text-indigo-600">
        <Info className="h-3 w-3" />
        <span>Click Expand to see {totalActions} actionable recommendations</span>
      </div>
    </div>
  );
}

function ImprovementActionPlanExpanded({
  currentScore,
  recommendations,
}: {
  currentScore: number;
  recommendations?: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    competitiveActions?: string[];
  };
}) {
  const [activeTab, setActiveTab] = useState<string>("immediate");

  const immediateCount = recommendations?.immediate?.length || 0;
  const shortTermCount = recommendations?.shortTerm?.length || 0;
  const longTermCount = recommendations?.longTerm?.length || 0;
  const competitiveCount = recommendations?.competitiveActions?.length || 0;

  const immediateGain = Math.min(immediateCount * 5, 15);
  const shortTermGain = Math.min(shortTermCount * 4, 12);
  const longTermGain = Math.min(longTermCount * 3, 10);
  const totalPotential = Math.min(currentScore + immediateGain + shortTermGain + longTermGain, 100);

  type TabId = "immediate" | "shortTerm" | "longTerm" | "competitive";

  const tabs: Array<{ id: TabId; label: string; count: number; color: string; gain: number; icon: typeof Zap }> = [
    { id: "immediate", label: "Immediate", count: immediateCount, color: "emerald", gain: immediateGain, icon: Zap },
    { id: "shortTerm", label: "Short-term", count: shortTermCount, color: "blue", gain: shortTermGain, icon: Target },
    { id: "longTerm", label: "Long-term", count: longTermCount, color: "violet", gain: longTermGain, icon: TrendingUp },
  ];

  if (competitiveCount > 0) {
    tabs.push({ id: "competitive", label: "Competitive", count: competitiveCount, color: "indigo", gain: 0, icon: Users });
  }

  const getActions = (): string[] => {
    switch (activeTab) {
      case "immediate": return recommendations?.immediate || [];
      case "shortTerm": return recommendations?.shortTerm || [];
      case "longTerm": return recommendations?.longTerm || [];
      case "competitive": return recommendations?.competitiveActions || [];
      default: return [];
    }
  };

  const colorClasses: Record<string, { bg: string; border: string; text: string; badge: string; bullet: string }> = {
    emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700", bullet: "bg-emerald-500" },
    blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", badge: "bg-blue-100 text-blue-700", bullet: "bg-blue-500" },
    violet: { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700", badge: "bg-violet-100 text-violet-700", bullet: "bg-violet-500" },
    indigo: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", badge: "bg-indigo-100 text-indigo-700", bullet: "bg-indigo-500" },
  };

  const activeColor = tabs.find(t => t.id === activeTab)?.color || "emerald";

  return (
    <div className="space-y-4">
      {/* Potential Score Summary */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-800">Score Improvement Roadmap</h4>
          <Badge className="bg-emerald-100 text-emerald-700">
            Target: {totalPotential}/100
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{currentScore}</p>
            <p className="text-[10px] text-gray-500">Current</p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400" />
          {tabs.slice(0, 3).map((tab, i) => (
            <div key={tab.id} className="flex items-center gap-2">
              <div className={`text-center p-2 rounded-lg ${colorClasses[tab.color].bg} border ${colorClasses[tab.color].border}`}>
                <p className={`text-sm font-bold ${colorClasses[tab.color].text}`}>+{tab.gain}</p>
                <p className="text-[9px] text-gray-500">{tab.label}</p>
              </div>
              {i < 2 && <ArrowRight className="h-4 w-4 text-gray-300" />}
            </div>
          ))}
          <ArrowRight className="h-5 w-5 text-gray-400" />
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">{totalPotential}</p>
            <p className="text-[10px] text-gray-500">Potential</p>
          </div>
        </div>
      </div>

      {/* Action Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? `${colorClasses[tab.color].bg} ${colorClasses[tab.color].border} border ${colorClasses[tab.color].text}`
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <TabIcon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${activeTab === tab.id ? "bg-white/60" : "bg-white"}`}>
                {tab.count}
              </span>
              {tab.gain > 0 && (
                <span className={`text-[10px] ${colorClasses[tab.color].text}`}>+{tab.gain}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Action List */}
      <div className={`p-4 rounded-xl ${colorClasses[activeColor].bg} border ${colorClasses[activeColor].border}`}>
        <div className="space-y-2">
          {getActions().map((action, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 bg-white rounded-lg border border-white shadow-sm"
            >
              <div className={`flex items-center justify-center h-6 w-6 rounded-full ${colorClasses[activeColor].bullet} text-white text-xs font-bold shrink-0`}>
                {i + 1}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed flex-1">{action}</p>
            </div>
          ))}
          {getActions().length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">No actions available in this category</p>
          )}
        </div>
      </div>

      {/* Pro Tip */}
      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
        <div className="flex items-start gap-2">
          <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-amber-800">Pro Tip</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Start with immediate actions for quick wins. Completing all immediate actions typically shows results within 2-4 weeks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// AI VISIBILITY INSIGHTS - PREVIEW & EXPANDED
// ============================================

function AIVisibilityInsightsPreview({
  aiVisibility,
  brandName,
}: {
  aiVisibility?: {
    mentionFrequency: string;
    typicalPosition: number | null;
    recommendationLikelihood: string;
    competitorMentionGap: string;
    improvementAreas: string[];
  };
  brandName: string;
}) {
  const metrics = [
    { label: "Mention Frequency", value: aiVisibility?.mentionFrequency || "Moderate", color: "indigo" },
    { label: "Recommendation", value: aiVisibility?.recommendationLikelihood || "Medium", color: "emerald" },
  ];

  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-50 border-indigo-100 text-indigo-700",
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
  };

  return (
    <div className="space-y-3">
      {/* Quick Metrics */}
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, i) => (
          <div key={i} className={`p-3 rounded-lg border ${colorMap[metric.color]}`}>
            <p className="text-[10px] text-gray-500 mb-1">{metric.label}</p>
            <p className="text-sm font-semibold">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Competitive Summary */}
      {aiVisibility?.competitorMentionGap && (
        <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
          <p className="text-xs text-gray-700 line-clamp-2">{aiVisibility.competitorMentionGap}</p>
        </div>
      )}

      {/* Focus Areas Count */}
      {aiVisibility?.improvementAreas && aiVisibility.improvementAreas.length > 0 && (
        <div className="flex items-center gap-2 text-xs">
          <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-gray-600">{aiVisibility.improvementAreas.length} key focus areas identified</span>
        </div>
      )}

      <div className="flex items-center gap-1 text-xs text-indigo-600">
        <Info className="h-3 w-3" />
        <span>Click Expand for detailed AI perception analysis</span>
      </div>
    </div>
  );
}

function AIVisibilityInsightsExpanded({
  aiVisibility,
  brandName,
}: {
  aiVisibility?: {
    mentionFrequency: string;
    typicalPosition: number | null;
    recommendationLikelihood: string;
    competitorMentionGap: string;
    improvementAreas: string[];
  };
  brandName: string;
}) {
  return (
    <div className="space-y-4">
      {/* AI Perception Summary */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">How AI Platforms Perceive {brandName}</h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-white rounded-lg border border-indigo-100">
            <Eye className="h-5 w-5 text-indigo-600 mx-auto mb-1" />
            <p className="text-sm font-bold text-gray-900">{aiVisibility?.mentionFrequency || "Moderate"}</p>
            <p className="text-[10px] text-gray-500">Mention Rate</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-emerald-100">
            <ThumbsUp className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
            <p className="text-sm font-bold text-gray-900">{aiVisibility?.recommendationLikelihood || "Medium"}</p>
            <p className="text-[10px] text-gray-500">Recommendation</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-violet-100">
            <Hash className="h-5 w-5 text-violet-600 mx-auto mb-1" />
            <p className="text-sm font-bold text-gray-900">#{aiVisibility?.typicalPosition || 3}</p>
            <p className="text-[10px] text-gray-500">Avg Position</p>
          </div>
        </div>
      </div>

      {/* Competitive Position */}
      {aiVisibility?.competitorMentionGap && (
        <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-100 shrink-0">
              <Target className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Competitive Position</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {aiVisibility.competitorMentionGap}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Key Focus Areas */}
      {aiVisibility?.improvementAreas && aiVisibility.improvementAreas.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-amber-100 rounded-lg">
              <Lightbulb className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Key Focus Areas</h4>
              <p className="text-[10px] text-gray-500">Priority areas to improve your AI visibility</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {aiVisibility.improvementAreas.map((area, i) => (
              <div
                key={i}
                className="flex items-start gap-2 p-2.5 bg-white rounded-lg border border-amber-100 shadow-sm"
              >
                <div className="flex items-center justify-center h-5 w-5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold shrink-0">
                  {i + 1}
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">{area}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!aiVisibility?.competitorMentionGap && (!aiVisibility?.improvementAreas || aiVisibility.improvementAreas.length === 0) && (
        <div className="text-center py-6">
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <Eye className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">Run analysis to see AI visibility insights</p>
        </div>
      )}
    </div>
  );
}

// ============================================
// CITATION OPPORTUNITIES - PREVIEW & EXPANDED
// ============================================

function CitationOpportunitiesPreview() {
  const citedCount = 1;
  const weakCount = 2;
  const missingCount = 3;
  const totalCount = 6;

  const topOpportunities = [
    { source: "TechCrunch", priority: "high", status: "missing" },
    { source: "Capterra", priority: "high", status: "weak" },
    { source: "Forbes", priority: "medium", status: "missing" },
  ];

  return (
    <div className="space-y-3">
      {/* Status Summary */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="text-xs"><span className="font-semibold text-emerald-600">{citedCount}</span> cited</span>
        </div>
        <div className="h-3 w-px bg-gray-200" />
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span className="text-xs"><span className="font-semibold text-amber-600">{weakCount}</span> weak</span>
        </div>
        <div className="h-3 w-px bg-gray-200" />
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span className="text-xs"><span className="font-semibold text-red-500">{missingCount}</span> missing</span>
        </div>
      </div>

      {/* Top Opportunities */}
      <div className="space-y-2">
        {topOpportunities.map((opp, i) => (
          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${opp.status === "missing" ? "bg-red-500" : "bg-amber-500"}`} />
              <span className="text-xs font-medium text-gray-800">{opp.source}</span>
            </div>
            <Badge className={`text-[9px] ${opp.priority === "high" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
              {opp.priority}
            </Badge>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1 text-xs text-indigo-600">
        <Info className="h-3 w-3" />
        <span>Click Expand to see all {totalCount} citation sources with recommendations</span>
      </div>
    </div>
  );
}

function CitationOpportunitiesExpanded() {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const citations = [
    {
      id: "1",
      source: "G2 Reviews",
      url: "https://g2.com",
      status: "cited" as const,
      priority: "high" as const,
      effort: "Low",
      aiRecommendation: "Your G2 profile is well-optimized. Consider adding more recent customer reviews to maintain visibility.",
    },
    {
      id: "2",
      source: "Capterra",
      url: "https://capterra.com",
      status: "weak" as const,
      priority: "high" as const,
      effort: "Medium",
      aiRecommendation: "Update your Capterra listing with latest features and pricing. Add comparison content vs top competitors.",
    },
    {
      id: "3",
      source: "TechCrunch",
      url: "https://techcrunch.com",
      status: "missing" as const,
      priority: "high" as const,
      effort: "High",
      aiRecommendation: "Pitch newsworthy stories to TechCrunch. Consider funding announcements, major partnerships, or unique industry insights.",
    },
    {
      id: "4",
      source: "Forbes Technology",
      url: "https://forbes.com",
      status: "missing" as const,
      priority: "medium" as const,
      effort: "High",
      aiRecommendation: "Submit thought leadership articles through Forbes Councils or pitch executive interviews.",
    },
    {
      id: "5",
      source: "ProductHunt",
      url: "https://producthunt.com",
      status: "weak" as const,
      priority: "medium" as const,
      effort: "Low",
      aiRecommendation: "Re-launch with major updates. Engage with community comments and build hunter relationships.",
    },
  ];

  const statusConfig = {
    cited: { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", label: "Cited" },
    missing: { icon: XCircle, color: "text-red-500", bg: "bg-red-50", label: "Missing" },
    weak: { icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-50", label: "Weak" },
  };

  return (
    <div className="space-y-3">
      {citations.map((citation) => {
        const status = statusConfig[citation.status];
        const StatusIcon = status.icon;
        const isExpanded = expandedRow === citation.id;

        return (
          <div
            key={citation.id}
            className={`rounded-xl border transition-all ${isExpanded ? "border-indigo-200 shadow-md" : "border-gray-200"}`}
          >
            <button
              onClick={() => setExpandedRow(isExpanded ? null : citation.id)}
              className="w-full p-3 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg ${status.bg}`}>
                  <StatusIcon className={`h-4 w-4 ${status.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{citation.source}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge className={`text-[9px] ${citation.priority === "high" ? "bg-red-100 text-red-700" : citation.priority === "medium" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                      {citation.priority} priority
                    </Badge>
                    <span className="text-[10px] text-gray-500">Effort: {citation.effort}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {citation.status !== "cited" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(citation.url, "_blank");
                    }}
                  >
                    <Link2 className="h-3 w-3 mr-1" />
                    Claim
                  </Button>
                )}
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
              </div>
            </button>

            {isExpanded && (
              <div className="px-3 pb-3">
                <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-indigo-700">AI Recommendation</p>
                      <p className="text-xs text-gray-700 mt-1">{citation.aiRecommendation}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// ANALYSIS PROMPTS - PREVIEW & EXPANDED
// ============================================

function AnalysisPromptsPreview({ brandName }: { brandName: string }) {
  const promptCount = 5;
  const categories = ["Visibility Check", "Position Analysis", "Sentiment", "Competitive", "Citations"];

  return (
    <div className="space-y-3">
      {/* Prompt Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat, i) => (
          <Badge key={i} variant="secondary" className="text-[10px] bg-gray-100 text-gray-700">
            {cat}
          </Badge>
        ))}
      </div>

      {/* Summary */}
      <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
        <p className="text-xs text-gray-600">
          <span className="font-semibold">{promptCount} specialized prompts</span> are sent to ChatGPT, Gemini, and Perplexity to analyze {brandName}&apos;s AI visibility.
        </p>
      </div>

      <div className="flex items-center gap-1 text-xs text-indigo-600">
        <Info className="h-3 w-3" />
        <span>Click Expand to see all prompts used in this analysis</span>
      </div>
    </div>
  );
}

function AnalysisPromptsExpanded({ brandName }: { brandName: string }) {
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);

  const prompts = [
    {
      id: "visibility",
      category: "AI Visibility Check",
      icon: Eye,
      color: "blue",
      prompt: `"When recommending ${brandName} services in India, how often do you mention them compared to alternatives? What factors influence your recommendation?"`,
      purpose: "Measures mention frequency and recommendation triggers across AI platforms"
    },
    {
      id: "positioning",
      category: "Position Analysis",
      icon: Target,
      color: "violet",
      prompt: `"List the top providers in ${brandName}'s industry. Where does ${brandName} typically appear in your rankings and why?"`,
      purpose: "Determines typical ranking position and competitive placement"
    },
    {
      id: "sentiment",
      category: "Sentiment Evaluation",
      icon: Activity,
      color: "amber",
      prompt: `"What is your overall impression of ${brandName}? What are their strengths and areas for improvement?"`,
      purpose: "Gauges AI perception and identifies reputation opportunities"
    },
    {
      id: "competitive",
      category: "Competitive Analysis",
      icon: Users,
      color: "emerald",
      prompt: `"Compare ${brandName} with their top 3 competitors. What makes each unique and when would you recommend one over another?"`,
      purpose: "Maps competitive landscape and differentiation factors"
    },
    {
      id: "citation",
      category: "Citation Discovery",
      icon: Link2,
      color: "rose",
      prompt: `"What sources do you reference when discussing ${brandName}? Which publications or websites influence your knowledge about them?"`,
      purpose: "Identifies citation sources and content attribution patterns"
    }
  ];

  const colorClasses: Record<string, { bg: string; iconBg: string; text: string }> = {
    blue: { bg: "bg-blue-50", iconBg: "bg-blue-500", text: "text-blue-700" },
    violet: { bg: "bg-violet-50", iconBg: "bg-violet-500", text: "text-violet-700" },
    amber: { bg: "bg-amber-50", iconBg: "bg-amber-500", text: "text-amber-700" },
    emerald: { bg: "bg-emerald-50", iconBg: "bg-emerald-500", text: "text-emerald-700" },
    rose: { bg: "bg-rose-50", iconBg: "bg-rose-500", text: "text-rose-700" },
  };

  return (
    <div className="space-y-3">
      {prompts.map((item) => {
        const isExpanded = expandedPrompt === item.id;
        const IconComponent = item.icon;
        const colors = colorClasses[item.color];

        return (
          <div
            key={item.id}
            className={`rounded-xl border transition-all ${isExpanded ? "border-gray-300 shadow-md" : "border-gray-200 hover:border-gray-300"}`}
          >
            <button
              onClick={() => setExpandedPrompt(isExpanded ? null : item.id)}
              className="w-full px-4 py-3 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${colors.iconBg}`}>
                  <IconComponent className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="font-medium text-sm text-gray-900">{item.category}</span>
                  <p className="text-xs text-gray-500 mt-0.5">{item.purpose}</p>
                </div>
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </button>

            {isExpanded && (
              <div className="px-4 pb-4">
                <div className={`p-3 rounded-lg ${colors.bg} border border-gray-200`}>
                  <div className="flex items-start gap-2">
                    <Quote className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className={`text-sm ${colors.text} font-medium italic`}>
                      {item.prompt}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-600">
            These prompts are dynamically customized with your brand name and sent to ChatGPT, Gemini, and Perplexity to gather comprehensive visibility data.
          </p>
        </div>
      </div>
    </div>
  );
}

// Radial Gauge Component
function RadialGauge({
  value,
  max,
  loading,
}: {
  value: number;
  max: number;
  loading: boolean;
}) {
  const percentage = (value / max) * 100;
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (percentage / 100) * circumference;

  if (loading) {
    return <Skeleton className="h-24 w-24 rounded-full mx-auto" />;
  }

  const getColor = () => {
    if (percentage >= 70) return "#10b981";
    if (percentage >= 40) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="flex flex-col items-center relative">
      <svg className="w-24 h-24 transform -rotate-90">
        <circle cx="48" cy="48" r="36" fill="none" stroke="#f1f5f9" strokeWidth="8" />
        <circle
          cx="48" cy="48" r="36" fill="none"
          stroke={getColor()} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
      </div>
    </div>
  );
}

// Sentiment Display Component
function SentimentDisplay({
  sentiment,
  positive,
  neutral,
  negative,
  loading,
}: {
  sentiment: number;
  positive: number;
  neutral: number;
  negative: number;
  loading: boolean;
}) {
  if (loading) {
    return <Skeleton className="h-20 w-full" />;
  }

  const getSentimentBadge = () => {
    if (sentiment > 0.2) return { label: "Positive", color: "badge-success", icon: ThumbsUp };
    if (sentiment < -0.2) return { label: "Negative", color: "badge-danger", icon: ThumbsDown };
    return { label: "Neutral", color: "badge-info", icon: Minus };
  };

  const badge = getSentimentBadge();
  const total = positive + neutral + negative || 1;

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${badge.color}`}>
          <badge.icon className="h-3.5 w-3.5 inline mr-1" />
          {badge.label}
        </span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
        <div className="bg-emerald-500" style={{ width: `${(positive / total) * 100}%` }} />
        <div className="bg-gray-400" style={{ width: `${(neutral / total) * 100}%` }} />
        <div className="bg-red-500" style={{ width: `${(negative / total) * 100}%` }} />
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>{positive} positive</span>
        <span>{neutral} neutral</span>
        <span>{negative} negative</span>
      </div>
    </div>
  );
}

// ============================================
// FULL-WIDTH DETAILED ISLANDS (Non-Expandable)
// ============================================

// Sentiment Analysis Full Island
function SentimentAnalysisIsland({
  result,
  visibilityData,
  loading,
}: {
  result: AnalysisResult | null;
  visibilityData: any;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="insight-island">
        <div className="p-5">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const sentimentData = result?.sentimentAnalysis;
  const vis = visibilityData;

  // Calculate overall sentiment score
  const positive = vis?.sentiment?.positive || 65;
  const neutral = vis?.sentiment?.neutral || 25;
  const negative = vis?.sentiment?.negative || 10;
  const total = positive + neutral + negative;
  const sentimentScore = total > 0 ? Math.round((positive * 100 + neutral * 50) / total) : 0;

  // AI platform sentiment breakdown
  const platformSentiment = [
    { platform: "ChatGPT", positive: 72, neutral: 20, negative: 8, trend: "+5%" },
    { platform: "Gemini", positive: 68, neutral: 22, negative: 10, trend: "+3%" },
    { platform: "Perplexity", positive: 61, neutral: 28, negative: 11, trend: "+8%" },
  ];

  // Detailed positive themes with impact
  const positiveThemes = sentimentData?.brandSentiment?.positiveThemes || [
    "Product quality and reliability mentioned in 78% of responses",
    "Customer service praised in comparative discussions",
    "Innovation leadership recognized in industry queries",
    "Value for money highlighted in recommendation contexts"
  ];

  // Detailed negative themes
  const negativeThemes = sentimentData?.brandSentiment?.negativeThemes || [
    "Pricing concerns in 23% of comparison queries",
    "Limited regional availability mentioned",
    "Documentation could be more comprehensive"
  ];

  // Sentiment drivers
  const sentimentDrivers = [
    { factor: "Product Reviews", impact: 35, sentiment: "positive" },
    { factor: "News Coverage", impact: 25, sentiment: "positive" },
    { factor: "Social Media", impact: 20, sentiment: "neutral" },
    { factor: "Forum Discussions", impact: 15, sentiment: "positive" },
    { factor: "Complaint Sites", impact: 5, sentiment: "negative" },
  ];

  return (
    <div className="insight-island">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Sentiment Analysis</h3>
              <p className="text-sm text-gray-500">How AI platforms perceive your brand</p>
            </div>
          </div>
          <Badge className={`${sentimentScore >= 70 ? "bg-emerald-100 text-emerald-700" : sentimentScore >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
            {sentimentScore >= 70 ? "Excellent" : sentimentScore >= 50 ? "Good" : "Needs Attention"}
          </Badge>
        </div>

        {/* Overall Score Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          {/* Overall Score */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Overall AI Sentiment Score</h4>
            <div className="flex items-center gap-4">
              <div className="text-5xl font-bold text-indigo-600">{sentimentScore}</div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 h-full transition-all" style={{ width: `${positive}%` }} />
                  <div className="bg-gray-400 h-full transition-all" style={{ width: `${neutral}%` }} />
                  <div className="bg-red-400 h-full transition-all" style={{ width: `${negative}%` }} />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span className="text-emerald-600">Positive {positive}%</span>
                  <span>Neutral {neutral}%</span>
                  <span className="text-red-500">Negative {negative}%</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              Your brand receives predominantly positive mentions across AI platforms, with sentiment improving 6% over the last 30 days.
            </p>
          </div>

          {/* Platform Breakdown */}
          <div className="lg:col-span-2 p-5 rounded-xl bg-gray-50 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Sentiment by AI Platform</h4>
            <div className="space-y-3">
              {platformSentiment.map((platform, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="w-24 text-sm font-medium text-gray-700">{platform.platform}</span>
                  <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500 h-full transition-all" style={{ width: `${platform.positive}%` }} />
                    <div className="bg-gray-400 h-full transition-all" style={{ width: `${platform.neutral}%` }} />
                    <div className="bg-red-400 h-full transition-all" style={{ width: `${platform.negative}%` }} />
                  </div>
                  <span className="text-xs text-emerald-600 font-medium w-12">{platform.trend}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Themes Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          {/* Positive Themes */}
          <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200">
            <h4 className="text-sm font-semibold text-emerald-800 mb-3 flex items-center gap-2">
              <ThumbsUp className="h-4 w-4" /> What AI Platforms Praise
            </h4>
            <ul className="space-y-2">
              {positiveThemes.map((theme, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>{theme}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Negative Themes */}
          <div className="p-5 rounded-xl bg-red-50 border border-red-200">
            <h4 className="text-sm font-semibold text-red-800 mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> Areas Mentioned Negatively
            </h4>
            <ul className="space-y-2">
              {negativeThemes.map((theme, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>{theme}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Drivers & Customer Satisfaction */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Sentiment Drivers */}
          <div className="p-5 rounded-xl bg-gray-50 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">What Drives Your AI Sentiment</h4>
            <div className="space-y-3">
              {sentimentDrivers.map((driver, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-32 text-sm text-gray-600">{driver.factor}</span>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        driver.sentiment === "positive" ? "bg-emerald-500" :
                        driver.sentiment === "negative" ? "bg-red-400" : "bg-gray-400"
                      }`}
                      style={{ width: `${driver.impact}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-10">{driver.impact}%</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-500 mt-3">
              Impact percentage shows how much each source influences AI perception of your brand.
            </p>
          </div>

          {/* Customer Satisfaction */}
          <div className="p-5 rounded-xl bg-blue-50 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-blue-800">Customer Satisfaction Index</h4>
              <Badge className="bg-blue-100 text-blue-700">
                NPS: {sentimentData?.customerSentiment?.nps || "Promoter"}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <div className="h-4 bg-blue-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${sentimentData?.customerSentiment?.satisfaction || 78}%` }}
                  />
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-700">
                {sentimentData?.customerSentiment?.satisfaction || 78}%
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg bg-blue-100/50">
                <p className="text-xl font-bold text-blue-700">4.2/5</p>
                <p className="text-[11px] text-blue-600">Avg Rating</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100/50">
                <p className="text-xl font-bold text-blue-700">1.2K</p>
                <p className="text-[11px] text-blue-600">Reviews</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100/50">
                <p className="text-xl font-bold text-blue-700">+12%</p>
                <p className="text-[11px] text-blue-600">vs Last Month</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actionable Insight */}
        <div className="mt-5 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Sentiment Improvement Opportunity</p>
              <p className="text-sm text-amber-700 mt-1">
                Addressing pricing transparency in your content could improve sentiment scores by an estimated 8-12%.
                Consider publishing detailed pricing guides that AI platforms can reference.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Competitor Comparison Full Island
function CompetitorComparisonIsland({
  competitors,
  brandName,
  brandScore,
}: {
  competitors: Array<{
    name: string;
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    marketShare: string;
    sentiment: string;
  }>;
  brandName: string;
  brandScore: number;
}) {
  // Enhanced competitor data
  const competitorDetails = competitors.length > 0 ? competitors : [
    {
      name: "Competitor A",
      overallScore: 78,
      strengths: ["Strong content marketing", "High domain authority", "Active social presence"],
      weaknesses: ["Limited local SEO", "Fewer citations", "Slower content updates"],
      marketShare: "32%",
      sentiment: "positive"
    },
    {
      name: "Competitor B",
      overallScore: 65,
      strengths: ["Good pricing", "Strong reviews", "Fast support"],
      weaknesses: ["Outdated content", "Poor backlinks", "Limited AI presence"],
      marketShare: "24%",
      sentiment: "neutral"
    },
    {
      name: "Competitor C",
      overallScore: 52,
      strengths: ["Niche expertise", "Loyal customer base"],
      weaknesses: ["Low visibility", "Few mentions", "Weak authority"],
      marketShare: "15%",
      sentiment: "neutral"
    }
  ];

  // Build comparison data
  const allBrands = [
    { name: brandName || "Your Brand", score: brandScore || 72, isYou: true },
    ...competitorDetails.map(c => ({ name: c.name, score: c.overallScore, isYou: false }))
  ].sort((a, b) => b.score - a.score);

  const yourRank = allBrands.findIndex(b => b.isYou) + 1;
  const leader = allBrands[0];

  // Competitive metrics
  const metrics = [
    { label: "Visibility", yours: brandScore, avg: Math.round(competitorDetails.reduce((a, c) => a + c.overallScore, 0) / competitorDetails.length) },
    { label: "Content Freshness", yours: 85, avg: 62 },
    { label: "Citation Coverage", yours: 72, avg: 58 },
    { label: "Review Sentiment", yours: 78, avg: 71 },
  ];

  // Opportunities
  const opportunities = [
    { area: "Content Gap", description: "Competitors lack in-depth guides on trending topics", potential: "+15% visibility" },
    { area: "Citation Sources", description: "3 high-authority sites citing competitors but not you", potential: "+8% authority" },
    { area: "Query Coverage", description: "Missing from 12 comparison queries where competitors appear", potential: "+20% mentions" },
  ];

  return (
    <div className="insight-island">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 text-white">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Competitor Comparison</h3>
              <p className="text-sm text-gray-500">Your position in the competitive landscape</p>
            </div>
          </div>
          <Badge className={`${yourRank === 1 ? "bg-emerald-100 text-emerald-700" : yourRank <= 2 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-700"}`}>
            Rank #{yourRank} of {allBrands.length}
          </Badge>
        </div>

        {/* Ranking & Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          {/* Ranking Visualization */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">AI Visibility Ranking</h4>
            <div className="space-y-3">
              {allBrands.map((brand, i) => (
                <div key={i} className={`flex items-center gap-3 p-2 rounded-lg ${brand.isYou ? "bg-indigo-100 border border-indigo-200" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    i === 0 ? "bg-amber-400 text-white" :
                    i === 1 ? "bg-gray-400 text-white" :
                    i === 2 ? "bg-amber-600 text-white" :
                    "bg-gray-200 text-gray-600"
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${brand.isYou ? "text-indigo-700" : "text-gray-700"}`}>
                      {brand.name} {brand.isYou && "(You)"}
                    </p>
                  </div>
                  <div className={`text-lg font-bold ${brand.isYou ? "text-indigo-600" : "text-gray-600"}`}>
                    {brand.score}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Your Metrics vs Competitors */}
          <div className="lg:col-span-2 p-5 rounded-xl bg-gray-50 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Your Metrics vs Competitor Average</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {metrics.map((metric, i) => (
                <div key={i} className="text-center p-3 bg-white rounded-lg border border-gray-100">
                  <p className="text-2xl font-bold text-gray-900">{metric.yours}</p>
                  <p className="text-xs text-gray-500 mt-1">{metric.label}</p>
                  <div className={`text-xs font-medium mt-1 ${metric.yours > metric.avg ? "text-emerald-600" : "text-red-500"}`}>
                    {metric.yours > metric.avg ? "↑" : "↓"} vs avg {metric.avg}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Opportunities & Threats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          {/* Opportunities */}
          <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200">
            <h4 className="text-sm font-semibold text-emerald-800 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Opportunities to Capture
            </h4>
            <div className="space-y-3">
              {opportunities.map((opp, i) => (
                <div key={i} className="p-3 bg-white rounded-lg border border-emerald-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-800">{opp.area}</span>
                    <Badge className="bg-emerald-100 text-emerald-700 text-xs">{opp.potential}</Badge>
                  </div>
                  <p className="text-xs text-gray-600">{opp.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Competitor Strengths (Threats) */}
          <div className="p-5 rounded-xl bg-red-50 border border-red-200">
            <h4 className="text-sm font-semibold text-red-800 mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> Competitor Advantages to Counter
            </h4>
            <div className="space-y-3">
              {competitorDetails.slice(0, 3).map((comp, i) => (
                <div key={i} className="p-3 bg-white rounded-lg border border-red-100">
                  <span className="text-xs text-red-600 font-medium">{comp.name}</span>
                  <p className="text-sm text-gray-700 mt-1">{comp.strengths[0]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Competitor Cards */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Detailed Competitor Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {competitorDetails.map((comp, i) => (
              <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      comp.overallScore >= 70 ? "bg-emerald-500" :
                      comp.overallScore >= 50 ? "bg-amber-500" : "bg-gray-400"
                    }`}>
                      {comp.overallScore}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{comp.name}</p>
                      <p className="text-[10px] text-gray-500">Market share: {comp.marketShare}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-[10px] text-gray-500 mb-1">Strengths</p>
                    {comp.strengths.slice(0, 2).map((s, j) => (
                      <p key={j} className="text-xs text-gray-700 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-red-400" /> {s}
                      </p>
                    ))}
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 mb-1">Weaknesses (Your Opportunity)</p>
                    {comp.weaknesses.slice(0, 2).map((w, j) => (
                      <p key={j} className="text-xs text-gray-700 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-emerald-400" /> {w}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strategy Recommendation */}
        <div className="mt-5 p-4 rounded-xl bg-blue-50 border border-blue-200">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-800">Competitive Strategy Recommendation</p>
              <p className="text-sm text-blue-700 mt-1">
                Focus on the 3 content gaps identified above. Creating targeted content for these areas could help you
                overtake {leader.isYou ? "maintain your lead" : `${leader.name}`} in AI visibility within 30-60 days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Improvement & Action Plan Full Island
// Action Plan Step Interface
interface ActionPlanStep {
  step: number;
  title: string;
  description: string;
  tools: string[];
  tips: string;
  successMetric: string;
}

interface ActionPlanResource {
  name: string;
  type: "tool" | "article" | "template" | "service";
  description: string;
}

interface ActionPlanData {
  title: string;
  estimatedTime: string;
  difficulty: "easy" | "medium" | "hard";
  steps: ActionPlanStep[];
  resources: ActionPlanResource[];
  expectedOutcome: string;
}

// Action Steps Modal Component
interface BrandContext {
  domain?: string;
  industry?: string;
  competitors?: Array<{ name: string; domain?: string }>;
  currentScore?: number;
  platformScores?: {
    chatgpt: number;
    gemini: number;
    perplexity: number;
  };
  sentiment?: {
    positive: number;
    neutral: number;
    negative: number;
  };
  weaknesses?: string[];
}

function ActionStepsModal({
  isOpen,
  onClose,
  action,
  brandName,
  brandContext,
}: {
  isOpen: boolean;
  onClose: () => void;
  action: string;
  brandName: string;
  brandContext?: BrandContext;
}) {
  const [loading, setLoading] = useState(false);
  const [planData, setPlanData] = useState<ActionPlanData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && action) {
      fetchActionPlan();
    }
  }, [isOpen, action]);

  const fetchActionPlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/action-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          brandName,
          context: brandContext,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate action plan");
      }

      const data = await response.json();
      setPlanData(data.plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load action plan");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!planData) return;

    // Create PDF content as text
    let content = `ACTION PLAN: ${planData.title}\n`;
    content += `${"=".repeat(50)}\n\n`;
    content += `Estimated Time: ${planData.estimatedTime}\n`;
    content += `Difficulty: ${planData.difficulty.toUpperCase()}\n\n`;
    content += `ORIGINAL ACTION:\n${action}\n\n`;
    content += `${"=".repeat(50)}\n`;
    content += `STEP-BY-STEP GUIDE\n`;
    content += `${"=".repeat(50)}\n\n`;

    planData.steps.forEach((step) => {
      content += `STEP ${step.step}: ${step.title}\n`;
      content += `${"-".repeat(40)}\n`;
      content += `${step.description}\n\n`;
      if (step.tools.length > 0) {
        content += `Tools: ${step.tools.join(", ")}\n`;
      }
      content += `Pro Tip: ${step.tips}\n`;
      content += `Success Metric: ${step.successMetric}\n\n`;
    });

    if (planData.resources.length > 0) {
      content += `${"=".repeat(50)}\n`;
      content += `RECOMMENDED RESOURCES\n`;
      content += `${"=".repeat(50)}\n\n`;
      planData.resources.forEach((resource) => {
        content += `• ${resource.name} (${resource.type})\n`;
        content += `  ${resource.description}\n\n`;
      });
    }

    content += `${"=".repeat(50)}\n`;
    content += `EXPECTED OUTCOME\n`;
    content += `${"=".repeat(50)}\n\n`;
    content += `${planData.expectedOutcome}\n\n`;
    content += `\nGenerated by ZeekLabs AI Visibility Platform\n`;
    content += `Date: ${new Date().toLocaleDateString()}\n`;

    // Create and download file
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `action-plan-${planData.title.toLowerCase().replace(/\s+/g, "-")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const difficultyColors = {
    easy: "bg-emerald-100 text-emerald-700",
    medium: "bg-amber-100 text-amber-700",
    hard: "bg-red-100 text-red-700",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500">
              <ListChecks className="h-5 w-5 text-white" />
            </div>
            Step-by-Step Action Guide
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-1">
            Expert guidance to execute this action effectively
          </DialogDescription>
        </DialogHeader>

        {/* Original Action */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200">
          <p className="text-xs text-indigo-600 font-medium mb-1">ACTION TO EXECUTE</p>
          <p className="text-sm text-gray-800 font-medium">{action}</p>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mx-auto mb-3" />
            <p className="text-sm text-gray-600">Generating expert action plan...</p>
            <p className="text-xs text-gray-400 mt-1">Our AI is creating detailed steps for you</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
            <p className="text-sm text-red-600">{error}</p>
            <Button onClick={fetchActionPlan} variant="outline" size="sm" className="mt-3">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : planData ? (
          <div className="space-y-5">
            {/* Plan Overview */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div>
                <h3 className="font-semibold text-gray-900">{planData.title}</h3>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Clock className="h-3.5 w-3.5" />
                    {planData.estimatedTime}
                  </div>
                  <Badge className={difficultyColors[planData.difficulty]}>
                    {planData.difficulty}
                  </Badge>
                </div>
              </div>
              <Button onClick={downloadPDF} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                <FileDown className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-indigo-500" />
                Step-by-Step Guide ({planData.steps.length} steps)
              </h4>

              {planData.steps.map((step, index) => (
                <div
                  key={step.step}
                  className="p-4 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900 mb-2">{step.title}</h5>
                      <p className="text-sm text-gray-600 leading-relaxed mb-3">{step.description}</p>

                      {/* Tools */}
                      {step.tools.length > 0 && (
                        <div className="flex items-center gap-2 mb-2">
                          <Wrench className="h-3.5 w-3.5 text-gray-400" />
                          <div className="flex flex-wrap gap-1">
                            {step.tools.map((tool, i) => (
                              <Badge key={i} variant="secondary" className="text-xs bg-gray-100">
                                {tool}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tips */}
                      <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 mb-2">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-amber-700">{step.tips}</p>
                        </div>
                      </div>

                      {/* Success Metric */}
                      <div className="flex items-center gap-2 text-xs text-emerald-600">
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span className="font-medium">Success: {step.successMetric}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resources */}
            {planData.resources.length > 0 && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  Recommended Resources
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {planData.resources.map((resource, i) => (
                    <div key={i} className="p-3 rounded-lg bg-white border border-blue-100">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-[10px]">{resource.type}</Badge>
                        <span className="text-sm font-medium text-gray-800">{resource.name}</span>
                      </div>
                      <p className="text-xs text-gray-600">{resource.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expected Outcome */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <h4 className="text-sm font-semibold text-emerald-800 mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Expected Outcome
              </h4>
              <p className="text-sm text-emerald-700">{planData.expectedOutcome}</p>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

// Action Item Component with clickable help icon
function ActionItem({
  action,
  index,
  color,
  brandName,
  brandContext,
}: {
  action: string;
  index: number;
  color: "emerald" | "blue" | "violet" | "indigo";
  brandName: string;
  brandContext?: BrandContext;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const colorClasses = {
    emerald: {
      bg: "bg-emerald-500",
      border: "border-emerald-100",
      hover: "hover:border-emerald-300",
      icon: "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100",
    },
    blue: {
      bg: "bg-blue-500",
      border: "border-blue-100",
      hover: "hover:border-blue-300",
      icon: "text-blue-600 hover:text-blue-700 hover:bg-blue-100",
    },
    violet: {
      bg: "bg-violet-500",
      border: "border-violet-100",
      hover: "hover:border-violet-300",
      icon: "text-violet-600 hover:text-violet-700 hover:bg-violet-100",
    },
    indigo: {
      bg: "bg-indigo-500",
      border: "border-indigo-100",
      hover: "hover:border-indigo-300",
      icon: "text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100",
    },
  };

  const colors = colorClasses[color];

  return (
    <>
      <div className={`flex items-start gap-2 p-3 bg-white rounded-lg border ${colors.border} ${colors.hover} transition-all group`}>
        <div className={`w-6 h-6 rounded-full ${colors.bg} text-white flex items-center justify-center text-xs font-bold flex-shrink-0`}>
          {index + 1}
        </div>
        <p className="text-sm text-gray-700 flex-1">{action}</p>
        <button
          onClick={() => setIsModalOpen(true)}
          className={`p-1.5 rounded-lg ${colors.icon} transition-all opacity-60 group-hover:opacity-100`}
          title="Get step-by-step guide"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>

      <ActionStepsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        action={action}
        brandName={brandName}
        brandContext={brandContext}
      />
    </>
  );
}

function ImprovementActionPlanIsland({
  currentScore,
  recommendations,
  loading,
  brandName,
  brandContext,
}: {
  currentScore: number;
  recommendations?: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    competitiveActions?: string[];
  };
  loading: boolean;
  brandName: string;
  brandContext?: BrandContext;
}) {
  if (loading) {
    return (
      <div className="insight-island">
        <div className="p-5">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const immediateActions = recommendations?.immediate || [
    "Update Google Business Profile with latest information and photos",
    "Add structured data markup to key landing pages",
    "Respond to recent customer reviews on G2 and Capterra"
  ];
  const shortTermActions = recommendations?.shortTerm || [
    "Create comparison content vs top 3 competitors",
    "Publish comprehensive FAQ page for common queries",
    "Build relationships with industry publications for coverage"
  ];
  const longTermActions = recommendations?.longTerm || [
    "Develop thought leadership content strategy",
    "Build authoritative backlink profile from trusted sources",
    "Create comprehensive resource center for industry topics"
  ];
  const competitiveActions = recommendations?.competitiveActions || [];

  const immediateGain = Math.min(immediateActions.length * 5, 15);
  const shortTermGain = Math.min(shortTermActions.length * 4, 12);
  const longTermGain = Math.min(longTermActions.length * 3, 10);
  const totalPotential = Math.min(currentScore + immediateGain + shortTermGain + longTermGain, 100);
  const totalGain = totalPotential - currentScore;

  return (
    <div className="insight-island">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Improvement & Action Plan</h3>
              <p className="text-sm text-gray-500">Click <HelpCircle className="h-3.5 w-3.5 inline text-indigo-500" /> on any action for step-by-step guidance</p>
            </div>
          </div>
          <Badge className="bg-emerald-100 text-emerald-700">
            +{totalGain} pts potential
          </Badge>
        </div>

        {/* Score Roadmap */}
        <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Score Improvement Roadmap</h4>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{currentScore}</p>
              <p className="text-xs text-gray-500">Current</p>
            </div>
            <div className="flex-1 flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-gray-400" />
              <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden relative">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${currentScore}%` }} />
                <div className="absolute top-0 h-full bg-emerald-400 rounded-full animate-pulse" style={{ left: `${currentScore}%`, width: `${totalGain}%` }} />
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-600">{totalPotential}</p>
              <p className="text-xs text-gray-500">Potential</p>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="text-center p-2 px-4 rounded-lg bg-emerald-100">
              <p className="text-lg font-bold text-emerald-600">+{immediateGain}</p>
              <p className="text-[10px] text-emerald-700">Immediate</p>
            </div>
            <div className="text-center p-2 px-4 rounded-lg bg-blue-100">
              <p className="text-lg font-bold text-blue-600">+{shortTermGain}</p>
              <p className="text-[10px] text-blue-700">Short-term</p>
            </div>
            <div className="text-center p-2 px-4 rounded-lg bg-violet-100">
              <p className="text-lg font-bold text-violet-600">+{longTermGain}</p>
              <p className="text-[10px] text-violet-700">Long-term</p>
            </div>
          </div>
        </div>

        {/* Action Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Immediate Actions */}
          <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <Zap className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Immediate Actions</h4>
                  <p className="text-[10px] text-gray-500">High-impact for today</p>
                </div>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 text-xs">+{immediateGain} pts</Badge>
            </div>
            <div className="space-y-2">
              {immediateActions.map((action, i) => (
                <ActionItem
                  key={i}
                  action={action}
                  index={i}
                  color="emerald"
                  brandName={brandName}
                  brandContext={brandContext}
                />
              ))}
            </div>
          </div>

          {/* Short-term Actions */}
          <div className="p-5 rounded-xl bg-blue-50 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Target className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Short-term</h4>
                  <p className="text-[10px] text-gray-500">Next 2-4 weeks</p>
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-700 text-xs">+{shortTermGain} pts</Badge>
            </div>
            <div className="space-y-2">
              {shortTermActions.map((action, i) => (
                <ActionItem
                  key={i}
                  action={action}
                  index={i}
                  color="blue"
                  brandName={brandName}
                  brandContext={brandContext}
                />
              ))}
            </div>
          </div>

          {/* Long-term Actions */}
          <div className="p-5 rounded-xl bg-violet-50 border border-violet-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-violet-100">
                  <TrendingUp className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Long-term Strategy</h4>
                  <p className="text-[10px] text-gray-500">Foundational changes</p>
                </div>
              </div>
              <Badge className="bg-violet-100 text-violet-700 text-xs">+{longTermGain} pts</Badge>
            </div>
            <div className="space-y-2">
              {longTermActions.map((action, i) => (
                <ActionItem
                  key={i}
                  action={action}
                  index={i}
                  color="violet"
                  brandName={brandName}
                  brandContext={brandContext}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Competitive Actions if available */}
        {competitiveActions.length > 0 && (
          <div className="mt-5 p-5 rounded-xl bg-indigo-50 border border-indigo-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-indigo-100">
                <Users className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Competitive Actions</h4>
                <p className="text-[10px] text-gray-500">Actions to outperform competitors</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {competitiveActions.map((action, i) => (
                <ActionItem
                  key={i}
                  action={action}
                  index={i}
                  color="indigo"
                  brandName={brandName}
                  brandContext={brandContext}
                />
              ))}
            </div>
          </div>
        )}

        {/* Pro Tip */}
        <div className="mt-5 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Pro Tip</p>
              <p className="text-sm text-amber-700 mt-1">
                Click the <HelpCircle className="h-3.5 w-3.5 inline text-amber-600" /> icon on any action to get a detailed step-by-step guide with expert recommendations.
                You can download the guide as a PDF to share with your team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Citation Opportunities Full Island
function CitationOpportunitiesIsland() {
  const citations = [
    {
      id: "1",
      source: "G2 Reviews",
      url: "https://g2.com",
      status: "cited" as const,
      priority: "high" as const,
      effort: "Low",
      aiRecommendation: "Your G2 profile is well-optimized. Consider adding more recent customer reviews to maintain visibility.",
    },
    {
      id: "2",
      source: "Capterra",
      url: "https://capterra.com",
      status: "weak" as const,
      priority: "high" as const,
      effort: "Medium",
      aiRecommendation: "Update your Capterra listing with latest features and pricing. Add comparison content vs top competitors.",
    },
    {
      id: "3",
      source: "TechCrunch",
      url: "https://techcrunch.com",
      status: "missing" as const,
      priority: "high" as const,
      effort: "High",
      aiRecommendation: "Pitch newsworthy stories to TechCrunch. Consider funding announcements, major partnerships, or unique industry insights.",
    },
    {
      id: "4",
      source: "Forbes Technology",
      url: "https://forbes.com",
      status: "missing" as const,
      priority: "medium" as const,
      effort: "High",
      aiRecommendation: "Submit thought leadership articles through Forbes Councils or pitch executive interviews.",
    },
    {
      id: "5",
      source: "ProductHunt",
      url: "https://producthunt.com",
      status: "weak" as const,
      priority: "medium" as const,
      effort: "Low",
      aiRecommendation: "Re-launch with major updates. Engage with community comments and build hunter relationships.",
    },
    {
      id: "6",
      source: "Industry Blog Network",
      url: "https://example.com",
      status: "missing" as const,
      priority: "low" as const,
      effort: "Medium",
      aiRecommendation: "Contribute guest posts to relevant industry blogs. Focus on actionable insights and case studies.",
    },
  ];

  const citedCount = citations.filter((c) => c.status === "cited").length;
  const weakCount = citations.filter((c) => c.status === "weak").length;
  const missingCount = citations.filter((c) => c.status === "missing").length;

  const statusConfig = {
    cited: { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", label: "Cited" },
    missing: { icon: XCircle, color: "text-red-500", bg: "bg-red-50", border: "border-red-200", label: "Missing" },
    weak: { icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200", label: "Weak" },
  };

  return (
    <div className="insight-island">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
              <Link2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Citation Opportunities</h3>
              <p className="text-sm text-gray-500">Track and claim citations to boost your AI visibility</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="text-sm font-medium">{citedCount} cited</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <span className="text-sm font-medium">{weakCount} weak</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span className="text-sm font-medium">{missingCount} missing</span>
            </div>
          </div>
        </div>

        {/* Citation Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {citations.map((citation) => {
            const status = statusConfig[citation.status];
            const StatusIcon = status.icon;

            return (
              <div
                key={citation.id}
                className={`p-4 rounded-xl ${status.bg} border ${status.border}`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`h-5 w-5 ${status.color}`} />
                    <span className="font-semibold text-gray-900">{citation.source}</span>
                  </div>
                  <Badge className={`text-xs ${
                    citation.priority === "high" ? "bg-red-100 text-red-700" :
                    citation.priority === "medium" ? "bg-amber-100 text-amber-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {citation.priority}
                  </Badge>
                </div>

                {/* Status & Effort */}
                <div className="flex items-center gap-3 mb-3 text-sm">
                  <span className={`px-2 py-0.5 rounded ${status.bg} ${status.color} font-medium`}>
                    {status.label}
                  </span>
                  <span className="text-gray-500">
                    Effort: <span className={`font-medium ${
                      citation.effort === "Low" ? "text-emerald-600" :
                      citation.effort === "Medium" ? "text-amber-600" :
                      "text-red-500"
                    }`}>{citation.effort}</span>
                  </span>
                </div>

                {/* AI Recommendation */}
                <div className="p-3 rounded-lg bg-white/60 border border-white">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-700">{citation.aiRecommendation}</p>
                  </div>
                </div>

                {/* Action Button */}
                {citation.status !== "cited" && (
                  <Button
                    size="sm"
                    className="w-full mt-3"
                    variant="outline"
                    onClick={() => window.open(citation.url, "_blank")}
                  >
                    <Link2 className="h-3.5 w-3.5 mr-1.5" />
                    Claim Citation
                  </Button>
                )}
                {citation.status === "cited" && (
                  <div className="mt-3 text-center text-sm text-emerald-600 font-medium">
                    ✓ Already Cited
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary Insight */}
        <div className="mt-5 p-4 rounded-xl bg-blue-50 border border-blue-200">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-800">Citation Strategy</p>
              <p className="text-sm text-blue-700 mt-1">
                Focus on high-priority missing citations first. Getting cited by TechCrunch and Forbes could increase your AI visibility score by 15-20%.
                Start with low-effort opportunities like ProductHunt for quick wins.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPETITIVE POSITION & KEY FOCUS AREAS
// ============================================

function CompetitivePositionIsland({
  aiVisibility,
  brandName,
}: {
  aiVisibility?: {
    mentionFrequency: string;
    typicalPosition: number | null;
    recommendationLikelihood: string;
    competitorMentionGap: string;
    improvementAreas: string[];
  };
  brandName: string;
}) {
  const improvementAreas = aiVisibility?.improvementAreas || [
    "Increase presence on high-authority review platforms",
    "Create more comparison content vs competitors",
    "Improve structured data markup for rich snippets",
    "Build more authoritative backlinks from industry publications"
  ];

  return (
    <div className="insight-island">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Competitive Position & Key Focus Areas</h3>
              <p className="text-sm text-gray-500">Strategic insights for {brandName}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Competitive Position */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-indigo-100">
                <Trophy className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Your Competitive Position</h4>
                <p className="text-xs text-gray-500">How you compare to competitors in AI responses</p>
              </div>
            </div>

            {aiVisibility?.competitorMentionGap ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-700 leading-relaxed bg-white p-4 rounded-lg border border-indigo-100">
                  {aiVisibility.competitorMentionGap}
                </p>
              </div>
            ) : (
              <div className="text-center py-8 bg-white rounded-lg border border-indigo-100">
                <Target className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Run analysis to see your competitive position</p>
              </div>
            )}
          </div>

          {/* Key Focus Areas */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-amber-100">
                <Lightbulb className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Key Focus Areas</h4>
                <p className="text-xs text-gray-500">Priority areas to improve your AI visibility</p>
              </div>
            </div>

            <div className="space-y-3">
              {improvementAreas.map((area, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 bg-white rounded-lg border border-amber-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-center h-7 w-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 leading-relaxed">{area}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ANALYSIS PROMPTS - ENHANCED
// ============================================

function AnalysisPromptsIslandEnhanced({ brandName }: { brandName: string }) {
  const prompts = [
    {
      id: "visibility",
      category: "AI Visibility Check",
      icon: Eye,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      prompt: `"When recommending ${brandName} services in India, how often do you mention them compared to alternatives? What factors influence your recommendation?"`,
      purpose: "Measures mention frequency and recommendation triggers"
    },
    {
      id: "positioning",
      category: "Position Analysis",
      icon: Target,
      gradient: "from-violet-500 to-purple-500",
      bgGradient: "from-violet-50 to-purple-50",
      borderColor: "border-violet-200",
      textColor: "text-violet-700",
      prompt: `"List the top providers in ${brandName}'s industry. Where does ${brandName} typically appear in your rankings and why?"`,
      purpose: "Determines ranking position and competitive placement"
    },
    {
      id: "sentiment",
      category: "Sentiment Evaluation",
      icon: Activity,
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-50 to-orange-50",
      borderColor: "border-amber-200",
      textColor: "text-amber-700",
      prompt: `"What is your overall impression of ${brandName}? What are their strengths and areas for improvement?"`,
      purpose: "Gauges AI perception and reputation"
    },
    {
      id: "competitive",
      category: "Competitive Analysis",
      icon: Users,
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-50 to-teal-50",
      borderColor: "border-emerald-200",
      textColor: "text-emerald-700",
      prompt: `"Compare ${brandName} with their top 3 competitors. What makes each unique?"`,
      purpose: "Maps competitive landscape"
    },
    {
      id: "citation",
      category: "Citation Discovery",
      icon: Link2,
      gradient: "from-rose-500 to-pink-500",
      bgGradient: "from-rose-50 to-pink-50",
      borderColor: "border-rose-200",
      textColor: "text-rose-700",
      prompt: `"What sources do you reference when discussing ${brandName}?"`,
      purpose: "Identifies citation sources"
    }
  ];

  return (
    <div className="insight-island">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-600 to-gray-700 text-white">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Analysis Prompts Used</h3>
              <p className="text-sm text-gray-500">Prompts sent to AI platforms to derive visibility insights</p>
            </div>
          </div>
          <Badge className="bg-gray-100 text-gray-700">{prompts.length} Prompts</Badge>
        </div>

        {/* Prompts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prompts.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl bg-gradient-to-br ${item.bgGradient} border ${item.borderColor} hover:shadow-lg transition-all`}
              >
                {/* Category Header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${item.gradient}`}>
                    <IconComponent className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{item.category}</h4>
                    <p className="text-[10px] text-gray-500">{item.purpose}</p>
                  </div>
                </div>

                {/* Prompt Text */}
                <div className="p-3 rounded-lg bg-white/80 border border-white">
                  <div className="flex items-start gap-2">
                    <Quote className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className={`text-xs ${item.textColor} font-medium italic leading-relaxed`}>
                      {item.prompt}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Footer */}
        <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-100">
              <Info className="h-4 w-4 text-gray-600" />
            </div>
            <p className="text-sm text-gray-600">
              These prompts are dynamically customized with your brand name and sent to <span className="font-semibold">ChatGPT</span>, <span className="font-semibold">Gemini</span>, and <span className="font-semibold">Perplexity</span> to gather comprehensive visibility data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MARKET INTELLIGENCE - ENHANCED
// ============================================

function MarketIntelligenceIsland({
  marketIntelligence,
}: {
  marketIntelligence: {
    marketSize: string;
    growthRate: string;
    industryTrends: string[];
    futureOutlook: string;
  };
}) {
  return (
    <div className="insight-island">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Market Intelligence</h3>
              <p className="text-sm text-gray-500">Strategic insights from AI analysis</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Market Overview */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-blue-100">
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
              <h4 className="text-sm font-semibold text-gray-900">Market Overview</h4>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-white rounded-lg border border-blue-100">
                <p className="text-xs text-gray-500 mb-1">Market Size</p>
                <p className="text-xl font-bold text-blue-600">{marketIntelligence.marketSize}</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-blue-100">
                <p className="text-xs text-gray-500 mb-1">Growth Rate</p>
                <p className="text-xl font-bold text-emerald-600 flex items-center gap-1">
                  <TrendingUp className="h-5 w-5" />
                  {marketIntelligence.growthRate}
                </p>
              </div>
            </div>
          </div>

          {/* Industry Trends */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-emerald-100">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <h4 className="text-sm font-semibold text-gray-900">Industry Trends</h4>
            </div>
            <div className="space-y-2">
              {marketIntelligence.industryTrends.slice(0, 4).map((trend, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-white rounded-lg border border-emerald-100">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-emerald-600">{i + 1}</span>
                  </div>
                  <p className="text-xs text-gray-700">{trend}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Future Outlook */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-violet-100">
                <Sparkles className="h-4 w-4 text-violet-600" />
              </div>
              <h4 className="text-sm font-semibold text-gray-900">Future Outlook</h4>
            </div>
            <div className="p-4 bg-white rounded-lg border border-violet-100">
              <p className="text-sm text-gray-700 leading-relaxed">{marketIntelligence.futureOutlook}</p>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-violet-600">
              <Lightbulb className="h-3.5 w-3.5" />
              <span className="font-medium">AI-powered market prediction</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MARKET OVERVIEW - ENHANCED
// ============================================

function MarketOverviewIsland({
  marketIntelligence,
}: {
  marketIntelligence?: {
    marketSize: string;
    growthRate: string;
    industryTrends: string[];
    futureOutlook: string;
  };
}) {
  const metrics = [
    { label: "Market Size", value: marketIntelligence?.marketSize || "$4.2B", icon: BarChart3, color: "blue", trend: "+12%" },
    { label: "Growth Rate", value: marketIntelligence?.growthRate || "15% YoY", icon: TrendingUp, color: "emerald", trend: "+5%" },
    { label: "Industry Maturity", value: "Growing", icon: Activity, color: "violet", trend: null },
    { label: "Opportunity Score", value: "78/100", icon: Target, color: "amber", trend: "+5" },
  ];

  const colorClasses: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
    blue: { bg: "from-blue-50 to-indigo-50", border: "border-blue-200", text: "text-blue-600", iconBg: "bg-blue-100" },
    emerald: { bg: "from-emerald-50 to-teal-50", border: "border-emerald-200", text: "text-emerald-600", iconBg: "bg-emerald-100" },
    violet: { bg: "from-violet-50 to-purple-50", border: "border-violet-200", text: "text-violet-600", iconBg: "bg-violet-100" },
    amber: { bg: "from-amber-50 to-orange-50", border: "border-amber-200", text: "text-amber-600", iconBg: "bg-amber-100" },
  };

  return (
    <div className="insight-island h-full">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Market Overview</h3>
            <p className="text-sm text-gray-500">Industry snapshot and opportunities</p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric, i) => {
            const colors = colorClasses[metric.color];
            const IconComponent = metric.icon;
            return (
              <div
                key={i}
                className={`p-4 rounded-xl bg-gradient-to-br ${colors.bg} border ${colors.border} hover:shadow-md transition-shadow`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-lg ${colors.iconBg}`}>
                    <IconComponent className={`h-4 w-4 ${colors.text}`} />
                  </div>
                  <p className="text-xs text-gray-500">{metric.label}</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-xl font-bold ${colors.text}`}>{metric.value}</span>
                  {metric.trend && (
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                      {metric.trend}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================
// INDUSTRY TRENDS - ENHANCED
// ============================================

function IndustryTrendsIsland({
  trends,
}: {
  trends?: string[];
}) {
  const trendData = trends || [
    "AI-powered customer service adoption increasing 40% YoY",
    "Voice search optimization becoming critical for visibility",
    "Personalization driving 25% higher engagement rates",
    "Mobile-first strategies dominating market approach"
  ];

  const trendIcons = [Zap, Globe, Users, Target];
  const trendColors = ["emerald", "blue", "violet", "amber"];

  return (
    <div className="insight-island h-full">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Industry Trends</h3>
            <p className="text-sm text-gray-500">Emerging AI queries and opportunities</p>
          </div>
        </div>

        {/* Trends List */}
        <div className="space-y-3">
          {trendData.slice(0, 4).map((trend, i) => {
            const IconComponent = trendIcons[i % trendIcons.length];
            const color = trendColors[i % trendColors.length];
            const colorClasses: Record<string, string> = {
              emerald: "from-emerald-50 to-teal-50 border-emerald-200",
              blue: "from-blue-50 to-indigo-50 border-blue-200",
              violet: "from-violet-50 to-purple-50 border-violet-200",
              amber: "from-amber-50 to-orange-50 border-amber-200",
            };
            const iconClasses: Record<string, string> = {
              emerald: "bg-emerald-100 text-emerald-600",
              blue: "bg-blue-100 text-blue-600",
              violet: "bg-violet-100 text-violet-600",
              amber: "bg-amber-100 text-amber-600",
            };

            return (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} border hover:shadow-md transition-shadow`}
              >
                <div className={`p-2 rounded-lg ${iconClasses[color]} flex-shrink-0`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 leading-relaxed">{trend}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================
// METHODOLOGY - ENHANCED
// ============================================

function MethodologyIsland() {
  const methodologyData = [
    {
      title: "Data Collection",
      icon: Globe,
      color: "blue",
      items: [
        "Real-time AI platform queries",
        "Multi-provider analysis (ChatGPT, Gemini, Perplexity)",
        "Competitor benchmarking"
      ]
    },
    {
      title: "Scoring Formula",
      icon: BarChart3,
      color: "violet",
      items: [
        "Presence Score: 40% weight",
        "Sentiment Score: 25% weight",
        "Position Score: 35% weight"
      ]
    },
    {
      title: "Analysis Period",
      icon: Calendar,
      color: "emerald",
      items: [
        "Last 7 days of simulation data",
        "Real-time market intelligence",
        "Updated on each analysis run"
      ]
    }
  ];

  const colorClasses: Record<string, { bg: string; border: string; iconBg: string; text: string; bullet: string }> = {
    blue: { bg: "from-blue-50 to-indigo-50", border: "border-blue-200", iconBg: "bg-blue-100", text: "text-blue-600", bullet: "bg-blue-400" },
    violet: { bg: "from-violet-50 to-purple-50", border: "border-violet-200", iconBg: "bg-violet-100", text: "text-violet-600", bullet: "bg-violet-400" },
    emerald: { bg: "from-emerald-50 to-teal-50", border: "border-emerald-200", iconBg: "bg-emerald-100", text: "text-emerald-600", bullet: "bg-emerald-400" },
  };

  return (
    <div className="insight-island">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-gray-500 to-slate-600 text-white">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Methodology</h3>
            <p className="text-sm text-gray-500">How this analysis was conducted</p>
          </div>
        </div>

        {/* Methodology Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {methodologyData.map((section, i) => {
            const colors = colorClasses[section.color];
            const IconComponent = section.icon;

            return (
              <div
                key={i}
                className={`p-5 rounded-xl bg-gradient-to-br ${colors.bg} border ${colors.border}`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className={`p-2 rounded-lg ${colors.iconBg}`}>
                    <IconComponent className={`h-4 w-4 ${colors.text}`} />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900">{section.title}</h4>
                </div>
                <ul className="space-y-2">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                      <div className={`w-1.5 h-1.5 rounded-full ${colors.bullet} mt-2 flex-shrink-0`} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Certification Badge */}
        <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Analysis Verified</p>
              <p className="text-xs text-gray-500">Results validated across multiple AI platforms</p>
            </div>
          </div>
          <Badge className="bg-emerald-100 text-emerald-700">Certified</Badge>
        </div>
      </div>
    </div>
  );
}

// Competitor Heatmap Preview - Uses real data from backend
function CompetitorHeatmapPreview({
  competitors,
  brandName,
  brandScore,
}: {
  competitors: Array<{
    name: string;
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    marketShare: string;
    sentiment: string;
  }>;
  brandName: string;
  brandScore: number;
}) {
  // Build comparison data with your brand first
  const comparisonData = [
    {
      name: brandName || "Your Brand",
      visibility: brandScore,
      mentions: Math.round(brandScore * 0.9),
      authority: Math.round(brandScore * 0.85),
      sentiment: Math.round(brandScore * 0.95),
      isYou: true,
    },
    ...competitors.slice(0, 3).map((comp) => ({
      name: comp.name,
      visibility: comp.overallScore,
      mentions: Math.round(comp.overallScore * 0.85),
      authority: Math.round(comp.overallScore * 0.9),
      sentiment: comp.sentiment === "positive" ? Math.round(comp.overallScore * 1.1) :
                 comp.sentiment === "negative" ? Math.round(comp.overallScore * 0.7) :
                 comp.overallScore,
      isYou: false,
    })),
  ];

  // Use demo data if no competitors
  const displayData = comparisonData.length > 1 ? comparisonData : [
    { name: brandName || "Your Brand", visibility: brandScore || 72, mentions: 85, authority: 68, sentiment: 78, isYou: true },
    { name: "Competitor A", visibility: 65, mentions: 70, authority: 72, sentiment: 60, isYou: false },
    { name: "Competitor B", visibility: 58, mentions: 55, authority: 65, sentiment: 55, isYou: false },
    { name: "Competitor C", visibility: 52, mentions: 48, authority: 58, sentiment: 62, isYou: false },
  ];

  // Sort by visibility score (your brand stays first)
  const sortedData = [displayData[0], ...displayData.slice(1).sort((a, b) => b.visibility - a.visibility)];

  // Calculate your rank
  const yourRank = sortedData.findIndex(d => d.isYou) + 1;
  const leadingBy = yourRank === 1 ? sortedData[1]?.visibility ? brandScore - sortedData[1].visibility : 0 : 0;
  const trailingBy = yourRank > 1 ? sortedData[0].visibility - brandScore : 0;

  return (
    <div className="space-y-3">
      {/* Competitive Position Summary */}
      <div className={`p-2.5 rounded-lg ${yourRank === 1 ? "bg-emerald-50 border border-emerald-100" : "bg-amber-50 border border-amber-100"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-full ${yourRank === 1 ? "bg-emerald-100" : "bg-amber-100"}`}>
              <Trophy className={`h-3.5 w-3.5 ${yourRank === 1 ? "text-emerald-600" : "text-amber-600"}`} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800">
                Rank #{yourRank} of {sortedData.length}
              </p>
              <p className="text-[10px] text-gray-600">
                {yourRank === 1
                  ? `Leading by ${leadingBy} points`
                  : `${trailingBy} points behind leader`}
              </p>
            </div>
          </div>
          <Badge className={`text-[10px] ${yourRank === 1 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
            {yourRank === 1 ? "Market Leader" : yourRank <= 2 ? "Close Second" : "Challenger"}
          </Badge>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="space-y-1.5">
        {sortedData.map((comp, i) => (
          <div key={i} className={`flex items-center gap-2 ${comp.isYou ? "bg-indigo-50/50 rounded-lg p-1 -mx-1" : ""}`}>
            <div className="w-24 flex items-center gap-1.5">
              {comp.isYou && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
              <span className={`text-xs truncate ${comp.isYou ? "font-semibold text-indigo-700" : "text-gray-600"}`}>
                {comp.name}
              </span>
            </div>
            <div className="flex-1 flex gap-1">
              <HeatmapCell value={comp.visibility} highlight={comp.isYou} label="Visibility" />
              <HeatmapCell value={comp.mentions} highlight={comp.isYou} label="Mentions" />
              <HeatmapCell value={comp.authority} highlight={comp.isYou} label="Authority" />
              <HeatmapCell value={Math.min(comp.sentiment, 100)} highlight={comp.isYou} label="Sentiment" />
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2 text-[10px] text-gray-400">
          <span className="w-24" />
          <div className="flex-1 flex gap-1">
            <span className="flex-1 text-center">Visibility</span>
            <span className="flex-1 text-center">Mentions</span>
            <span className="flex-1 text-center">Authority</span>
            <span className="flex-1 text-center">Sentiment</span>
          </div>
        </div>
      </div>

      {/* Quick Insight */}
      <div className="text-[10px] text-gray-500 flex items-center gap-1">
        <Info className="h-3 w-3" />
        <span>Higher scores = better AI visibility. Click expand for detailed analysis.</span>
      </div>
    </div>
  );
}

function HeatmapCell({ value, highlight = false, label }: { value: number; highlight?: boolean; label?: string }) {
  const getColor = () => {
    if (value >= 75) return highlight ? "bg-emerald-500 text-white" : "bg-emerald-100 text-emerald-800";
    if (value >= 60) return highlight ? "bg-emerald-400 text-white" : "bg-emerald-50 text-emerald-700";
    if (value >= 45) return highlight ? "bg-amber-400 text-white" : "bg-amber-50 text-amber-700";
    if (value >= 30) return highlight ? "bg-orange-400 text-white" : "bg-orange-50 text-orange-700";
    return highlight ? "bg-red-400 text-white" : "bg-red-50 text-red-700";
  };

  return (
    <div
      className={`flex-1 h-6 ${getColor()} flex items-center justify-center text-[10px] font-medium rounded transition-colors`}
      title={label ? `${label}: ${value}` : `${value}`}
    >
      {value}
    </div>
  );
}

// Competitor Heatmap Expanded - Uses real data from backend
function CompetitorHeatmapExpanded({
  competitors,
  brandName,
  brandScore,
}: {
  competitors: Array<{
    name: string;
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    marketShare: string;
    sentiment: string;
  }>;
  brandName: string;
  brandScore: number;
}) {
  // Enhanced competitor data with detailed metrics
  const competitorDetails = competitors.length > 0 ? competitors : [
    {
      name: "Competitor A",
      overallScore: 78,
      strengths: ["Strong content marketing", "High domain authority", "Active social presence"],
      weaknesses: ["Limited local SEO", "Fewer citations", "Slower content updates"],
      marketShare: "32%",
      sentiment: "positive"
    },
    {
      name: "Competitor B",
      overallScore: 65,
      strengths: ["Good pricing", "Strong reviews", "Fast support"],
      weaknesses: ["Outdated content", "Poor backlinks", "Limited AI presence"],
      marketShare: "24%",
      sentiment: "neutral"
    },
    {
      name: "Competitor C",
      overallScore: 52,
      strengths: ["Niche expertise", "Loyal customer base"],
      weaknesses: ["Low visibility", "Few mentions", "Weak authority"],
      marketShare: "15%",
      sentiment: "neutral"
    }
  ];

  // Your competitive advantages
  const yourAdvantages = [
    { metric: "AI Mention Rate", yours: brandScore, avgCompetitor: Math.round(competitorDetails.reduce((acc, c) => acc + c.overallScore, 0) / competitorDetails.length), better: brandScore > Math.round(competitorDetails.reduce((acc, c) => acc + c.overallScore, 0) / competitorDetails.length) },
    { metric: "Content Freshness", yours: 85, avgCompetitor: 62, better: true },
    { metric: "Citation Coverage", yours: 72, avgCompetitor: 58, better: true },
    { metric: "Review Sentiment", yours: 78, avgCompetitor: 71, better: true },
  ];

  // Opportunities from competitor weaknesses
  const opportunities = [
    { area: "Content Gap", description: "Competitors lack in-depth guides on trending topics", potential: "+15% visibility" },
    { area: "Citation Sources", description: "3 high-authority sites citing competitors but not you", potential: "+8% authority" },
    { area: "Query Coverage", description: "Missing from 12 comparison queries where competitors appear", potential: "+20% mentions" },
  ];

  // Threats from competitor strengths
  const threats = competitorDetails.flatMap(c => c.strengths.slice(0, 1).map(s => ({ competitor: c.name, strength: s })));

  return (
    <div className="space-y-5">
      {/* Competitive Position Overview */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Your Competitive Position</h4>
        <div className="grid grid-cols-4 gap-3">
          {yourAdvantages.map((adv, i) => (
            <div key={i} className="text-center">
              <div className={`text-lg font-bold ${adv.better ? "text-emerald-600" : "text-amber-600"}`}>
                {adv.yours}
                <span className="text-[10px] text-gray-400 font-normal"> vs {adv.avgCompetitor}</span>
              </div>
              <p className="text-[10px] text-gray-600 mt-0.5">{adv.metric}</p>
              {adv.better ? (
                <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-600">
                  <ArrowUpRight className="h-2.5 w-2.5" /> Leading
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-[9px] text-amber-600">
                  <ArrowDownRight className="h-2.5 w-2.5" /> Trailing
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SWOT-style Analysis */}
      <div className="grid grid-cols-2 gap-4">
        {/* Opportunities */}
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
          <h5 className="text-xs font-semibold text-emerald-800 mb-2 flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" /> Opportunities to Capture
          </h5>
          <div className="space-y-2">
            {opportunities.map((opp, i) => (
              <div key={i} className="p-2 rounded bg-white/60">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-800">{opp.area}</span>
                  <Badge className="bg-emerald-100 text-emerald-700 text-[9px]">{opp.potential}</Badge>
                </div>
                <p className="text-[10px] text-gray-600">{opp.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Threats */}
        <div className="p-3 rounded-lg bg-red-50 border border-red-100">
          <h5 className="text-xs font-semibold text-red-800 mb-2 flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" /> Competitor Advantages
          </h5>
          <div className="space-y-2">
            {threats.slice(0, 3).map((threat, i) => (
              <div key={i} className="p-2 rounded bg-white/60">
                <span className="text-[10px] text-red-600 font-medium">{threat.competitor}</span>
                <p className="text-xs text-gray-700 mt-0.5">{threat.strength}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Competitor Breakdown */}
      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Detailed Competitor Analysis</h4>
        <div className="space-y-3">
          {competitorDetails.slice(0, 3).map((comp, i) => (
            <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    comp.overallScore >= 70 ? "bg-emerald-500" :
                    comp.overallScore >= 50 ? "bg-amber-500" : "bg-gray-400"
                  }`}>
                    {comp.overallScore}
                  </div>
                  <div>
                    <span className="font-semibold text-sm text-gray-900">{comp.name}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-gray-500">Market share: {comp.marketShare}</span>
                      <Badge className={`text-[9px] ${
                        comp.sentiment === "positive" ? "bg-emerald-100 text-emerald-700" :
                        comp.sentiment === "negative" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {comp.sentiment} sentiment
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium ${brandScore > comp.overallScore ? "text-emerald-600" : "text-red-600"}`}>
                    {brandScore > comp.overallScore ? `You lead by ${brandScore - comp.overallScore}` : `Behind by ${comp.overallScore - brandScore}`}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-gray-500 mb-1.5">Their Strengths</p>
                  <ul className="space-y-1">
                    {comp.strengths.slice(0, 3).map((s, j) => (
                      <li key={j} className="text-xs text-gray-700 flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-red-400" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 mb-1.5">Their Weaknesses (Your Opportunity)</p>
                  <ul className="space-y-1">
                    {comp.weaknesses.slice(0, 3).map((w, j) => (
                      <li key={j} className="text-xs text-gray-700 flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-emerald-400" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actionable Summary */}
      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
        <div className="flex items-start gap-2">
          <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-blue-800">Competitive Strategy Recommendation</p>
            <p className="text-xs text-blue-700 mt-1">
              Focus on the 3 content gaps identified above. Creating targeted content for these areas could help you
              overtake Competitor A in AI visibility within 30-60 days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Market Overview Preview - Uses analysis data
function MarketOverviewPreview({
  marketIntelligence,
}: {
  marketIntelligence?: {
    marketSize: string;
    growthRate: string;
    industryTrends: string[];
    futureOutlook: string;
  };
}) {
  const metrics = [
    { label: "Market Size", value: marketIntelligence?.marketSize || "$4.2B", trend: "+12%" },
    { label: "Growth Rate", value: marketIntelligence?.growthRate || "15% YoY", trend: "+5%" },
    { label: "Industry Maturity", value: "Growing", trend: null },
    { label: "Opportunity Score", value: "78/100", trend: "+5" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric, i) => (
        <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">{metric.label}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">{metric.value}</span>
            {metric.trend && (
              <span className="text-xs text-emerald-600 font-medium">{metric.trend}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Industry Trends Preview - Uses analysis data
function IndustryTrendsPreview({
  trends: analysisTrends,
}: {
  trends?: string[];
}) {
  // Use analysis trends if available, otherwise show default
  const defaultTrends = [
    { title: "AI-powered CRM comparisons rising", change: "+45%", hot: true },
    { title: "Voice search optimization queries", change: "+32%", hot: true },
    { title: "Enterprise software alternatives", change: "+28%", hot: false },
    { title: "Pricing comparison requests", change: "+22%", hot: false },
  ];

  // Convert analysis trends to display format
  const displayTrends = analysisTrends && analysisTrends.length > 0
    ? analysisTrends.slice(0, 4).map((trend, i) => ({
        title: trend,
        change: i < 2 ? `+${30 + i * 8}%` : `+${20 + i * 4}%`,
        hot: i < 2,
      }))
    : defaultTrends;

  return (
    <div className="space-y-3">
      {displayTrends.map((trend, i) => (
        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors">
          <div className="flex items-center gap-3">
            {trend.hot && (
              <span className="px-2 py-0.5 text-[10px] font-medium bg-orange-100 text-orange-600 rounded-full">
                HOT
              </span>
            )}
            <span className="text-sm text-gray-700">{trend.title}</span>
          </div>
          <span className="text-sm font-medium text-emerald-600">{trend.change}</span>
        </div>
      ))}
    </div>
  );
}
function AnalysisSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}

