# 5. Microservices Architecture

## 5.1 Overview

This document details the microservices architecture for the AI Visibility Platform. The system is designed as a collection of loosely coupled, independently deployable services that communicate through well-defined APIs and events.

---

## 5.2 Architecture Principles

### 5.2.1 Design Principles

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MICROSERVICES DESIGN PRINCIPLES                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. SINGLE RESPONSIBILITY                                                   │
│     ──────────────────────                                                  │
│     Each service owns a specific business capability                       │
│     • Clear boundaries and ownership                                       │
│     • Independent data stores                                              │
│     • Focused domain logic                                                 │
│                                                                             │
│  2. LOOSE COUPLING                                                         │
│     ──────────────                                                          │
│     Services are independent and communicate through contracts             │
│     • API versioning                                                       │
│     • Event-driven communication                                           │
│     • No shared databases                                                  │
│                                                                             │
│  3. HIGH COHESION                                                          │
│     ─────────────                                                           │
│     Related functionality grouped together                                 │
│     • Domain-driven design                                                 │
│     • Bounded contexts                                                     │
│     • Team ownership                                                       │
│                                                                             │
│  4. RESILIENCE                                                             │
│     ──────────                                                              │
│     Services handle failures gracefully                                    │
│     • Circuit breakers                                                     │
│     • Retry with backoff                                                   │
│     • Graceful degradation                                                 │
│                                                                             │
│  5. OBSERVABILITY                                                          │
│     ─────────────                                                           │
│     Full visibility into service behavior                                  │
│     • Distributed tracing                                                  │
│     • Centralized logging                                                  │
│     • Metrics and dashboards                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5.3 Service Catalog

### 5.3.1 High-Level Service Map

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    SERVICE ARCHITECTURE                                             │
├─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                     │
│                                        ┌──────────────┐                                             │
│                                        │   CLIENTS    │                                             │
│                                        │ Web/Mobile   │                                             │
│                                        └──────┬───────┘                                             │
│                                               │                                                     │
│  ┌────────────────────────────────────────────┼────────────────────────────────────────────┐       │
│  │                                   API GATEWAY                                            │       │
│  │                              (Kong / AWS API Gateway)                                    │       │
│  │  ┌─────────────────────────────────────────────────────────────────────────────────┐    │       │
│  │  │  • Authentication  • Rate Limiting  • Request Routing  • SSL Termination        │    │       │
│  │  └─────────────────────────────────────────────────────────────────────────────────┘    │       │
│  └────────────────────────────────────────────┬────────────────────────────────────────────┘       │
│                                               │                                                     │
│  ┌────────────────────────────────────────────┼────────────────────────────────────────────┐       │
│  │                              CORE SERVICES LAYER                                         │       │
│  │                                                                                          │       │
│  │  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐               │       │
│  │  │    AUTH       │ │   WORKSPACE   │ │     USER      │ │   BILLING     │               │       │
│  │  │   SERVICE     │ │   SERVICE     │ │   SERVICE     │ │   SERVICE     │               │       │
│  │  │               │ │               │ │               │ │               │               │       │
│  │  │ • Login/SSO   │ │ • CRUD        │ │ • Profile     │ │ • Subscriptions│              │       │
│  │  │ • MFA         │ │ • Settings    │ │ • Preferences │ │ • Invoices    │               │       │
│  │  │ • Sessions    │ │ • Members     │ │ • Activity    │ │ • Usage       │               │       │
│  │  └───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘               │       │
│  │                                                                                          │       │
│  └──────────────────────────────────────────────────────────────────────────────────────────┘       │
│                                                                                                     │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────┐       │
│  │                              BUSINESS SERVICES LAYER                                     │       │
│  │                                                                                          │       │
│  │  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐               │       │
│  │  │  MONITORING   │ │   CITATION    │ │  VISIBILITY   │ │   CONTENT     │               │       │
│  │  │   SERVICE     │ │   SERVICE     │ │   SERVICE     │ │   SERVICE     │               │       │
│  │  │               │ │               │ │               │ │               │               │       │
│  │  │ • AI Queries  │ │ • Detection   │ │ • Scoring     │ │ • Analysis    │               │       │
│  │  │ • Scheduling  │ │ • Storage     │ │ • Trends      │ │ • Optimization│               │       │
│  │  │ • Results     │ │ • Alerts      │ │ • Comparison  │ │ • Suggestions │               │       │
│  │  └───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘               │       │
│  │                                                                                          │       │
│  │  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐               │       │
│  │  │  COMPETITOR   │ │   PROMPT      │ │   REPORT      │ │   ALERT       │               │       │
│  │  │   SERVICE     │ │   SERVICE     │ │   SERVICE     │ │   SERVICE     │               │       │
│  │  │               │ │               │ │               │ │               │               │       │
│  │  │ • Tracking    │ │ • Simulation  │ │ • Generation  │ │ • Rules       │               │       │
│  │  │ • Comparison  │ │ • Testing     │ │ • Scheduling  │ │ • Delivery    │               │       │
│  │  │ • Insights    │ │ • Scenarios   │ │ • Export      │ │ • History     │               │       │
│  │  └───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘               │       │
│  │                                                                                          │       │
│  └──────────────────────────────────────────────────────────────────────────────────────────┘       │
│                                                                                                     │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────┐       │
│  │                              PLATFORM SERVICES LAYER                                     │       │
│  │                                                                                          │       │
│  │  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐               │       │
│  │  │  CRAWLER      │ │  AI GATEWAY   │ │     ML        │ │  ANALYTICS    │               │       │
│  │  │   SERVICE     │ │   SERVICE     │ │   SERVICE     │ │   SERVICE     │               │       │
│  │  │               │ │               │ │               │ │               │               │       │
│  │  │ • Web Scrape  │ │ • ChatGPT API │ │ • NLP Models  │ │ • Aggregation │               │       │
│  │  │ • Data Extract│ │ • Claude API  │ │ • Sentiment   │ │ • Computation │               │       │
│  │  │ • Rate Limit  │ │ • Gemini API  │ │ • Scoring     │ │ • BI Reports  │               │       │
│  │  └───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘               │       │
│  │                                                                                          │       │
│  │  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐               │       │
│  │  │ NOTIFICATION  │ │   WEBHOOK     │ │   SEARCH      │ │    FILE       │               │       │
│  │  │   SERVICE     │ │   SERVICE     │ │   SERVICE     │ │   SERVICE     │               │       │
│  │  │               │ │               │ │               │ │               │               │       │
│  │  │ • Email       │ │ • Delivery    │ │ • Indexing    │ │ • Upload      │               │       │
│  │  │ • Slack       │ │ • Retry       │ │ • Query       │ │ • Processing  │               │       │
│  │  │ • Push        │ │ • Logging     │ │ • Ranking     │ │ • Storage     │               │       │
│  │  └───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘               │       │
│  │                                                                                          │       │
│  └──────────────────────────────────────────────────────────────────────────────────────────┘       │
│                                                                                                     │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────┐       │
│  │                                   DATA LAYER                                             │       │
│  │                                                                                          │       │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │       │
│  │  │  PostgreSQL │ │ TimescaleDB │ │   Redis     │ │ OpenSearch  │ │     S3      │        │       │
│  │  │  (Primary)  │ │ (TimeSeries)│ │  (Cache)    │ │  (Search)   │ │  (Storage)  │        │       │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘        │       │
│  │                                                                                          │       │
│  └──────────────────────────────────────────────────────────────────────────────────────────┘       │
│                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5.4 Service Specifications

