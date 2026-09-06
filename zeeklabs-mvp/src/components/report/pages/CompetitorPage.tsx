// Report Competitor Page Component
// Page 8: Premium competitor analysis, rankings, detailed comparison

import React from 'react';
import { ReportMeta, CompetitorData } from '@/lib/report/types';
import { ReportPage } from '../ReportPage';
import { RankingList } from '../shared/RankingList';
import { CompetitorTable } from '../shared/DataTable';

interface CompetitorPageProps {
  meta: ReportMeta;
  competitors: CompetitorData;
}

export function CompetitorPage({ meta, competitors }: CompetitorPageProps) {
  const mainBrand = competitors.ranking.find(r => r.isYou);

  return (
    <ReportPage
      pageNumber={8}
      totalPages={meta.totalPages}
      brandName={meta.brandName}
      period={meta.period}
      activeSection="Competitors"
      autoHeight={true}
    >
      {/* Premium Section Header */}
      <div className="report-premium-header" style={{
        background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #c026d3 100%)'
      }}>
        <div className="report-premium-header-content">
          <div className="report-premium-header-badge">
            <span>🏆</span> Competitive Intelligence
          </div>
          <div className="report-premium-header-title">Competitive Landscape</div>
          <div className="report-premium-header-subtitle">
            Comprehensive competitive intelligence mapping your brand's position against key market players across AI platforms
          </div>
        </div>
      </div>

      {/* Main Brand Highlight - Premium Hero Card */}
      {mainBrand && (
        <div className="report-keep-together" style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
          borderRadius: '16px',
          padding: '28px 32px',
          marginBottom: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-30%',
            right: '-10%',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1
          }}>
            <div>
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.7)',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '8px'
              }}>
                Your Brand Ranking
              </div>
              <div style={{
                fontSize: '64px',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1,
                letterSpacing: '-2px'
              }}>
                #{competitors.yourRank}
              </div>
              <div style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.8)',
                marginTop: '8px'
              }}>
                of {competitors.totalCompetitors} competitors • <strong style={{ color: 'white' }}>{meta.brandName}</strong>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.7)',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '8px'
              }}>
                Visibility Score
              </div>
              <div style={{
                fontSize: '56px',
                fontWeight: 900,
                color: 'white',
                lineHeight: 1,
                letterSpacing: '-2px'
              }}>
                {mainBrand.score}
              </div>
              <div style={{
                display: 'inline-flex',
                marginTop: '12px',
                padding: '6px 16px',
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'white'
              }}>
                out of 100
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rankings List - Premium */}
      <div className="report-keep-together" style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            🏆
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
              Market Position Rankings
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              AI visibility scores across competitors
            </div>
          </div>
        </div>
        <RankingList
          title=""
          icon=""
          items={competitors.ranking}
          maxItems={competitors.ranking.length}
        />
      </div>

      {/* Share of Voice - Premium */}
      {competitors.shareOfVoice && competitors.shareOfVoice.length > 0 && (
        <div className="report-keep-together" style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              🎯
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                Share of Voice
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Mention share across you and measured competitors, from real comparison-prompt data
              </div>
            </div>
          </div>

          {(() => {
            const maxPct = Math.max(0, ...competitors.shareOfVoice!.map(e => e.sharePct ?? 0));
            return competitors.shareOfVoice!.map((entry, i) => {
              const barWidth = maxPct > 0 ? ((entry.sharePct ?? 0) / maxPct) * 100 : 0;
              return (
                <div key={entry.name} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 0',
                  borderTop: i > 0 ? '1px solid #f1f5f9' : 'none'
                }}>
                  <div style={{ width: '18px', fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                        {entry.name}
                      </span>
                      {entry.isYou && (
                        <span style={{
                          fontSize: '9px',
                          fontWeight: 700,
                          color: 'white',
                          background: '#6366f1',
                          borderRadius: '999px',
                          padding: '1px 8px'
                        }}>
                          YOU
                        </span>
                      )}
                      <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#64748b' }}>
                        {entry.mentions} mentions
                      </span>
                    </div>
                    <div style={{ height: '6px', borderRadius: '999px', background: '#f1f5f9', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        borderRadius: '999px',
                        width: `${barWidth}%`,
                        background: entry.isYou ? '#6366f1' : '#cbd5e1'
                      }} />
                    </div>
                  </div>
                  <div style={{ width: '44px', textAlign: 'right', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                    {entry.sharePct !== null ? `${Math.round(entry.sharePct)}%` : '—'}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}

      {/* Detailed Competitor Analysis Table - Premium */}
      {competitors.comparison && competitors.comparison.length > 0 && (
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
            gap: '12px',
            marginBottom: '20px'
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
              📊
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                Detailed Competitor Analysis
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Strengths, weaknesses, and market positioning
              </div>
            </div>
          </div>

          <CompetitorTable competitors={competitors.comparison} />
        </div>
      )}

      {/* Executive Summary - Premium Insight */}
      {competitors.executiveSummary && (
        <div className="report-premium-insight" style={{ marginTop: '24px' }}>
          <div className="report-premium-insight-header">
            <div className="report-premium-insight-icon">💡</div>
            <div className="report-premium-insight-title">Competitive Insight</div>
          </div>
          <div className="report-premium-insight-text">
            {competitors.executiveSummary}
          </div>
        </div>
      )}
    </ReportPage>
  );
}

export default CompetitorPage;
