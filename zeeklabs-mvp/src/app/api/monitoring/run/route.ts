import { NextRequest, NextResponse } from "next/server";
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

/**
 * Run monitoring for brands that are due
 * This endpoint can be called by a cron job (e.g., Vercel Cron, GitHub Actions)
 *
 * Security: Uses API key from environment variable
 */
export async function POST(req: NextRequest) {
  try {
    // Verify cron secret (for security in production)
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find all monitoring configs that are due
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

    const results: Array<{
      brandId: string;
      brandName: string;
      promptsRun: number;
      mentionsFound: number;
      avgSentiment: number;
    }> = [];

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

          await prisma.mention.create({
            data: {
              brandId: brand.id,
              simulationId: simulation.id,
              aiSystem: "gemini",
              prompt,
              response: response.slice(0, 2000),
              context: wasMentioned
                ? brandMentions[0].context
                : `Brand "${brand.name}" was NOT mentioned`,
              sentiment,
              position: wasMentioned ? position : null,
              isCompetitor: false,
            },
          });

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

    return NextResponse.json({
      success: true,
      brandsProcessed: results.length,
      results,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Monitoring run error:", error);
    return NextResponse.json(
      { error: "Failed to run monitoring" },
      { status: 500 }
    );
  }
}

/**
 * GET - Get monitoring status and upcoming runs
 */
export async function GET() {
  try {
    const configs = await prisma.monitoringConfig.findMany({
      where: { enabled: true },
      include: {
        brand: {
          select: { id: true, name: true },
        },
      },
      orderBy: { nextRunAt: "asc" },
    });

    return NextResponse.json({
      total: configs.length,
      configs: configs.map(c => ({
        brandId: c.brandId,
        brandName: c.brand?.name,
        frequency: c.frequency,
        lastRunAt: c.lastRunAt,
        nextRunAt: c.nextRunAt,
        promptCount: c.prompts ? JSON.parse(c.prompts).length : 0,
      })),
    });
  } catch (error) {
    console.error("Get monitoring status error:", error);
    return NextResponse.json(
      { error: "Failed to get monitoring status" },
      { status: 500 }
    );
  }
}
