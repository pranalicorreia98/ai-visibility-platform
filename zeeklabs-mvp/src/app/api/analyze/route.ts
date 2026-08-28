import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

// Cache duration: 24 hours in milliseconds
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

/**
 * Generate a consistent cache key for competitor IDs
 * Sorts IDs to ensure same combination always produces same key
 */
function generateCompetitorCacheKey(competitorIds: string[]): string {
  return JSON.stringify([...competitorIds].sort());
}

/**
 * Check if a valid cache entry exists for this analysis
 * Returns the cached analysis if valid, null otherwise
 */
async function getValidCache(
  brandId: string,
  provider: string,
  competitorIds: string[]
): Promise<{
  isValid: boolean;
  cache: {
    id: string;
    status: string;
    analysisData: string | null;
    errorMessage: string | null;
    actualProvider: string | null;
    durationMs: number | null;
    createdAt: Date;
    expiresAt: Date;
  } | null;
  canRetry: boolean;
}> {
  const competitorKey = generateCompetitorCacheKey(competitorIds);

  // Find any cache entry for this combination
  const cache = await prisma.analysisCache.findUnique({
    where: {
      brandId_provider_competitorIds: {
        brandId,
        provider,
        competitorIds: competitorKey,
      },
    },
  });

  if (!cache) {
    return { isValid: false, cache: null, canRetry: true };
  }

  const now = new Date();

  // Check if cache has expired
  if (now > cache.expiresAt) {
    // Cache expired, delete it and allow fresh run
    await prisma.analysisCache.delete({ where: { id: cache.id } });
    return { isValid: false, cache: null, canRetry: true };
  }

  // Check cache status
  if (cache.status === "success" && cache.analysisData) {
    // Valid successful cache - return cached data
    return { isValid: true, cache, canRetry: false };
  }

  if (cache.status === "failed") {
    // Previous run failed - allow retry
    // Delete the failed cache entry so user can try again
    await prisma.analysisCache.delete({ where: { id: cache.id } });
    return { isValid: false, cache: null, canRetry: true };
  }

  if (cache.status === "pending") {
    // Analysis is currently in progress
    // Check if it's been pending for too long (5 minutes = likely stuck)
    const pendingTimeout = 5 * 60 * 1000; // 5 minutes
    const pendingDuration = now.getTime() - cache.createdAt.getTime();

    if (pendingDuration > pendingTimeout) {
      // Stuck pending - delete and allow retry
      await prisma.analysisCache.delete({ where: { id: cache.id } });
      return { isValid: false, cache: null, canRetry: true };
    }

    // Still pending - don't allow duplicate run
    return {
      isValid: false,
      cache,
      canRetry: false,
    };
  }

  // Unknown status - allow retry
  return { isValid: false, cache: null, canRetry: true };
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { brandId, competitorIds, provider = "gemini", forceRefresh = false } = body;

    if (!brandId) {
      return NextResponse.json({ error: "Brand ID required" }, { status: 400 });
    }

    // Get brand with competitors
    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: session.user.id },
      include: { competitors: true },
    });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Filter competitors if specific ones selected
    let selectedCompetitors = brand.competitors;
    if (competitorIds && Array.isArray(competitorIds) && competitorIds.length > 0) {
      selectedCompetitors = brand.competitors.filter((c) =>
        competitorIds.includes(c.id)
      );
    }

    if (selectedCompetitors.length === 0) {
      return NextResponse.json(
        { error: "At least one competitor is required for analysis" },
        { status: 400 }
      );
    }

    const selectedCompetitorIds = selectedCompetitors.map(c => c.id);
    const competitorKey = generateCompetitorCacheKey(selectedCompetitorIds);

    // Check for valid cache (unless force refresh is requested)
    if (!forceRefresh) {
      const cacheResult = await getValidCache(brandId, provider, selectedCompetitorIds);

      if (cacheResult.isValid && cacheResult.cache?.analysisData) {
        // Return cached data
        console.log(`Analysis cache HIT for brand ${brand.name} - returning cached data`);
        const cachedAnalysis = JSON.parse(cacheResult.cache.analysisData);

        return NextResponse.json({
          success: true,
          cached: true,
          cacheExpiry: cacheResult.cache.expiresAt.toISOString(),
          brand: {
            id: brand.id,
            name: brand.name,
            domain: brand.domain,
          },
          competitors: selectedCompetitors.map((c) => ({
            id: c.id,
            name: c.name,
          })),
          analysis: cachedAnalysis,
          meta: {
            provider: cacheResult.cache.actualProvider || provider,
            duration: cacheResult.cache.durationMs || 0,
            timestamp: cacheResult.cache.createdAt.toISOString(),
            fromCache: true,
          },
        });
      }

      if (!cacheResult.canRetry) {
        // Analysis is currently in progress
        return NextResponse.json(
          {
            error: "Analysis is already in progress. Please wait for it to complete.",
            status: "pending"
          },
          { status: 409 }
        );
      }
    } else {
      // Force refresh requested - delete any existing cache for this combination
      console.log(`Force refresh requested for brand ${brand.name} - clearing cache`);
      await prisma.analysisCache.deleteMany({
        where: {
          brandId,
          provider,
          competitorIds: competitorKey,
        },
      });
    }

    // Check rate limit
    const rateLimitProvider = provider === "chatgpt" ? "chatgpt" : provider === "perplexity" ? "perplexity" : "gemini";
    const canProceed = await checkRateLimit(rateLimitProvider);
    if (!canProceed) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Please try again later.` },
        { status: 429 }
      );
    }

    // Create a pending cache entry before starting analysis
    const expiresAt = new Date(Date.now() + CACHE_DURATION_MS);
    let cacheEntry;
    try {
      cacheEntry = await prisma.analysisCache.create({
        data: {
          brandId,
          provider,
          competitorIds: competitorKey,
          status: "pending",
          expiresAt,
        },
      });
      console.log(`Analysis cache entry created (pending) for brand ${brand.name}`);
    } catch (error) {
      // Handle race condition - another request might have created the entry
      console.log("Cache entry creation failed - possibly due to race condition");
      return NextResponse.json(
        {
          error: "Analysis is already in progress. Please wait for it to complete.",
          status: "pending"
        },
        { status: 409 }
      );
    }

    // Job is queued (AnalysisCache row with status "pending"). The
    // analysis-worker process (scripts/analysis-worker.ts) claims it and runs
    // the actual AI call + save; the client polls
    // GET /api/analyze/status/:cacheId until it flips to success/failed.
    console.log(`Analysis job queued for brand ${brand.name}, cache ${cacheEntry.id}`);

    return NextResponse.json({
      success: true,
      cached: false,
      pending: true,
      cacheId: cacheEntry.id,
      cacheExpiry: expiresAt.toISOString(),
      brand: {
        id: brand.id,
        name: brand.name,
        domain: brand.domain,
      },
      competitors: selectedCompetitors.map((c) => ({
        id: c.id,
        name: c.name,
      })),
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
