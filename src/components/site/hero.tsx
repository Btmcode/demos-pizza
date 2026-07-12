"use client";

import { Flame, Clock, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STATS, CONTACT, BRAND } from "@/lib/constants";

export function Hero() {
  return (
    <section
      id="anasayfa"
      className="relative min-h-[88vh] md:min-h-[92vh] flex items-center overflow-hidden bg-charcoal"
    >
      {/* Background image - storefront */}
      <div className="absolute inset-0">
        <img
          src="/images/demos-storefront.png"
          alt="Demos Pizza — Fatih Haseki'de günlük taze pizza"
          className="h-full w-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 hero-overlay" />
        {/* Gold glow accent */}
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[80vw] h-64 bg-saffron/25 blur-3xl rounded-full ember-pulse" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-20 md:py-32">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="flex items-center gap-3 mb-6">
            <Badge
              variant="outline"
              className="bg-charcoal/40 border-saffron/40 text-saffron backdrop-blur-sm text-xs font-medium"
            >
              <Flame className="h-3 w-3 mr-1" />
              {BRAND.tagline}
            </Badge>
            {BRAND && CONTACT.promo.active && (
              <Badge className="bg-ember text-cream border-0 text-xs font-bold animate-pulse">
                🔥 {CONTACT.promo.text}
              </Badge>
            )}
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-cream leading-[0.95] tracking-tight">
            Günlük Taze
            <br />
            <span className="text-saffron ember-glow italic">El Yapımı Hamur</span>
          </h1>

          {/* Sub */}
          <p className="mt-6 md:mt-8 text-lg md:text-xl text-cream/85 max-w-2xl leading-relaxed">
            Haseki'de her gün taze hazırlanan hamurumuz, endüstriyel fırınımızda en mükemmel
            kıvamında pişer. İtalyan tarzı pizzalarımız, kurye ile{" "}
            <span className="text-saffron font-semibold">30-45 dakikada</span> kapınızda.
            Fatih ve çevresine geniş servis ağı.
          </p>

          {/* CTAs */}
          <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-3">
            <a href="#menu">
              <Button
                size="lg"
                className="bg-ember hover:bg-ember/90 text-cream text-base px-8 h-14 font-semibold shadow-xl shadow-ember/30"
              >
                Hemen Sipariş Ver
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <a href={CONTACT.whatsappHref} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 h-14 bg-cream/5 backdrop-blur-sm border-cream/30 text-cream hover:bg-basil hover:text-cream hover:border-basil"
              >
                <Clock className="mr-2 h-4 w-4" />
                WhatsApp: {CONTACT.whatsapp}
              </Button>
            </a>
          </div>

          {/* Mini stats strip */}
          <div className="mt-12 md:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 max-w-3xl">
            {STATS.map((s, i) => (
              <div key={i} className="border-l-2 border-saffron/60 pl-4 py-1">
                <div className="font-display text-2xl md:text-3xl font-bold text-cream">
                  {s.value}
                  <span className="text-saffron">{s.suffix}</span>
                </div>
                <div className="text-[11px] md:text-xs text-cream/70 mt-0.5 leading-tight">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center text-cream/60">
        <span className="text-[10px] uppercase tracking-widest mb-2">Kaydır</span>
        <div className="w-px h-12 bg-gradient-to-b from-cream/60 to-transparent" />
      </div>
    </section>
  );
}
