# 4. AWS Architecture

## 4.1 Overview

This document details the comprehensive AWS infrastructure architecture for the AI Visibility Platform. The architecture is designed for high availability, scalability, security, and cost optimization.

---

## 4.2 Architecture Principles

### 4.2.1 Design Principles

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ARCHITECTURE PRINCIPLES                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. SECURITY FIRST                                                         │
│     ────────────────                                                        │
│     • Defense in depth                                                     │
│     • Zero trust network model                                             │
│     • Encryption everywhere                                                │
│     • Least privilege access                                               │
│                                                                             │
│  2. HIGH AVAILABILITY                                                       │
│     ──────────────────                                                      │
│     • Multi-AZ deployment                                                  │
│     • No single point of failure                                           │
│     • Automatic failover                                                   │
│     • Regional redundancy                                                  │
│                                                                             │
│  3. SCALABILITY                                                            │
│     ───────────                                                             │
│     • Horizontal scaling preferred                                         │
│     • Stateless services                                                   │
│     • Auto-scaling with predictive policies                               │
│     • Event-driven architecture                                            │
│                                                                             │
│  4. COST OPTIMIZATION                                                      │
│     ─────────────────                                                       │
│     • Right-sizing resources                                               │
│     • Reserved instances for baseline                                      │
│     • Spot instances for batch workloads                                   │
│     • Intelligent tiering for storage                                      │
│                                                                             │
│  5. OPERATIONAL EXCELLENCE                                                 │
│     ───────────────────────                                                 │
│     • Infrastructure as Code                                               │
│     • Automated deployments                                                │
│     • Comprehensive monitoring                                             │
│     • Self-healing systems                                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4.3 High-Level Architecture

### 4.3.1 Overall System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    AI VISIBILITY PLATFORM - AWS ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                     │
│                                         ┌─────────────────┐                                         │
│                                         │   USERS/APPS    │                                         │
│                                         │   (Web/Mobile)  │                                         │
│                                         └────────┬────────┘                                         │
│                                                  │                                                  │
│                                         ┌────────▼────────┐                                         │
│                                         │   Route 53      │                                         │
│                                         │   (DNS + Health)│                                         │
│                                         └────────┬────────┘                                         │
│                                                  │                                                  │
│                                         ┌────────▼────────┐                                         │
│                                         │   CloudFront    │                                         │
│                                         │   (CDN + WAF)   │                                         │
│                                         └────────┬────────┘                                         │
│                                                  │                                                  │
│                              ┌───────────────────┼───────────────────┐                              │
│                              │                   │                   │                              │
│                     ┌────────▼────────┐ ┌────────▼────────┐ ┌────────▼────────┐                     │
│                     │   S3 (Static)   │ │   ALB (API)     │ │  ALB (WebSocket)│                     │
│                     │   Assets/SPA    │ │                 │ │                 │                     │
│                     └─────────────────┘ └────────┬────────┘ └────────┬────────┘                     │
│                                                  │                   │                              │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                        VPC (10.0.0.0/16)                                      │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                              PUBLIC SUBNETS (10.0.0.0/20)                               │  │  │
│  │  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                         │  │  │
│  │  │  │   NAT Gateway   │  │   NAT Gateway   │  │   NAT Gateway   │                         │  │  │
│  │  │  │   (AZ-a)        │  │   (AZ-b)        │  │   (AZ-c)        │                         │  │  │
│  │  │  └─────────────────┘  └─────────────────┘  └─────────────────┘                         │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                                               │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                             PRIVATE SUBNETS (10.0.16.0/20)                              │  │  │
│  │  │                                                                                         │  │  │
│  │  │  ┌───────────────────────────────────────────────────────────────────────────────────┐  │  │  │
│  │  │  │                              EKS CLUSTER                                          │  │  │  │
│  │  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │  │  │  │
│  │  │  │  │ API Service │ │  Workers    │ │ Monitoring  │ │   ML        │ │  WebSocket  │  │  │  │  │
│  │  │  │  │ (10 pods)   │ │ (20 pods)   │ │ (5 pods)    │ │ (5 pods)    │ │ (6 pods)    │  │  │  │  │
│  │  │  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘  │  │  │  │
│  │  │  │                                                                                   │  │  │  │
│  │  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                  │  │  │  │
│  │  │  │  │ Scheduler   │ │  Crawler    │ │ Analytics   │ │ Notification│                  │  │  │  │
│  │  │  │  │ (3 pods)    │ │ (10 pods)   │ │ (5 pods)    │ │ (3 pods)    │                  │  │  │  │
│  │  │  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘                  │  │  │  │
│  │  │  └───────────────────────────────────────────────────────────────────────────────────┘  │  │  │
│  │  │                                                                                         │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                                               │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                            DATABASE SUBNETS (10.0.32.0/20)                              │  │  │
│  │  │                                                                                         │  │  │
│  │  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │  │  │
│  │  │  │   RDS Aurora    │  │   TimescaleDB   │  │  ElastiCache    │  │  OpenSearch     │    │  │  │
│  │  │  │   (PostgreSQL)  │  │   (Time-series) │  │  (Redis)        │  │  (Elasticsearch)│    │  │  │
│  │  │  │   Multi-AZ      │  │   Multi-AZ      │  │  Cluster Mode   │  │  3-node cluster │    │  │  │
│  │  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘    │  │  │
│  │  │                                                                                         │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                                               │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                      SUPPORTING SERVICES                                      │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │  │
│  │  │    S3       │ │    SQS      │ │    SNS      │ │  Secrets    │ │    KMS      │             │  │
│  │  │  (Storage)  │ │  (Queues)   │ │  (Pub/Sub)  │ │  Manager    │ │  (Keys)     │             │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘             │  │
│  │                                                                                               │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │  │
│  │  │ CloudWatch  │ │   X-Ray     │ │  EventBridge│ │   Lambda    │ │   Step      │             │  │
│  │  │ (Monitoring)│ │  (Tracing)  │ │  (Events)   │ │ (Serverless)│ │  Functions  │             │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘             │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4.4 Network Architecture

