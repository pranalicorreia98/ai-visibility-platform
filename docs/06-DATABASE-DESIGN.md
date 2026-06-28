# 6. Database Design

## 6.1 Overview

This document details the comprehensive database architecture for the AI Visibility Platform. The system uses a polyglot persistence approach, selecting the optimal database technology for each use case.

---

## 6.2 Database Technology Selection

### 6.2.1 Technology Matrix

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       DATABASE TECHNOLOGY MATRIX                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  PostgreSQL (Aurora)                                                 │   │
│  │  ───────────────────                                                  │   │
│  │  Purpose: Primary transactional database                             │   │
│  │  Use Cases:                                                          │   │
│  │  • User accounts and authentication                                  │   │
│  │  • Workspace and team management                                     │   │
│  │  • Brand and monitoring configuration                                │   │
│  │  • Billing and subscriptions                                         │   │
│  │  • Reports and templates                                             │   │
│  │                                                                       │   │
│  │  Why PostgreSQL:                                                     │   │
│  │  • ACID compliance for critical data                                 │   │
│  │  • Rich query capabilities                                           │   │
│  │  • JSON support for flexible schemas                                 │   │
│  │  • Mature ecosystem and tooling                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  TimescaleDB                                                         │   │
│  │  ───────────                                                          │   │
│  │  Purpose: Time-series data storage                                   │   │
│  │  Use Cases:                                                          │   │
│  │  • Monitoring results and metrics                                    │   │
│  │  • Visibility score history                                          │   │
│  │  • AI response logs                                                  │   │
│  │  • Usage analytics                                                   │   │
│  │                                                                       │   │
│  │  Why TimescaleDB:                                                    │   │
│  │  • Optimized for time-series workloads                               │   │
│  │  • Automatic partitioning (hypertables)                              │   │
│  │  • Data retention policies                                           │   │
│  │  • PostgreSQL compatibility                                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  OpenSearch                                                          │   │
│  │  ──────────                                                           │   │
│  │  Purpose: Full-text search and analytics                             │   │
│  │  Use Cases:                                                          │   │
│  │  • Citation search and filtering                                     │   │
│  │  • Content analysis                                                  │   │
│  │  • Log aggregation                                                   │   │
│  │  • Real-time analytics dashboards                                    │   │
│  │                                                                       │   │
│  │  Why OpenSearch:                                                     │   │
│  │  • Powerful full-text search                                         │   │
│  │  • Real-time indexing                                                │   │
│  │  • Aggregations for analytics                                        │   │
│  │  • Scalable and distributed                                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Redis                                                               │   │
│  │  ─────                                                                │   │
│  │  Purpose: Caching and real-time data                                 │   │
│  │  Use Cases:                                                          │   │
│  │  • Session storage                                                   │   │
│  │  • API response caching                                              │   │
│  │  • Rate limiting counters                                            │   │
│  │  • Real-time leaderboards                                            │   │
│  │  • Job queues (BullMQ)                                               │   │
│  │  • Pub/Sub for WebSocket                                             │   │
│  │                                                                       │   │
│  │  Why Redis:                                                          │   │
│  │  • Sub-millisecond latency                                           │   │
│  │  • Rich data structures                                              │   │
│  │  • Pub/Sub capabilities                                              │   │
│  │  • Persistence options                                               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  S3                                                                  │   │
│  │  ──                                                                   │   │
│  │  Purpose: Object storage                                             │   │
│  │  Use Cases:                                                          │   │
│  │  • Generated reports (PDF, Excel)                                    │   │
│  │  • User uploads                                                      │   │
│  │  • ML model artifacts                                                │   │
│  │  • Raw crawled data                                                  │   │
│  │  • Backups                                                           │   │
│  │                                                                       │   │
│  │  Why S3:                                                             │   │
│  │  • Unlimited scalability                                             │   │
│  │  • 11 nines durability                                               │   │
│  │  • Cost-effective storage tiers                                      │   │
│  │  • Native AWS integration                                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6.3 PostgreSQL Schema Design

### 6.3.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    ENTITY RELATIONSHIP DIAGRAM                                      │
├─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                     │
│  ┌───────────────┐       ┌───────────────┐       ┌───────────────┐                                 │
│  │    users      │       │  workspaces   │       │  workspace_   │                                 │
│  │───────────────│       │───────────────│       │  members      │                                 │
│  │ id (PK)       │       │ id (PK)       │       │───────────────│                                 │
│  │ email         │       │ name          │       │ id (PK)       │                                 │
│  │ password_hash │       │ slug          │       │ workspace_id  │──────┐                          │
│  │ full_name     │       │ owner_id (FK) │◀──────│ user_id (FK)  │◀─────┼──────────────────────┐   │
│  │ avatar_url    │       │ plan_id (FK)  │       │ role          │      │                      │   │
│  │ created_at    │       │ settings      │       │ invited_at    │      │                      │   │
│  │ updated_at    │       │ created_at    │       │ joined_at     │      │                      │   │
│  └───────┬───────┘       └───────┬───────┘       └───────────────┘      │                      │   │
│          │                       │                                       │                      │   │
│          │                       │                                       │                      │   │
│          │                       ▼                                       │                      │   │
│          │               ┌───────────────┐       ┌───────────────┐      │                      │   │
│          │               │    brands     │       │   prompts     │      │                      │   │
│          │               │───────────────│       │───────────────│      │                      │   │
│          │               │ id (PK)       │       │ id (PK)       │      │                      │   │
│          │               │ workspace_id  │◀──────│ brand_id (FK) │◀─────┘                      │   │
│          │               │ name          │       │ template      │                              │   │
│          │               │ domain        │       │ category      │                              │   │
│          │               │ keywords      │       │ is_active     │                              │   │
│          │               │ competitors   │       │ schedule      │                              │   │
│          │               │ settings      │       │ created_at    │                              │   │
│          │               │ created_at    │       └───────────────┘                              │   │
│          │               └───────┬───────┘                                                      │   │
│          │                       │                                                              │   │
│          │                       │                                                              │   │
│          │                       ▼                                                              │   │
│          │               ┌───────────────┐       ┌───────────────┐                              │   │
│          │               │  citations    │       │ subscriptions │                              │   │
│          │               │───────────────│       │───────────────│                              │   │
│          │               │ id (PK)       │       │ id (PK)       │                              │   │
│          │               │ brand_id (FK) │       │ workspace_id  │◀─────────────────────────────┘   │
│          │               │ source        │       │ plan_id (FK)  │                                  │
│          │               │ content       │       │ status        │                                  │
│          │               │ context       │       │ current_period│                                  │
│          │               │ sentiment     │       │ stripe_id     │                                  │
│          │               │ type          │       │ created_at    │                                  │
│          │               │ detected_at   │       └───────────────┘                                  │
│          │               └───────────────┘                                                          │
│          │                                                                                          │
│          ▼                                                                                          │
│  ┌───────────────┐       ┌───────────────┐       ┌───────────────┐                                 │
│  │   sessions    │       │   api_keys    │       │    alerts     │                                 │
│  │───────────────│       │───────────────│       │───────────────│                                 │
│  │ id (PK)       │       │ id (PK)       │       │ id (PK)       │                                 │
│  │ user_id (FK)  │       │ workspace_id  │       │ workspace_id  │                                 │
│  │ token_hash    │       │ name          │       │ brand_id (FK) │                                 │
│  │ expires_at    │       │ key_prefix    │       │ type          │                                 │
│  │ user_agent    │       │ key_hash      │       │ condition     │                                 │
│  │ ip_address    │       │ permissions   │       │ threshold     │                                 │
│  │ created_at    │       │ last_used_at  │       │ channels      │                                 │
│  └───────────────┘       │ created_at    │       │ is_active     │                                 │
│                          └───────────────┘       └───────────────┘                                 │
│                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 6.3.2 Core Tables Schema

