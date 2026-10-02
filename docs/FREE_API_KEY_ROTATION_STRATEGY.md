# Free API Key Rotation Strategy

## Overview

This document outlines a strategy to run zeeklabs.ai completely free by maintaining a pool of API keys across multiple providers and automatically rotating between them when quotas are exhausted.

---

## Architecture

### High-Level Flow

```
User Request
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Key Manager                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Key Pool DB │  │ Health Check│  │ Auto-Rotate │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│              Provider Fallback Chain                        │
│                                                             │
│  1. Google Gemini (free tier) ──► 2. GitHub Models (free)  │
│           │                              │                  │
│           ▼                              ▼                  │
│  3. OpenRouter (free tier) ──► 4. Perplexity (if needed)   │
└─────────────────────────────────────────────────────────────┘
     │
     ▼
   Response
```

---

## Provider Analysis

### 1. Google Gemini (AI Studio) - PRIMARY FREE OPTION

| Aspect | Details |
|--------|---------|
| **Free Tier** | 15 RPM (requests/min), 1M tokens/day, 1500 requests/day |
| **Models** | gemini-2.5-flash, gemini-2.5-pro, gemini-1.5-flash |
| **API Endpoint** | `https://generativelanguage.googleapis.com/v1beta/` |
| **Key Source** | https://aistudio.google.com/apikey |
| **Quota Reset** | Daily at midnight PT |
| **Best For** | Primary analysis, high-volume tasks |

**Procurement Strategy:**
- Each Google account = 1 API key
- Create Google accounts using different emails
- No phone verification required for AI Studio
- Keys are instant, no approval needed

### 2. GitHub Models - FREE GPT-4o ACCESS

| Aspect | Details |
|--------|---------|
| **Free Tier** | 150 requests/day (low), 15K tokens/request |
| **Models** | gpt-4o, gpt-4o-mini, gpt-4.1 |
| **API Endpoint** | `https://models.inference.ai.azure.com` |
| **Key Source** | GitHub Personal Access Tokens |
| **Quota Reset** | Daily |
| **Best For** | ChatGPT analysis, backup for Gemini |

**Procurement Strategy:**
- Each GitHub account = 1 token
- GitHub accounts are free to create
- Use classic Personal Access Tokens (no special scopes needed)
- Can create multiple accounts with different emails

### 3. OpenRouter - FREE TIER + PAID FALLBACK

| Aspect | Details |
|--------|---------|
| **Free Tier** | Limited free models: `google/gemini-2.0-flash:free` |
| **Free Credits** | $1 free credit on signup (good for ~100K tokens) |
| **API Endpoint** | `https://openrouter.ai/api/v1/` |
| **Key Source** | https://openrouter.ai/keys |
| **Best For** | Fallback when primary providers fail |

**Procurement Strategy:**
- Each account = $1 free credit
- 30 accounts = $30 in credits
- Use different emails for each account
- No verification required

### 4. Groq - ULTRA-FAST FREE OPTION

| Aspect | Details |
|--------|---------|
| **Free Tier** | 30 RPM, 14,400 requests/day |
| **Models** | llama-3.1-70b, llama-3.1-8b, mixtral-8x7b |
| **API Endpoint** | `https://api.groq.com/openai/v1/` |
| **Key Source** | https://console.groq.com/keys |
| **Best For** | High-speed, high-volume tasks |

**Procurement Strategy:**
- Generous free tier, one account may suffice
- Create multiple accounts for redundancy
- OpenAI-compatible API (easy integration)

### 5. Anthropic Claude (Limited Free)

| Aspect | Details |
|--------|---------|
| **Free Tier** | No free API tier (requires payment) |
| **Alternative** | Use via OpenRouter free credits |
| **Best For** | Skip unless needed for specific analysis |

### 6. Perplexity - PAID (Use Sparingly)

