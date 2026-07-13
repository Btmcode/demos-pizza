import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

const handler = NextAuth(authOptions);

/**
 * NextAuth route handler — güvenlik sertleştirilmiş.
 *
 * Güvenlik:
 *  - GET /api/auth/signin → 404 (sayfa yok, sadece POST ile login)
 *  - GET /api/auth/providers → 404 (provider listesi sızdırma)
 *  - GET /api/auth/error → 404 (error sayfası sızdırma)
 *  - Diğer NextAuth endpoint'leri (csrf, session, signout, callback) çalışır
 *
 * Bu sayede:
 *  - NextAuth'un default signin sayfası erişilemez
 *  - Provider bilgileri sızdırılmaz
 *  - Saldırgan login formunu göremez
 */
async function customHandler(req: Request) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // /api/auth/signin — sadece POST izinli (login attempt)
  // GET ise 404 — NextAuth'un signin sayfasını gizle
  if (pathname === "/api/auth/signin" && req.method === "GET") {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  // /api/auth/providers — provider listesini sızdırma
  if (pathname === "/api/auth/providers" && req.method === "GET") {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  // /api/auth/error — error sayfasını sızdırma
  if (pathname === "/api/auth/error" && req.method === "GET") {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  return handler(req);
}

export { customHandler as GET, customHandler as POST };
