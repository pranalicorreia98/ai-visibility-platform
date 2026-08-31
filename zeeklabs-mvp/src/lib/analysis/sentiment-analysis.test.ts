import { describe, it, expect } from "vitest";
import { analyzeSentiment, getSentimentLabel } from "./sentiment-analysis";

describe("analyzeSentiment — base vocabulary", () => {
  it("scores an unambiguously positive sentence as positive", () => {
    const score = analyzeSentiment("This is an excellent, reliable, and trusted platform.", null);
    expect(score).toBeGreaterThan(0);
    expect(getSentimentLabel(score)).toBe("positive");
  });

  it("scores an unambiguously negative sentence as negative", () => {
    const score = analyzeSentiment("This is a terrible, unreliable, and buggy product.", null);
    expect(score).toBeLessThan(0);
    expect(getSentimentLabel(score)).toBe("negative");
  });

  it("uses the full AFINN vocabulary, not just the custom domain word list", () => {
    // "terrible" and "excellent" are base-AFINN words, not in our custom
    // ADDITIONAL_POSITIVE/NEGATIVE lists — regression test for the bug where
    // registerLanguage() replaced the entire lexicon with only ~29 custom words.
    const positive = analyzeSentiment("This is an excellent product.", null);
    const negative = analyzeSentiment("This is a terrible product.", null);
    expect(positive).toBeGreaterThan(0);
    expect(negative).toBeLessThan(0);
  });
});

describe("analyzeSentiment — negation handling", () => {
  it("flips an immediately-negated word ('not recommended')", () => {
    const negated = analyzeSentiment("It is not recommended for beginners.", null);
    const unnegated = analyzeSentiment("It is recommended for beginners.", null);
    expect(negated).toBeLessThan(unnegated);
    expect(negated).toBeLessThan(0);
  });

  it("flips a negated word separated by a filler word ('not a bad option')", () => {
    const score = analyzeSentiment("Not a bad option.", null);
    expect(score).toBeGreaterThan(0);
  });

  it("flips a negated word separated by an intensifier ('not really reliable')", () => {
    const negated = analyzeSentiment("It is not really reliable for enterprise use.", null);
    const unnegated = analyzeSentiment("It is really reliable for enterprise use.", null);
    expect(negated).toBeLessThan(unnegated);
  });
});

describe("analyzeSentiment — brand-scoped analysis", () => {
  it("only scores sentences mentioning the brand when brandName is given", () => {
    const text = "CompetitorX is terrible. MyBrand is excellent.";
    const score = analyzeSentiment(text, "MyBrand");
    expect(score).toBeGreaterThan(0);
  });
});

describe("getSentimentLabel", () => {
  it("classifies near-zero scores as neutral", () => {
    expect(getSentimentLabel(0)).toBe("neutral");
  });
});