### 5.4.1 Auth Service

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            AUTH SERVICE                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  RESPONSIBILITIES                                                           │
│  ────────────────                                                           │
│  • User authentication (email/password, OAuth, SSO)                        │
│  • Multi-factor authentication                                             │
│  • Session management                                                      │
│  • JWT token issuance and validation                                       │
│  • Password reset flows                                                    │
│                                                                             │
│  TECHNOLOGY STACK                                                          │
│  ────────────────                                                           │
│  Language: TypeScript/Node.js                                              │
│  Framework: NestJS                                                         │
│  Database: PostgreSQL (users, sessions)                                    │
│  Cache: Redis (session cache, rate limiting)                               │
│                                                                             │
│  API ENDPOINTS                                                             │
│  ─────────────                                                              │
│                                                                             │
│  POST /auth/register           Create new user account                     │
│  POST /auth/login              Authenticate user                           │
│  POST /auth/logout             Invalidate session                          │
│  POST /auth/refresh            Refresh access token                        │
│  POST /auth/forgot-password    Initiate password reset                     │
│  POST /auth/reset-password     Complete password reset                     │
│  POST /auth/mfa/enable         Enable MFA for user                         │
│  POST /auth/mfa/verify         Verify MFA code                             │
│  POST /auth/oauth/:provider    OAuth callback handler                      │
│  POST /auth/sso/saml           SAML SSO handler                            │
│                                                                             │
│  EVENTS PUBLISHED                                                          │
│  ────────────────                                                           │
│  • user.registered                                                         │
│  • user.logged_in                                                          │
│  • user.logged_out                                                         │
│  • user.password_changed                                                   │
│  • user.mfa_enabled                                                        │
│                                                                             │
│  DEPENDENCIES                                                              │
│  ────────────                                                               │
│  • User Service (user profile data)                                        │
│  • Notification Service (emails)                                           │
│                                                                             │
│  SCALING                                                                   │
│  ───────                                                                    │
│  • Min replicas: 3                                                         │
│  • Max replicas: 20                                                        │
│  • Scale on: CPU > 70%, Request latency > 200ms                           │
│                                                                             │
│  SLA                                                                       │
│  ───                                                                        │
│  • Availability: 99.99%                                                    │
│  • Latency (P99): < 200ms                                                  │
│  • Error rate: < 0.01%                                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.4.2 Monitoring Service

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          MONITORING SERVICE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  RESPONSIBILITIES                                                           │
│  ────────────────                                                           │
│  • Schedule and execute AI monitoring queries                              │
│  • Coordinate with AI Gateway for API calls                                │
│  • Process and store monitoring results                                    │
│  • Trigger citation detection pipeline                                     │
│  • Manage monitoring configurations                                        │
│                                                                             │
│  TECHNOLOGY STACK                                                          │
│  ────────────────                                                           │
│  Language: TypeScript/Node.js                                              │
│  Framework: NestJS                                                         │
│  Database: PostgreSQL (configs), TimescaleDB (results)                     │
│  Queue: Redis (BullMQ)                                                     │
│                                                                             │
│  API ENDPOINTS                                                             │
│  ─────────────                                                              │
│                                                                             │
│  GET  /monitoring/brands                 List monitored brands             │
│  POST /monitoring/brands                 Add brand to monitoring           │
│  GET  /monitoring/brands/:id             Get brand details                 │
│  PUT  /monitoring/brands/:id             Update brand config               │
│  DELETE /monitoring/brands/:id           Remove brand from monitoring      │
│  GET  /monitoring/brands/:id/prompts     Get prompt configurations         │
│  POST /monitoring/brands/:id/prompts     Add prompt configuration          │
│  GET  /monitoring/results                Get monitoring results            │
│  POST /monitoring/run                    Trigger manual monitoring run     │
│  GET  /monitoring/schedule               Get monitoring schedule           │
│  PUT  /monitoring/schedule               Update monitoring schedule        │
│                                                                             │
│  INTERNAL ENDPOINTS                                                        │
│  ──────────────────                                                         │
│                                                                             │
│  POST /internal/monitoring/process       Process monitoring job            │
│  POST /internal/monitoring/callback      AI query callback                 │
│                                                                             │
│  EVENTS PUBLISHED                                                          │
│  ────────────────                                                           │
│  • monitoring.query_completed                                              │
│  • monitoring.brand_mentioned                                              │
│  • monitoring.citation_detected                                            │
│  • monitoring.error                                                        │
│                                                                             │
│  EVENTS CONSUMED                                                           │
│  ───────────────                                                            │
│  • workspace.created (initialize default monitoring)                       │
│  • ai_gateway.response_received                                            │
│                                                                             │
│  DEPENDENCIES                                                              │
│  ────────────                                                               │
│  • AI Gateway Service (AI API calls)                                       │
│  • Citation Service (citation processing)                                  │
│  • ML Service (NLP analysis)                                               │
│                                                                             │
│  SCALING                                                                   │
│  ───────                                                                    │
│  • Min replicas: 5                                                         │
│  • Max replicas: 50                                                        │
│  • Scale on: Queue depth > 1000, CPU > 70%                                │
│                                                                             │
│  ARCHITECTURE PATTERN                                                      │
│  ────────────────────                                                       │
│                                                                             │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                   │
│  │  Scheduler  │────▶│   Queue     │────▶│   Workers   │                   │
│  │  (Cron)     │     │  (BullMQ)   │     │  (N pods)   │                   │
│  └─────────────┘     └─────────────┘     └──────┬──────┘                   │
│                                                  │                          │
│                                                  ▼                          │
│                                          ┌─────────────┐                   │
│                                          │ AI Gateway  │                   │
│                                          │   Service   │                   │
│                                          └─────────────┘                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.4.3 AI Gateway Service

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          AI GATEWAY SERVICE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  RESPONSIBILITIES                                                           │
│  ────────────────                                                           │
│  • Abstract AI API integrations (OpenAI, Anthropic, Google, etc.)         │
│  • Manage API credentials and rate limiting                                │
│  • Handle retries, timeouts, and error handling                           │
│  • Cost tracking and optimization                                          │
│  • Response caching where applicable                                       │
│                                                                             │
│  TECHNOLOGY STACK                                                          │
│  ────────────────                                                           │
│  Language: TypeScript/Node.js                                              │
│  Framework: NestJS                                                         │
│  Cache: Redis (response cache, rate limit counters)                        │
│                                                                             │
│  SUPPORTED AI PROVIDERS                                                    │
│  ──────────────────────                                                     │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────┐     │
│  │  PROVIDER     │ MODELS                    │ USE CASES             │     │
│  ├───────────────┼───────────────────────────┼───────────────────────┤     │
│  │  OpenAI       │ GPT-4, GPT-4-turbo       │ Monitoring, Prompts   │     │
│  │  Anthropic    │ Claude-3, Claude-3.5     │ Monitoring, Analysis  │     │
│  │  Google       │ Gemini Pro, Gemini Ultra │ Monitoring            │     │
│  │  Perplexity   │ pplx-70b, pplx-7b        │ Search, Citations     │     │
│  │  Cohere       │ Command                  │ Embeddings            │     │
│  │  Microsoft    │ Azure OpenAI             │ Enterprise SSO        │     │
│  └───────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  API ENDPOINTS                                                             │
│  ─────────────                                                              │
│                                                                             │
│  POST /ai/chat                    Send chat completion request             │
│  POST /ai/completion              Send completion request                  │
│  POST /ai/embeddings              Generate embeddings                      │
│  GET  /ai/providers               List available providers                 │
│  GET  /ai/providers/:id/status    Get provider health status              │
│  GET  /ai/usage                   Get usage statistics                     │
│                                                                             │
│  REQUEST STRUCTURE                                                         │
│  ─────────────────                                                          │
│                                                                             │
│  {                                                                         │
│    "provider": "openai",                                                   │
│    "model": "gpt-4-turbo",                                                 │
│    "messages": [...],                                                      │
│    "temperature": 0.7,                                                     │
│    "max_tokens": 1000,                                                     │
│    "metadata": {                                                           │
│      "workspace_id": "...",                                                │
│      "purpose": "monitoring",                                              │
│      "prompt_id": "..."                                                    │
│    }                                                                       │
│  }                                                                         │
│                                                                             │
│  RATE LIMITING STRATEGY                                                    │
│  ──────────────────────                                                     │
│                                                                             │
│  • Per-provider rate limits (respect API limits)                          │
│  • Per-workspace quotas                                                    │
│  • Priority queuing (paid > free tier)                                    │
│  • Automatic fallback to alternative providers                            │
│                                                                             │
│  CIRCUIT BREAKER                                                           │
│  ───────────────                                                            │
│                                                                             │
│  • Failure threshold: 5 failures in 30 seconds                            │
│  • Recovery timeout: 60 seconds                                           │
│  • Half-open state: 3 test requests                                       │
│                                                                             │
│  COST TRACKING                                                             │
│  ─────────────                                                              │
│                                                                             │
│  • Track tokens per request                                                │
│  • Calculate cost per provider/model                                       │
│  • Emit usage events for billing                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.4.4 Citation Service

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CITATION SERVICE                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  RESPONSIBILITIES                                                           │
│  ────────────────                                                           │
│  • Detect brand citations in AI responses                                  │
│  • Extract citation context and metadata                                   │
│  • Store and index citations                                               │
│  • Track citation trends over time                                         │
│  • Generate citation alerts                                                │
│                                                                             │
│  TECHNOLOGY STACK                                                          │
│  ────────────────                                                           │
│  Language: Python 3.11                                                     │
│  Framework: FastAPI                                                        │
│  Database: PostgreSQL (citations), OpenSearch (search)                     │
│  ML: spaCy, transformers                                                   │
│                                                                             │
│  API ENDPOINTS                                                             │
│  ─────────────                                                              │
│                                                                             │
│  GET  /citations                      List citations with filters          │
│  GET  /citations/:id                  Get citation details                 │
│  GET  /citations/stats                Get citation statistics              │
│  GET  /citations/trends               Get citation trends                  │
│  POST /citations/search               Search citations                     │
│  POST /citations/export               Export citations                     │
│                                                                             │
│  INTERNAL ENDPOINTS                                                        │
│  ──────────────────                                                         │
│                                                                             │
│  POST /internal/citations/detect      Detect citations in text             │
│  POST /internal/citations/process     Process citation batch               │
│                                                                             │
│  CITATION DETECTION PIPELINE                                               │
│  ───────────────────────────                                                │
│                                                                             │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐     │
│  │   Input     │──▶│    NER      │──▶│  Context    │──▶│  Sentiment  │     │
│  │   Text      │   │  (Entity)   │   │  Extraction │   │  Analysis   │     │
│  └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘     │
│         │                                                     │             │
│         │                                                     ▼             │
│         │         ┌─────────────┐   ┌─────────────┐   ┌─────────────┐     │
│         └────────▶│   Store     │◀──│  Dedup      │◀──│  Classify   │     │
│                   │  Citation   │   │  & Merge    │   │  Citation   │     │
│                   └─────────────┘   └─────────────┘   └─────────────┘     │
│                                                                             │
│  CITATION TYPES                                                            │
│  ──────────────                                                             │
│                                                                             │
│  • Direct Mention: "According to [Brand]..."                               │
│  • Recommendation: "[Brand] is the best..."                                │
│  • Comparison: "[Brand] vs [Competitor]..."                                │
│  • Feature Attribution: "[Brand]'s product offers..."                      │
│  • Negative Mention: "[Brand] has issues with..."                          │
│  • Neutral Reference: "Companies like [Brand]..."                          │
│                                                                             │
│  EVENTS PUBLISHED                                                          │
│  ────────────────                                                           │
│  • citation.detected                                                       │
│  • citation.sentiment_changed                                              │
│  • citation.trend_alert                                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.4.5 Visibility Service

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         VISIBILITY SERVICE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  RESPONSIBILITIES                                                           │
│  ────────────────                                                           │
│  • Calculate visibility scores                                             │
│  • Track visibility metrics over time                                      │
│  • Generate visibility insights                                            │
│  • Benchmark against competitors                                           │
│  • Predict visibility trends                                               │
│                                                                             │
│  TECHNOLOGY STACK                                                          │
│  ────────────────                                                           │
│  Language: Python 3.11                                                     │
│  Framework: FastAPI                                                        │
│  Database: TimescaleDB (time-series metrics)                               │
│  ML: scikit-learn, prophet                                                 │
│                                                                             │
│  API ENDPOINTS                                                             │
│  ─────────────                                                              │
│                                                                             │
│  GET  /visibility/score               Get current visibility score        │
│  GET  /visibility/breakdown           Get score breakdown by factor       │
│  GET  /visibility/history             Get historical scores               │
│  GET  /visibility/trends              Get visibility trends               │
│  GET  /visibility/benchmark           Benchmark against competitors       │
│  GET  /visibility/insights            Get AI-generated insights           │
│  GET  /visibility/forecast            Get visibility forecast             │
│                                                                             │
│  VISIBILITY SCORE ALGORITHM                                                │
│  ──────────────────────────                                                 │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                       │   │
│  │  VISIBILITY SCORE (0-100) = Weighted Sum of:                         │   │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │  CITATION FREQUENCY (30%)                                        │ │   │
│  │  │  • Number of brand mentions                                      │ │   │
│  │  │  • Mention rate (mentions per query)                             │ │   │
│  │  │  • Trend direction                                               │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │  SENTIMENT SCORE (25%)                                           │ │   │
│  │  │  • Positive mention ratio                                        │ │   │
│  │  │  • Negative mention ratio                                        │ │   │
│  │  │  • Sentiment trend                                               │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │  RECOMMENDATION RATE (25%)                                       │ │   │
│  │  │  • Direct recommendations                                        │ │   │
│  │  │  • "Best" or "top" mentions                                      │ │   │
│  │  │  • Comparison wins                                               │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │  AI SYSTEM COVERAGE (20%)                                        │ │   │
│  │  │  • Presence across ChatGPT, Claude, Gemini, etc.                 │ │   │
│  │  │  • Consistency of information                                    │ │   │
│  │  │  • Feature completeness                                          │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  EVENTS CONSUMED                                                           │
│  ───────────────                                                            │
│  • citation.detected                                                       │
│  • monitoring.query_completed                                              │
│                                                                             │
│  EVENTS PUBLISHED                                                          │
│  ────────────────                                                           │
│  • visibility.score_updated                                                │
│  • visibility.threshold_crossed                                            │
│  • visibility.insight_generated                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.4.6 Report Service

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           REPORT SERVICE                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  RESPONSIBILITIES                                                           │
│  ────────────────                                                           │
│  • Generate scheduled and on-demand reports                                │
│  • Support multiple report formats (PDF, Excel, CSV)                       │
│  • Manage report templates                                                 │
│  • Handle report scheduling                                                │
│  • Store and serve generated reports                                       │
│                                                                             │
│  TECHNOLOGY STACK                                                          │
│  ────────────────                                                           │
│  Language: TypeScript/Node.js                                              │
│  Framework: NestJS                                                         │
│  PDF Generation: Puppeteer, pdfkit                                         │
│  Storage: S3                                                               │
│  Queue: SQS                                                                │
│                                                                             │
│  API ENDPOINTS                                                             │
│  ─────────────                                                              │
│                                                                             │
│  GET  /reports                        List reports                         │
│  POST /reports                        Create new report                    │
│  GET  /reports/:id                    Get report details                   │
│  GET  /reports/:id/download           Download report                      │
│  DELETE /reports/:id                  Delete report                        │
│  GET  /reports/templates              List report templates                │
│  POST /reports/templates              Create report template               │
│  GET  /reports/schedule               Get report schedules                 │
│  POST /reports/schedule               Create report schedule               │
│                                                                             │
│  REPORT TYPES                                                              │
│  ────────────                                                               │
│                                                                             │
│  • Executive Summary                                                       │
│  • Visibility Scorecard                                                    │
│  • Citation Analysis                                                       │
│  • Competitor Comparison                                                   │
│  • Trend Report                                                            │
│  • Custom Report                                                           │
│                                                                             │
│  REPORT GENERATION PIPELINE                                                │
│  ──────────────────────────                                                 │
│                                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐          │
│  │ Request │─▶│  Queue  │─▶│ Collect │─▶│ Render  │─▶│  Store  │          │
│  │         │  │  (SQS)  │  │  Data   │  │  Report │  │  (S3)   │          │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘          │
│                                                │           │               │
│                                                │           ▼               │
│                                                │    ┌─────────────┐        │
│                                                └───▶│   Notify    │        │
│                                                     │   User      │        │
│                                                     └─────────────┘        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5.5 Communication Patterns

