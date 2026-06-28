# 8. API Design

## 8.1 Overview

This document details the comprehensive API design for the AI Visibility Platform. The API follows REST principles with GraphQL support for complex queries, providing a unified interface for all platform functionality.

---

## 8.2 API Design Principles

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         API DESIGN PRINCIPLES                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. REST-FIRST APPROACH                                                    │
│     • Resource-oriented URLs                                               │
│     • Standard HTTP methods (GET, POST, PUT, PATCH, DELETE)               │
│     • Consistent response formats                                          │
│     • HATEOAS links for discoverability                                   │
│                                                                             │
│  2. VERSIONING STRATEGY                                                    │
│     • URL path versioning: /api/v1/, /api/v2/                             │
│     • Major versions for breaking changes                                  │
│     • 12-month deprecation policy                                          │
│     • Version sunset notifications                                         │
│                                                                             │
│  3. AUTHENTICATION                                                         │
│     • OAuth 2.0 for user authentication                                    │
│     • API keys for service-to-service                                     │
│     • JWT tokens with short expiry                                        │
│     • Scoped permissions                                                   │
│                                                                             │
│  4. RATE LIMITING                                                          │
│     • Per-user and per-API-key limits                                     │
│     • Tiered limits by subscription                                       │
│     • Graceful degradation                                                │
│     • Rate limit headers in responses                                     │
│                                                                             │
│  5. ERROR HANDLING                                                         │
│     • Consistent error response format                                    │
│     • Detailed error codes                                                │
│     • Actionable error messages                                           │
│     • Request ID for debugging                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8.3 REST API Specification

### 8.3.1 Base URL & Headers

```
Base URL: https://api.ai-visibility.io/v1

Required Headers:
  Authorization: Bearer <access_token>
  Content-Type: application/json
  Accept: application/json
  X-Request-ID: <uuid>  (optional, auto-generated if not provided)

Response Headers:
  X-Request-ID: <uuid>
  X-RateLimit-Limit: 1000
  X-RateLimit-Remaining: 999
  X-RateLimit-Reset: 1704067200
```

### 8.3.2 Authentication Endpoints

```yaml
# Authentication API

POST /auth/register
  description: Register a new user account
  request:
    body:
      email: string (required)
      password: string (required, min 12 chars)
      full_name: string (required)
      company: string (optional)
  response:
    201:
      user: User
      access_token: string
      refresh_token: string

POST /auth/login
  description: Authenticate user and get tokens
  request:
    body:
      email: string (required)
      password: string (required)
      mfa_code: string (optional, required if MFA enabled)
  response:
    200:
      user: User
      access_token: string
      refresh_token: string
      requires_mfa: boolean
    401:
      error: "invalid_credentials"

POST /auth/logout
  description: Invalidate current session
  response:
    204: No Content

POST /auth/refresh
  description: Refresh access token
  request:
    body:
      refresh_token: string (required)
  response:
    200:
      access_token: string
      refresh_token: string

POST /auth/forgot-password
  description: Initiate password reset
  request:
    body:
      email: string (required)
  response:
    200:
      message: "Reset email sent"

POST /auth/reset-password
  description: Complete password reset
  request:
    body:
      token: string (required)
      password: string (required)
  response:
    200:
      message: "Password reset successful"

POST /auth/mfa/enable
  description: Enable MFA for user
  response:
    200:
      secret: string
      qr_code: string (base64)
      backup_codes: string[]

POST /auth/mfa/verify
  description: Verify MFA setup
  request:
    body:
      code: string (required)
  response:
    200:
      verified: true
```

### 8.3.3 Workspace Endpoints

