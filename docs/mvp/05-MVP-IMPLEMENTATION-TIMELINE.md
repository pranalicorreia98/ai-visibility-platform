# MVP Implementation Timeline

## Document Information

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Draft |
| Created | 2026-07-02 |
| Total Duration | 4-6 weeks |

---

## 1. Timeline Overview

### 1.1 High-Level Schedule

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         MVP IMPLEMENTATION TIMELINE                         │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  WEEK 1          WEEK 2          WEEK 3          WEEK 4          WEEK 5    │
│  ──────          ──────          ──────          ──────          ──────    │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ PHASE 1: Foundation                                                  │  │
│  │ Project setup, auth, database                                        │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│                  ┌──────────────────────────────────────────────────────┐  │
│                  │ PHASE 2: Core Features                               │  │
│                  │ Prompt Simulator (hero feature)                      │  │
│                  └──────────────────────────────────────────────────────┘  │
│                                                                             │
│                                  ┌──────────────────────────────────────┐  │
│                                  │ PHASE 3: Dashboard & Monitoring      │  │
│                                  │ Dashboard, brand config, mentions    │  │
│                                  └──────────────────────────────────────┘  │
│                                                                             │
│                                                  ┌──────────────────────┐  │
│                                                  │ PHASE 4: Polish      │  │
│                                                  │ Competitors, UI, demo│  │
│                                                  └──────────────────────┘  │
│                                                                             │
│  ●────────────●────────────●────────────●────────────●────────────●        │
│  Start       W1 End      W2 End      W3 End      W4 End      Demo Ready   │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Effort Estimates

| Phase | Duration | Developer Days | Effort |
|-------|----------|----------------|--------|
| Phase 1: Foundation | 5 days | 5 | 20% |
| Phase 2: Core Features | 7 days | 7 | 30% |
| Phase 3: Dashboard & Monitoring | 6 days | 6 | 25% |
| Phase 4: Polish & Demo | 5 days | 5 | 20% |
| Buffer | 2 days | 2 | 5% |
| **TOTAL** | **25 days (~5 weeks)** | **25** | **100%** |

---

## 2. Phase 1: Foundation (Week 1)

### 2.1 Objectives

- Set up development environment
- Initialize Next.js project with TypeScript
- Configure database and ORM
- Implement authentication
- Create basic layout/navigation

### 2.2 Daily Breakdown

```
WEEK 1: FOUNDATION
═══════════════════════════════════════════════════════════════════════════

DAY 1: Project Setup
────────────────────
□ Create Next.js 14 project with TypeScript
  $ npx create-next-app@latest ai-visibility-mvp --typescript --tailwind --app
□ Install dependencies
  $ pnpm add prisma @prisma/client next-auth @auth/prisma-adapter
  $ pnpm add @google/generative-ai openai
  $ pnpm add zustand recharts zod
  $ pnpm add -D @types/node
□ Initialize Prisma with SQLite
  $ npx prisma init --datasource-provider sqlite
□ Set up Git repository
□ Configure ESLint & Prettier
□ Set up environment variables template

Deliverable: Running Next.js app with dependencies installed

───────────────────────────────────────────────────────────────────────────

DAY 2: Database Schema
──────────────────────
□ Define Prisma schema (User, Brand, Competitor, Simulation, Mention, ApiUsage)
□ Generate Prisma client
  $ npx prisma generate
□ Create initial migration
  $ npx prisma migrate dev --name init
□ Create database utility (lib/prisma.ts)
□ Test database connection

Deliverable: Working database with all tables created

───────────────────────────────────────────────────────────────────────────

DAY 3: Authentication
─────────────────────
□ Configure NextAuth.js
  - Create /app/api/auth/[...nextauth]/route.ts
  - Set up Prisma adapter
  - Configure Google OAuth provider
□ Create auth utility functions (lib/auth.ts)
□ Create protected route middleware
□ Build login page UI (/app/(auth)/login/page.tsx)
□ Test login flow end-to-end

Deliverable: Working Google OAuth login

───────────────────────────────────────────────────────────────────────────

DAY 4: Layout & Navigation
──────────────────────────
□ Install and configure shadcn/ui
  $ npx shadcn-ui@latest init
  $ npx shadcn-ui@latest add button card input badge
□ Create dashboard layout (/app/(dashboard)/layout.tsx)
  - Sidebar navigation
  - Header with user info
  - Main content area
□ Create placeholder pages
  - Dashboard (/app/(dashboard)/page.tsx)
  - Simulator (/app/(dashboard)/simulator/page.tsx)
  - Monitoring (/app/(dashboard)/monitoring/page.tsx)
  - Competitors (/app/(dashboard)/competitors/page.tsx)
  - Settings (/app/(dashboard)/settings/page.tsx)
□ Implement responsive design (mobile sidebar)

Deliverable: Navigable app shell with all page routes

───────────────────────────────────────────────────────────────────────────

DAY 5: AI Provider Integration
──────────────────────────────
□ Create AI provider abstractions (lib/ai-providers/)
  - gemini.ts: Google AI Studio integration
  - chatgpt.ts: GitHub Models integration
□ Implement rate limiting utility (lib/rate-limit.ts)
  - Check daily/minute limits
  - Record usage to database
□ Create API routes for AI providers
  - /api/ai/gemini/route.ts
  - /api/ai/chatgpt/route.ts
□ Test both providers with simple prompts
□ Handle errors gracefully

Deliverable: Working AI API integration with rate limiting

═══════════════════════════════════════════════════════════════════════════
END OF WEEK 1 MILESTONE: Core infrastructure complete
═══════════════════════════════════════════════════════════════════════════
```

