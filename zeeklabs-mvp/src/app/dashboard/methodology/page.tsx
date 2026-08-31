"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProvenanceBadge } from "@/components/ui/provenance-badge";
import { SCORE_WEIGHTS, CONFIDENCE_THRESHOLDS } from "@/lib/scoring";
import { BookOpen, Search, Hash, ThumbsUp, Users, Link2, AlertTriangle } from "lucide-react";

export default function MethodologyPage() {
  return (
    <div className="space-y-8 fade-in max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          Methodology
        </h1>
        <p className="text-muted-foreground mt-2">
          What ZeekLabs measures, how it&apos;s calculated, and what&apos;s an AI estimate rather than a measured fact.
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-primary" />
            <CardTitle>What we measure</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            We send real prompts to ChatGPT, Gemini, and Perplexity &mdash; either ones you write in the Prompt
            Simulator, or ones generated for your brand&apos;s category &mdash; and analyze the actual text each
            platform returns. We look for whether your brand name (or an alternate name) appears, where it
            appears relative to other brands, and the tone of the surrounding text.
          </p>
          <div className="flex items-center gap-2">
            <ProvenanceBadge type="measured" /> Brand mentioned, position in the response, sentiment of the mention, citations/URLs found
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Hash className="h-5 w-5 text-primary" />
            <CardTitle>How the Visibility Score is calculated</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <ProvenanceBadge type="calculated" /> Deterministic &mdash; the same measured data always produces the same score
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <div className="font-semibold text-foreground">Presence &mdash; {SCORE_WEIGHTS.presence * 100}%</div>
              <p className="mt-1">% of analyzed responses that mentioned your brand at all.</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <div className="font-semibold text-foreground">Sentiment &mdash; {SCORE_WEIGHTS.sentiment * 100}%</div>
              <p className="mt-1">How positive or negative the surrounding text is, averaged across mentions.</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <div className="font-semibold text-foreground">Position &mdash; {SCORE_WEIGHTS.position * 100}%</div>
              <p className="mt-1">
                How early your brand appears when responses are structured as a list or ranking. Uses a
                logarithmic curve (not a hard cliff) so being 5th still earns meaningful credit. When no
                position can be detected, this component defaults to a neutral 50 rather than penalizing you.
              </p>
            </div>
          </div>
          <p>
            These weights (40/25/35) were a starting design choice, not a scientifically optimized formula
            &mdash; we&apos;re transparent about that rather than presenting them as more rigorous than they are.
          </p>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Competitor scores</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <ProvenanceBadge type="measured" /> When comparison data exists
          </div>
          <p>
            Competitor scores use the exact same measurement pipeline as your own score &mdash; real comparison
            prompts are run, and competitor mentions/position/sentiment are detected from the actual responses.
            A competitor shows &ldquo;Insufficient data&rdquo; instead of a guessed score until real comparison
            prompts have been run for them.
          </p>
          <div className="flex items-center gap-2">
            <ProvenanceBadge type="ai_estimate" /> Strengths/weaknesses text
          </div>
          <p>
            Qualitative strengths/weaknesses commentary comes from a single LLM call and is labeled &ldquo;AI
            Insight&rdquo; wherever it&apos;s shown &mdash; it&apos;s the model&apos;s own opinion, not something we counted.
          </p>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Link2 className="h-5 w-5 text-primary" />
            <CardTitle>Citations</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            The Citation Tracker shows two different things, clearly separated: citations we actually found in
            AI response text (URLs and known platform names &mdash; <ProvenanceBadge type="measured" className="mx-1" />),
            and a generic checklist of platforms worth having a presence on, which we don&apos;t crawl and
            can&apos;t verify &mdash; so we never claim a platform is &ldquo;missing&rdquo; just because we
            haven&apos;t seen it cited yet.
          </p>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <ThumbsUp className="h-5 w-5 text-primary" />
            <CardTitle>AI Recommendation Signal</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <ProvenanceBadge type="ai_estimate" />
          </div>
          <p>
            &ldquo;High/Medium/Low&rdquo; recommendation likelihood is the LLM&apos;s own interpretation of how
            likely it is to recommend your brand &mdash; it is not a measured percentage or a statistically
            derived probability. We label it &ldquo;AI Recommendation Signal&rdquo; everywhere it appears to
            keep that distinction visible.
          </p>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <CardTitle>Sample size &amp; confidence</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Scores based on very few responses are noisier than ones based on many. We use fixed, documented thresholds:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Fewer than {CONFIDENCE_THRESHOLDS.early} responses analyzed &mdash; <strong className="text-foreground">Early signal</strong></li>
            <li>{CONFIDENCE_THRESHOLDS.early}&ndash;{CONFIDENCE_THRESHOLDS.moderate - 1} responses &mdash; <strong className="text-foreground">Moderate confidence</strong></li>
            <li>{CONFIDENCE_THRESHOLDS.moderate}+ responses &mdash; <strong className="text-foreground">High confidence</strong></li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Known limitations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <ul className="list-disc list-inside space-y-1">
            <li>Position detection works best for numbered/bulleted lists and explicit ranking language (&ldquo;I recommend X over Y&rdquo;); some prose mentions may not yield a detected position.</li>
            <li>Sentiment analysis is a lexicon-based model with basic negation handling &mdash; it can still misread sarcasm or complex qualified statements.</li>
            <li>We don&apos;t crawl third-party review/directory sites, so we can only confirm citations we actually see referenced in an AI response.</li>
            <li>No industry benchmark data exists yet &mdash; we don&apos;t show &ldquo;vs. industry average&rdquo; comparisons because we&apos;d have to invent them.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
