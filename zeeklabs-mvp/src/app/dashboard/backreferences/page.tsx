"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Link2,
  Globe,
  Star,
  Users,
  Info,
  Pencil,
} from "lucide-react";
import { useBrand } from "@/contexts/brand-context";

// Real, legitimate platforms worth tracking — but we don't crawl them, so we
// carry no status/rating data here. Status only comes from the user's own
// self-report (BackreferenceStatus) or from citations actually detected in
// AI responses (below).
const SUGGESTED_PLATFORMS: Array<{
  tier: string;
  icon: typeof Globe;
  description: string;
  platforms: Array<{ name: string; url: string; priority: "high" | "medium" | "low" }>;
}> = [
  {
    tier: "Entity Foundation",
    icon: Globe,
    description: "Core platforms that establish your digital identity",
    platforms: [
      { name: "Google Business Profile", url: "https://business.google.com", priority: "high" },
      { name: "LinkedIn Company Page", url: "https://linkedin.com", priority: "high" },
      { name: "Crunchbase", url: "https://crunchbase.com/add-new", priority: "high" },
      { name: "Wikipedia", url: "https://wikipedia.org", priority: "low" },
    ],
  },
  {
    tier: "Review Platforms",
    icon: Star,
    description: "Where customers share their experiences",
    platforms: [
      { name: "G2", url: "https://g2.com/products/new", priority: "high" },
      { name: "Capterra", url: "https://capterra.com", priority: "high" },
      { name: "Trustpilot", url: "https://trustpilot.com", priority: "medium" },
      { name: "TrustRadius", url: "https://trustradius.com", priority: "medium" },
    ],
  },
  {
    tier: "Community Platforms",
    icon: Users,
    description: "Build presence in discussion communities",
    platforms: [
      { name: "Reddit", url: "https://reddit.com", priority: "medium" },
      { name: "Quora", url: "https://quora.com", priority: "medium" },
      { name: "Product Hunt", url: "https://producthunt.com/posts/new", priority: "medium" },
      { name: "Stack Overflow", url: "https://stackoverflow.com", priority: "low" },
    ],
  },
];

interface BackreferenceStatusRow {
  id: string;
  platform: string;
  tier: string;
  status: "present" | "missing" | "incomplete";
  details: string | null;
  profileUrl: string | null;
  priority: string;
}

interface CitationWithContext {
  source: string;
  type: string;
  url?: string;
  aiSystem: string;
  date: string;
  prompt: string;
}

