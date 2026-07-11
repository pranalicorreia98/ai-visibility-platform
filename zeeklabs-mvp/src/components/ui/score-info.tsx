"use client";

import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type ScoreType =
  | "visibility"
  | "chatgpt"
  | "gemini"
  | "sentiment"
  | "mentions"
  | "simulations"
  | "competitor";

const scoreExplanations: Record<ScoreType, { title: string; factors: string[] }> = {
  visibility: {
    title: "AI Visibility Score",
    factors: [
      "Frequency of brand mentions in AI responses",
      "Position when listed with competitors",
      "Sentiment of mentions (positive/negative)",
      "Consistency across different AI platforms",
    ],
  },
  chatgpt: {
    title: "ChatGPT Score",
    factors: [
      "How often ChatGPT mentions your brand",
      "Position in recommendation lists",
      "Sentiment of ChatGPT responses",
      "Context quality of mentions",
    ],
  },
  gemini: {
    title: "Gemini Score",
    factors: [
      "How often Gemini mentions your brand",
      "Position in recommendation lists",
      "Sentiment of Gemini responses",
      "Context quality of mentions",
    ],
  },
  sentiment: {
    title: "Sentiment Score",
    factors: [
      "Positive vs negative language used",
      "Recommendation strength",
      "Comparison with competitors",
      "Overall tone of AI responses",
    ],
  },
  mentions: {
    title: "Brand Mentions",
    factors: [
      "Total times your brand appeared",
      "Across all simulation prompts",
      "Includes direct and indirect mentions",
      "Last 30 days of activity",
    ],
  },
  simulations: {
    title: "Simulations Run",
    factors: [
      "Total AI prompts tested",
      "Across ChatGPT and Gemini",
      "Each simulation checks visibility",
      "More simulations = better data",
    ],
  },
  competitor: {
    title: "Competitor AI Score",
    factors: [
      "Their visibility in AI responses",
      "Based on market analysis",
      "Compared to your brand",
      "Estimated from industry data",
    ],
  },
};

interface ScoreInfoProps {
  type: ScoreType;
  className?: string;
}

export function ScoreInfo({ type, className = "" }: ScoreInfoProps) {
  const info = scoreExplanations[type];

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button
            className={`inline-flex items-center justify-center rounded-full hover:bg-muted/50 p-0.5 transition-colors ${className}`}
            onClick={(e) => e.preventDefault()}
          >
            <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-[300px] p-0 overflow-hidden border-border/50 shadow-lg"
        >
          {/* Header with gradient */}
          <div className="px-4 py-2.5 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/50">
            <p className="font-semibold text-sm text-foreground">{info.title}</p>
          </div>

          {/* Content */}
          <div className="px-4 py-3 bg-popover">
            <p className="text-xs font-medium text-muted-foreground mb-2.5 uppercase tracking-wider">
              Calculated based on
            </p>
            <ul className="space-y-2">
              {info.factors.map((factor, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-1.5 h-1.5 mt-1.5 rounded-full bg-primary" />
                  <span className="text-xs text-foreground/90 leading-relaxed">{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
