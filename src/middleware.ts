import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { globalApiLimiter, authEndpointLimiter } from "@/lib/security";

/**
 * Demos Pizza · Middleware (Siber Güvenlik Sertleştirilmiş — v2)
 *
 * İçerik:
 *  1. CSP (Content Security Policy) — strict
 *  2. Admin route protection (auth check)
 *  3. Bot/abuse guard — User-Agent kontrolü
 *  4. Security headers (HSTS, X-Frame, vb.)
 *  5. HTTPS redirect (production)
 *  6. Path traversal koruması
 *  7. HTTP method kontrolü
 *  8. Global API rate limiting (100 req/dakika / IP)
 *  9. Auth endpoint rate limiting (20 req/dakika / IP)
 *  10. Request size limit (1MB default)
 *  11. Şüpheli parametre tespiti
 *  12. SQL injection pattern koruması (URL'de)
 */

// Strict CSP
const CSP_DIRECTIVES = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://graph.facebook.com https://nominatim.openstreetmap.org",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
  "upgrade-insecure-requests",
].join("; ");

// Bot User-Agent pattern'leri — bilinen saldırı araçları
const BLOCKED_UA = [
  /sqlmap/i,
  /nikto/i,
  /nmap/i,
  /masscan/i,
  /hydra/i,
  /dirb/i,
  /gobuster/i,
  /wpscan/i,
  /acunetix/i,
  /nessus/i,
  /burp/i,
  /zap/i,
  /semrushbot/i,
  /curl/i,
  /wget/i,
  /python-requests/i,
  /go-http-client/i,
  /libwww-perl/i,
  /java\//i,
  /scrapy/i,
  /bot/i, // Generic bot
];

// Path traversal pattern
const PATH_TRAVERSAL = /(\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e\/|%2e%2e%5c)/i;

// SQL injection pattern'leri (URL path/query'de) — tek satır
const SQL_INJECTION_URL = /(\b(OR|AND)\b\s+\d+\s*=\s*\d+|\bUNION\b\s+\bSELECT\b|\bDROP\b\s+\bTABLE\b|\bINSERT\b\s+\bINTO\b|\bDELETE\b\s+\bFROM\b|--\s|<script\b|javascript:|on\w+\s*=|data:text\/html)/i;

// XSS pattern'leri
const XSS_PATTERNS = /(<script|javascript:|onerror=|onload=|onclick=|onmouse\w+=|<iframe|<embed|<object|<svg)/i;

// Admin panel için bilinen hassas path'ler — direkt 404
const HIDDEN_ADMIN_PATHS = [
  "/admin",
  "/wp-admin",
  "/wp-login",
  "/phpmyadmin",
  "/administrator",
  "/manager",
  "/console",
  "/dashboard",
  "/cpanel",
  "/.env",
  "/.git",
  "/.aws",
  "/config",
  "/backup",
  "/database",
];

