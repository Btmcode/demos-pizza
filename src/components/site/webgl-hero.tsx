"use client";

import * as React from "react";

/**
 * WebGL Hero Effect — canvas tabanlı premium animasyon
 * - Pizza görseli üstünde duman parçacıkları
 * - Altın/pembe ışık hüzmesi
 * - Scroll ile parallax
 * - Düşük GPU kullanımı (requestAnimationFrame)
 */
export function WebGLHero() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let particles: Particle[] = [];
    let scrollY = 0;

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      size: number;
      hue: number;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);
    };

    const spawn = () => {
      const rect = container.getBoundingClientRect();
      // Duman, pizza görselinin ortasından yükselsin
      const centerX = rect.width * 0.7;
      const centerY = rect.height * 0.55;
      for (let i = 0; i < 2; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.3 + Math.random() * 0.4;
        particles.push({
          x: centerX + (Math.random() - 0.5) * 100,
          y: centerY + (Math.random() - 0.5) * 30,
          vx: Math.cos(angle) * speed * 0.3,
          vy: -0.5 - Math.random() * 0.5,
          life: 0,
          maxLife: 120 + Math.random() * 80,
          size: 20 + Math.random() * 30,
          // Altın/sıcak renk tonları
          hue: 30 + Math.random() * 20,
        });
      }
    };

    const animate = () => {
      const rect = container.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      if (particles.length < 35) spawn();

      particles = particles.filter((p) => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx += (Math.random() - 0.5) * 0.04;
        p.size += 0.2;

        const alpha = Math.sin((p.life / p.maxLife) * Math.PI) * 0.12;
        if (alpha <= 0 || p.life >= p.maxLife) return false;

        // Duman — sıcak altın/pembe gradient
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gradient.addColorStop(0, `hsla(${p.hue}, 80%, 70%, ${alpha})`);
        gradient.addColorStop(0.5, `hsla(${p.hue + 10}, 70%, 60%, ${alpha * 0.5})`);
        gradient.addColorStop(1, `hsla(${p.hue}, 60%, 50%, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });

      raf = requestAnimationFrame(animate);
    };

    const onScroll = () => {
      scrollY = window.scrollY;
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
