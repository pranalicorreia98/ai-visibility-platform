import { prisma } from "@/lib/prisma";
import {
  callChatGPTWithRetry,
  callGeminiWithRetry,
  callPerplexityWithRetry,
  callOpenRouterChatGPTWithRetry,
  callOpenRouterGeminiWithRetry,
  callOpenRouterAuto,
  callOpenRouterFamily,
} from "@/lib/ai-providers";
import {
  generateAnalysisPrompt,
  parseAnalysisResponse,
  AnalysisRequest,
  VisibilityAnalysisResult,
} from "@/lib/prompts/visibility-analysis-prompt";
import { recordUsage } from "@/lib/rate-limit";
import type { AnalysisCache, Competitor } from "@prisma/client";

/**
 * Call AI provider with fallback chain.
 *
 * Provider options:
 * - "auto": Uses OpenRouter's Auto Router for intelligent model selection (RECOMMENDED)
 * - "chatgpt": GitHub Models -> OpenRouter ChatGPT family
 * - "gemini": Google AI Studio -> OpenRouter Gemini family
 * - "perplexity": Perplexity AI (no fallback)
 *
 * The "auto" provider is most resilient as it:
 * - Automatically selects the best model based on task type
 * - Updates with new model releases every 7 days
 * - Never breaks due to deprecated model names
 */
export async function callAIWithFallback(
  prompt: string,
  provider: "chatgpt" | "gemini" | "perplexity" | "auto"
): Promise<{ response: string; actualProvider: string }> {
  // Auto provider - let OpenRouter pick the best model
  if (provider === "auto") {
    if (process.env.OPENROUTER_API_KEY) {
      console.log("Analysis: Using OpenRouter Auto Router (intelligent model selection)...");
      const result = await callOpenRouterAuto(prompt, 3500, {
        costTier: "high",  // Use high-quality models
        allowedModels: ["google/*", "anthropic/*", "openai/*"]  // Only major providers
      });
      return { response: result.content, actualProvider: `openrouter-auto:${result.modelUsed}` };
    }
    // Fallback to gemini logic if no OpenRouter key
    console.log("Analysis: OpenRouter not configured, falling back to Gemini...");
    provider = "gemini";
  }

  if (provider === "chatgpt") {
    // Try GitHub Models first
    if (process.env.GITHUB_TOKEN) {
      try {
        console.log("Analysis: Trying GitHub Models (ChatGPT)...");
        const response = await callChatGPTWithRetry(prompt);
        return { response, actualProvider: "chatgpt" };
      } catch (error) {
        console.log(`Analysis: GitHub Models failed: ${error}`);
      }
    }
    // Fallback to OpenRouter with native fallback chain
    if (process.env.OPENROUTER_API_KEY) {
      console.log("Analysis: Trying OpenRouter (ChatGPT family with auto-fallback)...");
      const result = await callOpenRouterFamily(prompt, "chatgpt");
      return { response: result.content, actualProvider: `openrouter:${result.modelUsed}` };
    }
    throw new Error("No ChatGPT providers available");
  } else if (provider === "perplexity") {
    // Perplexity AI
    if (process.env.PERPLEXITY_API_KEY) {
      try {
        console.log("Analysis: Trying Perplexity AI...");
        const response = await callPerplexityWithRetry(prompt);
        return { response, actualProvider: "perplexity" };
      } catch (error) {
        console.log(`Analysis: Perplexity failed: ${error}`);
      }
    }
    throw new Error("Perplexity API key not configured");
  } else {
    // Gemini
    if (process.env.GOOGLE_AI_API_KEY) {
      try {
        console.log("Analysis: Trying Google AI Studio (Gemini)...");
        const response = await callGeminiWithRetry(prompt);
        return { response, actualProvider: "gemini" };
      } catch (error) {
        console.log(`Analysis: Google AI Studio failed: ${error}`);
      }
    }
    // Fallback to OpenRouter with native fallback chain
    if (process.env.OPENROUTER_API_KEY) {
      console.log("Analysis: Trying OpenRouter (Gemini family with auto-fallback)...");
      const result = await callOpenRouterFamily(prompt, "gemini");
      return { response: result.content, actualProvider: `openrouter:${result.modelUsed}` };
    }
    throw new Error("No Gemini providers available");
  }
}

/**
 * Save analysis results to database (simulation, mentions, reports, snapshots).
 * All writes happen in a single transaction so a partial failure can't leave
 * a simulation without its mentions/report/snapshot.
 */
