"use client";

import { Flame } from "lucide-react";

export function StoneOven() {
  return (
    <section className="relative h-[70vh] min-h-[480px] overflow-hidden bg-charcoal">
      {/* Oven image */}
      <div className="absolute inset-0">
        <img
          src="/images/stone-oven.png"
          alt="Taş fırın — 485°C'de pizza pişirme"
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/60 via-transparent to-charcoal/80" />
        {/* Ember pulse */}
        <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-[60vw] h-32 bg-saffron/30 blur-3xl rounded-full ember-pulse" />
      </div>

      <div className="relative z-10 h-full container mx-auto px-6 flex flex-col items-center justify-center text-center">
        <Flame className="h-10 w-10 text-saffron ember-pulse mb-4" />
        <span className="text-saffron text-xs font-mono uppercase tracking-[0.3em] mb-3">
          {"// The Stone"}
        </span>
        <h2 className="font-display text-4xl md:text-6xl font-bold text-cream max-w-4xl leading-tight">
          485°C'de <span className="text-saffron italic">90 saniyede</span>
          <br />
          mükemmel pişer
        </h2>
        <p className="mt-5 text-cream/80 max-w-2xl text-base md:text-lg leading-relaxed">
          Geleneksel İtalyan taş fırınımız, hamurumuzu dışarıdan çıtır içerden yumuşak pişirir.
          Yüksek sıcaklık, malzemelerin lezzetini saniyeler içinde mühürler — böylece her pizza,
          ilk ısırıkta fırından yeni çıkmış tazeliğini korur.
        </p>
      </div>
    </section>
  );
}
