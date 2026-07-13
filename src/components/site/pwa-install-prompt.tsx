"use client";

import * as React from "react";
import { Download, X, Smartphone } from "lucide-react";

const DISMISS_KEY = "demos-pwa-dismissed";
const INSTALLED_KEY = "demos-pwa-installed";

export function PWAInstallPrompt() {
  const [show, setShow] = React.useState(false);
  const [platform, setPlatform] = React.useState<"ios" | "android" | "desktop">("desktop");
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);

  React.useEffect(() => {
    // Daha önce reddedildiyse veya kurulduysa gösterme
    const dismissed = localStorage.getItem(DISMISS_KEY);
    const installed = localStorage.getItem(INSTALLED_KEY);
    if (dismissed || installed) return;

    // Platform tespiti
    const ua = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone === true;

    if (isStandalone) {
      localStorage.setItem(INSTALLED_KEY, "true");
      return;
    }

    if (isIOS) setPlatform("ios");
    else if (isAndroid) setPlatform("android");
    else setPlatform("desktop");

    // Android/Desktop: beforeinstallprompt event'i yakala
    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // 8 saniye sonra göster (cookie banner'dan sonra)
      setTimeout(() => setShow(true), 8000);
    };
    window.addEventListener("beforeinstallprompt", onBIP);

    // iOS: beforeinstallprompt yok, manuel prompt göster
    if (isIOS) {
      setTimeout(() => setShow(true), 8000);
    }

    // appinstalled event
    const onInstalled = () => {
      localStorage.setItem(INSTALLED_KEY, "true");
      setShow(false);
    };
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        localStorage.setItem(INSTALLED_KEY, "true");
      } else {
        localStorage.setItem(DISMISS_KEY, Date.now().toString());
      }
      setDeferredPrompt(null);
      setShow(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 animate-in slide-in-from-bottom-4 duration-500 pointer-events-none">
      <div className="mx-auto max-w-md m-3 md:m-4 pointer-events-auto">
        <div className="bg-ink text-white rounded-2xl shadow-2xl border border-yellow/20 overflow-hidden">
          {/* Header */}
          <div className="flex items-start gap-3 p-4">
            <div className="w-11 h-11 rounded-xl bg-yellow flex items-center justify-center shrink-0">
              <Smartphone className="h-5 w-5 text-ink" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-white text-sm">
                Uygulamaya Dönüştür
              </h3>
              <p className="text-[11px] text-white/60 leading-relaxed mt-1">
                {platform === "ios" ? (
                  <>Paylaş butonuna bas, "Ana Ekrana Ekle" de — uygulamamıza hızlı eriş!</>
                ) : (
                  <>Demos Pizza'yı ana ekranına ekle, tek tıkla sipariş ver!</>
                )}
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Kapat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Butonlar */}
          <div className="flex gap-2 px-4 pb-4">
            {platform === "ios" ? (
              <button
                onClick={handleDismiss}
                className="flex-1 h-10 rounded-xl bg-pink hover:bg-pink-hover text-white text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="h-4 w-4" />
                Anladım
              </button>
            ) : (
              <button
                onClick={handleInstall}
                className="flex-1 h-10 rounded-xl bg-pink hover:bg-pink-hover text-white text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-pink-glow"
              >
                <Download className="h-4 w-4" />
                Yükle
              </button>
            )}
            <button
              onClick={handleDismiss}
              className="px-4 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 text-xs font-medium transition-colors"
            >
              Daha sonra
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
