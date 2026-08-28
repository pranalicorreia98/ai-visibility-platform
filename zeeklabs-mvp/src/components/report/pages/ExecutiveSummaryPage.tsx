// Report Executive Summary Page Component
// Page 2: Premium executive overview with key metrics

import React from 'react';
import { ReportMeta, ExecutiveSummaryData, SentimentData, CompetitorData } from '@/lib/report/types';
import { ReportPage } from '../ReportPage';
import { getScoreLabel } from '@/lib/report/constants';

interface ExecutiveSummaryPageProps {
  meta: ReportMeta;
  executive: ExecutiveSummaryData;
  sentiment: SentimentData;
  competitors?: CompetitorData;
}

// Premium Gauge Component for Net Sentiment
function SentimentGauge({ score, trend }: { score: number; trend?: number }) {
  return (
    <div style={{ width: '160px', margin: '0 auto', textAlign: 'center' }}>
      {/* Gauge Arc */}
      <svg width="160" height="90" viewBox="0 0 160 90" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="gaugeGradientPremium" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="25%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="75%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <filter id="gaugeShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15"/>
          </filter>
        </defs>
        {/* Background arc */}
        <path
          d="M 15 80 A 65 65 0 0 1 145 80"
          fill="none"
          stroke="url(#gaugeGradientPremium)"
          strokeWidth="14"
          strokeLinecap="round"
          filter="url(#gaugeShadow)"
        />
        {/* Needle */}
        <g transform={`rotate(${(score / 100) * 180 - 90}, 80, 80)`}>
          <line x1="80" y1="80" x2="80" y2="28" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
          <circle cx="80" cy="80" r="8" fill="#0f172a" />
          <circle cx="80" cy="80" r="4" fill="white" />
        </g>
      </svg>
      {/* Value */}
      <div style={{ marginTop: '12px' }}>
        <div style={{
          fontSize: '36px',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #0f172a 0%, #475569 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          lineHeight: 1
        }}>
          {score.toFixed(1)}
        </div>
        {trend !== undefined && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 12px',
            marginTop: '8px',
            borderRadius: '12px',
            background: trend >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            fontSize: '12px',
            fontWeight: 700,
            color: trend >= 0 ? '#059669' : '#dc2626'
          }}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
}

// Premium Laurel Wreath Rank Component
function RankBadge({ rank, total }: { rank: number; total: number }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        {/* Laurel wreath SVG */}
        <svg width="140" height="110" viewBox="0 0 140 110">
          <defs>
            <linearGradient id="laurelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c4b5fd" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
          {/* Left laurel */}
          <g fill="none" stroke="url(#laurelGradient)" strokeWidth="2.5">
            <path d="M 35 90 Q 22 65 28 40 Q 34 28 42 22" />
            <path d="M 28 85 Q 15 58 22 32 Q 28 20 36 14" />
            <path d="M 22 80 Q 8 52 16 26 Q 22 14 30 8" />
          </g>
          {/* Leaves left */}
          <g fill="url(#laurelGradient)">
            <ellipse cx="34" cy="35" rx="10" ry="5" transform="rotate(-35 34 35)" />
            <ellipse cx="28" cy="48" rx="10" ry="5" transform="rotate(-25 28 48)" />
            <ellipse cx="24" cy="62" rx="10" ry="5" transform="rotate(-15 24 62)" />
            <ellipse cx="26" cy="76" rx="10" ry="5" transform="rotate(-5 26 76)" />
          </g>
          {/* Right laurel */}
          <g fill="none" stroke="url(#laurelGradient)" strokeWidth="2.5">
            <path d="M 105 90 Q 118 65 112 40 Q 106 28 98 22" />
            <path d="M 112 85 Q 125 58 118 32 Q 112 20 104 14" />
            <path d="M 118 80 Q 132 52 124 26 Q 118 14 110 8" />
          </g>
          {/* Leaves right */}
          <g fill="url(#laurelGradient)">
            <ellipse cx="106" cy="35" rx="10" ry="5" transform="rotate(35 106 35)" />
            <ellipse cx="112" cy="48" rx="10" ry="5" transform="rotate(25 112 48)" />
            <ellipse cx="116" cy="62" rx="10" ry="5" transform="rotate(15 116 62)" />
            <ellipse cx="114" cy="76" rx="10" ry="5" transform="rotate(5 114 76)" />
          </g>
        </svg>
        {/* Rank number */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '52px',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          #{rank}
        </div>
      </div>
      <div style={{
        fontSize: '12px',
        color: '#64748b',
        marginTop: '4px'
      }}>
        out of {total} competitors
      </div>
    </div>
  );
}

