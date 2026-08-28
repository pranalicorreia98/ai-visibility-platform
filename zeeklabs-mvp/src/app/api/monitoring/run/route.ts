import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runMonitoringPass } from "@/lib/monitoring-runner";

/**
 * Run monitoring for brands that are due
 * This endpoint can be called manually or by an external trigger.
 * In production, scripts/scheduler-check.ts runs the same pass in-process
 * on a 15-minute interval, so this endpoint is now mainly for manual/admin use.
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

    const { brandsProcessed, results, timestamp } = await runMonitoringPass();

    return NextResponse.json({
      success: true,
      brandsProcessed,
      results,
      timestamp,
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
