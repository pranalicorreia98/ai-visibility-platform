import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { getUserTier, getUserLimits } from "@/lib/billing/entitlements";

export const runtime = "nodejs";

// GET /api/billing/subscription → the caller's current tier + limits (for the pricing UI's
// current-plan highlight, upgrade targeting, and settings page competitor caps).
export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [tier, limits] = await Promise.all([
      getUserTier(session.user.id),
      getUserLimits(session.user.id),
    ]);
    return NextResponse.json({ ...tier, limits });
  } catch (error) {
    console.error("[billing/subscription] failed:", error);
    return NextResponse.json({ error: "Failed to load subscription" }, { status: 500 });
  }
}
