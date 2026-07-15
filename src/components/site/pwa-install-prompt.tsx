"use client";

import * as React from "react";
import { Download, X, Smartphone } from "lucide-react";

const DISMISS_KEY = "demos-pwa-dismissed-v2";
const INSTALLED_KEY = "demos-pwa-installed-v2";

/**
 * PWA Install Prompt — SADECE mobil cihazlarda gösterilir
 * Desktop'ta beforeinstallprompt tetiklense bile gösterilmez
 */
export function PWAInstallPrompt() {
  const [show, setShow] = React.useState(false);
  const [platform, setPlatform] = React.useState<"ios" | "android">("android");
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);

  React.useEffect(() => {
    // Cihaz tespiti
    const ua = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);
    const isMobile = isIOS || isAndroid;

    // SADECE mobil cihazlarda çalış — desktop'ta hiç gösterme
    if (!isMobile) return;

    const dismissed = localStorage.getItem(DISMISS_KEY);
    const installed = localStorage.getItem(INSTALLED_KEY);
    if (dismissed || installed) return;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;

    if (isStandalone) {
      localStorage.setItem(INSTALLED_KEY, "true");
      return;
    }

    if (isIOS) setPlatform("ios");
    else setPlatform("android");

    const SHOW_DELAY = 12000;

    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShow(true), SHOW_DELAY);
    };
    window.addEventListener("beforeinstallprompt", onBIP);

    // iOS'ta beforeinstallprompt yok — manuel göster
    if (isIOS) {
      setTimeout(() => setShow(true), SHOW_DELAY);
    }

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
    <div className="fixed top-16 md:top-20 inset-x-0 z-40 animate-in slide-in-from-top-4 duration-500 pointer-events-none px-3 md:px-6 md:hidden">
      <div className="mx-auto max-w-2xl pointer-events-auto">
        <div className="bg-ink text-white rounded-2xl shadow-2xl border border-yellow/30 overflow-hidden">
          <div className="flex items-center gap-3 p-3.5 md:p-4">
            <div className="w-10 h-10 rounded-xl bg-yellow flex items-center justify-center shrink-0">
              <Smartphone className="h-5 w-5 text-ink" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-white text-sm leading-tight">
                Uygulamayı İndir
              </h3>
              <p className="text-[11px] text-white/60 leading-snug mt-0.5 truncate">
                {platform === "ios"
                  ? "Paylaş → Ana Ekrana Ekle — tek tıkla sipariş"
                  : "Ana ekranına ekle, daha hızlı sipariş ver"}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {platform === "ios" ? (
                <button
                  onClick={handleDismiss}
                  className="h-9 px-3 rounded-lg bg-pink hover:bg-pink-hover text-white text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <Download className="h-3.5 w-3.5" />
                  Anladım
                </button>
              ) : (
                <button
                  onClick={handleInstall}
                  className="h-9 px-3 rounded-lg bg-pink hover:bg-pink-hover text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-pink-glow"
                >
                  <Download className="h-3.5 w-3.5" />
                  İndir
                </button>
              )}
              <button
                onClick={handleDismiss}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                aria-label="Kapat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
