import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/email";
import { randomBytes } from "crypto";

const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";
const MAGIC_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const email = searchParams.get("email");
  const action = searchParams.get("action");

  const resultUrl = new URL("/admin/beta-result", origin);

  if (!email || (action !== "approve" && action !== "reject")) {
    resultUrl.searchParams.set("status", "invalid");
    return NextResponse.redirect(resultUrl);
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Find the beta request
  const betaRequest = await prisma.betaRequest.findUnique({
    where: { email: normalizedEmail },
  });

  if (!betaRequest) {
    resultUrl.searchParams.set("status", "not-found");
    resultUrl.searchParams.set("email", normalizedEmail);
    return NextResponse.redirect(resultUrl);
  }

  if (betaRequest.status !== "PENDING") {
    resultUrl.searchParams.set("status", "already-processed");
    resultUrl.searchParams.set("email", normalizedEmail);
    return NextResponse.redirect(resultUrl);
  }

  if (action === "reject") {
    // Update beta request to rejected
    await prisma.betaRequest.update({
      where: { email: normalizedEmail },
      data: {
        status: "REJECTED",
        reviewedAt: new Date(),
      },
    });

    // Send rejection email
    await sendMail({
      to: normalizedEmail,
      subject: "Update on your zeeklabs.ai beta request",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #374151; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Beta Request Update</h1>
          </div>
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
              Thank you for your interest in zeeklabs.ai.
            </p>
            <p style="color: #333; font-size: 16px; margin-bottom: 25px;">
              Unfortunately, we're unable to grant beta access at this time.
              We're currently in a limited beta phase and have reached capacity.
            </p>
            <p style="color: #333; font-size: 16px; margin-bottom: 25px;">
              We'll be launching paid plans soon where you can get full access.
              If you'd like to discuss, feel free to reach out.
            </p>
            <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 20px;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                Contact us at <a href="mailto:founder@zeeklabs.ai" style="color: #667eea;">founder@zeeklabs.ai</a>
              </p>
            </div>
          </div>
        </div>
      `,
    });

    resultUrl.searchParams.set("status", "rejected");
    resultUrl.searchParams.set("email", normalizedEmail);
    return NextResponse.redirect(resultUrl);
  }

  // APPROVE: Generate magic token and add to allowlist
  const magicToken = randomBytes(32).toString("hex");
  const magicTokenExpires = new Date(Date.now() + MAGIC_TOKEN_TTL_MS);

  // Update beta request
  await prisma.betaRequest.update({
    where: { email: normalizedEmail },
    data: {
      status: "APPROVED",
      reviewedAt: new Date(),
    },
  });

  // Add to allowlist with magic token
  await prisma.allowlist.upsert({
    where: { email: normalizedEmail },
    update: {
      magicToken,
      magicTokenExpires,
    },
    create: {
      email: normalizedEmail,
      magicToken,
      magicTokenExpires,
    },
  });

  // Send magic link email to user
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
            Great news! Your beta access has been <strong style="color: #16a34a;">approved</strong>.
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
              Questions? Reply to this email or reach out at <a href="mailto:founder@zeeklabs.ai" style="color: #667eea;">founder@zeeklabs.ai</a>
            </p>
          </div>
        </div>
      </div>
    `,
  });

  resultUrl.searchParams.set("status", "approved");
  resultUrl.searchParams.set("email", normalizedEmail);
  return NextResponse.redirect(resultUrl);
}
