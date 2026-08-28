'use client';

// Report Preview Page
// Renders the complete report for a brand, optimized for Chrome Print to PDF

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import '@/styles/report.css';

import { Report } from '@/components/report/Report';
import {
  CoverPage,
  ExecutiveSummaryPage,
  SentimentPage,
  CompetitorPage,
  ProgressPage,
  ActionPlanPage,
  CitationPage,
  PromptsPage,
  MarketIntelligencePage,
  MethodologyPage,
} from '@/components/report/pages';
import { PlatformPerformancePage } from '@/components/report/pages/PlatformPerformancePage';

import { ReportViewModel } from '@/lib/report/types';
import { mapToReportViewModel, ReportData, ProgressApiData } from '@/lib/report/mapper';

export default function ReportPreviewPage() {
  const params = useParams();
  const brandId = params.brandId as string;

  const [viewModel, setViewModel] = useState<ReportViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReportData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch report data from API
        const reportResponse = await fetch('/api/reports/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brandId }),
        });
        if (!reportResponse.ok) {
          const errorData = await reportResponse.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to fetch report data');
        }
        const data = await reportResponse.json();
        const reportData: ReportData = data.report;

        // Fetch progress data if available
        let progressData: ProgressApiData | null = null;
        try {
          const progressResponse = await fetch(`/api/brands/${brandId}/progress`);
          if (progressResponse.ok) {
            progressData = await progressResponse.json();
          }
        } catch {
          // Progress data is optional
        }

        // Map to view model
        const vm = mapToReportViewModel(reportData, progressData);
        setViewModel(vm);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load report');
      } finally {
        setLoading(false);
      }
    }

    if (brandId) {
      loadReportData();
    }
  }, [brandId]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#f3f4f6',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '4px solid #e5e7eb',
              borderTopColor: '#6366f1',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <div style={{ fontSize: '16px', color: '#374151' }}>Loading report...</div>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#f3f4f6',
        }}
      >
        <div
          style={{
            background: 'white',
            padding: '32px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <div style={{ fontSize: '18px', fontWeight: 600, color: '#dc2626', marginBottom: '8px' }}>
            Error Loading Report
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>{error}</div>
        </div>
      </div>
    );
  }

  if (!viewModel) {
    return null;
  }

  return (
    <Report>
      {/* ============ COVER PAGE ============ */}
      <CoverPage meta={viewModel.meta} executive={viewModel.executive} />

      {/* ============ VISIBILITY SECTION ============ */}
      {/* All pages related to AI Visibility metrics and analysis */}
      <ExecutiveSummaryPage
        meta={viewModel.meta}
        executive={viewModel.executive}
        sentiment={viewModel.sentiment}
        competitors={viewModel.competitors}
      />
      <ProgressPage meta={viewModel.meta} progress={viewModel.progress} />
      <PlatformPerformancePage meta={viewModel.meta} platformPerformance={viewModel.platformPerformance} />
      <PromptsPage meta={viewModel.meta} prompts={viewModel.prompts} />
      <CitationPage meta={viewModel.meta} citations={viewModel.citations} />

      {/* ============ SENTIMENT SECTION ============ */}
      {/* Pages related to sentiment analysis */}
      <SentimentPage meta={viewModel.meta} sentiment={viewModel.sentiment} />

      {/* ============ COMPETITORS SECTION ============ */}
      {/* Pages related to competitive analysis */}
      <CompetitorPage meta={viewModel.meta} competitors={viewModel.competitors} />
      <MarketIntelligencePage meta={viewModel.meta} marketIntelligence={viewModel.marketIntelligence} />

      {/* ============ RECOMMENDATIONS SECTION ============ */}
      {/* Pages related to action items and methodology */}
      <ActionPlanPage meta={viewModel.meta} actionPlan={viewModel.actionPlan} />
      <MethodologyPage meta={viewModel.meta} methodology={viewModel.methodology} />
    </Report>
  );
}
