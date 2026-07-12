"use client";

import { Flame } from "lucide-react";

export function StoneOven() {
  return (
    <section className="relative py-16 md:py-24 bg-ink text-white overflow-hidden">
      <div className="absolute inset-0 dot-pattern opacity-30" />
      <div className="container mx-auto px-4 md:px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
            <img
              src="/images/ingredients.png"
              alt="Taze pizza malzemeleri — günlük hazırlanan"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Flame className="h-5 w-5 text-yellow" />
              <span className="text-yellow text-xs font-mono uppercase tracking-[0.25em]">
                {"// Endüstriyel Fırın"}
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">
              Her gün <span className="text-gradient-gold">taze hamur</span>,
              <br />
              endüstriyel fırında pişer
            </h2>
            <p className="mt-4 md:mt-5 text-white/80 text-base md:text-lg leading-relaxed max-w-xl">
              Dondurulmuş hamur kullanmayız. Her sabah taze hazırladığımız hamurumuzu,
              endüstriyel fırınımızda en mükemmel kıvamında pişiririz. Sonuç: dışı çıtır,
              içi yumuşacık, her ısırıkta tazelik.
            </p>

            <div className="mt-6 md:mt-8 grid grid-cols-3 gap-3 md:gap-4">
              <div className="bg-ink-2 p-3 md:p-4 rounded-xl text-center">
                <div className="font-display text-2xl md:text-3xl font-bold text-yellow leading-none">100%</div>
                <div className="text-[11px] md:text-xs text-white/70 mt-2">Günlük taze hamur</div>
              </div>
              <div className="bg-ink-2 p-3 md:p-4 rounded-xl text-center">
                <div className="font-display text-2xl md:text-3xl font-bold text-yellow leading-none">0°</div>
                <div className="text-[11px] md:text-xs text-white/70 mt-2">Dondurulmuş yok</div>
              </div>
              <div className="bg-ink-2 p-3 md:p-4 rounded-xl text-center">
                <div className="font-display text-2xl md:text-3xl font-bold text-yellow leading-none">25+</div>
                <div className="text-[11px] md:text-xs text-white/70 mt-2">Pizza çeşidi</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
