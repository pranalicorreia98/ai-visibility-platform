# Billing (Dodo Payments)

Paid plans for ZeekLabs, using **Dodo Payments** as the Merchant of Record
(Dodo collects the money + handles global tax/invoicing/chargebacks and remits
to us). A monthly subscription grants a cycle of **credits** on each renewal —
it plugs into the existing credit ledger (`lib/credits.ts`), it does not replace
it.

## How it works

1. User clicks upgrade → `POST /api/billing/checkout` with `{ planId }`.
   Identity (`userId`, email) comes from the NextAuth session, never the body.
2. We create a Dodo hosted checkout, stamping `{ product, userId, planId }` into
   the subscription **metadata**. The user pays on Dodo's page.
3. Dodo calls `POST /api/billing/webhook`. We verify the signature, then — in a
   single DB transaction — record the event (idempotency), upsert the
   subscription, and on `subscription.active` / `subscription.renewed` grant the
   plan's `creditsPerCycle` via `grantCreditsTx(..., "PURCHASE")` and set
   `accessType = "PAID"`.

Because the idempotency insert, the upsert, and the credit grant share one
transaction, a retried or concurrent webhook can never double-grant credits (the
duplicate hits a unique-constraint violation and the whole transaction rolls back).

## Files

- `src/lib/billing/` — provider-agnostic module (types, plans, registry, service)
  and the Dodo adapter (`providers/dodo.ts`, `providers/dodoMap.ts`).
- `src/app/api/billing/checkout/route.ts` — starts a checkout.
- `src/app/api/billing/webhook/route.ts` — receives Dodo webhooks.
- `prisma/schema.prisma` — `BillingSubscription`, `BillingWebhookEvent` models.
- `src/lib/credits.ts` — added `grantCreditsTx` (transaction-aware grant).

## Plans

Edit `src/lib/billing/plans.ts`. Current:

| planId | Dodo product | price | credits/cycle |
|--------|-------------|-------|---------------|
| `zeeklabs_pro_monthly` | ZeekLabs Pro | $9/mo | 100 (= 10 analyses) |

`creditsPerCycle` is a starting value — tune against the real LLM cost per
analysis before going live.

## Setup

1. `npm install` (adds `dodopayments`, `standardwebhooks`).
2. Run the migration: `npx prisma migrate deploy` (or `prisma migrate dev`).
3. Env vars:
   ```
   DODO_PAYMENTS_API_KEY=...        # Dodo dashboard → Developer → API Keys
   DODO_PAYMENTS_WEBHOOK_KEY=...    # Dodo dashboard → Developer → Webhooks → endpoint signing secret
   DODO_PAYMENTS_ENV=test_mode      # test_mode | live_mode
   ```
4. In the Dodo dashboard, register the webhook endpoint URL
   (`https://<your-app>/api/billing/webhook`) and subscribe to subscription events.

## Testing locally

Dodo's CLI forwards test-mode webhooks to localhost:

```bash
dodo login            # choose Test Mode
dodo wh listen        # forwards real test events to http://localhost:3000/api/billing/webhook
# or:
dodo wh trigger       # send a mock subscription.active (unsigned — see note below)
```

Mock payloads from `dodo wh trigger` are **unsigned**; `handleWebhook` verifies
signatures, so use `dodo wh listen` (which forwards signed test events) for an
end-to-end check, or temporarily use the SDK's `unsafeUnwrap` for trigger-only tests.

## Open follow-ups

- **One-time credit packs** as a second product type (on `payment.succeeded`,
  grant credits) for users who exhaust their monthly allowance.
- **Cancellation/downgrade policy**: today credits already granted are kept and
  only the subscription status updates. Decide if `accessType` should revert.
- **Reactivation edge case**: `subscription.active` re-firing after a recovery
  from `on_hold` would grant another cycle; revisit if that's not desired.
