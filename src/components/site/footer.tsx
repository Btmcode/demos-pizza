"use client";

import Link from "next/link";
import { Instagram, Facebook, MessageCircle, MapPin, Phone, Mail, Clock, Truck } from "lucide-react";
import { BRAND, CONTACT, NAV_LINKS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-ink text-white/80">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="bg-ink rounded-xl px-3 py-2 inline-block mb-4">
              <img src="/logo.webp" alt="Demos Pizza" className="h-[56px] md:h-[72px] w-auto" />
            </div>
            <p className="text-sm text-white/65 leading-relaxed max-w-xs">
              {BRAND.description}
            </p>
            <div className="flex gap-2 mt-4">
              <a href={CONTACT.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 rounded-full bg-white/5 hover:bg-pink flex items-center justify-center transition-colors btn-premium">
                <Instagram className="h-4 w-4" />
              </a>
              <a href={CONTACT.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 rounded-full bg-white/5 hover:bg-pink flex items-center justify-center transition-colors btn-premium">
                <Facebook className="h-4 w-4" />
              </a>
              <a href={CONTACT.whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#25D366] flex items-center justify-center transition-colors btn-premium">
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
            {CONTACT.promo.active && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink/15 border border-pink/30 text-pink text-xs font-bold">
                🔥 {CONTACT.promo.text}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-display font-bold text-white mb-3 text-sm">Hızlı Erişim</h3>
            <ul className="space-y-2 text-sm">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="hover:text-yellow transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Service areas */}
          <div>
            <h3 className="font-display font-bold text-white mb-3 text-sm">Servis Bölgeleri</h3>
            <ul className="space-y-1.5 text-xs text-white/65">
              {CONTACT.delivery.serviceAreas.slice(0, 8).map((area) => {
                const slug = area.toLowerCase()
                  .replace(/İ/g, "i").replace(/Ş/g, "s").replace(/Ğ/g, "g")
                  .replace(/Ü/g, "u").replace(/Ö/g, "o").replace(/Ç/g, "c")
                  .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
                return (
                  <li key={area}>
                    <a href={`/bolge/${slug}`} className="flex items-center gap-1 hover:text-yellow transition-colors">
                      <MapPin className="h-3 w-3 text-yellow shrink-0" />
                      {area}
                    </a>
                  </li>
                );
              })}
              <li className="text-[10px] text-white/40 pt-1">+ {CONTACT.delivery.serviceAreas.length - 8} bölge daha</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-bold text-white mb-3 text-sm">İletişim</h3>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-yellow shrink-0 mt-0.5" />
                <span>{CONTACT.address.full}</span>
              </li>
              <li>
                <a href={CONTACT.phoneHref} className="flex items-center gap-2 hover:text-yellow transition-colors">
                  <Phone className="h-4 w-4 text-yellow" />
                  <span className="font-mono">{CONTACT.phone}</span>
                </a>
              </li>
              <li>
                <a href={CONTACT.emailHref} className="flex items-center gap-2 hover:text-yellow transition-colors">
                  <Mail className="h-4 w-4 text-yellow" />
                  <span className="break-all">{CONTACT.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Truck className="h-4 w-4 text-yellow shrink-0 mt-0.5" />
                <span>Min. {CONTACT.delivery.minOrder} ₺ · {CONTACT.delivery.deliveryTime}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Hours */}
        <div className="mt-10 pt-6 border-t border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-yellow" />
            <h3 className="font-display font-bold text-white text-sm">Çalışma Saatleri</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
            {CONTACT.hours.map((h) => (
              <div key={h.day} className="bg-white/5 rounded-lg p-2.5">
                <div className="text-white/60">{h.day.slice(0, 3)}</div>
                <div className="text-white font-mono text-[11px] mt-0.5">
                  {h.open}-{h.close}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legal */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <div>
            © {new Date().getFullYear()} {BRAND.legalName} · Tüm hakları saklıdır
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <Link href="/kvkk" className="hover:text-yellow">KVKK</Link>
            <span className="text-white/20">·</span>
            <Link href="/gizlilik" className="hover:text-yellow">Gizlilik</Link>
            <span className="text-white/20">·</span>
            <Link href="/cerez" className="hover:text-yellow">Çerez</Link>
            <span className="text-white/20">·</span>
            <Link href="/teslimat" className="hover:text-yellow">Teslimat</Link>
            <span className="text-white/20">·</span>
            <Link href="/iade" className="hover:text-yellow">İade</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
