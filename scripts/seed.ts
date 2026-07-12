/**
 * Demos Pizza · Seed Script
 *
 * Çalıştırma:
 *   bun run db:seed
 *
 * İçerik:
 *  - Admin kullanıcı (env'ten)
 *  - Site ayarları
 *  - 12 pizza + 5 yan lezzet + 4 içecek + 3 tatlı
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Demos Pizza database...\n");

  // ============================================================
  //  1. Admin user
  // ============================================================
  const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || "admin@demospizza.com";
  const adminPwd = process.env.ADMIN_BOOTSTRAP_PASSWORD || "ChangeMe!2025";

  const existing = await db.adminUser.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const hash = await bcrypt.hash(adminPwd, 12);
    await db.adminUser.create({
      data: {
        email: adminEmail,
        passwordHash: hash,
        name: "Demos Pizza Yönetici",
        role: "ADMIN",
      },
    });
    console.log(`✅ Admin user created: ${adminEmail} (password from env)`);
  } else {
    console.log(`ℹ️  Admin user already exists: ${adminEmail}`);
  }

  // ============================================================
  //  2. Site Settings
  // ============================================================
  const settings = [
    { key: "SITE_NAME", value: "Demos Pizza" },
    { key: "SITE_TAGLINE", value: "Taş Fırında Gerçek Lezzet" },
    { key: "HERO_BADGE", value: "Fatih'in Taş Fırın Pizzası" },
    { key: "DELIVERY_MIN_ORDER_CENTS", value: "25000" },
    { key: "DELIVERY_FEE_CENTS", value: "3000" },
    { key: "FREE_DELIVERY_THRESHOLD_CENTS", value: "50000" },
    { key: "PROMO_BANNER_TEXT", value: "İlk siparişe özel %15 indirim — kod: DEMOS15" },
    { key: "PROMO_BANNER_ACTIVE", value: "true" },
    { key: "INSTAGRAM_URL", value: "https://instagram.com/demospizza" },
    { key: "WHATSAPP_NUMBER", value: "+905550000000" },
  ];

  for (const s of settings) {
    await db.siteSetting.upsert({
      where: { key: s.key },
      create: s,
      update: { value: s.value },
    });
  }
  console.log(`✅ ${settings.length} site settings upserted`);

  // ============================================================
  //  3. Menu Items
  // ============================================================
  type MenuItemSeed = {
    slug: string;
    name: string;
    description: string;
    priceCents: number;
    category: "PIZZA" | "SIGNATURE" | "SIDES" | "DRINKS" | "DESSERTS";
    imageUrl?: string;
    isFeatured?: boolean;
    ingredients: string[];
    tags: string[];
    allergens: string[];
    sizes?: { size: string; diameter?: number; priceCents: number }[];
    sortOrder: number;
  };

  const menuItems: MenuItemSeed[] = [
    // ---------- Klasik Pizzalar ----------
    {
      slug: "margherita",
      name: "Margherita",
      description:
        "Geleneksel Napoli tarzı. San Marzano domates, taze fior di latte mozzarella, basilikum, sızma zeytinyağı.",
      priceCents: 18000,
      category: "PIZZA",
      imageUrl: "/images/hero-pizza.png",
      isFeatured: true,
      ingredients: ["San Marzano domates", "Fior di latte mozzarella", "Taze basilikum", "Sızma zeytinyağı", "Deniz tuzu"],
      tags: ["VEGETARIAN", "HALAL"],
      allergens: ["Gluten", "Süt"],
      sizes: [
        { size: "Küçük (26 cm)", diameter: 26, priceCents: 18000 },
        { size: "Orta (30 cm)", diameter: 30, priceCents: 22000 },
        { size: "Büyük (34 cm)", diameter: 34, priceCents: 26000 },
      ],
      sortOrder: 1,
    },
    {
      slug: "pepperoni",
      name: "Pepperoni",
      description:
        "Dana pepperoni sucuk, mozzarella, San Marzano domates. Kıvrılmış çıtır pepperoni dilimleri.",
      priceCents: 24000,
      category: "PIZZA",
      imageUrl: "/images/pizza-pepperoni.png",
      isFeatured: true,
      ingredients: ["Dana pepperoni", "Mozzarella", "San Marzano domates", "Oregano"],
      tags: ["HALAL", "CHEF_SPECIAL"],
      allergens: ["Gluten", "Süt"],
      sizes: [
        { size: "Küçük (26 cm)", diameter: 26, priceCents: 24000 },
        { size: "Orta (30 cm)", diameter: 30, priceCents: 28000 },
        { size: "Büyük (34 cm)", diameter: 34, priceCents: 32000 },
      ],
      sortOrder: 2,
    },
    {
      slug: "quattro-formaggi",
      name: "Quattro Formaggi",
      description:
        "Dört peynir uyumu: mozzarella, gorgonzola, fontina, parmesan. Kremamsı, yoğun, lezzetli.",
      priceCents: 26000,
      category: "PIZZA",
      imageUrl: "/images/pizza-quattro.png",
      ingredients: ["Mozzarella", "Gorgonzola", "Fontina", "Parmesan", "Beyaz biber"],
      tags: ["VEGETARIAN", "HALAL"],
      allergens: ["Gluten", "Süt"],
      sizes: [
        { size: "Küçük (26 cm)", diameter: 26, priceCents: 26000 },
        { size: "Orta (30 cm)", diameter: 30, priceCents: 30000 },
        { size: "Büyük (34 cm)", diameter: 34, priceCents: 34000 },
      ],
      sortOrder: 3,
    },
    {
      slug: "vegetariana",
      name: "Vegetariana",
      description:
        "Renkli sebze bahçesi: kapya biber, mantar, zeytin, kırmızı soğan, mısır, mozzarella.",
      priceCents: 22000,
      category: "PIZZA",
      imageUrl: "/images/pizza-vegetarian.png",
      ingredients: ["Kapya biber", "Mantar", "Zeytin", "Kırmızı soğan", "Mısır", "Mozzarella"],
      tags: ["VEGETARIAN", "HALAL"],
      allergens: ["Gluten", "Süt"],
      sizes: [
        { size: "Küçük (26 cm)", diameter: 26, priceCents: 22000 },
        { size: "Orta (30 cm)", diameter: 30, priceCents: 26000 },
        { size: "Büyük (34 cm)", diameter: 34, priceCents: 30000 },
      ],
      sortOrder: 4,
    },

    // ---------- İmza Pizzalar ----------
    {
      slug: "prosciutto-burrata",
      name: "Prosciutto e Burrata",
      description:
        "İnce dilimlenmiş Parma prosciutto, kremamsı burrata, taze roka, kiraz domates, balsamik glaze.",
      priceCents: 32000,
      category: "SIGNATURE",
      imageUrl: "/images/pizza-prosciutto.png",
      isFeatured: true,
      ingredients: ["Parma prosciutto", "Burrata", "Roka", "Kiraz domates", "Balsamik glaze"],
      tags: ["CHEF_SPECIAL", "HALAL"],
      allergens: ["Gluten", "Süt"],
      sizes: [
        { size: "Orta (30 cm)", diameter: 30, priceCents: 32000 },
        { size: "Büyük (34 cm)", diameter: 34, priceCents: 38000 },
      ],
      sortOrder: 1,
    },
    {
      slug: "tartufo-nero",
      name: "Tartufo Nero",
      description:
        "Siyah trüf, fontina, mantar, trüf yağı. Lüks, yoğun, unutulmaz bir lezzet deneyimi.",
      priceCents: 42000,
      category: "SIGNATURE",
      imageUrl: "/images/pizza-tartufo.png",
      isFeatured: true,
      ingredients: ["Siyah trüf", "Fontina", "Mantar", "Trüf yağı", "Parmesan"],
      tags: ["VEGETARIAN", "CHEF_SPECIAL", "HALAL"],
      allergens: ["Gluten", "Süt"],
      sizes: [
        { size: "Orta (30 cm)", diameter: 30, priceCents: 42000 },
        { size: "Büyük (34 cm)", diameter: 34, priceCents: 48000 },
      ],
      sortOrder: 2,
    },
    {
      slug: "demos-sucuklu",
      name: "Demos Sucuklu",
      description:
        "Türk-İtalyan sentezi: özel baharatlı dana sucuk, kaşar, yeşil biber, yumurta. Fatih'in favorisi.",
      priceCents: 26000,
      category: "SIGNATURE",
      imageUrl: "/images/pizza-turkish.png",
      isFeatured: true,
      ingredients: ["Dana sucuk", "Kaşar peyniri", "Yeşil biber", "Yumurta", "Pul biber"],
      tags: ["HALAL", "CHEF_SPECIAL", "NEW"],
      allergens: ["Gluten", "Süt", "Yumurta"],
      sizes: [
        { size: "Küçük (26 cm)", diameter: 26, priceCents: 26000 },
        { size: "Orta (30 cm)", diameter: 30, priceCents: 30000 },
        { size: "Büyük (34 cm)", diameter: 34, priceCents: 34000 },
      ],
      sortOrder: 3,
    },

    // ---------- Daha fazla klasik ----------
    {
      slug: "diavola",
      name: "Diavola",
      description:
        "Acı severler için: spicy salam, jalapeño, acı biber, mozzarella, bal ile acı sos.",
      priceCents: 25000,
      category: "PIZZA",
      ingredients: ["Spicy salam", "Jalapeño", "Acı biber", "Mozzarella", "Bal"],
      tags: ["SPICY", "HALAL"],
      allergens: ["Gluten", "Süt"],
      sizes: [
        { size: "Orta (30 cm)", diameter: 30, priceCents: 25000 },
        { size: "Büyük (34 cm)", diameter: 34, priceCents: 29000 },
      ],
      sortOrder: 5,
    },
    {
      slug: "tavuklu-bbq",
      name: "BBQ Tavuklu",
      description:
        "Izgara tavuk göğsü, közlenmiş soğan, barbekü sos, mozzarella, kırmızı soğan.",
      priceCents: 26000,
      category: "PIZZA",
      ingredients: ["Izgara tavuk", "Közlenmiş soğan", "BBQ sos", "Mozzarella"],
      tags: ["HALAL"],
      allergens: ["Gluten", "Süt"],
      sizes: [
        { size: "Orta (30 cm)", diameter: 30, priceCents: 26000 },
        { size: "Büyük (34 cm)", diameter: 34, priceCents: 30000 },
      ],
      sortOrder: 6,
    },
    {
      slug: "karisik",
      name: "Karışık",
      description:
        "Sucuk, sosis, mantar, biber, mısır, zeytin, mozzarella. Bol malzemeli klasik.",
      priceCents: 27000,
      category: "PIZZA",
      ingredients: ["Sucuk", "Sosis", "Mantar", "Biber", "Mısır", "Zeytin", "Mozzarella"],
      tags: ["HALAL"],
      allergens: ["Gluten", "Süt"],
      sizes: [
        { size: "Orta (30 cm)", diameter: 30, priceCents: 27000 },
        { size: "Büyük (34 cm)", diameter: 34, priceCents: 31000 },
      ],
      sortOrder: 7,
    },
    {
      slug: "mafya",
      name: "Mafya",
      description:
        "Bol sucuk, bol kaşar, bol mantar. Kat kat malzeme, doyurucu lezzet.",
      priceCents: 28000,
      category: "PIZZA",
      ingredients: ["Sucuk", "Kaşar", "Mantar", "Biber"],
      tags: ["HALAL"],
      allergens: ["Gluten", "Süt"],
      sizes: [
        { size: "Orta (30 cm)", diameter: 30, priceCents: 28000 },
        { size: "Büyük (34 cm)", diameter: 34, priceCents: 32000 },
      ],
      sortOrder: 8,
    },
    {
      slug: "akdeniz",
      name: "Akdeniz",
      description:
        "Akdeniz esintisi: lor peyniri, ıspanak, çeri domates, çam fıstığı, limon kabuğu.",
      priceCents: 24000,
      category: "PIZZA",
      ingredients: ["Lor peyniri", "Ispanak", "Çeri domates", "Çam fıstığı", "Limon"],
      tags: ["VEGETARIAN", "HALAL"],
      allergens: ["Gluten", "Süt", "Kuru yemiş"],
      sizes: [
        { size: "Orta (30 cm)", diameter: 30, priceCents: 24000 },
        { size: "Büyük (34 cm)", diameter: 34, priceCents: 28000 },
      ],
      sortOrder: 9,
    },

    // ---------- Yan Lezzetler ----------
    {
      slug: "patates-tava",
      name: "Patates Tava",
      description: "Çıtır dilim patates, kekik tuzu, sarımsaklı mayonez.",
      priceCents: 7000,
      category: "SIDES",
      ingredients: ["Patates", "Kekik", "Sarımsaklı mayonez"],
      tags: ["VEGETARIAN"],
      allergens: ["Gluten"],
      sortOrder: 1,
    },
    {
      slug: "soganhalkasi",
      name: "Soğan Halkası",
      description: "Altın rengi çıtır soğan halkası, barbekü sos.",
      priceCents: 8000,
      category: "SIDES",
      ingredients: ["Soğan", "Çıtır kaplama", "BBQ sos"],
      tags: ["VEGETARIAN"],
      allergens: ["Gluten"],
      sortOrder: 2,
    },
    {
      slug: "sarimsakli-ekmek",
      name: "Sarımsaklı Ekmek",
      description: "Taş fırında taze ekmek, sarımsaklı tereyağı, maydanoz, parmesan.",
      priceCents: 6000,
      category: "SIDES",
      ingredients: ["Taze ekmek", "Sarımsak", "Tereyağı", "Maydanoz", "Parmesan"],
      tags: ["VEGETARIAN"],
      allergens: ["Gluten", "Süt"],
      sortOrder: 3,
    },
    {
      slug: "sezar-salata",
      name: "Sezar Salata",
      description: "Marul, tavuk göğsü, kruton, parmesan, sezar sos.",
      priceCents: 12000,
      category: "SIDES",
      ingredients: ["Marul", "Tavuk göğsü", "Kruton", "Parmesan", "Sezar sos"],
      tags: ["HALAL"],
      allergens: ["Gluten", "Süt", "Yumurta"],
      sortOrder: 4,
    },
    {
      slug: "karisik-salata",
      name: "Karışık Salata",
      description: "Mevsim yeşillikleri, çeri domates, salatalık, zeytin, balsamik sos.",
      priceCents: 10000,
      category: "SIDES",
      ingredients: ["Mevsim yeşillikleri", "Çeri domates", "Salatalık", "Zeytin"],
      tags: ["VEGAN", "VEGETARIAN"],
      allergens: [],
      sortOrder: 5,
    },

    // ---------- İçecekler ----------
    {
      slug: "kola",
      name: "Kola (330 ml)",
      description: "Soğuk kola.",
      priceCents: 4000,
      category: "DRINKS",
      ingredients: [],
      tags: [],
      allergens: [],
      sortOrder: 1,
    },
    {
      slug: "ayran",
      name: "Ayran",
      description: "Geleneksel yayık ayranı.",
      priceCents: 3000,
      category: "DRINKS",
      ingredients: ["Yoğurt", "Su", "Tuz"],
      tags: ["VEGETARIAN", "HALAL"],
      allergens: ["Süt"],
      sortOrder: 2,
    },
    {
      slug: "salgam",
      name: "Şalgam Suyu",
      description: "Acılı veya acısız fermente şalgam suyu.",
      priceCents: 4000,
      category: "DRINKS",
      ingredients: ["Şalgam", "Havuç", "Bulgur", "Tuz"],
      tags: ["VEGAN", "HALAL"],
      allergens: [],
      sortOrder: 3,
    },
    {
      slug: "su",
      name: "Su (500 ml)",
      description: "Doğal kaynak suyu.",
      priceCents: 1500,
      category: "DRINKS",
      ingredients: [],
      tags: [],
      allergens: [],
      sortOrder: 4,
    },

    // ---------- Tatlılar ----------
    {
      slug: "tiramisu",
      name: "Tiramisu",
      description: "Kahveli savoiardi, mascarpone kreması, kakao.",
      priceCents: 11000,
      category: "DESSERTS",
      ingredients: ["Savoiardi", "Mascarpone", "Espresso", "Kakao"],
      tags: ["VEGETARIAN"],
      allergens: ["Gluten", "Süt", "Yumurta"],
      sortOrder: 1,
    },
    {
      slug: "nutella-pizza",
      name: "Nutella Pizza",
      description: "Nutella, muz, çilek, fındık. Tatlı pizza severler için.",
      priceCents: 14000,
      category: "DESSERTS",
      ingredients: ["Nutella", "Muz", "Çilek", "Fındık"],
      tags: ["VEGETARIAN"],
      allergens: ["Gluten", "Süt", "Kuru yemiş"],
      sortOrder: 2,
    },
    {
      slug: "dondurma",
      name: "Dondarma (2 top)",
      description: "Geleneksel Maraş dondurması — fıstıklı veya sade.",
      priceCents: 8000,
      category: "DESSERTS",
      ingredients: ["Maraş dondurması", "Antep fıstığı"],
      tags: ["VEGETARIAN", "HALAL"],
      allergens: ["Süt", "Kuru yemiş"],
      sortOrder: 3,
    },
  ];

  for (const item of menuItems) {
    const data = {
      slug: item.slug,
      name: item.name,
      description: item.description,
      priceCents: item.priceCents,
      category: item.category,
      imageUrl: item.imageUrl || null,
      isAvailable: true,
      isFeatured: item.isFeatured || false,
      ingredients: JSON.stringify(item.ingredients),
      tags: JSON.stringify(item.tags),
      allergens: JSON.stringify(item.allergens),
      sizes: JSON.stringify(item.sizes || []),
      sortOrder: item.sortOrder,
    };
    await db.menuItem.upsert({
      where: { slug: item.slug },
      create: data,
      update: data,
    });
  }
  console.log(`✅ ${menuItems.length} menu items upserted`);

  console.log("\n🎉 Seed completed!");
  console.log(`   Admin: ${adminEmail}`);
  console.log(`   Password: ${adminPwd}`);
  console.log(`   Admin login: /admin/giris\n`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
