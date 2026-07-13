import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readLimiter, checkRateLimit, getClientIp } from "@/lib/security";

/**
 * GET /api/campaigns
 * Public: aktif kampanyaları listele
 */
export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(readLimiter, `campaigns:${ip}`);
  if (!rl.ok) {
    return NextResponse.json({ error: rl.message }, { status: rl.status });
  }

  try {
    const now = new Date();
    const campaigns = await db.campaign.findMany({
      where: {
        isActive: true,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
        ],
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 20,
    });
    return NextResponse.json({ campaigns });
  } catch (e) {
    console.error("campaigns GET error");
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
