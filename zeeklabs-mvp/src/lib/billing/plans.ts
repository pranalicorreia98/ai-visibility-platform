import type { ProductKey } from "./types";

export interface Plan {
  product: ProductKey;
  /** Human label, used in credit-ledger descriptions. */
  label: string;
  /** Dodo Product id (from the Dodo dashboard). */
  dodoProductId: string;
  /**
   * Credits granted on each billing cycle (subscription.active + each
   * subscription.renewed). 10 credits = 1 full analysis (CREDITS_PER_ANALYSIS).
   */
  creditsPerCycle: number;
}

/** Plan catalog, keyed by the internal planId the app passes to checkout. */
export const PLANS: Record<string, Plan> = {
  zeeklabs_pro_monthly: {
    product: "zeeklabs",
    label: "ZeekLabs Pro",
    dodoProductId: "pdt_0NorCDHZMJXscr6YuJ4qv", // Dodo test-mode: ZeekLabs Pro, $9/mo
    creditsPerCycle: 100, // 100 credits/mo = 10 analyses; tune against per-analysis LLM cost
  },
};

export function planById(planId: string): Plan | null {
  return PLANS[planId] ?? null;
}
