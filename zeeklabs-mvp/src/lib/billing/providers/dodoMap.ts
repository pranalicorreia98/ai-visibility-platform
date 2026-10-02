import type { NormalizedSubscription, ProductKey, SubStatus, WebhookEvent } from "../types";

/**
 * PURE Dodo → normalized mapping. No SDK import, so it unit-tests without the
 * `dodopayments` package. All Dodo field/enum names that must stay in sync with
 * the API live HERE (verified against dodopayments SDK types, 2026-10-02).
 */

/** Fields we read off a Dodo subscription object (webhook `data` or API retrieve). */
export interface DodoSubscriptionLike {
  subscription_id: string;
  status: string;
  next_billing_date?: string | null;
  cancel_at_next_billing_date?: boolean | null;
  customer?: { customer_id?: string | null } | null;
  metadata?: Record<string, string> | null;
}

/**
 * Map a Dodo status to our normalized status. Unknown statuses THROW — an
 * unmapped billing status means we don't actually know the customer's state.
 *
 * Dodo SubscriptionStatus (from SDK types):
 *   pending | active | on_hold | paused | cancelled | failed | expired | past_due
 */
export function mapStatus(dodoStatus: string): SubStatus {
  switch (dodoStatus) {
    case "active":
      return "active";
    case "past_due": // grace period — still entitled
      return "past_due";
    case "on_hold": // failed renewal past grace — access stops
      return "on_hold";
    case "paused":
      return "paused";
    case "cancelled": // Dodo spells it with two l's
    case "canceled":
      return "canceled";
    case "expired":
      return "expired";
    case "pending":
    case "failed":
      return "incomplete";
    default:
      throw new Error(`[billing/dodo] Unmapped subscription status "${dodoStatus}". Add it to mapStatus().`);
  }
}

/**
 * Map a Dodo `subscription.*` event type to our normalized webhook kind.
 * active/renewed are kept distinct because only those grant credits.
 */
export function mapEventKind(dodoType: string): Exclude<WebhookEvent["kind"], "ignored"> | null {
  switch (dodoType) {
    case "subscription.active":
      return "subscription.active";
    case "subscription.renewed":
      return "subscription.renewed";
    case "subscription.cancelled":
    case "subscription.expired":
      return "subscription.canceled";
    default:
      // Any other subscription.* event (updated, past_due, on_hold, paused,
      // unpaused, plan_changed, update_payment_method, failed) → status sync only.
      return dodoType.startsWith("subscription.") ? "subscription.updated" : null;
  }
}

/**
 * Build a NormalizedSubscription from a Dodo subscription object. product/
 * userId/planId come from the metadata we set at checkout — if absent we THROW,
 * because a subscription we can't attribute to a user is unusable.
 */
export function toNormalizedFromDodo(sub: DodoSubscriptionLike): NormalizedSubscription {
  const meta = sub.metadata ?? {};
  const product = meta.product as ProductKey | undefined;
  const userId = meta.userId;
  const planId = meta.planId;

  if (!product || !userId || !planId) {
    throw new Error(
      `[billing/dodo] Subscription ${sub.subscription_id} is missing required metadata ` +
        `(product/userId/planId). Ensure checkout sets these in metadata.`
    );
  }

  return {
    providerSubId: sub.subscription_id,
    providerCustomerId: sub.customer?.customer_id ?? null,
    product,
    userId,
    planId,
    status: mapStatus(sub.status),
    currentPeriodEnd: sub.next_billing_date ?? null,
    cancelAtPeriodEnd: Boolean(sub.cancel_at_next_billing_date),
  };
}
