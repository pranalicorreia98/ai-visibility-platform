# AWS Deployment Plan — zeeklabs.ai (Free-Tier / Near-Zero-Cost Revision)

**Status:** Draft for review · **Scope:** the actual `zeeklabs-mvp` Next.js app in this repo · **Revised:** 2026-08-02

## 0. Revision note — why this looks different from the first pass

The first version of this plan (Lambda microservices + Aurora Serverless v2 + SQS/EventBridge, ≈$55–80/month) was optimized for **elastic cost that tracks usage** — the right target for a growing paid product. You've now given three constraints that change the optimization target entirely:

1. **Close to $0** — this is free for at least 500 users for 1–2 years.
2. **Latency doesn't matter** — a spinner/"processing…" state is enough; nothing needs to feel instant.
3. **Old data gets purged** — storage growth is bounded on purpose, not left to accumulate.

Under those constraints, the two most expensive line items in the first plan — **Aurora Serverless v2's $44/month floor** and the **~$35/month NAT Gateway** a VPC-attached Lambda needs to reach both Postgres and the public LLM APIs — stop making sense. Neither cost tracks usage; both are fixed costs you'd pay even with zero users. So this revision replaces "serverless microservices that scale to zero" with **"one small always-on box that costs nothing while you're inside the AWS Free Tier, and single-digit-to-low-double-digit dollars once you're not."** The Lambda/Aurora architecture isn't wasted — it's now the documented **growth path** (§15) for once you outgrow this or start charging.

`docs/01-15` (the aspirational EKS/Istio/$128K-a-month spec) and the reconciliation note about it are unchanged from the first pass — still recommend archiving that set.

---

## 1. Constraints this revision is designed around

| Constraint | Design consequence |
|---|---|
| ~$0 cost for 500 free users, 1–2 years | Everything must fit inside AWS Free Tier where possible; avoid *any* service with a fixed floor cost that doesn't track usage |
| Latency is acceptable | No need for Lambda's instant elastic scaling, no provisioned concurrency, no CDN edge compute — a background worker on a single box is fine as long as the UI shows "processing" |
| Data purging enabled | Storage (and therefore cost) stays flat over time instead of growing for 1–2 years straight |
| ACID still non-negotiable | Still Postgres, still real transactions — this constraint didn't change |
| Domain: zeeklabs.ai | Unchanged |

---

## 2. Current state (unchanged from first pass — still accurate)

Verified directly from the code: Next.js 16 monolith, NextAuth v5, Prisma → SQLite (`dev.db`, 5.08 MB), multi-provider LLM calls (OpenAI/Gemini/Groq/Perplexity/GitHub Models/OpenRouter). `/api/analyze` is one LLM call per request, no timeout, no queue, worst case 60–150+s inside a single HTTP request, writes not wrapped in a transaction. `/api/monitoring/run` is a `CRON_SECRET`-gated batch endpoint built for an external cron that was never wired up. `/api/reports/generate` produces a JSON blob, not a PDF — no server-side PDF or S3 usage exists yet. No Docker/CI/deploy config exists. Full detail in §2 of the previous revision (same facts, not repeated here).

---

## 3. Target architecture — one box, not a fleet of Lambdas

**The core move:** run the whole backend — web tier and background workers — as a small number of long-lived Node processes on a **single EC2 instance**, talking to a **single small RDS Postgres instance** in the same VPC. No Lambda, no Aurora, no NAT Gateway, no Application Load Balancer, no CloudFront.

Why EC2 beats Lambda specifically *at this budget*: Lambda itself is free at 500-users volume (1M requests + 400,000 GB-seconds/month, free forever, not just 12 months). The cost was never Lambda — it was what Lambda *requires* to reach a private Postgres instance while also reaching the public internet for LLM calls: either Aurora Serverless v2's Data API (avoids networking complexity, but has a $44/month floor with zero free tier), or a VPC-attached Lambda + NAT Gateway (~$32–35/month, also with zero free tier). **EC2 doesn't have this problem** — one instance can sit in a subnet with both an Internet Gateway (direct internet access, no NAT needed) and a private route to RDS in the same VPC, simultaneously, for free. That single fact is why the architecture flips.

"Microservices" here now means **logically separate, independently-restartable processes** communicating over SQS and the database, not separate AWS compute resources per service — a legitimate "microservices on a shoestring" pattern. Splitting them onto separate machines later (§15) is a config change, not a rewrite, because the boundaries (queue-based handoff, no shared in-process state) are the same ones a "real" microservices split would use.

