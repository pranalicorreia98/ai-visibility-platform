// Public surface of the billing module. App code imports from here.

export type {
  CheckoutParams,
  CheckoutResult,
  NormalizedSubscription,
  PaymentProvider,
  ProductKey,
  SubStatus,
  WebhookEvent,
} from "./types";

export { PLANS, planById, type Plan } from "./plans";
export { providerFor } from "./registry";
export { dodoProvider } from "./providers/dodo";
export { startCheckout, handleWebhook, getActiveSubscription, type WebhookOutcome } from "./service";