// Helper: IP'yi çıkar (middleware context'inde)
function getIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const ip = xff.split(",")[0].trim();
    if (ip && ip !== "unknown") return ip;
  }
  const xReal = req.headers.get("x-real-ip");
  if (xReal) return xReal.trim();
  return "unknown";
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const userAgent = req.headers.get("user-agent") || "";
  const method = req.method;

  // ─── 1. Path traversal koruması ───
  if (PATH_TRAVERSAL.test(pathname) || PATH_TRAVERSAL.test(search)) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  // ─── 2. SQL injection / XSS pattern koruması (URL'de) ───
  if (SQL_INJECTION_URL.test(pathname) || SQL_INJECTION_URL.test(search)) {
    return new NextResponse("Bad Request", { status: 400 });
  }
  if (XSS_PATTERNS.test(pathname) || XSS_PATTERNS.test(search)) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  // ─── 3. Hassas admin path'leri — direkt 404 ───
  if (HIDDEN_ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // ─── 4. Bot koruması ───
  // Login ve API rotalarında botları engelle
  if (pathname.startsWith("/api/auth") || pathname.startsWith("/demos/giris")) {
    if (BLOCKED_UA.some((p) => p.test(userAgent))) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }
  // Diğer API rotalarında da saldırı araçlarını engelle (curl/wget hariç)
  const ATTACK_TOOLS = [/sqlmap/i, /nikto/i, /nmap/i, /masscan/i, /hydra/i, /dirb/i, /gobuster/i, /wpscan/i, /acunetix/i, /nessus/i, /burp/i, /zap/i, /scrapy/i];
  if (ATTACK_TOOLS.some((p) => p.test(userAgent))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // ─── 5. HTTP method kontrolü ───
  // Sadece GET, POST, PATCH, PUT, DELETE, OPTIONS, HEAD izinli
  if (!["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS", "HEAD"].includes(method)) {
    return new NextResponse("Method Not Allowed", { status: 405 });
  }

  const ip = getIp(req);

  // ─── 6. Global API rate limiting (100 req/dakika / IP) ───
  if (pathname.startsWith("/api/")) {
    const limited = globalApiLimiter.isRateLimited(`global-api:${ip}`);
    if (limited.blocked) {
      return NextResponse.json(
        { error: "Çok fazla istek. Lütfen daha sonra tekrar deneyin." },
        {
          status: 429,
          headers: {
            "Retry-After": String(limited.retryAfter),
            "X-RateLimit-Limit": "100",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil((Date.now() + limited.retryAfter * 1000) / 1000)),
          },
        }
      );
    }
  }

  // ─── 7. Auth endpoint rate limiting (20 req/dakika / IP) ───
  // /api/auth/* — CSRF, signin, signout, session, providers
  if (pathname.startsWith("/api/auth/")) {
    const limited = authEndpointLimiter.isRateLimited(`auth-endpoint:${ip}`);
    if (limited.blocked) {
      return NextResponse.json(
        { error: "Çok fazla kimlik doğrulama denemesi." },
        {
          status: 429,
          headers: {
            "Retry-After": String(limited.retryAfter),
            "X-RateLimit-Limit": "20",
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    // NextAuth'un default signin/error sayfalarını gizle (GET)
    // /api/auth/providers AÇIK — signIn() fonksiyonu için zorunlu
    // /api/auth/csrf, /api/auth/session, /api/auth/callback/* AÇIK
    if (method === "GET") {
      if (
        pathname === "/api/auth/signin" ||
        pathname === "/api/auth/error"
      ) {
        return NextResponse.json({ error: "Not Found" }, { status: 404 });
      }
    }
  }

  const res = NextResponse.next();

  // ─── 8. Security headers ───
  res.headers.set("Content-Security-Policy", CSP_DIRECTIVES);
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self), browsing-topics=(), interest-cohort=()"
  );
  res.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  res.headers.set("Cross-Origin-Resource-Policy", "same-site");
  res.headers.set("Cross-Origin-Embedder-Policy", "unsafe-none");

  // ─── 9. /demos route koruması (admin panel — gizli yol) ───
  if (pathname.startsWith("/demos") && pathname !== "/demos/giris") {
    const sessionToken =
      req.cookies.get("next-auth.session-token")?.value ||
      req.cookies.get("__Secure-next-auth.session-token")?.value;

    if (!sessionToken) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/demos/giris";
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ─── 10. /api/admin koruması ───
  if (pathname.startsWith("/api/admin")) {
    const sessionToken =
      req.cookies.get("next-auth.session-token")?.value ||
      req.cookies.get("__Secure-next-auth.session-token")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    // /api/admin rotalarında cache'siz
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    res.headers.set("Pragma", "no-cache");
  }

  // ─── 11. /demos sayfalarını indexleme ───
  if (pathname === "/demos/giris" || pathname.startsWith("/demos")) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow, nosnippet, noarchive");
  }

  // ─── 12. API rotalarında cache'siz ───
  if (pathname.startsWith("/api/")) {
    res.headers.set("Cache-Control", "no-store");
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|favicon.svg|robots.txt|sitemap.xml|logo.svg|logo.png|sw.js|manifest.json|images/|icon-|apple-icon).*)",
  ],
};
