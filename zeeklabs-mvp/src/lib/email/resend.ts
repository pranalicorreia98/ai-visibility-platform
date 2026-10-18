import { Resend } from "resend";
import { render } from "@react-email/render";
import {
  DigestEmail,
  generatePlainText,
  type DigestEmailProps,
} from "@/lib/digest/templates/digestEmail";

// Lazy singleton to avoid env errors at build time
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("[email/resend] RESEND_API_KEY is not configured");
    }
    _resend = new Resend(apiKey);
  }
  return _resend;
}

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "ZeekLabs <digest@zeeklabs.ai>";

export interface SendDigestParams {
  to: string;
  userName: string;
  brands: DigestEmailProps["brands"];
  dashboardUrl: string;
  rerunUrl: string;
  unsubscribeUrl: string;
  preferencesUrl: string;
}

export async function sendDigestEmail(params: SendDigestParams): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  const { to, ...emailProps } = params;

  try {
    // Render React Email template to HTML
    const html = await render(DigestEmail(emailProps));

    // Generate plain text version
    const text = generatePlainText(emailProps);

    // Compute trend emoji for subject
    const totalDelta = emailProps.brands.reduce(
      (sum, b) => sum + b.scoreDelta,
      0
    );
    const trend = totalDelta > 0 ? "📈" : totalDelta < 0 ? "📉" : "";

    const result = await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Your 30-Day AI Visibility Digest ${trend}`.trim(),
      html,
      text,
      tags: [
        { name: "category", value: "digest" },
        { name: "brand_count", value: String(emailProps.brands.length) },
      ],
    });

    if (result.error) {
      console.error("[email/resend] Send failed:", result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[email/resend] Exception:", message);
    return { success: false, error: message };
  }
}

// Simple email for testing
export async function sendTestEmail(
  to: string,
  subject: string,
  text: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const result = await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      text,
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
