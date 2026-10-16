import { describe, it, expect } from "vitest";
import { PLANS, planById, paidPlans, FREE_LIMITS } from "./plans";

// Golden catalog: the exact user-facing numbers from docs/PRICING_STRATEGY.md.
// If a pricing number changes, it must change HERE deliberately (with sign-off),
// never drift silently out of the engine.
const GOLDEN = {
  starter_monthly: { tier: "starter", interval: "month", priceUsd: 49, creditsPerCycle: 150, brands: 1, competitorsPerBrand: 5 },
  starter_annual: { tier: "starter", interval: "year", priceUsd: 490, creditsPerCycle: 1800, brands: 1, competitorsPerBrand: 5 },
  pro_monthly: { tier: "pro", interval: "month", priceUsd: 149, creditsPerCycle: 600, brands: 5, competitorsPerBrand: 10 },
  pro_annual: { tier: "pro", interval: "year", priceUsd: 1490, creditsPerCycle: 7200, brands: 5, competitorsPerBrand: 10 },
  scale_monthly: { tier: "scale", interval: "month", priceUsd: 399, creditsPerCycle: 2500, brands: 20, competitorsPerBrand: Infinity },
  scale_annual: { tier: "scale", interval: "year", priceUsd: 3990, creditsPerCycle: 30000, brands: 20, competitorsPerBrand: Infinity },
} as const;

describe("plan catalog", () => {
  it("has exactly the six paid plans", () => {
    expect(paidPlans()).toHaveLength(6);
    expect(Object.keys(PLANS).sort()).toEqual(Object.keys(GOLDEN).sort());
  });

  it("matches the golden pricing (price, credits, tier, interval, limits)", () => {
    for (const [id, g] of Object.entries(GOLDEN)) {
      const plan = PLANS[id];
      expect(plan, `missing plan ${id}`).toBeDefined();
      expect(plan.tier).toBe(g.tier);
      expect(plan.interval).toBe(g.interval);
      expect(plan.priceUsd).toBe(g.priceUsd);
      expect(plan.creditsPerCycle).toBe(g.creditsPerCycle);
      expect(plan.limits.brands).toBe(g.brands);
      expect(plan.limits.competitorsPerBrand).toBe(g.competitorsPerBrand);
    }
  });

  it("grants annual plans a full year of credits (12x monthly)", () => {
    for (const tier of ["starter", "pro", "scale"] as const) {
      const monthly = PLANS[`${tier}_monthly`];
      const annual = PLANS[`${tier}_annual`];
      expect(annual.creditsPerCycle).toBe(monthly.creditsPerCycle * 12);
      expect(annual.priceUsd).toBe(monthly.priceUsd * 10); // "2 months free"
    }
  });

  it("every plan has a Dodo product id and a positive credit grant", () => {
    for (const [id, plan] of Object.entries(PLANS)) {
      expect(plan.dodoProductId, `plan ${id} needs a Dodo product id`).toMatch(/^pdt_/);
      expect(plan.creditsPerCycle, `plan ${id} needs positive credits`).toBeGreaterThan(0);
    }
  });

  it("planById returns null for an unknown plan (no throw, no guess)", () => {
    expect(planById("nope")).toBeNull();
    expect(planById("zeeklabs_pro_monthly")).toBeNull(); // retired old plan id
  });

  it("Free tier limits are the tightest", () => {
    expect(FREE_LIMITS).toEqual({ brands: 1, competitorsPerBrand: 2 });
  });
});
