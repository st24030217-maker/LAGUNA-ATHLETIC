/* ==========================================================================
   LAGUNA ATHLETIC 2026 — js/supabase.js
   Módulo cloud: inicialización, sincronización, realtime y mapeos.
   ========================================================================== */

import {
  squadData, calendarEvents, justificationsData, injuredData, paymentsData,
  setSquadData, setCalendarEvents, setJustificationsData, setInjuredData, setPaymentsData,
  setCurrentRole, setLoggedInUser, setProfilePlayerId,
} from "./state.js";

// ---------------------------------------------------------------------------
// Constantes de configuración
// ---------------------------------------------------------------------------
export const SUPABASE_URL_KEY  = "laguna_supabase_url";
export const SUPABASE_ANON_KEY = "laguna_supabase_key";

const DEFAULT_SUPABASE_URL      = "https://wachximrinjtyasyymlv.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhY2h4aW1yaW5qdHlhc3l5bWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3OTYxOTEsImV4cCI6MjEwMzM3MjE5MX0.5FVsPr25K9C_5VynxuMEx6RVudZyzk124Bu1gs8KAto";

// ---------------------------------------------------------------------------
// Estado interno del módulo
// ---------------------------------------------------------------------------
export let supabaseClient  = null;
export let cloudConnected  = false;
let realtimeChannel        = null;
let cloudSyncTimer         = null;

// Callbacks inyectados desde main.js para evitar dependencias circulares
let _showToast       = () => {};
let _refreshModules  = () => {};
let _renderPayments  = () => {};

export function injectCallbacks({ showToast, refreshAllModules, renderPaymentsModule }) {
  _showToast      = showToast      || _showToast;
  _refreshModules = refreshAllModules || _refreshModules;
  _renderPayments = renderPaymentsModule || _renderPayments;
}

// ---------------------------------------------------------------------------
// Inicialización
// ---------------------------------------------------------------------------
export function initSupabase() {
  try {
    const url = localStorage.getItem(SUPABASE_URL_KEY)?.trim() || DEFAULT_SUPABASE_URL;
    const key = localStorage.getItem(SUPABASE_ANON_KEY)?.trim() || DEFAULT_SUPABASE_ANON_KEY;
    if (url && key && typeof supabase !== "undefined") {
      supabaseClient = supabase.createClient(url, key);
      cloudConnected = true;
      updateCloudStatusBadge(true);
      setupRealtimeSubscriptions();
      restoreSupabaseSession();
      return true;
    }
  } catch (e) {
    console.warn("Supabase init error:", e);
  }
  cloudConnected = false;
  updateCloudStatusBadge(false);
  return false;
}

export async function restoreSupabaseSession() {
  if (!supabaseClient) return;
  try {
    await supabaseClient.auth.signOut();
  } catch (e) { /* silencioso */ }
  sessionStorage.removeItem("laguna_active_role");
  sessionStorage.removeItem("laguna_auth_user");
}

export function applySupabaseProfile(user, profile) {
  setProfilePlayerId(profile.player_id);
  const found = squadData.find((p) => p.id === profile.player_id) || null;
  setLoggedInUser(found);
  const role = ["admin", "director"].includes(profile.role)
    ? "dt"
    : profile.role === "coach"
      ? "auxiliar"
      : "jugador";
  setCurrentRole(role);
  sessionStorage.setItem("laguna_active_role", role);
  sessionStorage.setItem("laguna_auth_user", user.id);
}

// ---------------------------------------------------------------------------
// Badge de estado de nube
// ---------------------------------------------------------------------------
export function updateCloudStatusBadge(connected) {
  const badge = document.getElementById("cloudStatusBadge");
  const icon  = document.getElementById("cloudStatusIcon");
  const text  = document.getElementById("cloudStatusText");
  if (!badge) return;
  if (connected) {
    if (icon) { icon.className = "fa-solid fa-cloud-check"; icon.style.color = "#3ecf8e"; }
    if (text) text.textContent = "Nube Conectada";
    badge.style.borderColor = "rgba(62,207,142,0.4)";
    badge.style.background  = "rgba(62,207,142,0.1)";
    badge.style.color       = "#3ecf8e";
  } else {
    if (icon) { icon.className = "fa-solid fa-cloud"; icon.style.color = "var(--accent-gold)"; }
    if (text) text.textContent = "Modo Local";
    badge.style.borderColor = "rgba(245,158,11,0.3)";
    badge.style.background  = "rgba(245,158,11,0.08)";
    badge.style.color       = "#f59e0b";
  }
}

