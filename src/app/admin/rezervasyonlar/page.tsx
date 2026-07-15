"use client";

import * as React from "react";
import { CalendarCheck, RefreshCw, Phone, Mail, Users, Clock, Check, X, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Reservation {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  partySize: number;
  service: string;
  status: string;
  notes: string | null;
  createdAt: string;
}

const STATUS_META: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Bekliyor", cls: "bg-saffron/15 text-saffron border-saffron/30" },
  CONFIRMED: { label: "Onaylandı", cls: "bg-basil/15 text-basil border-basil/30" },
  CANCELLED: { label: "İptal", cls: "bg-ember/15 text-ember border-ember/30" },
  COMPLETED: { label: "Tamamlandı", cls: "bg-charcoal/10 text-charcoal border-charcoal/20" },
};

export default function AdminReservationsPage() {
  const [reservations, setReservations] = React.useState<Reservation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState("PENDING");
  const [updating, setUpdating] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reservations?status=${filter}&limit=100`, { cache: "no-store" });
      const data = await res.json();
      if (data.reservations) setReservations(data.reservations);
    } catch {
      toast.error("Rezervasyonlar yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  React.useEffect(() => {
    load();
  }, [load]);

  const update = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Rezervasyon: ${STATUS_META[status]?.label}`);
      load();
    } catch {
      toast.error("Güncellenemedi");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-charcoal">Rezervasyonlar</h1>
          <p className="text-sm text-charcoal/60 mt-1">{reservations.length} kayıt listeleniyor</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Bekleyenler</SelectItem>
              <SelectItem value="CONFIRMED">Onaylananlar</SelectItem>
              <SelectItem value="COMPLETED">Tamamlananlar</SelectItem>
              <SelectItem value="CANCELLED">İptal edilenler</SelectItem>
              <SelectItem value="ALL">Tümü</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : reservations.length === 0 ? (
        <Card className="p-12 text-center border-charcoal/8">
          <CalendarCheck className="h-12 w-12 mx-auto text-charcoal/20 mb-3" />
          <p className="text-charcoal/60">Bu filtrede rezervasyon yok</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {reservations.map((r) => (
            <Card key={r.id} className="p-4 border-charcoal/8 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="font-display text-lg font-bold text-charcoal">{r.name}</div>
                  <div className="text-xs text-charcoal/60 flex items-center gap-1 mt-0.5">
                    <Users className="h-3 w-3" />
                    {r.partySize} kişi · {r.service === "LUNCH" ? "Öğle" : "Akşam"} servisi
                  </div>
                </div>
                <Badge variant="outline" className={STATUS_META[r.status]?.cls}>
                  {STATUS_META[r.status]?.label}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <div className="text-[10px] text-charcoal/50 uppercase tracking-wide">Tarih</div>
                  <div className="font-medium">
                    {new Date(r.date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "short" })}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-charcoal/50 uppercase tracking-wide">Saat</div>
                  <div className="font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {r.time}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-charcoal/50 uppercase tracking-wide">Telefon</div>
                  <a href={`tel:${r.phone}`} className="font-medium text-ember flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {r.phone}
                  </a>
                </div>
                <div>
                  <div className="text-[10px] text-charcoal/50 uppercase tracking-wide">E-posta</div>
                  <a href={`mailto:${r.email}`} className="font-medium text-ember text-xs truncate flex items-center gap-1">
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate">{r.email}</span>
                  </a>
                </div>
              </div>

              {r.notes && (
                <div className="text-xs italic text-charcoal/65 bg-charcoal/5 p-2 rounded mb-3">
                  "💡 {r.notes}"
                </div>
              )}

              {r.status === "PENDING" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => update(r.id, "CONFIRMED")}
                    disabled={updating === r.id}
                    className="bg-basil hover:bg-basil/90 text-cream flex-1"
                  >
                    {updating === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5 mr-1" />}
                    Onayla
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => update(r.id, "CANCELLED")}
                    disabled={updating === r.id}
                    className="text-ember border-ember/30 hover:bg-ember/5"
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    İptal
                  </Button>
                </div>
              )}
              {r.status === "CONFIRMED" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => update(r.id, "COMPLETED")}
                  disabled={updating === r.id}
                  className="w-full"
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Tamamlandı olarak işaretle
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
