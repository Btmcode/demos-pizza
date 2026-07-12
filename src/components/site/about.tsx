"use client";

import { CheckCircle2, MapPin, Truck } from "lucide-react";
import { BRAND, CONTACT } from "@/lib/constants";

const POINTS = [
  "Günlük taze hazırlanan el yapımı hamur — dondurulmuş değil",
  "Endüstriyel fırında mükemmel kıvamında pişirme",
  "İtalyan tarzı malzemeler: San Marzano domates, taze mozzarella",
  "Tüm ürünler helal sertifikalı taze et ve malzemelerle",
  "Açık mutfak — pizzasınız gözünüzün önünde yapılır",
  "Kurye ile 30-45 dakikada kapınızda — Fatih ve çevresi",
];

export function About() {
  return (
    <section id="hakkimizda" className="bg-cream py-20 md:py-28 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image side - storefront */}
          <div className="relative">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="/images/demos-storefront.png"
                alt="Demos Pizza — Fatih Haseki'de taze pizza"
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/30 to-transparent" />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-6 -right-4 md:-right-8 bg-charcoal text-cream p-6 rounded-2xl shadow-xl max-w-[220px]">
              <div className="font-display text-3xl font-bold text-saffron">10+</div>
              <div className="text-xs text-cream/80 mt-1 leading-snug">
                servis bölgesi — Fatih ve çevresi
              </div>
              <div className="mt-3 pt-3 border-t border-cream/15 text-[11px] text-cream/70 leading-relaxed">
                Haseki'den tüm İstanbul'un Avrupa yakasına yayılan lezzet.
              </div>
            </div>
          </div>

          {/* Text side */}
          <div>
            <span className="text-ember text-xs font-mono uppercase tracking-[0.3em]">
              {"// Hikayemiz"}
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-charcoal mt-3 leading-tight">
              Fatih'in <span className="text-ember italic">kalbinde</span>,
              <br />
              taze lezzet duruyor
            </h2>

            <p className="mt-6 text-charcoal/80 text-base md:text-lg leading-relaxed">
              {BRAND.name}, Haseki Sultan'da Turgut Özal Millet Caddesi üzerinde, Fatih'in
              tarihi dokusunda açılmış bir aile işletmesidir. Amacımız: dondurulmuş hamur
              kullanmadan, her gün taze hazırladığımız hamurla, İtalyan tarzı pizzaları
              erişilebilir fiyatlarla sunmak.
            </p>

            <p className="mt-4 text-charcoal/70 leading-relaxed">
              Hamurumuz her sabah taze yoğrulur, mayalanır ve endüstriyel fırınımızda mükemmel
              kıvamında pişer. Sosumuz taze domatesten, mozarellamız günlük gelir. Kurye
              ekibimizle Fatih, Aksaray, Fındıkzade, Çapa ve daha pek çok bölgeye 30-45
              dakikada teslimat yapıyoruz.
            </p>

            <ul className="mt-8 space-y-3">
              {POINTS.map((p, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-basil mt-0.5 shrink-0" />
                  <span className="text-charcoal/80 text-sm md:text-base">{p}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex items-center gap-3 text-sm text-charcoal/60">
              <MapPin className="h-4 w-4 text-ember" />
              <span>{CONTACT.address.full}</span>
            </div>
            <div className="mt-2 flex items-center gap-3 text-sm text-charcoal/60">
              <Truck className="h-4 w-4 text-ember" />
              <span>Min. sipariş {CONTACT.delivery.minOrder} ₺ · Ücretsiz teslimat {CONTACT.delivery.freeDeliveryThreshold} ₺</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
