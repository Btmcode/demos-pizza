/**
 * Demos Pizza · Brand Constants
 * Tek kaynak — tüm marka kimliği burada tanımlı.
 */

export const BRAND = {
  name: "Demos Pizza",
  legalName: "Demos Pizza Fatih",
  tagline: "Taş Fırında Gerçek Lezzet",
  description:
    "Fatih Haseki'de taş fırında pişen gerçek İtalyan pizzası. 72 saat mayalı hamur, San Marzano domates, taze mozzarella.",
  established: 2025,
  foundedYear: 2025,
  cuisine: "İtalyan · Taş Fırın Pizzası",
  logo: "/logo.svg",
  favicon: "/favicon.svg",
} as const;

export const CONTACT = {
  address: {
    street: "Haseki Sultan, Turgut Özal Millet Cd.",
    district: "Fatih",
    city: "İstanbul",
    postalCode: "34093",
    country: "Türkiye",
    full: "Haseki Sultan, Turgut Özal Millet Cd., 34093 Fatih/İstanbul",
    mapQuery: "Haseki Sultan, Turgut Özal Millet Cd., 34093 Fatih/İstanbul",
    mapEmbed:
      "https://www.google.com/maps?q=Haseki+Sultan,+Turgut+%C3%96zal+Millet+Cd.,+34093+Fatih/%C4%B0stanbul&output=embed",
  },
  phone: "+90 212 000 00 00",
  phoneHref: "tel:+902120000000",
  whatsapp: "+90 555 000 00 00",
  whatsappHref: "https://wa.me/905550000000",
  email: "merhaba@demospizza.com",
  emailHref: "mailto:merhaba@demospizza.com",
  hours: [
    { day: "Pazartesi", open: "11:00", close: "23:00" },
    { day: "Salı", open: "11:00", close: "23:00" },
    { day: "Çarşamba", open: "11:00", close: "23:00" },
    { day: "Perşembe", open: "11:00", close: "23:00" },
    { day: "Cuma", open: "11:00", close: "00:00" },
    { day: "Cumartesi", open: "11:00", close: "00:00" },
    { day: "Pazar", open: "12:00", close: "23:00" },
  ],
  social: {
    instagram: "https://instagram.com/demospizza",
    facebook: "https://facebook.com/demospizza",
    x: "https://x.com/demospizza",
    tiktok: "https://tiktok.com/@demospizza",
  },
  delivery: {
    minOrder: 250,
    deliveryFee: 30,
    freeDeliveryThreshold: 500,
    deliveryTime: "30-45 dk",
    pickupTime: "20 dk",
    serviceAreas: [
      "Haseki",
      "Aksaray",
      "Fındıkzade",
      "Çapa",
      "Şehremini",
      "Molla Gürani",
      "İskenderpaşa",
      "Samatya",
    ],
  },
} as const;

export const STATS = [
  { value: 485, suffix: "°", label: "Taş Fırın Sıcaklığı", sub: "İtalyan geleneksel pişirme" },
  { value: 90, suffix: "sn", label: "Pişirme Süresi", sub: "Hızlı, lezzetli, çıtır" },
  { value: 72, suffix: "sa", label: "Hamur Mayalanması", sub: "Doğal maya, uzun ferment" },
  { value: 25, suffix: "+", label: "Pizza Çeşidi", sub: "Klasik & imza menü" },
] as const;

export const NAV_LINKS = [
  { href: "#anasayfa", label: "Anasayfa" },
  { href: "#menu", label: "Menü" },
  { href: "#hakkimizda", label: "Hakkımızda" },
  { href: "#galeri", label: "Galeri" },
  { href: "#rezervasyon", label: "Rezervasyon" },
  { href: "#iletisim", label: "İletişim" },
] as const;

/** Marka renkleri — CSS değişkenleri ile birebir. */
export const BRAND_COLORS = {
  ember: "#D62828",
  saffron: "#F77F00",
  charcoal: "#1A1410",
  cream: "#FAF3E0",
  basil: "#3A7D44",
  smoke: "#2A1F1A",
} as const;

/** Tüm para birimi formatlaması buradan.
 *  Fiyatlar veritabanında kuruş (cent) olarak tutulur.
 */
export const CURRENCY = {
  locale: "tr-TR",
  code: "TRY",
  symbol: "₺",
  /** Kuruş -> okunabilir string */
  format(cents: number): string {
    const lira = cents / 100;
    return new Intl.NumberFormat(this.locale, {
      style: "currency",
      currency: this.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(lira);
  },
  /** Kuruş -> TL sembolü ile sade string (kartlarda kullanılır) */
  formatShort(cents: number): string {
    const lira = Math.round(cents / 100);
    return `${lira.toLocaleString("tr-TR")} ₺`;
  },
} as const;
