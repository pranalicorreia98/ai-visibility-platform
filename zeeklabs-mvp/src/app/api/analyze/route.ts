import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  callChatGPTWithRetry,
  callGeminiWithRetry,
  callPerplexityWithRetry,
  callOpenRouterChatGPTWithRetry,
  callOpenRouterGeminiWithRetry,
} from "@/lib/ai-providers";
import {
  generateAnalysisPrompt,
  parseAnalysisResponse,
  AnalysisRequest,
  VisibilityAnalysisResult,
} from "@/lib/prompts/visibility-analysis-prompt";
import { checkRateLimit, recordUsage } from "@/lib/rate-limit";

// Cache duration: 24 hours in milliseconds
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

/**
 * Generate a consistent cache key for competitor IDs
 * Sorts IDs to ensure same combination always produces same key
 */
function generateCompetitorCacheKey(competitorIds: string[]): string {
  return JSON.stringify([...competitorIds].sort());
}

/**
 * Check if a valid cache entry exists for this analysis
 * Returns the cached analysis if valid, null otherwise
 */
async function getValidCache(
  brandId: string,
  provider: string,
  competitorIds: string[]
): Promise<{
  isValid: boolean;
  cache: {
    id: string;
    status: string;
    analysisData: string | null;
    errorMessage: string | null;
    actualProvider: string | null;
    durationMs: number | null;
    createdAt: Date;
    expiresAt: Date;
  } | null;
  canRetry: boolean;
}> {
  const competitorKey = generateCompetitorCacheKey(competitorIds);

  // Find any cache entry for this combination
  const cache = await prisma.analysisCache.findUnique({
    where: {
      brandId_provider_competitorIds: {
        brandId,
        provider,
        competitorIds: competitorKey,
      },
    },
  });

  if (!cache) {
    return { isValid: false, cache: null, canRetry: true };
  }

  const now = new Date();

  // Check if cache has expired
  if (now > cache.expiresAt) {
    // Cache expired, delete it and allow fresh run
    await prisma.analysisCache.delete({ where: { id: cache.id } });
    return { isValid: false, cache: null, canRetry: true };
  }

  // Check cache status
  if (cache.status === "success" && cache.analysisData) {
    // Valid successful cache - return cached data
    return { isValid: true, cache, canRetry: false };
  }

  if (cache.status === "failed") {
    // Previous run failed - allow retry
    // Delete the failed cache entry so user can try again
    await prisma.analysisCache.delete({ where: { id: cache.id } });
    return { isValid: false, cache: null, canRetry: true };
  }

  if (cache.status === "pending") {
    // Analysis is currently in progress
    // Check if it's been pending for too long (5 minutes = likely stuck)
    const pendingTimeout = 5 * 60 * 1000; // 5 minutes
    const pendingDuration = now.getTime() - cache.createdAt.getTime();

    if (pendingDuration > pendingTimeout) {
      // Stuck pending - delete and allow retry
      await prisma.analysisCache.delete({ where: { id: cache.id } });
      return { isValid: false, cache: null, canRetry: true };
    }

    // Still pending - don't allow duplicate run
    return {
      isValid: false,
      cache,
      canRetry: false,
    };
  }

  // Unknown status - allow retry
  return { isValid: false, cache: null, canRetry: true };
}

/**
 * Call AI provider with fallback chain
 */
async function callAIWithFallback(
  prompt: string,
  provider: "chatgpt" | "gemini" | "perplexity"
): Promise<{ response: string; actualProvider: string }> {
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
    // Fallback to OpenRouter
    if (process.env.OPENROUTER_API_KEY) {
      console.log("Analysis: Trying OpenRouter (ChatGPT)...");
      const response = await callOpenRouterChatGPTWithRetry(prompt);
      return { response, actualProvider: "openrouter-chatgpt" };
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
    // Fallback to OpenRouter
    if (process.env.OPENROUTER_API_KEY) {
      console.log("Analysis: Trying OpenRouter (Gemini)...");
      const response = await callOpenRouterGeminiWithRetry(prompt);
      return { response, actualProvider: "openrouter-gemini" };
    }
    throw new Error("No Gemini providers available");
  }
}

