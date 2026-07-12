import { LegalLayout, LegalSection, LegalP, LegalUl } from "@/components/site/legal-layout";
import { BRAND, CONTACT } from "@/lib/constants";

export const metadata = {
  title: "Gizlilik Politikası",
  description: "Demos Pizza gizlilik politikası",
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Gizlilik Politikası"
      subtitle="Kişisel verilerinizin korunması ve kullanımı"
      lastUpdated="12 Temmuz 2026"
    >
      <LegalSection title="1. Genel">
        <LegalP>
          {BRAND.legalName} olarak, gizliliğinize saygı duyuyor ve kişisel verilerinizi korumayı
          taahhüt ediyoruz. Bu Gizlilik Politikası, web sitemiz (https://demospizza.com.tr)
          üzerinden topladığımız bilgilerin nasıl kullanıldığını açıklamaktadır.
        </LegalP>
      </LegalSection>

      <LegalSection title="2. Toplanan Bilgiler">
        <LegalUl>
          <li><strong>Sipariş bilgileri:</strong> Ad, soyad, telefon, e-posta, teslimat adresi</li>
          <li><strong>Ödeme bilgileri:</strong> Ödeme yöntemi (kart bilgisi tarafımızda saklanmaz,
          ödeme sağlayıcı tarafından işlenir)</li>
          <li><strong>Teknik bilgiler:</strong> IP adresi, tarayıcı tipi, işletim sistemi, ziyaret
          zamanı</li>
          <li><strong>Çerezler:</strong> Detaylar için <a href="/cerez" className="text-ember underline">Çerez Politikası</a></li>
        </LegalUl>
      </LegalSection>

      <LegalSection title="3. Bilgilerin Kullanımı">
        <LegalP>Topladığımız bilgileri aşağıdaki amaçlarla kullanırız:</LegalP>
        <LegalUl>
          <li>Siparişlerin alınması, hazırlanması ve teslim edilmesi</li>
          <li>Müşteri hizmetlerinin sağlanması ve şikayetlerin çözümlenmesi</li>
          <li>Hizmet kalitesinin iyileştirilmesi</li>
          <li>Kampanya ve duyurulardan haberdar edilmesi (sadece onay verilmesi halinde)</li>
          <li>Yasal yükümlülüklerin yerine getirilmesi</li>
          <li>Hile ve dolandırıcılığın önlenmesi</li>
        </LegalUl>
      </LegalSection>

      <LegalSection title="4. Bilgilerin Paylaşımı">
        <LegalP>
          Kişisel bilgilerinizi üçüncü taraflarla satmıyoruz. Sipariş teslimatı için kurye firmaları
          (Trendyol Yemek, Getir Yemek vb.) ve ödeme sağlayıcılar ile gerekli bilgileri paylaşırız.
          Yasal bir zorunluluk halinde yetkili mercilerle paylaşılabilir.
        </LegalP>
      </LegalSection>

      <LegalSection title="5. Veri Güvenliği">
        <LegalP>
          Kişisel verilerinizi korumak için endüstri standardı güvenlik önlemleri alıyoruz:
        </LegalP>
        <LegalUl>
          <li>SSL/TLS şifreli veri iletimi (HTTPS)</li>
          <li>Güvenli veri tabanı altyapısı (Neon PostgreSQL)</li>
          <li>Erişim kontrolü ve yetkilendirme</li>
          <li>Düzenli güvenlik denetimleri</li>
          <li>Çalışan gizlilik eğitimleri</li>
        </LegalUl>
      </LegalSection>

      <LegalSection title="6. Çocukların Gizliliği">
        <LegalP>
          Hizmetlerimiz 18 yaş altı çocuklara yönelik değildir. Ebeveyn kontrolü olmadan çocuklardan
          bilinçli olarak kişisel veri toplamıyoruz. Çocuklardan veri topladığımızı fark ederseniz,
          derhal silmemiz için bizimle iletişime geçin.
        </LegalP>
      </LegalSection>

      <LegalSection title="7. Haklarınız">
        <LegalP>
          Kişisel verilerinize erişme, düzeltme, silme ve işlemeye itiraz etme haklarına sahipsiniz.
          Bu haklarınızı kullanmak için {CONTACT.email} adresine yazabilirsiniz. Detaylar için
          {" "}<a href="/kvkk" className="text-ember underline">KVKK Aydınlatma Metni</a>'ne bakınız.
        </LegalP>
      </LegalSection>

      <LegalSection title="8. Politikada Değişiklikler">
        <LegalP>
          Bu Gizlilik Politikası zaman zaman güncellenebilir. Önemli değişiklikler olması halinde
          web sitemizde duyuru yapacağız. Politamanın son güncelleme tarihi sayfanın üst kısmında
          belirtilmektedir.
        </LegalP>
      </LegalSection>

      <LegalSection title="9. İletişim">
        <LegalP>
          Gizlilik ile sorularınız için: {CONTACT.email} · {CONTACT.phone}
        </LegalP>
      </LegalSection>
    </LegalLayout>
  );
}
