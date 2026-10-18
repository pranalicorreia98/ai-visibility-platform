import { prisma } from "@/lib/prisma";
import { ENTITLING_STATUSES } from "@/lib/billing/types";

const DEFAULT_FREQUENCY_DAYS = 30;
const MIN_DAYS_FOR_COMPARISON = 7;

interface EligibleUser {
  id: string;
  email: string;
  name: string | null;
  brandIds: string[];
}

/**
 * Find all users eligible for a digest email today.
 *
 * Eligibility criteria:
 * 1. Has an active paid subscription
 * 2. Has not opted out of digests
 * 3. Has at least one brand
 * 4. ALL brands have been analyzed at least once
 * 5. Has not received a digest in the last N days (default 30)
 * 6. Has comparable data (snapshot old enough to be meaningful)
 */
export async function findEligibleUsers(
  batchSize: number = 50
): Promise<EligibleUser[]> {
  const now = new Date();

  // Find users with active subscriptions
  const usersWithSubs = await prisma.user.findMany({
    where: {
      billingSubscriptions: {
        some: {
          status: { in: ENTITLING_STATUSES as unknown as string[] },
        },
      },
    },
    include: {
      brands: {
        include: {
          analysisSnapshots: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
      digestPreferences: true,
      digestEmailLogs: {
        orderBy: { sentAt: "desc" },
        take: 1,
      },
    },
    take: batchSize * 2, // Fetch more since we'll filter
  });

  const eligible: EligibleUser[] = [];

  for (const user of usersWithSubs) {
    // Check if opted out
    if (user.digestPreferences?.enabled === false) {
      continue;
    }

    // Must have at least one brand
    if (user.brands.length === 0) {
      continue;
    }

    // ALL brands must have been analyzed
    const allBrandsAnalyzed = user.brands.every(
      (brand) => brand.analysisSnapshots.length > 0
    );
    if (!allBrandsAnalyzed) {
      continue;
    }

    // Check frequency (default 30 days)
    const frequency = user.digestPreferences?.frequency ?? DEFAULT_FREQUENCY_DAYS;
    const lastDigest = user.digestEmailLogs[0];
    if (lastDigest) {
      const daysSinceLastDigest = Math.floor(
        (now.getTime() - lastDigest.sentAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLastDigest < frequency) {
        continue;
      }
    }

    // Check if we have comparable data (oldest snapshot must be old enough)
    const oldestSnapshot = user.brands
      .map((b) => b.analysisSnapshots[0]?.createdAt)
      .filter(Boolean)
      .sort((a, b) => a!.getTime() - b!.getTime())[0];

    if (oldestSnapshot) {
      const daysOld = Math.floor(
        (now.getTime() - oldestSnapshot.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysOld < MIN_DAYS_FOR_COMPARISON) {
        continue;
      }
    }

    eligible.push({
      id: user.id,
      email: user.email,
      name: user.name,
      brandIds: user.brands.map((b) => b.id),
    });

    if (eligible.length >= batchSize) {
      break;
    }
  }

  return eligible;
}

/**
 * Check if a specific user is eligible for a digest.
 */
export async function isUserEligible(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      billingSubscriptions: {
        where: {
          status: { in: ENTITLING_STATUSES as unknown as string[] },
        },
        take: 1,
      },
      brands: {
        include: {
          analysisSnapshots: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
      digestPreferences: true,
      digestEmailLogs: {
        orderBy: { sentAt: "desc" },
        take: 1,
      },
    },
  });

  if (!user) return false;
  if (user.billingSubscriptions.length === 0) return false;
  if (user.digestPreferences?.enabled === false) return false;
  if (user.brands.length === 0) return false;

  const allBrandsAnalyzed = user.brands.every(
    (brand) => brand.analysisSnapshots.length > 0
  );
  if (!allBrandsAnalyzed) return false;

  const frequency = user.digestPreferences?.frequency ?? DEFAULT_FREQUENCY_DAYS;
  const lastDigest = user.digestEmailLogs[0];
  if (lastDigest) {
    const now = new Date();
    const daysSinceLastDigest = Math.floor(
      (now.getTime() - lastDigest.sentAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceLastDigest < frequency) return false;
  }

  return true;
}