```sql
-- =====================================================
-- AUTH SCHEMA
-- =====================================================

CREATE SCHEMA auth;

-- Users table
CREATE TABLE auth.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    phone VARCHAR(50),
    phone_verified BOOLEAN DEFAULT FALSE,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    last_login_at TIMESTAMPTZ,
    last_login_ip INET,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON auth.users(email);
CREATE INDEX idx_users_deleted_at ON auth.users(deleted_at) WHERE deleted_at IS NULL;

-- Sessions table
CREATE TABLE auth.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    refresh_token_hash VARCHAR(64),
    user_agent TEXT,
    ip_address INET,
    device_type VARCHAR(50),
    expires_at TIMESTAMPTZ NOT NULL,
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON auth.sessions(user_id);
CREATE INDEX idx_sessions_token_hash ON auth.sessions(token_hash);
CREATE INDEX idx_sessions_expires_at ON auth.sessions(expires_at);

-- OAuth connections
CREATE TABLE auth.oauth_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(provider, provider_user_id)
);

CREATE INDEX idx_oauth_connections_user_id ON auth.oauth_connections(user_id);

-- =====================================================
-- WORKSPACE SCHEMA
-- =====================================================

CREATE SCHEMA workspace;

-- Plans table
CREATE TABLE workspace.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10, 2) NOT NULL,
    price_yearly DECIMAL(10, 2) NOT NULL,
    features JSONB NOT NULL DEFAULT '{}',
    limits JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspaces table
CREATE TABLE workspace.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    owner_id UUID NOT NULL REFERENCES auth.users(id),
    plan_id UUID NOT NULL REFERENCES workspace.plans(id),
    logo_url TEXT,
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    trial_ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_workspaces_owner_id ON workspace.workspaces(owner_id);
CREATE INDEX idx_workspaces_slug ON workspace.workspaces(slug);
CREATE INDEX idx_workspaces_deleted_at ON workspace.workspaces(deleted_at) WHERE deleted_at IS NULL;

-- Workspace members
CREATE TABLE workspace.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'member',
    permissions JSONB DEFAULT '{}',
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    joined_at TIMESTAMPTZ,
    UNIQUE(workspace_id, user_id)
);

CREATE INDEX idx_members_workspace_id ON workspace.members(workspace_id);
CREATE INDEX idx_members_user_id ON workspace.members(user_id);

-- =====================================================
-- MONITORING SCHEMA
-- =====================================================

CREATE SCHEMA monitoring;

-- Brands table
CREATE TABLE monitoring.brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace.workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    domain VARCHAR(255),
    logo_url TEXT,
    description TEXT,
    keywords TEXT[] DEFAULT '{}',
    negative_keywords TEXT[] DEFAULT '{}',
    competitors UUID[] DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_brands_workspace_id ON monitoring.brands(workspace_id);
CREATE INDEX idx_brands_name ON monitoring.brands(name);
CREATE INDEX idx_brands_keywords ON monitoring.brands USING GIN(keywords);

-- Prompts table
CREATE TABLE monitoring.prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES monitoring.brands(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    template TEXT NOT NULL,
    variables JSONB DEFAULT '{}',
    category VARCHAR(100),
    tags TEXT[] DEFAULT '{}',
    ai_providers TEXT[] DEFAULT '{"openai", "anthropic", "google"}',
    schedule_cron VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    priority INT DEFAULT 0,
    last_run_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prompts_brand_id ON monitoring.prompts(brand_id);
CREATE INDEX idx_prompts_category ON monitoring.prompts(category);
CREATE INDEX idx_prompts_is_active ON monitoring.prompts(is_active);

-- Monitoring runs
CREATE TABLE monitoring.runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace.workspaces(id),
    prompt_id UUID REFERENCES monitoring.prompts(id),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    total_queries INT DEFAULT 0,
    successful_queries INT DEFAULT 0,
    failed_queries INT DEFAULT 0,
    citations_found INT DEFAULT 0,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_runs_workspace_id ON monitoring.runs(workspace_id);
CREATE INDEX idx_runs_status ON monitoring.runs(status);
CREATE INDEX idx_runs_created_at ON monitoring.runs(created_at DESC);

-- =====================================================
-- CITATION SCHEMA
-- =====================================================

CREATE SCHEMA citation;

-- Citations table
CREATE TABLE citation.citations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES monitoring.brands(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspace.workspaces(id),
    monitoring_run_id UUID REFERENCES monitoring.runs(id),
    source VARCHAR(100) NOT NULL,
    source_model VARCHAR(100),
    prompt_used TEXT,
    response_text TEXT NOT NULL,
    citation_text TEXT NOT NULL,
    citation_context TEXT,
    citation_type VARCHAR(50),
    sentiment VARCHAR(20),
    sentiment_score DECIMAL(5, 4),
    confidence_score DECIMAL(5, 4),
    position_in_response INT,
    is_recommendation BOOLEAN DEFAULT FALSE,
    competitor_mentioned UUID[],
    metadata JSONB DEFAULT '{}',
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_citations_brand_id ON citation.citations(brand_id);
CREATE INDEX idx_citations_workspace_id ON citation.citations(workspace_id);
CREATE INDEX idx_citations_source ON citation.citations(source);
CREATE INDEX idx_citations_sentiment ON citation.citations(sentiment);
CREATE INDEX idx_citations_detected_at ON citation.citations(detected_at DESC);
CREATE INDEX idx_citations_type ON citation.citations(citation_type);

-- Citation sources (for tracking source URLs)
CREATE TABLE citation.sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    citation_id UUID NOT NULL REFERENCES citation.citations(id) ON DELETE CASCADE,
    url TEXT,
    title TEXT,
    source_type VARCHAR(50),
    crawled_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_citation_sources_citation_id ON citation.sources(citation_id);

-- =====================================================
-- BILLING SCHEMA
-- =====================================================

CREATE SCHEMA billing;

-- Subscriptions
CREATE TABLE billing.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace.workspaces(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES workspace.plans(id),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMPTZ,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_workspace_id ON billing.subscriptions(workspace_id);
CREATE INDEX idx_subscriptions_status ON billing.subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_id ON billing.subscriptions(stripe_subscription_id);

-- Invoices
CREATE TABLE billing.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace.workspaces(id),
    subscription_id UUID REFERENCES billing.subscriptions(id),
    stripe_invoice_id VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL,
    due_date TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    invoice_pdf_url TEXT,
    line_items JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_workspace_id ON billing.invoices(workspace_id);
CREATE INDEX idx_invoices_status ON billing.invoices(status);

-- Usage records
CREATE TABLE billing.usage_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace.workspaces(id),
    subscription_id UUID REFERENCES billing.subscriptions(id),
    metric_name VARCHAR(100) NOT NULL,
    quantity DECIMAL(20, 6) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    unit_price DECIMAL(10, 6),
    total_cost DECIMAL(10, 2),
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_usage_records_workspace_id ON billing.usage_records(workspace_id);
CREATE INDEX idx_usage_records_metric ON billing.usage_records(metric_name);
CREATE INDEX idx_usage_records_period ON billing.usage_records(period_start, period_end);

-- =====================================================
-- REPORT SCHEMA
-- =====================================================

CREATE SCHEMA report;

-- Report templates
CREATE TABLE report.templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspace.workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(100) NOT NULL,
    config JSONB NOT NULL DEFAULT '{}',
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_report_templates_workspace_id ON report.templates(workspace_id);
CREATE INDEX idx_report_templates_type ON report.templates(type);

-- Reports
CREATE TABLE report.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace.workspaces(id) ON DELETE CASCADE,
    template_id UUID REFERENCES report.templates(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    format VARCHAR(20) NOT NULL DEFAULT 'pdf',
    parameters JSONB DEFAULT '{}',
    file_url TEXT,
    file_size_bytes BIGINT,
    generated_by UUID REFERENCES auth.users(id),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_workspace_id ON report.reports(workspace_id);
CREATE INDEX idx_reports_status ON report.reports(status);
CREATE INDEX idx_reports_created_at ON report.reports(created_at DESC);

-- Report schedules
CREATE TABLE report.schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace.workspaces(id) ON DELETE CASCADE,
    template_id UUID REFERENCES report.templates(id),
    name VARCHAR(255) NOT NULL,
    cron_expression VARCHAR(100) NOT NULL,
    timezone VARCHAR(100) DEFAULT 'UTC',
    parameters JSONB DEFAULT '{}',
    recipients JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_report_schedules_workspace_id ON report.schedules(workspace_id);
CREATE INDEX idx_report_schedules_next_run ON report.schedules(next_run_at) WHERE is_active = TRUE;

-- =====================================================
-- ALERT SCHEMA
-- =====================================================

CREATE SCHEMA alert;

-- Alert rules
CREATE TABLE alert.rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace.workspaces(id) ON DELETE CASCADE,
    brand_id UUID REFERENCES monitoring.brands(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(100) NOT NULL,
    condition JSONB NOT NULL,
    threshold JSONB,
    channels JSONB NOT NULL DEFAULT '[]',
    cooldown_minutes INT DEFAULT 60,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alert_rules_workspace_id ON alert.rules(workspace_id);
CREATE INDEX idx_alert_rules_brand_id ON alert.rules(brand_id);
CREATE INDEX idx_alert_rules_type ON alert.rules(type);

-- Alert history
CREATE TABLE alert.history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID NOT NULL REFERENCES alert.rules(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspace.workspaces(id),
    status VARCHAR(50) NOT NULL,
    triggered_value JSONB,
    message TEXT,
    channels_notified JSONB DEFAULT '[]',
    acknowledged_by UUID REFERENCES auth.users(id),
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    triggered_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alert_history_rule_id ON alert.history(rule_id);
CREATE INDEX idx_alert_history_workspace_id ON alert.history(workspace_id);
CREATE INDEX idx_alert_history_triggered_at ON alert.history(triggered_at DESC);

-- =====================================================
-- API SCHEMA
-- =====================================================

CREATE SCHEMA api;

-- API keys
CREATE TABLE api.keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace.workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_prefix VARCHAR(10) NOT NULL,
    key_hash VARCHAR(64) NOT NULL UNIQUE,
    permissions JSONB DEFAULT '[]',
    rate_limit INT DEFAULT 1000,
    expires_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    last_used_ip INET,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    revoked_at TIMESTAMPTZ
);

CREATE INDEX idx_api_keys_workspace_id ON api.keys(workspace_id);
CREATE INDEX idx_api_keys_key_hash ON api.keys(key_hash);
CREATE INDEX idx_api_keys_key_prefix ON api.keys(key_prefix);

-- Webhook endpoints
CREATE TABLE api.webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace.workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    secret VARCHAR(255) NOT NULL,
    events TEXT[] NOT NULL DEFAULT '{}',
    headers JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    last_triggered_at TIMESTAMPTZ,
    failure_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_webhooks_workspace_id ON api.webhooks(workspace_id);
CREATE INDEX idx_webhooks_events ON api.webhooks USING GIN(events);

-- Webhook delivery log
CREATE TABLE api.webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id UUID NOT NULL REFERENCES api.webhooks(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    status_code INT,
    response_body TEXT,
    response_time_ms INT,
    attempt_number INT DEFAULT 1,
    next_retry_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_webhook_deliveries_webhook_id ON api.webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_delivered_at ON api.webhook_deliveries(delivered_at DESC);
```

