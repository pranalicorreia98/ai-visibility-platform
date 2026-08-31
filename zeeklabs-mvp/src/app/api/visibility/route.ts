import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateScoreFromMentions } from "@/lib/scoring";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get("brandId");
    const days = parseInt(searchParams.get("days") || "7");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // First, check if we have a valid cached analysis for this brand
    // This contains the AI-generated visibility scores
    let cachedAnalysis: {
      scores?: {
        overall?: number;
        brandAwareness?: number;
        marketPosition?: number;
        sentimentScore?: number;
        authorityScore?: number;
        contentVisibility?: number;
        socialPresence?: number;
      };
      aiVisibility?: {
        mentionFrequency?: string;
        typicalPosition?: number | null;
        recommendationLikelihood?: string;
        competitorMentionGap?: string;
        improvementAreas?: string[];
      };
      sentimentAnalysis?: {
        brandSentiment?: {
          overall?: string;
          score?: number;
          positiveThemes?: string[];
          negativeThemes?: string[];
          neutralThemes?: string[];
        };
        customerSentiment?: {
          satisfaction?: number;
          nps?: string;
        };
      };
      competitorComparison?: Array<{
        name: string;
        overallScore: number;
        sentiment?: string;
      }>;
    } | null = null;

    if (brandId) {
      // Check for valid analysis cache
      const analysisCache = await prisma.analysisCache.findFirst({
        where: {
          brandId,
          status: "success",
          expiresAt: { gt: new Date() },
          analysisData: { not: null },
        },
        orderBy: { completedAt: "desc" },
      });

      if (analysisCache?.analysisData) {
        try {
          cachedAnalysis = JSON.parse(analysisCache.analysisData);
        } catch (e) {
          console.error("Failed to parse cached analysis:", e);
        }
      }
    }

    // Get mentions for the brand (only brand mentions, not competitor mentions)
    const whereClause: Record<string, unknown> = {
      createdAt: { gte: startDate },
      isCompetitor: false, // Only count actual brand mentions, not competitor mentions
    };

    if (brandId) {
      whereClause.brandId = brandId;
    } else {
      // Get user's brands
      const userBrands = await prisma.brand.findMany({
        where: { userId: session.user.id },
        select: { id: true },
      });
      whereClause.brandId = { in: userBrands.map((b) => b.id) };
    }

    const mentions = await prisma.mention.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    // Calculate visibility metrics
    const chatgptMentions = mentions.filter((m) => m.aiSystem === "chatgpt");
    const geminiMentions = mentions.filter((m) => m.aiSystem === "gemini");
    const perplexityMentions = mentions.filter((m) => m.aiSystem === "perplexity");

    // Get simulations count for the period
    const simulations = await prisma.simulation.count({
      where: {
        userId: session.user.id,
        createdAt: { gte: startDate },
        ...(brandId && { brandId }),
      },
    });

    // Calculate scores using the canonical formula (src/lib/scoring.ts) — the
    // same function reports/generate/route.ts and the PDF mapper use, so the
    // dashboard, reports, and PDFs can never disagree on a brand's score.
    const chatgptScore = calculateScoreFromMentions(chatgptMentions, simulations);
    const geminiScore = calculateScoreFromMentions(geminiMentions, simulations);
    const perplexityScore = calculateScoreFromMentions(perplexityMentions, simulations);

    // Calculate overall score (average of all active engines)
    const activeScores = [chatgptScore, geminiScore, perplexityScore].filter(s => s > 0);
    const overallScore = activeScores.length > 0
      ? Math.round(activeScores.reduce((a, b) => a + b, 0) / activeScores.length)
      : Math.round((chatgptScore + geminiScore + perplexityScore) / 3);

    // Calculate sentiment distribution
    const sentiments = mentions.filter((m) => m.sentiment !== null).map((m) => m.sentiment!);
    const avgSentiment = sentiments.length > 0
      ? sentiments.reduce((a, b) => a + b, 0) / sentiments.length
      : 0;

    // Get daily trend data
    const dailyData: Record<string, { chatgpt: number; gemini: number; perplexity: number; total: number }> = {};

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      dailyData[dateStr] = { chatgpt: 0, gemini: 0, perplexity: 0, total: 0 };
    }

    mentions.forEach((m) => {
      const dateStr = m.createdAt.toISOString().split("T")[0];
      if (dailyData[dateStr]) {
        dailyData[dateStr].total++;
        if (m.aiSystem === "chatgpt") dailyData[dateStr].chatgpt++;
        if (m.aiSystem === "gemini") dailyData[dateStr].gemini++;
        if (m.aiSystem === "perplexity") dailyData[dateStr].perplexity++;
      }
    });

    const trend = Object.entries(dailyData)
      .map(([date, data]) => ({ date, ...data }))
      .reverse();

    // Calculate previous period data for trend comparison
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - days);

    const previousMentions = await prisma.mention.findMany({
      where: {
        ...whereClause,
        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
        isCompetitor: false,
      },
    });

    const previousSimulations = await prisma.simulation.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
        ...(brandId && { brandId }),
      },
    });

    // Calculate trend percentages (current vs previous period)
    const mentionsTrend = previousMentions.length > 0
      ? Math.round(((mentions.length - previousMentions.length) / previousMentions.length) * 100)
      : mentions.length > 0 ? 100 : 0;

    const frequencyTrend = previousSimulations > 0
      ? Math.round(((simulations - previousSimulations) / previousSimulations) * 100)
      : simulations > 0 ? 100 : 0;

    // Calculate average position from mentions
    const positions = mentions.filter((m) => m.position !== null).map((m) => m.position!);
    const avgPosition = positions.length > 0
      ? positions.reduce((a, b) => a + b, 0) / positions.length
      : null;

    // Calculate previous period position for trend
    const previousPositions = previousMentions.filter((m) => m.position !== null).map((m) => m.position!);
    const previousAvgPosition = previousPositions.length > 0
      ? previousPositions.reduce((a, b) => a + b, 0) / previousPositions.length
      : null;

    // Position trend (negative is better - means improved ranking)
    const positionTrend = avgPosition !== null && previousAvgPosition !== null
      ? Number((previousAvgPosition - avgPosition).toFixed(1))
      : null;

    // Calculate sentiment percentages (as percentages of total)
    const totalSentiments = sentiments.length;
    const positiveCount = sentiments.filter((s) => s > 0.2).length;
    const neutralCount = sentiments.filter((s) => s >= -0.2 && s <= 0.2).length;
    const negativeCount = sentiments.filter((s) => s < -0.2).length;

    const sentimentPercentages = totalSentiments > 0 ? {
      positive: Math.round((positiveCount / totalSentiments) * 100),
      neutral: Math.round((neutralCount / totalSentiments) * 100),
      negative: Math.round((negativeCount / totalSentiments) * 100),
    } : {
      positive: 0,
      neutral: 0,
      negative: 0,
    };

    // Platform-specific sentiment breakdown
    const calculatePlatformSentiment = (platformMentions: typeof mentions) => {
      const platformSentiments = platformMentions.filter(m => m.sentiment !== null).map(m => m.sentiment!);
      const total = platformSentiments.length;
      if (total === 0) return { positive: 0, neutral: 0, negative: 0 };

      return {
        positive: Math.round((platformSentiments.filter(s => s > 0.2).length / total) * 100),
        neutral: Math.round((platformSentiments.filter(s => s >= -0.2 && s <= 0.2).length / total) * 100),
        negative: Math.round((platformSentiments.filter(s => s < -0.2).length / total) * 100),
      };
    };

    const platformSentiment = {
      chatgpt: calculatePlatformSentiment(chatgptMentions),
      gemini: calculatePlatformSentiment(geminiMentions),
      perplexity: calculatePlatformSentiment(perplexityMentions),
    };

    // Trust model: once real simulations exist for this brand/period, measured
    // data is authoritative and is never overridden by the LLM's one-shot
    // analysis guess. The AI analysis blob is only used as an explicitly
    // labeled fallback when there is no measured data at all — it is never
    // blended field-by-field into "measured-looking" numbers.
    const hasAnalysisData = cachedAnalysis?.scores?.overall !== undefined;
    const hasMeasuredData = simulations > 0;
    const dataSource: "measured" | "ai_estimate" | "none" = hasMeasuredData
      ? "measured"
      : hasAnalysisData
        ? "ai_estimate"
        : "none";

    const finalOverallScore = hasMeasuredData
      ? overallScore
      : (hasAnalysisData ? cachedAnalysis!.scores!.overall! : 0);

    // Per-platform breakdown is only ever real measurement — a real zero
    // (queried, brand wasn't mentioned) is a legitimate result and is never
    // replaced with a number derived from the LLM's overall guess.
    const finalChatgptScore = hasMeasuredData ? chatgptScore : 0;
    const finalGeminiScore = hasMeasuredData ? geminiScore : 0;
    const finalPerplexityScore = hasMeasuredData ? perplexityScore : 0;
    // True only when we're showing an AI-estimated overall score with no
    // per-platform measurement behind it at all.
    const platformScoresEstimated = !hasMeasuredData && hasAnalysisData;

    // Mentions/position/sentiment are always the real measured values — no
    // synthesized counts from a qualitative AI label ("high" -> 15, etc.).
    const finalTotalMentions = mentions.length;
    const mentionFrequencyPerWeek = Math.round(mentions.length / Math.max(1, days / 7));
    const finalPosition = avgPosition;
    const finalSentimentPercentages = sentimentPercentages;
    const finalAvgSentiment = hasMeasuredData
      ? avgSentiment
      : (cachedAnalysis?.sentimentAnalysis?.brandSentiment?.score !== undefined
          ? (cachedAnalysis.sentimentAnalysis.brandSentiment.score - 50) / 50
          : 0);
    const finalPlatformSentiment = platformSentiment;

    // AI estimate values, kept separate from measured fields so the frontend
    // can render them as a clearly labeled "AI Estimate" panel instead of
    // silently substituting them into measured-looking numbers.
    const aiEstimate = !hasMeasuredData && cachedAnalysis?.aiVisibility
      ? {
          mentionFrequency: cachedAnalysis.aiVisibility.mentionFrequency ?? null,
          typicalPosition: cachedAnalysis.aiVisibility.typicalPosition ?? null,
          recommendationLikelihood: cachedAnalysis.aiVisibility.recommendationLikelihood ?? null,
        }
      : null;

    return NextResponse.json({
      score: {
        overall: finalOverallScore,
        chatgpt: finalChatgptScore,
        gemini: finalGeminiScore,
        perplexity: finalPerplexityScore,
      },
      mentions: {
        total: finalTotalMentions,
        chatgpt: chatgptMentions.length,
        gemini: geminiMentions.length,
        perplexity: perplexityMentions.length,
      },
      sentiment: {
        average: finalAvgSentiment,
        positive: positiveCount,
        neutral: neutralCount,
        negative: negativeCount,
        percentages: finalSentimentPercentages,
      },
      platformSentiment: finalPlatformSentiment,
      simulations,
      trend,
      // Trend metrics for frontend - use actual calculated values only
      trends: {
        mentions: mentionsTrend,
        frequency: frequencyTrend,
        position: positionTrend,
      },
      position: {
        average: finalPosition !== null ? Number(Number(finalPosition).toFixed(1)) : null,
        trend: positionTrend,
      },
      // Include mention frequency per week
      mentionFrequency: mentionFrequencyPerWeek,
      // Flag to indicate if data is from AI analysis
      fromAnalysis: hasAnalysisData,
      // Flag to indicate if platform scores are estimated (not measured from actual mentions)
      platformScoresEstimated,
      // 'measured' = real simulations exist this period; 'ai_estimate' = no
      // simulations yet, showing the LLM's one-shot guess; 'none' = nothing.
      dataSource,
      // AI-estimated values, kept separate from the measured fields above so
      // the UI can render them as an explicitly labeled estimate.
      aiEstimate,
    });
  } catch (error) {
    console.error("Error fetching visibility data:", error);
    return NextResponse.json(
      { error: "Failed to fetch visibility data" },
      { status: 500 }
    );
  }
}
