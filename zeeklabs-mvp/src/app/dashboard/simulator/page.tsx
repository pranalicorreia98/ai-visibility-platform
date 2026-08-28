"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Loader2,
  Target,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Eye,
  ChevronUp,
  MessageSquare,
  TrendingUp,
  Users,
  FileText,
} from "lucide-react";
import { useBrand } from "@/contexts/brand-context";
import { ChatGPTLogo, GeminiLogo, PerplexityLogo } from "@/components/ui/ai-logos";

interface MentionData {
  term: string;
  position: number;
  context: string;
  isCompetitor: boolean;
  competitorName?: string;
}

interface SimulationResult {
  id: string;
  prompt: string;
  results: {
    chatgpt: string | null;
    gemini: string | null;
    perplexity: string | null;
  };
  analysis: {
    chatgpt: {
      mentions: MentionData[];
      sentiment: number;
      position: number | null;
    } | null;
    gemini: {
      mentions: MentionData[];
      sentiment: number;
      position: number | null;
    } | null;
    perplexity: {
      mentions: MentionData[];
      sentiment: number;
      position: number | null;
    } | null;
  };
  errors?: string[];
}

// Suggested prompts - SEO agency style queries to test natural AI visibility
const suggestedPrompts = [
  "What are the best digital marketing agencies in India?",
  "Top SEO tools for keyword research in 2024",
  "Which companies offer the best social media management services?",
  "Recommend e-commerce platforms for small businesses",
  "Best content marketing agencies for B2B companies",
  "What are the top website builders for startups?",
];

// Clean up context text for display - removes markdown artifacts and formats nicely
function cleanContextText(context: string, brandName: string): string {
  // Remove markdown formatting like **text**, *text*, etc.
  let cleaned = context
    .replace(/\*\*/g, "")  // Remove bold markers
    .replace(/\*/g, "")    // Remove italic markers
    .replace(/^[-•]\s*/gm, "") // Remove bullet points
    .replace(/^\d+\.\s*/gm, "") // Remove numbered lists
    .replace(/\s+/g, " ")  // Normalize whitespace
    .trim();

  // If it starts with ellipsis or similar, clean it up
  if (cleaned.startsWith("...")) {
    cleaned = cleaned.substring(3).trim();
  }

  // Capitalize first letter
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  // If brand name exists, highlight where it appears
  if (brandName && cleaned.toLowerCase().includes(brandName.toLowerCase())) {
    // Just return the text - the brand will be visually obvious
    return cleaned.length > 200 ? cleaned.slice(0, 200) + "..." : cleaned;
  }

  return cleaned.length > 200 ? cleaned.slice(0, 200) + "..." : cleaned;
}

// Get sentiment label and style
function getSentimentInfo(sentiment: number) {
  if (sentiment > 0.2) return {
    label: "Positive",
    description: "AI speaks favorably about your brand",
    icon: ThumbsUp,
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30"
  };
  if (sentiment < -0.2) return {
    label: "Negative",
    description: "AI has concerns about your brand",
    icon: ThumbsDown,
    color: "text-red-600",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30"
  };
  return {
    label: "Neutral",
    description: "AI mentions your brand factually",
    icon: Minus,
    color: "text-muted-foreground",
    bgColor: "bg-muted/50",
    borderColor: "border-border"
  };
}

