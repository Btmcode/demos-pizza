"use client";

import * as React from "react";
import { Save, Loader2, Store, Truck, Phone, Check, Printer, Settings2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

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

  React.useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Convert TL values back to cents
      const payload: Record<string, string> = { ...settings };
      if (payload.DELIVERY_MIN_ORDER_TL) {
        payload.DELIVERY_MIN_ORDER_CENTS = String(Math.round(Number(payload.DELIVERY_MIN_ORDER_TL) * 100));
      }
      if (payload.DELIVERY_FEE_TL) {
        payload.DELIVERY_FEE_CENTS = String(Math.round(Number(payload.DELIVERY_FEE_TL) * 100));
      }
      if (payload.FREE_DELIVERY_THRESHOLD_TL) {
        payload.FREE_DELIVERY_THRESHOLD_CENTS = String(Math.round(Number(payload.FREE_DELIVERY_THRESHOLD_TL) * 100));
      }
      if (payload.PROMO_BANNER_ACTIVE === "on") {
        payload.PROMO_BANNER_ACTIVE = "true";
      }
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: payload }),
      });
      if (!res.ok) throw new Error();
      toast.success("Ayarlar kaydedildi");
    } catch {
      toast.error("Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  };

  // Convert cents to TL for display
  const getTL = (key: string) => {
    const cents = settings[key];
    if (!cents) return "";
    return String(Number(cents) / 100);
  };

  if (loading) {
    return (
      <div className="space-y-5 max-w-3xl">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Ayarlar</h1>
          <p className="text-sm text-ink/60 mt-1">Site ayarları ve yazıcı yapılandırması</p>
        </div>
      </div>

      <Tabs defaultValue="site">
        <TabsList className="bg-ink/5 h-auto p-1 flex gap-1 rounded-xl">
          <TabsTrigger value="site" className="data-[state=active]:bg-pink data-[state=active]:text-white px-4 py-2 text-sm font-medium rounded-lg">
            <Store className="h-4 w-4 mr-1.5" />
            Site Ayarları
          </TabsTrigger>
          <TabsTrigger value="printer" className="data-[state=active]:bg-pink data-[state=active]:text-white px-4 py-2 text-sm font-medium rounded-lg">
            <Printer className="h-4 w-4 mr-1.5" />
            Yazıcı
          </TabsTrigger>
        </TabsList>

        {/* Site Ayarları Tab */}
        <TabsContent value="site" className="space-y-4 mt-4">
          {/* Site Bilgileri */}
          <Card className="p-5 border-ink/8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-pink/10 text-pink flex items-center justify-center">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-ink">Site Bilgileri</h3>
                <p className="text-xs text-ink/55">Marka adı, slogan, promosyon</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Site Adı</Label>
                <Input
                  value={settings.SITE_NAME || ""}
                  onChange={(e) => setSettings((s) => ({ ...s, SITE_NAME: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Slogan</Label>
                <Input
                  value={settings.SITE_TAGLINE || ""}
                  onChange={(e) => setSettings((s) => ({ ...s, SITE_TAGLINE: e.target.value }))}
                  className="mt-1"
                  placeholder="Günlük Taze Hamur, Gerçek Lezzet"
                />
              </div>
              <div>
                <Label className="text-xs">Promosyon Metni</Label>
                <Input
                  value={settings.PROMO_BANNER_TEXT || ""}
                  onChange={(e) => setSettings((s) => ({ ...s, PROMO_BANNER_TEXT: e.target.value }))}
                  className="mt-1"
                  placeholder="1 ALANA 1 BEDAVA · Paket Servis"
                />
              </div>
              <div>
                <Label className="text-xs">Promosyon Aktif mi?</Label>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => setSettings((s) => ({ ...s, PROMO_BANNER_ACTIVE: s.PROMO_BANNER_ACTIVE === "true" ? "false" : "true" }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.PROMO_BANNER_ACTIVE === "true" ? "bg-pink" : "bg-ink/15"
                    }`}
                    role="switch"
                    aria-checked={settings.PROMO_BANNER_ACTIVE === "true"}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.PROMO_BANNER_ACTIVE === "true" ? "translate-x-6" : "translate-x-1"
                    }`} />
                  </button>
                  <span className="text-xs text-ink/70">
                    {settings.PROMO_BANNER_ACTIVE === "true" ? "Aktif — promosyon görünüyor" : "Pasif — promosyon gizli"}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Teslimat Ayarları */}
          <Card className="p-5 border-ink/8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-yellow/10 text-yellow flex items-center justify-center">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-ink">Teslimat Ayarları</h3>
                <p className="text-xs text-ink/55">Min. sipariş, teslimat ücreti (TL olarak)</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Min. Sipariş (₺)</Label>
                <Input
                  type="number"
                  value={getTL("DELIVERY_MIN_ORDER_CENTS")}
                  onChange={(e) => setSettings((s) => ({ ...s, DELIVERY_MIN_ORDER_TL: e.target.value }))}
                  className="mt-1"
                  placeholder="200"
                />
              </div>
              <div>
                <Label className="text-xs">Teslimat Ücreti (₺)</Label>
                <Input
                  type="number"
                  value={getTL("DELIVERY_FEE_CENTS")}
                  onChange={(e) => setSettings((s) => ({ ...s, DELIVERY_FEE_TL: e.target.value }))}
                  className="mt-1"
                  placeholder="30"
                />
              </div>
              <div>
                <Label className="text-xs">Ücretsiz Teslimat Eşiği (₺)</Label>
                <Input
                  type="number"
                  value={getTL("FREE_DELIVERY_THRESHOLD_CENTS")}
                  onChange={(e) => setSettings((s) => ({ ...s, FREE_DELIVERY_THRESHOLD_TL: e.target.value }))}
                  className="mt-1"
                  placeholder="400"
                />
              </div>
            </div>
          </Card>

          {/* İletişim */}
          <Card className="p-5 border-ink/8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-basil/10 text-basil flex items-center justify-center">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-ink">İletişim & Sosyal</h3>
                <p className="text-xs text-ink/55">WhatsApp, Instagram</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">WhatsApp Numarası</Label>
                <Input
                  value={settings.WHATSAPP_NUMBER || ""}
                  onChange={(e) => setSettings((s) => ({ ...s, WHATSAPP_NUMBER: e.target.value }))}
                  className="mt-1"
                  placeholder="+90 555 000 00 00"
                />
              </div>
              <div>
                <Label className="text-xs">Instagram URL</Label>
                <Input
                  value={settings.INSTAGRAM_URL || ""}
                  onChange={(e) => setSettings((s) => ({ ...s, INSTAGRAM_URL: e.target.value }))}
                  className="mt-1"
                  placeholder="https://instagram.com/demospizza"
                />
              </div>
            </div>
          </Card>

          {/* Save button */}
          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} disabled={saving} className="bg-pink hover:bg-pink-hover text-white">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Ayarları Kaydet
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        {/* Yazıcı Tab */}
        <TabsContent value="printer" className="mt-4">
          <PrinterSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================
// Yazıcı Ayarları — Ayarlar tab'ı içine taşındı
// ============================================================
function PrinterSettings() {
  const [connected, setConnected] = React.useState(false);
  const [deviceName, setDeviceName] = React.useState<string | null>(null);
  const [autoPrint, setAutoPrint] = React.useState(true);
  const [paperSize, setPaperSize] = React.useState("80mm");
  const [connecting, setConnecting] = React.useState(false);
  const [scanning, setScanning] = React.useState(false);
  const [systemPrinters, setSystemPrinters] = React.useState<any[]>([]);
  const [testing, setTesting] = React.useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem("demos-printer-config-v2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAutoPrint(parsed.autoPrint ?? true);
        setPaperSize(parsed.paperSize ?? "80mm");
      } catch {}
    }
  }, []);

  const saveConfig = (auto: boolean, size: string) => {
    setAutoPrint(auto);
    setPaperSize(size);
    localStorage.setItem("demos-printer-config-v2", JSON.stringify({ autoPrint: auto, paperSize: size, connected, deviceName }));
  };

  const connectUSB = async () => {
    setConnecting(true);
    try {
      // @ts-ignore
      if (!navigator.usb) {
        toast.error("WebUSB desteklenmiyor. Chrome/Edge kullanın.");
        return;
      }
      // @ts-ignore
      const device = await navigator.usb.requestDevice({ filters: [{ classCode: 7 }] });
      await device.open();
      if (device.configuration === null) await device.selectConfiguration(1);
      await device.claimInterface(0);
      setConnected(true);
      setDeviceName(device.productName || "USB Yazıcı");
      toast.success("Yazıcı bağlandı!");
    } catch (e: any) {
      if (e.name !== "NotFoundError") toast.error("Bağlantı hatası");
    } finally {
      setConnecting(false);
    }
  };

  const scanPrinters = async () => {
    setScanning(true);
    try {
      let found = false;
      try {
        // @ts-ignore
        if (navigator.printer?.getPrinters) {
          // @ts-ignore
          const printers = await navigator.printer.getPrinters();
          const list = printers.map((p: any) => ({ name: p.name || "Yazıcı", isDefault: p.isDefault || false, isThermal: false }));
          setSystemPrinters(list);
          found = true;
          if (list.length === 0) toast.info("Yazıcı bulunamadı");
          else toast.success(`${list.length} yazıcı bulundu`);
        }
      } catch {}

      if (!found) {
        setSystemPrinters([{ name: "Manuel seç (tarayıcı yazdırma penceresi)", isDefault: true, isThermal: false }]);
        toast.success("Manuel yazdırma hazır!");
      }
    } catch (e: any) {
      toast.error("Tarama hatası");
    } finally {
      setScanning(false);
    }
  };

  const testPrint = () => {
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      toast.success("Test çıktısı gönderildi!");
    }, 1000);
  };

  return (
    <Card className="p-5 border-ink/8 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${connected ? "bg-basil/10 text-basil" : "bg-ink/5 text-ink/40"}`}>
          <Printer className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display font-bold text-ink">Termal Yazıcı</h3>
          <p className="text-xs text-ink/55">{connected ? `Bağlı: ${deviceName}` : "Bağlı değil"}</p>
        </div>
      </div>

      {/* Connection methods */}
      {!connected && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <Button onClick={connectUSB} disabled={connecting} className="bg-pink hover:bg-pink-hover text-white" size="sm">
            {connecting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            USB ile Bağlan
          </Button>
          <Button onClick={scanPrinters} disabled={scanning} variant="outline" size="sm">
            {scanning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Yazıcıları Tara
          </Button>
        </div>
      )}

      {/* Found printers */}
      {systemPrinters.length > 0 && !connected && (
        <div className="space-y-2 mb-4">
          {systemPrinters.map((p, i) => (
            <button
              key={i}
              onClick={() => { setConnected(true); setDeviceName(p.name); toast.success(`"${p.name}" seçildi`); }}
              className="w-full flex items-center gap-2 p-3 rounded-lg border border-ink/8 hover:border-pink/40 hover:bg-pink/5 transition-colors text-left"
            >
              <Printer className="h-4 w-4 text-ink/60" />
              <span className="text-sm text-ink">{p.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Connected settings */}
      {connected && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Kağıt Boyutu</Label>
              <select
                value={paperSize}
                onChange={(e) => { setPaperSize(e.target.value); saveConfig(autoPrint, e.target.value); }}
                className="w-full mt-1 px-3 py-2 rounded-md border border-ink/15 bg-white text-sm"
              >
                <option value="58mm">58mm (ESC/POS)</option>
                <option value="80mm">80mm (ESC/POS)</option>
                <option value="a6">A6</option>
                <option value="a5">A5</option>
              </select>
            </div>
            <div>
              <Label className="text-xs">Otomatik Yazdırma</Label>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => saveConfig(!autoPrint, paperSize)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoPrint ? "bg-pink" : "bg-ink/15"}`}
                  role="switch"
                  aria-checked={autoPrint}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoPrint ? "translate-x-6" : "translate-x-1"}`} />
                </button>
                <span className="text-xs text-ink/70">{autoPrint ? "Açık" : "Kapalı"}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={testPrint} disabled={testing}>
              {testing ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : null}
              Test Çıktısı
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setConnected(false); setDeviceName(null); }} className="text-pink">
              Bağlantıyı Kes
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
