// Report Metric Card Component
// Displays a single metric value with label, optional trend, and sub-text

import React from 'react';
import { MetricCardProps } from '@/lib/report/types';

export function MetricCard({
  label,
  value,
  subtitle,
  trend,
  trendLabel,
  icon,
  color,
  size = 'md',
}: MetricCardProps) {
  const valueClass = size === 'lg' ? 'report-metric-value-lg' : 'report-metric-value';
  const trendDirection = trend !== null && trend !== undefined
    ? trend >= 0 ? 'up' : 'down'
    : null;
  const trendText = trend !== null && trend !== undefined
    ? `${trend >= 0 ? '↗' : '↘'} ${trend >= 0 ? '+' : ''}${trend.toFixed(1)}%`
    : null;

  return (
    <div className="report-metric-card">
      <div className="report-metric-header">
        <div className="report-metric-label">{label}</div>
        {trendText && (
          <div className={`report-metric-trend ${trendDirection}`}>
            {trendText}
          </div>
        )}
        {icon && !trendText && (
          <div className="report-metric-icon">{icon}</div>
        )}
      </div>

      <div className={valueClass} style={color ? { color } : undefined}>
        {value}
      </div>

      {subtitle && <div className="report-metric-sub">{subtitle}</div>}
    </div>
  );
}

// Bordered variant for primary metrics
export function MetricCardBordered({
  label,
  value,
  maxValue,
  description,
  children,
  color,
}: {
  label: string;
  value: number | string;
  maxValue?: number | string;
  description?: string;
  children?: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="report-metric-card report-metric-card-bordered">
      <div className="report-metric-header">
        <div className="report-metric-label">{label}</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <div
          className="report-metric-value-lg"
          style={color ? { color } : undefined}
        >
          {value}
        </div>
        {maxValue && <div className="report-metric-max">/ {maxValue}</div>}
      </div>

      {description && (
        <div className="report-metric-sub" style={{ marginTop: '12px' }}>
          {description}
        </div>
      )}

      {children}
    </div>
  );
}

// Small metric card for grids
export function MetricCardSmall({
  label,
  value,
  subtitle,
  trend,
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: number | null;
}) {
  const trendDirection = trend !== null && trend !== undefined
    ? trend >= 0 ? 'up' : 'down'
    : null;
  const trendText = trend !== null && trend !== undefined
    ? `↗ ${trend >= 0 ? '+' : ''}${Math.abs(trend).toFixed(1)}%`
    : null;

  return (
    <div className="report-metric-card">
      <div className="report-metric-header">
        <div className="report-metric-label">{label}</div>
        {trendText && (
          <div className={`report-metric-trend ${trendDirection}`}>
            {trendText}
          </div>
        )}
      </div>

      <div className="report-metric-value">{value}</div>

      {subtitle && <div className="report-metric-sub">{subtitle}</div>}
    </div>
  );
}

export default MetricCard;
