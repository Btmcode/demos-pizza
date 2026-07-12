// Demos Pizza Service Worker — PWA
// Offline cache + push notification foundation

const CACHE_NAME = "demos-pizza-v1";
const OFFLINE_URL = "/offline";

// Critical assets to precache
const PRECACHE_URLS = [
  "/",
  "/offline",
  "/logo.svg",
  "/favicon.svg",
  "/manifest.json",
  "/images/hero-pizza.png",
  "/images/demos-storefront.png",
];

// Install — precache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Activate — cleanup old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch — stale-while-revalidate strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip API requests (always network-first)
  if (request.url.includes("/api/")) {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  // Skip cross-origin requests
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          // Cache valid responses
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => cached || caches.match(OFFLINE_URL));

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
