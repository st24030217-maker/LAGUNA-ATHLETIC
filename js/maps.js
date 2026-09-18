/* ==========================================================================
   LAGUNA ATHLETIC 2026 — js/maps.js
   Módulo de mapa GPS en vivo y navegación a sedes (Leaflet)
   ========================================================================== */

// Coordenadas oficiales de sedes frecuentes en Comarca Lagunera (Torreón)
export const VENUE_COORDINATES = {
  "cancha 2 - complejo laguna": { lat: 25.5392, lng: -103.4215, name: "Cancha 2 - Complejo Deportivo Laguna" },
  "cancha 1": { lat: 25.5395, lng: -103.4218, name: "Cancha 1 - Complejo Deportivo Laguna" },
  "cancha principal": { lat: 25.5392, lng: -103.4215, name: "Cancha Principal - Laguna Athletic" },
  "complejo laguna": { lat: 25.5392, lng: -103.4215, name: "Complejo Deportivo Laguna Athletic" },
  "estadio central": { lat: 25.5348, lng: -103.4397, name: "Estadio Central / Revolución" },
  "estadio revolucion": { lat: 25.5348, lng: -103.4397, name: "Estadio Revolución" },
};

// Sede por defecto: Complejo Deportivo Laguna Athletic (Torreón, Coah.)
const DEFAULT_COORDS = { lat: 25.5392, lng: -103.4215, name: "Complejo Deportivo Laguna Athletic" };

let leafletMapInstance = null;
let venueMarker = null;
let userMarker = null;

export function getVenueCoordinates(venueName = "") {
  const norm = String(venueName).toLowerCase().trim();
  for (const [key, val] of Object.entries(VENUE_COORDINATES)) {
    if (norm.includes(key) || key.includes(norm)) {
      return val;
    }
  }
  return { ...DEFAULT_COORDS, name: venueName || DEFAULT_COORDS.name };
}

// Fórmula de Haversine para calcular distancia en kilómetros
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function openGpsModal(targetVenue) {
  const modal = document.getElementById("gpsMapModal");
  if (!modal) return;

  const locationEl = document.getElementById("guardianMatchLocation");
  const venueText =
    (typeof targetVenue === "string" && targetVenue.trim())
      ? targetVenue.trim()
      : (locationEl ? locationEl.textContent.trim() : "Cancha 2 - Complejo Laguna");

  const venueTitleEl = document.getElementById("gpsModalVenueName");
  if (venueTitleEl) venueTitleEl.textContent = venueText;

  const coords = getVenueCoordinates(venueText);

  // Actualizar enlaces directos externos (Google Maps, Waze, Apple Maps)
  const gMapsBtn = document.getElementById("gpsGoogleMapsLink");
  if (gMapsBtn) {
    gMapsBtn.href = `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`;
  }

  const wazeBtn = document.getElementById("gpsWazeLink");
  if (wazeBtn) {
    wazeBtn.href = `https://waze.com/ul?ll=${coords.lat},${coords.lng}&navigate=yes`;
  }

  const appleBtn = document.getElementById("gpsAppleMapsLink");
  if (appleBtn) {
    appleBtn.href = `https://maps.apple.com/?daddr=${coords.lat},${coords.lng}&dirflg=d`;
  }

  // Resetear etiquetas de cálculo
  const distVal = document.getElementById("gpsDistanceVal");
  const driveVal = document.getElementById("gpsDriveTimeVal");
  const walkVal = document.getElementById("gpsWalkTimeVal");
  if (distVal) distVal.textContent = "Obteniendo GPS…";
  if (driveVal) driveVal.textContent = "—";
  if (walkVal) walkVal.textContent = "—";

  // Mostrar modal
  modal.classList.remove("hidden");

  // Inicializar o centrar mapa Leaflet
  initOrUpdateMap(coords);

  // Solicitar geolocalización en tiempo real del usuario
  requestUserGeolocation(coords);
}

