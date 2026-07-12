"use client";

import { Clock, ArrowRight, Flame, Truck, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STATS, CONTACT, BRAND } from "@/lib/constants";

export function Hero() {
  return (
    <section
      id="anasayfa"
      className="relative min-h-[92vh] md:min-h-[94vh] flex items-center overflow-hidden bg-ink"
    >
      {/* Background image with solid overlay */}
      <div className="absolute inset-0">
        <img
          src="/images/demos-storefront.png"
          alt="Demos Pizza — Fatih Haseki'de günlük taze pizza"
          className="h-full w-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-ink/65" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="max-w-2xl">
          {/* Badge row */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <Badge
              variant="outline"
              className="glass-dark border-yellow/40 text-yellow text-xs font-semibold"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              AI Destekli Sipariş
            </Badge>
            {CONTACT.promo.active && (
              <Badge className="bg-pink text-white border-0 text-xs font-bold shadow-pink-glow">
                🔥 {CONTACT.promo.text}
              </Badge>
            )}
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[88px] font-bold text-white leading-[0.95] tracking-tight">
            Günlük Taze
            <br />
            <span className="text-gradient-gold">El Yapımı Hamur</span>
          </h1>

          <p className="mt-5 md:mt-6 text-base md:text-xl text-white/85 max-w-xl leading-relaxed">
            Haseki'de her gün taze hazırlanan hamurumuz, endüstriyel fırınımızda mükemmel
            kıvamında pişer. <span className="text-yellow font-semibold">AI ile öneriler al</span>,
            kurye ile <span className="text-yellow font-semibold">30-45 dakikada</span> kapında.
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
            <a href="#ai-recommendation">
              <Button
                size="lg"
                variant="outline"
                className="text-base px-7 h-13 glass-dark border-white/20 text-white hover:bg-white hover:text-ink btn-premium"
              >
                <Sparkles className="mr-2 h-4 w-4 text-yellow" />
                AI Pizza Öner
              </Button>
            </a>
          </div>

          {/* Trust badges */}
          <div className="mt-8 md:mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center gap-1.5 text-white/80">
              <div className="flex">
                {[1,2,3,4,5].map((i) => (
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
          <div className="mt-10 md:mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 max-w-2xl">
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
      </div>

      {/* Floating truck badge */}
      <div className="hidden lg:block absolute right-8 bottom-8 z-10">
        <div className="glass-dark rounded-2xl p-4 max-w-[200px] float-anim">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-9 h-9 rounded-full bg-yellow/20 flex items-center justify-center">
              <Truck className="h-4 w-4 text-yellow" />
            </div>
            <div>
              <div className="text-xs text-white/60">Teslimat</div>
              <div className="font-display font-bold text-white text-sm">{CONTACT.delivery.deliveryTime}</div>
            </div>
          </div>
          <div className="text-[10px] text-white/50 leading-tight">
            Haseki, Aksaray, Fındıkzade +12 bölge
          </div>
        </div>
      </div>
    </section>
  );
}