### 4.4.1 VPC Design

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              VPC DESIGN                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  VPC CIDR: 10.0.0.0/16 (65,536 IPs)                                        │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  AVAILABILITY ZONE A (us-east-1a)                                   │   │
│  │  ────────────────────────────────                                    │   │
│  │                                                                       │   │
│  │  Public Subnet:    10.0.0.0/22    (1,024 IPs)                       │   │
│  │  Private Subnet:   10.0.16.0/20   (4,096 IPs)                       │   │
│  │  Database Subnet:  10.0.32.0/22   (1,024 IPs)                       │   │
│  │  Reserved Subnet:  10.0.48.0/22   (1,024 IPs)                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  AVAILABILITY ZONE B (us-east-1b)                                   │   │
│  │  ────────────────────────────────                                    │   │
│  │                                                                       │   │
│  │  Public Subnet:    10.0.4.0/22    (1,024 IPs)                       │   │
│  │  Private Subnet:   10.0.64.0/20   (4,096 IPs)                       │   │
│  │  Database Subnet:  10.0.36.0/22   (1,024 IPs)                       │   │
│  │  Reserved Subnet:  10.0.52.0/22   (1,024 IPs)                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  AVAILABILITY ZONE C (us-east-1c)                                   │   │
│  │  ────────────────────────────────                                    │   │
│  │                                                                       │   │
│  │  Public Subnet:    10.0.8.0/22    (1,024 IPs)                       │   │
│  │  Private Subnet:   10.0.80.0/20   (4,096 IPs)                       │   │
│  │  Database Subnet:  10.0.40.0/22   (1,024 IPs)                       │   │
│  │  Reserved Subnet:  10.0.56.0/22   (1,024 IPs)                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.4.2 Security Groups

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SECURITY GROUPS                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SG-ALB-PUBLIC                                                             │
│  ──────────────                                                             │
│  Inbound:  443 (HTTPS) from 0.0.0.0/0                                      │
│            80 (HTTP) from 0.0.0.0/0 → Redirect to HTTPS                    │
│  Outbound: All to SG-EKS-NODES                                             │
│                                                                             │
│  SG-EKS-NODES                                                              │
│  ────────────                                                               │
│  Inbound:  All from SG-ALB-PUBLIC                                          │
│            All from SG-EKS-NODES (inter-pod)                               │
│            443 from SG-EKS-CONTROL                                         │
│  Outbound: 443 to 0.0.0.0/0 (AWS APIs)                                     │
│            5432 to SG-DATABASE                                             │
│            6379 to SG-REDIS                                                │
│            9200 to SG-OPENSEARCH                                           │
│                                                                             │
│  SG-DATABASE                                                               │
│  ───────────                                                                │
│  Inbound:  5432 from SG-EKS-NODES                                          │
│            5432 from SG-BASTION                                            │
│  Outbound: None                                                            │
│                                                                             │
│  SG-REDIS                                                                  │
│  ────────                                                                   │
│  Inbound:  6379 from SG-EKS-NODES                                          │
│  Outbound: None                                                            │
│                                                                             │
│  SG-OPENSEARCH                                                             │
│  ─────────────                                                              │
│  Inbound:  9200 from SG-EKS-NODES                                          │
│            9200 from SG-BASTION                                            │
│  Outbound: None                                                            │
│                                                                             │
│  SG-BASTION                                                                │
│  ──────────                                                                 │
│  Inbound:  22 from Corporate VPN CIDR                                      │
│  Outbound: 22 to VPC CIDR                                                  │
│            5432 to SG-DATABASE                                             │
│            9200 to SG-OPENSEARCH                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.4.3 Network ACLs

| NACL | Subnet Type | Inbound Rules | Outbound Rules |
|------|-------------|---------------|----------------|
| NACL-Public | Public | 443, 80 from anywhere | All traffic |
| NACL-Private | Private | All from VPC | All to VPC, 443 to anywhere |
| NACL-Database | Database | 5432, 6379, 9200 from Private | Ephemeral to Private |

---

## 4.5 Compute Architecture

### 4.5.1 EKS Cluster Configuration

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          EKS CLUSTER DESIGN                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CLUSTER CONFIGURATION                                                      │
│  ─────────────────────                                                      │
│                                                                             │
│  Name: ai-visibility-prod                                                  │
│  Kubernetes Version: 1.29                                                  │
│  Region: us-east-1                                                         │
│  Availability Zones: 3 (us-east-1a, 1b, 1c)                               │
│                                                                             │
│  CONTROL PLANE                                                             │
│  ─────────────                                                              │
│  • Managed by AWS EKS                                                      │
│  • Multi-AZ deployment                                                     │
│  • Private endpoint access                                                 │
│  • Audit logging enabled                                                   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  NODE GROUPS                                                         │   │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │  api-nodes                                                       │ │   │
│  │  │  ────────────                                                    │ │   │
│  │  │  Instance Type: c6i.xlarge (4 vCPU, 8 GB)                       │ │   │
│  │  │  Min: 3 | Desired: 6 | Max: 20                                  │ │   │
│  │  │  Labels: workload=api                                           │ │   │
│  │  │  Taints: None                                                   │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │  worker-nodes                                                    │ │   │
│  │  │  ─────────────                                                   │ │   │
│  │  │  Instance Type: c6i.2xlarge (8 vCPU, 16 GB)                     │ │   │
│  │  │  Min: 5 | Desired: 10 | Max: 50                                 │ │   │
│  │  │  Labels: workload=worker                                        │ │   │
│  │  │  Taints: None                                                   │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │  ml-nodes                                                        │ │   │
│  │  │  ─────────                                                       │ │   │
│  │  │  Instance Type: g4dn.xlarge (4 vCPU, 16 GB, T4 GPU)            │ │   │
│  │  │  Min: 2 | Desired: 5 | Max: 20                                  │ │   │
│  │  │  Labels: workload=ml, nvidia.com/gpu=present                    │ │   │
│  │  │  Taints: nvidia.com/gpu=present:NoSchedule                      │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │  crawler-nodes (Spot)                                            │ │   │
│  │  │  ────────────────────                                            │ │   │
│  │  │  Instance Types: c6i.large, c6a.large, c5.large (mixed)         │ │   │
│  │  │  Min: 0 | Desired: 10 | Max: 100                                │ │   │
│  │  │  Labels: workload=crawler, lifecycle=spot                       │ │   │
│  │  │  Taints: lifecycle=spot:PreferNoSchedule                        │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.5.2 Kubernetes Resources