| Aspect | Details |
|--------|---------|
| **Free Tier** | None for API |
| **Cost** | $5/month minimum |
| **Best For** | Real-time web search, competitor discovery |
| **Strategy** | Use only when absolutely necessary |

---

## Database Schema for Key Management

```prisma
// Add to prisma/schema.prisma

model ApiKey {
  id              String    @id @default(cuid())
  provider        String    // 'gemini' | 'github' | 'openrouter' | 'groq'
  key             String    // Encrypted API key
  alias           String?   // Friendly name: "gemini-account-1"

  // Quota tracking
  dailyLimit      Int       @default(1500)   // Requests per day
  dailyUsed       Int       @default(0)      // Requests used today
  monthlyLimit    Int?                       // Monthly limit if applicable
  monthlyUsed     Int       @default(0)      // Monthly usage

  // Token tracking
  tokenLimit      Int?                       // Daily token limit
  tokensUsed      Int       @default(0)      // Tokens used today

  // Health status
  status          String    @default("active") // 'active' | 'exhausted' | 'error' | 'disabled'
  lastUsed        DateTime?
  lastError       String?
  errorCount      Int       @default(0)
  lastErrorAt     DateTime?

  // Reset tracking
  quotaResetAt    DateTime?                  // When quota resets
  lastResetAt     DateTime  @default(now())  // Last time we reset counters

  // Metadata
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  notes           String?                    // "Created from john@gmail.com"

  @@index([provider, status])
  @@index([status, dailyUsed])
}

model ApiKeyUsageLog {
  id          String   @id @default(cuid())
  apiKeyId    String
  provider    String
  endpoint    String?  // '/chat/completions'
  tokens      Int      @default(0)
  success     Boolean
  error       String?
  latencyMs   Int?
  createdAt   DateTime @default(now())

  @@index([apiKeyId, createdAt])
  @@index([provider, createdAt])
}
```

---

## Key Manager Implementation

### Core Module: `src/lib/api-key-manager.ts`