// ---------------------------------------------------------------------------
// Sincronización completa desde la nube
// ---------------------------------------------------------------------------
export async function syncAllFromCloud() {
  if (!supabaseClient || !cloudConnected) return;
  try {
    _showToast("Sincronizando datos de la nube...", "info");
    const results = await Promise.all([
      supabaseClient.from("players").select("*").order("number"),
      supabaseClient.from("payments").select("*").order("id"),
      supabaseClient.from("calendar_events").select("*").order("date"),
      supabaseClient.from("injuries").select("*").order("id"),
      supabaseClient.from("justifications").select("*").order("id"),
    ]);
    const syncError = results.find((r) => r.error)?.error;
    if (syncError) throw syncError;
    const [playersR, paymentsR, eventsR, injuriesR, justR] = results;

    if (Array.isArray(playersR.data)) {
      setSquadData(playersR.data.map(mapPlayerFromCloud));
      localStorage.setItem("laguna_squad_v3", JSON.stringify(squadData));
    }
    if (Array.isArray(paymentsR.data)) {
      setPaymentsData(paymentsR.data.map(mapPaymentFromCloud));
      localStorage.setItem("laguna_payments_v3", JSON.stringify(paymentsData));
    }
    if (Array.isArray(eventsR.data)) {
      setCalendarEvents(eventsR.data.map(mapEventFromCloud));
      localStorage.setItem("laguna_events_v3", JSON.stringify(calendarEvents));
    }
    if (Array.isArray(injuriesR.data)) {
      setInjuredData(injuriesR.data.map(mapInjuryFromCloud));
      localStorage.setItem("laguna_injured_v3", JSON.stringify(injuredData));
    }
    if (Array.isArray(justR.data)) {
      setJustificationsData(justR.data.map(mapJustificationFromCloud));
      localStorage.setItem("laguna_justifications_v3", JSON.stringify(justificationsData));
    }
    _refreshModules();
    _showToast("✅ Datos sincronizados correctamente desde la nube.", "success");
  } catch (e) {
    console.error("Error syncing from cloud:", e);
    _showToast("Error al sincronizar desde la nube. Usando datos locales.", "warning");
  }
}

// ---------------------------------------------------------------------------
// Push individual a la nube
// ---------------------------------------------------------------------------
export async function pushPlayerToCloud(player) {
  if (!supabaseClient || !cloudConnected) return;
  try {
    const { error } = await supabaseClient.from("players").upsert(mapPlayerToCloud(player));
    if (error) console.error("Error pushing player:", error);
  } catch (e) { console.warn(e); }
}

export async function pushPaymentToCloud(payment) {
  if (!supabaseClient || !cloudConnected) return;
  try {
    const { error } = await supabaseClient.from("payments").upsert(mapPaymentToCloud(payment));
    if (error) console.error("Error pushing payment:", error);
  } catch (e) { console.warn(e); }
}

export async function pushEventToCloud(event) {
  if (!supabaseClient || !cloudConnected) return;
  try {
    const { error } = await supabaseClient.from("calendar_events").upsert(mapEventToCloud(event));
    if (error) console.error("Error pushing event:", error);
  } catch (e) { console.warn(e); }
}

export async function deletePlayerFromCloud(playerId) {
  if (!supabaseClient || !cloudConnected) return;
  try { await supabaseClient.from("players").delete().eq("id", playerId); } catch (e) { console.warn(e); }
}

export async function deleteFromCloud(table, id) {
  if (!supabaseClient || !cloudConnected) return;
  const { error } = await supabaseClient.from(table).delete().eq("id", id);
  if (error) console.error(`Error eliminando ${table}:`, error);
}

export async function pushAttendanceLog(player, status, checkinTime) {
  if (!supabaseClient || !cloudConnected || !player) return;
  const { error } = await supabaseClient.from("attendance_logs").upsert(
    { date: new Date().toISOString().split("T")[0], player_id: player.id, player_name: player.name, status, checkin_time: checkinTime || null },
    { onConflict: "date,player_id" },
  );
  if (error) console.error("Error guardando asistencia:", error);
}