export default function BackreferencesPage() {
  const { selectedBrand, loading } = useBrand();

  const [statuses, setStatuses] = useState<BackreferenceStatusRow[]>([]);
  const [citations, setCitations] = useState<CitationWithContext[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<"present" | "missing" | "incomplete">("present");
  const [draftDetails, setDraftDetails] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!selectedBrand?.id) {
      return;
    }
    let cancelled = false;
    setDataLoading(true);
    Promise.all([
      fetch(`/api/backreferences?brandId=${selectedBrand.id}`).then((r) => (r.ok ? r.json() : { statuses: [] })),
      fetch(`/api/citations?brandId=${selectedBrand.id}`).then((r) => (r.ok ? r.json() : { citations: [] })),
    ])
      .then(([statusData, citationData]) => {
        if (cancelled) return;
        setStatuses(statusData.statuses || []);
        setCitations(citationData.citations || []);
      })
      .finally(() => {
        if (!cancelled) setDataLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedBrand?.id]);

  const startEditing = (platform: string, existing?: BackreferenceStatusRow) => {
    setEditingPlatform(platform);
    setDraftStatus(existing?.status || "present");
    setDraftDetails(existing?.details || "");
  };

  const saveStatus = async (platform: string, tier: string, priority: string) => {
    if (!selectedBrand?.id) return;
    setSaving(true);
    try {
      const res = await fetch("/api/backreferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId: selectedBrand.id,
          platform,
          tier,
          priority,
          status: draftStatus,
          details: draftDetails || null,
        }),
      });
      if (res.ok) {
        const { status: saved } = await res.json();
        setStatuses((prev) => [...prev.filter((s) => s.platform !== platform), saved]);
        setEditingPlatform(null);
      }
    } finally {
      setSaving(false);
    }
  };

  // Empty when no brand is selected, even if stale fetch state lingers —
  // avoids showing a previous brand's data after switching away from it.
  const effectiveStatuses = selectedBrand?.id ? statuses : [];
  const effectiveCitations = selectedBrand?.id ? citations : [];

  const trackedCount = effectiveStatuses.length;
  const presentCount = effectiveStatuses.filter((s) => s.status === "present").length;

  if (loading) {
    return (
      <div className="space-y-8 fade-in">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-[100px]" />)}
        </div>
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Link2 className="h-5 w-5 text-primary" />
          </div>
          Citation Tracker
        </h1>
        <p className="text-muted-foreground mt-2">
          Real citations detected in AI responses, plus your own self-reported platform presence
        </p>
      </div>

      {/* Summary Stats — built from real data only */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border overflow-hidden">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground font-medium">Citations Detected</p>
            <p className="text-4xl font-bold mt-1 text-primary">{effectiveCitations.length}</p>
            <p className="text-xs text-muted-foreground mt-1">in analyzed AI responses</p>
          </CardContent>
        </Card>
        <Card className="border-border overflow-hidden">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground font-medium">Self-Reported Present</p>
            <p className="text-4xl font-bold mt-1 text-emerald-600">{presentCount}</p>
            <p className="text-xs text-muted-foreground mt-1">of {trackedCount} platforms you&apos;ve tracked</p>
          </CardContent>
        </Card>
        <Card className="border-border overflow-hidden">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground font-medium">Not Yet Tracked</p>
            <p className="text-4xl font-bold mt-1 text-muted-foreground">
              {SUGGESTED_PLATFORMS.flatMap((t) => t.platforms).length - trackedCount}
            </p>
            <p className="text-xs text-muted-foreground mt-1">suggested platforms with no status set</p>
          </CardContent>
        </Card>
      </div>

      {/* Real citations detected in AI responses */}
      <Card className="border-border">
        <CardHeader className="border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <CardTitle>Citations Found in AI Responses</CardTitle>
              <CardDescription>
                Sources and URLs actually detected in the AI responses this brand&apos;s simulations collected — <Badge variant="outline" className="text-emerald-600 border-emerald-400/30 ml-1">Measured</Badge>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {dataLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : effectiveCitations.length === 0 ? (
            <div className="text-center py-10">
              <Info className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">Citation tracking is not available for this analysis yet</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                No citations or platform mentions have been detected in this brand&apos;s AI responses so far.
                Run the Prompt Simulator or Analysis to collect responses we can scan for real citations.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {effectiveCitations.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                  <div>
                    <div className="font-medium text-sm">{c.source}</div>
                    <div className="text-xs text-muted-foreground">
                      via {c.aiSystem} · {new Date(c.date).toLocaleDateString()}
                    </div>
                  </div>
                  {c.url && (
                    <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-primary text-sm flex items-center gap-1 hover:underline">
                      View <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Self-reported platform presence */}
      {SUGGESTED_PLATFORMS.map((tier) => {
        const TierIcon = tier.icon;
        return (
          <Card key={tier.tier} className="border-border">
            <CardHeader className="border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TierIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{tier.tier}</CardTitle>
                  <CardDescription>{tier.description} — <Badge variant="outline" className="ml-1">Self-reported</Badge></CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {tier.platforms.map((platform) => {
                const existing = effectiveStatuses.find((s) => s.platform === platform.name);
                const isEditing = editingPlatform === platform.name;

                return (
                  <div key={platform.name} className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {existing?.status === "present" ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        ) : existing?.status === "incomplete" ? (
                          <AlertCircle className="h-5 w-5 text-amber-600" />
                        ) : existing?.status === "missing" ? (
                          <XCircle className="h-5 w-5 text-red-600" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-dashed border-muted-foreground/40" />
                        )}
                        <div>
                          <div className="font-medium">{platform.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {existing ? (existing.details || existing.status) : "Not yet tracked"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={platform.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-1" /> Visit
                          </a>
                        </Button>
                        <Button
                          variant={existing ? "outline" : "default"}
                          size="sm"
                          onClick={() => startEditing(platform.name, existing)}
                        >
                          <Pencil className="h-4 w-4 mr-1" /> {existing ? "Edit" : "Set status"}
                        </Button>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border">
                        <Select value={draftStatus} onValueChange={(v) => setDraftStatus(v as typeof draftStatus)}>
                          <SelectTrigger className="sm:w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="present">Present</SelectItem>
                            <SelectItem value="incomplete">Incomplete</SelectItem>
                            <SelectItem value="missing">Missing</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder='e.g. "Claimed, 4.2 stars, 12 reviews"'
                          value={draftDetails}
                          onChange={(e) => setDraftDetails(e.target.value)}
                          className="flex-1"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={saving}
                            onClick={() => saveStatus(platform.name, tier.tier.toLowerCase().replace(/\s+/g, "_"), platform.priority)}
                          >
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingPlatform(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
