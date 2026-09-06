import NextAuth, { CredentialsSignin } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { isAdminEmail } from "./admin";
import { ensureInitialCreditsGranted } from "./credits";

// Custom error for invalid credentials
class InvalidCredentialsError extends CredentialsSignin {
  code = "invalid-credentials";
}

class EmailNotVerifiedError extends CredentialsSignin {
  code = "email-not-verified";
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
    // Google OAuth
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    // Email/Password authentication
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new InvalidCredentialsError();
        }

        const email = (credentials.email as string).toLowerCase().trim();
        const password = credentials.password as string;

        // Find user
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          throw new InvalidCredentialsError();
        }

        // Check if user has a password (might be OAuth-only user)
        if (!user.password) {
          throw new InvalidCredentialsError();
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          throw new InvalidCredentialsError();
        }

        // Check if email is verified
        if (!user.emailVerified) {
          throw new EmailNotVerifiedError();
        }

        // Check if user is approved
        if (user.status !== "APPROVED") {
          // Check if now allowlisted
          if (await isAllowlisted(email)) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                status: "APPROVED",
                accessType: "BETA",
                approvedAt: new Date(),
              },
            });
          } else if (!isAdminEmail(email)) {
            throw new NotAllowlistedError();
          }
        }

        await ensureInitialCreditsGranted(user.id, user.accessType);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
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
        const adminUser = await prisma.user.upsert({
          where: { email },
          update: { status: "APPROVED" },
          create: { email, name: user.name, status: "APPROVED" },
        });
        await ensureInitialCreditsGranted(adminUser.id, adminUser.accessType);
        return true;
      }

      // Check if user exists
      let dbUser = await prisma.user.findUnique({ where: { email } });

      if (dbUser) {
        // Existing user
        if (dbUser.status === "APPROVED") {
          await ensureInitialCreditsGranted(dbUser.id, dbUser.accessType);
          return true;
        }
        if (dbUser.status === "REJECTED") return false;

        // PENDING - check if now allowlisted
        if (await isAllowlisted(email)) {
          dbUser = await prisma.user.update({
            where: { id: dbUser.id },
            data: {
              status: "APPROVED",
              accessType: "BETA",
              approvedAt: new Date(),
            },
          });
          await ensureInitialCreditsGranted(dbUser.id, dbUser.accessType);
          return true;
        }

        // Still pending and not allowlisted
        return false;
      }

      // New user - check allowlist
      if (await isAllowlisted(email)) {
        const newUser = await prisma.user.create({
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
        await ensureInitialCreditsGranted(newUser.id, newUser.accessType);
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
