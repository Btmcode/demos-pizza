"use client";

import * as React from "react";
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, MessageCircle, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CONTACT } from "@/lib/constants";
import { toast } from "sonner";
import { OpenStreetMap } from "./openstreetmap";

export function Contact() {
  const [form, setForm] = React.useState({ name: "", email: "", phone: "", subject: "", message: "", website: "" });
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      toast.error("Lütfen tüm zorunlu alanları doldurun");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Mesaj gönderilemedi");
        return;
      }
      toast.success("Mesajınız alındı! En kısa sürede dönüş yapacağız.");
      setForm({ name: "", email: "", phone: "", subject: "", message: "", website: "" });
    } catch {
      toast.error("Bağlantı hatası");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="iletisim" className="bg-cream py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-10 md:mb-12 max-w-2xl mx-auto">
          <span className="text-ember text-xs font-mono uppercase tracking-[0.25em]">
            {"// İletişim"}
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-2 text-charcoal">
            Bize <span className="text-ember italic">ulaşın</span>
          </h2>
          <p className="mt-3 text-charcoal/70 text-sm md:text-base">
            Sorularınız, özel istekleriniz veya geri bildiriminiz mi var? Aşağıdaki formu doldurun
            veya doğrudan bizi arayın.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10">
          {/* Contact info cards */}
          <div className="lg:col-span-2 space-y-3">
            <ContactCard
              icon={<MapPin className="h-5 w-5" />}
              title="Adres"
              lines={[CONTACT.address.full]}
              href={`https://maps.google.com/?q=${encodeURIComponent(CONTACT.address.full)}`}
              cta="Yol tarifi al"
            />
            <ContactCard
              icon={<Phone className="h-5 w-5" />}
              title="Telefon"
              lines={[CONTACT.phone, "Sipariş & destek için"]}
              href={CONTACT.phoneHref}
              cta="Hemen ara"
            />
            <ContactCard
              icon={<Mail className="h-5 w-5" />}
              title="E-posta"
              lines={[CONTACT.email, "24 saat içinde yanıt"]}
              href={CONTACT.emailHref}
              cta="E-posta gönder"
            />
            <ContactCard
              icon={<Clock className="h-5 w-5" />}
              title="Çalışma Saatleri"
              lines={[
                "Pzt-Per: 10:30 - 02:00",
                "Cuma-Cmt: 10:30 - 02:00",
                "Pazar: 10:30 - 02:00",
              ]}
            />

            <div className="flex gap-2 pt-1">
              <a href={CONTACT.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Button size="icon" variant="outline" className="rounded-full border-ember/30 text-ember hover:bg-ember hover:text-cream">
                  <Instagram className="h-4 w-4" />
                </Button>
              </a>
              <a href={CONTACT.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Button size="icon" variant="outline" className="rounded-full border-ember/30 text-ember hover:bg-ember hover:text-cream">
                  <Facebook className="h-4 w-4" />
                </Button>
              </a>
              <a href={CONTACT.whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <Button size="icon" variant="outline" className="rounded-full border-basil/30 text-basil hover:bg-basil hover:text-cream">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>

          {/* Form + map */}
          <div className="lg:col-span-3 space-y-5">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 md:p-6 border border-charcoal/8 shadow-sm">
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                className="hidden"
                aria-hidden="true"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <Label htmlFor="c-name" className="text-xs">Ad Soyad *</Label>
                  <Input
                    id="c-name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Adınız"
                    maxLength={80}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="c-email" className="text-xs">E-posta *</Label>
                  <Input
                    id="c-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="ornek@email.com"
                    maxLength={254}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="c-phone" className="text-xs">Telefon</Label>
                  <Input
                    id="c-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+90 5XX XXX XX XX"
                    maxLength={20}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="c-subject" className="text-xs">Konu *</Label>
                  <Input
                    id="c-subject"
                    value={form.subject}
                    onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                    placeholder="Konu başlığı"
                    maxLength={120}
                    required
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="mb-4">
                <Label htmlFor="c-message" className="text-xs">Mesajınız *</Label>
                <Textarea
                  id="c-message"
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="Mesajınızı buraya yazın..."
                  maxLength={2000}
                  required
                  rows={5}
                  className="mt-1"
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-ember hover:bg-ember/90 text-cream"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Mesaj Gönder
                  </>
                )}
              </Button>
            </form>

            <OpenStreetMap />
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactCard({
  icon,
  title,
  lines,
  href,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  lines: string[];
  href?: string;
  cta?: string;
}) {
  return (
    <div className="bg-white rounded-xl p-4 border border-charcoal/8 shadow-sm flex items-start gap-3">
      <div className="w-10 h-10 rounded-full bg-ember/10 text-ember flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <div className="font-semibold text-charcoal text-sm">{title}</div>
        {lines.map((l, i) => (
          <div key={i} className={`text-sm text-charcoal/70 ${i === 0 ? "mt-0.5" : ""}`}>
            {l}
          </div>
        ))}
        {href && cta && (
          <a
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-ember hover:underline"
          >
            {cta} →
          </a>
        )}
      </div>
    </div>
  );
}
