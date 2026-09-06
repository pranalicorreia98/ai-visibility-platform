import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureInitialCreditsGranted } from "@/lib/credits";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";
    return NextResponse.redirect(new URL("/login?error=invalid-token", APP_URL));
  }

  try {
    // Find user with this token
    const user = await prisma.user.findFirst({
      where: {
        approvalToken: token,
        approvalTokenExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";
      return NextResponse.redirect(new URL("/login?error=token-expired", APP_URL));
    }

    // Mark email as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        approvalToken: null,
        approvalTokenExpires: null,
      },
    });

    // Grant initial credits
    await ensureInitialCreditsGranted(user.id, user.accessType);

    const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";
    return NextResponse.redirect(new URL("/login?message=email-verified", APP_URL));
  } catch (error) {
    console.error("Email verification error:", error);
    const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";
    return NextResponse.redirect(new URL("/login?error=verification-failed", APP_URL));
  }
}
