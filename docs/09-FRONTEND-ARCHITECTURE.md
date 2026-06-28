# 9. Frontend Architecture

## 9.1 Overview

This document details the frontend architecture for the AI Visibility Platform. The frontend is built as a modern, performant single-page application (SPA) with server-side rendering capabilities for optimal user experience and SEO.

---

## 9.2 Technology Stack

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND TECHNOLOGY STACK                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CORE FRAMEWORK                                                            │
│  ──────────────                                                             │
│  • Next.js 14 (App Router)                                                 │
│  • React 18                                                                │
│  • TypeScript 5.x                                                          │
│                                                                             │
│  STATE MANAGEMENT                                                          │
│  ────────────────                                                           │
│  • TanStack Query (React Query) - Server state                             │
│  • Zustand - Client state                                                  │
│  • React Context - Theme/Auth                                              │
│                                                                             │
│  STYLING                                                                   │
│  ───────                                                                    │
│  • Tailwind CSS                                                            │
│  • CSS Modules (for component-specific styles)                             │
│  • Radix UI Primitives                                                     │
│  • shadcn/ui components                                                    │
│                                                                             │
│  DATA VISUALIZATION                                                        │
│  ──────────────────                                                         │
│  • Recharts (primary)                                                      │
│  • D3.js (custom visualizations)                                           │
│  • Visx (advanced charts)                                                  │
│                                                                             │
│  FORMS & VALIDATION                                                        │
│  ──────────────────                                                         │
│  • React Hook Form                                                         │
│  • Zod (schema validation)                                                 │
│                                                                             │
│  TESTING                                                                   │
│  ───────                                                                    │
│  • Vitest (unit/integration)                                               │
│  • Playwright (E2E)                                                        │
│  • Testing Library                                                         │
│  • Storybook (component documentation)                                     │
│                                                                             │
│  BUILD & TOOLING                                                           │
│  ───────────────                                                            │
│  • Turborepo (monorepo)                                                    │
│  • pnpm (package manager)                                                  │
│  • ESLint + Prettier                                                       │
│  • Husky (git hooks)                                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 9.3 Application Architecture

### 9.3.1 Project Structure

```
frontend/
├── apps/
│   ├── web/                          # Main web application
│   │   ├── app/                      # Next.js App Router
│   │   │   ├── (auth)/              # Auth group (login, register)
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── layout.tsx
│   │   │   ├── (dashboard)/         # Dashboard group
│   │   │   │   ├── dashboard/
│   │   │   │   ├── brands/
│   │   │   │   ├── citations/
│   │   │   │   ├── visibility/
│   │   │   │   ├── reports/
│   │   │   │   ├── settings/
│   │   │   │   └── layout.tsx
│   │   │   ├── api/                 # API routes
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/              # App-specific components
│   │   ├── hooks/                   # App-specific hooks
│   │   ├── lib/                     # App utilities
│   │   └── styles/                  # Global styles
│   │
│   └── docs/                        # Documentation site
│
├── packages/
│   ├── ui/                          # Shared UI components
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Button/
│   │   │   │   ├── Card/
│   │   │   │   ├── Modal/
│   │   │   │   ├── Table/
│   │   │   │   ├── Chart/
│   │   │   │   └── index.ts
│   │   │   ├── primitives/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── api-client/                  # API client library
│   │   ├── src/
│   │   │   ├── client.ts
│   │   │   ├── hooks/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── config/                      # Shared configuration
│   │   ├── eslint/
│   │   ├── typescript/
│   │   └── tailwind/
│   │
│   └── utils/                       # Shared utilities
│       ├── src/
│       └── package.json
│
├── turbo.json                       # Turborepo config
├── pnpm-workspace.yaml
└── package.json
```

