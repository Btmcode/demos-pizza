# Demos Pizza · Taş Fırın İtalyan Pizzası

> Haseki Sultan, Turgut Özal Millet Cd., 34093 Fatih/İstanbul
> Profesyonel, iştah açıcı web sitesi + gelişmiş admin paneli

![Demos Pizza](public/images/hero-pizza.png)

## 🍕 Özellikler

### Müşteri Web Sitesi
- **Sinematik Hero**: 485°C taş fırın vurgusu, 72 saat mayalı hamur
- **İnteraktif Menü**: 5 kategori (İmza, Klasik, Yan Lezzet, Tatlı, İçecek), 24 ürün
- **Boyut Seçimi**: Küçük (26cm) / Orta (30cm) / Büyük (34cm) fiyatlandırma
- **Sepet Sistemi**: localStorage kalıcılığı, miktar yönetimi
- **Online Sipariş**: Teslimat / Gel-Al, minimum sipariş kontrolü, ücretsiz teslimat eşiği
- **3 Adımlı Rezervasyon**: Takvim → Saat/Service → İletişim bilgileri
- **İletişim Formu**: Honeypot bot koruması, rate limiting
- **Galeri**: 8 görsel, hover efektleri
- **Toppins Marquee**: Kayan malzeme şeridi
- **Responsive**: Mobile-first tasarım
- **SEO**: OpenGraph, Twitter cards, semantic HTML, sitemap

### Admin Paneli (`/admin`)
- **Dashboard**: 4 KPI kartı, haftalık sipariş trendi grafiği, en çok satanlar
- **Sipariş Yönetimi**: Filtreleme, arama, durum güncelleme, detay görüntüleme
- **Menü Yönetimi**: Tam CRUD, boyut/etiket/alierjen yönetimi, öne çıkar/aktif toggle
- **Rezervasyon Yönetimi**: Onaylama, iptal, tamamlama
- **Mesaj Yönetimi**: Okundu/yanıtlandı işareti, silme
- **Ayarlar**: Site adı, teslimat parametreleri, sosyal medya
- **Aktivite Kaydı**: Tüm admin işlemleri audit log

### 🛡️ Güvenlik (Siber Güvenlik Uzmanı Perspektifiyle)
- **Kimlik Doğrulama**: NextAuth.js v4, JWT session, bcrypt (12 rounds) şifre hashleme
- **Rate Limiting**: Login (5/15dk), sipariş (10/saat), rezervasyon (5/saat), iletişim (3/saat), API (60/dk)
- **CSP**: Content Security Policy header
- **Input Validation**: Zod şemaları tüm API girişlerinde
- **SQL Injection**: Prisma parameterize query + pattern kontrolü
- **XSS**: React otomatik escape + pattern kontrolü + HTML sanitize
- **CSRF**: NextAuth built-in CSRF token
- **Security Headers**: HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- **Honeypot**: İletişim formunda bot tuzağı
- **Audit Logging**: Tüm admin işlemleri IP + User-Agent ile kaydedilir
- **Timing-Safe Password Compare**: bcrypt ile
- **Cookie Security**: HttpOnly, SameSite=Lax, Secure (production)
- **Admin Route Guard**: Middleware + server-side check (2 katmanlı)
- **No Information Disclosure**: Hata mesajları detay sızdırmaz

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Node.js 18+ (veya Bun)
- PostgreSQL (Neon önerilir) — local dev için SQLite dahil

### Kurulum

```bash
# 1. Bağımlılıkları yükle
bun install  # veya npm install

# 2. .env dosyasını hazırla
cp .env.example .env
# .env içini düzenle (NEXTAUTH_SECRET üret: openssl rand -base64 48)

# 3. Database schema'yı uygula
bun run db:push

# 4. Seed data (admin + 24 menü öğesi)
bun run db:seed

# 5. Dev server
bun run dev
```

Site: http://localhost:3000
Admin: http://localhost:3000/admin/giris

**Varsayılan admin:**
- E-posta: `admin@demospizza.com`
- Şifre: `ChangeMe!2025`
- ⚠️ **ÖNEMLİ**: İlk girişten sonra şifreyi mutlaka değiştirin!