```yaml
# API Service Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-service
  namespace: ai-visibility
spec:
  replicas: 6
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 2
      maxUnavailable: 1
  selector:
    matchLabels:
      app: api-service
  template:
    metadata:
      labels:
        app: api-service
    spec:
      nodeSelector:
        workload: api
      containers:
      - name: api
        image: ${ECR_REPO}/api-service:${VERSION}
        ports:
        - containerPort: 3000
        resources:
          requests:
            cpu: "500m"
            memory: "1Gi"
          limits:
            cpu: "2000m"
            memory: "4Gi"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        env:
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: host
        - name: REDIS_URL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: redis-url
```

### 4.5.3 Auto Scaling Configuration

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       AUTO SCALING POLICIES                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  HORIZONTAL POD AUTOSCALER (HPA)                                           │
│  ───────────────────────────────                                           │
│                                                                             │
│  API Service:                                                              │
│  • Min Replicas: 3                                                         │
│  • Max Replicas: 50                                                        │
│  • Scale Up: CPU > 70% or Memory > 80%                                    │
│  • Scale Down: CPU < 30% and Memory < 40%                                 │
│  • Stabilization: 5 min scale up, 10 min scale down                       │
│                                                                             │
│  Worker Service:                                                           │
│  • Min Replicas: 5                                                         │
│  • Max Replicas: 100                                                       │
│  • Scale Up: Queue depth > 1000 or CPU > 70%                              │
│  • Scale Down: Queue depth < 100 and CPU < 30%                            │
│  • Custom Metric: SQS ApproximateNumberOfMessages                         │
│                                                                             │
│  CLUSTER AUTOSCALER                                                        │
│  ─────────────────                                                          │
│                                                                             │
│  • Scan Interval: 10 seconds                                               │
│  • Scale Down Delay: 10 minutes                                            │
│  • Scale Down Utilization Threshold: 50%                                   │
│  • Node Groups: api-nodes, worker-nodes, ml-nodes, crawler-nodes          │
│                                                                             │
│  KARPENTER (Alternative for Spot Nodes)                                    │
│  ──────────────────────────────────────                                    │
│                                                                             │
│  Provisioner:                                                              │
│  • Instance Types: c6i.*, c6a.*, c5.* (large, xlarge)                     │
│  • Capacity Types: spot (preferred), on-demand (fallback)                 │
│  • Availability Zones: All 3                                               │
│  • TTL Seconds Until Expired: 2592000 (30 days)                           │
│  • TTL Seconds After Empty: 30                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4.6 Data Architecture

