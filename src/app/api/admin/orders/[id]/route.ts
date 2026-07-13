import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { orderStatusUpdateSchema } from "@/lib/validators";
import { apiLimiter, checkRateLimit, getClientIp, getUserAgent } from "@/lib/security";

/**
 * GET /api/admin/orders/[id]
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  try {
    const order = await db.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/orders/[id]
 * Body: { status: "CONFIRMED" | ... }
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const ip = getClientIp(req);
  const rl = checkRateLimit(apiLimiter, `admin-orders:${ip}`);
  if (!rl.ok) return NextResponse.json({ error: rl.message }, { status: rl.status });

  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const parsed = orderStatusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Geçersiz veri", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  try {
    const existing = await db.order.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

    const updated = await db.order.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    await db.activityLog.create({
      data: {
        adminId: (auth.session.user as any).id,
        adminEmail: (auth.session.user as any).email,
        action: "UPDATE",
        entityType: "Order",
        entityId: id,
        details: `Order ${existing.orderNumber} status: ${existing.status} → ${parsed.data.status}`,
        ipAddress: ip === "unknown" ? null : ip,
        userAgent: getUserAgent(req),
      },
    }).catch(() => null);

    return NextResponse.json({ ok: true, order: updated });
  } catch (e) {
    console.error("admin orders PATCH error");
    return NextResponse.json({ error: "Güncellenemedi" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/orders/[id]
 * Siparişi sil (items ile birlikte cascade)
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const ip = getClientIp(req);
  const rl = checkRateLimit(apiLimiter, `admin-orders:${ip}`);
  if (!rl.ok) return NextResponse.json({ error: rl.message }, { status: rl.status });

  const { id } = await params;
  try {
    const existing = await db.order.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

    await db.order.delete({ where: { id } });

    await db.activityLog.create({
      data: {
        adminId: (auth.session.user as any).id,
        adminEmail: (auth.session.user as any).email,
        action: "DELETE",
        entityType: "Order",
        entityId: id,
        details: `Deleted order ${existing.orderNumber}`,
        ipAddress: ip === "unknown" ? null : ip,
        userAgent: getUserAgent(req),
      },
    }).catch(() => null);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("admin orders DELETE error");
    return NextResponse.json({ error: "Silinemedi" }, { status: 500 });
  }
}
