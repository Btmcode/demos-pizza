import { NextResponse } from "next/server";
import { BRAND, CONTACT, NAV_LINKS } from "@/lib/constants";

/**
 * Dinamik sitemap.xml üretir
 * Local SEO için kritik — Google'a tüm sayfaları bildirir
 */
export async function GET() {
  const baseUrl = BRAND.siteUrl;
  const now = new Date().toISOString();

  const staticPages = [
    { url: "/", priority: "1.0", changefreq: "daily", lastmod: now },
    { url: "/kvkk", priority: "0.3", changefreq: "yearly", lastmod: now },
    { url: "/gizlilik", priority: "0.3", changefreq: "yearly", lastmod: now },
    { url: "/cerez", priority: "0.3", changefreq: "yearly", lastmod: now },
    { url: "/teslimat", priority: "0.5", changefreq: "monthly", lastmod: now },
    { url: "/iade", priority: "0.5", changefreq: "monthly", lastmod: now },
  ];

  const urls = staticPages
    .map(
      (p) => `  <url>
    <loc>${baseUrl}${p.url}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    )
    .join("\n");

  // Servis bölgeleri için ayrı URL'ler (local SEO)
  const areaUrls = CONTACT.delivery.serviceAreas
    .map(
      (area) => `  <url>
    <loc>${baseUrl}/#menu?area=${encodeURIComponent(area)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
${areaUrls}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
