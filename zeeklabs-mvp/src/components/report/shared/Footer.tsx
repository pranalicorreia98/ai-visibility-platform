// Report Footer Component
// Displays page number and branding at bottom of each page

import React from 'react';
import { FooterProps } from '@/lib/report/types';
import { getCurrentYear } from '@/lib/report/formatter';

// ZeekLabs Logo SVG (smaller premium version)
const LogoSVG = () => (
  <svg viewBox="0 0 100 115" width="20" height="22">
    <defs>
      <linearGradient id="footerLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
    <path
      d="M10 29 L50 5 L50 20 L30 32 L50 32 L50 45 L18 45 L40 72 L50 72 L50 95 L10 72 L10 58 L30 72 L10 45 L10 29 Z"
      fill="#94a3b8"
    />
    <path
      d="M90 86 L50 110 L50 95 L70 83 L50 83 L50 70 L82 70 L60 43 L50 43 L50 20 L90 43 L90 57 L70 43 L90 70 L90 86 Z"
      fill="url(#footerLogoGrad)"
    />
  </svg>
);

export function Footer({ pageNumber, totalPages, brandName }: FooterProps) {
  const year = getCurrentYear();

  return (
    <div className="report-footer">
      <div className="report-footer-logo">
        <LogoSVG />
        <div className="report-footer-brand">
          ZeekLabs<span>.ai</span>
        </div>
      </div>

      <div className="report-footer-copyright">
        © {year} ZeekLabs.ai. Confidential and Proprietary.
      </div>

      <div className="report-footer-page">
        Page <span>{pageNumber}</span> of {totalPages} &nbsp;&nbsp; ZeekLabs.ai
      </div>
    </div>
  );
}

export default Footer;
