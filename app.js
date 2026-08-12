/* ==========================================================================
   LAGUNA ATHLETIC 2026 - APP LOGIC (EXPANDED PRO VERSION)
   ========================================================================== */

let squadData = [];
let calendarEvents = [];
let justificationsData = [];
let injuredData = [];

let currentRole = null;
let loggedInUser = null;
let attendanceChart = null;

const defaultSquadData = [
  { id: 1, number: 1, name: "Mateo Silva", position: "Portero", attendancePct: 96, streak: "12 A", status: "Ausente", checkinTime: "-", starter: true, injured: false, goals: 0, assists: 1, mins: 1440, cards: 0 },
  { id: 2, number: 2, name: "Lucas Sánchez", position: "Lateral Derecho", attendancePct: 92, streak: "8 A", status: "Ausente", checkinTime: "-", starter: true, injured: false, goals: 1, assists: 3, mins: 1280, cards: 1 },
  { id: 3, number: 3, name: "Gabriel Gómez", position: "Lateral Izquierdo", attendancePct: 100, streak: "15 A", status: "Ausente", checkinTime: "-", starter: true, injured: false, goals: 2, assists: 5, mins: 1350, cards: 2 },
  { id: 4, number: 4, name: "Nicolás Ramos", position: "Defensa Central", attendancePct: 88, streak: "4 A", status: "Ausente", checkinTime: "-", starter: true, injured: false, goals: 3, assists: 0, mins: 1100, cards: 4 },
  { id: 5, number: 5, name: "Santiago Pérez", position: "Defensa Central", attendancePct: 94, streak: "10 A", status: "Ausente", checkinTime: "-", starter: true, injured: false, goals: 1, assists: 1, mins: 1300, cards: 1 },
  { id: 6, number: 6, name: "Carlos Alcaraz", position: "Medio Defensivo", attendancePct: 91, streak: "7 A", status: "Ausente", checkinTime: "-", starter: true, injured: false, goals: 0, assists: 4, mins: 1150, cards: 3 },
  { id: 7, number: 7, name: "Joaquín Torres", position: "Extremo Derecho", attendancePct: 85, streak: "2 A", status: "Ausente", checkinTime: "-", starter: true, injured: false, goals: 6, assists: 7, mins: 980, cards: 0 },
  { id: 8, number: 8, name: "Diego Valdés", position: "Mediocampista", attendancePct: 95, streak: "11 A", status: "Ausente", checkinTime: "-", starter: true, injured: false, goals: 4, assists: 8, mins: 1400, cards: 1 },
  { id: 9, number: 9, name: "Javier Martínez", position: "Delantero Centro", attendancePct: 98, streak: "14 A", status: "Ausente", checkinTime: "-", starter: true, injured: false, goals: 15, assists: 2, mins: 1380, cards: 1 },
  { id: 10, number: 10, name: "Emilio Suárez", position: "Medio Ofensivo", attendancePct: 90, streak: "6 A", status: "Ausente", checkinTime: "-", starter: true, injured: false, goals: 12, assists: 10, mins: 1240, cards: 2 },
  { id: 11, number: 11, name: "Tomás López", position: "Extremo Izquierdo", attendancePct: 89, streak: "5 A", status: "Ausente", checkinTime: "-", starter: true, injured: false, goals: 8, assists: 6, mins: 1190, cards: 0 },
  { id: 12, number: 12, name: "Adrián Fernández", position: "Portero", attendancePct: 93, streak: "9 A", status: "Ausente", checkinTime: "-", starter: false, injured: false, goals: 0, assists: 0, mins: 90, cards: 0 },
  { id: 13, number: 13, name: "Rodrigo Morales", position: "Defensa Central", attendancePct: 82, streak: "1 A", status: "Ausente", checkinTime: "-", starter: false, injured: false, goals: 0, assists: 0, mins: 450, cards: 2 },
  { id: 14, number: 14, name: "Bautista Castro", position: "Mediocampista", attendancePct: 87, streak: "3 A", status: "Ausente", checkinTime: "-", starter: false, injured: false, goals: 2, assists: 1, mins: 600, cards: 1 }
];

const defaultCalendarEvents = [
  { id: 1, type: "entrenamiento", title: "Entrenamiento Táctico", date: "2026-08-07", time: "08:00", location: "Cancha 1", result: null },
  { id: 2, type: "partido", title: "Partido vs Real San Luis", date: "2026-08-09", time: "16:00", location: "Estadio Central", result: null }
];

const defaultJustifications = [
  { id: 1, player: "Emilio Suárez (#10)", date: "2026-08-06", reason: "Examen Académico", detail: "Examen final universitario.", status: "Aprobada" }
];

