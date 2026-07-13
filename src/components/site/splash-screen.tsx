"use client";

import * as React from "react";

const SPLASH_KEY = "demos-splash-shown-v2";

export function Splashscreen() {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    const shown = sessionStorage.getItem(SPLASH_KEY);
    if (!shown) {
      setShow(true);
      sessionStorage.setItem(SPLASH_KEY, "true");
      const t = setTimeout(() => setShow(false), 2500);
      return () => clearTimeout(t);
    }
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-ink flex flex-col items-center justify-center"
      style={{ animation: "splash-fade-out 0.5s ease 2s forwards" }}
    >
      {/* Ana animasyon konteyneri */}
      <div className="relative flex flex-col items-center" style={{ animation: "splash-scale-in 0.6s cubic-bezier(0.22,1,0.36,1) forwards" }}>
        {/* Dönen dış halka — 2 katmanlı */}
        <div className="relative w-28 h-28 mb-5">
          {/* Dış halka 1 — sarı, hızlı */}
          <div
            className="absolute inset-0 rounded-full border-4 border-yellow/20 border-t-yellow"
            style={{ animation: "spin 0.8s linear infinite" }}
          />
          {/* Dış halka 2 — pembe, ters yönde */}
          <div
            className="absolute inset-2 rounded-full border-3 border-pink/20 border-b-pink"
            style={{ animation: "spin 1.2s linear infinite reverse" }}
          />
          {/* Logo ortada — pulse efekti */}
          <div
            className="absolute inset-4 rounded-full bg-ink flex items-center justify-center overflow-hidden"
            style={{ animation: "splash-pulse 1.5s ease-in-out infinite" }}
          >
            <img src="/logo.webp" alt="Demos Pizza" className="h-12 w-auto" />
          </div>
        </div>

        {/* Slogan — samimi */}
        <div style={{ animation: "splash-text-up 0.8s ease 0.3s forwards", opacity: 0 }}>
          <h2 className="font-display text-xl md:text-2xl font-bold text-white text-center">
            Demos Pizza
          </h2>
          <p className="text-sm text-yellow mt-1 text-center">
            Sıcacık pizzalar, sevdiklerinle
          </p>
        </div>
      </div>

      {/* Alt yükleme çizgisi */}
      <div className="absolute bottom-20 w-40 h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow rounded-full"
          style={{ animation: "splash-progress 2s ease forwards" }}
        />
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes splash-scale-in {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes splash-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes splash-text-up {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes splash-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes splash-fade-out {
          from { opacity: 1; }
          to { opacity: 0; visibility: hidden; }
        }
      `}</style>
    </div>
  );
}
