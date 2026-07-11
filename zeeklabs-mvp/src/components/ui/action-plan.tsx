"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  Zap,
  Target,
  FileText,
  Link2,
  Users,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Sparkles,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { Badge } from "./badge";
import { Button } from "./button";
import { Progress } from "./progress";

interface ActionItem {
  id: string;
  title: string;
  description: string;
  category: "entity" | "content" | "authority" | "technical" | "community";
  priority: "high" | "medium" | "low";
  impact: number; // 1-100
  effort: string; // "1 hour", "2 days", etc.
  completed: boolean;
  explanation?: string;
  steps?: string[];
  resources?: { label: string; url: string }[];
}

interface ActionPlanProps {
  items: ActionItem[];
  className?: string;
  onComplete?: (id: string) => void;
  onExpand?: (id: string) => void;
}

const categoryConfig = {
  entity: {
    icon: Target,
    color: "text-primary",
    bg: "bg-primary/10",
    label: "Entity Optimization",
  },
  content: {
    icon: FileText,
    color: "text-accent",
    bg: "bg-accent/10",
    label: "Content Strategy",
  },
  authority: {
    icon: Link2,
    color: "text-success",
    bg: "bg-success/10",
    label: "Authority Building",
  },
  technical: {
    icon: Zap,
    color: "text-warning",
    bg: "bg-warning/10",
    label: "Technical SEO",
  },
  community: {
    icon: Users,
    color: "text-destructive",
    bg: "bg-destructive/10",
    label: "Community",
  },
};

const priorityConfig = {
  high: { color: "badge-danger", label: "High Priority" },
  medium: { color: "badge-warning", label: "Medium" },
  low: { color: "badge-neutral", label: "Low" },
};

export function ActionPlan({ items, className, onComplete, onExpand }: ActionPlanProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const completedCount = items.filter((i) => i.completed).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const filteredItems = items.filter((item) => {
    if (filter === "pending" && item.completed) return false;
    if (filter === "completed" && !item.completed) return false;
    if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
    return true;
  });

  // Group by priority
  const highPriority = filteredItems.filter((i) => i.priority === "high" && !i.completed);
  const mediumPriority = filteredItems.filter((i) => i.priority === "medium" && !i.completed);
  const lowPriority = filteredItems.filter((i) => i.priority === "low" && !i.completed);
  const completed = filteredItems.filter((i) => i.completed);

  const toggleExpand = (id: string) => {
    setExpandedItem(expandedItem === id ? null : id);
    onExpand?.(id);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Progress */}
      <div className="card-premium p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Action Plan</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Complete these tasks to improve your AI visibility
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="font-mono">
              {completedCount}/{totalCount} completed
            </Badge>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-semibold">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-border">
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {(["all", "pending", "completed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  filter === f
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Categories</option>
            {Object.entries(categoryConfig).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Items - Grouped by Priority */}
      <div className="space-y-6">
        {/* High Priority */}
        {highPriority.length > 0 && (
          <ActionGroup
            title="High Priority"
            subtitle="Complete these first for maximum impact"
            items={highPriority}
            expandedItem={expandedItem}
            onToggleExpand={toggleExpand}
            onComplete={onComplete}
            variant="high"
          />
        )}

        {/* Medium Priority */}
        {mediumPriority.length > 0 && (
          <ActionGroup
            title="Medium Priority"
            subtitle="Important for sustained growth"
            items={mediumPriority}
            expandedItem={expandedItem}
            onToggleExpand={toggleExpand}
            onComplete={onComplete}
            variant="medium"
          />
        )}

        {/* Low Priority */}
        {lowPriority.length > 0 && (
          <ActionGroup
            title="Low Priority"
            subtitle="Nice to have improvements"
            items={lowPriority}
            expandedItem={expandedItem}
            onToggleExpand={toggleExpand}
            onComplete={onComplete}
            variant="low"
          />
        )}

        {/* Completed */}
        {filter !== "pending" && completed.length > 0 && (
          <ActionGroup
            title="Completed"
            subtitle={`${completed.length} tasks done`}
            items={completed}
            expandedItem={expandedItem}
            onToggleExpand={toggleExpand}
            onComplete={onComplete}
            variant="completed"
          />
        )}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="card-premium p-12 text-center">
          <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-4" />
          <h3 className="font-semibold mb-1">All caught up!</h3>
          <p className="text-sm text-muted-foreground">
            {filter === "pending"
              ? "No pending tasks. Great work!"
              : "No tasks match your filters."}
          </p>
        </div>
      )}
    </div>
  );
}