// --- TOASTS ---
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  let icon = 'fa-circle-info';
  if(type === 'success') icon = 'fa-circle-check';
  if(type === 'warning') icon = 'fa-triangle-exclamation';
  if(type === 'error') icon = 'fa-circle-xmark';

  toast.innerHTML = `<i class="fa-solid ${icon} toast-icon"></i><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// --- PERSISTENCE ---
function loadData() {
  try {
    const savedSquad = localStorage.getItem("laguna_squad_v2");
    const savedEvents = localStorage.getItem("laguna_events_v2");
    const savedJust = localStorage.getItem("laguna_justifications_v2");
    const savedInjured = localStorage.getItem("laguna_injured_v2");

    squadData = savedSquad ? JSON.parse(savedSquad) : [...defaultSquadData];
    calendarEvents = savedEvents ? JSON.parse(savedEvents) : [...defaultCalendarEvents];
    justificationsData = savedJust ? JSON.parse(savedJust) : [...defaultJustifications];
    injuredData = savedInjured ? JSON.parse(savedInjured) : [];
  } catch (error) {
    console.error("Error loading data:", error);
    squadData = [...defaultSquadData];
    calendarEvents = [...defaultCalendarEvents];
    justificationsData = [...defaultJustifications];
    injuredData = [];
  }
}

function saveData() {
  try {
    localStorage.setItem("laguna_squad_v2", JSON.stringify(squadData));
    localStorage.setItem("laguna_events_v2", JSON.stringify(calendarEvents));
    localStorage.setItem("laguna_justifications_v2", JSON.stringify(justificationsData));
    localStorage.setItem("laguna_injured_v2", JSON.stringify(injuredData));
  } catch (error) {
    showToast("Error guardando datos localmente.", "error");
  }
}

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  
  // Check login state
  const savedRole = sessionStorage.getItem("laguna_active_role");
  if (savedRole) {
    currentRole = savedRole;
    document.getElementById("loginScreen").classList.add("hidden");
    document.getElementById("appLayout").style.display = "grid";
    postLoginInit();
  }
});

// --- LOGIN MODULE ---
function handleLogin(e) {
  e.preventDefault();
  const role = document.getElementById("loginRole").value;
  if (!role) return;
  
  currentRole = role;
  sessionStorage.setItem("laguna_active_role", role);
  
  // Fake animation
  document.getElementById("loginScreen").style.opacity = '0';
  document.getElementById("loginScreen").style.transition = 'opacity 0.4s ease';
  
  setTimeout(() => {
    document.getElementById("loginScreen").classList.add("hidden");
    document.getElementById("appLayout").style.display = "grid";
    postLoginInit();
    showToast("Sesión iniciada correctamente.", "success");
  }, 400);
}

function logout() {
  sessionStorage.removeItem("laguna_active_role");
  location.reload();
}

function postLoginInit() {
  applyRolePermissions();
  populateQuickPlayerSelect();
  renderAttendanceTable();
  renderSquadCallupList();
  renderCalendarEvents();
  renderJustifications();
  renderRankingTable();
  renderInjuredTable();
  renderRegTable();
  initChart();
  updateNoticeTemplate();
  initDragAndDrop();


  // Determine display name and greet
  let displayName = '';
  let displayRole = '';
  if (currentRole === 'jugador') {
    loggedInUser = squadData[0];
    displayName = loggedInUser.name;
    displayRole = `Jugador · #${loggedInUser.number} · ${loggedInUser.position}`;
    document.getElementById("activeUserName").innerText = `${loggedInUser.name} (#${loggedInUser.number})`;
  } else if (currentRole === 'dt') {
    displayName = 'Coach Zúñiga';
    displayRole = 'Director Técnico · Admin';
    document.getElementById("activeUserName").innerText = "Coach Zúñiga (Admin)";
  } else {
    displayName = 'Directiva';
    displayRole = 'Acceso de Solo Lectura';
    document.getElementById("activeUserName").innerText = "Directiva Club";
  }

  // Time-based greeting
  const hour = new Date().getHours();
  let greeting = 'Buenos días';
  if (hour >= 12 && hour < 19) greeting = 'Buenas tardes';
  else if (hour >= 19) greeting = 'Buenas noches';

  const greetingEl = document.getElementById('greetingHeader');
  const subEl      = document.querySelector('.greeting-sub');
  if (greetingEl) {
    greetingEl.innerHTML = `${greeting}, <span style="color:var(--accent-primary)">${displayName}</span>.`;
  }
  if (subEl) {
    subEl.innerText = displayRole + ' · Temporada 2026';
  }
}

