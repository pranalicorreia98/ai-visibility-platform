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
    subject: `New sign-in request: ${user.email}`,
    html: `
      <p>A new user is requesting access to zeeklabs.ai:</p>
      <p><strong>${user.email}</strong></p>
      <p>
        <a href="${approveUrl}" style="color:#16a34a;font-weight:bold;">Approve</a>
        &nbsp;|&nbsp;
        <a href="${rejectUrl}" style="color:#dc2626;font-weight:bold;">Reject</a>
      </p>
      <p>Or manage all requests from the <a href="${APP_URL}/admin">admin page</a>.</p>
    `,
  });
}

export async function notifyUserApproved(user: { email: string }) {
  await sendMail({
    to: user.email,
    subject: "You're approved — welcome to zeeklabs.ai",
    html: `
      <p>Your account has been approved.</p>
      <p><a href="${APP_URL}/login">Click here to log in</a> and get started.</p>
    `,
  });
}