```typescript
import { prisma } from './prisma';

interface KeySelectionResult {
  key: string;
  keyId: string;
  provider: string;
}

export class ApiKeyManager {

  /**
   * Get the best available key for a provider
   * Prioritizes keys with lowest usage and no recent errors
   */
  async getKey(provider: string): Promise<KeySelectionResult | null> {
    const key = await prisma.apiKey.findFirst({
      where: {
        provider,
        status: 'active',
        dailyUsed: { lt: prisma.apiKey.fields.dailyLimit },
      },
      orderBy: [
        { errorCount: 'asc' },      // Prefer keys with fewer errors
        { dailyUsed: 'asc' },       // Prefer keys with lower usage
        { lastUsed: 'asc' },        // Round-robin for even distribution
      ],
    });

    if (!key) return null;

    return {
      key: this.decrypt(key.key),
      keyId: key.id,
      provider: key.provider,
    };
  }

  /**
   * Get keys for a provider with fallback chain
   * Returns keys in order of preference
   */
  async getKeysWithFallback(providers: string[]): Promise<KeySelectionResult | null> {
    for (const provider of providers) {
      const key = await this.getKey(provider);
      if (key) return key;
    }
    return null;
  }

  /**
   * Record successful API call
   */
  async recordSuccess(keyId: string, tokensUsed: number = 1): Promise<void> {
    await prisma.apiKey.update({
      where: { id: keyId },
      data: {
        dailyUsed: { increment: 1 },
        tokensUsed: { increment: tokensUsed },
        lastUsed: new Date(),
        errorCount: 0, // Reset error count on success
      },
    });

    await prisma.apiKeyUsageLog.create({
      data: {
        apiKeyId: keyId,
        provider: (await prisma.apiKey.findUnique({ where: { id: keyId } }))!.provider,
        tokens: tokensUsed,
        success: true,
      },
    });
  }

  /**
   * Record failed API call
   */
  async recordFailure(keyId: string, error: string): Promise<void> {
    const key = await prisma.apiKey.update({
      where: { id: keyId },
      data: {
        errorCount: { increment: 1 },
        lastError: error,
        lastErrorAt: new Date(),
      },
    });

    // Mark as exhausted if quota error
    if (this.isQuotaError(error)) {
      await prisma.apiKey.update({
        where: { id: keyId },
        data: { status: 'exhausted' },
      });
    }

    // Disable key if too many errors
    if (key.errorCount >= 5) {
      await prisma.apiKey.update({
        where: { id: keyId },
        data: { status: 'error' },
      });
    }

    await prisma.apiKeyUsageLog.create({
      data: {
        apiKeyId: keyId,
        provider: key.provider,
        success: false,
        error,
      },
    });
  }

  /**
   * Reset daily quotas (run via cron at midnight)
   */
  async resetDailyQuotas(): Promise<number> {
    const result = await prisma.apiKey.updateMany({
      where: {
        OR: [
          { status: 'exhausted' },
          { dailyUsed: { gt: 0 } },
        ],
      },
      data: {
        dailyUsed: 0,
        tokensUsed: 0,
        status: 'active',
        errorCount: 0,
        lastResetAt: new Date(),
      },
    });

    return result.count;
  }

  /**
   * Check if error indicates quota exhaustion
   */
  private isQuotaError(error: string): boolean {
    const quotaPatterns = [
      'quota',
      'rate limit',
      'too many requests',
      '429',
      '402',
      'exceeded',
      'insufficient',
    ];
    return quotaPatterns.some(p => error.toLowerCase().includes(p));
  }

  /**
   * Encrypt API key for storage
   */
  private encrypt(key: string): string {
    // Use AES-256-GCM encryption with AUTH_SECRET
    // Implementation depends on your crypto setup
    return key; // TODO: Implement encryption
  }

  /**
   * Decrypt API key for use
   */
  private decrypt(encryptedKey: string): string {
    // Decrypt using AUTH_SECRET
    return encryptedKey; // TODO: Implement decryption
  }
}

export const apiKeyManager = new ApiKeyManager();
```

---

## Provider Integration

### Update `src/lib/ai-providers/gemini.ts`

```typescript
import { apiKeyManager } from '../api-key-manager';

export async function callGemini(prompt: string): Promise<string> {
  // Try to get a working key
  const keyResult = await apiKeyManager.getKey('gemini');

  if (!keyResult) {
    throw new Error('No available Gemini API keys');
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${keyResult.key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      await apiKeyManager.recordFailure(keyResult.keyId, error);

      // Retry with different key
      return callGemini(prompt);
    }

    const data = await response.json();
    const tokens = data.usageMetadata?.totalTokenCount || 100;

    await apiKeyManager.recordSuccess(keyResult.keyId, tokens);

    return data.candidates[0].content.parts[0].text;

  } catch (error) {
    await apiKeyManager.recordFailure(keyResult.keyId, String(error));
    throw error;
  }
}
```

---

## Key Procurement Strategy

### Target: 30 Keys per Provider

#### Google Gemini (30 keys)

**Method 1: Manual Creation**
1. Create 30 Google accounts using variations:
   - `zeeklabs.ai.1@gmail.com` through `zeeklabs.ai.30@gmail.com`
   - Use temp email services for initial creation if needed
2. For each account:
   - Go to https://aistudio.google.com/apikey
   - Click "Create API Key"
   - Copy key to secure storage

**Method 2: Google Workspace**
- If you have a Google Workspace domain:
  - Create 30 user aliases
  - Each can have its own AI Studio key
  - Easier to manage under one domain

**Storage Template:**
```
GEMINI_KEY_1=AIza...
GEMINI_KEY_2=AIza...
...
GEMINI_KEY_30=AIza...
```

#### GitHub Models (30 keys)

**Method 1: Personal Accounts**
1. Create 30 GitHub accounts:
   - `zeeklabs-bot-1` through `zeeklabs-bot-30`
