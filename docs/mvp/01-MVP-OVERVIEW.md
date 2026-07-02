# MVP Overview & Strategy

## Document Information

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Draft |
| Created | 2026-07-02 |
| Target | Demo-Ready MVP |

---

## 1. MVP Philosophy

### 1.1 Core Principle

> **Build the smallest possible product that demonstrates real value to prospective clients while minimizing infrastructure and operational costs.**

This MVP is designed for **sales demos and early validation**, not production scale. We leverage free-tier APIs and minimal infrastructure to prove the concept before investing in full-scale architecture.

### 1.2 Key Constraints

| Constraint | Decision |
|------------|----------|
| **AI Systems** | ChatGPT + Gemini only (most popular, free APIs available) |
| **Infrastructure** | Minimal cloud spend (<$50/month) |
| **API Costs** | Zero - using free tiers exclusively |
| **Timeline** | 4-6 weeks to demo-ready |
| **Team Size** | 1-2 developers |

---

## 2. Free LLM API Strategy

### 2.1 Primary API Sources

Based on [cheahjs/free-llm-api-resources](https://github.com/cheahjs/free-llm-api-resources):

#### Google Gemini (via Google AI Studio)

| Property | Value |
|----------|-------|
| **Provider** | Google AI Studio |
| **Models** | Gemini 2.5 Flash, Gemini 3.0 Flash |
| **Rate Limits** | 250,000 tokens/min, 20 requests/day, 5 requests/min |
| **Cost** | Free |
| **Signup** | https://aistudio.google.com |
| **Caveat** | Data may be used for training outside EU/UK |

#### OpenAI/ChatGPT (via GitHub Models)

| Property | Value |
|----------|-------|
| **Provider** | GitHub Models |
| **Models** | GPT-4o, GPT-4.1, o1, o3 |
| **Rate Limits** | Depends on Copilot tier (Free tier available) |
| **Cost** | Free |
| **Signup** | https://github.com/marketplace/models |
| **Caveat** | Restrictive input/output token limits |

### 2.2 Backup/Alternative Providers

| Provider | Models | Limits | Use Case |
|----------|--------|--------|----------|
| **OpenRouter** | Multiple | 20 req/min, 50 req/day | Fallback |
| **Groq** | Llama 3.3 70B | 1000 req/day | Fast inference demo |
| **Mistral** | Mistral models | 1 req/sec, 500K tokens/min | European fallback |

### 2.3 Rate Limit Management Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                   RATE LIMIT STRATEGY                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Daily Budget Allocation (Demo Day):                         │
│  ─────────────────────────────────────                       │
│  • Gemini: 20 requests/day                                   │
│  • GitHub/ChatGPT: ~30-50 requests/day (estimate)            │
│                                                              │
│  Demo Script Design:                                         │
│  ─────────────────────                                       │
│  • Pre-cache common demo queries                             │
│  • Show cached results for most interactions                 │
│  • Reserve 5-10 "live" queries for WOW moments               │
│  • Have fallback screenshots if limits hit                   │
│                                                              │
│  Request Prioritization:                                     │
│  ───────────────────────                                     │
│  1. Prompt Simulator (client-visible, needs live)            │
│  2. Brand Monitoring (can show cached)                       │
│  3. Visibility Score (computed from cached data)             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. MVP Scope Definition

### 3.1 In-Scope Features (MVP)

| Feature | Priority | Rationale |
|---------|----------|-----------|
| **Prompt Simulator** | P0 | Hero feature - shows value instantly |
| **Basic Dashboard** | P0 | Command center visualization |
| **Visibility Score** | P0 | Key metric clients understand |
| **Brand Monitoring** | P0 | Core value proposition |
| **Basic Competitor View** | P0 | Competitive angle sells |
| **Simple Auth** | P0 | Demo needs login |

### 3.2 Out-of-Scope (Post-MVP)

| Feature | Reason for Deferral |
|---------|---------------------|
| Claude, Perplexity, Copilot monitoring | Focus on 2 AI systems first |
| Citation Tracking (deep) | Complex extraction logic |
| GEO Auditor | Requires web crawling infrastructure |
| Auto-Fix Engine | Requires CMS integrations |
| AI Traffic Attribution | Requires analytics integration |
| Executive Reporting | Can demo with mock PDFs |
| SDK/API | Not needed for demos |
| Multi-tenancy | Single workspace for MVP |
| Billing | Free demo accounts |

### 3.3 MVP Feature Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MVP FEATURE MAP                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    PROMPT SIMULATOR (HERO)                    │   │
│  │  • Enter any prompt                                           │   │
│  │  • See ChatGPT + Gemini responses side-by-side               │   │
│  │  • Highlight brand mentions, competitor mentions              │   │
│  │  • Show position/ranking if applicable                        │   │
│  │  • Basic sentiment indicator                                  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                 │                                    │
│                                 ▼                                    │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    VISIBILITY DASHBOARD                       │   │
│  │  • Visibility Score (0-100)                                   │   │
│  │  • Breakdown: ChatGPT vs Gemini                               │   │
│  │  • Trend chart (mock historical data for demo)                │   │
│  │  • Recent mentions feed                                       │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                 │                                    │
│          ┌──────────────────────┴──────────────────────┐            │
│          ▼                                              ▼            │
│  ┌─────────────────────┐                    ┌─────────────────────┐ │
│  │  BRAND MONITORING   │                    │ COMPETITOR VIEW     │ │
│  │  • Configure brand  │                    │ • Add 3 competitors │ │
│  │  • See mentions     │                    │ • Compare scores    │ │
│  │  • Sentiment tags   │                    │ • Share of voice    │ │
│  └─────────────────────┘                    └─────────────────────┘ │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Target Demo Script

### 4.1 Demo Flow (15-20 minutes)

```
DEMO SCRIPT OUTLINE
───────────────────

1. HOOK (2 min)
   "Do you know how ChatGPT describes your brand to potential customers?"
   → Run live prompt: "What is [Client Brand]?"
   → Show side-by-side ChatGPT vs Gemini responses
   → Highlight any issues (outdated info, missing info, competitor praise)

2. VISIBILITY SCORE (3 min)
   "We track your visibility across AI systems continuously"
   → Show dashboard with score (72/100)
   → Explain score components
   → Show ChatGPT score (78) vs Gemini score (67)

3. BRAND MONITORING (3 min)
   "Every mention is captured and analyzed"
   → Show recent mentions feed
   → Click into a mention, show full context
   → Show sentiment distribution

4. COMPETITOR COMPARISON (3 min)
   "See how you stack up against competitors"
   → Show competitor scores side-by-side
   → Show share of voice chart
   → "Competitor X is mentioned 40% more often in pricing discussions"

5. LIVE SIMULATION (5 min)
   "Let's test some queries together"
   → Client suggests a query
   → Run live simulation
   → Analyze results together
   → Show actionable insights

6. CLOSE (2 min)
   "Imagine having this visibility into all AI systems, 24/7"
   → Quick pricing overview
   → Next steps
```

### 4.2 Pre-Demo Preparation

| Task | Purpose |
|------|---------|
| Pre-run 10-15 queries for client's brand | Populate "historical" data |
| Pre-run competitor queries | Have comparison ready |
| Cache common industry queries | Instant results |
| Prepare 3-5 "wow" live queries | Reserve API calls |
| Have fallback screenshots | If APIs fail |

---

## 5. Success Criteria

### 5.1 MVP Success Metrics

| Metric | Target |
|--------|--------|
| Demo completion rate | 100% without crashes |
| Client interest (verbal) | "When can we start?" |
| Live query success rate | >90% during demo |
| Time to demo-ready | 4-6 weeks |
| Monthly infrastructure cost | <$50 |

### 5.2 Go/No-Go Criteria

**GO to next phase if:**
- 3+ demos completed successfully
- At least 1 client expresses strong buying interest
- No critical bugs during demos

**Iterate if:**
- Demos have technical issues
- Clients don't understand value proposition
- Rate limits cause demo failures

---

## 6. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| API rate limits during demo | Pre-cache, schedule demos apart, have backups |
| Free API discontinued | Multiple provider fallbacks ready |
| API response quality poor | Test extensively, show best examples |
| Client brand has no AI presence | Choose demo-friendly clients, prepare narrative |
| Technical failure during demo | Local fallback mode with cached data |

---

## 7. Next Steps

1. **Read**: [02-MVP-TECHNICAL-ARCHITECTURE.md](./02-MVP-TECHNICAL-ARCHITECTURE.md)
2. **Read**: [03-MVP-FEATURE-SPECIFICATIONS.md](./03-MVP-FEATURE-SPECIFICATIONS.md)
3. **Read**: [04-MVP-COST-ANALYSIS.md](./04-MVP-COST-ANALYSIS.md)
4. **Read**: [05-MVP-IMPLEMENTATION-TIMELINE.md](./05-MVP-IMPLEMENTATION-TIMELINE.md)

---

*This document defines the strategic approach for the AI Visibility Platform MVP. All subsequent technical decisions should align with the principles outlined here.*