### 9.3.2 Component Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COMPONENT HIERARCHY                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  LAYER 1: PRIMITIVES                                                       │
│  ────────────────────                                                       │
│  Base components from Radix UI, extended with Tailwind                     │
│                                                                             │
│  Button, Input, Select, Checkbox, Radio, Switch,                           │
│  Dialog, Popover, Tooltip, Menu, Tabs, Accordion                           │
│                                                                             │
│  LAYER 2: UI COMPONENTS                                                    │
│  ──────────────────────                                                     │
│  Composed components with business logic                                   │
│                                                                             │
│  • DataTable (sorting, filtering, pagination)                              │
│  • Chart (line, bar, pie, area)                                           │
│  • DateRangePicker                                                         │
│  • SearchInput                                                             │
│  • Avatar, Badge, Tag                                                      │
│  • Card, Panel, Section                                                    │
│  • Toast, Alert, Banner                                                    │
│  • Skeleton, Loading                                                       │
│                                                                             │
│  LAYER 3: FEATURE COMPONENTS                                               │
│  ───────────────────────────                                                │
│  Domain-specific components                                                │
│                                                                             │
│  • VisibilityScoreCard                                                     │
│  • CitationList                                                            │
│  • BrandSelector                                                           │
│  • TrendChart                                                              │
│  • SentimentBadge                                                          │
│  • AISystemIcon                                                            │
│  • AlertRuleBuilder                                                        │
│  • ReportGenerator                                                         │
│                                                                             │
│  LAYER 4: PAGE COMPONENTS                                                  │
│  ────────────────────────                                                   │
│  Full page layouts and compositions                                        │
│                                                                             │
│  • DashboardPage                                                           │
│  • BrandsPage                                                              │
│  • CitationsPage                                                           │
│  • VisibilityPage                                                          │
│  • ReportsPage                                                             │
│  • SettingsPage                                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 9.4 State Management

### 9.4.1 State Strategy

```typescript
// Server State with TanStack Query

// Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

// Citation queries
export const useCitations = (filters: CitationFilters) => {
  return useQuery({
    queryKey: ['citations', filters],
    queryFn: () => api.citations.list(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes for frequently updated data
  });
};

export const useCitationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.citations.acknowledge(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citations'] });
    },
  });
};

// Visibility score with real-time updates
export const useVisibilityScore = (brandId: string) => {
  return useQuery({
    queryKey: ['visibility', brandId],
    queryFn: () => api.visibility.get(brandId),
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
};
```

```typescript
// Client State with Zustand

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  sidebarOpen: boolean;
  selectedBrandId: string | null;
  dateRange: { start: Date; end: Date };
  theme: 'light' | 'dark' | 'system';

  setSidebarOpen: (open: boolean) => void;
  setSelectedBrand: (brandId: string | null) => void;
  setDateRange: (range: { start: Date; end: Date }) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      selectedBrandId: null,
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date(),
      },
      theme: 'system',

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setSelectedBrand: (brandId) => set({ selectedBrandId: brandId }),
      setDateRange: (range) => set({ dateRange: range }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        theme: state.theme,
      }),
    }
  )
);
```

---

## 9.5 Page Implementations

### 9.5.1 Dashboard Page

```tsx
// app/(dashboard)/dashboard/page.tsx

import { Suspense } from 'react';
import { DashboardHeader } from '@/components/dashboard/Header';
import { VisibilityOverview } from '@/components/dashboard/VisibilityOverview';
import { CitationFeed } from '@/components/dashboard/CitationFeed';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { AISystemBreakdown } from '@/components/dashboard/AISystemBreakdown';
import { ActionItems } from '@/components/dashboard/ActionItems';
import { Skeleton } from '@ui/components';

export default async function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Suspense fallback={<Skeleton className="h-32" />}>
          <VisibilityOverview />
        </Suspense>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Suspense fallback={<Skeleton className="h-80" />}>
            <TrendChart />
          </Suspense>
        </div>
        <div>
          <Suspense fallback={<Skeleton className="h-80" />}>
            <AISystemBreakdown />
          </Suspense>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<Skeleton className="h-96" />}>
          <CitationFeed />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-96" />}>
          <ActionItems />
        </Suspense>
      </div>
    </div>
  );
}
```

