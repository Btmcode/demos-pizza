"use client";

import * as React from "react";
import { Navbar } from "@/components/site/navbar";
import { Hero } from "@/components/site/hero";
import { MenuSection } from "@/components/site/menu-section";
import { Campaigns } from "@/components/site/campaigns";
import { StoneOven } from "@/components/site/stone-oven";
import { Stats } from "@/components/site/stats";
import { About } from "@/components/site/about";
import { Contact } from "@/components/site/contact";
import { Footer } from "@/components/site/footer";
import { CartDrawer } from "@/components/site/cart-drawer";
import { CartProvider } from "@/components/site/cart-context";
import { CookieBanner } from "@/components/site/cookie-banner";
import { PWAInstallPrompt } from "@/components/site/pwa-install-prompt";
import { PushNotificationPrompt } from "@/components/site/push-notification-prompt";
import { Splashscreen } from "@/components/site/splash-screen";
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
    if (!("serviceWorker" in navigator)) return;

    // SW kaydet — update_found event'i ile auto-update
    navigator.serviceWorker.register("/sw.js").then((registration) => {
      // Yeni SW bulunduğunda — bekle, yükle, otomatik aktif et
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            // Yeni SW indirildi — hemen aktif et
            newWorker.postMessage({ type: "SKIP_WAITING" });
          }
        });
      });

      // Periyodik güncelle kontrolü (her 60 dk)
      setInterval(() => {
        registration.update().catch(() => {});
      }, 60 * 60 * 1000);
    }).catch(() => {});

    // SW değiştiğinde — sayfayı yenile (kullanıcı güncellemeyi hemen görür)
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    // SW'den mesaj gelirse (SW_UPDATED) — sayfayı yenile
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data?.type === "SW_UPDATED" && !refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
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
          <MenuSection />
          <Campaigns />
          <StoneOven />
          <Stats />
          <About />
          <Contact />
        </main>
        <Footer />
        <CartDrawer />
        <CookieBanner />
        <PWAInstallPrompt />
        <PushNotificationPrompt />
        <Splashscreen />
        <FloatingActions />
        <MobileBottomBar />
        <FloatingCallButton />
      </div>
    </CartProvider>
  );
}
