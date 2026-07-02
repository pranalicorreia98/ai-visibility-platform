# MVP Cost Analysis

## Document Information

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Draft |
| Created | 2026-07-02 |
| Currency | USD |

---

## 1. Cost Philosophy

### 1.1 MVP Cost Targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| **Monthly Infrastructure** | < $50 | Minimal until validated |
| **AI API Costs** | $0 | Free tiers only |
| **Development Tools** | $0 | Free/open-source |
| **Total Monthly Burn** | < $50 | Sustainable for validation |

### 1.2 Cost Comparison: Full Platform vs MVP

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        MONTHLY COST COMPARISON                              │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  FULL PLATFORM (Original Design)                                            │
│  ───────────────────────────────                                            │
│  AWS EKS Cluster (3 nodes)         $300 - $500                             │
│  RDS PostgreSQL (Multi-AZ)         $200 - $400                             │
│  ElastiCache Redis                 $100 - $200                             │
│  OpenSearch                        $150 - $300                             │
│  Application Load Balancer         $50 - $100                              │
│  CloudFront + WAF                  $50 - $150                              │
│  Data Transfer                     $50 - $200                              │
│  AI API Costs (OpenAI, etc.)       $500 - $2,000                           │
│  Monitoring (DataDog/New Relic)    $100 - $300                             │
│  ─────────────────────────────────────────────                             │
│  TOTAL:                            $1,500 - $4,150/month                   │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  MVP (This Design)                                                          │
│  ─────────────────                                                          │
│  Vercel Hosting (Free Tier)        $0                                      │
│  Turso SQLite (Free Tier)          $0                                      │
│  Google AI Studio (Free)           $0                                      │
│  GitHub Models (Free)              $0                                      │
│  Domain Name                       $12/year (~$1/month)                    │
│  Email (Resend Free Tier)          $0                                      │
│  ─────────────────────────────────────────────                             │
│  TOTAL:                            ~$1/month                               │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  SAVINGS:                          $1,499 - $4,149/month (99%+)            │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Infrastructure Costs

### 2.1 Hosting: Vercel

| Plan | Cost | Limits | MVP Fit |
|------|------|--------|---------|
| **Hobby (Free)** | $0/month | 100GB bandwidth, 100 hrs serverless, 1 project | ✅ Perfect for MVP |
| Pro | $20/month | 1TB bandwidth, more serverless | If needed later |

**Why Vercel Free Works:**
- 100GB bandwidth handles ~50,000 page views
- Serverless functions perfect for API routes
- Auto-scaling, no DevOps needed
- Free SSL, CDN included

### 2.2 Database: Turso (SQLite)

| Plan | Cost | Limits | MVP Fit |
|------|------|--------|---------|
| **Starter (Free)** | $0/month | 9GB storage, 500M rows read, 25M rows written | ✅ More than enough |
| Scaler | $29/month | 24GB storage, unlimited reads | If scale needed |

**Why Turso Free Works:**
- MVP needs < 1MB storage
- Edge-replicated SQLite (fast globally)
- Serverless-compatible (unlike file SQLite)
- No connection limits

### 2.3 Alternative: Railway (If Needed)

| Plan | Cost | Limits | Notes |
|------|------|--------|-------|
| **Hobby** | $5/month (credits) | $5 monthly credit | Good fallback |
| Includes | PostgreSQL | 1GB RAM, 1GB disk | More powerful |

---

## 3. AI API Costs

### 3.1 Free Tier Providers

| Provider | Models | Free Limits | Monthly Value |
|----------|--------|-------------|---------------|
| **Google AI Studio** | Gemini 2.5 Flash, 3.0 Flash | 20 req/day, 250K tokens/min | ~$50-100 equivalent |
| **GitHub Models** | GPT-4o, GPT-4.1, o1 | Rate limited (free Copilot) | ~$100-200 equivalent |
| **OpenRouter** | Various | 50 req/day | ~$20 equivalent |
| **Groq** | Llama 3.3 70B | 1000 req/day | ~$30 equivalent |

