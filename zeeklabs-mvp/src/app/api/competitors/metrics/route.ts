import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeCompetitorMetrics } from "@/lib/competitor-metrics";

export type { CompetitorMetric } from "@/lib/competitor-metrics";

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

    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: session.user.id },
      include: { competitors: true },
    });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    const { comparisonSimulationsCount, competitors, shareOfVoice } =
      await computeCompetitorMetrics(brandId, brand.name, brand.competitors, days);

    return NextResponse.json({ competitors, comparisonSimulationsCount, shareOfVoice });
  } catch (error) {
    console.error("Error fetching competitor metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch competitor metrics" },
      { status: 500 }
    );
  }
}
