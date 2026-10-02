import DodoPayments from "dodopayments";
import { planById } from "../plans";
import type { CheckoutParams, CheckoutResult, PaymentProvider, ProductKey, WebhookEvent } from "../types";
import { mapEventKind, toNormalizedFromDodo, type DodoSubscriptionLike } from "./dodoMap";

// The SDK auto-reads DODO_PAYMENTS_API_KEY / DODO_PAYMENTS_WEBHOOK_KEY from env;
// we pass them explicitly so a missing value fails fast with a clear message.
// `environment` defaults to live_mode in the SDK, so we MUST set it.
function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`[billing/dodo] Missing required env var ${name}`);
  return value;
}

// Lazy singleton: env is read on first real use, NOT at module load, so
// importing this module (e.g. during `next build`'s route analysis) never throws.
let _client: DodoPayments | null = null;
function getClient(): DodoPayments {
  if (!_client) {
    _client = new DodoPayments({
      bearerToken: requiredEnv("DODO_PAYMENTS_API_KEY"),
      webhookKey: requiredEnv("DODO_PAYMENTS_WEBHOOK_KEY"),
      environment: (process.env.DODO_PAYMENTS_ENV as "test_mode" | "live_mode" | undefined) ?? "test_mode",
    });
  }
  return _client;
}

export const dodoProvider: PaymentProvider = {
  name: "dodo",

  async createCheckout(product: ProductKey, params: CheckoutParams): Promise<CheckoutResult> {
    const plan = planById(params.planId);
    if (!plan?.dodoProductId) {
      throw new Error(`[billing/dodo] planId "${params.planId}" has no Dodo product id in plans.ts`);
    }

    const session = await getClient().checkoutSessions.create({
      product_cart: [{ product_id: plan.dodoProductId, quantity: 1 }],
      customer: { email: params.customerEmail, name: params.customerName ?? params.customerEmail },
      return_url: params.successUrl,
      cancel_url: params.cancelUrl,
      // Read back from the subscription on every webhook — do not remove.
      metadata: { product, userId: params.userId, planId: params.planId },
    });

    if (!session.checkout_url) {
      throw new Error(`[billing/dodo] Checkout session ${session.session_id} returned no checkout_url`);
    }
    return { url: session.checkout_url, providerCheckoutId: session.session_id };
  },

  async cancelSubscription(providerSubId: string, atPeriodEnd: boolean): Promise<void> {
    await getClient().subscriptions.update(providerSubId, {
      cancel_at_next_billing_date: atPeriodEnd,
      ...(atPeriodEnd ? {} : { status: "cancelled" }),
    });
  },

  parseWebhook(rawBody: string, headers: Record<string, string>): WebhookEvent {
    // unwrap() verifies the standardwebhooks signature (using the client's
    // webhookKey) and THROWS on failure. Synchronous — do not await.
    const event = getClient().webhooks.unwrap(rawBody, { headers }) as { type: string; data: DodoSubscriptionLike };
    const eventId = headers["webhook-id"];

    const kind = mapEventKind(event.type);
    if (!kind) return { kind: "ignored", eventId };

    const subscription = toNormalizedFromDodo(event.data);
    return { kind, eventId, subscription } as WebhookEvent;
  },
};
