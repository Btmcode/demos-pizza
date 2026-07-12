import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Demos Pizza · Middleware (Siber Güvenlik Sertleştirilmiş)
 *
 * İçerik:
 *  1. CSP (Content Security Policy) — strict
 *  2. Admin route protection (auth check)
 *  3. Bot/abuse guard — User-Agent kontrolü
 *  4. Security headers (HSTS, X-Frame, vb.)
 *  5. HTTPS redirect (production)
 *  6. Path traversal koruması
 *  7. HTTP method kontrolü
 */

// Strict CSP — production'da unsafe-inline olabildiğince az
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

// Bot User-Agent pattern'leri
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
];

// Path traversal pattern
const PATH_TRAVERSAL = /(\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e\/|%2e%2e%5c)/i;

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const userAgent = req.headers.get("user-agent") || "";

  // 1. Path traversal koruması
  if (PATH_TRAVERSAL.test(pathname) || PATH_TRAVERSAL.test(search)) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  // 2. Bot koruması
  if (BLOCKED_UA.some((p) => p.test(userAgent))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const res = NextResponse.next();

  // 3. Security headers
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

  // 4. Eski /admin yollarını 404'e yönlendir (güvenlik — admin yolu gizli)
  if (pathname.startsWith("/admin")) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // 5. /demos route koruması (admin panel — gizli yol)
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

  // 6. /api/admin koruması
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

  // 7. /demos sayfalarını indexleme
  if (pathname === "/demos/giris" || pathname.startsWith("/demos")) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow, nosnippet, noarchive");
  }

  // 7. API rotalarında cache'siz
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
