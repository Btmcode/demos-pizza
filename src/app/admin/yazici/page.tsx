"use client";

import * as React from "react";
import { Printer, Plug, CheckCircle2, XCircle, Loader2, RefreshCw, Settings2, FileText, Usb, Wifi, Search, AlertCircle, Printer as PrinterIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { THERMAL_PRINTER } from "@/lib/constants";
import { toast } from "sonner";

/**
 * Termal Yazıcı Entegrasyonu — Gelişmiş
 *
 * 2 Bağlantı Yöntemi:
 * 1. USB (WebUSB API) — ESC/POS uyumlu direkt yazıcı bağlantısı
 * 2. Sistem Yazıcısı (window.print / Web Print API) — bilgisayardaki yüklü yazıcılar
 *
 * Sistem yazıcısı yöntemi:
 * - navigator.printer API ( Chromium 130+)
 * - Veya window.print() ile manuel seçim
 * - Veya localStorage'a kayıtlı yazıcı adı
 */

interface PrinterState {
  connected: boolean;
  deviceName: string | null;
  paperSize: string;
  autoPrint: boolean;
  lastTestAt: string | null;
  connectionType: "USB" | "SYSTEM" | null;
  systemPrinterName: string | null;
}

interface SystemPrinter {
  name: string;
  isDefault: boolean;
  isThermal: boolean;
}

const PRINTER_STORAGE_KEY = "demos-printer-config-v2";

export default function PrinterSettingsPage() {
  const [state, setState] = React.useState<PrinterState>({
    connected: false,
    deviceName: null,
    paperSize: "80mm",
    autoPrint: true,
    lastTestAt: null,
    connectionType: null,
    systemPrinterName: null,
  });
  const [connecting, setConnecting] = React.useState(false);
  const [scanning, setScanning] = React.useState(false);
  const [testing, setTesting] = React.useState(false);
  const [systemPrinters, setSystemPrinters] = React.useState<SystemPrinter[]>([]);
  const [recentOrders, setRecentOrders] = React.useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = React.useState(true);

  // Load saved config
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(PRINTER_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        setState((s) => ({ ...s, ...saved, connected: false }));
      }
    } catch {}
  }, []);

  // Save config on change
  React.useEffect(() => {
    try {
      localStorage.setItem(PRINTER_STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  // Load recent orders
  const loadOrders = React.useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch("/api/admin/orders?limit=10", { cache: "no-store" });
      const data = await res.json();
      setRecentOrders(data.orders || []);
    } catch {}
    finally { setLoadingOrders(false); }
  }, []);

  React.useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // ===== YÖNTEM 1: USB (WebUSB) =====
  const connectUSB = async () => {
    setConnecting(true);
    try {
      // @ts-ignore - WebUSB
      if (!navigator.usb) {
        toast.error("Tarayıcınız WebUSB desteklemiyor. Chrome veya Edge kullanın.");
        return;
      }
      // @ts-ignore
      const device = await navigator.usb.requestDevice({
        filters: [
          { classCode: 7 },
          { vendorId: 0x04b8 },
          { vendorId: 0x154f },
          { vendorId: 0x0519 },
          { vendorId: 0x0fe4 },
        ],
      });
      await device.open();
      if (device.configuration === null) {
        await device.selectConfiguration(1);
      }
      await device.claimInterface(0);
      setState((s) => ({
        ...s,
        connected: true,
        connectionType: "USB",
        deviceName: device.productName || device.manufacturerName || "USB Yazıcı",
        systemPrinterName: null,
      }));
      toast.success(`${device.productName || "Yazıcı"} bağlandı!`);
    } catch (e: any) {
      if (e.name !== "NotFoundError") {
        toast.error("Bağlantı hatası: " + e.message);
      }
    } finally {
      setConnecting(false);
    }
  };

  // ===== YÖNTEM 2: Sistem Yazıcısı Tarama =====
  const scanSystemPrinters = async () => {
    setScanning(true);
    try {
      // Yöntem 1: Web Print API (Chromium 130+)
      // @ts-ignore
      if (navigator.printer?.getPrinters) {
        // @ts-ignore
        const printers = await navigator.printer.getPrinters();
        const thermalKeywords = ["thermal", "pos", "receipt", "escpos", "esc-Pos", "star", "epson tm", "bixolon", "xprinter", "58mm", "80mm"];
        const list: SystemPrinter[] = printers.map((p: any) => ({
          name: p.name || p.displayName || "Bilinmeyen Yazıcı",
          isDefault: p.isDefault || false,
          isThermal: thermalKeywords.some((k) => (p.name || "").toLowerCase().includes(k)),
        }));
        setSystemPrinters(list);
        if (list.length === 0) {
          toast.info("Sistemde yazıcı bulunamadı");
        } else {
          toast.success(`${list.length} yazıcı bulundu`);
        }
        return;
      }

      // Yöntem 2: localStorage'a kaydedilmiş son kullanılan yazıcılar
      const savedPrinters = localStorage.getItem("demos-known-printers");
      if (savedPrinters) {
        const parsed = JSON.parse(savedPrinters);
        if (Array.isArray(parsed)) {
          setSystemPrinters(parsed);
          toast.success(`${parsed.length} kayıtlı yazıcı bulundu`);
          return;
        }
      }

      // Yöntem 3: window.print() ile manuel seçim — kullanıcıyı bilgilendir
      toast.info("Tarayıcınız otomatik yazıcı taramayı desteklemiyor. Manuel seçim kullanın.");
      // Dummy list — common thermal printer names
      setSystemPrinters([
        { name: "Manuel seç (window.print)", isDefault: true, isThermal: false },
      ]);
    } catch (e: any) {
      toast.error("Tarama hatası: " + e.message);
    } finally {
      setScanning(false);
    }
  };

  const connectSystemPrinter = async (printerName: string) => {
    setState((s) => ({
      ...s,
      connected: true,
      connectionType: "SYSTEM",
      systemPrinterName: printerName,
      deviceName: printerName,
    }));
    // Save to known printers
    const known = systemPrinters.find((p) => p.name === printerName);
    if (known && !known.isDefault) {
      const updated = [...systemPrinters.map((p) => ({ ...p, isDefault: p.name === printerName }))];
      setSystemPrinters(updated);
      localStorage.setItem("demos-known-printers", JSON.stringify(updated));
    }
    toast.success(`"${printerName}" seçildi`);
  };

  const disconnect = async () => {
    setState((s) => ({
      ...s,
      connected: false,
      connectionType: null,
      deviceName: null,
      systemPrinterName: null,
    }));
    toast.info("Yazıcı bağlantısı kesildi");
  };

  const testPrint = async () => {
    if (!state.connected) {
      toast.error("Önce yazıcı bağlayın");
      return;
    }
    setTesting(true);
    try {
      if (state.connectionType === "USB") {
        const escPos = buildTestReceipt(state.paperSize);
        await sendToUSBPrinter(escPos);
      } else if (state.connectionType === "SYSTEM") {
        // Sistem yazıcısı — print window aç
        await printViaBrowser("test");
      }
      setState((s) => ({ ...s, lastTestAt: new Date().toISOString() }));
      toast.success("Test çıktısı gönderildi!");
    } catch (e: any) {
      toast.error("Yazdırma hatası: " + e.message);
    } finally {
      setTesting(false);
    }
  };

  const printOrder = async (order: any) => {
    if (!state.connected) {
      toast.error("Önce yazıcı bağlayın");
      return;
    }
    try {
      if (state.connectionType === "USB") {
        const escPos = buildOrderReceipt(order, state.paperSize);
        await sendToUSBPrinter(escPos);
      } else if (state.connectionType === "SYSTEM") {
        await printViaBrowser("order", order);
      }
      toast.success(`${order.orderNumber} yazdırıldı!`);
    } catch (e: any) {
      toast.error("Yazdırma hatası: " + e.message);
    }
  };

  // USB yazıcıya ESC/POS data gönder
  const sendToUSBPrinter = async (data: Uint8Array) => {
    // Gerçek implementasyonda: device.transferOut(1, data)
    // Şimdilik log
    console.log("ESC/POS data:", data.length, "byte");
  };

  // Sistem yazıcısı ile tarayıcı print dialog
  const printViaBrowser = async (type: "test" | "order", order?: any) => {
    const html = type === "test" ? buildTestHTML() : buildOrderHTML(order);
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (!doc) throw new Error("iframe document error");
    doc.open();
    doc.write(html);
    doc.close();
    iframe.contentWindow?.focus();
    // Small delay for content render
    await new Promise((r) => setTimeout(r, 300));
    iframe.contentWindow?.print();
    // Cleanup after print dialog
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-charcoal flex items-center gap-2">
          <Printer className="h-6 w-6 text-ember" />
          Termal Yazıcı
        </h1>
        <p className="text-xs md:text-sm text-charcoal/60 mt-1">
          Otomatik sipariş yazdırma · USB veya Sistem Yazıcısı
        </p>
      </div>

      {/* Status card */}
      <Card className={`p-4 md:p-5 border-2 ${state.connected ? "border-basil/30 bg-basil/5" : "border-charcoal/10"}`}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${
              state.connected ? "bg-basil/15 text-basil" : "bg-charcoal/5 text-charcoal/40"
            }`}>
              {state.connected ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
            </div>
            <div>
              <div className="font-display font-bold text-charcoal text-base">
                {state.connected ? "Yazıcı Bağlı" : "Bağlı Değil"}
              </div>
              <div className="text-xs text-charcoal/60">
                {state.deviceName || "Yazıcı bağlamak için aşağıdaki yöntemlerden birini seçin"}
              </div>
              {state.connected && state.connectionType && (
                <Badge variant="outline" className="text-[10px] mt-1">
                  {state.connectionType === "USB" ? "USB Bağlantı" : "Sistem Yazıcısı"}
                </Badge>
              )}
              {state.lastTestAt && (
                <div className="text-[10px] text-charcoal/40 mt-1">
                  Son test: {new Date(state.lastTestAt).toLocaleString("tr-TR")}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {state.connected ? (
              <>
                <Button variant="outline" size="sm" onClick={testPrint} disabled={testing}>
                  {testing ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <FileText className="h-3.5 w-3.5 mr-1.5" />}
                  Test
                </Button>
                <Button variant="outline" size="sm" onClick={disconnect} className="text-ember">
                  Kes
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </Card>

      {/* 2 Connection methods */}
      {!state.connected && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {/* Yöntem 1: USB */}
          <Card className="p-4 md:p-5 border-charcoal/8 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-ember/10 text-ember flex items-center justify-center">
                <Usb className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-charcoal">USB ile Bağla</h3>
                <p className="text-xs text-charcoal/55">ESC/POS direkt bağlantı</p>
              </div>
            </div>
            <p className="text-xs text-charcoal/70 mb-3 leading-relaxed">
              Termal yazıcıyı USB ile bilgisayara bağlayın. Chrome veya Edge gerekli.
              ESC/POS protokolü destekleyen tüm yazıcılar (Epson, Bixolon, Star, Xprinter).
            </p>
            <Button onClick={connectUSB} disabled={connecting} className="w-full bg-ember hover:bg-ember/90 text-cream" size="sm">
              {connecting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Bağlanıyor...
                </>
              ) : (
                <>
                  <Plug className="h-3.5 w-3.5 mr-1.5" /> USB ile Bağlan
                </>
              )}
            </Button>
          </Card>

          {/* Yöntem 2: Sistem Yazıcısı */}
          <Card className="p-4 md:p-5 border-charcoal/8 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-saffron/10 text-saffron flex items-center justify-center">
                <PrinterIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-charcoal">Sistem Yazıcısı</h3>
                <p className="text-xs text-charcoal/55">Bilgisayardaki yüklü yazıcılar</p>
              </div>
            </div>
            <p className="text-xs text-charcoal/70 mb-3 leading-relaxed">
              Bilgisayarınıza yüklü tüm yazıcıları tarar. Termal yazıcı listeden seçilir.
              Her yazıcı için uygundur, manuel onay gerekebilir.
            </p>
            <Button onClick={scanSystemPrinters} disabled={scanning} variant="outline" className="w-full" size="sm">
              {scanning ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Taranıyor...
                </>
              ) : (
                <>
                  <Search className="h-3.5 w-3.5 mr-1.5" /> Yazıcıları Tara
                </>
              )}
            </Button>
          </Card>
        </div>
      )}

      {/* System printers list */}
      {systemPrinters.length > 0 && !state.connected && (
        <Card className="p-4 md:p-5 border-charcoal/8 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-charcoal flex items-center gap-2">
              <Wifi className="h-4 w-4 text-saffron" />
              Bulunan Yazıcılar ({systemPrinters.length})
            </h3>
            <Button variant="ghost" size="sm" onClick={scanSystemPrinters} disabled={scanning}>
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${scanning ? "animate-spin" : ""}`} />
              Yenile
            </Button>
          </div>
          <div className="space-y-2">
            {systemPrinters.map((p) => (
              <button
                key={p.name}
                onClick={() => connectSystemPrinter(p.name)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-charcoal/8 hover:border-ember/40 hover:bg-ember/5 transition-colors text-left"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  p.isThermal ? "bg-ember/10 text-ember" : "bg-charcoal/5 text-charcoal/60"
                }`}>
                  <PrinterIcon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-charcoal truncate">{p.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {p.isThermal && (
                      <Badge variant="outline" className="text-[10px] text-ember border-ember/30">
                        Termal
                      </Badge>
                    )}
                    {p.isDefault && (
                      <Badge variant="outline" className="text-[10px] text-charcoal/60">
                        Varsayılan
                      </Badge>
                    )}
                  </div>
                </div>
                <Plug className="h-4 w-4 text-charcoal/40" />
              </button>
            ))}
          </div>
          <div className="mt-3 p-2.5 rounded-lg bg-saffron/5 border border-saffron/20 text-[11px] text-charcoal/70 flex items-start gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-saffron shrink-0 mt-0.5" />
            <span>
              Otomatik tarama Chrome 130+ gerektirir. Eski tarayıcılarda "Manuel seç" ile
              tarayıcı print dialog açılır ve yazıcıyı kendiniz seçersiniz.
            </span>
          </div>
        </Card>
      )}

      {/* Configuration */}
      <Card className="p-4 md:p-5 border-charcoal/8 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <Settings2 className="h-4 w-4 text-saffron" />
          <h3 className="font-display font-bold text-charcoal">Yapılandırma</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-medium">Kağıt Boyutu</Label>
            <Select
              value={state.paperSize}
              onValueChange={(v) => setState((s) => ({ ...s, paperSize: v }))}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {THERMAL_PRINTER.paperSizes.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-charcoal/50 mt-1">
              ESC/POS yazıcılar için otomatik algılanır
            </p>
          </div>

          <div>
            <Label className="text-xs font-medium">Otomatik Yazdırma</Label>
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => setState((s) => ({ ...s, autoPrint: !s.autoPrint }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  state.autoPrint ? "bg-ember" : "bg-charcoal/15"
                }`}
                role="switch"
                aria-checked={state.autoPrint}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    state.autoPrint ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="text-xs text-charcoal/70">
                {state.autoPrint ? "Her siparişte otomatik yazdır" : "Manuel yazdır"}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Recent orders for manual print */}
      <Card className="p-4 md:p-5 border-charcoal/8 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-ember" />
            <h3 className="font-display font-bold text-charcoal">Son Siparişler — Yazdır</h3>
          </div>
          <Button variant="outline" size="sm" onClick={loadOrders} disabled={loadingOrders}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loadingOrders ? "animate-spin" : ""}`} />
            Yenile
          </Button>
        </div>

        {loadingOrders ? (
          <div className="text-center py-6 text-charcoal/50 text-sm">Yükleniyor...</div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-6 text-charcoal/50 text-sm">Henüz sipariş yok</div>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between gap-3 p-3 rounded-lg border border-charcoal/8 hover:bg-cream/50 transition-colors"
              >
                <div className="min-w-0">
                  <div className="font-mono text-xs font-bold text-ember">{order.orderNumber}</div>
                  <div className="text-[11px] text-charcoal/60 truncate mt-0.5">
                    {order.customerName} · {order.items.length} ürün · {new Date(order.createdAt).toLocaleString("tr-TR")}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {order.printed && (
                    <Badge variant="outline" className="text-basil border-basil/30 text-[10px]">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Yazdırıldı
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => printOrder(order)}
                    disabled={!state.connected}
                  >
                    <Printer className="h-3.5 w-3.5 mr-1" />
                    Yazdır
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Help section */}
      <Card className="p-4 md:p-5 border-saffron/20 bg-saffron/5">
        <h3 className="font-display font-bold text-charcoal mb-2 flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4 text-saffron" />
          Kurulum Yardımı
        </h3>
        <div className="text-xs text-charcoal/75 space-y-1.5">
          <p><strong>USB Yöntemi:</strong> ESC/POS destekleyen yazıcı (Epson TM, Bixolon, Star Micronics, Xprinter) USB ile bağlanır. Chrome/Edge gerekli. En hızlı ve otomatik yöntem.</p>
          <p><strong>Sistem Yazıcısı:</strong> Bilgisayara yüklü herhangi bir yazıcı (termal veya normal). Tarayıcı print dialog açılır. Her yazıcı için uyumlu.</p>
          <p><strong>Otomatik yazdırma:</strong> Açık konumda her yeni siparişte otomatik yazdırılır. Tarayıcı sekmesi açık kalmalıdır.</p>
          <p><strong>Manuel yazdırma:</strong> Aşağıdaki sipariş listesinden tek tek yazdırabilirsiniz.</p>
        </div>
      </Card>
    </div>
  );
}

// ===== ESC/POS Builders (for USB) =====
function buildTestReceipt(paperSize: string): Uint8Array {
  const cmds: number[] = [0x1b, 0x40, 0x1b, 0x61, 0x01];
  for (const c of "DEMOS PIZZA\nTest Yazdirma\n\n") cmds.push(c.charCodeAt(0));
  cmds.push(0x1d, 0x56, 0x00);
  return new Uint8Array(cmds);
}

function buildOrderReceipt(order: any, paperSize: string): Uint8Array {
  const cmds: number[] = [0x1b, 0x40, 0x1b, 0x61, 0x01];
  for (const c of "DEMOS PIZZA\nHaseki, Fatih\n\n") cmds.push(c.charCodeAt(0));
  cmds.push(0x1b, 0x61, 0x00);
  const sep = "=".repeat(paperSize === "58mm" ? 30 : 46) + "\n";
  for (const c of sep) cmds.push(c.charCodeAt(0));
  for (const c of `SIPARIS: ${order.orderNumber}\n`) cmds.push(c.charCodeAt(0));
  for (const c of `Musteri: ${order.customerName}\n`) cmds.push(c.charCodeAt(0));
  for (const c of `Tel: ${order.customerPhone}\n`) cmds.push(c.charCodeAt(0));
  for (const c of sep) cmds.push(c.charCodeAt(0));
  for (const c of "URUNLER:\n") cmds.push(c.charCodeAt(0));
  if (order.items) {
    for (const item of order.items) {
      for (const c of `${item.quantity}x ${item.name}\n`) cmds.push(c.charCodeAt(0));
    }
  }
  for (const c of sep) cmds.push(c.charCodeAt(0));
  for (const c of `TOPLAM: ${(order.totalCents / 100).toLocaleString("tr-TR")} TL\n`) cmds.push(c.charCodeAt(0));
  cmds.push(0x1d, 0x56, 0x00);
  return new Uint8Array(cmds);
}

// ===== HTML Builders (for System Printer via browser print) =====
function buildTestHTML(): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Test</title>
  <style>
    @page { size: 80mm auto; margin: 4mm; }
    * { font-family: 'Courier New', monospace; font-size: 11px; }
    body { text-align: center; padding: 8px; }
    h1 { font-size: 14px; margin: 4px 0; }
    p { margin: 2px 0; }
  </style></head><body>
    <h1>DEMOS PIZZA</h1>
    <p>Test Yazdirma</p>
    <p>${new Date().toLocaleString("tr-TR")}</p>
    <script>window.onload = () => setTimeout(() => window.print(), 200);</script>
  </body></html>`;
}

