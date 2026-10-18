import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { getUserTier } from "@/lib/billing/entitlements";

export const runtime = "nodejs";

// GET /api/billing/subscription → the caller's current tier (for the pricing UI's
// current-plan highlight and upgrade targeting). Free when there's no active sub.
export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tier = await getUserTier(session.user.id);
    return NextResponse.json(tier);
  } catch (error) {
    console.error("[billing/subscription] failed:", error);
    return NextResponse.json({ error: "Failed to load subscription" }, { status: 500 });
  }
}
