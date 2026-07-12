import { LegalLayout, LegalSection, LegalP, LegalUl } from "@/components/site/legal-layout";
import { BRAND, CONTACT } from "@/lib/constants";

export const metadata = {
  title: "Teslimat Sözleşmesi",
  description: "Demos Pizza teslimat koşulları ve sözleşmesi",
};

export default function DeliveryPage() {
  return (
    <LegalLayout
      title="Teslimat Sözleşmesi"
      subtitle="Mesafeli satış ve teslimat koşulları"
      lastUpdated="12 Temmuz 2026"
    >
      <LegalSection title="1. Taraflar">
        <LegalP>
          İşbu Teslimat Sözleşmesi ("Sözleşme"), {BRAND.legalName} ("Satıcı") ile web sitemiz
          (https://demos.pizza.com.tr) üzerinden sipariş veren müşteri ("Alıcı") arasında akdedilmiştir.
        </LegalP>
        <LegalP>
          <strong>Satıcı:</strong> {BRAND.legalName}
          <br />
          <strong>Adres:</strong> {CONTACT.address.full}
          <br />
          <strong>Telefon:</strong> {CONTACT.phone}
          <br />
          <strong>E-posta:</strong> {CONTACT.email}
        </LegalP>
      </LegalSection>

      <LegalSection title="2. Konu">
        <LegalP>
          Sözleşme, Alıcı'nın web sitesi üzerinden verdiği siparişlerin hazırlanması, teslimatı ve
          ödemesine ilişkin koşulları düzenlemektedir. Sipariş verildiği andan itibaren Sözleşme
          hükümleri geçerli kabul edilir.
        </LegalP>
      </LegalSection>

      <LegalSection title="3. Sipariş ve Onay">
        <LegalP>
          Alıcı, web sitesi üzerinden seçtiği ürünleri sepete ekleyerek, müşteri bilgilerini ve
          teslimat adresini girerek sipariş verir. Sipariş onaylandığında Alıcı'ya otomatik olarak
          bir sipariş numarası verilir. Bu numara ile sipariş takibi yapılabilir.
        </LegalP>
        <LegalP>
          Satıcı, siparişi aldıktan sonra ürünü hazırlamakla yükümlüdür. Stok tükenmesi veya
          benzeri bir durumda sipariş reddedilebilir. Bu halde Alıcı bilgilendirilir ve ödeme
          yapılmışsa iade edilir.
        </LegalP>
      </LegalSection>

      <LegalSection title="4. Teslimat Bölgeleri">
        <LegalP>
          Satıcı, aşağıdaki bölgelere kurye ile teslimat hizmeti sunmaktadır:
        </LegalP>
        <LegalUl>
          {CONTACT.delivery.serviceAreas.map((area) => (
            <li key={area}>{area}</li>
          ))}
        </LegalUl>
        <LegalP>
          Servis bölgeleri dışındaki adreslere teslimat yapılmaz. Bu bölgeler zamanla
          genişletilebilir veya değiştirilebilir.
        </LegalP>
      </LegalSection>

      <LegalSection title="5. Teslimat Süresi">
        <LegalP>
          Standart teslimat süresi {CONTACT.delivery.deliveryTime}'dır. Bu süre hava koşulları,
          trafik, yoğunluk gibi mücbir sebeplerle uzayabilir. Alıcı, teslimat süresi gecikmelerden
          kaynaklı zararlardan Satıcı'nın sorumlu olmadığını kabul eder.
        </LegalP>
        <LegalP>
          Sipariş, Alıcı veya belirtilen adresteki kişiye teslim edilir. Teslimat sırasında Alıcı
          adreste yoksa, kurye telefon ile iletişime geçer. 15 dakika içinde ulaşılamazsa sipariş
          iade edilir ve ödeme iade edilir (teslimat ücreti kesintisi olabilir).
        </LegalP>
      </LegalSection>

      <LegalSection title="6. Teslimat Ücreti">
        <LegalP>
          Teslimat ücreti, sipariş tutarına göre değişir:
        </LegalP>
        <LegalUl>
          <li>Min. sipariş tutarı: {CONTACT.delivery.minOrder} ₺</li>
          <li>Teslimat ücreti: {CONTACT.delivery.deliveryFee} ₺</li>
          <li>{CONTACT.delivery.freeDeliveryThreshold} ₺ ve üzeri siparişlerde ÜCRETSİZ teslimat</li>
        </LegalUl>
      </LegalSection>

      <LegalSection title="7. Ödeme">
        <LegalP>Alıcı aşağıdaki ödeme yöntemlerini kullanabilir:</LegalP>
        <LegalUl>
          <li><strong>Kapıda Nakit:</strong> Sipariş tesliminde nakit ödeme</li>
          <li><strong>Kapıda Kart:</strong> Sipariş tesliminde POS cihazı ile kart ödemesi</li>
          <li><strong>Online Ödeme:</strong> (yakında) Kredi kartı ile online ödeme</li>
        </LegalUl>
      </LegalSection>

      <LegalSection title="8. Ürün Fiyatları">
        <LegalP>
          Tüm fiyatlar Türk Lirası (TRY) olarak belirtilir ve KDV dahildir. Fiyatlar kampanya ve
          dönemsel olarak değiştirilebilir. Sipariş anındaki fiyat geçerlidir.
        </LegalP>
      </LegalSection>

      <LegalSection title="9. Cayma Hakkı">
        <LegalP>
          6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği
          uyarınca, Alıcı'nın cayma hakkı bulunmaktadır. Ancak gıda maddeleri (çabuk bozulabilen veya
          son kullanma tarihi geçebilecek nitelikte olanlar) için cayma hakkı kullanılamaz. Pizza
          ve benzeri hazırlanan gıdalar bu kapsamda olduğundan, sipariş onayından sonra cayma hakkı
          kullanılamaz.
        </LegalP>
      </LegalSection>

      <LegalSection title="10. Ürün İadesi">
        <LegalP>
          Ürün iadesi için <a href="/iade" className="text-ember underline">İade Politikası</a>'na
          bakınız. Ürünün bozuk, eksik veya hatalı gelmesi halinde, sipariş tesliminden itibaren
          30 dakika içinde şikayette bulunulmalıdır.
        </LegalP>
      </LegalSection>

      <LegalSection title="11. Mücbir Sebepler">
        <LegalP>
          Hava muhalefeti, deprem, sel, yangın, salgın, savaş, grev, kurye eksikliği, internet
          kesintisi gibi Satıcı'nın kontrolü dışındaki mücbir sebeplerden kaynaklı gecikme veya
          aksaklıklardan Satıcı sorumlu tutulamaz.
        </LegalP>
      </LegalSection>

      <LegalSection title="12. Uyuşmazlıkların Çözümü">
        <LegalP>
          Bu Sözleşme'den doğan uyuşmazlıklarda Tüketiciler Hakem Heyyeti veya yetkili mahkemeler
          görevlidir. Başvuru önceleri {CONTACT.email} adresi ile iletişime geçilmesi önerilir.
        </LegalP>
      </LegalSection>

      <LegalSection title="13. Yürürlük">
        <LegalP>
          İşbu Sözleşme, Alıcı sipariş onayladığı andan itibaren yürürlüğe girer. Sözleşme
          hükümleri, web sitesinde yayında kaldığı sürece geçerlidir.
        </LegalP>
      </LegalSection>
    </LegalLayout>
  );
}
