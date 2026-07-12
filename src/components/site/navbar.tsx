"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, ShoppingBag, Phone, MapPin, X, Flame, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NAV_LINKS, CONTACT, BRAND } from "@/lib/constants";
import { useCart } from "./cart-context";

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { toggleCart, itemCount } = useCart();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Top utility strip */}
      <div className="hidden md:block bg-charcoal text-cream text-xs">
        <div className="container mx-auto flex items-center justify-between px-6 py-2">
          <div className="flex items-center gap-5">
            <a href={CONTACT.phoneHref} className="flex items-center gap-1.5 hover:text-saffron transition-colors">
              <Phone className="h-3 w-3" />
              <span className="font-mono">{CONTACT.phone}</span>
            </a>
            <span className="flex items-center gap-1.5 text-cream/70">
              <MapPin className="h-3 w-3" />
              {CONTACT.address.district} · {CONTACT.address.city}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {CONTACT.promo.active && (
              <span className="flex items-center gap-1.5 text-saffron font-semibold">
                <Flame className="h-3 w-3" />
                {CONTACT.promo.text}
              </span>
            )}
            <span className="text-cream/40">·</span>
            <span className="flex items-center gap-1.5 text-cream/70">
              <Clock className="h-3 w-3" />
              Açık · {CONTACT.delivery.deliveryTime} teslimat
            </span>
          </div>
        </div>
      </div>

      <header
        className={`sticky top-0 z-40 w-full border-b transition-colors ${
          scrolled
            ? "bg-cream border-charcoal/10 shadow-sm"
            : "bg-cream border-transparent"
        }`}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group" aria-label="Demos Pizza ana sayfa">
              <img
                src="/logo.svg"
                alt={`${BRAND.name}`}
                className="h-9 md:h-11 w-auto"
              />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-0.5">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-3.5 py-2 text-sm font-medium text-charcoal/80 hover:text-ember transition-colors rounded-md hover:bg-ember/5"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1.5 md:gap-2">
              <a
                href={CONTACT.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:block"
              >
                <Button variant="ghost" size="sm" className="text-charcoal hover:text-basil hover:bg-basil/5">
                  WhatsApp
                </Button>
              </a>
              <a href="#menu" className="hidden sm:block">
                <Button
                  size="sm"
                  className="bg-ember hover:bg-ember/90 text-cream font-semibold shadow-sm"
                >
                  Sipariş Ver
                </Button>
              </a>
              <Button
                onClick={toggleCart}
                size="icon"
                variant="outline"
                className="relative border-charcoal/15 text-charcoal hover:bg-ember hover:text-cream hover:border-ember"
                aria-label={`Sepetim, ${itemCount} ürün`}
              >
                <ShoppingBag className="h-4 w-4" />
                {itemCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 flex items-center justify-center bg-saffron text-charcoal text-[10px] font-bold rounded-full border-2 border-cream"
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
                className="md:hidden text-charcoal"
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
            className="absolute inset-0 bg-charcoal/50"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-0 h-full w-72 max-w-[85vw] bg-cream shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-charcoal/10">
              <img src="/logo.svg" alt="Demos Pizza" className="h-8" />
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
                  className="px-4 py-3 text-base font-medium text-charcoal hover:bg-ember/5 hover:text-ember rounded-lg transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="mt-auto p-4 border-t border-charcoal/10 space-y-2">
              <a href={CONTACT.phoneHref}>
                <Button variant="outline" className="w-full" size="sm">
                  <Phone className="h-4 w-4 mr-2" />
                  <span className="font-mono">{CONTACT.phone}</span>
                </Button>
              </a>
              <a href="#menu" onClick={() => setMobileOpen(false)}>
                <Button className="w-full bg-ember hover:bg-ember/90 text-cream">
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
