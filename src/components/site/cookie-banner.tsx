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
      // 6 ay sonra tekrar sor
      if (Date.now() - data.timestamp > 180 * ONE_DAY) {
        setShow(true);
      }
    } catch {
      setShow(true);
    }
  }, []);

  const accept = (level: "all" | "essential") => {
    const consent = {
      level,
      timestamp: Date.now(),
    };
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    } catch {}
    setShow(false);
    // Sadece "all" ise analitik/pazarlama script'leri yükle (ileride)
    if (level === "all" && typeof window !== "undefined") {
      // window.gtag && window.gtag('consent', 'update', { analytics_storage: 'granted' });
    }
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-50 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-charcoal text-cream rounded-2xl shadow-2xl border border-saffron/20 p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-saffron/15 text-saffron flex items-center justify-center shrink-0">
            <Cookie className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-cream text-base mb-1">
              Çerez Tercihleri
            </h3>
            <p className="text-xs text-cream/70 leading-relaxed">
              Web sitemizde deneyiminizi iyileştirmek için çerezler kullanıyoruz. Detaylı bilgi için
              {" "}<Link href="/cerez" className="text-saffron underline">Çerez Politikası</Link>'na bakın.
            </p>
          </div>
          <button
            onClick={() => accept("essential")}
            className="text-cream/40 hover:text-cream"
            aria-label="Kapat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => accept("all")}
            className="flex-1 bg-saffron hover:bg-saffron/90 text-charcoal text-sm font-semibold"
            size="sm"
          >
            Tümünü Kabul Et
          </Button>
          <Button
            onClick={() => accept("essential")}
            variant="outline"
            className="flex-1 border-cream/30 text-cream hover:bg-cream hover:text-charcoal text-sm"
            size="sm"
          >
            Sadece Zorunlu
          </Button>
        </div>
      </div>
    </div>
  );
}
