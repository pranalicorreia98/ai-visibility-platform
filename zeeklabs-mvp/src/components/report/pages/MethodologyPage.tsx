// Report Methodology Page Component
// Page 11: Premium analysis methodology, data sources, certification

import React from 'react';
import { ReportMeta, MethodologyData } from '@/lib/report/types';
import { ReportPage } from '../ReportPage';

interface MethodologyPageProps {
  meta: ReportMeta;
  methodology: MethodologyData;
}

export function MethodologyPage({ meta, methodology }: MethodologyPageProps) {
  const sectionColors = [
    { bg: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', light: '#f5f3ff', border: '#c4b5fd' },
    { bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', light: '#ecfdf5', border: '#86efac' },
    { bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', light: '#fffbeb', border: '#fde68a' }
  ];

  return (
    <ReportPage
      pageNumber={11}
      totalPages={meta.totalPages}
      brandName={meta.brandName}
      period={meta.period}
      activeSection="Recommendations"
      autoHeight={true}
    >
      {/* Premium Section Header */}
      <div className="report-premium-header" style={{
        background: 'linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%)'
      }}>
        <div className="report-premium-header-content">
          <div className="report-premium-header-badge">
            <span>📋</span> Analysis Framework
          </div>
          <div className="report-premium-header-title">Methodology & Certification</div>
          <div className="report-premium-header-subtitle">
            Transparency in our analysis approach, data collection methods, and scoring methodology
          </div>
        </div>
      </div>

      {/* Methodology Sections - Premium Cards */}
      <div className="report-keep-together" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {methodology.sections.map((section, index) => {
          const colorScheme = sectionColors[index % sectionColors.length];
          return (
            <div key={index} className="report-keep-together" style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
            }}>
              {/* Card Header */}
              <div style={{
                background: colorScheme.bg,
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  margin: '0 auto 12px'
                }}>
                  {section.icon}
                </div>
                <div style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: 'white'
                }}>
                  {section.title}
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {section.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        fontSize: '12px',
                        color: '#475569',
                        lineHeight: 1.5
                      }}
                    >
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: colorScheme.bg,
                        marginTop: '5px',
                        flexShrink: 0
                      }} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Certification Badge - Premium Design */}
      {methodology.certified && (
        <div className="report-keep-together" style={{
          background: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
          borderRadius: '16px',
          padding: '24px 28px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            position: 'relative',
            zIndex: 1
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              ✓
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700 }}>Certified Analysis</div>
              <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '2px' }}>
                {methodology.certificationText}
              </div>
            </div>
          </div>
          <div style={{
            padding: '8px 20px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '1px',
            position: 'relative',
            zIndex: 1
          }}>
            VERIFIED
          </div>
        </div>
      )}

      {/* Contact Information - Premium Card */}
      <div className="report-keep-together" style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
        borderRadius: '16px',
        padding: '28px',
        marginBottom: '24px',
        textAlign: 'center',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-30%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '300px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          fontSize: '18px',
          fontWeight: 700,
          marginBottom: '8px',
          position: 'relative',
          zIndex: 1
        }}>
          Questions About This Report?
        </div>
        <div style={{
          fontSize: '14px',
          opacity: 0.8,
          marginBottom: '16px',
          position: 'relative',
          zIndex: 1
        }}>
          Contact our analytics team for detailed explanations or custom analysis
        </div>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '12px',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 28px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            borderRadius: '24px',
            fontSize: '15px',
            fontWeight: 600,
            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)'
          }}>
            <span>✉️</span> founder@zeeklabs.ai
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 28px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            borderRadius: '24px',
            fontSize: '15px',
            fontWeight: 600,
            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)'
          }}>
            <span>✉️</span> support@zeeklabs.ai
          </div>
        </div>
      </div>

      {/* Disclaimer - Premium Card */}
      <div className="report-keep-together" style={{
        background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
        border: '2px solid #fde047',
        borderRadius: '16px',
        padding: '24px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '14px'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
          }}>
            ⚠️
          </div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#854d0e' }}>
            Important Disclaimer
          </div>
        </div>
        <div style={{
          fontSize: '13px',
          color: '#a16207',
          lineHeight: 1.7,
          paddingLeft: '56px'
        }}>
          This report is generated based on AI platform analysis at the time of generation.
          AI responses may vary over time as models are updated. Scores and rankings are
          relative measurements and should be used for directional guidance. Results validated
          across multiple AI platforms including ChatGPT, Google Gemini, and Perplexity AI.
        </div>
      </div>
    </ReportPage>
  );
}

export default MethodologyPage;