### 5.5.1 Synchronous Communication

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     SYNCHRONOUS COMMUNICATION                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  REST APIs                                                                 │
│  ─────────                                                                  │
│  • Used for: Client-facing APIs, admin operations                          │
│  • Protocol: HTTPS                                                         │
│  • Format: JSON                                                            │
│  • Authentication: JWT Bearer tokens                                       │
│                                                                             │
│  gRPC (Internal)                                                           │
│  ───────────────                                                            │
│  • Used for: High-performance internal service calls                       │
│  • Protocol: HTTP/2                                                        │
│  • Format: Protocol Buffers                                                │
│  • Services: ML Service, AI Gateway                                        │
│                                                                             │
│  SERVICE MESH (Istio)                                                      │
│  ────────────────────                                                       │
│                                                                             │
│  ┌─────────────┐        ┌─────────────┐        ┌─────────────┐            │
│  │  Service A  ���        │   Envoy     │        │   Envoy     │            │
│  │  ┌───────┐  │───────▶│   Proxy     │───────▶│   Proxy     │            │
│  │  │ Code  │  │        │             │        │             │            │
│  │  └───────┘  │        │  • mTLS     │        │  ┌───────┐  │            │
│  └─────────────┘        │  • Retry    │        │  │ Code  │  │            │
│                         │  • Timeout  │        │  └───────┘  │            │
│                         │  • Circuit  │        │  Service B  │            │
│                         │    Breaker  │        └─────────────┘            │
│                         └─────────────┘                                    │
│                                                                             │
│  TIMEOUT CONFIGURATION                                                     │
│  ─────────────────────                                                      │
│                                                                             │
│  │ Service Call Type      │ Timeout  │ Retries │ Backoff     │            │
│  ├────────────────────────┼──────────┼─────────┼─────────────┤            │
│  │ API Gateway → Service  │ 30s      │ 3       │ Exponential │            │
│  │ Service → Service      │ 5s       │ 2       │ Exponential │            │
│  │ Service → Database     │ 10s      │ 1       │ None        │            │
│  │ Service → External API │ 60s      │ 3       │ Exponential │            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.5.2 Asynchronous Communication

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ASYNCHRONOUS COMMUNICATION                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  EVENT-DRIVEN ARCHITECTURE                                                 │
│  ─────────────────────────                                                  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        EVENT BUS (EventBridge)                       │   │
│  │                                                                       │   │
│  │  ┌───────────────┐                       ┌───────────────┐          │   │
│  │  │   Publisher   │──▶ Event ──────────▶ │  Subscribers  │          │   │
│  │  │   Service A   │                       │  Service B,C  │          │   │
│  │  └───────────────┘                       └───────────────┘          │   │
│  │                                                                       │   │
│  │  Event Structure:                                                    │   │
│  │  {                                                                   │   │
│  │    "version": "1.0",                                                 │   │
│  │    "id": "uuid",                                                     │   │
│  │    "source": "monitoring-service",                                   │   │
│  │    "type": "citation.detected",                                      │   │
│  │    "time": "2024-01-15T10:30:00Z",                                  │   │
│  │    "data": { ... },                                                  │   │
│  │    "metadata": {                                                     │   │
│  │      "correlation_id": "...",                                        │   │
│  │      "workspace_id": "..."                                           │   │
│  │    }                                                                 │   │
│  │  }                                                                   │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  MESSAGE QUEUES (SQS)                                                      │
│  ────────────────────                                                       │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                       │   │
│  │  Producer ───▶ [Queue] ───▶ Consumer                                 │   │
│  │                                                                       │   │
│  │  Use Cases:                                                          │   │
│  │  • Job processing (monitoring queries, report generation)           │   │
│  │  • Webhook delivery                                                  │   │
│  │  • Notification sending                                              │   │
│  │  • Data pipeline processing                                          │   │
│  │                                                                       │   │
│  │  Queue Types:                                                        │   │
│  │  • Standard: High throughput, at-least-once delivery                │   │
│  │  • FIFO: Ordered processing, exactly-once delivery                  │   │
│  │                                                                       │   │
│  │  Dead Letter Queues:                                                 │   │
│  │  • All queues have associated DLQ                                   │   │
│  │  • Max receive count: 3                                             │   │
│  │  • Retention: 14 days                                               │   │
│  │  • Monitoring: Alarm on DLQ depth > 0                               │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  EVENT CATALOG                                                             │
│  ─────────────                                                              │
│                                                                             │
│  │ Domain        │ Event                    │ Publishers          │        │
│  ├───────────────┼──────────────────────────┼─────────────────────┤        │
│  │ Auth          │ user.registered          │ Auth Service        │        │
│  │ Auth          │ user.logged_in           │ Auth Service        │        │
│  │ Workspace     │ workspace.created        │ Workspace Service   │        │
│  │ Monitoring    │ monitoring.completed     │ Monitoring Service  │        │
│  │ Citation      │ citation.detected        │ Citation Service    │        │
│  │ Visibility    │ visibility.updated       │ Visibility Service  │        │
│  │ Alert         │ alert.triggered          │ Alert Service       │        │
│  │ Report        │ report.generated         │ Report Service      │        │
│  │ Billing       │ usage.recorded           │ AI Gateway Service  │        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.5.3 Real-time Communication

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      REAL-TIME COMMUNICATION                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  WEBSOCKET ARCHITECTURE                                                    │
│  ──────────────────────                                                     │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                       │   │
│  │  ┌───────────┐     ┌───────────────────┐     ┌───────────────────┐  │   │
│  │  │  Client   │◀───▶│   WebSocket       │◀───▶│    Redis          │  │   │
│  │  │  (Browser)│     │   Gateway         │     │    Pub/Sub        │  │   │
│  │  └───────────┘     │   (Socket.io)     │     └─────────┬─────────┘  │   │
│  │                    └───────────────────┘               │            │   │
│  │                              ▲                         │            │   │
│  │                              │                         ▼            │   │
│  │                    ┌─────────┴─────────┐     ┌───────────────────┐  │   │
│  │                    │   Event           │◀────│   Backend         │  │   │
│  │                    │   Processor       │     │   Services        │  │   │
│  │                    └───────────────────┘     └───────────────────┘  │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  REAL-TIME EVENTS                                                          │
│  ────────────────                                                           │
│                                                                             │
│  • visibility_score_updated                                                │
│  • new_citation_detected                                                   │
│  • alert_triggered                                                         │
│  • monitoring_query_completed                                              │
│  • report_ready                                                            │
│  • competitor_alert                                                        │
│                                                                             │
│  SCALING                                                                   │
│  ───────                                                                    │
│                                                                             │
│  • Sticky sessions via ALB                                                 │
│  • Redis Pub/Sub for cross-instance communication                          │
│  • Connection state stored in Redis                                        │
│  • Horizontal scaling with Redis adapter                                   │
│                                                                             │
│  CONNECTION MANAGEMENT                                                     │
│  ─────────────────────                                                      │
│                                                                             │
│  • Heartbeat: Every 25 seconds                                             │
│  • Timeout: 60 seconds                                                     │
│  • Reconnection: Exponential backoff (1s, 2s, 4s, ... max 30s)            │
│  • Max connections per user: 5                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5.6 Service Dependencies

