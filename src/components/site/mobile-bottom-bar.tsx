"use client";

import * as React from "react";
import { Phone, MessageCircle, ShoppingBag, Home, Sparkles, Menu as MenuIcon } from "lucide-react";
import { CONTACT } from "@/lib/constants";
import { useCart } from "./cart-context";

/**
 * Mobile Bottom Bar — Domino's tarzı
 * Sadece mobil cihazlarda görünür (md:hidden)
 *
 * 4 ana buton:
 * 1. Ana Sayfa (sol)
 * 2. Menü
 * 3. AI Öner (orta, vurgulu)
 * 4. Sepet (badge ile)
 *
 * + Floating WhatsApp (sağ alt)
 */
export function MobileBottomBar() {
  const { itemCount, toggleCart } = useCart();
  const [active, setActive] = React.useState("home");

  // Scroll pozisyonuna göre active state
  React.useEffect(() => {
    const sections = ["anasayfa", "menu", "ai-recommendation", "iletisim"];
    const onScroll = () => {
      const scrollY = window.scrollY + 100;
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollY && el.offsetTop + el.offsetHeight > scrollY) {
          setActive(id);
          return;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Bottom Bar — sabit alt */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-ink border-t border-white/10"
        aria-label="Mobil navigasyon"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid grid-cols-5 h-16">
          {/* Ana Sayfa */}
          <a
            href="#anasayfa"
            className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
              active === "anasayfa" ? "text-yellow" : "text-white/60"
            }`}
            aria-label="Ana sayfa"
          >
            <Home className="h-5 w-5" />
            <span className="text-[9px] font-medium">Anasayfa</span>
          </a>

          {/* Menü */}
          <a
            href="#menu"
            className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
              active === "menu" ? "text-yellow" : "text-white/60"
            }`}
            aria-label="Menü"
          >
            <MenuIcon className="h-5 w-5" />
            <span className="text-[9px] font-medium">Menü</span>
          </a>

          {/* AI Öner — orta, vurgulu (sarımı pembe) */}
          <a
            href="#ai-recommendation"
            className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
              active === "ai-recommendation" ? "text-yellow" : "text-white/60"
            }`}
            aria-label="AI Pizza Öner"
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center -mt-3 ${
              active === "ai-recommendation" ? "bg-yellow" : "bg-pink"
            } shadow-lg`}>
              <Sparkles className={`h-5 w-5 ${active === "ai-recommendation" ? "text-ink" : "text-white"}`} />
            </div>
            <span className="text-[9px] font-medium">AI Öner</span>
          </a>

          {/* Sepet */}
          <button
            onClick={toggleCart}
            className="flex flex-col items-center justify-center gap-0.5 text-white/60 hover:text-yellow transition-colors relative"
            aria-label={`Sepet, ${itemCount} ürün`}
          >
            <div className="relative">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 h-4 min-w-4 px-0.5 flex items-center justify-center bg-yellow text-ink text-[9px] font-bold rounded-full border border-ink">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="text-[9px] font-medium">Sepet</span>
          </button>

          {/* WhatsApp */}
          <a
            href={CONTACT.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-0.5 text-white/60 hover:text-[#25D366] transition-colors"
            aria-label="WhatsApp ile sipariş"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-[9px] font-medium">WhatsApp</span>
          </a>
        </div>
      </nav>
    </>
  );
}

/**
 * Floating Call Button — sağ alt, mobilde
 * (Bottom bar'ın üstünde)
 */
export function FloatingCallButton() {
  return (
    <a
      href={CONTACT.phoneHref}
      className="md:hidden fixed bottom-20 right-4 z-30 w-12 h-12 rounded-full bg-pink hover:bg-pink-hover text-white shadow-pink-glow flex items-center justify-center btn-premium"
      aria-label="Telefon ile sipariş"
    >
      <Phone className="h-5 w-5" />
      <span className="absolute inset-0 rounded-full bg-pink pulse-ring" />
    </a>
  );
}
