import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db, parseJsonField, parseArrayField } from "@/lib/db";
import { apiLimiter, checkRateLimit, getClientIp } from "@/lib/security";

/**
 * GET /api/admin/stats
 * Admin dashboard istatistikleri
 */
export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const ip = getClientIp(req);
  const rl = checkRateLimit(apiLimiter, `admin-stats:${ip}`);
  if (!rl.ok) {
    return NextResponse.json({ error: rl.message }, { status: rl.status });
  }

  try {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const last7 = new Date(now);
    last7.setDate(now.getDate() - 6);
    last7.setHours(0, 0, 0, 0);
    const last30 = new Date(now);
    last30.setDate(now.getDate() - 29);
    last30.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      todayOrders,
      pendingOrders,
      todayReservations,
      pendingReservations,
      unreadMessages,
      totalMenuItems,
      availableMenuItems,
      orders30d,
      reservations30d,
    ] = await Promise.all([
      db.order.count(),
      db.order.count({ where: { createdAt: { gte: todayStart } } }),
      db.order.count({ where: { status: "PENDING" } }),
      db.reservation.count({ where: { date: { gte: todayStart } } }),
      db.reservation.count({ where: { status: "PENDING" } }),
      db.contactMessage.count({ where: { isRead: false } }),
      db.menuItem.count(),
      db.menuItem.count({ where: { isAvailable: true } }),
      db.order.findMany({
        where: { createdAt: { gte: last30 } },
        select: { totalCents: true, createdAt: true, status: true },
      }),
      db.reservation.findMany({
        where: { createdAt: { gte: last30 } },
        select: { date: true, partySize: true, status: true },
      }),
    ]);

    // Revenue calculation — only DELIVERED or CONFIRMED+ orders
    const validRevenue = orders30d
      .filter((o) => ["DELIVERED", "OUT_FOR_DELIVERY", "CONFIRMED", "PREPARING"].includes(o.status))
      .reduce((sum, o) => sum + o.totalCents, 0);

    const todayRevenue = orders30d
      .filter((o) => o.createdAt >= todayStart && ["DELIVERED", "OUT_FOR_DELIVERY", "CONFIRMED", "PREPARING"].includes(o.status))
      .reduce((sum, o) => sum + o.totalCents, 0);

    // 7 günlük günlük sipariş trendi
    const last7Orders = orders30d.filter((o) => o.createdAt >= last7);
    const dailyOrders: { date: string; count: number; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(now.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);
      const dayOrders = last7Orders.filter(
        (o) => o.createdAt >= dayStart && o.createdAt < dayEnd
      );
      const dayRevenue = dayOrders
        .filter((o) => ["DELIVERED", "OUT_FOR_DELIVERY", "CONFIRMED", "PREPARING"].includes(o.status))
        .reduce((sum, o) => sum + o.totalCents, 0);
      dailyOrders.push({
        date: dayStart.toISOString().slice(0, 10),
        count: dayOrders.length,
        revenue: dayRevenue,
      });
    }

    // En çok satanlar (son 30 gün)
    const popularItems: { name: string; count: number; revenue: number }[] = [];
    const orderItems30d = await db.orderItem.findMany({
      where: { order: { createdAt: { gte: last30 } } },
      select: { name: true, quantity: true, unitPriceCents: true },
    });
    const itemMap = new Map<string, { count: number; revenue: number }>();
    for (const oi of orderItems30d) {
      const cur = itemMap.get(oi.name) || { count: 0, revenue: 0 };
      cur.count += oi.quantity;
      cur.revenue += oi.unitPriceCents * oi.quantity;
      itemMap.set(oi.name, cur);
    }
    for (const [name, stats] of itemMap.entries()) {
      popularItems.push({ name, ...stats });
    }
    popularItems.sort((a, b) => b.count - a.count);

    return NextResponse.json({
      counts: {
        totalOrders,
        todayOrders,
        pendingOrders,
        todayReservations,
        pendingReservations,
        unreadMessages,
        totalMenuItems,
        availableMenuItems,
      },
      revenue: {
        todayCents: todayRevenue,
        last30Cents: validRevenue,
        todayDisplay: `${Math.round(todayRevenue / 100).toLocaleString("tr-TR")} ₺`,
        last30Display: `${Math.round(validRevenue / 100).toLocaleString("tr-TR")} ₺`,
      },
      charts: {
        dailyOrders,
        popularItems: popularItems.slice(0, 6),
      },
    });
  } catch (e) {
    console.error("admin stats error:", e);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
