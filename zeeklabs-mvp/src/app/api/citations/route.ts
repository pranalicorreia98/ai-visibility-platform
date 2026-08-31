import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractCitationsFromSimulations } from "@/lib/citations";

/**
 * Real citations extracted from actual AI response text (URLs + known
 * platform names mentioned) — measured, not guessed or crawled.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get("brandId");
    const days = parseInt(searchParams.get("days") || "30");

    if (!brandId) {
      return NextResponse.json({ error: "brandId is required" }, { status: 400 });
    }

    const brand = await prisma.brand.findFirst({ where: { id: brandId, userId: session.user.id } });
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const simulations = await prisma.simulation.findMany({
      where: { brandId, createdAt: { gte: startDate } },
      orderBy: { createdAt: "desc" },
      select: {
        prompt: true,
        createdAt: true,
        chatgptResponse: true,
        geminiResponse: true,
        perplexityResponse: true,
      },
    });

    const citations = extractCitationsFromSimulations(simulations);

    return NextResponse.json({ citations, simulationsAnalyzed: simulations.length });
  } catch (error) {
    console.error("Error extracting citations:", error);
    return NextResponse.json({ error: "Failed to extract citations" }, { status: 500 });
  }
}
