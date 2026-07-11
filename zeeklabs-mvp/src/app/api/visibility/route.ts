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

    return NextResponse.json({
      score: {
        overall: overallScore,
        chatgpt: chatgptScore,
        gemini: geminiScore,
        perplexity: perplexityScore,
      },
      mentions: {
        total: mentions.length,
        chatgpt: chatgptMentions.length,
        gemini: geminiMentions.length,
        perplexity: perplexityMentions.length,
      },
      sentiment: {
        average: avgSentiment,
        positive: sentiments.filter((s) => s > 0.2).length,
        neutral: sentiments.filter((s) => s >= -0.2 && s <= 0.2).length,
        negative: sentiments.filter((s) => s < -0.2).length,
      },
      simulations,
      trend,
    });
  } catch (error) {
    console.error("Error fetching visibility data:", error);
    return NextResponse.json(
      { error: "Failed to fetch visibility data" },
      { status: 500 }
    );
  }
}
