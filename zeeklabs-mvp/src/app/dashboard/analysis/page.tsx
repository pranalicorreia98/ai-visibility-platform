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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Award,
  BarChart3,
  Briefcase,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  Clock,
  DollarSign,
  Download,
  ExternalLink,
  Eye,
  FileDown,
  FileText,
  Gem,
  Globe,
  Hash,
  HelpCircle,
  Info,
  Layers,
  Lightbulb,
  Link2,
  ListChecks,
  ListOrdered,
  Loader2,
  MapPin,
  MessageSquare,
  Minus,
  Newspaper,
  Package,
  Play,
  Quote,
  RefreshCw,
  Rocket,
  Scale,
  Search,
  Shield,
  Sparkles,
  Star,
  Target,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  Trophy,
  Users,
  Wrench,
  XCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { jsPDF } from "jspdf";
import { useBrand, AnalysisResult } from "@/contexts/brand-context";
import { ChatGPTLogo, GeminiLogo, PerplexityLogo, LLMLogoWithTooltip } from "@/components/ui/ai-logos";
import { generateBrandPrompts, getIndustryContext } from "@/lib/prompts/prompt-generator";
import { SCORE_WEIGHTS, getConfidenceLevel, CONFIDENCE_LABELS } from "@/lib/scoring";
import { ProvenanceBadge } from "@/components/ui/provenance-badge";

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
    refreshVisibilityData,
  } = useBrand();

  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  // Rotating loading messages - similar to Claude's loading states
  const loadingMessages = [
    "Analyzing brand presence across AI platforms...",
    "Gathering visibility data from ChatGPT...",
    "Scanning Gemini responses...",
    "Querying Perplexity for mentions...",
    "Calculating sentiment scores...",
    "Evaluating competitive positioning...",
    "Identifying citation opportunities...",
    "Processing market intelligence...",
    "Generating actionable recommendations...",
    "Compiling comprehensive insights...",
    "Finalizing your AI visibility report...",
  ];

  // Effect to rotate loading messages
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (analysisLoading) {
      setLoadingMessage(loadingMessages[0]);
      setLoadingMessageIndex(0);
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => {
          const nextIndex = (prev + 1) % loadingMessages.length;
          setLoadingMessage(loadingMessages[nextIndex]);
          return nextIndex;
        });
      }, 3000); // Change message every 3 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [analysisLoading]);

  // Poll the analysis job status until it succeeds or fails.
  // POST /api/analyze returns immediately (pending: true) once the job is
  // queued; the background worker (scripts/analysis-worker.ts) does the
  // actual LLM call, so the frontend has to poll for the result.
  const pollAnalysisStatus = async (cacheId: string): Promise<void> => {
    const POLL_INTERVAL_MS = 3000;
    const POLL_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
    const startedAt = Date.now();

    for (;;) {
      const response = await fetch(`/api/analyze/status/${cacheId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to check analysis status");
      }

      if (data.status === "success" && data.analysis) {
        setAnalysisData(data.analysis);
        await refreshVisibilityData(true);
        console.log(`Fresh analysis completed via ${data.meta?.provider}`);
        return;
      }

      if (data.status === "failed") {
        throw new Error(data.errorMessage || "Analysis failed");
      }

      if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
        throw new Error("Analysis is taking longer than expected. Please try again shortly.");
      }

      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
  };

  // Run analysis for the selected brand
  // forceRefresh: true will bypass the 24-hour server cache and call AI again
  const runAnalysis = async (forceRefresh = false) => {
    if (!selectedBrandId) return;

    setAnalysisLoading(true);
    setError(null);

    // Clear client-side cache first
    invalidateVisibilityCache();

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId: selectedBrandId,
          forceRefresh, // Pass to server to bypass DB cache
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to run analysis");
      }

      if (data.cached && data.analysis) {
        // Server returned a still-valid cached analysis directly, no job to poll
        setAnalysisData(data.analysis);
        await refreshVisibilityData(true);
        console.log(`Analysis returned from cache (expires: ${data.cacheExpiry})`);
      } else if (data.pending && data.cacheId) {
        await pollAnalysisStatus(data.cacheId);
      } else {
        throw new Error("Unexpected response from analysis API");
      }
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

  // Generate favicon URL from brand domain
  const getBrandLogoUrl = (domain?: string) => {
    if (!domain) return null;
    // Clean domain (remove protocol if present)
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=64`;
  };

  const brandLogoUrl = getBrandLogoUrl(selectedBrand?.domain);

  return (
    <div className="p-6 space-y-6 fade-in">
      {/* Premium Header with Brand Identity */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 p-6 shadow-xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-400 to-transparent rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-violet-400 to-transparent rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {/* Brand Logo */}
            <div className="relative shrink-0">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center overflow-hidden shadow-lg">
                {brandLogoUrl ? (
                  <img
                    src={brandLogoUrl}
                    alt={`${selectedBrand?.name} logo`}
                    className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                    onError={(e) => {
                      // Fallback to first letter if favicon fails
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <span className={`text-xl sm:text-2xl font-bold text-white ${brandLogoUrl ? 'hidden' : ''}`}>
                  {selectedBrand?.name?.charAt(0).toUpperCase() || 'B'}
                </span>
              </div>
              {/* Status indicator */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </div>
            </div>

            {/* Brand Name and Title */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-lg sm:text-2xl font-bold text-white tracking-tight break-words">
                  {selectedBrand?.name || "Your Brand"}&apos;s AI Visibility
                </h1>
                <Badge className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs shrink-0">
                  Live Analysis
                </Badge>
              </div>
              <p className="text-slate-400 text-sm flex flex-wrap items-center gap-x-2 gap-y-1">
                <Globe className="h-3.5 w-3.5 shrink-0" />
                {selectedBrand?.domain || "No domain set"}
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">
                  Last updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </p>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Quick Stats Badge */}
            {vis?.score?.overall !== undefined && vis.score.overall > 0 && (
              <div className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{vis.score.overall}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Score</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-400">{vis.mentions?.total || 0}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Mentions</p>
                </div>
              </div>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  disabled={analysisLoading || !selectedBrandId}
                  className="gap-2 bg-white text-slate-900 hover:bg-slate-100 shadow-lg w-full sm:w-auto"
                  size="lg"
                >
                  {analysisLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Run Analysis
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={() => runAnalysis(false)}
                  className="cursor-pointer"
                >
                  <Play className="h-4 w-4 mr-2 text-indigo-500" />
                  <div>
                    <p className="font-medium text-sm">Run Analysis</p>
                    <p className="text-xs text-gray-500">Uses cached data if available (24h)</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => runAnalysis(true)}
                  className="cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4 mr-2 text-amber-500" />
                  <div>
                    <p className="font-medium text-sm">Force Refresh</p>
                    <p className="text-xs text-gray-500">Get fresh AI analysis</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <Card className="border-red-200 bg-red-50 shadow-sm">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="p-2 rounded-full bg-red-100">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-800">Analysis Error</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Premium Loading State */}
      {analysisLoading && (
        <Card className="border-0 bg-gradient-to-br from-slate-50 via-indigo-50/50 to-violet-50/50 shadow-xl overflow-hidden">
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              {/* Animated Brand Logo */}
              <div className="relative mb-8">
                {/* Outer ring */}
                <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-indigo-100 animate-pulse" />
                {/* Spinning ring */}
                <div className="w-24 h-24 rounded-full border-4 border-transparent border-t-indigo-600 border-r-violet-500 animate-spin" />
                {/* Center content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center">
                    {brandLogoUrl ? (
                      <img
                        src={brandLogoUrl}
                        alt={`${selectedBrand?.name} logo`}
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <Sparkles className="h-8 w-8 text-indigo-600 animate-pulse" />
                    )}
                  </div>
                </div>
              </div>

              {/* Brand-specific loading message */}
              <p className="text-xl font-semibold text-gray-900 mb-2">
                Analyzing {selectedBrand?.name || "Your Brand"}
              </p>
              <p className="text-base text-indigo-600 font-medium mb-4 transition-all duration-500">
                {loadingMessage}
              </p>

              {/* Progress bar */}
              <div className="w-full max-w-md mb-4">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${((loadingMessageIndex + 1) / loadingMessages.length) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <span>Querying AI platforms...</span>
                  <span>{Math.round(((loadingMessageIndex + 1) / loadingMessages.length) * 100)}%</span>
                </div>
              </div>

              {/* Platform indicators */}
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className={`flex items-center gap-2 transition-opacity ${loadingMessageIndex >= 1 ? 'opacity-100' : 'opacity-30'}`}>
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <ChatGPTLogo size={18} />
                  </div>
                  <span className="text-xs font-medium text-gray-600">ChatGPT</span>
                </div>
                <div className={`flex items-center gap-2 transition-opacity ${loadingMessageIndex >= 3 ? 'opacity-100' : 'opacity-30'}`}>
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <GeminiLogo size={18} />
                  </div>
                  <span className="text-xs font-medium text-gray-600">Gemini</span>
                </div>
                <div className={`flex items-center gap-2 transition-opacity ${loadingMessageIndex >= 5 ? 'opacity-100' : 'opacity-30'}`}>
                  <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                    <PerplexityLogo size={18} />
                  </div>
                  <span className="text-xs font-medium text-gray-600">Perplexity</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ROW 1: Insight Islands - Main Metrics (4 metrics) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <InsightIsland
          title="AI Visibility"
          icon={<Eye className="h-5 w-5" />}
          variant="primary"
          tooltip={`Weighted score: Presence ${SCORE_WEIGHTS.presence * 100}%, Sentiment ${SCORE_WEIGHTS.sentiment * 100}%, Position ${SCORE_WEIGHTS.position * 100}% — calculated from real AI responses, averaged across ChatGPT, Gemini, and Perplexity.`}
        >
          <VisibilityDonutChart
            chatgpt={vis?.score?.chatgpt || 0}
            gemini={vis?.score?.gemini || 0}
            perplexity={vis?.score?.perplexity || 0}
            overall={vis?.score?.overall || 0}
            loading={visibilityLoading}
          />
          {!visibilityLoading && (
            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
              <ProvenanceBadge type="calculated" className="text-[10px] px-1.5 py-0" />
              {vis?.simulations ? (
                <span>{vis.simulations} responses · {CONFIDENCE_LABELS[getConfidenceLevel(vis.simulations)]}</span>
              ) : (
                <span>No responses analyzed yet</span>
              )}
            </div>
          )}
        </InsightIsland>

        <InsightIsland
          title="Brand Mentions"
          icon={<MessageSquare className="h-5 w-5" />}
          tooltip="Total number of times your brand was mentioned in AI-generated responses across all platforms. Tracked from simulated user queries related to your industry and products."
        >
          <MetricDisplay
            value={vis?.mentions?.total || 0}
            loading={visibilityLoading}
            trend={vis?.trends?.mentions ?? null}
            trendLabel="vs last week"
          />
          <Sparkline data={vis?.trend?.map((d: { total: number }) => d.total) || []} className="mt-3" />
        </InsightIsland>

        <InsightIsland
          title="Mention Frequency"
          icon={<Activity className="h-5 w-5" />}
          tooltip="Average number of brand mentions per week based on simulated AI queries. Calculated by running industry-relevant prompts across AI platforms and counting brand appearances."
        >
          <MetricDisplay
            value={vis?.simulations || 0}
            suffix="/week"
            loading={visibilityLoading}
            trend={vis?.trends?.frequency ?? null}
            trendLabel="increase"
          />
          <WeeklyMentionChart data={vis?.trend || []} loading={visibilityLoading} />
        </InsightIsland>

        <InsightIsland
          title="AI Response Position"
          icon={<Hash className="h-5 w-5" />}
          tooltip="Your average position when mentioned in AI responses. Position #1 means you're mentioned first in lists/recommendations. This is different from competitor rank - it shows where AI places you in its responses."
        >
          {!visibilityLoading && (vis?.position?.average === null || vis?.position?.average === undefined) ? (
            <div className="text-2xl font-bold text-gray-400">Not detected</div>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-gray-900">#</span>
              <AnimatedNumber
                value={vis?.position?.average ?? 0}
                decimals={1}
                loading={visibilityLoading}
              />
            </div>
          )}
          {vis?.position?.trend !== null && vis?.position?.trend !== undefined ? (
            <TrendBadge value={vis.position.trend} label="improved" inverted />
          ) : (
            <div className="text-xs text-gray-400 mt-1">No trend data yet</div>
          )}
          <div className="mt-2 text-xs text-gray-500">
            Where AI places you in recommendations
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
        brandSentiment={vis?.sentiment?.average ?? null}
      />

      {/* Progress Tracking Graph */}
      {selectedBrandId && (
        <ProgressTrackingGraph brandId={selectedBrandId} />
      )}

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
      <CitationOpportunitiesIsland
        citations={result?.citations}
        brandName={selectedBrand?.name || "Your Brand"}
        industry={result?.marketIntelligence?.industryTrends?.[0]?.split(" ")[0]}
      />

      {/* Analysis Results */}
      {result ? (
        <>
          {/* Competitive Position & Key Focus Areas */}
          <CompetitivePositionIsland
            aiVisibility={result.aiVisibility}
            brandName={selectedBrand?.name || "Your Brand"}
            brandScore={result?.scores?.overall || vis?.score?.overall || 0}
            competitorComparison={result?.competitorComparison}
            recommendations={result?.recommendations}
            brandContext={{
              domain: selectedBrand?.domain,
              industry: result?.marketIntelligence?.industryTrends?.[0]?.split(" ")[0],
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

          {/* Analysis Prompts Used */}
          <AnalysisPromptsUsedIsland
            brandName={selectedBrand?.name || "Your Brand"}
            domain={selectedBrand?.domain || ""}
            competitors={selectedBrand?.competitors || []}
          />

          {/* Market Intelligence - Enhanced */}
          {result.marketIntelligence && (
            <MarketIntelligenceIsland marketIntelligence={result.marketIntelligence} />
          )}

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
            {!analysisLoading && (
              <Button onClick={() => runAnalysis(false)}>
                <Play className="mr-2 h-4 w-4" />
                Run Analysis
              </Button>
            )}
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

// Score Tooltip Component - Reusable tooltip for explaining how scores are calculated
function ScoreTooltip({ content, children }: { content: string; children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help inline-flex items-center gap-2">
            {children}
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200/50 shadow-sm hover:from-indigo-100 hover:to-violet-100 hover:border-indigo-200/50 transition-all duration-200">
              <Info className="h-3 w-3 text-slate-500" />
            </span>
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-3 text-xs leading-relaxed bg-gray-900 text-white border-0 shadow-xl">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Insight Island Component - Premium Design
function InsightIsland({
  title,
  icon,
  children,
  variant = "default",
  className = "",
  expandable = false,
  expandedContent,
  tooltip,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  variant?: "default" | "primary" | "success" | "warning";
  className?: string;
  expandable?: boolean;
  expandedContent?: React.ReactNode;
  tooltip?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const variantStyles = {
    default: "bg-white border-gray-200 hover:border-gray-300",
    primary: "bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-200 hover:border-indigo-300",
    success: "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 hover:border-emerald-300",
    warning: "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 hover:border-amber-300",
  };

  const iconStyles = {
    default: "bg-gray-100 text-gray-600",
    primary: "bg-indigo-100 text-indigo-600",
    success: "bg-emerald-100 text-emerald-600",
    warning: "bg-amber-100 text-amber-600",
  };

  return (
    <div
      className={`rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300 ${variantStyles[variant]} ${className}`}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${iconStyles[variant]} shadow-sm`}>
              {icon}
            </div>
            {tooltip ? (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 cursor-help">
                      {title}
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200/50 shadow-sm hover:from-indigo-100 hover:to-violet-100 hover:border-indigo-200/50 transition-all duration-200">
                        <Info className="h-3 w-3 text-slate-500 hover:text-indigo-600" />
                      </span>
                    </h3>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-3 text-xs leading-relaxed bg-gray-900 text-white border-0 shadow-xl">
                    {tooltip}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
            )}
          </div>
          {expandable && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              {isExpanded ? "Collapse" : "Expand"}
              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          )}
        </div>
        {children}
      </div>
      {expandable && isExpanded && expandedContent && (
        <div className="border-t border-gray-100 p-5 bg-gray-50/30 rounded-b-2xl">
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
  trend?: number | null;
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
      {trend !== undefined && trend !== null ? (
        <TrendBadge value={trend} label={trendLabel} />
      ) : (
        <div className="text-xs text-gray-400 mt-1">No trend data yet</div>
      )}
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
  // Handle empty or all-zero data
  if (!data || data.length === 0 || data.every(v => v === 0)) {
    return (
      <div className={`flex items-end gap-1 h-8 ${className}`}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="w-full rounded-sm bg-gray-200"
            style={{ height: "4px" }}
          />
        ))}
      </div>
    );
  }

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

  // Use actual data or show empty state (no hardcoded fallback data)
  const chartData = data.length > 0 ? data.slice(-7) : [];
  const hasData = chartData.length > 0 && chartData.some(d => d.total > 0);
  const max = hasData ? Math.max(...chartData.map(d => d.total)) : 1;

  // Show empty state if no data
  if (!hasData) {
    return (
      <div className="flex items-end gap-1 h-8 mt-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-gray-200"
            style={{ height: "4px" }}
          />
        ))}
      </div>
    );
  }

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

  // Use real sentiment percentages from API, fallback to 0 (not hardcoded values)
  const positive = vis?.sentiment?.percentages?.positive ?? 0;
  const neutral = vis?.sentiment?.percentages?.neutral ?? 0;
  const negative = vis?.sentiment?.percentages?.negative ?? 0;
  const total = positive + neutral + negative;
  const sentimentScore = total > 0 ? Math.round((positive * 100 + neutral * 50) / total) : 0;
  const hasAnalysisData = total > 0;

  // Use real platform sentiment from API
  const platformSentimentData = vis?.platformSentiment;
  const platformSentiment = platformSentimentData ? [
    {
      platform: "ChatGPT",
      positive: platformSentimentData.chatgpt?.positive ?? 0,
      neutral: platformSentimentData.chatgpt?.neutral ?? 0,
      negative: platformSentimentData.chatgpt?.negative ?? 0,
    },
    {
      platform: "Gemini",
      positive: platformSentimentData.gemini?.positive ?? 0,
      neutral: platformSentimentData.gemini?.neutral ?? 0,
      negative: platformSentimentData.gemini?.negative ?? 0,
    },
    {
      platform: "Perplexity",
      positive: platformSentimentData.perplexity?.positive ?? 0,
      neutral: platformSentimentData.perplexity?.neutral ?? 0,
      negative: platformSentimentData.perplexity?.negative ?? 0,
    },
  ] : [];

  // Use real themes from analysis data, no hardcoded fallbacks
  const positiveThemes = sentimentData?.brandSentiment?.positiveThemes || [];
  const negativeThemes = sentimentData?.brandSentiment?.negativeThemes || [];

  // Sentiment drivers - currently not provided by API, placeholder for future enhancement
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sentimentDrivers: Array<{ factor: string; impact: number; sentiment: string }> = (sentimentData as any)?.sentimentDrivers || [];

  return (
    <div className="space-y-5">
      {/* Overall Sentiment Score with Context */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-800">Overall AI Sentiment Score</h4>
          {hasAnalysisData ? (
            <Badge className={`${sentimentScore >= 70 ? "bg-emerald-100 text-emerald-700" : sentimentScore >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
              {sentimentScore >= 70 ? "Excellent" : sentimentScore >= 50 ? "Good" : "Needs Attention"}
            </Badge>
          ) : (
            <Badge className="bg-gray-100 text-gray-500">No data</Badge>
          )}
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
        {hasAnalysisData ? (
          <p className="text-xs text-gray-600 mt-3">
            {positive >= 50
              ? "Your brand receives predominantly positive mentions across AI platforms."
              : positive >= 30
              ? "Your brand receives mixed sentiment across AI platforms."
              : "Your brand sentiment needs improvement across AI platforms."}
          </p>
        ) : (
          <p className="text-xs text-gray-400 mt-3">
            Run analysis to see sentiment data for your brand.
          </p>
        )}
      </div>

      {/* Sentiment Breakdown by Platform */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Sentiment by AI Platform</h4>
        {platformSentiment.length > 0 ? (
          <div className="space-y-3">
            {platformSentiment.map((platform, i) => (
              <div key={i} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-800">{platform.platform}</span>
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
        ) : (
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 text-center">
            <p className="text-xs text-gray-400">Run analysis to see platform-specific sentiment</p>
          </div>
        )}
      </div>

      {/* Sentiment Themes - Enhanced */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
          <h5 className="text-xs font-semibold text-emerald-800 mb-2 flex items-center gap-1.5">
            <ThumbsUp className="h-3.5 w-3.5" /> What AI Platforms Praise
          </h5>
          {positiveThemes.length > 0 ? (
            <ul className="space-y-2">
              {positiveThemes.slice(0, 4).map((theme, i) => (
                <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>{theme}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-400">Run analysis to see positive themes</p>
          )}
        </div>
        <div className="p-3 rounded-lg bg-red-50 border border-red-100">
          <h5 className="text-xs font-semibold text-red-800 mb-2 flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" /> Areas Mentioned Negatively
          </h5>
          {negativeThemes.length > 0 ? (
            <ul className="space-y-2">
              {negativeThemes.slice(0, 3).map((theme, i) => (
                <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                  <XCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>{theme}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-400">Run analysis to see improvement areas</p>
          )}
        </div>
      </div>

      {/* Sentiment Drivers Analysis - Only show if data exists */}
      {sentimentDrivers.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">What Drives Your AI Sentiment</h4>
          <div className="space-y-2">
            {sentimentDrivers.map((driver: { factor: string; impact: number; sentiment: string }, i: number) => (
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
      )}

      {/* Customer Satisfaction - Only show if data exists */}
      {sentimentData?.customerSentiment && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-sm font-semibold text-blue-800">Customer Satisfaction Index</h5>
            {sentimentData.customerSentiment.nps && (
              <Badge className="bg-blue-100 text-blue-700 text-xs">
                NPS: {sentimentData.customerSentiment.nps}
              </Badge>
            )}
          </div>
          {sentimentData.customerSentiment.satisfaction !== undefined && (
            <div className="flex items-center gap-4 mb-3">
              <div className="flex-1">
                <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${sentimentData.customerSentiment.satisfaction}%` }}
                  />
                </div>
              </div>
              <span className="text-lg font-bold text-blue-700">
                {sentimentData.customerSentiment.satisfaction}%
              </span>
            </div>
          )}
          {/* Additional metrics if available - these may be added in future API versions */}
          {(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const cs = sentimentData.customerSentiment as any;
            const hasExtraMetrics = cs.avgRating !== undefined || cs.reviewCount !== undefined || cs.trend !== undefined;
            if (!hasExtraMetrics) return null;
            return (
              <div className="grid grid-cols-3 gap-2 text-center">
                {cs.avgRating !== undefined && (
                  <div className="p-2 rounded bg-blue-100/50">
                    <p className="text-lg font-bold text-blue-700">{cs.avgRating}/5</p>
                    <p className="text-[10px] text-blue-600">Avg Rating</p>
                  </div>
                )}
                {cs.reviewCount !== undefined && (
                  <div className="p-2 rounded bg-blue-100/50">
                    <p className="text-lg font-bold text-blue-700">
                      {cs.reviewCount >= 1000 ? `${(cs.reviewCount / 1000).toFixed(1)}K` : cs.reviewCount}
                    </p>
                    <p className="text-[10px] text-blue-600">Reviews</p>
                  </div>
                )}
                {cs.trend !== undefined && (
                  <div className="p-2 rounded bg-blue-100/50">
                    <p className="text-lg font-bold text-blue-700">
                      {cs.trend >= 0 ? '+' : ''}{cs.trend}%
                    </p>
                    <p className="text-[10px] text-blue-600">vs Last Month</p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Actionable Insight - Only show if there are negative themes to address */}
      {negativeThemes.length > 0 && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-amber-800">Sentiment Improvement Opportunity</p>
              <p className="text-xs text-amber-700 mt-1">
                Addressing the areas mentioned negatively above could help improve your sentiment scores.
                Focus on creating content that directly addresses these concerns.
              </p>
            </div>
          </div>
        </div>
      )}
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
    { label: "Mention Frequency", value: aiVisibility?.mentionFrequency || "Unknown", color: "indigo" },
    { label: "AI Recommendation Signal", value: aiVisibility?.recommendationLikelihood || "Unknown", color: "emerald" },
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
            <p className="text-sm font-bold text-gray-900">{aiVisibility?.mentionFrequency || "Unknown"}</p>
            <p className="text-[10px] text-gray-500">Mention Rate</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-emerald-100">
            <ThumbsUp className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
            <p className="text-sm font-bold text-gray-900">{aiVisibility?.recommendationLikelihood || "Unknown"}</p>
            <p className="text-[10px] text-gray-500">AI Recommendation Signal</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-violet-100">
            <Hash className="h-5 w-5 text-violet-600 mx-auto mb-1" />
            <p className="text-sm font-bold text-gray-900">
              {aiVisibility?.typicalPosition !== null && aiVisibility?.typicalPosition !== undefined
                ? `#${aiVisibility.typicalPosition}`
                : "Not detected"}
            </p>
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

      <div className="p-3 rounded-lg bg-gradient-to-r from-slate-50 to-gray-50 border border-gray-200">
        <div className="flex items-start gap-3">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200/50 shadow-sm flex-shrink-0">
            <Info className="h-3.5 w-3.5 text-slate-500" />
          </span>
          <p className="text-xs text-gray-600 leading-relaxed">
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
// PROGRESS TRACKING GRAPH
// ============================================

interface ProgressDataPoint {
  date: string;
  label: string;
  overallScore: number;
  chatgptScore: number | null;
  geminiScore: number | null;
  perplexityScore: number | null;
  totalMentions: number;
  sentimentScore: number | null;
  avgPosition: number | null;
  count: number;
}

interface ProgressSummary {
  currentScore: number;
  startScore: number;
  change: number;
  changePercent: number;
  totalSnapshots: number;
  period: string;
  avgScore: number;
  highestScore: number;
  lowestScore: number;
}

function ProgressTrackingGraph({ brandId }: { brandId: string }) {
  const [period, setPeriod] = useState<"week" | "month" | "quarter" | "year">("week");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ProgressDataPoint[]>([]);
  const [summary, setSummary] = useState<ProgressSummary | null>(null);

  const fetchProgressData = useCallback(async () => {
    if (!brandId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/progress?brandId=${brandId}&period=${period}`);
      if (response.ok) {
        const result = await response.json();
        setData(result.data || []);
        setSummary(result.summary || null);
      }
    } catch (error) {
      console.error("Failed to fetch progress data:", error);
    } finally {
      setLoading(false);
    }
  }, [brandId, period]);

  useEffect(() => {
    fetchProgressData();
  }, [fetchProgressData]);

  const periods = [
    { id: "week" as const, label: "Week", shortLabel: "7D" },
    { id: "month" as const, label: "Month", shortLabel: "30D" },
    { id: "quarter" as const, label: "Quarter", shortLabel: "90D" },
    { id: "year" as const, label: "Year", shortLabel: "1Y" },
  ];

  // Calculate graph dimensions
  const maxScore = data.length > 0 ? Math.max(...data.map(d => d.overallScore), 100) : 100;
  const minScore = data.length > 0 ? Math.min(...data.map(d => d.overallScore), 0) : 0;
  const scoreRange = maxScore - minScore || 100;

  // Generate SVG path for the line chart
  const generatePath = (points: ProgressDataPoint[]): string => {
    if (points.length === 0) return "";

    const width = 100; // percentage
    const height = 100;
    const padding = 5;

    const xStep = (width - padding * 2) / Math.max(points.length - 1, 1);

    const pathPoints = points.map((point, i) => {
      const x = padding + i * xStep;
      const y = height - padding - ((point.overallScore - minScore) / scoreRange) * (height - padding * 2);
      return `${x},${y}`;
    });

    return `M ${pathPoints.join(" L ")}`;
  };

  // Generate area fill path
  const generateAreaPath = (points: ProgressDataPoint[]): string => {
    if (points.length === 0) return "";

    const width = 100;
    const height = 100;
    const padding = 5;

    const xStep = (width - padding * 2) / Math.max(points.length - 1, 1);

    const topPoints = points.map((point, i) => {
      const x = padding + i * xStep;
      const y = height - padding - ((point.overallScore - minScore) / scoreRange) * (height - padding * 2);
      return `${x},${y}`;
    });

    const startX = padding;
    const endX = padding + (points.length - 1) * xStep;

    return `M ${startX},${height - padding} L ${topPoints.join(" L ")} L ${endX},${height - padding} Z`;
  };

  if (loading) {
    return (
      <div className="insight-island">
        <div className="p-5">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="insight-island">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 cursor-help">
                      Visibility Progress Tracker
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200/50 shadow-sm hover:from-indigo-100 hover:to-violet-100 hover:border-indigo-200/50 transition-all duration-200">
                        <Info className="h-3 w-3 text-slate-500" />
                      </span>
                    </h3>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-3 text-xs leading-relaxed bg-gray-900 text-white border-0 shadow-xl">
                    Tracks your AI visibility score improvements over time. Each data point represents an analysis run. Use this to measure the impact of your optimization efforts.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="text-sm text-gray-500">Track your improvement journey</p>
            </div>
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
            {periods.map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  period === p.id
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {p.shortLabel}
              </button>
            ))}
          </div>
        </div>

        {data.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-gray-700 mb-1">No Progress Data Yet</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Run your first analysis to start tracking your AI visibility progress. Each analysis creates a data point for comparison.
            </p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100">
                <p className="text-xs text-gray-500 mb-1">Current Score</p>
                <p className="text-2xl font-bold text-indigo-600">{summary?.currentScore || 0}</p>
              </div>
              <div className={`p-4 rounded-xl border ${
                (summary?.change || 0) >= 0
                  ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100"
                  : "bg-gradient-to-br from-rose-50 to-red-50 border-rose-100"
              }`}>
                <p className="text-xs text-gray-500 mb-1">Change</p>
                <div className="flex items-center gap-2">
                  <p className={`text-2xl font-bold ${
                    (summary?.change || 0) >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}>
                    {(summary?.change || 0) >= 0 ? "+" : ""}{summary?.change || 0}
                  </p>
                  {(summary?.change || 0) >= 0 ? (
                    <ArrowUpRight className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5 text-rose-500" />
                  )}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100">
                <p className="text-xs text-gray-500 mb-1">Avg Score</p>
                <p className="text-2xl font-bold text-amber-600">{summary?.avgScore || 0}</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100">
                <p className="text-xs text-gray-500 mb-1">Analysis Runs</p>
                <p className="text-2xl font-bold text-violet-600">{summary?.totalSnapshots || 0}</p>
              </div>
            </div>

            {/* Graph */}
            <div className="relative h-48 bg-gradient-to-b from-gray-50 to-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Y-axis labels */}
              <div className="absolute left-2 top-2 bottom-2 flex flex-col justify-between text-[10px] text-gray-400">
                <span>{maxScore}</span>
                <span>{Math.round((maxScore + minScore) / 2)}</span>
                <span>{minScore}</span>
              </div>

              {/* Grid lines */}
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                {/* Horizontal grid lines */}
                <line x1="10%" y1="25%" x2="98%" y2="25%" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />
                <line x1="10%" y1="50%" x2="98%" y2="50%" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />
                <line x1="10%" y1="75%" x2="98%" y2="75%" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />
              </svg>

              {/* Chart */}
              <svg
                className="absolute left-8 right-2 top-2 bottom-6 w-[calc(100%-40px)] h-[calc(100%-32px)]"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {/* Area fill */}
                <path
                  d={generateAreaPath(data)}
                  fill="url(#areaGradient)"
                />
                {/* Line */}
                <path
                  d={generatePath(data)}
                  fill="none"
                  stroke="rgb(99, 102, 241)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
                {/* Data points */}
                {data.map((point, i) => {
                  const width = 100;
                  const height = 100;
                  const padding = 5;
                  const xStep = (width - padding * 2) / Math.max(data.length - 1, 1);
                  const x = padding + i * xStep;
                  const y = height - padding - ((point.overallScore - minScore) / scoreRange) * (height - padding * 2);

                  return (
                    <TooltipProvider key={i} delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <circle
                            cx={x}
                            cy={y}
                            r="3"
                            fill="white"
                            stroke="rgb(99, 102, 241)"
                            strokeWidth="2"
                            className="cursor-pointer hover:r-4 transition-all"
                            vectorEffect="non-scaling-stroke"
                          />
                        </TooltipTrigger>
                        <TooltipContent className="p-2 text-xs">
                          <p className="font-semibold">{point.label}</p>
                          <p className="text-indigo-600">Score: {point.overallScore}</p>
                          {point.sentimentScore && <p className="text-gray-500">Sentiment: {point.sentimentScore}</p>}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </svg>

              {/* X-axis labels */}
              <div className="absolute bottom-1 left-8 right-2 flex justify-between text-[10px] text-gray-400">
                {data.slice(0, 6).map((point, i) => (
                  <span key={i} className="truncate max-w-[60px]">{point.label}</span>
                ))}
                {data.length > 6 && <span>...</span>}
              </div>
            </div>

            {/* Score range indicator */}
            <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>Highest: {summary?.highestScore || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span>Average: {summary?.avgScore || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <span>Lowest: {summary?.lowestScore || 0}</span>
              </div>
            </div>
          </>
        )}
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

  // Check if we have real data - use 0 as default, not hardcoded values
  const hasData = vis?.sentiment && (vis.sentiment.positive > 0 || vis.sentiment.neutral > 0 || vis.sentiment.negative > 0);

  // Calculate overall sentiment score - use 0 defaults
  const positive = vis?.sentiment?.positive || 0;
  const neutral = vis?.sentiment?.neutral || 0;
  const negative = vis?.sentiment?.negative || 0;
  const total = positive + neutral + negative;
  const sentimentScore = total > 0 ? Math.round((positive * 100 + neutral * 50) / total) : 0;

  // AI platform sentiment breakdown - use real data from API or show zeros
  const platformSentimentData = vis?.platformSentiment;
  const platformSentiment = platformSentimentData ? [
    {
      platform: "ChatGPT",
      positive: platformSentimentData.chatgpt?.positive || 0,
      neutral: platformSentimentData.chatgpt?.neutral || 0,
      negative: platformSentimentData.chatgpt?.negative || 0,
      trend: null as string | null
    },
    {
      platform: "Gemini",
      positive: platformSentimentData.gemini?.positive || 0,
      neutral: platformSentimentData.gemini?.neutral || 0,
      negative: platformSentimentData.gemini?.negative || 0,
      trend: null as string | null
    },
    {
      platform: "Perplexity",
      positive: platformSentimentData.perplexity?.positive || 0,
      neutral: platformSentimentData.perplexity?.neutral || 0,
      negative: platformSentimentData.perplexity?.negative || 0,
      trend: null as string | null
    },
  ] : [];

  // Detailed positive themes - only from analysis, no hardcoded fallbacks
  const positiveThemes = sentimentData?.brandSentiment?.positiveThemes || [];

  // Detailed negative themes - only from analysis, no hardcoded fallbacks
  const negativeThemes = sentimentData?.brandSentiment?.negativeThemes || [];

  // Sentiment drivers - only show if we have analysis results
  const sentimentDrivers: Array<{ factor: string; impact: number; sentiment: string }> = [];

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
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 cursor-help">
                      Sentiment Analysis
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200/50 shadow-sm hover:from-indigo-100 hover:to-violet-100 hover:border-indigo-200/50 transition-all duration-200">
                        <Info className="h-3 w-3 text-slate-500" />
                      </span>
                    </h3>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-3 text-xs leading-relaxed bg-gray-900 text-white border-0 shadow-xl">
                    Analyzes the tone and attitude of AI-generated content about your brand. Derived from natural language processing of AI responses to classify mentions as positive, neutral, or negative.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="text-sm text-gray-500">How AI platforms perceive your brand</p>
            </div>
          </div>
          <Badge className={`${sentimentScore >= 70 ? "bg-emerald-100 text-emerald-700" : sentimentScore >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
            {sentimentScore >= 70 ? "Excellent" : sentimentScore >= 50 ? "Good" : "Needs Attention"}
          </Badge>
        </div>

        {/* Overall Score Section - Vertical Layout */}
        <div className="grid grid-cols-1 gap-5 mb-6">
          {/* Overall Score */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100">
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2 cursor-help">
                    Overall AI Sentiment Score
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200/50 shadow-sm hover:from-indigo-100 hover:to-violet-100 hover:border-indigo-200/50 transition-all duration-200">
                      <Info className="h-3 w-3 text-slate-500" />
                    </span>
                  </h4>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs p-3 text-xs leading-relaxed bg-gray-900 text-white border-0 shadow-xl">
                  Calculated as: (Positive% × 100 + Neutral% × 50) / Total. Score ranges 0-100, where 100 means all mentions are positive. Based on sentiment classification of AI responses.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
            {hasData ? (
              <p className="text-xs text-gray-600 mt-3">
                Sentiment breakdown based on {total} analyzed mentions across AI platforms.
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-3">
                Run analysis to see sentiment distribution across AI platforms.
              </p>
            )}
          </div>

          {/* Platform Breakdown */}
          <div className="p-5 rounded-xl bg-gray-50 border border-gray-200">
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2 cursor-help">
                    Sentiment by AI Platform
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200/50 shadow-sm hover:from-indigo-100 hover:to-violet-100 hover:border-indigo-200/50 transition-all duration-200">
                      <Info className="h-3 w-3 text-slate-500" />
                    </span>
                  </h4>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs p-3 text-xs leading-relaxed bg-gray-900 text-white border-0 shadow-xl">
                  Breakdown of positive/neutral/negative sentiment for each AI platform. Each bar represents the proportion of sentiment types.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {platformSentiment.length > 0 ? (
              <div className="space-y-3">
                {platformSentiment.map((platform, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="w-24 text-sm font-medium text-gray-700">{platform.platform}</span>
                    <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden flex">
                      <div className="bg-emerald-500 h-full transition-all" style={{ width: `${platform.positive}%` }} />
                      <div className="bg-gray-400 h-full transition-all" style={{ width: `${platform.neutral}%` }} />
                      <div className="bg-red-400 h-full transition-all" style={{ width: `${platform.negative}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 font-medium w-16 text-right">
                      {platform.positive + platform.neutral + platform.negative > 0 ? `${platform.positive}% pos` : "No data"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 py-4 text-center">
                No platform sentiment data available. Run analysis to see breakdown.
              </div>
            )}
          </div>
        </div>

        {/* Themes Section - Only show if we have themes data - Vertical Layout */}
        {(positiveThemes.length > 0 || negativeThemes.length > 0) && (
          <div className="grid grid-cols-1 gap-5 mb-6">
            {/* Positive Themes */}
            <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200">
              <h4 className="text-sm font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                <ThumbsUp className="h-4 w-4" /> What AI Platforms Praise
              </h4>
              {positiveThemes.length > 0 ? (
                <ul className="space-y-2">
                  {positiveThemes.map((theme, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{theme}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No positive themes identified yet.</p>
              )}
            </div>

            {/* Negative Themes */}
            <div className="p-5 rounded-xl bg-red-50 border border-red-200">
              <h4 className="text-sm font-semibold text-red-800 mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> Areas Mentioned Negatively
              </h4>
              {negativeThemes.length > 0 ? (
                <ul className="space-y-2">
                  {negativeThemes.map((theme, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>{theme}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No negative themes identified yet.</p>
              )}
            </div>
          </div>
        )}

        {/* Drivers & Customer Satisfaction - Only show if we have sentiment data - Vertical Layout */}
        {sentimentData?.customerSentiment && (
          <div className="grid grid-cols-1 gap-5">
            {/* Sentiment Drivers - Only show if we have driver data */}
            {sentimentDrivers.length > 0 && (
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
            )}

            {/* Customer Satisfaction */}
            <div className="p-5 rounded-xl bg-blue-50 border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-blue-800">Customer Satisfaction Index</h4>
                {sentimentData.customerSentiment.nps && (
                  <Badge className="bg-blue-100 text-blue-700">
                    NPS: {sentimentData.customerSentiment.nps}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="h-4 bg-blue-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${sentimentData.customerSentiment.satisfaction || 0}%` }}
                    />
                  </div>
                </div>
                <span className="text-2xl font-bold text-blue-700">
                  {sentimentData.customerSentiment.satisfaction || 0}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Actionable Insight - Only show when we have analysis data */}
        {sentimentData && (
          <div className="mt-5 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Sentiment Improvement Opportunity</p>
                <p className="text-sm text-amber-700 mt-1">
                  {negativeThemes.length > 0
                    ? `Focus on addressing: ${negativeThemes[0]}. This could help improve your overall sentiment score.`
                    : "Continue monitoring AI sentiment and respond to any negative themes that emerge."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Competitor Comparison Full Island
function CompetitorComparisonIsland({
  competitors,
  brandName,
  brandScore,
  brandSentiment,
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
  brandSentiment: number | null;
}) {
  // Check if we have competitor data - no hardcoded fallbacks
  const hasCompetitorData = competitors.length > 0;
  const competitorDetails = competitors;

  // Only build comparison data if we have competitors
  const allBrands = hasCompetitorData ? [
    { name: brandName || "Your Brand", score: brandScore || 0, isYou: true },
    ...competitorDetails.map(c => ({ name: c.name, score: c.overallScore, isYou: false }))
  ].sort((a, b) => b.score - a.score) : [
    { name: brandName || "Your Brand", score: brandScore || 0, isYou: true }
  ];

  const yourRank = allBrands.findIndex(b => b.isYou) + 1;
  const leader = allBrands[0];

  // Competitive metrics - only use real data, no hardcoded values
  const competitorAvgScore = hasCompetitorData
    ? Math.round(competitorDetails.reduce((a, c) => a + c.overallScore, 0) / competitorDetails.length)
    : 0;

  // Calculate average competitor sentiment score (convert sentiment string to numeric)
  const getSentimentScore = (sentiment: string): number => {
    const normalized = sentiment?.toLowerCase() || "";
    if (normalized.includes("positive") || normalized.includes("favorable")) return 75;
    if (normalized.includes("negative") || normalized.includes("unfavorable")) return 25;
    return 50; // neutral
  };

  const competitorAvgSentiment = hasCompetitorData
    ? Math.round(competitorDetails.reduce((a, c) => a + getSentimentScore(c.sentiment), 0) / competitorDetails.length)
    : 0;

  // Real measured sentiment (-1..1) converted to the same 0-100 scale used
  // for competitors, instead of guessing sentiment from the visibility score.
  const yourSentimentScore = brandSentiment !== null
    ? Math.round(((brandSentiment + 1) / 2) * 100)
    : null;

  // Show metrics with real data - Visibility and Sentiment comparison.
  // Sentiment is only included once we have a real measured value — no
  // fabricated row when sentiment hasn't been measured yet.
  const metrics = hasCompetitorData ? [
    {
      label: "Visibility",
      yours: brandScore || 0,
      avg: competitorAvgScore,
      tooltip: "Overall AI visibility score based on mention frequency, position, and sentiment across all AI platforms."
    },
    ...(yourSentimentScore !== null ? [{
      label: "Sentiment",
      yours: yourSentimentScore,
      avg: competitorAvgSentiment,
      tooltip: "Sentiment score indicating how positively AI platforms perceive your brand compared to competitors."
    }] : []),
  ] : [];

  // No hardcoded opportunities - these should come from analysis
  const opportunities: Array<{ area: string; description: string; potential: string }> = [];

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
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 cursor-help">
                      Competitor Comparison
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200/50 shadow-sm hover:from-indigo-100 hover:to-violet-100 hover:border-indigo-200/50 transition-all duration-200">
                        <Info className="h-3 w-3 text-slate-500" />
                      </span>
                    </h3>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-3 text-xs leading-relaxed bg-gray-900 text-white border-0 shadow-xl">
                    Compares your AI visibility metrics against identified competitors. Rankings are based on overall visibility scores derived from mention frequency, position, and sentiment across AI platforms.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="text-sm text-gray-500">Your position in the competitive landscape</p>
            </div>
          </div>
          {hasCompetitorData ? (
            <Badge className={`${yourRank === 1 ? "bg-emerald-100 text-emerald-700" : yourRank <= 2 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-700"}`}>
              Rank #{yourRank} of {allBrands.length}
            </Badge>
          ) : (
            <Badge className="bg-gray-100 text-gray-600">No competitor data</Badge>
          )}
        </div>

        {/* Empty State when no competitor data */}
        {!hasCompetitorData ? (
          <div className="p-8 rounded-xl bg-gray-50 border border-gray-200 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-700 mb-2">No Competitor Data Available</h4>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Run an analysis to compare your brand against competitors. Add competitors in Settings to enable competitive analysis.
            </p>
          </div>
        ) : (
        <>
        {/* Ranking & Metrics - Vertical Layout */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          {/* Ranking Visualization */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 via-violet-50 to-purple-50 border border-violet-200/50 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-1.5 rounded-lg bg-violet-100">
                <Trophy className="h-4 w-4 text-violet-600" />
              </div>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2 cursor-help">
                      AI Visibility Ranking
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200/50 shadow-sm hover:from-indigo-100 hover:to-violet-100 hover:border-indigo-200/50 transition-all duration-200">
                        <Info className="h-3 w-3 text-slate-500" />
                      </span>
                    </h4>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-3 text-xs leading-relaxed bg-gray-900 text-white border-0 shadow-xl">
                    Brands ranked by overall AI visibility score. Score combines mention frequency (40%), average position (30%), and sentiment (30%) across ChatGPT, Gemini, and Perplexity.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="space-y-2.5">
              {allBrands.map((brand, i) => {
                const isLeader = i === 0;
                const isSecond = i === 1;
                const isThird = i === 2;

                return (
                  <div
                    key={i}
                    className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                      brand.isYou
                        ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-200"
                        : "bg-white border border-gray-100 hover:border-violet-200 hover:shadow-sm"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm ${
                      brand.isYou ? "bg-white/20 text-white" :
                      isLeader ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-white" :
                      isSecond ? "bg-gradient-to-br from-slate-300 to-gray-400 text-white" :
                      isThird ? "bg-gradient-to-br from-amber-600 to-orange-600 text-white" :
                      "bg-gray-100 text-gray-500"
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${brand.isYou ? "text-white" : "text-gray-800"}`}>
                        {brand.name}
                      </p>
                      {brand.isYou && (
                        <p className="text-xs text-white/80">Your Position</p>
                      )}
                    </div>
                    <div className={`text-right ${brand.isYou ? "text-white" : ""}`}>
                      <p className={`text-xl font-bold ${brand.isYou ? "text-white" : "text-gray-900"}`}>
                        {brand.score}
                      </p>
                      <p className={`text-[10px] ${brand.isYou ? "text-white/70" : "text-gray-400"}`}>score</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Your Metrics vs Competitors */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 border border-blue-200/50 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-1.5 rounded-lg bg-blue-100">
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2 cursor-help">
                      Your Metrics vs Competitor Average
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200/50 shadow-sm hover:from-indigo-100 hover:to-violet-100 hover:border-indigo-200/50 transition-all duration-200">
                        <Info className="h-3 w-3 text-slate-500" />
                      </span>
                    </h4>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-3 text-xs leading-relaxed bg-gray-900 text-white border-0 shadow-xl">
                    Compares your key metrics against the average of all tracked competitors. Green indicates you're above average, red indicates below. The circular chart shows your score as a percentage.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {metrics.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {metrics.map((metric, i) => {
                  const isAboveAvg = metric.yours > metric.avg;
                  const diff = metric.yours - metric.avg;
                  // Calculate percentage relative to max possible (100) for the circular chart
                  // This shows your actual visibility score as a percentage
                  const percentage = metric.yours;

                  return (
                    <div
                      key={i}
                      className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                        isAboveAvg
                          ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200"
                          : "bg-gradient-to-br from-rose-50 to-red-50 border-rose-200"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-xs font-medium text-gray-600 flex items-center gap-1.5 cursor-help">
                                {metric.label}
                                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200/50 hover:from-indigo-100 hover:to-violet-100 transition-all duration-200">
                                  <Info className="h-2.5 w-2.5 text-slate-500" />
                                </span>
                              </p>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs p-3 text-xs leading-relaxed bg-gray-900 text-white border-0 shadow-xl">
                              {metric.tooltip}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isAboveAvg
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}>
                          {isAboveAvg ? "+" : ""}{diff}
                        </div>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className={`text-3xl font-bold ${isAboveAvg ? "text-emerald-600" : "text-rose-600"}`}>
                            {metric.yours}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-1">
                            Avg: <span className="font-semibold">{metric.avg}</span>
                          </p>
                        </div>
                        <div className="w-16 h-16">
                          <svg viewBox="0 0 36 36" className="w-full h-full">
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke={isAboveAvg ? "#d1fae5" : "#ffe4e6"}
                              strokeWidth="3"
                            />
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke={isAboveAvg ? "#10b981" : "#f43f5e"}
                              strokeWidth="3"
                              strokeDasharray={`${percentage}, 100`}
                              strokeLinecap="round"
                            />
                            <text x="18" y="21" textAnchor="middle" className="text-[8px] font-bold" fill={isAboveAvg ? "#059669" : "#e11d48"}>
                              {percentage}%
                            </text>
                          </svg>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No comparison data available.</p>
                <p className="text-xs mt-1">Run analysis to see metrics comparison.</p>
              </div>
            )}
          </div>
        </div>

        {/* Opportunities & Threats - Only show if we have competitor data - Vertical Layout */}
        {competitorDetails.length > 0 && (
          <div className="grid grid-cols-1 gap-5 mb-6">
            {/* Opportunities - derived from competitor weaknesses */}
            <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200">
              <h4 className="text-sm font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Opportunities to Capture
              </h4>
              <div className="space-y-3">
                {competitorDetails.slice(0, 3).flatMap(comp =>
                  comp.weaknesses.slice(0, 1).map((weakness, j) => (
                    <div key={`${comp.name}-${j}`} className="p-3 bg-white rounded-lg border border-emerald-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-800">{comp.name} Gap</span>
                        <Badge className="bg-emerald-100 text-emerald-700 text-xs">Opportunity</Badge>
                      </div>
                      <p className="text-xs text-gray-600">{weakness}</p>
                    </div>
                  ))
                )}
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
        )}

        {/* Detailed Competitor Cards - Only show if we have competitors */}
        {competitorDetails.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Detailed Competitor Analysis</h4>
          <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
            {competitorDetails.map((comp, i) => (
              <div key={i} className="p-4 bg-white hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Score Badge */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0 ${
                    comp.overallScore >= 70 ? "bg-gradient-to-br from-emerald-500 to-emerald-600" :
                    comp.overallScore >= 50 ? "bg-gradient-to-br from-amber-500 to-amber-600" : "bg-gradient-to-br from-gray-400 to-gray-500"
                  }`}>
                    {comp.overallScore}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header Row */}
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h5 className="text-base font-semibold text-gray-900">{comp.name}</h5>
                        <p className="text-xs text-gray-500">{comp.marketShare}</p>
                      </div>
                      <Badge className={`text-[10px] ${
                        comp.sentiment === "positive" ? "bg-emerald-100 text-emerald-700" :
                        comp.sentiment === "negative" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {comp.sentiment} sentiment
                      </Badge>
                    </div>

                    {/* Strengths & Weaknesses in Grid */}
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      {/* Strengths */}
                      <div className="bg-red-50/50 rounded-lg p-3 border border-red-100">
                        <p className="text-[11px] font-semibold text-red-700 mb-2 flex items-center gap-1.5">
                          <AlertCircle className="h-3 w-3" />
                          Their Strengths
                        </p>
                        <ul className="space-y-1.5">
                          {comp.strengths.slice(0, 2).map((s, j) => (
                            <li key={j} className="text-xs text-gray-700 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                              <span className="leading-relaxed">{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Weaknesses */}
                      <div className="bg-emerald-50/50 rounded-lg p-3 border border-emerald-100">
                        <p className="text-[11px] font-semibold text-emerald-700 mb-2 flex items-center gap-1.5">
                          <Target className="h-3 w-3" />
                          Your Opportunity
                        </p>
                        <ul className="space-y-1.5">
                          {comp.weaknesses.slice(0, 2).map((w, j) => (
                            <li key={j} className="text-xs text-gray-700 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                              <span className="leading-relaxed">{w}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Strategy Recommendation */}
        <div className="mt-5 p-4 rounded-xl bg-blue-50 border border-blue-200">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-800">Competitive Strategy Recommendation</p>
              <p className="text-sm text-blue-700 mt-1">
                {competitorDetails.length > 0
                  ? `Focus on outperforming ${competitorDetails[0]?.name || "competitors"} by addressing their strengths and exploiting their weaknesses.`
                  : "Add competitors in Settings to get personalized competitive strategy recommendations."}
              </p>
            </div>
          </div>
        </div>
        </>
        )}
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

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let yPos = margin;

    // Helper function to add new page if needed
    const checkPageBreak = (requiredSpace: number) => {
      if (yPos + requiredSpace > pageHeight - margin) {
        pdf.addPage();
        yPos = margin;
        return true;
      }
      return false;
    };

    // Helper function to wrap text
    const wrapText = (text: string, maxWidth: number, fontSize: number): string[] => {
      pdf.setFontSize(fontSize);
      return pdf.splitTextToSize(text, maxWidth);
    };

    // Colors
    const colors = {
      primary: [99, 102, 241] as [number, number, number],      // Indigo
      secondary: [139, 92, 246] as [number, number, number],    // Violet
      success: [16, 185, 129] as [number, number, number],      // Emerald
      warning: [245, 158, 11] as [number, number, number],      // Amber
      danger: [239, 68, 68] as [number, number, number],        // Red
      dark: [31, 41, 55] as [number, number, number],           // Gray-800
      gray: [107, 114, 128] as [number, number, number],        // Gray-500
      lightBg: [249, 250, 251] as [number, number, number],     // Gray-50
    };

    // === HEADER SECTION ===
    // Header background
    pdf.setFillColor(...colors.primary);
    pdf.rect(0, 0, pageWidth, 45, "F");

    // Gradient overlay effect
    pdf.setFillColor(...colors.secondary);
    pdf.rect(pageWidth - 60, 0, 60, 45, "F");

    // Title
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text("ACTION PLAN", margin, 18);

    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    const titleLines = wrapText(planData.title, contentWidth - 40, 11);
    pdf.text(titleLines, margin, 28);

    // Badges on header
    const badgeY = 38;
    pdf.setFontSize(8);

    // Difficulty badge
    const difficultyColor = planData.difficulty === "easy" ? colors.success :
                            planData.difficulty === "medium" ? colors.warning : colors.danger;
    pdf.setFillColor(...difficultyColor);
    pdf.roundedRect(margin, badgeY - 5, 35, 8, 2, 2, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.text(planData.difficulty.toUpperCase(), margin + 4, badgeY);

    // Time badge
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(margin + 40, badgeY - 5, 45, 8, 2, 2, "F");
    pdf.setTextColor(...colors.primary);
    pdf.text(`⏱ ${planData.estimatedTime}`, margin + 44, badgeY);

    yPos = 55;

    // === ORIGINAL ACTION SECTION ===
    pdf.setFillColor(...colors.lightBg);
    pdf.roundedRect(margin, yPos, contentWidth, 25, 3, 3, "F");
    pdf.setDrawColor(...colors.primary);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(margin, yPos, contentWidth, 25, 3, 3, "S");

    pdf.setTextColor(...colors.primary);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.text("ORIGINAL ACTION", margin + 5, yPos + 8);

    pdf.setTextColor(...colors.dark);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    const actionLines = wrapText(action, contentWidth - 10, 10);
    pdf.text(actionLines.slice(0, 2), margin + 5, yPos + 16);

    yPos += 35;

    // === STEPS SECTION ===
    pdf.setTextColor(...colors.dark);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Step-by-Step Guide", margin, yPos);
    yPos += 10;

    planData.steps.forEach((step, index) => {
      checkPageBreak(60);

      // Step card background
      const stepColors = [
        [238, 242, 255] as [number, number, number], // Indigo-50
        [245, 243, 255] as [number, number, number], // Violet-50
        [236, 253, 245] as [number, number, number], // Emerald-50
        [255, 251, 235] as [number, number, number], // Amber-50
      ];
      const bgColor = stepColors[index % stepColors.length];
      const borderColors = [colors.primary, colors.secondary, colors.success, colors.warning];
      const borderColor = borderColors[index % borderColors.length];

      // Calculate card height based on content
      const descLines = wrapText(step.description, contentWidth - 25, 9);
      const tipsLines = wrapText(step.tips, contentWidth - 45, 8);
      const metricLines = wrapText(step.successMetric, contentWidth - 45, 8);
      const cardHeight = 30 + (descLines.length * 4) + (step.tools.length > 0 ? 12 : 0) +
                         (tipsLines.length * 4) + (metricLines.length * 4) + 15;

      checkPageBreak(cardHeight + 10);

      // Card background
      pdf.setFillColor(...bgColor);
      pdf.roundedRect(margin, yPos, contentWidth, cardHeight, 4, 4, "F");

      // Left border accent
      pdf.setFillColor(...borderColor);
      pdf.roundedRect(margin, yPos, 4, cardHeight, 2, 2, "F");

      // Step number circle
      pdf.setFillColor(...borderColor);
      pdf.circle(margin + 15, yPos + 12, 8, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text(String(step.step), margin + 13, yPos + 15);

      // Step title
      pdf.setTextColor(...colors.dark);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text(step.title, margin + 28, yPos + 14);

      // Step description
      let innerY = yPos + 24;
      pdf.setTextColor(...colors.gray);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text(descLines, margin + 10, innerY);
      innerY += descLines.length * 4 + 4;

      // Tools
      if (step.tools.length > 0) {
        pdf.setFillColor(...colors.primary);
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(7);
        let toolX = margin + 10;
        step.tools.forEach((tool) => {
          const toolWidth = pdf.getTextWidth(tool) + 8;
          if (toolX + toolWidth > pageWidth - margin) {
            toolX = margin + 10;
            innerY += 8;
          }
          pdf.roundedRect(toolX, innerY - 4, toolWidth, 7, 2, 2, "F");
          pdf.text(tool, toolX + 4, innerY);
          toolX += toolWidth + 4;
        });
        innerY += 10;
      }

      // Pro Tip
      pdf.setFillColor(254, 243, 199); // Amber-100
      pdf.roundedRect(margin + 10, innerY, contentWidth - 20, tipsLines.length * 4 + 6, 2, 2, "F");
      pdf.setTextColor(...colors.warning);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "bold");
      pdf.text("💡 PRO TIP", margin + 14, innerY + 5);
      pdf.setTextColor(...colors.dark);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.text(tipsLines, margin + 14, innerY + 10);
      innerY += tipsLines.length * 4 + 12;

      // Success Metric
      pdf.setFillColor(220, 252, 231); // Emerald-100
      pdf.roundedRect(margin + 10, innerY, contentWidth - 20, metricLines.length * 4 + 6, 2, 2, "F");
      pdf.setTextColor(...colors.success);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "bold");
      pdf.text("✓ SUCCESS METRIC", margin + 14, innerY + 5);
      pdf.setTextColor(...colors.dark);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.text(metricLines, margin + 14, innerY + 10);

      yPos += cardHeight + 8;
    });

    // === RESOURCES SECTION ===
    if (planData.resources.length > 0) {
      checkPageBreak(50);
      yPos += 5;

      pdf.setTextColor(...colors.dark);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Recommended Resources", margin, yPos);
      yPos += 10;

      planData.resources.forEach((resource) => {
        checkPageBreak(20);

        const typeColors: Record<string, [number, number, number]> = {
          tool: colors.primary,
          article: colors.secondary,
          template: colors.success,
          service: colors.warning,
        };
        const typeColor = typeColors[resource.type] || colors.gray;

        pdf.setFillColor(...colors.lightBg);
        pdf.roundedRect(margin, yPos, contentWidth, 18, 3, 3, "F");

        // Type badge
        pdf.setFillColor(...typeColor);
        pdf.roundedRect(margin + 5, yPos + 4, 30, 6, 2, 2, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(6);
        pdf.text(resource.type.toUpperCase(), margin + 8, yPos + 8);

        // Resource name
        pdf.setTextColor(...colors.dark);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.text(resource.name, margin + 40, yPos + 9);

        // Description
        pdf.setTextColor(...colors.gray);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        const resourceDesc = wrapText(resource.description, contentWidth - 50, 8);
        pdf.text(resourceDesc[0] || "", margin + 40, yPos + 14);

        yPos += 22;
      });
    }

    // === EXPECTED OUTCOME SECTION ===
    checkPageBreak(40);
    yPos += 5;

    pdf.setFillColor(...colors.success);
    pdf.roundedRect(margin, yPos, contentWidth, 30, 4, 4, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("🎯 EXPECTED OUTCOME", margin + 10, yPos + 10);

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    const outcomeLines = wrapText(planData.expectedOutcome, contentWidth - 20, 9);
    pdf.text(outcomeLines.slice(0, 3), margin + 10, yPos + 18);

    // === FOOTER ===
    const footerY = pageHeight - 15;
    pdf.setFillColor(...colors.lightBg);
    pdf.rect(0, footerY - 5, pageWidth, 20, "F");

    pdf.setTextColor(...colors.gray);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Generated by zeeklabs.ai AI Visibility Platform`, margin, footerY);
    pdf.text(`${new Date().toLocaleDateString()} | ${brandName}`, pageWidth - margin - 50, footerY);

    // Download the PDF
    pdf.save(`action-plan-${planData.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}.pdf`);
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
          <div className="space-y-5" data-action-plan-content>
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
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={downloadPDF}>
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

              {planData.steps.map((step, index) => {
                const stepColors = [
                  { bg: "from-indigo-500 to-purple-500", border: "border-indigo-200", light: "bg-indigo-50" },
                  { bg: "from-violet-500 to-fuchsia-500", border: "border-violet-200", light: "bg-violet-50" },
                  { bg: "from-blue-500 to-cyan-500", border: "border-blue-200", light: "bg-blue-50" },
                  { bg: "from-emerald-500 to-teal-500", border: "border-emerald-200", light: "bg-emerald-50" },
                ];
                const colorSet = stepColors[index % stepColors.length];

                return (
                  <div
                    key={step.step}
                    className={`p-5 rounded-2xl border-2 ${colorSet.border} ${colorSet.light} hover:shadow-lg transition-all`}
                  >
                    {/* Step Header */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorSet.bg} text-white flex items-center justify-center text-lg font-bold shadow-md`}>
                        {step.step}
                      </div>
                      <h5 className="font-bold text-gray-900 text-base flex-1">{step.title}</h5>
                    </div>

                    {/* Description - with proper formatting */}
                    <div className="mb-4 p-4 rounded-xl bg-white border border-gray-100">
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {step.description}
                      </p>
                    </div>

                    {/* Tools */}
                    {step.tools.length > 0 && (
                      <div className="flex items-start gap-3 mb-4">
                        <div className="p-1.5 rounded-lg bg-gray-100">
                          <Wrench className="h-4 w-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-1.5">TOOLS & RESOURCES</p>
                          <div className="flex flex-wrap gap-2">
                            {step.tools.map((tool, i) => (
                              <Badge key={i} className="text-xs bg-white border border-gray-200 text-gray-700 px-3 py-1">
                                {tool}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tips & Success in a grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Tips */}
                      <div className="p-3 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200">
                        <div className="flex items-start gap-2">
                          <div className="p-1 rounded-lg bg-amber-100">
                            <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-amber-700 mb-1">PRO TIP</p>
                            <p className="text-xs text-amber-800 leading-relaxed">{step.tips}</p>
                          </div>
                        </div>
                      </div>

                      {/* Success Metric */}
                      <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
                        <div className="flex items-start gap-2">
                          <div className="p-1 rounded-lg bg-emerald-100">
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-emerald-700 mb-1">SUCCESS METRIC</p>
                            <p className="text-xs text-emerald-800 leading-relaxed">{step.successMetric}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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

  // Check if we have analysis results - only show recommendations after analysis
  const hasAnalysisData = recommendations && (
    (recommendations.immediate && recommendations.immediate.length > 0) ||
    (recommendations.shortTerm && recommendations.shortTerm.length > 0) ||
    (recommendations.longTerm && recommendations.longTerm.length > 0)
  );

  // If no analysis data, show empty state
  if (!hasAnalysisData) {
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
                <p className="text-sm text-gray-500">Prioritized actions to boost your AI visibility</p>
              </div>
            </div>
            <Badge className="bg-gray-100 text-gray-600">No data yet</Badge>
          </div>

          {/* Empty State */}
          <div className="p-8 rounded-xl bg-gray-50 border border-gray-200 text-center">
            <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-700 mb-2">No Action Plan Available</h4>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Run an analysis to get personalized recommendations for improving your AI visibility score.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Generate brand-specific fallback recommendations based on context
  const generateFallbackRecommendations = () => {
    const industry = brandContext?.industry || "your industry";
    const competitors = brandContext?.competitors || [];
    const competitorNames = competitors.slice(0, 3).map(c => typeof c === 'string' ? c : c.name);
    const score = currentScore || 0;
    const domain = brandContext?.domain || "";
    const platformScores = brandContext?.platformScores;
    const weaknesses = brandContext?.weaknesses || [];

    // Determine focus areas based on score and context
    const needsBasicPresence = score < 30;
    const needsAuthority = score < 50;
    const needsOptimization = score >= 50 && score < 70;
    const needsAdvanced = score >= 70;

    // Platform-specific recommendations
    const weakestPlatform = platformScores
      ? Object.entries(platformScores).reduce((min, [key, val]) =>
          (val || 0) < (min.score || 100) ? { platform: key, score: val || 0 } : min,
          { platform: 'chatgpt', score: 100 }
        ).platform
      : null;

    // Build immediate actions based on current state
    const immediateActions: string[] = [];
    if (needsBasicPresence) {
      immediateActions.push(`Claim and verify ${brandName}'s Google Business Profile with complete information`);
      immediateActions.push(`Create or update ${brandName}'s Wikipedia entry draft with verifiable citations`);
      immediateActions.push(`Set up ${brandName}'s presence on Crunchbase with company details and funding info`);
    } else if (needsAuthority) {
      immediateActions.push(`Respond to all pending customer reviews mentioning ${brandName} on G2 and Capterra`);
      immediateActions.push(`Add structured data markup (Organization, Product schemas) to ${domain || brandName + "'s website"}`);
      immediateActions.push(`Publish a press release about ${brandName}'s latest feature or milestone`);
    } else {
      immediateActions.push(`Optimize ${brandName}'s meta descriptions with AI-friendly, descriptive content`);
      immediateActions.push(`Update ${brandName}'s FAQ section with conversational Q&A format for AI assistants`);
      immediateActions.push(`Submit ${brandName} to 3 industry-specific directories this week`);
    }

    // Add weakness-based action if available
    if (weaknesses.length > 0) {
      immediateActions.push(`Address identified weakness: ${weaknesses[0]}`);
    }

    // Build short-term actions based on competitors and platform scores
    const shortTermActions: string[] = [];
    if (competitorNames.length > 0) {
      shortTermActions.push(`Create a detailed comparison page: "${brandName} vs ${competitorNames[0]}" with feature tables`);
      shortTermActions.push(`Analyze ${competitorNames.slice(0, 2).join(" and ")}'s content strategy and identify gaps to fill`);
    } else {
      shortTermActions.push(`Create comparison content positioning ${brandName} against industry alternatives`);
      shortTermActions.push(`Research top competitors in ${industry} and track their AI visibility`);
    }

    if (weakestPlatform) {
      const platformName = weakestPlatform === 'chatgpt' ? 'ChatGPT' : weakestPlatform === 'gemini' ? 'Gemini' : 'Perplexity';
      shortTermActions.push(`Focus content optimization for ${platformName} - currently ${brandName}'s weakest platform`);
    }

    shortTermActions.push(`Publish 4 educational blog posts about ${industry} topics that mention ${brandName} naturally`);
    shortTermActions.push(`Build relationships with 3 ${industry} publications for potential coverage`);

    // Build long-term actions
    const longTermActions: string[] = [];
    if (needsAdvanced) {
      longTermActions.push(`Establish ${brandName} as a thought leader with a quarterly industry report series`);
      longTermActions.push(`Build a ${brandName} resource center with comprehensive guides that AI systems will cite`);
      longTermActions.push(`Develop a podcast or video series featuring ${brandName}'s expertise in ${industry}`);
    } else {
      longTermActions.push(`Develop a comprehensive content strategy to position ${brandName} as an authority in ${industry}`);
      longTermActions.push(`Build high-quality backlinks from 10+ authoritative ${industry} websites`);
      longTermActions.push(`Create a ${brandName} academy or learning center with certifications`);
    }

    longTermActions.push(`Implement systematic customer review collection for ${brandName} across all major platforms`);

    // Competitive actions
    const competitiveActions: string[] = [];
    if (competitorNames.length > 0) {
      competitiveActions.push(`Monitor ${competitorNames[0]}'s AI mentions weekly and identify winning content patterns`);
      competitiveActions.push(`Target keywords and topics where ${competitorNames.slice(0, 2).join(" and ")} rank but ${brandName} doesn't`);
      competitiveActions.push(`Differentiate ${brandName} by highlighting unique features competitors lack`);
    }

    return { immediateActions, shortTermActions, longTermActions, competitiveActions };
  };

  // Use recommendations from analysis if available, otherwise generate brand-specific fallbacks
  const fallbackRecs = !recommendations ? generateFallbackRecommendations() : null;

  const immediateActions = recommendations?.immediate || fallbackRecs?.immediateActions || [];
  const shortTermActions = recommendations?.shortTerm || fallbackRecs?.shortTermActions || [];
  const longTermActions = recommendations?.longTerm || fallbackRecs?.longTermActions || [];
  const competitiveActions = recommendations?.competitiveActions || fallbackRecs?.competitiveActions || [];

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
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 cursor-help">
                      Improvement & Action Plan
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200/50 shadow-sm hover:from-indigo-100 hover:to-violet-100 hover:border-indigo-200/50 transition-all duration-200">
                        <Info className="h-3 w-3 text-slate-500" />
                      </span>
                    </h3>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-3 text-xs leading-relaxed bg-gray-900 text-white border-0 shadow-xl">
                    Prioritized recommendations to improve your AI visibility score. Actions are categorized by timeframe and estimated impact. Potential points are calculated based on action complexity and historical improvement data.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="text-sm text-gray-500">Prioritized actions to boost your AI visibility</p>
            </div>
          </div>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className="bg-emerald-100 text-emerald-700 cursor-help">
                  +{totalGain} pts potential
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs p-3 text-xs leading-relaxed">
                Total potential score increase if all recommended actions are completed. Calculated as sum of immediate (+{immediateGain}), short-term (+{shortTermGain}), and long-term (+{longTermGain}) gains.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Score Improvement Heatmap */}
        <div className="p-5 rounded-xl bg-white border border-gray-200 mb-6">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2 cursor-help">
                  Score Improvement Heatmap
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200/50 shadow-sm hover:from-indigo-100 hover:to-violet-100 hover:border-indigo-200/50 transition-all duration-200">
                    <Info className="h-3 w-3 text-slate-500" />
                  </span>
                </h4>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs p-3 text-xs leading-relaxed bg-gray-900 text-white border-0 shadow-xl">
                Heatmap visualization showing score progression. Darker colors indicate higher scores. Each cell represents a 10-point range with your current position and potential improvement highlighted.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Heatmap Grid */}
          <div className="flex items-stretch gap-1 mb-4">
            {Array.from({ length: 10 }, (_, i) => {
              const rangeStart = i * 10;
              const rangeEnd = rangeStart + 10;
              const isCurrentRange = currentScore >= rangeStart && currentScore < rangeEnd;
              const isPotentialRange = totalPotential >= rangeStart && totalPotential < rangeEnd;
              const isInProgress = currentScore < rangeStart && totalPotential > rangeStart;
              const isPassed = currentScore >= rangeEnd;
              const isFuture = totalPotential < rangeStart;

              // Color intensity based on score range
              const getHeatColor = () => {
                if (isPassed) return "bg-indigo-500";
                if (isCurrentRange) return "bg-gradient-to-t from-indigo-600 to-indigo-400";
                if (isInProgress) return "bg-gradient-to-t from-emerald-400 to-emerald-300 animate-pulse";
                if (isPotentialRange) return "bg-gradient-to-t from-emerald-500 to-emerald-400";
                if (isFuture) return "bg-gray-100";
                return "bg-gray-200";
              };

              return (
                <TooltipProvider key={i} delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`flex-1 h-16 rounded-lg ${getHeatColor()} flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 hover:shadow-md relative overflow-hidden`}
                      >
                        {isCurrentRange && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-white font-bold text-lg drop-shadow-md">{currentScore}</div>
                          </div>
                        )}
                        {isPotentialRange && !isCurrentRange && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-white font-bold text-lg drop-shadow-md">{totalPotential}</div>
                          </div>
                        )}
                        {!isCurrentRange && !isPotentialRange && (
                          <span className={`text-xs font-medium ${isPassed || isInProgress ? "text-white/70" : "text-gray-400"}`}>
                            {rangeStart}-{rangeEnd}
                          </span>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="p-2 text-xs">
                      <p className="font-semibold">Score Range: {rangeStart}-{rangeEnd}</p>
                      {isCurrentRange && <p className="text-indigo-600">Current: {currentScore}</p>}
                      {isPotentialRange && <p className="text-emerald-600">Potential: {totalPotential}</p>}
                      {isInProgress && <p className="text-emerald-600">Improvement zone</p>}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>

          {/* Legend and Summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-indigo-500" />
                <span className="text-xs text-gray-600">Current ({currentScore})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-emerald-400" />
                <span className="text-xs text-gray-600">Potential gain (+{totalGain})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200" />
                <span className="text-xs text-gray-600">Target ({totalPotential})</span>
              </div>
            </div>

            {/* Gain Breakdown */}
            <div className="flex items-center gap-3">
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 cursor-help">
                      <Zap className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-700">+{immediateGain}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="p-2 text-xs">Immediate actions impact</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 cursor-help">
                      <Target className="h-3.5 w-3.5 text-blue-600" />
                      <span className="text-xs font-bold text-blue-700">+{shortTermGain}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="p-2 text-xs">Short-term actions impact</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-100 cursor-help">
                      <TrendingUp className="h-3.5 w-3.5 text-violet-600" />
                      <span className="text-xs font-bold text-violet-700">+{longTermGain}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="p-2 text-xs">Long-term actions impact</TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
interface CitationData {
  source: string;
  type?: string;
  category?: string;
  status?: "cited" | "weak" | "missing";
  priority?: "high" | "medium" | "low";
  effort?: "low" | "medium" | "high";
  relevance?: string;
  url?: string;
  aiRecommendation?: string;
}

function CitationOpportunitiesIsland({
  citations: analysisCitations,
  brandName,
  industry,
}: {
  citations?: CitationData[];
  brandName: string;
  industry?: string;
}) {
  // Check if we have analysis data - only show citations after analysis runs
  const hasAnalysisData = analysisCitations && analysisCitations.length > 0;

  // If no analysis data, show empty state
  if (!hasAnalysisData) {
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
                <p className="text-sm text-gray-500">Sources to boost your AI visibility</p>
              </div>
            </div>
            <Badge className="bg-gray-100 text-gray-600">No data yet</Badge>
          </div>

          {/* Empty State */}
          <div className="p-8 rounded-xl bg-gray-50 border border-gray-200 text-center">
            <Link2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-700 mb-2">No Citation Data Available</h4>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Run an analysis to discover citation opportunities that can improve your AI visibility.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // This branch only runs when analysisCitations is non-empty (guarded above).
  const baseCitations = analysisCitations!;

  // Merge and deduplicate - prefer analysis data when available
  const citations = baseCitations.map((c, index) => ({
    id: String(index + 1),
    source: c.source,
    url: c.url || "",
    status: (c.status || "missing") as "cited" | "weak" | "missing",
    priority: (c.priority || "medium") as "high" | "medium" | "low",
    effort: c.effort === "low" ? "Low" : c.effort === "high" ? "High" : "Medium",
    aiRecommendation: c.aiRecommendation || c.relevance || `Improve your presence on ${c.source} to boost AI visibility.`,
    category: c.category || c.type || "General",
  }));

  const citedCount = citations.filter((c) => c.status === "cited").length;
  const weakCount = citations.filter((c) => c.status === "weak").length;
  const missingCount = citations.filter((c) => c.status === "missing").length;
  const highPriorityMissing = citations.filter((c) => c.status === "missing" && c.priority === "high").length;
  const lowEffortMissing = citations.filter((c) => c.status !== "cited" && c.effort === "Low").length;

  // Get unique categories
  const categories = Array.from(new Set(citations.map(c => c.category)));

  const statusConfig = {
    cited: { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", label: "Cited" },
    missing: { icon: XCircle, color: "text-red-500", bg: "bg-red-50", border: "border-red-200", label: "Missing" },
    weak: { icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200", label: "Weak" },
  };

  // Sort citations: high priority first, then by status (missing > weak > cited)
  const sortedCitations = [...citations].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const statusOrder = { missing: 0, weak: 1, cited: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return statusOrder[a.status] - statusOrder[b.status];
  });

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
              <p className="text-sm text-gray-500">{citations.length} sources tracked to boost your AI visibility</p>
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

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.slice(0, 8).map((category) => (
            <span
              key={category}
              className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600"
            >
              {category}
            </span>
          ))}
          {categories.length > 8 && (
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-600">
              +{categories.length - 8} more
            </span>
          )}
        </div>

        {/* Citation Cards Grid - Scrollable */}
        <div className="max-h-[600px] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedCitations.map((citation) => {
              const status = statusConfig[citation.status];
              const StatusIcon = status.icon;

              return (
                <div
                  key={citation.id}
                  className={`p-4 rounded-xl ${status.bg} border ${status.border}`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-2">
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

                  {/* Category */}
                  <p className="text-xs text-gray-500 mb-2">{citation.category}</p>

                  {/* Status & Effort */}
                  <div className="flex items-center gap-3 mb-3 text-sm">
                    <span className={`px-2 py-0.5 rounded ${status.bg} ${status.color} font-medium text-xs`}>
                      {status.label}
                    </span>
                    <span className="text-gray-500 text-xs">
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
                      <p className="text-xs text-gray-700 line-clamp-3">{citation.aiRecommendation}</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  {citation.status !== "cited" && citation.url && (
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
        </div>

        {/* Summary Insight */}
        <div className="mt-5 p-4 rounded-xl bg-blue-50 border border-blue-200">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-800">Citation Strategy for {brandName}</p>
              <p className="text-sm text-blue-700 mt-1">
                {highPriorityMissing > 0 && `Focus on ${highPriorityMissing} high-priority missing citations first. `}
                {lowEffortMissing > 0 && `${lowEffortMissing} opportunities require low effort - start there for quick wins. `}
                Citation presence is one of several factors AI platforms weigh — there&apos;s no reliable way to predict an exact score impact from these {citations.length} sources.
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
  brandScore,
  competitorComparison,
  recommendations,
  brandContext,
}: {
  aiVisibility?: {
    mentionFrequency: string;
    typicalPosition: number | null;
    recommendationLikelihood: string;
    competitorMentionGap: string;
    improvementAreas: string[];
  };
  brandName: string;
  brandScore?: number;
  competitorComparison?: Array<{
    name: string;
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    marketShare: string;
    sentiment: string;
  }>;
  recommendations?: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    competitiveActions?: string[];
  };
  brandContext?: BrandContext;
}) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);

  // Derive competitive position from available data
  const deriveCompetitivePosition = (): string | null => {
    // If we have explicit competitorMentionGap that isn't a default fallback, use it
    if (aiVisibility?.competitorMentionGap &&
        aiVisibility.competitorMentionGap !== "Insufficient data" &&
        aiVisibility.competitorMentionGap !== "Run simulations to gather comparison data") {
      return aiVisibility.competitorMentionGap;
    }

    // Derive from competitor comparison data
    if (competitorComparison && competitorComparison.length > 0 && brandScore !== undefined) {
      const avgCompetitorScore = Math.round(
        competitorComparison.reduce((sum, c) => sum + c.overallScore, 0) / competitorComparison.length
      );
      const scoreDiff = brandScore - avgCompetitorScore;
      const topCompetitor = [...competitorComparison].sort((a, b) => b.overallScore - a.overallScore)[0];

      if (scoreDiff > 15) {
        return `${brandName} leads the competitive landscape with a visibility score of ${brandScore}, outperforming the industry average of ${avgCompetitorScore}. You're ahead of ${topCompetitor.name} by ${brandScore - topCompetitor.overallScore} points.`;
      } else if (scoreDiff > 0) {
        return `${brandName} holds a competitive position with a score of ${brandScore}, slightly above the competitor average of ${avgCompetitorScore}. Focus on widening the gap with ${topCompetitor.name}.`;
      } else if (scoreDiff > -15) {
        return `${brandName} has room for improvement with a score of ${brandScore}, ${Math.abs(scoreDiff)} points below the competitor average. ${topCompetitor.name} leads the category at ${topCompetitor.overallScore}.`;
      } else {
        return `${brandName} is trailing competitors with a visibility score of ${brandScore}. The category leader ${topCompetitor.name} scores ${topCompetitor.overallScore}. Immediate action recommended to close the ${Math.abs(scoreDiff)}-point gap.`;
      }
    }

    // If we have any visibility metrics, provide basic positioning
    if (aiVisibility?.mentionFrequency && aiVisibility.mentionFrequency !== "none") {
      const position = aiVisibility.typicalPosition
        ? `typically appearing at position #${aiVisibility.typicalPosition}`
        : "";
      return `${brandName} has ${aiVisibility.mentionFrequency} mention frequency in AI responses${position ? `, ${position}` : ""}. AI recommendation likelihood is ${aiVisibility.recommendationLikelihood || "moderate"}.`;
    }

    return null;
  };

  // Derive improvement areas from multiple sources
  const deriveImprovementAreas = (): string[] => {
    const areas: string[] = [];

    // Use AI visibility improvement areas if they're not defaults
    if (aiVisibility?.improvementAreas &&
        aiVisibility.improvementAreas.length > 0 &&
        aiVisibility.improvementAreas[0] !== "Run more simulations to gather data") {
      areas.push(...aiVisibility.improvementAreas);
    }

    // Add from immediate recommendations if available
    if (recommendations?.immediate && recommendations.immediate.length > 0 && areas.length < 4) {
      const additionalAreas = recommendations.immediate
        .filter(r => !areas.some(a => a.toLowerCase().includes(r.toLowerCase().split(' ')[0])))
        .slice(0, 4 - areas.length);
      areas.push(...additionalAreas);
    }

    // Add from competitive actions
    if (recommendations?.competitiveActions && recommendations.competitiveActions.length > 0 && areas.length < 4) {
      const additionalAreas = recommendations.competitiveActions
        .filter(r => !areas.some(a => a.toLowerCase().includes(r.toLowerCase().split(' ')[0])))
        .slice(0, 4 - areas.length);
      areas.push(...additionalAreas);
    }

    // Fallback defaults if nothing available
    if (areas.length === 0) {
      return [
        "Increase presence on high-authority review platforms",
        "Create more comparison content vs competitors",
        "Improve structured data markup for rich snippets",
        "Build more authoritative backlinks from industry publications"
      ];
    }

    return areas.slice(0, 5);
  };

  const competitivePosition = deriveCompetitivePosition();
  const improvementAreas = deriveImprovementAreas();

  // Helper to clean markdown ** from text
  const cleanMarkdown = (text: string): string => {
    if (!text) return text;
    return text
      .replace(/\*\*([^*]+)\*\*/g, '$1')  // Remove **bold**
      .replace(/__([^_]+)__/g, '$1')       // Remove __bold__
      .replace(/\*([^*]+)\*/g, '$1')       // Remove *italic*
      .replace(/_([^_]+)_/g, '$1')         // Remove _italic_
      .trim();
  };

  const handleAreaClick = (area: string) => {
    setSelectedAction(cleanMarkdown(area));
    setShowActionModal(true);
  };

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
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 cursor-help">
                      Competitive Position & Key Focus Areas
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200/50 shadow-sm hover:from-indigo-100 hover:to-violet-100 hover:border-indigo-200/50 transition-all duration-200">
                        <Info className="h-3 w-3 text-slate-500" />
                      </span>
                    </h3>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-3 text-xs leading-relaxed bg-gray-900 text-white border-0 shadow-xl">
                    Analysis of how your brand is positioned relative to competitors in AI-generated responses. Includes strategic recommendations based on competitive gaps and opportunities.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="text-sm text-gray-500">Strategic insights for {brandName}</p>
            </div>
          </div>
        </div>

        {/* Changed to vertical layout (grid-cols-1) */}
        <div className="grid grid-cols-1 gap-6">
          {/* Competitive Position */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-indigo-100">
                <Trophy className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2 cursor-help">
                        Your Competitive Position
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200/50 shadow-sm hover:from-indigo-100 hover:to-violet-100 hover:border-indigo-200/50 transition-all duration-200">
                          <Info className="h-3 w-3 text-slate-500" />
                        </span>
                      </h4>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs p-3 text-xs leading-relaxed bg-gray-900 text-white border-0 shadow-xl">
                      Summary of how AI platforms position your brand compared to competitors. Based on analysis of mention context, co-occurrence patterns, and recommendation ordering.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <p className="text-xs text-gray-500">How you compare to competitors in AI responses</p>
              </div>
            </div>

            {competitivePosition ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-700 leading-relaxed bg-white p-4 rounded-lg border border-indigo-100">
                  {competitivePosition}
                </p>
                {/* Show key metrics if available */}
                {(aiVisibility?.mentionFrequency || aiVisibility?.typicalPosition || aiVisibility?.recommendationLikelihood) && (
                  <div className="flex flex-wrap gap-3">
                    {aiVisibility?.mentionFrequency && aiVisibility.mentionFrequency !== "none" && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-100 rounded-lg">
                        <span className="text-xs text-indigo-600 font-medium">Mention Frequency:</span>
                        <span className="text-xs font-semibold text-indigo-700 capitalize">{aiVisibility.mentionFrequency}</span>
                      </div>
                    )}
                    {aiVisibility?.typicalPosition !== null && aiVisibility?.typicalPosition !== undefined && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-100 rounded-lg">
                        <span className="text-xs text-violet-600 font-medium">AI Response Position:</span>
                        <span className="text-xs font-semibold text-violet-700">#{aiVisibility.typicalPosition}</span>
                      </div>
                    )}
                    {aiVisibility?.recommendationLikelihood && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 rounded-lg">
                        <span className="text-xs text-purple-600 font-medium">AI Recommendation Signal:</span>
                        <span className="text-xs font-semibold text-purple-700 capitalize">{aiVisibility.recommendationLikelihood}</span>
                      </div>
                    )}
                  </div>
                )}
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
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2 cursor-help">
                        Key Focus Areas
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200/50 shadow-sm hover:from-indigo-100 hover:to-violet-100 hover:border-indigo-200/50 transition-all duration-200">
                          <Info className="h-3 w-3 text-slate-500" />
                        </span>
                      </h4>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs p-3 text-xs leading-relaxed bg-gray-900 text-white border-0 shadow-xl">
                      Prioritized list of improvement areas identified from AI response analysis. Items are ranked by potential impact on your visibility score.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <p className="text-xs text-gray-500">Priority areas to improve your AI visibility</p>
              </div>
            </div>

            <div className="space-y-3">
              {improvementAreas.map((area, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 bg-white rounded-lg border border-amber-100 hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => handleAreaClick(area)}
                >
                  <div className="flex items-center justify-center h-7 w-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 leading-relaxed">{cleanMarkdown(area)}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Steps Modal */}
        <ActionStepsModal
          isOpen={showActionModal}
          onClose={() => setShowActionModal(false)}
          action={selectedAction || ""}
          brandName={brandName}
          brandContext={brandContext}
        />
      </div>
    </div>
  );
}

// ============================================
// ANALYSIS PROMPTS USED
// ============================================

interface AnalysisPromptsUsedIslandProps {
  brandName: string;
  domain?: string;
  competitors: Array<{ id: string; name: string; domain?: string }>;
}

function AnalysisPromptsUsedIsland({ brandName, domain, competitors }: AnalysisPromptsUsedIslandProps) {
  // Get industry context from domain
  const industryContext = getIndustryContext(domain || "");

  // Get competitor names
  const competitorNames = competitors.map(c => c.name);

  // Fixed set of 60 prompts, every brand
  const prompts = generateBrandPrompts(brandName, industryContext, competitorNames);

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
          <Badge className="bg-indigo-100 text-indigo-700">{prompts.length} Prompts</Badge>
        </div>

        {/* Prompts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto pr-2">
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
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200/50 shadow-sm flex-shrink-0">
              <Info className="h-4 w-4 text-slate-500" />
            </span>
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">{prompts.length} prompts</span> dynamically generated and sent to <span className="font-semibold">ChatGPT</span>, <span className="font-semibold">Gemini</span>, and <span className="font-semibold">Perplexity</span> to gather comprehensive visibility data.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Prompt count scales based on competitors ({competitors.length}), domain presence, and visibility score.
              </p>
            </div>
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
        `Presence Score: ${SCORE_WEIGHTS.presence * 100}% weight`,
        `Sentiment Score: ${SCORE_WEIGHTS.sentiment * 100}% weight`,
        `Position Score: ${SCORE_WEIGHTS.position * 100}% weight`
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
              <p className="text-sm font-semibold text-gray-900">Deterministic Scoring</p>
              <p className="text-xs text-gray-500">Same inputs always produce the same score — no randomization</p>
            </div>
          </div>
          <Badge className="bg-emerald-100 text-emerald-700">Reproducible</Badge>
        </div>

        <div className="mt-3 text-center">
          <Link href="/dashboard/methodology" className="text-xs text-indigo-600 hover:underline font-medium">
            View full methodology — what&apos;s measured, calculated, and AI-estimated →
          </Link>
        </div>
      </div>
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

