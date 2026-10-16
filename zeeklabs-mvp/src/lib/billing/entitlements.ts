// Resolves a user's tier + feature limits from their active subscription.
// Single source of truth: the active BillingSubscription's planId -> plans.ts.
// No silent fallbacks — a paid subscription whose planId is not in the catalog
// THROWS rather than guessing a tier (CLAUDE.md NO-SILENT-FALLBACKS rule).

import { getActiveSubscription } from "./service";
import {
  FREE_LIMITS,
  planById,
  type BillingInterval,
  type Plan,
  type TierKey,
  type TierLimits,
} from "./plans";

export interface UserTier {
  tier: TierKey;
  /** The active planId, or null for Free (no subscription). */
  planId: string | null;
  interval: BillingInterval | null;
}

/**
 * Feature limits for a planId. `null` = no subscription (Free). A non-null
 * planId that isn't in the catalog throws — we never fall back to a guessed tier.
 * Pure (no DB) so the no-fallback behaviour is directly unit-testable.
 */
export function limitsForPlanId(planId: string | null): TierLimits {
  if (planId === null) return FREE_LIMITS;
  return requirePlan(planId).limits;
}

/** Tier descriptor for a planId. Same null/unknown rules as limitsForPlanId. Pure. */
export function tierForPlanId(planId: string | null): UserTier {
  if (planId === null) return { tier: "free", planId: null, interval: null };
  const plan = requirePlan(planId);
  return { tier: plan.tier, planId, interval: plan.interval };
}

function requirePlan(planId: string): Plan {
  const plan = planById(planId);
  if (!plan) {
    throw new Error(
      `[billing/entitlements] active subscription references unknown planId "${planId}" — refusing to guess a tier`
    );
  }
  return plan;
}

/** The user's feature limits, resolved from their active subscription (Free if none). */
export async function getUserLimits(userId: string): Promise<TierLimits> {
  const sub = await getActiveSubscription(userId);
  return limitsForPlanId(sub?.planId ?? null);
}

/** The user's current tier (for UI: current-plan highlight, upgrade targets). */
export async function getUserTier(userId: string): Promise<UserTier> {
  const sub = await getActiveSubscription(userId);
  return tierForPlanId(sub?.planId ?? null);
}

// --- Pure gate predicates (unit-testable, no DB) ---

/** True if a user holding `currentCount` brands may create one more. */
export function canAddBrand(currentCount: number, limits: TierLimits): boolean {
  return currentCount < limits.brands;
}

/** True if `count` competitors on a single brand is within the tier cap. */
export function withinCompetitorCap(count: number, limits: TierLimits): boolean {
  return count <= limits.competitorsPerBrand;
}
