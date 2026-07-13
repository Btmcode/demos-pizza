import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readLimiter, checkRateLimit, getClientIp } from "@/lib/security";

/**
 * GET /api/orders/track?orderNumber=DP-XXXXXXXX-XXXX
 * Public: sipariş numarası ile sipariş durumu sorgula
 */
export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(readLimiter, `track:${ip}`);
  if (!rl.ok) {
    return NextResponse.json({ error: rl.message }, { status: rl.status });
  }

  const url = new URL(req.url);
  const orderNumber = url.searchParams.get("orderNumber")?.trim().toUpperCase();

  if (!orderNumber || orderNumber.length > 20) {
    return NextResponse.json({ error: "Geçerli bir sipariş numarası girin" }, { status: 422 });
  }

  try {
    const order = await db.order.findUnique({
      where: { orderNumber },
      select: {
        orderNumber: true,
        status: true,
        orderType: true,
        totalCents: true,
        createdAt: true,
        items: {
          select: { name: true, quantity: true, unitPriceCents: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