```
zeeklabs.ai (Route 53 A record → Elastic IP)
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│  EC2 t4g.micro/small — public subnet, Elastic IP           │
│  ┌─────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │ nginx/Caddy │  │  web-bff          │  │ analysis-worker│ │
│  │ (TLS term,  │─▶│  (next start,     │  │ (long-polls    │ │
│  │  Let's      │  │   pm2)            │  │  SQS, pm2)     │ │
│  │  Encrypt)   │  └─────────┬─────────┘  └───────┬────────┘ │
│  └─────────────┘            │                     │          │
│  ┌──────────────────────────┴─────────────────────┴───────┐ │
│  │  cron: scheduler-check.js (every 15 min)                │ │
│  │        purge-old-data.js (nightly)                      │ │
│  └───────────────────────────────────────────────────────┘ │
└──────────────┬───────────────────────────┬──────────────────┘
               │ private route (no NAT)     │ SQS (public endpoint,
               ▼                            │ no VPC needed)
     RDS Postgres db.t4g.micro       ┌───────▼────────┐
     (private subnet, same VPC)      │ SQS: analysis-  │
                                      │ jobs (+ DLQ)    │
                                      └─────────────────┘
```

| Process | Role | Same as first-pass service |
|---|---|---|
| `web-bff` (`next start` under pm2) | SSR, auth, CRUD API routes, enqueues jobs to SQS | web-bff |
| `analysis-worker` | Long-polls `analysis-jobs` SQS, runs the LLM orchestration logic, writes results in a transaction | analysis-service |
| `scheduler-check.js` (crontab, every 15 min) | Scans `MonitoringConfig` for due brands, enqueues jobs | scheduler-service |
| `purge-old-data.js` (crontab, nightly) | Enforces the retention policy in §7 | *new* |

EventBridge Scheduler is dropped in favor of plain crontab — same effect, one less AWS resource to pay for or manage, and it's genuinely free either way at this scale, but crontab is simpler to reason about on a single box.

---

## 4. Why not Lambda/Fargate here (short version — full trade-off table was in the first pass)

Lambda's whole value proposition is "pay only for what you use, scale instantly." At 500 low-traffic, latency-tolerant users, there's nothing to scale *to* — the bottleneck is never traffic, it's the fixed cost of reaching Postgres securely, which EC2 sidesteps entirely. Fargate has the same "≥1 task always running" cost floor as EC2 with none of EC2's free-tier eligibility, so it's strictly worse here. Revisit both once you're past hundreds of concurrent users or want zero-ops horizontal scaling (§15).

---

## 5. Database: still PostgreSQL, still ACID — just the cheap instance class

The ACID reasoning from the first pass is unchanged: this schema is FK-heavy and transaction-dependent, DynamoDB would require a full data-model rewrite for no benefit at 500 users' worth of data, so **PostgreSQL stays non-negotiable** for all core tables.

What changes is *which* Postgres: **RDS Postgres `db.t4g.micro`, Single-AZ, 20GB gp3 storage** instead of Aurora Serverless v2. This is free under the AWS Free Tier for 12 months (750 instance-hours/month + 20GB storage + 20GB automated-backup storage), and only ~$14–15/month after that — versus Aurora's $44/month floor from day one. Single-AZ (no standby replica) is the right trade-off here: you explicitly said latency/downtime tolerance is fine for this user base, and Multi-AZ roughly doubles the instance cost for failover you don't need yet.

Keep the transaction discipline called out in the first pass regardless of instance class:
- Wrap the `analyze` write sequence in one `prisma.$transaction([...])`.
- Use `SELECT ... FOR UPDATE SKIP LOCKED` when `scheduler-check.js` claims due `MonitoringConfig` rows.

---

## 6. Fixing `/api/analyze`: still an async job, now explicitly validated by your UX call

You've confirmed directly: latency is fine as long as the UI shows "processing." That's exactly the async-job redesign from the first pass, so it stays as-is and is now even easier to justify:

1. `POST /api/analyze` creates an `AnalysisCache` row (`status: "pending"`), pushes the job to `analysis-jobs` SQS, returns immediately.
2. `analysis-worker` (a long-running process on the EC2 box now, not a Lambda) picks it up, runs the LLM call(s), writes results transactionally.
3. `GET /api/analyze/status/:cacheId` — small new endpoint — lets the frontend poll every few seconds and show a "processing…" state until done.
4. `scheduler-check.js` enqueues onto the same queue, so scheduled and on-demand analysis share one code path.

Because there's no 15-minute Lambda cap or 29-second gateway timeout to design around anymore (a plain long-running process has neither), this is if anything *simpler* to implement than the first pass — no timeout budgeting needed at all, just "run it, update the row when done."

---

## 7. Data retention & purging (new — this is the direct lever on long-term cost)

The goal: keep RDS storage flat over 1–2 years instead of growing with every analysis ever run, so you never outgrow the free/cheap storage tier. `purge-old-data.js` runs nightly via crontab and does four things:

| Target | Rule | Why |
|---|---|---|
| `CachedResponse`, `PromptCache` | `DELETE WHERE expiresAt < now()` | These already have TTL fields (`expiresAt`) that nothing currently enforces — right now they just accumulate forever |
| Raw LLM response text — `Simulation.chatgptResponse/geminiResponse/perplexityResponse`, `Mention.response`, `PromptCache.response`, `AnalysisCache.rawResponse` | Null out (keep the row, drop the large text) after 90 days | This is by far the largest data type in the schema; the small derived fields (sentiment, position, mention counts) that the UI actually displays long-term are kept forever, only the bulky raw text goes |
| `AnalysisSnapshot` | Delete rows older than 180 days | Score-history table grows daily × brand × user; 6 months of trend data is more than enough for a free tier, older raw points aren't worth their storage |
| `ApiUsage` | Delete rows older than 1 year | Tiny daily counters, purely a hygiene pass |
| Postgres `VACUUM` | Run after each purge pass | Deletes don't reclaim disk space on their own — this step is what actually keeps the 20GB allotment from silently filling up |

This directly targets the two things that would otherwise grow unbounded over "1–2 years × 500 users": raw LLM response text (the biggest single contributor) and daily score snapshots. With this in place, 500 users over 2 years should comfortably stay within the RDS free tier's 20GB, and well within the cheap tier after.

---

## 8. Storage (S3)

No change in substance from the first pass — no server-side PDF exists yet, so this provisions ahead of a future `report-service` capability. S3's free tier (5GB, 12 months) and near-zero cost after cover this easily at 500 users. Lifecycle: Standard → expire at 1 year, matching the purge philosophy above.

---

## 9. Domain & DNS: zeeklabs.ai — simplified for the single-box setup