// ---------------------------------------------------------------------------
// Sync completo al cloud (solo staff)
// ---------------------------------------------------------------------------
export function isStaffRole(role) { return role === "dt" || role === "auxiliar"; }

export async function syncLocalDataToCloud(role) {
  if (!supabaseClient || !cloudConnected || !isStaffRole(role)) return;
  const operations = [
    supabaseClient.from("players").upsert(squadData.map(mapPlayerToCloud)),
    supabaseClient.from("payments").upsert(paymentsData.map(mapPaymentToCloud)),
    supabaseClient.from("calendar_events").upsert(calendarEvents.map(mapEventToCloud)),
    supabaseClient.from("injuries").upsert(injuredData.map(mapInjuryToCloud)),
    supabaseClient.from("justifications").upsert(justificationsData.filter((j) => j.playerId).map(mapJustificationToCloud)),
  ];
  const results = await Promise.all(operations);
  const failed = results.find((r) => r.error);
  if (failed) throw failed.error;
}

export function queueCloudSync(role) {
  if (!supabaseClient || !cloudConnected || !isStaffRole(role)) return;
  clearTimeout(cloudSyncTimer);
  cloudSyncTimer = setTimeout(async () => {
    try {
      await syncLocalDataToCloud(role);
    } catch (e) {
      console.error("Error sincronizando cambios con Supabase:", e);
      _showToast("No se pudieron sincronizar todos los cambios con Supabase.", "warning");
    }
  }, 350);
}

// ---------------------------------------------------------------------------
// Subscripciones en tiempo real
// ---------------------------------------------------------------------------
export function setupRealtimeSubscriptions() {
  if (!supabaseClient) return;
  if (realtimeChannel) supabaseClient.removeChannel(realtimeChannel);
  realtimeChannel = supabaseClient
    .channel("laguna-realtime")
    .on("postgres_changes", { event: "*", schema: "public", table: "players" }, (payload) => {
      if (payload.eventType === "UPDATE" || payload.eventType === "INSERT") {
        const idx = squadData.findIndex((p) => p.id === payload.new.id);
        const updated = mapPlayerFromCloud(payload.new);
        if (idx >= 0) squadData[idx] = updated;
        else squadData.push(updated);
        localStorage.setItem("laguna_squad_v3", JSON.stringify(squadData));
        _refreshModules();
      } else if (payload.eventType === "DELETE") {
        setSquadData(squadData.filter((p) => p.id !== payload.old.id));
        localStorage.setItem("laguna_squad_v3", JSON.stringify(squadData));
        _refreshModules();
      }
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, (payload) => {
      if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
        const idx = paymentsData.findIndex((p) => p.id === payload.new.id);
        const updated = mapPaymentFromCloud(payload.new);
        if (idx >= 0) paymentsData[idx] = updated;
        else paymentsData.push(updated);
        localStorage.setItem("laguna_payments_v3", JSON.stringify(paymentsData));
        _renderPayments();
      }
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "injuries" }, () => syncAllFromCloud())
    .on("postgres_changes", { event: "*", schema: "public", table: "justifications" }, () => syncAllFromCloud())
    .subscribe();
}

// ---------------------------------------------------------------------------
// Modal de configuración Supabase
// ---------------------------------------------------------------------------
export function openSupabaseConfigModal() {
  const urlInput      = document.getElementById("supabaseUrlInput");
  const keyInput      = document.getElementById("supabaseKeyInput");
  const usernameInput = document.getElementById("supabaseAuthUsernameInput");
  if (urlInput)      urlInput.value      = localStorage.getItem(SUPABASE_URL_KEY) || "";
  if (keyInput)      keyInput.value      = localStorage.getItem(SUPABASE_ANON_KEY) || "";
  if (usernameInput) usernameInput.value = localStorage.getItem("laguna_auth_username") || "";
  updateSupabaseModalStatus();
  document.getElementById("supabaseConfigModal")?.classList.remove("hidden");
}

export function closeSupabaseConfigModal() {
  document.getElementById("supabaseConfigModal")?.classList.add("hidden");
}