### 5.6.1 Dependency Matrix

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SERVICE DEPENDENCY MATRIX                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Dependencies flow from left to right (A → B means A depends on B)         │
│                                                                             │
│                │Auth│Work│User│Bill│Mon │Cite│Vis │Cont│Comp│Prom│Rprt│Alrt│
│  ──────────────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────│
│  Auth          │ -  │    │ ●  │    │    │    │    │    │    │    │    │    │
│  Workspace     │ ●  │ -  │ ●  │ ●  │    │    │    │    │    │    │    │    │
│  User          │    │    │ -  │    │    │    │    │    │    │    │    │    │
│  Billing       │ ●  │ ●  │ ●  │ -  │    │    │    │    │    │    │    │    │
│  Monitoring    │ ●  │ ●  │    │    │ -  │ ●  │    │    │    │    │    │    │
│  Citation      │ ●  │ ●  │    │    │    │ -  │    │    │    │    │    │ ●  │
│  Visibility    │ ●  │ ●  │    │    │ ●  │ ●  │ -  │    │    │    │    │ ●  │
│  Content       │ ●  │ ●  │    │    │    │ ●  │    │ -  │    │    │    │    │
│  Competitor    │ ●  │ ●  │    │    │ ●  │ ●  │ ●  │    │ -  │    │    │ ●  │
│  Prompt        │ ●  │ ●  │    │ ●  │    │    │    │    │    │ -  │    │    │
│  Report        │ ●  │ ●  │    │    │ ●  │ ●  │ ●  │ ●  │ ●  │    │ -  │    │
│  Alert         │ ●  │ ●  │ ●  │    │    │    │    │    │    │    │    │ -  │
│                                                                             │
│  Legend: ● = Direct dependency                                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.6.2 Deployment Order

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DEPLOYMENT ORDER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  LAYER 0: Infrastructure                                                   │
│  ───────────────────────                                                    │
│  1. PostgreSQL                                                             │
│  2. Redis                                                                  │
│  3. OpenSearch                                                             │
│  4. TimescaleDB                                                            │
│                                                                             │
│  LAYER 1: Core Services (No inter-service dependencies)                   │
│  ────────────────────────────────────────────────────                      │
│  1. User Service                                                           │
│  2. Notification Service (base)                                            │
│                                                                             │
│  LAYER 2: Authentication                                                   │
│  ───────────────────────                                                    │
│  1. Auth Service                                                           │
│                                                                             │
│  LAYER 3: Business Core                                                    │
│  ─────────────────────                                                      │
│  1. Workspace Service                                                      │
│  2. Billing Service                                                        │
│                                                                             │
│  LAYER 4: Platform Services                                                │
│  ─────────────────────────                                                  │
│  1. AI Gateway Service                                                     │
│  2. ML Service                                                             │
│  3. Search Service                                                         │
│  4. File Service                                                           │
│                                                                             │
│  LAYER 5: Business Features                                                │
│  ─────────────────────────                                                  │
│  1. Monitoring Service                                                     │
│  2. Citation Service                                                       │
│  3. Content Service                                                        │
│  4. Crawler Service                                                        │
│                                                                             │
│  LAYER 6: Analytics & Insights                                             │
│  ────────────────────────────                                               │
│  1. Visibility Service                                                     │
│  2. Competitor Service                                                     │
│  3. Analytics Service                                                      │
│                                                                             │
│  LAYER 7: Outputs                                                          │
│  ────────────────                                                           │
│  1. Alert Service                                                          │
│  2. Report Service                                                         │
│  3. Webhook Service                                                        │
│  4. Prompt Service                                                         │
│                                                                             │
│  LAYER 8: Gateway                                                          │
│  ────────────────                                                           │
│  1. API Gateway                                                            │
│  2. WebSocket Gateway                                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5.7 Data Ownership