---

## 6.4 TimescaleDB Schema Design

### 6.4.1 Time-Series Tables

```sql
-- =====================================================
-- TIMESERIES SCHEMA (TimescaleDB)
-- =====================================================

CREATE SCHEMA timeseries;

-- Monitoring results (hypertable)
CREATE TABLE timeseries.monitoring_results (
    time TIMESTAMPTZ NOT NULL,
    workspace_id UUID NOT NULL,
    brand_id UUID NOT NULL,
    prompt_id UUID,
    ai_provider VARCHAR(50) NOT NULL,
    ai_model VARCHAR(100),
    query_text TEXT,
    response_text TEXT,
    response_time_ms INT,
    tokens_used INT,
    cost_usd DECIMAL(10, 6),
    brand_mentioned BOOLEAN,
    sentiment VARCHAR(20),
    sentiment_score DECIMAL(5, 4),
    citation_count INT DEFAULT 0,
    metadata JSONB DEFAULT '{}'
);

SELECT create_hypertable('timeseries.monitoring_results', 'time',
    chunk_time_interval => INTERVAL '1 day');

CREATE INDEX idx_monitoring_results_workspace ON timeseries.monitoring_results(workspace_id, time DESC);
CREATE INDEX idx_monitoring_results_brand ON timeseries.monitoring_results(brand_id, time DESC);
CREATE INDEX idx_monitoring_results_provider ON timeseries.monitoring_results(ai_provider, time DESC);

-- Visibility scores (hypertable)
CREATE TABLE timeseries.visibility_scores (
    time TIMESTAMPTZ NOT NULL,
    workspace_id UUID NOT NULL,
    brand_id UUID NOT NULL,
    overall_score DECIMAL(5, 2),
    citation_score DECIMAL(5, 2),
    sentiment_score DECIMAL(5, 2),
    recommendation_score DECIMAL(5, 2),
    coverage_score DECIMAL(5, 2),
    score_breakdown JSONB DEFAULT '{}',
    ai_provider_scores JSONB DEFAULT '{}',
    compared_to_previous DECIMAL(5, 2)
);

SELECT create_hypertable('timeseries.visibility_scores', 'time',
    chunk_time_interval => INTERVAL '1 hour');

CREATE INDEX idx_visibility_scores_brand ON timeseries.visibility_scores(brand_id, time DESC);
CREATE INDEX idx_visibility_scores_workspace ON timeseries.visibility_scores(workspace_id, time DESC);

-- AI response metrics (hypertable)
CREATE TABLE timeseries.ai_metrics (
    time TIMESTAMPTZ NOT NULL,
    workspace_id UUID NOT NULL,
    ai_provider VARCHAR(50) NOT NULL,
    ai_model VARCHAR(100) NOT NULL,
    request_count INT DEFAULT 0,
    success_count INT DEFAULT 0,
    error_count INT DEFAULT 0,
    avg_response_time_ms DECIMAL(10, 2),
    p50_response_time_ms INT,
    p95_response_time_ms INT,
    p99_response_time_ms INT,
    total_tokens INT DEFAULT 0,
    total_cost_usd DECIMAL(10, 4) DEFAULT 0
);

SELECT create_hypertable('timeseries.ai_metrics', 'time',
    chunk_time_interval => INTERVAL '1 hour');

CREATE INDEX idx_ai_metrics_provider ON timeseries.ai_metrics(ai_provider, time DESC);

-- Usage metrics (hypertable)
CREATE TABLE timeseries.usage_metrics (
    time TIMESTAMPTZ NOT NULL,
    workspace_id UUID NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(20, 6) NOT NULL,
    dimensions JSONB DEFAULT '{}'
);

SELECT create_hypertable('timeseries.usage_metrics', 'time',
    chunk_time_interval => INTERVAL '1 day');

CREATE INDEX idx_usage_metrics_workspace ON timeseries.usage_metrics(workspace_id, time DESC);
CREATE INDEX idx_usage_metrics_name ON timeseries.usage_metrics(metric_name, time DESC);

-- =====================================================
-- CONTINUOUS AGGREGATES
-- =====================================================

-- Hourly visibility aggregates
CREATE MATERIALIZED VIEW timeseries.visibility_hourly
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 hour', time) AS bucket,
    workspace_id,
    brand_id,
    AVG(overall_score) AS avg_overall_score,
    AVG(citation_score) AS avg_citation_score,
    AVG(sentiment_score) AS avg_sentiment_score,
    MAX(overall_score) AS max_overall_score,
    MIN(overall_score) AS min_overall_score
FROM timeseries.visibility_scores
GROUP BY bucket, workspace_id, brand_id
WITH NO DATA;

SELECT add_continuous_aggregate_policy('timeseries.visibility_hourly',
    start_offset => INTERVAL '3 hours',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour');

-- Daily visibility aggregates
CREATE MATERIALIZED VIEW timeseries.visibility_daily
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 day', time) AS bucket,
    workspace_id,
    brand_id,
    AVG(overall_score) AS avg_overall_score,
    AVG(citation_score) AS avg_citation_score,
    AVG(sentiment_score) AS avg_sentiment_score,
    AVG(recommendation_score) AS avg_recommendation_score,
    AVG(coverage_score) AS avg_coverage_score
FROM timeseries.visibility_scores
GROUP BY bucket, workspace_id, brand_id
WITH NO DATA;

SELECT add_continuous_aggregate_policy('timeseries.visibility_daily',
    start_offset => INTERVAL '3 days',
    end_offset => INTERVAL '1 day',
    schedule_interval => INTERVAL '1 day');

-- Daily monitoring aggregates
CREATE MATERIALIZED VIEW timeseries.monitoring_daily
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 day', time) AS bucket,
    workspace_id,
    brand_id,
    ai_provider,
    COUNT(*) AS total_queries,
    SUM(CASE WHEN brand_mentioned THEN 1 ELSE 0 END) AS mentions,
    AVG(sentiment_score) AS avg_sentiment,
    SUM(citation_count) AS total_citations,
    SUM(tokens_used) AS total_tokens,
    SUM(cost_usd) AS total_cost
FROM timeseries.monitoring_results
GROUP BY bucket, workspace_id, brand_id, ai_provider
WITH NO DATA;

SELECT add_continuous_aggregate_policy('timeseries.monitoring_daily',
    start_offset => INTERVAL '3 days',
    end_offset => INTERVAL '1 day',
    schedule_interval => INTERVAL '1 day');

-- =====================================================
-- RETENTION POLICIES
-- =====================================================

-- Raw monitoring results: 90 days
SELECT add_retention_policy('timeseries.monitoring_results', INTERVAL '90 days');

-- Visibility scores: 90 days for raw, aggregates longer
SELECT add_retention_policy('timeseries.visibility_scores', INTERVAL '90 days');

-- AI metrics: 365 days
SELECT add_retention_policy('timeseries.ai_metrics', INTERVAL '365 days');

-- Usage metrics: 365 days
SELECT add_retention_policy('timeseries.usage_metrics', INTERVAL '365 days');

-- Hourly aggregates: 90 days
SELECT add_retention_policy('timeseries.visibility_hourly', INTERVAL '90 days');

-- Daily aggregates: 5 years
SELECT add_retention_policy('timeseries.visibility_daily', INTERVAL '1825 days');
SELECT add_retention_policy('timeseries.monitoring_daily', INTERVAL '1825 days');

-- =====================================================
-- COMPRESSION POLICIES
-- =====================================================

-- Enable compression
ALTER TABLE timeseries.monitoring_results SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'workspace_id, brand_id'
);

ALTER TABLE timeseries.visibility_scores SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'workspace_id, brand_id'
);

-- Compression policies (compress after 7 days)
SELECT add_compression_policy('timeseries.monitoring_results', INTERVAL '7 days');
SELECT add_compression_policy('timeseries.visibility_scores', INTERVAL '7 days');
SELECT add_compression_policy('timeseries.ai_metrics', INTERVAL '7 days');
SELECT add_compression_policy('timeseries.usage_metrics', INTERVAL '7 days');
```

