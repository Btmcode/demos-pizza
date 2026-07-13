
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