```yaml
# Workspace API

GET /workspaces
  description: List workspaces for current user
  query:
    page: integer (default: 1)
    per_page: integer (default: 20, max: 100)
  response:
    200:
      data: Workspace[]
      pagination: Pagination

POST /workspaces
  description: Create new workspace
  request:
    body:
      name: string (required)
      slug: string (optional, auto-generated)
  response:
    201:
      workspace: Workspace

GET /workspaces/{workspace_id}
  description: Get workspace details
  response:
    200:
      workspace: Workspace

PATCH /workspaces/{workspace_id}
  description: Update workspace
  request:
    body:
      name: string
      settings: object
  response:
    200:
      workspace: Workspace

DELETE /workspaces/{workspace_id}
  description: Delete workspace (soft delete)
  response:
    204: No Content

GET /workspaces/{workspace_id}/members
  description: List workspace members
  response:
    200:
      data: Member[]

POST /workspaces/{workspace_id}/members
  description: Invite member to workspace
  request:
    body:
      email: string (required)
      role: string (required: viewer, analyst, manager, admin)
  response:
    201:
      member: Member
      invitation: Invitation

DELETE /workspaces/{workspace_id}/members/{member_id}
  description: Remove member from workspace
  response:
    204: No Content
```

### 8.3.4 Brand Monitoring Endpoints

```yaml
# Brand Monitoring API

GET /workspaces/{workspace_id}/brands
  description: List monitored brands
  query:
    status: string (active, paused, all)
  response:
    200:
      data: Brand[]

POST /workspaces/{workspace_id}/brands
  description: Add brand to monitoring
  request:
    body:
      name: string (required)
      display_name: string
      domain: string
      keywords: string[]
      competitors: string[]
      settings:
        monitoring_frequency: string (hourly, daily, weekly)
        ai_providers: string[]
  response:
    201:
      brand: Brand

GET /workspaces/{workspace_id}/brands/{brand_id}
  description: Get brand details
  response:
    200:
      brand: Brand
      stats:
        total_citations: integer
        visibility_score: number
        last_monitored: datetime

PATCH /workspaces/{workspace_id}/brands/{brand_id}
  description: Update brand configuration
  request:
    body:
      name: string
      keywords: string[]
      settings: object
  response:
    200:
      brand: Brand

DELETE /workspaces/{workspace_id}/brands/{brand_id}
  description: Remove brand from monitoring
  response:
    204: No Content

# Prompts
GET /workspaces/{workspace_id}/brands/{brand_id}/prompts
  description: List monitoring prompts
  response:
    200:
      data: Prompt[]

POST /workspaces/{workspace_id}/brands/{brand_id}/prompts
  description: Create monitoring prompt
  request:
    body:
      name: string (required)
      template: string (required)
      category: string
      ai_providers: string[]
      schedule: string (cron expression)
      is_active: boolean
  response:
    201:
      prompt: Prompt

PUT /workspaces/{workspace_id}/brands/{brand_id}/prompts/{prompt_id}
  description: Update prompt
  response:
    200:
      prompt: Prompt

DELETE /workspaces/{workspace_id}/brands/{brand_id}/prompts/{prompt_id}
  description: Delete prompt
  response:
    204: No Content

# Manual Monitoring Run
POST /workspaces/{workspace_id}/brands/{brand_id}/monitor
  description: Trigger manual monitoring run
  request:
    body:
      prompt_ids: string[] (optional, all if empty)
      ai_providers: string[] (optional)
  response:
    202:
      run_id: string
      status: "queued"
```

### 8.3.5 Citation & Visibility Endpoints