### 9.5.2 Visibility Score Component

```tsx
// components/visibility/VisibilityScoreCard.tsx

'use client';

import { Card, Progress, Badge, Trend } from '@ui/components';
import { useVisibilityScore } from '@/hooks/useVisibility';
import { formatScore, formatChange } from '@/lib/formatters';

interface VisibilityScoreCardProps {
  brandId: string;
  showBreakdown?: boolean;
}

export function VisibilityScoreCard({
  brandId,
  showBreakdown = true,
}: VisibilityScoreCardProps) {
  const { data: visibility, isLoading } = useVisibilityScore(brandId);

  if (isLoading) {
    return <VisibilityScoreCardSkeleton />;
  }

  const { overallScore, components, trend } = visibility;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Visibility Score</h3>
        <Trend
          direction={trend.direction}
          value={trend.change}
          className="text-sm"
        />
      </div>

      {/* Main Score */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              className="stroke-muted fill-none"
              strokeWidth="8"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              className="stroke-primary fill-none"
              strokeWidth="8"
              strokeDasharray={`${(overallScore / 100) * 251.2} 251.2`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{formatScore(overallScore)}</span>
          </div>
        </div>

        <div className="flex-1">
          <p className="text-sm text-muted-foreground">
            {getScoreDescription(overallScore)}
          </p>
          <Badge variant={getScoreVariant(overallScore)} className="mt-2">
            {getScoreLabel(overallScore)}
          </Badge>
        </div>
      </div>

      {/* Component Breakdown */}
      {showBreakdown && (
        <div className="space-y-3">
          {Object.entries(components).map(([key, value]) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-32 capitalize">
                {key.replace('Score', '')}
              </span>
              <Progress value={value} className="flex-1" />
              <span className="text-sm font-medium w-12 text-right">
                {formatScore(value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function getScoreDescription(score: number): string {
  if (score >= 80) return 'Excellent visibility across AI systems';
  if (score >= 60) return 'Good visibility with room for improvement';
  if (score >= 40) return 'Moderate visibility, action recommended';
  return 'Low visibility, immediate action needed';
}

function getScoreVariant(score: number): 'success' | 'warning' | 'destructive' {
  if (score >= 60) return 'success';
  if (score >= 40) return 'warning';
  return 'destructive';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
}
```

---

## 9.6 Real-time Updates

### 9.6.1 WebSocket Integration

```typescript
// lib/websocket.ts

import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function useWebSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
        auth: {
          token: getAccessToken(),
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      socket.on('connect', () => {
        console.log('WebSocket connected');
      });

      socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
      });
    }

    return () => {
      // Don't disconnect on component unmount
      // Socket is shared across the app
    };
  }, []);

  // Subscribe to visibility updates
  useEffect(() => {
    if (!socket) return;

    socket.on('visibility:updated', (data) => {
      queryClient.setQueryData(
        ['visibility', data.brandId],
        (old: any) => ({ ...old, ...data })
      );
    });

    socket.on('citation:detected', (data) => {
      queryClient.invalidateQueries({ queryKey: ['citations'] });
      // Optionally show a toast notification
      showToast('New citation detected', data.citationText);
    });

    socket.on('alert:triggered', (data) => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      showAlertNotification(data);
    });

    return () => {
      socket?.off('visibility:updated');
      socket?.off('citation:detected');
      socket?.off('alert:triggered');
    };
  }, [queryClient]);

  const subscribe = useCallback((channel: string) => {
    socket?.emit('subscribe', { channel });
  }, []);

  const unsubscribe = useCallback((channel: string) => {
    socket?.emit('unsubscribe', { channel });
  }, []);

  return { subscribe, unsubscribe, socket };
}
```

---