export function ExecutiveSummaryPage({
  meta,
  executive,
  sentiment,
  competitors,
}: ExecutiveSummaryPageProps) {
  const scoreLabel = getScoreLabel(executive.overallScore);
  const competitorRank = competitors?.yourRank ?? 6;
  const totalCompetitors = competitors?.totalCompetitors ?? 6;

  return (
    <ReportPage
      pageNumber={2}
      totalPages={meta.totalPages}
      brandName={meta.brandName}
      period={meta.period}
      autoHeight={true}
      activeSection="Visibility"
    >
      {/* Premium Section Header */}
      <div className="report-premium-header">
        <div className="report-premium-header-content">
          <div className="report-premium-header-badge">
            <span>📊</span> Visibility Analysis
          </div>
          <div className="report-premium-header-title">Executive Summary</div>
          <div className="report-premium-header-subtitle">
            AI Visibility & Brand Performance Report for <strong style={{ color: 'white' }}>{meta.brandName}</strong>
          </div>
        </div>
      </div>

      {/* Three Premium Metric Cards */}
      <div className="report-premium-metrics">
        {/* AI Visibility Score Card */}
        <div className="report-premium-metric-card">
          <div className="report-premium-metric-header">
            <div className="report-premium-metric-header-title">AI Visibility Score</div>
          </div>
          <div className="report-premium-metric-body">
            <div className="report-premium-metric-value">{executive.overallScore}</div>
            <div className="report-premium-metric-progress">
              <div
                className="report-premium-metric-progress-fill"
                style={{ width: `${executive.overallScore}%` }}
              />
            </div>
            <div className="report-premium-metric-badge">{executive.overallScore}%</div>
            <div className="report-premium-metric-label">{scoreLabel} Performance</div>
            <div className="report-premium-metric-sublabel">Across all AI platforms</div>
          </div>
        </div>

        {/* Net Sentiment Card */}
        <div className="report-premium-metric-card">
          <div className="report-premium-metric-header">
            <div className="report-premium-metric-header-title">Net Sentiment</div>
          </div>
          <div className="report-premium-metric-body">
            <SentimentGauge score={sentiment.overallScore} trend={4.1} />
            <div className="report-premium-metric-label">Positive Sentiment</div>
          </div>
        </div>

        {/* Competitive Rank Card */}
        <div className="report-premium-metric-card">
          <div className="report-premium-metric-header">
            <div className="report-premium-metric-header-title">Competitive Rank</div>
          </div>
          <div className="report-premium-metric-body">
            <RankBadge rank={competitorRank} total={totalCompetitors} />
          </div>
        </div>
      </div>

      {/* Platform Performance Summary */}
      <div className="report-keep-together" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {Object.entries(executive.platforms).map(([platform, data]) => (
          <div key={platform} style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: platform === 'chatgpt' ? '#10a37f' :
                         platform === 'gemini' ? 'linear-gradient(135deg, #1a73e8, #ea4335)' : '#1a1a2e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '18px',
              fontWeight: 700
            }}>
              {platform === 'chatgpt' ? '◎' : platform === 'gemini' ? '✦' : '◈'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'capitalize', marginBottom: '2px' }}>
                {platform}
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>
                {data.score}
              </div>
            </div>
            <div style={{
              padding: '4px 10px',
              background: data.score >= 70 ? '#dcfce7' : data.score >= 50 ? '#fef3c7' : '#fee2e2',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 600,
              color: data.score >= 70 ? '#166534' : data.score >= 50 ? '#92400e' : '#991b1b'
            }}>
              {data.mentions} mentions
            </div>
          </div>
        ))}
      </div>

      {/* Strategic Insight - Premium Style */}
      <div className="report-premium-insight">
        <div className="report-premium-insight-header">
          <div className="report-premium-insight-icon">💡</div>
          <div className="report-premium-insight-title">Strategic Insight</div>
        </div>
        <div className="report-premium-insight-text">
          {executive.strategicInsight}
        </div>
      </div>
    </ReportPage>
  );
}

export default ExecutiveSummaryPage;