### 5.7.1 Service Data Boundaries

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATA OWNERSHIP BY SERVICE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  AUTH SERVICE                                                              │
│  ────────────                                                               │
│  Tables: users, sessions, password_resets, mfa_settings                    │
│  Schema: auth                                                              │
│                                                                             │
│  WORKSPACE SERVICE                                                         │
│  ─────────────────                                                          │
│  Tables: workspaces, workspace_members, workspace_settings                 │
│  Schema: workspace                                                         │
│                                                                             │
│  BILLING SERVICE                                                           │
│  ───────────────                                                            │
│  Tables: subscriptions, invoices, payments, usage_records                  │
│  Schema: billing                                                           │
│                                                                             │
│  MONITORING SERVICE                                                        │
│  ─────────────────                                                          │
│  Tables: brands, prompts, monitoring_configs, monitoring_runs              │
│  Schema: monitoring                                                        │
│  TimescaleDB: monitoring_results (hypertable)                              │
│                                                                             │
│  CITATION SERVICE                                                          │
│  ────────────────                                                           │
│  Tables: citations, citation_contexts                                      │
│  Schema: citation                                                          │
│  OpenSearch: citations index                                               │
│                                                                             │
│  VISIBILITY SERVICE                                                        │
│  ─────────────────                                                          │
│  TimescaleDB: visibility_scores, visibility_metrics (hypertables)         │
│  Schema: visibility                                                        │
│                                                                             │
│  REPORT SERVICE                                                            │
│  ──────────────                                                             │
│  Tables: reports, report_templates, report_schedules                       │
│  Schema: report                                                            │
│  S3: Generated report files                                                │
│                                                                             │
│  DATA ISOLATION                                                            │
│  ──────────────                                                             │
│                                                                             │
│  • Each service has its own database schema                                │
│  • No cross-schema joins at database level                                 │
│  • Data shared via APIs or events                                          │
│  • Read replicas for analytics queries                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5.8 Resilience Patterns

