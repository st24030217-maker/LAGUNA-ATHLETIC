const CACHE_VERSION = "2026.8.25.1";
const CACHE_NAME = `laguna-athletic-${CACHE_VERSION}`;
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./LAGUNA.jpg",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./assets/players/equipo-celebracion-estadio.jpeg",
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
// Las fotos de jugadores (assets/players) se cachean bajo demanda al subirlas,
// evitando editar esta lista manualmente con cada alta.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  const sameOrigin = url.origin === self.location.origin;
  if (!sameOrigin) return;
  e.respondWith(
    fetch(e.request)
      .then((networkRes) => {
        if (networkRes.ok) {
          const responseCopy = networkRes.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(e.request, responseCopy));
        }
        return networkRes;
      })
      .catch(() => {
        return caches.match(e.request).then((cached) => {
          if (cached) return cached;
          return new Response("", {
            status: 404,
            statusText: "Offline sin caché",
          });
        });
      }),
  );
});
