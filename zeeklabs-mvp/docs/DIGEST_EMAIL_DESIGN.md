# 30-Day Digest Email System

## Overview

Automated monthly digest emails for paid subscribers showing the **diff** between their current AI visibility metrics and their previous analysis. This creates ongoing value and reinforces the subscription by surfacing progress (or regression) without requiring users to log in.

## Value Proposition

- **Retention**: Paid users see ongoing value even if they forget to log in
- **Engagement**: Drives users back to dashboard to dig deeper
- **Upsell**: Free users could receive a "teaser" version encouraging upgrade
- **Stickiness**: Monthly touchpoint keeps ZeekLabs top-of-mind

---

## High-Level Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CRON JOB (Daily)                            │
│                    Runs at 9:00 AM UTC daily                        │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  1. Find users due for digest (last digest sent ≥ 30 days ago)      │
│  2. Filter to paid subscribers only (BillingSubscription.active)    │
│  3. For each user, check if ALL their brands have been analyzed     │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  4. For each qualifying user:                                       │
│     a. Get latest AnalysisSnapshot per brand                        │
│     b. Get previous snapshot (30+ days old) per brand               │
│     c. Compute diff metrics                                         │
│     d. Generate email content                                       │
│     e. Send via Resend                                              │
│     f. Record in DigestEmailLog                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### New Table: `DigestEmailLog`

Tracks every digest email sent for idempotency and analytics.

```prisma
model DigestEmailLog {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Email metadata
  resendMessageId String?  // Resend's message ID for tracking
  sentAt          DateTime @default(now())

  // Digest content snapshot (for debugging/support)
  brandsIncluded  Int      // Number of brands in this digest
  periodStart     DateTime // Start of comparison period
  periodEnd       DateTime // End of comparison period (typically "now")

  // Delivery status
  status          String   @default("sent") // sent | delivered | bounced | failed

  // Prevent duplicate sends
  @@unique([userId, periodEnd])
  @@index([userId])
  @@index([sentAt])
}
```

### New Table: `DigestPreferences`

User preferences for digest emails (opt-out, frequency override).

