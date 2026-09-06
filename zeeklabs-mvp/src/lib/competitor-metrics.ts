// Real, measured competitor scores + Share of Voice — single source of
// truth shared by api/competitors/metrics/route.ts (dashboard) and
// api/reports/generate/route.ts (PDF), grouped from Mention rows written by
// the deterministic detection pipeline (api/simulate/route.ts,
// competitor-measurement.ts), never from the LLM's one-shot guess.
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

export interface ShareOfVoiceEntry {
  name: string;
  isYou: boolean;
  mentions: number;
  sharePct: number | null;
}

export interface ShareOfVoice {
  hasData: boolean;
  entries: ShareOfVoiceEntry[];
}

export interface CompetitorMetricsResult {
  comparisonSimulationsCount: number;
  competitors: CompetitorMetric[];
  shareOfVoice: ShareOfVoice | null;
}

/**
 * A competitor with zero comparison simulations run gets hasData: false
 * ("insufficient data") rather than a fabricated score. Both the competitor
 * mentions and the brand's own mentions here are scoped to
 * promptType: "competitor_comparison" via the Mention -> Simulation
 * relation, not just isCompetitor - without that scoping, a manual Prompt
 * Lab test (promptType: "manual_test") that happens to mention a competitor
 * would inflate the numerator against a denominator that only counts
 * comparison runs.
 */
export async function computeCompetitorMetrics(
  brandId: string,
  brandName: string,
  competitors: Array<{ name: string; domain: string | null }>,
  days: number
): Promise<CompetitorMetricsResult> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const comparisonSimulationsCount = await prisma.simulation.count({
    where: { brandId, promptType: "competitor_comparison", createdAt: { gte: startDate } },
  });

  const competitorMentions = comparisonSimulationsCount > 0
    ? await prisma.mention.findMany({
        where: {
          brandId,
          isCompetitor: true,
          createdAt: { gte: startDate },
          simulation: { promptType: "competitor_comparison" },
        },
      })
    : [];

  const brandMentionsCount = comparisonSimulationsCount > 0
    ? await prisma.mention.count({
        where: {
          brandId,
          isCompetitor: false,
          createdAt: { gte: startDate },
          simulation: { promptType: "competitor_comparison" },
        },
      })
    : 0;

  const metrics: CompetitorMetric[] = competitors.map((competitor) => {
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

  // Share of Voice: mentions / total mentions across the brand + every
  // competitor that actually has real data. Competitors with hasData:false
  // are excluded from the leaderboard entirely rather than shown at a
  // fabricated 0 - they simply haven't been measured yet.
  const shareOfVoice: ShareOfVoice | null = comparisonSimulationsCount === 0
    ? null
    : (() => {
        const withData = metrics.filter((m) => m.hasData);
        const rawEntries: Array<{ name: string; isYou: boolean; mentions: number }> = [
          { name: brandName, isYou: true, mentions: brandMentionsCount },
          ...withData.map((m) => ({ name: m.name, isYou: false, mentions: m.mentions })),
        ];
        const total = rawEntries.reduce((sum, e) => sum + e.mentions, 0);
        const entries: ShareOfVoiceEntry[] = rawEntries
          .map((e) => ({ ...e, sharePct: total > 0 ? (e.mentions / total) * 100 : null }))
          .sort((a, b) => b.mentions - a.mentions);
        return { hasData: true, entries };
      })();

  return { comparisonSimulationsCount, competitors: metrics, shareOfVoice };
}
