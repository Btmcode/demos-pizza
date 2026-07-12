"use client";

import Link from "next/link";
import { Instagram, Facebook, MessageCircle, MapPin, Phone, Mail, Clock, Truck } from "lucide-react";
import { BRAND, CONTACT, NAV_LINKS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-charcoal text-cream/80 mt-auto">
      <div className="container mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <img src="/logo.svg" alt="Demos Pizza" className="h-12 mb-4 brightness-0 invert" />
            <p className="text-sm text-cream/65 leading-relaxed max-w-xs">
              {BRAND.description}
            </p>
            <div className="flex gap-2 mt-5">
              <a href={CONTACT.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 rounded-full bg-cream/5 hover:bg-ember flex items-center justify-center transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href={CONTACT.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 rounded-full bg-cream/5 hover:bg-ember flex items-center justify-center transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href={CONTACT.whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-9 h-9 rounded-full bg-cream/5 hover:bg-basil flex items-center justify-center transition-colors">
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
            {/* Promo badge */}
            {CONTACT.promo.active && (
              <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ember/20 border border-ember/30 text-saffron text-xs font-bold">
                🔥 {CONTACT.promo.text}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-display font-bold text-cream mb-4">Hızlı Erişim</h3>
            <ul className="space-y-2 text-sm">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="hover:text-saffron transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Service areas */}
          <div>
            <h3 className="font-display font-bold text-cream mb-4">Servis Bölgeleri</h3>
            <ul className="space-y-1.5 text-xs text-cream/65">
              {CONTACT.delivery.serviceAreas.slice(0, 8).map((area) => (
                <li key={area} className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-saffron shrink-0" />
                  {area}
                </li>
              ))}
              <li className="text-[10px] text-cream/40 pt-1">+ {CONTACT.delivery.serviceAreas.length - 8} bölge daha</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-bold text-cream mb-4">İletişim</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-saffron shrink-0 mt-0.5" />
                <span>{CONTACT.address.full}</span>
              </li>
              <li>
                <a href={CONTACT.phoneHref} className="flex items-center gap-2 hover:text-saffron transition-colors">
                  <Phone className="h-4 w-4 text-saffron" />
                  {CONTACT.phone}
                </a>
              </li>
              <li>
                <a href={CONTACT.emailHref} className="flex items-center gap-2 hover:text-saffron transition-colors">
                  <Mail className="h-4 w-4 text-saffron" />
                  <span className="break-all">{CONTACT.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Truck className="h-4 w-4 text-saffron shrink-0 mt-0.5" />
                <span>Min. {CONTACT.delivery.minOrder} ₺ · {CONTACT.delivery.deliveryTime}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Hours strip */}
        <div className="mt-10 pt-6 border-t border-cream/10">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="h-4 w-4 text-saffron" />
            <h3 className="font-display font-bold text-cream text-sm">Çalışma Saatleri</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
            {CONTACT.hours.map((h) => (
              <div key={h.day} className="bg-cream/5 rounded-lg p-2.5">
                <div className="text-cream/60">{h.day.slice(0, 3)}</div>
                <div className="text-cream font-mono text-[11px] mt-0.5">
                  {h.open}-{h.close}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legal links */}
        <div className="mt-8 pt-6 border-t border-cream/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-cream/50">
          <div>
            © {new Date().getFullYear()} {BRAND.legalName} · Tüm hakları saklıdır
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <Link href="/kvkk" className="hover:text-saffron">KVKK</Link>
            <span className="text-cream/20">·</span>
            <Link href="/gizlilik" className="hover:text-saffron">Gizlilik</Link>
            <span className="text-cream/20">·</span>
            <Link href="/cerez" className="hover:text-saffron">Çerez Politikası</Link>
            <span className="text-cream/20">·</span>
            <Link href="/teslimat" className="hover:text-saffron">Teslimat Sözleşmesi</Link>
            <span className="text-cream/20">·</span>
            <Link href="/iade" className="hover:text-saffron">İade & Değişim</Link>
            <span className="text-cream/20">·</span>
            <Link href="/admin/giris" className="hover:text-saffron">Yönetim</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
