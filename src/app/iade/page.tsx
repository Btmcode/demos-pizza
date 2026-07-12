import { LegalLayout, LegalSection, LegalP, LegalUl } from "@/components/site/legal-layout";
import { BRAND, CONTACT } from "@/lib/constants";

export const metadata = {
  title: "İade ve Değişim Politikası",
  description: "Demos Pizza iade ve değişim koşulları",
};

export default function RefundPage() {
  return (
    <LegalLayout
      title="İade ve Değişim Politikası"
      subtitle="Gıda iade ve değişim koşulları"
      lastUpdated="12 Temmuz 2026"
    >
      <LegalSection title="1. Genel İlkeler">
        <LegalP>
          {BRAND.legalName} olarak, müşteri memnuniyetini ön planda tutuyoruz. Bu politika,
          6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği
          kapsamında hazırlanmıştır.
        </LegalP>
        <LegalP>
          <strong>Önemli:</strong> Pizza ve hazırlanan gıdalar, "çabuk bozulabilen veya son
          kullanma tarihi geçebilecek nitelikteki mallar" kapsamında olduğundan, 6502 sayılı
          Kanun gereği cayma hakkı kullanılamaz. Ancak ürünün hatalı/eksik olması halinde aşağıdaki
          koşullara göre iade/değişim yapılır.
        </LegalP>
      </LegalSection>

      <LegalSection title="2. İade Koşulları">
        <LegalP>Aşağıdaki durumlarda iade talep edilebilir:</LegalP>
        <LegalUl>
          <li>Ürünün hatalı hazırlanması (yanlış pizza, eksik malzeme vs.)</li>
          <li>Ürünün bozuk/tağdiş edilmiş olarak teslim edilmesi</li>
          <li>Siparişin eksik teslim edilmesi (ürün sayısı eksik)</li>
          <li>Siparişin hiç teslim edilmemesi</li>
          <li>Siparişin belirtilen süreden (90 dakika) çok geç teslim edilmesi</li>
        </LegalUl>
      </LegalSection>

      <LegalSection title="3. İade Süreci">
        <LegalP>
          İade talebinde bulunmak için sipariş tesliminden itibaren <strong>30 dakika içinde</strong>
          {" "}{CONTACT.email} adresine veya {CONTACT.phone} numarasına (WhatsApp) aşağıdaki
          bilgilerle başvurmalısınız:
        </LegalP>
        <LegalUl>
          <li>Sipariş numarası (DP-YYYYMMDD-XXXX formatında)</li>
          <li>Ad soyad</li>
          <li>Sorunun detaylı açıklaması</li>
          <li>Varsa fotoğraf/video kanıt (bozuk ürün fotoğrafı vb.)</li>
        </LegalUl>
      </LegalSection>

      <LegalSection title="4. İade Seçenekleri">
        <LegalP>Onaylanan iade taleplerinde aşağıdaki seçenekler sunulur:</LegalP>
        <LegalUl>
          <li><strong>Ürün Değişimi:</strong> Hatalı ürünün aynı gün yeniden hazırlanıp teslim edilmesi</li>
          <li><strong>Ücret İadesi:</strong> Ödemenin tamamının iade edilmesi</li>
          <li><strong>Kredi:</strong> Sonraki siparişlerde kullanılmak üzere mağaza kredisi verilmesi</li>
        </LegalUl>
        <LegalP>
          İade yöntemi seçimi, müşteri ile mutabık kalınarak yapılır.
        </LegalP>
      </LegalSection>

      <LegalSection title="5. Ücret İadesi Süresi">
        <LegalP>
          Onaylanan ücret iadeleri aşağıdaki sürelerde yapılır:
        </LegalP>
        <LegalUl>
          <li><strong>Kredi kartı ile ödemelerde:</strong> 14 iş günü içinde kartınıza iade</li>
          <li><strong>Nakit ödemelerde:</strong> 7 iş günü içinde banka hesabınıza havale</li>
          <li><strong>Mağaza kredisi:</strong> Aynı gün hesabınıza tanımlanır</li>
        </LegalUl>
        <LegalP>
          İade süreleri bankanıza göre değişebilir. Kart iadeleri banka işlem sürelerinden
          etkilenir.
        </LegalP>
      </LegalSection>

      <LegalSection title="6. İade Edilemeyen Durumlar">
        <LegalP>Aşağıdaki durumlarda iade/değişim yapılmaz:</LegalP>
        <LegalUl>
          <li>Ürünün tüketilmiş olması (kısmi tüketim dahil)</li>
          <li>Müşteri hatası (yanlış adres vermek, eksik bilgi vb.)</li>
          <li>Sipariş tesliminden sonra 30 dakika geçmiş olması</li>
          <li>Ürünün kişisel tatlere uymaması (konu ürün kalitesi değilse)</li>
          <li>Tadı/lezzeti hoşlanmama (ürün kalitesi standartlarda ise)</li>
        </LegalUl>
      </LegalSection>

      <LegalSection title="7. Değişim Politikası">
        <LegalP>
          Yanlış ürün gelmesi halinde, doğru ürün aynı gün içinde ücretsiz olarak yeniden teslim
          edilir. Hatalı ürünü kurye geri alır. Müşteri, hatalı ürünü tüketmemiş olmalıdır.
        </LegalP>
      </LegalSection>

      <LegalSection title="8. Promosyon ve İndirimli Ürünler">
        <LegalP>
          Kampanyalı veya indirimli ürünlerde iade, normal fiyat üzerinden hesaplanır. "1 alana 1
          bedava" kampanyasında iade yapılırsa, ücret iadesi sadece ödenen tutar üzerinden yapılır
          (bedava ürün için iade yapılmaz).
        </LegalP>
      </LegalSection>

      <LegalSection title="9. Şikayet ve İletişim">
        <LegalP>
          İade, değişim veya herhangi bir şikayetiniz için:
        </LegalP>
        <LegalUl>
          <li>E-posta: {CONTACT.email}</li>
          <li>Telefon: {CONTACT.phone}</li>
          <li>WhatsApp: {CONTACT.whatsapp}</li>
          <li>Adres: {CONTACT.address.full}</li>
        </LegalUl>
        <LegalP>
          Çözüme kavuşturulamayan uyuşmazlıklarda Tüketici Hakem Heyyeti'ne veya yetkili mahkemelere
          başvurabilirsiniz.
        </LegalP>
      </LegalSection>
    </LegalLayout>
  );
}