```yaml
# Citations API

GET /workspaces/{workspace_id}/citations
  description: List citations with filters
  query:
    brand_id: string
    source: string (chatgpt, claude, gemini, perplexity)
    sentiment: string (positive, negative, neutral)
    type: string (mention, recommendation, comparison)
    start_date: date
    end_date: date
    page: integer
    per_page: integer
    sort: string (detected_at, sentiment_score)
    order: string (asc, desc)
  response:
    200:
      data: Citation[]
      pagination: Pagination
      summary:
        total: integer
        positive: integer
        negative: integer
        neutral: integer

GET /workspaces/{workspace_id}/citations/{citation_id}
  description: Get citation details
  response:
    200:
      citation: Citation
      context:
        prompt: string
        full_response: string
        position: integer

GET /workspaces/{workspace_id}/citations/search
  description: Full-text search citations
  query:
    q: string (required)
    filters: object
  response:
    200:
      data: Citation[]
      total: integer

POST /workspaces/{workspace_id}/citations/export
  description: Export citations
  request:
    body:
      format: string (csv, json, excel)
      filters: object
  response:
    202:
      export_id: string
      status: "processing"

# Visibility API

GET /workspaces/{workspace_id}/visibility
  description: Get visibility dashboard data
  query:
    brand_id: string (optional, aggregate if not provided)
    period: string (7d, 30d, 90d)
  response:
    200:
      overall_score: number
      components:
        citation: number
        sentiment: number
        recommendation: number
        coverage: number
        position: number
        trend: number
      ai_system_scores:
        chatgpt: number
        claude: number
        gemini: number
        perplexity: number
      trend:
        direction: string (up, down, stable)
        change: number

GET /workspaces/{workspace_id}/visibility/history
  description: Get visibility score history
  query:
    brand_id: string
    start_date: date
    end_date: date
    granularity: string (hour, day, week)
  response:
    200:
      data:
        - timestamp: datetime
          score: number
          components: object

GET /workspaces/{workspace_id}/visibility/benchmark
  description: Compare visibility against competitors
  query:
    brand_id: string (required)
  response:
    200:
      brand:
        name: string
        score: number
      competitors:
        - name: string
          score: number
          difference: number
```

### 8.3.6 Analytics & Reports Endpoints

```yaml
# Analytics API

GET /workspaces/{workspace_id}/analytics/overview
  description: Get analytics overview
  query:
    period: string
  response:
    200:
      metrics:
        total_queries: integer
        total_citations: integer
        avg_visibility_score: number
        sentiment_distribution: object
      trends:
        citations_trend: object
        visibility_trend: object

GET /workspaces/{workspace_id}/analytics/ai-systems
  description: Get per-AI-system analytics
  query:
    period: string
  response:
    200:
      systems:
        - name: string
          queries: integer
          citations: integer
          mention_rate: number
          avg_sentiment: number

GET /workspaces/{workspace_id}/analytics/topics
  description: Get topic analysis
  query:
    brand_id: string
    period: string
  response:
    200:
      topics:
        - name: string
          count: integer
          sentiment: number
          trend: string

# Reports API

GET /workspaces/{workspace_id}/reports
  description: List reports
  query:
    status: string
    type: string
  response:
    200:
      data: Report[]

POST /workspaces/{workspace_id}/reports
  description: Generate new report
  request:
    body:
      name: string (required)
      type: string (executive, detailed, competitive)
      format: string (pdf, excel)
      parameters:
        brand_ids: string[]
        start_date: date
        end_date: date
        include_recommendations: boolean
  response:
    202:
      report: Report
      status: "processing"

GET /workspaces/{workspace_id}/reports/{report_id}
  description: Get report details
  response:
    200:
      report: Report

GET /workspaces/{workspace_id}/reports/{report_id}/download
  description: Download report file
  response:
    200:
      Content-Type: application/pdf (or appropriate type)
      Content-Disposition: attachment

# Report Schedules
GET /workspaces/{workspace_id}/reports/schedules
  description: List report schedules
  response:
    200:
      data: ReportSchedule[]

POST /workspaces/{workspace_id}/reports/schedules
  description: Create report schedule
  request:
    body:
      name: string
      template_id: string
      cron: string
      recipients: string[]
      parameters: object
  response:
    201:
      schedule: ReportSchedule
```

### 8.3.7 Alerts Endpoints