### 2.3 Week 1 Deliverables Checklist

| # | Deliverable | Status |
|---|-------------|--------|
| 1 | Next.js app running locally | ⬜ |
| 2 | Database with all tables | ⬜ |
| 3 | Google OAuth login working | ⬜ |
| 4 | Dashboard layout with navigation | ⬜ |
| 5 | AI providers integrated and tested | ⬜ |

---

## 3. Phase 2: Core Features (Week 2)

### 3.1 Objectives

- Build the Prompt Simulator (hero feature)
- Implement mention detection and analysis
- Create response comparison UI
- Add caching for demo optimization

### 3.2 Daily Breakdown

```
WEEK 2: CORE FEATURES
═══════════════════════════════════════════════════════════════════════════

DAY 6: Simulator Backend
────────────────────────
□ Create simulation API route (/api/simulate/route.ts)
  - Accept prompt, systems[], brandId
  - Call AI providers in parallel
  - Return raw responses
□ Create analysis utilities (lib/analysis/)
  - mention-detection.ts: Find brand/competitor mentions
  - sentiment-analysis.ts: Basic sentiment scoring
  - position-detection.ts: Extract ranking position
□ Store simulation results in database
□ Add error handling for API failures

Deliverable: API endpoint that runs simulations and returns analyzed results

───────────────────────────────────────────────────────────────────────────

DAY 7: Simulator Frontend (Part 1)
──────────────────────────────────
□ Build PromptInput component
  - Text area for prompt input
  - Character counter (max 500)
  - AI system checkboxes (ChatGPT, Gemini)
  - Brand selector dropdown
□ Build submission handling
  - Loading states
  - Error handling
  - Rate limit warning display
□ Add quota indicator (Daily Quota: X/20)

Deliverable: Functional prompt input form

───────────────────────────────────────────────────────────────────────────

DAY 8: Simulator Frontend (Part 2)
──────────────────────────────────
□ Build ResponseCard component
  - AI system icon and name
  - Response text with highlighting
  - Sentiment badge
  - Position badge
  - Competitor mentions list
□ Build side-by-side comparison layout
□ Implement mention highlighting
  - Yellow for brand mentions
  - Red for competitor mentions
□ Build AnalysisSummary component
  - Aggregate stats across systems

Deliverable: Complete Prompt Simulator page

───────────────────────────────────────────────────────────────────────────

DAY 9: Caching System
─────────────────────
□ Implement response caching (lib/cache.ts)
  - Hash prompts for cache keys
  - Store in CachedResponse table
  - Set TTL (7 days for demo)
□ Add cache-first fetching in simulation API
  - Check cache before calling AI
  - Return cached response if available
  - Background refresh option
□ Build cache warming utility
  - Pre-run common prompts
  - Populate demo data

Deliverable: Caching system for demo optimization

───────────────────────────────────────────────────────────────────────────

DAY 10: Brand Configuration
───────────────────────────
□ Build brand configuration form
  - Brand name input
  - Alternate names (comma-separated)
  - Domain input (optional)
□ Create brand API routes
  - POST /api/brands (create)
  - GET /api/brands (list)
  - PUT /api/brands/[id] (update)
  - DELETE /api/brands/[id] (delete)
□ Add competitor management to brand form
  - Add up to 3 competitors
  - Name and domain for each
□ Integrate brand data with simulator

Deliverable: Working brand configuration page

───────────────────────────────────────────────────────────────────────────

DAY 11-12: Testing & Refinement
───────────────────────────────
□ End-to-end testing of simulator flow
□ Fix bugs and edge cases
□ Improve error messages
□ Add loading skeletons
□ Test with various prompts
□ Document any issues for later

Deliverable: Polished, tested Prompt Simulator

═══════════════════════════════════════════════════════════════════════════
END OF WEEK 2 MILESTONE: Prompt Simulator feature complete
═══════════════════════════════════════════════════════════════════════════
```