### 4.6.1 Database Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATABASE ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  AMAZON RDS AURORA (PostgreSQL 15)                                  │   │
│  │  ─────────────────────────────────                                   │   │
│  │                                                                       │   │
│  │  Purpose: Primary transactional database                             │   │
│  │                                                                       │   │
│  │  Cluster: ai-visibility-aurora-cluster                               │   │
│  │  Instance Class: db.r6g.2xlarge                                      │   │
│  │  Storage: Aurora I/O Optimized                                       │   │
│  │  Encryption: KMS managed key                                         │   │
│  │                                                                       │   │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐            │   │
│  │  │    Writer     │  │   Reader 1    │  │   Reader 2    │            │   │
│  │  │   (AZ-a)      │◀─▶│   (AZ-b)      │◀─▶│   (AZ-c)      │            │   │
│  │  │   Primary     │  │   Auto-scale  │  │   Auto-scale  │            │   │
│  │  └───────────────┘  └───────────────┘  └───────────────┘            │   │
│  │                                                                       │   │
│  │  Features:                                                            │   │
│  │  • Global Database (DR region)                                       │   │
│  │  • Backtrack: 72 hours                                               │   │
│  │  • Point-in-time recovery: 35 days                                   │   │
│  │  • Performance Insights enabled                                      │   │
│  │  • Auto-scaling readers: 1-5 instances                               │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  TIMESCALEDB ON EC2 (Self-managed)                                  │   │
│  │  ─────────────────────────────────                                   │   │
│  │                                                                       │   │
│  │  Purpose: Time-series data for monitoring metrics                    │   │
│  │                                                                       │   │
│  │  Instance Type: r6g.4xlarge                                          │   │
│  │  Storage: 10TB gp3 (16,000 IOPS, 1,000 MB/s)                        │   │
│  │  Replication: Streaming replication to standby                       │   │
│  │                                                                       │   │
│  │  ┌───────────────┐  ┌───────────────┐                                │   │
│  │  │   Primary     │──▶│   Standby     │                                │   │
│  │  │   (AZ-a)      │  │   (AZ-b)      │                                │   │
│  │  └───────────────┘  └───────────────┘                                │   │
│  │                                                                       │   │
│  │  Hypertables:                                                         │   │
│  │  • monitoring_events (chunk_time_interval: 1 day)                   │   │
│  │  • visibility_scores (chunk_time_interval: 1 hour)                  │   │
│  │  • ai_responses (chunk_time_interval: 1 day)                        │   │
│  │                                                                       │   │
│  │  Retention Policies:                                                  │   │
│  │  • Raw data: 90 days                                                 │   │
│  │  • Aggregated (hourly): 2 years                                     │   │
│  │  • Aggregated (daily): 5 years                                      │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  AMAZON OPENSEARCH SERVICE                                          │   │
│  │  ─────────────────────────────                                       │   │
│  │                                                                       │   │
│  │  Purpose: Full-text search, log analytics                            │   │
│  │                                                                       │   │
│  │  Domain: ai-visibility-search                                        │   │
│  │  Version: OpenSearch 2.11                                            │   │
│  │  Instance Type: r6g.2xlarge.search                                   │   │
│  │                                                                       │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐                                 │   │
│  │  │ Master  │ │ Master  │ │ Master  │  (Dedicated master nodes)       │   │
│  │  │ (AZ-a)  │ │ (AZ-b)  │ │ (AZ-c)  │                                 │   │
│  │  └─────────┘ └─────────┘ └─────────┘                                 │   │
│  │                                                                       │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐                                 │   │
│  │  │  Data   │ │  Data   │ │  Data   │  (Data nodes, 3TB each)        │   │
│  │  │ (AZ-a)  │ │ (AZ-b)  │ │ (AZ-c)  │                                 │   │
│  │  └─────────┘ └─────────┘ └─────────┘                                 │   │
│  │                                                                       │   │
│  │  Indices:                                                             │   │
│  │  • citations-* (daily rotation)                                      │   │
│  │  • content-* (weekly rotation)                                       │   │
│  │  • logs-* (daily rotation, ILM to warm/cold)                        │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  AMAZON ELASTICACHE FOR REDIS                                       │   │
│  │  ────────────────────────────────                                    │   │
│  │                                                                       │   │
│  │  Purpose: Caching, session storage, rate limiting, queues           │   │
│  │                                                                       │   │
│  │  Cluster Mode: Enabled                                               │   │
│  │  Node Type: r6g.large                                                │   │
│  │  Shards: 3                                                           │   │
│  │  Replicas per Shard: 2                                               │   │
│  │                                                                       │   │
│  │  ┌─ Shard 1 ──────────────────────────────────────────┐             │   │
│  │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐            │             │   │
│  │  │  │ Primary │──│ Replica │──│ Replica │            │             │   │
│  │  │  │ (AZ-a)  │  │ (AZ-b)  │  │ (AZ-c)  │            │             │   │
│  │  │  └─────────┘  └─────────┘  └─────────┘            │             │   │
│  │  └────────────────────────────────────────────────────┘             │   │
│  │                                                                       │   │
│  │  (Repeat for Shard 2, Shard 3)                                       │   │
│  │                                                                       │   │
│  │  Usage:                                                               │   │
│  │  • Session cache (TTL: 1 hour)                                       │   │
│  │  • API response cache (TTL: 5 minutes)                               │   │
│  │  • Rate limiting counters (TTL: 1 minute)                           │   │
│  │  • Job queues (BullMQ)                                               │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.6.2 Storage Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           S3 STORAGE DESIGN                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  BUCKET STRUCTURE                                                           │
│  ────────────────                                                           │
│                                                                             │
│  ai-visibility-{env}-assets                                                │
│  └── static/                  # Static web assets                          │
│  └── uploads/                 # User uploads                               │
│  └── exports/                 # Generated reports                          │
│                                                                             │
│  ai-visibility-{env}-data                                                  │
│  └── raw/                     # Raw crawled data                           │
│      └── {date}/                                                           │
│          └── {source}/                                                     │
│  └── processed/               # Processed data                             │
│      └── {date}/                                                           │
│  └── ml/                      # ML artifacts                               │
│      └── models/                                                           │
│      └── training-data/                                                    │
│      └── predictions/                                                      │
│                                                                             │
│  ai-visibility-{env}-logs                                                  │
│  └── access-logs/                                                          │
│  └── flow-logs/                                                            │
│  └── audit-logs/                                                           │
│                                                                             │
│  ai-visibility-{env}-backups                                               │
│  └── database/                                                             │
│  └── config/                                                               │
│                                                                             │
│  LIFECYCLE POLICIES                                                         │
│  ──────────────────                                                         │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Raw Data Lifecycle                                                  │   │
│  │                                                                       │   │
│  │  Day 0-30:  S3 Standard                                              │   │
│  │  Day 31-90: S3 Intelligent-Tiering                                   │   │
│  │  Day 91-365: S3 Glacier Instant Retrieval                           │   │
│  │  Day 366+:  S3 Glacier Deep Archive                                  │   │
│  │  7 Years:   Delete (for non-compliance data)                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Export/Report Lifecycle                                             │   │
│  │                                                                       │   │
│  │  Day 0-7:   S3 Standard                                              │   │
│  │  Day 8-30:  S3 Standard-IA                                           │   │
│  │  Day 31+:   Delete                                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  VERSIONING & REPLICATION                                                  │
│  ────────────────────────                                                   │
│                                                                             │
│  • Versioning: Enabled on all buckets                                      │
│  • MFA Delete: Enabled on production buckets                               │
│  • Cross-Region Replication: Enabled to DR region                         │
│  • Same-Region Replication: To compliance bucket                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4.7 Messaging & Event Architecture

