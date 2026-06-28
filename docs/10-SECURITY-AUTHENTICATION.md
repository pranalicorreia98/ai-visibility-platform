# 10. Security & Authentication

## 10.1 Overview

This document details the security architecture and authentication mechanisms for the AI Visibility Platform, ensuring compliance with industry standards and best practices.

---

## 10.2 Authentication Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      AUTHENTICATION ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SUPPORTED METHODS                                                         │
│  ─────────────────                                                          │
│                                                                             │
│  1. Email/Password                                                         │
│     • Bcrypt hashing (cost factor 12)                                      │
│     • Minimum 12 characters                                                │
│     • Complexity requirements enforced                                     │
│                                                                             │
│  2. OAuth 2.0 / OIDC                                                       │
│     • Google                                                               │
│     • Microsoft Azure AD                                                   │
│     • GitHub                                                               │
│                                                                             │
│  3. Enterprise SSO                                                         │
│     • SAML 2.0                                                             │
│     • OIDC                                                                 │
│     • Custom IdP integration                                               │
│                                                                             │
│  4. Multi-Factor Authentication                                            │
│     • TOTP (Google Authenticator, Authy)                                  │
│     • WebAuthn/FIDO2 (hardware keys)                                      │
│     • SMS backup (discouraged, optional)                                  │
│                                                                             │
│  TOKEN ARCHITECTURE                                                        │
│  ──────────────────                                                         │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Access Token (JWT)                                                  │   │
│  │  ─────────────────                                                    │   │
│  │  • Algorithm: RS256                                                  │   │
│  │  • Expiry: 15 minutes                                                │   │
│  │  • Contains: user_id, workspace_id, permissions, exp, iat           │   │
│  │  • Stored: Memory only (never localStorage)                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Refresh Token                                                       │   │
│  │  ─────────────                                                        │   │
│  │  • Random 256-bit token                                              │   │
│  │  • Expiry: 7 days (30 days with "remember me")                      │   │
│  │  • Stored: HttpOnly, Secure, SameSite=Strict cookie                 │   │
│  │  • Rotated on each use                                               │   │
│  │  • Invalidated on logout                                             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  SESSION MANAGEMENT                                                        │
│  ──────────────────                                                         │
│                                                                             │
│  • Maximum concurrent sessions: 5 per user                                │
│  • Session bound to device fingerprint                                    │
│  • Automatic logout after 30 min inactivity                              │
│  • Force logout on password change                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 10.3 Authorization (RBAC)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ROLE-BASED ACCESS CONTROL                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ROLES                                                                     │
│  ─────                                                                      │
│                                                                             │
│  │ Role    │ Description                         │ Scope          │        │
│  ├─────────┼─────────────────────────────────────┼────────────────┤        │
│  │ Owner   │ Full workspace control              │ Workspace      │        │
│  │ Admin   │ All except billing & delete         │ Workspace      │        │
│  │ Manager │ Manage brands, reports, alerts      │ Workspace      │        │
│  │ Analyst │ View & analyze, trigger monitoring  │ Workspace      │        │
│  │ Viewer  │ Read-only access                    │ Workspace      │        │
│                                                                             │
│  PERMISSIONS MATRIX                                                        │
│  ──────────────────                                                         │
│                                                                             │
│  │ Permission         │Owner│Admin│Manager│Analyst│Viewer│                 │
│  ├────────────────────┼─────┼─────┼───────┼───────┼──────┤                 │
│  │ workspace:delete   │  ✓  │     │       │       │      │                 │
│  │ workspace:settings │  ✓  │  ✓  │       │       │      │                 │
│  │ billing:manage     │  ✓  │     │       │       │      │                 │
│  │ members:manage     │  ✓  │  ✓  │       │       │      │                 │
│  │ brands:write       │  ✓  │  ✓  │   ✓   │       │      │                 │
│  │ brands:read        │  ✓  │  ✓  │   ✓   │   ✓   │   ✓  │                 │
│  │ monitoring:trigger │  ✓  │  ✓  │   ✓   │   ✓   │      │                 │
│  │ reports:generate   │  ✓  │  ✓  │   ✓   │   ✓   │      │                 │
│  │ reports:read       │  ✓  │  ✓  │   ✓   │   ✓   │   ✓  │                 │
│  │ alerts:manage      │  ✓  │  ✓  │   ✓   │       │      │                 │
│  │ api_keys:manage    │  ✓  │  ✓  │       │       │      │                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 10.4 Data Encryption

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ENCRYPTION STANDARDS                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  AT REST                                                                   │
│  ───────                                                                    │
│  • Database: AES-256 (AWS RDS encryption)                                  │
│  • S3: AES-256 (SSE-KMS)                                                   │
│  • EBS volumes: AES-256                                                    │
│  • Sensitive fields: Application-level AES-256-GCM                         │
│                                                                             │
│  IN TRANSIT                                                                │
│  ──────────                                                                 │
│  • TLS 1.3 (preferred), TLS 1.2 (minimum)                                  │
│  • HSTS enabled (max-age: 1 year, includeSubDomains)                      │
│  • Certificate pinning for mobile apps                                    │
│                                                                             │
│  KEY MANAGEMENT                                                            │
│  ──────────────                                                             │
│  • AWS KMS for master keys                                                 │
│  • Automatic key rotation (yearly)                                         │
│  • Envelope encryption for data keys                                       │
│  • Customer-managed keys (Enterprise tier)                                 │
│                                                                             │
│  SENSITIVE DATA HANDLING                                                   │
│  ───────────────────────                                                    │
│  • PII encrypted at field level                                           │
│  • API keys hashed (SHA-256)                                              │
│  • Secrets in AWS Secrets Manager                                         │
│  • PII redacted from logs                                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 10.5 Security Controls

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SECURITY CONTROLS                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  NETWORK SECURITY                                                          │
│  ────────────────                                                           │
│  • WAF with managed rules (OWASP Top 10)                                  │
│  • DDoS protection (AWS Shield)                                           │
│  • VPC isolation for services                                             │
│  • Private subnets for databases                                          │
│                                                                             │
│  APPLICATION SECURITY                                                      │
│  ────────────────────                                                       │
│  • Input validation (Zod schemas)                                         │
│  • SQL injection prevention (parameterized queries)                       │
│  • XSS prevention (CSP, output encoding)                                  │
│  • CSRF protection (SameSite cookies)                                     │
│                                                                             │
│  AUDIT & COMPLIANCE                                                        │
│  ──────────────────                                                         │
│  • All actions logged with user attribution                               │
│  • Audit logs retained 7 years                                            │
│  • SOC 2 Type II certified                                                │
│  • GDPR compliant                                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

*Document Version: 1.0*
*Last Updated: 2026-06-28*
