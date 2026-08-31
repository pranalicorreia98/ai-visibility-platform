import { prisma } from "@/lib/prisma";
import {
  callGeminiWithRetry,
  callOpenRouterGeminiWithRetry,
} from "@/lib/ai-providers";
import { detectMentions, analyzeSentiment, detectPosition } from "@/lib/analysis";
import { checkRateLimit, recordUsage } from "@/lib/rate-limit";
import {
  generateCacheKey,
  getCachedResponse,
  setCachedResponse,
} from "@/lib/prompt-cache";

export interface MonitoringPassResult {
  brandId: string;
  brandName: string;
  promptsRun: number;
  mentionsFound: number;
  avgSentiment: number;
}

/**
 * Scan MonitoringConfig for brands due for a check, run their configured
 * prompts, and store the results. Shared by:
 * - POST /api/monitoring/run (manual/CRON_SECRET-gated trigger)
 * - scripts/scheduler-check.ts (in-process interval, replaces the
 *   previously-unwired external cron)
 */
export async function runMonitoringPass(): Promise<{
  brandsProcessed: number;
  results: MonitoringPassResult[];
  timestamp: string;
}> {
  const now = new Date();
  const dueConfigs = await prisma.monitoringConfig.findMany({
    where: {
      enabled: true,
      OR: [
        { nextRunAt: null },
        { nextRunAt: { lte: now } },
      ],
    },
    include: {
      brand: {
        include: {
          competitors: true,
        },
      },
    },
  });

  console.log(`Found ${dueConfigs.length} brands due for monitoring`);

  const results: MonitoringPassResult[] = [];

  for (const config of dueConfigs) {
    if (!config.brand) continue;

    const brand = config.brand;
    const prompts: string[] = config.prompts ? JSON.parse(config.prompts) : [];

    if (prompts.length === 0) {
      console.log(`Skipping ${brand.name}: no prompts configured`);
      continue;
    }

    // Check rate limit
    const canProceed = await checkRateLimit("gemini");
    if (!canProceed) {
      console.log(`Rate limit reached, stopping monitoring run`);
      break;
    }

    let totalMentions = 0;
    let totalSentiment = 0;
    let promptsRun = 0;

    // Run each prompt
    for (const promptTemplate of prompts) {
      // Replace placeholders in prompt
      const prompt = promptTemplate
        .replace("{brand}", brand.name)
        .replace("{industry}", "software")
        .replace("{competitors}", brand.competitors?.map(c => c.name).join(", ") || "competitors");

      // Build enhanced prompt with brand context
      const competitorNames = brand.competitors?.map(c => c.name).join(", ") || "none specified";
      const enhancedPrompt = `Context: Analyzing brand "${brand.name}"${brand.domain ? ` (website: ${brand.domain})` : ""}.
Competitors: ${competitorNames}

Question: ${prompt}

Please provide a helpful response, mentioning ${brand.name} by name if relevant.`;

      try {
        // Check cache first
        const cacheKey = generateCacheKey(enhancedPrompt, brand.id, "gemini");
        const cached = await getCachedResponse(cacheKey);

        let response: string;

        if (cached) {
          console.log(`Cache hit for ${brand.name}: ${promptTemplate.slice(0, 50)}...`);
          response = cached.response;
        } else {
          // Call Gemini (primary for monitoring to save costs)
          try {
            response = await callGeminiWithRetry(enhancedPrompt);
          } catch {
            response = await callOpenRouterGeminiWithRetry(enhancedPrompt);
          }

          // Cache the response
          await setCachedResponse(cacheKey, brand.id, enhancedPrompt, "gemini", response, null);
          await recordUsage("gemini");
        }

        // Analyze response
        const mentions = detectMentions(response, brand);
        const sentiment = analyzeSentiment(response, brand.name);
        const position = detectPosition(response, brand.name);

        const brandMentions = mentions.filter(m => !m.isCompetitor);
        const wasMentioned = brandMentions.length > 0;

        // Store mention
        const simulation = await prisma.simulation.create({
          data: {
            userId: brand.userId,
            brandId: brand.id,
            prompt,
            geminiResponse: response,
            geminiMentions: JSON.stringify(mentions),
            geminiSentiment: sentiment,
            geminiPosition: position,
          },
        });

        // Only persist a Mention row when the brand was actually found — a
        // row is used downstream as the numerator for presence (mentions /
        // simulations); a "not mentioned" placeholder row would inflate it.
        if (wasMentioned) {
          await prisma.mention.create({
            data: {
              brandId: brand.id,
              simulationId: simulation.id,
              aiSystem: "gemini",
              prompt,
              response: response.slice(0, 2000),
              context: brandMentions[0].context,
              sentiment,
              position,
              isCompetitor: false,
            },
          });
        }

        // Persist competitor mentions detected in this response — previously
        // computed then discarded, same as the fix in api/simulate/route.ts.
        if (brand.competitors && brand.competitors.length > 0) {
          const mentionedCompetitorNames = new Set(
            mentions.filter((m) => m.isCompetitor && m.competitorName).map((m) => m.competitorName!)
          );
          for (const competitorName of mentionedCompetitorNames) {
            const entries = mentions.filter((m) => m.competitorName === competitorName);
            await prisma.mention.create({
              data: {
                brandId: brand.id,
                simulationId: simulation.id,
                aiSystem: "gemini",
                prompt,
                response: response.slice(0, 2000),
                context: entries[0].context,
                sentiment: analyzeSentiment(response, competitorName),
                position: detectPosition(response, competitorName),
                isCompetitor: true,
                competitorName,
              },
            });
          }
        }

        totalMentions += wasMentioned ? 1 : 0;
        totalSentiment += sentiment;
        promptsRun++;

        console.log(`✓ ${brand.name}: "${promptTemplate.slice(0, 40)}..." - ${wasMentioned ? "Mentioned" : "Not mentioned"}`);
      } catch (error) {
        console.error(`Error running prompt for ${brand.name}:`, error);
      }
    }

    // Update monitoring config with next run time
    const getNextRunTime = (freq: string): Date => {
      switch (freq) {
        case "hourly":
          return new Date(now.getTime() + 60 * 60 * 1000);
        case "every6hours":
          return new Date(now.getTime() + 6 * 60 * 60 * 1000);
        case "every12hours":
          return new Date(now.getTime() + 12 * 60 * 60 * 1000);
        case "weekly":
          return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        case "daily":
        default:
          return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      }
    };

    await prisma.monitoringConfig.update({
      where: { id: config.id },
      data: {
        lastRunAt: now,
        nextRunAt: getNextRunTime(config.frequency),
      },
    });

    results.push({
      brandId: brand.id,
      brandName: brand.name,
      promptsRun,
      mentionsFound: totalMentions,
      avgSentiment: promptsRun > 0 ? totalSentiment / promptsRun : 0,
    });
  }

  return {
    brandsProcessed: results.length,
    results,
    timestamp: now.toISOString(),
  };
}
