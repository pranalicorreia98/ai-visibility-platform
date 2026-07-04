# MVP Feature Specifications

## Document Information

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Draft |
| Created | 2026-07-02 |
| AI Systems | ChatGPT + Gemini Only |

---

## 1. Feature Overview

### 1.1 MVP Feature Matrix

| Feature | Original Priority | MVP Status | Notes |
|---------|------------------|------------|-------|
| Prompt Simulator | P0 | **INCLUDED** | Hero feature |
| Visibility Dashboard | P0 | **INCLUDED** | Simplified |
| Visibility Score | P0 | **INCLUDED** | 2 systems only |
| Brand Monitoring | P0 | **INCLUDED** | Basic version |
| Competitor View | P0 | **INCLUDED** | Up to 5 competitors |
| **Recommendations Engine** | P0 | **NEW - INCLUDED** | Actionable improvement playbook |
| **Backreference Checklist** | P0 | **NEW - INCLUDED** | Platform presence tracker |
| **PDF Reports** | P0 | **NEW - INCLUDED** | Downloadable reports |
| **Email Reports** | P1 | **NEW - INCLUDED** | Weekly summary emails |
| **Improvement Timeline** | P0 | **NEW - INCLUDED** | Expected results timeline |
| Citation Tracking | P0 | DEFERRED | Complex extraction |
| AI Search Analytics | P1 | DEFERRED | Needs web analytics |
| AI Reputation Monitoring | P0 | PARTIAL | Basic sentiment only |
| Content Optimizer | P0 | DEFERRED | Needs crawling |
| GEO Auditor | P1 | DEFERRED | Needs infrastructure |
| Auto-Fix Engine | P1 | DEFERRED | Needs CMS integration |
| API Access | P0 | DEFERRED | Internal API only |
| Multi-tenant | P0 | DEFERRED | Single workspace |

---

## 2. Feature 1: Prompt Simulator

### 2.1 Overview

The Prompt Simulator is the **hero feature** of the MVP. It allows users to enter any prompt and instantly see how ChatGPT and Gemini respond, with automated analysis of brand mentions.

