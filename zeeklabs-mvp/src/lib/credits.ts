import { prisma } from "@/lib/prisma";

// One full "Run Analysis" for a brand - metered per run, not per brand, so
// re-running (force refresh) costs again but a 24h cache hit (see
// api/analyze/route.ts) is free since it does no new AI work.
export const CREDITS_PER_ANALYSIS = 10;

// One Prompt Lab run (api/simulate) - a single ad-hoc prompt across up to 3
// providers, flat regardless of how many models are selected or whether a
// given model's response comes from the per-system cache (that caching is
// interleaved with execution, not a clean up-front check like api/analyze's
// 24h cache, so it isn't worth the complexity of only charging fresh calls).
// Cheap relative to a full analysis since it's one prompt, not the 60-prompt
// sweep.
export const CREDITS_PER_PROMPT_LAB = 2;

// Granted once, idempotently, the first time an approved user is seen -
// to brand-new beta signups as their welcome bonus, and retroactively to
// every already-approved user from before this system existed (no
// separate migration script needed - see ensureInitialCreditsGranted).
export const INITIAL_GRANT_CREDITS = 20;

export type CreditTransactionType =
  | "BETA_GRANT"
  | "GRANDFATHER_GRANT"
  | "PURCHASE"
  | "ANALYSIS_SPEND"
  | "ANALYSIS_REFUND"
  | "PROMPT_LAB_SPEND"
  | "PROMPT_LAB_REFUND"
  | "ADMIN_ADJUSTMENT";

export class InsufficientCreditsError extends Error {
  constructor(public readonly balance: number, public readonly required: number) {
    super(`Insufficient credits: have ${balance}, need ${required}`);
  }
}

export async function getCreditBalance(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { credits: true } });
  return user?.credits ?? 0;
}

/** Adds credits (grant/purchase/refund) and records the ledger row atomically. */
export async function grantCredits(
  userId: string,
  amount: number,
  type: CreditTransactionType,
  description?: string,
  brandId?: string
): Promise<number> {
  if (amount <= 0) throw new Error("grantCredits amount must be positive");

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: { credits: { increment: amount } },
      select: { credits: true },
    });
    await tx.creditTransaction.create({
      data: { userId, amount, type, description, brandId },
    });
    return user.credits;
  });

  return result;
}

/**
 * Deducts credits for a billable action. Throws InsufficientCreditsError
 * without deducting anything if the balance is too low - callers should
 * check this before doing the expensive work, not after.
 */
export async function spendCredits(
  userId: string,
  amount: number,
  type: CreditTransactionType,
  description?: string,
  brandId?: string
): Promise<number> {
  if (amount <= 0) throw new Error("spendCredits amount must be positive");

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId }, select: { credits: true } });
    const balance = user?.credits ?? 0;
    if (balance < amount) {
      throw new InsufficientCreditsError(balance, amount);
    }

    const updated = await tx.user.update({
      where: { id: userId },
      data: { credits: { decrement: amount } },
      select: { credits: true },
    });
    await tx.creditTransaction.create({
      data: { userId, amount: -amount, type, description, brandId },
    });
    return updated.credits;
  });
}

/**
 * Called on every successful login for an APPROVED user. Idempotent - a
 * user only ever receives one BETA_GRANT or GRANDFATHER_GRANT, checked via
 * the ledger rather than a separate "hasBeenGranted" flag, so it doubles
 * as the mechanism that retroactively grants existing pre-credits users
 * their starter balance the next time they sign in (no migration script
 * needed to launch this feature).
 */
export async function ensureInitialCreditsGranted(
  userId: string,
  accessType: string | null
): Promise<void> {
  const existing = await prisma.creditTransaction.findFirst({
    where: { userId, type: { in: ["BETA_GRANT", "GRANDFATHER_GRANT"] } },
    select: { id: true },
  });
  if (existing) return;

  if (accessType === "BETA") {
    await grantCredits(userId, INITIAL_GRANT_CREDITS, "BETA_GRANT", "Beta access signup bonus");
  } else {
    await grantCredits(
      userId,
      INITIAL_GRANT_CREDITS,
      "GRANDFATHER_GRANT",
      "One-time starter grant for existing users (credits system launch)"
    );
  }
}