2. For each account:
   - Go to Settings > Developer Settings > Personal Access Tokens
   - Create classic token (no special permissions needed)
   - Copy token

**Method 2: Organization Tokens**
- Create a GitHub organization
- Add service accounts as members
- Generate tokens from org context

**Storage Template:**
```
GITHUB_TOKEN_1=ghp_...
GITHUB_TOKEN_2=ghp_...
...
GITHUB_TOKEN_30=ghp_...
```

#### OpenRouter (30 keys)

**Method:**
1. Create 30 accounts at https://openrouter.ai
2. Each account gets $1 free credit
3. Use email variations: `you+openrouter1@gmail.com`

**Storage Template:**
```
OPENROUTER_KEY_1=sk-or-...
OPENROUTER_KEY_2=sk-or-...
...
OPENROUTER_KEY_30=sk-or-...
```

#### Groq (10 keys - generous limits)

**Method:**
1. Create 10 accounts at https://console.groq.com
2. Very generous free tier - fewer keys needed

**Storage Template:**
```
GROQ_KEY_1=gsk_...
GROQ_KEY_2=gsk_...
...
GROQ_KEY_10=gsk_...
```

---

## Daily Capacity Calculation

### With 30 Keys Each:

| Provider | Per-Key Daily | 30 Keys Daily | Monthly Total |
|----------|--------------|---------------|---------------|
| Gemini | 1,500 requests | 45,000 requests | 1.35M requests |
| GitHub | 150 requests | 4,500 requests | 135K requests |
| OpenRouter | ~100 requests ($1 credit) | 3,000 requests | 90K requests |
| Groq | 14,400 requests | 144,000 requests | 4.32M requests |

**Total Daily Capacity: ~196,500 requests/day**

### Per User Analysis Cost:
- 1 brand analysis ≈ 60-100 API calls
- Daily capacity supports: **~2,000-3,000 full analyses/day**

---

## Cron Jobs

### Daily Quota Reset (run at 00:00 PT)

```typescript
// src/app/api/cron/reset-quotas/route.ts
import { apiKeyManager } from '@/lib/api-key-manager';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resetCount = await apiKeyManager.resetDailyQuotas();

  return Response.json({
    success: true,
    message: `Reset ${resetCount} API keys`,
    timestamp: new Date().toISOString(),
  });
}
```

### Health Check (run every 15 minutes)

```typescript
// src/app/api/cron/health-check/route.ts

export async function GET(request: Request) {
  // Test each provider with a minimal request
  const providers = ['gemini', 'github', 'openrouter', 'groq'];
  const results = [];

  for (const provider of providers) {
    const key = await apiKeyManager.getKey(provider);
    if (key) {
      const healthy = await testKey(provider, key.key);
      results.push({ provider, healthy, keyId: key.keyId });
    } else {
      results.push({ provider, healthy: false, error: 'No keys available' });
    }
  }

  return Response.json({ results });
}
```

---

## Admin Dashboard

### Key Management UI Features:

1. **Key Overview**
   - Total keys per provider
   - Active vs exhausted vs error keys
   - Today's usage vs capacity

2. **Key Actions**
   - Add new key
   - Disable/enable key
   - Test key health
   - View usage history

3. **Alerts**
   - Email when <20% capacity remaining
   - Alert when all keys for a provider exhausted
   - Daily usage report

### API Endpoint for Admin:

```typescript
// src/app/api/admin/api-keys/route.ts

export async function GET() {
  const stats = await prisma.apiKey.groupBy({
    by: ['provider', 'status'],
    _count: true,
    _sum: { dailyUsed: true },
  });

  const keys = await prisma.apiKey.findMany({
    select: {
      id: true,
      provider: true,
      alias: true,
      status: true,
      dailyUsed: true,
      dailyLimit: true,
      lastUsed: true,
      errorCount: true,
    },
    orderBy: [
      { provider: 'asc' },
      { dailyUsed: 'desc' },
    ],
  });

  return Response.json({ stats, keys });
}

export async function POST(request: Request) {
  const { provider, key, alias, dailyLimit } = await request.json();

  const newKey = await prisma.apiKey.create({
    data: {
      provider,
      key, // Should be encrypted
      alias,
      dailyLimit: dailyLimit || getDefaultLimit(provider),
    },
  });

  return Response.json(newKey);
}
```