```yaml
# Alerts API

GET /workspaces/{workspace_id}/alerts/rules
  description: List alert rules
  response:
    200:
      data: AlertRule[]

POST /workspaces/{workspace_id}/alerts/rules
  description: Create alert rule
  request:
    body:
      name: string (required)
      type: string (visibility_drop, negative_mention, competitor_surge)
      condition:
        metric: string
        operator: string (gt, lt, eq, change)
        value: number
        window: string
      threshold:
        warning: number
        critical: number
      channels:
        - type: string (email, slack, webhook)
          config: object
      cooldown_minutes: integer
  response:
    201:
      rule: AlertRule

GET /workspaces/{workspace_id}/alerts/rules/{rule_id}
  description: Get alert rule details
  response:
    200:
      rule: AlertRule

PATCH /workspaces/{workspace_id}/alerts/rules/{rule_id}
  description: Update alert rule
  response:
    200:
      rule: AlertRule

DELETE /workspaces/{workspace_id}/alerts/rules/{rule_id}
  description: Delete alert rule
  response:
    204: No Content

GET /workspaces/{workspace_id}/alerts/history
  description: List alert history
  query:
    status: string (triggered, acknowledged, resolved)
    start_date: date
    end_date: date
  response:
    200:
      data: Alert[]

POST /workspaces/{workspace_id}/alerts/{alert_id}/acknowledge
  description: Acknowledge alert
  response:
    200:
      alert: Alert
```

---

## 8.4 GraphQL API

### 8.4.1 Schema Overview

