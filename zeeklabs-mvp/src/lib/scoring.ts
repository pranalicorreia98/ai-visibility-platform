// Canonical visibility-score math. This is the single source of truth for how
// presence/sentiment/position combine into a visibility score — every consumer
// (dashboard API, report generator, PDF mapper) must import from here instead
// of reimplementing the formula, so they can never drift out of sync again.

export const SCORE_WEIGHTS = {
  presence: 0.4,
  sentiment: 0.25,
  position: 0.35,
} as const;

export const CONFIDENCE_THRESHOLDS = {
  early: 10,
  moderate: 50,
} as const;

export type ConfidenceLevel = "early_signal" | "moderate" | "high";

export const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  early_signal: "Early signal",
  moderate: "Moderate confidence",
  high: "High confidence",
};

export function getConfidenceLevel(sampleSize: number): ConfidenceLevel {
  if (sampleSize < CONFIDENCE_THRESHOLDS.early) return "early_signal";
  if (sampleSize < CONFIDENCE_THRESHOLDS.moderate) return "moderate";
  return "high";
}

export function calculatePresenceScore(mentionsCount: number, totalSimulations: number): number {
  if (totalSimulations === 0) return 0;
  return Math.min((mentionsCount / totalSimulations) * 100, 100);
}

export function calculateSentimentScore(avgSentiment: number): number {
  return ((avgSentiment + 1) / 2) * 100;
}

/**
 * Logarithmic decay so brands at later positions still get proportional credit
 * instead of a hard linear cliff: 1=100, 2=63, 3=50, 5=39, 10=29, 20=23.
 * null (position not detected) returns a neutral 50 rather than penalizing or
 * inventing a rank.
 */
export function calculatePositionScore(avgPosition: number | null): number {
  if (avgPosition === null) return 50;
  return Math.max(10, Math.round(100 / Math.log2(avgPosition + 1)));
}

export interface ScoreComponents {
  presenceScore: number;
  sentimentScore: number;
  positionScore: number;
}

export function calculateVisibilityScore({ presenceScore, sentimentScore, positionScore }: ScoreComponents): number {
  return Math.round(
    presenceScore * SCORE_WEIGHTS.presence +
      sentimentScore * SCORE_WEIGHTS.sentiment +
      positionScore * SCORE_WEIGHTS.position
  );
}

export interface MentionLike {
  sentiment: number | null;
  position: number | null;
}

function average(values: number[]): number | null {
  return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;
}

/**
 * Full pipeline from a list of measured mentions + the simulation count they
 * were drawn from, to a single 0-100 visibility score. Returns 0 when there
 * are no simulations or no mentions — never a fabricated non-zero default.
 */
export function calculateScoreFromMentions(mentions: MentionLike[], totalSimulations: number): number {
  if (totalSimulations === 0) return 0;
  if (mentions.length === 0) return 0;

  const presenceScore = calculatePresenceScore(mentions.length, totalSimulations);

  const sentiments = mentions.filter((m) => m.sentiment !== null).map((m) => m.sentiment!);
  const avgSentiment = average(sentiments) ?? 0;
  const sentimentScore = calculateSentimentScore(avgSentiment);

  const positions = mentions.filter((m) => m.position !== null).map((m) => m.position!);
  const avgPosition = average(positions);
  const positionScore = calculatePositionScore(avgPosition);

  return calculateVisibilityScore({ presenceScore, sentimentScore, positionScore });
}
