import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { apiLimiter, checkRateLimit, getClientIp, getUserAgent } from "@/lib/security";

const resvStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]),
});

/**
 * GET /api/admin/reservations/[id]
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  try {
    const resv = await db.reservation.findUnique({ where: { id } });
    if (!resv) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    return NextResponse.json({ reservation: resv });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/reservations/[id]
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const ip = getClientIp(req);
  const rl = checkRateLimit(apiLimiter, `admin-resv:${ip}`);
  if (!rl.ok) return NextResponse.json({ error: rl.message }, { status: rl.status });

  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const parsed = resvStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri" }, { status: 422 });
  }

  try {
    const existing = await db.reservation.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

    const updated = await db.reservation.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    await db.activityLog.create({
      data: {
        adminId: (auth.session.user as any).id,
        adminEmail: (auth.session.user as any).email,
        action: "UPDATE",
        entityType: "Reservation",
        entityId: id,
        details: `Reservation ${existing.name} (${existing.date.toISOString().slice(0,10)} ${existing.time}) status: ${existing.status} → ${parsed.data.status}`,
        ipAddress: ip === "unknown" ? null : ip,
        userAgent: getUserAgent(req),
      },
    }).catch(() => null);

    return NextResponse.json({ ok: true, reservation: updated });
  } catch {
    return NextResponse.json({ error: "Güncellenemedi" }, { status: 500 });
  }
}
