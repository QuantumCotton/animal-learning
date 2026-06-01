/**
 * Liora Service Worker — offline-first caching
 * Strategies:
 *   - Precache: app shell (HTML, CSS, JS, manifest, icons)
 *   - Cache-on-fetch: images and sounds (lazy, permanent)
 *   - Network-first: data files (manifest.json) so updates come through
 */

const CACHE_NAME = "liora-v1";
const SHELL = [
  "/web/index.html",
  "/web/css/app.css",
  "/web/js/app.js",
  "/web/data/manifest.json",
  "/web/manifest.webmanifest",
  "/web/icons/icon-192.png",
  "/web/icons/icon-512.png",
  "/web/icons/apple-touch-icon-180.png",
];

// Install: precache shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only cache same-origin GET
  if (event.request.method !== "GET" || url.origin !== location.origin) return;

  // Images & sounds: cache-first (permanent)
  if (url.pathname.match(/\.(png|jpg|jpeg|webp|mp3|wav|ogg)$/i)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(event.request).then((cached) => {
          if (cached) return cached;
          return fetch(event.request).then((response) => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }

  // Everything else: network-first, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Message: precache all assets from manifest
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "PRECACHE_ALL") {
    const assets = event.data.assets;
    event.source.postMessage({ type: "PRECACHE_START", total: assets.length });
    precacheBatch(event.source, assets, 0);
  }
});

function precacheBatch(client, assets, start) {
  const BATCH = 8;
  const batch = assets.slice(start, start + BATCH);
  if (batch.length === 0) {
    client.postMessage({ type: "PRECACHE_DONE" });
    return;
  }
  caches.open(CACHE_NAME).then((cache) =>
    Promise.all(
      batch.map((url) =>
        cache.match(url).then((cached) => {
          if (cached) return Promise.resolve();
          return fetch(url)
            .then((res) => { if (res.ok) return cache.put(url, res); })
            .catch(() => {}); // skip failed
        })
      )
    ).then(() => {
      const done = Math.min(start + BATCH, assets.length);
      client.postMessage({ type: "PRECACHE_PROGRESS", done, total: assets.length });
      precacheBatch(client, assets, done);
    })
  );
}
