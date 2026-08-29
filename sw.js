const CACHE_NAME = "laguna-athletic-v3-live";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./LAGUNA.jpg",
  "./assets/players/equipo-celebracion-estadio.jpeg",
  "./assets/players/052426da-d923-4c2c-8a7e-787ddbfe5396.jpeg",
  "./assets/players/0d1df12f-a8e1-4ca5-a9ae-a2d4b5ecf3e8.jpeg",
  "./assets/players/13e0e666-1591-426d-a1db-625e2ff7820b.jpeg",
  "./assets/players/70a8b95f-a959-4146-b75e-c422fd63f7de.jpeg",
  "./assets/players/7fb337d9-03e3-4a5f-a29c-b4ac4dbd6ec2.jpeg",
  "./assets/players/a38b27d6-243c-4b80-a156-420f4b51c611.jpeg",
  "./assets/players/ab25b11a-ccb3-4968-a8bc-d81fe3807b91.jpeg",
  "./assets/players/aeef1f1a-7984-4790-95dc-e0ee47b20927.jpeg",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

// Estrategia Network-First: Siempre busca la versión más reciente del servidor
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((networkRes) => {
        if (
          networkRes.ok &&
          new URL(e.request.url).origin === self.location.origin
        ) {
          const responseCopy = networkRes.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(e.request, responseCopy));
        }
        return networkRes;
      })
      .catch(() => {
        return caches.match(e.request);
      }),
  );
});
