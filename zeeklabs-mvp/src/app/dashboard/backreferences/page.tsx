"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Link2,
  Globe,
  Star,
  Users,
  MessageSquare,
  MapPin,
  TrendingUp,
  Shield,
  Target,
} from "lucide-react";

// Backreference platforms data
const PLATFORMS = [
  {
    tier: "Entity Foundation",
    icon: Globe,
    description: "Core platforms that establish your digital identity",
    platforms: [
      { name: "Google Business Profile", status: "present", details: "Claimed, 4.2★ (12 reviews)", url: "https://business.google.com", priority: "high" },
      { name: "LinkedIn Company Page", status: "present", details: "Complete, 500 followers", url: "https://linkedin.com", priority: "high" },
      { name: "Crunchbase", status: "missing", details: "NOT FOUND", url: "https://crunchbase.com/add-new", priority: "high" },
      { name: "Wikipedia", status: "missing", details: "NOT FOUND", url: "https://wikipedia.org", priority: "low" },
    ],
  },
  {
    tier: "Review Platforms",
    icon: Star,
    description: "Where customers share their experiences",
    platforms: [
      { name: "G2", status: "missing", details: "NOT FOUND", url: "https://g2.com/products/new", priority: "high", competitorGap: "Competitors have 2500+ reviews" },
      { name: "Capterra", status: "missing", details: "NOT FOUND", url: "https://capterra.com", priority: "high" },
      { name: "Trustpilot", status: "present", details: "3.8★ (28 reviews)", url: "https://trustpilot.com", priority: "medium" },
      { name: "TrustRadius", status: "missing", details: "NOT FOUND", url: "https://trustradius.com", priority: "medium" },
    ],
  },
  {
    tier: "Community Platforms",
    icon: Users,
    description: "Build presence in discussion communities",
    platforms: [
      { name: "Reddit", status: "missing", details: "No presence", url: "https://reddit.com", priority: "medium", competitorGap: "Mentioned in r/SaaS 15 times" },
      { name: "Quora", status: "present", details: "5 answers by team", url: "https://quora.com", priority: "medium" },
      { name: "Product Hunt", status: "missing", details: "NOT FOUND", url: "https://producthunt.com/posts/new", priority: "medium" },
      { name: "Stack Overflow", status: "missing", details: "No presence", url: "https://stackoverflow.com", priority: "low" },
    ],
  },
  {
    tier: "India-Specific",
    icon: MapPin,
    description: "Regional platforms for India market",
    platforms: [
      { name: "YourStory", status: "missing", details: "No coverage", url: "https://yourstory.com", priority: "medium" },
      { name: "Inc42", status: "missing", details: "No coverage", url: "https://inc42.com", priority: "medium" },
      { name: "JustDial", status: "present", details: "Listed, verified", url: "https://justdial.com", priority: "low" },
      { name: "IndiaMART", status: "missing", details: "NOT FOUND", url: "https://indiamart.com", priority: "low" },
    ],
  },
];

