// Shared vocabulary for labeling where a number on screen actually came
// from, so an AI-estimated guess can never quietly masquerade as measured
// or calculated data.
//
// - measured:    counted directly from real AI responses (mentions, citations)
// - calculated:  deterministic math over measured data (visibility score, sentiment %)
// - ai_estimate: an LLM's own guess/opinion, not derived from counted data
export type DataProvenance = "measured" | "calculated" | "ai_estimate";

export const PROVENANCE_LABELS: Record<DataProvenance, string> = {
  measured: "Measured",
  calculated: "Calculated",
  ai_estimate: "AI Estimate",
};

export const PROVENANCE_DESCRIPTIONS: Record<DataProvenance, string> = {
  measured: "Counted directly from real AI platform responses.",
  calculated: "Deterministic math over measured data — same inputs always produce the same result.",
  ai_estimate: "An AI model's own estimate, not derived from counted data. Treat as directional, not exact.",
};
