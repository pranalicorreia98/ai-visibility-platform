// Report Blank Page Component
// Displays "This page intentionally left blank" for empty pages

import React from 'react';
import { ReportMeta } from '@/lib/report/types';
import { ReportPage } from '../ReportPage';

interface BlankPageProps {
  meta: ReportMeta;
  pageNumber: number;
}

export function BlankPage({ meta, pageNumber }: BlankPageProps) {
  return (
    <ReportPage
      pageNumber={pageNumber}
      totalPages={meta.totalPages}
      brandName={meta.brandName}
      period={meta.period}
      showHeader={true}
      showFooter={true}
    >
      <div className="report-blank-page">
        <div className="report-blank-page-content">
          <div className="report-blank-page-icon">📄</div>
          <div className="report-blank-page-text">
            This page intentionally left blank
          </div>
        </div>
      </div>
    </ReportPage>
  );
}

export default BlankPage;
