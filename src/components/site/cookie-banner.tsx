"use client";

import * as React from "react";
import Link from "next/link";
import { Cookie, Shield, Check, ChevronRight } from "lucide-react";

const CONSENT_KEY = "demos-cookie-consent-v2";

export function CookieBanner() {
  const [show, setShow] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      if (!raw) {
        const t = setTimeout(() => setShow(true), 1000);
        return () => clearTimeout(t);
      }
    } catch {
      setShow(true);
    }
  }, []);

  const accept = (level: "all" | "essential") => {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({ level, timestamp: Date.now() }));
    } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    // Mobilde alt bar'ın (h-16) üstünde, desktop'ta altta
    // bottom-16 mobilde = 4rem (alt bar yüksekliği), bottom-0 desktop'ta
    <div className="fixed bottom-16 md:bottom-0 inset-x-0 z-50 animate-in slide-in-from-bottom-4 duration-500">
      {/* Mobil: tam genişlik kart, Desktop: ortalanmış */}
      <div className="mx-auto max-w-3xl m-3 md:m-4">
        <div className="bg-ink text-white rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
          {/* Header */}
          <div className="flex items-start gap-3 p-4 md:p-5">
            <div className="w-10 h-10 rounded-xl bg-yellow/15 flex items-center justify-center shrink-0">
              <Shield className="h-5 w-5 text-yellow" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-white text-sm md:text-base">
                Çerez Kullanımı
              </h3>
              <p className="text-[11px] md:text-xs text-white/60 leading-relaxed mt-1">
                Deneyimini iyileştirmek için çerezler kullanıyoruz. Tümünü kabul ederek{" "}
                <Link href="/cerez" className="text-yellow underline">Çerez Politikası</Link>'nı onaylarsın.
              </p>
            </div>
            <button
              onClick={() => accept("essential")}
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Kapat"
            >
              <ChevronRight className="h-4 w-4 rotate-90" />
            </button>
          </div>

          {/* Butonlar — kurumsal aralıklı */}
          <div className="flex gap-2 px-4 md:px-5 pb-4 md:pb-5">
            <button
              onClick={() => accept("all")}
              className="flex-1 h-11 rounded-xl bg-pink hover:bg-pink-hover text-white text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-pink-glow"
            >
              <Check className="h-4 w-4" />
              Tümünü Kabul Et
            </button>
            <button
              onClick={() => accept("essential")}
              className="flex-1 h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white/70 hover:text-white text-sm font-medium transition-colors"
            >
              Sadece Zorunlu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
