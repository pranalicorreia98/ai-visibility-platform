import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { getCreditBalance } from "@/lib/credits";
import { isAdminEmail } from "@/lib/admin";

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const balance = await getCreditBalance(session.user.id);
  return NextResponse.json({
    balance,
    unlimited: isAdminEmail(session.user.email),
  });
}
