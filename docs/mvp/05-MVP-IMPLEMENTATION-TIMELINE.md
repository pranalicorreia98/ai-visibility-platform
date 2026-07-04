# MVP Implementation Timeline

## Document Information

| Field | Value |
|-------|-------|
| Version | 2.0.0 |
| Status | Updated |
| Created | 2026-07-02 |
| Updated | 2026-07-04 |
| Total Duration | 5-6 weeks |
| New Features | Recommendations, Backreferences, PDF/Email Reports |

---

## 1. Timeline Overview

### 1.1 High-Level Schedule

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    MVP IMPLEMENTATION TIMELINE (UPDATED)                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  WEEK 1        WEEK 2        WEEK 3        WEEK 4        WEEK 5        WEEK 6   │
│  ──────        ──────        ──────        ──────        ──────        ──────   │
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │ PHASE 1: Foundation                                                        │ │
│  │ Project setup, auth, database, AI integration                              │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                  │
│               ┌────────────────────────────────────────────────────────────────┐│
│               │ PHASE 2: Core Features                                         ││
│               │ Prompt Simulator, Brand Config, Mentions                       ││
│               └────────────────────────────────────────────────────────────────┘│
│                                                                                  │
│                            ┌───────────────────────────────────────────────────┐│
│                            │ PHASE 3: Dashboard & Competitors                  ││
│                            │ Visibility Dashboard, Competitor View             ││
│                            └───────────────────────────────────────────────────┘│
│                                                                                  │
│                                         ┌──────────────────────────────────────┐│
│                                         │ PHASE 4: Recommendations (NEW)       ││
│                                         │ Playbook, Backreferences, Timelines  ││
│                                         └──────────────────────────────────────┘│
│                                                                                  │
│                                                      ┌─────────────────────────┐│
│                                                      │ PHASE 5: Reports (NEW)  ││
│                                                      │ PDF, Email, Polish, Demo││
│                                                      └─────────────────────────┘│
│                                                                                  │
│  ●──────────●──────────●──────────●──────────●──────────●──────────●           │
│  Start     W1        W2        W3        W4        W5        Demo Ready        │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Effort Estimates (Updated)

| Phase | Duration | Developer Days | Effort |
|-------|----------|----------------|--------|
| Phase 1: Foundation | 5 days | 5 | 17% |
| Phase 2: Core Features | 6 days | 6 | 20% |
| Phase 3: Dashboard & Competitors | 5 days | 5 | 17% |
| **Phase 4: Recommendations (NEW)** | 5 days | 5 | 17% |
| **Phase 5: Reports & Polish (NEW)** | 6 days | 6 | 20% |
| Buffer | 3 days | 3 | 9% |
| **TOTAL** | **30 days (~6 weeks)** | **30** | **100%** |

### 1.3 New Features Added

| Feature | Phase | Days | Priority |
|---------|-------|------|----------|
| Recommendations Engine | Phase 4 | 3 | P0 |
| Backreference Checklist | Phase 4 | 2 | P0 |
| PDF Report Generation | Phase 5 | 2 | P0 |
| Email Reports | Phase 5 | 2 | P1 |
| Improvement Timelines | Phase 4 | Included | P0 |

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

## 5. Phase 4: Recommendations Engine (Week 4) - NEW

### 5.1 Objectives

- Build recommendations engine with actionable playbook
- Create backreference checklist
- Add improvement timeline estimates
- Competitor comparison view

### 5.2 Daily Breakdown

```
WEEK 4: RECOMMENDATIONS ENGINE (NEW)
═══════════════════════════════════════════════════════════════════════════

DAY 19: Recommendations Backend
───────────────────────────────
□ Create recommendation data model and migrations
□ Build recommendation generator logic (lib/recommendations/)
  - Rule-based recommendation engine
  - Priority scoring (High/Medium/Low)
  - Effort and timeline estimates
  - Competitor gap detection
□ Create recommendations API routes
  - GET /api/recommendations
  - POST /api/recommendations/generate
  - PUT /api/recommendations/[id]/complete
□ Build recommendation templates (25+ pre-built)

Deliverable: Working recommendations API

───────────────────────────────────────────────────────────────────────────

DAY 20: Recommendations Frontend
────────────────────────────────
□ Build RecommendationCard component
  - Priority badge (High/Medium/Low)
  - Effort and timeline display
  - Expected impact
  - Action buttons
  - Competitor gap context
□ Build RecommendationList component
  - Grouped by priority
  - Progress tracking
  - Projected score display
□ Build Recommendations page (/recommendations)
□ Add "Top Action" to dashboard

Deliverable: Recommendations UI complete

───────────────────────────────────────────────────────────────────────────

DAY 21: Backreference Checklist
───────────────────────────────
□ Create backreference status model
□ Build platform presence data (25 core + India-specific)
  - Platform name, tier, priority
  - Claim URLs
  - Competitor presence data
□ Create backreference API routes
  - GET /api/backreferences
  - PUT /api/backreferences/[id]/claim
□ Build PlatformChecklist component
  - Tier grouping (Foundation, Reviews, Community, PR, India)
  - Status indicators (✅/❌)
  - Priority badges
  - Competitor comparison

Deliverable: Backreference checklist complete

───────────────────────────────────────────────────────────────────────────

DAY 22: Competitor Comparison
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

DAY 23: Integration & Testing
─────────────────────────────
□ Connect recommendations to visibility data
□ Test recommendation generation with various scenarios
□ Add recommendations to dashboard widgets
□ Link recommendations from mentions/simulator
□ Fix any bugs

Deliverable: Fully integrated recommendations

═══════════════════════════════════════════════════════════════════════════
END OF WEEK 4 MILESTONE: Recommendations & Backreferences complete
═══════════════════════════════════════════════════════════════════════════
```

