import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUnsubscribeToken } from "@/lib/digest";

export const runtime = "nodejs";

/**
 * GET /api/digest/unsubscribe?userId=xxx&token=xxx
 *
 * One-click unsubscribe from digest emails.
 * Token-based verification (no login required for GDPR compliance).
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  const token = url.searchParams.get("token");

  if (!userId || !token) {
    return new NextResponse(
      renderUnsubscribePage({
        success: false,
        message: "Invalid unsubscribe link. Missing required parameters.",
      }),
      { status: 400, headers: { "Content-Type": "text/html" } }
    );
  }

  // Verify token
  if (!verifyUnsubscribeToken(userId, token)) {
    return new NextResponse(
      renderUnsubscribePage({
        success: false,
        message: "Invalid or expired unsubscribe link.",
      }),
      { status: 403, headers: { "Content-Type": "text/html" } }
    );
  }

  try {
    // Update or create digest preferences
    await prisma.digestPreferences.upsert({
      where: { userId },
      create: {
        userId,
        enabled: false,
      },
      update: {
        enabled: false,
      },
    });

    return new NextResponse(
      renderUnsubscribePage({
        success: true,
        message:
          "You have been unsubscribed from digest emails. You can re-enable them anytime in your account settings.",
      }),
      { status: 200, headers: { "Content-Type": "text/html" } }
    );
  } catch (error) {
    console.error("[digest/unsubscribe] Failed:", error);
    return new NextResponse(
      renderUnsubscribePage({
        success: false,
        message: "Something went wrong. Please try again or contact support.",
      }),
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
  }
}

function renderUnsubscribePage({
  success,
  message,
}: {
  success: boolean;
  message: string;
}): string {
  const bgColor = success ? "#ecfdf5" : "#fef2f2";
  const textColor = success ? "#065f46" : "#991b1b";
  const icon = success ? "✓" : "✕";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unsubscribe - ZeekLabs</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #f3f4f6;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: white;
      border-radius: 16px;
      padding: 40px;
      max-width: 400px;
      text-align: center;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: ${bgColor};
      color: ${textColor};
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      font-size: 28px;
      font-weight: bold;
    }
    h1 {
      color: #111827;
      font-size: 24px;
      margin-bottom: 12px;
    }
    p {
      color: #6b7280;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .btn {
      display: inline-block;
      background: #6366f1;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 500;
    }
    .btn:hover {
      background: #4f46e5;
    }
    .logo {
      margin-bottom: 24px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">
      <img src="https://zeeklabs.ai/zeeklabs-logo.svg" alt="ZeekLabs" width="48" height="48">
    </div>
    <div class="icon">${icon}</div>
    <h1>${success ? "Unsubscribed" : "Error"}</h1>
    <p>${message}</p>
    <a href="https://zeeklabs.ai" class="btn">Go to ZeekLabs</a>
  </div>
</body>
</html>
  `.trim();
}
