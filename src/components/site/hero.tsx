"use client";

import { Clock, ArrowRight, Flame, Truck, Star, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STATS, CONTACT, BRAND } from "@/lib/constants";

export function Hero() {
  return (
    <section
      id="anasayfa"
      className="relative min-h-[100svh] md:min-h-[94vh] flex items-center overflow-hidden bg-ink"
    >
      {/* Background — animated gradient + dot pattern */}
      <div className="absolute inset-0 animated-gradient" />
      <div className="absolute inset-0 dot-pattern opacity-40" />

      {/* Glow accents — solid radial, GPU-friendly */}
      <div
        className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, #FF2D8D 0%, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full opacity-25"
        style={{ background: "radial-gradient(circle, #FFC400 0%, transparent 70%)" }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left — Text content */}
          <div className="lg:col-span-7 max-w-2xl">
            {/* Badge row */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              {CONTACT.promo.active && (
                <Badge className="bg-pink text-white border-0 text-xs font-bold shadow-pink-glow">
                  🔥 {CONTACT.promo.text}
                </Badge>
              )}
              <Badge
                variant="outline"
                className="glass-dark border-yellow/40 text-yellow text-xs font-semibold"
              >
                <Flame className="h-3 w-3 mr-1" />
                {BRAND.tagline}
              </Badge>
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-bold text-white leading-[0.95] tracking-tight">
              Günlük Taze
              <br />
              <span className="text-gradient-gold">El Yapımı Hamur</span>
            </h1>

            {/* Sub */}
            <p className="mt-5 md:mt-6 text-base md:text-xl text-white/85 max-w-xl leading-relaxed">
              Haseki'de her gün taze hazırlanan hamurumuz, endüstriyel fırınımızda mükemmel
              kıvamında pişer. Kurye ile{" "}
              <span className="text-yellow font-semibold">30-45 dakikada</span> kapında.
            </p>

            {/* CTAs */}
            <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3">
              <a href="#menu">
                <Button
                  size="lg"
                  className="bg-pink hover:bg-pink-hover text-white text-base px-7 h-13 font-semibold shadow-pink-glow btn-premium"
                >
                  Hemen Sipariş Ver
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
              <a href={CONTACT.whatsappHref} target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-7 h-13 glass-dark border-white/20 text-white hover:bg-white hover:text-ink btn-premium"
                >
                  <Truck className="mr-2 h-4 w-4 text-yellow" />
                  {CONTACT.delivery.deliveryTime} teslimat
                </Button>
              </a>
            </div>

            {/* Trust badges */}
            <div className="mt-8 md:mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <div className="flex items-center gap-1.5 text-white/80">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow text-yellow" />
                  ))}
                </div>
                <span className="ml-1">350+ günlük sipariş</span>
              </div>
              <span className="text-white/30">·</span>
              <div className="flex items-center gap-1.5 text-white/80">
                <Clock className="h-4 w-4 text-yellow" />
                10:00 - 00:00 açık
              </div>
              <span className="text-white/30">·</span>
              <div className="flex items-center gap-1.5 text-white/80">
                <Flame className="h-4 w-4 text-yellow" />
                Helal sertifikalı
              </div>
            </div>

            {/* Mini stats */}
            <div className="mt-8 md:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 max-w-2xl">
              {STATS.map((s, i) => (
                <div key={i} className="border-l-2 border-yellow/60 pl-3 md:pl-4 py-1">
                  <div className="font-display text-2xl md:text-3xl font-bold text-white leading-none">
                    {s.value}
                    <span className="text-yellow">{s.suffix}</span>
                  </div>
                  <div className="text-[11px] md:text-xs text-white/70 mt-1.5 leading-tight">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Hero image */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-square md:aspect-[4/5] lg:aspect-[4/5] max-w-md mx-auto lg:max-w-none">
              {/* Main image — appetizing pizza */}
              <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-premium-lg float-anim">
                <img
                  src="/images/hero-pizza-main.png"
                  alt="Demos Pizza — taze hazırlanan, eriyen mozzarella, çıtır kenar"
                  className="h-full w-full object-cover"
                  fetchPriority="high"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
              </div>

              {/* Floating badge — delivery */}
              <div className="absolute -bottom-4 -left-4 md:-left-6 glass-dark rounded-2xl p-4 max-w-[200px] shadow-premium-lg">
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-9 h-9 rounded-full bg-yellow/20 flex items-center justify-center">
                    <Truck className="h-4 w-4 text-yellow" />
                  </div>
                  <div>
                    <div className="text-xs text-white/60">Teslimat</div>
                    <div className="font-display font-bold text-white text-sm">
                      {CONTACT.delivery.deliveryTime}
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-white/50 leading-tight">
                  Haseki, Aksaray, Fındıkzade +12 bölge
                </div>
              </div>

              {/* Floating badge — rating */}
              <div className="absolute -top-3 -right-3 md:-top-4 md:-right-4 glass-dark rounded-2xl p-3 shadow-premium-lg">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-3 w-3 fill-yellow text-yellow" />
                    ))}
                  </div>
                  <div className="font-display font-bold text-white text-sm">4.8</div>
                </div>
                <div className="text-[10px] text-white/60 mt-0.5">350+ değerlendirme</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center text-white/40">
        <span className="text-[10px] uppercase tracking-widest mb-2">Keşfet</span>
        <ChevronDown className="h-4 w-4 animate-bounce" />
      </div>
    </section>
  );
}
