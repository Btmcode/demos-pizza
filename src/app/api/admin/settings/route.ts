import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { settingSchema } from "@/lib/validators";
import { apiLimiter, checkRateLimit, getClientIp, containsSqlInjection, containsXss } from "@/lib/security";

/**
 * GET /api/admin/settings
 */
export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    const settings = await db.siteSetting.findMany();
    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = s.value;
    return NextResponse.json({ settings: map });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

/**
 * PUT /api/admin/settings
 * Body: { settings: { KEY: "value", ... } }
 */
export async function PUT(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const ip = getClientIp(req);
  const rl = checkRateLimit(apiLimiter, `admin-settings:${ip}`);
  if (!rl.ok) return NextResponse.json({ error: rl.message }, { status: rl.status });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const schema = z.object({
    settings: z.record(z.string(), z.string().max(5000)),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri" }, { status: 422 });
  }

  const entries = Object.entries(parsed.data.settings);

  // Güvenlik kontrolü
  for (const [k, v] of entries) {
    if (containsSqlInjection(k + " " + v) || containsXss(v)) {
      return NextResponse.json({ error: `Geçersiz içerik: ${k}` }, { status: 400 });
    }
  }

  try {
    await db.$transaction(
      entries.map(([key, value]) =>
        db.siteSetting.upsert({
          where: { key },
          create: { key, value },
          update: { value },
        })
      )
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("admin settings PUT error:", e);
    return NextResponse.json({ error: "Güncellenemedi" }, { status: 500 });
  }
}
