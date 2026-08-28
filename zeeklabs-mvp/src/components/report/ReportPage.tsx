// Report Page Component
// Wraps content in A4-sized printable page with header and footer

import React from 'react';
import { ReportPageProps } from '@/lib/report/types';
import { Header } from './shared/Header';
import { Footer } from './shared/Footer';

interface ReportPageComponentProps extends ReportPageProps {
  brandName: string;
  period: string;
  activeSection?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  // autoHeight: Allow content to flow beyond single page (default: false for backward compatibility)
  autoHeight?: boolean;
}

export function ReportPage({
  pageNumber,
  totalPages,
  children,
  className = '',
  brandName,
  period,
  activeSection,
  showHeader = true,
  showFooter = true,
  autoHeight = false,
}: ReportPageComponentProps) {
  const pageClass = autoHeight ? 'report-page-auto' : 'report-page-fixed';

  return (
    <div className={`report-page ${pageClass} ${className}`}>
      {showHeader && (
        <Header
          brandName={brandName}
          activeSection={activeSection}
          period={period}
        />
      )}

      <div className="report-page-content">
        {children}
      </div>

      {showFooter && (
        <Footer
          pageNumber={pageNumber}
          totalPages={totalPages}
          brandName={brandName}
        />
      )}
    </div>
  );
}

// Simplified page wrapper for cover page
export function ReportCoverPage({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`report-page ${className}`}>
      {children}
    </div>
  );
}

export default ReportPage;
