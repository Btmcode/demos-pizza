import { NextResponse } from "next/server";
import { db, parseJsonField, parseArrayField } from "@/lib/db";
import { apiLimiter, checkRateLimit, getClientIp } from "@/lib/security";

/**
 * POST /api/ai/recommend
 * AI-powered pizza recommendation.
 *
 * Production note: z-ai-web-dev-sdk requires a config file at /etc/.z-ai-config
 * which isn't available on Vercel. When ZAI.create() fails, we fall back to
 * rule-based recommendations using menu tags + keyword matching.
 *
 * To enable true AI on production: set OPENAI_API_KEY env var and swap the
 * ZAI import for OpenAI client. The fallback below is keyword-based and
 * still gives useful recommendations.
 */
export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(apiLimiter, `ai-rec:${ip}`);
  if (!rl.ok) {
    return NextResponse.json({ error: rl.message }, { status: rl.status });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const { preferences = "" } = body;
  if (!preferences || preferences.length > 500) {
    return NextResponse.json({ error: "Geçerli bir tercih girin" }, { status: 422 });
  }

  try {
    const items = await db.menuItem.findMany({
      where: { isAvailable: true, category: { in: ["PIZZA", "SIGNATURE"] } },
      select: {
        name: true, slug: true, description: true, priceCents: true,
        tags: true, ingredients: true, imageUrl: true,
      },
    });

    // Try AI first
    let aiRecommendations: any[] = [];
    try {
      const ZAI = (await import("z-ai-web-dev-sdk")).default;
      const zai = await ZAI.create();
      const menuData = items.map((it) => ({
        name: it.name, description: it.description,
        price: `${Math.round(it.priceCents / 100)} TL`,
        tags: parseArrayField(it.tags),
        ingredients: parseArrayField(it.ingredients),
      }));

      const prompt = `Sen Demos Pizza'nın AI asistanısın. Müşteri tercihine göre 3 pizza öner.

Tercih: "${preferences}"

Menü:
${JSON.stringify(menuData, null, 2)}

JSON formatında yanıt ver: {"recommendations":[{"name":"pizza adı","reason":"kısa açıklama","match":85}]}

Sadece 3 pizza. Match 70-100 arası. Türkçe.`;

      const completion = await zai.chat.completions.create({
        messages: [
          { role: "system", content: "Sen Demos Pizza AI asistanısın. JSON formatında yanıt verirsin." },
          { role: "user", content: prompt },
        ],
        thinking: { type: "disabled" },
      });

      const aiText = completion.choices[0]?.message?.content || "";
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiRecommendations = JSON.parse(jsonMatch[0]).recommendations || [];
      }
    } catch (e) {
      // AI unavailable — use fallback
      console.log("AI unavailable, using fallback");
    }

    // If AI worked, enrich and return
    if (aiRecommendations.length > 0) {
      const enriched = aiRecommendations.map((rec: any) => {
        const menuItem = items.find((it) =>
          it.name.toLowerCase().includes(rec.name.toLowerCase()) ||
          rec.name.toLowerCase().includes(it.name.toLowerCase())
        );
        if (menuItem) {
          return {
            ...rec,
            slug: menuItem.slug,
            price: `${Math.round(menuItem.priceCents / 100)} TL`,
            priceCents: menuItem.priceCents,
            imageUrl: menuItem.imageUrl,
            description: menuItem.description,
          };
        }
        return null;
      }).filter(Boolean);
      if (enriched.length > 0) {
        return NextResponse.json({ recommendations: enriched, source: "ai" });
      }
    }

    // ===== Fallback: Rule-based recommendation =====
    const pref = preferences.toLowerCase();
    const recommendations = items
      .map((item) => {
        const tags = parseArrayField(item.tags);
        const ingredients = parseArrayField(item.ingredients);
        const text = `${item.name} ${item.description} ${tags.join(" ")} ${ingredients.join(" ")}`.toLowerCase();
        let match = 60;
        let reason = "Popüler seçim";

        if (/acı|spicy|hot/.test(pref) && tags.includes("SPICY")) {
          match += 30;
          reason = "Acı sevenler için ideal — baharatlı lezzet";
        }
        if (/vej|vegan|bitki|sebze/.test(pref) && (tags.includes("VEGETARIAN") || tags.includes("VEGAN"))) {
          match += 30;
          reason = "Vejetaryen dostu, taze sebzelerle";
        }
        if (/peynir|cheese|formaj/.test(pref) && /peynir|mozzarella|cheddar|burrata|fontina|gorgonzola|parmesan/i.test(item.description)) {
          match += 25;
          reason = "Bol peynirli, kremamsı lezzet";
        }
        if (/sucuk/.test(pref) && /sucuk/i.test(item.name + item.description)) {
          match += 35;
          reason = "Sucuklu klasik, Türk damak tadına uygun";
        }
        if (/çocuk|cocuk|kid/.test(pref) && tags.includes("HALAL")) {
          match += 20;
          reason = "Çocuklar için uygun, helal malzemeler";
        }
        if (/ekonom|ucuz|afiaet/.test(pref) && item.priceCents < 25000) {
          match += 25;
          reason = "Ekonomik fiyat, lezzetli seçim";
        }
        if (/lüks|lux|spec/.test(pref) && tags.includes("CHEF_SPECIAL")) {
          match += 30;
          reason = "Şefin önerisi, premium malzemeler";
        }
        if (/trüf|tartufo/.test(pref) && /trüf|tartufo/i.test(item.name + item.description)) {
          match += 40;
          reason = "Siyah trüflü, lüks deneyim";
        }
        if (/bol|ekstra|fazla/.test(pref)) {
          match += 15;
          reason = "Bol malzemeli, doyurucu";
        }
        if (/tavuk|chicken/.test(pref) && /tavuk/i.test(item.name + item.description)) {
          match += 30;
          reason = "Tavuklu, proteinli seçim";
        }

        return {
          name: item.name,
          slug: item.slug,
          reason,
          match: Math.min(99, match),
          price: `${Math.round(item.priceCents / 100)} TL`,
          priceCents: item.priceCents,
          imageUrl: item.imageUrl,
          description: item.description,
        };
      })
      .sort((a, b) => b.match - a.match)
      .slice(0, 3);

    return NextResponse.json({
      recommendations,
      source: "smart-fallback",
    });
  } catch (e) {
    console.error("AI recommend error:", e);
    return NextResponse.json({ error: "Öneri alınamadı" }, { status: 500 });
  }
}
