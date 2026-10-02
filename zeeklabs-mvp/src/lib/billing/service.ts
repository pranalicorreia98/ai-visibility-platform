import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { grantCreditsTx } from "@/lib/credits";
import { providerFor } from "./registry";
import { dodoProvider } from "./providers/dodo";
import { planById } from "./plans";
import {
  ENTITLING_STATUSES,
  type CheckoutParams,
  type CheckoutResult,
  type NormalizedSubscription,
  type ProductKey,
  type SubStatus,
} from "./types";

/** Start a hosted checkout for a plan (validates the plan before calling Dodo). */
export async function startCheckout(product: ProductKey, params: CheckoutParams): Promise<CheckoutResult> {
  const plan = planById(params.planId);
  if (!plan) throw new Error(`[billing] startCheckout: unknown planId "${params.planId}"`);
  if (plan.product !== product) {
    throw new Error(`[billing] startCheckout: planId "${params.planId}" is not a ${product} plan`);
  }
  return providerFor(product).createCheckout(product, params);
}

export type WebhookOutcome =
  | { applied: true; kind: string; userId: string; creditsGranted: number }
  | { applied: false; reason: "ignored" | "duplicate" };

/**
 * Process a Dodo webhook end-to-end. parseWebhook verifies the signature (throws
 * on failure). Everything else — the idempotency record, the subscription
 * upsert, and the credit grant — happens in ONE transaction, so retries and
 * concurrent deliveries can never double-grant: the idempotency insert hits a
 * unique violation and rolls the whole transaction back.
 */
export async function handleWebhook(rawBody: string, headers: Record<string, string>): Promise<WebhookOutcome> {
  const event = dodoProvider.parseWebhook(rawBody, headers);
  if (event.kind === "ignored") return { applied: false, reason: "ignored" };

  const sub = event.subscription;
  const plan = planById(sub.planId);
  const grantsCredits = event.kind === "subscription.active" || event.kind === "subscription.renewed";
  const creditsToGrant = grantsCredits ? plan?.creditsPerCycle ?? 0 : 0;

  try {
    await prisma.$transaction(async (tx) => {
      // Idempotency gate — unique (provider, providerEventId). A duplicate
      // delivery throws P2002 here and aborts the whole transaction.
      await tx.billingWebhookEvent.create({
        data: { provider: dodoProvider.name, providerEventId: event.eventId },
      });

      await tx.billingSubscription.upsert({
        where: {
          provider_providerSubscriptionId: {
            provider: dodoProvider.name,
            providerSubscriptionId: sub.providerSubId,
          },
        },
        create: toSubCreate(sub),
        update: toSubUpdate(sub),
      });

      if (creditsToGrant > 0) {
        const reason = event.kind === "subscription.active" ? "activation" : "renewal";
        await grantCreditsTx(
          tx,
          sub.userId,
          creditsToGrant,
          "PURCHASE",
          `${plan?.label ?? sub.planId} — ${reason} credits`
        );
        // Mark the user as a paying customer (ledger balance remains the gate for usage).
        await tx.user.update({ where: { id: sub.userId }, data: { accessType: "PAID" } });
      }
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { applied: false, reason: "duplicate" };
    }
    throw err;
  }

  return { applied: true, kind: event.kind, userId: sub.userId, creditsGranted: creditsToGrant };
}

/** The user's current entitling subscription (active or in-grace), if any. */
export async function getActiveSubscription(userId: string): Promise<NormalizedSubscription | null> {
  const row = await prisma.billingSubscription.findFirst({
    where: { product: "zeeklabs", userId, status: { in: ENTITLING_STATUSES as unknown as string[] } },
    orderBy: { updatedAt: "desc" },
  });
  return row ? rowToSub(row) : null;
}

type SubRow = {
  providerSubscriptionId: string;
  providerCustomerId: string | null;
  product: string;
  userId: string;
  planId: string;
  status: string;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
};

function rowToSub(row: SubRow): NormalizedSubscription {
  return {
    providerSubId: row.providerSubscriptionId,
    providerCustomerId: row.providerCustomerId,
    product: row.product as ProductKey,
    userId: row.userId,
    planId: row.planId,
    status: row.status as SubStatus,
    currentPeriodEnd: row.currentPeriodEnd ? row.currentPeriodEnd.toISOString() : null,
    cancelAtPeriodEnd: row.cancelAtPeriodEnd,
  };
}

function toSubCreate(sub: NormalizedSubscription) {
  return {
    product: sub.product,
    userId: sub.userId,
    provider: dodoProvider.name,
    providerSubscriptionId: sub.providerSubId,
    providerCustomerId: sub.providerCustomerId,
    planId: sub.planId,
    status: sub.status,
    currentPeriodEnd: sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : null,
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
  };
}

function toSubUpdate(sub: NormalizedSubscription) {
  return {
    status: sub.status,
    planId: sub.planId,
    providerCustomerId: sub.providerCustomerId,
    currentPeriodEnd: sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : null,
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
  };
}
