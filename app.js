/* ==========================================================================
   LAGUNA ATHLETIC 2026 - APP LOGIC (EXPANDED PRO VERSION)
   ========================================================================== */

let squadData = [];
let calendarEvents = [];
let justificationsData = [];
let injuredData = [];
let paymentsData = [];

let currentRole = null;
let loggedInUser = null;
let attendanceChart = null;

const defaultSquadData = [
  { id: 10, number: 10, name: "Emilio Suárez", position: "Medio Ofensivo", attendancePct: 95, streak: "10 A", status: "Ausente", checkinTime: "-", starter: true, injured: false, goals: 6, assists: 4, mins: 900, cards: 1, tutorName: "Familia Suárez", phone: "+52 844 123 4567", docActa: true, docCURP: true, docMedico: true, docINE: true, photo: "LAGUNA.jpg" },
  { id: 15, number: 15, name: "Mateo Suárez", position: "Delantero Centro", attendancePct: 92, streak: "8 A", status: "Ausente", checkinTime: "-", starter: true, injured: false, goals: 4, assists: 2, mins: 750, cards: 0, tutorName: "Familia Suárez", phone: "+52 844 123 4567", docActa: true, docCURP: true, docMedico: true, docINE: true, photo: "LAGUNA.jpg" },
  { id: 2, number: 2, name: "Lucas Sánchez", position: "Lateral Derecho", attendancePct: 90, streak: "6 A", status: "Ausente", checkinTime: "-", starter: true, injured: false, goals: 1, assists: 3, mins: 680, cards: 0, tutorName: "Familia Sánchez", phone: "+52 844 222 3344", docActa: true, docCURP: true, docMedico: true, docINE: false, photo: "LAGUNA.jpg" }
];

const defaultPayments = [
  { id: 101, folio: "LA-PAGO-1001", playerId: 10, playerName: "Emilio Suárez (#10)", tutorName: "Familia Suárez", concept: "Colegiatura Mensual", baseAmount: 1200, discountPct: 0, discountAmount: 0, finalAmount: 1200, method: "Transferencia SPEI", date: "2026-08-01", status: "Pagado", notes: "Colegiatura Agosto" },
  { id: 102, folio: "LA-PAGO-1002", playerId: 15, playerName: "Mateo Suárez (#15)", tutorName: "Familia Suárez", concept: "Colegiatura Mensual", baseAmount: 1200, discountPct: 20, discountAmount: 240, finalAmount: 960, method: "Efectivo", date: "2026-08-01", status: "Pagado", notes: "Descuento 2º Hermano Suárez" }
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
    const savedSquad = localStorage.getItem("laguna_squad_v3");
    const savedEvents = localStorage.getItem("laguna_events_v3");
    const savedJust = localStorage.getItem("laguna_justifications_v3");
    const savedPayments = localStorage.getItem("laguna_payments_v3");

    squadData = savedSquad ? JSON.parse(savedSquad) : [...defaultSquadData];
    calendarEvents = savedEvents ? JSON.parse(savedEvents) : [...defaultCalendarEvents];
    justificationsData = savedJust ? JSON.parse(savedJust) : [...defaultJustifications];
    injuredData = [];
    paymentsData = savedPayments ? JSON.parse(savedPayments) : [...defaultPayments];
  } catch (error) {
    console.error("Error loading data:", error);
    squadData = [...defaultSquadData];
    calendarEvents = [...defaultCalendarEvents];
    justificationsData = [...defaultJustifications];
    injuredData = [];
    paymentsData = [...defaultPayments];
  }
}

function saveData() {
  try {
    localStorage.setItem("laguna_squad_v3", JSON.stringify(squadData));
    localStorage.setItem("laguna_events_v3", JSON.stringify(calendarEvents));
    localStorage.setItem("laguna_justifications_v3", JSON.stringify(justificationsData));
    localStorage.setItem("laguna_payments_v3", JSON.stringify(paymentsData));
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

// --- LOADING SYSTEM FUTURISTA ---
function triggerAppLoading(message = "Cargando sistema...", durationMs = 1800, callback = null) {
  const loadingOverlay = document.getElementById("appLoadingScreen");
  const barFill = document.getElementById("loadingBarFill");
  const percentText = document.getElementById("loadingPercent");
  const statusText = document.getElementById("loadingStatusText");

  if (!loadingOverlay) {
    if (callback) callback();
    return;
  }

  barFill.style.width = "0%";
  percentText.innerText = "0%";
  statusText.innerText = "[SYSTEM] Autenticando credenciales oficiales...";

  loadingOverlay.classList.remove("hidden");
  loadingOverlay.style.opacity = "1";

  const startTime = Date.now();
  const interval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(100, Math.floor((elapsed / durationMs) * 100));

    barFill.style.width = `${progress}%`;
    percentText.innerText = `${progress}%`;

    // Mensajes dinámicos según el progreso
    if (progress < 25) {
      statusText.innerText = "[AUTH] Validando perfil Laguna 2026...";
    } else if (progress < 55) {
      statusText.innerText = "[DATABASE] Cargando plantillas, expedientes y fotos...";
    } else if (progress < 85) {
      statusText.innerText = "[FINANCES] Sincronizando matriz de cobros y paquetes...";
    } else {
      statusText.innerText = "[ACCESO CONCEDIDO] Entorno listo. Bienvenido.";
    }

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        loadingOverlay.style.opacity = "0";
        setTimeout(() => {
          loadingOverlay.classList.add("hidden");
          if (callback) callback();
        }, 300);
      }, 250);
    }
  }, 35);
}