### 4.7.1 SQS Queues

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SQS QUEUE DESIGN                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  QUEUE CONFIGURATION                                                        │
│  ───────────────────                                                        │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ai-monitoring-queue                                                 │   │
│  │  ──────────────────────                                              │   │
│  │  Type: Standard                                                      │   │
│  │  Visibility Timeout: 300 seconds                                     │   │
│  │  Message Retention: 14 days                                          │   │
│  │  Max Message Size: 256 KB                                            │   │
│  │  Receive Wait Time: 20 seconds (long polling)                       │   │
│  │  Dead Letter Queue: ai-monitoring-dlq (max receives: 3)             │   │
│  │  Encryption: KMS (CMK)                                               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  content-processing-queue                                            │   │
│  │  ─────────────────────────                                           │   │
│  │  Type: FIFO                                                          │   │
│  │  Visibility Timeout: 600 seconds                                     │   │
│  │  Content Deduplication: Enabled                                      │   │
│  │  Throughput: High throughput mode                                    │   │
│  │  Dead Letter Queue: content-processing-dlq.fifo                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  notification-queue                                                  │   │
│  │  ───────────────────                                                 │   │
│  │  Type: Standard                                                      │   │
│  │  Visibility Timeout: 30 seconds                                      │   │
│  │  Message Retention: 4 days                                           │   │
│  │  Dead Letter Queue: notification-dlq                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  report-generation-queue                                             │   │
│  │  ────────────────────────                                            │   │
│  │  Type: Standard                                                      │   │
│  │  Visibility Timeout: 900 seconds                                     │   │
│  │  Priority Queues: high, normal, low                                  │   │
│  │  Dead Letter Queue: report-generation-dlq                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.7.2 SNS Topics

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SNS TOPIC DESIGN                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ai-visibility-events                                                      │
│  ─────────────────────                                                      │
│  Purpose: Fan-out for real-time events                                     │
│  Subscribers:                                                              │
│    • notification-queue (SQS)                                              │
│    • analytics-queue (SQS)                                                 │
│    • websocket-broadcast (Lambda)                                          │
│                                                                             │
│  ai-visibility-alerts                                                      │
│  ─────────────────────                                                      │
│  Purpose: Critical alerts and notifications                                │
│  Subscribers:                                                              │
│    • PagerDuty (HTTPS endpoint)                                            │
│    • Slack (Lambda → Slack API)                                            │
│    • Email (SES)                                                           │
│                                                                             │
│  ai-visibility-webhooks                                                    │
│  ─────────────────────                                                      │
│  Purpose: Customer webhook delivery                                        │
│  Subscribers:                                                              │
│    • webhook-processor (Lambda)                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.7.3 EventBridge

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       EVENTBRIDGE ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  EVENT BUS: ai-visibility-bus                                              │
│  ───────────────────────────                                                │
│                                                                             │
│  EVENT PATTERNS                                                             │
│  ───────────────                                                            │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Monitoring Events                                                   │   │
│  │                                                                       │   │
│  │  Pattern:                                                            │   │
│  │  {                                                                   │   │
│  │    "source": ["ai-visibility.monitoring"],                          │   │
│  │    "detail-type": ["CitationDetected", "MentionFound",              │   │
│  │                    "VisibilityChanged", "SentimentAlert"]           │   │
│  │  }                                                                   │   │
│  │                                                                       │   │
│  │  Targets:                                                            │   │
│  │  • Lambda: process-monitoring-event                                  │   │
│  │  • SQS: analytics-queue                                              │   │
│  │  • CloudWatch Logs: monitoring-events                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Scheduled Events                                                    │   │
│  │                                                                       │   │
│  │  Rules:                                                              │   │
│  │  • daily-report-generation (cron: 0 6 * * ? *)                      │   │
│  │  • hourly-visibility-update (cron: 0 * * * ? *)                     │   │
│  │  • weekly-cleanup (cron: 0 0 ? * SUN *)                             │   │
│  │                                                                       │   │
│  │  Targets: Lambda functions for each scheduled task                   │   │
│  └──────────────────────────────��──────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4.8 Security Architecture

