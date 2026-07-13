import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/progress?brandId=xxx&period=week|month|quarter|year
 * Fetches analysis progress data for a brand over specified time period
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get("brandId");
    const period = searchParams.get("period") || "month";

    if (!brandId) {
      return NextResponse.json({ error: "brandId is required" }, { status: 400 });
    }

    // Verify brand ownership
    const brand = await prisma.brand.findFirst({
      where: {
        id: brandId,
        userId: session.user.id,
      },
    });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    let groupBy: "day" | "week" | "month";

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupBy = "day";
        break;
      case "month":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        groupBy = "day";
        break;
      case "quarter":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        groupBy = "week";
        break;
      case "year":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        groupBy = "month";
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        groupBy = "day";
    }

    // Fetch snapshots
    const snapshots = await prisma.analysisSnapshot.findMany({
      where: {
        brandId,
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Group and aggregate data
    const groupedData = groupSnapshots(snapshots, groupBy);

    // Calculate summary statistics
    const latestSnapshot = snapshots[snapshots.length - 1];
    const firstSnapshot = snapshots[0];

    const summary = {
      currentScore: latestSnapshot?.overallScore || 0,
      startScore: firstSnapshot?.overallScore || 0,
      change: latestSnapshot && firstSnapshot
        ? latestSnapshot.overallScore - firstSnapshot.overallScore
        : 0,
      changePercent: latestSnapshot && firstSnapshot && firstSnapshot.overallScore > 0
        ? Math.round(((latestSnapshot.overallScore - firstSnapshot.overallScore) / firstSnapshot.overallScore) * 100)
        : 0,
      totalSnapshots: snapshots.length,
      period,
      avgScore: snapshots.length > 0
        ? Math.round(snapshots.reduce((a, b) => a + b.overallScore, 0) / snapshots.length)
        : 0,
      highestScore: snapshots.length > 0
        ? Math.max(...snapshots.map(s => s.overallScore))
        : 0,
      lowestScore: snapshots.length > 0
        ? Math.min(...snapshots.map(s => s.overallScore))
        : 0,
    };

    return NextResponse.json({
      success: true,
      data: groupedData,
      summary,
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
    });
  } catch (error) {
    console.error("Progress API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch progress" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/progress
 * Save a new analysis snapshot (called after analysis runs)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      brandId,
      overallScore,
      chatgptScore,
      geminiScore,
      perplexityScore,
      totalMentions,
      mentionFrequency,
      sentimentScore,
      positivePercent,
      neutralPercent,
      negativePercent,
      avgPosition,
      competitorRank,
      analysisData,
    } = body;

    if (!brandId || overallScore === undefined) {
      return NextResponse.json(
        { error: "brandId and overallScore are required" },
        { status: 400 }
      );
    }

    // Verify brand ownership
    const brand = await prisma.brand.findFirst({
      where: {
        id: brandId,
        userId: session.user.id,
      },
    });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Create snapshot
    const snapshot = await prisma.analysisSnapshot.create({
      data: {
        brandId,
        overallScore: Math.round(overallScore),
        chatgptScore: chatgptScore ? Math.round(chatgptScore) : null,
        geminiScore: geminiScore ? Math.round(geminiScore) : null,
        perplexityScore: perplexityScore ? Math.round(perplexityScore) : null,
        totalMentions: totalMentions || 0,
        mentionFrequency: mentionFrequency || 0,
        sentimentScore: sentimentScore ? Math.round(sentimentScore) : null,
        positivePercent: positivePercent ? Math.round(positivePercent) : null,
        neutralPercent: neutralPercent ? Math.round(neutralPercent) : null,
        negativePercent: negativePercent ? Math.round(negativePercent) : null,
        avgPosition: avgPosition || null,
        competitorRank: competitorRank || null,
        analysisData: analysisData ? JSON.stringify(analysisData) : null,
      },
    });

    return NextResponse.json({
      success: true,
      snapshot: {
        id: snapshot.id,
        overallScore: snapshot.overallScore,
        createdAt: snapshot.createdAt,
      },
    });
  } catch (error) {
    console.error("Progress save error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save snapshot" },
      { status: 500 }
    );
  }
}

// Helper function to group snapshots by time period
function groupSnapshots(
  snapshots: Array<{
    id: string;
    overallScore: number;
    chatgptScore: number | null;
    geminiScore: number | null;
    perplexityScore: number | null;
    totalMentions: number;
    sentimentScore: number | null;
    avgPosition: number | null;
    createdAt: Date;
  }>,
  groupBy: "day" | "week" | "month"
): Array<{
  date: string;
  label: string;
  overallScore: number;
  chatgptScore: number | null;
  geminiScore: number | null;
  perplexityScore: number | null;
  totalMentions: number;
  sentimentScore: number | null;
  avgPosition: number | null;
  count: number;
}> {
  const groups: Map<string, typeof snapshots> = new Map();

  snapshots.forEach((snapshot) => {
    let key: string;
    const date = new Date(snapshot.createdAt);

    switch (groupBy) {
      case "day":
        key = date.toISOString().split("T")[0];
        break;
      case "week":
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split("T")[0];
        break;
      case "month":
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        break;
    }

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(snapshot);
  });

  // Aggregate each group
  const result: Array<{
    date: string;
    label: string;
    overallScore: number;
    chatgptScore: number | null;
    geminiScore: number | null;
    perplexityScore: number | null;
    totalMentions: number;
    sentimentScore: number | null;
    avgPosition: number | null;
    count: number;
  }> = [];

  groups.forEach((items, key) => {
    const avgOverall = Math.round(items.reduce((a, b) => a + b.overallScore, 0) / items.length);

    const chatgptItems = items.filter(i => i.chatgptScore !== null);
    const geminiItems = items.filter(i => i.geminiScore !== null);
    const perplexityItems = items.filter(i => i.perplexityScore !== null);
    const sentimentItems = items.filter(i => i.sentimentScore !== null);
    const positionItems = items.filter(i => i.avgPosition !== null);

    // Generate label
    let label: string;
    const date = new Date(key);
    switch (groupBy) {
      case "day":
        label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        break;
      case "week":
        label = `Week of ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
        break;
      case "month":
        label = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        break;
    }

    result.push({
      date: key,
      label,
      overallScore: avgOverall,
      chatgptScore: chatgptItems.length > 0
        ? Math.round(chatgptItems.reduce((a, b) => a + (b.chatgptScore || 0), 0) / chatgptItems.length)
        : null,
      geminiScore: geminiItems.length > 0
        ? Math.round(geminiItems.reduce((a, b) => a + (b.geminiScore || 0), 0) / geminiItems.length)
        : null,
      perplexityScore: perplexityItems.length > 0
        ? Math.round(perplexityItems.reduce((a, b) => a + (b.perplexityScore || 0), 0) / perplexityItems.length)
        : null,
      totalMentions: Math.round(items.reduce((a, b) => a + b.totalMentions, 0) / items.length),
      sentimentScore: sentimentItems.length > 0
        ? Math.round(sentimentItems.reduce((a, b) => a + (b.sentimentScore || 0), 0) / sentimentItems.length)
        : null,
      avgPosition: positionItems.length > 0
        ? Math.round((positionItems.reduce((a, b) => a + (b.avgPosition || 0), 0) / positionItems.length) * 10) / 10
        : null,
      count: items.length,
    });
  });

  return result.sort((a, b) => a.date.localeCompare(b.date));
}
