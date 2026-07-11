"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Zap, Target, Shield, AlertTriangle } from "lucide-react";
import { Badge } from "./badge";

interface Competitor {
  name: string;
  logo?: string;
  visibility: number;
  mentions: number;
  authority: number;
  recommendations: number;
  sentiment: number;
  // Expanded data
  strengths?: string[];
  weaknesses?: string[];
  opportunities?: string[];
  threats?: string[];
  positiveMentions?: string[];
  negativeMentions?: string[];
  competitorAdvantage?: string;
  suggestedImprovements?: string[];
}

interface CompetitorHeatmapProps {
  yourBrand: Competitor;
  competitors: Competitor[];
  className?: string;
}

export function CompetitorHeatmap({ yourBrand, competitors, className }: CompetitorHeatmapProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const allCompanies = [yourBrand, ...competitors];
  const columns = [
    { key: "visibility", label: "Visibility", icon: Target },
    { key: "mentions", label: "Mentions", icon: Zap },
    { key: "authority", label: "Authority", icon: Shield },
    { key: "recommendations", label: "Recs", icon: TrendingUp },
    { key: "sentiment", label: "Sentiment", icon: TrendingUp },
  ];

  const getHeatColor = (value: number, metric: string) => {
    // Normalize sentiment from -100 to 100 to 0-100 scale
    const normalizedValue = metric === "sentiment" ? (value + 100) / 2 : value;

    if (normalizedValue >= 70) return "bg-success/80 text-white";
    if (normalizedValue >= 50) return "bg-success/40 text-success-foreground";
    if (normalizedValue >= 30) return "bg-warning/50 text-warning-foreground";
    return "bg-destructive/40 text-destructive-foreground";
  };

  const getComparisonBadge = (yourValue: number, theirValue: number) => {
    const diff = yourValue - theirValue;
    if (diff > 10) return { label: "Ahead", variant: "success" as const };
    if (diff < -10) return { label: "Behind", variant: "danger" as const };
    return { label: "Close", variant: "neutral" as const };
  };

  return (
    <div className={cn("card-premium overflow-hidden", className)}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Competitor Comparison</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Compare your AI visibility metrics against competitors
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {competitors.length} competitors tracked
          </Badge>
        </div>
      </div>

      {/* Heatmap Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">
                Company
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <col.icon className="h-3.5 w-3.5" />
                    <span>{col.label}</span>
                  </div>
                </th>
              ))}
              <th className="px-4 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30 w-12">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {allCompanies.map((company, index) => {
              const isYourBrand = index === 0;
              const isExpanded = expandedRow === company.name;

              return (
                <>
                  <tr
                    key={company.name}
                    className={cn(
                      "transition-colors duration-150",
                      isYourBrand && "bg-primary/5",
                      !isYourBrand && "hover:bg-muted/30",
                      isExpanded && "bg-muted/20"
                    )}
                  >
                    {/* Company Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {company.logo ? (
                          <img
                            src={company.logo}
                            alt={company.name}
                            className="h-8 w-8 rounded-lg object-cover"
                          />
                        ) : (
                          <div
                            className={cn(
                              "h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold",
                              isYourBrand
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {company.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{company.name}</span>
                            {isYourBrand && (
                              <Badge className="badge-primary text-[10px] px-1.5 py-0">
                                You
                              </Badge>
                            )}
                          </div>
                          {!isYourBrand && (
                            <div className="mt-0.5">
                              <Badge
                                className={cn(
                                  "text-[10px] px-1.5 py-0",
                                  getComparisonBadge(yourBrand.visibility, company.visibility).variant === "success"
                                    ? "badge-success"
                                    : getComparisonBadge(yourBrand.visibility, company.visibility).variant === "danger"
                                    ? "badge-danger"
                                    : "badge-neutral"
                                )}
                              >
                                {getComparisonBadge(yourBrand.visibility, company.visibility).label}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Heatmap cells */}
                    {columns.map((col) => {
                      const value = company[col.key as keyof Competitor] as number;
                      return (
                        <td key={col.key} className="px-4 py-4">
                          <div
                            className={cn(
                              "heatmap-cell mx-auto max-w-[60px]",
                              getHeatColor(value, col.key)
                            )}
                          >
                            {col.key === "sentiment" ? (
                              value > 0 ? `+${value}` : value
                            ) : (
                              value
                            )}
                          </div>
                        </td>
                      );
                    })}

                    {/* Expand button */}
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => setExpandedRow(isExpanded ? null : company.name)}
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded details */}
                  {isExpanded && (
                    <tr className="bg-muted/10">
                      <td colSpan={columns.length + 2} className="px-6 py-6">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                          {/* Strengths */}
                          {company.strengths && company.strengths.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-success">
                                <TrendingUp className="h-4 w-4" />
                                <span className="text-sm font-semibold">Strengths</span>
                              </div>
                              <ul className="space-y-1">
                                {company.strengths.map((item, i) => (
                                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-success mt-1.5">•</span>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Weaknesses */}
                          {company.weaknesses && company.weaknesses.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-destructive">
                                <TrendingDown className="h-4 w-4" />
                                <span className="text-sm font-semibold">Weaknesses</span>
                              </div>
                              <ul className="space-y-1">
                                {company.weaknesses.map((item, i) => (
                                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-destructive mt-1.5">•</span>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Opportunities */}
                          {company.opportunities && company.opportunities.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-primary">
                                <Zap className="h-4 w-4" />
                                <span className="text-sm font-semibold">Opportunities</span>
                              </div>
                              <ul className="space-y-1">
                                {company.opportunities.map((item, i) => (
                                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-primary mt-1.5">•</span>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Threats */}
                          {company.threats && company.threats.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-warning">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="text-sm font-semibold">Threats</span>
                              </div>
                              <ul className="space-y-1">
                                {company.threats.map((item, i) => (
                                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-warning mt-1.5">•</span>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Suggested Improvements */}
                        {company.suggestedImprovements && company.suggestedImprovements.length > 0 && (
                          <div className="mt-6 pt-6 border-t border-border">
                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                              <Target className="h-4 w-4 text-primary" />
                              Suggested Actions to Compete
                            </h4>
                            <div className="grid gap-2 md:grid-cols-2">
                              {company.suggestedImprovements.map((item, i) => (
                                <div
                                  key={i}
                                  className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10"
                                >
                                  <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-primary">{i + 1}</span>
                                  </div>
                                  <span className="text-sm">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="px-6 py-4 border-t border-border bg-muted/20">
        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <span className="font-medium">Legend:</span>
          <div className="flex items-center gap-2">
            <div className="h-3 w-6 rounded bg-success/80" />
            <span>Excellent (70+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-6 rounded bg-success/40" />
            <span>Good (50-69)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-6 rounded bg-warning/50" />
            <span>Average (30-49)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-6 rounded bg-destructive/40" />
            <span>Needs Work (&lt;30)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mini heatmap for compact display
interface MiniHeatmapProps {
  data: { label: string; value: number }[];
  className?: string;
}

export function MiniHeatmap({ data, className }: MiniHeatmapProps) {
  const getColor = (value: number) => {
    if (value >= 70) return "bg-success";
    if (value >= 50) return "bg-success/60";
    if (value >= 30) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <div className={cn("flex gap-1", className)}>
      {data.map((item, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div
            className={cn("h-6 w-6 rounded flex items-center justify-center text-[10px] font-bold text-white", getColor(item.value))}
            title={`${item.label}: ${item.value}`}
          >
            {item.value}
          </div>
          <span className="text-[9px] text-muted-foreground truncate w-8 text-center">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
