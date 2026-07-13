/**
 * Kampanya seed script — 3 resimli kampanya ekler
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("🏷️ Seeding campaigns...\n");

  const campaigns = [
    {
      title: "1 ALANA 1 BEDAVA",
      description: "Tüm büyük boy pizzalarda 1 alana 1 bedava fırsatı! Paket serviste geçerlidir. Sınırlı süre için kaçırma!",
      code: "DEMOS15",
      discountPct: 15,
      discountCents: null,
      imageUrl: "/images/campaign-1alana1.png",
      isActive: true,
      sortOrder: 1,
    },
    {
      title: "%20 İlk Sipariş İndirimi",
      description: "İlk online siparişinde %20 indirim! Demos Pizza kalitesini keşfet, kampanya kodunu kullan.",
      code: "ILK20",
      discountPct: 20,
      discountCents: null,
      imageUrl: "/images/campaign-indirim.png",
      isActive: true,
      sortOrder: 2,
    },
    {
      title: "Öğrenci Menü Kampanyası",
      description: "Öğrenci kimliği ile her gün 12:00-15:00 arası tüm pizzalarda %25 indirim! Arkadaşlarınla paylaş, daha çok kazan.",
      code: "OGRENCI25",
      discountPct: 25,
      discountCents: null,
      imageUrl: "/images/campaign-ogrenci.png",
      isActive: true,
      sortOrder: 3,
    },
  ];

  for (const c of campaigns) {
    const existing = await db.campaign.findFirst({ where: { code: c.code } });
    if (!existing) {
      await db.campaign.create({ data: c });
      console.log(`✅ Created: ${c.title} (${c.code})`);
    } else {
      await db.campaign.update({ where: { id: existing.id }, data: c });
      console.log(`ℹ️  Updated: ${c.title} (${c.code})`);
    }
  }

  console.log(`\n🎉 ${campaigns.length} campaigns seeded!`);
}

main()
  .catch((e) => { console.error("❌ Error:", e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
