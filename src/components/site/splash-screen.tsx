"use client";

import * as React from "react";

const SPLASH_KEY = "demos-splash-v3";

/**
 * Cinematic Splash Screen — pizza arka planı + alev + duman animasyonu
 * Uygulama ikonu gösterilmez, sadece marka adı + iştah kabartıcı görsel
 */
export function Splashscreen() {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    const shown = sessionStorage.getItem(SPLASH_KEY);
    if (!shown) {
      setShow(true);
      sessionStorage.setItem(SPLASH_KEY, "true");
      const t = setTimeout(() => setShow(false), 2800);
      return () => clearTimeout(t);
    }
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden flex flex-col items-center justify-center"
      style={{
        animation: "splash-fade-out 0.5s ease 2.3s forwards",
        background: "linear-gradient(180deg, #1a0a00 0%, #0d0500 50%, #000000 100%)",
      }}
    >
      {/* Pizza arka plan görseli — blur'lu, koyu */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "url(/images/hero-pizza-main.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(8px) brightness(0.5)",
          transform: "scale(1.1)",
        }}
      />

      {/* Duman partikülleri — yükselen */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${10 + i * 11}%`,
              bottom: "10%",
              width: `${30 + i * 8}px`,
              height: `${30 + i * 8}px`,
              background: "radial-gradient(circle, rgba(255,200,100,0.15) 0%, transparent 70%)",
              animation: `smoke-rise ${3 + i * 0.3}s ease-in-out ${i * 0.4}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Alev efektleri — alttan yükselen */}
      <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute bottom-0"
            style={{
              left: `${(i * 8.5) - 2}%`,
              width: `${60 + (i % 3) * 20}px`,
              height: `${80 + (i % 4) * 30}px`,
              background: `radial-gradient(ellipse at bottom, rgba(255,${100 + (i % 3) * 50},0,0.6) 0%, rgba(255,60,0,0.3) 40%, transparent 80%)`,
              borderRadius: "50% 50% 30% 30%",
              filter: "blur(4px)",
              animation: `flame-dance ${0.8 + (i % 3) * 0.2}s ease-in-out ${i * 0.05}s infinite alternate`,
              transformOrigin: "bottom center",
            }}
          />
        ))}
      </div>

      {/* Ana içerik — marka adı + slogan */}
      <div
        className="relative z-10 flex flex-col items-center"
        style={{ animation: "splash-scale-in 0.7s cubic-bezier(0.22,1,0.36,1) forwards" }}
      >
        {/* Parıldayan marka adı */}
        <h1
          className="font-display text-4xl md:text-6xl font-black text-center tracking-tight"
          style={{
            background: "linear-gradient(180deg, #FFE082 0%, #FFC400 40%, #FF8F00 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 0 20px rgba(255,180,0,0.5))",
            animation: "glow-pulse 2s ease-in-out infinite",
          }}
        >
          DEMOS PIZZA
        </h1>

        {/* Alt çizgi — alev renkli */}
        <div
          className="h-0.5 w-32 mt-3 rounded-full"
          style={{
            background: "linear-gradient(90deg, transparent, #FF6B00, #FFC400, #FF6B00, transparent)",
            animation: "line-shimmer 2s ease-in-out infinite",
          }}
        />

        {/* Slogan */}
        <p
          className="text-sm md:text-base text-orange-200/80 mt-4 font-medium tracking-wide"
          style={{ animation: "splash-text-up 0.8s ease 0.4s forwards", opacity: 0 }}
        >
          Sıcacık pizzalar, sevdiklerinle
        </p>
      </div>

      {/* Alt yükleme çizgisi */}
      <div
        className="absolute bottom-16 w-48 h-1 bg-white/10 rounded-full overflow-hidden"
        style={{ animation: "splash-text-up 0.6s ease 0.6s forwards", opacity: 0 }}
      >
        <div
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, #FF6B00, #FFC400)",
            animation: "splash-progress 2.2s ease forwards",
          }}
        />
      </div>

      <style>{`
        @keyframes splash-scale-in {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes splash-text-up {
          from { transform: translateY(15px); opacity: 0; }
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
        @keyframes glow-pulse {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(255,180,0,0.5)); }
          50% { filter: drop-shadow(0 0 35px rgba(255,180,0,0.8)); }
        }
        @keyframes line-shimmer {
          0%, 100% { opacity: 0.6; transform: scaleX(1); }
          50% { opacity: 1; transform: scaleX(1.1); }
        }
        @keyframes smoke-rise {
          0% {
            transform: translateY(0) scale(0.5);
            opacity: 0;
          }
          20% {
            opacity: 0.6;
          }
          80% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-300px) scale(1.5);
            opacity: 0;
          }
        }
        @keyframes flame-dance {
          0% {
            transform: scaleY(1) scaleX(1) translateY(0);
            opacity: 0.8;
          }
          100% {
            transform: scaleY(1.3) scaleX(0.9) translateY(-5px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
