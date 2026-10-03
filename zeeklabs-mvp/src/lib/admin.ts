import { randomBytes } from "crypto";

const APPROVAL_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

// Dev team emails - these users have unlimited credits for testing
// They bypass credit spending checks entirely
export const DEV_TEAM_EMAILS = [
  "sujith.thakur@gmail.com",
  "pranalicorreia98@gmail.com",
  "amollopes9@gmail.com",
].map((e) => e.toLowerCase());

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export function isDevTeamEmail(email?: string | null): boolean {
  if (!email) return false;
  return DEV_TEAM_EMAILS.includes(email.toLowerCase());
}

// Check if user has unlimited credits (admin or dev team)
export function hasUnlimitedCredits(email?: string | null): boolean {
  return isAdminEmail(email) || isDevTeamEmail(email);
}

export function generateApprovalToken() {
  return {
    approvalToken: randomBytes(32).toString("hex"),
    approvalTokenExpires: new Date(Date.now() + APPROVAL_TOKEN_TTL_MS),
  };
}
