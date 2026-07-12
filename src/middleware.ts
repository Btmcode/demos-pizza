import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Demos Pizza · Middleware
 *
 * İçerik:
 *  1. CSP (Content Security Policy) header
 *  2. Admin route protection (auth check)
 *  3. Bot/abuse guard
 *  4. Security headers
 *
 * NextAuth session cookie'sini kontrol eder.
 */

// CSP direktifleri
const CSP_DIRECTIVES = [
  "default-src 'self'",
  // Script: self + inline (Next.js gereği) + unsafe-eval sadece dev'de
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
].join("; ");

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const res = NextResponse.next();

  // CSP ekle
  res.headers.set("Content-Security-Policy", CSP_DIRECTIVES);

  // Admin route koruması
  if (pathname.startsWith("/admin") && pathname !== "/admin/giris") {
    const sessionToken =
      req.cookies.get("next-auth.session-token")?.value ||
      req.cookies.get("__Secure-next-auth.session-token")?.value;

    if (!sessionToken) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/admin/giris";
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // /api/admin koruması (server-side tekrar kontrol de var, bu ilk savunma)
  if (pathname.startsWith("/api/admin")) {
    const sessionToken =
      req.cookies.get("next-auth.session-token")?.value ||
      req.cookies.get("__Secure-next-auth.session-token")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
  }

  // /admin/giris sayfasını indexleme
  if (pathname === "/admin/giris" || pathname.startsWith("/admin")) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow, nosnippet, noarchive");
  }

  return res;
}

export const config = {
  matcher: [
    // Admin + API admin hariç her şey
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|logo.svg|images/).*)",
  ],
};
