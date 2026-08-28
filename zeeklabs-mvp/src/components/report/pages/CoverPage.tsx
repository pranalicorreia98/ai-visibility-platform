// Report Cover Page Component
// Page 1: Premium executive cover matching reference design

import React from 'react';
import { ReportMeta, ExecutiveSummaryData } from '@/lib/report/types';
import { getScoreColor, getScoreLabel } from '@/lib/report/constants';
import { ReportCoverPage } from '../ReportPage';

// ZeekLabs Logo SVG
const ZeekLabsLogo = () => (
  <svg viewBox="0 0 200 45" width="200" height="45">
    <defs>
      <linearGradient id="coverLogoGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#64748b" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
      <linearGradient id="coverLogoGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="50%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
    </defs>
    <g transform="translate(0, 2)">
      <path d="M5 12 L20 2 L20 8 L12 14 L20 14 L20 22 L8 22 L16 32 L20 32 L20 42 L5 32 L5 26 L12 32 L5 22 L5 12 Z" fill="url(#coverLogoGrad1)" />
      <path d="M35 38 L20 48 L20 42 L28 36 L20 36 L20 28 L32 28 L24 18 L20 18 L20 8 L35 18 L35 24 L28 18 L35 28 L35 38 Z" fill="url(#coverLogoGrad2)" />
    </g>
    <text x="48" y="30" fontFamily="Inter, system-ui, sans-serif" fontSize="26" fontWeight="800" fill="#0f172a">
      Zeek<tspan fill="#64748b">Labs</tspan><tspan fontSize="14" fill="#8b5cf6">.ai</tspan>
    </text>
  </svg>
);