---

## 6.5 OpenSearch Index Design

### 6.5.1 Index Mappings

```json
// Citations Index
PUT /citations
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 2,
    "analysis": {
      "analyzer": {
        "citation_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "asciifolding", "porter_stem"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "workspace_id": { "type": "keyword" },
      "brand_id": { "type": "keyword" },
      "source": { "type": "keyword" },
      "source_model": { "type": "keyword" },
      "prompt_used": {
        "type": "text",
        "analyzer": "citation_analyzer"
      },
      "response_text": {
        "type": "text",
        "analyzer": "citation_analyzer"
      },
      "citation_text": {
        "type": "text",
        "analyzer": "citation_analyzer",
        "fields": {
          "keyword": { "type": "keyword" }
        }
      },
      "citation_context": {
        "type": "text",
        "analyzer": "citation_analyzer"
      },
      "citation_type": { "type": "keyword" },
      "sentiment": { "type": "keyword" },
      "sentiment_score": { "type": "float" },
      "confidence_score": { "type": "float" },
      "is_recommendation": { "type": "boolean" },
      "competitor_mentioned": { "type": "keyword" },
      "detected_at": { "type": "date" },
      "created_at": { "type": "date" },
      "metadata": {
        "type": "object",
        "enabled": false
      }
    }
  }
}

// Content Index
PUT /content
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 2,
    "analysis": {
      "analyzer": {
        "content_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "asciifolding", "word_delimiter_graph", "porter_stem"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "workspace_id": { "type": "keyword" },
      "brand_id": { "type": "keyword" },
      "url": { "type": "keyword" },
      "domain": { "type": "keyword" },
      "title": {
        "type": "text",
        "analyzer": "content_analyzer",
        "fields": {
          "keyword": { "type": "keyword" }
        }
      },
      "content": {
        "type": "text",
        "analyzer": "content_analyzer"
      },
      "content_type": { "type": "keyword" },
      "language": { "type": "keyword" },
      "word_count": { "type": "integer" },
      "readability_score": { "type": "float" },
      "seo_score": { "type": "float" },
      "keywords": { "type": "keyword" },
      "entities": {
        "type": "nested",
        "properties": {
          "text": { "type": "keyword" },
          "type": { "type": "keyword" },
          "confidence": { "type": "float" }
        }
      },
      "crawled_at": { "type": "date" },
      "last_modified": { "type": "date" }
    }
  }
}

// Logs Index Template
PUT /_index_template/logs-template
{
  "index_patterns": ["logs-*"],
  "template": {
    "settings": {
      "number_of_shards": 2,
      "number_of_replicas": 1,
      "index.lifecycle.name": "logs-policy",
      "index.lifecycle.rollover_alias": "logs"
    },
    "mappings": {
      "properties": {
        "@timestamp": { "type": "date" },
        "level": { "type": "keyword" },
        "service": { "type": "keyword" },
        "trace_id": { "type": "keyword" },
        "span_id": { "type": "keyword" },
        "message": { "type": "text" },
        "context": {
          "type": "object",
          "enabled": false
        },
        "error": {
          "properties": {
            "type": { "type": "keyword" },
            "message": { "type": "text" },
            "stack_trace": { "type": "text" }
          }
        }
      }
    }
  }
}

// Index Lifecycle Management Policy
PUT /_ilm/policy/logs-policy
{
  "policy": {
    "phases": {
      "hot": {
        "min_age": "0ms",
        "actions": {
          "rollover": {
            "max_age": "1d",
            "max_primary_shard_size": "50gb"
          }
        }
      },
      "warm": {
        "min_age": "7d",
        "actions": {
          "shrink": {
            "number_of_shards": 1
          },
          "forcemerge": {
            "max_num_segments": 1
          }
        }
      },
      "cold": {
        "min_age": "30d",
        "actions": {
          "allocate": {
            "number_of_replicas": 0
          }
        }
      },
      "delete": {
        "min_age": "90d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}
```