```prisma
model DigestPreferences {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  enabled   Boolean  @default(true)  // false = opted out
  frequency Int      @default(30)    // days between digests (30 default, could offer 7/14/30)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## Diff Metrics to Include

For each brand, compute the change between the **previous snapshot** and **current snapshot**:

### Primary Metrics (Always Show)

| Metric | Source | Diff Display |
|--------|--------|--------------|
| **Overall AI Visibility Score** | `AnalysisSnapshot.overallScore` | `72 → 78 (+6)` with ↑/↓ indicator |
| **Total Mentions** | Count of `Mention` records | `45 → 52 (+7)` |
| **Sentiment Breakdown** | `Mention.sentiment` aggregation | `Positive: 60% → 68%` |

### Per-Engine Breakdown

| Engine | Metrics |
|--------|---------|
| ChatGPT | Mention count, avg sentiment, rank position changes |
| Gemini | Mention count, avg sentiment, rank position changes |
| Perplexity | Mention count, avg sentiment, citation count |

### Competitor Movement

| Metric | Description |
|--------|-------------|
| **Your Rank vs Competitors** | Position change in AI recommendations |
| **Competitor Gains/Losses** | Which competitors moved up/down |

### Recommendations Summary

- Count of new recommendations generated
- Top 3 action items (from `Recommendation` table)

---

## Email Template Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER (Purple gradient banner)                                    │
│                                                                     │
│  [ZeekLabs Logo]                                                    │
│                                                                     │
│  Your 30-Day AI Visibility Digest                                   │
│  October 2026 • {Brand Name}                                        │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  GREETING                                                           │
│                                                                     │
│  Hi {FirstName},                                                    │
│                                                                     │
│  Here's how your brand performed across AI engines this month.      │
│  AI recommendations change constantly — a lot can shift in 30 days. │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  HEADLINE METRIC (Large card with gradient background)              │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Overall AI Visibility Score                                │    │
│  │                                                             │    │
│  │  ████████████░░░░ 78%                                       │    │
│  │                                                             │    │
│  │  ↑ +6 points from last month                                │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  ENGINE BREAKDOWN (3-column cards)                                  │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   ChatGPT    │  │    Gemini    │  │  Perplexity  │              │
│  │              │  │              │  │              │              │
│  │   ↑ 18       │  │   ↓ 5        │  │   → 15       │              │
│  │   mentions   │  │   mentions   │  │   mentions   │              │
│  │              │  │              │  │              │              │
│  │   was 12     │  │   was 8      │  │   unchanged  │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  SENTIMENT SHIFT                                                    │
│                                                                     │
│  Positive mentions:  60% → 68%  ↑                                   │
│  Neutral mentions:   30% → 25%                                      │
│  Negative mentions:  10% → 7%   ↓                                   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  COMPETITOR WATCH (Styled list with icons)                          │
│                                                                     │
│  📈 CompetitorA moved up 2 positions in ChatGPT                     │
│  🎉 You overtook CompetitorB in Gemini recommendations              │
│  ⚠️ CompetitorC added 3 new citations — watch this one              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  TOP 3 RECOMMENDATIONS (Numbered cards)                             │
│                                                                     │
│  1. Add schema markup to improve citation rate                      │
│  2. Create content targeting "best {category}" queries              │
│  3. Update product pages with AI-friendly descriptions              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  CALL TO ACTION (Centered, prominent)                               │
│                                                                     │
│  🔄 Time for a fresh analysis?                                      │
│                                                                     │
│  AI engines update their knowledge constantly. Run a new analysis   │
│  to see exactly where you stand today and get updated               │
│  recommendations.                                                   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │         [ Re-run Analysis for {Brand} → ]                   │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │         [ View Full Dashboard → ]                           │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  FOOTER                                                             │
│                                                                     │
│  [ZeekLabs Logo]                                                    │
│  AI Visibility Monitoring for Modern Brands                         │
│                                                                     │
│  You're receiving this because you're a ZeekLabs subscriber.        │
│  Manage preferences • Unsubscribe                                   │
│                                                                     │
│  CLIKBOUND PRIVATE LIMITED                                          │
│  HNO 318, Nivant House, Virar (West), Maharashtra — 401301          │
│                                                                     │
│  © 2026 ZeekLabs.ai                                                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Database & Core Logic

1. **Add Prisma models** (`DigestEmailLog`, `DigestPreferences`)
2. **Run migration**: `npx prisma migrate dev --name add_digest_tables`
3. **Create digest service**: `src/lib/digest/`
   - `computeDiff.ts` — Calculate metric diffs between snapshots
   - `eligibility.ts` — Determine which users qualify for digest
   - `templates.ts` — Email HTML/text generation

### Phase 2: Email Integration

4. **Set up Resend**:
   ```bash
   npm install resend @react-email/components
   ```
   Add to `.env` (use the ClikHire/CLIKBOUND Resend API key):
   ```
   RESEND_API_KEY=re_xxxxx  # From ClikHire .env (paid CLIKBOUND account)
   RESEND_FROM_EMAIL="ZeekLabs <digest@zeeklabs.ai>"
   ```

5. **Create email sender**: `src/lib/email/resend.ts`
   ```typescript
   import { Resend } from 'resend';
   import { render } from '@react-email/components';
   import { DigestEmail, type DigestEmailProps } from '@/lib/digest/templates/digestEmail';

   const resend = new Resend(process.env.RESEND_API_KEY);

   export async function sendDigestEmail(params: {
     to: string;
     userName: string;
     brands: DigestEmailProps['brands'];
     dashboardUrl: string;
     rerunUrl: string;
     unsubscribeUrl: string;
     preferencesUrl: string;
   }) {
     const { to, ...emailProps } = params;

     // Render React Email template to HTML
     const html = await render(DigestEmail(emailProps));

     // Generate plain text version (basic fallback)
     const text = generatePlainText(emailProps);

     const totalDelta = emailProps.brands.reduce((sum, b) => sum + b.scoreDelta, 0);
     const trend = totalDelta > 0 ? '📈' : totalDelta < 0 ? '📉' : '';

     return resend.emails.send({
       from: process.env.RESEND_FROM_EMAIL!,
       to,
       subject: `Your 30-Day AI Visibility Digest ${trend}`,
       html,
       text,
       tags: [
         { name: 'category', value: 'digest' },
         { name: 'user_id', value: emailProps.brands[0]?.brandId || 'unknown' },
       ],
     });
   }

   function generatePlainText(props: Omit<DigestEmailProps, 'to'>): string {
     const { userName, brands, dashboardUrl, rerunUrl } = props;
     const firstName = userName.split(' ')[0];

     let text = `Hi ${firstName},\n\n`;
     text += `Here's your 30-day AI visibility digest.\n\n`;

     for (const brand of brands) {
       text += `${brand.brandName}\n`;
       text += `${'─'.repeat(30)}\n`;
       text += `Overall Score: ${brand.currentScore}% (${brand.scoreDelta > 0 ? '+' : ''}${brand.scoreDelta})\n\n`;

       text += `Mentions by Engine:\n`;
       for (const m of brand.mentions) {
         text += `  • ${m.engine}: ${m.current} (was ${m.previous})\n`;
       }
       text += `\n`;

       if (brand.recommendations.length > 0) {
         text += `Top Recommendations:\n`;
         brand.recommendations.slice(0, 3).forEach((rec, i) => {
           text += `  ${i + 1}. ${rec}\n`;
         });
         text += `\n`;
       }
     }

     text += `Ready for a fresh analysis? AI engines update constantly.\n`;
     text += `Re-run analysis: ${rerunUrl}\n`;
     text += `View dashboard: ${dashboardUrl}\n\n`;
     text += `— The ZeekLabs Team\n`;

     return text;
   }
   ```

### Phase 3: Cron Job

6. **Create API route for cron**: `src/app/api/cron/digest/route.ts`
   - Protected by `CRON_SECRET` header
   - Processes users in batches (avoid timeout)
   - Returns summary of emails sent

7. **Set up cron trigger** (options):
   - **Vercel Cron** (if on Vercel): Add to `vercel.json`
   - **AWS EventBridge** (current setup): Schedule Lambda to hit the endpoint
   - **GitHub Actions**: Scheduled workflow

### Phase 4: User Controls

8. **Preferences API**: `src/app/api/user/digest-preferences/route.ts`
   - GET: Fetch current preferences
   - PUT: Update enabled/frequency

9. **Unsubscribe endpoint**: `src/app/api/digest/unsubscribe/route.ts`
   - Token-based one-click unsubscribe (GDPR compliant)

---

## File Structure

```
src/
├── lib/
│   ├── digest/
│   │   ├── index.ts           # Main orchestrator
│   │   ├── eligibility.ts     # Who gets a digest today?
│   │   ├── computeDiff.ts     # Snapshot diff logic
│   │   ├── templates/
│   │   │   ├── digestEmail.tsx    # React Email template
│   │   │   └── digestEmail.txt    # Plain text fallback
│   │   └── types.ts           # DigestData, BrandDiff, etc.
│   │
│   └── email/
│       └── resend.ts          # Resend client wrapper
│
├── app/
│   └── api/
│       ├── cron/
│       │   └── digest/
│       │       └── route.ts   # Cron endpoint
│       │
│       ├── user/
│       │   └── digest-preferences/
│       │       └── route.ts   # User prefs CRUD
│       │
│       └── digest/
│           └── unsubscribe/
│               └── route.ts   # One-click unsubscribe
```

---

## Eligibility Logic

A user qualifies for a digest email if:

```typescript
function isEligibleForDigest(user: User): boolean {
  // 1. Must be a paid subscriber
  const hasActiveSubscription = user.billingSubscriptions.some(
    (s) => s.status === 'active' || s.status === 'past_due'
  );
  if (!hasActiveSubscription) return false;

  // 2. Must not have opted out
  const prefs = user.digestPreferences;
  if (prefs && !prefs.enabled) return false;

  // 3. Must have at least one brand
  if (user.brands.length === 0) return false;

  // 4. ALL brands must have been analyzed at least once
  const allBrandsAnalyzed = user.brands.every(
    (brand) => brand.analysisSnapshots.length > 0
  );
  if (!allBrandsAnalyzed) return false;

  // 5. Must not have received a digest in the last N days
  const frequency = prefs?.frequency ?? 30;
  const lastDigest = user.digestEmailLogs[0]; // ordered by sentAt desc
  if (lastDigest) {
    const daysSinceLastDigest = daysBetween(lastDigest.sentAt, new Date());
    if (daysSinceLastDigest < frequency) return false;
  }

  // 6. Must have a "previous" snapshot to compare against
  //    (at least 2 snapshots per brand, or 1 snapshot older than 7 days)
  const hasComparableData = user.brands.every((brand) => {
    const snapshots = brand.analysisSnapshots;
    if (snapshots.length < 2) {
      // Single snapshot must be old enough to be meaningful
      const oldest = snapshots[0];
      return oldest && daysBetween(oldest.createdAt, new Date()) >= 7;
    }
    return true;
  });
  if (!hasComparableData) return false;

  return true;
}
```

---

## Diff Computation Example

```typescript
interface BrandDiff {
  brandId: string;
  brandName: string;