### 5.8.1 Circuit Breaker Implementation

```typescript
// Circuit Breaker Configuration
const circuitBreakerConfig = {
  // AI Gateway Service
  'ai-gateway': {
    failureThreshold: 5,
    successThreshold: 3,
    timeout: 60000,
    volumeThreshold: 10,
  },

  // External AI APIs
  'openai-api': {
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 30000,
    volumeThreshold: 5,
  },

  // Database connections
  'postgresql': {
    failureThreshold: 3,
    successThreshold: 1,
    timeout: 10000,
    volumeThreshold: 3,
  },
};

// Circuit Breaker States
enum CircuitState {
  CLOSED,    // Normal operation
  OPEN,      // Failing, reject requests
  HALF_OPEN  // Testing recovery
}
```

### 5.8.2 Retry Patterns

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           RETRY STRATEGIES                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  EXPONENTIAL BACKOFF WITH JITTER                                           │
│  ───────────────────────────────                                            │
│                                                                             │
│  Attempt 1: Immediate                                                      │
│  Attempt 2: 1s + random(0-500ms)                                          │
│  Attempt 3: 2s + random(0-1000ms)                                         │
│  Attempt 4: 4s + random(0-2000ms)                                         │
│  Attempt 5: 8s + random(0-4000ms)                                         │
│  Max: 30 seconds                                                           │
│                                                                             │
│  RETRYABLE ERRORS                                                          │
│  ────────────────                                                           │
│                                                                             │
│  ✓ 429 Too Many Requests                                                   │
│  ✓ 500 Internal Server Error                                               │
│  ✓ 502 Bad Gateway                                                         │
│  ✓ 503 Service Unavailable                                                 │
│  ✓ 504 Gateway Timeout                                                     │
│  ✓ Connection timeout                                                      │
│  ✓ Network errors                                                          │
│                                                                             │
│  NON-RETRYABLE ERRORS                                                      │
│  ────────────────────                                                       │
│                                                                             │
│  ✗ 400 Bad Request                                                         │
│  ✗ 401 Unauthorized                                                        │
│  ✗ 403 Forbidden                                                           │
│  ✗ 404 Not Found                                                           │
│  ✗ 422 Unprocessable Entity                                                │
│                                                                             │
│  IDEMPOTENCY                                                               │
│  ───────────                                                                │
│                                                                             │
│  • All write operations include idempotency key                           │
│  • Keys stored in Redis with 24h TTL                                      │
│  • Duplicate requests return cached response                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.8.3 Bulkhead Pattern

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BULKHEAD ISOLATION                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CONNECTION POOLS                                                          │
│  ────────────────                                                           │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  PostgreSQL Connection Pools                                         │   │
│  │                                                                       │   │
│  │  API Requests:      Pool Size = 20, Max = 50                         │   │
│  │  Background Jobs:   Pool Size = 10, Max = 30                         │   │
│  │  Analytics:         Pool Size = 5,  Max = 15                         │   │
│  │  Admin Operations:  Pool Size = 2,  Max = 5                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  THREAD/WORKER POOLS                                                       │
│  ────────────────────                                                       │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Worker Pool Allocation                                              │   │
│  │                                                                       │   │
│  │  AI Monitoring:     Workers = 10, Queue Limit = 1000                 │   │
│  │  Report Generation: Workers = 5,  Queue Limit = 100                  │   │
│  │  Notifications:     Workers = 3,  Queue Limit = 500                  │   │
│  │  Webhooks:          Workers = 5,  Queue Limit = 200                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  RATE LIMITING PER TENANT                                                  │
│  ────────────────────────                                                   │
│                                                                             │
│  │ Tier         │ Requests/min │ Concurrent │ Burst │                      │
│  ├──────────────┼──────────────┼────────────┼───────┤                      │
│  │ Starter      │ 60           │ 5          │ 10    │                      │
│  │ Professional │ 300          │ 25         │ 50    │                      │
│  │ Enterprise   │ 1000         │ 100        │ 200   │                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5.9 Service Mesh Configuration

