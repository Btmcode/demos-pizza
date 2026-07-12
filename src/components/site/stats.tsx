"use client";

import { Clock, Truck, Wheat, MapPin } from "lucide-react";
import { STATS, CONTACT } from "@/lib/constants";

const ICONS = [Truck, Clock, Wheat, MapPin];

export function Stats() {
  return (
    <section className="bg-charcoal text-cream py-16 md:py-20 border-y border-saffron/15">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-saffron text-xs font-mono uppercase tracking-[0.3em]">
            {"// Demos Pizza ile"}
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-3">
            Hızlı, taze, <span className="text-saffron italic">kapınızda</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-saffron/15 rounded-2xl overflow-hidden">
          {STATS.map((s, i) => {
            const Icon = ICONS[i];
            return (
              <div
                key={i}
                className="bg-charcoal hover:bg-smoke transition-colors p-6 md:p-8 text-center group"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-ember/20 text-saffron group-hover:bg-ember/30 transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="font-display text-4xl md:text-5xl font-bold text-cream">
                  {s.value}
                  <span className="text-saffron text-3xl md:text-4xl">{s.suffix}</span>
                </div>
                <div className="text-sm font-semibold text-cream mt-2">{s.label}</div>
                <div className="text-xs text-cream/60 mt-1 leading-snug">{s.sub}</div>
                <div className="text-[10px] text-saffron/60 font-mono mt-3">0{i + 1}</div>
              </div>
            );
          })}
        </div>

        {/* Servis bölgeleri strip */}
        <div className="mt-10 text-center">
          <p className="text-xs text-cream/50 uppercase tracking-widest mb-3">
            Servis bölgelerimiz
          </p>
          <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
            {CONTACT.delivery.serviceAreas.map((area) => (
              <span
                key={area}
                className="px-3 py-1 rounded-full bg-cream/5 border border-cream/10 text-xs text-cream/70 hover:bg-ember/10 hover:border-ember/30 hover:text-saffron transition-colors"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
