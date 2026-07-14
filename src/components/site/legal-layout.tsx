"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND, CONTACT } from "@/lib/constants";
import { useCurrentYear } from "@/hooks/use-hydration-safe";
import { CartProvider } from "@/components/site/cart-context";
import { CartDrawer } from "@/components/site/cart-drawer";
import { MobileBottomBar, FloatingCallButton } from "@/components/site/mobile-bottom-bar";

export function LegalLayout({
  title,
  subtitle,
  lastUpdated,
  children,
}: {
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  children: React.ReactNode;
}) {
  const year = useCurrentYear();
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-cream">
        {/* Header */}
        <header className="bg-charcoal text-cream py-8">
          <div className="container mx-auto px-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-cream hover:bg-cream/5 mb-3">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Ana sayfaya dön
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <img src="/logo.webp" alt="Demos Pizza" className="h-10 brightness-0 invert" />
              <div className="border-l border-cream/20 pl-3">
                <h1 className="font-display text-2xl md:text-3xl font-bold">{title}</h1>
                {subtitle && <p className="text-sm text-cream/65 mt-0.5">{subtitle}</p>}
              </div>
            </div>
            {lastUpdated && (
              <p className="text-[11px] text-cream/50 mt-3">Son güncelleme: {lastUpdated}</p>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 py-12 md:py-16 pb-24 md:pb-16">
          <div className="container mx-auto px-6 max-w-3xl">
            <article className="prose prose-stone max-w-none">{children}</article>
          </div>
        </main>

        {/* Footer mini */}
        <footer className="bg-charcoal text-cream/60 text-xs py-6 mt-auto">
          <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between gap-3">
            <div>
              © {year} {BRAND.legalName} · {CONTACT.address.full}
            </div>
            <div className="flex gap-3">
              <Link href="/kvkk" className="hover:text-saffron">KVKK</Link>
              <Link href="/gizlilik" className="hover:text-saffron">Gizlilik</Link>
              <Link href="/cerez" className="hover:text-saffron">Çerez Politikası</Link>
              <Link href="/teslimat" className="hover:text-saffron">Teslimat</Link>
              <Link href="/iade" className="hover:text-saffron">İade</Link>
            </div>
          </div>
        </footer>

        <CartDrawer />
        <MobileBottomBar />
        <FloatingCallButton />
      </div>
    </CartProvider>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="font-display text-xl md:text-2xl font-bold text-charcoal mt-8 mb-3 pb-2 border-b border-charcoal/10">
        {title}
      </h2>
      <div className="text-charcoal/80 leading-relaxed space-y-3 text-sm md:text-base">
        {children}
      </div>
    </section>
  );
}

export function LegalP({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>;
}

export function LegalUl({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc pl-6 space-y-1.5">{children}</ul>;
}