  // Overall score
  previousScore: number;
  currentScore: number;
  scoreDelta: number; // +6, -3, 0

  // Mentions by engine
  mentions: {
    engine: 'chatgpt' | 'gemini' | 'perplexity';
    previous: number;
    current: number;
    delta: number;
  }[];

  // Sentiment shift
  sentiment: {
    previous: { positive: number; neutral: number; negative: number };
    current: { positive: number; neutral: number; negative: number };
  };

  // Competitor changes
  competitorMovement: {
    name: string;
    previousRank: number | null;
    currentRank: number | null;
    direction: 'up' | 'down' | 'new' | 'dropped' | 'same';
  }[];

  // Top recommendations
  recommendations: string[];
}

async function computeBrandDiff(
  brandId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<BrandDiff> {
  // Get snapshots
  const [previousSnapshot, currentSnapshot] = await Promise.all([
    getSnapshotNearDate(brandId, periodStart),
    getSnapshotNearDate(brandId, periodEnd),
  ]);

  // ... compute all diffs
}
```

---

## Resend Email Template (React Email)

Using [React Email](https://react.email/) for maintainable, beautifully formatted templates:

```tsx
// src/lib/digest/templates/digestEmail.tsx
import {
  Body, Container, Head, Heading, Html, Link, Img,
  Preview, Section, Text, Button, Hr, Row, Column
} from '@react-email/components';

interface DigestEmailProps {
  userName: string;
  brands: BrandDiff[];
  dashboardUrl: string;
  rerunUrl: string;
  unsubscribeUrl: string;
  preferencesUrl: string;
}

// Brand colors
const colors = {
  primary: '#6366f1',      // Indigo-500
  primaryDark: '#4f46e5',  // Indigo-600
  gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  success: '#10b981',      // Emerald-500
  warning: '#f59e0b',      // Amber-500
  danger: '#ef4444',       // Red-500
  textPrimary: '#111827',  // Gray-900
  textSecondary: '#6b7280', // Gray-500
  bgLight: '#f9fafb',      // Gray-50
  border: '#e5e7eb',       // Gray-200
};

export function DigestEmail({
  userName,
  brands,
  dashboardUrl,
  rerunUrl,
  unsubscribeUrl,
  preferencesUrl,
}: DigestEmailProps) {
  const totalScoreDelta = brands.reduce((sum, b) => sum + b.scoreDelta, 0);
  const trend = totalScoreDelta > 0 ? '📈' : totalScoreDelta < 0 ? '📉' : '➡️';
  const firstName = userName.split(' ')[0];

  return (
    <Html>
      <Head>
        <style>{`
          @media only screen and (max-width: 600px) {
            .engine-column { display: block !important; width: 100% !important; margin-bottom: 12px; }
          }
        `}</style>
      </Head>
      <Preview>Your 30-day AI visibility update {trend} — see what changed</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with gradient */}
          <Section style={header}>
            <Img
              src="https://zeeklabs.ai/zeeklabs-logo-white.png"
              width="40"
              height="40"
              alt="ZeekLabs"
              style={{ marginBottom: '16px' }}
            />
            <Heading style={headerTitle}>Your 30-Day AI Visibility Digest</Heading>
            <Text style={headerSubtitle}>
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              {brands.length === 1 ? ` • ${brands[0].brandName}` : ` • ${brands.length} Brands`}
            </Text>
          </Section>

          {/* Greeting */}
          <Section style={sectionPadding}>
            <Text style={greeting}>Hi {firstName},</Text>
            <Text style={bodyText}>
              Here's how your brand performed across AI engines this month.
              AI recommendations change constantly — a lot can shift in 30 days.
            </Text>
          </Section>

          {/* Per-brand sections */}
          {brands.map((brand) => (
            <Section key={brand.brandId} style={brandSection}>
              {brands.length > 1 && (
                <Heading as="h2" style={brandHeading}>{brand.brandName}</Heading>
              )}

              {/* Overall Score Card */}
              <Section style={scoreCard}>
                <Text style={scoreLabel}>Overall AI Visibility Score</Text>
                <Text style={scoreValue}>{brand.currentScore}%</Text>
                <Text style={{
                  ...scoreDelta,
                  color: brand.scoreDelta > 0 ? colors.success : brand.scoreDelta < 0 ? colors.danger : colors.textSecondary,
                }}>
                  {brand.scoreDelta > 0 ? '↑' : brand.scoreDelta < 0 ? '↓' : '→'} {Math.abs(brand.scoreDelta)} points from last month
                </Text>
              </Section>

              {/* Engine Breakdown */}
              <Row style={engineRow}>
                {brand.mentions.map((engine) => (
                  <Column key={engine.engine} className="engine-column" style={engineColumn}>
                    <Section style={engineCard}>
                      <Text style={engineName}>{engine.engine}</Text>
                      <Text style={{
                        ...engineCount,
                        color: engine.delta > 0 ? colors.success : engine.delta < 0 ? colors.danger : colors.textPrimary,
                      }}>
                        {engine.delta > 0 ? '↑' : engine.delta < 0 ? '↓' : '→'} {engine.current}
                      </Text>
                      <Text style={engineLabel}>mentions</Text>
                      <Text style={enginePrevious}>
                        {engine.delta !== 0 ? `was ${engine.previous}` : 'unchanged'}
                      </Text>
                    </Section>
                  </Column>
                ))}
              </Row>

              {/* Competitor Watch */}
              {brand.competitorMovement.length > 0 && (
                <Section style={competitorSection}>
                  <Heading as="h3" style={sectionHeading}>Competitor Watch</Heading>
                  {brand.competitorMovement.slice(0, 3).map((comp, i) => (
                    <Text key={i} style={competitorItem}>
                      {comp.direction === 'up' ? '📈' : comp.direction === 'down' ? '📉' : '🎉'} {comp.name} {getCompetitorMessage(comp)}
                    </Text>
                  ))}
                </Section>
              )}

              {/* Recommendations */}
              {brand.recommendations.length > 0 && (
                <Section style={recommendationsSection}>
                  <Heading as="h3" style={sectionHeading}>Top Recommendations</Heading>
                  {brand.recommendations.slice(0, 3).map((rec, i) => (
                    <Text key={i} style={recommendationItem}>
                      <span style={recommendationNumber}>{i + 1}</span> {rec}
                    </Text>
                  ))}
                </Section>
              )}
            </Section>
          ))}

          {/* CTA Section */}
          <Section style={ctaSection}>
            <Text style={ctaTitle}>🔄 Time for a fresh analysis?</Text>
            <Text style={ctaText}>
              AI engines update their knowledge constantly. Run a new analysis to see
              exactly where you stand today and get updated recommendations.
            </Text>
            <Button href={rerunUrl} style={primaryButton}>
              Re-run Analysis →
            </Button>
            <Button href={dashboardUrl} style={secondaryButton}>
              View Full Dashboard
            </Button>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Img
              src="https://zeeklabs.ai/zeeklabs-logo.svg"
              width="32"
              height="32"
              alt="ZeekLabs"
              style={{ marginBottom: '12px' }}
            />
            <Text style={footerTagline}>AI Visibility Monitoring for Modern Brands</Text>
            <Text style={footerLinks}>
              <Link href={preferencesUrl} style={footerLink}>Manage preferences</Link>
              {' • '}
              <Link href={unsubscribeUrl} style={footerLink}>Unsubscribe</Link>
            </Text>
            <Text style={footerAddress}>
              CLIKBOUND PRIVATE LIMITED<br />
              HNO 318, Nivant House, Virar (West), Maharashtra — 401301
            </Text>
            <Text style={footerCopyright}>© 2026 ZeekLabs.ai</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f3f4f6',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '600px',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
};

const header = {
  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  padding: '32px 24px',
  textAlign: 'center' as const,
};

const headerTitle = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 8px',
};