### 3.2 Daily API Budget for MVP

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         DAILY API BUDGET                                    │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Google AI Studio (Gemini)                                                  │
│  ─────────────────────────                                                  │
│  Daily Limit:           20 requests                                         │
│  Reserved for Demos:    10 requests (50%)                                   │
│  Available for Testing: 10 requests (50%)                                   │
│                                                                             │
│  GitHub Models (ChatGPT)                                                    │
│  ───────────────────────                                                    │
│  Daily Limit:           ~30-50 requests (estimate)                          │
│  Reserved for Demos:    15-25 requests (50%)                                │
│  Available for Testing: 15-25 requests (50%)                                │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  DEMO DAY STRATEGY                                                          │
│  ─────────────────                                                          │
│  Pre-Demo: Run 10-15 brand queries to populate data                        │
│  During Demo:                                                               │
│    • Show cached/historical results: ~80% of demo                          │
│    • Live queries (WOW moments): ~5-10 requests                            │
│    • Keep 5 requests as emergency buffer                                   │
│                                                                             │
│  Per Demo Cost: $0                                                          │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 What If Free Tiers Run Out?

| Scenario | Solution | Cost |
|----------|----------|------|
| Need more Gemini | Add $10 to OpenRouter | $10 one-time |
| Need more ChatGPT | Use Groq Llama as fallback | $0 |
| Demo fails | Use cached responses | $0 |
| Scale beyond MVP | Move to paid APIs | Budget separately |

---

## 4. Development Tools (All Free)

### 4.1 Development Stack

| Tool | Cost | Alternative |
|------|------|-------------|
| VS Code | $0 | - |
| GitHub (Private repos) | $0 | - |
| Node.js | $0 | - |
| pnpm/npm | $0 | - |
| Prisma | $0 | Drizzle |
| Next.js | $0 | - |
| TailwindCSS | $0 | - |
| shadcn/ui | $0 | - |
| TypeScript | $0 | - |

### 4.2 Design Tools

| Tool | Cost | Alternative |
|------|------|-------------|
| Figma (Free tier) | $0 | - |
| Excalidraw | $0 | - |
| Linear (Free tier) | $0 | GitHub Issues |

---

## 5. Optional Costs

### 5.1 Domain Name

| Registrar | Cost | Notes |
|-----------|------|-------|
| Namecheap | $10-15/year | Good for .com |
| Cloudflare | $8-10/year | Cheapest .com |
| Vercel (subdomain) | $0 | yourapp.vercel.app |

**Recommendation:** Use Vercel subdomain for MVP, buy domain when launching.

### 5.2 Email (Optional)

| Service | Cost | Limits |
|---------|------|--------|
| **Resend (Free)** | $0 | 3,000 emails/month |
| Gmail (personal) | $0 | For testing |

### 5.3 Error Monitoring (Optional)

| Service | Cost | Notes |
|---------|------|-------|
| Vercel built-in | $0 | Basic logs |
| Sentry (Free) | $0 | 5K errors/month |

---

## 6. Total Cost Summary

### 6.1 MVP Monthly Costs

| Category | Cost | Notes |
|----------|------|-------|
| Hosting (Vercel) | $0 | Free tier |
| Database (Turso) | $0 | Free tier |
| AI APIs | $0 | Free tiers |
| Email | $0 | Resend free |
| Domain | ~$1 | Optional, annualized |
| **TOTAL** | **$0-1/month** | |

### 6.2 One-Time Costs

| Item | Cost | Notes |
|------|------|-------|
| Domain purchase | $10-15 | Optional |
| OpenRouter credit | $10 | Backup API access |
| **TOTAL** | **$10-25** | |

### 6.3 First Year Projection

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         FIRST YEAR COSTS                                    │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Months 1-3: MVP Development & Demo                                         │
│  ───────────────────────────────────                                        │
│  Hosting:        $0 × 3 = $0                                               │
│  Database:       $0 × 3 = $0                                               │
│  Domain:         $12 (annual)                                              │
│  OpenRouter:     $10 (one-time buffer)                                     │
│  ───────────────────────────────────                                        │
│  Subtotal:       $22                                                        │
│                                                                             │
│  Months 4-6: Early Customers (If Validated)                                 │
│  ───────────────────────────────────────────                                │
│  Vercel Pro:     $20 × 3 = $60                                             │
│  Turso:          $0 (still free tier)                                      │
│  AI APIs:        $50 × 3 = $150 (start paying for reliability)             │
│  ───────────────────────────────────                                        │
│  Subtotal:       $210                                                       │
│                                                                             │
│  Months 7-12: Growth (If Scaling)                                           │
│  ───────────────────────────────────                                        │
│  Infrastructure: $100 × 6 = $600 (Vercel + DB)                             │
│  AI APIs:        $200 × 6 = $1,200 (increased usage)                       │
│  ───────────────────────────────────                                        │
│  Subtotal:       $1,800                                                     │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════   │
│  YEAR 1 TOTAL:   $2,032                                                     │
│  (Only if scaling - MVP validation costs ~$22)                             │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Cost Scaling Triggers

