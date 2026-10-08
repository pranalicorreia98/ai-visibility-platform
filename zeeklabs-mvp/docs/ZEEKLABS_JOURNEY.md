# ZeekLabs — Journey / Build Log (as of 8 Oct 2026)

A running record of ZeekLabs' build so far — product, payments, key decisions,
what's shipped, and what's next. Intended as a pick-up-cold reference for the team.

---

## 1. What ZeekLabs is

ClikBound's **second product** (after ClikHire). An **AI Engine Optimization (AEO /
"AI visibility") platform** — tracks how ChatGPT, Gemini and Perplexity mention and
recommend a brand: visibility score, competitor benchmarking, sentiment, citations,
and actionable recommendations.

- **Site/app:** zeeklabs.ai · **App dir:** `zeeklabs-mvp/`
- **Stack:** Next.js 16 + React 19 + TypeScript, **Prisma + PostgreSQL**, **NextAuth v5**. Hosted on **AWS** (EC2 + Caddy, eu-north-1). Credit-metered (`1 analysis = 10 credits`, `1 prompt-lab run = 2 credits`).
- **Target market:** primarily **US, EU, Gulf** (not India-first) — a key strategic input for pricing.

---

## 2. The payments problem & the decision to use a Merchant of Record

ZeekLabs needed online payments for a bootstrapped, India-based team selling a global SaaS.

**Decision: use a Merchant of Record (MoR), not a raw gateway.** An MoR becomes the legal
seller — it handles global VAT/GST/sales-tax, invoicing, chargebacks, and payouts. Worth
the ~5–6% for a tiny team; a raw gateway (Razorpay/Cashfree/Stripe) leaves all the global
tax liability on us.

**Chose Dodo Payments** (India-native MoR) after comparing Paddle / Polar / Lemon Squeezy.
Dodo can serve both ClikBound products on one MoR and is India-native (clean INR/GST/FIRC).
Trade-off: Dodo pays out USD via Wise/Payoneer (a hop) vs Polar's direct-INR payout.

---

## 3. The billing module (PR #1 — merged)

A **provider-agnostic billing module** (`src/lib/billing/`) so a second provider (or
ClikHire reuse) is a one-adapter change:
- `PaymentProvider` interface + a `DodoAdapter`; provider chosen per product in a registry.
- **No silent fallbacks** — missing metadata / unmapped status / bad signature all throw.
- **Idempotent webhooks** via a `BillingWebhookEvent` table (keyed on `webhook-id`).
- Attribution: ZeekLabs `userId` stamped into Dodo checkout **metadata**, read back on the webhook.
- Persistence via `createPrismaStore`; identity via the NextAuth session; the webhook grants
  **credits** through `grantCreditsTx(…, "PURCHASE")` (fits the existing credit ledger).

Monetization at the time: **recurring $9/mo subscription → 100 credits/cycle**.
See `BILLING.md` for setup.

---

## 4. Dodo setup (test mode)

Dodo dashboard (ClikBound private Limited), all **Test Mode**:
- `DODO_PAYMENTS_API_KEY` (test), `DODO_PAYMENTS_WEBHOOK_KEY` (test), `DODO_PAYMENTS_ENV=test_mode`
- Webhook endpoint `/api/billing/webhook`
- Product: ZeekLabs Pro, subscription, $9/mo → `pdt_0NorCDHZMJXscr6YuJ4qv`

**KYC / bank payout** (Dodo → Settings → Verification) is required only to go *live* and
receive payouts. Dodo settles to India via Wise/Payoneer on a payout cycle (not instant).

---

## 5. End-to-end payment test (8 Oct 2026) — works, with one bug

Full test-mode purchase through the deployed app:
- **Subscribe Now → Dodo test checkout** (`test.checkout.dodopayments.com`) ✅
- Indian recurring payments route through a **Cashfree test simulator** (e-mandate).
  **The generic `4242` card fails for INR** — use Dodo's India test card
  `4576 2389 1277 1450`, exp `06/32`, CVV `123` → "Simulate Success".
- **Webhook fired → credits granted** (30 → 230). The full loop works. ✅

**Bug:** granted **+200 not +100** — the webhook handler granted on *both*
`subscription.active` and `subscription.renewed` (distinct `webhook-id`s, so the per-event
idempotency gate didn't dedupe them; a new subscription fires both).

(Separately: an earlier *live* UPI payment of ₹1,063.95 granted **0** credits — the app was
on the **test** key while the payment was live → mode mismatch. Lesson below.)

---

## 6. The fix + the pricing pivot (PR #2)

1. **Fix (double-grant):** per-cycle grant idempotency — new `BillingCreditGrant` table
   (PK `provider + providerSubscriptionId + cycleKey`, `cycleKey = currentPeriodEnd`) + a
   `findUnique`-guarded grant in `service.ts`. A cycle is credited **once only**, regardless
   of how many lifecycle events fire.
2. **Pricing pivot** (`docs/PRICING_STRATEGY.md`): the earlier `PAYMENT_STRATEGY.md` proposed
   **one-time credit packs + "spend X get X free"** — but that was *India-specific*. For the
   **US/EU/Gulf** market the better model is **subscription-first, tiered**:

   | | Free | Starter | Pro | Scale | Enterprise |
   |---|---|---|---|---|---|
   | Monthly | $0 | $49 | $149 | $399 | Contact sales |
   | Annual (2 mo free) | — | $490 | $1,490 | $3,990 | — |
   | Credits/mo | 20 once | 150 | 600 | 2,500 | custom |

   Recurring = MRR/ARR; a *monitoring* product is inherently subscription-shaped; credits stay
   as the internal usage meter; Dodo MoR handles EU VAT. Drop the bonus gimmick. ($9 was underpriced.)

---

## 7. Status & open items

**Done:** billing module built/merged/deployed (PR #1) · Dodo test-mode wired · e2e test-mode
payment → credit grant **proven** · double-grant bug fixed (PR #2) · pricing decided.

**Next (PR #2 → review → merge → deploy):**
1. `npx prisma migrate deploy` (+ `prisma generate`), deploy.
2. Verify credits go up by **100, not 200**; one `BillingCreditGrant` row per cycle.

**To go LIVE (real money):** switch **all three** Dodo vars to live *together* —
live API key **+ live webhook endpoint & signing secret + `DODO_PAYMENTS_ENV=live_mode`**.
A live payment with the test webhook secret fails signature verification → no credits.
Also complete **KYC + payout bank** in Dodo.

**Pricing build (follow-up):** create live Dodo products per tier×interval → extend `plans.ts`
→ buy-credits modal (3 tiers + monthly/annual toggle) → enforce feature gates. **Validate
credit allowances against real LLM cost/analysis before locking prices.**

---

## Key references
- **PRs:** #1 (billing module, merged) · #2 (double-grant fix + pricing, open)
- **Dodo:** account "ClikBound private Limited" · test product `pdt_0NorCDHZMJXscr6YuJ4qv`
- **Env vars:** `DODO_PAYMENTS_API_KEY`, `DODO_PAYMENTS_WEBHOOK_KEY`, `DODO_PAYMENTS_ENV`
- **India test card (Dodo/Cashfree):** `4576 2389 1277 1450`, 06/32, CVV 123 (4242 won't work for INR)
- **Docs:** `BILLING.md`, `docs/PRICING_STRATEGY.md`
