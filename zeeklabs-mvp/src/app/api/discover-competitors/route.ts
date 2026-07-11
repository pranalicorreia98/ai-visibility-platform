import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { callGeminiWithRetry, callPerplexityWithRetry } from "@/lib/ai-providers";

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { brandName, domain, industry } = await req.json();

    if (!brandName) {
      return NextResponse.json({ error: "Brand name is required" }, { status: 400 });
    }

    // Build the prompt for competitor discovery
    const prompt = `You are a competitive intelligence analyst. I need you to identify the top 5 direct competitors for:

Brand/Company: ${brandName}
${domain ? `Website: ${domain}` : ""}
${industry ? `Industry: ${industry}` : ""}

Please analyze and return the top 5 most relevant direct competitors that:
1. Operate in the same market/industry
2. Target similar customers
3. Offer competing products or services

Return ONLY a valid JSON array with exactly 5 competitors in this format:
[
  {"name": "Competitor Name", "domain": "competitor.com", "reason": "Brief reason why they compete"},
  ...
]

Important:
- Only include real, established companies
- Focus on direct competitors, not tangential businesses
- Include their actual website domain if known
- Be specific and accurate`;

    let competitors: Array<{ name: string; domain?: string; reason?: string }> = [];
    let provider = "unknown";

    // Try Perplexity first (better for real-time company data)
    if (process.env.PERPLEXITY_API_KEY) {
      try {
        console.log("Discovering competitors via Perplexity...");
        const response = await callPerplexityWithRetry(prompt);
        provider = "perplexity";

        // Extract JSON from response
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          competitors = JSON.parse(jsonMatch[0]);
        }
      } catch (error) {
        console.log("Perplexity failed, trying Gemini...", error);
      }
    }

    // Fallback to Gemini
    if (competitors.length === 0 && process.env.GOOGLE_AI_API_KEY) {
      try {
        console.log("Discovering competitors via Gemini...");
        const response = await callGeminiWithRetry(prompt);
        provider = "gemini";

        // Extract JSON from response
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          competitors = JSON.parse(jsonMatch[0]);
        }
      } catch (error) {
        console.log("Gemini failed:", error);
      }
    }

    // Validate and clean up the response
    if (!Array.isArray(competitors) || competitors.length === 0) {
      return NextResponse.json(
        { error: "Could not discover competitors. Please try again or add manually." },
        { status: 500 }
      );
    }

    // Ensure we have valid competitor objects
    const validCompetitors = competitors
      .filter((c) => c && typeof c.name === "string" && c.name.trim())
      .slice(0, 5)
      .map((c) => ({
        name: c.name.trim(),
        domain: c.domain?.replace(/^https?:\/\//, "").replace(/\/$/, "") || undefined,
        reason: c.reason || undefined,
      }));

    if (validCompetitors.length === 0) {
      return NextResponse.json(
        { error: "Could not identify valid competitors. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      competitors: validCompetitors,
      provider,
      message: `Found ${validCompetitors.length} competitors using ${provider}`,
    });
  } catch (error) {
    console.error("Error discovering competitors:", error);
    return NextResponse.json(
      { error: "Failed to discover competitors" },
      { status: 500 }
    );
  }
}
