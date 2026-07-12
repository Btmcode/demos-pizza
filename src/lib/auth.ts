import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { loginLimiter } from "@/lib/security";

/**
 * NextAuth konfigürasyonu.
 * - Credentials provider (email + password)
 * - bcrypt ile hashlenmiş şifre doğrulaması
 * - JWT session (Vercel serverless uyumlu — session db gerekmez)
 * - Rate limiting login denemelerine
 * - Audit log (ActivityLog tablosu)
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin Girişi",
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.trim().toLowerCase();

        // Rate limit — IP bazlı
        const ip =
          (req as any)?.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() ||
          (req as any)?.headers?.["x-real-ip"] ||
          "unknown";
        const limited = loginLimiter.isRateLimited(`login:${ip}`);
        if (limited.blocked) {
          throw new Error(
            `Çok fazla deneme. ${Math.ceil(limited.retryAfter / 60)} dk sonra tekrar deneyin.`
          );
        }

        const user = await db.adminUser.findUnique({
          where: { email },
        });
        if (!user) {
          // Timing-safe: hash nonexistent bcrypt compare yap — equal timing
          await bcrypt.compare(credentials.password, "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinv");
          return null;
        }

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        // Update last login
        await db.adminUser.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date(), lastLoginIp: ip === "unknown" ? null : ip },
        });

        await db.activityLog.create({
          data: {
            adminId: user.id,
            adminEmail: user.email,
            action: "LOGIN",
            entityType: "AdminUser",
            entityId: user.id,
            ipAddress: ip === "unknown" ? null : ip,
            userAgent: (req as any)?.headers?.["user-agent"]?.slice(0, 255) || null,
          },
        }).catch(() => null);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        } as any;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8, // 8 saat
  },
  jwt: {
    maxAge: 60 * 60 * 8,
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: "/demos/giris",
    error: "/demos/giris",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  events: {
    async signOut(message) {
      // optional audit
    },
  },
  // Hata mesajlarını sızdırma
  logger: {
    error(code, metadata) {
      // Üretimde hassas bilgileri loglama
      if (process.env.NODE_ENV === "production") {
        // sadece kod, mesaj değil
      }
    },
    warn(code) {},
    debug(code, metadata) {},
  },
};

/** Admin route guard. server component / route handler'da kullan. */
export async function requireAdmin() {
  const { getServerSession } = await import("next-auth");
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { ok: false as const, status: 401, message: "Yetkisiz" };
  }
  return { ok: true as const, session };
}

/** Şifre hashleme helper'ı (seed script için) */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}
