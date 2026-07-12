import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { db, parseArrayField } from "@/lib/db";
import { apiLimiter, checkRateLimit, getClientIp } from "@/lib/security";

/**
 * POST /api/ai/search
 * AI-powered food search — natural language queries
 */
export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(apiLimiter, `ai-search:${ip}`);
  if (!rl.ok) {
    return NextResponse.json({ error: rl.message }, { status: rl.status });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const { query = "" } = body;
  if (!query || query.length > 200) {
    return NextResponse.json({ error: "Geçerli bir arama yapın" }, { status: 422 });
  }

  try {
    const allItems = await db.menuItem.findMany({
      where: { isAvailable: true },
      select: {
        id: true, name: true, slug: true, description: true, priceCents: true,
        category: true, imageUrl: true, tags: true, ingredients: true,
      },
    });

    const menuData = allItems.map((it) => ({
      id: it.id, name: it.name, slug: it.slug,
      description: it.description, price: `${Math.round(it.priceCents / 100)} TL`,
      category: it.category, tags: parseArrayField(it.tags),
      ingredients: parseArrayField(it.ingredients),
    }));

    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Sen bir pizza menü arama asistanısın. Kullanıcının sorgusuna en uygun ürünleri bul ve JSON formatında döndür.",
        },
        {
          role: "user",
          content: `Arama sorgusu: "${query}"

Mevcut ürünler:
${JSON.stringify(menuData, null, 2)}

Sorguya en uygun ürünleri bul. JSON formatında yanıt ver:
{
  "results": [
    { "id": "ürün id", "reason": "neden eşleşti (kısa)" }
  ]
}

En fazla 5 ürün döndür. Türkçe yanıt ver.`,
        },
      ],
      thinking: { type: "disabled" },
    });

    const aiText = completion.choices[0]?.message?.content || "";
    let results: any[] = [];
    try {
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        results = parsed.results || [];
      }
    } catch {}

    // Enrich results with full item data
    const enriched = results.map((r: any) => {
      const item = allItems.find((it) => it.id === r.id);
      if (item) {
        return {
          ...r,
          id: item.id,
          slug: item.slug,
          name: item.name,
          description: item.description,
          priceCents: item.priceCents,
          category: item.category,
          imageUrl: item.imageUrl,
        };
      }
      return null;
    }).filter(Boolean);

    return NextResponse.json({ results: enriched });
  } catch (e) {
    console.error("AI search error:", e);
    return NextResponse.json({ error: "AI arama yapamadı" }, { status: 500 });
  }
}
