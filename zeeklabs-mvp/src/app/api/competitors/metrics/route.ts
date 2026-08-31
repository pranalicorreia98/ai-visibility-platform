import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateScoreFromMentions } from "@/lib/scoring";

export interface CompetitorMetric {
  name: string;
  domain: string | null;
  hasData: boolean;
  score: number | null;
  mentions: number;
  avgPosition: number | null;
  avgSentiment: number | null;
  simulationsCount: number;
}

/**
 * Real, measured competitor scores — grouped from Mention rows written by
 * the deterministic detection pipeline (api/simulate/route.ts,
 * src/lib/competitor-measurement.ts), never from the LLM's one-shot guess.
 * A competitor with zero comparison simulations run gets hasData: false
 * ("insufficient data") rather than a fabricated score.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get("brandId");
    const days = parseInt(searchParams.get("days") || "30");

    if (!brandId) {
      return NextResponse.json({ error: "brandId is required" }, { status: 400 });
    }

    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: session.user.id },
      include: { competitors: true },
    });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Denominator: how many dedicated comparison simulations have actually
    // run for this brand — organic (non-comparison) prompts aren't a fair
    // sample for "how often is competitor X mentioned."
    const comparisonSimulationsCount = await prisma.simulation.count({
      where: {
        brandId,
        promptType: "competitor_comparison",
        createdAt: { gte: startDate },
      },
    });

    const competitorMentions = await prisma.mention.findMany({
      where: {
        brandId,
        isCompetitor: true,
        createdAt: { gte: startDate },
      },
    });

    const metrics: CompetitorMetric[] = brand.competitors.map((competitor) => {
      const mentions = competitorMentions.filter((m) => m.competitorName === competitor.name);

      if (comparisonSimulationsCount === 0) {
        return {
          name: competitor.name,
          domain: competitor.domain,
          hasData: false,
          score: null,
          mentions: 0,
          avgPosition: null,
          avgSentiment: null,
          simulationsCount: 0,
        };
      }

      const positions = mentions.filter((m) => m.position !== null).map((m) => m.position!);
      const avgPosition = positions.length > 0
        ? Number((positions.reduce((a, b) => a + b, 0) / positions.length).toFixed(1))
        : null;

      const sentiments = mentions.filter((m) => m.sentiment !== null).map((m) => m.sentiment!);
      const avgSentiment = sentiments.length > 0
        ? Number((sentiments.reduce((a, b) => a + b, 0) / sentiments.length).toFixed(2))
        : null;

      return {
        name: competitor.name,
        domain: competitor.domain,
        hasData: true,
        score: calculateScoreFromMentions(mentions, comparisonSimulationsCount),
        mentions: mentions.length,
        avgPosition,
        avgSentiment,
        simulationsCount: comparisonSimulationsCount,
      };
    });

    return NextResponse.json({ competitors: metrics, comparisonSimulationsCount });
  } catch (error) {
    console.error("Error fetching competitor metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch competitor metrics" },
      { status: 500 }
    );
  }
}