### 2.2 User Interface

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PROMPT SIMULATOR                                        [Daily Quota: 15/20]│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  What are the best project management tools for small businesses?      │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ☑ ChatGPT (GPT-4o)    ☑ Google Gemini                                     │
│                                                                              │
│  Analyzing for brand: [Acme Software ▼]                                     │
│                                                                              │
│  [🚀 Run Simulation]                                                        │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────┐ ┌─────────────────────────────────┐   │
│  │  ChatGPT                    #2  │ │  Gemini                     #4  │   │
│  │  ─────────────────────────────  │ │  ─────────────────────────────  │   │
│  │                                 │ │                                 │   │
│  │  Here are some excellent       │ │  For small businesses looking  │   │
│  │  project management tools:     │ │  for project management:       │   │
│  │                                 │ │                                 │   │
│  │  1. Asana - Great for teams    │ │  1. Monday.com - Visual and    │   │
│  │  2. [ACME SOFTWARE] - Offers   │ │     intuitive interface        │   │
│  │     comprehensive features     │ │  2. Trello - Kanban-style      │   │
│  │  3. Monday.com - Visual...     │ │  3. Asana - Task management    │   │
│  │  4. Trello - Simple Kanban...  │ │  4. [ACME SOFTWARE] - Good     │   │
│  │                                 │ │     for smaller teams          │   │
│  │  ─────────────────────────────  │ │  ─────────────────────────────  │   │
│  │  ✓ Brand Mentioned             │ │  ✓ Brand Mentioned             │   │
│  │  😊 Sentiment: Positive (+0.7) │ │  😐 Sentiment: Neutral (+0.3)  │   │
│  │  📍 Position: #2               │ │  📍 Position: #4               │   │
│  │  ─────────────────────────────  │ │  ─────────────────────────────  │   │
│  │  Competitors found:            │ │  Competitors found:            │   │
│  │  • Asana (mentioned #1)        │ │  • Monday.com (#1)             │   │
│  │  • Monday.com (#3)             │ │  • Asana (#3)                  │   │
│  └─────────────────────────────────┘ └─────────────────────────────────┘   │
│                                                                              │
│  ANALYSIS SUMMARY                                                           │
│  ─────────────────                                                          │
│  • You appear in 2/2 AI systems                                             │
│  • Average position: #3                                                     │
│  • Average sentiment: +0.5 (Positive)                                       │
│  • Top competitor: Asana (appears #1 in 1/2 systems)                        │
│                                                                              │
│  [💾 Save Results]  [📊 Add to Monitoring]  [📤 Export]                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Requirements

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| SIM-001 | Text input for prompt (max 500 chars) | P0 | |
| SIM-002 | Select AI systems (ChatGPT, Gemini) | P0 | Both selected by default |
| SIM-003 | Select brand to analyze | P0 | From configured brands |
| SIM-004 | Call selected AI APIs | P0 | Parallel calls |
| SIM-005 | Display responses side-by-side | P0 | |
| SIM-006 | Highlight brand mentions | P0 | Yellow highlight |
| SIM-007 | Highlight competitor mentions | P0 | Red highlight |
| SIM-008 | Show brand position/ranking | P0 | If list format detected |
| SIM-009 | Calculate sentiment score | P0 | -1 to +1 |
| SIM-010 | Show daily quota remaining | P0 | Rate limit awareness |
| SIM-011 | Save simulation results | P1 | To database |
| SIM-012 | Loading states | P0 | Skeleton/spinner |
| SIM-013 | Error handling | P0 | API failures, rate limits |

### 2.4 Analysis Logic

```typescript
// Mention Detection
function detectMentions(response: string, brand: Brand): Mention[] {
  const mentions: Mention[] = [];
  const brandTerms = [brand.name, ...(brand.alternateNames || [])];

  for (const term of brandTerms) {
    const regex = new RegExp(term, 'gi');
    let match;
    while ((match = regex.exec(response)) !== null) {
      mentions.push({
        term: match[0],
        position: match.index,
        context: response.slice(
          Math.max(0, match.index - 50),
          Math.min(response.length, match.index + term.length + 50)
        ),
      });
    }
  }

  return mentions;
}

// Position Detection (for ranked lists)
function detectPosition(response: string, brandName: string): number | null {
  // Look for numbered list patterns
  const lines = response.split('\n');
  const listPattern = /^(\d+)[.)\-]\s*(.+)/;

  for (const line of lines) {
    const match = line.match(listPattern);
    if (match && line.toLowerCase().includes(brandName.toLowerCase())) {
      return parseInt(match[1]);
    }
  }

  return null;
}

// Sentiment Analysis (simplified)
function analyzeSentiment(response: string, brandName: string): number {
  // Extract sentences containing brand
  const sentences = response.split(/[.!?]+/);
  const brandSentences = sentences.filter(s =>
    s.toLowerCase().includes(brandName.toLowerCase())
  );

  if (brandSentences.length === 0) return 0;

  // Simple keyword-based sentiment
  const positiveWords = [
    'great', 'excellent', 'best', 'top', 'leading', 'recommended',
    'powerful', 'comprehensive', 'innovative', 'reliable', 'trusted'
  ];
  const negativeWords = [
    'poor', 'worst', 'avoid', 'limited', 'expensive', 'complicated',
    'outdated', 'issues', 'problems', 'lacks', 'missing'
  ];

  let score = 0;
  for (const sentence of brandSentences) {
    const lower = sentence.toLowerCase();
    for (const word of positiveWords) {
      if (lower.includes(word)) score += 0.2;
    }
    for (const word of negativeWords) {
      if (lower.includes(word)) score -= 0.2;
    }
  }

  return Math.max(-1, Math.min(1, score)); // Clamp to [-1, 1]
}
```

---

## 3. Feature 2: Visibility Dashboard

### 3.1 Overview

The dashboard provides an at-a-glance view of brand visibility across ChatGPT and Gemini, with key metrics and trends.

### 3.2 User Interface

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  AI VISIBILITY DASHBOARD                               [Last 7 Days ▼]      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐               │
│  │  VISIBILITY     │ │  MENTIONS       │ │  SENTIMENT      │               │
│  │  SCORE          │ │  THIS PERIOD    │ │  SCORE          │               │
│  │     68/100      │ │      24         │ │    +0.65        │               │
│  │    ▲ +3         │ │    ▲ +8         │ │    ▲ +0.12      │               │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘               │
│                                                                              │
│  VISIBILITY BY AI SYSTEM                                                    │
│  ───────────────────────                                                    │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                                                                    │    │
│  │  ChatGPT    ████████████████████░░░░░░░░  72/100   ▲ +5           │    │
│  │  Gemini     ██████████████████░░░░░░░░░░  64/100   ▲ +1           │    │
│  │                                                                    │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  VISIBILITY TREND (7 Days)                                                  │
│  ─────────────────────────                                                  │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  100│                                                              │    │
│  │   80│                    ╭──────╮                 ╭───────        │    │
│  │   60│    ╭───────────────╯      ╰────────────────╯                │    │
│  │   40│────╯                                                         │    │
│  │   20│                                                              │    │
│  │    0└──────────────────────────────────────────────────────────    │    │
│  │      Jun 25     Jun 27     Jun 29     Jul 1      Jul 2             │    │
│  │                                                                    │    │
│  │      ─── ChatGPT    ─ ─ Gemini                                    │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌────────────────────────────────┐ ┌──────────────────────────────────┐   │
│  │  RECENT MENTIONS               │ │  QUICK ACTIONS                   │   │
│  │  ───────────────               │ │  ─────────────                   │   │
│  │                                │ │                                  │   │
│  │  ● ChatGPT • 2h ago           │ │  [🔍 Run Simulation]             │   │
│  │    "Acme Software offers..."  │ │                                  │   │
│  │    😊 Positive                │ │  [📊 View All Mentions]          │   │
│  │                                │ │                                  │   │
│  │  ● Gemini • 5h ago            │ │  [👥 Compare Competitors]        │   │
│  │    "For project management,   │ │                                  │   │
│  │     consider Acme..."         │ │  [⚙️ Configure Brand]            │   │
│  │    😐 Neutral                 │ │                                  │   │
│  │                                │ │                                  │   │
│  │  [View All →]                 │ │                                  │   │
│  └────────────────────────────────┘ └──────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Requirements

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| DASH-001 | Display aggregate visibility score | P0 | Weighted avg of systems |
| DASH-002 | Show score breakdown by AI system | P0 | ChatGPT + Gemini |
| DASH-003 | Display mention count with trend | P0 | |
| DASH-004 | Show sentiment score with trend | P0 | |
| DASH-005 | Trend chart (7/30 days) | P0 | Recharts line chart |
| DASH-006 | Recent mentions feed | P0 | Last 5-10 |
| DASH-007 | Date range selector | P0 | 7d, 30d options |
| DASH-008 | Quick action buttons | P1 | Links to other features |
| DASH-009 | Loading states | P0 | |
| DASH-010 | Empty states | P0 | When no data |

### 3.4 Visibility Score Calculation (Simplified for MVP)

```typescript
interface VisibilityScoreInput {
  mentions: Mention[];
  totalSimulations: number;
}

function calculateVisibilityScore(
  chatgptData: VisibilityScoreInput,
  geminiData: VisibilityScoreInput
): VisibilityScore {
  // Presence: How often mentioned (0-100)
  const chatgptPresence = chatgptData.totalSimulations > 0
    ? (chatgptData.mentions.length / chatgptData.totalSimulations) * 100
    : 0;
  const geminiPresence = geminiData.totalSimulations > 0
    ? (geminiData.mentions.length / geminiData.totalSimulations) * 100
    : 0;

  // Position: Average ranking position (0-100, lower position = higher score)
  const chatgptPositionScore = calculatePositionScore(chatgptData.mentions);
  const geminiPositionScore = calculatePositionScore(geminiData.mentions);

  // Sentiment: Average sentiment (-1 to 1 → 0 to 100)
  const chatgptSentimentScore = calculateSentimentScore(chatgptData.mentions);
  const geminiSentimentScore = calculateSentimentScore(geminiData.mentions);

  // Per-system scores
  const chatgptScore = Math.round(
    chatgptPresence * 0.4 +
    chatgptPositionScore * 0.35 +
    chatgptSentimentScore * 0.25
  );

  const geminiScore = Math.round(
    geminiPresence * 0.4 +
    geminiPositionScore * 0.35 +
    geminiSentimentScore * 0.25
  );

  // Overall: Weighted average (can weight systems differently)
  const overall = Math.round((chatgptScore + geminiScore) / 2);

  return {
    overall,
    chatgpt: chatgptScore,
    gemini: geminiScore,
    breakdown: {
      presence: Math.round((chatgptPresence + geminiPresence) / 2),
      position: Math.round((chatgptPositionScore + geminiPositionScore) / 2),
      sentiment: Math.round((chatgptSentimentScore + geminiSentimentScore) / 2),
    }
  };
}
```

---

## 4. Feature 3: Brand Monitoring

### 4.1 Overview

Configure brand details and view all captured mentions with filtering and analysis.

### 4.2 User Interface - Configuration

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  BRAND CONFIGURATION                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  BRAND DETAILS                                                               │
│  ─────────────                                                               │
│                                                                              │
│  Brand Name *                                                                │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  Acme Software                                                         │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Alternative Names (comma-separated)                                         │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  Acme, ACME, Acme PM, Acme Project Management                          │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│  ℹ️ We'll search for all these variations in AI responses                   │
│                                                                              │
│  Website Domain (optional)                                                   │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  acmesoftware.com                                                      │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  COMPETITORS (Up to 3)                                                       │
│  ─────────────────────                                                       │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────┐ [Remove]       │
│  │  Asana                                     asana.com    │               │
│  └─────────────────────────────────────────────────────────┘               │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────┐ [Remove]       │
│  │  Monday.com                             monday.com      │               │
│  └─────────────────────────────────────────────────────────┘               │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────┐ [Remove]       │
│  │  Trello                                   trello.com    │               │
│  └─────────────────────────────────────────────────────────┘               │
│                                                                              │
│  [+ Add Competitor]                                                          │
│                                                                              │
│                                                   [Cancel]  [Save Brand]    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 User Interface - Mentions View

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  BRAND MENTIONS                                              [Last 7 Days ▼]│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                           │
│  │     24      │ │     15      │ │      9      │                           │
│  │   Total     │ │   ChatGPT   │ │   Gemini    │                           │
│  └─────────────┘ └─────────────┘ └─────────────┘                           │
│                                                                              │
│  FILTERS                                                                     │
│  ───────                                                                     │
│  AI System: [All ▼]  Sentiment: [All ▼]  Sort: [Newest First ▼]            │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  ● ChatGPT                                              2 hours ago    │ │
│  │  ──────────────────────────────────────────────────────────────────── │ │
│  │  Prompt: "What are the best project management tools for startups?"   │ │
│  │                                                                        │ │
│  │  Response (excerpt):                                                   │ │
│  │  "...2. [ACME SOFTWARE] is an excellent choice for startups because  │ │
│  │   it offers comprehensive features at a competitive price point..."   │ │
│  │                                                                        │ │
│  │  😊 Positive (+0.72)    📍 Position #2    Competitors: Asana, Monday  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  ● Gemini                                               5 hours ago    │ │
│  │  ──────────────────────────────────────────────────────────────────── │ │
│  │  Prompt: "Compare Acme Software to Asana"                             │ │
│  │                                                                        │ │
│  │  Response (excerpt):                                                   │ │
│  │  "[ACME SOFTWARE] and Asana are both solid project management tools.  │ │
│  │   Acme tends to be more affordable while Asana has more integrations" │ │
│  │                                                                        │ │
│  │  😐 Neutral (+0.15)     📍 N/A            Competitors: Asana          │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  [Load More...]                                                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.4 Requirements

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| BM-001 | Configure brand name | P0 | |
| BM-002 | Configure alternate names | P0 | Comma-separated |
| BM-003 | Configure domain (optional) | P1 | |
| BM-004 | Add up to 3 competitors | P0 | MVP limit |
| BM-005 | List all mentions | P0 | Paginated |
| BM-006 | Filter by AI system | P0 | |
| BM-007 | Filter by sentiment | P0 | Positive/Neutral/Negative |
| BM-008 | Sort mentions | P0 | Newest/Oldest |
| BM-009 | Show mention details | P0 | Prompt, response excerpt, analysis |
| BM-010 | Mention count summary | P0 | Total, by system |

---

## 5. Feature 4: Competitor Comparison

### 5.1 Overview

Compare your brand's AI visibility against configured competitors.

### 5.2 User Interface

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  COMPETITOR COMPARISON                                   [Last 7 Days ▼]    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  VISIBILITY SCORES                                                           │
│  ─────────────────                                                           │
│                                                                              │
│  Brand              Overall    ChatGPT    Gemini     Trend                  │
│  ─────────────────────────────────────────────────────────────────────────  │
│  🏢 Acme Software      68        72        64       ▲ +3                    │
│  🔴 Asana              74        78        70       ▲ +1                    │
│  🔴 Monday.com         71        69        73       ▼ -2                    │
│  🔴 Trello             62        65        59       ─  0                    │
│                                                                              │
│  SHARE OF VOICE                                                              │
│  ──────────────                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                        │ │
│  │  Asana        █████████████████████████████░░░░░░░░░░  32%            │ │
│  │  Monday.com   ██████████████████████████░░░░░░░░░░░░░  28%            │ │
│  │  Acme         █████████████████████░░░░░░░░░░░░░░░░░░  23%  (You)     │ │
│  │  Trello       ███████████████░░░░░░░░░░░░░░░░░░░░░░░░  17%            │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│  ℹ️ Based on 47 simulations where at least one brand was mentioned          │
│                                                                              │
│  SENTIMENT COMPARISON                                                        │
│  ────────────────────                                                        │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                        │ │
│  │    Acme        ───────────────●───────────         +0.65              │ │
│  │    Asana       ──────────────●────────────         +0.58              │ │
│  │    Monday      ────────────●──────────────         +0.42              │ │
│  │    Trello      ──────────●────────────────         +0.35              │ │
│  │                                                                        │ │
│  │               -1.0        0        +1.0                               │ │
│  │              Negative   Neutral   Positive                            │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  HEAD-TO-HEAD                                                                │
│  ────────────                                                                │
│                                                                              │
│  When mentioned together in the same response:                               │
│                                                                              │
│  • Acme vs Asana: You rank higher 40% of the time                           │
│  • Acme vs Monday.com: You rank higher 55% of the time                      │
│  • Acme vs Trello: You rank higher 67% of the time                          │
│                                                                              │
│  [📊 Run Comparison Simulation]                                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Requirements

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| CC-001 | Show visibility scores table | P0 | All configured brands |
| CC-002 | Show score by AI system | P0 | ChatGPT + Gemini columns |
| CC-003 | Calculate share of voice | P0 | % of mentions |
| CC-004 | Sentiment comparison chart | P1 | Visual comparison |
| CC-005 | Head-to-head stats | P1 | When mentioned together |
| CC-006 | Date range filter | P0 | |
| CC-007 | Link to run comparison simulation | P1 | Quick action |

---

## 6. Feature 5: Authentication

### 6.1 Overview

Simple authentication for demo purposes using NextAuth.js.

### 6.2 Authentication Options (MVP)

| Method | Implementation | Notes |
|--------|----------------|-------|
| **Google OAuth** | NextAuth.js | Recommended - fast signup |
| **Magic Link** | NextAuth.js + Resend | Email-based, no password |
| **Demo Mode** | Bypass auth | For live demos |

### 6.3 User Interface - Login

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│                        ┌─────────────────────────┐                          │
│                        │     AI Visibility       │                          │
│                        │       Platform          │                          │
│                        └─────────────────────────┘                          │
│                                                                              │
│                   Monitor your brand across AI systems                       │
│                                                                              │
│                        ┌───────────────────────┐                            │
│                        │  Continue with Google │                            │
│                        └───────────────────────┘                            │
│                                                                              │
│                                 ─ or ─                                       │
│                                                                              │
│                        ┌───────────────────────┐                            │
│                        │  Sign in with Email   │                            │
│                        └───────────────────────┘                            │
│                                                                              │
│                                                                              │
│          By signing in, you agree to our Terms of Service.                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.4 Requirements

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| AUTH-001 | Google OAuth login | P0 | Primary method |
| AUTH-002 | Session management | P0 | NextAuth handles |
| AUTH-003 | Protected routes | P0 | Redirect to login |
| AUTH-004 | User profile storage | P0 | Basic info only |
| AUTH-005 | Logout functionality | P0 | |
| AUTH-006 | Demo bypass mode | P1 | For live demos |

---

## 7. Data Models Summary

### 7.1 Core Entities

```typescript
// User
interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  createdAt: Date;
}

// Brand
interface Brand {
  id: string;
  userId: string;
  name: string;
  domain?: string;
  alternateNames: string[];
  competitors: Competitor[];
  createdAt: Date;
}

// Competitor
interface Competitor {
  id: string;
  brandId: string;
  name: string;
  domain?: string;
}

// Simulation
interface Simulation {
  id: string;
  userId: string;
  brandId?: string;
  prompt: string;
  chatgptResponse?: string;
  geminiResponse?: string;
  analysis: SimulationAnalysis;
  createdAt: Date;
}

// SimulationAnalysis
interface SimulationAnalysis {
  chatgpt?: {
    mentions: Mention[];
    sentiment: number;
    position?: number;
  };
  gemini?: {
    mentions: Mention[];
    sentiment: number;
    position?: number;
  };
}

// Mention
interface Mention {
  id: string;
  brandId: string;
  simulationId: string;
  aiSystem: 'chatgpt' | 'gemini';
  prompt: string;
  response: string;
  context: string;
  sentiment: number;
  position?: number;
  isCompetitor: boolean;
  competitorName?: string;
  createdAt: Date;
}

// VisibilityScore
interface VisibilityScore {
  overall: number;
  chatgpt: number;
  gemini: number;
  breakdown: {
    presence: number;
    position: number;
    sentiment: number;
  };
  trend: number; // Change from previous period
}
```

---

## 8. UI Components Library

### 8.1 shadcn/ui Components Used

| Component | Usage |
|-----------|-------|
| Card | Response cards, metric cards |
| Button | Actions, navigation |
| Input | Form inputs |
| Badge | Sentiment indicators, positions |
| Table | Comparison tables |
| Select | Dropdowns, filters |
| Skeleton | Loading states |
| Toast | Notifications |
| Dialog | Confirmations |
| Tabs | Section navigation |

### 8.2 Custom Components

| Component | Description |
|-----------|-------------|
| VisibilityGauge | Circular score display |
| TrendChart | Recharts line chart |
| MentionCard | Single mention display |
| ResponseComparison | Side-by-side AI responses |
| SentimentBadge | Colored sentiment indicator |
| PositionBadge | Ranking position display |
| ShareOfVoiceBar | Horizontal bar chart |
| RecommendationCard | Action item with priority/timeline |
| BackreferenceChecklist | Platform presence tracker |
| ImprovementTimeline | Visual timeline component |

---

## 9. Feature 6: Recommendations Engine (NEW)

### 9.1 Overview

The Recommendations Engine transforms our platform from "visibility tracking" to "visibility improvement" by providing actionable, prioritized recommendations with expected timelines.

> **Key Differentiator**: Competitors like Peec.ai show you the problem. We show you the solution.

### 9.2 User Interface

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  IMPROVEMENT RECOMMENDATIONS                           [Generated: Today]    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  YOUR VISIBILITY SCORE: 42/100                                               │
│  Projected score with all actions: 72/100 (+30)                             │
│  Estimated timeline: 6-8 weeks                                               │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  🔴 HIGH PRIORITY                                                            │
│  ═════════════════                                                           │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  1. Claim your G2 profile                                    [⬜ Done] │ │
│  │  ────────────────────────────────────────────────────────────────────  │ │
│  │  Status: Not found on G2                                               │ │
│  │  Competitor gap: All 3 competitors have G2 profiles with 20+ reviews  │ │
│  │                                                                        │ │
│  │  ⏱ Effort: 2 hours        📅 Results in: 2-3 weeks                    │ │
│  │  📈 Expected impact: +5-8% visibility                                  │ │
│  │                                                                        │ │
│  │  Why: G2 is cited in 23% of ChatGPT responses for your category       │ │
│  │  Action: Visit g2.com/products/new to claim your profile              │ │
│  │                                                                        │ │
│  │  [🔗 Go to G2]  [📚 View Guide]                                       │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  2. Add FAQ section to homepage                              [⬜ Done] │ │
│  │  ────────────────────────────────────────────────────────────────────  │ │
│  │  Status: No FAQ content detected on your website                       │ │
│  │  Competitor gap: 2 of 3 competitors have FAQ sections                  │ │
│  │                                                                        │ │
│  │  ⏱ Effort: 4-6 hours      📅 Results in: 1-2 weeks                    │ │
│  │  📈 Expected impact: +10-15% AI citation rate                          │ │
│  │                                                                        │ │
│  │  Why: FAQ content is cited 30% more often by AI systems               │ │
│  │  Action: Add 6-10 common questions with direct answers                │ │
│  │                                                                        │ │
│  │  [📝 Sample FAQs]  [📚 View Guide]                                    │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  🟡 MEDIUM PRIORITY                                                          │
│  ═══════════════════                                                         │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  3. Get featured on YourStory or Inc42              ⏱ 10-20 hrs       │ │
│  │     📅 Results in: 4-8 weeks  📈 Impact: +10-15%                      │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  4. Start Reddit engagement in r/SaaS               ⏱ 2 hrs/week      │ │
│  │     📅 Results in: 4-8 weeks  📈 Impact: +8-12%                       │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  🟢 QUICK WINS (Do Today)                                                    │
│  ═════════════════════════                                                   │
│                                                                              │
│  ☐ Complete LinkedIn company page About section (1 hr, +3%)                 │
│  ☐ Add Organization schema to website (2 hrs, +2%)                          │
│  ☐ Update meta descriptions with direct answers (2 hrs, +2%)               │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  [📥 Download PDF Report]  [📧 Email Me Weekly Updates]                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 9.3 Requirements

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| REC-001 | Generate prioritized recommendations | P0 | High/Medium/Low |
| REC-002 | Show effort estimate per action | P0 | Hours/ongoing |
| REC-003 | Show timeline to results | P0 | Days/weeks |
| REC-004 | Show expected impact | P0 | % improvement |
| REC-005 | Show competitor gap context | P0 | "Competitors have X" |
| REC-006 | Mark recommendations as done | P1 | Progress tracking |
| REC-007 | Link to guides/resources | P1 | How-to content |
| REC-008 | Calculate projected score | P0 | If all actions done |

### 9.4 Recommendation Categories

| Category | Examples |
|----------|----------|
| **Entity Presence** | G2, LinkedIn, Crunchbase, Google Business |
| **Content Structure** | FAQ sections, comparison pages, listicles |
| **Authority Building** | Reviews, PR coverage, backlinks |
| **Technical SEO** | Schema markup, meta descriptions |
| **Community** | Reddit, Quora, forums |

---

## 10. Feature 7: Backreference Checklist (NEW)

### 10.1 Overview

A visual checklist showing which platforms the brand is present on vs. missing, with priority ranking for acquisition.

### 10.2 User Interface

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  BACKREFERENCE CHECKLIST                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  YOUR PRESENCE: 8/25 platforms (32%)                                        │
│  Competitor average: 15/25 platforms (60%)                                  │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  TIER 1: ENTITY FOUNDATION (Must Have)                                      │
│  ══════════════════════════════════════                                     │
│                                                                              │
│  ✅ Google Business Profile          Claimed, 4.2★ (12 reviews)             │
│  ✅ LinkedIn Company Page             Complete, 500 followers                │
│  ❌ Crunchbase                        NOT FOUND - Priority: HIGH            │
│  ❌ Wikipedia                         NOT FOUND - Priority: LOW (hard)      │
│                                                                              │
│  TIER 2: REVIEW PLATFORMS                                                    │
│  ═════════════════════════                                                  │
│                                                                              │
│  ❌ G2                                NOT FOUND - Priority: HIGH            │
│     ↳ Competitor "Asana" has 2,500+ reviews                                │
│  ❌ Capterra                          NOT FOUND - Priority: HIGH            │
│  ✅ Trustpilot                        Present, 3.8★ (28 reviews)            │
│                                                                              │
│  TIER 3: COMMUNITY PLATFORMS                                                 │
│  ════════════════════════════                                               │
│                                                                              │
│  ❌ Reddit                            No presence - Priority: MEDIUM        │
│     ↳ Mentioned in r/SaaS 3 times (all by competitors)                     │
│  ✅ Quora                             5 answers by team members              │
│  ❌ Product Hunt                      NOT FOUND - Priority: MEDIUM          │
│                                                                              │
│  TIER 4: INDIA-SPECIFIC                                                      │
│  ══════════════════════                                                     │
│                                                                              │
│  ❌ YourStory                         No coverage - Priority: MEDIUM        │
│  ❌ Inc42                             No coverage - Priority: MEDIUM        │
│  ✅ JustDial                          Listed, verified                       │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  RECOMMENDED NEXT STEPS (in order):                                          │
│  1. Claim G2 profile (2 hrs) → Highest AI citation impact                   │
│  2. Create Crunchbase profile (1 hr) → Entity recognition                  │
│  3. Claim Capterra profile (2 hrs) → Review platform presence              │
│                                                                              │
│  [📥 Download Checklist PDF]                                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.3 Requirements

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| BR-001 | Show presence status per platform | P0 | ✅/❌ |
| BR-002 | Show competitor presence comparison | P0 | Gap analysis |
| BR-003 | Categorize platforms by tier | P0 | Foundation, Reviews, etc. |
| BR-004 | Show priority level for missing | P0 | High/Medium/Low |
| BR-005 | India-specific platforms | P0 | YourStory, Inc42, JustDial |
| BR-006 | Link to claim/create profiles | P1 | Direct action |
| BR-007 | Track when user claims platform | P1 | Progress tracking |

### 10.4 Platform List (25 Core + India)

See [08-RECOMMENDATIONS-ENGINE.md](./08-RECOMMENDATIONS-ENGINE.md) for complete platform list with priorities.

---

## 11. Feature 8: PDF Reports (NEW)

### 11.1 Overview

Downloadable PDF reports for stakeholder presentations and record-keeping.

### 11.2 Report Structure

```
PAGE 1: EXECUTIVE SUMMARY
─────────────────────────
• Brand name & date
• Overall visibility score (large display)
• Score breakdown: ChatGPT vs Gemini
• 30-day trend chart
• Top 3 recommendations

PAGE 2: VISIBILITY ANALYSIS
────────────────────────────
• Mention rate by AI system
• Sentiment distribution
• Position/ranking analysis
• Competitor comparison

PAGE 3: IMPROVEMENT RECOMMENDATIONS
─────────────────────────────────────
• High priority actions (5-7 items)
• Expected timeline to results
• Projected score improvement

PAGE 4: BACKREFERENCE STATUS
────────────────────────────────
• Platform presence checklist
• Gaps to fill
• Priority order

PAGE 5: ACTION PLAN
───────────────────────
• Week-by-week action items
• Next steps
• Next report date
```

### 11.3 Requirements

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| PDF-001 | Generate PDF on demand | P0 | Download button |
| PDF-002 | Include all key metrics | P0 | Score, mentions, sentiment |
| PDF-003 | Include recommendations | P0 | Prioritized list |
| PDF-004 | Include competitor comparison | P0 | Visual chart |
| PDF-005 | Branded template | P1 | Logo, colors |
| PDF-006 | Include action timeline | P0 | Week-by-week |

### 11.4 Technical Implementation

**Option A (Recommended for MVP)**: HTML-to-PDF via Puppeteer
- Reuse dashboard components
- Better chart support
- Use `@sparticuz/chromium` for serverless

**Option B**: React-PDF
- Client-side generation
- More limited styling
- Smaller bundle size

---

## 12. Feature 9: Email Reports (NEW)

### 12.1 Overview

Automated email reports to keep users engaged and informed without logging in.

### 12.2 Email Types

| Email | Frequency | Content |
|-------|-----------|---------|
| **Weekly Summary** | Every Monday 9am IST | Score change, top mentions, 1 action |
| **Monthly Report** | 1st of month | Full PDF attached |
| **Score Drop Alert** | Real-time | If score drops >10 points |
| **Milestone** | As achieved | "You reached 70+ score!" |

### 12.3 Weekly Email Template

```
Subject: Your AI Visibility Weekly: Score 68 (+3) | Acme Software

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 WEEKLY AI VISIBILITY UPDATE
Acme Software | Week of July 1-7, 2026

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YOUR VISIBILITY SCORE

        68/100  ▲ +3 from last week

ChatGPT: 72 (+4)     Gemini: 64 (+2)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 THIS WEEK'S HIGHLIGHTS

• 12 new brand mentions detected
• Sentiment improved: 75% positive
• Ranked #2 for "best project management software"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 TOP ACTION FOR THIS WEEK

Complete your G2 profile
Effort: 2 hours | Expected Impact: +5% visibility

[View All Recommendations →]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[View Dashboard]     [Download PDF Report]
```

### 12.4 Requirements

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| EMAIL-001 | Weekly summary email | P0 | Every Monday |
| EMAIL-002 | Monthly PDF attachment | P1 | 1st of month |
| EMAIL-003 | Email preferences | P0 | Opt-in/out |
| EMAIL-004 | Unsubscribe link | P0 | Required by law |
| EMAIL-005 | Score drop alerts | P1 | >10 point drop |

### 12.5 Technical Implementation

Using **Resend** (free tier: 3,000 emails/month):
- Simple API integration
- React Email for templates
- Vercel Cron for scheduling

---

## 13. Updated Data Models

### 13.1 New Entities

```typescript
// Recommendation
interface Recommendation {
  id: string;
  brandId: string;
  category: 'entity' | 'content' | 'authority' | 'technical' | 'community';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  effort: string;
  timeline: string;
  expectedImpact: string;
  actionUrl?: string;
  guideUrl?: string;
  competitorGap?: string;
  isCompleted: boolean;
  completedAt?: Date;
  generatedAt: Date;
}

// BackreferenceStatus
interface BackreferenceStatus {
  id: string;
  brandId: string;
  platform: string;
  tier: 'foundation' | 'reviews' | 'community' | 'pr' | 'india';
  status: 'present' | 'missing' | 'incomplete';
  details?: string; // "4.2★, 12 reviews"
  competitorStatus?: string; // "Asana has 2500+ reviews"
  priority: 'high' | 'medium' | 'low';
  claimedAt?: Date;
  lastCheckedAt: Date;
}

// EmailPreference
interface EmailPreference {
  userId: string;
  weeklyReport: boolean;
  monthlyReport: boolean;
  scoreAlerts: boolean;
  unsubscribedAt?: Date;
}

// ReportGeneration
interface ReportGeneration {
  id: string;
  brandId: string;
  type: 'weekly' | 'monthly' | 'ondemand';
  pdfUrl?: string;
  generatedAt: Date;
  emailSentAt?: Date;
}
```

---

*This document now includes all MVP features including the new Recommendations Engine, Backreference Checklist, PDF Reports, and Email Reports. Development should prioritize these features to differentiate from competitors.*
