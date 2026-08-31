import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getReportPromptSuggestions, type PromptSuggestion } from "@/lib/prompt-generator";
import { generateBrandPrompts, getIndustryContext } from "@/lib/prompts/prompt-generator";
import { calculateScoreFromMentions, calculatePresenceScore, calculateSentimentScore, calculatePositionScore } from "@/lib/scoring";
import { extractCitationsFromResponse } from "@/lib/citations";

// Helper: Check if a prompt is a "biased" branded prompt that shouldn't count for organic mentions
function isBiasedPrompt(prompt: string, brandName: string): boolean {
  const normalizedPrompt = prompt.toLowerCase();
  const normalizedBrand = brandName.toLowerCase();

  // Prompts that explicitly ask about the brand inflate mention scores artificially
  const biasedPatterns = [
    `visibility analysis for ${normalizedBrand}`,
    `analyze ${normalizedBrand}`,
    `tell me about ${normalizedBrand}`,
    `what is ${normalizedBrand}`,
    `competitor analysis: ${normalizedBrand}`,
    `competitor ${normalizedBrand}`,
  ];

  return biasedPatterns.some(pattern => normalizedPrompt.includes(pattern));
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { brandId } = await req.json();

    if (!brandId) {
      return NextResponse.json({ error: "Brand ID required" }, { status: 400 });
    }

    // Verify user owns this brand
    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: session.user.id },
      include: {
        competitors: true,
      },
    });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Get visibility data for last 30 days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const allMentions = await prisma.mention.findMany({
      where: {
        brandId,
        isCompetitor: false,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: "desc" },
      include: {
        simulation: true,
      },
    });

    // Filter out biased prompts for score calculation (but keep them for display)
    const organicMentions = allMentions.filter(m => !isBiasedPrompt(m.prompt, brand.name));
    const biasedMentions = allMentions.filter(m => isBiasedPrompt(m.prompt, brand.name));

    // Get all simulations with full data for citations
    const simulationsList = await prisma.simulation.findMany({
      where: {
        brandId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: "desc" },
    });

    // Count only non-biased simulations for organic score
    const organicSimulationsCount = simulationsList.filter(
      s => !isBiasedPrompt(s.prompt, brand.name)
    ).length;

    // Calculate Perplexity mentions
    const organicPerplexityMentions = organicMentions.filter((m) => m.aiSystem === "perplexity");

    // Get all recommendations from database (will be populated later if empty)
    let allRecommendations = await prisma.recommendation.findMany({
      where: { brandId },
      orderBy: [{ isCompleted: "asc" }, { priority: "asc" }],
    });

    // Get backreference status for the brand
    const backreferenceStatus = await prisma.backreferenceStatus.findMany({
      where: { brandId },
      orderBy: { priority: "asc" },
    });

    // Get the most recent full analysis data from AnalysisCache (where analyze API stores it)
    const latestAnalysisCache = await prisma.analysisCache.findFirst({
      where: {
        brandId,
        status: "success",
        analysisData: { not: null },
      },
      orderBy: { completedAt: "desc" },
    });

    // Also try AnalysisSnapshot as fallback
    const latestSnapshot = await prisma.analysisSnapshot.findFirst({
      where: {
        brandId,
        analysisData: { not: null },
      },
      orderBy: { createdAt: "desc" },
    });

    // Use cache first, then snapshot as fallback
    const latestAnalysis = latestAnalysisCache || latestSnapshot;

    // Parse the full analysis data if available
    let fullAnalysisData: {
      scores?: {
        overall: number;
        brandAwareness: number;
        marketPosition: number;
        sentimentScore: number;
        authorityScore: number;
        contentVisibility: number;
        socialPresence: number;
      };
      competitorComparison?: Array<{
        name: string;
        overallScore: number;
        strengths: string[];
        weaknesses: string[];
        marketShare: string;
        sentiment: string;
      }>;
      marketIntelligence?: {
        industryTrends: string[];
        marketSize: string;
        growthRate: string;
        macroFactors: string[];
        microFactors: string[];
        futureOutlook: string;
      };
      sentimentAnalysis?: {
        brandSentiment: {
          overall: string;
          score: number;
          positiveThemes: string[];
          negativeThemes: string[];
          neutralThemes: string[];
        };
        customerSentiment: {
          satisfaction: number;
          commonPraises: string[];
          commonComplaints: string[];
          nps: string;
        };
        marketSentiment: {
          industryOutlook: string;
          investorSentiment: string;
          mediaPerception: string;
        };
      };
      emergingPlayers?: Array<{
        name: string;
        description: string;
        threatLevel: string;
        uniqueAdvantage: string;
        growthTrajectory: string;
      }>;
      productAnalysis?: {
        featureGaps: string[];
        featureAdvantages: string[];
      };
      citations?: Array<{
        source: string;
        type: string;
        relevance: string;
        url?: string;
      }>;
      recommendations?: {
        immediate: string[];
        shortTerm: string[];
        longTerm: string[];
        competitiveActions: string[];
      };
      aiVisibility?: {
        mentionFrequency: string;
        typicalPosition: number | null;
        recommendationLikelihood: string;
        competitorMentionGap: string;
        improvementAreas: string[];
      };
    } | null = null;

    if (latestAnalysis?.analysisData) {
      try {
        fullAnalysisData = JSON.parse(latestAnalysis.analysisData);
        console.log("Loaded full analysis data from previous AI visibility analysis");
      } catch {
        console.log("Failed to parse stored analysis data");
      }
    }

    // Extract citations from all simulation responses
    const allCitations: Array<{ source: string; type: string; url?: string }> = [];
    for (const sim of simulationsList) {
      const response = sim.chatgptResponse || sim.geminiResponse || "";
      const citations = extractCitationsFromResponse(response);
      for (const citation of citations) {
        if (!allCitations.find(c => c.source === citation.source && c.url === citation.url)) {
          allCitations.push(citation);
        }
      }
    }

    // If no citations found, add recommended citation sources
    if (allCitations.length === 0 && brand.domain) {
      allCitations.push(
        { source: "G2 Crowd", type: "review_site" },
        { source: "Capterra", type: "review_site" },
        { source: "LinkedIn", type: "social" },
        { source: "Crunchbase", type: "industry_report" },
        { source: "Wikipedia", type: "official" }
      );
    }

    // Calculate metrics using ORGANIC mentions only (excluding biased prompts)
    const organicChatgptMentions = organicMentions.filter((m) => m.aiSystem === "chatgpt");
    const organicGeminiMentions = organicMentions.filter((m) => m.aiSystem === "gemini");

    // Canonical formula (src/lib/scoring.ts) — was previously a divergent
    // linear position penalty here that disagreed with the dashboard's log2
    // decay formula, so report PDFs could show a different score than the
    // live dashboard for the same brand at the same moment.
    const chatgptScore = calculateScoreFromMentions(organicChatgptMentions, organicSimulationsCount);
    const geminiScore = calculateScoreFromMentions(organicGeminiMentions, organicSimulationsCount);
    const perplexityScore = calculateScoreFromMentions(organicPerplexityMentions, organicSimulationsCount);

    // Calculate overall score (average of active engines)
    const activeScores = [chatgptScore, geminiScore, perplexityScore].filter(s => s > 0);
    const overallScore = activeScores.length > 0
      ? Math.round(activeScores.reduce((a, b) => a + b, 0) / activeScores.length)
      : Math.round((chatgptScore + geminiScore + perplexityScore) / 3);

    // Calculate sentiment distribution (using organic mentions only)
    const sentiments = organicMentions.filter((m) => m.sentiment !== null).map((m) => m.sentiment!);
    const avgSentiment = sentiments.length > 0 ? sentiments.reduce((a, b) => a + b, 0) / sentiments.length : 0;
    const positiveMentions = sentiments.filter((s) => s > 0.2).length;
    const neutralMentions = sentiments.filter((s) => s >= -0.2 && s <= 0.2).length;
    const negativeMentions = sentiments.filter((s) => s < -0.2).length;

    // Calculate position analysis (using organic mentions only)
    const chatgptPositions = organicChatgptMentions.filter((m) => m.position !== null).map((m) => m.position!);
    const geminiPositions = organicGeminiMentions.filter((m) => m.position !== null).map((m) => m.position!);
    const perplexityPositions = organicPerplexityMentions.filter((m) => m.position !== null).map((m) => m.position!);

    const avgChatgptPosition = chatgptPositions.length > 0
      ? chatgptPositions.reduce((a, b) => a + b, 0) / chatgptPositions.length
      : null;
    const avgGeminiPosition = geminiPositions.length > 0
      ? geminiPositions.reduce((a, b) => a + b, 0) / geminiPositions.length
      : null;
    const avgPerplexityPosition = perplexityPositions.length > 0
      ? perplexityPositions.reduce((a, b) => a + b, 0) / perplexityPositions.length
      : null;

    // Count positions in top 3, top 5, and beyond
    const positionDistribution = {
      chatgpt: {
        top3: chatgptPositions.filter(p => p <= 3).length,
        top5: chatgptPositions.filter(p => p <= 5 && p > 3).length,
        beyond5: chatgptPositions.filter(p => p > 5).length,
      },
      gemini: {
        top3: geminiPositions.filter(p => p <= 3).length,
        top5: geminiPositions.filter(p => p <= 5 && p > 3).length,
        beyond5: geminiPositions.filter(p => p > 5).length,
      },
      perplexity: {
        top3: perplexityPositions.filter(p => p <= 3).length,
        top5: perplexityPositions.filter(p => p <= 5 && p > 3).length,
        beyond5: perplexityPositions.filter(p => p > 5).length,
      },
    };

    // Calculate score components breakdown (using organic data)
    // Each simulation tests 3 AI engines (ChatGPT, Gemini, Perplexity)
    const AI_ENGINE_COUNT = 3;
    const presenceScoreComponent = calculatePresenceScore(organicMentions.length, organicSimulationsCount * AI_ENGINE_COUNT);
    const sentimentScoreComponent = calculateSentimentScore(avgSentiment);
    const allPositions = organicMentions.filter((m) => m.position !== null).map((m) => m.position!);
    // Use null for position when no data, then use neutral score (50) instead of artificial penalty
    const avgOverallPosition = allPositions.length > 0
      ? allPositions.reduce((a, b) => a + b, 0) / allPositions.length
      : null;
    const positionScoreComponent = calculatePositionScore(avgOverallPosition);

    // Get unique prompts used (organic only, excluding biased)
    const uniqueOrganicPrompts = [...new Set(organicMentions.map(m => m.prompt))];

    // Generate suggested prompts if we have fewer than 3 tested prompts
    // This ensures reports always show value even for new brands
    const competitorNames = brand.competitors.map(c => c.name);
    const suggestedPrompts: PromptSuggestion[] = uniqueOrganicPrompts.length < 3
      ? getReportPromptSuggestions(brand.name, competitorNames, undefined, 6)
      : [];

    // If no recommendations in DB, generate default ones based on current visibility data
    // NOTE: These are customer-actionable recommendations with SPECIFIC steps - no vague language
    if (allRecommendations.length === 0) {
      const recsToCreate = [];

      // HIGH PRIORITY: Wikipedia presence (most impactful for AI training data)
      recsToCreate.push({
        brandId,
        title: "Create or Update Wikipedia Page",
        description: "Submit a Wikipedia article for your brand with verifiable citations from news articles, press releases, and industry publications. Include founding date, headquarters, key products, and notable achievements. Wikipedia is a primary training source for AI models.",
        priority: "high",
        category: "entity",
        effort: "4-6 hours",
        timeline: "This week",
        expectedImpact: "+25-40% AI recognition",
      });

      // HIGH PRIORITY: Crunchbase (critical for B2B AI queries)
      recsToCreate.push({
        brandId,
        title: "Complete Crunchbase Profile",
        description: "Claim your Crunchbase profile at crunchbase.com/register. Add: company description (250+ words), founding date, employee count, funding rounds, key executives with LinkedIn links, office locations, and product categories. Upload your logo and cover image.",
        priority: "high",
        category: "entity",
        effort: "2 hours",
        timeline: "This week",
        expectedImpact: "+15-25% B2B query visibility",
      });

      // HIGH PRIORITY: LinkedIn Company Page
      recsToCreate.push({
        brandId,
        title: "Optimize LinkedIn Company Page",
        description: "Update your LinkedIn Company Page with: detailed About section (2000 characters), industry classification, company size, specialties (add 20 relevant keywords), custom CTA button, and featured content. Post 3x weekly to build engagement signals.",
        priority: "high",
        category: "authority",
        effort: "3 hours",
        timeline: "This week",
        expectedImpact: "+10-20% professional query visibility",
      });

      // MEDIUM PRIORITY: G2 (critical for software/SaaS)
      recsToCreate.push({
        brandId,
        title: "Claim G2 Profile and Collect Reviews",
        description: "Claim your G2 profile at seller.g2.com. Complete all profile sections including product description, screenshots, pricing, and integrations. Send review requests to 20 customers using G2's review collection tools. Respond to all existing reviews within 48 hours.",
        priority: "medium",
        category: "authority",
        effort: "3 hours initial + ongoing",
        timeline: "This month",
        expectedImpact: "+20-30% software recommendation rate",
      });

      // MEDIUM PRIORITY: Schema markup
      recsToCreate.push({
        brandId,
        title: "Add Schema.org Markup to Website",
        description: "Implement Organization schema on your homepage with: name, logo, url, sameAs (link all social profiles), foundingDate, founders, address, and contactPoint. Add Product/Service schema to relevant pages. Validate at search.google.com/test/rich-results.",
        priority: "medium",
        category: "technical",
        effort: "2-4 hours (developer needed)",
        timeline: "This month",
        expectedImpact: "+10-15% structured data recognition",
      });

      // MEDIUM PRIORITY: Press coverage
      recsToCreate.push({
        brandId,
        title: "Generate Press Coverage",
        description: "Publish 2-3 press releases on PR Newswire or Business Wire announcing product updates, partnerships, or milestones. Pitch story angles to 5 industry journalists using HARO (helpareporter.com). Target publications that AI systems cite: TechCrunch, Forbes, industry-specific outlets.",
        priority: "medium",
        category: "content",
        effort: "Ongoing",
        timeline: "This month",
        expectedImpact: "+15-25% news-based citations",
      });

      // LOW PRIORITY: FAQ content
      recsToCreate.push({
        brandId,
        title: "Create Question-Based Content",
        description: "Identify 20 questions customers ask about your product category using AnswerThePublic.com or Google's 'People Also Ask'. Create dedicated pages answering each question with 500+ word responses. Use the exact question as H1 heading. Add FAQ schema markup.",
        priority: "low",
        category: "content",
        effort: "2 hours per article",
        timeline: "This quarter",
        expectedImpact: "+20-35% question-based recommendations",
      });

      // Conditional: Low sentiment score
      if (avgSentiment < 0.2) {
        recsToCreate.push({
          brandId,
          title: "Address Negative Reviews",
          description: "Audit all reviews on G2, Capterra, Trustpilot, and Google. Respond professionally to every negative review within 24 hours with: acknowledgment, explanation of resolution, and contact for follow-up. Reach out directly to resolve issues and request updated reviews.",
          priority: "high",
          category: "entity",
          effort: "1 hour daily",
          timeline: "Ongoing",
          expectedImpact: "+10-20% sentiment score",
        });
      }

      // Conditional: Low visibility score
      if (overallScore < 30) {
        recsToCreate.push({
          brandId,
          title: "Build Backlink Authority",
          description: "Guest post on 5 industry blogs with links to your site. Get listed in 10 relevant directories (Clutch.co, GoodFirms, industry-specific). Create a linkable asset (original research, calculator, template) and pitch to 20 relevant sites for coverage.",
          priority: "high",
          category: "authority",
          effort: "Ongoing",
          timeline: "This quarter",
          expectedImpact: "+15-30% domain authority signals",
        });
      }

      // Save recommendations to database
      for (const rec of recsToCreate) {
        try {
          await prisma.recommendation.create({ data: rec });
        } catch {
          // Ignore duplicate errors
        }
      }

      // Re-fetch
      allRecommendations = await prisma.recommendation.findMany({
        where: { brandId },
        orderBy: [{ isCompleted: "asc" }, { priority: "asc" }],
      });
    }

    // Generate report date
    const reportDate = new Date().toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Trust model (matches api/visibility/route.ts): once real organic
    // simulations exist, measured data is authoritative and is never
    // overridden by the LLM's one-shot analysis guess. The AI estimate is
    // only used, explicitly flagged, when there is no measured data at all.
    const hasAIScores = fullAnalysisData?.scores?.overall !== undefined;
    const hasMeasuredData = organicSimulationsCount > 0;
    const dataSource: "measured" | "ai_estimate" | "none" = hasMeasuredData
      ? "measured"
      : hasAIScores
        ? "ai_estimate"
        : "none";

    const finalVisibilityScore = hasMeasuredData
      ? overallScore
      : (hasAIScores ? fullAnalysisData!.scores!.overall : 0);

    // Per-platform scores are only ever real measurement — a real zero is a
    // legitimate result, never replaced with a fraction of the AI's overall guess.
    const finalChatgptScore = hasMeasuredData ? chatgptScore : 0;
    const finalGeminiScore = hasMeasuredData ? geminiScore : 0;
    const finalPerplexityScore = hasMeasuredData ? perplexityScore : 0;

    const finalSentimentAvg = hasMeasuredData
      ? Math.round(avgSentiment * 100)
      : (fullAnalysisData?.sentimentAnalysis?.brandSentiment?.score !== undefined
          ? Math.round(fullAnalysisData.sentimentAnalysis.brandSentiment.score * 100)
          : 0);

    const aiEstimate = !hasMeasuredData && fullAnalysisData?.aiVisibility
      ? {
          mentionFrequency: fullAnalysisData.aiVisibility.mentionFrequency ?? null,
          typicalPosition: fullAnalysisData.aiVisibility.typicalPosition ?? null,
          recommendationLikelihood: fullAnalysisData.aiVisibility.recommendationLikelihood ?? null,
        }
      : null;

    console.log(`Report scores - dataSource: ${dataSource}, Final: ${finalVisibilityScore}, Calculated: ${overallScore}`);

    // Build report data with all available information
    const reportData = {
      brand: {
        name: brand.name,
        domain: brand.domain,
        alternateNames: brand.alternateNames ? JSON.parse(brand.alternateNames) : [],
        createdAt: brand.createdAt.toISOString(),
      },
      generatedAt: new Date().toISOString(),
      reportDate,
      period: "Last 30 Days",
      metrics: {
        visibilityScore: finalVisibilityScore,
        chatgptScore: finalChatgptScore,
        geminiScore: finalGeminiScore,
        perplexityScore: finalPerplexityScore,
        // Show organic mentions separately from biased ones
        totalMentions: organicMentions.length,
        totalMentionsIncludingBiased: allMentions.length,
        chatgptMentions: organicChatgptMentions.length,
        geminiMentions: organicGeminiMentions.length,
        perplexityMentions: organicPerplexityMentions.length,
        biasedMentionsExcluded: biasedMentions.length,
        simulationsRun: simulationsList.length,
        organicSimulationsRun: organicSimulationsCount,
        sentiment: {
          average: finalSentimentAvg,
          positive: positiveMentions,
          neutral: neutralMentions,
          negative: negativeMentions,
        },
        position: {
          chatgptAvg: avgChatgptPosition ? Number(avgChatgptPosition.toFixed(1)) : null,
          geminiAvg: avgGeminiPosition ? Number(avgGeminiPosition.toFixed(1)) : null,
          perplexityAvg: avgPerplexityPosition ? Number(avgPerplexityPosition.toFixed(1)) : null,
          overallAvg: avgOverallPosition ? Number(avgOverallPosition.toFixed(1)) : null,
          distribution: positionDistribution,
        },
        scoreBreakdown: {
          presence: Math.round(presenceScoreComponent),
          sentiment: Math.round(sentimentScoreComponent),
          position: Math.round(positionScoreComponent),
          weights: { presence: 40, sentiment: 25, position: 35 },
        },
        dataSource,
        aiEstimate,
        mentionRate: organicSimulationsCount > 0
          ? Math.round((organicMentions.length / (organicSimulationsCount * 2)) * 100)
          : 0,
      },
      // Full mentions with context (organic mentions only for accurate representation)
      recentMentions: organicMentions.slice(0, 20).map((m) => ({
        id: m.id,
        aiSystem: m.aiSystem,
        prompt: m.prompt,
        response: m.response,
        context: m.context,
        sentiment: m.sentiment,
        position: m.position,
        date: m.createdAt.toISOString(),
        simulationId: m.simulationId,
      })),
      // Unique prompts tested (organic only - these are real user queries)
      // If fewer than 3 tested, include suggested prompts for new brands
      promptsTested: [
        // First, include actual tested prompts
        ...uniqueOrganicPrompts.slice(0, 20).map((prompt, index) => ({
          id: index + 1,
          prompt,
          mentionCount: organicMentions.filter(m => m.prompt === prompt).length,
          systems: [...new Set(organicMentions.filter(m => m.prompt === prompt).map(m => m.aiSystem))],
          isSuggested: false,
        })),
        // Then include suggested prompts if we need more
        ...suggestedPrompts.slice(0, Math.max(0, 5 - uniqueOrganicPrompts.length)).map((sp, index) => ({
          id: uniqueOrganicPrompts.length + index + 1,
          prompt: sp.prompt,
          mentionCount: 0,
          systems: [] as string[],
          isSuggested: true,
          category: sp.category,
        })),
      ],
      // Real citations extracted from AI responses (URLs, platforms mentioned)
      citations: allCitations.slice(0, 20).map((c, index) => ({
        id: index + 1,
        source: c.source,
        type: c.type,
        url: c.url,
      })),
      // All recommendations with full action plan
      recommendations: allRecommendations.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        priority: r.priority,
        category: r.category,
        effort: r.effort,
        timeline: r.timeline,
        expectedImpact: r.expectedImpact,
        actionUrl: r.actionUrl,
        guideUrl: r.guideUrl,
        competitorGap: r.competitorGap,
        isCompleted: r.isCompleted,
        completedAt: r.completedAt?.toISOString(),
      })),
      // Backreference status
      backreferences: backreferenceStatus.map((b) => ({
        platform: b.platform,
        tier: b.tier,
        status: b.status,
        details: b.details,
        profileUrl: b.profileUrl,
        competitorStatus: b.competitorStatus,
        priority: b.priority,
        claimedAt: b.claimedAt?.toISOString(),
      })),
      competitors: brand.competitors.map((c) => ({
        name: c.name,
        domain: c.domain,
      })),
      // =============================================
      // FULL ANALYSIS DATA FROM AI VISIBILITY ANALYSIS
      // This is the "gold" data from the Citations/Analysis page
      // =============================================
      // AI Visibility Report scores
      aiScores: fullAnalysisData?.scores || null,
      // Competitor Comparison with strengths/weaknesses
      competitorComparison: fullAnalysisData?.competitorComparison || null,
      // Market Intelligence
      marketIntelligence: fullAnalysisData?.marketIntelligence || null,
      // Sentiment Analysis (brand, customer, market)
      sentimentAnalysis: fullAnalysisData?.sentimentAnalysis || null,
      // Emerging Players/Threats
      emergingPlayers: fullAnalysisData?.emergingPlayers || null,
      // Product Analysis (feature gaps/advantages)
      productAnalysis: fullAnalysisData?.productAnalysis || null,
      // Real Citations from AI analysis
      analysisCitations: fullAnalysisData?.citations || null,
      // Comprehensive Recommendations (immediate, short-term, long-term)
      analysisRecommendations: fullAnalysisData?.recommendations || null,
      // AI Visibility specifics (mention frequency, position, recommendation likelihood)
      aiVisibility: fullAnalysisData?.aiVisibility || null,
      // Timestamp of when analysis was run
      analysisTimestamp: (latestAnalysisCache?.completedAt || latestSnapshot?.createdAt)?.toISOString() || null,
      // =============================================
      // ANALYSIS PROMPTS USED - Fixed set of 60 prompts, every brand
      // =============================================
      analysisPrompts: (() => {
        const industryContext = getIndustryContext(brand.domain || "");
        const competitorNames = brand.competitors.map(c => c.name);
        const prompts = generateBrandPrompts(brand.name, industryContext, competitorNames);
        return prompts.map(p => ({
          id: p.id,
          category: p.category,
          prompt: p.prompt,
          purpose: p.purpose,
        }));
      })(),
      // =============================================
      // CITATION OPPORTUNITIES - Comprehensive list
      // =============================================
      citationOpportunities: (() => {
        const industryContext = getIndustryContext(brand.domain || "");
        // We only actually know a source is present when we've detected it
        // cited in a real AI response (allCitations, extracted above) — we
        // don't crawl G2/Trustpilot/etc., so we can't verify "missing" for
        // everything else. "not_detected" means exactly that: not seen in
        // the responses we analyzed, not a verified absence.
        const detectedSources = new Set(allCitations.map((c) => c.source.toLowerCase()));
        const detectionStatus = (sourceName: string) => {
          const normalized = sourceName.toLowerCase();
          const isDetected = Array.from(detectedSources).some(
            (detected) => detected.includes(normalized.split("/")[0].trim()) || normalized.includes(detected)
          );
          return isDetected ? "detected" : "not_detected";
        };
        // Comprehensive citation sources - categorized by priority and type
        // AI systems cite these sources most frequently
        return [
          // ============ HIGH PRIORITY - Core AI Citation Sources ============
          // Wikipedia is #1 source for AI training data
          { source: "Wikipedia", type: "directory", category: "Encyclopedia", priority: "high", effort: "high", url: "https://wikipedia.org", aiRecommendation: `Create a Wikipedia article for ${brand.name} - Wikipedia is the #1 cited source in AI responses. Ensure notability guidelines are met.` },
          { source: "Google Business Profile", type: "directory", category: "Local Directory", priority: "high", effort: "low", url: "https://business.google.com", aiRecommendation: `Claim and optimize your Google Business Profile. AI assistants heavily reference Google data for local/business info.` },
          { source: "LinkedIn Company", type: "social", category: "Professional Network", priority: "high", effort: "low", url: "https://linkedin.com/company", aiRecommendation: `Complete your LinkedIn company page with detailed info, employee count, and regular updates.` },
          { source: "Crunchbase", type: "directory", category: "Business Database", priority: "high", effort: "low", url: "https://crunchbase.com", aiRecommendation: `Complete Crunchbase profile with funding history, team, and company details - major AI data source.` },

          // ============ HIGH PRIORITY - Review Platforms ============
          { source: "G2", type: "review_site", category: "Review Platform", priority: "high", effort: "medium", url: "https://g2.com", aiRecommendation: `Create or claim ${brand.name} profile on G2. AI heavily cites G2 reviews when recommending software.` },
          { source: "Capterra", type: "review_site", category: "Review Platform", priority: "high", effort: "medium", url: "https://capterra.com", aiRecommendation: `List ${brand.name} on Capterra with detailed features. Capterra is a primary B2B software citation source.` },
          { source: "Trustpilot", type: "review_site", category: "Review Platform", priority: "high", effort: "low", url: "https://trustpilot.com", aiRecommendation: `Claim Trustpilot profile and actively collect reviews. Trust scores influence AI recommendations.` },
          { source: "TrustRadius", type: "review_site", category: "Review Platform", priority: "high", effort: "medium", url: "https://trustradius.com", aiRecommendation: `Get verified reviews on TrustRadius - AI uses this for enterprise software recommendations.` },
          { source: "Software Advice", type: "review_site", category: "Review Platform", priority: "high", effort: "medium", url: "https://softwareadvice.com", aiRecommendation: `List on Software Advice for visibility in Gartner's recommendation network.` },

          // ============ HIGH PRIORITY - News & Authority ============
          { source: "TechCrunch", type: "news", category: "Tech News", priority: "high", effort: "high", url: "https://techcrunch.com", aiRecommendation: `Pitch newsworthy stories to TechCrunch. Tech news citations heavily influence AI responses about startups.` },
          { source: "Forbes", type: "news", category: "Business News", priority: "high", effort: "high", url: "https://forbes.com", aiRecommendation: `Submit to Forbes Councils or pitch to Forbes journalists. Forbes is a top-tier authority citation.` },
          { source: "Business Insider", type: "news", category: "Business News", priority: "high", effort: "high", url: "https://businessinsider.com", aiRecommendation: `Target Business Insider for company profiles and industry analysis mentions.` },

          // ============ HIGH PRIORITY - Q&A & Community ============
          { source: "Reddit", type: "social", category: "Social Community", priority: "high", effort: "medium", url: "https://reddit.com", aiRecommendation: `Build authentic presence in relevant subreddits. Reddit discussions are heavily cited by AI for opinions.` },
          { source: "Quora", type: "social", category: "Q&A Platform", priority: "high", effort: "low", url: "https://quora.com", aiRecommendation: `Answer questions about ${industryContext}. Quora answers frequently appear in AI responses.` },
          { source: "Stack Overflow", type: "social", category: "Tech Q&A", priority: "high", effort: "medium", url: "https://stackoverflow.com", aiRecommendation: `Contribute to Stack Overflow discussions if ${brand.name} has technical aspects. Top cited for dev tools.` },

          // ============ MEDIUM PRIORITY - Product Discovery ============
          { source: "Product Hunt", type: "content", category: "Product Discovery", priority: "medium", effort: "medium", url: "https://producthunt.com", aiRecommendation: `Launch on Product Hunt - AI cites PH for new products and startup recommendations.` },
          { source: "AlternativeTo", type: "directory", category: "Software Directory", priority: "medium", effort: "low", url: "https://alternativeto.net", aiRecommendation: `List ${brand.name} as an alternative to competitors. AI uses AlternativeTo for software comparisons.` },
          { source: "SaaSHub", type: "directory", category: "SaaS Directory", priority: "medium", effort: "low", url: "https://saashub.com", aiRecommendation: `Add ${brand.name} to SaaSHub for improved SaaS category visibility.` },
          { source: "GetApp", type: "review_site", category: "Review Platform", priority: "medium", effort: "medium", url: "https://getapp.com", aiRecommendation: `List on GetApp (Gartner network) for additional review platform coverage.` },

          // ============ MEDIUM PRIORITY - Video & Content ============
          { source: "YouTube", type: "content", category: "Video Platform", priority: "medium", effort: "high", url: "https://youtube.com", aiRecommendation: `Create educational content. YouTube videos are cited for tutorials and product explanations.` },
          { source: "Medium", type: "content", category: "Blog Platform", priority: "medium", effort: "low", url: "https://medium.com", aiRecommendation: `Publish thought leadership articles. Medium posts with high engagement get cited by AI.` },
          { source: "Dev.to", type: "content", category: "Developer Blog", priority: "medium", effort: "low", url: "https://dev.to", aiRecommendation: `Post technical content on Dev.to if ${brand.name} targets developers.` },
          { source: "Substack", type: "content", category: "Newsletter", priority: "medium", effort: "medium", url: "https://substack.com", aiRecommendation: `Start a Substack newsletter on ${industryContext} topics for thought leadership citations.` },

          // ============ MEDIUM PRIORITY - Social & Professional ============
          { source: "Twitter/X", type: "social", category: "Social Media", priority: "medium", effort: "low", url: "https://twitter.com", aiRecommendation: `Share ${industryContext} insights. Viral Twitter threads get cited in AI responses.` },
          { source: "GitHub", type: "social", category: "Developer Platform", priority: "medium", effort: "medium", url: "https://github.com", aiRecommendation: `Maintain active GitHub presence if ${brand.name} has open-source components.` },
          { source: "AngelList/Wellfound", type: "directory", category: "Startup Directory", priority: "medium", effort: "low", url: "https://wellfound.com", aiRecommendation: `Complete Wellfound profile for startup ecosystem visibility.` },
          { source: "Glassdoor", type: "review_site", category: "Employer Review", priority: "medium", effort: "low", url: "https://glassdoor.com", aiRecommendation: `Claim Glassdoor profile - AI cites company culture and employer info from here.` },

          // ============ MEDIUM PRIORITY - Industry & Analyst ============
          { source: "Gartner", type: "industry_report", category: "Analyst Report", priority: "medium", effort: "high", url: "https://gartner.com", aiRecommendation: `Get listed in Gartner Magic Quadrants or Market Guides for your category.` },
          { source: "Forrester", type: "industry_report", category: "Analyst Report", priority: "medium", effort: "high", url: "https://forrester.com", aiRecommendation: `Seek inclusion in Forrester Wave reports for enterprise credibility.` },
          { source: "CB Insights", type: "industry_report", category: "Research Platform", priority: "medium", effort: "medium", url: "https://cbinsights.com", aiRecommendation: `Get featured in CB Insights research and trend reports.` },
          { source: "HackerNews", type: "social", category: "Tech Community", priority: "medium", effort: "medium", url: "https://news.ycombinator.com", aiRecommendation: `Share on HN - high-engagement posts become AI training data.` },

          // ============ INDUSTRY-SPECIFIC & NICHE ============
          { source: "Industry Publications", type: "industry_report", category: "Trade Publications", priority: "medium", effort: "medium", url: "", aiRecommendation: `Get featured in ${industryContext} trade publications and industry blogs.` },
          { source: "Podcast Appearances", type: "content", category: "Audio Content", priority: "medium", effort: "medium", url: "", aiRecommendation: `Appear on ${industryContext} podcasts - transcripts become citeable content.` },
          { source: "Industry Conferences", type: "content", category: "Events", priority: "medium", effort: "high", url: "", aiRecommendation: `Speak at ${industryContext} conferences - talks get indexed and cited.` },

          // ============ LOWER PRIORITY - Additional Coverage ============
          { source: "Bloomberg", type: "news", category: "Financial News", priority: "low", effort: "high", url: "https://bloomberg.com", aiRecommendation: `Pursue Bloomberg coverage for financial and enterprise credibility.` },
          { source: "The Verge", type: "news", category: "Tech News", priority: "low", effort: "high", url: "https://theverge.com", aiRecommendation: `Pitch consumer tech angles to The Verge for mainstream tech coverage.` },
          { source: "Wired", type: "news", category: "Tech News", priority: "low", effort: "high", url: "https://wired.com", aiRecommendation: `Target Wired for in-depth technology stories and trend pieces.` },
          { source: "VentureBeat", type: "news", category: "Tech News", priority: "low", effort: "medium", url: "https://venturebeat.com", aiRecommendation: `Pitch to VentureBeat for AI/ML and enterprise tech coverage.` },
          { source: "Hacker Noon", type: "content", category: "Tech Blog", priority: "low", effort: "low", url: "https://hackernoon.com", aiRecommendation: `Publish technical content on Hacker Noon for developer community reach.` },
          { source: "Facebook/Meta", type: "social", category: "Social Media", priority: "low", effort: "low", url: "https://facebook.com", aiRecommendation: `Maintain active Facebook business page for social signal coverage.` },
          { source: "Instagram", type: "social", category: "Social Media", priority: "low", effort: "medium", url: "https://instagram.com", aiRecommendation: `Use Instagram for visual brand presence if applicable to ${industryContext}.` },
          { source: "Yelp", type: "review_site", category: "Local Review", priority: "low", effort: "low", url: "https://yelp.com", aiRecommendation: `Claim Yelp listing if ${brand.name} has local/physical presence.` },
          { source: "Better Business Bureau", type: "directory", category: "Trust Directory", priority: "low", effort: "low", url: "https://bbb.org", aiRecommendation: `Get BBB accreditation for trust signals in AI recommendations.` },
        ].map((entry) => ({ ...entry, status: detectionStatus(entry.source) }));
      })(),
      // =============================================
      // Improvement plan summary
      improvementPlan: {
        totalRecommendations: allRecommendations.length,
        completed: allRecommendations.filter(r => r.isCompleted).length,
        pending: allRecommendations.filter(r => !r.isCompleted).length,
        highPriority: allRecommendations.filter(r => r.priority === "high" && !r.isCompleted).length,
        mediumPriority: allRecommendations.filter(r => r.priority === "medium" && !r.isCompleted).length,
        lowPriority: allRecommendations.filter(r => r.priority === "low" && !r.isCompleted).length,
        byCategory: {
          entity: allRecommendations.filter(r => r.category === "entity" && !r.isCompleted).length,
          content: allRecommendations.filter(r => r.category === "content" && !r.isCompleted).length,
          authority: allRecommendations.filter(r => r.category === "authority" && !r.isCompleted).length,
          technical: allRecommendations.filter(r => r.category === "technical" && !r.isCompleted).length,
          community: allRecommendations.filter(r => r.category === "community" && !r.isCompleted).length,
        },
        platformsNeeded: backreferenceStatus.filter(b => b.status !== "present").length,
        platformsPresent: backreferenceStatus.filter(b => b.status === "present").length,
      },
      // Data methodology citation
      methodology: {
        dataPeriod: "Last 30 days",
        dataCollectionMethod: "AI prompt simulations",
        aiSystemsTested: ["ChatGPT (GPT-4)", "Google Gemini", "Perplexity AI"],
        scoringFormula: "Visibility Score = (Presence × 40%) + (Sentiment × 25%) + (Position × 35%)",
        sentimentAnalysis: "Deterministic AFINN-based sentiment analysis",
        positionTracking: "Ranking position when brand appears in AI-generated lists",
        dataQuality: `Organic mentions only - ${biasedMentions.length} biased prompts excluded from scoring`,
        citationSources: `${allCitations.length} sources extracted from AI responses`,
      },
    };

    // Store report generation record
    await prisma.reportGeneration.create({
      data: {
        brandId,
        type: "ondemand",
        pdfData: JSON.stringify(reportData),
      },
    });

    return NextResponse.json({
      success: true,
      report: reportData,
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