// Simplified AI Result Card
function AIResultCard({
  system,
  response,
  analysis,
  brandName,
  loading,
  error,
  onShowDetails,
}: {
  system: "chatgpt" | "gemini" | "perplexity";
  response: string | null;
  analysis: {
    mentions: MentionData[];
    sentiment: number;
    position: number | null;
  } | null;
  brandName: string | null;
  loading?: boolean;
  error?: string;
  onShowDetails?: () => void;
}) {
  const systemInfo = {
    chatgpt: { name: "ChatGPT", textColor: "text-emerald-600", bgColor: "bg-emerald-500/10", abbrev: "GPT" },
    gemini: { name: "Gemini", textColor: "text-blue-600", bgColor: "bg-blue-500/10", abbrev: "G" },
    perplexity: { name: "Perplexity", textColor: "text-violet-600", bgColor: "bg-violet-500/10", abbrev: "P" },
  };
  const info = systemInfo[system];

  const brandMentions = analysis?.mentions.filter(m => !m.isCompetitor) || [];
  const competitorMentions = analysis?.mentions.filter(m => m.isCompetitor) || [];
  const wasMentioned = brandMentions.length > 0;
  const sentiment = analysis?.sentiment || 0;
  const sentimentInfo = getSentimentInfo(sentiment);
  const position = analysis?.position;

  if (loading) {
    return (
      <Card className="border-border">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className={`h-10 w-10 rounded-lg ${info.bgColor} flex items-center justify-center`}>
              <span className={`text-sm font-bold ${info.textColor}`}>
                {info.abbrev}
              </span>
            </div>
            <div>
              <h3 className="font-semibold">{info.name}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Asking AI...
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-muted rounded animate-pulse" />
            <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h3 className="font-semibold">{info.name}</h3>
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!response) {
    return (
      <Card className="border-border border-dashed">
        <CardContent className="p-5 text-center">
          <div className={`h-12 w-12 rounded-lg ${info.bgColor} flex items-center justify-center mx-auto mb-3`}>
            <span className={`text-lg font-bold ${info.textColor}`}>
              {info.abbrev}
            </span>
          </div>
          <h3 className="font-semibold">{info.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">Run a simulation to see results</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardContent className="p-5">
        {/* Header with mention status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg ${info.bgColor} flex items-center justify-center`}>
              <span className={`text-sm font-bold ${info.textColor}`}>
                {info.abbrev}
              </span>
            </div>
            <div>
              <h3 className="font-semibold">{info.name}</h3>
              <p className="text-xs text-muted-foreground">Analysis complete</p>
            </div>
          </div>
          {wasMentioned ? (
            <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">
              <CheckCircle className="h-3 w-3 mr-1" />
              Mentioned
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              <XCircle className="h-3 w-3 mr-1" />
              Not found
            </Badge>
          )}
        </div>

        {/* Main stats - simple and clear */}
        <div className="space-y-3">
          {/* Was brand mentioned? */}
          <div className={`p-3 rounded-lg ${wasMentioned ? sentimentInfo.bgColor : "bg-muted/30"} border ${wasMentioned ? sentimentInfo.borderColor : "border-border"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <sentimentInfo.icon className={`h-4 w-4 ${wasMentioned ? sentimentInfo.color : "text-muted-foreground"}`} />
                <span className="text-sm font-medium">
                  {wasMentioned ? sentimentInfo.label + " mention" : "Brand not mentioned"}
                </span>
              </div>
              {position && (
                <span className="text-sm font-bold">Rank #{position}</span>
              )}
            </div>
            {wasMentioned && (
              <p className="text-xs text-muted-foreground mt-1">{sentimentInfo.description}</p>
            )}
          </div>

          {/* Context snippet if mentioned - cleaner display */}
          {wasMentioned && brandMentions[0]?.context && (
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center gap-1 mb-2">
                <MessageSquare className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">AI mentioned your brand:</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <p className="text-sm leading-relaxed">
                  {/* Clean up the context - remove markdown artifacts and show cleaner text */}
                  {cleanContextText(brandMentions[0].context, brandName || "")}
                </p>
              </div>
              {position && (
                <div className="mt-2 pt-2 border-t border-border/50 flex items-center gap-2">
                  <Target className="h-3 w-3 text-primary" />
                  <span className="text-xs text-muted-foreground">
                    Ranked <span className="font-medium text-foreground">#{position}</span> in the response
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Competitor mentions */}
          {competitorMentions.length > 0 && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-amber-600" />
                <span className="text-sm">
                  <span className="font-medium">{competitorMentions.length} competitor{competitorMentions.length > 1 ? "s" : ""}</span>
                  <span className="text-muted-foreground"> also mentioned</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {[...new Set(competitorMentions.map(m => m.competitorName))].slice(0, 3).map((name, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* View full response */}
        {onShowDetails && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-3 text-muted-foreground"
            onClick={onShowDetails}
          >
            <Eye className="h-4 w-4 mr-2" />
            View AI&apos;s full response
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Brand Summary component - key insights from all AI responses
function BrandSummary({
  result,
  brandName,
}: {
  result: SimulationResult;
  brandName: string | null;
}) {
  const chatgptAnalysis = result.analysis.chatgpt;
  const geminiAnalysis = result.analysis.gemini;
  const perplexityAnalysis = result.analysis.perplexity;

  const chatgptMentioned = chatgptAnalysis?.mentions.some(m => !m.isCompetitor);
  const geminiMentioned = geminiAnalysis?.mentions.some(m => !m.isCompetitor);
  const perplexityMentioned = perplexityAnalysis?.mentions.some(m => !m.isCompetitor);

  const mentionedCount = [chatgptMentioned, geminiMentioned, perplexityMentioned].filter(Boolean).length;
  const totalSystems = [result.results.chatgpt, result.results.gemini, result.results.perplexity].filter(Boolean).length;

  // Calculate average sentiment
  const sentiments = [
    chatgptAnalysis?.sentiment,
    geminiAnalysis?.sentiment,
    perplexityAnalysis?.sentiment
  ].filter((s): s is number => s !== undefined && s !== null);
  const avgSentiment = sentiments.length > 0
    ? sentiments.reduce((a, b) => a + b, 0) / sentiments.length
    : 0;

  // Get best position
  const positions = [
    chatgptAnalysis?.position,
    geminiAnalysis?.position,
    perplexityAnalysis?.position
  ].filter((p): p is number => p !== null && p !== undefined);
  const bestPosition = positions.length > 0 ? Math.min(...positions) : null;

  // Get all competitor names
  const allCompetitors = [
    ...(chatgptAnalysis?.mentions || []),
    ...(geminiAnalysis?.mentions || []),
    ...(perplexityAnalysis?.mentions || [])
  ].filter(m => m.isCompetitor);
  const uniqueCompetitors = [...new Set(allCompetitors.map(m => m.competitorName))];

  // Generate summary text
  const getSummaryText = () => {
    if (mentionedCount === 0) {
      return `${brandName || "Your brand"} was not mentioned by any AI system in response to this query. This suggests low visibility for this type of question. Consider creating content that directly addresses this topic.`;
    }

    if (mentionedCount === totalSystems) {
      if (avgSentiment > 0.2) {
        return `Great news! ${brandName || "Your brand"} was mentioned positively by all AI systems. ${bestPosition ? `You ranked #${bestPosition} in the recommendations.` : ""} AI assistants are likely to recommend you for queries like this.`;
      } else if (avgSentiment < -0.2) {
        return `${brandName || "Your brand"} was mentioned by all AI systems, but the tone was negative. Consider addressing any issues that might be causing this perception.`;
      }
      return `${brandName || "Your brand"} was mentioned by all AI systems in a neutral context. ${bestPosition ? `You appeared at position #${bestPosition}.` : ""} There's opportunity to improve how AI describes your brand.`;
    }

    return `${brandName || "Your brand"} was mentioned by ${mentionedCount} of ${totalSystems} AI systems. ${
      chatgptMentioned && !geminiMentioned ? "ChatGPT mentioned you but Gemini did not." :
      !chatgptMentioned && geminiMentioned ? "Gemini mentioned you but ChatGPT did not." : ""
    } Consider why one AI knows about you but the other doesn't.`;
  };

  const sentimentInfo = getSentimentInfo(avgSentiment);

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Summary for {brandName || "Your Brand"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <div className={`text-2xl font-bold ${mentionedCount > 0 ? "text-emerald-600" : "text-red-600"}`}>
              {mentionedCount}/{totalSystems}
            </div>
            <div className="text-xs text-muted-foreground">AI Mentions</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <div className={`text-2xl font-bold ${sentimentInfo.color}`}>
              {avgSentiment > 0 ? "+" : ""}{(avgSentiment * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground">Sentiment</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <div className="text-2xl font-bold">
              {bestPosition ? `#${bestPosition}` : "—"}
            </div>
            <div className="text-xs text-muted-foreground">Best Rank</div>
          </div>
        </div>

        {/* Summary text */}
        <div className={`p-4 rounded-lg ${sentimentInfo.bgColor} border ${sentimentInfo.borderColor}`}>
          <div className="flex items-start gap-3">
            <sentimentInfo.icon className={`h-5 w-5 ${sentimentInfo.color} mt-0.5 shrink-0`} />
            <p className="text-sm leading-relaxed">{getSummaryText()}</p>
          </div>
        </div>

        {/* Competitors mentioned */}
        {uniqueCompetitors.length > 0 && (
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Competitors in AI responses:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {uniqueCompetitors.map((name, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Quick tips */}
        {mentionedCount === 0 && (
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">How to improve:</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Create FAQ content answering this type of question</li>
              <li>• Get listed on review sites AI systems reference</li>
              <li>• Build more backlinks from authoritative sources</li>
            </ul>
          </div>
        )}

        {mentionedCount > 0 && avgSentiment < 0.2 && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium">Room to improve:</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Add more positive customer testimonials online</li>
              <li>• Address any negative reviews on major platforms</li>
              <li>• Publish case studies showing successful outcomes</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function SimulatorPage() {
  // Use shared brand context
  const { selectedBrandId, selectedBrand, refreshVisibilityData } = useBrand();

  const [prompt, setPrompt] = useState("");
  const [selectedSystems, setSelectedSystems] = useState<string[]>(["chatgpt", "gemini", "perplexity"]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRawResponse, setShowRawResponse] = useState<"chatgpt" | "gemini" | "perplexity" | null>(null);

  const toggleSystem = (system: string) => {
    setSelectedSystems((prev) =>
      prev.includes(system)
        ? prev.filter((s) => s !== system)
        : [...prev, system]
    );
  };

  const handleSimulate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    if (selectedSystems.length === 0) {
      setError("Please select at least one AI system");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setShowRawResponse(null);

    try {
      const response = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          systems: selectedSystems,
          brandId: selectedBrandId || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to run simulation");
      }

      setResult(data);
      // Refresh the visibility data after simulation so Overview shows latest data
      refreshVisibilityData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Prompt Simulator</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Test if AI assistants naturally mention your brand when users search for products or services
        </p>
      </div>

      {/* Simulation input */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Test AI Visibility</CardTitle>
          <CardDescription>
            Enter a search query a potential customer might ask — see if your brand appears in AI responses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Prompt input */}
          <div className="space-y-2">
            <Textarea
              placeholder="What are the best digital marketing agencies in Mumbai?"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              maxLength={500}
              className="resize-none"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{prompt.length}/500</span>
              <div className="flex items-center gap-1">
                <Lightbulb className="h-3 w-3" />
                Try search queries your target audience would use
              </div>
            </div>
          </div>

          {/* Suggested prompts */}
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => setPrompt(suggestion)}
                className="px-2.5 py-1 rounded-md text-xs bg-muted hover:bg-muted/80 transition-colors text-muted-foreground hover:text-foreground"
              >
                {suggestion.length > 40 ? suggestion.slice(0, 40) + "..." : suggestion}
              </button>
            ))}
          </div>

          {/* Options row */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            {/* AI Systems */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Ask:</span>
              <button
                onClick={() => toggleSystem("chatgpt")}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all duration-200 ${
                  selectedSystems.includes("chatgpt")
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 shadow-sm"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-muted hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <ChatGPTLogo
                  size={18}
                  className={selectedSystems.includes("chatgpt") ? "text-emerald-600" : "text-gray-400"}
                />
                <span className={`text-sm font-medium ${
                  selectedSystems.includes("chatgpt") ? "text-emerald-700 dark:text-emerald-600" : "text-gray-500 dark:text-muted-foreground"
                }`}>ChatGPT</span>
                {selectedSystems.includes("chatgpt") && (
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                )}
              </button>

              <button
                onClick={() => toggleSystem("gemini")}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all duration-200 ${
                  selectedSystems.includes("gemini")
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 shadow-sm"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-muted hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <GeminiLogo
                  size={18}
                  className={selectedSystems.includes("gemini") ? "" : "opacity-40"}
                />
                <span className={`text-sm font-medium ${
                  selectedSystems.includes("gemini") ? "text-blue-700 dark:text-blue-600" : "text-gray-500 dark:text-muted-foreground"
                }`}>Gemini</span>
                {selectedSystems.includes("gemini") && (
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                )}
              </button>

              <button
                onClick={() => toggleSystem("perplexity")}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all duration-200 ${
                  selectedSystems.includes("perplexity")
                    ? "border-violet-500 bg-violet-50 dark:bg-violet-500/10 shadow-sm"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-muted hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <PerplexityLogo
                  size={18}
                  className={selectedSystems.includes("perplexity") ? "text-violet-600" : "text-gray-400"}
                />
                <span className={`text-sm font-medium ${
                  selectedSystems.includes("perplexity") ? "text-violet-700 dark:text-violet-600" : "text-gray-500 dark:text-muted-foreground"
                }`}>Perplexity</span>
                {selectedSystems.includes("perplexity") && (
                  <CheckCircle className="h-4 w-4 text-violet-500" />
                )}
              </button>
            </div>

            {/* Brand indicator */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Tracking:</span>
              {selectedBrand ? (
                <Badge variant="outline" className="font-medium">
                  {selectedBrand.name}
                </Badge>
              ) : (
                <span className="text-sm text-muted-foreground">No brand selected</span>
              )}
            </div>

            {/* Submit button */}
            <Button
              onClick={handleSimulate}
              disabled={loading || !prompt.trim() || selectedSystems.length === 0}
              className="ml-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Asking AI...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Run Simulation
                </>
              )}
            </Button>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {(loading || result) && (
        <div className="space-y-4">
          {/* AI Response Cards */}
          <div className={`grid gap-4 ${selectedSystems.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
            {selectedSystems.includes("chatgpt") && (
              <AIResultCard
                system="chatgpt"
                response={result?.results.chatgpt || null}
                analysis={result?.analysis.chatgpt || null}
                brandName={selectedBrand?.name || null}
                loading={loading}
                error={result?.errors?.find((e) => e.startsWith("chatgpt"))?.split(": ")[1]}
                onShowDetails={() => setShowRawResponse(showRawResponse === "chatgpt" ? null : "chatgpt")}
              />
            )}
            {selectedSystems.includes("gemini") && (
              <AIResultCard
                system="gemini"
                response={result?.results.gemini || null}
                analysis={result?.analysis.gemini || null}
                brandName={selectedBrand?.name || null}
                loading={loading}
                error={result?.errors?.find((e) => e.startsWith("gemini"))?.split(": ")[1]}
                onShowDetails={() => setShowRawResponse(showRawResponse === "gemini" ? null : "gemini")}
              />
            )}
            {selectedSystems.includes("perplexity") && (
              <AIResultCard
                system="perplexity"
                response={result?.results.perplexity || null}
                analysis={result?.analysis.perplexity || null}
                brandName={selectedBrand?.name || null}
                loading={loading}
                error={result?.errors?.find((e) => e.startsWith("perplexity"))?.split(": ")[1]}
                onShowDetails={() => setShowRawResponse(showRawResponse === "perplexity" ? null : "perplexity")}
              />
            )}
          </div>

          {/* Brand Summary */}
          {result && !loading && (
            <BrandSummary result={result} brandName={selectedBrand?.name || null} />
          )}
        </div>
      )}

      {/* Raw response panel */}
      {showRawResponse && result && (
        <Card className="border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {showRawResponse === "chatgpt" ? "ChatGPT" : showRawResponse === "gemini" ? "Gemini" : "Perplexity"}&apos;s Full Response
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRawResponse(null)}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm whitespace-pre-wrap max-h-80 overflow-y-auto p-4 bg-muted/30 rounded-lg border border-border">
              {showRawResponse === "chatgpt" ? result.results.chatgpt : showRawResponse === "gemini" ? result.results.gemini : result.results.perplexity}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
