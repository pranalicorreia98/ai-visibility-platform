import Sentiment from "sentiment";

// Create a single instance of the sentiment analyzer for deterministic results
const sentimentAnalyzer = new Sentiment();

// Additional domain-specific words for AI visibility context
const ADDITIONAL_POSITIVE = {
  recommended: 3,
  recommend: 3,
  "top-rated": 3,
  leading: 2,
  trusted: 2,
  reliable: 2,
  innovative: 2,
  comprehensive: 2,
  robust: 2,
  versatile: 2,
  established: 2,
  renowned: 2,
  preferred: 2,
  favorite: 2,
  ideal: 2,
  efficient: 2,
  effective: 2,
};

const ADDITIONAL_NEGATIVE = {
  avoid: -3,
  "not recommended": -4,
  overpriced: -2,
  outdated: -2,
  buggy: -3,
  unreliable: -3,
  complicated: -2,
  clunky: -2,
  inadequate: -2,
  inferior: -2,
  "steep learning curve": -2,
  "better alternatives": -3,
};

// Passed as `extras` on every analyze() call below (see analyzeSentiment).
// IMPORTANT: this must NOT be registered via `sentimentAnalyzer.registerLanguage("en", { labels })`
// — registerLanguage *replaces* the language entirely (`languages[code] = language`
// in the underlying library), which silently discarded the entire built-in
// AFINN-165 dictionary, leaving only these ~29 words as the whole vocabulary
// (this was a real bug here — sentiment scores were effectively always 0/neutral
// for any response that didn't happen to contain one of these words).
// `extras` merges onto the base AFINN labels instead, which is what we want,
// and also preserves the base library's built-in one-word negation handling
// (languages/en/scoring-strategy.js — replacing the language object was
// silently disabling that too).
const CUSTOM_LABELS = { ...ADDITIONAL_POSITIVE, ...ADDITIONAL_NEGATIVE };

// The base library's negation handling only inverts a word's score when the
// negator is the *immediately preceding* token ("not bad" works, "not a bad
// option" doesn't, since "a" sits in between). Rather than re-implementing
// negation scoring ourselves (risking double-negation on top of the library's
// own), we collapse short filler words out of the gap before analysis, e.g.
// "not a bad option" -> "not bad option", so the library's own one-word
// lookback catches it.
const NEGATION_FILLERS = ["a", "an", "the", "really", "very", "so", "quite", "too", "that", "actually", "particularly"];
const NEGATORS = ["not", "cant", "can't", "dont", "don't", "doesnt", "doesn't", "isnt", "isn't", "wont", "won't", "non"];
const NEGATION_FILLER_REGEX = new RegExp(
  `\\b(${NEGATORS.join("|")})\\s+(?:(?:${NEGATION_FILLERS.join("|")})\\s+){1,2}`,
  "gi"
);

function collapseNegationFillers(text: string): string {
  return text.replace(NEGATION_FILLER_REGEX, (_match, negator: string) => `${negator} `);
}

/**
 * Analyzes sentiment of the response towards a brand using the 'sentiment' library.
 * This provides deterministic results - same input always produces same output.
 * Returns a score from -1 (very negative) to +1 (very positive)
 */
export function analyzeSentiment(response: string, brandName: string | null): number {
  // If brand is provided, analyze sentences containing the brand for more relevant sentiment
  if (brandName) {
    const brandLower = brandName.toLowerCase();
    const sentences = response.split(/[.!?]+/);
    const brandSentences = sentences.filter((s) =>
      s.toLowerCase().includes(brandLower)
    );

    // If brand is mentioned, analyze only the brand-related sentences
    if (brandSentences.length > 0) {
      const brandContext = collapseNegationFillers(brandSentences.join(". "));
      const result = sentimentAnalyzer.analyze(brandContext, { extras: CUSTOM_LABELS });

      // Normalize comparative score to [-1, 1] range
      // comparative is score / word count, typically ranges from -5 to +5
      const normalizedScore = Math.max(-1, Math.min(1, result.comparative * 0.2));

      return normalizedScore;
    }
  }

  // Analyze the full response if no brand or brand not mentioned
  const result = sentimentAnalyzer.analyze(collapseNegationFillers(response), { extras: CUSTOM_LABELS });

  // Normalize comparative score to [-1, 1] range
  const normalizedScore = Math.max(-1, Math.min(1, result.comparative * 0.2));

  // If no sentiment detected, return slightly positive (neutral helpful response)
  if (result.score === 0) return 0.05;

  return normalizedScore;
}

export function getSentimentLabel(score: number): "positive" | "neutral" | "negative" {
  if (score > 0.15) return "positive";
  if (score < -0.15) return "negative";
  return "neutral";
}

export function getSentimentEmoji(score: number): string {
  if (score > 0.15) return "😊";
  if (score < -0.15) return "😞";
  return "😐";
}

export function getSentimentColor(score: number): string {
  if (score > 0.15) return "text-green-600";
  if (score < -0.15) return "text-red-600";
  return "text-gray-600";
}