---

## Security Considerations

1. **Key Encryption**
   - Store keys encrypted at rest using AES-256-GCM
   - Use `AUTH_SECRET` as encryption key
   - Never log or expose raw keys

2. **Access Control**
   - Only admin users can view/manage keys
   - API key management endpoints require admin auth
   - Audit log for all key changes

3. **Key Rotation**
   - Rotate keys every 90 days
   - Have a process to replace compromised keys
   - Document which account each key belongs to

---

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1)
- [ ] Add Prisma schema for ApiKey and ApiKeyUsageLog
- [ ] Implement ApiKeyManager class
- [ ] Create basic key rotation logic

### Phase 2: Provider Integration (Week 2)
- [ ] Update Gemini provider to use key manager
- [ ] Update GitHub Models provider
- [ ] Update OpenRouter provider
- [ ] Add Groq as new provider

### Phase 3: Key Procurement (Week 2-3)
- [ ] Create 30 Google accounts + Gemini keys
- [ ] Create 30 GitHub accounts + tokens
- [ ] Create 30 OpenRouter accounts
- [ ] Create 10 Groq accounts
- [ ] Import all keys to database

### Phase 4: Monitoring & Admin (Week 3)
- [ ] Build admin dashboard for key management
- [ ] Set up cron jobs for quota reset
- [ ] Add alerting for low capacity
- [ ] Create usage reporting

### Phase 5: Optimization (Week 4)
- [ ] Implement smart load balancing
- [ ] Add request caching to reduce API calls
- [ ] Optimize token usage
- [ ] Performance testing

---

## Fallback Priority Chain

```
Analysis Request
      │
      ▼
┌─────────────────┐
│ 1. Gemini Keys  │ ──► 30 keys, 45K req/day
└────────┬────────┘
         │ (all exhausted)
         ▼
┌─────────────────┐
│ 2. Groq Keys    │ ──► 10 keys, 144K req/day
└────────┬────────┘
         │ (all exhausted)
         ▼
┌─────────────────┐
│ 3. GitHub Keys  │ ──► 30 keys, 4.5K req/day
└────────┬────────┘
         │ (all exhausted)
         ▼
┌─────────────────┐
│ 4. OpenRouter   │ ──► 30 keys, 3K req/day
└────────┬────────┘
         │ (all exhausted)
         ▼
┌─────────────────┐
│ 5. Queue/Retry  │ ──► Wait for quota reset
└─────────────────┘
```

---

## Cost Summary

| Item | Cost | Notes |
|------|------|-------|
| Google Accounts | $0 | Free to create |
| GitHub Accounts | $0 | Free to create |
| OpenRouter Accounts | $0 | $1 free credit each |
| Groq Accounts | $0 | Free tier |
| Email Accounts | $0 | Use Gmail aliases or temp mail |
| **Total** | **$0** | Completely free |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Account bans for ToS violation | Use keys legitimately, don't abuse |
| Providers remove free tiers | Diversify across providers |
| Keys get rate-limited together | Use different IPs for creation |
| Management overhead | Build good admin tools |
| Key leakage | Encrypt at rest, strict access control |

---

## Conclusion

With this strategy, zeeklabs.ai can operate completely free with:
- **~200,000 API requests/day** capacity
- **~2,000-3,000 brand analyses/day** throughput
- **Zero recurring costs** for AI API usage
- **Automatic failover** between providers
- **Self-healing** with daily quota resets

The initial setup requires creating ~100 accounts across providers, but once done, the system is self-sustaining.