### 5.9.1 Istio Configuration

```yaml
# Virtual Service for API routing
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: api-routing
  namespace: ai-visibility
spec:
  hosts:
  - api.ai-visibility.com
  http:
  - match:
    - uri:
        prefix: /auth
    route:
    - destination:
        host: auth-service
        port:
          number: 3000
    timeout: 30s
    retries:
      attempts: 3
      perTryTimeout: 10s
      retryOn: 5xx,reset,connect-failure

  - match:
    - uri:
        prefix: /monitoring
    route:
    - destination:
        host: monitoring-service
        port:
          number: 3000
    timeout: 60s

---
# Destination Rule for circuit breaking
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: ai-gateway-circuit-breaker
  namespace: ai-visibility
spec:
  host: ai-gateway-service
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        h2UpgradePolicy: UPGRADE
        http1MaxPendingRequests: 100
        http2MaxRequests: 1000
    outlierDetection:
      consecutive5xxErrors: 5
      interval: 30s
      baseEjectionTime: 60s
      maxEjectionPercent: 50
```

---

## 5.10 Technology Stack Summary

### 5.10.1 By Service

| Service | Language | Framework | Database | Cache |
|---------|----------|-----------|----------|-------|
| Auth | TypeScript | NestJS | PostgreSQL | Redis |
| Workspace | TypeScript | NestJS | PostgreSQL | Redis |
| User | TypeScript | NestJS | PostgreSQL | Redis |
| Billing | TypeScript | NestJS | PostgreSQL | Redis |
| Monitoring | TypeScript | NestJS | PostgreSQL, TimescaleDB | Redis |
| Citation | Python | FastAPI | PostgreSQL, OpenSearch | Redis |
| Visibility | Python | FastAPI | TimescaleDB | Redis |
| Content | Python | FastAPI | PostgreSQL, OpenSearch | Redis |
| AI Gateway | TypeScript | NestJS | - | Redis |
| ML | Python | FastAPI | - | Redis |
| Report | TypeScript | NestJS | PostgreSQL, S3 | Redis |
| Alert | TypeScript | NestJS | PostgreSQL | Redis |
| Notification | TypeScript | NestJS | PostgreSQL | Redis |
| Search | TypeScript | NestJS | OpenSearch | Redis |

