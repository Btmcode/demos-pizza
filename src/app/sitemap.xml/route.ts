import { NextResponse } from "next/server";
import { CONTACT, BRAND } from "@/lib/constants";

/**
 * Dinamik sitemap.xml — tüm bölge sayfalarını dahil eder
 * GEO SEO için kritik
 */
export async function GET() {
  const baseUrl = BRAND.siteUrl;
  const now = new Date().toISOString();

  const staticPages = [
    { url: "/", priority: "1.0", changefreq: "daily" },
    { url: "/kvkk", priority: "0.3", changefreq: "yearly" },
    { url: "/gizlilik", priority: "0.3", changefreq: "yearly" },
    { url: "/cerez", priority: "0.3", changefreq: "yearly" },
    { url: "/teslimat", priority: "0.5", changefreq: "monthly" },
    { url: "/iade", priority: "0.5", changefreq: "monthly" },
  ];

  const staticUrls = staticPages
    .map(
      (p) => `  <url>
    <loc>${baseUrl}${p.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    )
    .join("\n");

  // GEO pages for each service area
  const areaUrls = CONTACT.delivery.serviceAreas
    .map(
      (area) => {
        const slug = area.toLowerCase()
          .replace(/İ/g, "i").replace(/Ş/g, "s").replace(/Ğ/g, "g")
          .replace(/Ü/g, "u").replace(/Ö/g, "o").replace(/Ç/g, "c")
          .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
        return `  <url>
    <loc>${baseUrl}/bolge/${slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      }
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${areaUrls}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
