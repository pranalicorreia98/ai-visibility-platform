"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Lightbulb,
  Clock,
  TrendingUp,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  Circle,
  Loader2,
} from "lucide-react";

interface Recommendation {
  id: string;
  category: string;
  priority: string;
  title: string;
  description: string;
  effort: string;
  timeline: string;
  expectedImpact: string;
  actionUrl?: string;
  competitorGap?: string;
  isCompleted: boolean;
}

interface Brand {
  id: string;
  name: string;
}

export default function RecommendationsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [visibilityScore, setVisibilityScore] = useState(0);
  const [projectedScore, setProjectedScore] = useState(0);

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    if (selectedBrandId) {
      fetchRecommendations();
    }
  }, [selectedBrandId]);

  const fetchBrands = async () => {
    try {
      const response = await fetch("/api/brands");
      if (response.ok) {
        const data = await response.json();
        setBrands(data);
        if (data.length > 0) {
          setSelectedBrandId(data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch brands:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/recommendations?brandId=${selectedBrandId}`);
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
      }

      // Also fetch visibility score
      const visResponse = await fetch(`/api/visibility?brandId=${selectedBrandId}`);
      if (visResponse.ok) {
        const visData = await visResponse.json();
        setVisibilityScore(visData.score.overall);
        setProjectedScore(Math.min(100, visData.score.overall + 25));
      }
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async () => {
    setGenerating(true);
    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId: selectedBrandId }),
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations);
        if (data.context) {
          setVisibilityScore(data.context.visibilityScore);
          setProjectedScore(data.context.projectedScore);
        }
      }
    } catch (err) {
      console.error("Failed to generate recommendations:", err);
    } finally {
      setGenerating(false);
    }
  };

  const toggleComplete = async (id: string, currentStatus: boolean) => {
    // Optimistic update
    setRecommendations((prev) =>
      prev.map((rec) =>
        rec.id === id ? { ...rec, isCompleted: !currentStatus } : rec
      )
    );

    try {
      await fetch(`/api/recommendations/${id}/complete`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: !currentStatus }),
      });
    } catch (err) {
      // Revert on error
      setRecommendations((prev) =>
        prev.map((rec) =>
          rec.id === id ? { ...rec, isCompleted: currentStatus } : rec
        )
      );
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "entity":
        return "🏢";
      case "content":
        return "📝";
      case "authority":
        return "⭐";
      case "technical":
        return "⚙️";
      case "community":
        return "👥";
      default:
        return "💡";
    }
  };

  const highPriority = recommendations.filter((r) => r.priority === "high" && !r.isCompleted);
  const mediumPriority = recommendations.filter((r) => r.priority === "medium" && !r.isCompleted);
  const lowPriority = recommendations.filter((r) => r.priority === "low" && !r.isCompleted);
  const completed = recommendations.filter((r) => r.isCompleted);

  if (loading && brands.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recommendations</h1>
          <p className="text-muted-foreground">
            Actionable steps to improve your AI visibility
          </p>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-[150px] w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    );
  }

  if (brands.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recommendations</h1>
          <p className="text-muted-foreground">
            Actionable steps to improve your AI visibility
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No brands configured</p>
              <p className="text-sm">Add a brand in Settings to get personalized recommendations</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recommendations</h1>
          <p className="text-muted-foreground">
            Actionable steps to improve your AI visibility
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedBrandId} onValueChange={setSelectedBrandId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a brand" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={generateRecommendations} disabled={generating}>
            {generating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Generate
          </Button>
        </div>
      </div>

      {/* Score Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{visibilityScore}</div>
              <div className="text-sm text-muted-foreground">Current Score</div>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <div className="text-sm font-medium text-green-600">
                  +{projectedScore - visibilityScore} potential
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">{projectedScore}</div>
              <div className="text-sm text-muted-foreground">Projected Score</div>
            </div>
          </div>
          <Progress value={visibilityScore} className="mt-6 h-3" />
          <p className="text-xs text-muted-foreground text-center mt-2">
            Complete the recommendations below to reach your projected score
          </p>
        </CardContent>
      </Card>

      {recommendations.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No recommendations yet</p>
              <p className="text-sm mb-4">
                Click &quot;Generate&quot; to get personalized recommendations
              </p>
              <Button onClick={generateRecommendations} disabled={generating}>
                {generating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Lightbulb className="mr-2 h-4 w-4" />
                )}
                Generate Recommendations
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* High Priority */}
          {highPriority.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                High Priority ({highPriority.length})
              </h2>
              {highPriority.map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  onToggleComplete={toggleComplete}
                  getCategoryIcon={getCategoryIcon}
                />
              ))}
            </div>
          )}

          {/* Medium Priority */}
          {mediumPriority.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                Medium Priority ({mediumPriority.length})
              </h2>
              {mediumPriority.map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  onToggleComplete={toggleComplete}
                  getCategoryIcon={getCategoryIcon}
                />
              ))}
            </div>
          )}

          {/* Low Priority / Quick Wins */}
          {lowPriority.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                Quick Wins ({lowPriority.length})
              </h2>
              {lowPriority.map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  onToggleComplete={toggleComplete}
                  getCategoryIcon={getCategoryIcon}
                  compact
                />
              ))}
            </div>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4" />
                Completed ({completed.length})
              </h2>
              {completed.map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  onToggleComplete={toggleComplete}
                  getCategoryIcon={getCategoryIcon}
                  compact
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function RecommendationCard({
  recommendation,
  onToggleComplete,
  getCategoryIcon,
  compact = false,
}: {
  recommendation: Recommendation;
  onToggleComplete: (id: string, current: boolean) => void;
  getCategoryIcon: (category: string) => string;
  compact?: boolean;
}) {
  return (
    <Card className={recommendation.isCompleted ? "opacity-60" : ""}>
      <CardContent className={compact ? "pt-4 pb-4" : "pt-6"}>
        <div className="flex items-start gap-4">
          <button
            onClick={() => onToggleComplete(recommendation.id, recommendation.isCompleted)}
            className="mt-1"
          >
            {recommendation.isCompleted ? (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            ) : (
              <Circle className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
            )}
          </button>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className={`font-semibold ${recommendation.isCompleted ? "line-through" : ""}`}>
                  {getCategoryIcon(recommendation.category)} {recommendation.title}
                </h3>
                {!compact && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {recommendation.description}
                  </p>
                )}
              </div>
              {recommendation.actionUrl && !recommendation.isCompleted && (
                <Button variant="outline" size="sm" asChild>
                  <a href={recommendation.actionUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Action
                  </a>
                </Button>
              )}
            </div>
            {!compact && (
              <div className="flex flex-wrap gap-3 mt-4">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {recommendation.effort}
                </Badge>
                <Badge variant="outline">📅 {recommendation.timeline}</Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {recommendation.expectedImpact}
                </Badge>
              </div>
            )}
            {compact && (
              <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                <span>{recommendation.effort}</span>
                <span>•</span>
                <span>{recommendation.expectedImpact}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
