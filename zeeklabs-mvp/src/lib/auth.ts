import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { isAdminEmail, generateApprovalToken } from "./admin";
import { notifyAdminOfNewSignup } from "./email";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true, // Trust localhost for development
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    Credentials({
      name: "Demo Account",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "demo@zeeklabs.com" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        const email = credentials.email as string;
        // The "Try the demo" button (empty email field) submits this fixed
        // address - it's a public, self-serve demo and must never require
        // admin approval, but it also isn't in ADMIN_EMAILS so it gets no
        // admin-panel access (that's gated separately via isAdminEmail()).
        const isDemo = email.toLowerCase() === "demo@zeeklabs.com";

        // For demo purposes, auto-create or find user
        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          const isAdmin = isAdminEmail(email);
          user = await prisma.user.create({
            data: {
              email,
              name: isDemo ? "Demo User" : email.split("@")[0],
              status: isAdmin || isDemo ? "APPROVED" : "PENDING",
              ...(isAdmin || isDemo ? {} : generateApprovalToken()),
            },
          });

          if (!isAdmin && !isDemo) {
            await notifyAdminOfNewSignup(user);
          }
        } else if (isDemo && user.status !== "APPROVED") {
          // Self-heal: a demo row created before this account existed (or
          // before this bypass existed) may be stuck PENDING/REJECTED.
          user = await prisma.user.update({
            where: { id: user.id },
            data: { status: "APPROVED" },
          });
        }

        // Not approved yet (or rejected) — deny the session outright.
        // This is the sole enforcement point: SQLite/Prisma can't run in
        // the Edge middleware runtime, so gating happens here at sign-in
        // rather than via middleware on every request.
        if (user.status !== "APPROVED") return null;

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

      if (isAdminEmail(user.email)) {
        await prisma.user.upsert({
          where: { email: user.email },
          update: { status: "APPROVED" },
          create: { email: user.email, name: user.name, status: "APPROVED" },
        });
        return true;
      }

      // Find-or-create ourselves rather than assuming the adapter already
      // created the User row - for a first-time Google sign-in it hasn't,
      // and relying on that timing let brand-new users straight in with no
      // approval check at all.
      let dbUser = await prisma.user.findUnique({ where: { email: user.email } });

      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            email: user.email,
            name: user.name,
            status: "PENDING",
            ...generateApprovalToken(),
          },
        });
        await notifyAdminOfNewSignup(dbUser);
        return false;
      }

      if (dbUser.status === "APPROVED") return true;
      if (dbUser.status === "REJECTED") return false;

      // PENDING: notify the admin (once) and deny the session.
      if (!dbUser.approvalToken) {
        const updated = await prisma.user.update({
          where: { id: dbUser.id },
          data: generateApprovalToken(),
        });
        await notifyAdminOfNewSignup(updated);
      }
      return false;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
  },
});

export const getAuthSession = () => auth();
