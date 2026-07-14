"use client";

import * as React from "react";

const SPLASH_KEY = "demos-splash-v4";

/**
 * Splash Screen — Minimal, modern (Uber/e-Devlet tarzı)
 * - Siyah arka plan
 * - Dönen çok renkli halka (loading spinner)
 * - Merkezde pizza ikonu
 * - Altında marka adı + slogan
 * - Alt ilerleme çubuğu
 */
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
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center"
      style={{ animation: "splash-fade-out 0.4s ease 2.1s forwards" }}
    >
      {/* Ana konteyner — dönen halka + merkez ikon */}
      <div
        className="relative flex flex-col items-center"
        style={{ animation: "splash-scale-in 0.5s cubic-bezier(0.22,1,0.36,1) forwards" }}
      >
        {/* Dönen halka — çok renkli segmentler */}
        <div className="relative w-28 h-28 mb-6">
          {/* Halka 1 — sarı segment (dönen) */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "conic-gradient(from 0deg, #FFC400 0deg, #FFC400 90deg, transparent 90deg, transparent 360deg)",
              animation: "splash-spin 1.2s linear infinite",
              maskImage: "radial-gradient(circle, transparent 60%, black 62%)",
              WebkitMaskImage: "radial-gradient(circle, transparent 60%, black 62%)",
            }}
          />
          {/* Halka 2 — pembe segment (ters yönde) */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "conic-gradient(from 180deg, #FF2D8D 0deg, #FF2D8D 90deg, transparent 90deg, transparent 360deg)",
              animation: "splash-spin 1.5s linear infinite reverse",
              maskImage: "radial-gradient(circle, transparent 60%, black 62%)",
              WebkitMaskImage: "radial-gradient(circle, transparent 60%, black 62%)",
            }}
          />
          {/* Halka 3 — turuncu segment (farklı hızda) */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "conic-gradient(from 270deg, #FF6B00 0deg, #FF6B00 60deg, transparent 60deg, transparent 360deg)",
              animation: "splash-spin 1s linear infinite",
              maskImage: "radial-gradient(circle, transparent 60%, black 62%)",
              WebkitMaskImage: "radial-gradient(circle, transparent 60%, black 62%)",
            }}
          />

          {/* Merkez daire — siyah, içinde pizza ikonu */}
          <div className="absolute inset-6 rounded-full bg-black flex items-center justify-center">
            {/* Pizza dilimi SVG — minimal, ikonik */}
            <svg
              width="48"
              height="48"
              viewBox="0 0 64 64"
              fill="none"
              style={{ animation: "splash-pulse 1.5s ease-in-out infinite" }}
            >
              {/* Pizza kabuğu — sarı */}
              <path
                d="M32 8 L 52 48 L 12 48 Z"
                fill="#FFC400"
                stroke="#FFB300"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              {/* Pizza içi — açık sarı */}
              <path
                d="M32 14 L 47 44 L 17 44 Z"
                fill="#FFE082"
              />
              {/* Pepperoni noktaları — pembe */}
              <circle cx="27" cy="32" r="3" fill="#FF2D8D" />
              <circle cx="37" cy="36" r="2.5" fill="#FF2D8D" />
              <circle cx="32" cy="26" r="2" fill="#FF2D8D" />
              {/* Bazı yeşil fesleğen noktaları */}
              <circle cx="30" cy="40" r="1.5" fill="#16A34A" />
              <circle cx="36" cy="30" r="1" fill="#16A34A" />
            </svg>
          </div>
        </div>

        {/* Marka adı */}
        <h2
          className="font-display text-2xl font-bold text-white text-center tracking-tight"
          style={{ animation: "splash-text-up 0.6s ease 0.3s forwards", opacity: 0 }}
        >
          Demos Pizza
        </h2>

        {/* Slogan */}
        <p
          className="text-sm text-yellow mt-1.5 text-center font-medium"
          style={{ animation: "splash-text-up 0.6s ease 0.5s forwards", opacity: 0 }}
        >
          Sıcacık pizzalar, sevdiklerinle
        </p>
      </div>

      {/* Alt ilerleme çubuğu */}
      <div
        className="absolute bottom-20 w-44 h-1 bg-white/10 rounded-full overflow-hidden"
        style={{ animation: "splash-text-up 0.5s ease 0.7s forwards", opacity: 0 }}
      >
        <div
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, #FFC400, #FF2D8D)",
            animation: "splash-progress 1.8s ease forwards",
          }}
        />
      </div>

      <style>{`
        @keyframes splash-scale-in {
          from { transform: scale(0.85); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
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
        @keyframes splash-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes splash-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}
