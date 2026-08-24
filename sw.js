const CACHE_NAME = 'laguna-athletic-v2-live';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

// Estrategia Network-First: Siempre busca la versión más reciente del servidor
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((networkRes) => {
        return networkRes;
      })
      .catch(() => {
        return caches.match(e.request);
      })
  );
});
