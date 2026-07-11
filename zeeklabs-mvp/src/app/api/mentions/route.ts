import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get("brandId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Get user's brands to verify ownership
    const userBrands = await prisma.brand.findMany({
      where: { userId: session.user.id },
      select: { id: true },
    });

    const brandIds = userBrands.map((b) => b.id);

    // Build where clause - filter by specific brandId if provided, otherwise all user's brands
    const whereClause: Record<string, unknown> = {
      isCompetitor: false, // Only show brand mentions, not competitor mentions
    };

    if (brandId) {
      // Verify user owns this brand
      if (!brandIds.includes(brandId)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      whereClause.brandId = brandId;
    } else {
      whereClause.brandId = { in: brandIds };
    }

    const mentions = await prisma.mention.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        brand: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json(mentions);
  } catch (error) {
    console.error("Error fetching mentions:", error);
    return NextResponse.json(
      { error: "Failed to fetch mentions" },
      { status: 500 }
    );
  }
}