/**
 * Save analysis results to database (simulation, mentions, reports, snapshots)
 */
async function saveAnalysisResults(
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

  // Create a simulation record to track this analysis
  const isPerplexityOrChatgpt = provider === "chatgpt" || provider === "perplexity";
  const simulation = await prisma.simulation.create({
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
  });

  // Save mention record
  const aiSystemName = provider === "chatgpt" ? "chatgpt" : provider === "perplexity" ? "perplexity" : "gemini";
  await prisma.mention.create({
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
  });

  // Save competitor mentions
  for (const competitor of analysis.competitorComparison || []) {
    const compSentiment = competitor.sentiment === "positive" ? 0.5 :
                          competitor.sentiment === "negative" ? -0.5 : 0;

    await prisma.mention.create({
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
  }

  // Store full analysis in ReportGeneration
  await prisma.reportGeneration.create({
    data: {
      brandId: brand.id,
      type: "analysis",
      analysisData: JSON.stringify(analysis),
    },
  });

  // Save analysis snapshot for progress tracking
  const sentimentAnalysis = analysis.sentimentAnalysis;
  const brandSentimentData = sentimentAnalysis?.brandSentiment;
  const overallSentimentScore = brandSentimentData?.score || 50;

  // Calculate competitor rank
  const allScores = [
    { name: brand.name, score: analysis.scores?.overall || 0 },
    ...(analysis.competitorComparison || []).map(c => ({ name: c.name, score: c.overallScore }))
  ].sort((a, b) => b.score - a.score);
  const competitorRank = allScores.findIndex(s => s.name === brand.name) + 1;

  await prisma.analysisSnapshot.create({
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
  });

  return simulation;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { brandId, competitorIds, provider = "gemini", forceRefresh = false } = body;

    if (!brandId) {
      return NextResponse.json({ error: "Brand ID required" }, { status: 400 });
    }

    // Get brand with competitors
    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: session.user.id },
      include: { competitors: true },
    });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Filter competitors if specific ones selected
    let selectedCompetitors = brand.competitors;
    if (competitorIds && Array.isArray(competitorIds) && competitorIds.length > 0) {
      selectedCompetitors = brand.competitors.filter((c) =>
        competitorIds.includes(c.id)
      );
    }

    if (selectedCompetitors.length === 0) {
      return NextResponse.json(
        { error: "At least one competitor is required for analysis" },
        { status: 400 }
      );
    }

    const selectedCompetitorIds = selectedCompetitors.map(c => c.id);
    const competitorKey = generateCompetitorCacheKey(selectedCompetitorIds);

    // Check for valid cache (unless force refresh is requested)
    if (!forceRefresh) {
      const cacheResult = await getValidCache(brandId, provider, selectedCompetitorIds);

      if (cacheResult.isValid && cacheResult.cache?.analysisData) {
        // Return cached data
        console.log(`Analysis cache HIT for brand ${brand.name} - returning cached data`);
        const cachedAnalysis = JSON.parse(cacheResult.cache.analysisData);

        return NextResponse.json({
          success: true,
          cached: true,
          cacheExpiry: cacheResult.cache.expiresAt.toISOString(),
          brand: {
            id: brand.id,
            name: brand.name,
            domain: brand.domain,
          },
          competitors: selectedCompetitors.map((c) => ({
            id: c.id,
            name: c.name,
          })),
          analysis: cachedAnalysis,
          meta: {
            provider: cacheResult.cache.actualProvider || provider,
            duration: cacheResult.cache.durationMs || 0,
            timestamp: cacheResult.cache.createdAt.toISOString(),
            fromCache: true,
          },
        });
      }

      if (!cacheResult.canRetry) {
        // Analysis is currently in progress
        return NextResponse.json(
          {
            error: "Analysis is already in progress. Please wait for it to complete.",
            status: "pending"
          },
          { status: 409 }
        );
      }
    } else {
      // Force refresh requested - delete any existing cache for this combination
      console.log(`Force refresh requested for brand ${brand.name} - clearing cache`);
      await prisma.analysisCache.deleteMany({
        where: {
          brandId,
          provider,
          competitorIds: competitorKey,
        },
      });
    }

    // Check rate limit
    const rateLimitProvider = provider === "chatgpt" ? "chatgpt" : provider === "perplexity" ? "perplexity" : "gemini";
    const canProceed = await checkRateLimit(rateLimitProvider);
    if (!canProceed) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Please try again later.` },
        { status: 429 }
      );
    }

    // Create a pending cache entry before starting analysis
    const expiresAt = new Date(Date.now() + CACHE_DURATION_MS);
    let cacheEntry;
    try {
      cacheEntry = await prisma.analysisCache.create({
        data: {
          brandId,
          provider,
          competitorIds: competitorKey,
          status: "pending",
          expiresAt,
        },
      });
      console.log(`Analysis cache entry created (pending) for brand ${brand.name}`);
    } catch (error) {
      // Handle race condition - another request might have created the entry
      console.log("Cache entry creation failed - possibly due to race condition");
      return NextResponse.json(
        {
          error: "Analysis is already in progress. Please wait for it to complete.",
          status: "pending"
        },
        { status: 409 }
      );
    }

    // Build analysis request
    const analysisRequest: AnalysisRequest = {
      brandName: brand.name,
      brandDomain: brand.domain || undefined,
      competitors: selectedCompetitors.map((c) => ({
        name: c.name,
        domain: c.domain || undefined,
      })),
    };

    // Generate the comprehensive prompt
    const prompt = generateAnalysisPrompt(analysisRequest);
    console.log("Analysis prompt generated, calling AI...");

    let response: string;
    let actualProvider: string;
    let duration: number;

    try {
      // Call AI provider
      const startTime = Date.now();
      const result = await callAIWithFallback(prompt, provider);
      response = result.response;
      actualProvider = result.actualProvider;
      duration = Date.now() - startTime;
      console.log(`Analysis completed in ${duration}ms via ${actualProvider}`);
    } catch (error) {
      // AI call failed - update cache with failed status
      await prisma.analysisCache.update({
        where: { id: cacheEntry.id },
        data: {
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "AI provider failed",
        },
      });
      console.error(`Analysis failed for brand ${brand.name}:`, error);
      throw error;
    }

    // Record usage
    await recordUsage(rateLimitProvider);

    // Parse the response
    const analysis = parseAnalysisResponse(response);

    if (!analysis) {
      // Parsing failed - update cache with failed status
      await prisma.analysisCache.update({
        where: { id: cacheEntry.id },
        data: {
          status: "failed",
          errorMessage: "Failed to parse AI response",
          rawResponse: response.slice(0, 5000),
        },
      });
      console.error("Failed to parse analysis response");
      return NextResponse.json(
        {
          error: "Failed to parse analysis. Please try again.",
          rawResponse: response.slice(0, 1000),
        },
        { status: 500 }
      );
    }

    // Success! Update cache with results
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

    // Save all the analysis results to other tables
    const simulation = await saveAnalysisResults(
      session.user.id,
      { id: brand.id, name: brand.name },
      analysis,
      response,
      provider
    );

    console.log(`Analysis saved: simulation ${simulation.id}, brand mention + ${(analysis.competitorComparison || []).length} competitor mentions`);

    return NextResponse.json({
      success: true,
      cached: false,
      cacheExpiry: expiresAt.toISOString(),
      brand: {
        id: brand.id,
        name: brand.name,
        domain: brand.domain,
      },
      competitors: selectedCompetitors.map((c) => ({
        id: c.id,
        name: c.name,
      })),
      analysis,
      meta: {
        provider: actualProvider,
        duration,
        timestamp: new Date().toISOString(),
        fromCache: false,
      },
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
