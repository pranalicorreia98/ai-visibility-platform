// Core billing types. Provider-agnostic — no Dodo SDK types leak past the adapter.

export type ProductKey = "zeeklabs";

/** Normalized subscription status (each provider maps its own enum to this). */
export type SubStatus =
  | "active"
  | "past_due" // renewal failed, in grace — KEEPS access until the deadline
  | "on_hold" // failed renewal past grace — access STOPS
  | "paused"
  | "canceled"
  | "expired"
  | "incomplete"; // pending / failed mandate — never activated

/** Statuses that currently entitle a user (grace period still counts). */
export const ENTITLING_STATUSES: readonly SubStatus[] = ["active", "past_due"];

export interface CheckoutParams {
  /** The ZeekLabs user the subscription belongs to (User.id). */
  userId: string;
  /** Internal plan key from plans.ts (NOT Dodo's product id). */
  planId: string;
  customerEmail: string;
  customerName?: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResult {
  url: string;
  providerCheckoutId: string;
}

export interface NormalizedSubscription {
  providerSubId: string;
  providerCustomerId: string | null;
  product: ProductKey;
  userId: string;
  planId: string;
  status: SubStatus;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

/**
 * A webhook event, normalized across providers. `subscription.active` and
 * `subscription.renewed` are kept distinct from `subscription.updated` because
 * only those two grant a billing cycle's credits.
 */
export type WebhookEvent =
  | { kind: "subscription.active"; eventId: string; subscription: NormalizedSubscription }
  | { kind: "subscription.renewed"; eventId: string; subscription: NormalizedSubscription }
  | { kind: "subscription.updated"; eventId: string; subscription: NormalizedSubscription }
  | { kind: "subscription.canceled"; eventId: string; subscription: NormalizedSubscription }
  | { kind: "ignored"; eventId: string };

/** The subset of webhook kinds that should grant a cycle of credits. */
export const CREDIT_GRANTING_KINDS = ["subscription.active", "subscription.renewed"] as const;

export interface PaymentProvider {
  readonly name: string;
  createCheckout(product: ProductKey, params: CheckoutParams): Promise<CheckoutResult>;
  cancelSubscription(providerSubId: string, atPeriodEnd: boolean): Promise<void>;
  /**
   * Verify the webhook signature and parse into a normalized event.
   * MUST throw on an invalid signature — never return a guessed event.
   */
  parseWebhook(rawBody: string, headers: Record<string, string>): WebhookEvent;
}
