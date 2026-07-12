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
import { Reservation } from "@/components/site/reservation";
import { Contact } from "@/components/site/contact";
import { Footer } from "@/components/site/footer";
import { CartDrawer } from "@/components/site/cart-drawer";
import { CartProvider } from "@/components/site/cart-context";

/** Scroll reveal hook */
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

export function HomePage() {
  return (
    <CartProvider>
      <ScrollRevealer />
      <div className="min-h-screen flex flex-col bg-cream">
        <Navbar />
        <main className="flex-1">
          <Hero />
          <ToppingsMarquee />
          <MenuSection />
          <StoneOven />
          <Stats />
          <About />
          <Gallery />
          <Reservation />
          <Contact />
        </main>
        <Footer />
        <CartDrawer />
      </div>
    </CartProvider>
  );
}
