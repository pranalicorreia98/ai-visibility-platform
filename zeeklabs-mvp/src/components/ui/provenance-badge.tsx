"use client";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PROVENANCE_LABELS, PROVENANCE_DESCRIPTIONS, type DataProvenance } from "@/lib/data-provenance";
import { cn } from "@/lib/utils";

const STYLES: Record<DataProvenance, string> = {
  measured: "text-emerald-600 border-emerald-400/30 bg-emerald-500/5",
  calculated: "text-blue-600 border-blue-400/30 bg-blue-500/5",
  ai_estimate: "text-amber-600 border-amber-400/30 bg-amber-500/5",
};

/**
 * Small, consistent label for "where did this number come from" — Measured
 * (counted from real AI responses), Calculated (deterministic math over
 * measured data), or AI Estimate (an LLM's own guess). Never let an estimate
 * render without this so it can't be mistaken for a measured fact.
 */
export function ProvenanceBadge({ type, className }: { type: DataProvenance; className?: string }) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={cn("cursor-help", STYLES[type], className)}>
            {PROVENANCE_LABELS[type]}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-xs">{PROVENANCE_DESCRIPTIONS[type]}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