```graphql
# GraphQL Schema

type Query {
  # User & Workspace
  me: User!
  workspace(id: ID!): Workspace
  workspaces(first: Int, after: String): WorkspaceConnection!

  # Brands & Monitoring
  brand(id: ID!): Brand
  brands(workspaceId: ID!, status: BrandStatus): [Brand!]!

  # Citations
  citations(
    workspaceId: ID!
    brandId: ID
    filters: CitationFilters
    first: Int
    after: String
  ): CitationConnection!

  citation(id: ID!): Citation

  # Visibility
  visibility(
    workspaceId: ID!
    brandId: ID
    period: Period
  ): VisibilityScore!

  visibilityHistory(
    workspaceId: ID!
    brandId: ID!
    startDate: DateTime!
    endDate: DateTime!
    granularity: Granularity
  ): [VisibilityDataPoint!]!

  # Analytics
  analytics(
    workspaceId: ID!
    period: Period
  ): AnalyticsOverview!

  # Search
  search(
    workspaceId: ID!
    query: String!
    types: [SearchType!]
  ): SearchResults!
}

type Mutation {
  # Workspace
  createWorkspace(input: CreateWorkspaceInput!): Workspace!
  updateWorkspace(id: ID!, input: UpdateWorkspaceInput!): Workspace!
  deleteWorkspace(id: ID!): Boolean!
  inviteMember(workspaceId: ID!, input: InviteMemberInput!): Member!
  removeMember(workspaceId: ID!, memberId: ID!): Boolean!

  # Brands
  createBrand(workspaceId: ID!, input: CreateBrandInput!): Brand!
  updateBrand(id: ID!, input: UpdateBrandInput!): Brand!
  deleteBrand(id: ID!): Boolean!

  # Prompts
  createPrompt(brandId: ID!, input: CreatePromptInput!): Prompt!
  updatePrompt(id: ID!, input: UpdatePromptInput!): Prompt!
  deletePrompt(id: ID!): Boolean!

  # Monitoring
  triggerMonitoring(brandId: ID!, input: MonitoringInput): MonitoringRun!

  # Alerts
  createAlertRule(workspaceId: ID!, input: CreateAlertRuleInput!): AlertRule!
  updateAlertRule(id: ID!, input: UpdateAlertRuleInput!): AlertRule!
  deleteAlertRule(id: ID!): Boolean!
  acknowledgeAlert(id: ID!): Alert!

  # Reports
  generateReport(workspaceId: ID!, input: GenerateReportInput!): Report!
}

type Subscription {
  # Real-time updates
  visibilityUpdated(workspaceId: ID!, brandId: ID): VisibilityScore!
  citationDetected(workspaceId: ID!, brandId: ID): Citation!
  alertTriggered(workspaceId: ID!): Alert!
  monitoringCompleted(runId: ID!): MonitoringRun!
}

# Types

type User {
  id: ID!
  email: String!
  fullName: String!
  avatarUrl: String
  workspaces: [Workspace!]!
  createdAt: DateTime!
}

type Workspace {
  id: ID!
  name: String!
  slug: String!
  owner: User!
  members: [Member!]!
  brands: [Brand!]!
  plan: Plan!
  settings: WorkspaceSettings!
  createdAt: DateTime!
}

type Brand {
  id: ID!
  name: String!
  displayName: String
  domain: String
  keywords: [String!]!
  competitors: [Brand!]
  prompts: [Prompt!]!
  settings: BrandSettings!
  isActive: Boolean!
  lastMonitoredAt: DateTime
  stats: BrandStats!
  createdAt: DateTime!
}

type Citation {
  id: ID!
  brand: Brand!
  source: AISystem!
  sourceModel: String!
  promptUsed: String!
  responseText: String!
  citationText: String!
  citationContext: String
  citationType: CitationType!
  sentiment: Sentiment!
  sentimentScore: Float!
  confidenceScore: Float!
  positionInResponse: Int!
  isRecommendation: Boolean!
  competitorsMentioned: [Brand!]
  detectedAt: DateTime!
  metadata: JSON
}

type VisibilityScore {
  overallScore: Float!
  components: VisibilityComponents!
  aiSystemScores: [AISystemScore!]!
  trend: Trend!
  confidence: Float!
  sampleSize: Int!
  calculatedAt: DateTime!
}

type VisibilityComponents {
  citationScore: Float!
  sentimentScore: Float!
  recommendationScore: Float!
  coverageScore: Float!
  positionScore: Float!
  trendScore: Float!
}

# Enums

enum AISystem {
  CHATGPT
  CLAUDE
  GEMINI
  PERPLEXITY
  COPILOT
}

enum Sentiment {
  POSITIVE
  NEGATIVE
  NEUTRAL
}

enum CitationType {
  MENTION
  RECOMMENDATION
  COMPARISON
  FEATURE_ATTRIBUTION
  NEGATIVE_MENTION
}

enum Period {
  LAST_7_DAYS
  LAST_30_DAYS
  LAST_90_DAYS
  LAST_YEAR
  CUSTOM
}

enum Granularity {
  HOUR
  DAY
  WEEK
  MONTH
}

# Inputs

input CitationFilters {
  brandId: ID
  sources: [AISystem!]
  sentiments: [Sentiment!]
  types: [CitationType!]
  startDate: DateTime
  endDate: DateTime
  searchQuery: String
}

input CreateBrandInput {
  name: String!
  displayName: String
  domain: String
  keywords: [String!]
  competitors: [ID!]
  settings: BrandSettingsInput
}

input CreatePromptInput {
  name: String!
  template: String!
  category: String
  aiProviders: [AISystem!]
  schedule: String
  isActive: Boolean
}

# Connections (Relay-style pagination)

type CitationConnection {
  edges: [CitationEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
  summary: CitationSummary!
}

type CitationEdge {
  node: Citation!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

---

## 8.5 Response Formats

### 8.5.1 Standard Response Structure

```json
// Success Response
{
  "data": {
    // Response payload
  },
  "meta": {
    "request_id": "req_abc123xyz",
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "v1"
  }
}

// Paginated Response
{
  "data": [
    // Array of items
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total_items": 150,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  },
  "meta": {
    "request_id": "req_abc123xyz",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}

// Error Response
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request body contains invalid fields",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format",
        "code": "INVALID_FORMAT"
      }
    ],
    "request_id": "req_abc123xyz",
    "documentation_url": "https://docs.ai-visibility.io/errors/VALIDATION_ERROR"
  }
}
```

### 8.5.2 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or expired authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request body |
| `RATE_LIMITED` | 429 | Too many requests |
| `CONFLICT` | 409 | Resource conflict |
| `INTERNAL_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |
| `QUOTA_EXCEEDED` | 402 | Usage quota exceeded |

---

