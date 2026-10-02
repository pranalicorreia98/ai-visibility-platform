import { NextRequest, NextResponse } from "next/server";
import { handleWebhook } from "@/lib/billing";

// Node runtime + the raw body are required for signature verification.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/billing/webhook ← Dodo delivers subscription events here.
// Register this URL in the Dodo dashboard (Developer → Webhooks).
export async function POST(req: NextRequest) {
  // Read the RAW body before any parsing — the signature is computed over it.
  const rawBody = await req.text();
  const headers = Object.fromEntries(req.headers.entries());

  try {
    const outcome = await handleWebhook(rawBody, headers);
    return NextResponse.json({ received: true, ...outcome });
  } catch (error) {
    // Bad signature or an unmapped status throws here. Return 400 so Dodo
    // retries; the error is logged loudly rather than swallowed.
    console.error("[billing/webhook] rejected:", error);
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }
}
