import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { menuItemUpdateSchema } from "@/lib/validators";
import { apiLimiter, checkRateLimit, getClientIp, getUserAgent, containsSqlInjection, containsXss } from "@/lib/security";

/**
 * GET /api/admin/menu/[id]
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  try {
    const item = await db.menuItem.findUnique({ where: { id } });
    if (!item) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

/**
 * PUT /api/admin/menu/[id]
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const ip = getClientIp(req);
  const rl = checkRateLimit(apiLimiter, `admin-menu:${ip}`);
  if (!rl.ok) return NextResponse.json({ error: rl.message }, { status: rl.status });

  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const parsed = menuItemUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Geçersiz veri", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const data = parsed.data;

  // Güvenlik
  const fields = [data.name, data.description, data.imageUrl, data.ingredients?.join(" "), data.tags?.join(" "), data.allergens?.join(" ")].filter(Boolean) as string[];
  const allText = fields.join(" ");
  if (allText && (containsSqlInjection(allText) || containsXss(allText))) {
    return NextResponse.json({ error: "Geçersiz içerik" }, { status: 400 });
  }

  try {
    const existing = await db.menuItem.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priceCents !== undefined) updateData.priceCents = data.priceCents;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl || null;
    if (data.isAvailable !== undefined) updateData.isAvailable = data.isAvailable;
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
    if (data.ingredients !== undefined) updateData.ingredients = JSON.stringify(data.ingredients);
    if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags);
    if (data.allergens !== undefined) updateData.allergens = JSON.stringify(data.allergens);
    if (data.sizes !== undefined) updateData.sizes = JSON.stringify(data.sizes);
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

    const updated = await db.menuItem.update({ where: { id }, data: updateData });

    await db.activityLog.create({
      data: {
        adminId: (auth.session.user as any).id,
        adminEmail: (auth.session.user as any).email,
        action: "UPDATE",
        entityType: "MenuItem",
        entityId: id,
        details: `Updated menu item: ${updated.name}`,
        ipAddress: ip === "unknown" ? null : ip,
        userAgent: getUserAgent(req),
      },
    }).catch(() => null);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "Bu slug zaten kullanımda" }, { status: 409 });
    }
    console.error("admin menu PUT error:", e);
    return NextResponse.json({ error: "Güncellenemedi" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/menu/[id]
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const ip = getClientIp(req);
  const rl = checkRateLimit(apiLimiter, `admin-menu:${ip}`);
  if (!rl.ok) return NextResponse.json({ error: rl.message }, { status: rl.status });

  const { id } = await params;
  try {
    const existing = await db.menuItem.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

    // Sipariş geçmişinde varsa hard-delete yerine soft-delete (kullanılamaz yap)
    const hasOrders = await db.orderItem.count({ where: { menuItemId: id } });
    if (hasOrders > 0) {
      await db.menuItem.update({
        where: { id },
        data: { isAvailable: false, isFeatured: false },
      });
      await db.activityLog.create({
        data: {
          adminId: (auth.session.user as any).id,
          adminEmail: (auth.session.user as any).email,
          action: "ARCHIVE",
          entityType: "MenuItem",
          entityId: id,
          details: `Archived menu item (had orders): ${existing.name}`,
          ipAddress: ip === "unknown" ? null : ip,
          userAgent: getUserAgent(req),
        },
      }).catch(() => null);
      return NextResponse.json({ ok: true, archived: true });
    }

    await db.menuItem.delete({ where: { id } });
    await db.activityLog.create({
      data: {
        adminId: (auth.session.user as any).id,
        adminEmail: (auth.session.user as any).email,
        action: "DELETE",
        entityType: "MenuItem",
        entityId: id,
        details: `Deleted menu item: ${existing.name}`,
        ipAddress: ip === "unknown" ? null : ip,
        userAgent: getUserAgent(req),
      },
    }).catch(() => null);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("admin menu DELETE error:", e);
    return NextResponse.json({ error: "Silinemedi" }, { status: 500 });
  }
}
