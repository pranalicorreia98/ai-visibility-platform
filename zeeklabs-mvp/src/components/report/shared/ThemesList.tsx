// Report Themes List Component
// Displays positive/negative themes in card format

import React from 'react';
import { ThemeItem } from '@/lib/report/types';

interface ThemesListProps {
  positiveThemes: ThemeItem[];
  negativeThemes: ThemeItem[];
}

export function ThemesList({ positiveThemes, negativeThemes }: ThemesListProps) {
  return (
    <div className="report-themes-grid">
      <ThemesCard
        type="positive"
        title="What AI Platforms Praise"
        icon="👍"
        themes={positiveThemes}
      />
      <ThemesCard
        type="negative"
        title="Areas Mentioned Negatively"
        icon="👎"
        themes={negativeThemes}
      />
    </div>
  );
}

interface ThemesCardProps {
  type: 'positive' | 'negative';
  title: string;
  icon: string;
  themes: ThemeItem[];
}

export function ThemesCard({ type, title, icon, themes }: ThemesCardProps) {
  const displayThemes = themes.length > 0 ? themes : getDefaultThemes(type);

  return (
    <div className={`report-themes-card ${type}`}>
      <div className="report-themes-header">
        <div className="report-themes-icon">{icon}</div>
        <div className="report-themes-title">{title}</div>
      </div>

      {displayThemes.slice(0, 3).map((theme, i) => (
        <div key={i} className="report-theme-item">
          <div className="report-theme-check">
            {type === 'positive' ? '✓' : '✗'}
          </div>
          <div>
            <div className="report-theme-title">{theme.theme}</div>
            {theme.description && (
              <div className="report-theme-desc">{theme.description}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function getDefaultThemes(type: 'positive' | 'negative'): ThemeItem[] {
  if (type === 'positive') {
    return [
      {
        theme: 'Focus on AI efficiency',
        description: 'Advanced algorithms prioritizing throughput and rapid processing.',
      },
      {
        theme: 'Claimed automation',
        description: 'High degrees of end-to-end task replacement.',
      },
    ];
  }

  return [
    {
      theme: 'Lack of public reviews',
      description: 'Limited non-NDA data points available in public domain.',
    },
    {
      theme: 'Limited visibility',
      description: 'Brand awareness remains confined to specialized niches.',
    },
  ];
}

// Single theme tag/badge
export function ThemeTag({
  theme,
  type,
}: {
  theme: string;
  type: 'positive' | 'negative' | 'neutral';
}) {
  const colors = {
    positive: { bg: '#d1fae5', color: '#065f46' },
    negative: { bg: '#fee2e2', color: '#991b1b' },
    neutral: { bg: '#f3f4f6', color: '#4b5563' },
  };

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: '12px',
        fontSize: '9px',
        fontWeight: 500,
        background: colors[type].bg,
        color: colors[type].color,
        marginRight: '6px',
        marginBottom: '6px',
      }}
    >
      {theme}
    </span>
  );
}

export default ThemesList;
