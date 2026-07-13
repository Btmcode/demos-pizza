import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { apiLimiter, checkRateLimit, getClientIp, getUserAgent, containsSqlInjection, containsXss } from "@/lib/security";

const campaignSchema = z.object({
  title: z.string().trim().min(2, "Başlık en az 2 karakter").max(100),
  description: z.string().trim().min(5, "Açıklama en az 5 karakter").max(500),
  code: z.string().trim().max(30).optional().or(z.literal("")),
  discountPct: z.number().int().min(0).max(100).optional().nullable(),
  discountCents: z.number().int().min(0).max(1000000).optional().nullable(),
  imageUrl: z.string().url().max(2048).optional().or(z.literal("")).nullable(),
  isActive: z.boolean().default(true),
  startsAt: z.string().optional().nullable(),
  endsAt: z.string().optional().nullable(),
  sortOrder: z.number().int().min(0).max(10000).default(0),
});

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const ip = getClientIp(req);
  const rl = checkRateLimit(apiLimiter, `admin-camp:${ip}`);
  if (!rl.ok) return NextResponse.json({ error: rl.message }, { status: rl.status });

  try {
    const campaigns = await db.campaign.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ campaigns });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const ip = getClientIp(req);
  const rl = checkRateLimit(apiLimiter, `admin-camp:${ip}`);
  if (!rl.ok) return NextResponse.json({ error: rl.message }, { status: rl.status });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 }); }

  const parsed = campaignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri", details: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const data = parsed.data;
  const allText = `${data.title} ${data.description} ${data.code || ""}`;
  if (containsSqlInjection(allText) || containsXss(allText)) {
    return NextResponse.json({ error: "Geçersiz içerik" }, { status: 400 });
  }

  try {
    const created = await db.campaign.create({
      data: {
        title: data.title,
        description: data.description,
        code: data.code || null,
        discountPct: data.discountPct ?? null,
        discountCents: data.discountCents ?? null,
        imageUrl: data.imageUrl || null,
        isActive: data.isActive,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
        sortOrder: data.sortOrder,
      },
    });

    await db.activityLog.create({
      data: {
        adminId: (auth.session.user as any).id,
        adminEmail: (auth.session.user as any).email,
        action: "CREATE",
        entityType: "Campaign",
        entityId: created.id,
        details: `Created campaign: ${created.title}`,
        ipAddress: ip === "unknown" ? null : ip,
        userAgent: getUserAgent(req),
      },
    }).catch(() => null);

    return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ error: "Bu kod zaten kullanımda" }, { status: 409 });
    return NextResponse.json({ error: "Oluşturulamadı" }, { status: 500 });
  }
}
