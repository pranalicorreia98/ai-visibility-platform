// Report Container Component
// Main wrapper for the entire printable report

import React from 'react';
import '@/styles/report.css';

interface ReportProps {
  children: React.ReactNode;
  className?: string;
}

export function Report({ children, className = '' }: ReportProps) {
  return (
    <div className={`report-container ${className}`}>
      {children}
    </div>
  );
}

export default Report;
