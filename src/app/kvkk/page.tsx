import { LegalLayout, LegalSection, LegalP, LegalUl } from "@/components/site/legal-layout";
import { BRAND, CONTACT } from "@/lib/constants";

export const metadata = {
  title: "KVKK Aydınlatma Metni",
  description: "Demos Pizza KVKK veri işleme aydınlatma metni",
};

export default function KVKKPage() {
  return (
    <LegalLayout
      title="KVKK Aydınlatma Metni"
      subtitle="Kişisel Verilerin Korunması Kanunu kapsamında bilgilendirme"
      lastUpdated="12 Temmuz 2026"
    >
      <LegalSection title="1. Veri Sorumlusu">
        <LegalP>
          İşbu Aydınlatma Metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK")
          kapsamında, {BRAND.legalName} ("Şirketimiz") tarafından yürütülen kişisel veri işleme
          faaliyetleri hakkında siz değerli müşterilerimizi aydınlatmak amacıyla hazırlanmıştır.
        </LegalP>
        <LegalP>
          Şirketimiz, {CONTACT.address.full} adresinde mukim olup, kişisel verilerin korunması
          mevzuatı kapsamında "veri sorumlusu" sıfatını haizdir.
        </LegalP>
      </LegalSection>

      <LegalSection title="2. İşlenen Kişisel Veriler">
        <LegalP>
          Şirketimiz, web sitemiz (https://demospizza.com.tr) ve mobil uygulamalarımız üzerinden
          sunduğumuz hizmetlerin ifası kapsamında aşağıdaki kişisel verilerinizi işlemektedir:
        </LegalP>
        <LegalUl>
          <li><strong>Kimlik Bilgileri:</strong> Ad, soyad</li>
          <li><strong>İletişim Bilgileri:</strong> Telefon numarası, e-posta adresi</li>
          <li><strong>Adres Bilgileri:</strong> Teslimat adresi (sokak, bina, daire no, semt)</li>
          <li><strong>Sipariş Bilgileri:</strong> Verilen siparişlerin içeriği, tutarı, zamanı</li>
          <li><strong>İşlem Güvenliği Bilgileri:</strong> IP adresi, tarayıcı bilgisi, çerez verileri</li>
          <li><strong>Müşteri İşlem Bilgileri:</strong> Sipariş geçmişi, müşteri hizmetleri kayıtları</li>
        </LegalUl>
      </LegalSection>

      <LegalSection title="3. Kişisel Veri İşleme Amaçları">
        <LegalP>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</LegalP>
        <LegalUl>
          <li>Online siparişlerinizin alınması, hazırlanması ve teslim edilmesi</li>
          <li>Teslimat hizmetinin yerine getirilmesi (kurye yönlendirme dahil)</li>
          <li>Müşteri talep ve şikayetlerinin değerlendirilmesi</li>
          <li>Kampanya, promosyon ve duyurulardan haberdar edilmesi (onay verilmesi halinde)</li>
          <li>Yasal yükümlülüklerin yerine getirilmesi (vergi, fatura, muhasebe kayıtları)</li>
          <li>Hizmet kalitesinin iyileştirilmesi ve müşteri memnuniyetinin ölçülmesi</li>
          <li>Sözleşmesel ilişkilerin tesis edilmesi ve ifası</li>
          <li>İşlem güvenliğinin sağlanması ve dolandırıcılık önlenmesi</li>
        </LegalUl>
      </LegalSection>

      <LegalSection title="4. Verilerin Aktarılması">
        <LegalP>
          Kişisel verileriniz; sipariş teslimatının yerine getirilebilmesi amacıyla kurye firmalarına
          (Trendyol Yemek, Getir Yemek ve benzeri hizmet sağlayıcılar), ödeme hizmet sağlayıcılarına,
          yasal mercilere (mahkeme, savcılık, kolluk kuvvetleri) ve iş ortaklarımıza mevzuatın izin
          verdiği çerçevede aktarılabilmektedir.
        </LegalP>
      </LegalSection>

      <LegalSection title="5. Veri Saklama Süresi">
        <LegalP>
          Kişisel verileriniz, işleme amaçlarının gerçekleşmesine kadar saklanır. Yasal yükümlülükler
          gereği (VUK, TTK, Borçlar Kanunu vb.) muhafaza edilmesi gereken veriler, ilgili mevzuatta
          öngörülen süreler boyunca (genellikle 5-10 yıl) saklanır. Süre bitiminden sonra veriler
          otomatik olarak silinir veya anonim hale getirilir.
        </LegalP>
      </LegalSection>

      <LegalSection title="6. Haklarınız (KVKK Madde 11)">
        <LegalP>KVKK'nın 11. maddesi kapsamında aşağıdaki haklara sahipsiniz:</LegalP>
        <LegalUl>
          <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
          <li>İşlenmişse buna ilişkin bilgi talep etme</li>
          <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
          <li>Eksik veya yanlış işlenmiş ise düzeltilmesini isteme</li>
          <li>Silinmesini veya yok edilmesini isteme</li>
          <li>Aktarıldığı üçüncü kişilerin bilgilendirilmesini isteme</li>
          <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle
          aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
          <li>Kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız halinde zararın giderilmesini
          talep etme</li>
        </LegalUl>
      </LegalSection>

      <LegalSection title="7. İletişim">
        <LegalP>
          KVKK kapsamındaki talep ve başvurularınızı aşağıdaki iletişim kanallarından bize
          iletebilirsiniz:
        </LegalP>
        <LegalUl>
          <li>E-posta: {CONTACT.email}</li>
          <li>Telefon: {CONTACT.phone}</li>
          <li>Adres: {CONTACT.address.full}</li>
        </LegalUl>
        <LegalP>
          Başvurularınız, KVKK'nın 13. maddesi uyarınca en geç 30 gün içinde sonuçlandırılacaktır.
        </LegalP>
      </LegalSection>
    </LegalLayout>
  );
}