---

## 6.6 Redis Data Structures

### 6.6.1 Cache Patterns

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           REDIS DATA STRUCTURES                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SESSION CACHE                                                             │
│  ─────────────                                                              │
│  Key Pattern: session:{session_id}                                         │
│  Type: Hash                                                                 │
│  TTL: 3600 seconds (1 hour)                                                │
│  Fields:                                                                   │
│    - user_id                                                               │
│    - workspace_id                                                          │
│    - role                                                                  │
│    - permissions                                                           │
│    - created_at                                                            │
│                                                                             │
│  USER CACHE                                                                │
│  ──────────                                                                 │
│  Key Pattern: user:{user_id}                                               │
│  Type: Hash                                                                 │
│  TTL: 300 seconds (5 minutes)                                              │
│  Fields:                                                                   │
│    - email                                                                 │
│    - full_name                                                             │
│    - avatar_url                                                            │
│    - workspaces (JSON array)                                               │
│                                                                             │
│  API RESPONSE CACHE                                                        │
│  ──────────────────                                                         │
│  Key Pattern: cache:{workspace_id}:{endpoint_hash}                         │
│  Type: String (JSON)                                                       │
│  TTL: 60-300 seconds (depends on endpoint)                                 │
│                                                                             │
│  RATE LIMITING                                                             │
│  ─────────────                                                              │
│  Key Pattern: rate:{identifier}:{window}                                   │
│  Type: String (counter)                                                    │
│  TTL: Window size in seconds                                               │
│                                                                             │
│  Example:                                                                  │
│    rate:ip:192.168.1.1:minute → 45                                        │
│    rate:user:uuid:hour → 1234                                              │
│    rate:api_key:prefix:day → 50000                                        │
│                                                                             │
│  DISTRIBUTED LOCKS                                                         │
│  ─────────────────                                                          │
│  Key Pattern: lock:{resource}:{id}                                         │
│  Type: String                                                              │
│  TTL: 30 seconds (with renewal)                                           │
│  Value: Lock holder ID                                                     │
│                                                                             │
│  REAL-TIME VISIBILITY SCORES                                               │
│  ───────────────────────────                                                │
│  Key Pattern: visibility:{brand_id}:current                                │
│  Type: Hash                                                                 │
│  TTL: None (always fresh)                                                  │
│  Fields:                                                                   │
│    - overall_score                                                         │
│    - citation_score                                                        │
│    - sentiment_score                                                       │
│    - updated_at                                                            │
│                                                                             │
│  WEBSOCKET CONNECTION TRACKING                                             │
│  ─────────────────────────────                                              │
│  Key Pattern: ws:connections:{user_id}                                     │
│  Type: Set                                                                 │
│  Value: Connection IDs                                                     │
│                                                                             │
│  Key Pattern: ws:subscriptions:{channel}                                   │
│  Type: Set                                                                 │
│  Value: Connection IDs subscribed to channel                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.6.2 Job Queue Structure (BullMQ)

