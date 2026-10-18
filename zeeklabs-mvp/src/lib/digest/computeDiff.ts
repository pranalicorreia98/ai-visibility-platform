import { prisma } from "@/lib/prisma";
import type {
  BrandDiff,
  EngineMentions,
  SentimentBreakdown,
  CompetitorMovement,
} from "./types";

/**
 * Compute the diff between two analysis periods for a brand.
 * Uses AnalysisSnapshot and Mention data to calculate changes.
 */
export async function computeBrandDiff(
  brandId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<BrandDiff | null> {
  // Get the brand with its current data
  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
    include: {
      competitors: true,
    },
  });

  if (!brand) return null;

  // Get snapshots: current (closest to periodEnd) and previous (closest to periodStart)
  const [currentSnapshot, previousSnapshot] = await Promise.all([
    prisma.analysisSnapshot.findFirst({
      where: { brandId, createdAt: { lte: periodEnd } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.analysisSnapshot.findFirst({
      where: { brandId, createdAt: { lte: periodStart } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Need at least current snapshot
  if (!currentSnapshot) return null;

  // Get mentions for both periods
  const [currentMentions, previousMentions] = await Promise.all([
    prisma.mention.findMany({
      where: {
        brandId,
        createdAt: { lte: periodEnd, gt: periodStart },
      },
    }),
    previousSnapshot
      ? prisma.mention.findMany({
          where: {
            brandId,
            createdAt: {
              lte: periodStart,
              gt: new Date(periodStart.getTime() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        })
      : Promise.resolve([]),
  ]);

  // Calculate engine mentions
  const engineMentions = computeEngineMentions(currentMentions, previousMentions);

  // Calculate sentiment
  const currentSentiment = computeSentiment(currentMentions);
  const previousSentiment = computeSentiment(previousMentions);

  // Get snapshot scores directly from the model
  const currentScore = currentSnapshot.overallScore;
  const previousScore = previousSnapshot?.overallScore ?? currentScore;

  // Get competitor movements (simplified - based on mention counts)
  const competitorMovement = await computeCompetitorMovement(
    brand.competitors,
    periodStart,
    periodEnd
  );

  // Get recommendations
  const recommendations = await prisma.recommendation.findMany({
    where: { brandId },
    orderBy: { priority: "asc" },
    take: 5,
  });

  return {
    brandId,
    brandName: brand.name,
    previousScore,
    currentScore,
    scoreDelta: currentScore - previousScore,
    mentions: engineMentions,
    sentiment: {
      previous: previousSentiment,
      current: currentSentiment,
    },
    competitorMovement,
    recommendations: recommendations.map((r) => r.title),
  };
}

function computeEngineMentions(
  current: { aiSystem: string }[],
  previous: { aiSystem: string }[]
): EngineMentions[] {
  const engines = ["chatgpt", "gemini", "perplexity"] as const;

  return engines.map((engine) => {
    const currentCount = current.filter(
      (m) => m.aiSystem.toLowerCase() === engine
    ).length;
    const previousCount = previous.filter(
      (m) => m.aiSystem.toLowerCase() === engine
    ).length;

    return {
      engine,
      previous: previousCount,
      current: currentCount,
      delta: currentCount - previousCount,
    };
  });
}

function computeSentiment(
  mentions: { sentiment: number | null }[]
): SentimentBreakdown {
  if (mentions.length === 0) {
    return { positive: 0, neutral: 100, negative: 0 };
  }

  const counts = { positive: 0, neutral: 0, negative: 0 };

  for (const m of mentions) {
    // sentiment is a float from -1.0 to 1.0
    const sentiment = m.sentiment ?? 0;
    if (sentiment > 0.2) counts.positive++;
    else if (sentiment < -0.2) counts.negative++;
    else counts.neutral++;
  }

  const total = mentions.length;
  return {
    positive: Math.round((counts.positive / total) * 100),
    neutral: Math.round((counts.neutral / total) * 100),
    negative: Math.round((counts.negative / total) * 100),
  };
}

async function computeCompetitorMovement(
  competitors: { id: string; name: string }[],
  periodStart: Date,
  periodEnd: Date
): Promise<CompetitorMovement[]> {
  const movements: CompetitorMovement[] = [];

  for (const comp of competitors.slice(0, 5)) {
    // Get current and previous mention counts for competitor
    const [currentCount, previousCount] = await Promise.all([
      prisma.mention.count({
        where: {
          response: { contains: comp.name, mode: "insensitive" },
          createdAt: { lte: periodEnd, gt: periodStart },
        },
      }),
      prisma.mention.count({
        where: {
          response: { contains: comp.name, mode: "insensitive" },
          createdAt: {
            lte: periodStart,
            gt: new Date(periodStart.getTime() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    let direction: CompetitorMovement["direction"] = "same";
    if (previousCount === 0 && currentCount > 0) {
      direction = "new";
    } else if (currentCount === 0 && previousCount > 0) {
      direction = "dropped";
    } else if (currentCount > previousCount) {
      direction = "up";
    } else if (currentCount < previousCount) {
      direction = "down";
    }

    // Only include if there's movement
    if (direction !== "same") {
      movements.push({
        name: comp.name,
        previousRank: previousCount,
        currentRank: currentCount,
        direction,
      });
    }
  }

  return movements;
}

// parseSnapshotScore removed - we read overallScore directly from the model
