import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { isAdminEmail } from "./admin";
import { ensureInitialCreditsGranted } from "./credits";

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
    // Only Google OAuth - secure authentication
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
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
