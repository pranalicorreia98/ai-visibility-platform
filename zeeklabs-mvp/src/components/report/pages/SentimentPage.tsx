// Report Sentiment Page Component
// Page 7: Premium sentiment analysis with platform breakdown

import React from 'react';
import { ReportMeta, SentimentData } from '@/lib/report/types';
import { ReportPage } from '../ReportPage';
import { PlatformSentimentRow } from '../shared/SentimentBar';

interface SentimentPageProps {
  meta: ReportMeta;
  sentiment: SentimentData;
}

export function SentimentPage({ meta, sentiment }: SentimentPageProps) {
  return (
    <ReportPage
      pageNumber={7}
      totalPages={meta.totalPages}
      brandName={meta.brandName}
      period={meta.period}
      activeSection="Sentiment"
      autoHeight={true}
    >
      {/* Premium Section Header */}
      <div className="report-premium-header" style={{
        background: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)'
      }}>
        <div className="report-premium-header-content">
          <div className="report-premium-header-badge">
            <span>💬</span> Perception Analysis
          </div>
          <div className="report-premium-header-title">Sentiment & Mentions</div>
          <div className="report-premium-header-subtitle">
            A comprehensive audit of AI-driven platform perceptions, focusing on competitive benchmarks and public discourse mapping
          </div>
        </div>
      </div>

      {/* Sentiment Score Overview */}
      <div className="report-keep-together" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* Overall Score */}
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #10b981, #34d399)'
          }} />
          <div style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '8px'
          }}>
            Overall Sentiment
          </div>
          <div style={{
            fontSize: '48px',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #059669, #10b981)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1
          }}>
            {sentiment.overallScore}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#64748b',
            marginTop: '8px'
          }}>
            {sentiment.scoreLabel}
          </div>
        </div>

        {/* Positive */}
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
            Positive
          </div>
          <div style={{
            fontSize: '40px',
            fontWeight: 900,
            color: '#15803d',
            lineHeight: 1
          }}>
            {sentiment.breakdown.positive}%
          </div>
          <div style={{
            fontSize: '12px',
            color: '#166534',
            marginTop: '8px'
          }}>
            {sentiment.breakdown.positiveCount} mentions
          </div>
        </div>

        {/* Negative */}
        <div style={{
          background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
          border: '2px solid #fecaca',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#991b1b',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '8px'
          }}>
            Negative
          </div>
          <div style={{
            fontSize: '40px',
            fontWeight: 900,
            color: '#dc2626',
            lineHeight: 1
          }}>
            {sentiment.breakdown.negative}%
          </div>
          <div style={{
            fontSize: '12px',
            color: '#991b1b',
            marginTop: '8px'
          }}>
            {sentiment.breakdown.negativeCount} mentions
          </div>
        </div>
      </div>

      {/* Two Column Layout - Premium Sentiment Drivers */}
      <div className="report-keep-together" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '24px'
      }}>
        {/* Positive Card */}
        <div style={{
          background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
          borderRadius: '16px',
          padding: '24px',
          border: '2px solid #86efac'
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
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
            }}>
              👍
            </div>
            <div style={{
              fontSize: '16px',
              fontWeight: 700,
              color: '#047857'
            }}>
              What AI Platforms Praise
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(sentiment.positiveThemes.length > 0 ? sentiment.positiveThemes : [{ theme: 'Strong technical documentation' }]).map((theme, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '14px',
                background: 'white',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  background: '#10b981',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 700,
                  flexShrink: 0
                }}>
                  ✓
                </div>
                <div style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0f172a'
                }}>
                  {theme.theme}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Negative Card */}
        <div style={{
          background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
          borderRadius: '16px',
          padding: '24px',
          border: '2px solid #fecaca'
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
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)'
            }}>
              👎
            </div>
            <div style={{
              fontSize: '16px',
              fontWeight: 700,
              color: '#b91c1c'
            }}>
              Areas for Improvement
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(sentiment.negativeThemes.length > 0 ? sentiment.negativeThemes : [{ theme: 'Limited public reviews' }]).map((theme, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '14px',
                background: 'white',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  background: '#ef4444',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 700,
                  flexShrink: 0
                }}>
                  !
                </div>
                <div style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0f172a'
                }}>
                  {theme.theme}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sentiment by Platform - Premium Card */}
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
            gap: '12px'
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
                Sentiment Analysis by Platform
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Breakdown across AI platforms
              </div>
            </div>
          </div>
          <div style={{
            padding: '8px 20px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 700,
            color: 'white',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
          }}>
            {sentiment.overallScore}/100
          </div>
        </div>
        <PlatformSentimentRow platforms={sentiment.byPlatform} />
      </div>
    </ReportPage>
  );
}

export default SentimentPage;
