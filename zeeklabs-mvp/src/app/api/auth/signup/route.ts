import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import { sendMail } from "@/lib/email";
import crypto from "crypto";

// Helper to check if email is allowlisted
async function isAllowlisted(email: string): Promise<boolean> {
  const entry = await prisma.allowlist.findUnique({
    where: { email: email.toLowerCase() },
  });
  return !!entry;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      // If user exists but has no password, they signed up via OAuth
      if (!existingUser.password) {
        return NextResponse.json(
          { error: "This email is already registered. Please sign in with Google." },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Check if email is allowlisted or admin
    const isAdmin = isAdminEmail(normalizedEmail);
    const allowlisted = await isAllowlisted(normalizedEmail);

    if (!isAdmin && !allowlisted) {
      return NextResponse.json(
        { error: "This email is not on the beta access list. Please request beta access first." },
        { status: 403 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name || normalizedEmail.split("@")[0],
        password: hashedPassword,
        status: isAdmin ? "APPROVED" : "APPROVED", // Allowlisted users are approved
        accessType: isAdmin ? null : "BETA",
        approvedAt: new Date(),
        approvalToken: verificationToken,
        approvalTokenExpires: tokenExpires,
      },
    });

    // Mark allowlist entry as used
    if (allowlisted) {
      await prisma.allowlist.update({
        where: { email: normalizedEmail },
        data: { usedAt: new Date() },
      });
    }

    // Send verification email
    const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const verifyUrl = `${APP_URL}/api/auth/verify-email?token=${verificationToken}`;

    await sendMail({
      to: normalizedEmail,
      subject: "Verify your email - zeeklabs.ai",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to zeeklabs.ai!</h2>
          <p>Hi ${user.name || "there"},</p>
          <p>Please verify your email address by clicking the button below:</p>
          <p style="margin: 30px 0;">
            <a href="${verifyUrl}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Verify Email Address
            </a>
          </p>
          <p>Or copy and paste this link in your browser:</p>
          <p style="color: #666; word-break: break-all;">${verifyUrl}</p>
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Account created! Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
