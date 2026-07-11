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

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { brandId, competitorIds, provider = "gemini" } = body;

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

    // Check rate limit
    const rateLimitProvider = provider === "chatgpt" ? "chatgpt" : provider === "perplexity" ? "perplexity" : "gemini";
    const canProceed = await checkRateLimit(rateLimitProvider);
    if (!canProceed) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Please try again later.` },
        { status: 429 }
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

    // Call AI provider
    const startTime = Date.now();
    const { response, actualProvider } = await callAIWithFallback(prompt, provider);
    const duration = Date.now() - startTime;
    console.log(`Analysis completed in ${duration}ms via ${actualProvider}`);

    // Record usage
    await recordUsage(rateLimitProvider);

    // Parse the response
    const analysis = parseAnalysisResponse(response);

    if (!analysis) {
      console.error("Failed to parse analysis response");
      return NextResponse.json(
        {
          error: "Failed to parse analysis",
          rawResponse: response.slice(0, 1000), // Return partial for debugging
        },
        { status: 500 }
      );
    }

    // Extract sentiment from analysis result
    const brandSentiment = analysis.sentimentAnalysis?.brandSentiment?.overall || "neutral";
    const sentimentScore = brandSentiment === "positive" ? 0.5 :
                           brandSentiment === "negative" ? -0.5 : 0;

    // Create a simulation record to track this analysis
    // Note: Perplexity uses chatgpt fields for now until schema migration
    const isPerplexityOrChatgpt = provider === "chatgpt" || provider === "perplexity";
    const simulation = await prisma.simulation.create({
      data: {
        userId: session.user.id,
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

    // Save mention record from analysis results
    // This updates the visibility data displayed on Overview and Brand Pulse
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

    // Also save competitor mentions for tracking
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

    console.log(`Analysis saved: simulation ${simulation.id}, brand mention + ${(analysis.competitorComparison || []).length} competitor mentions`);

    // Store the full analysis result in ReportGeneration for comprehensive report access
    // This allows the Reports page to pull all the rich analysis data
    await prisma.reportGeneration.create({
      data: {
        brandId: brand.id,
        type: "analysis",
        analysisData: JSON.stringify(analysis),
      },
    });

    console.log(`Full analysis data saved to ReportGeneration for brand ${brand.name}`);

    return NextResponse.json({
      success: true,
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
