// Real competitor measurement: runs a small, bounded set of comparison
// prompts through the same AI platforms and the same deterministic
// detection pipeline (mention-detection/position-detection/sentiment-
// analysis) used for the brand's own visibility score — instead of asking
// an LLM to invent competitor scores in one shot.
import { prisma } from "@/lib/prisma";
import { detectMentions, analyzeSentiment, detectPosition } from "@/lib/analysis";
import {
  callChatGPTWithFallbackChain,
  callGeminiWithFallbackChain,
  callPerplexityWithFallbackChain,
} from "@/lib/ai-fallback-chains";
import { getIndustryContext } from "@/lib/prompts/prompt-generator";
import { checkRateLimit, recordUsage } from "@/lib/rate-limit";

type BrandWithCompetitors = {
  id: string;
  name: string;
  domain: string | null;
  competitors: Array<{ id: string; name: string; domain: string | null }>;
};

/**
 * Two prompts, bounded on purpose to keep the added AI-call cost small:
 * one broad "best options" prompt (the kind of query where brands naturally
 * get compared) and one direct head-to-head comparison naming everyone.
 */
export function generateComparisonPrompts(brand: BrandWithCompetitors): string[] {
  const industry = getIndustryContext(brand.domain || brand.name);
  const competitorNames = brand.competitors.map((c) => c.name);

  const prompts = [`What are the best ${industry} options available today?`];

  if (competitorNames.length > 0) {
    prompts.push(
      `Compare ${brand.name} with ${competitorNames.join(", ")}. How do they differ?`
    );
  }

  return prompts;
}

export interface CompetitorMeasurementResult {
  simulationsRun: number;
  mentionsRecorded: number;
}

/**
 * Runs the comparison prompts across whichever AI platforms have API keys
 * configured, detects brand + competitor mentions/position/sentiment from
 * the real responses (same functions api/simulate/route.ts uses), and
 * persists them as real Mention rows tagged with promptType
 * "competitor_comparison" so scoring can use the correct denominator.
 */
export async function runCompetitorMeasurement(
  brand: BrandWithCompetitors,
  userId: string
): Promise<CompetitorMeasurementResult> {
  if (brand.competitors.length === 0) {
    return { simulationsRun: 0, mentionsRecorded: 0 };
  }

  const prompts = generateComparisonPrompts(brand);
  const systems: Array<{ name: "chatgpt" | "gemini" | "perplexity"; call: (p: string) => Promise<{ response: string; provider: string }> }> = [
    { name: "chatgpt", call: callChatGPTWithFallbackChain },
    { name: "gemini", call: callGeminiWithFallbackChain },
    { name: "perplexity", call: callPerplexityWithFallbackChain },
  ];

  let simulationsRun = 0;
  let mentionsRecorded = 0;

  for (const prompt of prompts) {
    for (const system of systems) {
      const canProceed = await checkRateLimit(system.name);
      if (!canProceed) continue;

      let response: string;
      try {
        const result = await system.call(prompt);
        response = result.response;
        await recordUsage(system.name);
      } catch (error) {
        console.log(`Competitor measurement: ${system.name} failed for prompt "${prompt}": ${error}`);
        continue;
      }

      const simulation = await prisma.simulation.create({
        data: {
          userId,
          brandId: brand.id,
          prompt,
          promptType: "competitor_comparison",
          chatgptResponse: system.name === "chatgpt" ? response.slice(0, 5000) : undefined,
          geminiResponse: system.name === "gemini" ? response.slice(0, 5000) : undefined,
          perplexityResponse: system.name === "perplexity" ? response.slice(0, 5000) : undefined,
        },
      });
      simulationsRun++;

      const allMentions = detectMentions(response, {
        name: brand.name,
        competitors: brand.competitors,
      });

      const brandMentions = allMentions.filter((m) => !m.isCompetitor);
      if (brandMentions.length > 0) {
        await prisma.mention.create({
          data: {
            brandId: brand.id,
            simulationId: simulation.id,
            aiSystem: system.name,
            prompt,
            response: response.slice(0, 2000),
            context: brandMentions[0].context,
            sentiment: analyzeSentiment(response, brand.name),
            position: detectPosition(response, brand.name),
            isCompetitor: false,
          },
        });
        mentionsRecorded++;
      }

      const mentionedCompetitorNames = new Set(
        allMentions.filter((m) => m.isCompetitor && m.competitorName).map((m) => m.competitorName!)
      );
      for (const competitorName of mentionedCompetitorNames) {
        const entries = allMentions.filter((m) => m.competitorName === competitorName);
        await prisma.mention.create({
          data: {
            brandId: brand.id,
            simulationId: simulation.id,
            aiSystem: system.name,
            prompt,
            response: response.slice(0, 2000),
            context: entries[0].context,
            sentiment: analyzeSentiment(response, competitorName),
            position: detectPosition(response, competitorName),
            isCompetitor: true,
            competitorName,
          },
        });
        mentionsRecorded++;
      }
    }
  }

  return { simulationsRun, mentionsRecorded };
}
