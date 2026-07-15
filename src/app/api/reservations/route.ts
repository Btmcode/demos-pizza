import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reservationSchema } from "@/lib/validators";
import { reservationLimiter, checkRateLimit, getClientIp, getUserAgent, containsSqlInjection, containsXss, normalizePhone } from "@/lib/security";

/**
 * POST /api/reservations
 * Public: yeni rezervasyon talebi oluştur.
 */
export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(reservationLimiter, `resv:${ip}`);
  if (!rl.ok) {
    return NextResponse.json({ error: rl.message }, { status: rl.status });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const parsed = reservationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Geçersiz veri", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const data = parsed.data;

  const allText = [data.name, data.email, data.phone, data.notes || ""].join(" ");
  if (containsSqlInjection(allText) || containsXss(allText)) {
    return NextResponse.json({ error: "Geçersiz içerik" }, { status: 400 });
  }

  // Geçmiş tarih kontrolü
  const resDate = new Date(data.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (resDate < today) {
    return NextResponse.json({ error: "Geçmiş tarih seçilemez" }, { status: 422 });
  }

  try {
    // Aynı tarih+saat için çok fazla rezervasyon var mı?
    const sameSlot = await db.reservation.count({
      where: {
        date: resDate,
        time: data.time,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });
    if (sameSlot >= 8) {
      return NextResponse.json(
        { error: "Bu saat dilimi dolu. Lütfen başka bir saat deneyin." },
        { status: 409 }
      );
    }

    const reservation = await db.reservation.create({
      data: {
        name: data.name,
        email: data.email,
        phone: normalizePhone(data.phone),
        date: resDate,
        time: data.time,
        partySize: data.partySize,
        service: data.service,
        notes: data.notes || null,
        ipAddress: ip === "unknown" ? null : ip,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        id: reservation.id,
        message: "Rezervasyon talebiniz alındı. Onay için sizinle iletişime geçeceğiz.",
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("reservation create error:", e);
    return NextResponse.json({ error: "Rezervasyon oluşturulamadı" }, { status: 500 });
  }
}

/**
 * GET /api/reservations?date=YYYY-MM-DD
 * Public: belirli bir tarihte dolu saatleri listeler (takvim için).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const date = url.searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "date param gerekli" }, { status: 400 });
  }
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return NextResponse.json({ error: "Geçersiz tarih" }, { status: 400 });
  }
  try {
    const taken = await db.reservation.findMany({
      where: { date: d, status: { in: ["PENDING", "CONFIRMED"] } },
      select: { time: true, partySize: true },
    });
    const slotCounts: Record<string, number> = {};
    for (const t of taken) {
      slotCounts[t.time] = (slotCounts[t.time] || 0) + 1;
    }
    const fullSlots = Object.entries(slotCounts)
      .filter(([, c]) => c >= 8)
      .map(([s]) => s);
    return NextResponse.json({ fullSlots, takenCount: taken.length });
  } catch (e) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
