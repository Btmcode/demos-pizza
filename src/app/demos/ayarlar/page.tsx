"use client";

import * as React from "react";
import { Save, Loader2, Settings as SettingsIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const SETTING_GROUPS = [
  {
    title: "Site Bilgileri",
    description: "Genel site ayarları",
    keys: [
      { key: "SITE_NAME", label: "Site Adı", type: "text" },
      { key: "SITE_TAGLINE", label: "Slogan", type: "text" },
      { key: "HERO_BADGE", label: "Hero Rozet Metni", type: "text" },
      { key: "PROMO_BANNER_TEXT", label: "Promosyon Metni", type: "text" },
      { key: "PROMO_BANNER_ACTIVE", label: "Promosyon Aktif (true/false)", type: "text" },
    ],
  },
  {
    title: "Teslimat Ayarları",
    description: "Sipariş teslimat parametreleri (kuruş olarak)",
    keys: [
      { key: "DELIVERY_MIN_ORDER_CENTS", label: "Min. Sipariş (kuruş)", type: "number" },
      { key: "DELIVERY_FEE_CENTS", label: "Teslimat Ücreti (kuruş)", type: "number" },
      { key: "FREE_DELIVERY_THRESHOLD_CENTS", label: "Ücretsiz Teslimat Eşiği (kuruş)", type: "number" },
    ],
  },
  {
    title: "İletişim & Sosyal",
    description: "İletişim ve sosyal medya bağlantıları",
    keys: [
      { key: "WHATSAPP_NUMBER", label: "WhatsApp Numarası", type: "text" },
      { key: "INSTAGRAM_URL", label: "Instagram URL", type: "text" },
    ],
  },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", { cache: "no-store" });
      const data = await res.json();
      if (data.settings) setSettings(data.settings);
    } catch {
      toast.error("Ayarlar yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      if (!res.ok) throw new Error();
      toast.success("Ayarlar kaydedildi");
    } catch {
      toast.error("Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Ayarlar</h1>
          <p className="text-sm text-ink/60 mt-1">Site genel ayarları</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-pink hover:bg-pink/90 text-white">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Kaydet
            </>
          )}
        </Button>
      </div>

      {loading ? (
        <Skeleton className="h-96 w-full rounded-xl" />
      ) : (
        SETTING_GROUPS.map((group) => (
          <Card key={group.title} className="p-5 border-ink/8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-pink/10 text-pink flex items-center justify-center">
                <SettingsIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-ink">{group.title}</h3>
                <p className="text-xs text-ink/55">{group.description}</p>
              </div>
            </div>
            <div className="space-y-3">
              {group.keys.map((k) => (
                <div key={k.key}>
                  <Label htmlFor={`set-${k.key}`} className="text-xs font-mono">
                    {k.key}
                    <span className="ml-2 text-ink/40 normal-case font-sans">{k.label}</span>
                  </Label>
                  <Input
                    id={`set-${k.key}`}
                    type={k.type === "number" ? "number" : "text"}
                    value={settings[k.key] || ""}
                    onChange={(e) => setSettings((s) => ({ ...s, [k.key]: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              ))}
            </div>
          </Card>
        ))
      )}

      <Card className="p-5 border-yellow/20 bg-yellow/5">
        <h3 className="font-display font-bold text-ink mb-2">Güvenlik Bilgisi</h3>
        <p className="text-xs text-ink/70 leading-relaxed">
          Tüm ayar değişiklikleri aktivite kaydına işlenir. Şifre değişikliği, yeni admin kullanıcısı
          ekleme gibi işlemler için veritabanı yöneticinize başvurun. Production ortamında
          <code className="mx-1 px-1 py-0.5 bg-ink/10 rounded text-[10px]">ADMIN_BOOTSTRAP_*</code>
          env değişkenlerini kaldırdığınızdan emin olun.
        </p>
      </Card>
    </div>
  );
}
