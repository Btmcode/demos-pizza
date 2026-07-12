import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactSchema } from "@/lib/validators";
import { contactLimiter, checkRateLimit, getClientIp, containsSqlInjection, containsXss } from "@/lib/security";

/**
 * POST /api/contact
 * Public: iletişim formundan mesaj gönder.
 * Honeypot alanı ile bot koruması.
 */
export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(contactLimiter, `contact:${ip}`);
  if (!rl.ok) {
    return NextResponse.json({ error: rl.message }, { status: rl.status });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Geçersiz veri", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const data = parsed.data;

  // Honeypot — doldurulmuşsa bot
  if (data.website) {
    // Bot'a başarı döndür ama kaydetme
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const allText = [data.name, data.email, data.subject, data.message, data.phone || ""].join(" ");
  if (containsSqlInjection(allText) || containsXss(allText)) {
    return NextResponse.json({ error: "Geçersiz içerik" }, { status: 400 });
  }

  try {
    await db.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        subject: data.subject,
        message: data.message,
        ipAddress: ip === "unknown" ? null : ip,
      },
    });

    return NextResponse.json(
      { ok: true, message: "Mesajınız alındı. En kısa sürede dönüş yapacağız." },
      { status: 201 }
    );
  } catch (e) {
    console.error("contact create error:", e);
    return NextResponse.json({ error: "Mesaj gönderilemedi" }, { status: 500 });
  }
}
