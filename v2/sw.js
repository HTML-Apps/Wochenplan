// Service Worker für Wochenplaner v2 (eigener Cache, Scope /v2/)
const CACHE_NAME = "wochenplaner-v2-1";
const ASSETS = ["./", "./index.html", "./manifest.json", "../cook.png"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k.startsWith("wochenplaner-v2") && k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  return self.clients.claim();
});

// Netzwerk zuerst, bei Offline aus dem Cache. Firebase-Datenverkehr nie cachen.
self.addEventListener("fetch", (event) => {
  const url = event.request.url;
  if (event.request.method !== "GET" || url.includes("firestore") || url.includes("googleapis.com/identitytoolkit") || url.includes("securetoken")) return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res.ok && (url.startsWith(self.location.origin) || url.includes("gstatic.com") || url.includes("fonts."))) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
