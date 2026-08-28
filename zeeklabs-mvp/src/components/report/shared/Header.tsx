// Report Header Component
// Displays navigation bar at top of each page

import React from 'react';
import { HeaderProps } from '@/lib/report/types';

// ZeekLabs Logo SVG - Premium Design
const LogoSVG = () => (
  <svg viewBox="0 0 100 115" width="26" height="30">
    <defs>
      <linearGradient id="headerLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
    <path
      d="M10 29 L50 5 L50 20 L30 32 L50 32 L50 45 L18 45 L40 72 L50 72 L50 95 L10 72 L10 58 L30 72 L10 45 L10 29 Z"
      fill="#64748b"
    />
    <path
      d="M90 86 L50 110 L50 95 L70 83 L50 83 L50 70 L82 70 L60 43 L50 43 L50 20 L90 43 L90 57 L70 43 L90 70 L90 86 Z"
      fill="url(#headerLogoGrad)"
    />
  </svg>
);

const SECTIONS = [
  'Visibility',
  'Sentiment',
  'Competitors',
  'Recommendations',
] as const;

export function Header({ brandName, activeSection, period }: HeaderProps) {
  return (
    <div className="report-nav">
      <div className="report-nav-logo">
        <div className="report-nav-logo-icon">
          <LogoSVG />
        </div>
        <div className="report-nav-brand">
          Zeek<span>Labs</span>
        </div>
      </div>

      <div className="report-nav-tabs">
        {SECTIONS.map((section) => (
          <div
            key={section}
            className={`report-nav-tab ${
              activeSection === section ? 'active' : ''
            }`}
          >
            {section}
          </div>
        ))}
      </div>

      <div className="report-nav-date">{period}</div>
    </div>
  );
}

export default Header;
