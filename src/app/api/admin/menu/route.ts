import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db, parseJsonField, parseArrayField } from "@/lib/db";
import { menuItemSchema } from "@/lib/validators";
import { apiLimiter, checkRateLimit, getClientIp, getUserAgent, containsSqlInjection, containsXss } from "@/lib/security";

/**
 * GET /api/admin/menu
 * Tüm menü öğeleri (admin, kullanılabilir olmayanlar dahil)
 */
export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const ip = getClientIp(req);
  const rl = checkRateLimit(apiLimiter, `admin-menu:${ip}`);
  if (!rl.ok) return NextResponse.json({ error: rl.message }, { status: rl.status });

  try {
    const items = await db.menuItem.findMany({
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
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
    console.error("admin menu GET error");
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

/**
 * POST /api/admin/menu
 * Yeni menü öğesi oluştur
 */
export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const ip = getClientIp(req);
  const rl = checkRateLimit(apiLimiter, `admin-menu:${ip}`);
  if (!rl.ok) return NextResponse.json({ error: rl.message }, { status: rl.status });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const parsed = menuItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Geçersiz veri", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const data = parsed.data;

  // Güvenlik
  const allText = [data.name, data.description, data.imageUrl || "", data.ingredients.join(" "), data.tags.join(" "), data.allergens.join(" ")].join(" ");
  if (containsSqlInjection(allText) || containsXss(allText)) {
    return NextResponse.json({ error: "Geçersiz içerik" }, { status: 400 });
  }

  try {
    const created = await db.menuItem.create({
      data: {
        slug: data.slug,
        name: data.name,
        description: data.description,
        priceCents: data.priceCents,
        category: data.category,
        imageUrl: data.imageUrl || null,
        isAvailable: data.isAvailable,
        isFeatured: data.isFeatured,
        ingredients: JSON.stringify(data.ingredients),
        tags: JSON.stringify(data.tags),
        allergens: JSON.stringify(data.allergens),
        sizes: JSON.stringify(data.sizes),
        crustTypes: JSON.stringify(data.crustTypes),
        extras: JSON.stringify(data.extras),
        sortOrder: data.sortOrder,
      },
    });

    // Audit log
    await db.activityLog.create({
      data: {
        adminId: (auth.session.user as any).id,
        adminEmail: (auth.session.user as any).email,
        action: "CREATE",
        entityType: "MenuItem",
        entityId: created.id,
        details: `Created menu item: ${created.name}`,
        ipAddress: ip === "unknown" ? null : ip,
        userAgent: getUserAgent(req),
      },
    }).catch(() => null);

    return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "Bu slug zaten kullanımda" }, { status: 409 });
    }
    console.error("admin menu POST error");
    return NextResponse.json({ error: "Oluşturulamadı" }, { status: 500 });
  }
}
