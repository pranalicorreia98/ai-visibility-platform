// Report Action Plan Page Component
// Page 10: Premium recommendations, action items, potential gains

import React from 'react';
import { ReportMeta, ActionPlanData } from '@/lib/report/types';
import { ReportPage } from '../ReportPage';

interface ActionPlanPageProps {
  meta: ReportMeta;
  actionPlan: ActionPlanData;
}

// Premium Action Column Component
function PremiumActionColumn({ category, colorScheme }: {
  category: { title: string; subtitle: string; items: Array<{ category: string; title: string; description: string }> };
  colorScheme: 'red' | 'amber' | 'purple'
}) {
  const colors = {
    red: {
      header: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
      bg: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
      border: '#fecaca',
      badge: '#dc2626'
    },
    amber: {
      header: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
      bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
      border: '#fde68a',
      badge: '#d97706'
    },
    purple: {
      header: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
      bg: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
      border: '#c4b5fd',
      badge: '#7c3aed'
    }
  };

  const scheme = colors[colorScheme];

  return (
    <div className="report-keep-together" style={{
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
    }}>
      {/* Header */}
      <div style={{
        background: scheme.header,
        padding: '16px 20px',
        color: 'white'
      }}>
        <div style={{ fontSize: '14px', fontWeight: 700 }}>{category.title}</div>
        <div style={{ fontSize: '11px', opacity: 0.9, marginTop: '2px' }}>{category.subtitle}</div>
      </div>

      {/* Items */}
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {category.items.map((item, index) => (
            <div
              key={index}
              style={{
                background: scheme.bg,
                border: `1px solid ${scheme.border}`,
                borderRadius: '12px',
                padding: '14px'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: scheme.badge,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 700,
                  flexShrink: 0
                }}>
                  ✓
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: scheme.badge,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '4px'
                  }}>
                    {item.category}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#0f172a',
                    marginBottom: '4px'
                  }}>
                    {item.title}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#64748b',
                    lineHeight: 1.4
                  }}>
                    {item.description}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ActionPlanPage({ meta, actionPlan }: ActionPlanPageProps) {
  return (
    <ReportPage
      pageNumber={10}
      totalPages={meta.totalPages}
      brandName={meta.brandName}
      period={meta.period}
      activeSection="Recommendations"
      autoHeight={true}
    >
      {/* Premium Section Header */}
      <div className="report-premium-header" style={{
        background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 50%, #0f766e 100%)'
      }}>
        <div className="report-premium-header-content">
          <div className="report-premium-header-badge">
            <span>🎯</span> Strategic Recommendations
          </div>
          <div className="report-premium-header-title">Action Plan</div>
          <div className="report-premium-header-subtitle">
            Prioritized recommendations to enhance your brand's AI visibility and competitive positioning
          </div>
        </div>
      </div>

      {/* Potential Gain Card - Premium */}
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
          gap: '32px'
        }}>
          {/* Potential Gain Value */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '56px',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1,
              letterSpacing: '-2px'
            }}>
              +{actionPlan.potentialGain}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#0d9488',
              fontWeight: 600,
              marginTop: '4px'
            }}>
              Potential Points
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '12px',
              color: '#64748b',
              marginBottom: '10px'
            }}>
              Score improvement potential for <strong style={{ color: '#0f172a' }}>{meta.brandName}</strong>
            </div>
            <div style={{
              height: '16px',
              background: '#e5e7eb',
              borderRadius: '8px',
              overflow: 'hidden',
              display: 'flex'
            }}>
              <div style={{
                width: `${(actionPlan.currentScore / actionPlan.maxScore) * 100}%`,
                background: 'linear-gradient(90deg, #475569 0%, #64748b 100%)',
                height: '100%'
              }} />
              <div style={{
                width: `${(actionPlan.potentialGain / actionPlan.maxScore) * 100}%`,
                background: 'linear-gradient(90deg, #14b8a6 0%, #0d9488 100%)',
                height: '100%'
              }} />
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '10px',
              fontSize: '12px'
            }}>
              <div>
                <span style={{ fontWeight: 700, color: '#475569' }}>{actionPlan.currentScore}</span>
                <span style={{ color: '#64748b' }}> Current</span>
              </div>
              <div>
                <span style={{ fontWeight: 700, color: '#0d9488' }}>{actionPlan.targetScore}</span>
                <span style={{ color: '#64748b' }}> Target</span>
              </div>
              <div>
                <span style={{ fontWeight: 700, color: '#94a3b8' }}>{actionPlan.maxScore}</span>
                <span style={{ color: '#64748b' }}> Max</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Columns - Premium Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px'
      }}>
        <PremiumActionColumn category={actionPlan.immediate} colorScheme="red" />
        <PremiumActionColumn category={actionPlan.shortTerm} colorScheme="amber" />
        <PremiumActionColumn category={actionPlan.longTerm} colorScheme="purple" />
      </div>

      {/* Impact Summary - Premium Insight */}
      {actionPlan.impactSummary && (
        <div className="report-premium-insight" style={{ marginTop: '24px' }}>
          <div className="report-premium-insight-header">
            <div className="report-premium-insight-icon">💡</div>
            <div className="report-premium-insight-title">Impact Summary</div>
          </div>
          <div className="report-premium-insight-text">
            {actionPlan.impactSummary}
          </div>
        </div>
      )}
    </ReportPage>
  );
}

export default ActionPlanPage;
