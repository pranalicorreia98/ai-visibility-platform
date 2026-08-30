import NextAuth, { CredentialsSignin } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { isAdminEmail, generateApprovalToken } from "./admin";
import { notifyAdminOfNewSignup } from "./email";

// Custom error classes for better error handling
class PendingApprovalError extends CredentialsSignin {
  code = "pending";
}

class RejectedError extends CredentialsSignin {
  code = "rejected";
}

class NotAllowlistedError extends CredentialsSignin {
  code = "not-allowlisted";
}

// Helper to check if email is allowlisted
async function isAllowlisted(email: string): Promise<boolean> {
  const entry = await prisma.allowlist.findUnique({
    where: { email: email.toLowerCase() },
  });
  return !!entry;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true, // Trust localhost for development
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@company.com" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        const email = (credentials.email as string).toLowerCase().trim();

        // Admin emails are always allowed
        const isAdmin = isAdminEmail(email);

        // Check if user exists
        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (user) {
          // Existing user - check status
          if (user.status === "REJECTED") {
            throw new RejectedError();
          }
          if (user.status === "APPROVED") {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
            };
          }
          // PENDING - check if now allowlisted
          if (await isAllowlisted(email)) {
            // User is now allowlisted, approve them
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                status: "APPROVED",
                accessType: "BETA",
                approvedAt: new Date(),
              },
            });
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
            };
          }
          // Still pending and not allowlisted
          throw new PendingApprovalError();
        }

        // New user - check if admin or allowlisted
        if (isAdmin) {
          user = await prisma.user.create({
            data: {
              email,
              name: email.split("@")[0],
              status: "APPROVED",
            },
          });
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        }

        // Check allowlist for new users
        if (await isAllowlisted(email)) {
          user = await prisma.user.create({
            data: {
              email,
              name: email.split("@")[0],
              status: "APPROVED",
              accessType: "BETA",
              approvedAt: new Date(),
            },
          });
          // Mark allowlist entry as used
          await prisma.allowlist.update({
            where: { email },
            data: { usedAt: new Date() },
          });
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        }

        // Not admin, not allowlisted - deny with not-allowlisted error
        throw new NotAllowlistedError();
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async signIn({ user }) {
      if (!user.email) return true;

      const email = user.email.toLowerCase().trim();

      // Admin emails are always allowed
      if (isAdminEmail(email)) {
        await prisma.user.upsert({
          where: { email },
          update: { status: "APPROVED" },
          create: { email, name: user.name, status: "APPROVED" },
        });
        return true;
      }

      // Check if user exists
      let dbUser = await prisma.user.findUnique({ where: { email } });

      if (dbUser) {
        // Existing user
        if (dbUser.status === "APPROVED") return true;
        if (dbUser.status === "REJECTED") return false;

        // PENDING - check if now allowlisted
        if (await isAllowlisted(email)) {
          await prisma.user.update({
            where: { id: dbUser.id },
            data: {
              status: "APPROVED",
              accessType: "BETA",
              approvedAt: new Date(),
            },
          });
          return true;
        }

        // Still pending and not allowlisted
        return false;
      }

      // New user - check allowlist
      if (await isAllowlisted(email)) {
        await prisma.user.create({
          data: {
            email,
            name: user.name,
            status: "APPROVED",
            accessType: "BETA",
            approvedAt: new Date(),
          },
        });
        // Mark allowlist entry as used
        await prisma.allowlist.update({
          where: { email },
          data: { usedAt: new Date() },
        });
        return true;
      }

      // Not allowlisted - deny access
      // We don't create a pending user anymore - they need to request beta access first
      return false;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
  },
});

export const getAuthSession = () => auth();