### 4.8.1 IAM Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           IAM ARCHITECTURE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ROLE HIERARCHY                                                            │
│  ──────────────                                                             │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Service Roles                                                       │   │
│  │                                                                       │   │
│  │  EKS-Node-Role                                                       │   │
│  │  ├── AmazonEKSWorkerNodePolicy                                       │   │
│  │  ├── AmazonEKS_CNI_Policy                                            │   │
│  │  ├── AmazonEC2ContainerRegistryReadOnly                              │   │
│  │  └── Custom: ai-visibility-node-policy                               │   │
│  │      • S3: GetObject, PutObject (specific buckets)                   │   │
│  │      • SQS: SendMessage, ReceiveMessage (specific queues)           │   │
│  │      • SecretsManager: GetSecretValue (specific secrets)            │   │
│  │      • KMS: Decrypt (specific keys)                                  │   │
│  │                                                                       │   │
│  │  EKS-Pod-Role (IRSA - per service)                                   │   │
│  │  ├── api-service-role                                                │   │
│  │  │   └── RDS, ElastiCache, S3 (read), SecretsManager                │   │
│  │  ├── worker-service-role                                             │   │
│  │  │   └── SQS, S3, OpenSearch, SecretsManager                        │   │
│  │  ├── monitoring-service-role                                         │   │
│  │  │   └── External AI APIs (via secrets), S3, SQS                    │   │
│  │  └── ml-service-role                                                 │   │
│  │      └── S3, SageMaker, ECR                                         │   │
│  │                                                                       │   │
│  │  Lambda-Execution-Role                                               │   │
│  │  ├── AWSLambdaBasicExecutionRole                                     │   │
│  │  └── Custom: Per-function minimal permissions                        │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Human Roles (via AWS SSO)                                          │   │
│  │                                                                       │   │
│  │  AdminAccess (Break-glass only)                                      │   │
│  │  └── Full admin, MFA required, IP restricted                        │   │
│  │                                                                       │   │
│  │  DevOpsEngineer                                                      │   │
│  │  └── Deploy, EKS admin, read-only DB, full CloudWatch               │   │
│  │                                                                       │   │
│  │  Developer                                                           │   │
│  │  └── EKS dev namespace, CloudWatch logs, read-only infrastructure   │   │
│  │                                                                       │   │
│  │  SecurityAuditor                                                     │   │
│  │  └── Read-only all, CloudTrail, GuardDuty, SecurityHub              │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.8.2 Encryption & Key Management

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           KMS KEY HIERARCHY                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  KEY STRUCTURE                                                             │
│  ─────────────                                                              │
│                                                                             │
│  ai-visibility-master-key (CMK)                                            │
│  ├── Alias: alias/ai-visibility/master                                    │
│  ├── Key Rotation: Automatic (yearly)                                      │
│  └── Key Policy: Restrict to specific IAM principals                      │
│                                                                             │
│  ai-visibility-database-key (CMK)                                          │
│  ├── Alias: alias/ai-visibility/database                                   │
│  ├── Purpose: RDS, TimescaleDB encryption                                  │
│  └── Key Rotation: Automatic                                               │
│                                                                             │
│  ai-visibility-storage-key (CMK)                                           │
│  ├── Alias: alias/ai-visibility/storage                                    │
│  ├── Purpose: S3 bucket encryption                                         │
│  └── Key Rotation: Automatic                                               │
│                                                                             │
│  ai-visibility-secrets-key (CMK)                                           │
│  ├── Alias: alias/ai-visibility/secrets                                    │
│  ├── Purpose: Secrets Manager encryption                                   │
│  └── Key Rotation: Automatic                                               │
│                                                                             │
│  ai-visibility-application-key (CMK)                                       │
│  ├── Alias: alias/ai-visibility/application                                │
│  ├── Purpose: Application-level field encryption                           │
│  └── Key Rotation: Manual (with envelope encryption)                       │
│                                                                             │
│  ENVELOPE ENCRYPTION                                                        │
│  ───────────────────                                                        │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                       │   │
│  │   Master Key (KMS)                                                   │   │
│  │        │                                                              │   │
│  │        ▼                                                              │   │
│  │   Data Encryption Key (DEK) ───encrypted───▶ Stored with data       │   │
│  │        │                                                              │   │
│  │        ▼                                                              │   │
│  │   Encrypted Data                                                     │   │
│  │                                                                       │   │
│  │   Benefits:                                                           │   │
│  │   • Fast encryption (local DEK)                                      │   │
│  │   • Key rotation without re-encryption                               │   │
│  │   • Audit trail via CloudTrail                                       │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.8.3 WAF & Shield Configuration

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        WAF CONFIGURATION                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  WEB ACL: ai-visibility-waf                                                │
│  ───────────────────────────                                                │
│                                                                             │
│  Rule Groups (in order of evaluation):                                     │
│                                                                             │
│  1. IP Reputation (AWS Managed)                                            │
│     • AWSManagedRulesAmazonIpReputationList                                │
│     • Action: Block                                                        │
│                                                                             │
│  2. Known Bad Inputs (AWS Managed)                                         │
│     • AWSManagedRulesKnownBadInputsRuleSet                                 │
│     • Action: Block                                                        │
│                                                                             │
│  3. SQL Injection (AWS Managed)                                            │
│     • AWSManagedRulesSQLiRuleSet                                           │
│     • Action: Block                                                        │
│                                                                             │
│  4. XSS Protection (AWS Managed)                                           │
│     • AWSManagedRulesCommonRuleSet                                         │
│     • Action: Block                                                        │
│                                                                             │
│  5. Rate Limiting (Custom)                                                 │
│     • Rate: 2000 requests per 5 minutes per IP                            │
│     • Action: Block                                                        │
│                                                                             │
│  6. Geo Blocking (Custom) - Optional                                       │
│     • Allow: Configured countries only                                     │
│     • Enterprise feature                                                   │
│                                                                             │
│  7. Bot Control (AWS Managed)                                              │
│     • AWSManagedRulesBotControlRuleSet                                     │
│     • Action: Count (monitor), then Block                                  │
│                                                                             │
│  AWS SHIELD ADVANCED                                                       │
│  ────────────────────                                                       │
│                                                                             │
│  Protected Resources:                                                       │
│  • CloudFront distribution                                                 │
│  • Application Load Balancers                                              │
│  • Route 53 hosted zones                                                   │
│  • Elastic IPs                                                             │
│                                                                             │
│  Features:                                                                  │
│  • DDoS cost protection                                                    │
│  • 24/7 DDoS response team                                                 │
│  • Real-time visibility                                                    │
│  • Automatic application layer mitigation                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4.9 Observability Architecture

### 4.9.1 CloudWatch Configuration

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CLOUDWATCH ARCHITECTURE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  LOG GROUPS                                                                │
│  ──────────                                                                 │
│                                                                             │
│  /aws/eks/ai-visibility/containers                                         │
│  ├── Retention: 90 days                                                    │
│  ├── Encryption: KMS                                                       │
│  └── Subscription: OpenSearch for analysis                                │
│                                                                             │
│  /aws/lambda/ai-visibility                                                 │
│  ├── Retention: 30 days                                                    │
│  └── Encryption: KMS                                                       │
│                                                                             │
│  /aws/rds/cluster/ai-visibility-aurora/audit                               │
│  ├── Retention: 1 year                                                     │
│  └── Encryption: KMS                                                       │
│                                                                             │
│  METRIC NAMESPACES                                                         │
│  ─────────────────                                                          │
│                                                                             │
│  AIVisibility/API                                                          │
│  ├── RequestCount                                                          │
│  ├── RequestLatency (P50, P90, P99)                                       │
│  ├── ErrorRate                                                             │
│  └── ActiveConnections                                                     │
│                                                                             │
│  AIVisibility/Processing                                                   │
│  ├── JobsProcessed                                                         │
│  ├── QueueDepth                                                            │
│  ├── ProcessingLatency                                                     │
│  └── FailureRate                                                           │
│                                                                             │
│  AIVisibility/Business                                                     │
│  ├── MonitoringQueriesPerHour                                              │
│  ├── CitationsDetected                                                     │
│  ├── ActiveWorkspaces                                                      │
│  └── ReportGenerated                                                       │
│                                                                             │
│  DASHBOARDS                                                                │
│  ──────────                                                                 │
│                                                                             │
│  1. Operations Dashboard                                                   │
│     • Service health, error rates, latencies                              │
│     • Infrastructure metrics                                               │
│     • Active alerts                                                        │
│                                                                             │
│  2. Business Dashboard                                                     │
│     • Usage metrics, customer activity                                     │
│     • Revenue indicators                                                   │
│     • Growth metrics                                                       │
│                                                                             │
│  3. Security Dashboard                                                     │
│     • WAF metrics, blocked requests                                        │
│     • Authentication events                                                │
│     • Suspicious activity                                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.9.2 Alerting Configuration