## 🌐 Production Deploy (Vercel + Neon)

### 1. GitHub'a Push
```bash
git init
git add .
git commit -m "Demos Pizza - Initial release"
git branch -M main
git remote add origin https://github.com/USERNAME/demos-pizza.git
git push -u origin main
```

### 2. Neon PostgreSQL Database Oluştur
1. https://neon.tech adresinden ücretsiz hesap aç
2. Yeni project oluştur
3. Connection string'i kopyala: `postgresql://user:pass@ep-xxx.eu-central-1.aws.neon.tech/dbname?sslmode=require`

### 3. Prisma Schema'yı PostgreSQL'e Geçir
`prisma/schema.prisma` dosyasında:
```prisma
datasource db {
  provider = "postgresql"  // ← sqlite → postgresql
  url      = env("DATABASE_URL")
}
```

### 4. Vercel'e Deploy
1. https://vercel.com adresinden GitHub repo'yu import et
2. Environment Variables ekle:
   ```
   DATABASE_URL=postgresql://...neon.tech/...?sslmode=require
   NEXTAUTH_SECRET=<üret: openssl rand -base64 48>
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
   NEXT_PUBLIC_ALLOWED_ORIGINS=https://your-domain.vercel.app
   ADMIN_BOOTSTRAP_EMAIL=admin@demospizza.com
   ADMIN_BOOTSTRAP_PASSWORD=<GÜÇLÜ ŞİFRE>
   ```
3. Build Command: `prisma generate && prisma db push && next build`
4. Deploy!

### 5. Post-Deploy
- `ADMIN_BOOTSTRAP_*` env değişkenlerini Vercel'den KALDIR
- Admin paneline giriş yap, şifreyi değiştir
- Site ayarlarını admin > Ayarlar'dan düzenle

## 📁 Proje Yapısı

```
src/
├── app/
│   ├── page.tsx                  # Ana müşteri sitesi
│   ├── layout.tsx                # Root layout (fontlar, meta)
│   ├── globals.css               # Marka renkleri + tasarım sistemi
│   ├── admin/
│   │   ├── layout.tsx            # Admin shell (sidebar + auth guard)
│   │   ├── page.tsx              # Dashboard
│   │   ├── giris/page.tsx        # Login
│   │   ├── siparisler/page.tsx   # Sipariş yönetimi
│   │   ├── menu/page.tsx         # Menü CRUD
│   │   ├── rezervasyonlar/page.tsx
│   │   ├── mesajlar/page.tsx
│   │   ├── ayarlar/page.tsx
│   │   └── aktivite/page.tsx     # Audit log
│   └── api/
│       ├── menu/route.ts         # Public menu
│       ├── orders/route.ts       # Public sipariş
│       ├── reservations/route.ts # Public rezervasyon
│       ├── contact/route.ts      # Public iletişim
│       ├── auth/[...nextauth]/   # NextAuth
│       └── admin/                # Tüm admin API'leri (auth guard)
├── components/
│   ├── site/                     # Müşteri bileşenleri
│   │   ├── navbar.tsx
│   │   ├── hero.tsx
│   │   ├── menu-section.tsx
│   │   ├── cart-context.tsx      # Sepet state
│   │   ├── cart-drawer.tsx       # Sipariş akışı
│   │   ├── reservation.tsx       # 3 adımlı rezervasyon
│   │   └── ...
│   └── ui/                       # shadcn/ui bileşenleri
├── lib/
│   ├── auth.ts                   # NextAuth config
│   ├── security.ts               # Rate limiter, sanitization, headers
│   ├── validators.ts             # Zod şemaları
│   ├── constants.ts              # Marka kimliği
│   └── db.ts                     # Prisma client
├── middleware.ts                 # CSP + admin route guard
└── prisma/
    ├── schema.prisma             # 6 model: AdminUser, MenuItem, Order, OrderItem, Reservation, ContactMessage, SiteSetting, ActivityLog
    └── seed.ts                   # Admin + 24 menü öğesi
```

## 🎨 Marka Kimliği

