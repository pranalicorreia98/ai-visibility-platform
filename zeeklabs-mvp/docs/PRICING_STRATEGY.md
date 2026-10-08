# ZeekLabs Pricing Strategy — Subscription-first (US / EU / Gulf)

## Decision

Primary market is **US, EU and Gulf** (not India-first). For that market the right
model is **recurring subscriptions, tiered, with credits as the internal usage
meter** — *not* one-time credit packs, and *not* the "spend X get X free" bonus loop.

**Why:**
- **Market fit** — US/EU/Gulf B2B buyers expect recurring SaaS; no RBI e-mandate
  friction. Subscriptions give predictable MRR/ARR (better retention, LTV, valuation).
  The one-time-pack rationale was India-specific and doesn't apply here.
- **Product fit** — ZeekLabs is a *monitoring* product (AI visibility over time,
  trends, competitor benchmarking, alerts). Its value is continuous → subscription-shaped.
- **Cost alignment** — credits meter the variable LLM cost per analysis; kept as a
  monthly allowance per tier, with one-time top-ups only for overage.
- Retention comes from **product value** (scheduled reports, change alerts, trend
  dashboards), not a credit-bonus gimmick (which cheapens a serious B2B tool).

## Tiers (USD — Dodo as Merchant of Record handles EU VAT / Gulf / US tax)

Buyer sees plain value (analyses / brands / alerts); credits are the under-the-hood meter.
`1 analysis = 10 credits`, `1 prompt-lab run = 2 credits`.

| | Free | Starter | Pro ⭐ | Scale |
|---|---|---|---|---|
| **Monthly** | $0 | $49 | $149 | $399 |
| **Annual** (2 months free) | — | $490/yr | $1,490/yr | $3,990/yr |
| **Brands tracked** | 1 | 1 | 5 | 20 |
| **Competitors / brand** | 2 | 5 | 10 | Unlimited |
| **Credits / month** | 20 (one-time) | 150 | 600 | 2,500 |
| → full analyses / mo | ~2 | ~15 | ~60 | ~250 |
| **Monitoring & alerts** | — | Weekly | Daily + change alerts | Real-time |
| **PDF reports** | 1 | ✓ | ✓ branded | ✓ white-label |
| **Team seats** | 1 | 1 | 3 | 10 |
| **API access** | — | — | — | ✓ |
| **Credit top-ups (overage)** | — | ✓ | ✓ | ✓ |
| **Support** | Community | Email | Priority | Priority + onboarding |

**+ Enterprise (Contact sales):** custom volume, SSO, annual contract, dedicated
support — the right motion for Gulf and larger US/EU logos.

### Notes
- **Pro is the anchor** ("most popular"). **Annual = "2 months free"** (pay 10, get 12).
- ⚠️ **Validate credit allowances against real LLM cost/analysis before locking.**
  Numbers assume cost/analysis well under ~$1.50. Net per analysis after Dodo fees:
  Starter ~$3.0, Pro ~$2.5, Scale ~$1.6.
- $9/mo was underpriced; these align with comparable AEO tools ($49–$199+).

## Implementation checklist (follow-up PRs — product + UI work)

1. **Create Dodo products (LIVE mode)** — one per tier × interval
   (Starter/Pro/Scale, monthly + annual). Copy each `pdt_…` id.
2. **Extend `src/lib/billing/plans.ts`** — add the tier entries with `dodoProductId`,
   `creditsPerCycle`, interval, and feature-gate metadata (brands/competitors/seats/alerts).
3. **Update the Buy-Credits modal** — show the 3 tiers + a monthly/annual toggle
   (currently shows a single $9/mo plan).
4. **Enforce feature gates** in the app (brands/competitors/seats/alert frequency).
5. **Switch all three Dodo env vars to LIVE together** (API key + webhook signing
   secret + `DODO_PAYMENTS_ENV=live_mode`) — see billing setup. Mixing test/live breaks
   webhook signature verification.

> Billing engine (checkout → webhook → per-cycle credit grant) is already in place;
> the above is pricing/product configuration on top of it.
