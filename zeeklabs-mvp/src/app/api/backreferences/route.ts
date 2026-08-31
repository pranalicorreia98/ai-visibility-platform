import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Self-reported platform presence (BackreferenceStatus). This is real,
 * user-asserted data — "I have a G2 profile, 4.2 stars, 12 reviews" — not
 * auto-detected. The dashboard makes clear it's self-reported, not measured.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get("brandId");
    if (!brandId) {
      return NextResponse.json({ error: "brandId is required" }, { status: 400 });
    }

    const brand = await prisma.brand.findFirst({ where: { id: brandId, userId: session.user.id } });
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    const statuses = await prisma.backreferenceStatus.findMany({
      where: { brandId },
      orderBy: { platform: "asc" },
    });

    return NextResponse.json({ statuses });
  } catch (error) {
    console.error("Error fetching backreference status:", error);
    return NextResponse.json({ error: "Failed to fetch backreference status" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { brandId, platform, tier, status, details, profileUrl, priority } = body;

    if (!brandId || !platform || !status) {
      return NextResponse.json({ error: "brandId, platform, and status are required" }, { status: 400 });
    }
    if (!["present", "missing", "incomplete"].includes(status)) {
      return NextResponse.json({ error: "status must be present, missing, or incomplete" }, { status: 400 });
    }

    const brand = await prisma.brand.findFirst({ where: { id: brandId, userId: session.user.id } });
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    const saved = await prisma.backreferenceStatus.upsert({
      where: { brandId_platform: { brandId, platform } },
      create: {
        brandId,
        platform,
        tier: tier || "foundation",
        status,
        details: details || null,
        profileUrl: profileUrl || null,
        priority: priority || "medium",
        claimedAt: status === "present" ? new Date() : null,
      },
      update: {
        status,
        details: details || null,
        profileUrl: profileUrl || null,
        lastCheckedAt: new Date(),
        claimedAt: status === "present" ? new Date() : null,
      },
    });

    return NextResponse.json({ status: saved });
  } catch (error) {
    console.error("Error saving backreference status:", error);
    return NextResponse.json({ error: "Failed to save backreference status" }, { status: 500 });
  }
}
