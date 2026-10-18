import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getUserLimits, canAddBrand, withinCompetitorCap } from "@/lib/billing/entitlements";

const brandSchema = z.object({
  name: z.string().min(1).max(100),
  domain: z.string().optional(),
  alternateNames: z.array(z.string()).optional(),
  competitors: z
    .array(
      z.object({
        name: z.string().min(1),
        domain: z.string().optional(),
        source: z.enum(["ai", "manual"]).optional(),
      })
    )
    // Absolute anti-abuse ceiling; the real per-tier cap is enforced below
    // against the user's plan (Scale is "unlimited" — no realistic brand tracks 100).
    .max(100)
    .optional(),
});

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const brands = await prisma.brand.findMany({
      where: { userId: session.user.id },
      include: { competitors: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(brands);
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = brandSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { name, domain, alternateNames, competitors } = validation.data;

    // Feature gates — fail loud, never silently drop over-limit data.
    const limits = await getUserLimits(session.user.id);

    const brandCount = await prisma.brand.count({ where: { userId: session.user.id } });
    if (!canAddBrand(brandCount, limits)) {
      return NextResponse.json(
        {
          error: `Your plan includes ${limits.brands} brand${limits.brands === 1 ? "" : "s"}. Upgrade to track more.`,
          code: "BRAND_LIMIT",
          limit: limits.brands,
        },
        { status: 403 }
      );
    }

    const competitorCount = competitors?.length ?? 0;
    if (!withinCompetitorCap(competitorCount, limits)) {
      return NextResponse.json(
        {
          error: `Your plan allows ${limits.competitorsPerBrand} competitors per brand. Upgrade to add more.`,
          code: "COMPETITOR_LIMIT",
          limit: limits.competitorsPerBrand,
        },
        { status: 403 }
      );
    }

    const brand = await prisma.brand.create({
      data: {
        userId: session.user.id,
        name,
        domain,
        alternateNames: alternateNames ? JSON.stringify(alternateNames) : null,
        competitors: competitors
          ? {
              create: competitors.map((c) => ({
                name: c.name,
                domain: c.domain,
                source: c.source ?? "ai",
              })),
            }
          : undefined,
      },
      include: { competitors: true },
    });

    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    console.error("Error creating brand:", error);
    return NextResponse.json(
      { error: "Failed to create brand" },
      { status: 500 }
    );
  }
}