export async function saveAnalysisResults(
  userId: string,
  brand: { id: string; name: string },
  analysis: VisibilityAnalysisResult,
  response: string,
  provider: string
) {
  // Extract sentiment from analysis result
  const brandSentiment = analysis.sentimentAnalysis?.brandSentiment?.overall || "neutral";
  const sentimentScore = brandSentiment === "positive" ? 0.5 :
                         brandSentiment === "negative" ? -0.5 : 0;

  const isPerplexityOrChatgpt = provider === "chatgpt" || provider === "perplexity";
  const aiSystemName = provider === "chatgpt" ? "chatgpt" : provider === "perplexity" ? "perplexity" : "gemini";

  const sentimentAnalysis = analysis.sentimentAnalysis;
  const brandSentimentData = sentimentAnalysis?.brandSentiment;
  const overallSentimentScore = brandSentimentData?.score || 50;

  const allScores = [
    { name: brand.name, score: analysis.scores?.overall || 0 },
    ...(analysis.competitorComparison || []).map(c => ({ name: c.name, score: c.overallScore }))
  ].sort((a, b) => b.score - a.score);
  const competitorRank = allScores.findIndex(s => s.name === brand.name) + 1;

  const [simulation] = await prisma.$transaction([
    prisma.simulation.create({
      data: {
        userId,
        brandId: brand.id,
        prompt: `Visibility Analysis for ${brand.name} (${provider})`,
        chatgptResponse: isPerplexityOrChatgpt ? response.slice(0, 5000) : null,
        geminiResponse: provider === "gemini" ? response.slice(0, 5000) : null,
        chatgptSentiment: isPerplexityOrChatgpt ? sentimentScore : null,
        geminiSentiment: provider === "gemini" ? sentimentScore : null,
        chatgptPosition: isPerplexityOrChatgpt ? 1 : null,
        geminiPosition: provider === "gemini" ? 1 : null,
      },
    }),
    prisma.reportGeneration.create({
      data: {
        brandId: brand.id,
        type: "analysis",
        analysisData: JSON.stringify(analysis),
      },
    }),
    prisma.analysisSnapshot.create({
      data: {
        brandId: brand.id,
        overallScore: analysis.scores?.overall || 0,
        chatgptScore: null,
        geminiScore: null,
        perplexityScore: null,
        totalMentions: 1,
        mentionFrequency: 1,
        sentimentScore: Math.round(overallSentimentScore),
        positivePercent: null,
        neutralPercent: null,
        negativePercent: null,
        avgPosition: analysis.aiVisibility?.typicalPosition || null,
        competitorRank,
        analysisData: JSON.stringify(analysis),
      },
    }),
  ]);

  // Mention rows reference simulation.id, so they're created in a second
  // transaction once the simulation id exists (Prisma can't interpolate a
  // not-yet-created id into a batched $transaction array).
  const mentionWrites = [
    prisma.mention.create({
      data: {
        brandId: brand.id,
        simulationId: simulation.id,
        aiSystem: aiSystemName,
        prompt: `Visibility Analysis for ${brand.name}`,
        response: response.slice(0, 2000),
        context: `AI Visibility Score: ${analysis.scores?.overall || 0}/100. Brand awareness: ${analysis.scores?.brandAwareness || 0}/100`,
        sentiment: sentimentScore,
        position: 1,
        isCompetitor: false,
      },
    }),
    ...(analysis.competitorComparison || []).map((competitor) => {
      const compSentiment = competitor.sentiment === "positive" ? 0.5 :
                            competitor.sentiment === "negative" ? -0.5 : 0;
      return prisma.mention.create({
        data: {
          brandId: brand.id,
          simulationId: simulation.id,
          aiSystem: aiSystemName,
          prompt: `Competitor Analysis: ${competitor.name}`,
          response: `Score: ${competitor.overallScore}/100`,
          context: `Competitor ${competitor.name} visibility score: ${competitor.overallScore}/100`,
          sentiment: compSentiment,
          position: null,
          isCompetitor: true,
          competitorName: competitor.name,
        },
      });
    }),
  ];

  await prisma.$transaction(mentionWrites);

  return simulation;
}

/**
 * Run a single analysis job end-to-end: call the AI provider, parse the
 * response, persist success/failure on the AnalysisCache row, and save
 * results. Used by the background worker (scripts/analysis-worker.ts) after
 * it claims a "pending" AnalysisCache row.
 */
export async function runAnalysisJob(
  cacheEntry: AnalysisCache,
  brand: { id: string; name: string; domain: string | null },
  competitors: Competitor[],
  provider: "chatgpt" | "gemini" | "perplexity",
  userId: string
): Promise<void> {
  const analysisRequest: AnalysisRequest = {
    brandName: brand.name,
    brandDomain: brand.domain || undefined,
    competitors: competitors.map((c) => ({
      name: c.name,
      domain: c.domain || undefined,
    })),
  };

  const prompt = generateAnalysisPrompt(analysisRequest);
  console.log(`Analysis prompt generated for ${brand.name}, calling AI...`);

  let response: string;
  let actualProvider: string;
  let duration: number;

  try {
    const startTime = Date.now();
    const result = await callAIWithFallback(prompt, provider);
    response = result.response;
    actualProvider = result.actualProvider;
    duration = Date.now() - startTime;
    console.log(`Analysis completed in ${duration}ms via ${actualProvider}`);
  } catch (error) {
    await prisma.analysisCache.update({
      where: { id: cacheEntry.id },
      data: {
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "AI provider failed",
      },
    });
    console.error(`Analysis failed for brand ${brand.name}:`, error);
    return;
  }

  await recordUsage(provider);

  const analysis = parseAnalysisResponse(response);

  if (!analysis) {
    await prisma.analysisCache.update({
      where: { id: cacheEntry.id },
      data: {
        status: "failed",
        errorMessage: "Failed to parse AI response",
        rawResponse: response.slice(0, 5000),
      },
    });
    console.error("Failed to parse analysis response");
    return;
  }

  await prisma.analysisCache.update({
    where: { id: cacheEntry.id },
    data: {
      status: "success",
      analysisData: JSON.stringify(analysis),
      rawResponse: response.slice(0, 10000),
      actualProvider,
      durationMs: duration,
      completedAt: new Date(),
    },
  });
  console.log(`Analysis cache updated (success) for brand ${brand.name}`);

  const simulation = await saveAnalysisResults(
    userId,
    { id: brand.id, name: brand.name },
    analysis,
    response,
    provider
  );

  console.log(`Analysis saved: simulation ${simulation.id}, brand mention + ${(analysis.competitorComparison || []).length} competitor mentions`);
}
