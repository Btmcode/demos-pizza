import { NextResponse } from "next/server";
import { db, parseArrayField } from "@/lib/db";
import { apiLimiter, checkRateLimit, getClientIp } from "@/lib/security";

const SYSTEM_CONTEXT = `Demos Pizza, Fatih Haseki'de günlük taze hamur ve endüstriyel fırın kullanarak pizza yapan bir işletmedir.

Bilgiler:
- Adres: Haseki Sultan, Turgut Özal Millet Cd., 34093 Fatih/İstanbul
- Telefon: 444 00 00 (örnek)
- Çalışma: Pzt-Per 10:00-00:00, Cuma-Cmt 10:00-01:00, Pazar 10:00-00:00
- Teslimat: 30-45 dk, min 200 TL, 400 TL üzeri ücretsiz
- Servis bölgeleri: Haseki, Aksaray, Fındıkzade, Çapa, Şehremini, Molla Gürani, vb.
- Kampanya: 1 alana 1 bedava (büyük boy pizzalarda)
- Ödeme: Kapıda nakit/kart
- Hamur: Her gün taze, dondurulmuş değil
- Fırın: Endüstriyel (taş fırın değil)`;

/**
 * POST /api/ai/chat
 * AI Chat assistant — tries z-ai SDK, falls back to rule-based responses
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

  const { message = "" } = body;
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

    // Try AI first
    try {
      const ZAI = (await import("z-ai-web-dev-sdk")).default;
      const zai = await ZAI.create();

      const messages = (body.messages || []).slice(-6).map((m: any) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      }));

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `Sen Demos Pizza'nın yardımsever AI asistanısın. ${SYSTEM_CONTEXT}\n\nMevcut menü:\n${menuContext}\n\nTürkçe, kısa (max 3 cümle), nazik yanıt ver. Emoji kullanma.`,
          },
          ...messages,
          { role: "user", content: message },
        ],
        thinking: { type: "disabled" },
      });

      const aiResponse = completion.choices[0]?.message?.content;
      if (aiResponse) {
        return NextResponse.json({ message: aiResponse, source: "ai" });
      }
    } catch (e) {
      console.log("AI unavailable, using fallback");
    }

    // ===== Fallback: Rule-based responses =====
    const msg = message.toLowerCase();
    let response = "";

    if (/merhaba|selam|naber|hey/.test(msg)) {
      response = "Merhaba! Demos Pizza'ya hoş geldin. Sipariş, menü veya teslimat hakkında her şeyi sorabilirsin. Hangi pizza sana uygun?";
    } else if (/acı|spicy|hot/.test(msg)) {
      response = "Acı sevenler için Diavola pizza öneririm — spicy salam, jalapeño ve acı biberle. Ayrıca pul biber de ekleyebilirsin!";
    } else if (/vej|vegan|sebze|bitki/.test(msg)) {
      response = "Vejetaryen seçeneklerimiz: Margherita, Quattro Formaggi, Vegetariana ve Akdeniz pizzaları. Hepsi taze sebzelerle hazırlanır.";
    } else if (/teslimat|süre|ne kadar|kaç dk|ne zaman/.test(msg)) {
      response = `Teslimat süremiz 30-45 dakikadır. Min. sipariş 200 TL, 400 TL üzeri ücretsiz teslimat. Servis bölgelerimiz: Haseki, Aksaray, Fındıkzade, Çapa ve daha fazlası.`;
    } else if (/1 alana|bedava|kampanya|indirim|promosyon/.test(msg)) {
      response = "1 alana 1 bedava kampanyamız tüm büyük boy pizzalarda geçerli! Sipariş verirken otomatik uygulanır. Paket serviste geçerlidir.";
    } else if (/minimum|min sipari|en az/.test(msg)) {
      response = "Minimum sipariş tutarı 200 TL'dir. 400 TL ve üzeri siparişlerde teslimat ücretsizdir.";
    } else if (/saat|açık|kapalı|ne zaman/.test(msg)) {
      return NextResponse.json({
        message: "Hafta içi 10:00-00:00, Cuma-Cumartesi 10:00-01:00, Pazar 10:00-00:00 açığız. Sipariş için her zaman buradayız!",
      });
    } else if (/sucuk/.test(msg)) {
      response = "Sucuklu pizzalarımız: Demos Sucuklu (Türk-İtalyan sentezi, imza), Karışık ve Mafya. Hepsi bol malzemeli!";
    } else if (/peynir|cheese|formaj/.test(msg)) {
      response = "Peynir severler için: Quattro Formaggi (4 peynir), Margherita (mozzarella), Prosciutto e Burrata (kremamsı burrata). Ekstra peynir de ekleyebilirsin!";
    } else if (/öner|tavsiye|hangi/.test(msg)) {
      response = "Sana göre: Margherita (klasik), Demos Sucuklu (Türk damak), Tartufo Nero (lüks trüf). AI öneri aracını kullanarak kişiselleştirilmiş öneri de alabilirsin!";
    } else if (/öde|kart|nakit|payment/.test(msg)) {
      response = "Şu an kapıda nakit ve kapıda kart ödemesi kabul ediyoruz. Online ödeme yakında geliyor!";
    } else if (/adres|nerede|konum/.test(msg)) {
      response = "Adresimiz: Haseki Sultan, Turgut Özal Millet Cd., 34093 Fatih/İstanbul. Haseki Sultan metro durağına yürüme mesafesinde.";
    } else if (/tel|telefon|ara/.test(msg)) {
      response = "Telefonumuz: 444 00 00. Sipariş için arayabilir veya online verebilirsin.";
    } else if (/hamur|mayalı|taze/.test(msg)) {
      response = "Hamurumuz her sabah taze hazırlanır — dondurulmuş değil! El yapımı, endüstriyel fırında mükemmel kıvamında pişer.";
    } else if (/fırın|ocak|pişim/.test(msg)) {
      response = "Endüstriyel fırın kullanıyoruz — taş fırın değil. Bu, her pizzayı mükemmel kıvamında, çıtır dış ve yumuşak iç ile pişirmemizi sağlar.";
    } else if (/rezerv|masa|yer/.test(msg)) {
      response = "Rezervasyon sistemimiz yok — sadece online sipariş ve paket servis yapıyoruz. Mekanda yemek istersen gel-al siparişi verebilirsin.";
    } else if (/gluten/.test(msg)) {
      response = "Glutensiz pizza seçeneğimiz şu an yok, ama vejetaryen ve vegan seçeneklerimiz mevcut. Alerjin varsa menüde alerjen bilgileri belirtilmiş.";
    } else if (/child|çocuk|cocuk|bebek/.test(msg)) {
      response = "Çocuklar için Margherita veya Demos Sucuklu öneririm — mild ve tanıdık lezzetler. Acısız ve bol malzemeli.";
    } else {
      response = "Soru için teşekkürler! Sipariş vermek için menüye göz at, AI öneri aracıyla sana özel pizza bul, veya bana daha spesifik bir soru sor. Teslimat 30-45 dk, min 200 TL, 1 alana 1 bedava kampanyası aktif!";
    }

    return NextResponse.json({ message: response, source: "smart-fallback" });
  } catch (e) {
    console.error("AI chat error:", e);
    return NextResponse.json({ error: "AI yanıt veremedi" }, { status: 500 });
  }
}