### 3.3 Week 2 Deliverables Checklist

| # | Deliverable | Status |
|---|-------------|--------|
| 1 | Simulation API working | ⬜ |
| 2 | Mention detection accurate | ⬜ |
| 3 | Sentiment analysis working | ⬜ |
| 4 | Side-by-side comparison UI | ⬜ |
| 5 | Caching system functional | ⬜ |
| 6 | Brand configuration working | ⬜ |

---

## 4. Phase 3: Dashboard & Monitoring (Week 3)

### 4.1 Objectives

- Build visibility dashboard with metrics
- Implement mentions feed
- Create trend charts
- Connect all data sources

### 4.2 Daily Breakdown

```
WEEK 3: DASHBOARD & MONITORING
═══════════════════════════════════════════════════════════════════════════

DAY 13: Visibility Score
────────────────────────
□ Create visibility score API (/api/visibility/score)
  - Calculate from stored simulations
  - Per-system breakdown
  - Overall weighted score
□ Build VisibilityGauge component
  - Circular/semi-circular gauge
  - Score number prominently displayed
  - Trend indicator (▲/▼/─)
□ Build ScoreBreakdown component
  - Per-system scores (ChatGPT/Gemini)
  - Component scores (presence, sentiment, position)

Deliverable: Visibility score calculation and display

───────────────────────────────────────────────────────────────────────────

DAY 14: Dashboard Metrics
─────────────────────────
□ Create dashboard stats API (/api/dashboard/stats)
  - Total mentions
  - Mentions by system
  - Average sentiment
  - Date range filtering
□ Build MetricCard component
  - Large number display
  - Label
  - Trend indicator
□ Build dashboard layout
  - Metric cards row
  - System breakdown section
□ Add date range selector (7d, 30d)

Deliverable: Dashboard with key metrics

───────────────────────────────────────────────────────────────────────────

DAY 15: Trend Charts
────────────────────
□ Create trend data API (/api/visibility/trend)
  - Daily aggregated scores
  - Per-system trends
□ Install and configure Recharts
  $ pnpm add recharts
□ Build TrendChart component
  - Line chart with dates
  - Multiple series (ChatGPT, Gemini)
  - Tooltips on hover
□ Add responsive sizing

Deliverable: Interactive trend visualization

───────────────────────────────────────────────────────────────────────────

DAY 16: Mentions Feed
─────────────────────
□ Create mentions API (/api/mentions)
  - Paginated list
  - Filter by system
  - Filter by sentiment
  - Sort options
□ Build MentionCard component
  - AI system indicator
  - Timestamp
  - Prompt text
  - Response excerpt
  - Sentiment badge
  - Competitor indicators
□ Build mentions list with infinite scroll
□ Add filter UI (dropdowns, chips)

Deliverable: Filterable mentions feed

───────────────────────────────────────────────────────────────────────────

DAY 17-18: Integration & Polish
───────────────────────────────
□ Connect dashboard to all APIs
□ Add loading states throughout
□ Create empty states (no data yet)
□ Test with various data scenarios
□ Add quick action buttons
  - Link to simulator
  - Link to settings
□ Mobile responsiveness testing
□ Fix any visual bugs

Deliverable: Complete, polished dashboard

═══════════════════════════════════════════════════════════════════════════
END OF WEEK 3 MILESTONE: Dashboard and monitoring complete
═══════════════════════════════════════════════════════════════════════════
```

