import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET - Get monitoring configuration for a brand
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
      return NextResponse.json({ error: "Brand ID required" }, { status: 400 });
    }

    // Verify brand ownership
    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: session.user.id },
    });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Get or create monitoring config
    let config = await prisma.monitoringConfig.findUnique({
      where: { brandId },
    });

    if (!config) {
      config = await prisma.monitoringConfig.create({
        data: {
          brandId,
          enabled: false,
          frequency: "daily",
          prompts: JSON.stringify([
            "What is the best {industry} software?",
            "Compare {brand} with competitors",
            "Recommend a {industry} solution",
          ]),
        },
      });
    }

    return NextResponse.json({
      config: {
        ...config,
        prompts: config.prompts ? JSON.parse(config.prompts) : [],
      },
    });
  } catch (error) {
    console.error("Get monitoring config error:", error);
    return NextResponse.json(
      { error: "Failed to get monitoring configuration" },
      { status: 500 }
    );
  }
}

/**
 * POST - Update monitoring configuration
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { brandId, enabled, frequency, prompts } = body;

    if (!brandId) {
      return NextResponse.json({ error: "Brand ID required" }, { status: 400 });
    }

    // Validate frequency
    const validFrequencies = ["hourly", "every6hours", "every12hours", "daily", "weekly"];
    if (frequency && !validFrequencies.includes(frequency)) {
      return NextResponse.json(
        { error: "Invalid frequency. Valid options: " + validFrequencies.join(", ") },
        { status: 400 }
      );
    }

    // Verify brand ownership
    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: session.user.id },
    });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Calculate next run time based on frequency
    const getNextRunTime = (freq: string): Date => {
      const now = new Date();
      switch (freq) {
        case "hourly":
          return new Date(now.getTime() + 60 * 60 * 1000);
        case "every6hours":
          return new Date(now.getTime() + 6 * 60 * 60 * 1000);
        case "every12hours":
          return new Date(now.getTime() + 12 * 60 * 60 * 1000);
        case "weekly":
          return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        case "daily":
        default:
          return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      }
    };

    // Upsert monitoring config
    const config = await prisma.monitoringConfig.upsert({
      where: { brandId },
      update: {
        enabled: enabled !== undefined ? enabled : undefined,
        frequency: frequency || undefined,
        prompts: prompts ? JSON.stringify(prompts) : undefined,
        nextRunAt: enabled ? getNextRunTime(frequency || "daily") : null,
        updatedAt: new Date(),
      },
      create: {
        brandId,
        enabled: enabled ?? true,
        frequency: frequency || "daily",
        prompts: prompts ? JSON.stringify(prompts) : JSON.stringify([]),
        nextRunAt: getNextRunTime(frequency || "daily"),
      },
    });

    return NextResponse.json({
      success: true,
      config: {
        ...config,
        prompts: config.prompts ? JSON.parse(config.prompts) : [],
      },
    });
  } catch (error) {
    console.error("Update monitoring config error:", error);
    return NextResponse.json(
      { error: "Failed to update monitoring configuration" },
      { status: 500 }
    );
  }
}
