"use client";

import { CheckCircle2, MapPin } from "lucide-react";
import { BRAND, CONTACT } from "@/lib/constants";

const POINTS = [
  "72 saat doğal mayalı hamur — uzun fermentasyon, sindirimi kolay",
  "San Marzano D.O.P. domates — İtalya'nın volcanoik toprağından",
  "Fior di latte mozzarella — günlük taze, peynir altı suyundan",
  "Taş fırın 485°C — geleneksel Napoli pişirme yöntemi",
  "Hepsi helal sertifikalı taze etler ve ürünler",
  "Açık mutfak — pizzasınız gözünüzün önünde yapılır",
];

export function About() {
  return (
    <section id="hakkimizda" className="bg-cream py-20 md:py-28 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image side */}
          <div className="relative">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="/images/restaurant-interior.png"
                alt="Demos Pizza — Fatih'in taş fırın pizzeria'sı"
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/30 to-transparent" />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-6 -right-4 md:-right-8 bg-charcoal text-cream p-6 rounded-2xl shadow-xl max-w-[220px]">
              <div className="font-display text-3xl font-bold text-saffron">
                {new Date().getFullYear() - BRAND.established}+
              </div>
              <div className="text-xs text-cream/80 mt-1 leading-snug">
                yıldır Fatih'in gözdesi
              </div>
              <div className="mt-3 pt-3 border-t border-cream/15 text-[11px] text-cream/70 leading-relaxed">
                Haseki'den tüm İstanbul'a taş fırın lezzetini taşıyoruz.
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
              İtalyan geleneği
            </h2>

            <p className="mt-6 text-charcoal/80 text-base md:text-lg leading-relaxed">
              {BRAND.name}, Haseki Sultan'da Turgut Özal Millet Caddesi üzerinde,
              İstanbul'un tarihi dokusuyla İtalyan pizza sanatını buluşturan bir aile işletmesidir.
              Amacımız basit: gerçek İtalyan pizzasını, taze ve erişilebilir fiyatlarla
              Fatih'in tüm konuklarına sunmak.
            </p>

            <p className="mt-4 text-charcoal/70 leading-relaxed">
              Hamurumuz günde iki kez, doğal mayayla 72 saat boyunca mayalanır. Sosumuz
              İtalya'nın_volcanik topraklarında yetişen San Marzano domateslerinden yapılır.
              Mozarellamız günlük gelir. Ve her pizza, 485°C'ye ısıtılmış taş fırınımızda
              sadece 90 saniyede pişer — çıtır dış, yumuşak iç, mükemmel lezzet.
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
          </div>
        </div>
      </div>
    </section>
  );
}
