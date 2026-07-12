import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { db, parseArrayField } from "@/lib/db";
import { apiLimiter, checkRateLimit, getClientIp } from "@/lib/security";

const SYSTEM_PROMPT = `Sen Demos Pizza'nın AI asistanısın. Demos Pizza, Fatih Haseki'de günlük taze hamur ve endüstriyel fırın kullanarak pizza yapan bir işletmedir.

Görevlerin:
1. Müşteri sorularını yanıtlamak (menü, fiyat, teslimat, kampanyalar)
2. Pizza önerileri vermek
3. Sipariş süreci hakkında bilgi vermek
4. Nazik, yardımsever ve kısa olmak (max 3-4 cümle)

Bilgiler:
- Adres: Haseki Sultan, Turgut Özal Millet Cd., 34093 Fatih/İstanbul
- Telefon: 444 00 00 (örnek)
- Çalışma: Pzt-Per 10:00-00:00, Cuma-Cmt 10:00-01:00, Pazar 10:00-00:00
- Teslimat: 30-45 dk, min 200 TL, 400 TL üzeri ücretsiz
- Servis bölgeleri: Haseki, Aksaray, Fındıkzade, Çapa, Şehremini, Molla Gürani, vb.
- Kampanya: 1 alana 1 bedava (büyük boy pizzalarda)
- Ödeme: Kapıda nakit/kart
- Hamur: Her gün taze, dondurulmuş değil
- Fırın: Endüstriyel (taş fırın değil)
- Rezervasyon: Yok, sadece online sipariş

Türkçe yanıt ver. Emoji kullanma. Kısa ve net ol.`;

/**
 * POST /api/ai/chat
 * AI Chat assistant
 */
export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(apiLimiter, `ai-chat:${ip}`);
  if (!rl.ok) {
    return NextResponse.json({ error: rl.message }, { status: rl.status });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const { messages = [], message = "" } = body;
  if (!message || message.length > 500) {
    return NextResponse.json({ error: "Geçerli bir mesaj girin" }, { status: 422 });
  }

  try {
    // Get menu context
    const menuItems = await db.menuItem.findMany({
      where: { isAvailable: true },
      select: { name: true, description: true, priceCents: true, category: true, tags: true },
      take: 30,
    });
    const menuContext = menuItems
      .map((it) => `- ${it.name} (${it.category}): ${it.description} - ${Math.round(it.priceCents / 100)} TL`)
      .join("\n");

    const zai = await ZAI.create();
    
    const conversationMessages = [
      { role: "system", content: SYSTEM_PROMPT + "\n\nMevcut menü:\n" + menuContext },
      ...messages.slice(-6).map((m: any) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const completion = await zai.chat.completions.create({
      messages: conversationMessages as any,
      thinking: { type: "disabled" },
    });

    const aiResponse = completion.choices[0]?.message?.content || "Üzgünüm, şu an yanıt veremiyorum.";

    return NextResponse.json({
      message: aiResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.error("AI chat error:", e);
    return NextResponse.json({ error: "AI yanıt veremedi" }, { status: 500 });
  }
}