## 8.6 Rate Limiting

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         RATE LIMITING TIERS                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  TIER LIMITS                                                               │
│  ───────────                                                                │
│                                                                             │
│  │ Tier         │ Requests/Min │ Requests/Hour │ Requests/Day │           │
│  ├──────────────┼──────────────┼───────────────┼──────────────┤           │
│  │ Free Trial   │ 30           │ 500           │ 5,000        │           │
│  │ Starter      │ 60           │ 1,000         │ 10,000       │           │
│  │ Professional │ 300          │ 10,000        │ 100,000      │           │
│  │ Enterprise   │ 1,000        │ 50,000        │ 500,000      │           │
│  │ Custom       │ Negotiated   │ Negotiated    │ Negotiated   │           │
│                                                                             │
│  ENDPOINT-SPECIFIC LIMITS                                                  │
│  ────────────────────────                                                   │
│                                                                             │
│  │ Endpoint Type        │ Limit Factor │ Notes                  │         │
│  ├──────────────────────┼──────────────┼────────────────────────┤         │
│  │ Read endpoints       │ 1x           │ Standard tier limits   │         │
│  │ Write endpoints      │ 0.5x         │ Half of standard       │         │
│  │ Search endpoints     │ 0.3x         │ Resource intensive     │         │
│  │ Export endpoints     │ 10/hour      │ Fixed limit            │         │
│  │ Report generation    │ 5/hour       │ Fixed limit            │         │
│  │ Monitoring triggers  │ 20/hour      │ Fixed limit            │         │
│                                                                             │
│  RATE LIMIT HEADERS                                                        │
│  ──────────────────                                                         │
│                                                                             │
│  X-RateLimit-Limit: 1000                                                   │
│  X-RateLimit-Remaining: 999                                                │
│  X-RateLimit-Reset: 1704067200                                             │
│  X-RateLimit-Retry-After: 30 (only on 429)                                │
│                                                                             │
│  BURST HANDLING                                                            │
│  ──────────────                                                             │
│                                                                             │
│  • Token bucket algorithm                                                  │
│  • Burst capacity: 2x normal rate                                         │
│  • Refill rate: 1 token per (60 / rate_limit) seconds                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8.7 Webhook API

### 8.7.1 Webhook Configuration

```yaml
# Webhook Events

events:
  # Citation Events
  - citation.detected
  - citation.sentiment_changed
  - citation.bulk_detected

  # Visibility Events
  - visibility.score_updated
  - visibility.threshold_crossed
  - visibility.trend_changed

  # Alert Events
  - alert.triggered
  - alert.resolved
  - alert.escalated

  # Monitoring Events
  - monitoring.run_started
  - monitoring.run_completed
  - monitoring.run_failed

  # Report Events
  - report.generated
  - report.failed

  # Account Events
  - workspace.member_added
  - workspace.member_removed
  - subscription.changed
  - usage.threshold_reached
```

### 8.7.2 Webhook Payload Format

```json
// Webhook Payload Structure
{
  "id": "evt_abc123xyz",
  "type": "citation.detected",
  "created_at": "2024-01-15T10:30:00Z",
  "workspace_id": "ws_xyz789",
  "data": {
    "citation": {
      "id": "cit_def456",
      "brand_id": "br_ghi789",
      "source": "chatgpt",
      "citation_text": "According to BrandName...",
      "sentiment": "positive",
      "sentiment_score": 0.85,
      "detected_at": "2024-01-15T10:29:55Z"
    }
  },
  "metadata": {
    "api_version": "v1",
    "delivery_attempt": 1
  }
}

// Webhook Signature (in header)
X-Webhook-Signature: sha256=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce8e108d8bd

// Signature Calculation
signature = HMAC-SHA256(webhook_secret, timestamp + "." + payload)
```