1. Route 53 hosted zone for `zeeklabs.ai` (the one AWS line item with **no free tier at all** — flat $0.50/month, unavoidable if you want managed DNS).
2. A single **A record** pointing `zeeklabs.ai` at the EC2 instance's **Elastic IP** (free while attached to a running instance).
3. TLS termination happens **on the box**, via Caddy (simplest — automatic Let's Encrypt certs with zero config) or nginx + certbot, reverse-proxying to the Next.js process on localhost. This replaces the Amplify/CloudFront/ACM chain from the first pass — no CDN, but you don't need one at this traffic level, and it removes a whole category of AWS services and their (small but nonzero) cost.
4. Update `NEXTAUTH_URL` to `https://zeeklabs.ai` and the Google OAuth redirect URI accordingly.

---

## 10. Security

- SSH access via **AWS Systems Manager Session Manager**, not an open port 22 — free, no bastion host, no key management, and the security group can block inbound SSH entirely.
- Security group: inbound 443/80 from anywhere (for the app), nothing else public; RDS security group only allows inbound from the EC2 instance's security group.
- Secrets (Google OAuth, GitHub token, all LLM provider keys, Resend key, DB credentials, `NEXTAUTH_SECRET`) in **SSM Parameter Store (SecureString)** — free standard tier, pulled at instance boot or process start.
- Rotate the keys that passed through the plaintext `.env` during development (Google client secret, GitHub token, OpenRouter, Perplexity), same as before.
- Automated EBS snapshots (daily, retained ~7 days) as the backup story for the instance itself, on top of RDS's own automated backups — cheap insurance for a single-box setup with no standby.

---

## 11. Observability

- CloudWatch Logs from the EC2 instance (via the CloudWatch agent) and pm2's own logs, **7–14 day retention** — no reason to pay for longer retention on a free product.
- A couple of alarms that matter: EC2 status-check failure (the box is down), RDS free storage < 2GB (purge job isn't keeping up), SQS DLQ depth > 0.
- Skip everything else (X-Ray, dashboards, distributed tracing) — appropriate for a fleet of services, not one box.

---

## 12. CI/CD & IaC

- Keep it proportional to a single box: a GitHub Actions workflow that runs typecheck/lint/test on PR, then on merge to `main` builds the app and deploys via `rsync`/`scp` + a remote `pm2 reload` over SSM (no separate deploy tooling needed).
- Terraform or CDK for the handful of resources (EC2, RDS, SQS, security groups, Route 53) is still worthwhile for reproducibility even at this small scale — a single box you can't easily recreate is its own risk.
- `prisma migrate deploy` runs as a step in the same deploy workflow, against RDS.

---

## 13. Cost model *(us-east-1, approximate — verify against the AWS Pricing Calculator; excludes third-party LLM API usage, billed separately)*

### Year 1 — inside the AWS Free Tier

| Item | Monthly cost |
|---|---:|
| EC2 `t4g.micro` (750 hrs/month free) | $0 |
| RDS `db.t4g.micro`, 20GB (free tier) | $0 |
| SQS | $0 (1M requests/month free, forever) |
| S3 (backups, minimal) | $0 |
| Data transfer out (100GB/month free, account-wide) | $0 |
| Route 53 hosted zone | $0.50 |
| CloudWatch (short retention) | $0–1 |
| **Total** | **≈ $0.50–1.50/month** |

*Assumption flagged: AWS Free Tier is 12 months from **AWS account creation**, not from when a resource is launched. If this deploys onto an existing AWS account older than 12 months, skip straight to the "after Year 1" column below.*

### After Year 1 (or on an existing/older AWS account)

| Item | On-demand | With a 1-year Reserved Instance / Savings Plan |
|---|---:|---:|
| EC2 `t4g.micro` | ~$6 | ~$3–4 |
| RDS `db.t4g.micro` + 20GB storage | ~$14–15 | ~$9–10 |
| Route 53 + SQS + S3 + CloudWatch | ~$1–3 | ~$1–3 |
| **Total** | **≈ $21–24/month** | **≈ $13–17/month** |

Since you specifically said 1–2 years, a **1-year Reserved Instance/Savings Plan on both EC2 and RDS is a good match for the stated horizon** and cuts the post-free-tier cost roughly in half — worth locking in once the free tier year is ending, if usage still looks like it's holding at this scale.

Spread across 500 users, even the on-demand "after Year 1" number is about **4–5 cents per user per month** — which is the more honest way to think about "close to $0" once a literal always-$0 stops being possible on any durable, ACID-backed setup.

### If you want literal $0 forever, know the trade-off

The only way to stay at true $0 past month 12 is to drop RDS and self-host Postgres on the same EC2 instance (no separate RDS bill at all — just the ~$6/month EC2 box, or $0 if still inside free tier). That works fine at 500 users' scale, but you lose RDS's automated backups/patching and take on that ops burden yourself (manual `pg_dump` to S3, e.g. nightly via the same cron that runs the purge job). Flagging this as an option, not defaulting to it — the $14–15/month for managed RDS buys real operational safety for not much money.

---

## 14. Migration plan

**Phase 0 — code changes:**
- Async `/api/analyze` + `monitoring/run` conversion (§6).
- Wrap multi-table writes in `prisma.$transaction`.
- Switch `schema.prisma` to `postgresql`, regenerate migrations, local Postgres for dev parity.
- Build `purge-old-data.js` (§7).

**Phase 1 — infra bootstrap:**
- EC2 instance (public subnet, Elastic IP, security group), RDS instance (private subnet, same VPC).
- Route 53 zone + A record; Caddy/nginx + Let's Encrypt on the box.
- SSM Parameter Store secrets.
- SQS queue + DLQ; crontab entries for `scheduler-check.js` and `purge-old-data.js`.

**Phase 2 — cutover:**
- `prisma migrate deploy` against RDS; smoke test.
- Update `NEXTAUTH_URL` + Google OAuth redirect URI; DNS cutover.

**Phase 3 — once it's running:**
- Confirm the purge job is actually keeping storage flat after a month of real data.
- Decide on the 1-year Reserved Instance commitment once the free-tier year is ending.

---

## 15. Growth path — when to move back to the first-pass architecture

This single-box setup is deliberately not built for scale — that's the correct trade-off for a free product at 500 users with latency tolerance, not a permanent ceiling. Revisit the Lambda + Aurora Serverless v2 + SQS/EventBridge microservices design from the first pass when **any** of these happen:
- You start charging, and uptime/latency SLAs start mattering to paying customers.
- You need horizontal scale beyond what one box comfortably handles (a rough signal: sustained CPU > 60% or the analysis queue backing up regularly).
- You want real high availability (Multi-AZ, no single point of failure) — the single-box design explicitly doesn't have this.

Because the process boundaries here already mirror that architecture (queue-based handoff between web-bff/analysis-worker/scheduler, no shared in-process state), that migration is "move each process to its own Lambda/Fargate service," not a rewrite.

---

## 16. Open items / risks

- **AWS account age assumption** — confirm whether this deploys to a new or existing AWS account; it determines whether Year 1 is genuinely $0 or starts at the "after Year 1" cost.
- **Single point of failure, by design** — one EC2 instance, one RDS instance, no standby. Acceptable given your stated latency/downtime tolerance for this user base; mitigated by EBS + RDS automated backups, not eliminated.
- Load-test the worst-case `/api/analyze` path in staging before cutover, same as the first pass.
- `docs/01-15` still describes an unrelated $128K/month enterprise system — recommend archiving.
- The passwordless "Demo Account" email login remains an existing app-level trust decision, unrelated to hosting.
