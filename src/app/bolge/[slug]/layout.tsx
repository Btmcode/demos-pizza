"use client";

import * as React from "react";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { CartDrawer } from "@/components/site/cart-drawer";
import { CartProvider } from "@/components/site/cart-context";
import { CookieBanner } from "@/components/site/cookie-banner";
import { FloatingActions } from "@/components/site/floating-actions";
import { MobileBottomBar, FloatingCallButton } from "@/components/site/mobile-bottom-bar";

/**
 * /bolge/[slug] sayfası layout — Navbar, CartDrawer, MobileBottomBar ile.
 */
export default function BolgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-paper">
        <Navbar />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <Footer />
        <CartDrawer />
        <CookieBanner />
        <FloatingActions />
        <MobileBottomBar />
        <FloatingCallButton />
      </div>
    </CartProvider>
  );
}
