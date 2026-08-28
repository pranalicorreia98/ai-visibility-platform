// Report Action Card Component
// Displays action items with checkbox design matching reference

import React from 'react';
import { ActionItem, ActionCategory } from '@/lib/report/types';

interface ActionColumnProps {
  category: ActionCategory;
}

export function ActionColumn({ category }: ActionColumnProps) {
  const colorClass =
    category.title === 'Immediate'
      ? 'immediate'
      : category.title === 'Short-term'
      ? 'short-term'
      : 'long-term';

  const getIcon = () => {
    if (category.title === 'Immediate') return '⚡';
    if (category.title === 'Short-term') return '⏱';
    return '🎯';
  };

  const getMeta = () => {
    if (category.title === 'Immediate') return '(High Impact • Priority 1)';
    if (category.title === 'Short-term') return '(2-4 Weeks • Growth Phase)';
    return '(Strategic • Market Moat)';
  };

  return (
    <div className="report-action-column">
      <div className="report-action-column-header">
        <div className={`report-action-column-icon ${colorClass}`}>
          {getIcon()}
        </div>
        <div>
          <div className="report-action-column-title">{category.title}</div>
        </div>
        <div className={`report-action-column-meta ${colorClass}`}>
          {getMeta()}
        </div>
      </div>

      <div className="report-action-cards">
        {category.items.map((item, i) => (
          <ActionCardWithCheckbox key={i} item={item} />
        ))}

        {category.items.length === 0 && (
          <ActionCardWithCheckbox
            item={{
              category: category.title.toUpperCase(),
              title: 'Strategic Action',
              description: 'Run analysis to get personalized action items.',
            }}
          />
        )}
      </div>
    </div>
  );
}

interface ActionCardProps {
  item: ActionItem;
}

// Action card with teal checkbox (matching reference)
export function ActionCardWithCheckbox({ item }: ActionCardProps) {
  return (
    <div className="report-action-card">
      <div className="report-action-checkbox">✓</div>
      <div className="report-action-card-content">
        <div className="report-action-card-title">
          <strong>{item.title}:</strong> {item.description}
        </div>
      </div>
    </div>
  );
}

// Legacy action card for backward compatibility
export function ActionCard({ item }: ActionCardProps) {
  return (
    <div className="report-action-card">
      <div className="report-action-checkbox">✓</div>
      <div className="report-action-card-content">
        <div className="report-action-card-title">{item.title}</div>
        <div className="report-action-card-desc">{item.description}</div>
      </div>
    </div>
  );
}

// Potential gain visualization - Matching reference design
export function PotentialGainCard({
  potentialGain,
  currentScore,
  targetScore,
  maxScore,
  brandName,
}: {
  potentialGain: number;
  currentScore: number;
  targetScore: number;
  maxScore: number;
  brandName: string;
}) {
  const currentPercent = (currentScore / maxScore) * 100;
  const targetPercent = (targetScore / maxScore) * 100;

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Header Bar */}
      <div className="report-action-header">
        <div className="report-action-header-title">Strategic Action Plan</div>
      </div>

      {/* Potential Gain Content */}
      <div className="report-action-gain">
        <div>
          <span style={{
            fontSize: '48px',
            fontWeight: 800,
            color: '#14b8a6',
            letterSpacing: '-2px'
          }}>
            +{potentialGain}pts
          </span>
          <span style={{
            fontSize: '20px',
            fontWeight: 400,
            color: '#0f172a',
            marginLeft: '12px'
          }}>
            Potential Gain
          </span>
        </div>

        <div className="report-action-gain-bar">
          <div className="report-action-gain-bar-desc">
            Simulated impact based on action completion for {brandName}
          </div>
          <div className="report-action-gain-bar-track">
            <div
              className="report-action-gain-bar-fill"
              style={{ width: `${targetPercent}%` }}
            />
          </div>
          <div className="report-action-gain-bar-labels">
            <span>Current: {currentScore}</span>
            <span>Target: {targetScore}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Strategic impact summary
export function ImpactSummary({
  summary,
  implementationWeeks,
  confidence,
}: {
  summary: string;
  implementationWeeks: number;
  confidence: number;
}) {
  return (
    <div className="report-comparison-row">
      {/* Summary Card */}
      <div className="report-insight-callout" style={{ flex: 1, marginBottom: 0 }}>
        <div className="report-insight-title">Strategic Impact Summary</div>
        <div className="report-insight-text">{summary}</div>
      </div>

      {/* Stats Card */}
      <div className="report-comparison-card highlight" style={{ minWidth: '200px' }}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            fontSize: '36px',
            fontWeight: 900,
            color: '#6366f1',
            letterSpacing: '-1px'
          }}>
            {implementationWeeks}
            <span style={{ fontSize: '16px', fontWeight: 500, marginLeft: '4px' }}>Weeks</span>
          </div>
          <div style={{
            fontSize: '10px',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontWeight: 600
          }}>
            To Full Implementation
          </div>
        </div>

        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '10px',
            marginBottom: '6px'
          }}>
            <span style={{ color: '#64748b', fontWeight: 500 }}>Confidence Level</span>
            <span style={{ color: '#6366f1', fontWeight: 700 }}>{confidence}%</span>
          </div>
          <div style={{
            height: '8px',
            background: '#e2e8f0',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${confidence}%`,
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
              borderRadius: '4px'
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActionCard;
