"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Trophy,
  Target,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  Shield,
  Zap,
  ArrowRight,
  Info,
  Sparkles,
} from "lucide-react";
import { useBrand } from "@/contexts/brand-context";

interface CompetitorMetric {
  name: string;
  domain: string | null;
  hasData: boolean;
  score: number | null;
  mentions: number;
  avgPosition: number | null;
  avgSentiment: number | null;
  simulationsCount: number;
}

export default function CompetitorsPage() {
  const {
    brands,
    selectedBrand,
    visibilityData,
    analysisData,
    loading,
  } = useBrand();

  const [competitorMetrics, setCompetitorMetrics] = useState<CompetitorMetric[]>([]);
  const [metricsLoading, setMetricsLoading] = useState(false);

  useEffect(() => {
    if (!selectedBrand?.id) {
      return;
    }
    let cancelled = false;
    setMetricsLoading(true);
    fetch(`/api/competitors/metrics?brandId=${selectedBrand.id}`)
      .then((res) => (res.ok ? res.json() : { competitors: [] }))
      .then((data) => {
        if (!cancelled) setCompetitorMetrics(data.competitors || []);
      })
      .catch(() => {
        if (!cancelled) setCompetitorMetrics([]);
      })
      .finally(() => {
        if (!cancelled) setMetricsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedBrand?.id]);

  // Your brand data from the shared context
  const yourScore = visibilityData?.score?.overall || 0;
  const yourChatGPTScore = visibilityData?.score?.chatgpt || 0;
  const yourGeminiScore = visibilityData?.score?.gemini || 0;
  const yourMentions = visibilityData?.mentions?.total || 0;
  const yourSentiment = visibilityData?.sentiment?.average || 0;

  // Calculate trend from visibility data
  let yourTrend = 0;
  if (visibilityData?.trend && visibilityData.trend.length > 1) {
    const firstDay = visibilityData.trend[0]?.total || 0;
    const lastDay = visibilityData.trend[visibilityData.trend.length - 1]?.total || 0;
    if (firstDay > 0) {
      yourTrend = Math.round(((lastDay - firstDay) / firstDay) * 100);
    }
  }

  // Build competitor comparison data
  // Since we don't have real competitor API tracking yet, show helpful messaging
  const competitorData = selectedBrand?.competitors.map((comp) => ({
    name: comp.name,
    domain: comp.domain,
    isYou: false,
    status: "tracking" as const,
  })) || [];

  if (loading) {
    return (
      <div className="space-y-8 fade-in">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[120px]" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (brands.length === 0) {
    return (
      <div className="space-y-8 fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            Competitor Intelligence
          </h1>
          <p className="text-muted-foreground mt-2">
            Compare your brand visibility against competitors
          </p>
        </div>
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center py-16">
              <div className="h-16 w-16 rounded-2xl bg-muted mx-auto flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-semibold">No brands configured</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add a brand with competitors in Settings to see comparison data
              </p>
              <Button asChild className="mt-4">
                <Link href="/dashboard/settings">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Go to Settings
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            Competitor Intelligence
          </h1>
          <p className="text-muted-foreground mt-2">
            Compare your brand visibility against competitors in AI responses
          </p>
        </div>
        {selectedBrand && (
          <Badge variant="outline" className="font-medium self-start">
            {selectedBrand.name}
          </Badge>
        )}
      </div>

      {/* Your Performance Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Your Score</p>
                <p className="text-4xl font-bold mt-1 text-primary">{yourScore}</p>
                <p className="text-xs text-muted-foreground mt-1">/100</p>
              </div>
              <div className="h-14 w-14 rounded-2xl gradient-bg flex items-center justify-center">
                <Target className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Your Mentions</p>
                <p className="text-4xl font-bold mt-1">{yourMentions}</p>
                <p className="text-xs text-muted-foreground mt-1">last 30 days</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <BarChart3 className="h-7 w-7 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Sentiment</p>
                <p className={`text-4xl font-bold mt-1 ${
                  yourSentiment > 0.2 ? "text-emerald-600" :
                  yourSentiment < -0.2 ? "text-red-600" : "text-amber-600"
                }`}>
                  {yourSentiment > 0 ? "+" : ""}{(yourSentiment * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {yourSentiment > 0.2 ? "positive" : yourSentiment < -0.2 ? "negative" : "neutral"}
                </p>
              </div>
              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${
                yourSentiment > 0.2 ? "bg-emerald-500/10 border border-emerald-500/30" :
                yourSentiment < -0.2 ? "bg-red-500/10 border border-red-500/30" :
                "bg-amber-500/10 border border-amber-500/30"
              }`}>
                {yourSentiment > 0.2 ? (
                  <ThumbsUp className="h-7 w-7 text-emerald-600" />
                ) : yourSentiment < -0.2 ? (
                  <ThumbsDown className="h-7 w-7 text-red-600" />
                ) : (
                  <Minus className="h-7 w-7 text-amber-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Competitors</p>
                <p className="text-4xl font-bold mt-1">{competitorData.length}</p>
                <p className="text-xs text-muted-foreground mt-1">tracked</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Shield className="h-7 w-7 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Your AI Platform Performance */}
      <Card className="border-border">
        <CardHeader className="border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Your AI Platform Performance</CardTitle>
              <CardDescription>
                How your brand performs across different AI systems
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* ChatGPT */}
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-emerald-600">GPT</span>
                  </div>
                  <div>
                    <div className="font-semibold">ChatGPT</div>
                    <div className="text-xs text-muted-foreground">OpenAI</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-600">{yourChatGPTScore}</div>
                  <div className="text-xs text-muted-foreground">/100</div>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${yourChatGPTScore}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {visibilityData?.mentions?.chatgpt || 0} mentions detected
              </div>
            </div>

            {/* Gemini */}
            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">G</span>
                  </div>
                  <div>
                    <div className="font-semibold">Gemini</div>
                    <div className="text-xs text-muted-foreground">Google</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{yourGeminiScore}</div>
                  <div className="text-xs text-muted-foreground">/100</div>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${yourGeminiScore}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {visibilityData?.mentions?.gemini || 0} mentions detected
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Competitors List */}
      <Card className="border-border">
        <CardHeader className="border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <CardTitle>Tracked Competitors</CardTitle>
                <CardDescription>
                  Competitors configured for your brand
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/settings">
                Manage Competitors
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {competitorData.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-2xl bg-muted mx-auto flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-semibold">No competitors configured</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Add competitors in Settings to start tracking their AI visibility
              </p>
              <Button asChild>
                <Link href="/dashboard/settings">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Add Competitors
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {competitorData.map((competitor, idx) => {
                const metric = competitorMetrics.find((m) => m.name === competitor.name);
                const insight = analysisData?.competitorComparison?.find((c) => c.name === competitor.name);

                return (
                  <div
                    key={competitor.name}
                    className="p-4 rounded-xl bg-muted/30 border border-border space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                          <span className="text-sm font-bold text-red-600">{idx + 1}</span>
                        </div>
                        <div>
                          <div className="font-semibold">{competitor.name}</div>
                          {competitor.domain && (
                            <div className="text-xs text-muted-foreground">{competitor.domain}</div>
                          )}
                        </div>
                      </div>

                      {metricsLoading ? (
                        <Skeleton className="h-8 w-24" />
                      ) : metric?.hasData ? (
                        <div className="text-right">
                          <div className="text-2xl font-bold">{metric.score}<span className="text-sm text-muted-foreground">/100</span></div>
                          <Badge variant="outline" className="text-emerald-600 border-emerald-400/30 mt-1">
                            Measured
                          </Badge>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Insufficient data
                        </Badge>
                      )}
                    </div>

                    {metric?.hasData ? (
                      <div className="grid grid-cols-3 gap-3 text-sm border-t border-border pt-3">
                        <div>
                          <div className="text-muted-foreground text-xs">Mentions</div>
                          <div className="font-medium">{metric.mentions} of {metric.simulationsCount} prompts</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground text-xs">Avg. Position</div>
                          <div className="font-medium">{metric.avgPosition !== null ? `#${metric.avgPosition}` : "Not detected"}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground text-xs">Sentiment</div>
                          <div className="font-medium">
                            {metric.avgSentiment !== null
                              ? metric.avgSentiment > 0.2 ? "Positive" : metric.avgSentiment < -0.2 ? "Negative" : "Neutral"
                              : "Not detected"}
                          </div>
                        </div>
                      </div>
                    ) : (
                      !metricsLoading && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground border-t border-border pt-3">
                          <Info className="h-4 w-4 mt-0.5 shrink-0" />
                          <span>
                            No comparison prompts have been run against {competitor.name} yet. Run analysis for
                            this brand to start measuring real mention data.
                          </span>
                        </div>
                      )
                    )}

                    {insight && (insight.strengths?.length > 0 || insight.weaknesses?.length > 0) && (
                      <div className="flex items-start gap-2 text-xs bg-primary/5 border border-primary/20 rounded-lg p-3">
                        <Sparkles className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                        <div>
                          <span className="font-medium text-primary">AI Insight</span>
                          <span className="text-muted-foreground"> (qualitative, not a measured score)</span>
                          {insight.strengths?.length > 0 && (
                            <p className="mt-1"><strong>Strengths:</strong> {insight.strengths.slice(0, 2).join(", ")}</p>
                          )}
                          {insight.weaknesses?.length > 0 && (
                            <p className="mt-1"><strong>Weaknesses:</strong> {insight.weaknesses.slice(0, 2).join(", ")}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mt-6">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">How competitor scores are measured</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Running <strong>Analysis</strong> queries AI platforms with comparison prompts and detects
                      real mentions of each competitor — the same way your own score is measured. Scores only
                      appear once real comparison data exists; nothing here is estimated.
                    </p>
                    <Button size="sm" className="mt-3" asChild>
                      <Link href="/dashboard/analysis">
                        <Zap className="mr-2 h-4 w-4" />
                        Run Analysis
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trend indicator */}
      {yourTrend !== 0 && (
        <Card className={`border ${yourTrend > 0 ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {yourTrend > 0 ? (
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
              <div>
                <p className="font-medium">
                  Your visibility is {yourTrend > 0 ? "trending up" : "trending down"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {yourTrend > 0 ? "+" : ""}{yourTrend}% change over the last 30 days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
