"use client";

import * as React from "react";
import { TrendingUp, ShoppingBag, Users, Star, Download, Loader2, Printer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { toast } from "sonner";
import { DateDisplay } from "@/components/shared/date-display";

interface Stats {
  counts: {
    totalOrders: number;
    todayOrders: number;
    pendingOrders: number;
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

const COLORS = ["#FF2D8D", "#FFC400", "#111111", "#16A34A", "#FFB300", "#D9D9D9"];
const TR_DAYS = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

export default function ReportsPage() {
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(() => {
    setLoading(true);
    fetch("/api/admin/stats", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => toast.error("Raporlar yüklenemedi"))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const exportCSV = () => {
    if (!stats) return;
    const rows = [
      ["Tarih", "Sipariş Sayısı", "Ciro (TL)"],
      ...stats.charts.dailyOrders.map((d) => [d.date, d.count, (d.revenue / 100).toFixed(2)]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `demos-pizza-rapor-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Rapor CSV olarak indirildi");
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <h1 className="font-display text-3xl font-bold text-ink">Raporlar</h1>
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!stats) return null;

  const pieData = stats.charts.popularItems.slice(0, 6).map((item) => ({
    name: item.name,
    value: item.count,
  }));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-ink">Raporlar</h1>
          <p className="text-xs md:text-sm text-ink/60 mt-1">Detaylı satış ve performans analizi</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-3.5 w-3.5 mr-1.5" />
            CSV İndir
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            // Termal yazıcı için HTML fiş oluştur
            const html = generateReportHTML(stats);
            const iframe = document.createElement("iframe");
            iframe.style.position = "fixed";
            iframe.style.right = "0";
            iframe.style.bottom = "0";
            iframe.style.width = "0";
            iframe.style.height = "0";
            iframe.style.border = "0";
            document.body.appendChild(iframe);
            const doc = iframe.contentWindow?.document;
            if (!doc) return;
            doc.open();
            doc.write(html);
            doc.close();
            iframe.contentWindow?.focus();
            setTimeout(() => {
              iframe.contentWindow?.print();
              setTimeout(() => document.body.removeChild(iframe), 1000);
            }, 300);
          }}>
            <Printer className="h-3.5 w-3.5 mr-1.5" />
            Yazdır
          </Button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="p-4 md:p-5 border-ink/8 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="h-4 w-4 text-pink" />
            <span className="text-xs text-ink/60">Toplam Sipariş</span>
          </div>
          <div className="font-display text-2xl md:text-3xl font-bold text-ink">{stats.counts.totalOrders}</div>
        </Card>
        <Card className="p-4 md:p-5 border-ink/8 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-yellow" />
            <span className="text-xs text-ink/60">30 Günlük Ciro</span>
          </div>
          <div className="font-display text-2xl md:text-3xl font-bold text-ink">{stats.revenue.last30Display}</div>
        </Card>
        <Card className="p-4 md:p-5 border-ink/8 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-4 w-4 text-pink" />
            <span className="text-xs text-ink/60">Bugünkü Sipariş</span>
          </div>
          <div className="font-display text-2xl md:text-3xl font-bold text-ink">{stats.counts.todayOrders}</div>
        </Card>
        <Card className="p-4 md:p-5 border-ink/8 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-yellow" />
            <span className="text-xs text-ink/60">Aktif Ürün</span>
          </div>
          <div className="font-display text-2xl md:text-3xl font-bold text-ink">{stats.counts.availableMenuItems}</div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily Orders Bar Chart */}
        <Card className="p-4 md:p-5 border-ink/8 shadow-sm">
          <h3 className="font-display font-bold text-ink mb-4">Haftalık Sipariş Adedi</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.charts.dailyOrders.map((d) => ({ ...d, label: TR_DAYS[new Date(d.date).getDay()] }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#6B6B6B" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#6B6B6B" }} axisLine={false} tickLine={false} width={28} />
              <Tooltip contentStyle={{ background: "#111", border: "1px solid #FFC400", borderRadius: 8, color: "#fff", fontSize: 12 }} />
              <Bar dataKey="count" fill="#FF2D8D" radius={[4, 4, 0, 0]} name="Sipariş" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Popular Items Pie Chart */}
        <Card className="p-4 md:p-5 border-ink/8 shadow-sm">
          <h3 className="font-display font-bold text-ink mb-4">En Çok Satanlar (Adet)</h3>
          {pieData.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center text-ink/40 text-sm">Henüz veri yok</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#111", border: "1px solid #FFC400", borderRadius: 8, color: "#fff", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Revenue Table */}
      <Card className="p-4 md:p-5 border-ink/8 shadow-sm">
        <h3 className="font-display font-bold text-ink mb-4">Günlük Ciro Detayı</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink/5 text-ink/70">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Tarih</th>
                <th className="text-left px-4 py-3 font-medium">Sipariş</th>
                <th className="text-left px-4 py-3 font-medium">Ciro</th>
              </tr>
            </thead>
            <tbody>
              {stats.charts.dailyOrders.map((d, i) => (
                <tr key={i} className="border-t border-ink/5">
                  <td className="px-4 py-3"><DateDisplay date={d.date} options={{ day: "numeric", month: "long", weekday: "short" }} /></td>
                  <td className="px-4 py-3">{d.count}</td>
                  <td className="px-4 py-3 font-display font-bold text-pink">{(d.revenue / 100).toLocaleString("tr-TR")} ₺</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// Termal yazıcı için rapor HTML'i
function generateReportHTML(stats: Stats): string {
  const now = new Date().toLocaleString("tr-TR");
  const items = stats.charts.popularItems.slice(0, 6).map((item) =>
    `<tr><td>${item.name}</td><td style="text-align:right">${item.count}</td><td style="text-align:right">${(item.revenue / 100).toLocaleString("tr-TR")} ₺</td></tr>`
  ).join("");
  const dailyRows = stats.charts.dailyOrders.map((d) =>
    `<tr><td>${new Date(d.date).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}</td><td style="text-align:right">${d.count}</td><td style="text-align:right">${(d.revenue / 100).toLocaleString("tr-TR")} ₺</td></tr>`
  ).join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Rapor</title>
  <style>
    @page { size: 80mm auto; margin: 4mm; }
    * { font-family: 'Courier New', monospace; font-size: 11px; }
    body { padding: 8px; }
    h1 { font-size: 14px; text-align: center; margin: 4px 0; }
    h2 { font-size: 12px; margin: 8px 0 4px; }
    .sep { border-top: 1px dashed #000; margin: 4px 0; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 1px 0; }
    .total { font-weight: bold; }
    .center { text-align: center; }
  </style></head><body>
    <h1>DEMOS PIZZA</h1>
    <p class="center">Satış Raporu</p>
    <p class="center">${now}</p>
    <div class="sep"></div>
    <p><b>Toplam Sipariş:</b> ${stats.counts.totalOrders}</p>
    <p><b>Bugünkü Sipariş:</b> ${stats.counts.todayOrders}</p>
    <p><b>Bugünkü Ciro:</b> ${stats.revenue.todayDisplay}</p>
    <p><b>30 Günlük Ciro:</b> ${stats.revenue.last30Display}</p>
    <p><b>Aktif Ürün:</b> ${stats.counts.availableMenuItems}</p>
    <div class="sep"></div>
    <h2>GÜNLÜK DETAY</h2>
    <table>${dailyRows}</table>
    <div class="sep"></div>
    <h2>EN ÇOK SATANLAR</h2>
    <table>${items}</table>
    <div class="sep"></div>
    <p class="center">Demos Pizza · demospizza.com.tr</p>
    <script>window.onload = () => setTimeout(() => window.print(), 300);</script>
  </body></html>`;
}