### 7.1 When to Upgrade

| Trigger | Action | New Cost |
|---------|--------|----------|
| > 100GB bandwidth/month | Vercel Pro | $20/month |
| > 9GB database | Turso Scaler | $29/month |
| > 20 Gemini req/day needed | Google AI paid | ~$0.001/req |
| > 50 ChatGPT req/day needed | OpenAI API | ~$0.003/1K tokens |
| Need multiple environments | Railway | $5-20/month |

### 7.2 Revenue vs Cost Milestones

| Milestone | Monthly Revenue | Monthly Cost | Margin |
|-----------|-----------------|--------------|--------|
| MVP (0 customers) | $0 | $0-1 | N/A |
| First customer | $99 | $50 | $49 (50%) |
| 5 customers | $500 | $150 | $350 (70%) |
| 20 customers | $2,000 | $500 | $1,500 (75%) |

---

## 8. Risk Mitigation

### 8.1 Cost Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Free tier discontinued | Low | High | Multiple provider fallbacks |
| Rate limits too restrictive | Medium | Medium | Caching, pre-computation |
| Unexpected Vercel charges | Low | Low | Set spending limits |
| Need faster infrastructure | Medium | Medium | Budget for Railway/Render |

### 8.2 Contingency Budget

| Scenario | Budget |
|----------|--------|
| Emergency API access | $50 |
| Infrastructure upgrade | $100 |
| Domain + professional email | $50 |
| **Total Contingency** | **$200** |

---

## 9. Comparison: Build vs Buy

### 9.1 Alternative: Existing Tools

| Tool | Monthly Cost | Features | Limitation |
|------|--------------|----------|------------|
| Brand24 | $79-249 | Social monitoring | No AI focus |
| Brandwatch | $800+ | Enterprise monitoring | No AI focus |
| No AI-specific tool exists | - | - | Market opportunity! |

**Conclusion:** Building MVP is cheaper than using existing tools, and no direct competitor exists for AI visibility monitoring.

### 9.2 Build Cost (Developer Time)

Assuming $50-100/hour developer rate:

| Task | Hours | Cost @ $75/hr |
|------|-------|---------------|
| Setup & boilerplate | 8 | $600 |
| Prompt Simulator | 20 | $1,500 |
| Dashboard | 16 | $1,200 |
| Brand Monitoring | 12 | $900 |
| Competitor View | 10 | $750 |
| Auth & Polish | 10 | $750 |
| Testing & Fixes | 16 | $1,200 |
| **TOTAL** | **92 hours** | **$6,900** |

At solo founder pace (part-time): 4-6 weeks
At dedicated developer pace: 2-3 weeks

---

## 10. Summary

### 10.1 MVP Cost Profile

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         MVP COST SUMMARY                                    │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  💰 Monthly Operating Cost:     $0-1                                       │
│  💰 One-Time Setup Cost:        $10-25                                     │
│  💰 First Year (MVP only):      ~$22                                       │
│  💰 First Year (if scaling):    ~$2,000                                    │
│                                                                             │
│  📊 Savings vs Full Platform:   99%+ ($1,500-4,000/month saved)            │
│                                                                             │
│  ✅ Perfect for:                                                            │
│     • Validating product-market fit                                        │
│     • Running sales demos                                                  │
│     • Getting first 5-10 customers                                         │
│     • Iterating on features                                                │
│                                                                             │
│  ⚠️ Upgrade when:                                                           │
│     • Free tier limits become restrictive                                  │
│     • Need higher reliability for paying customers                         │
│     • Scale beyond demo/early customer phase                               │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

*This cost analysis demonstrates that the MVP can be built and operated at near-zero cost, making it an extremely low-risk way to validate the market opportunity.*
