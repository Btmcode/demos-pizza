
---
Task ID: fix-ux-hydration-icon
Agent: Super Z (main)
Task: Telefon ikonu, ürün detay UX, admin hydration, mobil uygulama ikonu düzeltmeleri

Work Log:
- FloatingCallButton: pulse-ring span `<a>` içinde absolute ama `<a>` relative değilmiş → `relative` eklendi, ikon `z-1`'e alındı, ikon artık görünür
- Ürün detay sayfası (/menu/[slug]): Navbar, CartDrawer, MobileBottomBar, FloatingCallButton, Footer içeren layout oluşturuldu (eski sayfa izoleydi, sepete erişilemiyordu)
- MobileStickyBar: itemCount > 0 ise "Sepete Git" gösterir (eski: her zaman "Sepete Ekle" — çift buton sorunu)
- Ana add-to-cart bölümüne "Sepete Git (N ürün)" butonu eklendi (itemCount > 0 iken)
- Toast'a "Sepete Git" action butonu eklendi
- use-hydration-safe.ts hook'u oluşturuldu: useCurrentYear, useCurrentDate, useFormattedDate, useMounted
- Admin dashboard: new Date().toLocaleDateString → useCurrentDate (hydration-safe)
- Admin layout: new Date().getFullYear → useCurrentYear
- Footer: new Date().getFullYear → useCurrentYear
- LegalLayout: new Date().getFullYear → useCurrentYear
- Siparişler sayfası: yazdır butonu mobilde de görünür (hidden sm:flex kaldırıldı), aksiyon butonları responsive (h-8 w-8 mobil, h-9 w-9 desktop)
- Mobil uygulama ikonu: upload edilen 1024x1536 görsel işlendi → 192, 512, 180, 32, 16 PNG + 512 WebP (16KB vs 89KB = %81 küçülme)
- manifest.json: "Fatih'in Premium Pizza Platformu" → "Fatih Haseki", WebP ikon eklendi
- layout.tsx: OpenGraph/Twitter titles güncellendi, WebP ikon referansı eklendi

Stage Summary:
- Build başarılı, deploy edildi (https://demos-pizza-dusky.vercel.app)
- Telefon ikonu artık görünür (pulse-ring arkada, ikon önde)
- Ürün detay sayfasında sepete erişim: Navbar sepet ikonu + MobileStickyBar "Sepete Git" + ana buton "Sepete Git" + toast action
- Admin hydration mismatch tamamen çözüldü (tüm new Date() render-time kullanımları hydration-safe hale getirildi)
- Mobil uygulama ikonu optimize edildi (PNG + WebP, 5 boyut)

---
Task ID: security-hardening-v2
Agent: Super Z (main)
Task: Siber güvenlik sertleştirme — admin panel erişimini önleme, çok katmanlı koruma

Work Log:
- Login 3 katmanlı rate limit: 3/hesap/15dk + 10/IP/15dk + 50/IP/saat
- Failed login audit log (LOGIN_FAILED action ActivityLog'a yazılır)
- Generic error messages ("Geçersiz kimlik bilgileri" — info leak prevention)
- Timing-safe bcrypt comparison (nonexistent user'da dummy hash compare)
- Email + şifre uzunluk validation
- Global API rate limit middleware'de (100/dakika/IP — 429 + Retry-After)
- Auth endpoint rate limit (20/dakika/IP — /api/auth/* için)
- NextAuth default signin/providers/error sayfaları gizlendi (GET → 404)
- 15+ bot/saldırı aracı UA pattern engellendi (sqlmap, nikto, nmap, burp, vb.)
- Path traversal koruması (URL path + search)
- SQL injection URL pattern koruması
- XSS URL pattern koruması
- Gizli admin path'leri 404 (/admin, /wp-admin, /phpmyadmin, /.env, /.git, /config, vb.)
- HTTP method validation (sadece izin verilen metodlar)
- CSRF koruması: Origin/Referer check tüm POST/PATCH/PUT/DELETE'de
- Request size limit: Contact 256KB, Order 512KB, Admin 2MB
- requireAdmin(req) helper'ı CSRF + size limit içerir (tüm admin rotalarında)
- Public POST rotalarına explicit CSRF + size check (contact, orders)
- Content-Type validation (JSON endpoint'ler için)
- Tüm admin rotalarında requireAdmin() → requireAdmin(req) güncellendi (11 dosya)
- Login page: RATE_LIMITED error detection + özel mesaj
- Production test: tüm endpoint'ler doğru status kodu döndü

Stage Summary:
- Build başarılı, deploy edildi (https://demos-pizza-dusky.vercel.app)
- /api/auth/signin GET → 404 (önceden 302)
- /api/auth/providers GET → 404 (önceden 200, provider list leak)
- /api/auth/error GET → 404
- /api/auth/csrf → 200 (login form çalışıyor)
- /api/auth/session → 200
- /admin, /wp-admin, /.env → 404
- /api/admin/* → 401 (auth gerekli)
- Bot UA ile istek → 403
- Login: 3 deneme sonrası blok (authorize fonksiyonunda — Node.js runtime, güvenilir)
- Global API: 100/dakika (middleware — edge runtime, instance bazlı)
