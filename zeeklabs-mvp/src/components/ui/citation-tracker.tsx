"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
  Link2,
  Sparkles,
  ArrowRight,
  Globe,
  Star,
  TrendingUp,
} from "lucide-react";
import { Badge } from "./badge";
import { Button } from "./button";

interface Citation {
  id: string;
  source: string;
  url?: string;
  logo?: string;
  mentioned: boolean;
  authority: number;
  quality: "high" | "medium" | "low" | "missing";
  opportunity: "high" | "medium" | "low";
  status: "cited" | "missing" | "weak";
  // Expanded data
  suggestedContent?: string;
  recommendedActions?: string[];
  aiRecommendation?: string;
  lastChecked?: string;
  category?: string;
}

interface CitationTrackerProps {
  citations: Citation[];
  className?: string;
  onClaimCitation?: (citation: Citation) => void;
}

export function CitationTracker({ citations, className, onClaimCitation }: CitationTrackerProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"authority" | "opportunity">("opportunity");

  const sortedCitations = [...citations].sort((a, b) => {
    if (sortBy === "authority") return b.authority - a.authority;
    const opportunityOrder = { high: 3, medium: 2, low: 1 };
    return opportunityOrder[b.opportunity] - opportunityOrder[a.opportunity];
  });

  const statusConfig = {
    cited: {
      icon: CheckCircle,
      color: "text-success",
      bg: "bg-success/10",
      label: "Cited",
    },
    missing: {
      icon: XCircle,
      color: "text-destructive",
      bg: "bg-destructive/10",
      label: "Missing",
    },
    weak: {
      icon: AlertCircle,
      color: "text-warning",
      bg: "bg-warning/10",
      label: "Weak",
    },
  };

  const qualityConfig = {
    high: { color: "badge-success", label: "High Quality" },
    medium: { color: "badge-warning", label: "Medium" },
    low: { color: "badge-danger", label: "Low" },
    missing: { color: "badge-neutral", label: "Missing" },
  };

  const opportunityConfig = {
    high: { color: "badge-primary", label: "High Priority" },
    medium: { color: "badge-warning", label: "Medium" },
    low: { color: "badge-neutral", label: "Low" },
  };

  const citedCount = citations.filter((c) => c.status === "cited").length;
  const missingCount = citations.filter((c) => c.status === "missing").length;
  const weakCount = citations.filter((c) => c.status === "weak").length;

  return (
    <div className={cn("card-premium overflow-hidden", className)}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link2 className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Citation Tracker</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Track where your brand is cited across AI data sources
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Stats */}
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-success" />
                <span className="font-medium">{citedCount}</span>
                <span className="text-muted-foreground">cited</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-warning" />
                <span className="font-medium">{weakCount}</span>
                <span className="text-muted-foreground">weak</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-destructive" />
                <span className="font-medium">{missingCount}</span>
                <span className="text-muted-foreground">missing</span>
              </div>
            </div>
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "authority" | "opportunity")}
              className="text-sm px-3 py-1.5 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="opportunity">Sort by Opportunity</option>
              <option value="authority">Sort by Authority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table-premium">
          <thead>
            <tr>
              <th>Citation Source</th>
              <th className="text-center">Mentioned</th>
              <th className="text-center">Authority</th>
              <th className="text-center">Quality</th>
              <th className="text-center">Opportunity</th>
              <th className="text-center">Status</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {sortedCitations.map((citation) => {
              const isExpanded = expandedRow === citation.id;
              const StatusIcon = statusConfig[citation.status].icon;

              return (
                <>
                  <tr
                    key={citation.id}
                    className={cn(
                      "cursor-pointer",
                      isExpanded && "bg-muted/20"
                    )}
                    onClick={() => setExpandedRow(isExpanded ? null : citation.id)}
                  >
                    {/* Source */}
                    <td>
                      <div className="flex items-center gap-3">
                        {citation.logo ? (
                          <img
                            src={citation.logo}
                            alt={citation.source}
                            className="h-8 w-8 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {citation.source}
                            {citation.url && (
                              <a
                                href={citation.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-muted-foreground hover:text-primary"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                          {citation.category && (
                            <span className="text-xs text-muted-foreground">{citation.category}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Mentioned */}
                    <td className="text-center">
                      {citation.mentioned ? (
                        <CheckCircle className="h-5 w-5 text-success mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive mx-auto" />
                      )}
                    </td>

                    {/* Authority */}
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-3.5 w-3.5 text-warning" />
                        <span className="font-medium">{citation.authority}</span>
                      </div>
                    </td>

                    {/* Quality */}
                    <td className="text-center">
                      <Badge className={cn("text-xs", qualityConfig[citation.quality].color)}>
                        {qualityConfig[citation.quality].label}
                      </Badge>
                    </td>

                    {/* Opportunity */}
                    <td className="text-center">
                      <Badge className={cn("text-xs", opportunityConfig[citation.opportunity].color)}>
                        {opportunityConfig[citation.opportunity].label}
                      </Badge>
                    </td>

                    {/* Status */}
                    <td className="text-center">
                      <div
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                          statusConfig[citation.status].bg,
                          statusConfig[citation.status].color
                        )}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />
                        {statusConfig[citation.status].label}
                      </div>
                    </td>

                    {/* Expand */}
                    <td className="text-center">
                      <div className="p-1 rounded hover:bg-muted inline-flex">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {isExpanded && (
                    <tr className="bg-muted/10">
                      <td colSpan={7} className="p-6">
                        <div className="grid gap-6 md:grid-cols-3">
                          {/* AI Recommendation */}
                          {citation.aiRecommendation && (
                            <div className="md:col-span-2 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 rounded-lg bg-primary/20">
                                  <Sparkles className="h-4 w-4 text-primary" />
                                </div>
                                <span className="font-semibold text-sm">AI Recommendation</span>
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {citation.aiRecommendation}
                              </p>
                            </div>
                          )}

                          {/* Suggested Content */}
                          {citation.suggestedContent && (
                            <div className="p-4 rounded-xl bg-card border border-border">
                              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-success" />
                                Suggested Content
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {citation.suggestedContent}
                              </p>
                            </div>
                          )}

                          {/* Recommended Actions */}
                          {citation.recommendedActions && citation.recommendedActions.length > 0 && (
                            <div className="md:col-span-3">
                              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                <ArrowRight className="h-4 w-4 text-primary" />
                                Recommended Actions
                              </h4>
                              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                                {citation.recommendedActions.map((action, i) => (
                                  <div
                                    key={i}
                                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                  >
                                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                      <span className="text-xs font-bold text-primary">{i + 1}</span>
                                    </div>
                                    <span className="text-sm">{action}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        {citation.status !== "cited" && onClaimCitation && (
                          <div className="mt-6 flex justify-end">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                onClaimCitation(citation);
                              }}
                              className="bg-primary hover:bg-primary/90"
                            >
                              <Link2 className="h-4 w-4 mr-2" />
                              Claim This Citation
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </div>
                        )}

                        {/* Last Checked */}
                        {citation.lastChecked && (
                          <p className="text-xs text-muted-foreground mt-4 text-right">
                            Last checked: {citation.lastChecked}
                          </p>
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

      {/* Empty State */}
      {citations.length === 0 && (
        <div className="p-12 text-center">
          <Link2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-semibold mb-1">No citations tracked yet</h3>
          <p className="text-sm text-muted-foreground">
            Run an analysis to discover citation opportunities
          </p>
        </div>
      )}
    </div>
  );
}

// Compact citation status for dashboard
interface CitationStatusProps {
  cited: number;
  weak: number;
  missing: number;
  className?: string;
}

export function CitationStatus({ cited, weak, missing, className }: CitationStatusProps) {
  const total = cited + weak + missing;
  const citedPercent = total > 0 ? (cited / total) * 100 : 0;
  const weakPercent = total > 0 ? (weak / total) * 100 : 0;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Citation Coverage</span>
        <span className="font-semibold">{Math.round(citedPercent)}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden flex">
        <div
          className="h-full bg-success transition-all duration-700"
          style={{ width: `${citedPercent}%` }}
        />
        <div
          className="h-full bg-warning transition-all duration-700"
          style={{ width: `${weakPercent}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{cited} cited</span>
        <span>{weak} weak</span>
        <span>{missing} missing</span>
      </div>
    </div>
  );
}
