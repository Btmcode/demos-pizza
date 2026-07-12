"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, ShoppingBag, Phone, MapPin, X, Flame, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAV_LINKS, CONTACT, BRAND } from "@/lib/constants";
import { useCart } from "./cart-context";

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { toggleCart, itemCount, totalCents } = useCart();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Top utility strip */}
      <div className="hidden md:block bg-ink text-white text-xs">
        <div className="container mx-auto flex items-center justify-between px-6 py-2">
          <div className="flex items-center gap-5">
            <a href={CONTACT.phoneHref} className="flex items-center gap-1.5 hover:text-yellow transition-colors">
              <Phone className="h-3 w-3" />
              <span className="font-mono">{CONTACT.phone}</span>
            </a>
            <span className="flex items-center gap-1.5 text-white/60">
              <MapPin className="h-3 w-3" />
              {CONTACT.address.district} · {CONTACT.address.city}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {CONTACT.promo.active && (
              <span className="flex items-center gap-1.5 text-yellow font-semibold">
                <Flame className="h-3 w-3" />
                {CONTACT.promo.text}
              </span>
            )}
            <span className="text-white/30">·</span>
            <span className="flex items-center gap-1.5 text-white/60">
              <Clock className="h-3 w-3" />
              Açık · {CONTACT.delivery.deliveryTime} teslimat
            </span>
          </div>
        </div>
      </div>

      <header
        className={`sticky top-0 z-40 w-full border-b transition-all duration-200 ${
          scrolled
            ? "glass border-ink/10 shadow-premium"
            : "bg-paper border-transparent"
        }`}
      >
        <div className="container mx-auto px-3 md:px-6">
          <div className="flex items-center justify-between h-14 md:h-20">
            <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="Demos Pizza ana sayfa">
              {/* Logo — koyu arka planda, büyük ve net okunur */}
              <div className="bg-ink rounded-xl px-2 py-1 md:px-3.5 md:py-2.5 shadow-premium flex items-center">
                <img
                  src="/logo.png"
                  alt={`${BRAND.name}`}
                  className="h-9 md:h-14 w-auto"
                />
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-0.5">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-3.5 py-2 text-sm font-medium text-ink/70 hover:text-pink transition-colors rounded-lg hover:bg-pink/5"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-1.5 md:gap-2">
              <a
                href={CONTACT.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:block"
              >
                <Button variant="ghost" size="sm" className="text-ink hover:text-pink hover:bg-pink/5">
                  WhatsApp
                </Button>
              </a>
              <a href="#menu" className="hidden md:block">
                <Button
                  size="sm"
                  className="bg-pink hover:bg-pink-hover text-white font-semibold shadow-pink-glow btn-premium"
                >
                  Sipariş Ver
                </Button>
              </a>
              {/* Sepet — mobilde büyük, belirgin */}
              <Button
                onClick={toggleCart}
                size="icon"
                variant="outline"
                className="relative border-ink/15 text-ink hover:bg-pink hover:text-white hover:border-pink btn-premium h-10 w-10 md:h-9 md:w-9"
                aria-label={`Sepetim, ${itemCount} ürün`}
              >
                <ShoppingBag className="h-5 w-5 md:h-4 md:w-4" />
                {itemCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 flex items-center justify-center bg-yellow text-ink text-[10px] font-bold rounded-full border-2 border-white"
                    aria-hidden="true"
                  >
                    {itemCount}
                  </span>
                )}
              </Button>
              <Button
                onClick={() => setMobileOpen(true)}
                size="icon"
                variant="ghost"
                className="md:hidden text-ink"
                aria-label="Menüyü aç"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-ink/50"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-0 h-full w-72 max-w-[85vw] bg-paper shadow-premium-lg flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-ink/10">
              <img src="/logo.png" alt="Demos Pizza" className="h-8" />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setMobileOpen(false)}
                aria-label="Kapat"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex flex-col p-3 gap-0.5">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-base font-medium text-ink hover:bg-pink/5 hover:text-pink rounded-lg transition-colors flex items-center justify-between"
                >
                  {link.label}
                  <ChevronRight className="h-4 w-4 opacity-30" />
                </a>
              ))}
            </nav>
            <div className="mt-auto p-4 border-t border-ink/10 space-y-2">
              <a href={CONTACT.phoneHref}>
                <Button variant="outline" className="w-full" size="sm">
                  <Phone className="h-4 w-4 mr-2" />
                  <span className="font-mono">{CONTACT.phone}</span>
                </Button>
              </a>
              <a href="#menu" onClick={() => setMobileOpen(false)}>
                <Button className="w-full bg-pink hover:bg-pink-hover text-white shadow-pink-glow">
                  Sipariş Ver
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
