// Report Prompts Page Component
// Page 5: Premium analysis prompts summary by category

import React from 'react';
import { ReportMeta, PromptsData } from '@/lib/report/types';
import { ReportPage } from '../ReportPage';

interface PromptsPageProps {
  meta: ReportMeta;
  prompts: PromptsData;
}

// Category icons mapping
const getCategoryIcon = (category: string, index: number): string => {
  const categoryIcons: Record<string, string> = {
    'brand_discovery': '🔍',
    'Brand Discovery': '🔍',
    'competitive': '⚔️',
    'Competitive': '⚔️',
    'recommendation': '💡',
    'Recommendation': '💡',
    'industry': '🏢',
    'Industry': '🏢',
    'product': '📦',
    'Product': '📦',
    'sentiment': '💬',
    'Sentiment': '💬',
    'general': '📊',
    'General': '📊',
  };
  return categoryIcons[category] || ['🎯', '💼', '🔍', '📊', '💡', '⚔️'][index % 6];
};

// Category description mapping
const getCategoryDescription = (category: string): string => {
  const descriptions: Record<string, string> = {
    'brand_discovery': 'Prompts designed to test how AI systems recognize and describe your brand',
    'Brand Discovery': 'Prompts designed to test how AI systems recognize and describe your brand',
    'competitive': 'Analysis of your brand\'s positioning relative to competitors in AI responses',
    'Competitive': 'Analysis of your brand\'s positioning relative to competitors in AI responses',
    'recommendation': 'Testing AI recommendation behavior when users ask for product suggestions',
    'Recommendation': 'Testing AI recommendation behavior when users ask for product suggestions',
    'industry': 'Industry-specific queries to understand sector visibility',
    'Industry': 'Industry-specific queries to understand sector visibility',
    'product': 'Product and feature-related visibility assessment',
    'Product': 'Product and feature-related visibility assessment',
    'sentiment': 'Understanding how AI systems perceive and describe brand sentiment',
    'Sentiment': 'Understanding how AI systems perceive and describe brand sentiment',
    'general': 'General visibility and awareness testing across AI platforms',
    'General': 'General visibility and awareness testing across AI platforms',
  };
  return descriptions[category] || 'Strategic prompts to assess AI visibility in this category';
};

