"use client";

import * as React from "react";
import { X, Plus, Minus, Trash2, ShoppingBag, Loader2, CheckCircle2, ArrowRight, ArrowLeft, MapPin, User, Phone, CreditCard, Truck, Store, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "./cart-context";
import { CURRENCY, CONTACT } from "@/lib/constants";
import { toast } from "sonner";

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
    address: "",
    notes: "",
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [orderResult, setOrderResult] = React.useState<{ orderNumber: string; totalDisplay: string; estimatedTime: string } | null>(null);

  React.useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => setStep("cart"), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const deliveryCents =
    orderType === "DELIVERY"
      ? totalCents >= CONTACT.delivery.freeDeliveryThreshold * 100
        ? 0
        : CONTACT.delivery.deliveryFee * 100
      : 0;
  const grandTotal = totalCents + deliveryCents;
  const minMet = totalCents >= CONTACT.delivery.minOrder * 100;

  const handleCheckout = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("İsim ve telefon zorunlu");
      return;
    }
    if (orderType === "DELIVERY" && !form.address.trim()) {
      toast.error("Lütfen adresinizi girin");
      return;
    }
    if (orderType === "DELIVERY" && !form.district) {
      toast.error("Lütfen bölgenizi seçin");
      return;
    }
    if (orderType === "DELIVERY" && !minMet) {
      toast.error(`Minimum sipariş ${CONTACT.delivery.minOrder} ₺`);
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
        deliveryAddress: orderType === "DELIVERY" ? form.address.trim() : undefined,
        notes: form.notes.trim() || undefined,
      };
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Sipariş oluşturulamadı");
        return;
      }
      setOrderResult({
        orderNumber: data.orderNumber,
        totalDisplay: data.totalDisplay,
        estimatedTime: data.estimatedTime,
      });
      setStep("success");
      clear();
      toast.success("Siparişiniz alındı! WhatsApp'tan da onay gönderildi.");
    } catch {
      toast.error("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(o) => !o && closeCart()}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col bg-cream">
        <SheetHeader className="px-5 py-4 border-b border-charcoal/8 bg-charcoal text-cream">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-cream flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-saffron" />
              {step === "cart" && "Sepetim"}
              {step === "checkout" && "Sipariş Bilgileri"}
              {step === "success" && "Sipariş Onayı"}
            </SheetTitle>
            {itemCount > 0 && step === "cart" && (
              <span className="text-xs text-cream/70">{itemCount} ürün</span>
            )}
          </div>
        </SheetHeader>

        {/* CART STEP */}
        {step === "cart" && (
          <>
            <div className="flex-1 overflow-y-auto custom-scroll p-4">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto rounded-full bg-charcoal/5 flex items-center justify-center mb-4">
                    <ShoppingBag className="h-8 w-8 text-charcoal/30" />
                  </div>
                  <p className="text-charcoal/60 font-medium">Sepetiniz boş</p>
                  <p className="text-xs text-charcoal/40 mt-1">Birkaç lezzetli pizza ekleyin!</p>
                  <Button onClick={closeCart} variant="outline" className="mt-4">
                    Menüyü gör
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 bg-white rounded-xl border border-charcoal/8">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-charcoal/5 shrink-0">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-charcoal/20">
                            <ShoppingBag className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-medium text-sm text-charcoal">{item.name}</h4>
                            {item.size && <p className="text-[11px] text-charcoal/55">{item.size}</p>}
                            {item.extras.length > 0 && (
                              <p className="text-[10px] text-charcoal/50 mt-0.5">
                                + {item.extras.map((e) => e.name).join(", ")}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-charcoal/30 hover:text-ember transition-colors"
                            aria-label="Kaldır"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1.5 bg-charcoal/5 rounded-lg p-0.5">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center rounded hover:bg-charcoal/10"
                              aria-label="Azalt"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center rounded hover:bg-charcoal/10"
                              aria-label="Artır"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="font-display font-bold text-ember text-sm">
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
              <div className="border-t border-charcoal/8 p-4 bg-white space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-charcoal/70">Ara toplam</span>
                  <span className="font-medium">{CURRENCY.formatShort(totalCents)}</span>
                </div>
                {!minMet && orderType === "DELIVERY" && (
                  <div className="text-xs text-ember bg-ember/5 p-2 rounded">
                    Min. sipariş {CONTACT.delivery.minOrder} ₺.{" "}
                    {CURRENCY.formatShort(CONTACT.delivery.minOrder * 100 - totalCents)} daha ekleyin.
                  </div>
                )}
                <Button
                  onClick={() => setStep("checkout")}
                  className="w-full bg-ember hover:bg-ember/90 text-cream"
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
              <button onClick={() => setStep("cart")} className="text-xs text-charcoal/60 hover:text-ember flex items-center gap-1">
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
                        ? "bg-ember text-cream border-ember shadow-md"
                        : "bg-white border-charcoal/15 hover:border-ember/40"
                    }`}
                  >
                    <Truck className="h-4 w-4" />
                    <span>Teslimat</span>
                    <span className="text-[10px] opacity-80">{CONTACT.delivery.deliveryTime}</span>
                  </button>
                  <button
                    onClick={() => setOrderType("PICKUP")}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all flex flex-col items-center gap-1 ${
                      orderType === "PICKUP"
                        ? "bg-ember text-cream border-ember shadow-md"
                        : "bg-white border-charcoal/15 hover:border-ember/40"
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
                  <Label htmlFor="co-name" className="text-[11px] text-charcoal/60">Ad Soyad *</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
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
                  <Label htmlFor="co-phone" className="text-[11px] text-charcoal/60">Telefon *</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
                    <Input
                      id="co-phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder="+90 5XX XXX XX XX"
                      maxLength={20}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="co-email" className="text-[11px] text-charcoal/60">E-posta (opsiyonel)</Label>
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

              {/* Delivery address — only for DELIVERY */}
              {orderType === "DELIVERY" && (
                <div className="space-y-3">
                  <Label className="text-xs font-semibold">Teslimat Adresi</Label>
                  {/* District dropdown */}
                  <div>
                    <Label htmlFor="co-district" className="text-[11px] text-charcoal/60">Bölge / Mahalle *</Label>
                    <div className="relative mt-1">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40 z-10" />
                      <select
                        id="co-district"
                        value={form.district}
                        onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
                        className="w-full pl-9 pr-3 py-2.5 rounded-md border border-charcoal/15 bg-white text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ember/30 focus:border-ember"
                      >
                        <option value="" disabled>Bölge seçin</option>
                        {CONTACT.delivery.serviceAreas.map((area) => (
                          <option key={area} value={area}>{area}</option>
                        ))}
                      </select>
                    </div>
                    <p className="text-[10px] text-charcoal/50 mt-1">
                      Listedeki bölgelere teslimat yapıyoruz
                    </p>
                  </div>
                  {/* Full address */}
                  <div>
                    <Label htmlFor="co-addr" className="text-[11px] text-charcoal/60">Tam Adres *</Label>
                    <Textarea
                      id="co-addr"
                      value={form.address}
                      onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                      placeholder="Mahalle, sokak, bina no, daire no, kat, ek tarif..."
                      maxLength={500}
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {/* Payment method */}
              <div>
                <Label className="text-xs font-semibold mb-2 block">Ödeme Yöntemi</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(PAYMENT_LABELS) as (keyof typeof PAYMENT_LABELS)[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setPaymentMethod(m as "CASH_ON_DELIVERY" | "CARD_ON_DELIVERY")}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all flex flex-col items-center gap-1 ${
                        paymentMethod === m
                          ? "bg-charcoal text-cream border-charcoal"
                          : "bg-white border-charcoal/15 hover:border-ember/40"
                      }`}
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>{PAYMENT_LABELS[m]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="co-notes" className="text-[11px] text-charcoal/60 flex items-center gap-1">
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

            <div className="border-t border-charcoal/8 p-4 bg-white space-y-3">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-charcoal/70">
                  <span>Ara toplam</span>
                  <span>{CURRENCY.formatShort(totalCents)}</span>
                </div>
                {orderType === "DELIVERY" && (
                  <div className="flex justify-between text-charcoal/70">
                    <span>Teslimat</span>
                    <span>
                      {deliveryCents === 0 ? (
                        <span className="text-basil font-medium">Ücretsiz</span>
                      ) : (
                        CURRENCY.formatShort(deliveryCents)
                      )}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base text-charcoal pt-1 border-t border-dashed border-charcoal/15">
                  <span>Toplam</span>
                  <span className="text-ember">{CURRENCY.formatShort(grandTotal)}</span>
                </div>
              </div>
              <Button
                onClick={handleCheckout}
                disabled={submitting}
                className="w-full bg-ember hover:bg-ember/90 text-cream h-12"
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
              <p className="text-[10px] text-charcoal/50 text-center">
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
            <h3 className="font-display text-2xl font-bold text-charcoal">Siparişiniz alındı!</h3>
            <p className="mt-2 text-charcoal/70">
              Sipariş numaranız:{" "}
              <span className="font-mono font-bold text-ember">{orderResult.orderNumber}</span>
            </p>
            <div className="mt-6 bg-white border border-charcoal/8 rounded-xl p-4 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-charcoal/70">Tahmini süre</span>
                <span className="font-medium">{orderResult.estimatedTime}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-charcoal/70">Toplam</span>
                <span className="font-bold text-ember">{orderResult.totalDisplay}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-charcoal/70">Ödeme</span>
                <span className="font-medium">{PAYMENT_LABELS[paymentMethod]}</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-basil/5 border border-basil/20 rounded-xl text-sm text-charcoal/70">
              <MessageSquare className="h-4 w-4 inline mr-1 text-basil" />
              Siparişinizi WhatsApp'tan da takip edebilirsiniz:{" "}
              <a href={CONTACT.whatsappHref} target="_blank" rel="noopener noreferrer" className="text-basil font-semibold underline">
                {CONTACT.whatsapp}
              </a>
            </div>
            <p className="mt-4 text-xs text-charcoal/55">
              Sipariş onaylandığında telefon ile haber vereceğiz. Teşekkür ederiz! 🍕
            </p>
            <Button
              onClick={() => {
                closeCart();
                setStep("cart");
                setOrderResult(null);
                setForm({ name: "", phone: "", email: "", district: (CONTACT.delivery.serviceAreas[0] as string) || "", address: "", notes: "" });
              }}
              className="w-full mt-6 bg-ember hover:bg-ember/90 text-cream"
            >
              Tamam, kapat
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
