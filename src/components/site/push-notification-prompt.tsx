"use client";

import * as React from "react";
import { Bell, X, Pizza, Clock } from "lucide-react";

/**
 * Açlık saati bildirimleri — KVKK uyumlu
 * 11:00-13:00 (öğle) ve 17:00-20:00 (akşam) saatlerinde
 * PWA yüklü kullanıcıya push notification gönderir
 *
 * KVKK Uyumluluk:
 * - Kullanıcı onayı gerekir (Notification.requestPermission)
 * - Bildirim içeriği kişisel veri içermez
 * - Kullanıcı istediği zaman kapatabilir (localStorage)
 * - Çerez politikasında bildirim izni açıklanır
 */

const NOTIF_KEY = "demos-push-permission";
const NOTIF_DISMISSED = "demos-push-dismissed";

// Açlık saatleri
const HUNGER_TIMES = [
  { start: 11, end: 13, title: "Öğle Molası! 🍕", body: "Taze pizza şimdi çıktı fırından. Sipariş ver, sıcacık gelsin!" },
  { start: 17, end: 20, title: "Akşam Yemeği Vakti! 🍕", body: "Günün yorgunluğunu pizza ile at. 1 alana 1 bedava!" },
];

export function PushNotificationPrompt() {
  const [show, setShow] = React.useState(false);
  const [permission, setPermission] = React.useState<NotificationPermission>("default");

  React.useEffect(() => {
    if (!("Notification" in window)) return;
    setPermission(Notification.permission);

    const dismissed = localStorage.getItem(NOTIF_DISMISSED);
    const granted = localStorage.getItem(NOTIF_KEY);
    if (dismissed || granted === "granted") return;

    // 5 saniye sonra prompt göster
    const t = setTimeout(() => setShow(true), 5000);
    return () => clearTimeout(t);
  }, []);

  // İzin verildiyse açlık saati kontrolü
  React.useEffect(() => {
    if (permission !== "granted") return;

    const checkHungerTime = () => {
      const hour = new Date().getHours();
      const hunger = HUNGER_TIMES.find(h => hour >= h.start && hour < h.end);
      if (!hunger) return;

      // Son bildirimden en az 2 saat geçmiş olmalı
      const lastNotif = localStorage.getItem("demos-last-notif");
      if (lastNotif && Date.now() - parseInt(lastNotif) < 2 * 60 * 60 * 1000) return;

      new Notification(hunger.title, {
        body: hunger.body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: "demos-hunger",
        data: { url: "/" },
      });

      localStorage.setItem("demos-last-notif", Date.now().toString());
    };

    // İlk kontrol
    checkHungerTime();
    // Her 30 dakikada bir kontrol
    const interval = setInterval(checkHungerTime, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [permission]);

  const handleAccept = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      localStorage.setItem(NOTIF_KEY, "granted");
      // Hemen test bildirimi
      new Notification("Demos Pizza 🍕", {
        body: "Bildirimler açık! Açlık saatlerinde sana haber vereceğiz.",
        icon: "/icon-192.png",
      });
    }
    setShow(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(NOTIF_DISMISSED, "true");
    setShow(false);
  };

  if (!show || !("Notification" in window)) return null;

  return (
    <div className="fixed top-16 md:top-20 inset-x-0 z-40 animate-in slide-in-from-top-4 duration-500 pointer-events-none px-3 md:px-6">
      <div className="mx-auto max-w-2xl pointer-events-auto">
        <div className="bg-ink text-white rounded-2xl shadow-2xl border border-yellow/30 overflow-hidden">
          <div className="flex items-center gap-3 p-3.5">
            <div className="w-10 h-10 rounded-xl bg-yellow flex items-center justify-center shrink-0">
              <Bell className="h-5 w-5 text-ink" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-white text-sm leading-tight">
                Açlık Saatleri Bildirimi
              </h3>
              <p className="text-[11px] text-white/60 leading-snug mt-0.5">
                Öğle ve akşam saatlerinde pizza hatırlatması al (KVKK uyumlu, istediğin zaman kapatabilirsin)
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleAccept}
                className="h-9 px-3 rounded-lg bg-pink hover:bg-pink-hover text-white text-xs font-semibold transition-colors"
              >
                İzin Ver
              </button>
              <button
                onClick={handleDismiss}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors"
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
