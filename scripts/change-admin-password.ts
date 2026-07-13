/**
 * Demos Pizza · Admin Şifre Değiştirme Scripti
 *
 * Kullanım:
 *   ADMIN_EMAIL=admin@demospizza.com ADMIN_NEW_PASSWORD=YeniSifre123! bun run scripts/change-admin-password.ts
 *
 * Veya direkt script içinden değiştir:
 *   const NEW_PASSWORD = "YeniSifre123!";
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@demospizza.com";
  const newPassword = process.env.ADMIN_NEW_PASSWORD;

  if (!newPassword) {
    console.error("❌ HATA: ADMIN_NEW_PASSWORD environment variable gerekli!");
    console.log("\nKullanım:");
    console.log("  ADMIN_NEW_PASSWORD='YeniSifre123!' bun run scripts/change-admin-password.ts");
    process.exit(1);
  }

  // Şifre güçlü mü kontrol et
  if (newPassword.length < 8) {
    console.error("❌ HATA: Şifre en az 8 karakter olmalı!");
    process.exit(1);
  }
  if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    console.error("❌ HATA: Şifre büyük harf, küçük harf ve rakam içermeli!");
    process.exit(1);
  }

  console.log(`🔐 Admin şifresi değiştiriliyor...`);
  console.log(`   Email: ${email}`);

  const existing = await db.adminUser.findUnique({ where: { email } });
  if (!existing) {
    console.error(`❌ HATA: ${email} kullanıcısı bulunamadı!`);
    process.exit(1);
  }

  const hash = await bcrypt.hash(newPassword, 12);
  await db.adminUser.update({
    where: { email },
    data: { 
      passwordHash: hash,
      lastLoginAt: null,
      lastLoginIp: null,
    },
  });

  // Activity log
  await db.activityLog.create({
    data: {
      adminId: existing.id,
      adminEmail: existing.email,
      action: "UPDATE",
      entityType: "AdminUser",
      entityId: existing.id,
      details: "Password changed via script",
    },
  }).catch(() => null);

  console.log("\n✅ Admin şifresi başarıyla değiştirildi!");
  console.log(`   Yeni şifre: ${"*".repeat(newPassword.length)} (${newPassword.length} karakter)`);
  console.log("\n⚠️  Güvenlik önerileri:");
  console.log("   - Şifreyi güvenli bir yerde saklayın");
  console.log("   - Başka kimseyle paylaşmayın");
  console.log("   - Düzenli olarak değiştirin (ayda bir)");
}

main()
  .catch((e) => {
    console.error("❌ Hata:", e.message);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
