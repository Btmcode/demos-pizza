"use client";

import { Flame } from "lucide-react";

export function StoneOven() {
  return (
    <section className="relative py-16 md:py-24 bg-charcoal text-cream overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Image */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
            <img
              src="/images/ingredients.png"
              alt="Taze pizza malzemeleri — günlük hazırlanan"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Text */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Flame className="h-5 w-5 text-saffron" />
              <span className="text-saffron text-xs font-mono uppercase tracking-[0.25em]">
                {"// Endüstriyel Fırın"}
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">
              Her gün <span className="text-saffron italic">taze hamur</span>,
              <br />
              endüstriyel fırında pişer
            </h2>
            <p className="mt-4 md:mt-5 text-cream/80 text-base md:text-lg leading-relaxed max-w-xl">
              Dondurulmuş hamur kullanmayız. Her sabah taze hazırladığımız hamurumuzu,
              endüstriyel fırınımızda en mükemmel kıvamında pişiririz. Sonuç: dışı çıtır,
              içi yumuşacık, her ısırıkta tazelik.
            </p>

            {/* Feature strip */}
            <div className="mt-6 md:mt-8 grid grid-cols-3 gap-3 md:gap-4">
              <div className="bg-smoke p-3 md:p-4 rounded-xl text-center">
                <div className="font-display text-2xl md:text-3xl font-bold text-saffron leading-none">100%</div>
                <div className="text-[11px] md:text-xs text-cream/70 mt-2">Günlük taze hamur</div>
              </div>
              <div className="bg-smoke p-3 md:p-4 rounded-xl text-center">
                <div className="font-display text-2xl md:text-3xl font-bold text-saffron leading-none">0°</div>
                <div className="text-[11px] md:text-xs text-cream/70 mt-2">Dondurulmuş yok</div>
              </div>
              <div className="bg-smoke p-3 md:p-4 rounded-xl text-center">
                <div className="font-display text-2xl md:text-3xl font-bold text-saffron leading-none">25+</div>
                <div className="text-[11px] md:text-xs text-cream/70 mt-2">Pizza çeşidi</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
