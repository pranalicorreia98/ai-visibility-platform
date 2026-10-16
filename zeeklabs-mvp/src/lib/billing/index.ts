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

export {
  PLANS,
  planById,
  paidPlans,
  FREE_LIMITS,
  FREE_CREDITS,
  type Plan,
  type TierKey,
  type TierLimits,
  type BillingInterval,
} from "./plans";
export { providerFor } from "./registry";
export { dodoProvider } from "./providers/dodo";
export { startCheckout, handleWebhook, getActiveSubscription, type WebhookOutcome } from "./service";
export {
  getUserLimits,
  getUserTier,
  limitsForPlanId,
  tierForPlanId,
  canAddBrand,
  withinCompetitorCap,
  type UserTier,
} from "./entitlements";
