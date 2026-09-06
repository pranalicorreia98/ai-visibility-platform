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

    // Auto-approve beta request and add to allowlist with 20 credits
    await prisma.betaRequest.create({
      data: {
        email: normalizedEmail,
        status: "APPROVED",
      },
    });

    // Add to allowlist (credits will be granted when user creates account)
    await prisma.allowlist.create({
      data: {
        email: normalizedEmail,
      },
    });

    // Send welcome email with instructions
    await sendMail({
      to: normalizedEmail,
      subject: "Welcome to zeeklabs.ai - Your beta access is ready!",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to zeeklabs.ai!</h1>
          </div>
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
              Great news! Your beta access has been approved. Create your account and you'll receive <strong>20 free credits</strong> to get started.
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #16a34a; margin-bottom: 25px;">
              <p style="margin: 0 0 10px 0; font-size: 16px; color: #333;">
                <strong>What's next?</strong>
              </p>
              <ol style="margin: 0; padding-left: 20px; color: #555;">
                <li style="margin-bottom: 8px;">Go to <a href="${APP_URL}/login" style="color: #667eea;">zeeklabs.ai/login</a></li>
                <li style="margin-bottom: 8px;">Create your account with email & password, or sign in with Google</li>
                <li>Start analyzing your brand's AI visibility!</li>
              </ol>
            </div>
            <div style="text-align: center; margin-bottom: 25px;">
              <a href="${APP_URL}/login" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                Get Started Now
              </a>
            </div>
            <p style="color: #666; font-size: 14px; text-align: center; margin: 0;">
              Questions? Reply to this email or reach out at <a href="mailto:founder@zeeklabs.ai" style="color: #667eea;">founder@zeeklabs.ai</a>
            </p>
          </div>
        </div>
      `,
    });

    // Notify admin (optional, for tracking)
    if (ADMIN_EMAILS.length > 0) {
      await sendMail({
        to: ADMIN_EMAILS,
        subject: `New beta user auto-approved: ${normalizedEmail}`,
        html: `<p>Auto-approved beta access for <strong>${normalizedEmail}</strong> with 20 credits.</p>`,
      });
    }

    return NextResponse.json({
      success: true,
      message: "You're approved! Check your email for next steps. You can now sign in or create an account.",
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
