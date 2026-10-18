import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const updateSchema = z.object({
  enabled: z.boolean().optional(),
  frequency: z.number().int().min(7).max(90).optional(), // 7 to 90 days
});

/**
 * GET /api/user/digest-preferences
 *
 * Get the current user's digest preferences.
 */
export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prefs = await prisma.digestPreferences.findUnique({
      where: { userId: session.user.id },
    });

    // Return defaults if no preferences set
    return NextResponse.json({
      enabled: prefs?.enabled ?? true,
      frequency: prefs?.frequency ?? 30,
    });
  } catch (error) {
    console.error("[user/digest-preferences] GET failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/digest-preferences
 *
 * Update the current user's digest preferences.
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = updateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { enabled, frequency } = validation.data;

    const prefs = await prisma.digestPreferences.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        enabled: enabled ?? true,
        frequency: frequency ?? 30,
      },
      update: {
        ...(enabled !== undefined && { enabled }),
        ...(frequency !== undefined && { frequency }),
      },
    });

    return NextResponse.json({
      enabled: prefs.enabled,
      frequency: prefs.frequency,
    });
  } catch (error) {
    console.error("[user/digest-preferences] PUT failed:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
