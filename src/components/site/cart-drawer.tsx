"use client";

import * as React from "react";
import { X, Plus, Minus, Trash2, ShoppingBag, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "./cart-context";
import { CURRENCY, CONTACT } from "@/lib/constants";
import { toast } from "sonner";

type Step = "cart" | "checkout" | "success";

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, totalCents, clear, itemCount } = useCart();
  const [step, setStep] = React.useState<Step>("cart");
  const [orderType, setOrderType] = React.useState<"DELIVERY" | "PICKUP">("DELIVERY");
  const [form, setForm] = React.useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [orderResult, setOrderResult] = React.useState<{ orderNumber: string; totalDisplay: string; estimatedTime: string } | null>(null);

  // Reset step when drawer closes
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
      toast.error("Teslimat adresi gerekli");
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
        paymentMethod: "CASH_ON_DELIVERY" as const,
        items: items.map((i) => ({
          menuItemId: i.menuItemId,
          name: i.name + (i.size ? ` (${i.size})` : ""),
          quantity: i.quantity,
          unitPriceCents: i.unitPriceCents,
          extras: i.extras,
          notes: i.notes,
        })),
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
      toast.success("Siparişiniz alındı!");
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
            <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-4">
              <button onClick={() => setStep("cart")} className="text-xs text-charcoal/60 hover:text-ember">
                ← Sepete dön
              </button>

              {/* Order type */}
              <div>
                <Label className="text-xs font-medium">Sipariş tipi</Label>
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  <button
                    onClick={() => setOrderType("DELIVERY")}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                      orderType === "DELIVERY"
                        ? "bg-ember text-cream border-ember"
                        : "bg-white border-charcoal/15 hover:border-ember/40"
                    }`}
                  >
                    🛵 Teslimat
                    <div className="text-[10px] opacity-80 mt-0.5">{CONTACT.delivery.deliveryTime}</div>
                  </button>
                  <button
                    onClick={() => setOrderType("PICKUP")}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                      orderType === "PICKUP"
                        ? "bg-ember text-cream border-ember"
                        : "bg-white border-charcoal/15 hover:border-ember/40"
                    }`}
                  >
                    🏪 Gel-Al
                    <div className="text-[10px] opacity-80 mt-0.5">{CONTACT.delivery.pickupTime}</div>
                  </button>
                </div>
              </div>

              {/* Customer info */}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="co-name" className="text-xs">Ad Soyad *</Label>
                  <Input
                    id="co-name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Adınız"
                    maxLength={80}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="co-phone" className="text-xs">Telefon *</Label>
                  <Input
                    id="co-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+90 5XX XXX XX XX"
                    maxLength={20}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="co-email" className="text-xs">E-posta (opsiyonel)</Label>
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
                {orderType === "DELIVERY" && (
                  <div>
                    <Label htmlFor="co-addr" className="text-xs">Teslimat Adresi *</Label>
                    <Textarea
                      id="co-addr"
                      value={form.address}
                      onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                      placeholder="Mahalle, sokak, bina, daire no."
                      maxLength={500}
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="co-notes" className="text-xs">Sipariş notu (opsiyonel)</Label>
                  <Textarea
                    id="co-notes"
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="Çıtır olsun, sos koymayın vs."
                    maxLength={500}
                    rows={2}
                    className="mt-1"
                  />
                </div>
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
              <div className="text-xs text-charcoal/60 bg-charcoal/5 p-2 rounded">
                💵 Kapıda nakit / kart ile ödeme
              </div>
              <Button
                onClick={handleCheckout}
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
                    Siparişi Tamamla
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
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
                <span className="font-medium">Kapıda</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-charcoal/55">
              Siparişiniz onaylandığında size telefon ile haber vereceğiz.
              Teşekkür ederiz! 🍕
            </p>
            <Button
              onClick={() => {
                closeCart();
                setStep("cart");
                setOrderResult(null);
                setForm({ name: "", phone: "", email: "", address: "", notes: "" });
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
