# MVP Technical Architecture

## Document Information

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Draft |
| Created | 2026-07-02 |
| Target | Minimal Cost Demo Platform |

---

## 1. Architecture Philosophy

### 1.1 Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Minimal Infrastructure** | Single server, no Kubernetes |
| **Free Services First** | Leverage free tiers everywhere |
| **Monolith Over Microservices** | One codebase, faster development |
| **SQLite Over PostgreSQL** | Zero DB hosting cost |
| **Static Over Dynamic** | Pre-compute where possible |

### 1.2 Architecture Comparison

```
FULL PLATFORM (Original Design)          MVP (Simplified)
─────────────────────────────────         ─────────────────────────────

┌─────────────────────────────┐           ┌─────────────────────────────┐
│     CloudFront + WAF        │           │     Vercel / Netlify        │
├─────────────────────────────┤           │     (Free Tier)             │
│     API Gateway             │           └─────────────────────────────┘
├─────────────────────────────┤                       │
│     16+ Microservices       │                       ▼
│     (EKS Kubernetes)        │           ┌─────────────────────────────┐
├─────────────────────────────┤           │     Next.js Monolith        │
│  PostgreSQL + TimescaleDB   │           │     (API Routes + Frontend) │
│  Redis + OpenSearch         │           ├─────────────────────────────┤
└─────────────────────────────┘           │     SQLite Database         │
                                          │     (File-based)            │
Monthly Cost: $2,000-5,000+               └─────────────────────────────┘

                                          Monthly Cost: $0-20
```

---

## 2. Technology Stack

### 2.1 Stack Selection

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | Next.js 14 (App Router) | Full-stack in one, great DX |
| **UI Components** | shadcn/ui + Tailwind | Beautiful, free, fast |
| **Backend** | Next.js API Routes | No separate server needed |
| **Database** | SQLite + Prisma | Zero cost, easy setup |
| **Auth** | NextAuth.js | Free, works with Next.js |
| **Hosting** | Vercel Free Tier | 100GB bandwidth, serverless |
| **AI APIs** | Google AI Studio + GitHub Models | Free tier access |
| **Charts** | Recharts | Free, React-native |
| **State** | Zustand or React Context | Simple, no overhead |

### 2.2 External Services (All Free Tier)

