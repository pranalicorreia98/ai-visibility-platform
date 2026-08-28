// Report Strategic Position Page Component
// Page 4: Premium brand positioning and AI visibility metrics

import React from 'react';
import { ReportMeta, StrategicPositionData } from '@/lib/report/types';
import { ReportPage } from '../ReportPage';

interface StrategicPositionPageProps {
  meta: ReportMeta;
  strategicPosition: StrategicPositionData;
}

export function StrategicPositionPage({ meta, strategicPosition }: StrategicPositionPageProps) {
  return (
    <ReportPage
      pageNumber={4}
      totalPages={meta.totalPages}
      brandName={meta.brandName}
      period={meta.period}
      activeSection="Visibility"
    >
      {/* Premium Section Header */}
      <div className="report-premium-header">
        <div className="report-premium-header-content">
          <div className="report-premium-header-badge">
            <span>🎯</span> Strategic Analysis
          </div>
          <div className="report-premium-header-title">Strategic Position</div>
          <div className="report-premium-header-subtitle">
            In-depth assessment of your brand's positioning and visibility within AI platform responses
          </div>
        </div>
      </div>

      {/* Position Badges - Premium Grid */}
      {strategicPosition.badges && strategicPosition.badges.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {strategicPosition.badges.map((badge, index) => (
            <div
              key={index}
              style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${badge.color || '#6366f1'}, ${badge.color || '#8b5cf6'})`
              }} />
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '12px'
              }}>
                {badge.label}
              </div>
              <div style={{
                fontSize: '32px',
                fontWeight: 900,
                color: badge.color || '#0f172a',
                letterSpacing: '-1px'
              }}>
                {badge.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Position Summary - Premium Card */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 50%, #3b7cb3 100%)',
        borderRadius: '16px',
        padding: '28px 32px',
        marginBottom: '24px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-30%',
          right: '-10%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            📍
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700 }}>Position Summary</div>
        </div>
        <div style={{
          fontSize: '14px',
          lineHeight: 1.8,
          opacity: 0.95,
          position: 'relative',
          zIndex: 1
        }}>
          {strategicPosition.positionSummary}
        </div>
      </div>

      {/* Key Focus Areas - Premium List */}
      {strategicPosition.keyFocusAreas && strategicPosition.keyFocusAreas.length > 0 && (
        <div style={{
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
                Key Focus Areas for Improvement
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Prioritized recommendations to enhance visibility
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {strategicPosition.keyFocusAreas.map((area, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  padding: '18px 20px',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb'
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 700,
                  flexShrink: 0
                }}>
                  {area.rank}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                    {area.area}
                  </div>
                  {area.description && (
                    <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
                      {area.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
          border: '2px solid #86efac',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#166534',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '8px'
          }}>
            Mention Frequency
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#15803d' }}>
            {strategicPosition.mentionFrequency}
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          border: '2px solid #93c5fd',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#1e40af',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '8px'
          }}>
            Recommendation Likelihood
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#1d4ed8' }}>
            {strategicPosition.recommendationLikelihood}
          </div>
        </div>
      </div>

      {/* AI Response Position */}
      {strategicPosition.typicalPosition && (
        <div style={{
          background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #e9d5ff 100%)',
          border: '2px solid #d8b4fe',
          borderRadius: '16px',
          padding: '32px',
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#7c3aed',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '12px'
          }}>
            AI Response Position
          </div>
          <div style={{
            fontSize: '64px',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1
          }}>
            #{strategicPosition.typicalPosition}
          </div>
          <div style={{
            fontSize: '13px',
            color: '#7c3aed',
            marginTop: '12px',
            fontWeight: 500
          }}>
            Typical position when mentioned in AI responses
          </div>
        </div>
      )}

      {/* Competitor Gap */}
      {strategicPosition.competitorMentionGap && strategicPosition.competitorMentionGap !== 'Insufficient data' && (
        <div style={{
          background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
          border: '2px solid #fde047',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
            }}>
              ⚡
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#854d0e' }}>
              Competitor Mention Gap Analysis
            </div>
          </div>
          <div style={{
            fontSize: '13px',
            color: '#a16207',
            lineHeight: 1.7,
            paddingLeft: '52px'
          }}>
            {strategicPosition.competitorMentionGap}
          </div>
        </div>
      )}
    </ReportPage>
  );
}

export default StrategicPositionPage;
