"use client";

import { Instagram, Facebook, MessageCircle, MapPin, Phone, Mail, Clock } from "lucide-react";
import { BRAND, CONTACT, NAV_LINKS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-charcoal text-cream/80 mt-auto">
      <div className="container mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <img src="/logo.svg" alt="Demos Pizza" className="h-12 mb-4 brightness-0 invert" />
            <p className="text-sm text-cream/65 leading-relaxed">
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
          </div>

          {/* Nav */}
          <div>
            <h3 className="font-display font-bold text-cream mb-4">Menü</h3>
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
                  {CONTACT.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="font-display font-bold text-cream mb-4">Çalışma Saatleri</h3>
            <ul className="space-y-1.5 text-sm">
              {CONTACT.hours.map((h) => (
                <li key={h.day} className="flex justify-between gap-2">
                  <span className="text-cream/70">{h.day}</span>
                  <span className="text-cream font-mono text-xs">
                    {h.open} - {h.close}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-basil/15 text-basil text-xs">
              <Clock className="h-3 w-3" />
              Şu an açık
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-cream/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-cream/50">
          <div>
            © {new Date().getFullYear()} {BRAND.legalName}. Tüm hakları saklıdır.
          </div>
          <div className="flex items-center gap-4">
            <a href="/admin/giris" className="hover:text-saffron transition-colors">
              Yönetim
            </a>
            <span className="text-cream/20">·</span>
            <span>KVKK · Gizlilik</span>
            <span className="text-cream/20">·</span>
            <span>Tüm ürünler helal sertifikalıdır</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
