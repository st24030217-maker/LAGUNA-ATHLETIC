/* ==========================================================================
   LAGUNA ATHLETIC 2026 — js/state.js
   Estado global centralizado, datos por defecto y persistencia local.
   ========================================================================== */

// ---------------------------------------------------------------------------
// Estado de la aplicación (mutable)
// ---------------------------------------------------------------------------
export let squadData = [];
export let calendarEvents = [];
export let justificationsData = [];
export let injuredData = [];
export let paymentsData = [];

export let currentRole = null;
export let loggedInUser = null;
export let profilePlayerId = null;

// ---------------------------------------------------------------------------
// Setters (para que los módulos puedan mutar el estado centralizado)
// ---------------------------------------------------------------------------
export function setSquadData(data)          { squadData = data; }
export function setCalendarEvents(data)     { calendarEvents = data; }
export function setJustificationsData(data) { justificationsData = data; }
export function setInjuredData(data)        { injuredData = data; }
export function setPaymentsData(data)       { paymentsData = data; }
export function setCurrentRole(role)        { currentRole = role; }
export function setLoggedInUser(user)       { loggedInUser = user; }
export function setProfilePlayerId(id)      { profilePlayerId = id; }

// ---------------------------------------------------------------------------
// Datos semilla por defecto (demo / fallback sin nube)
// ---------------------------------------------------------------------------
export const defaultSquadData = [
  {
    id: 10, number: 10, name: "Emilio Suárez", position: "Medio Ofensivo",
    attendancePct: 95, streak: "10 A", status: "Ausente", checkinTime: "-",
    starter: true, injured: false, goals: 6, assists: 4, mins: 900, cards: 1,
    tutorName: "Familia Suárez", phone: "+52 844 123 4567",
    docActa: true, docCURP: true, docMedico: true, docINE: true,
    photo: "LAGUNA.jpg",
    gameInfo: [
      {
        id: 101, title: "Resumen del partido vs. Real San Luis",
        date: "2026-08-09", type: "partido",
        downloadUrl: "https://example.com/laguna/emilio-resumen.pdf",
        notes: "Buena recuperación defensiva y dos acciones de peligro en el segundo tiempo.",
      },
    ],
  },
  {
    id: 15, number: 15, name: "Mateo Suárez", position: "Delantero Centro",
    attendancePct: 92, streak: "8 A", status: "Ausente", checkinTime: "-",
    starter: true, injured: false, goals: 4, assists: 2, mins: 750, cards: 0,
    tutorName: "Familia Suárez", phone: "+52 844 123 4567",
    docActa: true, docCURP: true, docMedico: true, docINE: true,
    photo: "LAGUNA.jpg",
    gameInfo: [
      {
        id: 102, title: "Análisis de rendimiento vs. Real San Luis",
        date: "2026-08-09", type: "partido",
        downloadUrl: "https://example.com/laguna/mateo-analisis.pdf",
        notes: "Se mantuvo activo en presión alta y generó dos oportunidades claras.",
      },
    ],
  },
  {
    id: 2, number: 2, name: "Lucas Sánchez", position: "Lateral Derecho",
    attendancePct: 90, streak: "6 A", status: "Ausente", checkinTime: "-",
    starter: true, injured: false, goals: 1, assists: 3, mins: 680, cards: 0,
    tutorName: "Familia Sánchez", phone: "+52 844 222 3344",
    docActa: true, docCURP: true, docMedico: true, docINE: false,
    photo: "LAGUNA.jpg", gameInfo: [],
  },
];

export const defaultPayments = [
  {
    id: 101, folio: "LA-PAGO-1001", playerId: 10,
    playerName: "Emilio Suárez (#10)", tutorName: "Familia Suárez",
    concept: "Colegiatura Mensual", baseAmount: 1200, discountPct: 0,
    discountAmount: 0, finalAmount: 1200, method: "Transferencia SPEI",
    date: "2026-08-01", status: "Pagado", notes: "Colegiatura Agosto",
  },
  {
    id: 102, folio: "LA-PAGO-1002", playerId: 15,
    playerName: "Mateo Suárez (#15)", tutorName: "Familia Suárez",
    concept: "Colegiatura Mensual", baseAmount: 1200, discountPct: 20,
    discountAmount: 240, finalAmount: 960, method: "Efectivo",
    date: "2026-08-01", status: "Pagado", notes: "Descuento 2º Hermano Suárez",
  },
];

export const defaultCalendarEvents = [
  { id: 1, type: "entrenamiento", title: "Entrenamiento Táctico", date: "2026-08-07", time: "08:00", location: "Cancha 1", result: null },
  { id: 2, type: "partido", title: "Partido vs Real San Luis", date: "2026-08-09", time: "16:00", location: "Estadio Central", result: null },
];

export const defaultJustifications = [
  {
    id: 1, player: "Emilio Suárez (#10)", date: "2026-08-06",
    reason: "Examen Académico", detail: "Examen final universitario.", status: "Aprobada",
  },
];

// ---------------------------------------------------------------------------
// Persistencia local (localStorage)
// ---------------------------------------------------------------------------
export function loadData() {
  try {
    const savedSquad    = localStorage.getItem("laguna_squad_v3");
    const savedEvents   = localStorage.getItem("laguna_events_v3");
    const savedJust     = localStorage.getItem("laguna_justifications_v3");
    const savedPayments = localStorage.getItem("laguna_payments_v3");
    const savedInjured  = localStorage.getItem("laguna_injured_v3");

    squadData           = savedSquad    ? JSON.parse(savedSquad)    : [...defaultSquadData];
    calendarEvents      = savedEvents   ? JSON.parse(savedEvents)   : [...defaultCalendarEvents];
    justificationsData  = savedJust     ? JSON.parse(savedJust)     : [...defaultJustifications];
    injuredData         = savedInjured  ? JSON.parse(savedInjured)  : [];
    paymentsData        = savedPayments ? JSON.parse(savedPayments) : [...defaultPayments];
  } catch (error) {
    console.error("Error loading data:", error);
    squadData          = [...defaultSquadData];
    calendarEvents     = [...defaultCalendarEvents];
    justificationsData = [...defaultJustifications];
    injuredData        = [];
    paymentsData       = [...defaultPayments];
  }
}

export function saveData(cloudSyncFn = null) {
  try {
    localStorage.setItem("laguna_squad_v3",           JSON.stringify(squadData));
    localStorage.setItem("laguna_events_v3",          JSON.stringify(calendarEvents));
    localStorage.setItem("laguna_justifications_v3",  JSON.stringify(justificationsData));
    localStorage.setItem("laguna_payments_v3",        JSON.stringify(paymentsData));
    localStorage.setItem("laguna_injured_v3",         JSON.stringify(injuredData));
    if (typeof cloudSyncFn === "function") cloudSyncFn();
  } catch (error) {
    // showToast será inyectado desde ui.js en main.js
    console.error("Error guardando datos localmente.", error);
  }
}
