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
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
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

  const load = React.useCallback(() => {
    fetch("/api/admin/stats", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((d) => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
    const i = setInterval(load, 30000);
    return () => clearInterval(i);
  }, [load]);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-charcoal">
            Hoş geldiniz! 👋
          </h1>
          <p className="text-sm text-charcoal/60 mt-1">
            {new Date().toLocaleDateString("tr-TR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <Badge className="bg-basil/15 text-basil border-basil/30">
          <span className="w-1.5 h-1.5 rounded-full bg-basil mr-1.5 animate-pulse" />
          Sistem aktif
        </Badge>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Bugünkü Sipariş"
          value={loading ? "—" : String(stats?.counts.todayOrders ?? 0)}
          sub={`${stats?.counts.pendingOrders ?? 0} bekleyen`}
          icon={<ShoppingBag className="h-5 w-5" />}
          color="ember"
        />
        <KpiCard
          title="Bugünkü Ciro"
          value={loading ? "—" : stats?.revenue.todayDisplay ?? "0 ₺"}
          sub={`30 gün: ${stats?.revenue.last30Display ?? "0 ₺"}`}
          icon={<TrendingUp className="h-5 w-5" />}
          color="saffron"
        />
        <KpiCard
          title="Yazdırılmamış"
          value={loading ? "—" : String(stats?.counts.unprintedOrders ?? 0)}
          sub="yeni sipariş"
          icon={<Printer className="h-5 w-5" />}
          color="basil"
        />
        <KpiCard
          title="Okunmamış Mesaj"
          value={loading ? "—" : String(stats?.counts.unreadMessages ?? 0)}
          sub={`Toplam menü: ${stats?.counts.totalMenuItems ?? 0}`}
          icon={<MessageSquare className="h-5 w-5" />}
          color="charcoal"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Daily orders chart */}
        <Card className="lg:col-span-2 p-5 border-charcoal/8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-charcoal">Haftalık Sipariş Trendi</h3>
              <p className="text-xs text-charcoal/55">Son 7 günün sipariş sayısı</p>
            </div>
            <Badge variant="outline" className="text-ember border-ember/30">
              <Flame className="h-3 w-3 mr-1" />
              Canlı
            </Badge>
          </div>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={(stats?.charts.dailyOrders ?? []).map((d) => ({
                ...d,
                label: TR_DAYS[new Date(d.date).getDay()],
              }))}>
                <defs>
                  <linearGradient id="cOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D62828" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#D62828" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7D9B6" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#6B5849" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#6B5849" }} axisLine={false} tickLine={false} width={30} />
                <Tooltip
                  contentStyle={{
                    background: "#1A1410",
                    border: "1px solid #F77F00",
                    borderRadius: 12,
                    color: "#FAF3E0",
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#F77F00" }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#D62828"
                  strokeWidth={2.5}
                  fill="url(#cOrders)"
                  name="Sipariş"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Popular items */}
        <Card className="p-5 border-charcoal/8 shadow-sm">
          <h3 className="font-display font-bold text-charcoal mb-1">En Çok Satanlar</h3>
          <p className="text-xs text-charcoal/55 mb-4">Son 30 gün</p>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (stats?.charts.popularItems?.length ?? 0) === 0 ? (
            <p className="text-sm text-charcoal/50 py-8 text-center">Henüz veri yok</p>
          ) : (
            <div className="space-y-3">
              {(stats?.charts.popularItems ?? []).slice(0, 6).map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-ember/10 text-ember flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-charcoal truncate">{item.name}</div>
                    <div className="text-[10px] text-charcoal/50">
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
      <Card className="p-5 border-charcoal/8 shadow-sm">
        <h3 className="font-display font-bold text-charcoal mb-4">Hızlı Erişim</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickAction href="/admin/siparisler" icon={<ShoppingBag className="h-4 w-4" />} label="Siparişler" sub={`${stats?.counts.pendingOrders ?? 0} bekleyen`} />
          <QuickAction href="/admin/yazici" icon={<Printer className="h-4 w-4" />} label="Termal Yazıcı" sub={`${stats?.counts.unprintedOrders ?? 0} yazdırılacak`} />
          <QuickAction href="/admin/mesajlar" icon={<MessageSquare className="h-4 w-4" />} label="Mesajlar" sub={`${stats?.counts.unreadMessages ?? 0} okunmamış`} />
          <QuickAction href="/admin/menu" icon={<UtensilsCrossed className="h-4 w-4" />} label="Menü" sub={`${stats?.counts.availableMenuItems ?? 0} aktif`} />
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
    ember: "bg-ember/10 text-ember",
    saffron: "bg-saffron/10 text-saffron",
    basil: "bg-basil/10 text-basil",
    charcoal: "bg-charcoal/10 text-charcoal",
  };
  return (
    <Card className="p-5 border-charcoal/8 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-full ${colors[color]} flex items-center justify-center`}>
          {icon}
        </div>
        <Clock className="h-3.5 w-3.5 text-charcoal/30" />
      </div>
      <div className="font-display text-2xl md:text-3xl font-bold text-charcoal">
        {value}
      </div>
      <div className="text-xs text-charcoal/60 mt-1">{title}</div>
      <div className="text-[10px] text-charcoal/40 mt-1">{sub}</div>
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
      className="group flex items-center gap-3 p-3 rounded-xl border border-charcoal/8 hover:border-ember/40 hover:bg-ember/5 transition-all"
    >
      <div className="w-9 h-9 rounded-lg bg-charcoal/5 text-charcoal/70 group-hover:bg-ember group-hover:text-cream flex items-center justify-center transition-colors">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-charcoal">{label}</div>
        <div className="text-[10px] text-charcoal/50">{sub}</div>
      </div>
      <ArrowUpRight className="h-3.5 w-3.5 text-charcoal/30 group-hover:text-ember transition-colors" />
    </a>
  );
}
