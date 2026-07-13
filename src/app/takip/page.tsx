"use client";

import * as React from "react";
import { Search, Package, Truck, CheckCircle2, Clock, ChefHat, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CURRENCY } from "@/lib/constants";
import { toast } from "sonner";

const STATUS_FLOW = [
  { key: "PENDING", label: "Sipariş Alındı", icon: Clock, color: "text-yellow" },
  { key: "CONFIRMED", label: "Onaylandı", icon: CheckCircle2, color: "text-blue-400" },
  { key: "PREPARING", label: "Hazırlanıyor", icon: ChefHat, color: "text-yellow" },
  { key: "OUT_FOR_DELIVERY", label: "Yolda", icon: Truck, color: "text-blue-400" },
  { key: "DELIVERED", label: "Teslim Edildi", icon: CheckCircle2, color: "text-basil" },
];

export default function TrackPage() {
  const [orderNumber, setOrderNumber] = React.useState("");
  const [order, setOrder] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [searched, setSearched] = React.useState(false);

  const handleSearch = async () => {
    if (!orderNumber.trim()) {
      toast.error("Sipariş numarası girin");
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/orders/track?orderNumber=${encodeURIComponent(orderNumber.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setOrder(null);
        toast.error(data.error || "Sipariş bulunamadı");
        return;
      }
      setOrder(data.order);
    } catch {
      toast.error("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = order ? STATUS_FLOW.findIndex(s => s.key === order.status) : -1;

  return (
    <div className="min-h-screen bg-paper">
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-16 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-ink">
            Sipariş Takibi
          </h1>
          <p className="text-sm text-ink/60 mt-2">
            Sipariş numaranı gir, durumunu anında gör
          </p>
        </div>

        {/* Search */}
        <Card className="p-5 border-ink/8 shadow-sm mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40" />
              <Input
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="DP-XXXXXXXX-XXXX"
                className="pl-9 font-mono uppercase"
                maxLength={20}
              />
            </div>
            <Button onClick={handleSearch} disabled={loading} className="bg-pink hover:bg-pink-hover text-white">
              {loading ? "Aranıyor..." : "Sorgula"}
            </Button>
          </div>
          <p className="text-[11px] text-ink/40 mt-2">
            Sipariş numaran sipariş onayında gösterilir ve WhatsApp'tan gönderilir
          </p>
        </Card>

        {/* Result */}
        {searched && !loading && !order && (
          <Card className="p-8 text-center border-ink/8">
            <Package className="h-12 w-12 mx-auto text-ink/20 mb-3" />
            <p className="text-ink/60">Sipariş bulunamadı</p>
            <p className="text-xs text-ink/40 mt-1">Numarayı kontrol edip tekrar dene</p>
          </Card>
        )}

        {order && (
          <Card className="p-5 md:p-6 border-ink/8 shadow-sm space-y-5">
            {/* Order header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-mono text-lg font-bold text-pink">{order.orderNumber}</div>
                <div className="text-xs text-ink/50 mt-0.5">
                  {new Date(order.createdAt).toLocaleString("tr-TR")}
                </div>
              </div>
              <Badge className={
                order.status === "DELIVERED" ? "bg-basil/15 text-basil border-basil/30" :
                order.status === "CANCELLED" ? "bg-ember/15 text-ember border-ember/30" :
                "bg-yellow/15 text-yellow border-yellow/30"
              }>
                {STATUS_FLOW.find(s => s.key === order.status)?.label || order.status}
              </Badge>
            </div>

            {/* Status timeline */}
            {order.status !== "CANCELLED" ? (
              <div className="flex items-center justify-between gap-1">
                {STATUS_FLOW.map((step, i) => {
                  const Icon = step.icon;
                  const isActive = i <= currentStepIndex;
                  const isCurrent = i === currentStepIndex;
                  return (
                    <React.Fragment key={step.key}>
                      <div className="flex flex-col items-center gap-1.5 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isActive ? `${step.color} bg-ink/5` : "text-ink/20 bg-ink/5"
                        } ${isCurrent ? "ring-2 ring-pink/30" : ""}`}>
                          <Icon className={`h-5 w-5 ${isActive ? "" : "opacity-30"}`} />
                        </div>
                        <span className={`text-[9px] text-center leading-tight ${isActive ? "text-ink font-medium" : "text-ink/30"}`}>
                          {step.label}
                        </span>
                      </div>
                      {i < STATUS_FLOW.length - 1 && (
                        <div className={`h-0.5 flex-1 ${i < currentStepIndex ? "bg-pink" : "bg-ink/10"}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-ember/5 border border-ember/20">
                <XCircle className="h-5 w-5 text-ember shrink-0" />
                <span className="text-sm text-ember">Bu sipariş iptal edilmiştir</span>
              </div>
            )}

            {/* Items */}
            <div className="space-y-2 pt-2 border-t border-ink/8">
              <div className="text-xs font-semibold text-ink/60 uppercase tracking-wide">Ürünler</div>
              {order.items.map((item: any, i: number) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-ink/80">{item.quantity}× {item.name}</span>
                  <span className="text-ink/60">{CURRENCY.formatShort(item.unitPriceCents * item.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold pt-2 border-t border-ink/8">
                <span>Toplam</span>
                <span className="text-pink">{CURRENCY.formatShort(order.totalCents)}</span>
              </div>
            </div>

            {/* CTA */}
            <a href="/" className="block">
              <Button variant="outline" className="w-full">
                Yeni Sipariş Ver
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </Card>
        )}
      </div>
    </div>
  );
}