// --- LOGIN MODULE ---
function handleLogin(e) {
  e.preventDefault();
  const role = document.getElementById("loginRole").value;
  if (!role) return;
  
  currentRole = role;
  sessionStorage.setItem("laguna_active_role", role);
  
  document.getElementById("loginScreen").style.opacity = '0';
  document.getElementById("loginScreen").style.transition = 'opacity 0.4s ease';
  
  setTimeout(() => {
    document.getElementById("loginScreen").classList.add("hidden");
    triggerAppLoading("Autenticando usuario y preparando entorno 2026...", 1400, () => {
      document.getElementById("appLayout").style.display = "grid";
      postLoginInit();
      showToast("Sesión iniciada correctamente.", "success");
    });
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
  populatePaymentPlayerSelect();
  renderPaymentsTable();
  renderMonthlyMatrix();
  updatePaymentSummaryStats();
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
function toggleNavGroup(groupId) {
  const group = document.getElementById(groupId);
  if (group) {
    group.classList.toggle("open");
  }
}

function showModuleTab(tabId) {
  document.querySelectorAll(".module-panel").forEach((el) => el.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach((el) => el.classList.remove("active"));

  const targetPanel = document.getElementById(tabId);
  if (targetPanel) targetPanel.classList.add("active");

  const tabBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
  if (tabBtn) {
    tabBtn.classList.add("active");
    // Asegurar que el grupo padre esté abierto
    const parentGroup = tabBtn.closest(".nav-group");
    if (parentGroup && !parentGroup.classList.contains("open")) {
      parentGroup.classList.add("open");
    }
  }

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
// MODULE: REGISTRO DE JUGADORES, FOTOGRAFÍAS Y EXPEDIENTES
// ==========================================================================

let regFilter = 'todos';    // filtro activo de estatus
let regEditingId = null;    // id del jugador en edición (null = nuevo)
let currentSelectedPhoto = 'LAGUNA.jpg'; // photo temp

function ensureRegFields(player) {
  if (!player.regStatus)    player.regStatus    = 'Activo';
  if (!player.birthdate)    player.birthdate    = '';
  if (!player.phone)        player.phone        = '+52 844 000 0000';
  if (!player.tutorName)    player.tutorName    = 'Familia ' + player.name.split(' ').pop();
  if (!player.email)        player.email        = '';
  if (!player.regNotes)     player.regNotes     = '';
  if (!player.photo)        player.photo        = 'LAGUNA.jpg';
  if (player.docActa === undefined) player.docActa = true;
  if (player.docCURP === undefined) player.docCURP = true;
  if (player.docMedico === undefined) player.docMedico = true;
  if (player.docINE === undefined) player.docINE = true;
  return player;
}

/** Handles photo selection and converts to DataURL */
function handlePhotoSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    currentSelectedPhoto = evt.target.result;
    document.getElementById('regPhotoPreview').src = currentSelectedPhoto;
  };
  reader.readAsDataURL(file);
}

/** Renders the registration table with current filter + search */
function renderRegTable() {
  const tbody       = document.getElementById('regTableBody');
  const countEl     = document.getElementById('regSquadCount');
  const searchVal   = (document.getElementById('regSearchInput')?.value || '').toLowerCase();
  if (!tbody) return;
  tbody.innerHTML   = '';

  squadData.forEach(ensureRegFields);

  const filtered = squadData.filter(p => {
    const matchFilter = regFilter === 'todos' || p.regStatus === regFilter;
    const matchSearch = !searchVal ||
      p.name.toLowerCase().includes(searchVal) ||
      String(p.number).includes(searchVal) ||
      (p.tutorName && p.tutorName.toLowerCase().includes(searchVal)) ||
      p.position.toLowerCase().includes(searchVal);
    return matchFilter && matchSearch;
  });

  if (countEl) countEl.textContent = `${squadData.length} Niño${squadData.length !== 1 ? 's' : ''}`;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted" style="padding:2rem;">Sin niños registrados con ese criterio.</td></tr>`;
    return;
  }

  const isDT = currentRole === 'dt';

  filtered.sort((a, b) => a.number - b.number).forEach(p => {
    const statusKey = (p.regStatus || 'Activo').toLowerCase().replace(/ /g, '');
    const badgeClass = `badge badge-status-${statusKey}`;
    
    // Contar documentos cargados (máx 4)
    const docCount = (p.docActa ? 1 : 0) + (p.docCURP ? 1 : 0) + (p.docMedico ? 1 : 0) + (p.docINE ? 1 : 0);
    const docBadge = docCount === 4 ? '<span class="badge badge-neon" style="font-size:0.65rem;">Docs: 4/4 Complete</span>' : `<span class="badge badge-warning" style="font-size:0.65rem;">Docs: ${docCount}/4</span>`;

    const actionsCells = isDT ? `
      <td>
        <button class="reg-action-btn doc" title="Ver Expediente / Descargar" onclick="openDocModal(${p.id})">
          <i class="fa-solid fa-folder-open"></i>
        </button>
        <button class="reg-action-btn edit" title="Editar" onclick="openEditPlayer(${p.id})">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="reg-action-btn delete" title="Eliminar" onclick="confirmDeletePlayer(${p.id})">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>` : `<td>
        <button class="reg-action-btn doc" title="Ver Expediente / Descargar" onclick="openDocModal(${p.id})">
          <i class="fa-solid fa-folder-open"></i> Ver Expediente
        </button>
      </td>`;

    tbody.innerHTML += `
      <tr>
        <td class="mono-text text-primary" style="font-weight:700;">#${p.number}</td>
        <td>
          <div style="display:flex; align-items:center; gap:0.8rem;">
            <img src="${p.photo || 'LAGUNA.jpg'}" alt="${p.name}" style="width:36px; height:36px; border-radius:50%; object-fit:cover; border:1px solid var(--accent-primary);" />
            <div>
              <strong>${p.name}</strong>
              <br><small class="text-muted">Tutor: ${p.tutorName || 'N/A'}</small>
            </div>
          </div>
        </td>
        <td class="text-muted" style="font-size:0.85rem;">${p.position}</td>
        <td>
          <span class="${badgeClass}">${p.regStatus}</span>
          <br>${docBadge}
        </td>
        ${actionsCells}
      </tr>`;
  });

  applyRolePermissions();
}

function setRegFilter(filter, btn) {
  regFilter = filter;
  document.querySelectorAll('.reg-filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderRegTable();
}

function filterRegTable() { renderRegTable(); }

function handlePlayerRegSubmit(e) {
  e.preventDefault();

  const name      = document.getElementById('regName').value.trim();
  const number    = parseInt(document.getElementById('regNumber').value);
  const tutorName = document.getElementById('regTutorName').value.trim();
  const phone     = document.getElementById('regPhone').value.trim();
  const position  = document.getElementById('regPosition').value;
  const birthdate = document.getElementById('regBirthdate').value;
  const email     = document.getElementById('regEmail').value.trim();
  const regStatus = document.getElementById('regStatus').value;
  const starter   = document.getElementById('regStarter').value === 'true';
  const regNotes  = document.getElementById('regNotes').value.trim();

  // Documentos
  const docActa   = document.getElementById('docActa').checked;
  const docCURP   = document.getElementById('docCURP').checked;
  const docMedico = document.getElementById('docMedico').checked;
  const docINE    = document.getElementById('docINE').checked;

  const dorsalTaken = squadData.find(p => p.number === number && p.id !== regEditingId);
  if (dorsalTaken) {
    showToast(`El dorsal #${number} ya pertenece a ${dorsalTaken.name}.`, 'error');
    return;
  }

  if (regEditingId !== null) {
    const p = squadData.find(x => x.id === regEditingId);
    if (p) {
      p.name      = name;
      p.number    = number;
      p.tutorName = tutorName;
      p.phone     = phone;
      p.position  = position;
      p.birthdate = birthdate;
      p.email     = email;
      p.regStatus = regStatus;
      p.starter   = starter;
      p.regNotes  = regNotes;
      p.photo     = currentSelectedPhoto;
      p.docActa   = docActa;
      p.docCURP   = docCURP;
      p.docMedico = docMedico;
      p.docINE    = docINE;
      saveData();
      showToast(`Información y documentos de ${name} actualizados.`, 'success');
    }
  } else {
    const newId = Date.now();
    squadData.push({
      id: newId, number, name, position,
      tutorName, phone, birthdate, email, regStatus, starter, regNotes,
      photo: currentSelectedPhoto,
      docActa, docCURP, docMedico, docINE,
      attendancePct: 100, streak: '1 A',
      status: 'Ausente', checkinTime: '-', injured: false,
      goals: 0, assists: 0, mins: 0, cards: 0
    });
    saveData();
    showToast(`Niño ${name} registrado correctamente con su expediente.`, 'success');
  }

  resetRegForm();
  renderRegTable();
  renderSquadCallupList();
  populateQuickPlayerSelect();
  populatePaymentPlayerSelect();
  updatePaymentSummaryStats();
}

function openEditPlayer(id) {
  const p = squadData.find(x => x.id === id);
  if (!p) return;
  ensureRegFields(p);

  regEditingId = id;
  currentSelectedPhoto = p.photo || 'LAGUNA.jpg';

  document.getElementById('regEditId').value      = id;
  document.getElementById('regName').value        = p.name;
  document.getElementById('regNumber').value      = p.number;
  document.getElementById('regTutorName').value   = p.tutorName || '';
  document.getElementById('regPhone').value       = p.phone || '';
  document.getElementById('regPosition').value    = p.position;
  document.getElementById('regBirthdate').value   = p.birthdate || '';
  document.getElementById('regEmail').value       = p.email || '';
  document.getElementById('regStatus').value      = p.regStatus || 'Activo';
  document.getElementById('regStarter').value     = p.starter ? 'true' : 'false';
  document.getElementById('regNotes').value       = p.regNotes || '';
  document.getElementById('regPhotoPreview').src  = currentSelectedPhoto;

  document.getElementById('docActa').checked   = !!p.docActa;
  document.getElementById('docCURP').checked   = !!p.docCURP;
  document.getElementById('docMedico').checked = !!p.docMedico;
  document.getElementById('docINE').checked    = !!p.docINE;

  document.getElementById('regFormTitle').innerHTML = `<i class="fa-solid fa-pen text-primary"></i> Editando: ${p.name}`;
  document.getElementById('regSubmitBtn').innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> GUARDAR CAMBIOS`;
  document.getElementById('regCancelBtn').style.display = '';

  document.getElementById('playerRegForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cancelPlayerEdit() { resetRegForm(); }

function resetRegForm() {
  regEditingId = null;
  currentSelectedPhoto = 'LAGUNA.jpg';
  document.getElementById('playerRegForm').reset();
  document.getElementById('regPhotoPreview').src = 'LAGUNA.jpg';
  document.getElementById('regEditId').value = '';
  document.getElementById('regFormTitle').innerHTML = `<i class="fa-solid fa-user-plus text-primary"></i> Nuevo Jugador`;
  document.getElementById('regSubmitBtn').innerHTML = `<i class="fa-solid fa-user-plus"></i> REGISTRAR JUGADOR`;
  document.getElementById('regCancelBtn').style.display = 'none';
}

function confirmDeletePlayer(id) {
  const p = squadData.find(x => x.id === id);
  if (!p) return;

  if (!confirm(`¿Eliminar permanentemente a ${p.name} (#${p.number}) del equipo?`)) return;

  squadData = squadData.filter(x => x.id !== id);
  injuredData = injuredData.filter(x => x.playerId !== id);
  saveData();
  showToast(`${p.name} eliminado de la plantilla.`, 'warning');
  renderRegTable();
  renderSquadCallupList();
  populateQuickPlayerSelect();
  populatePaymentPlayerSelect();
  updatePaymentSummaryStats();
}

// --- MODAL EXPEDIENTE DOCUMENTAL DEL NIÑO ---
let currentDocPlayerId = null;

function openDocModal(playerId) {
  const p = squadData.find(x => x.id === playerId);
  if (!p) return;
  ensureRegFields(p);

  currentDocPlayerId = playerId;

  document.getElementById('docModalPhoto').src = p.photo || 'LAGUNA.jpg';
  document.getElementById('docModalName').innerText = p.name;
  document.getElementById('docModalSub').innerText = `Dorsal #${p.number} · ${p.position} · ${p.regStatus}`;
  document.getElementById('docModalTutor').innerHTML = `<i class="fa-solid fa-user-group"></i> Tutor: ${p.tutorName || 'N/A'}`;
  document.getElementById('docModalPhone').innerHTML = `<i class="fa-solid fa-phone"></i> Tel: ${p.phone || 'N/A'}`;

  const container = document.getElementById('docModalItems');
  container.innerHTML = '';

  const docs = [
    { title: 'Acta de Nacimiento', key: 'docActa' },
    { title: 'CURP Oficial', key: 'docCURP' },
    { title: 'Certificado Médico', key: 'docMedico' },
    { title: 'Identificación del Tutor', key: 'docINE' }
  ];

  docs.forEach(d => {
    const isReady = p[d.key];
    const badge = isReady
      ? '<span class="badge badge-success"><i class="fa-solid fa-check"></i> ENTREGADO Y VERIFICADO</span>'
      : '<span class="badge badge-warning"><i class="fa-solid fa-clock"></i> PENDIENTE</span>';

    container.innerHTML += `
      <div class="doc-status-card">
        <div>
          <strong>${d.title}</strong>
          <br><small class="text-muted">Documento Oficial Expediente</small>
        </div>
        <div>${badge}</div>
      </div>
    `;
  });

  document.getElementById('playerDocModal').classList.remove('hidden');
}

function closeDocModal() {
  document.getElementById('playerDocModal').classList.add('hidden');
}

function printOrDownloadDoc() {
  showToast('Generando Ficha Oficial en PDF para impresión...', 'info');
  window.print();
}

// ==========================================================================
// MODULE: SISTEMA DE PAGOS Y HERMANOS
// ==========================================================================

function populatePaymentPlayerSelect() {
  const select = document.getElementById('payPlayerSelect');
  const familySelect = document.getElementById('payFamilySelect');
  if (!select) return;

  select.innerHTML = '<option value="" disabled selected>Selecciona un alumno...</option>';
  if (familySelect) familySelect.innerHTML = '<option value="" disabled selected>Selecciona una familia...</option>';

  const familiesMap = {};

  squadData.forEach(p => {
    ensureRegFields(p);
    const siblings = detectSiblings(p.id);
    const sibLabel = siblings.length > 0 ? ` (Hermano: ${siblings.map(s => '#' + s.number + ' ' + s.name).join(', ')})` : '';
    select.innerHTML += `<option value="${p.id}">#${p.number} ${p.name} - Tutor: ${p.tutorName}${sibLabel}</option>`;

    // Agrupar por tutor/familia
    const tName = p.tutorName || 'Sin Tutor';
    if (!familiesMap[tName]) familiesMap[tName] = [];
    familiesMap[tName].push(p);
  });

  if (familySelect) {
    Object.keys(familiesMap).forEach(famName => {
      const children = familiesMap[famName];
      const tag = children.length > 1 ? ` (${children.length} Hermanos - PLAN FAMILIA)` : ` (1 Hijo)`;
      familySelect.innerHTML += `<option value="${famName}">${famName}${tag}</option>`;
    });
  }

  document.getElementById('payDate').value = new Date().toISOString().split('T')[0];
}

function togglePaymentScope(mode) {
  const btnInd = document.getElementById('btnModeIndividual');
  const btnFam = document.getElementById('btnModeFamily');
  const groupInd = document.getElementById('groupPlayerSelect');
  const groupFam = document.getElementById('groupFamilySelect');
  const scopeInput = document.getElementById('payScopeMode');
  const bundleCard = document.getElementById('familyBundleCard');
  const siblingAlert = document.getElementById('siblingAlertBox');

  scopeInput.value = mode;

  if (mode === 'family') {
    btnFam.classList.add('active');
    btnInd.classList.remove('active');
    groupFam.classList.remove('hidden');
    groupInd.classList.add('hidden');
    siblingAlert.classList.add('hidden');
    populatePaymentFamilySelect();
  } else {
    btnInd.classList.add('active');
    btnFam.classList.remove('active');
    groupInd.classList.remove('hidden');
    groupFam.classList.add('hidden');
    bundleCard.classList.add('hidden');
  }
}

function onPaymentFamilyChange() {
  const familyName = document.getElementById('payFamilySelect').value;
  const children = squadData.filter(p => p.tutorName && p.tutorName.trim().toLowerCase() === familyName.trim().toLowerCase());

  const bundleCard = document.getElementById('familyBundleCard');
  const cardTitle = document.getElementById('famCardTitle');
  const cardBadge = document.getElementById('famCardBadge');
  const childrenList = document.getElementById('famChildrenList');
  const grandTotalEl = document.getElementById('famGrandTotalDisplay');

  if (children.length === 0) return;

  cardTitle.innerHTML = `<i class="fa-solid fa-people-roof text-warning"></i> PAQUETE: ${familyName.toUpperCase()}`;
  cardBadge.innerText = `${children.length} HERMANO${children.length > 1 ? 'S' : ''}`;
  childrenList.innerHTML = '';

  const conceptSelect = document.getElementById('payConcept');
  const basePrice = parseFloat(conceptSelect.options[conceptSelect.selectedIndex].getAttribute('data-amount')) || 1200;

  let grandTotal = 0;
  let totalDiscounts = 0;

  children.forEach((child, index) => {
    let childPrice = basePrice;
    let discTag = '';

    if (index > 0) {
      // 2º Hermano en adelante tiene 20% de descuento
      const disc = basePrice * 0.20;
      childPrice = basePrice - disc;
      totalDiscounts += disc;
      discTag = `<span class="badge badge-warning"><i class="fa-solid fa-tag"></i> 2º Hermano (-20%)</span>`;
    } else {
      discTag = `<span class="badge badge-neon"><i class="fa-solid fa-user-check"></i> 1er Hijo (Normal)</span>`;
    }

    grandTotal += childPrice;

    childrenList.innerHTML += `
      <div class="fam-child-row">
        <div class="fam-child-info">
          <img src="${child.photo || 'LAGUNA.jpg'}" alt="${child.name}" style="width:36px; height:36px; border-radius:50%; object-fit:cover; border:1px solid var(--accent-primary);" />
          <div>
            <strong>#${child.number} ${child.name}</strong>
            <br><small class="text-muted">${child.position}</small>
          </div>
        </div>
        <div class="fam-child-price-col">
          ${discTag}
          <div class="mono-text font-bold text-success mt-1">$${childPrice.toLocaleString('es-MX', {minimumFractionDigits:2})} MXN</div>
        </div>
      </div>
    `;
  });

  grandTotalEl.innerText = `$${grandTotal.toLocaleString('es-MX', {minimumFractionDigits:2})} MXN`;
  document.getElementById('payBaseAmount').value = (basePrice * children.length);
  document.getElementById('payDiscountPct').value = ((totalDiscounts / (basePrice * children.length)) * 100).toFixed(0);
  document.getElementById('payFinalAmount').value = grandTotal.toFixed(2);

  bundleCard.classList.remove('hidden');
}

/** Detecta si un niño tiene hermanos registrados compartiendo el mismo tutorName */
function detectSiblings(playerId) {
  const player = squadData.find(p => p.id === playerId);
  if (!player || !player.tutorName) return [];

  const tutorClean = player.tutorName.trim().toLowerCase();
  if (!tutorClean) return [];

  return squadData.filter(p => p.id !== playerId && p.tutorName && p.tutorName.trim().toLowerCase() === tutorClean);
}

function onPaymentPlayerChange() {
  const select = document.getElementById('payPlayerSelect');
  const playerId = parseInt(select.value);
  const siblings = detectSiblings(playerId);

  const alertBox = document.getElementById('siblingAlertBox');
  const alertTitle = document.getElementById('siblingAlertTitle');
  const alertDesc = document.getElementById('siblingAlertDesc');
  const discountInput = document.getElementById('payDiscountPct');

  if (siblings.length > 0) {
    const sibNames = siblings.map(s => s.name).join(', ');
    alertTitle.innerHTML = `<i class="fa-solid fa-people-roof"></i> ¡Hermanos en el club! (${siblings.length + 1} inscritos)`;
    alertDesc.innerText = `Hermano(s): ${sibNames}. Se aplicará automáticamente 20% de descuento.`;
    alertBox.classList.remove('hidden');

    discountInput.value = 20; // 20% descuento por hermano
  } else {
    alertBox.classList.add('hidden');
    discountInput.value = 0;
  }

  recalculatePaymentTotals();
}

function onPaymentConceptChange() {
  const select = document.getElementById('payConcept');
  const selectedOption = select.options[select.selectedIndex];
  const defaultAmount = parseFloat(selectedOption.getAttribute('data-amount')) || 0;
  document.getElementById('payBaseAmount').value = defaultAmount;
  recalculatePaymentTotals();
}

function recalculatePaymentTotals() {
  const base = parseFloat(document.getElementById('payBaseAmount').value) || 0;
  const pct = parseFloat(document.getElementById('payDiscountPct').value) || 0;

  const discountVal = (base * (pct / 100));
  const finalVal = Math.max(0, base - discountVal);

  document.getElementById('payFinalAmount').value = finalVal.toFixed(2);
}

function setPaymentType(type) {
  const cardTransfer = document.getElementById('payCardTransfer');
  const cardManual = document.getElementById('payCardManual');
  const inputMethod = document.getElementById('payMethodSelected');
  const labelNotes = document.getElementById('payNotesLabel');
  const inputNotes = document.getElementById('payNotes');

  if (type === 'Transferencia SPEI') {
    cardTransfer.classList.add('active');
    cardManual.classList.remove('active');
    inputMethod.value = 'Transferencia SPEI';
    labelNotes.innerText = 'Folio / Clave de Rastrèo SPEI *';
    inputNotes.placeholder = 'Ej. SPEI 94827110293';
  } else {
    cardManual.classList.add('active');
    cardTransfer.classList.remove('active');
    inputMethod.value = 'Manual Efectivo';
    labelNotes.innerText = 'Cajero / Entregado En Caja *';
    inputNotes.placeholder = 'Ej. Recibido por Admin / Caja Central';
  }
}

function renderMonthlyMatrix() {
  const tbody = document.getElementById('monthlyMatrixBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  squadData.forEach(p => {
    ensureRegFields(p);

    // Buscar mensualidad pagada para Agosto 2026
    const hasAugustPaid = paymentsData.some(pay => pay.playerId === p.id && pay.concept.includes('Colegiatura') && (pay.notes.includes('Agosto') || pay.month === 'Agosto 2026') && pay.status === 'Pagado');
    const statusBadge = hasAugustPaid
      ? '<span class="badge badge-success"><i class="fa-solid fa-check-circle"></i> AGOSTO PAGADO</span>'
      : '<span class="badge badge-warning"><i class="fa-solid fa-clock"></i> AGOSTO PENDIENTE</span>';

    const siblings = detectSiblings(p.id);
    const sibTag = siblings.length > 0 ? `<br><small class="text-warning"><i class="fa-solid fa-users"></i> Descuento Hermano Active (-20%)</small>` : '';

    tbody.innerHTML += `
      <tr>
        <td>
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <img src="${p.photo || 'LAGUNA.jpg'}" style="width:30px; height:30px; border-radius:50%; object-fit:cover;" />
            <div>
              <strong>#${p.number} ${p.name}</strong>
              <br><small class="text-muted">${p.tutorName}</small>
              ${sibTag}
            </div>
          </div>
        </td>
        <td style="white-space:nowrap;">${statusBadge}</td>
        <td style="white-space:nowrap;">
          <button class="btn btn-ghost" style="padding:0.3rem 0.6rem; font-size:0.75rem;" onclick="quickChargeMonth(${p.id}, 'Agosto 2026')">
            <i class="fa-solid fa-cash-register text-success"></i> Cobrar Mes
          </button>
        </td>
      </tr>
    `;
  });
}

function quickChargeMonth(playerId, monthName) {
  const select = document.getElementById('payPlayerSelect');
  select.value = playerId;
  onPaymentPlayerChange();

  document.getElementById('payConcept').value = 'Colegiatura Mensual';
  onPaymentConceptChange();

  const monthSelect = document.getElementById('payMonthSelect');
  if (monthSelect) monthSelect.value = monthName;

  document.getElementById('paymentForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
  showToast(`Registrando cobro de ${monthName}...`, 'info');
}

function handlePaymentSubmit(e) {
  e.preventDefault();

  const scopeMode = document.getElementById('payScopeMode').value;
  const conceptSelect = document.getElementById('payConcept').value;
  const monthSelect = document.getElementById('payMonthSelect')?.value || '';
  const concept = conceptSelect === 'Colegiatura Mensual' ? `Colegiatura Mensual (${monthSelect})` : conceptSelect;
  const method = document.getElementById('payMethodSelected').value;
  const date = document.getElementById('payDate').value;
  const status = document.getElementById('payStatus').value;
  const notes = document.getElementById('payNotes').value.trim();

  const baseAmount = parseFloat(document.getElementById('payBaseAmount').value) || 0;
  const discountPct = parseFloat(document.getElementById('payDiscountPct').value) || 0;
  const discountAmount = baseAmount * (discountPct / 100);
  const finalAmount = parseFloat(document.getElementById('payFinalAmount').value) || 0;

  const newId = Date.now();
  const folio = `LA-PAGO-${Math.floor(1000 + Math.random() * 9000)}`;

  if (scopeMode === 'family') {
    const familyName = document.getElementById('payFamilySelect').value;
    const children = squadData.filter(p => p.tutorName && p.tutorName.trim().toLowerCase() === familyName.trim().toLowerCase());

    if (children.length === 0) return showToast('Selecciona una familia válida.', 'error');

    const namesStr = children.map(c => `#${c.number} ${c.name}`).join(', ');

    const newPayment = {
      id: newId,
      folio,
      playerId: children[0].id,
      playerName: `PLAN FAMILIA (${children.length} Hermanos: ${namesStr})`,
      tutorName: familyName,
      concept: `PAQUETE FAMILIAR - ${concept}`,
      month: monthSelect,
      baseAmount,
      discountPct,
      discountAmount,
      finalAmount,
      method,
      date,
      status,
      isFamilyBundle: true,
      childrenNames: namesStr,
      notes: notes || (method === 'Transferencia SPEI' ? 'Pago Único SPEI Familia' : 'Pago Efectivo Caja Familia')
    };

    paymentsData.unshift(newPayment);
    saveData();

    showToast(`Cobro Unificado ${folio} por $${finalAmount.toFixed(2)} registrado para ${familyName}.`, 'success');
  } else {
    const playerId = parseInt(document.getElementById('payPlayerSelect').value);
    const player = squadData.find(p => p.id === playerId);
    if (!player) return showToast('Selecciona un niño válido.', 'error');

    const newPayment = {
      id: newId,
      folio,
      playerId: player.id,
      playerName: `${player.name} (#${player.number})`,
      tutorName: player.tutorName,
      concept,
      month: monthSelect,
      baseAmount,
      discountPct,
      discountAmount,
      finalAmount,
      method,
      date,
      status,
      isFamilyBundle: false,
      notes: notes || (method === 'Transferencia SPEI' ? 'Comprobante SPEI' : 'Pago Efectivo Caja')
    };

    paymentsData.unshift(newPayment);
    saveData();

    showToast(`Pago ${folio} por ${method} registrado con éxito.`, 'success');
  }

  renderPaymentsTable();
  renderMonthlyMatrix();
  updatePaymentSummaryStats();

  openReceiptModal(newId);
}

function renderPaymentsTable() {
  const tbody = document.getElementById('paymentsTableBody');
  const searchVal = (document.getElementById('paySearchInput')?.value || '').toLowerCase();
  if (!tbody) return;
  tbody.innerHTML = '';

  const filtered = paymentsData.filter(p => {
    return !searchVal ||
      p.folio.toLowerCase().includes(searchVal) ||
      p.playerName.toLowerCase().includes(searchVal) ||
      p.tutorName.toLowerCase().includes(searchVal) ||
      p.concept.toLowerCase().includes(searchVal) ||
      (p.method && p.method.toLowerCase().includes(searchVal));
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding:2rem;">Sin registros de pagos en el historial.</td>8/tr>`;
    return;
  }

  filtered.forEach(p => {
    const badgeStatus = p.status === 'Pagado' ? 'badge-success' : 'badge-warning';
    const hasDiscount = p.discountPct > 0;
    const discountBadge = hasDiscount ? `<span class="badge badge-warning" style="font-size:0.65rem;"><i class="fa-solid fa-tag"></i> -${p.discountPct}% Hermano</span>` : '';
    const methodBadge = p.method === 'Transferencia SPEI' ? '<span class="badge badge-neon" style="font-size:0.65rem;"><i class="fa-solid fa-building-columns"></i> SPEI</span>' : '<span class="badge" style="font-size:0.65rem; border-color:var(--border-strong);"><i class="fa-solid fa-money-bill"></i> Efectivo</span>';

    tbody.innerHTML += `
      <tr>
        <td class="mono-text" style="white-space:nowrap;">
          <strong>${p.folio}</strong>
          <br><small class="text-muted">${p.date}</small>
        </td>
        <td>
          <strong>${p.playerName}</strong>
          <br><small class="text-muted">Tutor: ${p.tutorName}</small>
        </td>
        <td>${p.concept}</td>
        <td style="white-space:nowrap;">${methodBadge}</td>
        <td class="mono-text text-success font-bold" style="white-space:nowrap;">
          $${p.finalAmount.toFixed(2)}
          <br>${discountBadge}
        </td>
        <td style="white-space:nowrap;"><span class="badge ${badgeStatus}">${p.status}</span></td>
        <td style="white-space:nowrap;">
          <button class="btn btn-ghost" style="padding:0.4rem 0.6rem; font-size:0.8rem;" onclick="openReceiptModal(${p.id})">
            <i class="fa-solid fa-receipt text-primary"></i> Recibo
          </button>
        </td>
      </tr>
    `;
  });
}

function updatePaymentSummaryStats() {
  let paidTotal = 0;
  let pendingTotal = 0;
  let totalDiscounts = 0;
  const siblingFamiliesSet = new Set();

  paymentsData.forEach(p => {
    if (p.status === 'Pagado') {
      paidTotal += p.finalAmount;
    } else {
      pendingTotal += p.finalAmount;
    }
    totalDiscounts += (p.discountAmount || 0);

    if (p.discountPct > 0) {
      siblingFamiliesSet.add(p.tutorName);
    }
  });

  const totalCollectedEl = document.getElementById('payTotalCollected');
  const paidEl = document.getElementById('statTotalPaid');
  const pendingEl = document.getElementById('statTotalPending');
  const sibEl = document.getElementById('statSiblingsCount');
  const discEl = document.getElementById('statTotalDiscounts');

  if (totalCollectedEl) totalCollectedEl.innerText = `$${paidTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
  if (paidEl) paidEl.innerText = `$${paidTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
  if (pendingEl) pendingEl.innerText = `$${pendingTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
  if (sibEl) sibEl.innerText = `${siblingFamiliesSet.size} Familias`;
  if (discEl) discEl.innerText = `$${totalDiscounts.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
}

// --- MODAL RECIBO DE PAGO ---
let currentReceiptPaymentId = null;

function openReceiptModal(paymentId) {
  const p = paymentsData.find(x => x.id === paymentId);
  if (!p) return;

  currentReceiptPaymentId = paymentId;

  document.getElementById('receiptFolio').innerText = `FOLIO: #${p.folio}`;
  document.getElementById('receiptDate').innerText = p.date;
  document.getElementById('receiptStudent').innerText = p.playerName;
  document.getElementById('receiptTutor').innerText = p.tutorName;
  document.getElementById('receiptConcept').innerText = p.concept;
  document.getElementById('receiptMethod').innerText = p.method;

  document.getElementById('receiptBase').innerText = `$${p.baseAmount.toFixed(2)}`;

  const discountRow = document.getElementById('receiptDiscountRow');
  if (p.discountPct > 0) {
    discountRow.style.display = 'flex';
    document.getElementById('receiptDiscount').innerText = `-$${p.discountAmount.toFixed(2)} (${p.discountPct}% Hermanos)`;
  } else {
    discountRow.style.display = 'none';
  }

  document.getElementById('receiptTotal').innerText = `$${p.finalAmount.toFixed(2)} MXN`;

  document.getElementById('paymentReceiptModal').classList.remove('hidden');
}

function closeReceiptModal() {
  document.getElementById('paymentReceiptModal').classList.add('hidden');
}

function printReceipt() {
  window.print();
}
// --- TACTICAL PITCH FULLSCREEN LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
  const btnFullscreen = document.getElementById('btnFullscreenPitch');
  const tacticalBoardCard = document.getElementById('tacticalBoardCard');
  const tacticalPitch = document.getElementById('tacticalPitch');

  if (btnFullscreen && tacticalBoardCard && tacticalPitch) {
    btnFullscreen.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        if (tacticalBoardCard.requestFullscreen) {
          tacticalBoardCard.requestFullscreen();
        } else if (tacticalBoardCard.webkitRequestFullscreen) { /* Safari */
          tacticalBoardCard.webkitRequestFullscreen();
        } else if (tacticalBoardCard.msRequestFullscreen) { /* IE11 */
          tacticalBoardCard.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE11 */
          document.msExitFullscreen();
        }
      }
    });

    document.addEventListener('fullscreenchange', () => {
      const icon = btnFullscreen.querySelector('i');
      if (document.fullscreenElement) {
        icon.classList.remove('fa-expand');
        icon.classList.add('fa-compress');
        btnFullscreen.title = "Salir de pantalla completa";
        
        tacticalBoardCard.style.backgroundColor = 'var(--bg-dark)';
        tacticalBoardCard.style.overflow = 'auto';
        tacticalBoardCard.style.display = 'flex';
        tacticalBoardCard.style.flexDirection = 'column';
        
        tacticalPitch.style.flex = '1';
        tacticalPitch.style.height = 'auto'; 
        tacticalPitch.style.minHeight = '600px'; 
      } else {
        icon.classList.remove('fa-compress');
        icon.classList.add('fa-expand');
        btnFullscreen.title = "Ver en pantalla completa";
        
        tacticalBoardCard.style.backgroundColor = '';
        tacticalBoardCard.style.overflow = '';
        tacticalBoardCard.style.display = '';
        tacticalBoardCard.style.flexDirection = '';
        
        tacticalPitch.style.flex = '';
        tacticalPitch.style.height = '500px'; 
        tacticalPitch.style.minHeight = '';
      }
    });
  }
});

