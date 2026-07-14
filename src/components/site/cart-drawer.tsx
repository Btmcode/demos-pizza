"use client";

import * as React from "react";
import { X, Plus, Minus, Trash2, ShoppingBag, Loader2, CheckCircle2, ArrowRight, ArrowLeft, MapPin, User, Phone, CreditCard, Truck, Store, MessageSquare, Navigation, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AddressPicker } from "./address-picker";
import { useCart } from "./cart-context";
import { CURRENCY, CONTACT } from "@/lib/constants";
import { toast } from "sonner";
import { modernToast } from "@/components/ui/sonner";
import { playOrderJingle } from "@/lib/jingle";

type Step = "cart" | "checkout" | "success";

const PAYMENT_LABELS: Record<string, string> = {
  CASH_ON_DELIVERY: "Kapıda Nakit",
  CARD_ON_DELIVERY: "Kapıda Kart",
};

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, totalCents, clear, itemCount } = useCart();
  const [step, setStep] = React.useState<Step>("cart");
  const [orderType, setOrderType] = React.useState<"DELIVERY" | "PICKUP">("DELIVERY");
  const [paymentMethod, setPaymentMethod] = React.useState<"CASH_ON_DELIVERY" | "CARD_ON_DELIVERY">("CASH_ON_DELIVERY");
  const [form, setForm] = React.useState({
    name: "",
    phone: "",
    email: "",
    district: (CONTACT.delivery.serviceAreas[0] as string) || "",
    street: "",
    building: "",
    apartment: "",
    floor: "",
    address: "",
    notes: "",
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [locating, setLocating] = React.useState(false);
  const [couponCode, setCouponCode] = React.useState("");
  const [couponApplied, setCouponApplied] = React.useState<{ code: string; discountPct: number; discountCents: number } | null>(null);
  const [couponChecking, setCouponChecking] = React.useState(false);

  // Geolocation — konum izni al, reverse geocode yap
  const useGeolocation = async () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      modernToast("error", "Tarayıcınız konum özelliğini desteklemiyor.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // OpenStreetMap Nominatim ile reverse geocode (ücretsiz, API key yok)
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=tr`,
            {
              headers: { "Accept": "application/json" },
            }
          );
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            const street = addr.road || addr.pedestrian || addr.footway || "";
            const houseNumber = addr.house_number || "";
            const neighborhood = addr.suburb || addr.neighbourhood || addr.quarter || "";
            const district = addr.city_district || addr.town || addr.city || "";
            const fullAddress = [street, houseNumber && `No:${houseNumber}`, neighborhood]
              .filter(Boolean)
              .join(" ");
            
            // Servis bölgesi eşleştir
            const matchedArea = CONTACT.delivery.serviceAreas.find(
              (area) =>
                district.toLowerCase().includes(area.toLowerCase()) ||
                neighborhood.toLowerCase().includes(area.toLowerCase()) ||
                (addr.county && addr.county.toLowerCase().includes(area.toLowerCase()))
            );

            setForm((f) => ({
              ...f,
              district: matchedArea || f.district,
              address: fullAddress || f.address,
            }));
            modernToast("success", "Konumunuz alındı!", matchedArea ? `${matchedArea} bölgesi seçildi` : "Adres alanı dolduruldu");
          } else {
            modernToast("info", "Konum alındı ama adres çözümlenemedi. Lütfen elle girin.");
          }
        } catch (e) {
          modernToast("error", "Adres çözümlenemedi. Lütfen elle girin.");
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        setLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          modernToast("error", "Konum izni reddedildi. Tarayıcı ayarlarından izin verin.");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          modernToast("error", "Konum bilgisi mevcut değil.");
        } else if (error.code === error.TIMEOUT) {
          modernToast("error", "Konum alınamadı (zaman aşımı).");
        } else {
          modernToast("error", "Konum alınamadı.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 dk cache
      }
    );
  };
  const [orderResult, setOrderResult] = React.useState<{ orderNumber: string; totalDisplay: string; estimatedTime: string } | null>(null);

  React.useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => setStep("cart"), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Müşteri tanıma — telefon ile kayıtlı müşteri bilgilerini yükle
  React.useEffect(() => {
    const saved = localStorage.getItem("demos-customer");
    if (saved) {
      try {
        const customer = JSON.parse(saved);
        setForm((f) => ({
          ...f,
          name: customer.name || "",
          phone: customer.phone || "",
          email: customer.email || "",
          district: customer.district || (CONTACT.delivery.serviceAreas[0] as string) || "",
          street: customer.street || "",
          building: customer.building || "",
          apartment: customer.apartment || "",
          floor: customer.floor || "",
          address: customer.address || "",
        }));
      } catch {}
    }
  }, []);

  // Checkout adımına geçince otomatik konum izni iste
  React.useEffect(() => {
    if (step === "checkout" && orderType === "DELIVERY" && !form.address) {
      // Sadece adres boşsa konum iste
      const timeout = setTimeout(() => {
        if (navigator.geolocation && !localStorage.getItem("demos-location-denied")) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              try {
                const res = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=tr`,
                  { headers: { Accept: "application/json" } }
                );
                const data = await res.json();
                if (data?.address) {
                  const addr = data.address;
                  const street = addr.road || addr.pedestrian || "";
                  const houseNumber = addr.house_number || "";
                  const neighborhood = addr.suburb || addr.neighbourhood || "";
                  const fullAddress = [street, houseNumber && `No:${houseNumber}`, neighborhood].filter(Boolean).join(" ");
                  const matchedArea = CONTACT.delivery.serviceAreas.find(
                    (area) => {
                      const district = addr.city_district || addr.town || addr.city || "";
                      return district.toLowerCase().includes(area.toLowerCase()) || neighborhood.toLowerCase().includes(area.toLowerCase());
                    }
                  );
                  setForm((f) => ({
                    ...f,
                    district: matchedArea || f.district,
                    address: fullAddress || f.address,
                  }));
                  modernToast("success", "Konumunuz otomatik alındı!");
                }
              } catch {}
            },
            (error) => {
              if (error.code === error.PERMISSION_DENIED) {
                localStorage.setItem("demos-location-denied", "true");
              }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
          );
        }
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [step, orderType, form.address]);

  // İndirim kodu kontrol
  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponChecking(true);
    try {
      const res = await fetch("/api/campaigns", { cache: "no-store" });
      const data = await res.json();
      const campaign = (data.campaigns || []).find(
        (c: any) => c.code?.toUpperCase() === couponCode.trim().toUpperCase() && c.isActive
      );
      if (!campaign) {
        modernToast("error", "Geçersiz veya süresi dolmuş kod");
        setCouponApplied(null);
        return;
      }
      const discount = campaign.discountPct
        ? Math.round((totalCents * campaign.discountPct) / 100)
        : campaign.discountCents || 0;
      setCouponApplied({ code: campaign.code, discountPct: campaign.discountPct || 0, discountCents: discount });
      modernToast("success", "`%${campaign.discountPct || 0} indirim uygulandı!`");
    } catch {
      modernToast("error", "Kod kontrol edilemedi");
    } finally {
      setCouponChecking(false);
    }
  };

  const couponDiscount = couponApplied?.discountCents || 0;
  const deliveryCents =
    orderType === "DELIVERY"
      ? totalCents >= CONTACT.delivery.freeDeliveryThreshold * 100
        ? 0
        : CONTACT.delivery.deliveryFee * 100
      : 0;
  const grandTotal = totalCents - couponDiscount + deliveryCents;
  const minMet = totalCents >= CONTACT.delivery.minOrder * 100;

  const handleCheckout = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      modernToast("error", "İsim ve telefon zorunlu");
      return;
    }
    if (form.phone.length !== 11) {
      modernToast("error", "Telefon 11 hane olmalı", `${form.phone.length} hane girdiniz, 11 hane gerekli`);
      return;
    }
    if (orderType === "DELIVERY" && !form.street.trim()) {
      modernToast("error", "Sokak/Cadde girin");
      return;
    }
    if (orderType === "DELIVERY" && !form.building.trim()) {
      modernToast("error", "Bina no girin");
      return;
    }
    if (orderType === "DELIVERY" && !form.district) {
      modernToast("error", "Lütfen bölgenizi seçin");
      return;
    }
    if (orderType === "DELIVERY" && !minMet) {
      modernToast("error", `Min. sipariş ${CONTACT.delivery.minOrder} ₺`);
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        customerName: form.name.trim(),
        customerPhone: form.phone.trim(),
        customerEmail: form.email.trim() || undefined,
        orderType,
        paymentMethod,
        items: items.map((i) => ({
          menuItemId: i.menuItemId,
          name: i.name + (i.size ? ` (${i.size})` : ""),
          quantity: i.quantity,
          unitPriceCents: i.unitPriceCents,
          extras: i.extras,
          notes: i.notes,
        })),
        deliveryDistrict: orderType === "DELIVERY" ? form.district : undefined,
        deliveryAddress: orderType === "DELIVERY"
          ? [form.street, form.building && `No:${form.building}`, form.apartment && `Daire:${form.apartment}`, form.floor && `Kat:${form.floor}`, form.address].filter(Boolean).join(" · ").trim()
          : undefined,
        notes: form.notes.trim() || undefined,
      };
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        modernToast("error", data.error || "Sipariş oluşturulamadı");
        return;
      }
      setOrderResult({
        orderNumber: data.orderNumber,
        totalDisplay: data.totalDisplay,
        estimatedTime: data.estimatedTime,
      });
      setStep("success");
      clear();
      // Müşteri bilgilerini kaydet — geri döndüğünde hatırlasın
      localStorage.setItem("demos-customer", JSON.stringify({
        name: form.name,
        phone: form.phone,
        email: form.email,
        district: form.district,
        street: form.street,
        building: form.building,
        apartment: form.apartment,
        floor: form.floor,
        address: form.address,
      }));
      // Modern toast + jingle
      modernToast("success", "Siparişiniz Alındı!", "Afiyet olsun 🍕");
      playOrderJingle();
    } catch {
      modernToast("error", "Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  };

  // Mobil geri tuşu yönetimi — sepet açıksa kapat, siteden çıkma
  React.useEffect(() => {
    if (!isOpen) return;
    // History'e yeni state push — geri tuşu bunu yakalayacak
    window.history.pushState({ cartOpen: true }, "");
    const onPopState = (e: PopStateEvent) => {
      closeCart();
    };
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, [isOpen, closeCart]);

  return (
    <Sheet open={isOpen} onOpenChange={(o) => !o && closeCart()}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col bg-paper">
        <SheetHeader className="px-4 py-3.5 border-b border-white/10 bg-ink text-white">
          <div className="flex items-center justify-between gap-3">
            <SheetTitle className="text-white flex items-center gap-2 min-w-0">
              <ShoppingBag className="h-4 w-4 text-yellow shrink-0" />
              <span className="truncate">
                {step === "cart" && "Sepetim"}
                {step === "checkout" && "Sipariş Bilgileri"}
                {step === "success" && "Sipariş Onayı"}
              </span>
            </SheetTitle>
            <div className="flex items-center gap-2 shrink-0">
              {itemCount > 0 && step === "cart" && (
                <span className="text-xs text-white/60">{itemCount} ürün</span>
              )}
              <button
                onClick={closeCart}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Kapat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </SheetHeader>

        {/* CART STEP */}
        {step === "cart" && (
          <>
            <div className="flex-1 overflow-y-auto custom-scroll p-4">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto rounded-full bg-ink/5 flex items-center justify-center mb-4">
                    <ShoppingBag className="h-8 w-8 text-ink/30" />
                  </div>
                  <p className="text-ink/60 font-medium">Sepetiniz boş</p>
                  <p className="text-xs text-ink/40 mt-1">Birkaç lezzetli pizza ekleyin!</p>
                  <Button onClick={closeCart} variant="outline" className="mt-4">
                    Menüyü gör
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 md:p-4 bg-white rounded-xl border border-ink/8 shadow-sm">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-ink/5 shrink-0">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-ink/20">
                            <ShoppingBag className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="font-display font-bold text-sm md:text-base text-ink">{item.name}</h4>
                            {item.size && <p className="text-[11px] text-ink/55 mt-0.5">{item.size}</p>}
                            {item.extras.length > 0 && (
                              <p className="text-[10px] text-ink/50 mt-0.5">
                                + {item.extras.map((e) => e.name).join(", ")}
                              </p>
                            )}
                            {item.notes && (
                              <p className="text-[10px] text-pink mt-0.5 italic">
                                {item.notes}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-ink/30 hover:text-pink transition-colors"
                            aria-label="Kaldır"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1.5 bg-ink/5 rounded-lg p-0.5">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center rounded hover:bg-ink/10"
                              aria-label="Azalt"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center rounded hover:bg-ink/10"
                              aria-label="Artır"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="font-display font-bold text-pink text-sm">
                            {CURRENCY.formatShort(
                              (item.unitPriceCents + item.extras.reduce((s, e) => s + e.priceCents, 0)) *
                                item.quantity
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-ink/8 p-4 bg-white space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink/70">Ara toplam</span>
                  <span className="font-medium">{CURRENCY.formatShort(totalCents)}</span>
                </div>
                {!minMet && orderType === "DELIVERY" && (
                  <div className="text-xs text-pink bg-pink/5 p-3 rounded-lg border border-pink/20 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>
                      Min. sipariş <strong>{CONTACT.delivery.minOrder} ₺</strong>.{" "}
                      <strong>{CURRENCY.formatShort(CONTACT.delivery.minOrder * 100 - totalCents)}</strong> daha ekle.
                    </span>
                  </div>
                )}
                <Button
                  onClick={() => setStep("checkout")}
                  className="w-full bg-pink hover:bg-pink-hover text-white h-12 font-semibold shadow-pink-glow"
                  disabled={!minMet && orderType === "DELIVERY"}
                >
                  Siparişe Geç
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}

        {/* CHECKOUT STEP */}
        {step === "checkout" && (
          <>
            <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-5">
              <button onClick={() => setStep("cart")} className="text-xs text-ink/60 hover:text-pink flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" />
                Sepete dön
              </button>

              {/* Order type — toggle */}
              <div>
                <Label className="text-xs font-semibold mb-2 block">Sipariş Tipi</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setOrderType("DELIVERY")}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all flex flex-col items-center gap-1 ${
                      orderType === "DELIVERY"
                        ? "bg-pink text-white border-pink shadow-md"
                        : "bg-white border-ink/15 hover:border-pink/40"
                    }`}
                  >
                    <Truck className="h-4 w-4" />
                    <span>Adrese Teslim</span>
                    <span className="text-[10px] opacity-80">{CONTACT.delivery.deliveryTime}</span>
                  </button>
                  <button
                    onClick={() => setOrderType("PICKUP")}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all flex flex-col items-center gap-1 ${
                      orderType === "PICKUP"
                        ? "bg-pink text-white border-pink shadow-md"
                        : "bg-white border-ink/15 hover:border-pink/40"
                    }`}
                  >
                    <Store className="h-4 w-4" />
                    <span>Gel-Al</span>
                    <span className="text-[10px] opacity-80">{CONTACT.delivery.pickupTime}</span>
                  </button>
                </div>
              </div>

              {/* Customer info */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold">Müşteri Bilgileri</Label>
                <div>
                  <Label htmlFor="co-name" className="text-[11px] text-ink/60">Ad Soyad *</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40" />
                    <Input
                      id="co-name"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Adınız Soyadınız"
                      maxLength={80}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="co-phone" className="text-[11px] text-ink/60">Telefon (11 hane) *</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40" />
                    <Input
                      id="co-phone"
                      type="tel"
                      inputMode="numeric"
                      value={form.phone}
                      onChange={(e) => {
                        // Sadece rakam, 11 hane
                        const cleaned = e.target.value.replace(/\D/g, "").slice(0, 11);
                        setForm((f) => ({ ...f, phone: cleaned }));
                      }}
                      onBlur={(e) => {
                        if (e.target.value && e.target.value.length !== 11) {
                          modernToast("error", "Telefon 11 hane olmalı", `Şu an ${e.target.value.length} hane girdiniz`);
                        }
                      }}
                      placeholder="0555 123 45 67"
                      maxLength={11}
                      className="pl-9 font-mono tracking-wide"
                      aria-required="true"
                      aria-invalid={form.phone.length > 0 && form.phone.length !== 11}
                    />
                  </div>
                  {form.phone.length > 0 && form.phone.length !== 11 && (
                    <p className="text-[10px] text-pink mt-1" role="alert">
                      {form.phone.length}/11 hane — {11 - form.phone.length} hane daha gerekli
                    </p>
                  )}
                  {form.phone.length === 11 && (
                    <p className="text-[10px] text-basil mt-1 flex items-center gap-1" role="status">
                      <CheckCircle2 className="h-3 w-3" /> Telefon numarası tamam
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="co-email" className="text-[11px] text-ink/60">E-posta (opsiyonel)</Label>
                  <Input
                    id="co-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="ornek@email.com"
                    maxLength={254}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Delivery address — Emlakjet tarzı harita + yapılandırılmış form */}
              {orderType === "DELIVERY" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">Teslimat Adresi</Label>
                  </div>

                  {/* Harita tabanlı konum seçici */}
                  <AddressPicker form={form} setForm={setForm} />

                  {/* Bölge seçimi */}
                  <div>
                    <Label htmlFor="co-district" className="text-[11px] text-ink/60">Bölge / Mahalle *</Label>
                    <div className="relative mt-1">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40 z-10" />
                      <select
                        id="co-district"
                        value={form.district}
                        onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
                        className="w-full pl-9 pr-3 py-2.5 rounded-md border border-ink/15 bg-white text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-pink/30 focus:border-pink"
                      >
                        <option value="" disabled>Bölge seç</option>
                        {CONTACT.delivery.serviceAreas.map((area) => (
                          <option key={area} value={area}>{area}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Sokak + Bina No */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <Label htmlFor="co-street" className="text-[11px] text-ink/60">Sokak / Cadde *</Label>
                      <Input
                        id="co-street"
                        value={form.street || ""}
                        onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
                        placeholder="Örn: Atatürk Sk."
                        maxLength={100}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="co-building" className="text-[11px] text-ink/60">Bina No *</Label>
                      <Input
                        id="co-building"
                        value={form.building || ""}
                        onChange={(e) => setForm((f) => ({ ...f, building: e.target.value }))}
                        placeholder="12/A"
                        maxLength={20}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Daire + Kat */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="co-apartment" className="text-[11px] text-ink/60">Daire</Label>
                      <Input
                        id="co-apartment"
                        value={form.apartment || ""}
                        onChange={(e) => setForm((f) => ({ ...f, apartment: e.target.value }))}
                        placeholder="5"
                        maxLength={10}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="co-floor" className="text-[11px] text-ink/60">Kat</Label>
                      <Input
                        id="co-floor"
                        value={form.floor || ""}
                        onChange={(e) => setForm((f) => ({ ...f, floor: e.target.value }))}
                        placeholder="3"
                        maxLength={10}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Ek tarif */}
                  <div>
                    <Label htmlFor="co-addr" className="text-[11px] text-ink/60">Ek Adres Tarifi (opsiyonel)</Label>
                    <Textarea
                      id="co-addr"
                      value={form.address}
                      onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                      placeholder="Kırmızı bina, çiçekçi karşısı, zil çalmayın vs."
                      maxLength={300}
                      rows={2}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {/* Payment method — sadece Adrese Teslim'de */}
              {orderType === "DELIVERY" && (
              <div>
                <Label className="text-xs font-semibold mb-2 block">Ödeme Yöntemi</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(PAYMENT_LABELS) as (keyof typeof PAYMENT_LABELS)[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setPaymentMethod(m as "CASH_ON_DELIVERY" | "CARD_ON_DELIVERY")}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all flex flex-col items-center gap-1 ${
                        paymentMethod === m
                          ? "bg-ink text-white border-ink"
                          : "bg-white border-ink/15 hover:border-pink/40"
                      }`}
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>{PAYMENT_LABELS[m]}</span>
                    </button>
                  ))}
                </div>
              </div>
              )}

              {/* Notes */}
              <div>
                <Label htmlFor="co-notes" className="text-[11px] text-ink/60 flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" /> Sipariş Notu (opsiyonel)
                </Label>
                <Textarea
                  id="co-notes"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Çıtır olsun, sos koymayın, kapı zilini çalmayın vs."
                  maxLength={500}
                  rows={2}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="border-t border-ink/8 p-4 bg-white space-y-3">
              {/* İndirim kodu */}
              {!couponApplied ? (
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="İndirim kodu"
                    className="flex-1 font-mono text-sm uppercase"
                    maxLength={30}
                  />
                  <Button
                    onClick={applyCoupon}
                    disabled={couponChecking || !couponCode.trim()}
                    variant="outline"
                    size="sm"
                    className="h-10 px-4"
                  >
                    {couponChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Uygula"}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-basil/10 border border-basil/20">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-basil" />
                    <div>
                      <div className="text-xs font-semibold text-basil">{couponApplied.code}</div>
                      <div className="text-[10px] text-basil/60">%{couponApplied.discountPct} indirim</div>
                    </div>
                  </div>
                  <button
                    onClick={() => { setCouponApplied(null); setCouponCode(""); }}
                    className="text-ink/30 hover:text-ink text-xs"
                  >
                    Kaldır
                  </button>
                </div>
              )}

              {/* Özet */}
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-ink/70">
                  <span>Ara toplam</span>
                  <span>{CURRENCY.formatShort(totalCents)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-basil">
                    <span>İndirim (%{couponApplied?.discountPct})</span>
                    <span>−{CURRENCY.formatShort(couponDiscount)}</span>
                  </div>
                )}
                {orderType === "DELIVERY" && (
                  <div className="flex justify-between text-ink/70">
                    <span>Adrese Teslim</span>
                    <span>
                      {deliveryCents === 0 ? (
                        <span className="text-basil font-medium">Ücretsiz</span>
                      ) : (
                        CURRENCY.formatShort(deliveryCents)
                      )}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base text-ink pt-1 border-t border-dashed border-ink/15">
                  <span>Toplam</span>
                  <span className="text-pink">{CURRENCY.formatShort(grandTotal)}</span>
                </div>
              </div>
              <Button
                onClick={handleCheckout}
                disabled={submitting}
                className="w-full bg-pink hover:bg-pink/90 text-white h-12"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Siparişi Tamamla ({CURRENCY.formatShort(grandTotal)})
                  </>
                )}
              </Button>
              <p className="text-[10px] text-ink/50 text-center">
                Sipariş verdiğinizde <a href="/teslimat" className="underline">Teslimat Sözleşmesi</a>'ni kabul etmiş olursunuz
              </p>
            </div>
          </>
        )}

        {/* SUCCESS STEP */}
        {step === "success" && orderResult && (
          <div className="flex-1 overflow-y-auto p-6 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-basil/15 text-basil flex items-center justify-center mb-5">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="font-display text-2xl font-bold text-ink">Siparişiniz alındı!</h3>
            <p className="mt-2 text-ink/70">
              Sipariş numaranız:{" "}
              <span className="font-mono font-bold text-pink">{orderResult.orderNumber}</span>
            </p>
            <div className="mt-6 bg-white border border-ink/8 rounded-xl p-4 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-ink/70">Tahmini süre</span>
                <span className="font-medium">{orderResult.estimatedTime}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink/70">Toplam</span>
                <span className="font-bold text-pink">{orderResult.totalDisplay}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink/70">Ödeme</span>
                <span className="font-medium">{PAYMENT_LABELS[paymentMethod]}</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-basil/5 border border-basil/20 rounded-xl text-sm text-ink/70">
              <MessageSquare className="h-4 w-4 inline mr-1 text-basil" />
              Siparişinizi WhatsApp'tan da takip edebilirsiniz:{" "}
              <a href={CONTACT.whatsappHref} target="_blank" rel="noopener noreferrer" className="text-basil font-semibold underline">
                {CONTACT.whatsapp}
              </a>
            </div>
            <p className="mt-4 text-xs text-ink/55">
              Sipariş onaylandığında telefon ile haber vereceğiz. Teşekkür ederiz! 🍕
            </p>
            <Button
              onClick={() => {
                closeCart();
                setStep("cart");
                setOrderResult(null);
                setForm({ name: "", phone: "", email: "", district: (CONTACT.delivery.serviceAreas[0] as string) || "", street: "", building: "", apartment: "", floor: "", address: "", notes: "" });
              }}
              className="w-full mt-6 bg-pink hover:bg-pink/90 text-white"
            >
              Tamam, kapat
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