## 9.7 Performance Optimization

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PERFORMANCE OPTIMIZATION                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CODE SPLITTING                                                            │
│  ──────────────                                                             │
│  • Route-based splitting (automatic with Next.js)                          │
│  • Component lazy loading for heavy components                             │
│  • Dynamic imports for charts and editors                                  │
│                                                                             │
│  // Lazy load chart components                                             │
│  const TrendChart = dynamic(() => import('./TrendChart'), {               │
│    loading: () => <ChartSkeleton />,                                       │
│    ssr: false,                                                             │
│  });                                                                       │
│                                                                             │
│  IMAGE OPTIMIZATION                                                        │
│  ──────────────────                                                         │
│  • Next.js Image component                                                 │
│  • WebP format with fallbacks                                              │
│  • Responsive images with srcset                                           │
│  • Lazy loading with blur placeholder                                      │
│                                                                             │
│  CACHING STRATEGY                                                          │
│  ────────────────                                                           │
│  • Static assets: 1 year (immutable)                                      │
│  • API responses: 5 min (staleWhileRevalidate)                            │
│  • Dynamic pages: ISR with revalidation                                   │
│                                                                             │
│  BUNDLE OPTIMIZATION                                                       │
│  ───────────────────                                                        │
│  • Tree shaking enabled                                                    │
│  • Minimize dependencies                                                   │
│  • Bundle analysis with @next/bundle-analyzer                             │
│  • Target: < 200KB initial JS                                             │
│                                                                             │
│  RENDERING STRATEGY                                                        │
│  ──────────────────                                                         │
│  • SSR for SEO-critical pages (marketing, docs)                           │
│  • CSR for dashboard (authenticated)                                      │
│  • Streaming SSR for large data                                           │
│  • React Server Components where possible                                  │
│                                                                             │
│  METRICS TARGETS                                                           │
│  ───────────────                                                            │
│  • LCP: < 2.5s                                                             │
│  • FID: < 100ms                                                            │
│  • CLS: < 0.1                                                              │
│  • TTI: < 3.5s                                                             │
│  • Bundle size: < 200KB (gzipped)                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 9.8 Design System

### 9.8.1 Theme Configuration

```typescript
// packages/ui/src/theme/tokens.ts

export const colors = {
  // Brand colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    900: '#0c4a6e',
  },

  // Semantic colors
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    700: '#15803d',
  },
  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    700: '#b45309',
  },
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    700: '#b91c1c',
  },

  // Neutral
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
};

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Menlo', 'monospace'],
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
};

export const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
};
```

---

## 9.9 Accessibility

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ACCESSIBILITY STANDARDS                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  WCAG 2.1 AA COMPLIANCE                                                    │
│  ──────────────────────                                                     │
│                                                                             │
│  Perceivable:                                                              │
│  • All images have alt text                                                │
│  • Color contrast minimum 4.5:1                                            │
│  • Text can be resized to 200%                                            │
│  • No content relies solely on color                                      │
│                                                                             │
│  Operable:                                                                 │
│  • Full keyboard navigation                                                │
│  • Visible focus indicators                                                │
│  • Skip to content link                                                    │
│  • No keyboard traps                                                       │
│                                                                             │
│  Understandable:                                                           │
│  • Clear error messages                                                    │
│  • Consistent navigation                                                   │
│  • Form labels and instructions                                            │
│  • Language attribute set                                                  │
│                                                                             │
│  Robust:                                                                   │
│  • Valid HTML                                                              │
│  • ARIA labels where needed                                                │
│  • Works with screen readers                                               │
│  • Progressive enhancement                                                 │
│                                                                             │
│  TESTING TOOLS                                                             │
│  ─────────────                                                              │
│  • axe-core integration                                                    │
│  • Lighthouse accessibility audit                                          │
│  • Manual screen reader testing                                            │
│  • Keyboard navigation testing                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

*Document Version: 1.0*
*Last Updated: 2026-06-28*
*Next Review: 2026-07-28*