export function updateSupabaseModalStatus() {
  const bar           = document.getElementById("supabaseStatusBar");
  const txt           = document.getElementById("supabaseStatusText");
  const disconnectRow = document.getElementById("supabaseDisconnectRow");
  if (cloudConnected) {
    if (bar) { bar.style.background = "rgba(62,207,142,0.12)"; bar.style.borderColor = "rgba(62,207,142,0.3)"; bar.style.color = "#3ecf8e"; }
    if (txt) txt.textContent = "✅ Conectado a Supabase — Sincronización en tiempo real activa.";
    if (disconnectRow) disconnectRow.classList.remove("hidden");
  } else {
    if (bar) { bar.style.background = "rgba(245,158,11,0.12)"; bar.style.borderColor = "rgba(245,158,11,0.3)"; bar.style.color = "#f59e0b"; }
    if (txt) txt.textContent = "Modo Local — Ingresa tus credenciales de Supabase para activar la nube.";
    if (disconnectRow) disconnectRow?.classList.add("hidden");
  }
}

export async function testSupabaseConnection() {
  const url = document.getElementById("supabaseUrlInput")?.value?.trim();
  const key = document.getElementById("supabaseKeyInput")?.value?.trim();
  if (!url || !key) { _showToast("Completa la URL y la API Key antes de probar.", "warning"); return; }
  if (typeof supabase === "undefined") { _showToast("SDK de Supabase no cargado. Revisa tu conexión a internet.", "error"); return; }
  _showToast("Probando conexión...", "info");
  try {
    const response = await fetch(`${url.replace(/\/+$/, "")}/auth/v1/settings`, { headers: { apikey: key } });
    if (!response.ok) throw new Error(`Supabase respondió con HTTP ${response.status}.`);
    _showToast("✅ Conexión exitosa a Supabase.", "success");
    const bar = document.getElementById("supabaseStatusBar");
    const txt = document.getElementById("supabaseStatusText");
    if (bar) { bar.style.background = "rgba(62,207,142,0.12)"; bar.style.borderColor = "rgba(62,207,142,0.3)"; bar.style.color = "#3ecf8e"; }
    if (txt) txt.textContent = "✅ Conexión probada con éxito. Haz clic en Conectar para activar.";
  } catch (e) {
    _showToast("Error de conexión: " + (e.message || "revisa tu URL y API Key."), "error");
  }
}

export function saveAndConnectSupabase() {
  const url      = document.getElementById("supabaseUrlInput")?.value?.trim();
  const key      = document.getElementById("supabaseKeyInput")?.value?.trim();
  const username = document.getElementById("supabaseAuthUsernameInput")?.value?.trim();
  if (!url || !key)  { _showToast("Completa la URL y la API Key.", "warning"); return; }
  if (!username)     { _showToast("Completa el usuario de la cuenta Supabase.", "warning"); return; }
  localStorage.setItem(SUPABASE_URL_KEY, url);
  localStorage.setItem(SUPABASE_ANON_KEY, key);
  localStorage.setItem("laguna_auth_username", username);
  const result = initSupabase();
  if (result) {
    updateSupabaseModalStatus();
    _showToast("🌐 Conectado a la nube. Sincronizando datos...", "success");
    setTimeout(() => closeSupabaseConfigModal(), 1500);
  } else {
    _showToast("No se pudo conectar. Verifica tus credenciales.", "error");
  }
}

export function disconnectSupabase() {
  if (realtimeChannel && supabaseClient) { supabaseClient.removeChannel(realtimeChannel); realtimeChannel = null; }
  supabaseClient = null;
  cloudConnected = false;
  localStorage.removeItem(SUPABASE_URL_KEY);
  localStorage.removeItem(SUPABASE_ANON_KEY);
  updateCloudStatusBadge(false);
  updateSupabaseModalStatus();
  _showToast("Desconectado de la nube. Usando almacenamiento local.", "info");
  setTimeout(() => closeSupabaseConfigModal(), 1200);
}