// Action Group Component
interface ActionGroupProps {
  title: string;
  subtitle: string;
  items: ActionItem[];
  expandedItem: string | null;
  onToggleExpand: (id: string) => void;
  onComplete?: (id: string) => void;
  variant: "high" | "medium" | "low" | "completed";
}

function ActionGroup({
  title,
  subtitle,
  items,
  expandedItem,
  onToggleExpand,
  onComplete,
  variant,
}: ActionGroupProps) {
  const variantStyles = {
    high: "border-l-destructive",
    medium: "border-l-warning",
    low: "border-l-muted-foreground",
    completed: "border-l-success",
  };

  return (
    <div className={cn("card-premium border-l-4 overflow-hidden", variantStyles[variant])}>
      {/* Group Header */}
      <div className="px-6 py-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold">{title}</h4>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <Badge variant="outline" className="text-xs">
            {items.length} {items.length === 1 ? "task" : "tasks"}
          </Badge>
        </div>
      </div>

      {/* Items */}
      <div className="divide-y divide-border">
        {items.map((item) => (
          <ActionItemCard
            key={item.id}
            item={item}
            isExpanded={expandedItem === item.id}
            onToggleExpand={() => onToggleExpand(item.id)}
            onComplete={onComplete}
          />
        ))}
      </div>
    </div>
  );
}

// Individual Action Item Card
interface ActionItemCardProps {
  item: ActionItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onComplete?: (id: string) => void;
}

function ActionItemCard({ item, isExpanded, onToggleExpand, onComplete }: ActionItemCardProps) {
  const config = categoryConfig[item.category];
  const CategoryIcon = config.icon;

  return (
    <div className={cn("transition-colors", item.completed && "opacity-60")}>
      {/* Main Row */}
      <div
        className="px-6 py-4 flex items-center gap-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={onToggleExpand}
      >
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onComplete?.(item.id);
          }}
          className={cn(
            "h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
            item.completed
              ? "border-success bg-success text-white"
              : "border-muted-foreground/30 hover:border-primary"
          )}
        >
          {item.completed && <CheckCircle2 className="h-4 w-4" />}
        </button>

        {/* Category Icon */}
        <div className={cn("p-2 rounded-lg shrink-0", config.bg)}>
          <CategoryIcon className={cn("h-4 w-4", config.color)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={cn("font-medium", item.completed && "line-through")}>
              {item.title}
            </span>
            <Badge className={cn("text-[10px]", priorityConfig[item.priority].color)}>
              {item.priority}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
        </div>

        {/* Meta */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          {/* Impact */}
          <div className="text-center">
            <div className="flex items-center gap-1 text-success">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="text-sm font-semibold">+{item.impact}%</span>
            </div>
            <span className="text-[10px] text-muted-foreground">Impact</span>
          </div>

          {/* Effort */}
          <div className="text-center">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-sm font-medium">{item.effort}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">Effort</span>
          </div>
        </div>

        {/* Expand Arrow */}
        <div className="shrink-0">
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-6 py-4 bg-muted/20 border-t border-border">
          <div className="ml-10 space-y-4">
            {/* Explanation */}
            {item.explanation && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Why This Matters</span>
                </div>
                <p className="text-sm text-muted-foreground">{item.explanation}</p>
              </div>
            )}

            {/* Steps */}
            {item.steps && item.steps.length > 0 && (
              <div>
                <h5 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Steps to Complete
                </h5>
                <div className="space-y-2">
                  {item.steps.map((step, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border"
                    >
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">{i + 1}</span>
                      </div>
                      <span className="text-sm">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resources */}
            {item.resources && item.resources.length > 0 && (
              <div>
                <h5 className="text-sm font-semibold mb-3">Resources</h5>
                <div className="flex flex-wrap gap-2">
                  {item.resources.map((resource, i) => (
                    <a
                      key={i}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-sm transition-colors"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      {resource.label}
                      <ArrowRight className="h-3 w-3" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Action Button */}
            {!item.completed && (
              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => onComplete?.(item.id)}
                  size="sm"
                  className="bg-success hover:bg-success/90"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
