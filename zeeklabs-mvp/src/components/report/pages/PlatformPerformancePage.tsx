// Report Platform Performance Page Component
// Page 4: Premium platform-by-platform performance breakdown with score components

import React from 'react';
import { ReportMeta, PlatformPerformanceData } from '@/lib/report/types';
import { ReportPage } from '../ReportPage';

interface PlatformPerformancePageProps {
  meta: ReportMeta;
  platformPerformance: PlatformPerformanceData;
}

// Score Component Ring
function ScoreComponentRing({
  label,
  value,
  weight,
  color
}: {
  label: string;
  value: number;
  weight: number;
  color: string;
}) {
  const percentage = Math.min(100, Math.max(0, value / weight * 100));
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px'
    }}>
      <div style={{
        position: 'relative',
        width: '100px',
        height: '100px'
      }}>
        {/* Background circle */}
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 2.51} 251`}
            transform="rotate(-90 50 50)"
            style={{
              transition: 'stroke-dasharray 0.5s ease'
            }}
          />
        </svg>
        {/* Center value */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a' }}>
            {Math.round(value)}
          </div>
          <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>
            /{weight}
          </div>
        </div>
      </div>
      <div style={{
        fontSize: '12px',
        fontWeight: 700,
        color: '#475569',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        {label}
      </div>
    </div>
  );
}

// Platform Card
function PlatformCard({ platform }: { platform: PlatformPerformanceData['platforms'][0] }) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return '#059669';
    if (score >= 40) return '#d97706';
    return '#dc2626';
  };

  return (
    <div style={{
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
    }}>
      {/* Platform Header */}
      <div style={{
        background: `linear-gradient(135deg, ${platform.color} 0%, ${platform.color}dd 100%)`,
        padding: '20px',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            {platform.icon}
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>{platform.name}</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>
              {platform.mentions} mentions
            </div>
          </div>
        </div>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}>
          <span style={{
            fontSize: '24px',
            fontWeight: 900,
            color: getScoreColor(platform.score)
          }}>
            {platform.score}
          </span>
        </div>
      </div>

      {/* Platform Stats */}
      <div style={{ padding: '20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px'
        }}>
          <div style={{
            padding: '16px',
            background: '#f8fafc',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '10px',
              fontWeight: 700,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '6px'
            }}>
              Avg Position
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: 900,
              color: platform.avgPosition ? '#0f172a' : '#94a3b8'
            }}>
              {platform.avgPosition ? `#${platform.avgPosition.toFixed(1)}` : '-'}
            </div>
          </div>
          <div style={{
            padding: '16px',
            background: '#f8fafc',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '10px',
              fontWeight: 700,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '6px'
            }}>
              Total Mentions
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: 900,
              color: platform.mentions > 0 ? '#0f172a' : '#94a3b8'
            }}>
              {platform.mentions}
            </div>
          </div>
        </div>

        {/* Score Progress Bar */}
        <div style={{ marginTop: '16px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
            fontSize: '11px',
            color: '#64748b'
          }}>
            <span>Score Progress</span>
            <span style={{ fontWeight: 700 }}>{platform.score}%</span>
          </div>
          <div style={{
            height: '10px',
            background: '#e5e7eb',
            borderRadius: '5px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${platform.score}%`,
              background: `linear-gradient(90deg, ${platform.color} 0%, ${platform.color}cc 100%)`,
              borderRadius: '5px'
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PlatformPerformancePage({ meta, platformPerformance }: PlatformPerformancePageProps) {
  const { scoreBreakdown, platforms, totalSimulations, mentionRate, performanceSummary } = platformPerformance;

  return (
    <ReportPage
      pageNumber={4}
      totalPages={meta.totalPages}
      brandName={meta.brandName}
      period={meta.period}
      activeSection="Visibility"
      autoHeight={true}
    >
      {/* Premium Section Header */}
      <div className="report-premium-header" style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)'
      }}>
        <div className="report-premium-header-content">
          <div className="report-premium-header-badge">
            <span>📊</span> Performance Breakdown
          </div>
          <div className="report-premium-header-title">Platform Performance</div>
          <div className="report-premium-header-subtitle">
            Detailed analysis of your brand's visibility score components and per-platform performance metrics
          </div>
        </div>
      </div>

      {/* Score Components Section */}
      <div className="report-keep-together" style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        padding: '28px',
        marginBottom: '24px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            🎯
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
              Visibility Score Components
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              How your overall score is calculated
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '20px 0'
        }}>
          <ScoreComponentRing
            label="Presence"
            value={scoreBreakdown.presence}
            weight={scoreBreakdown.weights.presence}
            color="#6366f1"
          />
          <div style={{
            fontSize: '32px',
            color: '#e5e7eb',
            fontWeight: 300
          }}>+</div>
          <ScoreComponentRing
            label="Sentiment"
            value={scoreBreakdown.sentiment}
            weight={scoreBreakdown.weights.sentiment}
            color="#10b981"
          />
          <div style={{
            fontSize: '32px',
            color: '#e5e7eb',
            fontWeight: 300
          }}>+</div>
          <ScoreComponentRing
            label="Position"
            value={scoreBreakdown.position}
            weight={scoreBreakdown.weights.position}
            color="#f59e0b"
          />
          <div style={{
            fontSize: '32px',
            color: '#e5e7eb',
            fontWeight: 300
          }}>=</div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px'
          }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
            }}>
              <span style={{
                fontSize: '32px',
                fontWeight: 900,
                color: 'white'
              }}>
                {Math.round(scoreBreakdown.presence + scoreBreakdown.sentiment + scoreBreakdown.position)}
              </span>
            </div>
            <div style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Total
            </div>
          </div>
        </div>

        {/* Weight Legend */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#6366f1' }} />
            <span style={{ fontSize: '11px', color: '#64748b' }}>Presence ({scoreBreakdown.weights.presence}%)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#10b981' }} />
            <span style={{ fontSize: '11px', color: '#64748b' }}>Sentiment ({scoreBreakdown.weights.sentiment}%)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#f59e0b' }} />
            <span style={{ fontSize: '11px', color: '#64748b' }}>Position ({scoreBreakdown.weights.position}%)</span>
          </div>
        </div>
      </div>

      {/* Platform Cards Grid */}
      <div className="report-keep-together" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {platforms.map((platform, index) => (
          <PlatformCard key={index} platform={platform} />
        ))}
      </div>

      {/* Stats Row */}
      <div className="report-premium-stats">
        <div className="report-premium-stat">
          <div className="report-premium-stat-value">{totalSimulations}</div>
          <div className="report-premium-stat-label">Simulations Run</div>
        </div>
        <div className="report-premium-stat">
          <div className="report-premium-stat-value">{mentionRate}%</div>
          <div className="report-premium-stat-label">Mention Rate</div>
        </div>
        <div className="report-premium-stat">
          <div className="report-premium-stat-value" style={{ color: '#059669' }}>
            {platformPerformance.strongestPlatform}
          </div>
          <div className="report-premium-stat-label">Strongest Platform</div>
        </div>
        <div className="report-premium-stat">
          <div className="report-premium-stat-value" style={{ color: '#dc2626' }}>
            {platformPerformance.weakestPlatform}
          </div>
          <div className="report-premium-stat-label">Needs Attention</div>
        </div>
      </div>

      {/* Performance Summary Insight */}
      <div className="report-premium-insight" style={{ marginTop: '24px' }}>
        <div className="report-premium-insight-header">
          <div className="report-premium-insight-icon">💡</div>
          <div className="report-premium-insight-title">Performance Insight</div>
        </div>
        <div className="report-premium-insight-text">
          {performanceSummary}
        </div>
      </div>
    </ReportPage>
  );
}

export default PlatformPerformancePage;
