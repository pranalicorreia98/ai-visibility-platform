import { describe, it, expect } from "vitest";
import { PLANS, planById } from "./plans";

describe("plan catalog", () => {
  it("planById returns a known plan", () => {
    expect(planById("zeeklabs_pro_monthly")).toBe(PLANS.zeeklabs_pro_monthly);
  });

  it("planById returns null for an unknown plan (no throw, no guess)", () => {
    expect(planById("nope")).toBeNull();
  });

  it("every plan has a Dodo product id and a positive credit grant", () => {
    for (const [id, plan] of Object.entries(PLANS)) {
      expect(plan.dodoProductId, `plan ${id} needs a Dodo product id`).toMatch(/^pdt_/);
      expect(plan.creditsPerCycle, `plan ${id} needs positive credits`).toBeGreaterThan(0);
    }
  });
});