```typescript
// Queue Definitions
const queues = {
  // High priority - real-time operations
  'monitoring-priority': {
    defaultJobOptions: {
      priority: 1,
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: 100,
      removeOnFail: 1000,
    },
  },

  // Standard monitoring jobs
  'monitoring-standard': {
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: 1000,
      removeOnFail: 5000,
    },
  },

  // Report generation
  'reports': {
    defaultJobOptions: {
      attempts: 2,
      backoff: { type: 'fixed', delay: 30000 },
      timeout: 300000, // 5 minutes
      removeOnComplete: 100,
    },
  },

  // Notifications
  'notifications': {
    defaultJobOptions: {
      attempts: 5,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: 1000,
    },
  },

  // Webhooks
  'webhooks': {
    defaultJobOptions: {
      attempts: 5,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: 500,
      removeOnFail: 5000,
    },
  },
};

// Job Data Structures
interface MonitoringJob {
  workspaceId: string;
  brandId: string;
  promptId: string;
  provider: string;
  model: string;
  prompt: string;
  metadata: Record<string, any>;
}

interface ReportJob {
  workspaceId: string;
  reportId: string;
  templateId: string;
  format: 'pdf' | 'excel' | 'csv';
  parameters: Record<string, any>;
  userId: string;
}

interface NotificationJob {
  type: 'email' | 'slack' | 'webhook' | 'push';
  recipient: string;
  template: string;
  data: Record<string, any>;
  priority: 'high' | 'normal' | 'low';
}
```

---

## 6.7 Data Migration Strategy

