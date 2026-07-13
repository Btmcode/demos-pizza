"use client";

import * as React from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const CONSENT_KEY = "demos-cookie-consent-v1";
const ONE_DAY = 24 * 60 * 60 * 1000;

export function CookieBanner() {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      if (!raw) {
        setShow(true);
        return;
      }
      const data = JSON.parse(raw);
      if (Date.now() - data.timestamp > 180 * ONE_DAY) {
        setShow(true);
      }
    } catch {
      setShow(true);
    }
  }, []);

  const accept = (level: "all" | "essential") => {
    const consent = { level, timestamp: Date.now() };
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 md:bottom-4 md:left-6 md:right-auto md:max-w-md md:rounded-2xl animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-ink text-white md:rounded-2xl shadow-2xl border-t md:border border-white/10 p-4 md:p-5">
        {/* Header row — X butonu içeride, taşma yok */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-yellow/15 text-yellow flex items-center justify-center shrink-0">
            <Cookie className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="font-display font-bold text-white text-sm">
              Çerez Tercihleri
            </h3>
            <p className="text-[11px] text-white/60 leading-relaxed mt-0.5">
              Sitemizde deneyiminizi iyileştirmek için çerez kullanıyoruz.{" "}
              <Link href="/cerez" className="text-yellow underline">Detaylar</Link>.
            </p>
          </div>
          {/* X butonu — sağ üstte, taşma yok */}
          <button
            onClick={() => accept("essential")}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Kapat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Butonlar — çizgide bitiyor, boşluk yok */}
        <div className="flex gap-2">
          <Button
            onClick={() => accept("all")}
            className="flex-1 bg-pink hover:bg-pink-hover text-white text-xs font-semibold h-9"
            size="sm"
          >
            Tümünü Kabul Et
          </Button>
          <Button
            onClick={() => accept("essential")}
            variant="outline"
            className="flex-1 border-white/20 text-white/70 hover:bg-white/5 hover:text-white text-xs h-9"
            size="sm"
          >
            Sadece Zorunlu
          </Button>
        </div>
      </div>
    </div>
  );
}
