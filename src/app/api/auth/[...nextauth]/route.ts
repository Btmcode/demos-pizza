import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

const AppHandler = NextAuth(authOptions);

/**
 * NextAuth route handler — güvenlik sertleştirilmiş.
 *
 * Gizlenen endpoint'ler (GET → 404):
 *  - /api/auth/signin (NextAuth default signin page)
 *  - /api/auth/providers (provider list leak)
 *  - /api/auth/error (error page leak)
 *
 * Çalışan endpoint'ler:
 *  - GET/POST /api/auth/csrf
 *  - GET /api/auth/session
 *  - POST /api/auth/signout
 *  - POST /api/auth/callback/credentials
 */
async function customHandler(req: Request) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // Sadece GET isteklerinde bu endpoint'leri gizle
  // POST istekleri NextAuth için gerekli (signin callback vb.)
  if (req.method === "GET") {
    // /api/auth/signin — NextAuth'un default signin sayfasını gizle
    if (pathname === "/api/auth/signin") {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }
    // /api/auth/providers — provider listesini sızdırma
    if (pathname === "/api/auth/providers") {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }
    // /api/auth/error — error sayfasını sızdırma
    if (pathname === "/api/auth/error") {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }
  }

  // Diğer tüm istekleri NextAuth handler'ına ilet
  return AppHandler(req);
}

export { customHandler as GET, customHandler as POST };
