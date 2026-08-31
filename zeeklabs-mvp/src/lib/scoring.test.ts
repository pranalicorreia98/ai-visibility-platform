import { describe, it, expect } from "vitest";
import {
  calculatePresenceScore,
  calculateSentimentScore,
  calculatePositionScore,
  calculateVisibilityScore,
  calculateScoreFromMentions,
  getConfidenceLevel,
  SCORE_WEIGHTS,
  CONFIDENCE_THRESHOLDS,
} from "./scoring";

describe("calculatePresenceScore", () => {
  it("returns 0 when there are no simulations", () => {
    expect(calculatePresenceScore(5, 0)).toBe(0);
  });

  it("returns 0 when there are no mentions", () => {
    expect(calculatePresenceScore(0, 10)).toBe(0);
  });

  it("computes a percentage of simulations mentioned", () => {
    expect(calculatePresenceScore(5, 10)).toBe(50);
  });

  it("caps at 100 even if mentions exceed simulations", () => {
    expect(calculatePresenceScore(15, 10)).toBe(100);
  });
});

describe("calculateSentimentScore", () => {
  it("maps -1 to 0", () => {
    expect(calculateSentimentScore(-1)).toBe(0);
  });

  it("maps 0 to 50", () => {
    expect(calculateSentimentScore(0)).toBe(50);
  });

  it("maps 1 to 100", () => {
    expect(calculateSentimentScore(1)).toBe(100);
  });
});

describe("calculatePositionScore", () => {
  it("returns a neutral 50 when position is null (not fabricated)", () => {
    expect(calculatePositionScore(null)).toBe(50);
  });

  it("gives position 1 a perfect score", () => {
    expect(calculatePositionScore(1)).toBe(100);
  });

  it("decays logarithmically rather than a hard linear cliff", () => {
    // Position 1=100, 2=63, 3=50, 5=39, 10=29, 20=23 (documented curve)
    expect(calculatePositionScore(2)).toBe(63);
    expect(calculatePositionScore(3)).toBe(50);
    expect(calculatePositionScore(5)).toBe(39);
    expect(calculatePositionScore(10)).toBe(29);
    expect(calculatePositionScore(20)).toBe(23);
  });

  it("never drops below the floor of 10, even at very low positions", () => {
    expect(calculatePositionScore(1000)).toBeGreaterThanOrEqual(10);
  });

  it("is monotonic: a better (lower) position never scores worse", () => {
    for (let pos = 1; pos < 50; pos++) {
      expect(calculatePositionScore(pos)).toBeGreaterThanOrEqual(calculatePositionScore(pos + 1));
    }
  });
});

describe("calculateVisibilityScore", () => {
  it("weights presence/sentiment/position per the documented split", () => {
    expect(SCORE_WEIGHTS.presence + SCORE_WEIGHTS.sentiment + SCORE_WEIGHTS.position).toBeCloseTo(1);
    const score = calculateVisibilityScore({ presenceScore: 100, sentimentScore: 100, positionScore: 100 });
    expect(score).toBe(100);
  });

  it("returns 0 when all components are 0", () => {
    expect(calculateVisibilityScore({ presenceScore: 0, sentimentScore: 0, positionScore: 0 })).toBe(0);
  });
});

describe("calculateScoreFromMentions", () => {
  it("returns 0 with no simulations, regardless of mentions", () => {
    expect(calculateScoreFromMentions([{ sentiment: 1, position: 1 }], 0)).toBe(0);
  });

  it("returns 0 with no mentions — never fabricates a non-zero score", () => {
    expect(calculateScoreFromMentions([], 10)).toBe(0);
  });

  it("does not fabricate a position when none of the mentions have one", () => {
    const withPosition = calculateScoreFromMentions([{ sentiment: 0.5, position: 1 }], 1);
    const withoutPosition = calculateScoreFromMentions([{ sentiment: 0.5, position: null }], 1);
    // Position 1 -> positionScore 100; no position -> neutral 50. Score with
    // a detected top position must be higher than the neutral-position case.
    expect(withPosition).toBeGreaterThan(withoutPosition);
  });

  it("more mentions with everything else equal never lowers the score (monotonic presence)", () => {
    const mention = { sentiment: 0.5, position: 3 };
    const fewer = calculateScoreFromMentions([mention], 10);
    const more = calculateScoreFromMentions([mention, mention], 10);
    expect(more).toBeGreaterThanOrEqual(fewer);
  });
});

describe("getConfidenceLevel", () => {
  it("classifies below the early threshold as early_signal", () => {
    expect(getConfidenceLevel(0)).toBe("early_signal");
    expect(getConfidenceLevel(CONFIDENCE_THRESHOLDS.early - 1)).toBe("early_signal");
  });

  it("classifies between thresholds as moderate", () => {
    expect(getConfidenceLevel(CONFIDENCE_THRESHOLDS.early)).toBe("moderate");
    expect(getConfidenceLevel(CONFIDENCE_THRESHOLDS.moderate - 1)).toBe("moderate");
  });

  it("classifies at/above the moderate threshold as high", () => {
    expect(getConfidenceLevel(CONFIDENCE_THRESHOLDS.moderate)).toBe("high");
    expect(getConfidenceLevel(10000)).toBe("high");
  });
});
