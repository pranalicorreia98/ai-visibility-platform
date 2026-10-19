# DESIGN: Local (India) Payments — a local-gateway adapter for ZeekLabs + ClikHire

**Status:** design only (not built). Authored 2026-10-19. Action: next session.
**Scope:** shared billing infra for **both** ClikBound products — ZeekLabs (live on Dodo) and ClikHire (billing not yet wired).

---

## 1. Context — why

ZeekLabs went live on **Dodo Payments (Merchant of Record)** on 2026-10-19. A real India-card
transaction showed the true cost:

| On a $49 Starter (India card) | Amount | Note |
|---|---|---|
| Customer paid | $57.82 | $49 + 18% GST |
| GST removed (→ govt, via Dodo MoR) | −$8.82 | pass-through tax, **not our cost**; B2B buyers reclaim via ITC |
| **Dodo fee** | **−$3.63** | **≈7.4% of revenue** — card; Dodo UPI is ~4% |
| Net to us | **$45.37** | (FX-converted at payout) |

**The problem:** Dodo's ~6–7% MoR fee buys *global tax/compliance* — which is wasted on
**India-domestic** revenue. Both products increasingly need cheap India payments:
- **ZeekLabs** — inbound enquiries from Indian companies; $49 (≈₹5,700 w/ GST) reads steep locally.
- **ClikHire** — India-first (agencies), and its billing isn't built yet.

**Goal:** keep **Dodo for global** (US/EU/Gulf — where MoR earns its keep), add a **local India
gateway** for Indian customers, routed automatically. Target fee **~7% → ~2% (cards) / UPI**.

## 2. Provider decision

**Recommend Razorpay** (vs Cashfree):
- Mature **Subscriptions** API (UPI AutoPay + card/e-mandate recurring), ~**2% + GST** on fee,
  dominant in India, and already the originally-planned ClikHire provider.
- Cashfree is a viable alternative (sometimes marginally cheaper) — slots into the **same adapter**,
  so this isn't a one-way door.

⚠️ **Tradeoff — a gateway is NOT an MoR.** We (ClikBound) become responsible for **GST collection +
remittance + GST-compliant invoicing** ourselves. Acceptable for India-domestic (ClikBound is a
GST-registered Indian entity), but it's real work: GSTIN capture at checkout + proper tax invoices
so B2B customers can claim **Input Tax Credit**.

## 3. Architecture — reuse the provider-adapter (no rewrite)

The billing module already has a `PaymentProvider` interface + a registry that picks a provider
**per product**. Extend the selection key to **(product × region)**.

- **New `RazorpayAdapter implements PaymentProvider`** — `createCheckout` (Razorpay Subscriptions /
  Payment Links), `cancelSubscription`, `parseWebhook` (verify signature → normalize via a
  `razorpayMap`, mirroring `dodoMap`). Idempotency on the Razorpay event id; attribution via
  Razorpay `notes` (`userId`/`planId`), mirroring Dodo metadata. **No silent fallbacks** — unmapped
  status / bad signature / missing notes all throw.
- **Routing:** `providerFor(product, region)` → India → Razorpay, else Dodo. Region from the
  user/org profile country (recommended) or an explicit selector. **The entitlement flow downstream
  is unchanged** — webhook → grant credits (ZeekLabs) / set seats (ClikHire). Only the provider in
  front differs. This is the whole point of the adapter abstraction.
- **Plans catalog** gains a provider+currency dimension, e.g. per plan:
  `{ dodo: { productId, priceUsd }, razorpay: { planId, priceInr } }`. India resolves the
  `razorpay`/INR branch.

## 4. India pricing (a decision, not just mechanics)

- **Set INR tiers *lower* than a straight USD×rate conversion** (affordability / PPP), e.g. ZeekLabs
  Starter ~₹1,999–2,999 vs the ~₹4,000 USD-equivalent. Keep the same credits/limits.
- Add **18% GST on top**; issue a GST invoice; B2B buyers reclaim it (ITC) → effectively a wash for
  them.
- **Nudge UPI** (cheapest rail) over cards in the India checkout.

## 5. RBI e-mandate / recurring note

India recurring uses **UPI AutoPay / card e-mandates** under RBI additional-factor rules; cycles
**under ₹15,000** avoid extra auth friction. ZeekLabs (~₹2–4k) and typical ClikHire tiers sit under
that → smooth. Flag any tier that would exceed ₹15k/cycle (needs the e-mandate notification flow).

## 6. Two-product specifics

| | ZeekLabs | ClikHire |
|---|---|---|
| Stack | Prisma + Postgres | **Supabase** |
| Entitlement | **credits** (`grantCreditsTx`) | **seats / plan tier** (seat-enforcement) |
| Billing today | **live on Dodo** | **not wired at all** |
| To add | Razorpay routing for India | (a) Supabase **store adapter**, (b) seats entitlement hook, (c) Razorpay adapter (shared) |

Shared across both: the `PaymentProvider` interface + `RazorpayAdapter` + `razorpayMap`. When the
second product consumes it, **extract to a shared package**. (See the ClikHire-extension note in
`project_zeeklabs_billing_dodo_mor` memory — same India MoR-vs-gateway decision.)

## 7. Phasing — action plan for next session

1. **Lock the open decisions** (§8) with the user.
2. `RazorpayAdapter` + `razorpayMap` + **unit tests** (pure mapping; no-fallback throws).
3. **Registry region-routing** + provider-keyed plans + INR tiers.
4. Create **Razorpay products/plans (INR)** + webhook endpoint + keys (test mode first).
5. **GST invoicing** — GSTIN capture + compliant invoice (build vs Razorpay Invoices vs tool).
6. Wire **ZeekLabs first** (it's already live → fastest path to a real India e2e via UPI/card,
   then refund).
7. **ClikHire** (larger, separate): Supabase store + seats entitlement, reusing the adapter.

## 8. Open decisions (pre-think before next session)

1. **Provider:** Razorpay (recommended) vs Cashfree.
2. **India pricing:** separate INR/PPP tiers (recommended) vs USD-converted — and the exact INR price points per tier.
3. **Region detection:** profile/org country (recommended) vs IP vs explicit selector.
4. **Dodo for India?** Razorpay-only for India (recommended) vs keep Dodo as an India fallback.
5. **GST invoicing:** in-app build vs Razorpay Invoices vs external tool — and confirm ClikBound's GST registration + whether MoR/gateway ITC invoicing is straightforward.
6. **First target:** ZeekLabs (live, faster) vs ClikHire (needs the Supabase store first).

## 9. Non-goals / later
Reconciliation + payout dashboards · dunning/retry on failed mandates · multi-currency beyond
USD/INR · the double-sub guard / top-ups / upgrade-downgrade flow (tracked separately as billing
follow-ups).
