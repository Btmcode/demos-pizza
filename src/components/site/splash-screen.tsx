"use client";

import * as React from "react";

/**
 * Pizza splash screen — uygulama açılışında logo + dönen pizza animasyonu
 * 2 saniye sonra kaybolur
 */
const SPLASH_KEY = "demos-splash-shown";

export function Splashscreen() {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    // Sadece ilk açılışta göster (session bazlı)
    const shown = sessionStorage.getItem(SPLASH_KEY);
    if (!shown) {
      setShow(true);
      sessionStorage.setItem(SPLASH_KEY, "true");
      const t = setTimeout(() => setShow(false), 2000);
      return () => clearTimeout(t);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-ink flex flex-col items-center justify-center animate-in fade-out duration-500 delay-1500 fill-mode-both">
      {/* Dönen pizza animasyonu */}
      <div className="relative w-24 h-24 mb-6">
        {/* Dış halka — dönen */}
        <div
          className="absolute inset-0 rounded-full border-4 border-yellow/30 border-t-yellow"
          style={{ animation: "spin 1s linear infinite" }}
        />
        {/* Logo ortada */}
        <div className="absolute inset-3 rounded-full bg-ink flex items-center justify-center">
          <img src="/logo.webp" alt="Demos Pizza" className="h-10 w-auto" />
        </div>
      </div>

      {/* Slogan — samimi, aile gibi */}
      <h2 className="font-display text-xl md:text-2xl font-bold text-white">
        Demos Pizza
      </h2>
      <p className="text-sm text-yellow mt-1">
        Sıcacık pizzalar, sevdiklerinle
      </p>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