### 5.10.2 Common Libraries

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COMMON LIBRARIES                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  TypeScript/Node.js Services                                               │
│  ───────────────────────────                                                │
│  • @nestjs/common, @nestjs/core - Framework                                │
│  • @nestjs/microservices - Inter-service communication                     │
│  • typeorm - ORM for PostgreSQL                                            │
│  • ioredis - Redis client                                                  │
│  • bullmq - Job queue                                                      │
│  • winston - Logging                                                       │
│  • opentelemetry - Tracing                                                 │
│  • class-validator - Input validation                                      │
│  • passport - Authentication                                               │
│                                                                             │
│  Python Services                                                           │
│  ───────────────                                                            │
│  • fastapi - Framework                                                     │
│  • sqlalchemy - ORM                                                        │
│  • redis-py - Redis client                                                 │
│  • celery - Task queue                                                     │
│  • structlog - Logging                                                     │
│  • opentelemetry - Tracing                                                 │
│  • pydantic - Data validation                                              │
│  • spacy, transformers - NLP                                               │
│                                                                             │
│  Shared Packages (Internal)                                                │
│  ──────────────────────────                                                 │
│  • @ai-visibility/common - Shared utilities                               │
│  • @ai-visibility/logging - Logging configuration                         │
│  • @ai-visibility/tracing - Tracing setup                                 │
│  • @ai-visibility/auth-client - Auth integration                          │
│  • @ai-visibility/events - Event definitions                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

*Document Version: 1.0*
*Last Updated: 2026-06-28*
*Next Review: 2026-07-28*
