/**
 * Demos Pizza · Brand Constants
 * Tek kaynak — tüm marka kimliği burada tanımlı.
 *
 * SON GÜNCELLEME: 2026-07-12
 * - Endüstriyel fırın (taş fırın değil)
 * - Günlük taze hamur (dondurulmuş değil)
 * - demos.pizza.com.tr domain
 * - Rezervasyon yok (sadece online sipariş)
 * - Kurye ile bölgesel teslimat
 */

export const BRAND = {
  name: "Demos Pizza",
  legalName: "Demos Pizza",
  tagline: "Günlük Taze Hamur, Gerçek Lezzet",
  description:
    "Fatih Haseki'de günlük taze hamur ve endüstriyel fırınla pişen İtalyan tarzı pizza. Paket servis ile kapınıza geliyor.",
  established: 2024,
  cuisine: "Pizza · İtalyan · Fast Food",
  logo: "/logo.svg",
  favicon: "/favicon.svg",
  domain: "demos.pizza.com.tr",
  siteUrl: "https://demos.pizza.com.tr",
} as const;

export const CONTACT = {
  address: {
    street: "Haseki Sultan, Turgut Özal Millet Cd.",
    streetNo: "", // kullanıcı belirleyecek
    district: "Fatih",
    city: "İstanbul",
    postalCode: "34093",
    country: "Türkiye",
    full: "Haseki Sultan, Turgut Özal Millet Cd., 34093 Fatih/İstanbul",
    mapQuery: "Demos Pizza Haseki Sultan Turgut Özal Millet Cd. Fatih İstanbul",
    mapEmbed:
      "https://www.google.com/maps?q=Demos+Pizza+Haseki+Sultan+Turgut+%C3%96zal+Millet+Cd.+Fatih+%C4%B0stanbul&output=embed",
  },
  // Tabeladaki telefon numarasını görmezden geliyoruz
  // Kullanıcı kendi telefonunu buraya girecek
  phone: "+90 444 00 00",
  phoneHref: "tel:+90444000000",
  whatsapp: "+90 555 000 00 00",
  whatsappHref: "https://wa.me/905550000000",
  whatsappBusinessId: "", // WhatsApp Business API için (ileri seviye)
  email: "siparis@demos.pizza.com.tr",
  emailHref: "mailto:siparis@demos.pizza.com.tr",
  hours: [
    { day: "Pazartesi", open: "10:00", close: "00:00" },
    { day: "Salı", open: "10:00", close: "00:00" },
    { day: "Çarşamba", open: "10:00", close: "00:00" },
    { day: "Perşembe", open: "10:00", close: "00:00" },
    { day: "Cuma", open: "10:00", close: "01:00" },
    { day: "Cumartesi", open: "10:00", close: "01:00" },
    { day: "Pazar", open: "10:00", close: "00:00" },
  ],
  social: {
    instagram: "https://instagram.com/demospizza",
    facebook: "https://facebook.com/demospizza",
    x: "https://x.com/demospizza",
    tiktok: "https://tiktok.com/@demospizza",
  },
  // Trendyol/Getir benzeri kurye firmaları ile çalışma
  delivery: {
    minOrder: 200,
    deliveryFee: 30,
    freeDeliveryThreshold: 400,
    deliveryTime: "30-45 dk",
    pickupTime: "20 dk",
    // Trendyol/Getir benzeri kurye ile geniş bölgesel teslimat
    serviceAreas: [
      "Haseki",
      "Aksaray",
      "Fındıkzade",
      "Çapa",
      "Şehremini",
      "Molla Gürani",
      "İskenderpaşa",
      "Samatya",
      "Yenikapı",
      "Laleli",
      "Beyazıt",
      "Topkapı",
      "Kocamustafapaşa",
      "Vatan Caddesi",
      "Adnan Menderes Bulvarı",
    ],
  },
  // Promo
  promo: {
    active: true,
    text: "1 ALANA 1 BEDAVA · Paket Servis",
    description: "Tüm büyük boy pizzalarda 1 alana 1 bedava fırsatı",
  },
} as const;

export const STATS = [
  { value: 350, suffix: "+", label: "Günlük Sipariş", sub: "Hedef: 350+ sipariş/gün" },
  { value: 30, suffix: " dk", label: "Hızlı Teslimat", sub: "Kurye ile kapınızda" },
  { value: 10, suffix: "+", label: "Servis Bölgesi", sub: "Fatih ve çevresi" },
  { value: 24, suffix: "/7", label: "Açık", sub: "Her gün 10:00-00:00" },
] as const;

export const NAV_LINKS = [
  { href: "#anasayfa", label: "Anasayfa" },
  { href: "#menu", label: "Menü" },
  { href: "#ai-recommendation", label: "AI Öneri" },
  { href: "#hakkimizda", label: "Hakkımızda" },
  { href: "#galeri", label: "Galeri" },
  { href: "#iletisim", label: "İletişim" },
] as const;

/** Marka renkleri — Premium palette per spec. */
export const BRAND_COLORS = {
  ink: "#111111",
  ink2: "#1A1A1A",
  yellow: "#FFC400",
  gold: "#FFB300",
  pink: "#FF2D8D",
  pinkHover: "#FF4FA3",
  paper: "#FFFFFF",
  mist: "#D9D9D9",
} as const;

/** Para formatı. Fiyatlar DB'de kuruş (cent) olarak tutulur. */
export const CURRENCY = {
  locale: "tr-TR",
  code: "TRY",
  symbol: "₺",
  format(cents: number): string {
    const lira = cents / 100;
    return new Intl.NumberFormat(this.locale, {
      style: "currency",
      currency: this.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(lira);
  },
  formatShort(cents: number): string {
    const lira = Math.round(cents / 100);
    return `${lira.toLocaleString("tr-TR")} ₺`;
  },
} as const;

/**
 * Sipariş akışı:
 * 1. Ürün seç (menüden) → içerik/opsiyon seç (boyut, ekstra malzeme, hamur tipi)
 * 2. Sepet → checkout
 * 3. Sipariş tipi seç (Teslimat / Gel-Al)
 * 4. Müşteri bilgileri + adres (dropdown servis bölgeleri)
 * 5. Ödeme yöntemi (kapıda nakit / kapıda kart)
 * 6. Sipariş onay → admin panele + WhatsApp'a düşer
 * 7. Termal yazıcı otomatik yazdırır (admin bağladıysa)
 */
export const ORDER_FLOW = {
  orderTypes: ["DELIVERY", "PICKUP"] as const,
  paymentMethods: ["CASH_ON_DELIVERY", "CARD_ON_DELIVERY"] as const,
  // Ekstra malzeme kategorileri
  extraCategories: ["CHEESE", "MEAT", "VEGETABLE", "SAUCE", "CRUST"] as const,
} as const;

/**
 * Termal yazıcı yapılandırması
 */
export const THERMAL_PRINTER = {
  paperSizes: [
    { id: "58mm", label: "58mm (ESC/POS)", width: 32, height: "auto" },
    { id: "80mm", label: "80mm (ESC/POS)", width: 48, height: "auto" },
    { id: "a6", label: "A6 (105x148mm)", width: 80, height: 148 },
    { id: "a5", label: "A5 (148x210mm)", width: 148, height: 210 },
  ],
  // Web USB / Web Serial API ile tarayıcıdan direkt yazıcıya bağlanma
  // Veya ağ yazıcı (IP printer) üzerinden RAW port 9100
  connectionTypes: ["USB", "NETWORK"] as const,
} as const;