| Alert | Metric | Threshold | Severity | Action |
|-------|--------|-----------|----------|--------|
| API High Error Rate | ErrorRate | > 1% for 5 min | Critical | PagerDuty |
| API High Latency | P99 Latency | > 2s for 5 min | Warning | Slack |
| Queue Backlog | QueueDepth | > 10000 for 15 min | Warning | Slack |
| Database CPU | CPUUtilization | > 80% for 10 min | Warning | Slack |
| Database Connections | DatabaseConnections | > 80% max | Critical | PagerDuty |
| Disk Space | FreeStorageSpace | < 20% | Warning | Slack |
| Pod Restarts | RestartCount | > 5 in 1 hour | Warning | Slack |
| Node Not Ready | NodeCondition | Not Ready > 5 min | Critical | PagerDuty |

---

## 4.10 Disaster Recovery

### 4.10.1 DR Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     DISASTER RECOVERY ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PRIMARY REGION: us-east-1          DR REGION: us-west-2                   │
│  ────────────────────────          ─────────────────────                    │
│                                                                             │
│  ┌─────────────────────────┐       ┌─────────────────────────┐             │
│  │  Route 53 (Active)      │◀─────▶│  Route 53 (Standby)     │             │
│  │  Health Checks          │       │  Health Checks          │             │
│  └────────────┬────────────┘       └────────────┬────────────┘             │
│               │                                  │                          │
│  ┌────────────▼────────────┐       ┌────────────▼────────────┐             │
│  │  CloudFront             │       │  CloudFront             │             │
│  │  (Primary Origin)       │       │  (Failover Origin)      │             │
│  └────────────┬────────────┘       └────────────┬────────────┘             │
│               │                                  │                          │
│  ┌────────────▼────────────┐       ┌────────────▼────────────┐             │
│  │  EKS Cluster            │       │  EKS Cluster            │             │
│  │  (Active)               │       │  (Warm Standby)         │             │
│  │  • Full capacity        │       │  • 20% capacity         │             │
│  │  • All services         │       │  • Core services only   │             │
│  └────────────┬────────────┘       └────────────┬────────────┘             │
│               │                                  │                          │
│  ┌────────────▼────────────┐       ┌────────────▼────────────┐             │
│  │  Aurora Global DB       │──────▶│  Aurora Global DB       │             │
│  │  (Writer)               │ Async │  (Reader)               │             │
│  │                         │ Repl  │  • Promote on failover  │             │
│  └─────────────────────────┘       └─────────────────────────┘             │
│                                                                             │
│  ┌─────────────────────────┐       ┌─────────────────────────┐             │
│  │  S3 Buckets             │──────▶│  S3 Buckets             │             │
│  │  (Source)               │ CRR   │  (Replica)              │             │
│  └─────────────────────────┘       └─────────────────────────┘             │
│                                                                             │
│  FAILOVER PROCEDURE                                                        │
│  ──────────────────                                                         │
│                                                                             │
│  1. Detection (Automatic via Route 53 health checks)                       │
│  2. DNS Failover (< 60 seconds)                                            │
│  3. Aurora Global Database failover (< 60 seconds)                         │
│  4. Scale up DR EKS cluster (< 5 minutes)                                  │
│  5. Validate services (< 5 minutes)                                        │
│                                                                             │
│  Total RTO: < 15 minutes                                                   │
│  RPO: < 1 minute (Aurora replication lag)                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.10.2 Backup Strategy

| Component | Backup Method | Frequency | Retention | Recovery Test |
|-----------|--------------|-----------|-----------|---------------|
| Aurora | Automated snapshots | Continuous | 35 days | Monthly |
| Aurora | Manual snapshots | Daily | 90 days | Quarterly |
| TimescaleDB | pg_dump + S3 | Every 6 hours | 30 days | Monthly |
| OpenSearch | Snapshots to S3 | Daily | 30 days | Monthly |
| Redis | RDB snapshots | Every 6 hours | 7 days | Monthly |
| S3 | Cross-region replication | Real-time | Forever | Quarterly |
| EKS Config | GitOps (ArgoCD) | On change | Git history | Weekly |
| Secrets | Secrets Manager | Versioned | 30 versions | Monthly |

---

## 4.11 Cost Optimization

