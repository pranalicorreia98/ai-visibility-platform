import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/email";
import { randomBytes } from "crypto";
import { z } from "zod";

const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";
const MAGIC_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const addEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
  sendMagicLink: z.boolean().optional().default(true),
});

// GET - List all allowlisted emails
export async function GET() {
  const session = await getAuthSession();
  if (!isAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowlist = await prisma.allowlist.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ allowlist });
}

// POST - Add email to allowlist
export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!isAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { email, sendMagicLink } = addEmailSchema.parse(body);
    const normalizedEmail = email.toLowerCase().trim();

    // Check if already allowlisted
    const existing = await prisma.allowlist.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Email is already allowlisted" },
        { status: 400 }
      );
    }

    // Generate magic token
    const magicToken = randomBytes(32).toString("hex");
    const magicTokenExpires = new Date(Date.now() + MAGIC_TOKEN_TTL_MS);

    // Add to allowlist
    const entry = await prisma.allowlist.create({
      data: {
        email: normalizedEmail,
        magicToken,
        magicTokenExpires,
      },
    });

    // Update any existing beta request to approved
    await prisma.betaRequest.updateMany({
      where: { email: normalizedEmail },
      data: { status: "APPROVED", reviewedAt: new Date() },
    });

    // Send magic link email
    if (sendMagicLink) {
      const magicLinkUrl = `${APP_URL}/api/auth/magic?token=${magicToken}`;

      await sendMail({
        to: normalizedEmail,
        subject: "🎉 You're approved! Welcome to zeeklabs.ai beta",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Welcome to zeeklabs.ai!</h1>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
              <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
                Great news! You've been granted beta access.
              </p>
              <p style="color: #333; font-size: 16px; margin-bottom: 25px;">
                Click the button below to access your account and start monitoring your brand's AI visibility across ChatGPT, Gemini, and Perplexity.
              </p>
              <div style="text-align: center; margin-bottom: 25px;">
                <a href="${magicLinkUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 45px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 18px;">
                  Access My Account →
                </a>
              </div>
              <p style="color: #666; font-size: 14px; text-align: center; margin-bottom: 20px;">
                This link expires in 7 days. After that, you can sign in normally using this email.
              </p>
              <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 20px;">
                <p style="color: #666; font-size: 14px; margin: 0;">
                  Questions? Reach out at <a href="mailto:founder@zeeklabs.ai" style="color: #667eea;">founder@zeeklabs.ai</a>
                </p>
              </div>
            </div>
          </div>
        `,
      });
    }

    return NextResponse.json({
      success: true,
      message: sendMagicLink
        ? "Email added and magic link sent!"
        : "Email added to allowlist",
      entry,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Allowlist add error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}

// DELETE - Remove email from allowlist
export async function DELETE(req: NextRequest) {
  const session = await getAuthSession();
  if (!isAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing id parameter" },
        { status: 400 }
      );
    }

    await prisma.allowlist.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Removed from allowlist" });
  } catch (error) {
    console.error("Allowlist delete error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
