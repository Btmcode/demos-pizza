"use client";

import * as React from "react";
import {
  ShoppingBag,
  MessageSquare,
  UtensilsCrossed,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Flame,
  Printer,
  Volume2,
  VolumeX,
  Settings2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrderSound } from "@/hooks/use-order-sound";
import { useCurrentDate } from "@/hooks/use-hydration-safe";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface Stats {
  counts: {
    totalOrders: number;
    todayOrders: number;
    pendingOrders: number;
    todayReservations: number;
    pendingReservations: number;
    unprintedOrders: number;
    unreadMessages: number;
    totalMenuItems: number;
    availableMenuItems: number;
  };
  revenue: {
    todayCents: number;
    last30Cents: number;
    todayDisplay: string;
    last30Display: string;
  };
  charts: {
    dailyOrders: { date: string; count: number; revenue: number }[];
    popularItems: { name: string; count: number; revenue: number }[];
  };
}

const TR_DAYS = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

export default function AdminDashboard() {
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { soundEnabled, soundType, saveSettings, playSound, checkNewOrders, soundOptions } = useOrderSound();
  const [showSoundSettings, setShowSoundSettings] = React.useState(false);

  // Hydration-safe tarih — SSR ve client arası uyuşmazlığı önler
  const todayStr = useCurrentDate("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const load = React.useCallback(() => {
    fetch("/api/admin/stats", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((d) => {
        setStats(d);
        checkNewOrders(d.counts?.totalOrders ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [checkNewOrders]);

  React.useEffect(() => {
    load();
    const i = setInterval(load, 15000); // 15 saniyede bir kontrol
    return () => clearInterval(i);
  }, [load]);

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-ink">
            Merhaba! 👋
          </h1>
          <p className="text-xs md:text-sm text-ink/60 mt-1">
            {todayStr || "Yükleniyor..."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Sipariş ses bildirimi */}
          <div className="flex items-center gap-1.5 bg-ink/5 rounded-xl p-1">
            <button
              onClick={() => {
                const newEnabled = !soundEnabled;
                saveSettings(newEnabled, soundType);
                toast.success(newEnabled ? "Ses bildirimi açıldı" : "Ses bildirimi kapatıldı");
              }}
              className={`p-2 rounded-lg transition-colors ${soundEnabled ? "text-pink bg-pink/10" : "text-ink/30"}`}
              title={soundEnabled ? "Sesi kapat" : "Sesi aç"}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button
              onClick={() => playSound()}
              className="p-2 rounded-lg text-ink/50 hover:text-ink hover:bg-ink/5 transition-colors"
              title="Sesi test et"
            >
              <Flame className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowSoundSettings(!showSoundSettings)}
              className={`p-2 rounded-lg transition-colors ${showSoundSettings ? "text-pink bg-pink/10" : "text-ink/50 hover:text-ink hover:bg-ink/5"}`}
              title="Ses ayarları"
            >
              <Settings2 className="h-4 w-4" />
            </button>
          </div>
          <Badge className="bg-basil/10 text-basil border-basil/25">
            <span className="w-1.5 h-1.5 rounded-full bg-basil mr-1.5 pulse-dot" />
            Sistem aktif
          </Badge>
        </div>
      </div>

      {/* Ses ayarları paneli */}
      {showSoundSettings && (
        <Card className="p-4 border-ink/8 shadow-sm">
          <h3 className="font-display font-bold text-ink text-sm mb-3">Sipariş Ses Bildirimi</h3>
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="text-xs text-ink/60 mb-1 block">Ses Tipi</label>
              <Select
                value={soundType}
                onValueChange={(v) => {
                  saveSettings(soundEnabled, v as any);
                  setTimeout(() => playSound(v as any), 100);
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {soundOptions.map((opt) => (
                    <SelectItem key={opt.key} value={opt.key}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => playSound()}
              className="mt-5"
            >
              <Volume2 className="h-3.5 w-3.5 mr-1.5" />
              Test Et
            </Button>
            <p className="text-xs text-ink/50 mt-5">
              Yeni sipariş geldiğinde otomatik ses çalar. Her 15 saniyede kontrol edilir.
            </p>
          </div>
        </Card>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <KpiCard
          title="Bugünkü Sipariş"
          value={loading ? "—" : String(stats?.counts.todayOrders ?? 0)}
          sub={loading ? "..." : `${stats?.counts.pendingOrders ?? 0} bekleyen`}
          icon={<ShoppingBag className="h-5 w-5" />}
          color="ember"
        />
        <KpiCard
          title="Bugünkü Ciro"
          value={loading ? "—" : stats?.revenue.todayDisplay ?? "0 ₺"}
          sub={loading ? "..." : `30 gün: ${stats?.revenue.last30Display ?? "0 ₺"}`}
          icon={<TrendingUp className="h-5 w-5" />}
          color="saffron"
        />
        <KpiCard
          title="Yazdırılmamış"
          value={loading ? "—" : String(stats?.counts.unprintedOrders ?? 0)}
          sub={loading ? "..." : "yeni sipariş"}
          icon={<Printer className="h-5 w-5" />}
          color="basil"
        />
        <KpiCard
          title="Okunmamış Mesaj"
          value={loading ? "—" : String(stats?.counts.unreadMessages ?? 0)}
          sub={loading ? "..." : `Toplam menü: ${stats?.counts.totalMenuItems ?? 0}`}
          icon={<MessageSquare className="h-5 w-5" />}
          color="charcoal"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
        {/* Daily orders chart */}
        <Card className="lg:col-span-2 p-4 md:p-5 border-ink/8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-ink">Haftalık Sipariş Trendi</h3>
              <p className="text-xs text-ink/55">Son 7 günün sipariş sayısı</p>
            </div>
            <Badge variant="outline" className="text-pink border-pink/30">
              <Flame className="h-3 w-3 mr-1" />
              Canlı
            </Badge>
          </div>
          {loading ? (
            <Skeleton className="h-56 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={(stats?.charts.dailyOrders ?? []).map((d) => ({
                ...d,
                label: TR_DAYS[new Date(d.date).getDay()],
              }))}>
                <defs>
                  <linearGradient id="cOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#DC2626" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#DC2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7DFD3" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6B5D4F" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6B5D4F" }} axisLine={false} tickLine={false} width={28} />
                <Tooltip
                  contentStyle={{
                    background: "#0F0E0D",
                    border: "1px solid #F59E0B",
                    borderRadius: 8,
                    color: "#FFFBF5",
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#F59E0B" }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#DC2626"
                  strokeWidth={2}
                  fill="url(#cOrders)"
                  name="Sipariş"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Popular items */}
        <Card className="p-4 md:p-5 border-ink/8 shadow-sm">
          <h3 className="font-display font-bold text-ink mb-1">En Çok Satanlar</h3>
          <p className="text-xs text-ink/55 mb-3">Son 30 gün</p>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (stats?.charts.popularItems?.length ?? 0) === 0 ? (
            <p className="text-sm text-ink/50 py-8 text-center">Henüz veri yok</p>
          ) : (
            <div className="space-y-2.5">
              {(stats?.charts.popularItems ?? []).slice(0, 6).map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-pink/10 text-pink flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-ink truncate">{item.name}</div>
                    <div className="text-[10px] text-ink/50">
                      {item.count} adet · {Math.round(item.revenue / 100).toLocaleString("tr-TR")} ₺
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Quick actions */}
      <Card className="p-4 md:p-5 border-ink/8 shadow-sm">
        <h3 className="font-display font-bold text-ink mb-3">Hızlı Erişim</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          <QuickAction href="/demos/siparisler" icon={<ShoppingBag className="h-4 w-4" />} label="Siparişler" sub={loading ? "..." : `${stats?.counts.pendingOrders ?? 0} bekleyen`} />
          <QuickAction href="/demos/yazici" icon={<Printer className="h-4 w-4" />} label="Yazıcı" sub={loading ? "..." : `${stats?.counts.unprintedOrders ?? 0} yazdırılacak`} />
          <QuickAction href="/demos/mesajlar" icon={<MessageSquare className="h-4 w-4" />} label="Mesajlar" sub={loading ? "..." : `${stats?.counts.unreadMessages ?? 0} okunmamış`} />
          <QuickAction href="/demos/menu" icon={<UtensilsCrossed className="h-4 w-4" />} label="Menü" sub={loading ? "..." : `${stats?.counts.availableMenuItems ?? 0} aktif`} />
        </div>
      </Card>
    </div>
  );
}

function KpiCard({
  title,
  value,
  sub,
  icon,
  color,
}: {
  title: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  color: "ember" | "saffron" | "basil" | "charcoal";
}) {
  const colors = {
    ember: "bg-pink/10 text-pink",
    saffron: "bg-yellow/10 text-yellow",
    basil: "bg-basil/10 text-basil",
    charcoal: "bg-ink/10 text-ink",
  };
  return (
    <Card className="p-4 md:p-5 border-ink/8 shadow-sm card-hover">
      <div className="flex items-start justify-between mb-2.5 md:mb-3">
        <div className={`w-9 h-9 md:w-10 md:h-10 rounded-lg ${colors[color]} flex items-center justify-center`}>
          {icon}
        </div>
        <Clock className="h-3.5 w-3.5 text-ink/30" />
      </div>
      <div className="font-display text-xl md:text-3xl font-bold text-ink leading-none">
        {value}
      </div>
      <div className="text-xs text-ink/60 mt-1.5">{title}</div>
      <div className="text-[10px] text-ink/40 mt-0.5">{sub}</div>
    </Card>
  );
}

function QuickAction({
  href,
  icon,
  label,
  sub,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <a
      href={href}
      className="group flex items-center gap-3 p-3 rounded-xl border border-ink/8 hover:border-pink/40 hover:bg-pink/5 transition-colors"
    >
      <div className="w-9 h-9 rounded-lg bg-ink/5 text-ink/70 group-hover:bg-pink group-hover:text-white flex items-center justify-center transition-colors">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-ink">{label}</div>
        <div className="text-[10px] text-ink/50">{sub}</div>
      </div>
      <ArrowUpRight className="h-3.5 w-3.5 text-ink/30 group-hover:text-pink transition-colors" />
    </a>
  );
}
