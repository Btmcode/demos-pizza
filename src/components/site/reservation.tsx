"use client";

import * as React from "react";
import { CalendarDays, Clock, Users, Mail, Phone, User, Loader2, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const TIME_SLOTS = [
  { service: "LUNCH", label: "Öğle", times: ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30"] },
  { service: "DINNER", label: "Akşam", times: ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"] },
];

const TR_MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const TR_DAYS = ["Pz", "Pt", "Sa", "Ça", "Pe", "Cu", "Ct"];

export function Reservation() {
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [viewMonth, setViewMonth] = React.useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null);
  const [selectedService, setSelectedService] = React.useState<"LUNCH" | "DINNER">("DINNER");
  const [partySize, setPartySize] = React.useState(2);
  const [form, setForm] = React.useState({ name: "", email: "", phone: "", notes: "" });
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [fullSlots, setFullSlots] = React.useState<string[]>([]);

  // Generate calendar days
  const days = React.useMemo(() => {
    const firstDay = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const lastDay = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0);
    const startPad = firstDay.getDay();
    const total = lastDay.getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startPad; i++) cells.push(null);
    for (let i = 1; i <= total; i++) {
      cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), i));
    }
    return cells;
  }, [viewMonth]);

  const today = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Fetch full slots when date changes
  React.useEffect(() => {
    if (!selectedDate) return;
    const dateStr = selectedDate.toISOString().slice(0, 10);
    fetch(`/api/reservations?date=${dateStr}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.fullSlots)) setFullSlots(data.fullSlots);
      })
      .catch(() => {});
  }, [selectedDate]);

  const prevMonth = () => {
    setViewMonth((v) => new Date(v.getFullYear(), v.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setViewMonth((v) => new Date(v.getFullYear(), v.getMonth() + 1, 1));
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) return;
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      toast.error("Lütfen tüm alanları doldurun");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          date: selectedDate.toISOString().slice(0, 10),
          time: selectedTime,
          partySize,
          service: selectedService,
          notes: form.notes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Rezervasyon oluşturulamadı");
        return;
      }
      setDone(true);
      toast.success("Rezervasyon talebiniz alındı!");
    } catch {
      toast.error("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="rezervasyon"
      className="bg-gradient-to-b from-charcoal to-smoke text-cream py-20 md:py-28"
    >
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: Info */}
          <div>
            <span className="text-saffron text-xs font-mono uppercase tracking-[0.3em]">
              {"// Rezervasyon"}
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-3 leading-tight">
              Masanızı <span className="text-saffron italic">ayırın</span>
            </h2>
            <p className="mt-5 text-cream/75 text-base md:text-lg leading-relaxed">
              Demos Pizza'da özel akşam yemeği, aile kutlaması veya arkadaş buluşması için
              rezervasyonunuzu önceden yapın. Hafta sonu akşamları yoğun olur — erkenden
              yerinizi garantileyin.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-saffron/15 flex items-center justify-center text-saffron shrink-0">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold">Çalışma Saatleri</div>
                  <div className="text-sm text-cream/65 mt-0.5">
                    Hafta içi 11:00 - 23:00 · Cuma-Cmt 11:00 - 00:00 · Pazar 12:00 - 23:00
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-saffron/15 flex items-center justify-center text-saffron shrink-0">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold">Grup Rezervasyonları</div>
                  <div className="text-sm text-cream/65 mt-0.5">
                    8+ kişilik gruplar için arayın: 0212 000 00 00
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-saffron/15 flex items-center justify-center text-saffron shrink-0">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold">Özel Etkinlikler</div>
                  <div className="text-sm text-cream/65 mt-0.5">
                    Doğum günü, kutlama, kurumsal etkinlik — bize ulaşın, planlayalım.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form / Calendar */}
          <div className="bg-cream text-charcoal rounded-3xl p-6 md:p-8 shadow-2xl">
            {done ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-basil/15 text-basil mb-5">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-bold">
                  Rezervasyon talebiniz alındı!
                </h3>
                <p className="mt-3 text-charcoal/70 max-w-md mx-auto">
                  {selectedDate?.toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" })}{" "}
                  günü saat <span className="font-semibold text-ember">{selectedTime}</span> için{" "}
                  <span className="font-semibold">{partySize} kişilik</span> masanız için talebinizi aldık.
                  Onay için en kısa sürede sizinle iletişime geçeceğiz.
                </p>
                <Button
                  onClick={() => {
                    setDone(false);
                    setStep(1);
                    setSelectedDate(null);
                    setSelectedTime(null);
                    setForm({ name: "", email: "", phone: "", notes: "" });
                  }}
                  variant="outline"
                  className="mt-6"
                >
                  Yeni rezervasyon yap
                </Button>
              </div>
            ) : (
              <>
                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-6">
                  {[1, 2, 3].map((s) => (
                    <React.Fragment key={s}>
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                          step >= s ? "bg-ember text-cream" : "bg-charcoal/10 text-charcoal/40"
                        }`}
                      >
                        {s}
                      </div>
                      {s < 3 && (
                        <div className={`flex-1 h-0.5 ${step > s ? "bg-ember" : "bg-charcoal/10"}`} />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {step === 1 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display text-xl font-bold">Tarih seçin</h3>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={prevMonth}
                          className="h-8 w-8"
                          aria-label="Önceki ay"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium min-w-28 text-center">
                          {TR_MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={nextMonth}
                          className="h-8 w-8"
                          aria-label="Sonraki ay"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {TR_DAYS.map((d, i) => (
                        <div key={i} className="text-center text-[10px] font-semibold text-charcoal/50 py-1">
                          {d}
                        </div>
                      ))}
                    </div>

                    {/* Days */}
                    <div className="grid grid-cols-7 gap-1">
                      {days.map((d, i) => {
                        if (!d) return <div key={i} />;
                        const isPast = d < today;
                        const isSelected = selectedDate?.toDateString() === d.toDateString();
                        const isToday = d.toDateString() === today.toDateString();
                        return (
                          <button
                            key={i}
                            onClick={() => !isPast && setSelectedDate(d)}
                            disabled={isPast}
                            className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                              isSelected
                                ? "bg-ember text-cream shadow-md"
                                : isPast
                                ? "text-charcoal/25 cursor-not-allowed"
                                : isToday
                                ? "border border-ember/40 text-ember hover:bg-ember/5"
                                : "hover:bg-ember/10 text-charcoal/80"
                            }`}
                          >
                            {d.getDate()}
                          </button>
                        );
                      })}
                    </div>

                    {selectedDate && (
                      <Button
                        onClick={() => setStep(2)}
                        className="w-full mt-6 bg-ember hover:bg-ember/90 text-cream"
                      >
                        Devam et: Saat seç
                      </Button>
                    )}
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <button onClick={() => setStep(1)} className="text-xs text-charcoal/60 hover:text-ember mb-4">
                      ← Tarih değiştir
                    </button>
                    <h3 className="font-display text-xl font-bold mb-1">Saat ve kişi sayısı</h3>
                    <p className="text-sm text-charcoal/60 mb-5">
                      {selectedDate?.toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" })}
                    </p>

                    {/* Service tabs */}
                    <div className="flex gap-2 mb-4">
                      {TIME_SLOTS.map((s) => (
                        <button
                          key={s.service}
                          onClick={() => {
                            setSelectedService(s.service as "LUNCH" | "DINNER");
                            setSelectedTime(null);
                          }}
                          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            selectedService === s.service
                              ? "bg-ember text-cream"
                              : "bg-charcoal/5 text-charcoal/70 hover:bg-charcoal/10"
                          }`}
                        >
                          {s.label} Servisi
                        </button>
                      ))}
                    </div>

                    {/* Time slots */}
                    <div className="grid grid-cols-3 gap-2 mb-6">
                      {TIME_SLOTS.find((s) => s.service === selectedService)!.times.map((t) => {
                        const isFull = fullSlots.includes(t);
                        return (
                          <button
                            key={t}
                            onClick={() => !isFull && setSelectedTime(t)}
                            disabled={isFull}
                            className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                              selectedTime === t
                                ? "bg-charcoal text-cream border-charcoal"
                                : isFull
                                ? "bg-charcoal/5 text-charcoal/30 border-transparent line-through cursor-not-allowed"
                                : "border-charcoal/15 text-charcoal/80 hover:border-ember hover:text-ember"
                            }`}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>

                    {/* Party size */}
                    <Label className="text-sm font-medium">Kişi sayısı</Label>
                    <div className="flex items-center gap-3 mt-2 mb-6">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setPartySize((p) => Math.max(1, p - 1))}
                        className="h-10 w-10"
                      >
                        −
                      </Button>
                      <span className="font-display text-2xl font-bold min-w-12 text-center">
                        {partySize}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setPartySize((p) => Math.min(20, p + 1))}
                        className="h-10 w-10"
                      >
                        +
                      </Button>
                      <span className="text-xs text-charcoal/50 ml-2">
                        {partySize > 8 && "(8+ için arayın)"}
                      </span>
                    </div>

                    <Button
                      onClick={() => selectedTime && setStep(3)}
                      disabled={!selectedTime}
                      className="w-full bg-ember hover:bg-ember/90 text-cream"
                    >
                      Devam et: İletişim bilgileri
                    </Button>
                  </div>
                )}

                {step === 3 && (
                  <div>
                    <button onClick={() => setStep(2)} className="text-xs text-charcoal/60 hover:text-ember mb-4">
                      ← Saat değiştir
                    </button>
                    <h3 className="font-display text-xl font-bold mb-4">İletişim bilgileri</h3>

                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="resv-name" className="text-xs">Ad Soyad</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
                          <Input
                            id="resv-name"
                            value={form.name}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            placeholder="Adınız Soyadınız"
                            className="pl-9"
                            maxLength={80}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="resv-email" className="text-xs">E-posta</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
                          <Input
                            id="resv-email"
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                            placeholder="ornek@email.com"
                            className="pl-9"
                            maxLength={254}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="resv-phone" className="text-xs">Telefon</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
                          <Input
                            id="resv-phone"
                            type="tel"
                            value={form.phone}
                            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                            placeholder="+90 5XX XXX XX XX"
                            className="pl-9"
                            maxLength={20}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="resv-notes" className="text-xs">Notlar (opsiyonel)</Label>
                        <Textarea
                          id="resv-notes"
                          value={form.notes}
                          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                          placeholder="Özel istekler, doğum günü, alerji vs."
                          maxLength={500}
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-charcoal/5 rounded-lg text-xs text-charcoal/70">
                      <div className="font-semibold mb-1">Özet:</div>
                      {selectedDate?.toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" })} · {selectedTime} · {partySize} kişi · {selectedService === "LUNCH" ? "Öğle" : "Akşam"} servisi
                    </div>

                    <Button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="w-full mt-5 bg-ember hover:bg-ember/90 text-cream"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Gönderiliyor...
                        </>
                      ) : (
                        "Rezervasyonu Tamamla"
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
