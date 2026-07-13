import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import {
  loginAccountLimiter,
  loginIpLimiter,
  loginHourlyLimiter,
  checkOrigin,
  checkRequestSize,
} from "@/lib/security";

/**
 * NextAuth konfigürasyonu — Sertleştirilmiş güvenlik.
 *
 * 3 katmanlı login koruması:
 *  1. Hesap bazlı: 3 deneme / hesap / 15 dakika (brute force prevention)
 *  2. IP bazlı: 10 deneme / IP / 15 dakika (credential stuffing prevention)
 *  3. Saatlik: 50 deneme / IP / saat (sustained attack prevention)
 *
 * Diğer:
 *  - bcrypt 12 rounds
 *  - JWT session (8 saat)
 *  - Audit log (ActivityLog)
 *  - Timing-safe error responses
 *  - Generic error messages (info leak prevention)
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
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Geçersiz kimlik bilgileri");
        }

        const email = credentials.email.trim().toLowerCase();
        const ip =
          (req as any)?.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() ||
          (req as any)?.headers?.["x-real-ip"] ||
          "unknown";

        // ─── Katman 1: Saatlik IP limiti (sustained attack) ───
        const hourlyLimit = loginHourlyLimiter.isRateLimited(`login-hourly:${ip}`);
        if (hourlyLimit.blocked) {
          throw new Error("RATE_LIMITED");
        }

        // ─── Katman 2: IP bazlı limit (10 deneme / 15 dk) ───
        const ipLimit = loginIpLimiter.isRateLimited(`login-ip:${ip}`);
        if (ipLimit.blocked) {
          throw new Error("RATE_LIMITED");
        }

        // ─── Katman 3: Hesap bazlı limit (3 deneme / 15 dk) ───
        // Email'i normalize edip key olarak kullan
        const accountLimit = loginAccountLimiter.isRateLimited(`login-acct:${email}`);
        if (accountLimit.blocked) {
          throw new Error("RATE_LIMITED");
        }

        // ─── Email format kontrolü ───
        const emailRegex = /^[^\s@<>]{1,64}@[^\s@<>]{1,255}\.[^\s@<>]{2,}$/;
        if (!emailRegex.test(email)) {
          throw new Error("Geçersiz kimlik bilgileri");
        }

        // ─── Şifre uzunluk kontrolü ───
        if (credentials.password.length > 256) {
          throw new Error("Geçersiz kimlik bilgileri");
        }

        const user = await db.adminUser.findUnique({
          where: { email },
        });
        if (!user) {
          // Timing-safe: nonexistent bcrypt compare yap — equal timing
          await bcrypt.compare(
            credentials.password,
            "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv"
          );
          throw new Error("Geçersiz kimlik bilgileri");
        }

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) {
          // Failed login audit log
          await db.activityLog
            .create({
              data: {
                adminId: user.id,
                adminEmail: user.email,
                action: "LOGIN_FAILED",
                entityType: "AdminUser",
                entityId: user.id,
                details: "wrong_password",
                ipAddress: ip === "unknown" ? null : ip,
                userAgent:
                  (req as any)?.headers?.["user-agent"]?.slice(0, 255) || null,
              },
            })
            .catch(() => null);
          throw new Error("Geçersiz kimlik bilgileri");
        }

        // ─── Success: update last login + audit ───
        await db.adminUser.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
            lastLoginIp: ip === "unknown" ? null : ip,
          },
        });

        await db.activityLog
          .create({
            data: {
              adminId: user.id,
              adminEmail: user.email,
              action: "LOGIN",
              entityType: "AdminUser",
              entityId: user.id,
              ipAddress: ip === "unknown" ? null : ip,
              userAgent:
                (req as any)?.headers?.["user-agent"]?.slice(0, 255) || null,
            },
          })
          .catch(() => null);

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
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
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
  // Hata mesajlarını sızdırma — üretimde sessiz
  logger: {
    error(code, metadata) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[NextAuth]", code, metadata);
      }
    },
    warn(code) {},
    debug(code, metadata) {},
  },
};

/**
 * Admin route guard. server component / route handler'da kullan.
 * CSRF koruması ve request size limit içerir.
 * - 401: session yok
 * - 403: CSRF failed (cross-origin)
 * - 413: request çok büyük
 */
export async function requireAdmin(req?: Request) {
  const { getServerSession } = await import("next-auth");
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { ok: false as const, status: 401, message: "Yetkisiz" };
  }

  // CSRF koruması — POST/PATCH/PUT/DELETE için
  if (req) {
    if (!checkOrigin(req)) {
      return { ok: false as const, status: 403, message: "Yetkisiz istek" };
    }
    // Request size limit (2MB admin için)
    if (!checkRequestSize(req, 2 * 1024 * 1024)) {
      return { ok: false as const, status: 413, message: "İstek çok büyük" };
    }
  }

  return { ok: true as const, session };
}

/** Şifre hashleme helper'ı (seed script için) */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}
