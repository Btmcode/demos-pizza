"use client";

import { Flame } from "lucide-react";

export function StoneOven() {
  return (
    <section className="relative h-[70vh] min-h-[480px] overflow-hidden bg-charcoal">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/images/ingredients.png"
          alt="Taze pizza malzemeleri — günlük hazırlanan"
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/60 via-transparent to-charcoal/80" />
        <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-[60vw] h-32 bg-saffron/30 blur-3xl rounded-full ember-pulse" />
      </div>

      <div className="relative z-10 h-full container mx-auto px-6 flex flex-col items-center justify-center text-center">
        <Flame className="h-10 w-10 text-saffron ember-pulse mb-4" />
        <span className="text-saffron text-xs font-mono uppercase tracking-[0.3em] mb-3">
          {"// Endüstriyel Fırın"}
        </span>
        <h2 className="font-display text-4xl md:text-6xl font-bold text-cream max-w-4xl leading-tight">
          Her gün <span className="text-saffron italic">taze hamur</span>,
          <br />
          endüstriyel fırında pişer
        </h2>
        <p className="mt-5 text-cream/80 max-w-2xl text-base md:text-lg leading-relaxed">
          Dondurulmuş hamur kullanmayız. Her sabah taze hazırladığımız hamurumuzu, endüstriyel
          fırınımızda en mükemmel kıvamında pişiririz. Sonuç: dışı çıtır, içi yumuşacık, her
          ısırıkta tazelik.
        </p>

        {/* Feature strip */}
        <div className="mt-8 grid grid-cols-3 gap-3 md:gap-6 max-w-2xl">
          <div className="text-center">
            <div className="font-display text-2xl md:text-3xl font-bold text-saffron">100%</div>
            <div className="text-[11px] md:text-xs text-cream/70 mt-1">Günlük taze hamur</div>
          </div>
          <div className="text-center border-x border-cream/10">
            <div className="font-display text-2xl md:text-3xl font-bold text-saffron">0°</div>
            <div className="text-[11px] md:text-xs text-cream/70 mt-1">Dondurulmuş içerik yok</div>
          </div>
          <div className="text-center">
            <div className="font-display text-2xl md:text-3xl font-bold text-saffron">25+</div>
            <div className="text-[11px] md:text-xs text-cream/70 mt-1">Pizza çeşidi</div>
          </div>
        </div>
      </div>
    </section>
  );
}
