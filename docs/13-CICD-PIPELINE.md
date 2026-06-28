# 13. CI/CD Pipeline

## 13.1 Overview

This document details the Continuous Integration and Continuous Deployment pipeline for the AI Visibility Platform.

---

## 13.2 Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CI/CD PIPELINE                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐      │
│  │  Code   │──▶│  Build  │──▶│  Test   │──▶│ Deploy  │──▶│ Monitor │      │
│  │  Push   │   │         │   │         │   │         │   │         │      │
│  └─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘      │
│                                                                             │
│  STAGES                                                                    │
│  ──────                                                                     │
│                                                                             │
│  1. CODE                                                                   │
│     • Git push to feature branch                                          │
│     • Automatic PR creation                                               │
│     • Code review required                                                │
│                                                                             │
│  2. BUILD                                                                  │
│     • Docker image build                                                  │
│     • Dependency caching                                                  │
│     • Image vulnerability scan                                            │
│     • Push to ECR                                                         │
│                                                                             │
│  3. TEST                                                                   │
│     • Unit tests (coverage > 80%)                                        │
│     • Integration tests                                                   │
│     • E2E tests (critical paths)                                         │
│     • Security scan (Snyk)                                               │
│                                                                             │
│  4. DEPLOY                                                                 │
│     • Staging: Automatic on merge                                         │
│     • Production: Manual approval                                         │
│     • Blue-green deployment                                               │
│     • Automated rollback                                                  │
│                                                                             │
│  5. MONITOR                                                                │
│     • Health checks                                                        │
│     • Error rate monitoring                                               │
│     • Performance validation                                              │
│     • Automatic rollback on failure                                       │
│                                                                             │
│  ENVIRONMENTS                                                              │
│  ────────────                                                               │
│                                                                             │
│  │ Environment │ Deploy Trigger │ Approval │ Duration │                   │
│  ├─────────────┼────────────────┼──────────┼──────────┤                   │
│  │ Development │ Push to branch │ None     │ ~5 min   │                   │
│  │ Staging     │ Merge to main  │ None     │ ~10 min  │                   │
│  │ Production  │ Git tag        │ Required │ ~15 min  │                   │
│                                                                             │
│  DEPLOYMENT STRATEGY                                                       │
│  ───────────────────                                                        │
│                                                                             │
│  • Blue-Green for stateless services                                      │
│  • Rolling updates for Kubernetes                                         │
│  • Database migrations: Online-only                                       │
│  • Feature flags for gradual rollout                                      │
│                                                                             │
│  ROLLBACK                                                                  │
│  ────────                                                                   │
│                                                                             │
│  • Automatic: Error rate > 5% in 5 minutes                               │
│  • Manual: One-click rollback                                             │
│  • Database: Backward-compatible migrations only                          │
│  • Rollback time: < 5 minutes                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 13.3 GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml

name: Deploy

on:
  push:
    branches: [main]
  release:
    types: [published]

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: ai-visibility

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to ECR
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and push
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:${{ github.sha }} .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:${{ github.sha }}

  test:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - name: Install dependencies
        run: pnpm install
      - name: Run tests
        run: pnpm test
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  deploy-staging:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    environment: staging
    steps:
      - name: Deploy to staging
        run: |
          kubectl set image deployment/api api=$ECR_REGISTRY/$ECR_REPOSITORY:${{ github.sha }}

  deploy-production:
    runs-on: ubuntu-latest
    needs: deploy-staging
    if: github.event_name == 'release'
    environment: production
    steps:
      - name: Deploy to production
        run: |
          kubectl set image deployment/api api=$ECR_REGISTRY/$ECR_REPOSITORY:${{ github.sha }}
```

---

*Document Version: 1.0*
*Last Updated: 2026-06-28*
