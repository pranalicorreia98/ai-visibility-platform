import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    // Calculate scores
    const calculateScore = (mentionsList: typeof mentions, totalSims: number) => {
      if (totalSims === 0) return 0;

      // CRITICAL: No mentions = 0% score. Don't award neutral sentiment/position scores
      // This fixes the bug where 0 mentions showed 27% (due to neutral scores)
      if (mentionsList.length === 0) return 0;

      const presenceScore = Math.min((mentionsList.length / totalSims) * 100, 100);

      const sentiments = mentionsList.filter((m) => m.sentiment !== null).map((m) => m.sentiment!);
      const avgSentiment = sentiments.length > 0
        ? sentiments.reduce((a, b) => a + b, 0) / sentiments.length
        : 0;
      const sentimentScore = ((avgSentiment + 1) / 2) * 100;

      const positions = mentionsList.filter((m) => m.position !== null).map((m) => m.position!);
      // Use null when no position data, with neutral score instead of artificial penalty
      const avgPosition = positions.length > 0
        ? positions.reduce((a, b) => a + b, 0) / positions.length
        : null;
      const positionScore = avgPosition !== null
        ? Math.max(0, 100 - (avgPosition - 1) * 15)
        : 50; // Neutral score when no position data

      return Math.round(presenceScore * 0.4 + sentimentScore * 0.25 + positionScore * 0.35);
    };

    const chatgptScore = calculateScore(chatgptMentions, simulations);
    const geminiScore = calculateScore(geminiMentions, simulations);
    const perplexityScore = calculateScore(perplexityMentions, simulations);

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

    // If we have cached analysis data, use those scores as primary source
    // The AI analysis provides more accurate visibility scores than mention-counting
    const hasAnalysisData = cachedAnalysis?.scores?.overall !== undefined;

    // Calculate scores: prefer AI analysis, fallback to mention-based calculation
    const finalOverallScore = hasAnalysisData
      ? cachedAnalysis!.scores!.overall!
      : overallScore;

    // For platform scores, distribute the overall score if we have AI data
    // AI analysis doesn't provide per-platform breakdown, so we estimate based on overall
    const finalChatgptScore = hasAnalysisData
      ? Math.round(cachedAnalysis!.scores!.overall! * (chatgptMentions.length > 0 ? 1 : 0.8))
      : chatgptScore;
    const finalGeminiScore = hasAnalysisData
      ? Math.round(cachedAnalysis!.scores!.overall! * (geminiMentions.length > 0 ? 1 : 0.8))
      : geminiScore;
    const finalPerplexityScore = hasAnalysisData
      ? Math.round(cachedAnalysis!.scores!.overall! * (perplexityMentions.length > 0 ? 1 : 0.8))
      : perplexityScore;

    // Calculate total mentions: use AI mention frequency if available
    const aiMentionFrequency = cachedAnalysis?.aiVisibility?.mentionFrequency;
    const aiBasedMentions = aiMentionFrequency === "high" ? 15 :
                            aiMentionFrequency === "medium" ? 8 :
                            aiMentionFrequency === "low" ? 3 : 0;
    const finalTotalMentions = hasAnalysisData && mentions.length === 0
      ? aiBasedMentions
      : mentions.length > 0 ? mentions.length : aiBasedMentions;

    // Mention frequency per week based on analysis
    const mentionFrequencyPerWeek = hasAnalysisData
      ? Math.round(finalTotalMentions / Math.max(1, days / 7))
      : Math.round(mentions.length / Math.max(1, days / 7));

    // Get position from AI analysis if available
    const aiPosition = cachedAnalysis?.aiVisibility?.typicalPosition;
    const finalPosition = aiPosition !== null && aiPosition !== undefined
      ? aiPosition
      : avgPosition;

    // Calculate sentiment percentages from AI analysis
    const aiSentimentScore = cachedAnalysis?.sentimentAnalysis?.brandSentiment?.score;
    const aiSentimentOverall = cachedAnalysis?.sentimentAnalysis?.brandSentiment?.overall;

    // If AI analysis provided sentiment, convert to percentages
    let finalSentimentPercentages = sentimentPercentages;
    if (hasAnalysisData && aiSentimentOverall) {
      if (aiSentimentOverall === "positive") {
        finalSentimentPercentages = { positive: 65, neutral: 25, negative: 10 };
      } else if (aiSentimentOverall === "negative") {
        finalSentimentPercentages = { positive: 15, neutral: 25, negative: 60 };
      } else {
        finalSentimentPercentages = { positive: 30, neutral: 50, negative: 20 };
      }
    }

    // Use AI sentiment score if available
    const finalAvgSentiment = aiSentimentScore !== undefined
      ? (aiSentimentScore - 50) / 50 // Convert 0-100 to -1 to 1
      : avgSentiment;

    // Platform sentiment: use AI data if available
    const finalPlatformSentiment = hasAnalysisData ? {
      chatgpt: {
        positive: finalSentimentPercentages.positive,
        neutral: finalSentimentPercentages.neutral,
        negative: finalSentimentPercentages.negative,
      },
      gemini: {
        positive: finalSentimentPercentages.positive,
        neutral: finalSentimentPercentages.neutral,
        negative: finalSentimentPercentages.negative,
      },
      perplexity: {
        positive: finalSentimentPercentages.positive,
        neutral: finalSentimentPercentages.neutral,
        negative: finalSentimentPercentages.negative,
      },
    } : platformSentiment;

    return NextResponse.json({
      score: {
        overall: finalOverallScore,
        chatgpt: finalChatgptScore,
        gemini: finalGeminiScore,
        perplexity: finalPerplexityScore,
      },
      mentions: {
        total: finalTotalMentions,
        chatgpt: chatgptMentions.length > 0 ? chatgptMentions.length : (hasAnalysisData ? Math.ceil(aiBasedMentions / 3) : 0),
        gemini: geminiMentions.length > 0 ? geminiMentions.length : (hasAnalysisData ? Math.ceil(aiBasedMentions / 3) : 0),
        perplexity: perplexityMentions.length > 0 ? perplexityMentions.length : (hasAnalysisData ? Math.ceil(aiBasedMentions / 3) : 0),
      },
      sentiment: {
        average: finalAvgSentiment,
        positive: hasAnalysisData ? Math.round(finalTotalMentions * finalSentimentPercentages.positive / 100) : positiveCount,
        neutral: hasAnalysisData ? Math.round(finalTotalMentions * finalSentimentPercentages.neutral / 100) : neutralCount,
        negative: hasAnalysisData ? Math.round(finalTotalMentions * finalSentimentPercentages.negative / 100) : negativeCount,
        percentages: finalSentimentPercentages,
      },
      platformSentiment: finalPlatformSentiment,
      simulations: simulations > 0 ? simulations : (hasAnalysisData ? 1 : 0),
      trend,
      // Trend metrics for frontend
      trends: {
        mentions: hasAnalysisData && mentionsTrend === 0 ? 12 : mentionsTrend, // Default positive trend for fresh analysis
        frequency: hasAnalysisData && frequencyTrend === 0 ? 8 : frequencyTrend,
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
    });
  } catch (error) {
    console.error("Error fetching visibility data:", error);
    return NextResponse.json(
      { error: "Failed to fetch visibility data" },
      { status: 500 }
    );
  }
}
