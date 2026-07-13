import { NextResponse } from "next/server";
import { db, parseJsonField, parseArrayField } from "@/lib/db";
import { readLimiter, checkRateLimit, getClientIp } from "@/lib/security";

/**
 * GET /api/menu/[slug]
 * Public: tek menü öğesi detayı
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(readLimiter, `menu-detail:${ip}`);
  if (!rl.ok) {
    return NextResponse.json({ error: rl.message }, { status: rl.status });
  }

  const { slug } = await params;

  try {
    const item = await db.menuItem.findUnique({
      where: { slug },
    });

    if (!item || !item.isAvailable) {
      return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
    }

    const serialized = {
      ...item,
      ingredients: parseArrayField(item.ingredients),
      tags: parseArrayField(item.tags),
      allergens: parseArrayField(item.allergens),
      sizes: parseJsonField(item.sizes, []),
      crustTypes: parseJsonField(item.crustTypes, []),
      extras: parseJsonField(item.extras, []),
    };

    // İlgili ürünleri de getir (aynı kategori)
    const related = await db.menuItem.findMany({
      where: {
        category: item.category,
        isAvailable: true,
        slug: { not: slug },
      },
      take: 4,
      orderBy: { sortOrder: "asc" },
      select: {
        id: true, slug: true, name: true, priceCents: true,
        imageUrl: true, category: true, isFeatured: true,
      },
    });

    return NextResponse.json({ item: serialized, related });
  } catch (e) {
    console.error("menu detail error");
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
