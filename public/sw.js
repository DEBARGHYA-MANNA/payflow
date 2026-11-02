/* ------------------------------------------------------------------
   PayFlow service worker
   - precaches the app shell (single-file build => index.html is the app)
   - network-first for navigations with an offline fallback page
   - stale-while-revalidate for icons & static assets
   - push notifications + notification click routing
   - background sync hook for queued (simulated) transfers
------------------------------------------------------------------- */

const VERSION = "payflow-v1.0.0";
const SHELL_CACHE = `${VERSION}-shell`;
const ASSET_CACHE = `${VERSION}-assets`;

const SHELL_ASSETS = [
  "./",
  "./index.html",
  "./offline.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-192.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-48.png",
];

/* ----------------------------- install ----------------------------- */
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      // addAll fails the whole install if one request 404s — be tolerant
      await Promise.allSettled(SHELL_ASSETS.map((url) => cache.add(url)));
      await self.skipWaiting();
    })()
  );
});

/* ----------------------------- activate ---------------------------- */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))
      );
      if (self.registration.navigationPreload) {
        try {
          await self.registration.navigationPreload.enable();
        } catch (e) {}
      }
      await self.clients.claim();
    })()
  );
});

/* ------------------------------ fetch ------------------------------ */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // let cross-origin pass through

  // 1. Navigations → network first, fall back to cached shell, then offline page
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const preload = await event.preloadResponse;
          if (preload) {
            putInCache(SHELL_CACHE, "./index.html", preload.clone());
            return preload;
          }
          const fresh = await fetch(request);
          putInCache(SHELL_CACHE, "./index.html", fresh.clone());
          return fresh;
        } catch (e) {
          const cache = await caches.open(SHELL_CACHE);
          return (
            (await cache.match("./index.html")) ||
            (await cache.match("./")) ||
            (await cache.match("./offline.html")) ||
            new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } })
          );
        }
      })()
    );
    return;
  }

  // 2. Everything else → stale-while-revalidate
  event.respondWith(
    (async () => {
      const cache = await caches.open(ASSET_CACHE);
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((res) => {
          if (res && res.status === 200 && res.type === "basic") {
            cache.put(request, res.clone());
          }
          return res;
        })
        .catch(() => null);
      return cached || (await network) || new Response("", { status: 504 });
    })()
  );
});

async function putInCache(cacheName, key, response) {
  try {
    if (!response || response.status !== 200) return;
    const cache = await caches.open(cacheName);
    await cache.put(key, response);
  } catch (e) {}
}

/* --------------------------- push messages -------------------------- */
self.addEventListener("push", (event) => {
  let payload = {
    title: "PayFlow",
    body: "You have a new account notification.",
    tag: "payflow-generic",
    data: { page: "dashboard" },
  };

  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() };
    } catch (e) {
      payload.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "./icons/icon-192.png",
      badge: "./icons/icon-96.png",
      tag: payload.tag,
      renotify: true,
      vibrate: [18, 60, 18],
      data: payload.data || {},
      actions: payload.actions || [
        { action: "open", title: "Open PayFlow" },
        { action: "dismiss", title: "Dismiss" },
      ],
    })
  );
});

/* ------------------------ notification click ------------------------ */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;

  const page = event.notification.data?.page || "dashboard";
  const target = new URL(`./?action=${page}`, self.location.origin).href;

  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of all) {
        if ("focus" in client) {
          client.postMessage({ type: "NAVIGATE", page });
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })()
  );
});

/* --------------------------- background sync ------------------------ */
self.addEventListener("sync", (event) => {
  if (event.tag === "payflow-sync-transfers") {
    event.waitUntil(
      (async () => {
        const all = await self.clients.matchAll({ includeUncontrolled: true });
        all.forEach((c) => c.postMessage({ type: "SYNC_TRANSFERS" }));
      })()
    );
  }
});

/* ------------------------------ messages ---------------------------- */
self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "SKIP_WAITING") self.skipWaiting();

  // Lets the page trigger a notification without a real push server
  if (data.type === "SHOW_NOTIFICATION") {
    const { title, body, page, tag } = data.payload || {};
    self.registration.showNotification(title || "PayFlow", {
      body: body || "",
      icon: "./icons/icon-192.png",
      badge: "./icons/icon-96.png",
      tag: tag || "payflow-local",
      renotify: true,
      vibrate: [18, 60, 18],
      data: { page: page || "dashboard" },
    });
  }
});
