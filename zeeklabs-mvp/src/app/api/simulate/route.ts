import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  callChatGPTWithFallbackChain,
  callGeminiWithFallbackChain,
  callPerplexityWithFallbackChain,
} from "@/lib/ai-fallback-chains";
import { detectMentions, analyzeSentiment, detectPosition } from "@/lib/analysis";
import { checkRateLimit, recordUsage } from "@/lib/rate-limit";
import {
  generateCacheKey,
  getCachedResponse,
  setCachedResponse,
  findSimilarCachedPrompts,
} from "@/lib/prompt-cache";
import { extractCitationsFromResponse, type ExtractedCitation } from "@/lib/citations";
import { isAdminEmail } from "@/lib/admin";
import { CREDITS_PER_PROMPT_LAB, spendCredits, grantCredits, InsufficientCreditsError } from "@/lib/credits";

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt, systems, brandId } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    if (!systems || !Array.isArray(systems) || systems.length === 0) {
      return NextResponse.json(
        { error: "At least one AI system must be selected" },
        { status: 400 }
      );
    }

    // Flat cost per submission regardless of model count or per-system cache
    // hits within it (the caching below is per-system and interleaved with
    // execution, so a clean "only charge for genuinely fresh calls" check
    // isn't separable the way it is in api/analyze). Admins are exempt so
    // testing never blocks on credits.
    const isAdmin = isAdminEmail(session.user.email);
    if (!isAdmin) {
      try {
        await spendCredits(
          session.user.id,
          CREDITS_PER_PROMPT_LAB,
          "PROMPT_LAB_SPEND",
          `Prompt Lab run: "${prompt.slice(0, 80)}"`
        );
      } catch (err) {
        if (err instanceof InsufficientCreditsError) {
          return NextResponse.json(
            {
              error: `Not enough credits. A Prompt Lab run costs ${CREDITS_PER_PROMPT_LAB} credits and you have ${err.balance}. Contact founder@zeeklabs.ai to top up.`,
              insufficientCredits: true,
              balance: err.balance,
              required: err.required,
            },
            { status: 402 }
          );
        }
        throw err;
      }
    }

    // Get brand info for analysis (used to detect mentions, NOT to inject into prompt)
    console.log("Received brandId:", brandId);

    const brand = brandId
      ? await prisma.brand.findUnique({
          where: { id: brandId },
          include: { competitors: true },
        })
      : null;

    console.log("Found brand:", brand ? { name: brand.name, competitors: brand.competitors?.map(c => c.name) } : "No brand found");

    // Use the exact user prompt WITHOUT any brand injection
    // This tests whether AI naturally mentions the brand without prompting
    const enhancedPrompt = prompt;
    console.log("Using original prompt - no brand injection (testing natural AI visibility)");

    // Check rate limits for all requested systems
    for (const system of systems) {
      if (system !== "chatgpt" && system !== "gemini" && system !== "perplexity") continue;
      const canProceed = await checkRateLimit(system as "chatgpt" | "gemini" | "perplexity");
      if (!canProceed) {
        return NextResponse.json(
          { error: `Rate limit exceeded for ${system}. Please try again tomorrow.` },
          { status: 429 }
        );
      }
    }

    // Call AI providers with caching
    const results: Record<string, string | { error: string }> = {};
    const providers: Record<string, string> = {}; // Track which provider was actually used
    const cacheHits: Record<string, boolean> = {}; // Track cache hits
    const errors: string[] = [];

    console.log("Enhanced prompt:", enhancedPrompt);

    await Promise.all(
      systems.map(async (system: string) => {
        try {
          if (system !== "chatgpt" && system !== "gemini" && system !== "perplexity") return;

          // Check cache first if brand is selected
          if (brandId) {
            const cacheKey = generateCacheKey(enhancedPrompt, brandId, system);
            const cached = await getCachedResponse(cacheKey);

            if (cached) {
              console.log(`✓ Cache hit for ${system}`);
              results[system] = cached.response;
              providers[system] = `${system} (cached)`;
              cacheHits[system] = true;
              return;
            }

            // Check for similar cached prompts (semantic matching)
            const similar = await findSimilarCachedPrompts(enhancedPrompt, brandId, system, 0.75);
            if (similar.length > 0 && similar[0].similarity > 0.85) {
              console.log(`✓ Similar cache hit for ${system} (similarity: ${similar[0].similarity.toFixed(2)})`);
              results[system] = similar[0].response;
              providers[system] = `${system} (similar cache)`;
              cacheHits[system] = true;
              return;
            }
          }

          cacheHits[system] = false;

          if (system === "chatgpt") {
            const { response, provider } = await callChatGPTWithFallbackChain(enhancedPrompt);
            results.chatgpt = response;
            providers.chatgpt = provider;
            await recordUsage("chatgpt");

            // Cache the response
            if (brandId) {
              const cacheKey = generateCacheKey(enhancedPrompt, brandId, system);
              await setCachedResponse(cacheKey, brandId, enhancedPrompt, system, response, null);
            }
          } else if (system === "gemini") {
            const { response, provider } = await callGeminiWithFallbackChain(enhancedPrompt);
            results.gemini = response;
            providers.gemini = provider;
            await recordUsage("gemini");

            // Cache the response
            if (brandId) {
              const cacheKey = generateCacheKey(enhancedPrompt, brandId, system);
              await setCachedResponse(cacheKey, brandId, enhancedPrompt, system, response, null);
            }
          } else if (system === "perplexity") {
            const { response, provider } = await callPerplexityWithFallbackChain(enhancedPrompt);
            results.perplexity = response;
            providers.perplexity = provider;
            await recordUsage("perplexity");

            // Cache the response
            if (brandId) {
              const cacheKey = generateCacheKey(enhancedPrompt, brandId, system);
              await setCachedResponse(cacheKey, brandId, enhancedPrompt, system, response, null);
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          results[system] = { error: errorMessage };
          errors.push(`${system}: ${errorMessage}`);
        }
      })
    );

    // Analyze responses
    const analysis: Record<string, {
      mentions: ReturnType<typeof detectMentions>;
      sentiment: number;
      position: number | null;
    } | null> = {};

    const citations: Record<string, ExtractedCitation[]> = {};

    for (const system of ["chatgpt", "gemini", "perplexity"]) {
      const response = results[system];
      if (typeof response === "string") {
        analysis[system] = {
          mentions: detectMentions(response, brand),
          sentiment: analyzeSentiment(response, brand?.name || null),
          position: detectPosition(response, brand?.name || null),
        };
        citations[system] = extractCitationsFromResponse(response);
      } else {
        analysis[system] = null;
      }
    }

    // Tagged manual_test (not the "organic" default) so this ad-hoc,
    // user-typed prompt never counts toward the brand's organic visibility
    // score - see isOrganicPromptType in lib/biased-prompt.ts. Otherwise a
    // user could type a leading prompt here to inflate their own score.
    const simulation = await prisma.simulation.create({
      data: {
        userId: session.user.id,
        brandId: brandId || null,
        prompt,
        promptType: "manual_test",
        chatgptResponse: typeof results.chatgpt === "string" ? results.chatgpt : null,
        geminiResponse: typeof results.gemini === "string" ? results.gemini : null,
        perplexityResponse: typeof results.perplexity === "string" ? results.perplexity : null,
        chatgptMentions: analysis.chatgpt ? JSON.stringify(analysis.chatgpt.mentions) : null,
        geminiMentions: analysis.gemini ? JSON.stringify(analysis.gemini.mentions) : null,
        perplexityMentions: analysis.perplexity ? JSON.stringify(analysis.perplexity.mentions) : null,
        chatgptSentiment: analysis.chatgpt?.sentiment || null,
        geminiSentiment: analysis.gemini?.sentiment || null,
        perplexitySentiment: analysis.perplexity?.sentiment || null,
        chatgptPosition: analysis.chatgpt?.position || null,
        geminiPosition: analysis.gemini?.position || null,
        perplexityPosition: analysis.perplexity?.position || null,
      },
    });

    // Create mention records if brand exists.
    // Only when the brand was actually mentioned — a Mention row is used
    // downstream as the numerator for presence (mentions / simulations), so
    // a row must mean "the brand was found here," not "we ran a query."
    // (Previously created a row unconditionally with a "NOT mentioned"
    // placeholder context, which silently inflated every presence score —
    // full Simulation rows already track that a query ran either way.)
    if (brand) {
      for (const system of ["chatgpt", "gemini", "perplexity"]) {
        const response = results[system];
        if (typeof response === "string" && analysis[system]) {
          const allMentions = analysis[system]!.mentions;
          const brandMentions = allMentions.filter((m) => !m.isCompetitor);
          const wasMentioned = brandMentions.length > 0;

          if (wasMentioned) {
            await prisma.mention.create({
              data: {
                brandId: brand.id,
                simulationId: simulation.id,
                aiSystem: system,
                prompt,
                response: response.slice(0, 2000), // Truncate for storage
                context: brandMentions[0].context,
                sentiment: analysis[system]!.sentiment,
                position: analysis[system]!.position,
                isCompetitor: false,
              },
            });
          }

          // Persist competitor mentions detected in this same response —
          // previously computed by detectMentions() and then discarded.
          // Position/sentiment are measured per-competitor with the same
          // deterministic pipeline used for the brand (detectPosition/
          // analyzeSentiment are name-agnostic).
          if (brand.competitors && brand.competitors.length > 0) {
            const mentionedCompetitorNames = new Set(
              allMentions
                .filter((m) => m.isCompetitor && m.competitorName)
                .map((m) => m.competitorName!)
            );
            for (const competitorName of mentionedCompetitorNames) {
              const entries = allMentions.filter((m) => m.competitorName === competitorName);
              await prisma.mention.create({
                data: {
                  brandId: brand.id,
                  simulationId: simulation.id,
                  aiSystem: system,
                  prompt,
                  response: response.slice(0, 2000),
                  context: entries[0].context,
                  sentiment: analyzeSentiment(response, competitorName),
                  position: detectPosition(response, competitorName),
                  isCompetitor: true,
                  competitorName,
                },
              });
            }
          }
        }
      }
    }

    // Nothing was delivered for the credits spent - refund in full. Partial
    // failures (at least one system succeeded) keep the charge, since the
    // user still got a real, usable comparison.
    const allFailed = errors.length === systems.length;
    if (!isAdmin && allFailed) {
      await grantCredits(
        session.user.id,
        CREDITS_PER_PROMPT_LAB,
        "PROMPT_LAB_REFUND",
        "Refund: every provider failed for this Prompt Lab run"
      );
    }

    return NextResponse.json({
      id: simulation.id,
      prompt,
      results: {
        chatgpt: typeof results.chatgpt === "string" ? results.chatgpt : null,
        gemini: typeof results.gemini === "string" ? results.gemini : null,
        perplexity: typeof results.perplexity === "string" ? results.perplexity : null,
      },
      providers, // Which provider was actually used (e.g., "gemini (via OpenRouter)")
      cacheHits, // Whether response came from cache
      citations, // URLs/known platforms extracted from each response
      errors: errors.length > 0 ? errors : undefined,
      refunded: allFailed,
      analysis,
    });
  } catch (error) {
    console.error("Simulation error:", error);
    return NextResponse.json(
      { error: "Failed to run simulation" },
      { status: 500 }
    );
  }
}
