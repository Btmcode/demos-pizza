/**
 * Demos Pizza · Security Layer
 *
 * İçerik:
 *  1. Rate limiting (in-memory, IP bazlı)
 *  2. Input sanitization (XSS prevention)
 *  3. Phone / email validators
 *  4. Security headers
 *  5. CSP helpers
 *  6. IP extraction
 *  7. Constant-time string compare
 */

// ============================================================
//  1. Rate Limiter (in-memory, sliding window)
// ============================================================

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    // Periodik temizlik
    if (typeof setInterval !== "undefined") {
      setInterval(() => this.cleanup(), 5 * 60 * 1000).unref?.();
    }
  }

  isRateLimited(key: string): { blocked: boolean; retryAfter: number; remaining: number } {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || entry.resetAt < now) {
      this.store.set(key, { count: 1, resetAt: now + this.config.windowMs });
      return { blocked: false, retryAfter: 0, remaining: this.config.max - 1 };
    }

    entry.count += 1;
    if (entry.count > this.config.max) {
      return {
        blocked: true,
        retryAfter: Math.ceil((entry.resetAt - now) / 1000),
        remaining: 0,
      };
    }

    return {
      blocked: false,
      retryAfter: 0,
      remaining: Math.max(0, this.config.max - entry.count),
    };
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetAt < now) this.store.delete(key);
    }
  }
}

// Login: 5 deneme / 15 dakika
export const loginLimiter = new RateLimiter({ windowMs: 15 * 60 * 1000, max: 5 });
// Contact form: 3 / saat
export const contactLimiter = new RateLimiter({ windowMs: 60 * 60 * 1000, max: 3 });
// Reservation: 5 / saat
export const reservationLimiter = new RateLimiter({ windowMs: 60 * 60 * 1000, max: 5 });
// Order: 10 / saat (force pickup abuse)
export const orderLimiter = new RateLimiter({ windowMs: 60 * 60 * 1000, max: 10 });
// Generic API: 60 / dakika
export const apiLimiter = new RateLimiter({ windowMs: 60 * 1000, max: 60 });
// Public read: 200 / dakika
export const readLimiter = new RateLimiter({ windowMs: 60 * 1000, max: 200 });

// ============================================================
//  2. Input Sanitization
// ============================================================

/**
 * HTML special karakterleri escape eder.
 * React zaten otomatik escape yapar — bu sadece dış kaynaklı
 * HTML'i dangerouslySetInside ile basarken veya e-posta/metin
 * alanlarında ekstra koruma için.
 */
export function escapeHtml(input: string): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Display amaçlı güvenli metin — UTF-8 kontrol karakterlerini temizler.
 */
export function sanitizeDisplay(input: string): string {
  if (typeof input !== "string") return "";
  // Kontrol karakterleri (yeni satır hariç)
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
}

/**
 * SQL/NoSQL injection için tehlikeli pattern'leri tespit eder.
 * Prisma parameterize query kullandığı için ana koruma orada,
 * bu ek bir savunma katmanı.
 */
const DANGEROUS_PATTERNS = [
  /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i,
  /(\bUNION\b\s+\bSELECT\b)/i,
  /(\bDROP\b\s+\bTABLE\b)/i,
  /(\bINSERT\b\s+\bINTO\b)/i,
  /(\bDELETE\b\s+\bFROM\b)/i,
  /(\bEXEC(UTE)?\b)/i,
  /(--\s)/,
  /(\/\*.*?\*\/)/s,
];

export function containsSqlInjection(input: string): boolean {
  if (typeof input !== "string") return false;
  return DANGEROUS_PATTERNS.some((p) => p.test(input));
}

/**
 * XSS pattern kontrolü.
 */
const XSS_PATTERNS = [
  /<script\b/i,
  /javascript:/i,
  /on\w+\s*=/i,
  /<iframe\b/i,
  /<object\b/i,
  /<embed\b/i,
  /<svg\b/i,
  /data:text\/html/i,
];

export function containsXss(input: string): boolean {
  if (typeof input !== "string") return false;
  return XSS_PATTERNS.some((p) => p.test(input));
}

// ============================================================
//  3. Validators
// ============================================================

const TR_PHONE = /^(\+?90|0)?\s?5\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/;
const EMAIL = /^[^\s@<>]{1,64}@[^\s@<>]{1,255}\.[^\s@<>]{2,}$/;

export function isValidTurkishPhone(input: string): boolean {
  if (!input) return false;
  const clean = input.replace(/[\s\-()]/g, "");
  return TR_PHONE.test(clean);
}

export function normalizePhone(input: string): string {
  const clean = (input || "").replace(/[\s\-()]/g, "");
  if (clean.startsWith("+90")) return clean;
  if (clean.startsWith("90")) return "+" + clean;
  if (clean.startsWith("0")) return "+9" + clean;
  if (clean.startsWith("5")) return "+90" + clean;
  return clean;
}

export function isValidEmail(input: string): boolean {
  if (!input || input.length > 320) return false;
  return EMAIL.test(input);
}

// ============================================================
//  4. IP Extraction (anti-spoofing aware)
// ============================================================

export function getClientIp(req: Request): string {
  // Vercel: x-forwarded-for ilki gerçek client IP
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const ip = xff.split(",")[0].trim();
    if (ip && ip !== "unknown") return ip;
  }
  const xReal = req.headers.get("x-real-ip");
  if (xReal) return xReal.trim();
  return "unknown";
}

export function getUserAgent(req: Request): string {
  return (req.headers.get("user-agent") || "").slice(0, 255);
}

// ============================================================
//  5. Constant-time compare (timing attack prevention)
// ============================================================

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

// ============================================================
//  6. Security Headers
// ============================================================

export const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), browsing-topics=(), interest-cohort=()",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-site",
};

// ============================================================
//  7. CORS Guard
// ============================================================

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  const allowed = (process.env.NEXT_PUBLIC_ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (allowed.length === 0) return false;
  return allowed.includes(origin);
}

// ============================================================
//  8. Helper: generic API rate limit check
// ============================================================

export function checkRateLimit(
  limiter: RateLimiter,
  key: string
): { ok: true } | { ok: false; status: number; message: string; retryAfter: number } {
  const r = limiter.isRateLimited(key);
  if (r.blocked) {
    return {
      ok: false,
      status: 429,
      message: "Çok fazla istek. Lütfen daha sonra tekrar deneyin.",
      retryAfter: r.retryAfter,
    };
  }
  return { ok: true };
}
