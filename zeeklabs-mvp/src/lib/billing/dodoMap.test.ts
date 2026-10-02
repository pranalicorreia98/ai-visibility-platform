import { describe, it, expect } from "vitest";
import {
  mapStatus,
  mapEventKind,
  toNormalizedFromDodo,
  type DodoSubscriptionLike,
} from "./providers/dodoMap";

const baseSub: DodoSubscriptionLike = {
  subscription_id: "sub_123",
  status: "active",
  next_billing_date: "2026-11-01T00:00:00Z",
  cancel_at_next_billing_date: false,
  customer: { customer_id: "cus_1" },
  metadata: { product: "zeeklabs", userId: "user_1", planId: "zeeklabs_pro_monthly" },
};

describe("mapStatus", () => {
  it("maps every real Dodo status (pending|active|on_hold|paused|cancelled|failed|expired|past_due)", () => {
    expect(mapStatus("active")).toBe("active");
    expect(mapStatus("past_due")).toBe("past_due"); // grace — still entitled
    expect(mapStatus("on_hold")).toBe("on_hold"); // NOT past_due — access stops
    expect(mapStatus("paused")).toBe("paused");
    expect(mapStatus("cancelled")).toBe("canceled");
    expect(mapStatus("canceled")).toBe("canceled");
    expect(mapStatus("expired")).toBe("expired");
    expect(mapStatus("pending")).toBe("incomplete");
    expect(mapStatus("failed")).toBe("incomplete");
  });

  it("throws on an unmapped status rather than guessing", () => {
    expect(() => mapStatus("some_new_status")).toThrow(/Unmapped subscription status/);
  });
});

describe("mapEventKind", () => {
  it("keeps active and renewed distinct (they grant credits)", () => {
    expect(mapEventKind("subscription.active")).toBe("subscription.active");
    expect(mapEventKind("subscription.renewed")).toBe("subscription.renewed");
  });

  it("maps cancellation and expiry to canceled", () => {
    expect(mapEventKind("subscription.cancelled")).toBe("subscription.canceled");
    expect(mapEventKind("subscription.expired")).toBe("subscription.canceled");
  });

  it("maps other subscription.* events to updated (status sync only)", () => {
    expect(mapEventKind("subscription.on_hold")).toBe("subscription.updated");
    expect(mapEventKind("subscription.plan_changed")).toBe("subscription.updated");
    expect(mapEventKind("subscription.update_payment_method")).toBe("subscription.updated");
  });

  it("returns null for non-subscription events (ignored)", () => {
    expect(mapEventKind("payment.succeeded")).toBeNull();
    expect(mapEventKind("dispute.opened")).toBeNull();
  });
});

describe("toNormalizedFromDodo", () => {
  it("maps a full Dodo subscription to a NormalizedSubscription", () => {
    expect(toNormalizedFromDodo(baseSub)).toEqual({
      providerSubId: "sub_123",
      providerCustomerId: "cus_1",
      product: "zeeklabs",
      userId: "user_1",
      planId: "zeeklabs_pro_monthly",
      status: "active",
      currentPeriodEnd: "2026-11-01T00:00:00Z",
      cancelAtPeriodEnd: false,
    });
  });

  it("defaults missing optional fields safely", () => {
    const sub = toNormalizedFromDodo({
      subscription_id: "sub_x",
      status: "active",
      metadata: { product: "zeeklabs", userId: "user_2", planId: "zeeklabs_pro_monthly" },
    });
    expect(sub.providerCustomerId).toBeNull();
    expect(sub.currentPeriodEnd).toBeNull();
    expect(sub.cancelAtPeriodEnd).toBe(false);
  });

  it("throws when required metadata is missing (unattributable subscription)", () => {
    expect(() => toNormalizedFromDodo({ ...baseSub, metadata: { userId: "user_1" } })).toThrow(
      /missing required metadata/
    );
  });
});
