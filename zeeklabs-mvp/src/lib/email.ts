import { Resend } from "resend";
import { ADMIN_EMAILS } from "./admin";

const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || "zeeklabs <onboarding@resend.dev>";
const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

interface SendMailArgs {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: SendMailArgs) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(`[email:dev-fallback] To: ${Array.isArray(to) ? to.join(", ") : to}`);
    console.log(`[email:dev-fallback] Subject: ${subject}`);
    console.log(`[email:dev-fallback] Body:\n${html}`);
    return;
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({ from: FROM_ADDRESS, to, subject, html });
  } catch (error) {
    console.error("[email] Failed to send email:", error);
  }
}

export async function notifyAdminOfNewSignup(user: { id: string; email: string; approvalToken: string | null }) {
  if (ADMIN_EMAILS.length === 0 || !user.approvalToken) return;

  const approveUrl = `${APP_URL}/api/admin/approve?token=${user.approvalToken}&action=approve`;
  const rejectUrl = `${APP_URL}/api/admin/approve?token=${user.approvalToken}&action=reject`;

  await sendMail({
    to: ADMIN_EMAILS,
    subject: `🔔 New Signup Request: ${user.email}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">New Signup Request</h1>
        </div>
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
          <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
            A new user is requesting access to <strong>zeeklabs.ai</strong>:
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin-bottom: 25px;">
            <p style="margin: 0; font-size: 18px; color: #333;">
              <strong>${user.email}</strong>
            </p>
          </div>
          <div style="text-align: center; margin-bottom: 25px;">
            <a href="${approveUrl}" style="display: inline-block; background: #16a34a; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-right: 10px;">
              ✓ Approve
            </a>
            <a href="${rejectUrl}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">
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

export async function notifyUserApproved(user: { email: string }) {
  await sendMail({
    to: user.email,
    subject: "🎉 You're approved — Welcome to zeeklabs.ai!",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to zeeklabs.ai!</h1>
        </div>
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
          <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
            Great news! Your account has been <strong style="color: #16a34a;">approved</strong>.
          </p>
          <p style="color: #333; font-size: 16px; margin-bottom: 25px;">
            You can now access zeeklabs.ai and start monitoring your brand's AI visibility across ChatGPT, Gemini, and Perplexity.
          </p>
          <div style="text-align: center; margin-bottom: 25px;">
            <a href="${APP_URL}/login" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
              Log In Now →
            </a>
          </div>
          <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 20px;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              Questions? Reply to this email or reach out at <a href="mailto:founder@zeeklabs.ai" style="color: #667eea;">founder@zeeklabs.ai</a>
            </p>
          </div>
        </div>
      </div>
    `,
  });
}

export async function notifyUserRejected(user: { email: string }) {
  await sendMail({
    to: user.email,
    subject: "Update on your zeeklabs.ai account request",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #374151; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Account Request Update</h1>
        </div>
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
          <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
            Thank you for your interest in zeeklabs.ai.
          </p>
          <p style="color: #333; font-size: 16px; margin-bottom: 25px;">
            Unfortunately, we're unable to approve your account request at this time.
            This may be because we're currently in a limited beta phase.
          </p>
          <p style="color: #333; font-size: 16px; margin-bottom: 25px;">
            If you believe this was a mistake or would like to discuss further, please reach out to us.
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
}
