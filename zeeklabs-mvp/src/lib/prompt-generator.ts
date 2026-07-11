// Prompt Generator - Generate industry-relevant default prompts for brands
// These prompts represent common queries that users might ask AI systems

export interface PromptSuggestion {
  prompt: string;
  category: "comparison" | "recommendation" | "features" | "reviews" | "market";
  isSuggested: boolean;
}

/**
 * Generate default prompts for a brand based on its name, competitors, and industry.
 * These prompts represent common queries that AI systems receive about products/services.
 */
export function generateDefaultPromptsForBrand(
  brandName: string,
  competitors: string[] = [],
  industry?: string
): PromptSuggestion[] {
  const industryTerm = industry || "software";
  const competitorList = competitors.length > 0
    ? competitors.slice(0, 3).join(", ")
    : "its competitors";

  const prompts: PromptSuggestion[] = [
    // Comparison prompts - These are high-value queries where brands compete for visibility
    {
      prompt: `What are the best ${industryTerm} tools available in 2024?`,
      category: "comparison",
      isSuggested: true,
    },
    {
      prompt: `Compare ${brandName} with ${competitorList}`,
      category: "comparison",
      isSuggested: true,
    },
    {
      prompt: `Which is better: ${brandName} or ${competitors[0] || "alternatives"}?`,
      category: "comparison",
      isSuggested: true,
    },

    // Recommendation prompts - Users asking AI for suggestions
    {
      prompt: `Recommend a ${industryTerm} solution for small businesses`,
      category: "recommendation",
      isSuggested: true,
    },
    {
      prompt: `What ${industryTerm} should I use for my startup?`,
      category: "recommendation",
      isSuggested: true,
    },
    {
      prompt: `Top rated ${industryTerm} platforms for enterprises`,
      category: "recommendation",
      isSuggested: true,
    },

    // Feature/Review prompts - Users researching specific brands
    {
      prompt: `What do users say about ${brandName}?`,
      category: "reviews",
      isSuggested: true,
    },
    {
      prompt: `Is ${brandName} worth it? Pros and cons`,
      category: "reviews",
      isSuggested: true,
    },
    {
      prompt: `What features does ${brandName} offer?`,
      category: "features",
      isSuggested: true,
    },

    // Market prompts - Industry-level queries
    {
      prompt: `Who are the market leaders in ${industryTerm}?`,
      category: "market",
      isSuggested: true,
    },
  ];

  return prompts;
}

/**
 * Get a subset of prompts suitable for display in reports
 * Returns a mix of categories to show comprehensive coverage
 */
export function getReportPromptSuggestions(
  brandName: string,
  competitors: string[] = [],
  industry?: string,
  maxPrompts: number = 6
): PromptSuggestion[] {
  const allPrompts = generateDefaultPromptsForBrand(brandName, competitors, industry);

  // Select a diverse mix: 2 comparison, 2 recommendation, 1 review, 1 market
  const selected: PromptSuggestion[] = [];
  const categories: Array<PromptSuggestion["category"]> = [
    "comparison",
    "comparison",
    "recommendation",
    "recommendation",
    "reviews",
    "market",
  ];

  for (const category of categories) {
    if (selected.length >= maxPrompts) break;
    const prompt = allPrompts.find(
      (p) => p.category === category && !selected.includes(p)
    );
    if (prompt) selected.push(prompt);
  }

  return selected;
}
