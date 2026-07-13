"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, ShoppingBag, Phone, MapPin, X, Flame, Clock, Search, ChevronRight, Truck, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NAV_LINKS, CONTACT, BRAND } from "@/lib/constants";
import { useCart } from "./cart-context";
import { toast } from "sonner";

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const { toggleCart, itemCount } = useCart();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ESC ile search kapat
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setSearchOpen(false); setMobileOpen(false); }
      if (e.key === "/" && !searchOpen && !mobileOpen && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen, mobileOpen]);

  // Mobil geri tuşu — hamburger menü açıksa kapat, siteden çıkma
  React.useEffect(() => {
    if (!mobileOpen) return;
    window.history.pushState({ mobileMenuOpen: true }, "");
    const onPopState = () => setMobileOpen(false);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [mobileOpen]);

  // Mobil geri tuşu — search açıkken kapat, siteden çıkma
  React.useEffect(() => {
    if (!searchOpen) return;
    window.history.pushState({ searchOpen: true }, "");
    const onPopState = () => setSearchOpen(false);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [searchOpen]);

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

      {/* Ana navbar — Apple tarzı: cam efekt, minimal, zarif */}
      <header
        className={`sticky top-0 z-40 w-full border-b transition-all duration-300 ${
          scrolled
            ? "bg-ink/80 backdrop-blur-xl border-white/10"
            : "bg-ink border-white/5"
        }`}
      >
        <div className="container mx-auto px-3 md:px-6">
          <div className="flex items-center justify-between h-[80px] md:h-24 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0" aria-label="Demos Pizza ana sayfa">
              <img
                src="/logo.webp"
                alt={`${BRAND.name}`}
                className="h-[72px] md:h-[96px] w-auto"
              />
            </Link>

            {/* Desktop nav — Apple tarzı: orta hizalı, geniş aralıklı */}
            <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute inset-x-4 -bottom-0.5 h-0.5 bg-yellow scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
                </a>
              ))}
            </nav>

            {/* Right actions — Apple tarzı: ikonlar, sade */}
            <div className="flex items-center gap-1 md:gap-2 shrink-0">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
                aria-label="Ara"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Sepet */}
              <Button
                onClick={toggleCart}
                size="icon"
                className="relative bg-pink hover:bg-pink-hover text-white shadow-pink-glow btn-premium h-11 w-11 md:h-10 md:w-10 rounded-full"
                aria-label={`Sepetim, ${itemCount} ürün`}
              >
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center bg-yellow text-ink text-[10px] font-bold rounded-full border-2 border-ink"
                    aria-hidden="true"
                  >
                    {itemCount}
                  </span>
                )}
              </Button>

              {/* Mobile menu */}
              <Button
                onClick={() => setMobileOpen(true)}
                size="icon"
                variant="ghost"
                className="md:hidden text-white h-11 w-11"
                aria-label="Menüyü aç"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Search overlay — Apple tarzı: tam ekran cam efekt */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-ink/60 backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
          <div
            className="w-full max-w-2xl mx-4 bg-paper rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 p-4 border-b border-ink/8">
              <Search className="h-5 w-5 text-ink/40 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setSearchOpen(false);
                }}
                placeholder="Pizza veya malzeme ara..."
                className="flex-1 text-sm bg-transparent outline-none placeholder:text-ink/40"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="text-xs text-ink/50 hover:text-ink px-2 py-1 rounded-md hover:bg-ink/5"
              >
                ESC
              </button>
            </div>

            {/* Search results */}
            <div className="max-h-[50vh] overflow-y-auto custom-scroll">
              {searchQuery.trim().length > 1 ? (
                <SearchResults query={searchQuery} onSelect={() => setSearchOpen(false)} />
              ) : (
                <div className="p-8 text-center">
                  <p className="text-sm text-ink/50">Aramak istediğin pizza veya malzemeyi yaz</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {["Margherita", "Sucuklu", "Acı", "Vejetaryen", "Bol peynirli"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setSearchQuery(s)}
                        className="text-xs px-3 py-1.5 rounded-full bg-ink/5 text-ink/70 hover:bg-pink hover:text-white transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile drawer — Apple tarzı: slide-in, full height */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-ink shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <img src="/logo.webp" alt="Demos Pizza" className="h-14 w-auto" />
              <button
                onClick={() => setMobileOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Kapat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex flex-col p-4 gap-1 flex-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3.5 text-base font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-colors flex items-center justify-between"
                >
                  {link.label}
                  <ChevronRight className="h-4 w-4 opacity-30" />
                </a>
              ))}
            </nav>

            {/* Bottom actions — kurumsal aralıklı, marka renkleri */}
            <div className="p-5 border-t border-white/10 space-y-4">
              <a href={CONTACT.phoneHref} className="block">
                <div className="flex items-center gap-3.5 px-4 py-4 rounded-xl bg-yellow/10 border border-yellow/20 hover:bg-yellow/15 transition-colors">
                  <div className="w-11 h-11 rounded-full bg-yellow flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5 text-ink" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-yellow/60 uppercase tracking-wider font-medium">Hemen Ara</div>
                    <div className="text-base font-mono text-white truncate font-semibold">{CONTACT.phone}</div>
                  </div>
                </div>
              </a>
              <a href={CONTACT.whatsappHref} target="_blank" rel="noopener noreferrer" className="block">
                <div className="flex items-center gap-3.5 px-4 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="w-11 h-11 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-white/40 uppercase tracking-wider font-medium">WhatsApp</div>
                    <div className="text-base text-white truncate font-semibold">Sipariş & Destek</div>
                  </div>
                </div>
              </a>
              <a href="#menu" onClick={() => setMobileOpen(false)}>
                <Button className="w-full bg-pink hover:bg-pink-hover text-white shadow-pink-glow h-13 text-base font-semibold">
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

// ============================================================
// Search Results Component — API'den sonuç getir
// ============================================================
function SearchResults({ query, onSelect }: { query: string; onSelect: () => void }) {
  const [results, setResults] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/menu`, { cache: "no-store" });
        const data = await res.json();
        const items = data.items || [];
        const q = query.toLowerCase();
        const filtered = items.filter((item: any) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          (item.ingredients || []).some((ing: string) => ing.toLowerCase().includes(q)) ||
          (item.tags || []).some((tag: string) => tag.toLowerCase().includes(q))
        );
        setResults(filtered);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  if (loading) {
    return (
      <div className="p-4 space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-ink/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-ink/50">
        "{query}" için sonuç bulunamadı
      </div>
    );
  }

  return (
    <div className="p-2">
      {results.map((item) => (
        <a
          key={item.id}
          href={`/menu/${item.slug}`}
          onClick={onSelect}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-ink/5 transition-colors group"
        >
          {item.imageUrl && (
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-ink/5 shrink-0">
              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-ink text-sm">{item.name}</div>
            <div className="text-xs text-ink/50 truncate">{item.description}</div>
          </div>
          <div className="font-display font-bold text-pink text-sm shrink-0">
            {Math.round(item.priceCents / 100).toLocaleString("tr-TR")} ₺
          </div>
          <ChevronRight className="h-4 w-4 text-ink/20 group-hover:text-pink transition-colors shrink-0" />
        </a>
      ))}
    </div>
  );
}
