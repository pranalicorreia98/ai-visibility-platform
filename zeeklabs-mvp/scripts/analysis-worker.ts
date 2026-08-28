/**
 * Background worker for /api/analyze jobs.
 *
 * POST /api/analyze creates an AnalysisCache row with status "pending" and
 * returns immediately. This process polls that table, claims one pending
 * row at a time (SELECT ... FOR UPDATE SKIP LOCKED so multiple worker
 * instances can run safely), runs the actual LLM call, and writes the
 * result back. The frontend polls GET /api/analyze/status/:cacheId in the
 * meantime.
 *
 * Run with: npm run worker:analysis
 */
import { prisma } from "../src/lib/prisma";
import { runAnalysisJob } from "../src/lib/analysis-runner";
import type { AnalysisCache } from "@prisma/client";

const POLL_INTERVAL_MS = 2000;
const STALE_LOCK_MS = 10 * 60 * 1000; // 10 minutes

async function reclaimStaleJobs(): Promise<void> {
  const cutoff = new Date(Date.now() - STALE_LOCK_MS);
  const { count } = await prisma.analysisCache.updateMany({
    where: { status: "processing", lockedAt: { lt: cutoff } },
    data: { status: "pending", lockedAt: null },
  });
  if (count > 0) {
    console.log(`Reclaimed ${count} stale "processing" job(s) back to pending`);
  }
}

async function claimNextJob(): Promise<AnalysisCache | null> {
  const claimed = await prisma.$queryRaw<AnalysisCache[]>`
    UPDATE "AnalysisCache"
    SET status = 'processing', "lockedAt" = now()
    WHERE id = (
      SELECT id FROM "AnalysisCache"
      WHERE status = 'pending'
      ORDER BY "createdAt" ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    )
    RETURNING *
  `;
  return claimed[0] ?? null;
}

async function processJob(job: AnalysisCache): Promise<void> {
  const brand = await prisma.brand.findUnique({
    where: { id: job.brandId },
    include: { competitors: true },
  });

  if (!brand) {
    console.error(`Job ${job.id} references missing brand ${job.brandId}, marking failed`);
    await prisma.analysisCache.update({
      where: { id: job.id },
      data: { status: "failed", errorMessage: "Brand no longer exists" },
    });
    return;
  }

  const competitorIds: string[] = JSON.parse(job.competitorIds);
  const competitors = competitorIds.length > 0
    ? brand.competitors.filter((c) => competitorIds.includes(c.id))
    : brand.competitors;

  console.log(`Worker claimed job ${job.id} for brand "${brand.name}" (${job.provider})`);

  await runAnalysisJob(
    job,
    { id: brand.id, name: brand.name, domain: brand.domain },
    competitors,
    job.provider as "chatgpt" | "gemini" | "perplexity",
    brand.userId
  );
}

async function loop(): Promise<void> {
  console.log("analysis-worker started, polling for pending jobs...");
  for (;;) {
    try {
      await reclaimStaleJobs();
      const job = await claimNextJob();
      if (job) {
        await processJob(job);
        continue; // check for another job immediately
      }
    } catch (error) {
      console.error("analysis-worker loop error:", error);
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

loop();
