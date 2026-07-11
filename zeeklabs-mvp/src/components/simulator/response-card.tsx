"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getSentimentLabel, getSentimentEmoji } from "@/lib/analysis";
import { Sparkles, AlertTriangle, Hash, ThumbsUp, ThumbsDown, Minus } from "lucide-react";
import type { Mention } from "@/lib/analysis";

interface ResponseCardProps {
  system: "chatgpt" | "gemini";
  response: string | null;
  analysis: {
    mentions: Mention[];
    sentiment: number;
    position: number | null;
  } | null;
  brandName: string | null;
  loading?: boolean;
  error?: string;
}

export function ResponseCard({
  system,
  response,
  analysis,
  brandName,
  loading,
  error,
}: ResponseCardProps) {
  const systemInfo = {
    chatgpt: {
      name: "ChatGPT",
      gradient: "from-emerald-500 to-teal-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      text: "text-emerald-600",
      icon: "GPT",
    },
    gemini: {
      name: "Google Gemini",
      gradient: "from-blue-500 to-indigo-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      text: "text-blue-600",
      icon: "G",
    },
  };

  const info = systemInfo[system];

  const highlightResponse = (text: string): string => {
    if (!brandName || !analysis) return text;

    let highlighted = text;

    // Sort mentions by position (descending) to avoid position shifts
    const sortedMentions = [...analysis.mentions].sort((a, b) => b.position - a.position);

    for (const mention of sortedMentions) {
      const before = highlighted.slice(0, mention.position);
      const term = highlighted.slice(mention.position, mention.position + mention.term.length);
      const after = highlighted.slice(mention.position + mention.term.length);

      if (mention.isCompetitor) {
        highlighted = `${before}<mark class="bg-red-500/20 text-red-600 px-1 py-0.5 rounded font-medium">${term}</mark>${after}`;
      } else {
        highlighted = `${before}<mark class="bg-primary/20 text-primary px-1 py-0.5 rounded font-medium">${term}</mark>${after}`;
      }
    }

    return highlighted;
  };

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment > 0.2) return <ThumbsUp className="h-4 w-4" />;
    if (sentiment < -0.2) return <ThumbsDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  return (
    <Card className="overflow-hidden border-border bg-card/50 backdrop-blur">
      {/* Header with gradient */}
      <CardHeader className={`relative pb-4 border-b border-border bg-gradient-to-r ${info.gradient} bg-opacity-10`}>
        <div className="absolute inset-0 bg-gradient-to-r opacity-5" style={{ background: `linear-gradient(to right, var(--tw-gradient-stops))` }} />
        <div className="relative flex items-center gap-4">
          <div className={`h-12 w-12 rounded-2xl ${info.bg} ${info.border} border-2 flex items-center justify-center`}>
            <span className={`text-base font-bold ${info.text}`}>
              {info.icon}
            </span>
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {info.name}
              <Sparkles className={`h-4 w-4 ${info.text}`} />
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">AI Response</p>
          </div>
          {analysis?.position && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/80 border border-border">
              <Hash className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold">{analysis.position}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-5">
        {loading ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span>Generating response...</span>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full shimmer" />
              <Skeleton className="h-4 w-5/6 shimmer" />
              <Skeleton className="h-4 w-4/6 shimmer" />
              <Skeleton className="h-4 w-full shimmer" />
              <Skeleton className="h-4 w-3/4 shimmer" />
            </div>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">Error</p>
              <p className="text-sm text-destructive/80 mt-0.5">{error}</p>
            </div>
          </div>
        ) : response ? (
          <>
            {/* Response text */}
            <div
              className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: highlightResponse(response) }}
            />

            {/* Analysis badges */}
            {analysis && (
              <div className="mt-5 pt-4 border-t border-border">
                <div className="flex flex-wrap gap-2">
                  {/* Sentiment badge */}
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                    getSentimentLabel(analysis.sentiment) === "positive"
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                      : getSentimentLabel(analysis.sentiment) === "negative"
                      ? "bg-red-500/10 text-red-600 border border-red-500/30"
                      : "bg-gray-500/10 text-gray-600 border border-gray-500/30"
                  }`}>
                    {getSentimentIcon(analysis.sentiment)}
                    <span className="capitalize">{getSentimentLabel(analysis.sentiment)}</span>
                    <span className="text-xs opacity-70">({analysis.sentiment.toFixed(2)})</span>
                  </div>

                  {/* Brand mentions */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/30">
                    <span>{analysis.mentions.filter((m) => !m.isCompetitor).length}</span>
                    <span>brand mentions</span>
                  </div>

                  {/* Competitor mentions */}
                  {analysis.mentions.filter((m) => m.isCompetitor).length > 0 && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-red-500/10 text-red-600 border border-red-500/30">
                      <span>{analysis.mentions.filter((m) => m.isCompetitor).length}</span>
                      <span>competitor mentions</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-12 text-center">
            <div className={`mx-auto h-16 w-16 rounded-2xl ${info.bg} ${info.border} border flex items-center justify-center mb-4`}>
              <Sparkles className={`h-8 w-8 ${info.text}`} />
            </div>
            <p className="text-muted-foreground font-medium">No response yet</p>
            <p className="text-sm text-muted-foreground mt-1">Run a simulation to see results</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
