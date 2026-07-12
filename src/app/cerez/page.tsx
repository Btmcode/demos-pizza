import { LegalLayout, LegalSection, LegalP, LegalUl } from "@/components/site/legal-layout";
import { BRAND } from "@/lib/constants";

export const metadata = {
  title: "Çerez Politikası",
  description: "Demos Pizza çerez politikası",
};

export default function CookiePage() {
  return (
    <LegalLayout
      title="Çerez Politikası"
      subtitle="Web sitemizde kullanılan çerezler ve yönetimi"
      lastUpdated="12 Temmuz 2026"
    >
      <LegalSection title="1. Çerez Nedir?">
        <LegalP>
          Çerezler (cookies), web sitemizi ziyaret ettiğinizde tarayıcınız tarafından cihazınıza
          kaydedilen küçük metin dosyalarıdır. Çerezler, web sitesi işlevselliğini artırmak,
          kullanıcı deneyimini iyileştirmek ve site performansını ölçmek için kullanılır.
        </LegalP>
      </LegalSection>

      <LegalSection title="2. Kullandığımız Çerez Türleri">
        <LegalUl>
          <li><strong>Zorunlu Çerezler:</strong> Web sitesinin temel işlevleri için gerekli. Sepet,
          sipariş akışı, güvenlik. Kapatılamaz.</li>
          <li><strong>Performans Çerezleri:</strong> Ziyaretçi sayısı, sayfa görüntülemeleri, hata
          takibi. Anonim istatistik sağlar.</li>
          <li><strong>İşlevsel Çerezler:</strong> Tercihlerinizi (dil, tema vb.) hatırlamak için.</li>
          <li><strong>Pazarlama Çerezleri:</strong> Sadece onay verilmesi halinde aktif olur.
          Reklam kişiselleştirme için.</li>
        </LegalUl>
      </LegalSection>

      <LegalSection title="3. Kullanılan Çerezler">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-charcoal/10">
            <thead className="bg-charcoal/5">
              <tr>
                <th className="text-left p-3 border-b">Çerez Adı</th>
                <th className="text-left p-3 border-b">Tür</th>
                <th className="text-left p-3 border-b">Süre</th>
                <th className="text-left p-3 border-b">Amaç</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 border-b">next-auth.session-token</td>
                <td className="p-3 border-b">Zorunlu</td>
                <td className="p-3 border-b">8 saat</td>
                <td className="p-3 border-b">Admin oturum yönetimi</td>
              </tr>
              <tr>
                <td className="p-3 border-b">demos-cart-v1</td>
                <td className="p-3 border-b">Zorunlu</td>
                <td className="p-3 border-b">30 gün</td>
                <td className="p-3 border-b">Sepet içeriğini saklama</td>
              </tr>
              <tr>
                <td className="p-3 border-b">demos-cookie-consent</td>
                <td className="p-3 border-b">Zorunlu</td>
                <td className="p-3 border-b">6 ay</td>
                <td className="p-3 border-b">Çerez onayı tercihi</td>
              </tr>
              <tr>
                <td className="p-3 border-b">__stripe_mid</td>
                <td className="p-3 border-b">İşlevsel</td>
                <td className="p-3 border-b">1 yıl</td>
                <td className="p-3 border-b">Ödeme işlemi (Stripe)</td>
              </tr>
              <tr>
                <td className="p-3 border-b">_ga, _ga_*</td>
                <td className="p-3 border-b">Analitik</td>
                <td className="p-3 border-b">2 yıl</td>
                <td className="p-3 border-b">Google Analytics</td>
              </tr>
              <tr>
                <td className="p-3 border-b">_fbp, _fbc</td>
                <td className="p-3 border-b">Pazarlama</td>
                <td className="p-3 border-b">90 gün</td>
                <td className="p-3 border-b">Facebook Pixel</td>
              </tr>
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection title="4. Çerez Yönetimi">
        <LegalP>
          İlk ziyaretinizde çerez onay pop-up'ı ile karşılaşırsınız. Bu pop-up'ta çerez türlerini
          tek tek kabul edebilir veya reddedebilirsiniz. Tercihlerinizi daha sonra değiştirmek için
          tarayıcınızın çerez ayarlarını temizleyip siteyi yeniden ziyaret edebilirsiniz.
        </LegalP>
        <LegalP>Tarayıcınızdan çerezleri yönetme:</LegalP>
        <LegalUl>
          <li>Chrome: Ayarlar → Gizlilik ve güvenlik → Çerezler</li>
          <li>Firefox: Seçenekler → Gizlilik ve Güvenlik → Çerezler</li>
          <li>Safari: Tercihler → Gizlilik → Çerezler</li>
          <li>Edge: Ayarlar → Çerezler ve site izinleri</li>
        </LegalUl>
      </LegalSection>

      <LegalSection title="5. Üçüncü Taraf Hizmetleri">
        <LegalP>Aşağıdaki üçüncü taraf hizmetleri çerez kullanır:</LegalP>
        <LegalUl>
          <li><strong>Google Analytics:</strong> Web sitesi analizi</li>
          <li><strong>Meta (Facebook) Pixel:</strong> Sosyal medya reklam ölçümü</li>
          <li><strong>Google Maps:</strong> Harita ve konum hizmetleri</li>
          <li><strong>Stripe:</strong> Ödeme işleme (gelecekte)</li>
        </LegalUl>
      </LegalSection>

      <LegalSection title="6. İletişim">
        <LegalP>
          Çerez politikası ile ilgili sorularınız için: siparis@demos.pizza.com.tr
        </LegalP>
      </LegalSection>
    </LegalLayout>
  );
}
