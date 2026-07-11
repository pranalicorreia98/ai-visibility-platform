"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface InsightIslandProps {
  title: string;
  value: number | string;
  suffix?: string;
  prefix?: string;
  description?: string;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
    label?: string;
  };
  icon?: React.ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "accent";
  size?: "sm" | "md" | "lg";
  chart?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  animate?: boolean;
  delay?: number;
}

export function InsightIsland({
  title,
  value,
  suffix,
  prefix,
  description,
  trend,
  icon,
  variant = "default",
  size = "md",
  chart,
  footer,
  className,
  animate = true,
  delay = 0,
}: InsightIslandProps) {
  const [displayValue, setDisplayValue] = useState(animate ? 0 : value);
  const [isVisible, setIsVisible] = useState(!animate);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animate) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [animate, delay]);

  useEffect(() => {
    if (!animate || typeof value !== "number") {
      setDisplayValue(value);
      return;
    }

    if (!isVisible) return;

    const duration = 1000;
    const steps = 60;
    const increment = (value as number) / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(increment * step, value as number);
      setDisplayValue(Math.round(current));

      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, animate, isVisible]);

  const variantStyles = {
    default: {
      gradient: "from-muted/50 to-transparent",
      iconBg: "bg-muted",
      iconColor: "text-foreground",
    },
    primary: {
      gradient: "from-primary/10 to-transparent",
      iconBg: "bg-primary/15",
      iconColor: "text-primary",
    },
    success: {
      gradient: "from-success/10 to-transparent",
      iconBg: "bg-success/15",
      iconColor: "text-success",
    },
    warning: {
      gradient: "from-warning/10 to-transparent",
      iconBg: "bg-warning/15",
      iconColor: "text-warning",
    },
    danger: {
      gradient: "from-destructive/10 to-transparent",
      iconBg: "bg-destructive/15",
      iconColor: "text-destructive",
    },
    accent: {
      gradient: "from-accent/10 to-transparent",
      iconBg: "bg-accent/15",
      iconColor: "text-accent",
    },
  };

  const sizeStyles = {
    sm: {
      padding: "p-4",
      titleSize: "text-xs",
      valueSize: "text-2xl",
      iconSize: "h-8 w-8",
      iconInnerSize: "h-4 w-4",
    },
    md: {
      padding: "p-5 md:p-6",
      titleSize: "text-sm",
      valueSize: "text-3xl md:text-4xl",
      iconSize: "h-10 w-10",
      iconInnerSize: "h-5 w-5",
    },
    lg: {
      padding: "p-6 md:p-8",
      titleSize: "text-sm",
      valueSize: "text-4xl md:text-5xl",
      iconSize: "h-12 w-12",
      iconInnerSize: "h-6 w-6",
    },
  };

  const styles = variantStyles[variant];
  const sizes = sizeStyles[size];

  return (
    <div
      ref={ref}
      className={cn(
        "card-island group",
        sizes.padding,
        !isVisible && animate && "opacity-0",
        isVisible && animate && "animate-in fade-in-0 slide-in-from-bottom-4 duration-500",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Gradient overlay on hover */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
          styles.gradient
        )}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header with icon and trend */}
        <div className="flex items-start justify-between mb-4">
          {icon && (
            <div
              className={cn(
                "flex items-center justify-center rounded-2xl transition-transform group-hover:scale-110",
                sizes.iconSize,
                styles.iconBg
              )}
            >
              <div className={cn(sizes.iconInnerSize, styles.iconColor)}>
                {icon}
              </div>
            </div>
          )}
          {trend && (
            <div
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold",
                trend.direction === "up" && "bg-success/10 text-success",
                trend.direction === "down" && "bg-destructive/10 text-destructive",
                trend.direction === "neutral" && "bg-muted text-muted-foreground"
              )}
            >
              {trend.direction === "up" && <TrendingUp className="h-3 w-3" />}
              {trend.direction === "down" && <TrendingDown className="h-3 w-3" />}
              {trend.direction === "neutral" && <Minus className="h-3 w-3" />}
              <span>
                {trend.direction === "up" && "+"}
                {trend.value}%
              </span>
            </div>
          )}
        </div>

        {/* Title */}
        <p className={cn("text-muted-foreground font-medium mb-1", sizes.titleSize)}>
          {title}
        </p>

        {/* Value */}
        <div className="flex items-baseline gap-1">
          {prefix && (
            <span className={cn("font-semibold text-muted-foreground", sizes.titleSize)}>
              {prefix}
            </span>
          )}
          <span className={cn("font-bold tracking-tight", sizes.valueSize)}>
            {displayValue}
          </span>
          {suffix && (
            <span className={cn("font-semibold text-muted-foreground", sizes.titleSize)}>
              {suffix}
            </span>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        )}

        {/* Chart area */}
        {chart && <div className="mt-4">{chart}</div>}

        {/* Footer */}
        {footer && <div className="mt-4 pt-4 border-t border-border/50">{footer}</div>}
      </div>
    </div>
  );
}

// Donut chart for visibility scores
interface DonutChartProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  showValue?: boolean;
  className?: string;
}

export function DonutChart({
  value,
  max = 100,
  size = 80,
  strokeWidth = 8,
  color = "var(--color-primary)",
  label,
  showValue = true,
  className,
}: DonutChartProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (animatedValue / max) * circumference;
  const offset = circumference - progress;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1s ease-out",
          }}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold">{Math.round(animatedValue)}</span>
          {label && <span className="text-[10px] text-muted-foreground">{label}</span>}
        </div>
      )}
    </div>
  );
}

// Sparkline component
interface SparklineProps {
  data: number[];
  height?: number;
  color?: string;
  className?: string;
}

export function Sparkline({ data, height = 32, color = "var(--color-primary)", className }: SparklineProps) {
  if (!data.length) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <div className={cn("flex items-end gap-px", className)} style={{ height }}>
      {data.map((value, i) => {
        const barHeight = ((value - min) / range) * 100;
        return (
          <div
            key={i}
            className="flex-1 rounded-t transition-all duration-300"
            style={{
              height: `${Math.max(barHeight, 10)}%`,
              backgroundColor: color,
              opacity: 0.3 + (barHeight / 100) * 0.7,
              animationDelay: `${i * 50}ms`,
            }}
          />
        );
      })}
    </div>
  );
}

// Radial gauge for scores
interface RadialGaugeProps {
  value: number;
  max?: number;
  size?: number;
  label?: string;
  sublabel?: string;
  className?: string;
}

export function RadialGauge({
  value,
  max = 100,
  size = 120,
  label,
  sublabel,
  className,
}: RadialGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, 200);
    return () => clearTimeout(timer);
  }, [value]);

  const percentage = (animatedValue / max) * 100;
  const strokeWidth = size / 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (percentage / 100) * (circumference * 0.75);

  // Color based on value
  const getColor = () => {
    if (percentage >= 70) return "var(--color-success)";
    if (percentage >= 40) return "var(--color-warning)";
    return "var(--color-destructive)";
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform rotate-[135deg]">
        {/* Background arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          className="text-muted"
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          style={{
            transition: "stroke-dasharray 1s ease-out",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
        <span className="text-2xl font-bold">{Math.round(animatedValue)}</span>
        {label && <span className="text-xs text-muted-foreground font-medium">{label}</span>}
        {sublabel && <span className="text-[10px] text-muted-foreground">{sublabel}</span>}
      </div>
    </div>
  );
}
