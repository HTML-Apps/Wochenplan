const CACHE_NAME = "wochenplaner-v1";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./cook.png"
  // Falls du externe CSS/JS Dateien hättest, müssten die hier auch rein.
  // Da bei dir alles in der index.html ist, reicht das so.
];

// 1. Installieren: Dateien in den Cache laden
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching App Shell");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Aktivieren: Alte Caches löschen (falls du mal ein Update machst)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[Service Worker] Removing old cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. Fetch: Erst Cache fragen, dann Netzwerk
self.addEventListener("fetch", (event) => {
  // Firebase Anfragen ignorieren wir im Cache (die sollen immer live sein oder via Firebase SDK geregelt werden)
  if (event.request.url.includes("firestore") || event.request.url.includes("googleapis")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Wenn im Cache gefunden, nimm das. Sonst geh ins Netzwerk.
      return response || fetch(event.request);
    })
  );
});
