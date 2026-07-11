import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateRecommendations, RecommendationContext } from "@/lib/recommendations";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get("brandId");

    if (!brandId) {
      return NextResponse.json({ error: "Brand ID required" }, { status: 400 });
    }

    // Get existing recommendations
    const recommendations = await prisma.recommendation.findMany({
      where: { brandId },
      orderBy: [
        { priority: "asc" },
        { generatedAt: "desc" },
      ],
    });

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { brandId } = await req.json();

    if (!brandId) {
      return NextResponse.json({ error: "Brand ID required" }, { status: 400 });
    }

    // Verify ownership
    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: session.user.id },
      include: { competitors: true },
    });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Get visibility data for context
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const mentions = await prisma.mention.findMany({
      where: {
        brandId,
        createdAt: { gte: startDate },
      },
    });

    const simulations = await prisma.simulation.count({
      where: {
        brandId,
        createdAt: { gte: startDate },
      },
    });

    // Calculate scores
    const calculateScore = (mentionsList: typeof mentions, totalSims: number) => {
      if (totalSims === 0) return 50; // Default score

      const presenceScore = Math.min((mentionsList.length / totalSims) * 100, 100);
      const sentiments = mentionsList.filter((m) => m.sentiment !== null).map((m) => m.sentiment!);
      const avgSentiment = sentiments.length > 0
        ? sentiments.reduce((a, b) => a + b, 0) / sentiments.length
        : 0;
      const sentimentScore = ((avgSentiment + 1) / 2) * 100;
      const positions = mentionsList.filter((m) => m.position !== null).map((m) => m.position!);
      const avgPosition = positions.length > 0
        ? positions.reduce((a, b) => a + b, 0) / positions.length
        : 5;
      const positionScore = Math.max(0, 100 - (avgPosition - 1) * 15);

      return Math.round(presenceScore * 0.4 + sentimentScore * 0.25 + positionScore * 0.35);
    };

    const chatgptMentions = mentions.filter((m) => m.aiSystem === "chatgpt");
    const geminiMentions = mentions.filter((m) => m.aiSystem === "gemini");
    const chatgptScore = calculateScore(chatgptMentions, simulations);
    const geminiScore = calculateScore(geminiMentions, simulations);
    const visibilityScore = Math.round((chatgptScore + geminiScore) / 2);

    const sentiments = mentions.filter((m) => m.sentiment !== null).map((m) => m.sentiment!);
    const avgSentiment = sentiments.length > 0
      ? sentiments.reduce((a, b) => a + b, 0) / sentiments.length
      : 0;

    // Build context for recommendations
    const context: RecommendationContext = {
      visibilityScore,
      chatgptScore,
      geminiScore,
      totalMentions: mentions.length,
      avgSentiment,
      hasG2Profile: false, // Would need to check in production
      hasLinkedIn: false,
      hasCrunchbase: false,
      hasGoogleBusiness: false,
      hasFAQ: false,
      competitorCount: brand.competitors.length,
      avgCompetitorScore: 60, // Mock competitor score
    };

    // Generate recommendations
    const newRecommendations = generateRecommendations(context);

    // Delete old recommendations for this brand
    await prisma.recommendation.deleteMany({ where: { brandId } });

    // Create new recommendations
    const created = await prisma.recommendation.createMany({
      data: newRecommendations.map((rec) => ({
        brandId,
        category: rec.category,
        priority: rec.priority,
        title: rec.title,
        description: rec.description,
        effort: rec.effort,
        timeline: rec.timeline,
        expectedImpact: rec.expectedImpact,
        actionUrl: rec.actionUrl || null,
        guideUrl: rec.guideUrl || null,
        competitorGap: null,
      })),
    });

    // Fetch and return the created recommendations
    const recommendations = await prisma.recommendation.findMany({
      where: { brandId },
      orderBy: [
        { priority: "asc" },
        { generatedAt: "desc" },
      ],
    });

    return NextResponse.json({
      generated: created.count,
      recommendations,
      context: {
        visibilityScore,
        projectedScore: Math.min(100, visibilityScore + 25),
      },
    });
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
