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

// Register additional words with the analyzer
sentimentAnalyzer.registerLanguage("en", {
  labels: { ...ADDITIONAL_POSITIVE, ...ADDITIONAL_NEGATIVE },
});

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
      const brandContext = brandSentences.join(". ");
      const result = sentimentAnalyzer.analyze(brandContext);

      // Normalize comparative score to [-1, 1] range
      // comparative is score / word count, typically ranges from -5 to +5
      const normalizedScore = Math.max(-1, Math.min(1, result.comparative * 0.2));

      return normalizedScore;
    }
  }

  // Analyze the full response if no brand or brand not mentioned
  const result = sentimentAnalyzer.analyze(response);

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
