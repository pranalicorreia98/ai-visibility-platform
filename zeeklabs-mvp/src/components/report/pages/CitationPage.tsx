// Report Citation Page Component
// Page 6: Premium citation opportunities and sources analysis

import React from 'react';
import { ReportMeta, CitationData } from '@/lib/report/types';
import { ReportPage } from '../ReportPage';
import { PriorityBadge } from '../shared/Badge';

interface CitationPageProps {
  meta: ReportMeta;
  citations: CitationData;
}

export function CitationPage({ meta, citations }: CitationPageProps) {
  return (
    <ReportPage
      pageNumber={6}
      totalPages={meta.totalPages}
      brandName={meta.brandName}
      period={meta.period}
      activeSection="Visibility"
      autoHeight={true}
    >
      {/* Premium Section Header */}
      <div className="report-premium-header">
        <div className="report-premium-header-content">
          <div className="report-premium-header-badge">
            <span>🔗</span> Source Analysis
          </div>
          <div className="report-premium-header-title">Citation Opportunities</div>
          <div className="report-premium-header-subtitle">
            Detailed breakdown of citation sources and opportunities to improve your brand's visibility in AI responses
          </div>
        </div>
      </div>

      {/* Citation Stats Grid - Premium */}
      <div className="report-keep-together" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* Total */}
        <div style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          borderRadius: '16px',
          padding: '24px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '80px',
            height: '80px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />
          <div style={{
            fontSize: '10px',
            fontWeight: 700,
            opacity: 0.9,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            marginBottom: '8px'
          }}>
            Total Opportunities
          </div>
          <div style={{ fontSize: '40px', fontWeight: 900, letterSpacing: '-1px' }}>
            {citations.totalOpportunities}
          </div>
        </div>

        {/* High Priority */}
        <div style={{
          background: 'white',
          border: '2px solid #fecaca',
          borderRadius: '16px',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: '#dc2626'
          }} />
          <div style={{
            fontSize: '10px',
            fontWeight: 700,
            color: '#dc2626',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            marginBottom: '8px'
          }}>
            High Priority
          </div>
          <div style={{ fontSize: '40px', fontWeight: 900, color: '#dc2626', letterSpacing: '-1px' }}>
            {citations.prioritySummary.high}
          </div>
        </div>

        {/* Medium Priority */}
        <div style={{
          background: 'white',
          border: '2px solid #fde68a',
          borderRadius: '16px',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: '#d97706'
          }} />
          <div style={{
            fontSize: '10px',
            fontWeight: 700,
            color: '#d97706',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            marginBottom: '8px'
          }}>
            Medium Priority
          </div>
          <div style={{ fontSize: '40px', fontWeight: 900, color: '#d97706', letterSpacing: '-1px' }}>
            {citations.prioritySummary.medium}
          </div>
        </div>

        {/* Low Priority */}
        <div style={{
          background: 'white',
          border: '2px solid #86efac',
          borderRadius: '16px',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: '#059669'
          }} />
          <div style={{
            fontSize: '10px',
            fontWeight: 700,
            color: '#059669',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            marginBottom: '8px'
          }}>
            Low Priority
          </div>
          <div style={{ fontSize: '40px', fontWeight: 900, color: '#059669', letterSpacing: '-1px' }}>
            {citations.prioritySummary.low}
          </div>
        </div>
      </div>

      {/* By Category - Premium */}
      {citations.byCategory && citations.byCategory.length > 0 && (
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
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              📂
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                Opportunities by Category
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Grouped by source type
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {citations.byCategory.map((cat, index) => (
              <div
                key={index}
                style={{
                  padding: '14px 20px',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  border: '1px solid #e5e7eb'
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                  {cat.category}
                </span>
                <span style={{
                  padding: '4px 12px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'white'
                }}>
                  {cat.count}
                </span>
                {cat.highPriority > 0 && (
                  <span style={{
                    padding: '4px 10px',
                    background: '#fee2e2',
                    borderRadius: '10px',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#dc2626'
                  }}>
                    {cat.highPriority} urgent
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Opportunities List - Premium */}
      {citations.opportunities && citations.opportunities.length > 0 && (
        <div style={{
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
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              📋
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                Citation Opportunities Detail
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Actionable items to improve visibility
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {citations.opportunities.map((opp, index) => (
              <div
                key={index}
                className="report-keep-together"
                style={{
                  padding: '18px 20px',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  borderRadius: '14px',
                  borderLeft: `5px solid ${
                    opp.priority === 'high' ? '#dc2626' :
                    opp.priority === 'medium' ? '#d97706' : '#059669'
                  }`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '8px',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                        {opp.source}
                      </span>
                      <PriorityBadge priority={opp.priority} />
                      <span style={{
                        padding: '3px 8px',
                        background: '#e5e7eb',
                        borderRadius: '6px',
                        fontSize: '10px',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        fontWeight: 600
                      }}>
                        {opp.category}
                      </span>
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#475569',
                      marginBottom: '10px',
                      lineHeight: 1.5
                    }}>
                      {opp.recommendation}
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        color: '#64748b'
                      }}>
                        <span style={{ fontWeight: 600 }}>Effort:</span>
                        <span style={{
                          padding: '2px 8px',
                          background: opp.effort === 'low' ? '#dcfce7' : opp.effort === 'medium' ? '#fef3c7' : '#fee2e2',
                          borderRadius: '4px',
                          color: opp.effort === 'low' ? '#166534' : opp.effort === 'medium' ? '#92400e' : '#991b1b',
                          fontWeight: 600,
                          textTransform: 'capitalize'
                        }}>
                          {opp.effort}
                        </span>
                      </span>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        color: '#64748b'
                      }}>
                        <span style={{ fontWeight: 600 }}>Status:</span>
                        <span style={{
                          padding: '2px 8px',
                          background: '#f1f5f9',
                          borderRadius: '4px',
                          fontWeight: 600
                        }}>
                          {opp.status}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
    </ReportPage>
  );
}

export default CitationPage;
