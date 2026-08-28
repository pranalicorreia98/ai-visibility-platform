// Report Badge Component
// Displays status/priority badges

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'high' | 'medium' | 'low' | 'success' | 'neutral' | 'primary';
  size?: 'sm' | 'md';
}

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
}: BadgeProps) {
  const variantClasses = {
    high: 'report-badge-high',
    medium: 'report-badge-medium',
    low: 'report-badge-low',
    success: 'report-badge-success',
    neutral: 'report-badge-neutral',
    primary: 'report-badge-primary',
  };

  const sizeStyles = {
    sm: { padding: '2px 6px', fontSize: '8px' },
    md: { padding: '4px 10px', fontSize: '9px' },
  };

  return (
    <span
      className={`report-badge ${variantClasses[variant]}`}
      style={sizeStyles[size]}
    >
      {children}
    </span>
  );
}

// Priority badge
export function PriorityBadge({
  priority,
}: {
  priority: 'high' | 'medium' | 'low';
}) {
  return <Badge variant={priority}>{priority.toUpperCase()}</Badge>;
}

// Effort badge
export function EffortBadge({
  effort,
}: {
  effort: 'low' | 'medium' | 'high';
}) {
  const labels = {
    low: 'Low Effort',
    medium: 'Med Effort',
    high: 'High Effort',
  };

  return <Badge variant="neutral">{labels[effort]}</Badge>;
}

// Status badge
export function StatusBadge({
  status,
}: {
  status: 'missing' | 'partial' | 'active' | 'complete';
}) {
  const variants: Record<string, BadgeProps['variant']> = {
    missing: 'high',
    partial: 'medium',
    active: 'success',
    complete: 'success',
  };

  return <Badge variant={variants[status] || 'neutral'}>{status}</Badge>;
}

// Custom color badge
export function ColorBadge({
  label,
  value,
  bgColor,
  textColor,
}: {
  label: string;
  value: string;
  bgColor: string;
  textColor: string;
}) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        borderRadius: '10px',
        background: bgColor,
      }}
    >
      <span style={{ fontSize: '9px', color: textColor, fontWeight: 500 }}>
        {label}:
      </span>
      <span style={{ fontSize: '9px', fontWeight: 700, color: textColor }}>
        {value}
      </span>
    </div>
  );
}

// Score badge
export function ScoreBadge({
  score,
  label,
}: {
  score: number;
  label?: string;
}) {
  let variant: BadgeProps['variant'] = 'neutral';
  if (score >= 70) variant = 'success';
  else if (score >= 40) variant = 'medium';
  else variant = 'high';

  return (
    <Badge variant={variant}>
      {label ? `${label}: ` : ''}{score}
    </Badge>
  );
}

export default Badge;