| Service | Purpose | Free Tier Limits |
|---------|---------|------------------|
| **Google AI Studio** | Gemini API | 20 req/day, 5 req/min |
| **GitHub Models** | ChatGPT/GPT-4 API | Varies by Copilot tier |
| **Vercel** | Hosting | 100GB bandwidth, 100 hrs serverless |
| **GitHub** | Code repository | Unlimited private repos |
| **Resend** | Email (optional) | 3000 emails/month |

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              BROWSER                                     │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                     Next.js Frontend                               │  │
│  │  • React Components (Dashboard, Simulator, Monitoring)             │  │
│  │  • TailwindCSS + shadcn/ui                                        │  │
│  │  • Client-side state (Zustand)                                    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         VERCEL EDGE NETWORK                              │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                     Next.js API Routes                             │  │
│  │                                                                    │  │
│  │  /api/auth/*          → NextAuth.js handlers                      │  │
│  │  /api/simulate        → Run AI prompts                            │  │
│  │  /api/brands          → Brand CRUD                                │  │
│  │  /api/competitors     → Competitor CRUD                           │  │
│  │  /api/mentions        → Get/create mentions                       │  │
│  │  /api/visibility      → Calculate visibility score                │  │
│  │  /api/ai/chatgpt      → GitHub Models proxy                       │  │
│  │  /api/ai/gemini       → Google AI Studio proxy                    │  │
│  │                                                                    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                    │                                     │
│                                    ▼                                     │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                     Prisma ORM                                     │  │
│  │                        │                                           │  │
│  │                        ▼                                           │  │
│  │                   SQLite Database                                  │  │
│  │                   (File: /tmp/mvp.db)                             │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐
│      GOOGLE AI STUDIO         │   │       GITHUB MODELS           │
│  ┌─────────────────────────┐  │   │  ┌─────────────────────────┐  │
│  │  Gemini 2.5 Flash       │  │   │  │  GPT-4o / GPT-4.1       │  │
│  │  • 20 requests/day      │  │   │  │  • Rate limited          │  │
│  │  • 5 requests/minute    │  │   │  │  • Token limits          │  │
│  └─────────────────────────┘  │   │  └─────────────────────────┘  │
└───────────────────────────────┘   └───────────────────────────────┘
```

### 3.2 Data Flow

```
USER ACTION                    SYSTEM FLOW                        RESULT
────────────                   ───────────                        ──────

"Run Simulation"
      │
      ▼
┌─────────────┐
│ Frontend    │ ─────► POST /api/simulate
│ Form Submit │        { prompt, systems: ['chatgpt', 'gemini'] }
└─────────────┘                │
                               ▼
                    ┌────────────────────┐
                    │ Rate Limit Check   │
                    │ • Daily quota OK?  │
                    │ • Minute quota OK? │
                    └────────────────────┘
                               │
              ┌────────────────┴────────────────┐
              ▼                                  ▼
    ┌──────────────────┐              ┌──────────────────┐
    │ Call Gemini API  │              │ Call ChatGPT API │
    │ (parallel)       │              │ (parallel)       │
    └──────────────────┘              └──────────────────┘
              │                                  │
              └────────────────┬────────────────┘
                               ▼
                    ┌────────────────────┐
                    │ Process Responses  │
                    │ • Extract mentions │
                    │ • Detect sentiment │
                    │ • Find rankings    │
                    └────────────────────┘
                               │
                               ▼
                    ┌────────────────────┐
                    │ Store in SQLite    │
                    │ • simulations      │
                    │ • mentions         │
                    │ • api_usage        │
                    └────────────────────┘
                               │
                               ▼
                    ┌────────────────────┐
                    │ Return JSON        │──────► Frontend renders
                    │ { chatgpt, gemini, │        side-by-side results
                    │   mentions, ... }  │
                    └────────────────────┘
```

---

## 4. Database Design

### 4.1 Schema (SQLite + Prisma)

```prisma
// prisma/schema.prisma

datasource db {
  provider = "sqlite"
  url      = "file:./mvp.db"
}

generator client {
  provider = "prisma-client-js"
}

// ─────────────────────────────────────────────────────────────
// USER & AUTH
// ─────────────────────────────────────────────────────────────

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  createdAt     DateTime  @default(now())

  brands        Brand[]
  simulations   Simulation[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?

  @@unique([provider, providerAccountId])
}

// ─────────────────────────────────────────────────────────────
// BRAND CONFIGURATION
// ─────────────────────────────────────────────────────────────

model Brand {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])

  name            String
  domain          String?
  alternateNames  String?  // JSON array stored as string

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  competitors     Competitor[]
  mentions        Mention[]
  simulations     Simulation[]
}

model Competitor {
  id        String   @id @default(cuid())
  brandId   String
  brand     Brand    @relation(fields: [brandId], references: [id])

  name      String
  domain    String?

  createdAt DateTime @default(now())
}

// ─────────────────────────────────────────────────────────────
// SIMULATIONS & MENTIONS
// ─────────────────────────────────────────────────────────────

model Simulation {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  brandId     String?
  brand       Brand?   @relation(fields: [brandId], references: [id])

  prompt      String

  // Responses stored as JSON strings
  chatgptResponse   String?
  geminiResponse    String?

  // Parsed analysis
  chatgptMentions   String?  // JSON array
  geminiMentions    String?  // JSON array
  chatgptSentiment  Float?
  geminiSentiment   Float?
  chatgptPosition   Int?
  geminiPosition    Int?

  createdAt   DateTime @default(now())

  mentions    Mention[]
}

model Mention {
  id            String   @id @default(cuid())
  brandId       String
  brand         Brand    @relation(fields: [brandId], references: [id])
  simulationId  String?
  simulation    Simulation? @relation(fields: [simulationId], references: [id])

  aiSystem      String   // 'chatgpt' | 'gemini'
  prompt        String
  response      String
  context       String?  // Surrounding text of mention

  sentiment     Float?   // -1.0 to 1.0
  position      Int?     // Ranking position if applicable

  isCompetitor  Boolean  @default(false)
  competitorName String?

  createdAt     DateTime @default(now())
}

// ─────────────────────────────────────────────────────────────
// API USAGE TRACKING (Rate Limit Management)
// ─────────────────────────────────────────────────────────────

model ApiUsage {
  id          String   @id @default(cuid())
  provider    String   // 'gemini' | 'chatgpt'

  date        String   // YYYY-MM-DD for daily tracking
  requestCount Int     @default(0)
  tokenCount   Int     @default(0)

  lastRequestAt DateTime?

  @@unique([provider, date])
}

// ─────────────────────────────────────────────────────────────
// CACHED RESPONSES (Demo Optimization)
// ─────────────────────────────────────────────────────────────

model CachedResponse {
  id          String   @id @default(cuid())

  promptHash  String   @unique  // MD5 hash of normalized prompt
  prompt      String
  provider    String

  response    String
  analysis    String?  // JSON: mentions, sentiment, position

  createdAt   DateTime @default(now())
  expiresAt   DateTime
}
```

### 4.2 Database Size Estimates

| Table | Rows (Demo) | Size Estimate |
|-------|-------------|---------------|
| Users | 5 | < 1 KB |
| Brands | 5 | < 1 KB |
| Competitors | 15 | < 1 KB |
| Simulations | 100 | ~100 KB |
| Mentions | 500 | ~200 KB |
| ApiUsage | 60 | < 1 KB |
| CachedResponse | 200 | ~500 KB |
| **Total** | | **< 1 MB** |

SQLite can easily handle this with excellent performance.

---

## 5. API Design

### 5.1 API Routes

```
/api
├── /auth
│   ├── [...nextauth].ts    # NextAuth.js handlers
│   └── session.ts          # Get current session
│
├── /brands
│   ├── GET    /            # List user's brands
│   ├── POST   /            # Create brand
│   ├── GET    /[id]        # Get brand details
│   ├── PUT    /[id]        # Update brand
│   └── DELETE /[id]        # Delete brand
│
├── /competitors
│   ├── GET    /            # List competitors for brand
│   ├── POST   /            # Add competitor
│   └── DELETE /[id]        # Remove competitor
│
├── /simulate
│   └── POST   /            # Run simulation
│       Body: { prompt, systems: ['chatgpt', 'gemini'], brandId? }
│       Response: { chatgpt: {...}, gemini: {...}, analysis: {...} }
│
├── /mentions
│   ├── GET    /            # List mentions (paginated)
│   └── GET    /stats       # Mention statistics
│
├── /visibility
│   ├── GET    /score       # Get visibility score
│   └── GET    /trend       # Get trend data (7/30 days)
│
└── /ai
    ├── /chatgpt
    │   └── POST /          # Proxy to GitHub Models
    └── /gemini
        └── POST /          # Proxy to Google AI Studio
```

### 5.2 Sample API Implementation

```typescript
// app/api/simulate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { callChatGPT, callGemini } from '@/lib/ai-providers';
import { analyzeMentions, analyzeSentiment } from '@/lib/analysis';
import { checkRateLimit, recordUsage } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { prompt, systems, brandId } = await req.json();

  // Check rate limits
  for (const system of systems) {
    const canProceed = await checkRateLimit(system);
    if (!canProceed) {
      return NextResponse.json(
        { error: `Rate limit exceeded for ${system}` },
        { status: 429 }
      );
    }
  }

  // Get brand info for analysis
  const brand = brandId
    ? await prisma.brand.findUnique({
        where: { id: brandId },
        include: { competitors: true }
      })
    : null;

  // Call AI providers in parallel
  const results: Record<string, any> = {};

  await Promise.all(
    systems.map(async (system: string) => {
      try {
        if (system === 'chatgpt') {
          results.chatgpt = await callChatGPT(prompt);
        } else if (system === 'gemini') {
          results.gemini = await callGemini(prompt);
        }
        await recordUsage(system);
      } catch (error) {
        results[system] = { error: error.message };
      }
    })
  );

  // Analyze responses
  const analysis = {
    chatgpt: results.chatgpt?.error ? null : {
      mentions: analyzeMentions(results.chatgpt, brand),
      sentiment: analyzeSentiment(results.chatgpt, brand?.name),
      position: findBrandPosition(results.chatgpt, brand?.name),
    },
    gemini: results.gemini?.error ? null : {
      mentions: analyzeMentions(results.gemini, brand),
      sentiment: analyzeSentiment(results.gemini, brand?.name),
      position: findBrandPosition(results.gemini, brand?.name),
    },
  };

  // Store simulation
  const simulation = await prisma.simulation.create({
    data: {
      userId: session.user.id,
      brandId,
      prompt,
      chatgptResponse: JSON.stringify(results.chatgpt),
      geminiResponse: JSON.stringify(results.gemini),
      chatgptMentions: JSON.stringify(analysis.chatgpt?.mentions),
      geminiMentions: JSON.stringify(analysis.gemini?.mentions),
      chatgptSentiment: analysis.chatgpt?.sentiment,
      geminiSentiment: analysis.gemini?.sentiment,
      chatgptPosition: analysis.chatgpt?.position,
      geminiPosition: analysis.gemini?.position,
    },
  });

  return NextResponse.json({
    id: simulation.id,
    prompt,
    results,
    analysis,
  });
}
```

---

## 6. AI Provider Integration

### 6.1 Google AI Studio (Gemini)

```typescript
// lib/ai-providers/gemini.ts

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export async function callGemini(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const result = await model.generateContent(prompt);
  const response = await result.response;

  return response.text();
}
```

### 6.2 GitHub Models (ChatGPT)

```typescript
// lib/ai-providers/chatgpt.ts

import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://models.inference.ai.azure.com',
  apiKey: process.env.GITHUB_TOKEN!,
});

export async function callChatGPT(prompt: string): Promise<string> {
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'user', content: prompt }
    ],
    max_tokens: 1000,
  });

  return response.choices[0].message.content || '';
}
```

### 6.3 Rate Limit Management

```typescript
// lib/rate-limit.ts

import { prisma } from './prisma';

const LIMITS = {
  gemini: { daily: 20, perMinute: 5 },
  chatgpt: { daily: 50, perMinute: 10 }, // Estimate for GitHub free tier
};

export async function checkRateLimit(provider: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];

  const usage = await prisma.apiUsage.findUnique({
    where: { provider_date: { provider, date: today } },
  });

  const limit = LIMITS[provider as keyof typeof LIMITS];
  if (!limit) return true;

  // Check daily limit
  if (usage && usage.requestCount >= limit.daily) {
    return false;
  }

  // Check per-minute limit (simple implementation)
  if (usage?.lastRequestAt) {
    const timeSinceLastRequest = Date.now() - usage.lastRequestAt.getTime();
    if (timeSinceLastRequest < 60000 / limit.perMinute) {
      // Too fast, but allow with delay
      await new Promise(resolve =>
        setTimeout(resolve, 60000 / limit.perMinute - timeSinceLastRequest)
      );
    }
  }

  return true;
}

export async function recordUsage(provider: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  await prisma.apiUsage.upsert({
    where: { provider_date: { provider, date: today } },
    create: {
      provider,
      date: today,
      requestCount: 1,
      lastRequestAt: new Date(),
    },
    update: {
      requestCount: { increment: 1 },
      lastRequestAt: new Date(),
    },
  });
}
```

---

## 7. Frontend Architecture

### 7.1 Page Structure

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── layout.tsx
├── (dashboard)/
│   ├── layout.tsx           # Sidebar + Header
│   ├── page.tsx             # Main Dashboard
│   ├── simulator/page.tsx   # Prompt Simulator
│   ├── monitoring/page.tsx  # Brand Monitoring
│   ├── competitors/page.tsx # Competitor View
│   └── settings/page.tsx    # Brand Settings
├── api/                     # API Routes
├── components/
│   ├── ui/                  # shadcn components
│   ├── dashboard/
│   │   ├── VisibilityScore.tsx
│   │   ├── TrendChart.tsx
│   │   ├── MentionsFeed.tsx
│   │   └── SystemComparison.tsx
│   ├── simulator/
│   │   ├── PromptInput.tsx
│   │   ├── ResponseCard.tsx
│   │   └── AnalysisPanel.tsx
│   └── shared/
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       └── Loading.tsx
├── lib/
│   ├── prisma.ts
│   ├── ai-providers/
│   ├── analysis/
│   └── utils.ts
└── styles/
    └── globals.css
```

### 7.2 Key Components

```tsx
// components/simulator/ResponseCard.tsx

interface ResponseCardProps {
  system: 'chatgpt' | 'gemini';
  response: string;
  analysis: {
    mentions: Mention[];
    sentiment: number;
    position: number | null;
  };
  brandName: string;
  loading?: boolean;
}

export function ResponseCard({
  system,
  response,
  analysis,
  brandName,
  loading
}: ResponseCardProps) {
  const highlightedResponse = highlightMentions(response, brandName, analysis.mentions);

  return (
    <Card className="flex-1">
      <CardHeader className="flex flex-row items-center gap-2">
        {system === 'chatgpt' ? <ChatGPTIcon /> : <GeminiIcon />}
        <CardTitle>{system === 'chatgpt' ? 'ChatGPT' : 'Gemini'}</CardTitle>
        {analysis.position && (
          <Badge variant="outline">Position #{analysis.position}</Badge>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-40" />
        ) : (
          <>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: highlightedResponse }}
            />
            <div className="mt-4 flex gap-2">
              <SentimentBadge score={analysis.sentiment} />
              <Badge variant="secondary">
                {analysis.mentions.length} mentions
              </Badge>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## 8. Deployment

### 8.1 Vercel Deployment

```yaml
# vercel.json
{
  "framework": "nextjs",
  "buildCommand": "prisma generate && next build",
  "outputDirectory": ".next",
  "env": {
    "DATABASE_URL": "file:./mvp.db"
  }
}
```

### 8.2 Environment Variables

```bash
# .env.local (development)
# .env.production (Vercel dashboard)

# Database
DATABASE_URL="file:./prisma/mvp.db"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# AI Providers
GOOGLE_AI_API_KEY="your-google-ai-studio-key"
GITHUB_TOKEN="your-github-personal-access-token"

# Optional: OAuth providers for login
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

### 8.3 SQLite on Vercel

**Important**: Vercel's serverless functions have an ephemeral filesystem. For MVP demos:

**Option A: Use Turso (SQLite-compatible, has free tier)**
```
DATABASE_URL="libsql://your-db.turso.io"
```

**Option B: Use local SQLite for demo only**
- Pre-populate database before deployment
- Accept that data doesn't persist between deploys
- Good enough for controlled demo environments

**Option C: Use PlanetScale free tier (MySQL)**
- 5GB storage free
- Good for production-like setup

For MVP, recommend **Option A (Turso)** - free, serverless SQLite.

---

## 9. Security Considerations

### 9.1 MVP Security (Minimal but Sufficient)

| Concern | Solution |
|---------|----------|
| API Key Protection | Environment variables only |
| User Auth | NextAuth.js with OAuth |
| Input Validation | Zod schemas |
| Rate Limiting | Custom per-provider limits |
| CORS | Next.js default handling |
| HTTPS | Vercel handles automatically |

### 9.2 What We're Skipping (For MVP)

- SOC 2 compliance (not needed for demos)
- Advanced rate limiting (Redis)
- WAF (Vercel has basic protection)
- Multi-tenant isolation (single user focus)
- Audit logging (minimal logging only)

---

## 10. Monitoring (Minimal)

### 10.1 Basic Observability

| What | Tool | Cost |
|------|------|------|
| Errors | Vercel built-in | Free |
| API Usage | Custom SQLite table | Free |
| Performance | Vercel Analytics | Free (basic) |

### 10.2 API Usage Dashboard

Build a simple `/admin` page showing:
- Daily API usage by provider
- Remaining quota
- Error rate
- Last successful calls

---

*This architecture prioritizes speed of development and zero infrastructure cost while maintaining a professional demo experience.*
