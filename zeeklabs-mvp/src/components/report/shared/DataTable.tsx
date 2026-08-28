// Report Data Table Component
// Displays tabular data with print-optimized styling

import React from 'react';
import { DataTableProps } from '@/lib/report/types';

export function DataTable({
  headers,
  rows,
  highlightColumn,
  className = '',
}: DataTableProps) {
  return (
    <table className={`report-table ${className}`}>
      <thead>
        <tr>
          {headers.map((header, i) => (
            <th key={i}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <td
                key={cellIndex}
                style={
                  highlightColumn === cellIndex
                    ? { fontWeight: 600, color: '#6366f1' }
                    : undefined
                }
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Benchmark table with delta column - Matching reference design
export function BenchmarkTable({
  data,
  brandName,
}: {
  data: Array<{
    label: string;
    value: string;
    industryAvg: string;
    delta: number;
    deltaFormatted: string;
    isPositive: boolean;
  }>;
  brandName: string;
}) {
  return (
    <table className="report-table">
      <thead>
        <tr>
          <th style={{ background: '#475569' }}>Metric</th>
          <th style={{ background: '#10b981' }}>{brandName}</th>
          <th style={{ background: '#8b5cf6' }}>Competitor Avg</th>
          <th style={{ background: '#334155' }}>Delta</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            <td style={{ fontWeight: 500 }}>{row.label}</td>
            <td style={{ fontWeight: 600 }}>{row.value}</td>
            <td>{row.industryAvg}</td>
            <td>
              <span style={{
                color: row.isPositive ? '#10b981' : '#f87171',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}>
                {row.isPositive ? '↑' : '↓'} {row.deltaFormatted}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Competitor comparison matrix table
export function ComparisonMatrix({
  metrics,
  brands,
}: {
  metrics: Array<{
    label: string;
    values: Array<{ brand: string; value: string; isTarget: boolean }>;
  }>;
  brands: string[];
}) {
  return (
    <table className="report-table">
      <thead>
        <tr>
          <th>Metrics</th>
          {brands.map((brand, i) => (
            <th key={i}>{i === 0 ? `${brand.toUpperCase()} (Target)` : brand.toUpperCase()}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {metrics.map((metric, i) => (
          <tr key={i}>
            <td style={{ fontWeight: 500 }}>{metric.label}</td>
            {metric.values.map((val, j) => (
              <td
                key={j}
                style={
                  val.isTarget
                    ? { fontWeight: 700, color: '#6366f1' }
                    : { color: '#4b5563' }
                }
              >
                {val.value}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Competitor details table
export function CompetitorTable({
  competitors,
}: {
  competitors: Array<{
    name: string;
    subtitle?: string;
    strengths: string[];
    weaknesses: string[];
    marketShare: string;
  }>;
}) {
  return (
    <table className="report-table">
      <thead>
        <tr>
          <th>Competitor Platform</th>
          <th>Key Strengths</th>
          <th>Identified Weaknesses</th>
          <th>Market Share</th>
        </tr>
      </thead>
      <tbody>
        {competitors.map((comp, i) => (
          <tr key={i}>
            <td>
              <div style={{ fontWeight: 600, fontSize: '12px', color: '#1f2937' }}>
                {comp.name}
              </div>
              {comp.subtitle && (
                <div style={{ fontSize: '9px', color: '#6b7280', marginTop: '2px' }}>
                  {comp.subtitle}
                </div>
              )}
            </td>
            <td>
              {comp.strengths.slice(0, 2).map((s, j) => (
                <div
                  key={j}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '4px',
                    fontSize: '10px',
                    color: '#059669',
                  }}
                >
                  ✓ {s}
                </div>
              ))}
            </td>
            <td>
              {comp.weaknesses.slice(0, 2).map((w, j) => (
                <div
                  key={j}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '4px',
                    fontSize: '10px',
                    color: '#dc2626',
                  }}
                >
                  ✗ {w}
                </div>
              ))}
            </td>
            <td>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#6366f1',
                }}
              >
                {comp.marketShare}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default DataTable;