### 6.7.1 Migration Approach

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MIGRATION STRATEGY                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  MIGRATION PRINCIPLES                                                      │
│  ────────────────────                                                       │
│                                                                             │
│  1. Zero-Downtime Migrations                                               │
│     • All migrations must be backward compatible                           │
│     • Use expand-contract pattern for schema changes                       │
│     • No breaking changes in single migration                              │
│                                                                             │
│  2. Versioned Migrations                                                   │
│     • Use sequential version numbers                                       │
│     • Store migration history in database                                  │
│     • Support rollback for each migration                                  │
│                                                                             │
│  3. Automated Testing                                                      │
│     • Test migrations in staging first                                     │
│     • Validate data integrity after migration                              │
│     • Performance test with production-like data                           │
│                                                                             │
│  EXPAND-CONTRACT PATTERN                                                   │
│  ───────────────────────                                                    │
│                                                                             │
│  Phase 1: Expand                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  • Add new column (nullable or with default)                         │   │
│  │  • Create new table                                                  │   │
│  │  • Add new index                                                     │   │
│  │  • Deploy code that writes to both old and new                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Phase 2: Migrate                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  • Backfill new column/table                                         │   │
│  │  • Run data migration in batches                                     │   │
│  │  • Validate migrated data                                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Phase 3: Contract                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  • Deploy code that reads only from new                              │   │
│  │  • Stop writing to old                                               │   │
│  │  • Remove old column/table (separate migration)                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.7.2 Migration Tools

```typescript
// Migration file example: 20240115_001_add_mfa_fields.ts

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMfaFields20240115001 implements MigrationInterface {
  name = 'AddMfaFields20240115001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Phase 1: Expand - Add new columns
    await queryRunner.query(`
      ALTER TABLE auth.users
      ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS mfa_secret VARCHAR(255),
      ADD COLUMN IF NOT EXISTS mfa_backup_codes TEXT[]
    `);

    // Add index
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_mfa_enabled
      ON auth.users(mfa_enabled) WHERE mfa_enabled = TRUE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback
    await queryRunner.query(`
      DROP INDEX IF EXISTS auth.idx_users_mfa_enabled
    `);

    await queryRunner.query(`
      ALTER TABLE auth.users
      DROP COLUMN IF EXISTS mfa_enabled,
      DROP COLUMN IF EXISTS mfa_secret,
      DROP COLUMN IF EXISTS mfa_backup_codes
    `);
  }
}
```

---

## 6.8 Data Backup & Recovery

### 6.8.1 Backup Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BACKUP STRATEGY                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  AURORA POSTGRESQL                                                         │
│  ─────────────────                                                          │
│                                                                             │
│  Automated Backups:                                                        │
│  • Continuous backup to S3                                                 │
│  • Retention: 35 days                                                      │
│  • Point-in-time recovery: Any second within retention                    │
│                                                                             │
│  Manual Snapshots:                                                         │
│  • Daily: Production database                                              │
│  • Weekly: Full cluster snapshot                                           │
│  • Retention: 90 days                                                      │
│                                                                             │
│  Cross-Region Replication:                                                 │
│  • Global Database: us-east-1 → us-west-2                                 │
│  • Replication lag: < 1 second                                            │
│                                                                             │
│  TIMESCALEDB                                                               │
│  ───────────                                                                │
│                                                                             │
│  pg_dump Strategy:                                                         │
│  • Full backup: Daily at 02:00 UTC                                        │
│  • Incremental: Every 6 hours                                             │
│  • Storage: S3 with versioning                                            │
│  • Retention: 30 days                                                      │
│                                                                             │
│  Streaming Replication:                                                    │
│  • Primary → Standby (same region)                                        │
│  • Synchronous for critical data                                          │
│                                                                             │
│  OPENSEARCH                                                                │
│  ──────────                                                                 │
│                                                                             │
│  Automated Snapshots:                                                      │
│  • Hourly snapshots to S3                                                  │
│  • Retention: 14 days                                                      │
│                                                                             │
│  Manual Snapshots:                                                         │
│  • Weekly full snapshot                                                    │
│  • Retention: 90 days                                                      │
│                                                                             │
│  REDIS                                                                     │
│  ─────                                                                      │
│                                                                             │
│  RDB Snapshots:                                                            │
│  • Every 6 hours                                                           │
│  • Backup to S3                                                            │
│  • Retention: 7 days                                                       │
│                                                                             │
│  AOF (Append Only File):                                                   │
│  • Enabled for data durability                                             │
│  • Fsync every second                                                      │
│                                                                             │
│  S3 STORAGE                                                                │
│  ──────────                                                                 │
│                                                                             │
│  Cross-Region Replication:                                                 │
│  • All buckets replicated to DR region                                    │
│  • Versioning enabled                                                      │
│  • Object Lock for compliance data                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.8.2 Recovery Procedures

| Scenario | RTO | RPO | Procedure |
|----------|-----|-----|-----------|
| Single table corruption | 15 min | 0 | Point-in-time recovery |
| Database instance failure | 1 min | 0 | Aurora automatic failover |
| Full database corruption | 30 min | < 5 min | Restore from snapshot |
| Regional outage | 15 min | < 1 min | Failover to DR region |
| Accidental data deletion | 30 min | 0 | Point-in-time recovery |
| OpenSearch index corruption | 1 hour | < 1 hour | Restore from snapshot |
| Redis data loss | 5 min | < 1 min | Restore from RDB + replicas |

---

## 6.9 Performance Optimization

### 6.9.1 Query Optimization

