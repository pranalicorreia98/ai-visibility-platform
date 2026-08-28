// Report Progress Page Component
// Page 3: Premium historical progress tracking with trends

import React from 'react';
import { ReportMeta, ProgressData } from '@/lib/report/types';
import { ReportPage } from '../ReportPage';

interface ProgressPageProps {
  meta: ReportMeta;
  progress: ProgressData;
}

// Premium Progress Bar
function PremiumProgressBar({ value, max = 100 }: { value: number; max?: number }) {
  const percentage = (value / max) * 100;
  return (
    <div style={{
      height: '12px',
      background: '#e5e7eb',
      borderRadius: '6px',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <div style={{
        height: '100%',
        width: `${percentage}%`,
        background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
        borderRadius: '6px',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
          animation: 'shimmer 2s infinite'
        }} />
      </div>
    </div>
  );
}

export function ProgressPage({ meta, progress }: ProgressPageProps) {
  return (
    <ReportPage
      pageNumber={3}
      totalPages={meta.totalPages}
      brandName={meta.brandName}
      autoHeight={true}
      period={meta.period}
      activeSection="Visibility"
    >
      {/* Premium Section Header */}
      <div className="report-premium-header">
        <div className="report-premium-header-content">
          <div className="report-premium-header-badge">
            <span>📈</span> Historical Analysis
          </div>
          <div className="report-premium-header-title">Progress & Trends</div>
          <div className="report-premium-header-subtitle">
            Track your brand's visibility evolution over time with comprehensive metrics and performance trends
          </div>
        </div>
      </div>

      {/* No Data State */}
      {!progress.hasData && (
        <div style={{
          background: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)',
          border: '2px solid #fde047',
          borderRadius: '16px',
          padding: '48px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📈</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#854d0e', marginBottom: '8px' }}>
            No Historical Data Yet
          </div>
          <div style={{ fontSize: '14px', color: '#a16207', maxWidth: '400px', margin: '0 auto' }}>
            Run multiple analyses over time to track progress and identify trends in your AI visibility performance.
          </div>
        </div>
      )}

      {/* Progress Data */}
      {progress.hasData && (
        <>
          {/* Score Overview Cards */}
          <div className="report-keep-together" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '24px'
          }}>
            {/* Current Score Card */}
            <div style={{
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              borderRadius: '16px',
              padding: '28px',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-20%',
                width: '200px',
                height: '200px',
                background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
                pointerEvents: 'none'
              }} />
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                opacity: 0.9,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '8px'
              }}>
                Current Score
              </div>
              <div style={{
                fontSize: '56px',
                fontWeight: 900,
                letterSpacing: '-2px',
                lineHeight: 1
              }}>
                {progress.currentScore}
              </div>
              <div style={{
                fontSize: '13px',
                opacity: 0.9,
                marginTop: '8px'
              }}>
                Latest Analysis • {progress.periodLabel}
              </div>
            </div>

            {/* Change Card */}
            <div style={{
              background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
              border: '2px solid #c4b5fd',
              borderRadius: '16px',
              padding: '28px',
              position: 'relative'
            }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#7c3aed',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '8px'
              }}>
                Change From Previous
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '8px'
              }}>
                <span style={{
                  fontSize: '56px',
                  fontWeight: 900,
                  color: progress.change >= 0 ? '#059669' : '#dc2626',
                  letterSpacing: '-2px',
                  lineHeight: 1
                }}>
                  {progress.changeFormatted}
                </span>
                <span style={{ fontSize: '18px', color: '#64748b', fontWeight: 500 }}>points</span>
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '12px',
                padding: '6px 14px',
                borderRadius: '20px',
                background: progress.change >= 0 ? 'rgba(5, 150, 105, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                color: progress.change >= 0 ? '#059669' : '#dc2626',
                fontSize: '12px',
                fontWeight: 600
              }}>
                {progress.change >= 0 ? '↑' : '↓'} {progress.change >= 0 ? 'Improvement' : 'Decline'} vs. Previous Period
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="report-premium-stats">
            <div className="report-premium-stat">
              <div className="report-premium-stat-value">{progress.avgScore.toFixed(1)}</div>
              <div className="report-premium-stat-label">Average Score</div>
            </div>
            <div className="report-premium-stat">
              <div className="report-premium-stat-value">{progress.totalSnapshots}</div>
              <div className="report-premium-stat-label">Total Snapshots</div>
            </div>
            <div className="report-premium-stat">
              <div className="report-premium-stat-value" style={{
                color: progress.trend === 'up' ? '#059669' : progress.trend === 'down' ? '#dc2626' : '#64748b'
              }}>
                {progress.trend === 'up' ? '↑ Up' : progress.trend === 'down' ? '↓ Down' : '→ Stable'}
              </div>
              <div className="report-premium-stat-label">Trend Direction</div>
            </div>
            <div className="report-premium-stat">
              <div className="report-premium-stat-value" style={{ color: '#6366f1' }}>
                {progress.dataPoints.length > 0 ? progress.dataPoints[progress.dataPoints.length - 1].score : '-'}
              </div>
              <div className="report-premium-stat-label">Starting Score</div>
            </div>
          </div>

          {/* Historical Timeline */}
          {progress.dataPoints.length > 0 && (
            <div className="report-keep-together" style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                  }}>
                    📊
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Score History</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Performance over time</div>
                  </div>
                </div>
                <div style={{
                  padding: '6px 14px',
                  background: '#f1f5f9',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#475569'
                }}>
                  {progress.dataPoints.length} data points
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {progress.dataPoints.map((entry, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px 20px',
                      background: index === 0 ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' : '#f8fafc',
                      borderRadius: '12px',
                      border: index === 0 ? '2px solid #86efac' : '1px solid #e5e7eb'
                    }}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: index === 0 ? '#10b981' : '#e5e7eb',
                      color: index === 0 ? 'white' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700
                    }}>
                      {index === 0 ? '★' : index + 1}
                    </div>
                    <div style={{ width: '110px', flexShrink: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                        {entry.dateFormatted}
                      </div>
                      {index === 0 && (
                        <div style={{ fontSize: '10px', color: '#059669', fontWeight: 500 }}>Latest</div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <PremiumProgressBar value={entry.score} />
                    </div>
                    <div style={{
                      width: '60px',
                      textAlign: 'right',
                      fontSize: '20px',
                      fontWeight: 800,
                      color: '#0f172a'
                    }}>
                      {entry.score}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </>
      )}
    </ReportPage>
  );
}

export default ProgressPage;