| Renk | Hex | Kullanım |
|------|-----|----------|
| Ember Red | `#D62828` | Primary, CTA, fiyat |
| Saffron Gold | `#F77F00` | Accent, vurgu, stat |
| Charcoal | `#1A1410` | Dark bg, footer, admin |
| Cream | `#FAF3E0` | Light bg, foreground |
| Basil Green | `#3A7D44` | Success, vejetaryen |
| Smoke | `#2A1F1A` | Dark accent |

**Tipografi:**
- Display: Playfair Display (serif, italic vurgular)
- Body: Inter
- Mono: JetBrains Mono (kod/slug)

**Logo**: `public/logo.svg` — pizza slice + flame + wordmark

## 🛠️ Teknoloji Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript 5
- **UI**: Tailwind CSS 4 + shadcn/ui + Radix UI
- **Database**: Prisma 6 ORM (SQLite local, Neon PostgreSQL production)
- **Auth**: NextAuth.js v4 (Credentials provider)
- **Validation**: Zod
- **Charts**: Recharts
- **Animations**: Framer Motion, CSS animations
- **Icons**: Lucide React
- **Font**: Google Fonts (Inter, Playfair Display)
- **Image Generation**: z-ai-web-dev-sdk (10 marka görseli üretildi)

## 📊 Veritabanı Modelleri

- `AdminUser` — Yönetici kullanıcılar (email, passwordHash, role)
- `MenuItem` — Menü öğeleri (slug, fiyat, kategori, boyutlar, etiketler, alerjenler)
- `Order` + `OrderItem` — Siparişler (durum, ödeme, teslimat)
- `Reservation` — Rezervasyon talepleri
- `ContactMessage` — İletişim formu mesajları
- `SiteSetting` — Key-value site ayarları
- `ActivityLog` — Audit log (giriş, CRUD, IP)

## 🔒 Güvenlik Kontrol Listesi

- [x] Tüm input'lar Zod ile validasyon
- [x] SQL injection koruması (Prisma + pattern kontrol)
- [x] XSS koruması (React escape + pattern kontrol)
- [x] CSRF koruması (NextAuth)
- [x] Rate limiting (IP bazlı, tüm API'lerde)
- [x] Password hashleme (bcrypt 12 rounds)
- [x] JWT session (serverless uyumlu)
- [x] HTTPS-only cookies (production)
- [x] CSP header
- [x] HSTS, X-Frame-Options, vb. security headers
- [x] Admin route guard (middleware + server-side)
- [x] Audit logging (tüm admin işlemleri)
- [x] Honeypot (iletişim formu)
- [x] No sensitive data in client bundle
- [x] Environment variables properly scoped
- [x] No hardcoded secrets

## 📈 Rakip Analizi (Fatih/Haseki bölgesi)

| Rakip | Konum | Güçlü Yön | Zayıf Yön |
|-------|-------|-----------|-----------|
| İskuji Pizza | Aynı cadde No:101/A | 5.0 Yandex, geniş menü | Düşük yorum sayısı |
| Domino's Haseki | Millet Cd. | Zincir güveni | Standart lezzet |
| Hero's Pizza Fındıkzade | Yakın | Instagram aktif | 3.8 puan |
| PizzaLazza Fatih | Hırka-i Şerif | Uzun saatler (10-02) | Yüksek min. sipariş |

**Demos Pizza Fırsatları:**
1. Taş fırın + 72 saat maya farkı (premium positioning)
2. Direct online sipariş (%15-20 komisyon kaçırma)
3. Türk-İtalyan sentezi (Demos Sucuklu)
4. Hastane/ofis catering (Haseki bölgesi)
5. Modern dijital deneyim (sinematik web sitesi)

## 📞 İletişim

- **Adres**: Haseki Sultan, Turgut Özal Millet Cd., 34093 Fatih/İstanbul
- **Sosyal**: Instagram @demospizza

## 📄 Lisans

Bu proje Demos Pizza için özel olarak geliştirilmiştir. Tüm hakları saklıdır.

---

**Geliştirme**: Z.ai Full-Stack Development
**Sürüm**: 1.0.0
**Son Güncelleme**: 2025
