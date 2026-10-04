# ZeekLabs Payment Strategy: "Analyze 5, Get 5 Free"

## Overview

We're implementing a Google Ads-style acquisition model where users earn bonus credits after spending their purchased credits. This creates a compelling loop that increases engagement and reduces churn.

---

## The Psychology (Why This Works)

| Principle | How It Applies |
|-----------|----------------|
| **Sunk Cost Commitment** | Once users pay for credits, they're invested and want the "free" reward |
| **Goal Gradient Effect** | People accelerate toward a visible goal (progress bar fills up) |
| **Perceived Value Doubling** | Users feel they're getting 100% more value |
| **Reduces Churn** | Users stay to claim their free credits, then repeat the cycle |

---

## Credit Packs (One-Time Purchase)

We're using **one-time purchases** instead of subscriptions because:
- Lower friction for India market (no recurring commitment anxiety)
- Better fit for the reward model
- Users buy when they need, no cancellation risk

### Pricing Structure

| Pack | Price (USD) | Price (INR) | Credits | Bonus | Total Credits | Cost/Analysis |
|------|-------------|-------------|---------|-------|---------------|---------------|
| **Starter** | $4 | ~₹330 | 50 | +50 after spending 50 | 100 | ~₹33 |
| **Growth** | $9 | ~₹750 | 100 | +100 after spending 100 | 200 | ~₹37.5 |
| **Scale** | $29 | ~₹2,400 | 350 | +150 instant bonus | 500 | ~₹48 |

### How the Bonus System Works

