import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiLimiter, checkRateLimit, getClientIp, getUserAgent } from "@/lib/security";

/**
 * GET /api/admin/orders
 * Query: ?status=PENDING&page=1&limit=20&q=phone
 */
export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const ip = getClientIp(req);
  const rl = checkRateLimit(apiLimiter, `admin-orders:${ip}`);
  if (!rl.ok) return NextResponse.json({ error: rl.message }, { status: rl.status });

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20")));
  const q = url.searchParams.get("q")?.trim();

  const where: any = {};
  if (status && status !== "ALL") where.status = status;
  if (q) {
    where.OR = [
      { customerName: { contains: q } },
      { customerPhone: { contains: q } },
      { orderNumber: { contains: q } },
      { customerEmail: { contains: q } },
    ];
  }

  try {
    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { items: true },
      }),
      db.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (e) {
    console.error("admin orders GET error:", e);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
