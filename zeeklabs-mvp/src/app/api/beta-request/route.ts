import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/email";
import { ADMIN_EMAILS } from "@/lib/admin";
import { z } from "zod";

const betaRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = betaRequestSchema.parse(body);
    const normalizedEmail = email.toLowerCase().trim();

    // Check if already allowlisted
    const existingAllowlist = await prisma.allowlist.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingAllowlist) {
      return NextResponse.json({
        success: true,
        message: "You're already on the allowlist! Please check your email for the login link, or try signing in.",
        alreadyAllowlisted: true,
      });
    }

    // Check if already has an approved account
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser?.status === "APPROVED") {
      return NextResponse.json({
        success: true,
        message: "You already have an approved account! Please sign in.",
        alreadyApproved: true,
      });
    }

    // Check if already requested
    const existingRequest = await prisma.betaRequest.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingRequest) {
      if (existingRequest.status === "PENDING") {
        return NextResponse.json({
          success: true,
          message: "We already received your request and it's under review. We'll email you once approved!",
          alreadyRequested: true,
        });
      } else if (existingRequest.status === "REJECTED") {
        return NextResponse.json({
          success: false,
          message: "Your previous request wasn't approved. Please contact founder@zeeklabs.ai if you'd like to discuss.",
          rejected: true,
        });
      }
    }

    // Create new beta request
    await prisma.betaRequest.create({
      data: {
        email: normalizedEmail,
        status: "PENDING",
      },
    });

    // Send email to admin
    if (ADMIN_EMAILS.length > 0) {
      const approveUrl = `${APP_URL}/api/beta-request/approve?email=${encodeURIComponent(normalizedEmail)}&action=approve`;
      const rejectUrl = `${APP_URL}/api/beta-request/approve?email=${encodeURIComponent(normalizedEmail)}&action=reject`;

      await sendMail({
        to: ADMIN_EMAILS,
        subject: `🎁 Beta Access Request: ${normalizedEmail}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🎁 Beta Access Request</h1>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
              <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
                Someone wants beta access to <strong>zeeklabs.ai</strong>:
              </p>
              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin-bottom: 25px;">
                <p style="margin: 0; font-size: 18px; color: #333;">
                  <strong>${normalizedEmail}</strong>
                </p>
              </div>
              <div style="text-align: center; margin-bottom: 25px;">
                <a href="${approveUrl}" style="display: inline-block; background: #16a34a; color: white; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-right: 10px; font-size: 16px;">
                  ✓ Approve & Send Magic Link
                </a>
                <a href="${rejectUrl}" style="display: inline-block; background: #dc2626; color: white; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                  ✗ Reject
                </a>
              </div>
              <p style="color: #666; font-size: 14px; text-align: center; margin: 0;">
                Or manage all requests from the <a href="${APP_URL}/admin" style="color: #667eea;">admin dashboard</a>.
              </p>
            </div>
          </div>
        `,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Thanks for your interest! We'll review your request and email you within 24 hours.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Beta request error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
