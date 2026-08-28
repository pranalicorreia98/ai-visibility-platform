// Report Sentiment Bar Component
// Displays positive/neutral/negative breakdown as a horizontal bar

import React from 'react';
import { SentimentBreakdown, PlatformSentiment } from '@/lib/report/types';

interface SentimentBarProps {
  positive: number;
  neutral: number;
  negative: number;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function SentimentBar({
  positive,
  neutral,
  negative,
  showLabels = true,
  size = 'md',
}: SentimentBarProps) {
  const barClass = size === 'lg' ? 'report-sentiment-bar report-sentiment-bar-lg' : 'report-sentiment-bar';

  return (
    <div>
      <div className={barClass}>
        {positive > 0 && (
          <div
            className="report-sentiment-segment positive"
            style={{ width: `${positive}%` }}
          >
            {positive >= 15 && `${positive}%`}
          </div>
        )}
        {neutral > 0 && (
          <div
            className="report-sentiment-segment neutral"
            style={{ width: `${neutral}%` }}
          >
            {neutral >= 15 && `${neutral}%`}
          </div>
        )}
        {negative > 0 && (
          <div
            className="report-sentiment-segment negative"
            style={{ width: `${negative}%` }}
          >
            {negative >= 15 && `${negative}%`}
          </div>
        )}
      </div>

      {showLabels && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '10px',
            fontSize: '9px',
            color: '#64748b',
            fontWeight: 500,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '2px',
              background: 'linear-gradient(135deg, #059669, #10b981)'
            }} />
            Positive ({positive}%)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '2px',
              background: 'linear-gradient(135deg, #475569, #64748b)'
            }} />
            Neutral ({neutral}%)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '2px',
              background: 'linear-gradient(135deg, #dc2626, #ef4444)'
            }} />
            Negative ({negative}%)
          </div>
        </div>
      )}
    </div>
  );
}

// Sentiment breakdown with counts
export function SentimentBreakdownCard({
  breakdown,
}: {
  breakdown: SentimentBreakdown;
}) {
  return (
    <div>
      <SentimentBar
        positive={breakdown.positive}
        neutral={breakdown.neutral}
        negative={breakdown.negative}
        size="lg"
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginTop: '16px',
        }}
      >
        <SentimentStat
          label="Positive"
          percent={breakdown.positive}
          count={breakdown.positiveCount}
          color="#059669"
        />
        <SentimentStat
          label="Neutral"
          percent={breakdown.neutral}
          count={breakdown.neutralCount}
          color="#6b7280"
        />
        <SentimentStat
          label="Negative"
          percent={breakdown.negative}
          count={breakdown.negativeCount}
          color="#dc2626"
        />
      </div>
    </div>
  );
}

function SentimentStat({
  label,
  percent,
  count,
  color,
}: {
  label: string;
  percent: number;
  count: number;
  color: string;
}) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '9px', color: '#6b7280', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ fontSize: '18px', fontWeight: 700, color }}>
        {percent}%
      </div>
      <div style={{ fontSize: '8px', color: '#9ca3af' }}>
        {count} mentions
      </div>
    </div>
  );
}

// Platform sentiment row
export function PlatformSentimentRow({
  platforms,
}: {
  platforms: PlatformSentiment[];
}) {
  return (
    <div>
      {platforms.map((platform, i) => (
        <div key={i} style={{ marginBottom: i < platforms.length - 1 ? '20px' : 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
            }}
          >
            <span style={{ fontSize: '10px' }}>{platform.icon}</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#1f2937',
              }}
            >
              {platform.platform}
            </span>
          </div>

          <div
            className="report-sentiment-bar-lg"
            style={{ borderRadius: '4px', overflow: 'hidden' }}
          >
            <div
              style={{
                width: `${platform.positive}%`,
                background: '#059669',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '9px',
                fontWeight: 600,
              }}
            >
              {platform.positive}% POSITIVE
            </div>
            <div
              style={{
                width: `${platform.neutral}%`,
                background: '#d1d5db',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1f2937',
                fontSize: '9px',
                fontWeight: 600,
              }}
            >
              {platform.neutral}% NEUTRAL
            </div>
            <div
              style={{
                width: `${platform.negative}%`,
                background: '#dc2626',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '9px',
                fontWeight: 600,
              }}
            >
              {platform.negative}% NEGATIVE
            </div>
          </div>
        </div>
      ))}

      <div
        style={{
          display: 'flex',
          gap: '20px',
          marginTop: '12px',
          fontSize: '10px',
          color: '#6b7280',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#059669',
            }}
          />
          Positive Sentiment
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#d1d5db',
            }}
          />
          Neutral Mention
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#dc2626',
            }}
          />
          Negative Bias
        </div>
      </div>
    </div>
  );
}

export default SentimentBar;