export default function BackreferencesPage() {
  const totalPlatforms = PLATFORMS.reduce((sum, tier) => sum + tier.platforms.length, 0);
  const presentPlatforms = PLATFORMS.reduce(
    (sum, tier) => sum + tier.platforms.filter((p) => p.status === "present").length,
    0
  );
  const missingPlatforms = totalPlatforms - presentPlatforms;
  const presencePercent = Math.round((presentPlatforms / totalPlatforms) * 100);
  const highPriorityMissing = PLATFORMS.reduce(
    (sum, tier) => sum + tier.platforms.filter((p) => p.status !== "present" && p.priority === "high").length,
    0
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
      case "incomplete":
        return <AlertCircle className="h-5 w-5 text-amber-600" />;
      default:
        return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-600 border border-red-500/30">
            High Priority
          </span>
        );
      case "medium":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 border border-amber-500/30">
            Medium
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
            Low
          </span>
        );
    }
  };

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
          Track your presence across platforms that AI systems reference for answers
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Coverage</p>
                <p className="text-4xl font-bold mt-1 text-primary">{presencePercent}%</p>
              </div>
              <div className="h-14 w-14 rounded-2xl gradient-bg flex items-center justify-center">
                <Target className="h-7 w-7 text-white" />
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                style={{ width: `${presencePercent}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Present</p>
                <p className="text-4xl font-bold mt-1 text-emerald-600">{presentPlatforms}</p>
                <p className="text-xs text-muted-foreground mt-1">of {totalPlatforms} platforms</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Missing</p>
                <p className="text-4xl font-bold mt-1 text-red-600">{missingPlatforms}</p>
                <p className="text-xs text-muted-foreground mt-1">opportunities</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <XCircle className="h-7 w-7 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">High Priority</p>
                <p className="text-4xl font-bold mt-1 text-amber-600">{highPriorityMissing}</p>
                <p className="text-xs text-muted-foreground mt-1">actions needed</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <AlertCircle className="h-7 w-7 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Tiers */}
      {PLATFORMS.map((tier) => {
        const TierIcon = tier.icon;
        const tierPresent = tier.platforms.filter((p) => p.status === "present").length;
        const tierTotal = tier.platforms.length;

        return (
          <Card key={tier.tier} className="border-border">
            <CardHeader className="border-b border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <TierIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{tier.tier}</CardTitle>
                    <CardDescription>{tier.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${
                    tierPresent === tierTotal ? "text-emerald-600" :
                    tierPresent > 0 ? "text-amber-600" : "text-red-600"
                  }`}>
                    {tierPresent}/{tierTotal}
                  </span>
                  <span className="text-sm text-muted-foreground">platforms</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {tier.platforms.map((platform) => (
                <div
                  key={platform.name}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    platform.status === "present"
                      ? "bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10"
                      : "bg-red-500/5 border-red-500/20 hover:bg-red-500/10"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(platform.status)}
                    <div>
                      <div className="font-medium">{platform.name}</div>
                      <div className={`text-sm ${
                        platform.status === "present" ? "text-emerald-600" : "text-muted-foreground"
                      }`}>
                        {platform.details}
                      </div>
                      {platform.competitorGap && (
                        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-amber-600">
                          <TrendingUp className="h-3 w-3" />
                          {platform.competitorGap}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {platform.status !== "present" && getPriorityBadge(platform.priority)}
                    {platform.status !== "present" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-primary/30 text-primary hover:bg-primary/10"
                        asChild
                      >
                        <a href={platform.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Claim Now
                        </a>
                      </Button>
                    )}
                    {platform.status === "present" && (
                      <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}

      {/* Recommended Next Steps */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
        <CardHeader className="border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl gradient-bg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Priority Action Plan</CardTitle>
              <CardDescription>Complete these steps for maximum AI visibility impact</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-background/50 border border-border hover:border-primary/30 transition-colors">
              <div className="h-8 w-8 rounded-lg gradient-bg flex items-center justify-center text-white font-bold text-sm shrink-0">
                1
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Claim G2 Profile</span>
                  <span className="text-xs text-muted-foreground">~2 hours</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Highest impact on AI citations. G2 is the #1 cited software review platform.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30 text-xs">
                    +8-12% visibility
                  </Badge>
                </div>
              </div>
              <Button size="sm" className="rounded-xl" asChild>
                <a href="https://g2.com/products/new" target="_blank" rel="noopener noreferrer">
                  Start
                </a>
              </Button>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-background/50 border border-border hover:border-primary/30 transition-colors">
              <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                2
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Create Crunchbase Profile</span>
                  <span className="text-xs text-muted-foreground">~1 hour</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Establishes entity recognition in AI knowledge graphs.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30 text-xs">
                    +4-6% visibility
                  </Badge>
                </div>
              </div>
              <Button size="sm" variant="outline" className="rounded-xl" asChild>
                <a href="https://crunchbase.com/add-new" target="_blank" rel="noopener noreferrer">
                  Start
                </a>
              </Button>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-background/50 border border-border hover:border-primary/30 transition-colors">
              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground font-bold text-sm shrink-0">
                3
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Claim Capterra Profile</span>
                  <span className="text-xs text-muted-foreground">~2 hours</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Major review platform frequently cited by AI assistants.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30 text-xs">
                    +5-8% visibility
                  </Badge>
                </div>
              </div>
              <Button size="sm" variant="outline" className="rounded-xl" asChild>
                <a href="https://capterra.com" target="_blank" rel="noopener noreferrer">
                  Start
                </a>
              </Button>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-border">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <span className="text-muted-foreground">Completing all 3 steps could increase your AI visibility by</span>
              <span className="font-bold text-emerald-600">+17-26%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