### 4.3 Week 3 Deliverables Checklist

| # | Deliverable | Status |
|---|-------------|--------|
| 1 | Visibility score calculation | ⬜ |
| 2 | Dashboard with metrics | ⬜ |
| 3 | Trend chart working | ⬜ |
| 4 | Mentions feed with filters | ⬜ |
| 5 | Mobile responsive | ⬜ |

---

## 5. Phase 4: Polish & Demo Ready (Week 4)

### 5.1 Objectives

- Build competitor comparison view
- Final UI polish
- Demo preparation
- Testing and bug fixes

### 5.2 Daily Breakdown

```
WEEK 4: POLISH & DEMO READY
═══════════════════════════════════════════════════════════════════════════

DAY 19: Competitor Comparison
─────────────────────────────
□ Create competitor stats API (/api/competitors/stats)
  - Visibility scores for all brands
  - Share of voice calculation
  - Sentiment comparison
  - Head-to-head stats
□ Build comparison table
  - Score columns by system
  - Trend indicators
□ Build ShareOfVoice chart
  - Horizontal bar chart
  - Percentage labels
□ Build SentimentComparison visual

Deliverable: Competitor comparison page

───────────────────────────────────────────────────────────────────────────

DAY 20: UI Polish
─────────────────
□ Audit all pages for visual consistency
□ Add transitions and animations (subtle)
□ Improve loading states (skeletons everywhere)
□ Add toast notifications for actions
□ Improve error messages
□ Add confirmation dialogs where needed
□ Review and fix typography
□ Check color contrast accessibility

Deliverable: Polished, professional-looking UI

───────────────────────────────────────────────────────────────────────────

DAY 21: Demo Data Setup
───────────────────────
□ Create demo seed script (prisma/seed.ts)
  - Demo user account
  - Pre-configured brand
  - 3 competitors
  - 50+ historical simulations
  - Variety of mentions and sentiments
□ Run seed script
  $ npx prisma db seed
□ Create demo login bypass (optional)
□ Test demo data appears correctly
□ Create backup of demo database

Deliverable: Fully populated demo environment

───────────────────────────────────────────────────────────────────────────

DAY 22: Demo Script Rehearsal
─────────────────────────────
□ Write demo script (docs/mvp/DEMO-SCRIPT.md)
  - Opening hook
  - Feature walkthrough
  - Live simulation moments
  - Closing
□ Practice demo end-to-end
□ Identify 3-5 "wow moment" prompts
□ Pre-run and cache wow moment responses
□ Prepare fallback screenshots
□ Time the demo (target: 15-20 min)

Deliverable: Rehearsed demo ready for clients

───────────────────────────────────────────────────────────────────────────

DAY 23: Deployment
──────────────────
□ Create Vercel project
□ Configure environment variables
□ Set up Turso database (production)
□ Run migrations on production
□ Deploy to Vercel
  $ vercel --prod
□ Test production deployment
□ Configure custom domain (if purchased)
□ Test all features on production

Deliverable: Live production deployment

───────────────────────────────────────────────────────────────────────────

DAY 24-25: Final Testing & Buffer
─────────────────────────────────
□ Full end-to-end testing on production
□ Test on multiple browsers
□ Test on mobile devices
□ Fix any critical bugs
□ Document known issues
□ Create backup deployment plan
□ Final demo rehearsal

Deliverable: Demo-ready MVP

═══════════════════════════════════════════════════════════════════════════
END OF WEEK 4 MILESTONE: MVP READY FOR DEMOS! 🎉
═══════════════════════════════════════════════════════════════════════════
```

### 5.3 Week 4 Deliverables Checklist

| # | Deliverable | Status |
|---|-------------|--------|
| 1 | Competitor comparison working | ⬜ |
| 2 | UI polished and consistent | ⬜ |
| 3 | Demo data populated | ⬜ |
| 4 | Demo script written | ⬜ |
| 5 | Production deployment live | ⬜ |
| 6 | All features tested | ⬜ |