function initOrUpdateMap(coords) {
  const mapContainer = document.getElementById("gpsLeafletMap");
  if (!mapContainer || typeof window.L === "undefined") return;

  if (!leafletMapInstance) {
    leafletMapInstance = window.L.map("gpsLeafletMap", {
      zoomControl: true,
      attributionControl: true,
    }).setView([coords.lat, coords.lng], 15);

    // Capa de mosaicos estilo Voyager con modo oscuro integrado en CSS
    window.L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(leafletMapInstance);
  } else {
    leafletMapInstance.setView([coords.lat, coords.lng], 15);
  }

  // Crear o actualizar pin de la sede
  if (venueMarker) {
    venueMarker.setLatLng([coords.lat, coords.lng]);
  } else {
    const venueIcon = window.L.divIcon({
      className: "custom-venue-pin",
      html: `<div style="background: linear-gradient(135deg, #0ea5e9, #0369a1); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; box-shadow: 0 0 16px rgba(14,165,233,0.8); border: 2px solid #fff;"><i class="fa-solid fa-futbol" style="font-size:16px;"></i></div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    venueMarker = window.L.marker([coords.lat, coords.lng], { icon: venueIcon }).addTo(leafletMapInstance);
  }

  venueMarker.bindPopup(`
    <div style="font-family: var(--font-heading, sans-serif); color: #fff; padding: 2px;">
      <strong style="color: #38bdf8; font-size: 0.95rem;">⚽ ${coords.name}</strong>
      <p style="margin: 4px 0 0; font-size: 0.78rem; color: #94a3b8;">Sede Oficial Laguna Athletic</p>
    </div>
  `).openPopup();

  // Forzar repintado de Leaflet para contenedores que provienen de hidden/display:none
  setTimeout(() => {
    if (leafletMapInstance) leafletMapInstance.invalidateSize();
  }, 200);
}

function requestUserGeolocation(coords) {
  const distVal = document.getElementById("gpsDistanceVal");
  const driveVal = document.getElementById("gpsDriveTimeVal");
  const walkVal = document.getElementById("gpsWalkTimeVal");

  if (!navigator.geolocation) {
    if (distVal) distVal.textContent = "GPS no disponible";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;
      const distanceKm = calculateHaversineDistance(userLat, userLng, coords.lat, coords.lng);

      // Formatear distancia
      if (distVal) {
        distVal.textContent = distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm.toFixed(1)} km`;
      }

      // Estimar tiempos (35 km/h auto en ciudad, 4.5 km/h a pie)
      const driveMinutes = Math.max(2, Math.round((distanceKm / 35) * 60));
      const walkMinutes = Math.max(1, Math.round((distanceKm / 4.5) * 60));

      if (driveVal) driveVal.textContent = driveMinutes > 60 ? `${Math.floor(driveMinutes / 60)}h ${driveMinutes % 60}m` : `~${driveMinutes} min`;
      if (walkVal) walkVal.textContent = walkMinutes > 60 ? `${Math.floor(walkMinutes / 60)}h ${walkMinutes % 60}m` : `~${walkMinutes} min`;

      // Colocar pin de ubicación del usuario
      if (leafletMapInstance && window.L) {
        if (userMarker) {
          userMarker.setLatLng([userLat, userLng]);
        } else {
          const userIcon = window.L.divIcon({
            className: "custom-user-pin",
            html: `<div style="background: #10b981; width: 22px; height: 22px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 14px #10b981;"></div>`,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          });
          userMarker = window.L.marker([userLat, userLng], { icon: userIcon }).addTo(leafletMapInstance);
        }

        userMarker.bindPopup(`<div style="color:#10b981; font-weight:700;">📍 Tu ubicación actual</div>`);

        // Ajustar encuadre para ver tanto la sede como al usuario
        const group = window.L.featureGroup([venueMarker, userMarker]);
        leafletMapInstance.fitBounds(group.getBounds(), { padding: [40, 40], maxZoom: 16 });
      }
    },
    (err) => {
      console.warn("Laguna Athletic GPS:", err.message);
      if (distVal) distVal.textContent = "Sin permiso GPS";
      if (driveVal) driveVal.textContent = "—";
      if (walkVal) walkVal.textContent = "—";
    },
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
  );
}

export function closeGpsModal() {
  const modal = document.getElementById("gpsMapModal");
  if (modal) modal.classList.add("hidden");
}