export function PromptsPage({ meta, prompts }: PromptsPageProps) {
  // Calculate total prompts across all categories
  const totalPromptsInCategories = prompts.byCategory.reduce((sum, cat) => sum + cat.prompts.length, 0);

  return (
    <ReportPage
      pageNumber={5}
      totalPages={meta.totalPages}
      brandName={meta.brandName}
      period={meta.period}
      activeSection="Visibility"
      autoHeight={true}
    >
      {/* Premium Section Header */}
      <div className="report-premium-header" style={{
        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)'
      }}>
        <div className="report-premium-header-content">
          <div className="report-premium-header-badge">
            <span>💬</span> Analysis Methodology
          </div>
          <div className="report-premium-header-title">Analysis Prompts</div>
          <div className="report-premium-header-subtitle">
            Strategic prompt categories used to evaluate {meta.brandName}'s AI visibility
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="report-premium-stats" style={{ marginBottom: '24px' }}>
        <div className="report-premium-stat">
          <div className="report-premium-stat-value">{prompts.totalPrompts}</div>
          <div className="report-premium-stat-label">Total Prompts</div>
        </div>
        <div className="report-premium-stat">
          <div className="report-premium-stat-value">{prompts.byCategory.length}</div>
          <div className="report-premium-stat-label">Categories</div>
        </div>
        <div className="report-premium-stat">
          <div className="report-premium-stat-value">3</div>
          <div className="report-premium-stat-label">AI Platforms</div>
        </div>
        <div className="report-premium-stat">
          <div className="report-premium-stat-value">{Math.round(totalPromptsInCategories / Math.max(1, prompts.byCategory.length))}</div>
          <div className="report-premium-stat-label">Avg per Category</div>
        </div>
      </div>

      {/* Category Summary Cards */}
      {prompts.byCategory && prompts.byCategory.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {prompts.byCategory.map((category, catIndex) => (
            <div
              key={catIndex}
              className="report-keep-together"
              style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Category Header with colored top border */}
              <div style={{
                borderTop: `4px solid ${category.color || '#6366f1'}`,
                padding: '20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px'
              }}>
                {/* Icon */}
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  background: `linear-gradient(135deg, ${category.color || '#6366f1'}15 0%, ${category.color || '#6366f1'}25 100%)`,
                  border: `2px solid ${category.color || '#6366f1'}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  flexShrink: 0
                }}>
                  {getCategoryIcon(category.category, catIndex)}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: '#0f172a'
                    }}>
                      {category.category}
                    </div>
                    <div style={{
                      padding: '6px 14px',
                      background: `linear-gradient(135deg, ${category.color || '#6366f1'} 0%, ${category.color || '#6366f1'}cc 100%)`,
                      color: 'white',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 700,
                      boxShadow: `0 4px 12px ${category.color || '#6366f1'}40`
                    }}>
                      {category.prompts.length} prompts
                    </div>
                  </div>

                  <div style={{
                    fontSize: '12px',
                    color: '#64748b',
                    lineHeight: 1.6
                  }}>
                    {getCategoryDescription(category.category)}
                  </div>
                </div>
              </div>

              {/* Sample Prompt Preview */}
              {category.prompts.length > 0 && (
                <div style={{
                  padding: '0 20px 20px 20px',
                  marginTop: 'auto'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    borderLeft: `3px solid ${category.color || '#6366f1'}`
                  }}>
                    <div style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: category.color || '#6366f1',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '6px'
                    }}>
                      Sample Prompt
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#374151',
                      fontStyle: 'italic',
                      lineHeight: 1.5
                    }}>
                      "{category.prompts[0]?.prompt}"
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Methodology Note */}
      <div className="report-premium-insight">
        <div className="report-premium-insight-header">
          <div className="report-premium-insight-icon">📋</div>
          <div className="report-premium-insight-title">Prompt Methodology</div>
        </div>
        <div className="report-premium-insight-text">
          Each prompt category is designed to test specific aspects of AI visibility. Prompts are sent to ChatGPT,
          Google Gemini, and Perplexity AI to measure brand recognition, recommendation likelihood, competitive
          positioning, and sentiment across different query types. The diversity of prompts ensures comprehensive
          coverage of how users might discover {meta.brandName} through AI-powered search and recommendations.
        </div>
      </div>

      {/* Prompt Distribution Visual */}
      {prompts.byCategory && prompts.byCategory.length > 0 && (
        <div className="report-keep-together" style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          padding: '20px',
          marginTop: '24px'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 700,
            color: '#0f172a',
            marginBottom: '16px'
          }}>
            Prompt Distribution by Category
          </div>
          <div style={{
            display: 'flex',
            height: '24px',
            borderRadius: '12px',
            overflow: 'hidden',
            background: '#f1f5f9'
          }}>
            {prompts.byCategory.map((category, idx) => {
              const percentage = (category.prompts.length / Math.max(1, totalPromptsInCategories)) * 100;
              return (
                <div
                  key={idx}
                  style={{
                    width: `${percentage}%`,
                    background: category.color || '#6366f1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                  title={`${category.category}: ${category.prompts.length} prompts`}
                >
                  {percentage > 15 && (
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: 'white'
                    }}>
                      {Math.round(percentage)}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          {/* Legend */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            marginTop: '12px'
          }}>
            {prompts.byCategory.map((category, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '3px',
                  background: category.color || '#6366f1'
                }} />
                <span style={{
                  fontSize: '11px',
                  color: '#64748b'
                }}>
                  {category.category} ({category.prompts.length})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Prompts State */}
      {(!prompts.byCategory || prompts.byCategory.length === 0) && (
        <div style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          border: '2px solid #e5e7eb',
          borderRadius: '16px',
          padding: '48px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
          <div style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#374151',
            marginBottom: '8px'
          }}>
            No Prompts Available
          </div>
          <div style={{
            fontSize: '14px',
            color: '#6b7280',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            Run an analysis to see the prompts used for visibility testing across AI platforms.
          </div>
        </div>
      )}
    </ReportPage>
  );
}

export default PromptsPage;
