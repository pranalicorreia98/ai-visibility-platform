import type { ProductKey } from "./types";

export type TierKey = "free" | "starter" | "pro" | "scale";
export type BillingInterval = "month" | "year";

/**
 * Per-tier feature limits enforced in the app. Credits (usage) are metered
 * separately via the ledger — these are the hard caps on how much a tier can set up.
 * `Infinity` means unlimited (a `count >= Infinity` check never blocks).
 */
export interface TierLimits {
  /** Max brands the user may track. */
  brands: number;
  /** Max competitors per brand. */
  competitorsPerBrand: number;
}

export interface Plan {
  product: ProductKey;
  tier: TierKey;
  interval: BillingInterval;
  /** Human label, used in credit-ledger descriptions + UI. */
  label: string;
  /**
   * Sticker price in USD for ONE billing cycle: the monthly amount for `month`
   * plans, the full-year amount for `year` plans.
   */
  priceUsd: number;
  /** Dodo Product id (from the Dodo dashboard). */
  dodoProductId: string;
  /**
   * Credits granted on each billing cycle (subscription.active + each
   * subscription.renewed). 10 credits = 1 full analysis (CREDITS_PER_ANALYSIS).
   *
   * Annual plans grant a FULL YEAR up front (12× the monthly allowance): the
   * billing engine grants once per billing cycle and an annual subscription only
   * renews yearly, and credits accumulate / never expire (see src/lib/credits.ts),
   * so a lump annual grant is equivalent to the monthly drip without needing a cron.
   */
  creditsPerCycle: number;
  /** Feature limits for this tier. */
  limits: TierLimits;
}

/**
 * Dodo product ids — TEST MODE.
 *
 * ⚠️ GO-LIVE: replace all six with the live-mode product ids (and flip
 * DODO_PAYMENTS_ENV=live_mode + the live API/webhook keys — all three together).
 * This is the single place product ids live.
 */
const DODO_TEST_PRODUCT_IDS = {
  starter_monthly: "pdt_0NpsBFfWcC3gbBWjKcUhw",
  starter_annual: "pdt_0NpsBcJa1wH0XrqT7DcZo",
  pro_monthly: "pdt_0NpsBkV9veW22KxHQ7Llu",
  pro_annual: "pdt_0NpsCILLTBPPQJ558ZYud",
  scale_monthly: "pdt_0NpsCQakaYyEUf0ne1Bqh",
  scale_annual: "pdt_0NpsCYuZ9INVgASkSnsdt",
} as const;

/** Monthly credit allowance per paid tier (see docs/PRICING_STRATEGY.md). */
const MONTHLY_CREDITS = { starter: 150, pro: 600, scale: 2500 } as const;

const TIER_LIMITS: Record<Exclude<TierKey, "free">, TierLimits> = {
  starter: { brands: 1, competitorsPerBrand: 5 },
  pro: { brands: 5, competitorsPerBrand: 10 },
  scale: { brands: 20, competitorsPerBrand: Infinity },
};

/**
 * Plan catalog, keyed by the internal planId the app passes to checkout.
 * Free is NOT a plan here — it has no Dodo product and no checkout; see FREE_LIMITS.
 */
export const PLANS: Record<string, Plan> = {
  starter_monthly: {
    product: "zeeklabs",
    tier: "starter",
    interval: "month",
    label: "Starter",
    priceUsd: 49,
    dodoProductId: DODO_TEST_PRODUCT_IDS.starter_monthly,
    creditsPerCycle: MONTHLY_CREDITS.starter,
    limits: TIER_LIMITS.starter,
  },
  starter_annual: {
    product: "zeeklabs",
    tier: "starter",
    interval: "year",
    label: "Starter",
    priceUsd: 490, // 2 months free (10 × $49)
    dodoProductId: DODO_TEST_PRODUCT_IDS.starter_annual,
    creditsPerCycle: MONTHLY_CREDITS.starter * 12,
    limits: TIER_LIMITS.starter,
  },
  pro_monthly: {
    product: "zeeklabs",
    tier: "pro",
    interval: "month",
    label: "Pro",
    priceUsd: 149,
    dodoProductId: DODO_TEST_PRODUCT_IDS.pro_monthly,
    creditsPerCycle: MONTHLY_CREDITS.pro,
    limits: TIER_LIMITS.pro,
  },
  pro_annual: {
    product: "zeeklabs",
    tier: "pro",
    interval: "year",
    label: "Pro",
    priceUsd: 1490, // 2 months free (10 × $149)
    dodoProductId: DODO_TEST_PRODUCT_IDS.pro_annual,
    creditsPerCycle: MONTHLY_CREDITS.pro * 12,
    limits: TIER_LIMITS.pro,
  },
  scale_monthly: {
    product: "zeeklabs",
    tier: "scale",
    interval: "month",
    label: "Scale",
    priceUsd: 399,
    dodoProductId: DODO_TEST_PRODUCT_IDS.scale_monthly,
    creditsPerCycle: MONTHLY_CREDITS.scale,
    limits: TIER_LIMITS.scale,
  },
  scale_annual: {
    product: "zeeklabs",
    tier: "scale",
    interval: "year",
    label: "Scale",
    priceUsd: 3990, // 2 months free (10 × $399)
    dodoProductId: DODO_TEST_PRODUCT_IDS.scale_annual,
    creditsPerCycle: MONTHLY_CREDITS.scale * 12,
    limits: TIER_LIMITS.scale,
  },
};

/** Limits for a user with no active subscription (the Free tier). */
export const FREE_LIMITS: TierLimits = { brands: 1, competitorsPerBrand: 2 };

/** One-time starter credits shown for the Free tier in the UI (display only; the
 *  actual signup grant is INITIAL_GRANT_CREDITS in src/lib/credits.ts). */
export const FREE_CREDITS = 20;

export function planById(planId: string): Plan | null {
  return PLANS[planId] ?? null;
}

/** All paid plans, in catalog order. */
export function paidPlans(): Plan[] {
  return Object.values(PLANS);
}
