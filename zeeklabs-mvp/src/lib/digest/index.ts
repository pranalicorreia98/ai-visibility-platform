import { prisma } from "@/lib/prisma";
import { sendDigestEmail } from "@/lib/email/resend";
import { findEligibleUsers } from "./eligibility";
import { computeBrandDiff } from "./computeDiff";
import type { BatchResult, DigestResult, BrandDiff } from "./types";

const APP_URL = process.env.NEXTAUTH_URL || "https://zeeklabs.ai";

export interface ProcessDigestOptions {
  batchSize?: number;
  dryRun?: boolean;
}

/**
 * Process a batch of digest emails.
 * Called by the cron endpoint.
 */
export async function processDigestBatch(
  options: ProcessDigestOptions = {}
): Promise<BatchResult> {
  const { batchSize = 50, dryRun = false } = options;

  const result: BatchResult = {
    processed: 0,
    sent: 0,
    skipped: 0,
    errors: [],
  };

  // Find eligible users
  const eligibleUsers = await findEligibleUsers(batchSize);
  result.processed = eligibleUsers.length;

  if (eligibleUsers.length === 0) {
    return result;
  }

  // Process each user
  for (const user of eligibleUsers) {
    const digestResult = await processUserDigest(user.id, user.email, user.name, user.brandIds, dryRun);

    if (digestResult.success) {
      result.sent++;
    } else if (digestResult.error) {
      result.errors.push(`${user.email}: ${digestResult.error}`);
    } else {
      result.skipped++;
    }
  }

  return result;
}

/**
 * Process digest for a single user.
 */
async function processUserDigest(
  userId: string,
  userEmail: string,
  userName: string | null,
  brandIds: string[],
  dryRun: boolean
): Promise<DigestResult> {
  const now = new Date();
  const periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

  // Compute diffs for all brands
  const brandDiffs: BrandDiff[] = [];
  for (const brandId of brandIds) {
    const diff = await computeBrandDiff(brandId, periodStart, now);
    if (diff) {
      brandDiffs.push(diff);
    }
  }

  // Skip if no valid brand data
  if (brandDiffs.length === 0) {
    return { userId, success: false, error: "No brand data available" };
  }

  // Build URLs
  const dashboardUrl = `${APP_URL}/dashboard/analysis`;
  const rerunUrl =
    brandDiffs.length === 1
      ? `${APP_URL}/dashboard/analysis?brandId=${brandDiffs[0].brandId}&rerun=true`
      : `${APP_URL}/dashboard/analysis`;
  const unsubscribeUrl = `${APP_URL}/api/digest/unsubscribe?userId=${userId}&token=${generateUnsubscribeToken(userId)}`;
  const preferencesUrl = `${APP_URL}/settings/notifications`;

  // Dry run - don't actually send
  if (dryRun) {
    console.log(`[digest] DRY RUN: Would send digest to ${userEmail}`);
    return { userId, success: true };
  }

  // Send the email
  const emailResult = await sendDigestEmail({
    to: userEmail,
    userName: userName || userEmail.split("@")[0],
    brands: brandDiffs,
    dashboardUrl,
    rerunUrl,
    unsubscribeUrl,
    preferencesUrl,
  });

  if (!emailResult.success) {
    return { userId, success: false, error: emailResult.error };
  }

  // Record the sent digest
  await prisma.digestEmailLog.create({
    data: {
      userId,
      resendMessageId: emailResult.messageId,
      brandsIncluded: brandDiffs.length,
      periodStart,
      periodEnd: now,
      status: "sent",
    },
  });

  return { userId, success: true, messageId: emailResult.messageId };
}

/**
 * Generate a simple unsubscribe token.
 * In production, use a proper HMAC with a secret.
 */
function generateUnsubscribeToken(userId: string): string {
  const secret = process.env.CRON_SECRET || "digest-secret";
  // Simple hash - in production use crypto.createHmac
  return Buffer.from(`${userId}:${secret}`).toString("base64url").slice(0, 32);
}

/**
 * Verify an unsubscribe token.
 */
export function verifyUnsubscribeToken(userId: string, token: string): boolean {
  const expected = generateUnsubscribeToken(userId);
  return token === expected;
}

// Re-export types
export * from "./types";
export { findEligibleUsers, isUserEligible } from "./eligibility";
export { computeBrandDiff } from "./computeDiff";
