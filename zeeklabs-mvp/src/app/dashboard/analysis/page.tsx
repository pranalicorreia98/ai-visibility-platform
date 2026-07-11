"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  CheckCircle,
  ExternalLink,
  Globe,
  Lightbulb,
  Loader2,
  MessageSquare,
  Play,
  Target,
  TrendingUp,
  Users,
  Zap,
  Link2,
} from "lucide-react";
import Link from "next/link";
import { useBrand, AnalysisResult } from "@/contexts/brand-context";
import { ChatGPTLogo, GeminiLogo, PerplexityLogo } from "@/components/ui/ai-logos";

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

      {/* Quick Stats from Visibility Data */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Overall Score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {result?.scores?.overall || vis?.score?.overall || 0}
              <span className="text-lg text-muted-foreground font-normal">/100</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Brand Awareness
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {result?.scores?.brandAwareness || 0}
              <span className="text-lg text-muted-foreground font-normal">/100</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Market Position
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {result?.scores?.marketPosition || 0}
              <span className="text-lg text-muted-foreground font-normal">/100</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Content Visibility
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {result?.scores?.contentVisibility || 0}
              <span className="text-lg text-muted-foreground font-normal">/100</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            AI Platform Scores
          </CardTitle>
          <CardDescription>Performance across major AI platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PlatformCard
              name="ChatGPT"
              icon={<ChatGPTLogo size={32} />}
              score={vis?.score?.chatgpt || 0}
              mentions={vis?.mentions?.chatgpt || 0}
            />
            <PlatformCard
              name="Gemini"
              icon={<GeminiLogo size={32} />}
              score={vis?.score?.gemini || 0}
              mentions={vis?.mentions?.gemini || 0}
            />
            <PlatformCard
              name="Perplexity"
              icon={<PerplexityLogo size={32} />}
              score={vis?.score?.perplexity || 0}
              mentions={vis?.mentions?.perplexity || 0}
            />
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {result ? (
        <>
          {/* AI Visibility Insights */}
          {result.aiVisibility && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  AI Visibility Insights
                </CardTitle>
                <CardDescription>How AI systems perceive and recommend your brand</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Mention Frequency</p>
                    <p className="text-lg font-semibold">{result.aiVisibility.mentionFrequency}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Typical Position</p>
                    <p className="text-lg font-semibold">
                      {result.aiVisibility.typicalPosition ? `#${result.aiVisibility.typicalPosition}` : "Not ranked"}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Recommendation Likelihood</p>
                    <p className="text-lg font-semibold">{result.aiVisibility.recommendationLikelihood}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <p className="text-sm text-muted-foreground mb-1">vs Competitors</p>
                    <p className="text-lg font-semibold">{result.aiVisibility.competitorMentionGap}</p>
                  </div>
                </div>

                {result.aiVisibility.improvementAreas.length > 0 && (
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-primary" />
                      Areas for Improvement
                    </h4>
                    <ul className="space-y-1">
                      {result.aiVisibility.improvementAreas.map((area, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Competitor Comparison */}
          {result.competitorComparison && result.competitorComparison.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Competitor Analysis
                </CardTitle>
                <CardDescription>How you compare to competitors in AI visibility</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.competitorComparison.map((comp, i) => (
                    <div key={i} className="p-4 rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{comp.name}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            comp.sentiment === "positive" ? "default" :
                            comp.sentiment === "negative" ? "destructive" : "secondary"
                          }>
                            {comp.sentiment}
                          </Badge>
                          <span className="text-sm font-semibold">{comp.overallScore}/100</span>
                        </div>
                      </div>
                      <Progress value={comp.overallScore} className="h-2 mb-3" />
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Strengths</p>
                          <ul className="space-y-1">
                            {comp.strengths.slice(0, 2).map((s, j) => (
                              <li key={j} className="flex items-start gap-1">
                                <CheckCircle className="h-3 w-3 text-emerald-600 mt-1 shrink-0" />
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Weaknesses</p>
                          <ul className="space-y-1">
                            {comp.weaknesses.slice(0, 2).map((w, j) => (
                              <li key={j} className="flex items-start gap-1">
                                <AlertCircle className="h-3 w-3 text-amber-600 mt-1 shrink-0" />
                                <span>{w}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {result.recommendations && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Recommendations
                </CardTitle>
                <CardDescription>Actionable steps to improve AI visibility</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <h4 className="text-sm font-medium text-emerald-600 mb-2">Immediate Actions</h4>
                    <ul className="space-y-2">
                      {result.recommendations.immediate.slice(0, 3).map((rec, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-emerald-600">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <h4 className="text-sm font-medium text-blue-600 mb-2">Short-Term</h4>
                    <ul className="space-y-2">
                      {result.recommendations.shortTerm.slice(0, 3).map((rec, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-violet-500/10 border border-violet-500/20">
                    <h4 className="text-sm font-medium text-violet-600 mb-2">Long-Term</h4>
                    <ul className="space-y-2">
                      {result.recommendations.longTerm.slice(0, 3).map((rec, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-violet-600">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Citations */}
          {result.citations && result.citations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-primary" />
                  Citation Opportunities
                </CardTitle>
                <CardDescription>Sources that could boost your AI visibility</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.citations.slice(0, 5).map((citation, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                      <div>
                        <p className="text-sm font-medium">{citation.source}</p>
                        <p className="text-xs text-muted-foreground">{citation.type} • {citation.relevance}</p>
                      </div>
                      {citation.url && (
                        <a
                          href={citation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
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