### 4.11.1 Cost Breakdown (Monthly Estimate - Year 1)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       MONTHLY COST ESTIMATE (YEAR 1)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  COMPUTE                                                    $18,500         │
│  ─────────                                                                  │
│  EKS Control Plane              $73 × 1                      = $73          │
│  API Nodes (c6i.xlarge)         $122 × 6 avg                = $732         │
│  Worker Nodes (c6i.2xlarge)     $244 × 10 avg               = $2,440       │
│  ML Nodes (g4dn.xlarge)         $381 × 5 avg                = $1,905       │
│  Crawler Nodes (Spot c6i.large) $30 × 10 avg                = $300         │
│  Reserved Instance Savings      -30%                         = -$1,635     │
│                                                                             │
│  DATABASE                                                   $15,200         │
│  ─────────                                                                  │
│  Aurora (db.r6g.2xlarge)        $1,752 × 2 (writer+reader)  = $3,504       │
│  Aurora Storage (2TB)           $0.10/GB × 2000             = $200         │
│  Aurora I/O                     ~500M requests              = $500         │
│  TimescaleDB (r6g.4xlarge)      $1,219 × 2 (primary+standby)= $2,438       │
│  TimescaleDB Storage (10TB)     $0.08/GB × 10000            = $800         │
│  OpenSearch (6 nodes)           $1,150 × 6                  = $6,900       │
│  ElastiCache Redis (6 nodes)    $146 × 6                    = $876         │
│                                                                             │
│  STORAGE                                                    $5,500          │
│  ────────                                                                   │
│  S3 Standard (50TB)             $0.023/GB × 50000           = $1,150       │
│  S3 Intelligent Tiering (100TB) $0.0125/GB × 100000         = $1,250       │
│  S3 Glacier (200TB)             $0.004/GB × 200000          = $800         │
│  S3 Requests                    ~100M requests              = $500         │
│  Data Transfer Out (10TB)       $0.09/GB × 10000            = $900         │
│  CloudFront (5TB + 100M req)                                = $900         │
│                                                                             │
│  NETWORKING                                                 $2,300          │
│  ──────────                                                                 │
│  NAT Gateways (3 × 24/7)        $32.40 × 3                  = $97          │
│  NAT Gateway Data (5TB)         $0.045/GB × 5000            = $225         │
│  ALB (2 × 24/7)                 $16.20 × 2                  = $32          │
│  ALB Data Processing            ~1TB                        = $8           │
│  Route 53                       Hosted zones + queries      = $50          │
│  VPC Endpoints                  5 endpoints                 = $180         │
│  AWS PrivateLink                Various services            = $200         │
│                                                                             │
│  SECURITY & COMPLIANCE                                      $3,500          │
│  ─────────────────────                                                      │
│  AWS WAF                        Web ACL + rules             = $200         │
│  AWS Shield Advanced            Subscription                = $3,000       │
│  KMS                            Key usage                   = $100         │
│  Secrets Manager                50 secrets                  = $50          │
│  GuardDuty                      Event analysis              = $150         │
│                                                                             │
│  OBSERVABILITY                                              $2,000          │
│  ─────────────                                                              │
│  CloudWatch Logs (500GB)        $0.50/GB                    = $250         │
│  CloudWatch Metrics             Custom metrics              = $300         │
│  CloudWatch Alarms              100 alarms                  = $10          │
│  X-Ray                          Trace sampling              = $200         │
│  CloudWatch Dashboards          5 dashboards                = $15          │
│                                                                             │
│  OTHER SERVICES                                             $1,500          │
│  ──────────────                                                             │
│  Lambda                         Invocations + duration      = $200         │
│  SQS                            Message processing          = $100         │
│  SNS                            Notifications               = $50          │
│  EventBridge                    Events                      = $50          │
│  ECR                            Image storage               = $100         │
│  CodePipeline/CodeBuild         CI/CD                       = $200         │
│  Misc AWS services                                          = $800         │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│  SUBTOTAL                                                   $48,500         │
│  Reserved Instance Savings (-20% overall)                   -$9,700         │
│  Savings Plans (-10% additional)                            -$3,880         │
│  ─────────────────────────────────────────────────────────────────────────  │
│  TOTAL MONTHLY AWS COST                                     ~$35,000        │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.11.2 Cost Optimization Strategies

| Strategy | Savings | Implementation |
|----------|---------|----------------|
| Reserved Instances | 30-40% | 1-year commitment for baseline |
| Savings Plans | 10-20% | Compute Savings Plan |
| Spot Instances | 60-70% | Crawler and batch workloads |
| Right-sizing | 10-20% | Continuous monitoring |
| S3 Intelligent Tiering | 20-30% | Automatic tier transitions |
| Aurora Serverless v2 | Variable | Dev/staging environments |
| Graviton Instances | 20% | Where supported |

---

## 4.12 Infrastructure as Code

### 4.12.1 Terraform Structure

```
infrastructure/
├── terraform/
│   ├── environments/
│   │   ├── dev/
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── terraform.tfvars
│   │   ├── staging/
│   │   └── prod/
│   ├── modules/
│   │   ├── vpc/
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── outputs.tf
│   │   ├── eks/
│   │   ├── rds/
│   │   ├── elasticache/
│   │   ├── opensearch/
│   │   ├── s3/
│   │   ├── cloudfront/
│   │   ├── waf/
│   │   └── monitoring/
│   └── shared/
│       ├── providers.tf
│       └── backend.tf
├── kubernetes/
│   ├── base/
│   │   ├── namespaces/
│   │   ├── rbac/
│   │   └── network-policies/
│   ├── apps/
│   │   ├── api-service/
│   │   ├── worker-service/
│   │   └── ...
│   └── overlays/
│       ├── dev/
│       ├── staging/
│       └── prod/
└── scripts/
    ├── deploy.sh
    ├── rollback.sh
    └── disaster-recovery.sh
```

### 4.12.2 GitOps with ArgoCD

```yaml
# ArgoCD Application
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: ai-visibility-api
  namespace: argocd
spec:
  project: ai-visibility
  source:
    repoURL: https://github.com/company/ai-visibility-platform
    targetRevision: main
    path: kubernetes/apps/api-service/overlays/prod
  destination:
    server: https://kubernetes.default.svc
    namespace: ai-visibility
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
```

---

*Document Version: 1.0*
*Last Updated: 2026-06-28*
*Next Review: 2026-07-28*