```
┌─────────────────────────────────────────────────────────────┐
│  STARTER PACK FLOW ($4)                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User purchases Starter Pack                                │
│           ↓                                                 │
│  Receives 50 credits                                        │
│           ↓                                                 │
│  Uses credits (progress bar shows: "30/50 to unlock bonus") │
│           ↓                                                 │
│  Reaches 50 credits spent                                   │
│           ↓                                                 │
│  🎉 CELEBRATION! +50 bonus credits unlocked automatically   │
│           ↓                                                 │
│  Uses bonus credits                                         │
│           ↓                                                 │
│  Credits depleted → Prompted to buy next pack               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Scale Pack Exception:** The $29 Scale pack gives 150 bonus credits **instantly** (no unlock required) as a reward for the larger commitment.

---

## Dodo Dashboard Setup Required

### Step 1: Switch to Live Mode
1. Go to Dodo Dashboard
2. Toggle from Test Mode to **Live Mode**
3. Complete any verification requirements

### Step 2: Create Products

Create **3 one-time payment products** (NOT subscriptions):

| Internal Plan ID | Product Name in Dodo | Price | Type |
|------------------|---------------------|-------|------|
| `zeeklabs_starter` | ZeekLabs Starter | $4.00 | One-time payment |
| `zeeklabs_growth` | ZeekLabs Growth | $9.00 | One-time payment |
| `zeeklabs_scale` | ZeekLabs Scale | $29.00 | One-time payment |

### Step 3: Get Product IDs

After creating each product, copy the **Product ID** (format: `pdt_xxxxxxxx`).

We need:
```
zeeklabs_starter  → pdt_?????????
zeeklabs_growth   → pdt_?????????
zeeklabs_scale    → pdt_?????????
```

### Step 4: Get Live Mode API Keys

From **Developer → API Keys** (in Live Mode):
```
DODO_PAYMENTS_API_KEY = ???
```

From **Developer → Webhooks** (in Live Mode):
```
DODO_PAYMENTS_WEBHOOK_KEY = ???
```

### Step 5: Configure Webhook

Register webhook endpoint:
```
URL: https://zeeklabs.ai/api/billing/webhook
```

Subscribe to these events:
- `payment.succeeded` (for one-time payments)
- `payment.failed`

---

## What We'll Build

### 1. Updated Plans Configuration

```typescript
// src/lib/billing/plans.ts
export const PLANS = {
  zeeklabs_starter: {
    product: "zeeklabs",
    label: "ZeekLabs Starter",
    dodoProductId: "pdt_?????????",  // From Dodo
    credits: 50,
    bonusCredits: 50,
    bonusType: "unlock",  // Unlock after spending
    priceUsd: 4,
    priceInr: 330,
  },
  zeeklabs_growth: {
    product: "zeeklabs",
    label: "ZeekLabs Growth",
    dodoProductId: "pdt_?????????",  // From Dodo
    credits: 100,
    bonusCredits: 100,
    bonusType: "unlock",  // Unlock after spending
    priceUsd: 9,
    priceInr: 750,
  },
  zeeklabs_scale: {
    product: "zeeklabs",
    label: "ZeekLabs Scale",
    dodoProductId: "pdt_?????????",  // From Dodo
    credits: 350,
    bonusCredits: 150,
    bonusType: "instant",  // Instant bonus
    priceUsd: 29,
    priceInr: 2400,
  },
};
```

### 2. Database Changes

New fields needed:
```prisma
model User {
  // Existing fields...

  // Bonus tracking
  purchasedCredits    Int @default(0)  // Total credits from purchases
  spentSincePurchase  Int @default(0)  // Spent since last purchase
  bonusPending        Int @default(0)  // Bonus waiting to unlock
  bonusUnlocked       Int @default(0)  // Total bonus unlocked
}
```

### 3. UI Components

#### Progress Bar in Header
```
┌──────────────────────────────────────────────┐
│ 💰 47 credits  [████████░░] 30/50 to bonus! │
└──────────────────────────────────────────────┘
```

#### Buy Credits Modal (3 Plans)
```
┌─────────────────────────────────────────────────────────────┐
│                    Get More Credits                         │
│         Use credits, unlock FREE bonus credits!             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   STARTER   │  │   GROWTH    │  │    SCALE    │         │
│  │             │  │  ★ POPULAR  │  │  BEST VALUE │         │
│  │    $4       │  │     $9      │  │     $29     │         │
│  │   ~₹330     │  │    ~₹750    │  │   ~₹2,400   │         │
│  │             │  │             │  │             │         │
│  │  50 credits │  │ 100 credits │  │ 350 credits │         │
│  │  +50 bonus  │  │ +100 bonus  │  │ +150 bonus  │         │
│  │             │  │             │  │  (instant)  │         │
│  │  [Buy Now]  │  │  [Buy Now]  │  │  [Buy Now]  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  🔒 Secure payment · Dodo Payments                         │
└─────────────────────────────────────────────────────────────┘
```

#### Celebration Modal (on bonus unlock)
```
┌─────────────────────────────────────────┐
│           🎉 BONUS UNLOCKED! 🎉         │
│                                         │
│     You earned 50 FREE credits!         │
│                                         │
│  Keep analyzing to unlock more rewards  │
│                                         │
│           [Continue →]                  │
└─────────────────────────────────────────┘
```

### 4. Webhook Handler Update

Change from subscription-based to payment-based:

```typescript
// Handle payment.succeeded event
if (event.type === "payment.succeeded") {
  const { userId, planId } = event.metadata;
  const plan = planById(planId);

  // Grant purchased credits
  await grantCredits(userId, plan.credits, "PURCHASE");

  if (plan.bonusType === "instant") {
    // Scale pack: grant bonus immediately
    await grantCredits(userId, plan.bonusCredits, "BONUS");
  } else {
    // Starter/Growth: set pending bonus
    await setPendingBonus(userId, plan.bonusCredits, plan.credits);
  }
}
```

---

## Information Needed from Partner

Please share the following after setting up Dodo:

### 1. Live Mode API Keys
```
DODO_PAYMENTS_API_KEY =
DODO_PAYMENTS_WEBHOOK_KEY =
```

### 2. Product IDs
```
zeeklabs_starter (ZeekLabs Starter, $4)  → pdt_
zeeklabs_growth (ZeekLabs Growth, $9)    → pdt_
zeeklabs_scale (ZeekLabs Scale, $29)     → pdt_
```

### 3. Confirmation
- [ ] Products created as **one-time payments** (not subscriptions)
- [ ] Webhook registered for `https://zeeklabs.ai/api/billing/webhook`
- [ ] Webhook subscribed to `payment.succeeded` event

---

## Implementation Timeline

Once we have the Dodo product IDs and live keys:

1. **Update plans.ts** - Add all 3 plans with product IDs
2. **Update billing service** - Handle `payment.succeeded` instead of subscription events
3. **Add bonus tracking** - Database migration for bonus fields
4. **Update header UI** - Progress bar showing bonus progress
5. **Update Buy Credits modal** - Show all 3 plans with INR prices
6. **Add celebration modal** - Confetti when bonus unlocks
7. **Deploy & test** - End-to-end payment flow

---

## Summary

| What | Details |
|------|---------|
| **Model** | "Spend X, Get X Free" (like Google Ads) |
| **Plans** | 3 one-time packs: $4, $9, $29 |
| **Bonus** | 100% bonus on Starter/Growth after spending, instant 43% bonus on Scale |
| **Currency** | Show INR estimates for Indian users |
| **Why** | Higher engagement, lower churn, perceived value doubling |
