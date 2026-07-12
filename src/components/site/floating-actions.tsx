"use client";

import * as React from "react";
import { Phone, MessageCircle } from "lucide-react";
import { CONTACT } from "@/lib/constants";

/**
 * Desktop floating buttons — sadece desktop'ta (md:flex)
 * Mobilde MobileBottomBar kullanılıyor
 */
export function FloatingActions() {
  return (
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
        className="group w-12 h-12 rounded-full bg-pink hover:bg-pink-hover text-white shadow-pink-glow flex items-center justify-center btn-premium"
        aria-label="Telefon ile sipariş"
      >
        <Phone className="h-5 w-5" />
        <span className="absolute right-full mr-3 px-2.5 py-1 rounded-lg bg-ink text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Ara: {CONTACT.phone}
        </span>
      </a>
    </div>
  );
}
