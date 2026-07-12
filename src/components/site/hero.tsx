"use client";

import { Clock, ArrowRight, Flame, Truck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STATS, CONTACT, BRAND } from "@/lib/constants";

export function Hero() {
  return (
    <section
      id="anasayfa"
      className="relative min-h-[92vh] md:min-h-[94vh] flex items-center overflow-hidden bg-charcoal"
    >
      {/* Background image — solid overlay, no gradient/blur */}
      <div className="absolute inset-0">
        <img
          src="/images/demos-storefront.png"
          alt="Demos Pizza — Fatih Haseki'de günlük taze pizza"
          className="h-full w-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 solid-overlay" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="max-w-2xl">
          {/* Badge row */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <Badge
              variant="outline"
              className="bg-charcoal/40 border-saffron/50 text-saffron text-xs font-semibold"
            >
              <Flame className="h-3 w-3 mr-1" />
              {BRAND.tagline}
            </Badge>
            {CONTACT.promo.active && (
              <Badge className="bg-ember text-cream border-0 text-xs font-bold">
                🔥 {CONTACT.promo.text}
              </Badge>
            )}
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[88px] font-bold text-cream leading-[0.95] tracking-tight">
            Günlük Taze
            <br />
            <span className="text-saffron italic">El Yapımı Hamur</span>
          </h1>

          {/* Sub */}
          <p className="mt-5 md:mt-6 text-base md:text-xl text-cream/85 max-w-xl leading-relaxed">
            Haseki'de her gün taze hazırlanan hamurumuz, endüstriyel fırınımızda mükemmel
            kıvamında pişer. Kurye ile <span className="text-saffron font-semibold">30-45 dakikada</span> kapınızda — Fatih ve çevresine geniş servis ağı.
          </p>

          {/* CTAs */}
          <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3">
            <a href="#menu">
              <Button
                size="lg"
                className="bg-ember hover:bg-ember/90 text-cream text-base px-7 h-13 font-semibold shadow-md"
              >
                Hemen Sipariş Ver
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <a href={CONTACT.whatsappHref} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                variant="outline"
                className="text-base px-7 h-13 bg-cream/10 border-cream/30 text-cream hover:bg-basil hover:border-basil"
              >
                <Truck className="mr-2 h-4 w-4" />
                {CONTACT.delivery.deliveryTime} teslimat
              </Button>
            </a>
          </div>

          {/* Trust badges */}
          <div className="mt-8 md:mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center gap-1.5 text-cream/80">
              <div className="flex">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-saffron text-saffron" />
                ))}
              </div>
              <span className="ml-1">350+ günlük sipariş</span>
            </div>
            <span className="text-cream/30">·</span>
            <div className="flex items-center gap-1.5 text-cream/80">
              <Clock className="h-4 w-4 text-saffron" />
              Açık · 10:00 - 00:00
            </div>
            <span className="text-cream/30">·</span>
            <div className="flex items-center gap-1.5 text-cream/80">
              <Flame className="h-4 w-4 text-saffron" />
              Helal sertifikalı
            </div>
          </div>

          {/* Mini stats */}
          <div className="mt-10 md:mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 max-w-2xl">
            {STATS.map((s, i) => (
              <div key={i} className="border-l-2 border-saffron/60 pl-3 md:pl-4 py-1">
                <div className="font-display text-2xl md:text-3xl font-bold text-cream leading-none">
                  {s.value}
                  <span className="text-saffron">{s.suffix}</span>
                </div>
                <div className="text-[11px] md:text-xs text-cream/70 mt-1.5 leading-tight">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