// --- UI NAVIGATION ---
function showModuleTab(tabId) {
  document.querySelectorAll(".module-panel").forEach((el) => el.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach((el) => el.classList.remove("active"));

  const targetPanel = document.getElementById(tabId);
  if (targetPanel) targetPanel.classList.add("active");

  const tabBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
  if (tabBtn) tabBtn.classList.add("active");

  if (tabId === "mod-estadisticas" && attendanceChart) {
    setTimeout(() => attendanceChart.resize(), 100);
  }
  
  if(window.innerWidth <= 900) {
    document.getElementById("mainSidebar").classList.remove("open");
  }
}

function toggleSidebar() {
  document.getElementById("mainSidebar").classList.toggle("open");
}

// --- ROLE SYSTEM ---
function applyRolePermissions() {
  const isDT = currentRole === "dt";
  const isDirectiva = currentRole === "directiva";
  const canEdit = isDT;
  
  document.querySelectorAll(".role-dt-only").forEach(el => {
    el.style.display = canEdit ? "" : "none";
  });

  document.querySelectorAll(".player-marker").forEach(el => {
    if (!canEdit) {
      el.classList.remove("role-editable");
      el.style.cursor = "default";
    } else {
      el.classList.add("role-editable");
    }
  });
}

// --- MODULE: ASISTENCIA QR ---
function populateQuickPlayerSelect() {
  const select = document.getElementById("quickPlayerSelect");
  const injurySelect = document.getElementById("injuryPlayerSelect");
  if (!select) return;
  select.innerHTML = "";
  if(injurySelect) injurySelect.innerHTML = "";
  
  squadData.forEach(p => {
    const opt = `<option value="${p.id}">#${p.number} ${p.name}</option>`;
    select.innerHTML += opt;
    if(injurySelect && !p.injured) injurySelect.innerHTML += opt;
  });
}

function simulateQRCheckIn() {
  const select = document.getElementById("quickPlayerSelect");
  const playerId = parseInt(select.value);
  const player = squadData.find((p) => p.id === playerId);
  if (!player) return;

  if (player.status === "Presente") {
    showToast(`${player.name} ya registró asistencia.`, "warning");
    return;
  }

  const now = new Date();
  const timeStr = now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

  player.status = "Presente";
  player.checkinTime = timeStr;
  saveData();

  const alertBox = document.getElementById("lastCheckinAlert");
  document.getElementById("lastCheckinText").innerText = `Asistencia de ${player.name} (${timeStr})`;
  alertBox.classList.remove("hidden");
  setTimeout(() => alertBox.classList.add("hidden"), 3000);

  renderAttendanceTable();
  renderRankingTable();
  updateChartData();
}

function markManualAttendance(playerId, newStatus) {
  const player = squadData.find(p => p.id === playerId);
  if (!player) return;
  player.status = newStatus;
  player.checkinTime = newStatus === "Presente" ? "Manual DT" : "-";
  saveData();
  renderAttendanceTable();
  updateChartData();
}

function renderAttendanceTable() {
  const tbody = document.getElementById("attendanceTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";
  let presentCount = 0;

  squadData.forEach(p => {
    if (p.status === "Presente") presentCount++;
    const tr = document.createElement("tr");
    let badgeClass = p.status === "Presente" ? "badge-success" : (p.status === "Justificado" ? "badge-warning" : "badge-danger");

    tr.innerHTML = `
      <td><strong>#${p.number}</strong> ${p.name} <br><small class="text-muted">${p.position}</small></td>
      <td><span class="badge ${badgeClass}">${p.status}</span></td>
      <td class="mono-text text-muted">${p.checkinTime}</td>
      <td class="role-dt-only">
          <button class="btn btn-ghost" style="padding:0.4rem; font-size:0.8rem;" onclick="markManualAttendance(${p.id}, 'Presente')"><i class="fa-solid fa-check text-success"></i></button>
          <button class="btn btn-ghost" style="padding:0.4rem; font-size:0.8rem;" onclick="markManualAttendance(${p.id}, 'Ausente')"><i class="fa-solid fa-xmark text-danger"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  document.getElementById("attendanceCount").innerText = `${presentCount}/${squadData.length} Presentes`;
  applyRolePermissions();
}

// --- MODULE: ALINEACION & PERFILES ---
let currentSlotForModal = null;
const slotAssignments = { GK: 1, LB: 3, CB1: 4, CB2: 5, RB: 2, MCD: 6, MC1: 8, MC2: 10, EI: 11, DC: 9, ED: 7 };

function changePitchSlot(slotPos) {
  if (currentRole !== "dt") return;
  currentSlotForModal = slotPos;
  const select = document.getElementById("modalPlayerSelect");
  select.innerHTML = "";

  squadData.forEach(p => {
    if(p.injured) return; // Injured players cannot play
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = `#${p.number} ${p.name} (${p.position})`;
    select.appendChild(opt);
  });

  document.getElementById("modalPositionTitle").innerText = `Asignar Posición [${slotPos}]`;
  document.getElementById("playerSelectModal").classList.remove("hidden");
}

function closePlayerModal() {
  document.getElementById("playerSelectModal").classList.add("hidden");
  currentSlotForModal = null;
}

function confirmPlayerSelection() {
  const playerId = parseInt(document.getElementById("modalPlayerSelect").value);
  const player = squadData.find((p) => p.id === playerId);

  if (player && currentSlotForModal) {
    if(player.injured) {
      showToast("Este jugador está lesionado.", "error");
      return;
    }
    
    document.getElementById(`slot-${currentSlotForModal}`).innerText = currentSlotForModal;
    
    // Update marker shirt visually
    const marker = document.getElementById(`slot-${currentSlotForModal}`).previousElementSibling.previousElementSibling;
    if(marker && marker.classList.contains('marker-shirt')) {
      marker.innerText = player.number;
    }

    const prevId = slotAssignments[currentSlotForModal];
    slotAssignments[currentSlotForModal] = player.id;

    if (prevId && prevId !== player.id) {
      const stillHasSlot = Object.values(slotAssignments).includes(prevId);
      const prev = squadData.find((p) => p.id === prevId);
      if (prev && !stillHasSlot) prev.starter = false;
    }
    player.starter = true;

    saveData();
    renderSquadCallupList();
    showToast(`${player.name} de titular.`, "success");
  }
  closePlayerModal();
}

function saveLineup() {
  saveData();
  showToast("Convocatoria publicada al plantel.", "success");
}

function renderSquadCallupList() {
  const container = document.getElementById("squadCallupList");
  if (!container) return;
  container.innerHTML = "";

  squadData.forEach((p) => {
    const item = document.createElement("div");
    item.className = "squad-player-item";
    item.onclick = () => openProfileModal(p.id);
    
    let statusHTML = p.starter ? '<span class="badge badge-neon">TITULAR</span>' : '<span class="badge" style="border-color:var(--border-strong);">SUPLENTE</span>';
    if(p.injured) statusHTML = '<span class="badge badge-danger">LESIONADO</span>';

    item.innerHTML = `
      <div>
        <strong style="color: ${p.injured ? 'var(--accent-danger)' : 'var(--text-main)'}">#${p.number} ${p.name}</strong>
        <br><small class="text-muted">${p.position}</small>
      </div>
      <div>${statusHTML}</div>
    `;
    container.appendChild(item);
  });
}

function openProfileModal(id) {
  const p = squadData.find(x => x.id === id);
  if(!p) return;
  
  document.getElementById("profileNumber").innerText = p.number;
  document.getElementById("profileName").innerText = p.name;
  document.getElementById("profilePosition").innerText = p.position;
  
  const badge = document.getElementById("profileStatusBadge");
  if(p.injured) {
    badge.className = "badge badge-danger mt-2";
    badge.innerText = "Baja Médica";
  } else {
    badge.className = "badge badge-success mt-2";
    badge.innerText = "Activo";
  }
  
  document.getElementById("profileGoals").innerText = p.goals;
  document.getElementById("profileAssists").innerText = p.assists;
  document.getElementById("profileMins").innerText = p.mins + "'";
  document.getElementById("profileCards").innerText = "🟨 " + p.cards;
  
  document.getElementById("playerProfileModal").classList.remove("hidden");
}
function closeProfileModal() { document.getElementById("playerProfileModal").classList.add("hidden"); }

// --- MODULE: MEDICAL (NEW) ---
function reportInjury(e) {
  e.preventDefault();
  const playerId = parseInt(document.getElementById("injuryPlayerSelect").value);
  const type = document.getElementById("injuryType").value;
  const time = document.getElementById("injuryTime").value;
  
  const p = squadData.find(x => x.id === playerId);
  if(!p) return;
  
  p.injured = true;
  p.starter = false; // Remove from lineup
  
  injuredData.push({ id: Date.now(), player: p.name, number: p.number, type, time, playerId: p.id });
  saveData();
  
  showToast(`${p.name} enviado a enfermería.`, "warning");
  document.getElementById("injuryForm").reset();
  
  renderInjuredTable();
  renderSquadCallupList();
  populateQuickPlayerSelect();
}

function dischargePlayer(injuryId) {
  const inj = injuredData.find(x => x.id === injuryId);
  if(!inj) return;
  
  const p = squadData.find(x => x.id === inj.playerId);
  if(p) p.injured = false;
  
  injuredData = injuredData.filter(x => x.id !== injuryId);
  saveData();
  
  showToast(`${p.name} tiene el alta médica.`, "success");
  renderInjuredTable();
  renderSquadCallupList();
  populateQuickPlayerSelect();
}

function renderInjuredTable() {
  const tbody = document.getElementById("injuredTableBody");
  if(!tbody) return;
  tbody.innerHTML = "";
  
  if(injuredData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No hay jugadores lesionados.</td></tr>`;
    return;
  }
  
  injuredData.forEach(i => {
    tbody.innerHTML += `
      <tr>
        <td><strong>#${i.number}</strong> ${i.player}</td>
        <td class="text-danger">${i.type}</td>
        <td><span class="badge" style="border-color:var(--border-strong);">${i.time}</span></td>
        <td class="role-dt-only">
          <button class="btn btn-ghost" style="padding:0.4rem; font-size:0.8rem; color:var(--accent-neon);" onclick="dischargePlayer(${i.id})"><i class="fa-solid fa-staff-snake"></i> Alta</button>
        </td>
      </tr>
    `;
  });
  applyRolePermissions();
}

// --- MODULE: CALENDAR & RESULTS ---
let currentEventForResult = null;

function renderCalendarEvents() {
  const grid = document.getElementById("calendarEventsGrid");
  if (!grid) return;
  grid.innerHTML = "";

  calendarEvents.sort((a, b) => new Date(a.date) - new Date(b.date)).forEach((ev) => {
    const card = document.createElement("div");
    card.className = "event-card";
    
    let dFormatted = ev.date;
    try {
      dFormatted = new Date(ev.date + 'T00:00:00').toLocaleDateString("es-ES", { weekday: 'short', month: 'short', day: 'numeric' });
    } catch(e){}

    let resultHtml = '';
    const today = new Date().toISOString().split('T')[0];
    
    if (ev.result) {
      resultHtml = `<div class="event-result text-primary">${ev.result}</div>`;
    } else if (ev.type === 'partido' && ev.date < today && currentRole === 'dt') {
      resultHtml = `<div class="margin-top text-center"><button class="btn btn-ghost btn-sm" onclick="openMatchResultModal(${ev.id}, '${ev.title}')">Cargar Resultado</button></div>`;
    }

    card.innerHTML = `
      <div class="event-date">${dFormatted} - ${ev.time}</div>
      <div class="event-title">${ev.title}</div>
      <div class="subtitle-text"><i class="fa-solid fa-location-dot"></i> ${ev.location}</div>
      ${resultHtml}
    `;
    grid.appendChild(card);
  });
}

function openAddEventModal() { document.getElementById("addEventModal").classList.remove("hidden"); }
function closeEventModal() { document.getElementById("addEventModal").classList.add("hidden"); }

function saveNewEvent() {
  const title = document.getElementById("newEvent-title").value;
  const date = document.getElementById("newEvent-date").value;
  if (!title || !date) return showToast("Falta título o fecha.", "error");

  const today = new Date().toISOString().split('T')[0];
  if (date < today) return showToast("No puedes crear eventos en fechas pasadas.", "warning");

  calendarEvents.push({
    id: Date.now(),
    type: document.getElementById("newEvent-type").value,
    title, date, time: document.getElementById("newEvent-time").value,
    location: document.getElementById("newEvent-location").value || "Por definir",
    result: null
  });

  saveData();
  renderCalendarEvents();
  closeEventModal();
}

function openMatchResultModal(eventId, title) {
  currentEventForResult = eventId;
  document.getElementById("matchResultTitle").innerText = title;
  document.getElementById("matchResultModal").classList.remove("hidden");
}
function closeMatchResultModal() { document.getElementById("matchResultModal").classList.add("hidden"); }

function saveMatchResult() {
  const l = document.getElementById("scoreLaguna").value;
  const r = document.getElementById("scoreRival").value;
  const ev = calendarEvents.find(x => x.id === currentEventForResult);
  
  if(ev) {
    ev.result = `LA ${l} - ${r} RIV`;
    saveData();
    renderCalendarEvents();
    showToast("Resultado guardado.", "success");
  }
  closeMatchResultModal();
}


// --- MODULE: JUSTIFICATIONS ---
function submitJustification(e) {
  e.preventDefault();
  const loggedPlayerName = loggedInUser ? `${loggedInUser.name} (#${loggedInUser.number})` : "Jugador (Web)";

  justificationsData.push({
    id: Date.now(),
    player: loggedPlayerName,
    date: document.getElementById("justDate").value,
    reason: document.getElementById("justReason").value,
    detail: document.getElementById("justDetail").value,
    status: "Pendiente"
  });

  saveData();
  renderJustifications();
  showToast("Justificación enviada.", "success");
  document.getElementById("justificationForm").reset();
}

function reviewJustification(id, status) {
  const item = justificationsData.find((j) => j.id === id);
  if (!item) return;
  item.status = status;
  saveData();
  renderJustifications();
}

function renderJustifications() {
  const c = document.getElementById("justificationsList");
  if (!c) return;
  c.innerHTML = justificationsData.length === 0 ? `<p class="text-muted text-center">Buzón vacío.</p>` : "";

  justificationsData.forEach((j) => {
    let bc = j.status === "Aprobada" ? "badge-success" : (j.status === "Rechazada" ? "badge-danger" : "badge-warning");
    let btnHtml = (j.status === "Pendiente" && currentRole === 'dt') ? `
      <div class="margin-top flex-end gap-2">
          <button class="btn btn-ghost" onclick="reviewJustification(${j.id}, 'Rechazada')">Rechazar</button>
          <button class="btn btn-primary" onclick="reviewJustification(${j.id}, 'Aprobada')">Aprobar</button>
      </div>` : "";

    c.innerHTML += `
      <div class="just-card">
        <div class="flex-between">
            <strong>${j.player}</strong>
            <span class="badge ${bc}">${j.status}</span>
        </div>
        <p class="subtitle-text mt-2">${j.date} | ${j.reason}</p>
        <p class="mt-2 text-muted"><em>"${j.detail}"</em></p>
        ${btnHtml}
      </div>`;
  });
}

// --- MODULE: WHATSAPP ---
function updateNoticeTemplate() {
  const type = document.getElementById("noticeTypeSelect").value;
  const area = document.getElementById("noticeMessageText");
  if(!area) return;
  
  const today = new Date().toISOString().split('T')[0];
  const nt = calendarEvents.find(e => e.type === "entrenamiento" && e.date >= today);
  const nm = calendarEvents.find(e => e.type === "partido" && e.date >= today);

  if (type === "entrenamiento") {
    area.value = `*LAGUNA ATHLETIC - RECORDATORIO*\n\nHola plantel,\nEl ${nt ? nt.date : 'Mañana'} tenemos *Entrenamiento Táctico* en ${nt ? nt.location : 'Cancha'} a las ${nt ? nt.time : '08:00'}.\n\nFavor de escanear su código QR. ⚽`;
  } else if (type === "partido") {
    area.value = `*LAGUNA ATHLETIC - CONVOCATORIA*\n\nOficial: *${nm ? nm.title : 'Partido Oficial'}*.\n📍 ${nm ? nm.location : 'Estadio Central'}\n\nFavor de revisar la alineación en la app.`;
  } else {
    area.value = `*LAGUNA ATHLETIC - AVISO*\n\nRegistramos una falta de asistencia sin justificar. Favor de ingresar a la plataforma y enviar su descargo.`;
  }
}
function simulateSendNotices() {
  window.open(`https://wa.me/?text=${encodeURIComponent(document.getElementById("noticeMessageText").value)}`, "_blank");
}

// --- MODULE: CHART & STATS ---
function initChart() {
  const canvas = document.getElementById("attendanceChart");
  if (!canvas || typeof Chart === "undefined") return;
  attendanceChart = new Chart(canvas.getContext("2d"), {
    type: "doughnut",
    data: {
      labels: ["Presentes", "Justificados", "Ausentes"],
      datasets: [{ data: [0, 0, 0], backgroundColor: ["#10b981", "#f59e0b", "#ef4444"], borderWidth: 0 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: "#94a3b8", font: { family: "'JetBrains Mono', monospace" } } } },
      cutout: '75%'
    }
  });
  updateChartData();
}

function updateChartData() {
  if (!attendanceChart) return;
  let p = 0, j = 0, a = 0;
  squadData.forEach(x => x.status === "Presente" ? p++ : (x.status === "Justificado" ? j++ : a++));
  attendanceChart.data.datasets[0].data = [p, j, a];
  attendanceChart.update();
}

function renderRankingTable() {
  const tb = document.getElementById("rankingTableBody");
  if(!tb) return;
  tb.innerHTML = "";
  
  [...squadData].sort((a,b) => b.attendancePct - a.attendancePct).slice(0, 5).forEach((p, i) => {
    tb.innerHTML += `
      <tr>
        <td class="text-muted">#${i+1}</td>
        <td><strong>${p.name}</strong></td>
        <td class="text-primary" style="font-weight:700;">${p.attendancePct}%</td>
        <td><span class="badge badge-success">${p.streak}</span></td>
      </tr>
    `;
  });
}

// ==========================================================================
// DRAG & DROP TACTICAL PITCH
// ==========================================================================
let draggedMarker = null;
let dragStartX = 0;
let dragStartY = 0;
let dragInitialLeft = 0;
let dragInitialTop = 0;
let isDragging = false;
let savedPositions = {};

function initDragAndDrop() {
  const pitch = document.getElementById('tacticalPitch');
  if (!pitch) return;

  // Load saved positions from localStorage
  try {
    const saved = localStorage.getItem('laguna_pitch_positions');
    if (saved) savedPositions = JSON.parse(saved);
  } catch(e) {}

  const markers = pitch.querySelectorAll('.player-marker');
  markers.forEach(marker => {
    const slot = marker.getAttribute('data-slot');
    // Restore saved positions
    if (savedPositions[slot]) {
      marker.style.left = savedPositions[slot].left;
      marker.style.top  = savedPositions[slot].top;
    }
    // Attach events
    marker.addEventListener('mousedown',  onDragStart);
    marker.addEventListener('touchstart', onDragStart, { passive: false });
  });

  document.addEventListener('mousemove', onDragMove, { passive: false });
  document.addEventListener('touchmove', onDragMove, { passive: false });
  document.addEventListener('mouseup',   onDragEnd);
  document.addEventListener('touchend',  onDragEnd);
}

function onDragStart(e) {
  const marker = e.currentTarget.closest('.player-marker');
  if (!marker) return;
  if (currentRole !== 'dt') {
    // Non-DT: just open profile on click
    return;
  }

  draggedMarker  = marker;
  isDragging     = false;

  const client   = e.touches ? e.touches[0] : e;
  dragStartX     = client.clientX;
  dragStartY     = client.clientY;

  // offsetLeft/offsetTop are already the centre-point (we use left/top + transform:-50%)
  dragInitialLeft = marker.offsetLeft;
  dragInitialTop  = marker.offsetTop;

  if (e.cancelable) e.preventDefault();
}

function onDragMove(e) {
  if (!draggedMarker) return;

  const client = e.touches ? e.touches[0] : e;
  const dx = client.clientX - dragStartX;
  const dy = client.clientY - dragStartY;

  // Threshold of 4px before we call it a drag
  if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
    isDragging = true;
    draggedMarker.classList.add('is-dragging');

    const pitch = document.getElementById('tacticalPitch');
    const pw = pitch.offsetWidth;
    const ph = pitch.offsetHeight;

    let newLeft = dragInitialLeft + dx;
    let newTop  = dragInitialTop  + dy;

    // Clamp within pitch boundaries
    newLeft = Math.max(0, Math.min(newLeft, pw));
    newTop  = Math.max(0, Math.min(newTop,  ph));

    draggedMarker.style.left = (newLeft / pw * 100).toFixed(2) + '%';
    draggedMarker.style.top  = (newTop  / ph * 100).toFixed(2) + '%';

    if (e.cancelable) e.preventDefault();
  }
}

function onDragEnd() {
  if (!draggedMarker) return;
  draggedMarker.classList.remove('is-dragging');

  if (isDragging) {
    // Persist new position
    const slot = draggedMarker.getAttribute('data-slot');
    savedPositions[slot] = {
      left: draggedMarker.style.left,
      top:  draggedMarker.style.top
    };
    try {
      localStorage.setItem('laguna_pitch_positions', JSON.stringify(savedPositions));
    } catch(e) {}
    showToast('Posición guardada.', 'success');
  } else {
    // It was a plain click → open the substitution modal
    const slot = draggedMarker.getAttribute('data-slot');
    if (slot) changePitchSlot(slot);
  }

  draggedMarker = null;
  isDragging    = false;
}

// ==========================================================================
// MODULE: REGISTRO DE JUGADORES
// ==========================================================================

let regFilter = 'todos';    // filtro activo de estatus
let regEditingId = null;    // id del jugador en edición (null = nuevo)

/**
 * Inicializa los datos extra de registro en cada jugador si no existen.
 * Garantiza compatibilidad con el array defaultSquadData ya existente.
 */
function ensureRegFields(player) {
  if (!player.regStatus)    player.regStatus    = 'Activo';
  if (!player.birthdate)    player.birthdate    = '';
  if (!player.phone)        player.phone        = '';
  if (!player.email)        player.email        = '';
  if (!player.regNotes)     player.regNotes     = '';
  return player;
}

/** Renders the registration table with current filter + search */
function renderRegTable() {
  const tbody       = document.getElementById('regTableBody');
  const countEl     = document.getElementById('regSquadCount');
  const searchVal   = (document.getElementById('regSearchInput')?.value || '').toLowerCase();
  if (!tbody) return;
  tbody.innerHTML   = '';

  // Ensure fields exist on all players
  squadData.forEach(ensureRegFields);

  const filtered = squadData.filter(p => {
    const matchFilter = regFilter === 'todos' || p.regStatus === regFilter;
    const matchSearch = !searchVal ||
      p.name.toLowerCase().includes(searchVal) ||
      String(p.number).includes(searchVal) ||
      p.position.toLowerCase().includes(searchVal);
    return matchFilter && matchSearch;
  });

  if (countEl) countEl.textContent = `${squadData.length} Jugador${squadData.length !== 1 ? 'es' : ''}`;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted" style="padding:2rem;">Sin jugadores con ese criterio.</td></tr>`;
    return;
  }

  const isDT = currentRole === 'dt';

  filtered.sort((a, b) => a.number - b.number).forEach(p => {
    const statusKey = (p.regStatus || 'Activo').toLowerCase().replace(/ /g, '');
    const badgeClass = `badge badge-status-${statusKey}`;
    const starterLabel = p.starter ? 'Titular' : 'Suplente';

    const actionsCells = isDT ? `
      <td>
        <button class="reg-action-btn edit" title="Editar" onclick="openEditPlayer(${p.id})">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="reg-action-btn delete" title="Eliminar" onclick="confirmDeletePlayer(${p.id})">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>` : '<td></td>';

    tbody.innerHTML += `
      <tr>
        <td class="mono-text text-primary" style="font-weight:700;">${p.number}</td>
        <td>
          <strong>${p.name}</strong>
          <br><small class="text-muted">${starterLabel}${p.phone ? ' · ' + p.phone : ''}</small>
        </td>
        <td class="text-muted" style="font-size:0.85rem;">${p.position}</td>
        <td><span class="${badgeClass}">${p.regStatus}</span></td>
        ${actionsCells}
      </tr>`;
  });

  applyRolePermissions();
}

/** Sets active filter and re-renders */
function setRegFilter(filter, btn) {
  regFilter = filter;
  document.querySelectorAll('.reg-filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderRegTable();
}

/** Live search handler */
function filterRegTable() {
  renderRegTable();
}

/** Handles form submit for both new player and edit */
function handlePlayerRegSubmit(e) {
  e.preventDefault();

  const name      = document.getElementById('regName').value.trim();
  const number    = parseInt(document.getElementById('regNumber').value);
  const position  = document.getElementById('regPosition').value;
  const birthdate = document.getElementById('regBirthdate').value;
  const phone     = document.getElementById('regPhone').value.trim();
  const email     = document.getElementById('regEmail').value.trim();
  const regStatus = document.getElementById('regStatus').value;
  const starter   = document.getElementById('regStarter').value === 'true';
  const regNotes  = document.getElementById('regNotes').value.trim();

  // Validate dorsal uniqueness
  const dorsalTaken = squadData.find(p => p.number === number && p.id !== regEditingId);
  if (dorsalTaken) {
    showToast(`El dorsal #${number} ya pertenece a ${dorsalTaken.name}.`, 'error');
    return;
  }

  if (regEditingId !== null) {
    // --- EDIT MODE ---
    const p = squadData.find(x => x.id === regEditingId);
    if (p) {
      p.name      = name;
      p.number    = number;
      p.position  = position;
      p.birthdate = birthdate;
      p.phone     = phone;
      p.email     = email;
      p.regStatus = regStatus;
      p.starter   = starter;
      p.regNotes  = regNotes;
      saveData();
      showToast(`Jugador ${name} actualizado.`, 'success');
    }
  } else {
    // --- NEW PLAYER ---
    const newId = Date.now();
    squadData.push({
      id: newId, number, name, position,
      attendancePct: 0, streak: '0 A',
      status: 'Ausente', checkinTime: '-',
      starter, injured: false,
      goals: 0, assists: 0, mins: 0, cards: 0,
      // Extended fields
      birthdate, phone, email, regStatus, regNotes
    });
    saveData();
    showToast(`${name} registrado en la plantilla.`, 'success');
  }

  resetRegForm();
  renderRegTable();
  renderSquadCallupList();
  populateQuickPlayerSelect();
}

/** Populates the form for editing an existing player */
function openEditPlayer(id) {
  const p = squadData.find(x => x.id === id);
  if (!p) return;
  ensureRegFields(p);

  regEditingId = id;

  document.getElementById('regEditId').value      = id;
  document.getElementById('regName').value        = p.name;
  document.getElementById('regNumber').value      = p.number;
  document.getElementById('regPosition').value    = p.position;
  document.getElementById('regBirthdate').value   = p.birthdate || '';
  document.getElementById('regPhone').value       = p.phone || '';
  document.getElementById('regEmail').value       = p.email || '';
  document.getElementById('regStatus').value      = p.regStatus || 'Activo';
  document.getElementById('regStarter').value     = p.starter ? 'true' : 'false';
  document.getElementById('regNotes').value       = p.regNotes || '';

  // Update form title & buttons
  document.getElementById('regFormTitle').innerHTML =
    `<i class="fa-solid fa-pen text-primary"></i> Editando: ${p.name}`;
  document.getElementById('regSubmitBtn').innerHTML =
    `<i class="fa-solid fa-cloud-arrow-up"></i> GUARDAR CAMBIOS`;
  document.getElementById('regCancelBtn').style.display = '';

  // Scroll form into view
  document.getElementById('playerRegForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/** Cancels edit mode and resets the form */
function cancelPlayerEdit() {
  regEditingId = null;
  resetRegForm();
}

function resetRegForm() {
  regEditingId = null;
  document.getElementById('playerRegForm').reset();
  document.getElementById('regEditId').value = '';
  document.getElementById('regFormTitle').innerHTML =
    `<i class="fa-solid fa-user-plus text-primary"></i> Nuevo Jugador`;
  document.getElementById('regSubmitBtn').innerHTML =
    `<i class="fa-solid fa-user-plus"></i> REGISTRAR JUGADOR`;
  document.getElementById('regCancelBtn').style.display = 'none';
}

/** Asks for confirmation before permanently deleting a player */
function confirmDeletePlayer(id) {
  const p = squadData.find(x => x.id === id);
  if (!p) return;

  // Use a simple confirm; in a real app you'd use a modal
  if (!confirm(`¿Eliminar permanentemente a ${p.name} (#${p.number}) del equipo?`)) return;

  squadData = squadData.filter(x => x.id !== id);
  injuredData = injuredData.filter(x => x.playerId !== id);
  saveData();
  showToast(`${p.name} eliminado de la plantilla.`, 'warning');
  renderRegTable();
  renderSquadCallupList();
  populateQuickPlayerSelect();
}

