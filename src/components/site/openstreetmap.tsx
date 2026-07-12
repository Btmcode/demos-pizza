"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { MapPin, Navigation, ExternalLink } from "lucide-react";
import { CONTACT } from "@/lib/constants";

// Leaflet'i SSR'siz yükle — Next.js dynamic import
const MapClient = dynamic(() => import("./map-client"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-mist/20">
      <div className="text-center">
        <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-pink/10 flex items-center justify-center animate-pulse">
          <MapPin className="h-5 w-5 text-pink" />
        </div>
        <div className="text-ink/40 text-sm">Harita yükleniyor...</div>
      </div>
    </div>
  ),
});

export function OpenStreetMap() {
  return (
    <div className="rounded-2xl overflow-hidden border border-ink/8 shadow-premium h-80 md:h-96 relative bg-mist/20">
      <MapClient />

      {/* Address overlay — üstte, glass */}
      <div className="absolute top-3 left-3 z-[1000] glass rounded-xl p-3 max-w-[240px] pointer-events-none">
        <div className="flex items-start gap-2">
          <div className="w-8 h-8 rounded-full bg-pink flex items-center justify-center shrink-0">
            <MapPin className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-ink text-sm">Demos Pizza</div>
            <div className="text-[11px] text-ink/60 mt-0.5 leading-snug">{CONTACT.address.full}</div>
          </div>
        </div>
      </div>

      {/* "Konumumdan Tarif" butonu — sağ üstte */}
      <a
        href={`https://www.openstreetmap.org/directions?to=41.0096%2C28.9471`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-3 right-3 z-[1000] glass rounded-xl p-2.5 hover:bg-pink transition-colors group flex items-center gap-1.5"
        aria-label="Yol tarifi al"
        title="Yol tarifi al"
      >
        <Navigation className="h-4 w-4 text-pink group-hover:text-white" />
        <span className="text-xs font-medium text-ink group-hover:text-white hidden sm:inline">Yol Tarifi</span>
      </a>

      {/* "OSM'de Aç" butonu — sağ altta */}
      <a
        href="https://www.openstreetmap.org/?mlat=41.0096&mlon=28.9471#map=17/41.0096/28.9471"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-3 right-3 z-[1000] glass rounded-lg px-2.5 py-1.5 hover:bg-ink hover:text-white transition-colors group flex items-center gap-1"
        aria-label="OpenStreetMap'de aç"
      >
        <ExternalLink className="h-3 w-3 text-ink/60 group-hover:text-white" />
        <span className="text-[10px] font-medium text-ink/60 group-hover:text-white">Büyük Harita</span>
      </a>
    </div>
  );
}
