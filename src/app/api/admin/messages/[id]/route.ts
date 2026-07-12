import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { apiLimiter, checkRateLimit, getClientIp, getUserAgent } from "@/lib/security";

const messageUpdateSchema = z.object({
  isRead: z.boolean().optional(),
  isReplied: z.boolean().optional(),
});

/**
 * GET /api/admin/messages/[id]
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  try {
    const msg = await db.contactMessage.findUnique({ where: { id } });
    if (!msg) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

    // Otomatik okundu işaretle
    if (!msg.isRead) {
      await db.contactMessage.update({ where: { id }, data: { isRead: true } });
    }
    return NextResponse.json({ message: { ...msg, isRead: true } });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/messages/[id]
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const ip = getClientIp(req);
  const rl = checkRateLimit(apiLimiter, `admin-msg:${ip}`);
  if (!rl.ok) return NextResponse.json({ error: rl.message }, { status: rl.status });

  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const parsed = messageUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri" }, { status: 422 });
  }

  try {
    const existing = await db.contactMessage.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

    const updated = await db.contactMessage.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ ok: true, message: updated });
  } catch {
    return NextResponse.json({ error: "Güncellenemedi" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/messages/[id]
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const ip = getClientIp(req);
  const rl = checkRateLimit(apiLimiter, `admin-msg:${ip}`);
  if (!rl.ok) return NextResponse.json({ error: rl.message }, { status: rl.status });

  const { id } = await params;
  try {
    await db.contactMessage.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Silinemedi" }, { status: 500 });
  }
}
