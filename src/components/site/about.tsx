"use client";

import { CheckCircle2, MapPin, Truck } from "lucide-react";
import { BRAND, CONTACT } from "@/lib/constants";

const POINTS = [
  "Günlük taze hazırlanan el yapımı hamur — dondurulmuş değil",
  "Endüstriyel fırında mükemmel kıvamında pişirme",
  "İtalyan tarzı malzemeler: San Marzano domates, taze mozzarella",
  "Tüm ürünler helal sertifikalı taze et ve malzemelerle",
  "Açık mutfak — pizzan gözünün önünde yapılır",
  "Kurye ile 30-45 dakikada kapınızda — Fatih ve çevresi",
];

export function About() {
  return (
    <section id="hakkimizda" className="bg-paper py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-ink-2 shadow-premium-lg">
              <img
                src="/images/hero-pizza-overhead.png"
                alt="Demos Pizza — taze Margherita, overhead"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-4 -right-3 md:-right-6 bg-ink text-white p-4 md:p-5 rounded-xl shadow-premium-lg max-w-[200px]">
              <div className="font-display text-2xl md:text-3xl font-bold text-yellow leading-none">10+</div>
              <div className="text-[11px] md:text-xs text-white/80 mt-1.5 leading-snug">
                servis bölgesi — Fatih ve çevresi
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <span className="text-pink text-xs font-mono uppercase tracking-[0.25em]">
              {"// Hikayemiz"}
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-ink mt-3 leading-tight">
              Fatih'in <span className="text-gradient-pink">kalbinde</span>,
              <br />
              taze lezzet duruyor
            </h2>

            <p className="mt-5 md:mt-6 text-ink/80 text-base md:text-lg leading-relaxed">
              {BRAND.name}, Haseki Sultan'da Turgut Özal Millet Caddesi üzerinde, Fatih'in
              tarihi dokusunda açılmış bir aile işletmesidir. Amacımız: dondurulmuş hamur
              kullanmadan, her gün taze hazırladığımız hamurla, İtalyan tarzı pizzaları
              erişilebilir fiyatlarla sunmak.
            </p>

            <p className="mt-3 md:mt-4 text-ink/70 leading-relaxed text-sm md:text-base">
              Hamurumuz her sabah taze yoğrulur, mayalanır ve endüstriyel fırınımızda mükemmel
              kıvamında pişer. Sosumuz taze domatesten, mozarellamız günlük gelir. Kurye
              ekibimizle Fatih, Aksaray, Fındıkzade, Çapa ve daha pek çok bölgeye 30-45
              dakikada teslimat yapıyoruz.
            </p>

            <ul className="mt-6 md:mt-8 space-y-2.5">
              {POINTS.map((p, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-pink mt-0.5 shrink-0" />
                  <span className="text-ink/80 text-sm md:text-base">{p}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 md:mt-8 space-y-2">
              <div className="flex items-center gap-2 text-sm text-ink/60">
                <MapPin className="h-4 w-4 text-pink shrink-0" />
                <span>{CONTACT.address.full}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-ink/60">
                <Truck className="h-4 w-4 text-pink shrink-0" />
                <span>Min. sipariş {CONTACT.delivery.minOrder} ₺ · Ücretsiz teslimat {CONTACT.delivery.freeDeliveryThreshold} ₺</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
