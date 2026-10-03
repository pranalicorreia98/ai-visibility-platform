import NextAuth, { CredentialsSignin } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { isAdminEmail, isDevTeamEmail } from "./admin";
import { ensureInitialCreditsGranted } from "./credits";

// Custom error for invalid credentials
class InvalidCredentialsError extends CredentialsSignin {
  code = "invalid-credentials";
}

class EmailNotVerifiedError extends CredentialsSignin {
  code = "email-not-verified";
}

// Note: Allowlist functionality removed - open signup for everyone

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true, // Trust localhost for development
  adapter: PrismaAdapter(prisma),
  providers: [
    // Google OAuth
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true, // Allow linking Google to existing email/password accounts
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

        // Auto-approve if not already approved (open signup)
        if (user.status !== "APPROVED") {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              status: "APPROVED",
              accessType: "BETA",
              approvedAt: new Date(),
            },
          });
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

      // Admin or dev team emails are always allowed with special handling
      if (isAdminEmail(email) || isDevTeamEmail(email)) {
        const specialUser = await prisma.user.upsert({
          where: { email },
          update: { status: "APPROVED" },
          create: { email, name: user.name, status: "APPROVED" },
        });
        await ensureInitialCreditsGranted(specialUser.id, specialUser.accessType);
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

        // PENDING user - auto-approve them now (open signup)
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

      // New user - auto-approve (open signup, no allowlist required)
      const newUser = await prisma.user.create({
        data: {
          email,
          name: user.name,
          status: "APPROVED",
          accessType: "BETA",
          approvedAt: new Date(),
        },
      });
      await ensureInitialCreditsGranted(newUser.id, newUser.accessType);
      return true;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
  },
});

export const getAuthSession = () => auth();
