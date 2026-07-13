import { NextResponse } from "next/server";
import { db, parseJsonField, parseArrayField } from "@/lib/db";
import { readLimiter, checkRateLimit, getClientIp } from "@/lib/security";

/**
 * GET /api/menu
 * Public: tüm aktif menü öğelerini listeler.
 */
export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(readLimiter, `menu:${ip}`);
  if (!rl.ok) {
    return NextResponse.json({ error: rl.message }, { status: rl.status });
  }

  try {
    const items = await db.menuItem.findMany({
      where: { isAvailable: true },
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        priceCents: true,
        category: true,
        imageUrl: true,
        isFeatured: true,
        ingredients: true,
        tags: true,
        allergens: true,
        sizes: true,
        crustTypes: true,
        extras: true,
      },
    });

    const serialized = items.map((it) => ({
      ...it,
      ingredients: parseArrayField(it.ingredients),
      tags: parseArrayField(it.tags),
      allergens: parseArrayField(it.allergens),
      sizes: parseJsonField(it.sizes, []),
      crustTypes: parseJsonField(it.crustTypes, []),
      extras: parseJsonField(it.extras, []),
    }));

    return NextResponse.json({ items: serialized });
  } catch (e) {
    console.error("menu GET error");
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
