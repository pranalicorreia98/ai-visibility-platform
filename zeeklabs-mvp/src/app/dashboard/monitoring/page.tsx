"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageSquare,
  Filter,
  Calendar,
  Activity,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Hash,
  X,
  RefreshCw,
  Clock,
  Settings2,
  Plus,
  Trash2,
  Play,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Loader2,
} from "lucide-react";
import { useBrand } from "@/contexts/brand-context";

interface MonitoringConfig {
  id: string;
  brandId: string;
  enabled: boolean;
  frequency: string;
  prompts: string[];
  lastRunAt: string | null;
  nextRunAt: string | null;
}

const FREQUENCY_OPTIONS = [
  { value: "hourly", label: "Every Hour", description: "24 checks per day" },
  { value: "every6hours", label: "Every 6 Hours", description: "4 checks per day" },
  { value: "every12hours", label: "Every 12 Hours", description: "2 checks per day" },
  { value: "daily", label: "Daily", description: "Once per day" },
  { value: "weekly", label: "Weekly", description: "Once per week" },
];

export default function MonitoringPage() {
  const {
    selectedBrandId,
    selectedBrand,
    recentMentions,
    loading,
    visibilityLoading,
    refreshData,
  } = useBrand();

  const [systemFilter, setSystemFilter] = useState<string>("all");
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");

  // Monitoring config state
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState<MonitoringConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(false);
  const [newPrompt, setNewPrompt] = useState("");
  const [saving, setSaving] = useState(false);

  // Report generation state
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportData, setReportData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (selectedBrandId) {
      fetchConfig();
    }
  }, [selectedBrandId]);

  const fetchConfig = async () => {
    if (!selectedBrandId) return;

    setConfigLoading(true);
    try {
      const response = await fetch(`/api/monitoring/config?brandId=${selectedBrandId}`);
      if (response.ok) {
        const data = await response.json();
        setConfig(data.config);
      }
    } catch (err) {
      console.error("Failed to fetch config:", err);
    } finally {
      setConfigLoading(false);
    }
  };

  const saveConfig = async (updates: Partial<MonitoringConfig>) => {
    if (!selectedBrandId) return;

    setSaving(true);
    try {
      const response = await fetch("/api/monitoring/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId: selectedBrandId,
          ...updates,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setConfig(data.config);
      }
    } catch (err) {
      console.error("Failed to save config:", err);
    } finally {
      setSaving(false);
    }
  };

  const addPrompt = () => {
    if (!newPrompt.trim() || !config) return;
    const updatedPrompts = [...config.prompts, newPrompt.trim()];
    saveConfig({ prompts: updatedPrompts });
    setNewPrompt("");
  };

  const removePrompt = (index: number) => {
    if (!config) return;
    const updatedPrompts = config.prompts.filter((_, i) => i !== index);
    saveConfig({ prompts: updatedPrompts });
  };

  const generateReport = async () => {
    if (!selectedBrandId) return;

    setGeneratingReport(true);
    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId: selectedBrandId }),
      });

      if (response.ok) {
        const data = await response.json();
        setReportData(data.report);
        downloadReportAsPDF(data.report);
      }
    } catch (err) {
      console.error("Failed to generate report:", err);
    } finally {
      setGeneratingReport(false);
    }
  };

  const downloadReportAsPDF = (report: Record<string, unknown>) => {
    // Create a professional HTML report matching the Reports page style
    const metrics = report.metrics as Record<string, unknown>;
    const sentiment = metrics.sentiment as Record<string, number>;
    const brand = report.brand as Record<string, string>;
    const recentMentionsList = report.recentMentions as Array<Record<string, unknown>>;
    const recommendationsList = report.recommendations as Array<Record<string, unknown>>;
    const competitorsList = (report.competitors as Array<Record<string, string>>) || [];

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>AI Visibility Report - ${brand.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #fff;
      color: #1a1a2e;
      line-height: 1.6;
    }
    .container { max-width: 900px; margin: 0 auto; padding: 40px; }

    /* Header */
    .header {
      text-align: center;
      padding: 40px 0;
      border-bottom: 3px solid #6366f1;
      margin-bottom: 40px;
    }
    .logo { font-size: 28px; font-weight: 800; color: #6366f1; margin-bottom: 8px; }
    .subtitle { color: #666; font-size: 14px; }

    /* Brand Info */
    .brand-section {
      display: flex;
      align-items: flex-start;
      gap: 40px;
      margin-bottom: 40px;
      padding: 30px;
      background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
      border-radius: 16px;
      border: 1px solid #e5e7eb;
    }
    .score-circle {
      width: 140px;
      height: 140px;
      border-radius: 50%;
      background: conic-gradient(
        ${(metrics.visibilityScore as number) >= 70 ? '#22c55e' : (metrics.visibilityScore as number) >= 40 ? '#f59e0b' : '#ef4444'} ${(metrics.visibilityScore as number) * 3.6}deg,
        #e5e7eb ${(metrics.visibilityScore as number) * 3.6}deg
      );
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .score-inner {
      width: 110px;
      height: 110px;
      border-radius: 50%;
      background: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .score-value { font-size: 36px; font-weight: 800; color: #1a1a2e; }
    .score-label { font-size: 12px; color: #666; }

    .brand-info { flex: 1; }
    .brand-name { font-size: 24px; font-weight: 700; margin-bottom: 16px; }
    .brand-meta { display: flex; flex-direction: column; gap: 8px; font-size: 14px; color: #666; }
    .brand-meta-item { display: flex; align-items: center; gap: 8px; }

    /* Grid Layout */
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-bottom: 40px; }
    .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 40px; }

    /* Cards */
    .card {
      background: white;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      padding: 24px;
    }
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .card-title { font-size: 16px; font-weight: 600; color: #1a1a2e; }
    .card-score {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      color: white;
    }
    .score-green { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); }
    .score-orange { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
    .score-red { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }

    /* AI Models */
    .ai-model {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .ai-model:last-child { border-bottom: none; }
    .ai-model-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: #f3f4f6;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
    }
    .ai-model-status { margin-left: auto; font-weight: 600; }
    .status-yes { color: #22c55e; }
    .status-no { color: #ef4444; }

    /* Progress Bars */
    .progress-item { margin-bottom: 16px; }
    .progress-label {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      font-size: 14px;
    }
    .progress-bar {
      height: 8px;
      background: #f3f4f6;
      border-radius: 4px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
    }
    .progress-green { background: linear-gradient(90deg, #22c55e, #16a34a); }
    .progress-orange { background: linear-gradient(90deg, #f59e0b, #d97706); }
    .progress-red { background: linear-gradient(90deg, #ef4444, #dc2626); }

    /* Competitors */
    .competitor-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
    .competitor-tag {
      padding: 6px 12px;
      background: #f3f4f6;
      border-radius: 20px;
      font-size: 13px;
      color: #666;
    }

    /* Recommendations */
    .recommendation {
      padding: 16px;
      background: #f8f9ff;
      border-radius: 8px;
      margin-bottom: 12px;
      border-left: 4px solid #6366f1;
    }
    .recommendation-title { font-weight: 600; margin-bottom: 4px; }
    .recommendation-desc { font-size: 14px; color: #666; }
    .recommendation-badge {
      display: inline-block;
      padding: 2px 8px;
      background: #6366f1;
      color: white;
      border-radius: 4px;
      font-size: 11px;
      margin-top: 8px;
    }

    /* Recent Mentions */
    .mention {
      padding: 16px;
      background: #fafafa;
      border-radius: 8px;
      margin-bottom: 12px;
    }
    .mention-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    .mention-ai {
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }
    .mention-chatgpt { background: #d1fae5; color: #065f46; }
    .mention-gemini { background: #dbeafe; color: #1e40af; }
    .mention-text { font-size: 14px; color: #444; line-height: 1.5; }
    .mention-meta { font-size: 12px; color: #888; margin-top: 8px; }

    /* Footer */
    .footer {
      text-align: center;
      padding: 40px 0;
      border-top: 1px solid #e5e7eb;
      margin-top: 40px;
      color: #888;
      font-size: 13px;
    }
    .footer-logo { font-weight: 700; color: #6366f1; margin-bottom: 8px; }

    /* Section Title */
    .section-title {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 20px;
      color: #1a1a2e;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .section-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: #6366f1;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .container { max-width: 100%; padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="logo">ZeekLabs.ai</div>
      <div class="subtitle">AI Visibility Analysis Report</div>
    </div>

    <!-- Brand Section with Score -->
    <div class="brand-section">
      <div class="score-circle">
        <div class="score-inner">
          <div class="score-value">${metrics.visibilityScore}</div>
          <div class="score-label">/100</div>
        </div>
      </div>
      <div class="brand-info">
        <div class="brand-name">${brand.name}</div>
        <div class="brand-meta">
          <div class="brand-meta-item">📅 Report Date: ${report.reportDate}</div>
          <div class="brand-meta-item">🌐 ${brand.domain || "Not specified"}</div>
          <div class="brand-meta-item">📊 Period: ${report.period}</div>
          <div class="brand-meta-item">🔬 Simulations Run: ${metrics.simulationsRun}</div>
        </div>
      </div>
    </div>

    <!-- Metrics Grid -->
    <div class="grid">
      <!-- AI Presence -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">AI Presence</div>
          <div class="card-score ${(metrics.visibilityScore as number) >= 70 ? 'score-green' : (metrics.visibilityScore as number) >= 40 ? 'score-orange' : 'score-red'}">
            ${metrics.visibilityScore}
          </div>
        </div>
        <div class="ai-model">
          <div class="ai-model-icon">GPT</div>
          <span>ChatGPT</span>
          <span class="ai-model-status ${(metrics.chatgptMentions as number) > 0 ? 'status-yes' : 'status-no'}">
            ${(metrics.chatgptMentions as number) > 0 ? '✓ ' + metrics.chatgptScore : '✗ 0'}
          </span>
        </div>
        <div class="ai-model">
          <div class="ai-model-icon">G</div>
          <span>Gemini</span>
          <span class="ai-model-status ${(metrics.geminiMentions as number) > 0 ? 'status-yes' : 'status-no'}">
            ${(metrics.geminiMentions as number) > 0 ? '✓ ' + metrics.geminiScore : '✗ 0'}
          </span>
        </div>
      </div>

      <!-- Sentiment Analysis -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Sentiment Analysis</div>
          <div class="card-score ${sentiment.average > 20 ? 'score-green' : sentiment.average > -20 ? 'score-orange' : 'score-red'}">
            ${sentiment.average > 0 ? '+' : ''}${sentiment.average}%
          </div>
        </div>
        <div class="progress-item">
          <div class="progress-label">
            <span>Positive</span>
            <span>${sentiment.positive}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill progress-green" style="width: ${(metrics.totalMentions as number) > 0 ? (sentiment.positive / (metrics.totalMentions as number)) * 100 : 0}%"></div>
          </div>
        </div>
        <div class="progress-item">
          <div class="progress-label">
            <span>Neutral</span>
            <span>${sentiment.neutral}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill progress-orange" style="width: ${(metrics.totalMentions as number) > 0 ? (sentiment.neutral / (metrics.totalMentions as number)) * 100 : 0}%"></div>
          </div>
        </div>
        <div class="progress-item">
          <div class="progress-label">
            <span>Negative</span>
            <span>${sentiment.negative}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill progress-red" style="width: ${(metrics.totalMentions as number) > 0 ? (sentiment.negative / (metrics.totalMentions as number)) * 100 : 0}%"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Key Metrics -->
    <div class="grid-3">
      <div class="card" style="text-align: center;">
        <div style="font-size: 32px; font-weight: 700; color: #6366f1;">${metrics.totalMentions}</div>
        <div style="color: #666; font-size: 14px;">Total Mentions</div>
      </div>
      <div class="card" style="text-align: center;">
        <div style="font-size: 32px; font-weight: 700; color: #22c55e;">${metrics.chatgptMentions}</div>
        <div style="color: #666; font-size: 14px;">ChatGPT Mentions</div>
      </div>
      <div class="card" style="text-align: center;">
        <div style="font-size: 32px; font-weight: 700; color: #3b82f6;">${metrics.geminiMentions}</div>
        <div style="color: #666; font-size: 14px;">Gemini Mentions</div>
      </div>
    </div>

    <!-- Competitor Landscape -->
    ${competitorsList.length > 0 ? `
    <div class="card" style="margin-bottom: 24px;">
      <div class="card-header">
        <div class="card-title">Competitor Landscape</div>
      </div>
      <p style="color: #666; font-size: 14px;">Competitors being tracked for comparison:</p>
      <div class="competitor-list">
        ${competitorsList.map(c => `<span class="competitor-tag">${c.name}</span>`).join('')}
      </div>
    </div>
    ` : ''}

    <!-- Score Breakdown -->
    ${(metrics as Record<string, unknown>).scoreBreakdown ? `
    <div class="section-title">
      <div class="section-icon">📊</div>
      Score Breakdown
    </div>
    <div class="grid-3" style="margin-bottom: 30px;">
      <div class="card" style="text-align: center; background: #f0fdf4;">
        <div style="font-size: 28px; font-weight: 700; color: #6366f1;">${((metrics as Record<string, unknown>).scoreBreakdown as Record<string, unknown>).presence}</div>
        <div style="color: #666; font-size: 14px;">Presence Score</div>
        <div style="color: #888; font-size: 11px;">(Weight: ${(((metrics as Record<string, unknown>).scoreBreakdown as Record<string, unknown>).weights as Record<string, number>).presence}%)</div>
      </div>
      <div class="card" style="text-align: center; background: #fef9c3;">
        <div style="font-size: 28px; font-weight: 700; color: #22c55e;">${((metrics as Record<string, unknown>).scoreBreakdown as Record<string, unknown>).sentiment}</div>
        <div style="color: #666; font-size: 14px;">Sentiment Score</div>
        <div style="color: #888; font-size: 11px;">(Weight: ${(((metrics as Record<string, unknown>).scoreBreakdown as Record<string, unknown>).weights as Record<string, number>).sentiment}%)</div>
      </div>
      <div class="card" style="text-align: center; background: #dbeafe;">
        <div style="font-size: 28px; font-weight: 700; color: #3b82f6;">${((metrics as Record<string, unknown>).scoreBreakdown as Record<string, unknown>).position}</div>
        <div style="color: #666; font-size: 14px;">Position Score</div>
        <div style="color: #888; font-size: 11px;">(Weight: ${(((metrics as Record<string, unknown>).scoreBreakdown as Record<string, unknown>).weights as Record<string, number>).position}%)</div>
      </div>
    </div>
    ` : ''}

    <!-- Position Analysis -->
    ${(metrics as Record<string, unknown>).position ? `
    <div class="section-title">
      <div class="section-icon">#</div>
      Position Analysis
    </div>
    <div class="grid" style="margin-bottom: 30px;">
      <div class="card">
        <div class="card-title" style="margin-bottom: 16px;">Average Ranking Position</div>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; justify-content: space-between; padding: 12px; background: #d1fae5; border-radius: 8px;">
            <span style="font-weight: 500;">ChatGPT</span>
            <span style="font-weight: 700; font-size: 18px;">${((metrics as Record<string, unknown>).position as Record<string, unknown>).chatgptAvg !== null ? '#' + ((metrics as Record<string, unknown>).position as Record<string, unknown>).chatgptAvg : 'N/A'}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 12px; background: #dbeafe; border-radius: 8px;">
            <span style="font-weight: 500;">Gemini</span>
            <span style="font-weight: 700; font-size: 18px;">${((metrics as Record<string, unknown>).position as Record<string, unknown>).geminiAvg !== null ? '#' + ((metrics as Record<string, unknown>).position as Record<string, unknown>).geminiAvg : 'N/A'}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 12px; background: #f3e8ff; border-radius: 8px;">
            <span style="font-weight: 500;">Overall</span>
            <span style="font-weight: 700; font-size: 18px;">${((metrics as Record<string, unknown>).position as Record<string, unknown>).overallAvg !== null ? '#' + ((metrics as Record<string, unknown>).position as Record<string, unknown>).overallAvg : 'N/A'}</span>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-title" style="margin-bottom: 16px;">Position Distribution</div>
        <div style="margin-bottom: 16px;">
          <div style="font-size: 13px; color: #666; margin-bottom: 8px;">ChatGPT Rankings</div>
          <div style="display: flex; gap: 8px;">
            <span style="padding: 4px 10px; background: #d1fae5; border-radius: 12px; font-size: 12px; color: #065f46;">Top 3: ${(((metrics as Record<string, unknown>).position as Record<string, unknown>).distribution as Record<string, Record<string, number>>).chatgpt.top3}</span>
            <span style="padding: 4px 10px; background: #fef3c7; border-radius: 12px; font-size: 12px; color: #92400e;">4-5: ${(((metrics as Record<string, unknown>).position as Record<string, unknown>).distribution as Record<string, Record<string, number>>).chatgpt.top5}</span>
            <span style="padding: 4px 10px; background: #fee2e2; border-radius: 12px; font-size: 12px; color: #991b1b;">6+: ${(((metrics as Record<string, unknown>).position as Record<string, unknown>).distribution as Record<string, Record<string, number>>).chatgpt.beyond5}</span>
          </div>
        </div>
        <div>
          <div style="font-size: 13px; color: #666; margin-bottom: 8px;">Gemini Rankings</div>
          <div style="display: flex; gap: 8px;">
            <span style="padding: 4px 10px; background: #d1fae5; border-radius: 12px; font-size: 12px; color: #065f46;">Top 3: ${(((metrics as Record<string, unknown>).position as Record<string, unknown>).distribution as Record<string, Record<string, number>>).gemini.top3}</span>
            <span style="padding: 4px 10px; background: #fef3c7; border-radius: 12px; font-size: 12px; color: #92400e;">4-5: ${(((metrics as Record<string, unknown>).position as Record<string, unknown>).distribution as Record<string, Record<string, number>>).gemini.top5}</span>
            <span style="padding: 4px 10px; background: #fee2e2; border-radius: 12px; font-size: 12px; color: #991b1b;">6+: ${(((metrics as Record<string, unknown>).position as Record<string, unknown>).distribution as Record<string, Record<string, number>>).gemini.beyond5}</span>
          </div>
        </div>
      </div>
    </div>
    ` : ''}

    <!-- Improvement Plan -->
    ${(report as Record<string, unknown>).improvementPlan ? `
    <div class="section-title">
      <div class="section-icon">📋</div>
      Improvement Plan Summary
    </div>
    <div class="grid" style="margin-bottom: 30px;">
      <div class="card">
        <div class="card-title" style="margin-bottom: 16px;">Task Status</div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
          <div style="padding: 12px; background: #d1fae5; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: #065f46;">${((report as Record<string, unknown>).improvementPlan as Record<string, unknown>).completed}</div>
            <div style="font-size: 12px; color: #666;">Completed</div>
          </div>
          <div style="padding: 12px; background: #fee2e2; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: #991b1b;">${((report as Record<string, unknown>).improvementPlan as Record<string, unknown>).highPriority}</div>
            <div style="font-size: 12px; color: #666;">High Priority</div>
          </div>
          <div style="padding: 12px; background: #fef3c7; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: #92400e;">${((report as Record<string, unknown>).improvementPlan as Record<string, unknown>).mediumPriority}</div>
            <div style="font-size: 12px; color: #666;">Medium Priority</div>
          </div>
          <div style="padding: 12px; background: #dbeafe; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: #1e40af;">${((report as Record<string, unknown>).improvementPlan as Record<string, unknown>).lowPriority}</div>
            <div style="font-size: 12px; color: #666;">Low Priority</div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-title" style="margin-bottom: 16px;">Actions by Category</div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${Object.entries(((report as Record<string, unknown>).improvementPlan as Record<string, Record<string, number>>).byCategory || {}).map(([cat, count]) => `
            <div style="display: flex; justify-content: space-between; padding: 8px 12px; background: #f3f4f6; border-radius: 6px;">
              <span style="text-transform: capitalize; font-size: 13px;">${cat}</span>
              <span style="font-weight: 600; font-size: 13px;">${count} pending</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
    ` : ''}

    <!-- Full Action Plan -->
    ${recommendationsList.length > 0 ? `
    <div class="section-title">
      <div class="section-icon">💡</div>
      Complete Action Plan
    </div>
    ${recommendationsList.map((r, idx) => `
      <div class="recommendation" style="border-left-color: ${r.priority === 'high' ? '#ef4444' : r.priority === 'medium' ? '#f59e0b' : '#6366f1'}; ${r.isCompleted ? 'opacity: 0.6;' : ''}">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
          <span style="font-size: 12px; color: #888;">#${idx + 1}</span>
          <div class="recommendation-title" style="${r.isCompleted ? 'text-decoration: line-through;' : ''}">${r.title}</div>
          ${r.isCompleted ? '<span style="color: #22c55e; font-size: 14px;">✓</span>' : ''}
        </div>
        <div class="recommendation-desc">${r.description}</div>
        <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px;">
          <span class="recommendation-badge" style="background: ${r.priority === 'high' ? '#ef4444' : r.priority === 'medium' ? '#f59e0b' : '#6366f1'};">${r.priority} priority</span>
          <span class="recommendation-badge">${r.category}</span>
          ${r.effort ? `<span style="padding: 2px 8px; background: #f3f4f6; color: #666; border-radius: 4px; font-size: 11px;">⏱ ${r.effort}</span>` : ''}
          ${r.expectedImpact ? `<span style="padding: 2px 8px; background: #d1fae5; color: #065f46; border-radius: 4px; font-size: 11px;">⚡ ${r.expectedImpact}</span>` : ''}
        </div>
        ${r.competitorGap ? `<div style="margin-top: 8px; font-size: 12px; color: #d97706;">ℹ️ ${r.competitorGap}</div>` : ''}
      </div>
    `).join('')}
    ` : ''}

    <!-- Prompts Tested / Citations -->
    ${(report as Record<string, unknown>).promptsTested && ((report as Record<string, unknown>).promptsTested as Array<Record<string, unknown>>).length > 0 ? `
    <div class="section-title" style="margin-top: 40px;">
      <div class="section-icon">📝</div>
      Prompts Tested (Citation Reference)
    </div>
    <div class="card" style="margin-bottom: 24px; overflow: hidden;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <thead>
          <tr style="background: #f3f4f6;">
            <th style="text-align: left; padding: 10px; border-bottom: 1px solid #e5e7eb;">#</th>
            <th style="text-align: left; padding: 10px; border-bottom: 1px solid #e5e7eb;">Prompt</th>
            <th style="text-align: center; padding: 10px; border-bottom: 1px solid #e5e7eb;">Mentions</th>
            <th style="text-align: center; padding: 10px; border-bottom: 1px solid #e5e7eb;">AI Systems</th>
          </tr>
        </thead>
        <tbody>
          ${((report as Record<string, unknown>).promptsTested as Array<Record<string, unknown>>).map(pt => `
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 10px; color: #888;">${pt.id}</td>
              <td style="padding: 10px;">${pt.prompt}</td>
              <td style="padding: 10px; text-align: center;">${pt.mentionCount}</td>
              <td style="padding: 10px; text-align: center;">${(pt.systems as string[]).map(s => s === 'chatgpt' ? 'GPT' : 'Gemini').join(', ')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}

    <!-- Recent Mentions with Citations -->
    ${recentMentionsList.length > 0 ? `
    <div class="section-title" style="margin-top: 40px;">
      <div class="section-icon">💬</div>
      AI Mentions with Citations
    </div>
    ${recentMentionsList.slice(0, 10).map(m => `
      <div class="mention">
        <div class="mention-header">
          <span class="mention-ai ${m.aiSystem === 'chatgpt' ? 'mention-chatgpt' : 'mention-gemini'}">
            ${m.aiSystem === 'chatgpt' ? 'ChatGPT' : 'Gemini'}
          </span>
          ${m.position ? `<span style="font-size: 12px; color: #666; background: #f3f4f6; padding: 2px 8px; border-radius: 4px;">Rank #${m.position}</span>` : ''}
          <span style="margin-left: auto; font-size: 11px; color: #888;">${new Date(m.date as string).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
        </div>
        ${m.prompt ? `
        <div style="background: #f8f9ff; padding: 10px; border-radius: 6px; margin-bottom: 10px; border-left: 2px solid #6366f1;">
          <div style="font-size: 11px; color: #888; margin-bottom: 4px;">📝 Prompt Used:</div>
          <div style="font-size: 12px; font-style: italic; color: #444;">${m.prompt}</div>
        </div>
        ` : ''}
        <div class="mention-text">${m.context || 'No context available'}</div>
        <div class="mention-meta">
          ${m.sentiment !== null ? `Sentiment: ${(m.sentiment as number) > 0.2 ? '😊 Positive' : (m.sentiment as number) < -0.2 ? '😞 Negative' : '😐 Neutral'} (${((m.sentiment as number) * 100).toFixed(0)}%)` : ''}
        </div>
      </div>
    `).join('')}
    ` : ''}

    <!-- Platform Status / Backreferences -->
    ${(report as Record<string, unknown>).backreferences && ((report as Record<string, unknown>).backreferences as Array<Record<string, unknown>>).length > 0 ? `
    <div class="section-title" style="margin-top: 40px;">
      <div class="section-icon">🔗</div>
      Platform Presence Status
    </div>
    <div class="grid-3" style="margin-bottom: 30px;">
      ${((report as Record<string, unknown>).backreferences as Array<Record<string, unknown>>).map(br => `
        <div class="card" style="padding: 16px; background: ${br.status === 'present' ? '#f0fdf4' : br.status === 'incomplete' ? '#fffbeb' : '#fef2f2'}; border-color: ${br.status === 'present' ? '#86efac' : br.status === 'incomplete' ? '#fde68a' : '#fecaca'};">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-weight: 600;">${br.platform}</span>
            <span style="padding: 2px 8px; border-radius: 12px; font-size: 11px; background: ${br.status === 'present' ? '#d1fae5' : br.status === 'incomplete' ? '#fef3c7' : '#fee2e2'}; color: ${br.status === 'present' ? '#065f46' : br.status === 'incomplete' ? '#92400e' : '#991b1b'};">${br.status}</span>
          </div>
          ${br.details ? `<div style="font-size: 12px; color: #666;">${br.details}</div>` : ''}
          ${br.competitorStatus ? `<div style="font-size: 11px; color: #d97706; margin-top: 4px;">${br.competitorStatus}</div>` : ''}
          <div style="display: flex; gap: 6px; margin-top: 8px;">
            <span style="padding: 2px 6px; background: #f3f4f6; border-radius: 4px; font-size: 10px; text-transform: capitalize;">${br.tier}</span>
            <span style="padding: 2px 6px; background: ${br.priority === 'high' ? '#fee2e2' : '#f3f4f6'}; border-radius: 4px; font-size: 10px; color: ${br.priority === 'high' ? '#991b1b' : '#666'};">${br.priority}</span>
          </div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <!-- Methodology -->
    ${(report as Record<string, unknown>).methodology ? `
    <div class="section-title" style="margin-top: 40px;">
      <div class="section-icon">📖</div>
      Methodology & Data Sources
    </div>
    <div class="card" style="background: #f8fafc; margin-bottom: 30px;">
      <div class="grid">
        <div>
          <div style="margin-bottom: 16px;">
            <div style="font-size: 11px; color: #888; text-transform: uppercase; margin-bottom: 4px;">Data Period</div>
            <div style="font-size: 14px; font-weight: 500;">${((report as Record<string, unknown>).methodology as Record<string, unknown>).dataPeriod}</div>
          </div>
          <div style="margin-bottom: 16px;">
            <div style="font-size: 11px; color: #888; text-transform: uppercase; margin-bottom: 4px;">Collection Method</div>
            <div style="font-size: 14px; font-weight: 500;">${((report as Record<string, unknown>).methodology as Record<string, unknown>).dataCollectionMethod}</div>
          </div>
          <div>
            <div style="font-size: 11px; color: #888; text-transform: uppercase; margin-bottom: 4px;">AI Systems Tested</div>
            <div style="font-size: 14px; font-weight: 500;">${(((report as Record<string, unknown>).methodology as Record<string, unknown>).aiSystemsTested as string[]).join(', ')}</div>
          </div>
        </div>
        <div>
          <div style="margin-bottom: 16px;">
            <div style="font-size: 11px; color: #888; text-transform: uppercase; margin-bottom: 4px;">Scoring Formula</div>
            <div style="font-size: 14px; font-weight: 500;">${((report as Record<string, unknown>).methodology as Record<string, unknown>).scoringFormula}</div>
          </div>
          <div style="margin-bottom: 16px;">
            <div style="font-size: 11px; color: #888; text-transform: uppercase; margin-bottom: 4px;">Sentiment Analysis</div>
            <div style="font-size: 14px; font-weight: 500;">${((report as Record<string, unknown>).methodology as Record<string, unknown>).sentimentAnalysis}</div>
          </div>
          <div>
            <div style="font-size: 11px; color: #888; text-transform: uppercase; margin-bottom: 4px;">Position Tracking</div>
            <div style="font-size: 14px; font-weight: 500;">${((report as Record<string, unknown>).methodology as Record<string, unknown>).positionTracking}</div>
          </div>
        </div>
      </div>
    </div>
    ` : ''}

    <!-- Footer -->
    <div class="footer">
      <div class="footer-logo">ZeekLabs.ai</div>
      <div>AI Visibility Platform | Generated on ${report.reportDate}</div>
      <div style="margin-top: 8px;">© ${new Date().getFullYear()} ZeekLabs.ai. All rights reserved.</div>
    </div>
  </div>
</body>
</html>`;

    // Open print dialog for PDF
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const getSentimentLabel = (score: number | null): "positive" | "neutral" | "negative" => {
    if (score === null) return "neutral";
    if (score > 0.2) return "positive";
    if (score < -0.2) return "negative";
    return "neutral";
  };

  const getSentimentIcon = (score: number | null) => {
    const sentiment = getSentimentLabel(score);
    if (sentiment === "positive") return <ThumbsUp className="h-4 w-4" />;
    if (sentiment === "negative") return <ThumbsDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHrs < 1) return "Just now";
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatFutureDate = (dateStr: string | null) => {
    if (!dateStr) return "Not scheduled";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMs < 0) return "Running soon";
    if (diffMins < 60) return `In ${diffMins} minutes`;
    if (diffHrs < 24) return `In ${diffHrs} hours`;
    return date.toLocaleDateString();
  };

  // Filter mentions from the shared context
  const filteredMentions = recentMentions.filter((m) => {
    if (systemFilter !== "all" && m.aiSystem !== systemFilter) return false;
    if (sentimentFilter !== "all" && getSentimentLabel(m.sentiment) !== sentimentFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-6 fade-in">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Activity className="h-5 w-5 text-emerald-600" />
            </div>
            Brand Pulse
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Configure automated monitoring and view detailed mention history
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedBrand && (
            <Badge variant="outline" className="font-medium">
              {selectedBrand.name}
            </Badge>
          )}
          {selectedBrandId && (
            <Button
              variant={showConfig ? "default" : "outline"}
              className="rounded-xl"
              onClick={() => setShowConfig(!showConfig)}
            >
              <Settings2 className="h-4 w-4 mr-2" />
              Configure
            </Button>
          )}
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => refreshData()}
            disabled={visibilityLoading}
          >
            <RefreshCw className={`h-4 w-4 ${visibilityLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Monitoring Configuration Panel */}
      {showConfig && selectedBrandId && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Monitoring Configuration</CardTitle>
                  <CardDescription>
                    Configure automated monitoring for {selectedBrand?.name}
                  </CardDescription>
                </div>
              </div>
              {config && (
                <div className="flex items-center gap-3">
                  <Label htmlFor="monitoring-enabled" className="text-sm">
                    Enable Monitoring
                  </Label>
                  <Switch
                    id="monitoring-enabled"
                    checked={config.enabled}
                    onCheckedChange={(enabled: boolean) => saveConfig({ enabled })}
                    disabled={saving}
                  />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {configLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : config ? (
              <>
                {/* Status indicators */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 rounded-xl bg-muted/50 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      {config.enabled ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm font-medium">Status</span>
                    </div>
                    <p className={`text-lg font-bold ${config.enabled ? "text-emerald-600" : "text-muted-foreground"}`}>
                      {config.enabled ? "Active" : "Paused"}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Last Run</span>
                    </div>
                    <p className="text-lg font-bold">
                      {config.lastRunAt ? formatDate(config.lastRunAt) : "Never"}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Play className="h-4 w-4 text-accent" />
                      <span className="text-sm font-medium">Next Run</span>
                    </div>
                    <p className="text-lg font-bold">
                      {formatFutureDate(config.nextRunAt)}
                    </p>
                  </div>
                </div>

                {/* Frequency selector */}
                <div className="space-y-2">
                  <Label>Monitoring Frequency</Label>
                  <Select
                    value={config.frequency}
                    onValueChange={(frequency) => saveConfig({ frequency })}
                    disabled={saving}
                  >
                    <SelectTrigger className="w-full max-w-sm bg-muted/50 border-border rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex flex-col">
                            <span>{option.label}</span>
                            <span className="text-xs text-muted-foreground">{option.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Prompts configuration */}
                <div className="space-y-3">
                  <Label>Monitoring Prompts</Label>
                  <p className="text-sm text-muted-foreground">
                    These prompts will be sent to AI systems during each monitoring run.
                  </p>

                  <div className="space-y-2">
                    {config.prompts.map((prompt, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border"
                      >
                        <span className="text-sm flex-1">{prompt}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePrompt(index)}
                          disabled={saving}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a new monitoring prompt..."
                      value={newPrompt}
                      onChange={(e) => setNewPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addPrompt()}
                      className="flex-1 bg-muted/50 border-border rounded-xl"
                    />
                    <Button
                      onClick={addPrompt}
                      disabled={!newPrompt.trim() || saving}
                      className="rounded-xl"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Failed to load configuration</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Report Download Section */}
      <Card className="border-border bg-gradient-to-r from-primary/5 via-accent/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">AI Visibility Report</h3>
                <p className="text-sm text-muted-foreground">
                  Download a comprehensive report with metrics, mentions, and recommendations
                </p>
              </div>
            </div>
            <Button
              onClick={generateReport}
              disabled={generatingReport || !selectedBrandId}
              className="rounded-xl min-w-[180px]"
            >
              {generatingReport ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </>
              )}
            </Button>
          </div>
          {reportData && (
            <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">Report generated successfully! Check your downloads.</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <Select value={systemFilter} onValueChange={setSystemFilter}>
              <SelectTrigger className="w-[150px] bg-muted/50 border-border rounded-xl h-9">
                <SelectValue placeholder="AI System" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Systems</SelectItem>
                <SelectItem value="chatgpt">ChatGPT</SelectItem>
                <SelectItem value="gemini">Gemini</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
              <SelectTrigger className="w-[150px] bg-muted/50 border-border rounded-xl h-9">
                <SelectValue placeholder="Sentiment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sentiments</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>
            {(systemFilter !== "all" || sentimentFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSystemFilter("all");
                  setSentimentFilter("all");
                }}
                className="text-muted-foreground hover:text-foreground rounded-xl"
              >
                <X className="mr-1 h-3 w-3" />
                Clear
              </Button>
            )}
            <div className="ml-auto text-sm text-muted-foreground">
              Showing {filteredMentions.length} mentions
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mentions List */}
      <Card className="border-border">
        <CardHeader className="border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Recent Mentions</CardTitle>
              <CardDescription>
                Brand mentions detected in AI responses
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {visibilityLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-5 rounded-xl border border-border bg-muted/30">
                  <div className="flex items-center gap-4 mb-4">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          ) : filteredMentions.length === 0 ? (
            <div className="text-center py-16">
              <div className="h-16 w-16 rounded-2xl bg-muted mx-auto flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-semibold">No mentions found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Run simulations to start tracking mentions
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMentions.map((mention) => {
                const sentiment = getSentimentLabel(mention.sentiment);
                const sentimentStyles = {
                  positive: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
                  neutral: "bg-gray-500/10 text-gray-400 border-gray-500/30",
                  negative: "bg-red-500/10 text-red-600 border-red-500/30",
                };

                return (
                  <div
                    key={mention.id}
                    className="p-5 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 hover:border-primary/20 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      {/* AI System icon */}
                      <div
                        className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                          mention.aiSystem === "chatgpt"
                            ? "bg-emerald-500/10 border border-emerald-500/30"
                            : "bg-blue-500/10 border border-blue-500/30"
                        }`}
                      >
                        <span
                          className={`text-base font-bold ${
                            mention.aiSystem === "chatgpt"
                              ? "text-emerald-600"
                              : "text-blue-600"
                          }`}
                        >
                          {mention.aiSystem === "chatgpt" ? "GPT" : "G"}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold">
                            {mention.aiSystem === "chatgpt" ? "ChatGPT" : "Gemini"}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(mention.createdAt)}
                          </span>
                        </div>

                        {/* Response */}
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                          {mention.context || "No context available"}
                        </p>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${sentimentStyles[sentiment]}`}>
                            {getSentimentIcon(mention.sentiment)}
                            <span className="capitalize">{sentiment}</span>
                            {mention.sentiment !== null && (
                              <span className="text-xs opacity-70">
                                ({mention.sentiment.toFixed(2)})
                              </span>
                            )}
                          </div>
                          {mention.position && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/30">
                              <Hash className="h-4 w-4" />
                              Position {mention.position}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
