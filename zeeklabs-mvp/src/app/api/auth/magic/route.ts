import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=invalid-token", APP_URL));
  }

  // Find allowlist entry with this magic token
  const allowlistEntry = await prisma.allowlist.findUnique({
    where: { magicToken: token },
  });

  if (!allowlistEntry) {
    return NextResponse.redirect(new URL("/login?error=invalid-token", APP_URL));
  }

  // Check if token expired
  if (allowlistEntry.magicTokenExpires && allowlistEntry.magicTokenExpires < new Date()) {
    return NextResponse.redirect(new URL("/login?error=token-expired", APP_URL));
  }

  // Check if already used
  if (allowlistEntry.usedAt) {
    // Token already used, but user is allowlisted - just redirect to login
    return NextResponse.redirect(new URL("/login?message=already-activated", APP_URL));
  }

  // Mark magic link as used
  await prisma.allowlist.update({
    where: { id: allowlistEntry.id },
    data: {
      usedAt: new Date(),
      magicToken: null, // Clear the token after use
      magicTokenExpires: null,
    },
  });

  // Check if user already exists
  let user = await prisma.user.findUnique({
    where: { email: allowlistEntry.email },
  });

  if (user) {
    // Update existing user to approved + beta
    await prisma.user.update({
      where: { id: user.id },
      data: {
        status: "APPROVED",
        accessType: "BETA",
        approvedAt: new Date(),
      },
    });
  } else {
    // Create new user as approved beta user
    user = await prisma.user.create({
      data: {
        email: allowlistEntry.email,
        name: allowlistEntry.email.split("@")[0],
        status: "APPROVED",
        accessType: "BETA",
        approvedAt: new Date(),
      },
    });
  }

  // Redirect to login with success message
  // The user will now be able to sign in normally since they're approved
  return NextResponse.redirect(new URL("/login?message=activated", APP_URL));
}
