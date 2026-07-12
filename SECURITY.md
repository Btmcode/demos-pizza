# Demos Pizza · Güvenlik Dokümantasyonu

Bu doküman, Demos Pizza web uygulamasının güvenlik mimarisini ve denetim sürecini açıklar.

## 🔐 Kimlik Doğrulama

### NextAuth.js v4 Configuration
- **Provider**: Credentials (email + password)
- **Session**: JWT (8 saat süre, serverless uyumlu)
- **Password Hashing**: bcrypt (12 rounds)
- **Cookie**: `__Secure-next-auth.session-token` (production)
  - HttpOnly: true
  - SameSite: Lax
  - Secure: true (production only)

### Login Süreci
1. İstek rate limit kontrolü (5 deneme / 15 dakika / IP)
2. Email normalize (lowercase, trim)
3. AdminUser DB'den çek
4. bcrypt.compare ile timing-safe doğrulama
5. Kullanıcı yoksa dummy bcrypt compare (timing equalization)
6. ActivityLog'a kayıt (IP, User-Agent, timestamp)
7. JWT token oluştur, cookie set et

## 🛡️ Yetkilendirme

### 3 Katmanlı Koruma
1. **Middleware** (`src/middleware.ts`): İstek NextAuth cookie'si yoksa redirect
2. **API Guard** (`requireAdmin()`): Her admin API'sinde server-side session check
3. **UI Guard** (`AdminShell`): Client-side `useSession` ile yönlendirme

### Rate Limiting (Sliding Window)
| Endpoint | Limit | Pencere |
|----------|-------|---------|
| Login | 5 istek | 15 dakika |
| Contact form | 3 istek | 1 saat |
| Reservation | 5 istek | 1 saat |
| Order | 10 istek | 1 saat |
| API (admin) | 60 istek | 1 dakika |
| Public read | 200 istek | 1 dakika |

## 💉 Input Validation & Sanitization

### Zod Schemas (`src/lib/validators.ts`)
- Her API endpoint için ayrı schema
- Türkçe karakter desteği (ç, ğ, ı, ö, ş, ü)
- Telefon formatı (TR pattern)
- Email RFC uyumlu
- Maximum uzunluk sınırları (DoS koruması)

### SQL Injection Prevention
1. **Prisma**: Parameterize queries (birincil koruma)
2. **Pattern Kontrolü**: `containsSqlInjection()` ile ek koruma
3. **Input Length**: Tüm alanlarda maksimum uzunluk

### XSS Prevention
1. **React**: Otomatik HTML escape
2. **Pattern Kontrolü**: `containsXss()` ile script/iframe/svg tespiti
3. **CSP Header**: Inline script kısıtlı, external domain kısıtlı
4. **Honeypot**: Bot tespiti için gizli alan

## 🔒 Security Headers

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; ...
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), ...
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-site
```

Admin rotaları için ekstra:
```http
X-Robots-Tag: noindex, nofollow, nosnippet, noarchive
Cache-Control: no-store, no-cache, must-revalidate
```

## 📋 Audit Logging

Tüm admin işlemleri `ActivityLog` tablosuna kaydedilir:
- `action`: LOGIN, LOGOUT, CREATE, UPDATE, DELETE, ARCHIVE
- `entityType`: MenuItem, Order, Reservation, vb.
- `entityId`: Etkilenen kayıt ID
- `details`: İnsan-okur açıklama
- `ipAddress`: İstek IP'si
- `userAgent`: Browser bilgisi
- `adminEmail`: Hangi admin

## 🚫 Bilgi Sızdırmama İlkeleri

1. **Hata Mesajları**: Kullanıcıya generic hata, detay sadece server log
2. **Stack Trace**: Production'da client'a gösterilmez
3. **Database Hataları**: Prisma hata kodu client'a gitmez
4. **Sensitif Headers**: `poweredByHeader: false`
5. **Console Log**: Production'da Prisma sadece error/warn loglar
6. **Environment**: `.env` `.gitignore`'da, sadece `.env.example` commit
7. **Admin Bootstrap**: İlk admin oluştuktan sonra env değişkeni kaldırılmalı

## ✅ Pre-Deployment Checklist

- [ ] `NEXTAUTH_SECRET` üretildi (min 32 byte)
- [ ] `ADMIN_BOOTSTRAP_PASSWORD` güçlü ve unique
- [ ] `.env` dosyası commit değil
- [ ] Prisma schema `postgresql` provider'a geçirildi
- [ ] `NEXTAUTH_URL` production domain'i
- [ ] `NEXT_PUBLIC_ALLOWED_ORIGINS` production domain'i
- [ ] HTTPS zorunlu (Vercel otomatik)
- [ ] İlk admin girişi sonrası şifre değiştirildi
- [ ] `ADMIN_BOOTSTRAP_*` env değişkenleri kaldırıldı
- [ ] Tüm rate limit'ler aktif
- [ ] CSP header test edildi (browser console)

## 🔄 Ongoing Security

- **Admin Şifre Rotasyonu**: 90 günde bir
- **Activity Log Review**: Haftalık (anormal giriş tespiti)
- **Dependency Update**: `bun update` aylık
- **Vercel Log Monitoring**: Anomali tespiti
- **Neon DB Backup**: Otomatik (Neon free tier)

## 🆘 Incident Response

Şüpheli aktivite tespiti:
1. `/admin/aktivite` sayfasından log incele
2. İlgili admin kullanıcısını DB'den devre dışı bırak
3. Tüm session'ları invalidate et (NEXTAUTH_SECRET rotate)
4. Etkilenen kayıtları incele (order, reservation, vb.)
5. IPs'leri rate limiter blacklist'e ekle

## 📞 Güvenlik İletişim

Güvenlik açığı tespit ederseniz: security@demospizza.com
