"use client";

import { Phone, MessageCircle, ShoppingBag } from "lucide-react";
import { CONTACT } from "@/lib/constants";
import { useCart } from "./cart-context";

/**
 * Floating conversion buttons — fixed bottom-right
 * - WhatsApp (green)
 * - Phone (pink)
 * - Cart count badge
 *
 * Note: AI Chat button is rendered separately by AIChatAssistant
 */
export function FloatingActions() {
  const { itemCount, toggleCart } = useCart();

  return (
    <>
      {/* Desktop floating buttons — stacked on right */}
      <div className="hidden md:flex fixed bottom-6 right-24 z-30 flex-col gap-2.5">
        <a
          href={CONTACT.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="group w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#1da851] text-white shadow-lg flex items-center justify-center btn-premium"
          aria-label="WhatsApp ile sipariş"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="absolute right-full mr-3 px-2.5 py-1 rounded-lg bg-ink text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            WhatsApp
          </span>
        </a>
        <a
          href={CONTACT.phoneHref}
          className="group w-12 h-12 rounded-full bg-pink hover:bg-pink-hover text-white shadow-pink-glow flex items-center justify-center btn-premium relative"
          aria-label="Telefon ile sipariş"
        >
          <Phone className="h-5 w-5" />
          <span className="absolute right-full mr-3 px-2.5 py-1 rounded-lg bg-ink text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Ara: {CONTACT.phone}
          </span>
        </a>
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 glass border-t border-ink/10 px-3 py-2.5 flex items-center gap-2">
        <a
          href={CONTACT.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="w-11 h-11 rounded-xl bg-[#25D366] flex items-center justify-center text-white shrink-0"
          aria-label="WhatsApp"
        >
          <MessageCircle className="h-5 w-5" />
        </a>
        <a
          href={CONTACT.phoneHref}
          className="w-11 h-11 rounded-xl bg-pink flex items-center justify-center text-white shrink-0"
          aria-label="Telefon"
        >
          <Phone className="h-5 w-5" />
        </a>
        <a
          href="#menu"
          className="flex-1 h-11 rounded-xl bg-ink text-white flex items-center justify-center gap-2 font-semibold text-sm btn-premium"
        >
          <ShoppingBag className="h-4 w-4" />
          Sipariş Ver
        </a>
        {itemCount > 0 && (
          <button
            onClick={toggleCart}
            className="relative w-11 h-11 rounded-xl bg-yellow text-ink flex items-center justify-center shrink-0"
            aria-label={`Sepet, ${itemCount} ürün`}
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center bg-pink text-white text-[10px] font-bold rounded-full border border-white">
              {itemCount}
            </span>
          </button>
        )}
      </div>
    </>
  );
}