---

## 6. Risk Mitigation Timeline

### 6.1 Known Risks and Mitigations

| Risk | Impact | Mitigation | Buffer Days |
|------|--------|------------|-------------|
| AI API changes | High | Abstract providers, have backups | 1 |
| Auth complexity | Medium | Use NextAuth.js defaults | 0.5 |
| UI takes longer | Medium | Use shadcn/ui components | 1 |
| Database issues | Low | SQLite is simple | 0.5 |
| Deployment issues | Medium | Vercel is reliable | 0.5 |
| **Total Buffer** | | | **3.5 days** |

### 6.2 Week 5 Buffer (If Needed)

```
WEEK 5: BUFFER (Optional)
═══════════════════════════════════════════════════════════════════════════

Use only if behind schedule:

□ DAY 26-27: Catch-up on delayed features
□ DAY 28: Extra testing and bug fixes
□ DAY 29: Additional demo preparation
□ DAY 30: Final polish

═══════════════════════════════════════════════════════════════════════════
```

---

## 7. Resource Requirements

### 7.1 Team Size Options

| Team Size | Duration | Notes |
|-----------|----------|-------|
| 1 developer (full-time) | 5 weeks | Recommended for MVP |
| 1 developer (part-time) | 8-10 weeks | Evenings/weekends |
| 2 developers | 2.5-3 weeks | Faster but coordination overhead |

### 7.2 Skills Required

| Skill | Level | Notes |
|-------|-------|-------|
| TypeScript | Intermediate | Required |
| Next.js | Intermediate | App Router experience helpful |
| React | Intermediate | Hooks, state management |
| Prisma/SQL | Basic | Simple queries |
| Tailwind CSS | Basic | Copy-paste from shadcn/ui |
| API integration | Intermediate | REST, async/await |

---

## 8. Success Metrics

### 8.1 Timeline Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| On-time completion | Week 4 or 5 | Demo-ready by end |
| Feature completion | 100% MVP scope | All 5 features working |
| Bug count at demo | < 3 critical | Testing phase |
| Demo success rate | 100% | No crashes during demo |

### 8.2 Post-MVP Checkpoints

| Checkpoint | Timing | Decision |
|------------|--------|----------|
| First demo feedback | Week 5-6 | Iterate or proceed? |
| First customer interest | Week 6-8 | Invest more? |
| First paying customer | Week 8-12 | Scale infrastructure? |

---

## 9. Implementation Checklist

### 9.1 Complete Checklist

```
PRE-DEVELOPMENT
───────────────
□ Set up development environment
□ Create GitHub repository
□ Get Google AI Studio API key
□ Get GitHub Personal Access Token
□ Register Vercel account
□ Create Turso account

WEEK 1: FOUNDATION
──────────────────
□ Day 1: Project setup
□ Day 2: Database schema
□ Day 3: Authentication
□ Day 4: Layout & navigation
□ Day 5: AI provider integration

WEEK 2: CORE FEATURES
─────────────────────
□ Day 6: Simulator backend
□ Day 7: Simulator frontend (part 1)
□ Day 8: Simulator frontend (part 2)
□ Day 9: Caching system
□ Day 10: Brand configuration
□ Day 11-12: Testing & refinement

WEEK 3: DASHBOARD & MONITORING
──────────────────────────────
□ Day 13: Visibility score
□ Day 14: Dashboard metrics
□ Day 15: Trend charts
□ Day 16: Mentions feed
□ Day 17-18: Integration & polish

WEEK 4: POLISH & DEMO READY
───────────────────────────
□ Day 19: Competitor comparison
□ Day 20: UI polish
□ Day 21: Demo data setup
□ Day 22: Demo script rehearsal
□ Day 23: Deployment
□ Day 24-25: Final testing & buffer

POST-MVP
────────
□ Schedule first demo
□ Collect feedback
□ Iterate based on feedback
□ Plan next phase
```

---

*This timeline provides a realistic 4-5 week path to a demo-ready MVP. Stick to the scope, avoid feature creep, and focus on the demo experience.*
