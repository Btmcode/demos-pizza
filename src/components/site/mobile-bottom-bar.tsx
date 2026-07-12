"use client";

import * as React from "react";
import { Phone, MessageCircle, ShoppingBag, Home, Menu as MenuIcon, Truck } from "lucide-react";
import { CONTACT } from "@/lib/constants";
import { useCart } from "./cart-context";

/**
 * Mobile Bottom Bar — Domino's tarzı
 * Sadece mobil cihazlarda görünür (md:hidden)
 *
 * 5 ana buton:
 * 1. Ana Sayfa
 * 2. Menü
 * 3. Sipariş Ver (orta, vurgulu)
 * 4. Sepet (badge ile)
 * 5. WhatsApp
 */
export function MobileBottomBar() {
  const { itemCount, toggleCart } = useCart();
  const [active, setActive] = React.useState("home");

  React.useEffect(() => {
    const sections = ["anasayfa", "menu", "hakkimizda", "iletisim"];
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
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-ink border-t border-white/10"
      aria-label="Mobil navigasyon"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-5 h-16">
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

        {/* Sipariş Ver — orta, vurgulu */}
        <a
          href="#menu"
          className="flex flex-col items-center justify-center gap-0.5 text-white/60 hover:text-yellow transition-colors"
          aria-label="Sipariş Ver"
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center -mt-3 bg-pink shadow-pink-glow">
            <Truck className="h-5 w-5 text-white" />
          </div>
          <span className="text-[9px] font-medium">Sipariş</span>
        </a>

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
  );
}

/**
 * Floating Call Button — sağ alt, mobilde
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