```sql
-- =====================================================
-- COMMON QUERY PATTERNS WITH OPTIMIZATIONS
-- =====================================================

-- 1. Dashboard visibility score query
-- Uses covering index for fast retrieval
CREATE INDEX idx_visibility_dashboard ON timeseries.visibility_scores
    (workspace_id, brand_id, time DESC)
    INCLUDE (overall_score, citation_score, sentiment_score);

-- Query with index hint
SELECT
    time,
    overall_score,
    citation_score,
    sentiment_score
FROM timeseries.visibility_scores
WHERE workspace_id = $1
    AND brand_id = $2
    AND time >= NOW() - INTERVAL '30 days'
ORDER BY time DESC
LIMIT 720; -- 30 days * 24 hours

-- 2. Citation search with pagination
-- Uses composite index and keyset pagination
CREATE INDEX idx_citations_search ON citation.citations
    (workspace_id, detected_at DESC, id);

-- Efficient keyset pagination
SELECT *
FROM citation.citations
WHERE workspace_id = $1
    AND (detected_at, id) < ($2, $3)  -- cursor from previous page
ORDER BY detected_at DESC, id DESC
LIMIT 50;

-- 3. Aggregation queries with materialized views
-- Pre-computed daily stats
CREATE MATERIALIZED VIEW citation.daily_stats AS
SELECT
    date_trunc('day', detected_at) AS date,
    workspace_id,
    brand_id,
    source,
    COUNT(*) AS total_citations,
    COUNT(*) FILTER (WHERE sentiment = 'positive') AS positive,
    COUNT(*) FILTER (WHERE sentiment = 'negative') AS negative,
    COUNT(*) FILTER (WHERE sentiment = 'neutral') AS neutral,
    AVG(sentiment_score) AS avg_sentiment
FROM citation.citations
GROUP BY 1, 2, 3, 4;

CREATE UNIQUE INDEX ON citation.daily_stats (date, workspace_id, brand_id, source);

-- Refresh strategy
REFRESH MATERIALIZED VIEW CONCURRENTLY citation.daily_stats;

-- 4. Full-text search optimization
-- GIN index for keywords
CREATE INDEX idx_brands_keywords_gin ON monitoring.brands
    USING GIN (keywords);

-- tsvector for full-text search
ALTER TABLE citation.citations ADD COLUMN
    search_vector tsvector
    GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(citation_text, '') || ' ' || coalesce(citation_context, ''))
    ) STORED;

CREATE INDEX idx_citations_search_vector ON citation.citations
    USING GIN (search_vector);

-- Search query
SELECT *
FROM citation.citations
WHERE workspace_id = $1
    AND search_vector @@ plainto_tsquery('english', $2)
ORDER BY ts_rank(search_vector, plainto_tsquery('english', $2)) DESC
LIMIT 20;
```

### 6.9.2 Connection Pooling

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CONNECTION POOLING (PgBouncer)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CONFIGURATION                                                             │
│  ─────────────                                                              │
│                                                                             │
│  [databases]                                                               │
│  ai_visibility = host=aurora-cluster.xxx.rds.amazonaws.com                 │
│                  port=5432                                                  │
│                  dbname=ai_visibility                                       │
│                  auth_user=pgbouncer                                        │
│                                                                             │
│  [pgbouncer]                                                               │
│  listen_addr = *                                                           │
│  listen_port = 6432                                                        │
│  auth_type = scram-sha-256                                                 │
│  auth_file = /etc/pgbouncer/userlist.txt                                   │
│                                                                             │
│  # Pool settings                                                           │
│  pool_mode = transaction                                                   │
│  max_client_conn = 1000                                                    │
│  default_pool_size = 20                                                    │
│  min_pool_size = 5                                                         │
│  reserve_pool_size = 5                                                     │
│  reserve_pool_timeout = 3                                                  │
│                                                                             │
│  # Connection limits per database                                          │
│  max_db_connections = 100                                                  │
│  max_user_connections = 50                                                 │
│                                                                             │
│  # Timeouts                                                                │
│  server_connect_timeout = 15                                               │
│  server_idle_timeout = 600                                                 │
│  server_lifetime = 3600                                                    │
│  query_timeout = 60                                                        │
│  client_idle_timeout = 0                                                   │
│                                                                             │
│  POOL DISTRIBUTION                                                         │
│  ─────────────────                                                          │
│                                                                             │
│  API Services:      Pool Size = 30, Max = 50                               │
│  Worker Services:   Pool Size = 15, Max = 30                               │
│  Analytics:         Pool Size = 10, Max = 20                               │
│  Background Jobs:   Pool Size = 5,  Max = 10                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6.10 Data Governance

### 6.10.1 Data Classification

| Classification | Examples | Retention | Encryption | Access |
|---------------|----------|-----------|------------|--------|
| Public | Marketing content | Indefinite | In transit | All users |
| Internal | Usage metrics | 2 years | At rest + transit | Employees |
| Confidential | User profiles | Account lifetime + 30 days | Field-level | RBAC |
| Restricted | Payment info, API keys | Minimum required | Field-level + HSM | Strict RBAC |

### 6.10.2 GDPR Compliance

```sql
-- =====================================================
-- GDPR COMPLIANCE FUNCTIONS
-- =====================================================

-- Right to be forgotten - anonymize user data
CREATE OR REPLACE FUNCTION auth.anonymize_user(p_user_id UUID)
RETURNS void AS $$
BEGIN
    -- Update user record
    UPDATE auth.users
    SET
        email = 'deleted_' || id || '@anonymized.local',
        password_hash = NULL,
        full_name = 'Deleted User',
        avatar_url = NULL,
        phone = NULL,
        deleted_at = NOW()
    WHERE id = p_user_id;

    -- Remove OAuth connections
    DELETE FROM auth.oauth_connections WHERE user_id = p_user_id;

    -- Invalidate sessions
    DELETE FROM auth.sessions WHERE user_id = p_user_id;

    -- Anonymize audit logs (keep for compliance but remove PII)
    UPDATE audit.logs
    SET user_email = 'anonymized', user_ip = NULL
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Data export for portability
CREATE OR REPLACE FUNCTION auth.export_user_data(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'user', (SELECT row_to_json(u) FROM auth.users u WHERE u.id = p_user_id),
        'workspaces', (
            SELECT jsonb_agg(row_to_json(wm))
            FROM workspace.members wm
            WHERE wm.user_id = p_user_id
        ),
        'api_keys', (
            SELECT jsonb_agg(jsonb_build_object('name', name, 'created_at', created_at))
            FROM api.keys
            WHERE created_by = p_user_id
        )
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql;
```

---

*Document Version: 1.0*
*Last Updated: 2026-06-28*
*Next Review: 2026-07-28*
