"use client";

import * as React from "react";
import { Bell, X, Sparkles } from "lucide-react";

const NOTIF_KEY = "demos-push-permission-v2";

const HUNGER_TIMES = [
  { start: 11, end: 13, title: "🍕 Öğle Molası!", body: "Taze pizza fırından çıktı. Sipariş ver, sıcacık gelsin!" },
  { start: 17, end: 20, title: "🍕 Akşam Yemeği!", body: "Günün yorgunluğunu pizza ile at. 1 alana 1 bedava!" },
];

export function PushNotificationPrompt() {
  const [show, setShow] = React.useState(false);
  const [permission, setPermission] = React.useState<NotificationPermission>("default");

  React.useEffect(() => {
    if (!("Notification" in window)) return;
    setPermission(Notification.permission);

    // İzin zaten verildiyse veya reddedildiyse gösterme
    const saved = localStorage.getItem(NOTIF_KEY);
    if (saved === "granted" || saved === "denied") return;
    if (Notification.permission === "granted" || Notification.permission === "denied") {
      localStorage.setItem(NOTIF_KEY, Notification.permission);
      return;
    }

    // 10 saniye sonra göster
    const t = setTimeout(() => setShow(true), 10000);
    return () => clearTimeout(t);
  }, []);

  // Açlık saati kontrolü
  React.useEffect(() => {
    if (permission !== "granted") return;
    const checkHungerTime = () => {
      const hour = new Date().getHours();
      const hunger = HUNGER_TIMES.find(h => hour >= h.start && hour < h.end);
      if (!hunger) return;
      const lastNotif = localStorage.getItem("demos-last-notif");
      if (lastNotif && Date.now() - parseInt(lastNotif) < 2 * 60 * 60 * 1000) return;
      new Notification(hunger.title, {
        body: hunger.body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: "demos-hunger",
      });
      localStorage.setItem("demos-last-notif", Date.now().toString());
    };
    checkHungerTime();
    const interval = setInterval(checkHungerTime, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [permission]);

  const handleAccept = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
    localStorage.setItem(NOTIF_KEY, result);
    if (result === "granted") {
      new Notification("Demos Pizza 🍕", {
        body: "Harika! Fırsatları kaçırmayacaksın.",
        icon: "/icon-192.png",
      });
    }
    setShow(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(NOTIF_KEY, "denied");
    setShow(false);
  };

  if (!show || !("Notification" in window)) return null;

  return (
    <div className="fixed top-16 md:top-20 inset-x-0 z-40 animate-in slide-in-from-top-4 duration-500 pointer-events-none px-3 md:px-6">
      <div className="mx-auto max-w-2xl pointer-events-auto">
        <div className="bg-ink text-white rounded-2xl shadow-2xl border border-yellow/30 overflow-hidden">
          <div className="flex items-center gap-3 p-3.5">
            <div className="w-10 h-10 rounded-xl bg-yellow flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-ink" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-white text-sm leading-tight">
                Fırsatları Yakala
              </h3>
              <p className="text-[11px] text-white/60 leading-snug mt-0.5">
                Kampanya ve fırsatlardan ilk sen haberdar ol. Sadece sana özel bildirimler.
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
