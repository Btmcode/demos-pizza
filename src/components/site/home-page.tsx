"use client";

import * as React from "react";
import { Navbar } from "@/components/site/navbar";
import { Hero } from "@/components/site/hero";
import { ToppingsMarquee } from "@/components/site/toppings-marquee";
import { MenuSection } from "@/components/site/menu-section";
import { StoneOven } from "@/components/site/stone-oven";
import { Stats } from "@/components/site/stats";
import { About } from "@/components/site/about";
import { Gallery } from "@/components/site/gallery";
import { Contact } from "@/components/site/contact";
import { Footer } from "@/components/site/footer";
import { CartDrawer } from "@/components/site/cart-drawer";
import { CartProvider } from "@/components/site/cart-context";
import { CookieBanner } from "@/components/site/cookie-banner";
import { AIRecommendation } from "@/components/site/ai-recommendation";
import { AIChatAssistant } from "@/components/site/ai-chat-assistant";
import { FloatingActions } from "@/components/site/floating-actions";
import { MobileBottomBar, FloatingCallButton } from "@/components/site/mobile-bottom-bar";

function useScrollReveal() {
  React.useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function ScrollRevealer() {
  useScrollReveal();
  return null;
}

function useServiceWorker() {
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
}

function SWRegister() {
  useServiceWorker();
  return null;
}

export function HomePage() {
  return (
    <CartProvider>
      <ScrollRevealer />
      <SWRegister />
      <div className="min-h-screen flex flex-col bg-paper">
        <Navbar />
        <main className="flex-1 pb-16 md:pb-0">
          <Hero />
          <ToppingsMarquee />
          <MenuSection />
          <AIRecommendation />
          <StoneOven />
          <Stats />
          <About />
          <Gallery />
          <Contact />
        </main>
        <Footer />
        <CartDrawer />
        <CookieBanner />
        <AIChatAssistant />
        <FloatingActions />
        {/* Mobil alt bar — Domino's tarzı */}
        <MobileBottomBar />
        <FloatingCallButton />
      </div>
    </CartProvider>
  );
}