### 8.7.3 Webhook Delivery

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         WEBHOOK DELIVERY POLICY                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  RETRY POLICY                                                              │
│  ────────────                                                               │
│                                                                             │
│  Attempt 1: Immediate                                                      │
│  Attempt 2: 1 minute                                                       │
│  Attempt 3: 5 minutes                                                      │
│  Attempt 4: 30 minutes                                                     │
│  Attempt 5: 2 hours                                                        │
│                                                                             │
│  After 5 failed attempts:                                                  │
│  • Webhook marked as failing                                               │
│  • Alert sent to workspace admin                                           │
│  • Events queued (up to 72 hours)                                         │
│                                                                             │
│  SUCCESS CRITERIA                                                          │
│  ────────────────                                                           │
│                                                                             │
│  • HTTP 2xx status code                                                    │
│  • Response within 30 seconds                                              │
│                                                                             │
│  FAILURE HANDLING                                                          │
│  ────────────────                                                           │
│                                                                             │
│  • 4xx errors: Do not retry (except 429)                                  │
│  • 429: Retry with exponential backoff                                    │
│  • 5xx errors: Retry according to policy                                  │
│  • Timeout: Retry according to policy                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8.8 SDK Support

### 8.8.1 Official SDKs

```javascript
// JavaScript/TypeScript SDK

import { AIVisibilityClient } from '@ai-visibility/sdk';

const client = new AIVisibilityClient({
  apiKey: 'avp_xxx...',
  baseUrl: 'https://api.ai-visibility.io', // optional
});

// List citations
const citations = await client.citations.list({
  workspaceId: 'ws_xxx',
  filters: {
    sentiment: 'positive',
    source: 'chatgpt',
  },
  pagination: {
    page: 1,
    perPage: 20,
  },
});

// Get visibility score
const visibility = await client.visibility.get({
  workspaceId: 'ws_xxx',
  brandId: 'br_xxx',
  period: '30d',
});

// Trigger monitoring
const run = await client.monitoring.trigger({
  brandId: 'br_xxx',
  promptIds: ['pr_xxx', 'pr_yyy'],
});

// Subscribe to real-time updates (WebSocket)
client.subscribe('citation.detected', (event) => {
  console.log('New citation:', event.data.citation);
});
```

```python
# Python SDK

from ai_visibility import Client

client = Client(api_key="avp_xxx...")

# List citations
citations = client.citations.list(
    workspace_id="ws_xxx",
    filters={
        "sentiment": "positive",
        "source": "chatgpt",
    },
    page=1,
    per_page=20,
)

# Get visibility score
visibility = client.visibility.get(
    workspace_id="ws_xxx",
    brand_id="br_xxx",
    period="30d",
)

# Trigger monitoring
run = client.monitoring.trigger(
    brand_id="br_xxx",
    prompt_ids=["pr_xxx", "pr_yyy"],
)

# Async support
import asyncio

async def main():
    async with client.async_client() as async_client:
        citations = await async_client.citations.list(
            workspace_id="ws_xxx"
        )
```

---

## 8.9 API Documentation

### 8.9.1 OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: AI Visibility Platform API
  version: 1.0.0
  description: |
    API for monitoring and optimizing brand visibility across AI systems.

    ## Authentication
    All API requests require authentication via Bearer token or API key.

    ## Rate Limiting
    Requests are rate limited based on your subscription tier.

  contact:
    name: API Support
    email: api-support@ai-visibility.io
    url: https://docs.ai-visibility.io

servers:
  - url: https://api.ai-visibility.io/v1
    description: Production
  - url: https://api-staging.ai-visibility.io/v1
    description: Staging

security:
  - bearerAuth: []
  - apiKeyAuth: []

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
    apiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key

  schemas:
    Citation:
      type: object
      properties:
        id:
          type: string
          format: uuid
        brand_id:
          type: string
          format: uuid
        source:
          type: string
          enum: [chatgpt, claude, gemini, perplexity, copilot]
        citation_text:
          type: string
        sentiment:
          type: string
          enum: [positive, negative, neutral]
        sentiment_score:
          type: number
          minimum: -1
          maximum: 1
        detected_at:
          type: string
          format: date-time

    Error:
      type: object
      required:
        - error
      properties:
        error:
          type: object
          properties:
            code:
              type: string
            message:
              type: string
            request_id:
              type: string
```

---

*Document Version: 1.0*
*Last Updated: 2026-06-28*
*Next Review: 2026-07-28*
