/**
 * Prompt Caching System for Consistent Simulation Results
 *
 * This system addresses prompt/response inconsistencies by:
 * 1. Caching responses for identical prompts
 * 2. Using multiple prompt variations to get comprehensive results
 * 3. Aggregating results from multiple prompts for consistency
 */

import { prisma } from "./prisma";
import crypto from "crypto";

// Cache TTL in seconds (24 hours)
const CACHE_TTL = 24 * 60 * 60;

// Prompt variation templates for comprehensive coverage
export const PROMPT_VARIATIONS = {
  comparison: [
    "Compare {brand} with its competitors in the {industry} space",
    "What are the top alternatives to {competitors} including {brand}?",
    "Which is better: {brand} or {competitors}?",
    "Recommend the best {industry} solutions including {brand}",
  ],
  recommendation: [
    "What is the best {industry} tool for small businesses?",
    "Recommend a {industry} solution for startups",
    "What {industry} software should I use?",
    "Top rated {industry} platforms in 2024",
  ],
  features: [
    "What features does {brand} offer?",
    "Tell me about {brand} and what makes it unique",
    "How does {brand} compare to alternatives in terms of features?",
  ],
  reviews: [
    "What do people say about {brand}?",
    "Is {brand} good? What are the reviews?",
    "Pros and cons of using {brand}",
  ],
};

/**
 * Generate a cache key for a prompt
 */
export function generateCacheKey(
  prompt: string,
  brandId: string,
  aiSystem: string
): string {
  const normalized = prompt.toLowerCase().trim();
  const hash = crypto
    .createHash("md5")
    .update(`${normalized}:${brandId}:${aiSystem}`)
    .digest("hex");
  return hash;
}

/**
 * Check if a cached response exists and is valid
 */
export async function getCachedResponse(
  cacheKey: string
): Promise<{ response: string; analysis: unknown } | null> {
  try {
    const cached = await prisma.promptCache.findUnique({
      where: { cacheKey },
    });

    if (!cached) return null;

    // Check if cache is expired
    const age = (Date.now() - cached.createdAt.getTime()) / 1000;
    if (age > CACHE_TTL) {
      // Delete expired cache
      await prisma.promptCache.delete({ where: { cacheKey } });
      return null;
    }

    return {
      response: cached.response,
      analysis: cached.analysis ? JSON.parse(cached.analysis) : null,
    };
  } catch (error) {
    console.error("Cache lookup error:", error);
    return null;
  }
}

/**
 * Store a response in cache
 */
export async function setCachedResponse(
  cacheKey: string,
  brandId: string,
  prompt: string,
  aiSystem: string,
  response: string,
  analysis: unknown
): Promise<void> {
  try {
    await prisma.promptCache.upsert({
      where: { cacheKey },
      update: {
        response,
        analysis: JSON.stringify(analysis),
        updatedAt: new Date(),
      },
      create: {
        cacheKey,
        brandId,
        prompt,
        aiSystem,
        response,
        analysis: JSON.stringify(analysis),
      },
    });
  } catch (error) {
    console.error("Cache write error:", error);
  }
}

/**
 * Generate prompt variations for comprehensive testing
 */
export function generatePromptVariations(
  basePrompt: string,
  brandName: string,
  competitors: string[],
  industry?: string
): string[] {
  const variations: string[] = [basePrompt];

  // Detect prompt type and add relevant variations
  const promptLower = basePrompt.toLowerCase();

  if (promptLower.includes("compare") || promptLower.includes("vs") || promptLower.includes("versus")) {
    // Comparison prompts
    PROMPT_VARIATIONS.comparison.forEach(template => {
      const variation = template
        .replace("{brand}", brandName)
        .replace("{competitors}", competitors.slice(0, 2).join(" or "))
        .replace("{industry}", industry || "software");
      if (!variations.includes(variation)) {
        variations.push(variation);
      }
    });
  }

  if (promptLower.includes("best") || promptLower.includes("recommend") || promptLower.includes("top")) {
    // Recommendation prompts
    PROMPT_VARIATIONS.recommendation.forEach(template => {
      const variation = template
        .replace("{brand}", brandName)
        .replace("{industry}", industry || "software");
      if (!variations.includes(variation)) {
        variations.push(variation);
      }
    });
  }

  if (promptLower.includes("feature") || promptLower.includes("what does") || promptLower.includes("tell me about")) {
    // Feature prompts
    PROMPT_VARIATIONS.features.forEach(template => {
      const variation = template.replace("{brand}", brandName);
      if (!variations.includes(variation)) {
        variations.push(variation);
      }
    });
  }

  // Limit to 5 variations max
  return variations.slice(0, 5);
}

/**
 * Aggregate results from multiple prompt variations
 */
export function aggregateResults(
  results: Array<{
    mentions: Array<{ term: string; isCompetitor: boolean }>;
    sentiment: number;
    position: number | null;
  }>
): {
  avgMentions: number;
  avgSentiment: number;
  avgPosition: number | null;
  mentionRate: number;
  confidence: number;
} {
  if (results.length === 0) {
    return {
      avgMentions: 0,
      avgSentiment: 0,
      avgPosition: null,
      mentionRate: 0,
      confidence: 0,
    };
  }

  const brandMentions = results.map(r =>
    r.mentions.filter(m => !m.isCompetitor).length
  );

  const positions = results
    .map(r => r.position)
    .filter((p): p is number => p !== null);

  const sentiments = results.map(r => r.sentiment);

  const mentionedCount = brandMentions.filter(m => m > 0).length;

  return {
    avgMentions: brandMentions.reduce((a, b) => a + b, 0) / results.length,
    avgSentiment: sentiments.reduce((a, b) => a + b, 0) / sentiments.length,
    avgPosition: positions.length > 0
      ? positions.reduce((a, b) => a + b, 0) / positions.length
      : null,
    mentionRate: mentionedCount / results.length,
    confidence: Math.min(results.length / 5, 1), // Higher confidence with more results
  };
}

/**
 * Normalize a prompt for consistent matching
 */
export function normalizePrompt(prompt: string): string {
  return prompt
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/g, "");
}

/**
 * Calculate semantic similarity between prompts (simple version)
 */
export function calculatePromptSimilarity(prompt1: string, prompt2: string): number {
  const words1 = new Set(normalizePrompt(prompt1).split(" "));
  const words2 = new Set(normalizePrompt(prompt2).split(" "));

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size; // Jaccard similarity
}

/**
 * Find similar cached prompts
 */
export async function findSimilarCachedPrompts(
  prompt: string,
  brandId: string,
  aiSystem: string,
  threshold: number = 0.6
): Promise<Array<{ response: string; analysis: unknown; similarity: number }>> {
  try {
    const cached = await prisma.promptCache.findMany({
      where: {
        brandId,
        aiSystem,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    const similar = cached
      .map(c => ({
        response: c.response,
        analysis: c.analysis ? JSON.parse(c.analysis) : null,
        similarity: calculatePromptSimilarity(prompt, c.prompt),
      }))
      .filter(c => c.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity);

    return similar;
  } catch (error) {
    console.error("Similar cache lookup error:", error);
    return [];
  }
}
