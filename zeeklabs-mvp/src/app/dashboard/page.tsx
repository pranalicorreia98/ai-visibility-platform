"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Check,
  ChevronRight,
  Download,
  Eye,
  Globe,
  Hash,
  Lightbulb,
  MessageSquare,
  Play,
  RefreshCw,
  Target,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  TrendingDown,
  Users,
  Zap,
  Clock,
  AlertCircle,
  CheckCircle,
  Minus,
} from "lucide-react";
import Link from "next/link";
import { useBrand } from "@/contexts/brand-context";
import { ChatGPTLogo, GeminiLogo, PerplexityLogo } from "@/components/ui/ai-logos";

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

export default function DashboardPage() {
  const {
    brands,
    selectedBrand,
    visibilityData,
    recentMentions,
    loading,
    visibilityLoading,
    refreshVisibilityData,
  } = useBrand();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshVisibilityData(true);
    setIsRefreshing(false);
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  // If no brands exist, show setup prompt
  if (brands.length === 0) {
    return (
      <div className="p-8 space-y-8 animate-fade-in">
        <div className="max-w-2xl mx-auto text-center pt-12">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center mx-auto mb-6">
            <Zap className="h-10 w-10 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to ZeekLabs.ai</h1>
          <p className="text-gray-600 text-lg mb-8">
            Set up your brand to start monitoring how AI systems like ChatGPT, Gemini, and Perplexity mention and recommend your business.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl px-8 h-12"
          >
            <Link href="/dashboard/settings">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const vis = visibilityData;

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
      {/* Dashboard Header */}
      <DashboardHeader
        brand={selectedBrand}
        visibilityData={vis}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* ROW 1: Insight Islands - Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 stagger-children">
        <InsightIsland
          title="AI Visibility"
          icon={<Eye className="h-5 w-5" />}
          variant="primary"
        >
          <VisibilityDonutChart
            chatgpt={vis?.score?.chatgpt || 0}
            gemini={vis?.score?.gemini || 0}
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
          <Sparkline data={[15, 22, 18, 30, 25, 35, 32]} className="mt-3" color="emerald" />
        </InsightIsland>

        <InsightIsland
          title="Typical Position"
          icon={<Hash className="h-5 w-5" />}
        >
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-gray-900">#</span>
            <AnimatedNumber value={2.3} decimals={1} loading={visibilityLoading} />
          </div>
          <TrendBadge value={-0.5} label="improved" inverted />
        </InsightIsland>

        <InsightIsland
          title="AI Presence Score"
          icon={<Target className="h-5 w-5" />}
          variant="primary"
        >
          <RadialGauge
            value={vis?.score?.overall || 0}
            max={100}
            loading={visibilityLoading}
          />
        </InsightIsland>
      </div>

      {/* ROW 2: Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
        <InsightIsland
          title="Recommendation Likelihood"
          icon={<ThumbsUp className="h-5 w-5" />}
        >
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-baseline gap-1 mb-2">
                <AnimatedNumber value={68} loading={visibilityLoading} />
                <span className="text-lg text-gray-500">%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill progress-fill-primary" style={{ width: "68%" }} />
              </div>
            </div>
            <TrendBadge value={5} label="vs avg" />
          </div>
        </InsightIsland>

        <InsightIsland
          title="Sentiment Analysis"
          icon={<Activity className="h-5 w-5" />}
        >
          <SentimentDisplay
            sentiment={vis?.sentiment?.average || 0}
            positive={vis?.sentiment?.positive || 0}
            neutral={vis?.sentiment?.neutral || 0}
            negative={vis?.sentiment?.negative || 0}
            loading={visibilityLoading}
          />
        </InsightIsland>

        <InsightIsland
          title="Competitor Comparison"
          icon={<Users className="h-5 w-5" />}
          className="lg:col-span-1"
          expandable
          expandedContent={<CompetitorHeatmapExpanded />}
        >
          <CompetitorHeatmapPreview />
        </InsightIsland>
      </div>

      {/* ROW 3: Visibility Trend Chart */}
      <Card className="card-premium overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              Visibility Improvement Potential
            </CardTitle>
            <CardDescription>Track your AI visibility over time</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs">Monthly</Button>
            <Button variant="ghost" size="sm" className="text-xs">Quarterly</Button>
            <Button variant="ghost" size="sm" className="text-xs">Yearly</Button>
          </div>
        </CardHeader>
        <CardContent>
          <VisibilityTrendChart data={vis?.trend || []} loading={visibilityLoading} />
        </CardContent>
      </Card>

      {/* ROW 4: Action Plan */}
      <Card className="card-premium">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-indigo-600" />
              Action Plan
            </CardTitle>
            <CardDescription>Prioritized recommendations to improve visibility</CardDescription>
          </div>
          <Link href="/dashboard/recommendations">
            <Button variant="ghost" size="sm" className="text-indigo-600">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <ActionPlanList />
        </CardContent>
      </Card>

      {/* ROW 5: Market Overview */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="h-5 w-5 text-indigo-600" />
            Market Overview
          </CardTitle>
          <CardDescription>Industry snapshot and opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          <MarketOverviewPreview />
        </CardContent>
      </Card>
    </div>
  );
}

// Dashboard Header Component
function DashboardHeader({
  brand,
  visibilityData,
  onRefresh,
  isRefreshing,
}: {
  brand: { name: string; domain?: string } | null;
  visibilityData: any;
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
      <div className="flex items-center gap-4">
        {/* Brand Avatar */}
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center border border-indigo-200">
          <span className="text-xl font-bold text-indigo-600">
            {brand?.name?.charAt(0) || "Z"}
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{brand?.name || "Your Brand"}</h1>
            <Badge className="badge-primary text-xs">Pro</Badge>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            {brand?.domain && (
              <span className="flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" />
                {brand.domain}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Last scan: Today
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Overall Score Badge */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100">
          <Target className="h-5 w-5 text-indigo-600" />
          <div>
            <p className="text-xs text-gray-500">Overall Score</p>
            <p className="text-lg font-bold text-indigo-600">
              {visibilityData?.score?.overall || 0}/100
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="rounded-xl"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Scan Again
        </Button>

        <Button
          className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl shadow-lg shadow-indigo-500/25"
        >
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </div>
    </div>
  );
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
    <div className={`sparkline flex items-end gap-1 ${className}`}>
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
  overall,
  loading,
}: {
  chatgpt: number;
  gemini: number;
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
            stroke="url(#gradient)" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${overall * 2} 200`}
            className="transition-all duration-1000"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-gray-900">{overall}</span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-gray-600">ChatGPT: {chatgpt}%</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-gray-600">Gemini: {gemini}%</span>
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
    <div className="flex flex-col items-center">
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
      <div className="absolute mt-7">
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

// Competitor Heatmap Preview
function CompetitorHeatmapPreview() {
  const competitors = [
    { name: "Your Brand", visibility: 72, mentions: 85, authority: 68, sentiment: 78 },
    { name: "Competitor A", visibility: 65, mentions: 70, authority: 72, sentiment: 60 },
    { name: "Competitor B", visibility: 58, mentions: 55, authority: 65, sentiment: 55 },
  ];

  return (
    <div className="space-y-2">
      {competitors.map((comp, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-24 text-xs text-gray-600 truncate">{comp.name}</span>
          <div className="flex-1 flex gap-1">
            <HeatmapCell value={comp.visibility} />
            <HeatmapCell value={comp.mentions} />
            <HeatmapCell value={comp.authority} />
            <HeatmapCell value={comp.sentiment} />
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2 pt-2 text-[10px] text-gray-400">
        <span className="w-24" />
        <div className="flex-1 flex gap-1">
          <span className="flex-1 text-center">Vis</span>
          <span className="flex-1 text-center">Men</span>
          <span className="flex-1 text-center">Auth</span>
          <span className="flex-1 text-center">Sent</span>
        </div>
      </div>
    </div>
  );
}

function HeatmapCell({ value }: { value: number }) {
  const getColor = () => {
    if (value >= 75) return "heatmap-high";
    if (value >= 60) return "heatmap-medium-high";
    if (value >= 45) return "heatmap-medium";
    if (value >= 30) return "heatmap-medium-low";
    return "heatmap-low";
  };

  return (
    <div className={`flex-1 h-6 ${getColor()} heatmap-cell flex items-center justify-center text-[10px] font-medium`}>
      {value}
    </div>
  );
}

function CompetitorHeatmapExpanded() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Strengths</h4>
          <ul className="space-y-1 text-gray-600">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              Strong brand recognition
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              High mention frequency
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Opportunities</h4>
          <ul className="space-y-1 text-gray-600">
            <li className="flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
              Improve citation coverage
            </li>
            <li className="flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
              Target comparison queries
            </li>
          </ul>
        </div>
      </div>
      <Link href="/dashboard/competitors" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
        View full competitor analysis →
      </Link>
    </div>
  );
}

// Visibility Trend Chart
function VisibilityTrendChart({
  data,
  loading,
}: {
  data: Array<{ date: string; chatgpt: number; gemini: number; total: number }>;
  loading: boolean;
}) {
  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p>Run simulations to see trend data</p>
        </div>
      </div>
    );
  }

  // Simple bar chart visualization
  const maxValue = Math.max(...data.map(d => d.total)) || 1;

  return (
    <div className="h-64 flex items-end gap-2">
      {data.slice(-12).map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-gradient-to-t from-indigo-500 to-violet-500 rounded-t-lg transition-all duration-500 hover:from-indigo-600 hover:to-violet-600"
            style={{ height: `${(item.total / maxValue) * 200}px` }}
          />
          <span className="text-[10px] text-gray-400">
            {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      ))}
    </div>
  );
}

// Action Plan List
function ActionPlanList() {
  const actions = [
    { title: "Increase structured data coverage", priority: "high", impact: 85, effort: "Low", category: "Technical SEO", completed: false },
    { title: "Improve citation quality on industry sites", priority: "high", impact: 78, effort: "Medium", category: "Citations", completed: false },
    { title: "Publish comparison content vs competitors", priority: "medium", impact: 72, effort: "High", category: "Content", completed: false },
    { title: "Optimize FAQ schema markup", priority: "medium", impact: 65, effort: "Low", category: "Technical SEO", completed: true },
    { title: "Improve author profile authority", priority: "low", impact: 55, effort: "Medium", category: "E-E-A-T", completed: false },
  ];

  return (
    <div className="space-y-3">
      {actions.map((action, i) => (
        <div key={i} className="action-card group">
          <div className={`w-1 h-12 rounded-full ${
            action.priority === "high" ? "priority-high" :
            action.priority === "medium" ? "priority-medium" : "priority-low"
          }`} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-sm font-medium ${action.completed ? "line-through text-gray-400" : "text-gray-900"}`}>
                {action.title}
              </span>
              <Badge variant="outline" className="text-[10px]">{action.category}</Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Impact: {action.impact}%</span>
              <span>Effort: {action.effort}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24">
              <div className="progress-bar h-1.5">
                <div
                  className={`progress-fill ${action.completed ? "bg-emerald-500" : "progress-fill-primary"}`}
                  style={{ width: action.completed ? "100%" : "0%" }}
                />
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className={`text-xs ${action.completed ? "text-emerald-600" : "text-gray-400 group-hover:text-indigo-600"}`}
            >
              {action.completed ? <Check className="h-4 w-4" /> : "Complete"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Market Overview Preview
function MarketOverviewPreview() {
  const metrics = [
    { label: "Market Size", value: "$4.2B", trend: "+12%" },
    { label: "AI Search Demand", value: "High", trend: "+28%" },
    { label: "Industry Maturity", value: "Growing", trend: null },
    { label: "Opportunity Score", value: "78/100", trend: "+5" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
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

// Dashboard Skeleton
function DashboardSkeleton() {
  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex items-center gap-4">
        <Skeleton className="h-14 w-14 rounded-2xl" />
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-40 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-2xl" />
    </div>
  );
}