// ChatGPT Logo
const ChatGPTLogo = () => (
  <div style={{
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: '#10a37f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    <svg viewBox="0 0 24 24" width="26" height="26">
      <path fill="white" d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
    </svg>
  </div>
);

// Gemini Logo - Google's official 4-point star
const GeminiLogo = () => (
  <div style={{
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #1a73e8 0%, #8e44ad 50%, #ea4335 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    <svg viewBox="0 0 28 28" width="24" height="24">
      {/* Gemini 4-point sparkle star */}
      <path fill="white" d="M14 0C14 7.732 7.732 14 0 14C7.732 14 14 20.268 14 28C14 20.268 20.268 14 28 14C20.268 14 14 7.732 14 0Z"/>
    </svg>
  </div>
);

// Perplexity Logo - Teal circle with abstract shape
const PerplexityLogo = () => (
  <div style={{
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: '#1a1a2e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    <svg viewBox="0 0 24 24" width="26" height="26">
      {/* Perplexity teal circle logo */}
      <circle cx="12" cy="12" r="10" fill="#20d5d2"/>
      {/* Abstract geometric shape inside */}
      <path fill="#1a1a2e" d="M12 6L8 10h3v4H8l4 4 4-4h-3v-4h3L12 6z"/>
    </svg>
  </div>
);

interface CoverPageProps {
  meta: ReportMeta;
  executive: ExecutiveSummaryData;
}

export function CoverPage({ meta, executive }: CoverPageProps) {
  const scoreColor = getScoreColor(executive.overallScore);
  const scoreLabel = getScoreLabel(executive.overallScore);
  const currentYear = new Date().getFullYear();

  return (
    <ReportCoverPage>
      <div style={{
        width: '100%',
        height: '100%',
        background: '#fafafa',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '32px 40px',
        boxSizing: 'border-box',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>

        {/* Background grid pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          pointerEvents: 'none'
        }} />

        {/* ZeekLabs Logo - Top */}
        <div style={{ marginBottom: '28px', zIndex: 1 }}>
          <ZeekLabsLogo />
        </div>

        {/* Report Type Badge */}
        <div style={{
          background: 'linear-gradient(135deg, #9333ea 0%, #c026d3 100%)',
          color: 'white',
          padding: '12px 28px',
          borderRadius: '28px',
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(147, 51, 234, 0.35)',
          zIndex: 1
        }}>
          AI-Powered Visibility Intelligence Report
        </div>

        {/* Main Title - Premium Gradient Typography */}
        <div style={{
          textAlign: 'center',
          zIndex: 1,
          marginBottom: '12px'
        }}>
          <div style={{
            fontSize: '15px',
            fontWeight: 600,
            color: '#64748b',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            marginBottom: '12px'
          }}>
            Comprehensive Analysis Report
          </div>
          <div style={{
            fontSize: '46px',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #0f172a 0%, #334155 40%, #6366f1 70%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-2px',
            lineHeight: 1.1,
            position: 'relative'
          }}>
            Brand Performance
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            marginTop: '4px'
          }}>
            <div style={{
              width: '40px',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #6366f1)'
            }} />
            <div style={{
              fontSize: '28px',
              fontWeight: 300,
              color: '#64748b',
              letterSpacing: '6px',
              textTransform: 'uppercase'
            }}>
              &
            </div>
            <div style={{
              width: '40px',
              height: '2px',
              background: 'linear-gradient(90deg, #8b5cf6, transparent)'
            }} />
          </div>
          <div style={{
            fontSize: '46px',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-2px',
            lineHeight: 1.1
          }}>
            AI Visibility Analysis
          </div>
        </div>

        {/* Subtitle */}
        <div style={{
          fontSize: '15px',
          color: '#64748b',
          marginBottom: '32px',
          textAlign: 'center',
          zIndex: 1,
          fontStyle: 'italic',
          maxWidth: '450px',
          lineHeight: 1.5
        }}>
          Strategic insights derived from multi-platform AI response analysis
        </div>

        {/* Brand Card */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px 48px',
          marginBottom: '24px',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          zIndex: 1
        }}>
          {/* Brand Logo - Load from URL or show fallback */}
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '16px',
            background: meta.brandLogo ? 'white' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: meta.brandLogo ? '2px solid #e2e8f0' : 'none',
            overflow: 'hidden'
          }}>
            {meta.brandLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={meta.brandLogo}
                alt={`${meta.brandName} logo`}
                style={{
                  width: '48px',
                  height: '48px',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <span style={{
                fontSize: '32px',
                fontWeight: 800,
                color: 'white'
              }}>
                {meta.brandName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div>
            <div style={{
              fontSize: '36px',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-1px',
              lineHeight: 1.1
            }}>
              {meta.brandName}
            </div>
            {meta.brandDomain && (
              <div style={{ fontSize: '15px', color: '#64748b', marginTop: '4px' }}>
                {meta.brandDomain}
              </div>
            )}
          </div>
        </div>

        {/* Score Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px 40px',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '36px',
          zIndex: 1
        }}>
          <div style={{
            fontSize: '64px',
            fontWeight: 800,
            color: scoreColor,
            letterSpacing: '-3px',
            lineHeight: 1
          }}>
            {executive.overallScore}
          </div>
          <div>
            <div style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#0f172a',
              marginBottom: '2px'
            }}>
              {scoreLabel} Performance,
            </div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>
              AI Visibility Score (0-100)
            </div>
          </div>
        </div>

        {/* AI Platforms Section - Only 3 LLMs used */}
        <div style={{
          width: '100%',
          maxWidth: '500px',
          zIndex: 1
        }}>
          {/* Divider with text */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#64748b',
              letterSpacing: '1.5px',
              textTransform: 'uppercase'
            }}>
              AI Platforms Analyzed
            </div>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          </div>

          {/* Platform Logos - Only ChatGPT, Gemini, Perplexity */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '40px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ChatGPTLogo />
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>ChatGPT</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <GeminiLogo />
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>Gemini</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <PerplexityLogo />
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>Perplexity</span>
            </div>
          </div>
        </div>

        {/* Spacer to push footer down */}
        <div style={{ flex: 1, minHeight: '20px' }} />

        {/* Footer - positioned at bottom using flexbox instead of absolute */}
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 1,
          marginTop: 'auto',
          paddingTop: '20px',
          borderTop: '1px solid #e2e8f0'
        }}>
          {/* Copyright */}
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            © {currentYear} ZeekLabs.ai — AI Visibility Intelligence Platform
          </div>

          {/* Meta info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              <span style={{ fontWeight: 700, color: '#475569' }}>REPORT DATE:</span> {meta.reportDate}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              <span style={{ fontWeight: 700, color: '#475569' }}>ANALYSIS PERIOD:</span> {meta.period}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              <span style={{ fontWeight: 700, color: '#475569' }}>TOTAL PAGES:</span> {meta.totalPages}
            </div>

            {/* Confidential Badge */}
            {meta.confidential && (
              <div style={{
                background: '#dc2626',
                color: 'white',
                padding: '6px 14px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
              }}>
                Confidential — For Internal Use Only
              </div>
            )}
          </div>
        </div>
      </div>
    </ReportCoverPage>
  );
}

export default CoverPage;
