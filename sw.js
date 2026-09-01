const CACHE_VERSION = "2026.8.31.2";
const CACHE_NAME = `laguna-athletic-${CACHE_VERSION}`;
const CDN_CACHE_NAME = `laguna-athletic-cdn-${CACHE_VERSION}`;

// Recursos locales indispensables (App Shell)
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.json",
  "./LAGUNA.jpg",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./assets/players/equipo-celebracion-estadio.jpeg",
  "./js/state.js",
  "./js/supabase.js",
  "./js/ui.js",
  "./js/auth.js",
  "./js/attendance.js",
  "./js/tactical.js",
  "./js/medical.js",
  "./js/calendar.js",
  "./js/justifications.js",
  "./js/notices.js",
  "./js/stats.js",
  "./js/registration.js",
  "./js/payments.js",
  "./js/main.js",
];

// Librerías externas y fuentes para soporte 100% offline
const CDN_SHELL = [
  "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css",
  "https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js",
  "https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js",
  "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js",
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js",
];

// Dominios CDN permitidos para caché dinámico
const TRUSTED_CDN_HOSTS = [
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "cdnjs.cloudflare.com",
  "cdn.jsdelivr.net",
  "unpkg.com",
  "api.qrserver.com",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
      caches.open(CDN_CACHE_NAME).then((cache) => {
        // Intentar precachear CDNs de forma segura sin romper la instalación si alguno falla
        return Promise.allSettled(
          CDN_SHELL.map((url) =>
            fetch(url, { mode: "cors" })
              .then((res) => (res.ok ? cache.put(url, res) : null))
              .catch(() => null),
          ),
        );
      }),
    ]),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME && key !== CDN_CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  const url = new URL(e.request.url);
  const sameOrigin = url.origin === self.location.origin;
  const isTrustedCDN = TRUSTED_CDN_HOSTS.some((host) => url.hostname.includes(host));

  // 1. RECURSOS LOCALES: Estrategia Network-First con Fallback a Caché
  if (sameOrigin) {
    e.respondWith(
      fetch(e.request)
        .then((networkRes) => {
          if (networkRes.ok) {
            const responseCopy = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseCopy));
          }
          return networkRes;
        })
        .catch(() => {
          return caches.match(e.request).then((cached) => {
            if (cached) return cached;
            return new Response("", { status: 404, statusText: "Offline sin caché" });
          });
        }),
    );
    return;
  }

  // 2. LIBRERÍAS EXTERNAS Y FUENTES: Estrategia Cache-First con Network Fallback
  if (isTrustedCDN) {
    e.respondWith(
      caches.match(e.request).then((cached) => {
        if (cached) return cached;

        return fetch(e.request)
          .then((networkRes) => {
            // Guardar copia en el CDN_CACHE_NAME (incluso respuestas opaque)
            if (networkRes.ok || networkRes.type === "opaque") {
              const responseCopy = networkRes.clone();
              caches.open(CDN_CACHE_NAME).then((cache) => cache.put(e.request, responseCopy));
            }
            return networkRes;
          })
          .catch(() => {
            return new Response("", { status: 503, statusText: "Offline - CDN no disponible" });
          });
      }),
    );
  }
});
