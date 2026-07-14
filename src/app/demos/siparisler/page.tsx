"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, RefreshCw, Phone, MapPin, Clock, ShoppingBag, Eye, Loader2, Trash2, Printer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CURRENCY } from "@/lib/constants";
import { DateDisplay } from "@/components/shared/date-display";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
  extras: string;
  notes?: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  orderType: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotalCents: number;
  deliveryCents: number;
  totalCents: number;
  deliveryAddress: string | null;
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
}

const STATUS_META: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Bekliyor", cls: "bg-yellow/15 text-yellow border-yellow/30" },
  CONFIRMED: { label: "Onaylandı", cls: "bg-blue-100 text-blue-700 border-blue-300" },
  PREPARING: { label: "Hazırlanıyor", cls: "bg-purple-100 text-purple-700 border-purple-300" },
  OUT_FOR_DELIVERY: { label: "Yolda", cls: "bg-indigo-100 text-indigo-700 border-indigo-300" },
  DELIVERED: { label: "Teslim Edildi", cls: "bg-basil/15 text-basil border-basil/30" },
  CANCELLED: { label: "İptal", cls: "bg-pink/15 text-pink border-pink/30" },
};

const ORDER_TYPE_LABEL: Record<string, string> = {
  DELIVERY: "Teslimat",
  PICKUP: "Gel-Al",
  DINE_IN: "Mekanda",
};

const NEXT_STATUS: Record<string, string | null> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "PREPARING",
  PREPARING: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "DELIVERED",
  DELIVERED: null,
  CANCELLED: null,
};

export default function AdminOrdersPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-ink/50">Yükleniyor...</div>}>
      <AdminOrdersContent />
    </React.Suspense>
  );
}

function AdminOrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [statusFilter, setStatusFilter] = React.useState(searchParams.get("status") || "ALL");
  const [q, setQ] = React.useState("");
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [updating, setUpdating] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      params.set("page", String(page));
      params.set("limit", "20");
      if (q) params.set("q", q);
      const res = await fetch(`/api/admin/orders?${params}`, { cache: "no-store" });
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
      if (data.pagination) setTotal(data.pagination.total);
    } catch {
      toast.error("Siparişler yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page, q]);

  React.useEffect(() => {
    const t = setTimeout(load, 100);
    return () => clearTimeout(t);
  }, [load]);

  // Sipariş yazdır — termal fiş formatı
  const printOrder = (order: any) => {
    const items = order.items?.map((it: any) => `<tr><td>${it.quantity}x ${it.name}</td><td style="text-align:right">${(it.unitPriceCents * it.quantity / 100).toLocaleString("tr-TR")} ₺</td></tr>`).join("") || "";
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${order.orderNumber}</title><style>@page{size:80mm auto;margin:4mm}*{font-family:'Courier New',monospace;font-size:11px}body{padding:8px}h1{font-size:14px;text-align:center;margin:4px 0}.sep{border-top:1px dashed #000;margin:4px 0}table{width:100%}td{padding:1px 0}.total{font-weight:bold;font-size:13px}</style></head><body><h1>DEMOS PIZZA</h1><p style="text-align:center">Sipariş: ${order.orderNumber}</p><p style="text-align:center">${new Date(order.createdAt).toLocaleString("tr-TR")}</p><div class="sep"></div><p><b>Müşteri:</b> ${order.customerName}</p><p><b>Tel:</b> ${order.customerPhone}</p>${order.deliveryAddress ? `<p><b>Adres:</b> ${order.deliveryAddress}</p>` : ""}<div class="sep"></div><table>${items}</table><div class="sep"></div><table><tr class="total"><td>TOPLAM</td><td style="text-align:right">${(order.totalCents / 100).toLocaleString("tr-TR")} ₺</td></tr></table><div class="sep"></div><p style="text-align:center">Teşekkürler!</p><script>window.onload=()=>setTimeout(()=>window.print(),300)</script></body></html>`;
    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (!doc) return;
    doc.open(); doc.write(html); doc.close();
    iframe.contentWindow?.focus();
    setTimeout(() => { iframe.contentWindow?.print(); setTimeout(() => document.body.removeChild(iframe), 1000); }, 300);
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        toast.error(d.error || "Güncellenemedi");
        return;
      }
      toast.success(`Sipariş durumu: ${STATUS_META[status]?.label}`);
      load();
      if (selectedOrder?.id === id) {
        setSelectedOrder((o) => (o ? { ...o, status } : null));
      }
    } catch {
      toast.error("Bağlantı hatası");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header + filters */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Siparişler</h1>
          <p className="text-sm text-ink/60 mt-1">{total} toplam sipariş</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40" />
            <Input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="İsim, telefon, sipariş no..."
              className="pl-9 w-56"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tümü</SelectItem>
              <SelectItem value="PENDING">Bekleyen</SelectItem>
              <SelectItem value="CONFIRMED">Onaylanan</SelectItem>
              <SelectItem value="PREPARING">Hazırlanan</SelectItem>
              <SelectItem value="OUT_FOR_DELIVERY">Yolda</SelectItem>
              <SelectItem value="DELIVERED">Teslim Edilen</SelectItem>
              <SelectItem value="CANCELLED">İptal</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
        ) : orders.length === 0 ? (
          <Card className="p-12 text-center border-ink/8">
            <ShoppingBag className="h-12 w-12 mx-auto text-ink/20 mb-3" />
            <p className="text-ink/60">Sipariş bulunamadı</p>
          </Card>
        ) : (
          orders.map((order) => {
            const next = NEXT_STATUS[order.status];
            return (
              <Card key={order.id} className="p-4 md:p-5 border-ink/8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-5">
                  {/* Order number + time */}
                  <div className="md:w-44 shrink-0">
                    <div className="font-mono text-sm font-bold text-pink">{order.orderNumber}</div>
                    <div className="text-[11px] text-ink/50 flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      <DateDisplay date={order.createdAt} options={{ day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }} />
                    </div>
                  </div>

                  {/* Customer */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-ink">{order.customerName}</div>
                    <div className="text-xs text-ink/60 flex items-center gap-1 mt-0.5">
                      <Phone className="h-3 w-3" />
                      {order.customerPhone}
                      {order.orderType === "DELIVERY" && order.deliveryAddress && (
                        <>
                          <span className="mx-1">·</span>
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{order.deliveryAddress.slice(0, 60)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Items count + total */}
                  <div className="md:text-right shrink-0">
                    <div className="text-xs text-ink/50">{order.items.length} ürün · {ORDER_TYPE_LABEL[order.orderType]}</div>
                    <div className="font-display font-bold text-lg text-ink">
                      {CURRENCY.formatShort(order.totalCents)}
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="shrink-0">
                    <Badge variant="outline" className={STATUS_META[order.status]?.cls}>
                      {STATUS_META[order.status]?.label}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap">
                    {next && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(order.id, next)}
                        disabled={updating === order.id}
                        className="bg-pink hover:bg-pink/90 text-white h-8 px-2.5 text-xs"
                      >
                        {updating === order.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <span className="hidden sm:inline">{STATUS_META[next]?.label}</span>
                            <span className="sm:hidden">İlerle</span>
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => setSelectedOrder(order)}
                      aria-label="Detay"
                      className="h-8 w-8 sm:h-9 sm:w-9"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => printOrder(order)}
                      aria-label="Yazdır"
                      className="h-8 w-8 sm:h-9 sm:w-9"
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-pink hover:bg-pink/5 h-8 w-8 sm:h-9 sm:w-9"
                      onClick={async () => {
                        if (confirm(`${order.orderNumber} numaralı siparişi silmek istediğinize emin misiniz?`)) {
                          try {
                            const res = await fetch(`/api/admin/orders/${order.id}`, { method: "DELETE" });
                            if (!res.ok) throw new Error();
                            toast.success("Sipariş silindi");
                            load();
                          } catch {
                            toast.error("Silinemedi");
                          }
                        }
                      }}
                      aria-label="Sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Önceki
          </Button>
          <span className="text-sm text-ink/60">
            Sayfa {page} / {Math.ceil(total / 20)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= Math.ceil(total / 20)}
            onClick={() => setPage((p) => p + 1)}
          >
            Sonraki
          </Button>
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(o) => !o && setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Sipariş Detayı</DialogTitle>
            <DialogDescription>
              {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto custom-scroll -mx-2 px-2">
              {/* Customer */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-ink/50">Müşteri</div>
                  <div className="font-medium">{selectedOrder.customerName}</div>
                </div>
                <div>
                  <div className="text-xs text-ink/50">Telefon</div>
                  <a href={`tel:${selectedOrder.customerPhone}`} className="font-medium text-pink">
                    {selectedOrder.customerPhone}
                  </a>
                </div>
                <div>
                  <div className="text-xs text-ink/50">E-posta</div>
                  <div className="font-medium">{selectedOrder.customerEmail || "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-ink/50">Sipariş tipi</div>
                  <div className="font-medium">{ORDER_TYPE_LABEL[selectedOrder.orderType]}</div>
                </div>
                {selectedOrder.deliveryAddress && (
                  <div className="col-span-2">
                    <div className="text-xs text-ink/50">Adres</div>
                    <div className="font-medium">{selectedOrder.deliveryAddress}</div>
                  </div>
                )}
                {selectedOrder.notes && (
                  <div className="col-span-2">
                    <div className="text-xs text-ink/50">Not</div>
                    <div className="font-medium italic">{selectedOrder.notes}</div>
                  </div>
                )}
              </div>

              {/* Items */}
              <div>
                <div className="text-xs text-ink/50 mb-2">Ürünler</div>
                <div className="space-y-2">
                  {selectedOrder.items.map((it) => (
                    <div key={it.id} className="flex justify-between items-start py-2 border-b border-ink/8 last:border-0">
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {it.quantity}× {it.name}
                        </div>
                        {it.extras && it.extras !== "[]" && (
                          <div className="text-xs text-ink/55 mt-0.5">
                            Ekstra: {JSON.parse(it.extras).map((e: any) => e.name).join(", ")}
                          </div>
                        )}
                        {it.notes && <div className="text-xs italic text-ink/55 mt-0.5">→ {it.notes}</div>}
                      </div>
                      <div className="text-sm font-medium">
                        {CURRENCY.formatShort(it.unitPriceCents * it.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-ink/5 rounded-lg p-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink/70">Ara toplam</span>
                  <span>{CURRENCY.formatShort(selectedOrder.subtotalCents)}</span>
                </div>
                {selectedOrder.deliveryCents > 0 && (
                  <div className="flex justify-between">
                    <span className="text-ink/70">Teslimat</span>
                    <span>{CURRENCY.formatShort(selectedOrder.deliveryCents)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base pt-1 border-t border-ink/15">
                  <span>Toplam</span>
                  <span className="text-pink">{CURRENCY.formatShort(selectedOrder.totalCents)}</span>
                </div>
              </div>

              {/* Status update */}
              <div>
                <div className="text-xs text-ink/50 mb-2">Durumu güncelle</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(STATUS_META).map(([key, meta]) => (
                    <Button
                      key={key}
                      size="sm"
                      variant={selectedOrder.status === key ? "default" : "outline"}
                      onClick={() => updateStatus(selectedOrder.id, key)}
                      disabled={updating === selectedOrder.id || selectedOrder.status === key}
                      className={selectedOrder.status === key ? "bg-pink hover:bg-pink-hover text-white" : ""}
                    >
                      {meta.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Yazdır butonu */}
              <Button
                onClick={() => printOrder(selectedOrder)}
                variant="outline"
                className="w-full"
                size="sm"
              >
                <Printer className="h-4 w-4 mr-2" />
                Yazdır
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