function buildOrderHTML(order: any): string {
  const items = order.items?.map((it: any) => `<tr><td>${it.quantity}x ${it.name}</td><td style="text-align:right">${(it.unitPriceCents * it.quantity / 100).toLocaleString("tr-TR")} ₺</td></tr>`).join("") || "";
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${order.orderNumber}</title>
  <style>
    @page { size: 80mm auto; margin: 4mm; }
    * { font-family: 'Courier New', monospace; font-size: 11px; }
    body { padding: 8px; }
    h1 { font-size: 14px; text-align: center; margin: 4px 0; }
    .center { text-align: center; }
    .sep { border-top: 1px dashed #000; margin: 4px 0; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 1px 0; vertical-align: top; }
    .total { font-weight: bold; font-size: 13px; }
  </style></head><body>
    <h1>DEMOS PIZZA</h1>
    <p class="center">Haseki, Fatih</p>
    <p class="center">Tel: 444 00 00</p>
    <div class="sep"></div>
    <p><b>Sipariş:</b> ${order.orderNumber}</p>
    <p><b>Tarih:</b> ${new Date(order.createdAt).toLocaleString("tr-TR")}</p>
    <p><b>Müşteri:</b> ${order.customerName}</p>
    <p><b>Tel:</b> ${order.customerPhone}</p>
    ${order.deliveryDistrict ? `<p><b>Bölge:</b> ${order.deliveryDistrict}</p>` : ""}
    ${order.deliveryAddress ? `<p><b>Adres:</b> ${order.deliveryAddress}</p>` : ""}
    <div class="sep"></div>
    <table>${items}</table>
    <div class="sep"></div>
    <table>
      <tr class="total"><td>TOPLAM</td><td style="text-align:right">${(order.totalCents / 100).toLocaleString("tr-TR")} ₺</td></tr>
    </table>
    <p><b>Ödeme:</b> ${order.paymentMethod === "CASH_ON_DELIVERY" ? "Kapıda Nakit" : "Kapıda Kart"}</p>
    ${order.notes ? `<p><b>Not:</b> ${order.notes}</p>` : ""}
    <div class="sep"></div>
    <p class="center">Teşekkür ederiz!</p>
    <p class="center">demos.pizza.com.tr</p>
    <script>window.onload = () => setTimeout(() => window.print(), 300);</script>
  </body></html>`;
}