const headerSubtitle = {
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: '14px',
  margin: '0',
};

const sectionPadding = { padding: '24px' };

const greeting = {
  fontSize: '18px',
  fontWeight: '600',
  color: colors.textPrimary,
  margin: '0 0 8px',
};

const bodyText = {
  fontSize: '15px',
  color: colors.textSecondary,
  lineHeight: '1.6',
  margin: '0',
};

const brandSection = {
  padding: '0 24px 24px',
};

const brandHeading = {
  fontSize: '18px',
  fontWeight: '600',
  color: colors.textPrimary,
  borderBottom: `2px solid ${colors.primary}`,
  paddingBottom: '8px',
  marginBottom: '16px',
};

const scoreCard = {
  background: 'linear-gradient(135deg, #eef2ff 0%, #faf5ff 100%)',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center' as const,
  marginBottom: '16px',
};

const scoreLabel = {
  fontSize: '14px',
  color: colors.textSecondary,
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const scoreValue = {
  fontSize: '48px',
  fontWeight: '700',
  color: colors.primary,
  margin: '0',
};

const scoreDelta = {
  fontSize: '14px',
  fontWeight: '500',
  margin: '8px 0 0',
};

const engineRow = { marginBottom: '16px' };

const engineColumn = {
  width: '33.33%',
  padding: '0 4px',
};

const engineCard = {
  backgroundColor: colors.bgLight,
  borderRadius: '8px',
  padding: '16px 12px',
  textAlign: 'center' as const,
};

const engineName = {
  fontSize: '12px',
  fontWeight: '600',
  color: colors.textSecondary,
  textTransform: 'uppercase' as const,
  margin: '0 0 8px',
};

const engineCount = {
  fontSize: '24px',
  fontWeight: '700',
  margin: '0',
};

const engineLabel = {
  fontSize: '12px',
  color: colors.textSecondary,
  margin: '4px 0',
};

const enginePrevious = {
  fontSize: '11px',
  color: colors.textSecondary,
  margin: '0',
};

const competitorSection = {
  backgroundColor: colors.bgLight,
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '16px',
};

const sectionHeading = {
  fontSize: '14px',
  fontWeight: '600',
  color: colors.textPrimary,
  margin: '0 0 12px',
};

const competitorItem = {
  fontSize: '14px',
  color: colors.textSecondary,
  margin: '0 0 8px',
  lineHeight: '1.5',
};

const recommendationsSection = {
  marginBottom: '16px',
};

const recommendationItem = {
  fontSize: '14px',
  color: colors.textSecondary,
  margin: '0 0 8px',
  lineHeight: '1.5',
};

const recommendationNumber = {
  display: 'inline-block',
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  backgroundColor: colors.primary,
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: '600',
  textAlign: 'center' as const,
  lineHeight: '20px',
  marginRight: '8px',
};

const ctaSection = {
  backgroundColor: colors.bgLight,
  padding: '32px 24px',
  textAlign: 'center' as const,
};

const ctaTitle = {
  fontSize: '18px',
  fontWeight: '600',
  color: colors.textPrimary,
  margin: '0 0 8px',
};

const ctaText = {
  fontSize: '14px',
  color: colors.textSecondary,
  lineHeight: '1.6',
  margin: '0 0 20px',
};

const primaryButton = {
  backgroundColor: colors.primary,
  color: '#ffffff',
  padding: '14px 28px',
  borderRadius: '8px',
  fontSize: '15px',
  fontWeight: '600',
  textDecoration: 'none',
  display: 'inline-block',
  marginBottom: '12px',
};

const secondaryButton = {
  backgroundColor: 'transparent',
  color: colors.primary,
  padding: '12px 24px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '500',
  textDecoration: 'none',
  display: 'inline-block',
  border: `1px solid ${colors.border}`,
};

const divider = {
  borderColor: colors.border,
  margin: '0',
};

const footer = {
  padding: '24px',
  textAlign: 'center' as const,
};

const footerTagline = {
  fontSize: '13px',
  color: colors.textSecondary,
  margin: '0 0 12px',
};

const footerLinks = {
  fontSize: '13px',
  margin: '0 0 16px',
};

const footerLink = {
  color: colors.primary,
  textDecoration: 'none',
};

const footerAddress = {
  fontSize: '11px',
  color: colors.textSecondary,
  lineHeight: '1.5',
  margin: '0 0 8px',
};

const footerCopyright = {
  fontSize: '11px',
  color: colors.textSecondary,
  margin: '0',
};

function getCompetitorMessage(comp: { direction: string; name: string }): string {
  switch (comp.direction) {
    case 'up': return 'moved up in AI recommendations';
    case 'down': return 'dropped in visibility';
    case 'new': return 'is newly appearing in AI results';
    default: return 'stayed steady';
  }
}
```

---

## Cron Endpoint

```typescript
// src/app/api/cron/digest/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { processDigestBatch } from '@/lib/digest';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max

export async function POST(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await processDigestBatch({
      batchSize: 50, // Process 50 users per invocation
    });

    return NextResponse.json({
      processed: result.processed,
      sent: result.sent,
      skipped: result.skipped,
      errors: result.errors,
    });
  } catch (error) {
    console.error('[cron/digest] failed:', error);
    return NextResponse.json({ error: 'Digest processing failed' }, { status: 500 });
  }
}
```

---

## Environment Variables

Add to `.env`:

```bash
# Resend (email delivery)
# Use the SAME Resend API key from ClikHire repo (paid account under CLIKBOUND)
# This allows us to use the same verified domain and billing
RESEND_API_KEY=re_xxxxxxxxxxxxx  # Copy from ClikHire .env
RESEND_FROM_EMAIL="ZeekLabs <digest@zeeklabs.ai>"

