import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiLimiter, checkRateLimit, getClientIp } from "@/lib/security";

/**
 * GET /api/admin/reservations
 */
export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const ip = getClientIp(req);
  const rl = checkRateLimit(apiLimiter, `admin-resv:${ip}`);
  if (!rl.ok) return NextResponse.json({ error: rl.message }, { status: rl.status });

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "30")));

  const where: any = {};
  if (status && status !== "ALL") where.status = status;

  try {
    const [reservations, total] = await Promise.all([
      db.reservation.findMany({
        where,
        orderBy: [{ date: "asc" }, { time: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.reservation.count({ where }),
    ]);

    return NextResponse.json({
      reservations,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
