import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth";
import { startCheckout } from "@/lib/billing";

export const runtime = "nodejs";

const schema = z.object({ planId: z.string().min(1) });

// POST /api/billing/checkout → { url } to redirect the user to Dodo's checkout.
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = schema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid data", details: validation.error.issues }, { status: 400 });
    }

    // Identity is taken from the authenticated session, never the request body.
    const origin = req.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "";
    const { url } = await startCheckout("zeeklabs", {
      userId: session.user.id,
      planId: validation.data.planId,
      customerEmail: session.user.email,
      customerName: session.user.name ?? undefined,
      successUrl: `${origin}/billing/success`,
      cancelUrl: `${origin}/billing/cancel`,
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error("[billing/checkout] failed:", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
