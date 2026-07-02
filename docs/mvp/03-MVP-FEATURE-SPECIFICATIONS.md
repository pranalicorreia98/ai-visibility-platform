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
| Competitor View | P0 | **INCLUDED** | Up to 3 competitors |
| Citation Tracking | P0 | DEFERRED | Complex extraction |
| AI Search Analytics | P1 | DEFERRED | Needs web analytics |
| AI Reputation Monitoring | P0 | PARTIAL | Basic sentiment only |
| Content Optimizer | P0 | DEFERRED | Needs crawling |
| GEO Auditor | P1 | DEFERRED | Needs infrastructure |
| Auto-Fix Engine | P1 | DEFERRED | Needs CMS integration |
| Executive Reporting | P1 | DEFERRED | Can show mockups |
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

---

*This document specifies all MVP features in detail. Development should follow these specifications to ensure a consistent, demo-ready product.*
