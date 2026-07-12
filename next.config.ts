import type { NextConfig } from "next";

/**
 * Demos Pizza · Next.js Config
 *
 * - Vercel deploy için optimize
 * - Prisma için serverless external package
 * - Görsel optimizasyon (Unsplash, Neon vs. izinli)
 * - Güvenlik headers middleware'da ekleniyor
 */
const nextConfig: NextConfig = {
  // Vercel'de standalone output kullanma — Vercel kendi optimize eder
  // output: "standalone", // ← sadece Docker için
  reactStrictMode: true,
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: false,
  },
  // Serverless'ta Prisma'yı external package olarak işaretle
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "z-cdn.chatglm.cn" },
    ],
    // Local /public altındaki statik görseller otomatik optimize edilir
  },
  // Security headers (middleware da ekler, ama production çift katman)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=(), interest-cohort=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-site" },
        ],
      },
      // Admin rotaları için ekstra kısıtlama
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, nosnippet, noarchive" },
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
        ],
      },
      // API rotaları cache'siz
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
};

export default nextConfig;
