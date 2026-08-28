import { randomBytes } from "crypto";

const APPROVAL_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export function generateApprovalToken() {
  return {
    approvalToken: randomBytes(32).toString("hex"),
    approvalTokenExpires: new Date(Date.now() + APPROVAL_TOKEN_TTL_MS),
  };
}
