"use client";

import * as React from "react";
import { ArrowRight, Star, Flame, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STATS, CONTACT, BRAND } from "@/lib/constants";
import { useGsapReveal } from "@/hooks/use-gsap";

/**
 * Premium Hero — Canvas duman + GSAP scroll animations + scroll parallax
 * - Scroll'a göre pizza görseli parallax ile hareket eder
 * - Canvas üstünde duman particle efekti (sıcak altın renkler)
 * - Scroll ilerledikçe pizza dilimi zoom-out efekti
 */
export function Hero() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const heroRef = React.useRef<HTMLElement>(null);
  const imgRef = React.useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = React.useState(0);

  // GSAP reveal için content ref
  const contentRef = useGsapReveal<HTMLDivElement>({ delay: 0.2, y: 30, duration: 1 });

  // Scroll parallax
  React.useEffect(() => {
    const onScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const heroHeight = heroRef.current.offsetHeight;
        // 0 (top) → 1 (scrolled past)
        const progress = Math.min(1, Math.max(0, -rect.top / heroHeight));
        setScrollY(progress);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Duman particle efekti
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let particles: Particle[] = [];

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      size: number;
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const spawn = () => {
      const rect = canvas.getBoundingClientRect();
      // Duman, pizza görselinin ortasından yükselsin
      const centerX = rect.width * 0.7;
      const centerY = rect.height * 0.55;
      for (let i = 0; i < 2; i++) {
        particles.push({
          x: centerX + (Math.random() - 0.5) * 120,
          y: centerY + (Math.random() - 0.5) * 40,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -0.4 - Math.random() * 0.6,
          life: 0,
          maxLife: 120 + Math.random() * 80,
          size: 30 + Math.random() * 40,
        });
      }
    };

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Spawn new particles
      if (particles.length < 40) spawn();

      // Update + draw particles
      particles = particles.filter((p) => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx += (Math.random() - 0.5) * 0.05;
        p.size += 0.3;

        const alpha = Math.sin((p.life / p.maxLife) * Math.PI) * 0.15;
        if (alpha <= 0 || p.life >= p.maxLife) return false;

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(255, 255, 255, ${alpha * 0.5})`);
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });

      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // Parallax transform — scroll'a göre pizza görseli hareket eder
  const imgTransform = `scale(${1 + scrollY * 0.15}) translateY(${scrollY * -30}px)`;
  const contentOpacity = Math.max(0, 1 - scrollY * 1.5);
  const contentTransform = `translateY(${scrollY * -50}px)`;

  return (
    <section
      id="anasayfa"
      ref={heroRef}
      className="relative min-h-[100svh] md:min-h-[100vh] flex items-center overflow-hidden bg-ink"
    >
      {/* Background — realistic pizza image with parallax */}
      <div
        ref={imgRef}
        className="absolute inset-0"
        style={{
          transform: imgTransform,
          transition: "transform 0.1s ease-out",
        }}
      >
        <img
          src="/images/hero-pizza-realistic.png"
          alt="Demos Pizza — taze, sıcak, dumanı tüten Margherita"
          className="h-full w-full object-cover"
          fetchPriority="high"
        />
        {/* Koyu overlay — alt kısımda daha koyu, üstte daha açık */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, rgba(17,17,17,0.4) 0%, rgba(17,17,17,0.6) 50%, rgba(17,17,17,0.9) 100%)",
          }}
        />
      </div>

      {/* Duman efekti — canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ width: "100%", height: "100%" }}
      />

      {/* Content — GSAP reveal animasyonu */}
      <div
        ref={contentRef}
        className="relative z-20 container mx-auto px-4 md:px-6 py-16 md:py-24"
        style={{
          opacity: contentOpacity,
          transform: contentTransform,
        }}
      >
        <div className="max-w-2xl">
          {/* Badge row */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {CONTACT.promo.active && (
              <Badge className="bg-pink text-white border-0 text-xs font-bold shadow-pink-glow">
                🔥 {CONTACT.promo.text}
              </Badge>
            )}
            <Badge
              variant="outline"
              className="glass-dark border-yellow/40 text-yellow text-xs font-semibold"
            >
              <Flame className="h-3 w-3 mr-1" />
              {BRAND.tagline}
            </Badge>
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[88px] font-bold text-white leading-[0.95] tracking-tight">
            Günlük Taze
            <br />
            <span className="text-gradient-gold">El Yapımı Hamur</span>
          </h1>

          {/* Sub */}
          <p className="mt-5 md:mt-6 text-base md:text-xl text-white/85 max-w-xl leading-relaxed">
            Haseki'de her gün taze hazırlanan hamurumuz, endüstriyel fırınımızda mükemmel
            kıvamında pişer. Kurye ile{" "}
            <span className="text-yellow font-semibold">sıcak ve taze</span> kapına gelsin.
          </p>

          {/* CTAs */}
          <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3">
            <a href="#menu">
              <Button
                size="lg"
                className="bg-pink hover:bg-pink-hover text-white text-base px-7 h-13 font-semibold shadow-pink-glow btn-premium"
              >
                Hemen Sipariş Ver
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <a href={CONTACT.whatsappHref} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                variant="outline"
                className="text-base px-7 h-13 glass-dark border-white/20 text-white hover:bg-white hover:text-ink btn-premium"
              >
                <Clock className="mr-2 h-4 w-4 text-yellow" />
                {CONTACT.delivery.deliveryTime} teslimat
              </Button>
            </a>
          </div>

          {/* Trust badges */}
          <div className="mt-8 md:mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center gap-1.5 text-white/80">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow text-yellow" />
                ))}
              </div>
              <span className="ml-1">350+ günlük sipariş</span>
            </div>
            <span className="text-white/30">·</span>
            <div className="flex items-center gap-1.5 text-white/80">
              <Clock className="h-4 w-4 text-yellow" />
              10:30 - 02:00 açık
            </div>
            <span className="text-white/30">·</span>
            <div className="flex items-center gap-1.5 text-white/80">
              <Flame className="h-4 w-4 text-yellow" />
              Helal sertifikalı
            </div>
          </div>

          {/* Mini stats */}
          <div className="mt-8 md:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 max-w-2xl">
            {STATS.map((s, i) => (
              <div key={i} className="border-l-2 border-yellow/60 pl-3 md:pl-4 py-1">
                <div className="font-display text-2xl md:text-3xl font-bold text-white leading-none">
                  {s.value}
                  <span className="text-yellow">{s.suffix}</span>
                </div>
                <div className="text-[11px] md:text-xs text-white/70 mt-1.5 leading-tight">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center text-white/40"
        style={{ opacity: Math.max(0, 1 - scrollY * 3) }}
      >
        <span className="text-[10px] uppercase tracking-widest mb-2">Keşfet</span>
        <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </section>
  );
}
