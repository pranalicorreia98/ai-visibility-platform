// Report Market Intelligence Page Component
// Page 9: Premium market trends and industry insights

import React from 'react';
import { ReportMeta, MarketIntelligenceData } from '@/lib/report/types';
import { ReportPage } from '../ReportPage';

interface MarketIntelligencePageProps {
  meta: ReportMeta;
  marketIntelligence: MarketIntelligenceData;
}

export function MarketIntelligencePage({ meta, marketIntelligence }: MarketIntelligencePageProps) {
  return (
    <ReportPage
      pageNumber={9}
      totalPages={meta.totalPages}
      brandName={meta.brandName}
      period={meta.period}
      activeSection="Competitors"
      autoHeight={true}
    >
      {/* Premium Section Header */}
      <div className="report-premium-header" style={{
        background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #6366f1 100%)'
      }}>
        <div className="report-premium-header-content">
          <div className="report-premium-header-badge">
            <span>🌐</span> Industry Analysis
          </div>
          <div className="report-premium-header-title">Market Intelligence</div>
          <div className="report-premium-header-subtitle">
            Industry benchmarks, market trends, and competitive intelligence to inform your AI visibility strategy
          </div>
        </div>
      </div>

      {/* No Data State */}
      {!marketIntelligence.hasData && (
        <div style={{
          background: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)',
          border: '2px solid #fde047',
          borderRadius: '16px',
          padding: '48px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#854d0e', marginBottom: '8px' }}>
            Market Intelligence Not Available
          </div>
          <div style={{ fontSize: '14px', color: '#a16207', maxWidth: '400px', margin: '0 auto' }}>
            {marketIntelligence.futureOutlook}
          </div>
        </div>
      )}

      {/* Market Data */}
      {marketIntelligence.hasData && (
        <>
          {/* Market Stats - Premium */}
          <div className="report-keep-together" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '24px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 50%, #3b7cb3 100%)',
              borderRadius: '16px',
              padding: '28px',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-20%',
                right: '-10%',
                width: '100px',
                height: '100px',
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
                Market Size
              </div>
              <div style={{
                fontSize: '36px',
                fontWeight: 900,
                letterSpacing: '-1px'
              }}>
                {marketIntelligence.marketSize}
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
              borderRadius: '16px',
              padding: '28px',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-20%',
                right: '-10%',
                width: '100px',
                height: '100px',
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
                Growth Rate
              </div>
              <div style={{
                fontSize: '36px',
                fontWeight: 900,
                letterSpacing: '-1px'
              }}>
                {marketIntelligence.growthRate}
              </div>
            </div>
          </div>

          {/* Industry Trends - Premium */}
          {marketIntelligence.industryTrends && marketIntelligence.industryTrends.length > 0 && (
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
                  📈
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                    Industry Trends
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Key market movements and patterns
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {marketIntelligence.industryTrends.map((trend, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '16px 20px',
                      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                      borderRadius: '12px',
                      borderLeft: '4px solid #6366f1',
                      fontSize: '13px',
                      color: '#374151',
                      lineHeight: 1.6
                    }}
                  >
                    {trend}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Future Outlook - Premium */}
          {marketIntelligence.futureOutlook && (
            <div className="report-keep-together" style={{
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              border: '2px solid #93c5fd',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px'
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
                  fontSize: '20px',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)'
                }}>
                  🔮
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e40af' }}>
                  Future Outlook
                </div>
              </div>
              <div style={{
                fontSize: '14px',
                color: '#1d4ed8',
                lineHeight: 1.7,
                paddingLeft: '56px'
              }}>
                {marketIntelligence.futureOutlook}
              </div>
            </div>
          )}

          {/* Factors - Premium Grid */}
          <div className="report-keep-together" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px'
          }}>
            {/* Macro Factors */}
            {marketIntelligence.macroFactors && marketIntelligence.macroFactors.length > 0 && (
              <div style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '6px',
                  height: '100%',
                  background: 'linear-gradient(180deg, #6366f1, #8b5cf6)'
                }} />
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '16px',
                  paddingLeft: '14px'
                }}>
                  <span style={{ fontSize: '20px' }}>🌍</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                    Macro Factors
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '14px' }}>
                  {marketIntelligence.macroFactors.map((factor, index) => (
                    <div
                      key={index}
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
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#6366f1',
                        marginTop: '6px',
                        flexShrink: 0
                      }} />
                      {factor}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Micro Factors */}
            {marketIntelligence.microFactors && marketIntelligence.microFactors.length > 0 && (
              <div style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '6px',
                  height: '100%',
                  background: 'linear-gradient(180deg, #10b981, #059669)'
                }} />
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '16px',
                  paddingLeft: '14px'
                }}>
                  <span style={{ fontSize: '20px' }}>🔬</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                    Micro Factors
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '14px' }}>
                  {marketIntelligence.microFactors.map((factor, index) => (
                    <div
                      key={index}
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
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#10b981',
                        marginTop: '6px',
                        flexShrink: 0
                      }} />
                      {factor}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </ReportPage>
  );
}

export default MarketIntelligencePage;
