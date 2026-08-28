// Report Ranking List Component
// Displays competitor rankings with visual bars

import React from 'react';
import { RankingItem } from '@/lib/report/types';
import { formatRank } from '@/lib/report/formatter';

interface RankingListProps {
  title: string;
  icon?: string;
  items: RankingItem[];
  maxItems?: number;
}

export function RankingList({
  title,
  icon = '📊',
  items,
  maxItems = 6,
}: RankingListProps) {
  const displayItems = items.slice(0, maxItems);

  return (
    <div className="report-ranking-list">
      <div className="report-ranking-title">
        {icon} {title}
      </div>

      {displayItems.map((item) => (
        <div
          key={item.rank}
          className={`report-ranking-item ${item.isYou ? 'highlight' : ''}`}
        >
          <div className="report-ranking-num">{formatRank(item.rank)}</div>
          <div className="report-ranking-name">{item.name}</div>
          <div className="report-ranking-bar">
            <div
              className="report-ranking-bar-fill"
              style={{ width: `${item.score}%` }}
            />
          </div>
          <div className="report-ranking-score">{item.score}</div>
          {item.isYou && item.scoreLabel && (
            <div
              style={{
                fontSize: '9px',
                color: '#dc2626',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              {item.scoreLabel}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Compact ranking display for smaller spaces
export function RankingCompact({
  items,
  maxItems = 5,
}: {
  items: RankingItem[];
  maxItems?: number;
}) {
  const displayItems = items.slice(0, maxItems);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {displayItems.map((item) => (
        <div
          key={item.rank}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 12px',
            borderRadius: '6px',
            background: item.isYou
              ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
              : '#f9fafb',
            color: item.isYou ? 'white' : '#1f2937',
          }}
        >
          <span
            style={{
              fontWeight: 700,
              fontSize: '11px',
              minWidth: '20px',
            }}
          >
            {item.rank}
          </span>
          <span style={{ flex: 1, fontSize: '10px', fontWeight: 500 }}>
            {item.name} {item.isYou ? '(You)' : ''}
          </span>
          <span style={{ fontWeight: 700, fontSize: '12px' }}>
            {item.score}
          </span>
        </div>
      ))}
    </div>
  );
}

export default RankingList;
