// Demos Pizza Service Worker — PWA v2 (auto-update)
// Cache version changes on every deploy → triggers auto-update

const SW_VERSION = "demos-pizza-v2-20250715";
const CACHE_NAME = SW_VERSION;
const OFFLINE_URL = "/offline";

// Critical assets to precache
const PRECACHE_URLS = [
  "/",
  "/manifest.json",
  "/logo.webp",
  "/favicon.svg",
];

// Install — precache + skip waiting (auto-activate new SW)
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => {});
    })
  );
  // Yeni SW hemen aktif olsun — kullanıcı güncellemeyi beklemesin
  self.skipWaiting();
});

// Activate — cleanup old caches + claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log("[SW] Deleting old cache:", name);
            return caches.delete(name);
          })
      );
    })
  );
  // Tüm client'ları hemen yeni SW'ye bağla
  self.clients.claim();
  
  // Tüm client'lara "güncellendi" mesajı gönder → sayfa yenilensin
  self.clients.matchAll({ type: "window" }).then((clients) => {
    clients.forEach((client) => {
      client.postMessage({ type: "SW_UPDATED", version: SW_VERSION });
    });
  });
});

// Fetch — network-first for navigation, stale-while-revalidate for assets
self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  // API istekleri her zaman network-first
  if (request.url.includes("/api/")) {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  // Cross-origin istekleri atla
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navigation istekleri — network-first (her zaman güncel HTML)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match(OFFLINE_URL)))
    );
    return;
  }

  // Statik assetler — stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});

// Push notifications
self.addEventListener("push", (event) => {
  let data = { title: "Demos Pizza", body: "Siparişiniz hazırlanıyor" };
  try {
    if (event.data) data = event.data.json();
  } catch {}

  const options = {
    body: data.body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    vibrate: [100, 50, 100],
    data: { url: data.url || "/" },
    actions: [
      { action: "view", title: "Görüntüle" },
      { action: "dismiss", title: "Kapat" },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "view" || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || "/")
    );
  }
});

// Message listener — client'tan gelen mesajları dinle
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
