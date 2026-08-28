// Report Insight Callout Component
// Displays strategic insight in highlighted box

import React from 'react';
import { InsightCard as InsightCardType } from '@/lib/report/types';

interface InsightCalloutProps {
  title: string;
  text: string;
}

export function InsightCallout({ title, text }: InsightCalloutProps) {
  return (
    <div className="report-insight-callout">
      <div className="report-insight-title">{title}</div>
      <div className="report-insight-text">{text}</div>
    </div>
  );
}

// Insight cards row (3 columns)
export function InsightCardsRow({
  insights,
}: {
  insights: {
    growthVector: InsightCardType;
    trustDeficit: InsightCardType;
    competitiveRadar: InsightCardType;
  };
}) {
  return (
    <div className="report-insight-cards">
      <InsightCard
        icon="📈"
        title={insights.growthVector.title}
        description={insights.growthVector.description}
        color={insights.growthVector.color}
      />
      <InsightCard
        icon="⚠️"
        title={insights.trustDeficit.title}
        description={insights.trustDeficit.description}
        color={insights.trustDeficit.color}
      />
      <InsightCard
        icon="🎯"
        title={insights.competitiveRadar.title}
        description={insights.competitiveRadar.description}
        color={insights.competitiveRadar.color}
      />
    </div>
  );
}

interface InsightCardProps {
  icon: string;
  title: string;
  description: string;
  color: 'purple' | 'gray' | 'amber' | 'blue' | 'green' | 'red';
}

export function InsightCard({ icon, title, description, color }: InsightCardProps) {
  return (
    <div className={`report-insight-card ${color}`}>
      <div className="report-insight-card-icon">{icon}</div>
      <div className="report-insight-card-title">{title}</div>
      <div className="report-insight-card-text">{description}</div>
    </div>
  );
}

// Executive summary box (for competitor page)
export function ExecutiveSummaryBox({
  summary,
  marketLeaderGap,
  growthTrajectory,
}: {
  summary: string;
  marketLeaderGap: number;
  growthTrajectory: string;
}) {
  return (
    <div
      style={{
        background: '#f8fafc',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '20px',
      }}
    >
      <div
        style={{
          fontSize: '10px',
          fontWeight: 600,
          color: '#f59e0b',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '8px',
        }}
      >
        Executive Summary
      </div>

      <div
        style={{
          fontSize: '11px',
          color: '#4b5563',
          lineHeight: 1.6,
          marginBottom: '16px',
        }}
      >
        {summary}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
        }}
      >
        <div
          style={{
            padding: '12px',
            background: 'white',
            borderRadius: '6px',
          }}
        >
          <div style={{ fontSize: '9px', color: '#6b7280' }}>
            Market Leader Gap
          </div>
          <div
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: marketLeaderGap > 0 ? '#dc2626' : '#059669',
            }}
          >
            {marketLeaderGap > 0 ? '-' : '+'}{Math.abs(marketLeaderGap).toFixed(1)}%
          </div>
        </div>

        <div
          style={{
            padding: '12px',
            background: 'white',
            borderRadius: '6px',
          }}
        >
          <div style={{ fontSize: '9px', color: '#6b7280' }}>
            Growth Trajectory
          </div>
          <div
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: '#059669',
            }}
          >
            {growthTrajectory}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InsightCallout;