# NOTE: You'll need to add zeeklabs.ai as a verified domain in Resend dashboard
# (same Resend account as ClikHire). Go to: https://resend.com/domains
# Add DNS records for zeeklabs.ai to enable sending from @zeeklabs.ai

# Cron security
CRON_SECRET=your-secure-random-string

# App URLs (for email links)
NEXTAUTH_URL=https://zeeklabs.ai
```

### Resend Domain Setup

Since we're using the shared CLIKBOUND Resend account (same as ClikHire):

1. **Log into Resend** with the CLIKBOUND account
2. **Go to Domains** → Add zeeklabs.ai
3. **Add DNS records** to your domain registrar:
   - SPF record (TXT)
   - DKIM record (TXT)
   - Optional: DMARC record
4. **Verify** the domain in Resend dashboard
5. **Copy the API key** from ClikHire's `.env` to ZeekLabs' `.env`

---

## Rollout Plan

| Phase | Timeline | Deliverable |
|-------|----------|-------------|
| 1. Schema + Migration | Day 1 | `DigestEmailLog`, `DigestPreferences` tables |
| 2. Diff Logic | Day 2-3 | `computeDiff.ts` with unit tests |
| 3. Email Template | Day 3-4 | React Email template + plain text |
| 4. Resend Integration | Day 4 | Send test emails to internal team |
| 5. Cron Endpoint | Day 5 | API route + manual trigger for testing |
| 6. User Preferences UI | Day 6 | Settings page toggle |
| 7. Production Cron | Day 7 | AWS EventBridge or Vercel Cron |
| 8. Monitor & Iterate | Ongoing | Track open rates, clicks, unsubscribes |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| **Open Rate** | > 40% (industry avg for SaaS is ~25%) |
| **Click-through to Dashboard** | > 15% |
| **Unsubscribe Rate** | < 1% per month |
| **Churn Reduction** | 10% reduction in monthly churn for digest recipients |

---

## Future Enhancements

1. **Weekly Digest** option for Scale tier
2. **Slack/Discord Integration** — Post digest to user's workspace
3. **AI-Generated Insights** — Use LLM to write personalized commentary
4. **Comparative Industry Benchmarks** — "Your visibility is 20% above average for {industry}"
5. **Alert Triggers** — Immediate email if score drops > 10 points