// ---------------------------------------------------------------------------
// Mapeos cloud (snake_case) ↔ app (camelCase)
// ---------------------------------------------------------------------------
export function mapPlayerFromCloud(p) {
  return {
    id: p.id, number: p.number, name: p.name, position: p.position,
    positionAlt: p.position_alt, group: p.player_group, status: p.status,
    checkinTime: p.checkin_time, attendancePct: p.attendance_pct, streak: p.streak,
    starter: p.starter, injured: p.injured, goals: p.goals, assists: p.assists,
    mins: p.mins, cards: p.cards, regStatus: p.reg_status, birthdate: p.birthdate,
    tutorName: p.tutor_name, phone: p.phone, photo: p.photo || "LAGUNA.jpg",
    contacts: p.contacts || [], docActa: p.doc_acta, docCURP: p.doc_curp,
    docMedico: p.doc_medico, docINE: p.doc_ine, docEscolar: p.doc_escolar,
    docFiles: p.doc_files || {}, gameInfo: p.game_info || [], folio: p.folio || null,
  };
}

export function mapPlayerToCloud(p) {
  return {
    id: p.id, number: p.number, name: p.name, position: p.position,
    position_alt: p.positionAlt, player_group: p.group, status: p.status,
    checkin_time: p.checkinTime, attendance_pct: p.attendancePct, streak: p.streak,
    starter: p.starter, injured: p.injured, goals: p.goals || 0, assists: p.assists || 0,
    mins: p.mins || 0, cards: p.cards || 0, reg_status: p.regStatus || "Activo",
    birthdate: p.birthdate || null, tutor_name: p.tutorName, phone: p.phone,
    photo: p.photo || "LAGUNA.jpg", contacts: p.contacts || [],
    doc_acta: p.docActa, doc_curp: p.docCURP, doc_medico: p.docMedico,
    doc_ine: p.docINE, doc_escolar: p.docEscolar || false,
    doc_files: p.docFiles || {}, game_info: p.gameInfo || [],
    folio: p.folio || null, updated_at: new Date().toISOString(),
  };
}

export function mapPaymentFromCloud(p) {
  return {
    id: p.id, folio: p.folio, playerId: p.player_id, playerName: p.player_name,
    tutorName: p.tutor_name, concept: p.concept, baseAmount: p.base_amount,
    discountPct: p.discount_pct, discountAmount: p.discount_amount,
    finalAmount: p.final_amount, method: p.method, date: p.date,
    status: p.status, notes: p.notes,
  };
}

export function mapPaymentToCloud(p) {
  return {
    id: p.id, folio: p.folio, player_id: p.playerId, player_name: p.playerName,
    tutor_name: p.tutorName, concept: p.concept, base_amount: p.baseAmount,
    discount_pct: p.discountPct, discount_amount: p.discountAmount,
    final_amount: p.finalAmount, method: p.method, date: p.date, status: p.status, notes: p.notes,
  };
}

export function mapEventFromCloud(e) {
  return { id: e.id, type: e.type, title: e.title, date: e.date, time: e.time, location: e.location, result: e.result, matchStats: e.match_stats || [] };
}

export function mapEventToCloud(e) {
  return { id: e.id, type: e.type, title: e.title, date: e.date, time: e.time, location: e.location, result: e.result, match_stats: e.matchStats || [] };
}

export function mapInjuryFromCloud(i) {
  return { id: i.id, player: i.player, playerId: i.player_id, type: i.diagnosis, diagnosis: i.diagnosis, startDate: i.start_date, time: i.estimated_return, estimatedReturn: i.estimated_return, status: i.status };
}

export function mapInjuryToCloud(i) {
  return { id: i.id, player_id: i.playerId, player: i.player, diagnosis: i.type || i.diagnosis, start_date: i.startDate || new Date().toISOString().split("T")[0], estimated_return: i.estimatedReturn || null, status: i.status || "En Tratamiento" };
}

export function mapJustificationFromCloud(j) {
  return {
    id: j.id, playerId: j.player_id,
    player: j.player || squadData.find((p) => p.id === j.player_id)?.name || "Jugador",
    date: j.absence_date, reason: j.reason, detail: j.detail || "", status: j.status,
  };
}

export function mapJustificationToCloud(j) {
  return { id: j.id, player_id: j.playerId, absence_date: j.date, reason: j.reason, detail: j.detail || null, status: j.status };
}
