import { describe, it, expect } from "vitest";
import {
  limitsForPlanId,
  tierForPlanId,
  canAddBrand,
  withinCompetitorCap,
} from "./entitlements";
import { FREE_LIMITS, PLANS } from "./plans";

describe("limitsForPlanId", () => {
  it("returns Free limits when there is no subscription", () => {
    expect(limitsForPlanId(null)).toEqual(FREE_LIMITS);
  });

  it("returns the plan's limits for a known plan", () => {
    expect(limitsForPlanId("pro_monthly")).toEqual(PLANS.pro_monthly.limits);
    expect(limitsForPlanId("scale_annual")).toEqual(PLANS.scale_annual.limits);
  });

  it("THROWS on an unknown planId — never falls back to a guessed tier", () => {
    expect(() => limitsForPlanId("mystery_plan")).toThrow(/unknown planId/);
  });
});

describe("tierForPlanId", () => {
  it("is free when there is no subscription", () => {
    expect(tierForPlanId(null)).toEqual({ tier: "free", planId: null, interval: null });
  });

  it("resolves a known plan to its tier + interval", () => {
    expect(tierForPlanId("pro_annual")).toEqual({ tier: "pro", planId: "pro_annual", interval: "year" });
  });

  it("THROWS on an unknown planId", () => {
    expect(() => tierForPlanId("mystery_plan")).toThrow(/unknown planId/);
  });
});

describe("canAddBrand", () => {
  const limits = { brands: 5, competitorsPerBrand: 10 };

  it("allows adding while under the limit", () => {
    expect(canAddBrand(0, limits)).toBe(true);
    expect(canAddBrand(4, limits)).toBe(true);
  });

  it("blocks adding at or over the limit", () => {
    expect(canAddBrand(5, limits)).toBe(false);
    expect(canAddBrand(6, limits)).toBe(false);
  });
});

describe("withinCompetitorCap", () => {
  it("enforces a finite cap inclusively", () => {
    const limits = { brands: 1, competitorsPerBrand: 5 };
    expect(withinCompetitorCap(5, limits)).toBe(true);
    expect(withinCompetitorCap(6, limits)).toBe(false);
  });

  it("never blocks when the cap is unlimited (Infinity)", () => {
    const limits = { brands: 20, competitorsPerBrand: Infinity };
    expect(withinCompetitorCap(1000, limits)).toBe(true);
  });
});