### 5.3 Week 4 Deliverables Checklist

| # | Deliverable | Status |
|---|-------------|--------|
| 1 | Recommendations API working | ⬜ |
| 2 | Recommendations UI complete | ⬜ |
| 3 | Backreference checklist working | ⬜ |
| 4 | Competitor comparison working | ⬜ |
| 5 | Improvement timelines displayed | ⬜ |

---

## 6. Phase 5: Reports & Demo Ready (Week 5) - NEW

### 6.1 Objectives

- Build PDF report generation
- Implement email reports
- Final UI polish
- Demo preparation
- Testing and deployment

### 6.2 Daily Breakdown

```
WEEK 5: REPORTS & DEMO READY (NEW)
═══════════════════════════════════════════════════════════════════════════

DAY 24: PDF Report Generation
─────────────────────────────
□ Install PDF dependencies (puppeteer-core, @sparticuz/chromium)
□ Create report HTML template (lib/pdf/report-template.ts)
  - Executive summary page
  - Visibility analysis page
  - Recommendations page
  - Backreference checklist page
□ Build PDF generation API (/api/reports/generate)
□ Create "Download PDF" button on dashboard
□ Test PDF generation and formatting

Deliverable: Working PDF report download

───────────────────────────────────────────────────────────────────────────

DAY 25: Email Reports Setup
───────────────────────────
□ Set up Resend account and API key
□ Create email templates (lib/email/templates/)
  - Weekly summary email
  - Monthly report email (with PDF attachment)
□ Build email preferences UI (/settings/email)
□ Create email API routes
  - GET/PUT /api/email/preferences
  - POST /api/email/send-test
□ Test email sending

Deliverable: Email preferences and test emails working

───────────────────────────────────────────────────────────────────────────

DAY 26: Cron Jobs & Automation
──────────────────────────────
□ Configure Vercel Cron jobs
  - Weekly reports (Monday 9am IST)
  - Monthly reports (1st of month)
□ Build cron handler APIs
  - /api/cron/weekly-reports
  - /api/cron/monthly-reports
□ Add cron secret verification
□ Test cron job execution

Deliverable: Automated email reports working

───────────────────────────────────────────────────────────────────────────

DAY 27: UI Polish & Demo Data
─────────────────────────────
□ Audit all pages for visual consistency
□ Add loading states and skeletons
□ Improve error messages
□ Create demo seed script with recommendations
  - Demo user account
  - Pre-configured brand with 5 competitors
  - 100+ historical simulations
  - Pre-generated recommendations
  - Backreference statuses
□ Run seed script and verify

Deliverable: Polished UI + demo environment

───────────────────────────────────────────────────────────────────────────

DAY 28: Deployment
──────────────────
□ Create Vercel project
□ Configure environment variables
  - Database, Auth, AI APIs
  - Resend API key
  - Cron secret
□ Set up Turso database (production)
□ Run migrations on production
□ Deploy to Vercel
□ Test all features on production
□ Configure custom domain (if ready)

Deliverable: Live production deployment

───────────────────────────────────────────────────────────────────────────

DAY 29-30: Demo Prep & Buffer
─────────────────────────────
□ Write demo script (docs/mvp/DEMO-SCRIPT.md)
  - Opening hook with recommendations preview
  - Simulator walkthrough
  - Dashboard + recommendations demo
  - Backreference checklist reveal
  - PDF download moment
  - Email preview
□ Practice demo end-to-end
□ Pre-run and cache demo responses
□ Prepare fallback screenshots
□ Time the demo (target: 20-25 min)
□ Final bug fixes

Deliverable: Demo-ready MVP with recommendations!

═══════════════════════════════════════════════════════════════════════════
END OF WEEK 5 MILESTONE: MVP READY WITH FULL RECOMMENDATIONS! 🎉
═══════════════════════════════════════════════════════════════════════════
```

### 6.3 Week 5 Deliverables Checklist

| # | Deliverable | Status |
|---|-------------|--------|
| 1 | PDF report generation working | ⬜ |
| 2 | Email preferences UI | ⬜ |
| 3 | Weekly email sending | ⬜ |
| 4 | Cron jobs configured | ⬜ |
| 5 | Production deployment live | ⬜ |
| 6 | Demo script rehearsed | ⬜ |

---

## 7. Phase 6: Buffer Week (Week 6) - If Needed

```
WEEK 6: BUFFER (Optional)
═══════════════════════════════════════════════════════════════════════════

Use only if behind schedule:

□ DAY 31-32: Catch-up on delayed features
□ DAY 33: Extra testing and bug fixes
□ DAY 34: Additional demo preparation
□ DAY 35: Final polish and launch

═══════════════════════════════════════════════════════════════════════════
```

---

## 8. Legacy: Original Phase 4 (Now Merged)

Note: The original Phase 4 tasks (competitor comparison, UI polish, demo setup) have been distributed across the new Phase 4 and Phase 5 to accommodate the new recommendation features.

### Original DAY 23: Deployment (Now DAY 28)
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
