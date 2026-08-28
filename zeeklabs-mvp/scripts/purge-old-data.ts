/**
 * Nightly retention/purge job (docs/AWS-DEPLOYMENT-PLAN-MVP.md, §7).
 * Keeps RDS storage flat over time instead of growing with every analysis
 * ever run. Run with: npm run purge:run
 */
import { prisma } from "../src/lib/prisma";

const DAY_MS = 24 * 60 * 60 * 1000;
const PROMPT_CACHE_TTL_MS = DAY_MS; // matches CACHE_TTL in src/lib/prompt-cache.ts
const RAW_TEXT_RETENTION_MS = 90 * DAY_MS;
const SNAPSHOT_RETENTION_MS = 180 * DAY_MS;
const API_USAGE_RETENTION_MS = 365 * DAY_MS;

async function purgeExpiredCaches(): Promise<void> {
  const now = new Date();

  const cachedResponses = await prisma.cachedResponse.deleteMany({
    where: { expiresAt: { lt: now } },
  });
  console.log(`Deleted ${cachedResponses.count} expired CachedResponse row(s)`);

  // PromptCache has no expiresAt column; its TTL (24h) is enforced against createdAt.
  const promptCaches = await prisma.promptCache.deleteMany({
    where: { createdAt: { lt: new Date(now.getTime() - PROMPT_CACHE_TTL_MS) } },
  });
  console.log(`Deleted ${promptCaches.count} expired PromptCache row(s)`);
}

async function nullOldRawResponses(): Promise<void> {
  const cutoff = new Date(Date.now() - RAW_TEXT_RETENTION_MS);

  const simulations = await prisma.simulation.updateMany({
    where: {
      createdAt: { lt: cutoff },
      OR: [
        { chatgptResponse: { not: null } },
        { geminiResponse: { not: null } },
        { perplexityResponse: { not: null } },
      ],
    },
    data: { chatgptResponse: null, geminiResponse: null, perplexityResponse: null },
  });
  console.log(`Nulled raw responses on ${simulations.count} Simulation row(s) older than 90 days`);

  const mentions = await prisma.mention.updateMany({
    where: { createdAt: { lt: cutoff }, response: { not: "" } },
    data: { response: "" },
  });
  console.log(`Nulled raw responses on ${mentions.count} Mention row(s) older than 90 days`);

  const analysisCaches = await prisma.analysisCache.updateMany({
    where: { createdAt: { lt: cutoff }, rawResponse: { not: null } },
    data: { rawResponse: null },
  });
  console.log(`Nulled rawResponse on ${analysisCaches.count} AnalysisCache row(s) older than 90 days`);
}

async function purgeOldSnapshots(): Promise<void> {
  const cutoff = new Date(Date.now() - SNAPSHOT_RETENTION_MS);
  const snapshots = await prisma.analysisSnapshot.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });
  console.log(`Deleted ${snapshots.count} AnalysisSnapshot row(s) older than 180 days`);
}

async function purgeOldApiUsage(): Promise<void> {
  const cutoffDate = new Date(Date.now() - API_USAGE_RETENTION_MS).toISOString().split("T")[0];
  const apiUsage = await prisma.apiUsage.deleteMany({
    where: { date: { lt: cutoffDate } },
  });
  console.log(`Deleted ${apiUsage.count} ApiUsage row(s) older than 1 year`);
}

async function vacuum(): Promise<void> {
  // VACUUM cannot run inside a transaction, so use $executeRawUnsafe directly.
  await prisma.$executeRawUnsafe("VACUUM");
  console.log("VACUUM complete");
}

async function main(): Promise<void> {
  console.log(`[purge-old-data] starting at ${new Date().toISOString()}`);
  await purgeExpiredCaches();
  await nullOldRawResponses();
  await purgeOldSnapshots();
  await purgeOldApiUsage();
  await vacuum();
  console.log("[purge-old-data] done");
}

main()
  .catch((error) => {
    console.error("[purge-old-data] failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
