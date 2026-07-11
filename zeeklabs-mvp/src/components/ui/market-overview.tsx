"use client";

import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Globe,
  Users,
  Sparkles,
  Zap,
  Target,
  Search,
  LineChart,
  BarChart3,
  PieChart,
  ArrowRight,
  Clock,
  Calendar,
  Lightbulb,
} from "lucide-react";
import { Badge } from "./badge";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

// Market Overview Component
interface MarketData {
  marketSize: string;
  marketGrowth: string;
  aiSearchDemand: string;
  industryMaturity: string;
  marketOpportunityScore: number;
  untappedKeywords: string[];
  emergingTrends: string[];
  aiGeneratedSummary: string;
}

interface MarketOverviewProps {
  data: MarketData;
  className?: string;
}

export function MarketOverview({ data, className }: MarketOverviewProps) {
  return (
    <Card className={cn("card-premium overflow-hidden", className)}>
      <CardHeader className="pb-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/15">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Market Overview</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">AI-powered market intelligence</p>
            </div>
          </div>
          <Badge className="badge-primary">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Generated
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <MetricCard
            icon={<PieChart className="h-4 w-4" />}
            label="Market Size"
            value={data.marketSize}
            variant="default"
          />
          <MetricCard
            icon={<TrendingUp className="h-4 w-4" />}
            label="Growth Rate"
            value={data.marketGrowth}
            variant="success"
          />
          <MetricCard
            icon={<Search className="h-4 w-4" />}
            label="AI Search Demand"
            value={data.aiSearchDemand}
            variant="primary"
          />
          <MetricCard
            icon={<BarChart3 className="h-4 w-4" />}
            label="Industry Maturity"
            value={data.industryMaturity}
            variant="warning"
          />
          <MetricCard
            icon={<Target className="h-4 w-4" />}
            label="Opportunity Score"
            value={`${data.marketOpportunityScore}/100`}
            variant="accent"
            highlight
          />
        </div>

        {/* AI Summary */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/5 via-accent/5 to-transparent border border-primary/10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Industry Snapshot</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {data.aiGeneratedSummary}
          </p>
        </div>

        {/* Two Column: Keywords & Trends */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Untapped Keywords */}
          <div>
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              Untapped Keywords
            </h4>
            <div className="flex flex-wrap gap-2">
              {data.untappedKeywords.map((keyword, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="px-3 py-1.5 text-xs hover:bg-primary/10 hover:border-primary/30 transition-colors cursor-pointer"
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>

          {/* Emerging Trends */}
          <div>
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              Emerging Trends
            </h4>
            <div className="space-y-2">
              {data.emergingTrends.map((trend, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-success" />
                  <span className="text-muted-foreground">{trend}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Industry Trends Component
interface TrendItem {
  id: string;
  title: string;
  description: string;
  type: "ai_query" | "behavior" | "competitor" | "content" | "forecast";
  impact: "high" | "medium" | "low";
  date: string;
  source?: string;
}

interface IndustryTrendsProps {
  trends: TrendItem[];
  className?: string;
}

export function IndustryTrends({ trends, className }: IndustryTrendsProps) {
  const typeConfig = {
    ai_query: { icon: Search, color: "text-primary", bg: "bg-primary/10", label: "AI Query" },
    behavior: { icon: Users, color: "text-accent", bg: "bg-accent/10", label: "User Behavior" },
    competitor: { icon: Target, color: "text-destructive", bg: "bg-destructive/10", label: "Competitor" },
    content: { icon: Lightbulb, color: "text-warning", bg: "bg-warning/10", label: "Content" },
    forecast: { icon: LineChart, color: "text-success", bg: "bg-success/10", label: "Forecast" },
  };

  const impactConfig = {
    high: "badge-danger",
    medium: "badge-warning",
    low: "badge-neutral",
  };

  return (
    <Card className={cn("card-premium overflow-hidden", className)}>
      <CardHeader className="pb-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent/15">
              <LineChart className="h-5 w-5 text-accent" />
            </div>
            <div>
              <CardTitle className="text-lg">Industry Trends</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">Real-time market intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            Updated 2h ago
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-border" />

          <div className="divide-y divide-border">
            {trends.map((trend, i) => {
              const config = typeConfig[trend.type];
              const Icon = config.icon;

              return (
                <div
                  key={trend.id}
                  className="relative pl-16 pr-6 py-5 hover:bg-muted/30 transition-colors group"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {/* Timeline dot */}
                  <div className={cn(
                    "absolute left-6 top-6 h-5 w-5 rounded-full flex items-center justify-center z-10",
                    config.bg
                  )}>
                    <div className={cn("h-2 w-2 rounded-full", config.color.replace("text-", "bg-"))} />
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[10px] px-2 py-0">
                            <Icon className={cn("h-3 w-3 mr-1", config.color)} />
                            {config.label}
                          </Badge>
                          <Badge className={cn("text-[10px]", impactConfig[trend.impact])}>
                            {trend.impact} impact
                          </Badge>
                        </div>
                        <h4 className="font-semibold">{trend.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{trend.description}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <Calendar className="h-3 w-3" />
                        {trend.date}
                      </div>
                    </div>

                    {trend.source && (
                      <p className="text-xs text-muted-foreground">
                        Source: <span className="text-foreground">{trend.source}</span>
                      </p>
                    )}
                  </div>

                  {/* Hover arrow */}
                  <ArrowRight className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              );
            })}
          </div>
        </div>

        {/* View More */}
        <div className="p-4 border-t border-border bg-muted/20">
          <button className="w-full flex items-center justify-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            View All Trends
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

// Metric Card Component
interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  variant?: "default" | "primary" | "success" | "warning" | "accent";
  highlight?: boolean;
}

function MetricCard({ icon, label, value, variant = "default", highlight }: MetricCardProps) {
  const variantStyles = {
    default: "bg-muted/50 text-muted-foreground",
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    accent: "bg-accent/10 text-accent",
  };

  return (
    <div className={cn(
      "p-4 rounded-2xl border border-border transition-all duration-200",
      highlight && "bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20"
    )}>
      <div className={cn("p-2 rounded-lg w-fit mb-3", variantStyles[variant])}>
        {icon}
      </div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={cn("font-bold text-lg", highlight && "text-primary")}>{value}</p>
    </div>
  );
}

// Compact Market Stats for Dashboard
interface MarketStatsProps {
  stats: {
    label: string;
    value: string;
    trend?: number;
    icon: React.ElementType;
  }[];
  className?: string;
}

export function MarketStats({ stats, className }: MarketStatsProps) {
  return (
    <div className={cn("grid gap-4", className)}>
      {stats.map((stat, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-sm text-muted-foreground">{stat.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{stat.value}</span>
            {stat.trend !== undefined && (
              <span className={cn(
                "text-xs font-medium flex items-center gap-0.5",
                stat.trend > 0 ? "text-success" : stat.trend < 0 ? "text-destructive" : "text-muted-foreground"
              )}>
                {stat.trend > 0 ? <TrendingUp className="h-3 w-3" /> : stat.trend < 0 ? <TrendingDown className="h-3 w-3" /> : null}
                {stat.trend > 0 && "+"}{stat.trend}%
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
