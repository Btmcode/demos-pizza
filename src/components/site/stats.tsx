"use client";

import { Clock, Truck, Wheat, MapPin } from "lucide-react";
import { STATS, CONTACT } from "@/lib/constants";

const ICONS = [Truck, Clock, Wheat, MapPin];

export function Stats() {
  return (
    <section className="bg-ink text-white py-12 md:py-16 border-y border-ink-2">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-8 md:mb-10">
          <span className="text-yellow text-xs font-mono uppercase tracking-[0.25em]">
            {"// Demos Pizza ile"}
          </span>
          <h2 className="font-display text-2xl md:text-4xl font-bold mt-2">
            Hızlı, taze, <span className="text-gradient-gold">kapında</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {STATS.map((s, i) => {
            const Icon = ICONS[i];
            return (
              <div
                key={i}
                className="bg-ink-2 p-4 md:p-6 rounded-xl text-center card-premium"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 mb-3 rounded-full bg-yellow/15 text-yellow">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="font-display text-2xl md:text-4xl font-bold text-white leading-none">
                  {s.value}
                  <span className="text-yellow">{s.suffix}</span>
                </div>
                <div className="text-xs md:text-sm font-semibold text-white mt-2">{s.label}</div>
                <div className="text-[10px] md:text-xs text-white/60 mt-0.5 leading-snug">{s.sub}</div>
              </div>
            );
          })}
        </div>

        {/* Servis bölgeleri */}
        <div className="mt-8 md:mt-10 text-center">
          <p className="text-[10px] md:text-xs text-white/50 uppercase tracking-widest mb-3">
            Servis bölgelerimiz — tıkla incele
          </p>
          <div className="flex flex-wrap justify-center gap-1.5 max-w-3xl mx-auto">
            {CONTACT.delivery.serviceAreas.map((area) => {
              const slug = area.toLowerCase()
                .replace(/İ/g, "i").replace(/Ş/g, "s").replace(/Ğ/g, "g")
                .replace(/Ü/g, "u").replace(/Ö/g, "o").replace(/Ç/g, "c")
                .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
              return (
                <a
                  key={area}
                  href={`/bolge/${slug}`}
                  className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] md:text-xs text-white/70 hover:bg-pink hover:border-pink hover:text-white transition-colors"
                >
                  {area}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
