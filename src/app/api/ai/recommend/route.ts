import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { db, parseJsonField, parseArrayField } from "@/lib/db";
import { apiLimiter, checkRateLimit, getClientIp } from "@/lib/security";

/**
 * POST /api/ai/recommend
 * AI-powered pizza recommendation based on user preferences.
 *
 * Body: { preferences: string, mood?: string, spiceLevel?: string, dietary?: string[] }
 * Returns: { recommendations: [{ name, reason, match }], aiText: string }
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

  const { preferences = "", mood = "", spiceLevel = "", dietary = [] } = body;
  if (!preferences || preferences.length > 500) {
    return NextResponse.json({ error: "Geçerli bir tercih girin" }, { status: 422 });
  }

  try {
    // Get available menu items
    const items = await db.menuItem.findMany({
      where: { isAvailable: true, category: { in: ["PIZZA", "SIGNATURE"] } },
      select: {
        name: true, description: true, priceCents: true, tags: true,
        ingredients: true, sizes: true, imageUrl: true, slug: true,
      },
    });

    const menuData = items.map((it) => ({
      name: it.name,
      description: it.description,
      price: `${Math.round(it.priceCents / 100)} TL`,
      tags: parseArrayField(it.tags),
      ingredients: parseArrayField(it.ingredients),
    }));

    const zai = await ZAI.create();
    const prompt = `Sen Demos Pizza'nın AI asistanısın. Müşteri tercihlerine göre en uygun 3 pizza öner.

Müşteri tercihleri: "${preferences}"
${mood ? `Ruh hali: ${mood}` : ""}
${spiceLevel ? `Acı seviyesi: ${spiceLevel}` : ""}
${dietary.length ? `Diyet kısıtlamaları: ${dietary.join(", ")}` : ""}

Mevcut menü:
${JSON.stringify(menuData, null, 2)}

JSON formatında yanıt ver:
{
  "recommendations": [
    { "name": "pizza adı", "reason": "neden önerildiğin (1 cümle)", "match": 95 }
  ]
}

Sadece 3 pizza öner. Match skorları 70-100 arası olsun. Türkçe yanıt ver.`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: "system", content: "Sen Demos Pizza'nın yardımsever AI asistanısın. JSON formatında yanıt verirsin." },
        { role: "user", content: prompt },
      ],
      thinking: { type: "disabled" },
    });

    const aiText = completion.choices[0]?.message?.content || "";
    
    // Try to parse JSON from response
    let recommendations = [];
    try {
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        recommendations = parsed.recommendations || [];
      }
    } catch {}

    // Map recommendations to full menu items
    const enriched = recommendations.map((rec: any) => {
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
      return rec;
    }).filter((r: any) => r.slug);

    return NextResponse.json({
      recommendations: enriched,
      aiText: aiText.slice(0, 500),
    });
  } catch (e) {
    console.error("AI recommend error:", e);
    return NextResponse.json({ error: "AI öneri alınamadı" }, { status: 500 });
  }
}
