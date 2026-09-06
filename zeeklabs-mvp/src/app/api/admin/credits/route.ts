import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { grantCredits } from "@/lib/credits";
import { z } from "zod";

const grantSchema = z.object({
  userId: z.string().min(1),
  amount: z.number().int().positive().max(10000),
  description: z.string().min(1).max(500),
});

// POST - Manually record a credit grant (e.g. a ₹299/100-credit purchase
// paid via UPI/bank transfer outside the app, since there's no payment
// gateway wired up yet). Every grant is a real ledger row, never a direct
// balance edit, so the history stays auditable.
export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!isAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { userId, amount, description } = grantSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newBalance = await grantCredits(userId, amount, "PURCHASE", description);

    return NextResponse.json({ success: true, balance: newBalance });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Credit grant error:", error);
    return NextResponse.json({ error: "Failed to grant credits" }, { status: 500 });
  }
}
