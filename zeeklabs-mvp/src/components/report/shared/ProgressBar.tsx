// Report Progress Bar Component
// Displays progress visualization with current/target values

import React from 'react';
import { ProgressBarProps } from '@/lib/report/types';

export function ProgressBar({
  current,
  target,
  max,
  showLabels = true,
  height = 'md',
  className = '',
}: ProgressBarProps) {
  const currentPercent = (current / max) * 100;
  const gainPercent = target ? ((target - current) / max) * 100 : 0;

  return (
    <div className={className}>
      <div className="report-progress-bar">
        <div
          className="report-progress-current"
          style={{ width: `${currentPercent}%` }}
        >
          Current ({current})
        </div>
        {gainPercent > 0 && (
          <div
            className="report-progress-gain"
            style={{ width: `${gainPercent}%` }}
          >
            +{target! - current} Gain
          </div>
        )}
      </div>

      {showLabels && (
        <div className="report-progress-labels">
          <div className="report-progress-label">
            <div className="report-progress-label-value">{current}</div>
            <div className="report-progress-label-text">Current State</div>
          </div>
          {target && (
            <div className="report-progress-label">
              <div className="report-progress-label-value">{target}</div>
              <div className="report-progress-label-text primary">
                Target Benchmark
              </div>
            </div>
          )}
          <div className="report-progress-label">
            <div className="report-progress-label-value">{max}</div>
            <div className="report-progress-label-text">Industry Max</div>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple horizontal bar
export function SimpleBar({
  value,
  max = 100,
  color,
  height = 6,
}: {
  value: number;
  max?: number;
  color: string;
  height?: number;
}) {
  const percent = Math.min((value / max) * 100, 100);

  return (
    <div
      className="report-platform-bar-track"
      style={{ height: `${height}px` }}
    >
      <div
        className="report-platform-bar-fill"
        style={{ width: `${percent}%`, background: color }}
      />
    </div>
  );
}

// Platform score bar with label - Premium Design
export function PlatformBar({
  name,
  score,
  color,
}: {
  name: string;
  score: number;
  color: string;
}) {
  // Create gradient based on color
  const gradient = `linear-gradient(135deg, ${color} 0%, ${adjustColor(color, 20)} 100%)`;

  return (
    <div className="report-platform-bar-item">
      <div className="report-platform-bar-name">{name}</div>
      <div className="report-platform-bar-row">
        <div className="report-platform-bar-track">
          <div
            className="report-platform-bar-fill"
            style={{
              width: `${score}%`,
              background: gradient,
              boxShadow: `0 2px 4px ${color}40`
            }}
          />
        </div>
        <div className="report-platform-bar-value">{score}</div>
      </div>
    </div>
  );
}

// Helper to lighten/darken color
function adjustColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

// Value-only progress bar (for use in ProgressPage history)
export function ValueBar({
  value,
  max = 100,
  showLabel = true,
}: {
  value: number;
  max?: number;
  showLabel?: boolean;
}) {
  const percent = Math.min((value / max) * 100, 100);

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div
        style={{
          flex: 1,
          height: '8px',
          background: '#e5e7eb',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
            borderRadius: '4px',
          }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
