import { NextRequest, NextResponse } from "next/server";
import { processDigestBatch } from "@/lib/digest";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes max

/**
 * POST /api/cron/digest
 *
 * Cron endpoint to process digest emails.
 * Protected by CRON_SECRET header.
 *
 * Query params:
 * - batchSize: number of users to process (default 50)
 * - dryRun: if true, don't actually send emails
 */
export async function POST(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("[cron/digest] CRON_SECRET not configured");
    return NextResponse.json(
      { error: "Cron not configured" },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const batchSize = parseInt(url.searchParams.get("batchSize") || "50", 10);
    const dryRun = url.searchParams.get("dryRun") === "true";

    console.log(
      `[cron/digest] Starting batch processing (batchSize=${batchSize}, dryRun=${dryRun})`
    );

    const result = await processDigestBatch({ batchSize, dryRun });

    console.log(
      `[cron/digest] Completed: processed=${result.processed}, sent=${result.sent}, skipped=${result.skipped}, errors=${result.errors.length}`
    );

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("[cron/digest] Failed:", error);
    return NextResponse.json(
      { error: "Digest processing failed" },
      { status: 500 }
    );
  }
}

// Also support GET for easier testing (still requires auth)
export async function GET(req: NextRequest) {
  return POST(req);
}
