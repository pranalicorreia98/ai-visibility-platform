# MVP Documentation - Table of Contents

## AI Visibility Platform - Minimum Viable Product

**Version:** 1.0.0
**Created:** 2026-07-02
**Target:** Demo-Ready MVP for Indian Market
**Primary Market:** India (Digital Marketing Agencies, D2C Brands, SaaS Startups)

---

## Overview

This folder contains the complete MVP implementation plan for the AI Visibility Platform. The MVP is designed to:

- **Minimize costs** (near-zero infrastructure spend)
- **Focus on 2 AI systems** (ChatGPT + Gemini only)
- **Leverage free APIs** (Google AI Studio, GitHub Models)
- **Enable rapid development** (4-6 weeks)
- **Create compelling demos** for prospective clients

---

## Document Index

| # | Document | Description | Key Content |
|---|----------|-------------|-------------|
| 1 | [01-MVP-OVERVIEW.md](./01-MVP-OVERVIEW.md) | Strategy & Philosophy | MVP goals, free API strategy, demo script outline, success criteria |
| 2 | [02-MVP-TECHNICAL-ARCHITECTURE.md](./02-MVP-TECHNICAL-ARCHITECTURE.md) | Technical Design | Next.js stack, SQLite schema, API design, deployment |
| 3 | [03-MVP-FEATURE-SPECIFICATIONS.md](./03-MVP-FEATURE-SPECIFICATIONS.md) | Feature Details | Prompt Simulator, Dashboard, Brand Monitoring, Competitors, Auth |
| 4 | [04-MVP-COST-ANALYSIS.md](./04-MVP-COST-ANALYSIS.md) | Cost Breakdown | $0-1/month operating cost, free tier utilization, scaling triggers |
| 5 | [05-MVP-IMPLEMENTATION-TIMELINE.md](./05-MVP-IMPLEMENTATION-TIMELINE.md) | Development Schedule | 4-week breakdown, daily tasks, deliverables checklist |
| 6 | [06-COMPETITIVE-ANALYSIS.md](./06-COMPETITIVE-ANALYSIS.md) | Market Research | RankAI analysis, competitor landscape, positioning strategy |
| 7 | [07-INDIA-MARKET-STRATEGY.md](./07-INDIA-MARKET-STRATEGY.md) | India Go-to-Market | INR pricing, Razorpay, target segments, localization |

---

## Quick Reference

### MVP Scope Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            MVP AT A GLANCE                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  AI Systems:     ChatGPT (via GitHub Models) + Gemini (via Google AI Studio)│
│  Cost:           ~$0-1/month (free tiers)                                   │
│  Timeline:       4-6 weeks                                                   │
│  Tech Stack:     Next.js 14 + SQLite + Vercel                               │
│                                                                              │
│  Features Included:                                                          │
│  ✅ Prompt Simulator (hero feature)                                         │
│  ✅ Visibility Dashboard                                                     │
│  ✅ Brand Monitoring                                                         │
│  ✅ Competitor Comparison (up to 3)                                         │
│  ✅ Simple Authentication                                                    │
│                                                                              │
│  Features Deferred:                                                          │
│  ⏳ Claude, Perplexity, Copilot (add more AI systems later)                 │
│  ⏳ Citation Tracking (complex extraction)                                   │
│  ⏳ GEO Auditor (needs crawling infrastructure)                             │
│  ⏳ Auto-Fix Engine (needs CMS integrations)                                │
│  ⏳ API/SDK (internal only for MVP)                                         │
│  ⏳ Multi-tenancy (single workspace for MVP)                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Free API Limits (Daily)

| Provider | Model | Daily Limit | Notes |
|----------|-------|-------------|-------|
| Google AI Studio | Gemini 2.5 Flash | 20 requests | Primary Gemini source |
| GitHub Models | GPT-4o | ~30-50 requests | Rate limited |
| OpenRouter (backup) | Various | 50 requests | Fallback option |

### Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, TailwindCSS, shadcn/ui |
| Backend | Next.js API Routes, Prisma ORM |
| Database | SQLite (Turso for production) |
| Auth | NextAuth.js with Google OAuth |
| Hosting | Vercel (free tier) |
| AI APIs | Google AI Studio, GitHub Models |

### Timeline Summary

| Week | Phase | Focus |
|------|-------|-------|
| Week 1 | Foundation | Setup, auth, database, AI integration |
| Week 2 | Core Features | Prompt Simulator (hero feature) |
| Week 3 | Dashboard | Visibility metrics, mentions, charts |
| Week 4 | Polish | Competitors, UI polish, demo prep, deploy |
| Week 5 | Buffer | If needed for delays |

### Cost Summary

| Item | Monthly Cost |
|------|--------------|
| Hosting (Vercel) | $0 |
| Database (Turso) | $0 |
| AI APIs | $0 |
| Total | **$0-1/month** |

---

## Getting Started

### For Developers

1. Read [01-MVP-OVERVIEW.md](./01-MVP-OVERVIEW.md) to understand the strategy
2. Review [02-MVP-TECHNICAL-ARCHITECTURE.md](./02-MVP-TECHNICAL-ARCHITECTURE.md) for technical design
3. Follow [05-MVP-IMPLEMENTATION-TIMELINE.md](./05-MVP-IMPLEMENTATION-TIMELINE.md) day-by-day

### For Stakeholders

1. Read [01-MVP-OVERVIEW.md](./01-MVP-OVERVIEW.md) for business context
2. Review [04-MVP-COST-ANALYSIS.md](./04-MVP-COST-ANALYSIS.md) for financial details
3. Check timeline in [05-MVP-IMPLEMENTATION-TIMELINE.md](./05-MVP-IMPLEMENTATION-TIMELINE.md)

---

## Relationship to Full Platform

This MVP is a **subset** of the full AI Visibility Platform design documented in the parent `/docs` folder.

| Aspect | Full Platform | MVP |
|--------|---------------|-----|
| AI Systems | 8+ (ChatGPT, Gemini, Claude, Perplexity, Copilot, etc.) | 2 (ChatGPT, Gemini) |
| Architecture | Microservices on Kubernetes | Monolith on Vercel |
| Database | PostgreSQL + TimescaleDB + Redis + OpenSearch | SQLite |
| Monthly Cost | $2,000-5,000+ | $0-1 |
| Timeline | 6-12 months | 4-6 weeks |
| Target | Production SaaS | Demo/Validation |

After MVP validation, the platform can be **incrementally upgraded** to the full architecture as customer demand grows.

---

## Success Criteria

| Metric | Target |
|--------|--------|
| Development completion | 4-6 weeks |
| Monthly cost | < $50 |
| Demo success rate | 100% (no crashes) |
| Client interest | At least 1 strong lead |
| Feature completion | All 5 MVP features working |

---

## Next Steps After MVP

1. **Validate**: Run 3-5 client demos
2. **Iterate**: Incorporate feedback
3. **Expand**: Add Claude + Perplexity support
4. **Scale**: Move to production infrastructure when needed
5. **Monetize**: Convert interested clients to paying customers

---

*Last Updated: 2026-07-02*
