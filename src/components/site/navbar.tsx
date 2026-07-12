"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, ShoppingBag, Phone, MapPin, X, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NAV_LINKS, CONTACT, BRAND } from "@/lib/constants";
import { useCart } from "./cart-context";

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { toggleCart, itemCount } = useCart();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Top strip */}
      <div className="hidden md:block bg-charcoal text-cream/80 text-xs">
        <div className="container mx-auto flex items-center justify-between px-6 py-2">
          <div className="flex items-center gap-5">
            <a href={CONTACT.phoneHref} className="flex items-center gap-1.5 hover:text-saffron transition-colors">
              <Phone className="h-3 w-3" />
              {CONTACT.phone}
            </a>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(CONTACT.address.full)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-saffron transition-colors"
            >
              <MapPin className="h-3 w-3" />
              {CONTACT.address.full}
            </a>
          </div>
          <div className="flex items-center gap-3">
            {CONTACT.promo.active && (
              <span className="flex items-center gap-1 text-saffron font-semibold">
                <Flame className="h-3 w-3" />
                {CONTACT.promo.text}
              </span>
            )}
            <span className="text-cream/30">|</span>
            <span>Açık · {CONTACT.delivery.deliveryTime} teslimat</span>
          </div>
        </div>
      </div>

      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? "bg-cream/95 backdrop-blur-md shadow-lg shadow-charcoal/5 border-b border-ember/10"
            : "bg-cream/80 backdrop-blur-sm"
        }`}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="#anasayfa" className="flex items-center gap-3 group">
              <img
                src="/logo.svg"
                alt={`${BRAND.name} Logo`}
                className="h-10 md:h-12 w-auto group-hover:scale-105 transition-transform"
              />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-charcoal/80 hover:text-ember transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute inset-x-4 -bottom-0.5 h-0.5 bg-ember scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </a>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <a href={CONTACT.whatsappHref} target="_blank" rel="noopener noreferrer" className="hidden lg:block">
                <Button variant="ghost" size="sm" className="text-charcoal hover:text-basil">
                  WhatsApp
                </Button>
              </a>
              <a href="#menu">
                <Button
                  size="sm"
                  className="bg-ember hover:bg-ember/90 text-cream font-semibold"
                >
                  Sipariş Ver
                </Button>
              </a>
              <Button
                onClick={toggleCart}
                size="icon"
                variant="outline"
                className="relative border-ember/30 text-ember hover:bg-ember hover:text-cream"
                aria-label="Sepeti aç"
              >
                <ShoppingBag className="h-4 w-4" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 flex items-center justify-center bg-saffron text-charcoal text-[10px] font-bold border-2 border-cream">
                    {itemCount}
                  </Badge>
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
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-72 max-w-[85vw] bg-cream shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-ember/10">
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
            <nav className="flex flex-col p-4 gap-1">
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
            <div className="mt-auto p-4 border-t border-ember/10 space-y-2">
              <a href={CONTACT.phoneHref}>
                <Button variant="outline" className="w-full" size="sm">
                  <Phone className="h-4 w-4 mr-2" />
                  {CONTACT.phone}
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
