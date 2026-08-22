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
  {
    id: 10,
    number: 10,
    name: "Emilio Suárez",
    position: "Medio Ofensivo",
    attendancePct: 95,
    streak: "10 A",
    status: "Ausente",
    checkinTime: "-",
    starter: true,
    injured: false,
    goals: 6,
    assists: 4,
    mins: 900,
    cards: 1,
    tutorName: "Familia Suárez",
    phone: "+52 844 123 4567",
    docActa: true,
    docCURP: true,
    docMedico: true,
    docINE: true,
    photo: "LAGUNA.jpg",
    gameInfo: [
      {
        id: 101,
        title: "Resumen del partido vs. Real San Luis",
        date: "2026-08-09",
        type: "partido",
        downloadUrl: "https://example.com/laguna/emilio-resumen.pdf",
        notes:
          "Buena recuperación defensiva y dos acciones de peligro en el segundo tiempo.",
      },
    ],
  },
  {
    id: 15,
    number: 15,
    name: "Mateo Suárez",
    position: "Delantero Centro",
    attendancePct: 92,
    streak: "8 A",
    status: "Ausente",
    checkinTime: "-",
    starter: true,
    injured: false,
    goals: 4,
    assists: 2,
    mins: 750,
    cards: 0,
    tutorName: "Familia Suárez",
    phone: "+52 844 123 4567",
    docActa: true,
    docCURP: true,
    docMedico: true,
    docINE: true,
    photo: "LAGUNA.jpg",
    gameInfo: [
      {
        id: 102,
        title: "Análisis de rendimiento vs. Real San Luis",
        date: "2026-08-09",
        type: "partido",
        downloadUrl: "https://example.com/laguna/mateo-analisis.pdf",
        notes:
          "Se mantuvo activo en presión alta y generó dos oportunidades claras.",
      },
    ],
  },
  {
    id: 2,
    number: 2,
    name: "Lucas Sánchez",
    position: "Lateral Derecho",
    attendancePct: 90,
    streak: "6 A",
    status: "Ausente",
    checkinTime: "-",
    starter: true,
    injured: false,
    goals: 1,
    assists: 3,
    mins: 680,
    cards: 0,
    tutorName: "Familia Sánchez",
    phone: "+52 844 222 3344",
    docActa: true,
    docCURP: true,
    docMedico: true,
    docINE: false,
    photo: "LAGUNA.jpg",
    gameInfo: [],
  },
];

const defaultPayments = [
  {
    id: 101,
    folio: "LA-PAGO-1001",
    playerId: 10,
    playerName: "Emilio Suárez (#10)",
    tutorName: "Familia Suárez",
    concept: "Colegiatura Mensual",
    baseAmount: 1200,
    discountPct: 0,
    discountAmount: 0,
    finalAmount: 1200,
    method: "Transferencia SPEI",
    date: "2026-08-01",
    status: "Pagado",
    notes: "Colegiatura Agosto",
  },
  {
    id: 102,
    folio: "LA-PAGO-1002",
    playerId: 15,
    playerName: "Mateo Suárez (#15)",
    tutorName: "Familia Suárez",
    concept: "Colegiatura Mensual",
    baseAmount: 1200,
    discountPct: 20,
    discountAmount: 240,
    finalAmount: 960,
    method: "Efectivo",
    date: "2026-08-01",
    status: "Pagado",
    notes: "Descuento 2º Hermano Suárez",
  },
];

const defaultCalendarEvents = [
  {
    id: 1,
    type: "entrenamiento",
    title: "Entrenamiento Táctico",
    date: "2026-08-07",
    time: "08:00",
    location: "Cancha 1",
    result: null,
  },
  {
    id: 2,
    type: "partido",
    title: "Partido vs Real San Luis",
    date: "2026-08-09",
    time: "16:00",
    location: "Estadio Central",
    result: null,
  },
];

const defaultJustifications = [
  {
    id: 1,
    player: "Emilio Suárez (#10)",
    date: "2026-08-06",
    reason: "Examen Académico",
    detail: "Examen final universitario.",
    status: "Aprobada",
  },
];

// --- TOASTS ---
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  let icon = "fa-circle-info";
  if (type === "success") icon = "fa-circle-check";
  if (type === "warning") icon = "fa-triangle-exclamation";
  if (type === "error") icon = "fa-circle-xmark";

  toast.innerHTML = `<i class="fa-solid ${icon} toast-icon"></i><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
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
    calendarEvents = savedEvents
      ? JSON.parse(savedEvents)
      : [...defaultCalendarEvents];
    justificationsData = savedJust
      ? JSON.parse(savedJust)
      : [...defaultJustifications];
    injuredData = [];
    paymentsData = savedPayments
      ? JSON.parse(savedPayments)
      : [...defaultPayments];
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
    localStorage.setItem(
      "laguna_justifications_v3",
      JSON.stringify(justificationsData),
    );
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

// --- LOADING SYSTEM PROFESIONAL ---
function triggerAppLoading(
  message = "Cargando plataforma...",
  durationMs = 1100,
  callback = null,
) {
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
  statusText.innerText = "Iniciando sesión segura...";

  loadingOverlay.classList.remove("hidden");
  loadingOverlay.style.opacity = "1";

  const startTime = Date.now();
  const interval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(100, Math.floor((elapsed / durationMs) * 100));

    barFill.style.width = `${progress}%`;
    percentText.innerText = `${progress}%`;

    // Mensajes profesionales según el progreso
    if (progress < 30) {
      statusText.innerText = "Verificando credenciales oficiales...";
    } else if (progress < 65) {
      statusText.innerText = "Cargando expedientes del plantel y calendario...";
    } else if (progress < 90) {
      statusText.innerText = "Sincronizando registros y estadísticas...";
    } else {
      statusText.innerText = "Panel listo. Bienvenido al sistema.";
    }

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        loadingOverlay.style.opacity = "0";
        setTimeout(() => {
          loadingOverlay.classList.add("hidden");
          if (callback) callback();
        }, 250);
      }, 200);
    }
  }, 30);
}

// --- LOGIN MODULE ---
function handleLogin(e) {
  e.preventDefault();
  const role = document.getElementById("loginRole").value;
  if (!role) return;

  currentRole = role;
  sessionStorage.setItem("laguna_active_role", role);

  document.getElementById("loginScreen").style.opacity = "0";
  document.getElementById("loginScreen").style.transition = "opacity 0.4s ease";

  setTimeout(() => {
    document.getElementById("loginScreen").classList.add("hidden");
    triggerAppLoading(
      "Autenticando usuario y preparando entorno 2026...",
      1400,
      () => {
        document.getElementById("appLayout").style.display = "grid";
        postLoginInit();
        showToast("Sesión iniciada correctamente.", "success");
      },
    );
  }, 400);
}

function logout() {
  sessionStorage.removeItem("laguna_active_role");
  location.reload();
}

function postLoginInit() {
  applyRolePermissions();
  populateQuickPlayerSelect();
  populateGameInfoPlayerSelect();
  renderAttendanceTable();
  renderSquadCallupList();
  renderCalendarEvents();
  renderJustifications();
  renderRankingTable();
  renderPlayerGameInfo();
  renderInjuredTable();
  renderRegTable();
  populatePaymentPlayerSelect();
  populateSiblingSelect(null);
  renderPaymentsTable();
  renderMonthlyMatrix();
  updatePaymentSummaryStats();
  initChart();
  updateNoticeTemplate();
  initDragAndDrop();

  // Activar recordatorios automáticos
  checkAutomatedPaymentReminders();

  populateDynamicGroups(); // Llenar grupos dinámicos

  // Determine display name and greet
  let displayName = "";
  let displayRole = "";
  if (currentRole === "jugador") {
    loggedInUser = squadData[0];
    displayName = loggedInUser.name;
    displayRole = `Jugador · #${loggedInUser.number} · ${loggedInUser.position}`;
    document.getElementById("activeUserName").innerText =
      `${loggedInUser.name} (#${loggedInUser.number})`;
  } else if (currentRole === "dt") {
    displayName = "Coach Zúñiga";
    displayRole = "Director Técnico · Admin";
    document.getElementById("activeUserName").innerText =
      "Coach Zúñiga (Admin)";
  } else {
    displayName = "Directiva";
    displayRole = "Acceso de Solo Lectura";
    document.getElementById("activeUserName").innerText = "Directiva Club";
  }

  // Time-based greeting
  const hour = new Date().getHours();
  let greeting = "Buenos días";
  if (hour >= 12 && hour < 19) greeting = "Buenas tardes";
  else if (hour >= 19) greeting = "Buenas noches";

  const greetingEl = document.getElementById("greetingHeader");
  const subEl = document.querySelector(".greeting-sub");
  if (greetingEl) {
    greetingEl.innerHTML = `${greeting}, <span style="color:var(--accent-primary)">${displayName}</span>.`;
  }
  if (subEl) {
    subEl.innerText = displayRole + " · Temporada 2026";
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
  document
    .querySelectorAll(".module-panel")
    .forEach((el) => el.classList.remove("active"));
  document
    .querySelectorAll(".tab-btn")
    .forEach((el) => el.classList.remove("active"));

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

  if (tabId === "mod-estadisticas") {
    if (attendanceChart) setTimeout(() => attendanceChart.resize(), 100);
    if (typeof populateGameInfoPlayerSelect === "function") populateGameInfoPlayerSelect();
    if (typeof renderPlayerGameInfo === "function") renderPlayerGameInfo();
  }
  if (tabId === "mod-avisos" && typeof populateNoticeControls === "function") {
    populateNoticeControls();
  }

  if (window.innerWidth <= 900) {
    document.getElementById("mainSidebar").classList.remove("open");
  }
}

function toggleSidebar() {
  document.getElementById("mainSidebar").classList.toggle("open");
}

// --- ROLE SYSTEM ---
function canViewGameInfo() {
  return ["dt", "auxiliar", "preparador", "directiva"].includes(currentRole);
}

function applyRolePermissions() {
  const isDT = currentRole === "dt";
  const isDirectiva = currentRole === "directiva";
  const canEdit = isDT;
  const canViewSensitiveInfo = canViewGameInfo();

  document.querySelectorAll(".role-dt-only").forEach((el) => {
    el.style.display = canEdit ? "" : "none";
  });

  document.querySelectorAll(".role-admin-trainer-only").forEach((el) => {
    el.style.display = canViewSensitiveInfo ? "" : "none";
  });

  document.querySelectorAll(".player-marker").forEach((el) => {
    // Permitir manipulación a todos en la pizarra táctica
    el.classList.add("role-editable");
    el.style.cursor = "grab";
  });
}

// --- MODULE: ASISTENCIA QR ---
function populateDynamicGroups() {
  const groups = new Set(
    squadData.map((p) => p.group).filter((g) => g && g.trim() !== ""),
  );
  const uniqueGroups = Array.from(groups).sort();

  const groupOptions = document.getElementById("groupOptions");
  if (groupOptions) {
    groupOptions.innerHTML = uniqueGroups
      .map((g) => `<option value="${g}">`)
      .join("");
  }

  const updateSelect = (id) => {
    const sel = document.getElementById(id);
    if (!sel) return;
    const currentVal = sel.value;
    sel.innerHTML =
      '<option value="Todos">Todas las Categorías / Global</option>' +
      uniqueGroups.map((g) => `<option value="${g}">${g}</option>`).join("");
    if (uniqueGroups.includes(currentVal) || currentVal === "Todos") {
      sel.value = currentVal;
    }
  };

  updateSelect("tacticalGroupSelect");
  updateSelect("noticeGroupSelect");
  updateSelect("statsGroupSelect");

  if (typeof populateNoticeControls === "function") {
    populateNoticeControls();
  }
  if (typeof populateGameInfoPlayerSelect === "function") {
    populateGameInfoPlayerSelect();
  }
}

function populateQuickPlayerSelect() {
  const select = document.getElementById("quickPlayerSelect");
  const injurySelect = document.getElementById("injuryPlayerSelect");
  if (!select) return;
  select.innerHTML = "";
  if (injurySelect) injurySelect.innerHTML = "";

  squadData.forEach((p) => {
    const opt = `<option value="${p.id}">#${p.number} ${p.name}</option>`;
    select.innerHTML += opt;
    if (injurySelect && !p.injured) injurySelect.innerHTML += opt;
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
  const timeStr = now.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  player.status = "Presente";
  player.checkinTime = timeStr;
  saveData();

  const alertBox = document.getElementById("lastCheckinAlert");
  document.getElementById("lastCheckinText").innerText =
    `Asistencia de ${player.name} (${timeStr})`;
  alertBox.classList.remove("hidden");
  setTimeout(() => alertBox.classList.add("hidden"), 3000);

  renderAttendanceTable();
  renderRankingTable();
  updateChartData();
}

function markManualAttendance(playerId, newStatus) {
  const player = squadData.find((p) => p.id === playerId);
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

  squadData.forEach((p) => {
    if (p.status === "Presente") presentCount++;
    const tr = document.createElement("tr");
    let badgeClass =
      p.status === "Presente"
        ? "badge-success"
        : p.status === "Justificado"
          ? "badge-warning"
          : "badge-danger";

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
  document.getElementById("attendanceCount").innerText =
    `${presentCount}/${squadData.length} Presentes`;
  applyRolePermissions();
}

// --- MODULE: ALINEACION & PERFILES ---
let currentSlotForModal = null;
const slotAssignments = {
  GK: 1,
  LB: 3,
  CB1: 4,
  CB2: 5,
  RB: 2,
  MCD: 6,
  MC1: 8,
  MC2: 10,
  EI: 11,
  DC: 9,
  ED: 7,
};

function changePitchSlot(slotPos) {
  if (currentRole !== "dt") return;
  currentSlotForModal = slotPos;
  const select = document.getElementById("modalPlayerSelect");
  select.innerHTML = "";

  const groupFilter = document.getElementById("tacticalGroupSelect")
    ? document.getElementById("tacticalGroupSelect").value
    : "Todos";

  squadData.forEach((p) => {
    if (p.injured) return; // Injured players cannot play
    if (groupFilter !== "Todos" && p.group !== groupFilter) return; // Filtro de categoría

    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = `#${p.number} ${p.name} (${p.position})`;
    select.appendChild(opt);
  });

  document.getElementById("modalPositionTitle").innerText =
    `Asignar Posición [${slotPos}]`;
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
    if (player.injured) {
      showToast("Este jugador está lesionado.", "error");
      return;
    }

    document.getElementById(`slot-${currentSlotForModal}`).innerText =
      currentSlotForModal;

    // Update marker shirt visually
    const marker = document.getElementById(`slot-${currentSlotForModal}`)
      .previousElementSibling.previousElementSibling;
    if (marker && marker.classList.contains("marker-shirt")) {
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

  const groupFilter = document.getElementById("tacticalGroupSelect")
    ? document.getElementById("tacticalGroupSelect").value
    : "Todos";

  squadData.forEach((p) => {
    if (groupFilter !== "Todos" && p.group !== groupFilter) return;

    const item = document.createElement("div");
    item.className = "squad-player-item";
    item.onclick = () => openProfileModal(p.id);

    let statusHTML = p.starter
      ? '<span class="badge badge-neon">TITULAR</span>'
      : '<span class="badge" style="border-color:var(--border-strong);">SUPLENTE</span>';
    if (p.injured)
      statusHTML = '<span class="badge badge-danger">LESIONADO</span>';

    item.innerHTML = `
      <div>
        <strong style="color: ${p.injured ? "var(--accent-danger)" : "var(--text-main)"}">#${p.number} ${p.name}</strong>
        <br><small class="text-muted">${p.position}</small>
      </div>
      <div>${statusHTML}</div>
    `;
    container.appendChild(item);
  });
}

function openProfileModal(id) {
  const p = squadData.find((x) => x.id === id);
  if (!p) return;

  document.getElementById("profileNumber").innerText = p.number;
  document.getElementById("profileName").innerText = p.name;
  document.getElementById("profilePosition").innerText = p.position;

  const badge = document.getElementById("profileStatusBadge");
  if (p.injured) {
    badge.className = "badge badge-danger mt-2";
    badge.innerText = "Baja Médica";
  } else {
    badge.className = "badge badge-success mt-2";
    badge.innerText = "Activo";
  }

  document.getElementById("profileGoals").innerText = p.goals;
  document.getElementById("profileAssists").innerText = p.assists;
  document.getElementById("profileMins").innerText = p.mins + "'";
  document.getElementById("profileCards").innerText = p.cards;

  document.getElementById("playerProfileModal").classList.remove("hidden");
}
function closeProfileModal() {
  document.getElementById("playerProfileModal").classList.add("hidden");
}

// --- MODULE: MEDICAL (NEW) ---
function reportInjury(e) {
  e.preventDefault();
  const playerId = parseInt(
    document.getElementById("injuryPlayerSelect").value,
  );
  const type = document.getElementById("injuryType").value;
  const time = document.getElementById("injuryTime").value;

  const p = squadData.find((x) => x.id === playerId);
  if (!p) return;

  p.injured = true;
  p.starter = false; // Remove from lineup

  injuredData.push({
    id: Date.now(),
    player: p.name,
    number: p.number,
    type,
    time,
    playerId: p.id,
  });
  saveData();

  showToast(`${p.name} enviado a enfermería.`, "warning");
  document.getElementById("injuryForm").reset();

  renderInjuredTable();
  renderSquadCallupList();
  populateQuickPlayerSelect();
}

function dischargePlayer(injuryId) {
  const inj = injuredData.find((x) => x.id === injuryId);
  if (!inj) return;

  const p = squadData.find((x) => x.id === inj.playerId);
  if (p) p.injured = false;

  injuredData = injuredData.filter((x) => x.id !== injuryId);
  saveData();

  showToast(`${p.name} tiene el alta médica.`, "success");
  renderInjuredTable();
  renderSquadCallupList();
  populateQuickPlayerSelect();
}

function renderInjuredTable() {
  const tbody = document.getElementById("injuredTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (injuredData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No hay jugadores lesionados.</td></tr>`;
    return;
  }

  injuredData.forEach((i) => {
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

  calendarEvents
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach((ev) => {
      const card = document.createElement("div");
      card.className = "event-card";

      let dFormatted = ev.date;
      try {
        dFormatted = new Date(ev.date + "T00:00:00").toLocaleDateString(
          "es-ES",
          { weekday: "short", month: "short", day: "numeric" },
        );
      } catch (e) {}

      let resultHtml = "";
      const isDT = currentRole === "dt";

      if (ev.result) {
        let statsChips = "";
        if (ev.matchStats && ev.matchStats.length > 0) {
          const chips = ev.matchStats
            .map((s) => {
              const p = squadData.find((pl) => pl.id === s.playerId);
              const pName = p ? p.name.split(" ")[0] : "Jugador";
              let parts = [];
              if (s.goals > 0) parts.push(`Gol: ${s.goals > 1 ? s.goals + ' ' : ''}${pName}`);
              if (s.assists > 0) parts.push(`Asist: ${s.assists > 1 ? s.assists + ' ' : ''}${pName}`);
              return parts.length ? `<span class="chip">${parts.join(" · ")}</span>` : "";
            })
            .filter(Boolean)
            .join("");
          if (chips) {
            statsChips = `<div class="event-scorers-chip">${chips}</div>`;
          }
        }

        resultHtml = `
          <div class="event-result text-primary" style="margin-top: 0.5rem; font-weight:700;">${ev.result}</div>
          ${statsChips}
          ${isDT ? `<div class="margin-top text-center"><button class="btn btn-ghost btn-sm" onclick="openMatchResultModal(${ev.id}, '${ev.title.replace(/'/g, "\\'")}')"><i class="fa-solid fa-pen-to-square"></i> Editar Resultado</button></div>` : ""}
        `;
      } else if (ev.type === "partido" && isDT) {
        resultHtml = `<div class="margin-top text-center"><button class="btn btn-primary btn-sm" onclick="openMatchResultModal(${ev.id}, '${ev.title.replace(/'/g, "\\'")}')"><i class="fa-solid fa-trophy"></i> Cargar Resultado</button></div>`;
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

function openAddEventModal() {
  document.getElementById("addEventModal").classList.remove("hidden");
}
function closeEventModal() {
  document.getElementById("addEventModal").classList.add("hidden");
}

function saveNewEvent() {
  const title = document.getElementById("newEvent-title").value;
  const date = document.getElementById("newEvent-date").value;
  if (!title || !date) return showToast("Falta título o fecha.", "error");

  calendarEvents.push({
    id: Date.now(),
    type: document.getElementById("newEvent-type").value,
    title,
    date,
    time: document.getElementById("newEvent-time").value,
    location:
      document.getElementById("newEvent-location").value || "Por definir",
    result: null,
    matchStats: [],
  });

  saveData();
  renderCalendarEvents();
  closeEventModal();
  showToast("Evento creado correctamente.", "success");
}

function openMatchResultModal(eventId, title) {
  currentEventForResult = eventId;
  const ev = calendarEvents.find((x) => x.id === eventId);
  const titleEl = document.getElementById("matchResultTitle");
  if (titleEl) titleEl.innerText = title;

  const scoreL = document.getElementById("scoreLaguna");
  const scoreR = document.getElementById("scoreRival");
  const container = document.getElementById("matchScorersContainer");
  if (container) container.innerHTML = "";

  if (ev && ev.result) {
    const match = ev.result.match(/LA\s*(\d+)\s*-\s*(\d+)\s*RIV/i);
    if (match) {
      if (scoreL) scoreL.value = match[1];
      if (scoreR) scoreR.value = match[2];
    }
    if (ev.matchStats && ev.matchStats.length > 0) {
      ev.matchStats.forEach((s) => {
        addScorerRow(s.playerId, s.goals, s.assists);
      });
    }
  } else {
    if (scoreL) scoreL.value = 0;
    if (scoreR) scoreR.value = 0;
  }

  updateScorerGoalCount();
  document.getElementById("matchResultModal").classList.remove("hidden");
}

function closeMatchResultModal() {
  document.getElementById("matchResultModal").classList.add("hidden");
}

function addScorerRow(selectedPlayerId = null, initialGoals = 1, initialAssists = 0) {
  const container = document.getElementById("matchScorersContainer");
  if (!container) return;

  const rowId = "scorer_row_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
  const row = document.createElement("div");
  row.className = "match-scorer-row";
  row.id = rowId;

  const playerOptions = squadData
    .map(
      (p) =>
        `<option value="${p.id}" ${selectedPlayerId == p.id ? "selected" : ""}>#${p.number} ${p.name} (${p.position || "Jugador"})</option>`
    )
    .join("");

  row.innerHTML = `
    <select class="form-control scorer-player-select" style="font-size:0.82rem; padding: 0.35rem 0.5rem;" onchange="updateScorerGoalCount()">
      ${playerOptions}
    </select>
    <div style="text-align: center;">
      <div style="font-size: 0.68rem; color: var(--text-muted); margin-bottom: 2px;">Goles</div>
      <div class="stat-stepper">
        <button type="button" class="stat-stepper-btn" onclick="stepScorerVal('${rowId}', 'goals', -1)">-</button>
        <input type="number" class="scorer-goals-input" min="0" max="20" value="${initialGoals}" oninput="updateScorerGoalCount()" />
        <button type="button" class="stat-stepper-btn" onclick="stepScorerVal('${rowId}', 'goals', 1)">+</button>
      </div>
    </div>
    <div style="text-align: center;">
      <div style="font-size: 0.68rem; color: var(--text-muted); margin-bottom: 2px;">Asistencias</div>
      <div class="stat-stepper">
        <button type="button" class="stat-stepper-btn" onclick="stepScorerVal('${rowId}', 'assists', -1)">-</button>
        <input type="number" class="scorer-assists-input" min="0" max="20" value="${initialAssists}" />
        <button type="button" class="stat-stepper-btn" onclick="stepScorerVal('${rowId}', 'assists', 1)">+</button>
      </div>
    </div>
    <button type="button" class="reg-action-btn delete" style="margin:0; padding:0.4rem; height:32px;" onclick="removeScorerRow('${rowId}')" title="Eliminar fila">
      <i class="fa-solid fa-trash-can"></i>
    </button>
  `;

  container.appendChild(row);
  updateScorerGoalCount();
}

function removeScorerRow(rowId) {
  const row = document.getElementById(rowId);
  if (row) {
    row.remove();
    updateScorerGoalCount();
  }
}

function stepScorerVal(rowId, field, delta) {
  const row = document.getElementById(rowId);
  if (!row) return;
  const input = row.querySelector(field === "goals" ? ".scorer-goals-input" : ".scorer-assists-input");
  if (!input) return;
  let val = parseInt(input.value) || 0;
  val = Math.max(0, val + delta);
  input.value = val;
  if (field === "goals") {
    updateScorerGoalCount();
  }
}

function updateScorerGoalCount() {
  const scoreL = parseInt(document.getElementById("scoreLaguna")?.value) || 0;
  const goalInputs = document.querySelectorAll("#matchScorersContainer .scorer-goals-input");
  let totalAssigned = 0;
  goalInputs.forEach((inp) => {
    totalAssigned += parseInt(inp.value) || 0;
  });

  const badge = document.getElementById("matchGoalBalanceBadge");
  if (badge) {
    if (totalAssigned === scoreL && scoreL > 0) {
      badge.className = "badge badge-neon";
      badge.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${totalAssigned} de ${scoreL} goles asignados`;
    } else if (totalAssigned > scoreL) {
      badge.className = "badge badge-danger";
      badge.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${totalAssigned} asignados (${totalAssigned - scoreL} más que marcador)`;
    } else {
      badge.className = "badge badge-outline";
      badge.innerHTML = `${totalAssigned} de ${scoreL} goles asignados`;
    }
  }
}

function saveMatchResult() {
  const l = parseInt(document.getElementById("scoreLaguna")?.value) || 0;
  const r = parseInt(document.getElementById("scoreRival")?.value) || 0;
  const ev = calendarEvents.find((x) => x.id === currentEventForResult);

  if (!ev) {
    closeMatchResultModal();
    return;
  }

  // 1. Revertir estadísticas anteriores si existían para evitar duplicidad al editar
  if (ev.matchStats && Array.isArray(ev.matchStats)) {
    ev.matchStats.forEach((oldStat) => {
      const pl = squadData.find((p) => p.id === oldStat.playerId);
      if (pl) {
        pl.goals = Math.max(0, (pl.goals || 0) - (oldStat.goals || 0));
        pl.assists = Math.max(0, (pl.assists || 0) - (oldStat.assists || 0));
      }
    });
  }

  // 2. Recolectar las nuevas estadísticas
  const rows = document.querySelectorAll("#matchScorersContainer .match-scorer-row");
  const newMatchStats = [];

  rows.forEach((row) => {
    const pSel = row.querySelector(".scorer-player-select");
    const gInp = row.querySelector(".scorer-goals-input");
    const aInp = row.querySelector(".scorer-assists-input");

    if (pSel) {
      const pId = parseInt(pSel.value);
      const goals = parseInt(gInp?.value) || 0;
      const assists = parseInt(aInp?.value) || 0;

      if (goals > 0 || assists > 0) {
        newMatchStats.push({ playerId: pId, goals, assists });

        const pl = squadData.find((p) => p.id === pId);
        if (pl) {
          pl.goals = (pl.goals || 0) + goals;
          pl.assists = (pl.assists || 0) + assists;
        }
      }
    }
  });

  // 3. Guardar en el evento
  ev.result = `LA ${l} - ${r} RIV`;
  ev.matchStats = newMatchStats;

  saveData();
  renderCalendarEvents();
  renderRegTable();
  if (typeof updateNoticeTemplate === "function") {
    updateNoticeTemplate();
  }

  showToast(`Resultado guardado: LA ${l} - ${r} RIV con estadísticas.`, "success");
  closeMatchResultModal();
}


// --- MODULE: JUSTIFICATIONS ---
function submitJustification(e) {
  e.preventDefault();
  const loggedPlayerName = loggedInUser
    ? `${loggedInUser.name} (#${loggedInUser.number})`
    : "Jugador (Web)";

  justificationsData.push({
    id: Date.now(),
    player: loggedPlayerName,
    date: document.getElementById("justDate").value,
    reason: document.getElementById("justReason").value,
    detail: document.getElementById("justDetail").value,
    status: "Pendiente",
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
  c.innerHTML =
    justificationsData.length === 0
      ? `<p class="text-muted text-center">Buzón vacío.</p>`
      : "";

  justificationsData.forEach((j) => {
    let bc =
      j.status === "Aprobada"
        ? "badge-success"
        : j.status === "Rechazada"
          ? "badge-danger"
          : "badge-warning";
    let btnHtml =
      j.status === "Pendiente" && currentRole === "dt"
        ? `
      <div class="margin-top flex-end gap-2">
          <button class="btn btn-ghost" onclick="reviewJustification(${j.id}, 'Rechazada')">Rechazar</button>
          <button class="btn btn-primary" onclick="reviewJustification(${j.id}, 'Aprobada')">Aprobar</button>
      </div>`
        : "";

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

// --- MODULE: AVISOS & DIFUSIÓN INTELIGENTE (EXPANDED PRO) ---
let currentNoticeMode = "general"; // "general" | "grupo" | "personalizado"

function switchNoticeMode(mode) {
  currentNoticeMode = mode;
  document.querySelectorAll("#noticeModeTabs .reg-filter-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-notice-mode") === mode);
  });

  const pGen = document.getElementById("noticePanelGeneral");
  const pGrp = document.getElementById("noticePanelGrupo");
  const pPer = document.getElementById("noticePanelPersonalizado");

  if (pGen) pGen.classList.toggle("hidden", mode !== "general");
  if (pGrp) pGrp.classList.toggle("hidden", mode !== "grupo");
  if (pPer) pPer.classList.toggle("hidden", mode !== "personalizado");

  populateNoticeControls();
  updateNoticeTemplate();
}

function cleanPhoneForWhatsApp(phone) {
  if (!phone) return "";
  let cleaned = String(phone).replace(/\D/g, "");
  cleaned = cleaned.replace(/^00/, "");
  if (cleaned.length === 10) {
    cleaned = "52" + cleaned;
  }
  return cleaned;
}

function populateNoticeControls() {
  const totalPlayers = squadData.length;
  let totalContacts = 0;
  squadData.forEach((p) => {
    ensureRegFields(p);
    totalContacts += (p.contacts && p.contacts.length) ? p.contacts.length : 1;
  });

  const contactsBadge = document.getElementById("noticeTotalContactsBadge");
  const playersBadge = document.getElementById("noticeTotalPlayersBadge");
  if (contactsBadge) contactsBadge.innerHTML = `<i class="fa-solid fa-address-book"></i> ${totalContacts} Contactos`;
  if (playersBadge) playersBadge.innerHTML = `<i class="fa-solid fa-users"></i> ${totalPlayers} Jugadores`;

  // 1. Grupos Select
  const groups = new Set(
    squadData.map((p) => p.group).filter((g) => g && g.trim() !== "")
  );
  const uniqueGroups = Array.from(groups).sort();
  const groupSel = document.getElementById("noticeGroupFilterSelect");
  if (groupSel) {
    const curVal = groupSel.value;
    if (uniqueGroups.length === 0) {
      groupSel.innerHTML = '<option value="Plantel General">Plantel General</option>';
    } else {
      groupSel.innerHTML = uniqueGroups
        .map((g) => {
          const count = squadData.filter((p) => p.group === g).length;
          return `<option value="${g}">${g} (${count} jugadores)</option>`;
        })
        .join("");
      if (uniqueGroups.includes(curVal)) {
        groupSel.value = curVal;
      }
    }
  }

  // 2. Jugadores Select para modo Personalizado
  const playerSel = document.getElementById("noticePersonalPlayerSelect");
  if (playerSel) {
    const curPlayerId = playerSel.value;
    playerSel.innerHTML = squadData
      .map((p) => `<option value="${p.id}">#${p.number} ${p.name} ${p.group ? '· ' + p.group : ''}</option>`)
      .join("");
    if (curPlayerId && squadData.some((p) => p.id == curPlayerId)) {
      playerSel.value = curPlayerId;
    }
  }

  // Render contacts tables
  renderNoticeGenContactsTable();
  renderNoticeGroupContactsTable();
  onNoticePlayerChange(false);
}

function renderNoticeGenContactsTable() {
  const tbody = document.getElementById("noticeGenContactsTableBody");
  const countLabel = document.getElementById("noticeGenCountLabel");
  if (!tbody) return;

  tbody.innerHTML = "";
  let totalCount = 0;

  squadData.forEach((p) => {
    ensureRegFields(p);
    p.contacts.forEach((c, idx) => {
      totalCount++;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>
          <div style="font-weight:600; color:var(--text-main); font-size:0.84rem;">#${p.number} ${p.name}</div>
          <span class="badge badge-outline" style="font-size:0.7rem; padding:1px 5px;">${p.group || 'Sin Cat.'}</span>
        </td>
        <td>
          <div style="font-size:0.82rem; color:var(--text-main);">${c.relation}: <strong>${c.name}</strong></div>
          <div class="mono-text text-muted" style="font-size:0.75rem;"><i class="fa-solid fa-phone"></i> ${c.phone}</div>
        </td>
        <td style="text-align:right;">
          <button class="btn-whatsapp-sm" onclick="sendIndividualNoticeWhatsApp(${p.id}, ${idx}, 'general')" title="Enviar mensaje por WhatsApp">
            <i class="fa-brands fa-whatsapp"></i> Enviar
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });
  });

  if (countLabel) countLabel.innerText = `${totalCount} contactos`;
}

function renderNoticeGroupContactsTable() {
  const tbody = document.getElementById("noticeGroupContactsTableBody");
  const countLabel = document.getElementById("noticeGroupCountLabel");
  const groupSel = document.getElementById("noticeGroupFilterSelect");
  if (!tbody) return;

  tbody.innerHTML = "";
  const selectedGroup = groupSel ? groupSel.value : "";
  const filteredPlayers = selectedGroup
    ? squadData.filter((p) => p.group === selectedGroup)
    : squadData;

  let totalCount = 0;

  filteredPlayers.forEach((p) => {
    ensureRegFields(p);
    p.contacts.forEach((c, idx) => {
      totalCount++;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>
          <div style="font-weight:600; color:var(--text-main); font-size:0.84rem;">#${p.number} ${p.name}</div>
          <div style="font-size:0.72rem; color:var(--text-muted);">${p.position || 'Jugador'}</div>
        </td>
        <td>
          <div style="font-size:0.82rem; color:var(--text-main);">${c.relation}: <strong>${c.name}</strong></div>
          <div class="mono-text text-muted" style="font-size:0.75rem;"><i class="fa-solid fa-phone"></i> ${c.phone}</div>
        </td>
        <td style="text-align:right;">
          <button class="btn-whatsapp-sm" onclick="sendIndividualNoticeWhatsApp(${p.id}, ${idx}, 'grupo')" title="Enviar aviso de grupo">
            <i class="fa-brands fa-whatsapp"></i> Enviar
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });
  });

  if (countLabel) countLabel.innerText = `${filteredPlayers.length} jugadores (${totalCount} contactos)`;
}

function onNoticeGroupChange() {
  renderNoticeGroupContactsTable();
  updateNoticeTemplate();
}

function onNoticePlayerChange(updateTemplate = true) {
  const playerSel = document.getElementById("noticePersonalPlayerSelect");
  if (!playerSel) return;
  const playerId = parseInt(playerSel.value);
  const player = squadData.find((p) => p.id === playerId) || squadData[0];
  if (!player) return;

  ensureRegFields(player);

  const contactSel = document.getElementById("noticePersonalContactSelect");
  if (contactSel) {
    contactSel.innerHTML = player.contacts
      .map((c, i) => `<option value="${i}">${c.relation}: ${c.name} (${c.phone})</option>`)
      .join("");
  }

  const nameEl = document.getElementById("noticePlayerName");
  const subEl = document.getElementById("noticePlayerSub");
  const photoEl = document.getElementById("noticePlayerPhoto");
  const statusBadge = document.getElementById("noticePlayerStatusBadge");
  const attEl = document.getElementById("noticePlayerAttendance");
  const balEl = document.getElementById("noticePlayerBalance");
  const contList = document.getElementById("noticePlayerContactsList");

  if (nameEl) nameEl.innerText = player.name;
  if (subEl) subEl.innerText = `#${player.number} · ${player.position || 'Jugador'} · ${player.group || 'Sin Cat.'}`;
  if (photoEl) photoEl.src = player.photo || "LAGUNA.jpg";
  if (statusBadge) {
    statusBadge.className = `badge badge-status-${(player.regStatus || 'activo').toLowerCase()}`;
    statusBadge.innerText = player.regStatus || "Activo";
  }
  if (attEl) attEl.innerText = `${player.attendancePct || 0}%`;

  if (balEl) {
    const playerPayments = paymentsData.filter((p) => p.playerId === player.id);
    const hasUnpaid = playerPayments.some((p) => p.status !== "Pagado");
    if (hasUnpaid) {
      const unpaidSum = playerPayments
        .filter((p) => p.status !== "Pagado")
        .reduce((sum, p) => sum + (p.finalAmount || 0), 0);
      balEl.innerHTML = `<span class="text-danger">$${unpaidSum.toLocaleString()} MXN Pendiente</span>`;
    } else {
      balEl.innerHTML = `<span class="text-success">Al corriente ($0)</span>`;
    }
  }

  if (contList) {
    contList.innerHTML = player.contacts
      .map((c) => `<div><i class="fa-solid fa-user-check text-primary"></i> ${c.relation}: <strong>${c.name}</strong> <span class="mono-text">(${c.phone})</span></div>`)
      .join("");
  }

  if (updateTemplate) {
    updateNoticeTemplate();
  }
}

function onNoticeContactChange() {
  updateNoticeTemplate();
}

function updateNoticeTemplate() {
  const today = new Date().toISOString().split("T")[0];
  const nt = calendarEvents.find((e) => e.type === "entrenamiento" && e.date >= today);
  const nm = calendarEvents.find((e) => e.type === "partido" && e.date >= today);

  // 1. MODO GENERAL
  const genType = document.getElementById("noticeGenTemplateSelect")?.value || "entrenamiento";
  const genArea = document.getElementById("noticeGenMessageText");
  if (genArea) {
    if (genType === "entrenamiento") {
      genArea.value = `*LAGUNA ATHLETIC - AVISO GENERAL*\n\nHola plantel y familias,\nEl próximo *Entrenamiento Oficial* se llevará a cabo el ${nt ? nt.date : "próximo día de práctica"} en ${nt ? nt.location : "Cancha Principal"} a las ${nt ? nt.time : "08:00 hrs"}.\n\nFavor de llegar 15 minutos antes y escanear su código QR al ingresar.`;
    } else if (genType === "partido") {
      genArea.value = `*LAGUNA ATHLETIC - JORNADA DE PARTIDO*\n\nEstimadas familias y jugadores,\nEste fin de semana tenemos compromiso oficial:\n*${nm ? nm.title : "Partido Oficial de Liga"}*\nFecha: ${nm ? nm.date : "Fin de semana"}\nHorario: ${nm ? nm.time : "16:00 hrs"}\nSede: ${nm ? nm.location : "Estadio Central"}\n\nFavor de presentarse con uniforme de gala.`;
    } else if (genType === "pago_mes") {
      genArea.value = `*LAGUNA ATHLETIC - COMUNICADO DE FINANZAS*\n\nEstimadas familias,\nLes recordamos cordialmente que nos encontramos en período de pago de la colegiatura mensual. Su aportación puntual nos permite mantener la calidad en entrenamientos, cuerpo técnico y material deportivo.\n\nPueden realizar su pago por transferencia SPEI o directo en recepción. Agradecemos su compromiso.`;
    } else if (genType === "comunicado") {
      genArea.value = `*LAGUNA ATHLETIC - COMUNICADO INSTITUCIONAL*\n\nEstimada comunidad deportiva de Laguna Athletic,\nPor medio del presente comunicado les informamos sobre las próximas actividades oficiales del club.\n\nPara cualquier duda o aclaración, favor de comunicarse con la dirección deportiva. Gracias por formar parte de nuestra familia.`;
    } else if (genType === "libre") {
      if (!genArea.value.trim()) {
        genArea.value = `*LAGUNA ATHLETIC - COMUNICADO*\n\nEstimadas familias de Laguna Athletic:\n\n[Escribe aquí tu mensaje...]`;
      }
    }
  }

  // 2. MODO GRUPO
  const groupSel = document.getElementById("noticeGroupFilterSelect");
  const groupName = groupSel ? groupSel.value : "Plantel";
  const groupType = document.getElementById("noticeGroupTemplateSelect")?.value || "entrenamiento_grupo";
  const groupArea = document.getElementById("noticeGroupMessageText");
  if (groupArea) {
    if (groupType === "entrenamiento_grupo") {
      groupArea.value = `*LAGUNA ATHLETIC [${groupName.toUpperCase()}]*\n\nHola equipo,\nTenemos sesión de *Entrenamiento Táctico* para la categoría *${groupName}*:\nFecha: ${nt ? nt.date : "Día programado"}\nHora: ${nt ? nt.time : "08:00 hrs"}\nCancha: ${nt ? nt.location : "Cancha 1"}\n\nLlevar espinilleras, hidratación y escanear QR al llegar.`;
    } else if (groupType === "partido_grupo") {
      groupArea.value = `*LAGUNA ATHLETIC - CONVOCATORIA OFICIAL [${groupName.toUpperCase()}]*\n\nAtención jugadores y tutores de la categoría *${groupName}*:\nPartido: *${nm ? nm.title : "Jornada de Liga"}*\nCancha: ${nm ? nm.location : "Estadio Central"}\nCitatorio: ${nm ? nm.time : "16:00 hrs"}\n\nFavor de confirmar asistencia en el grupo y revisar la alineación táctica en la plataforma.`;
    } else if (groupType === "asistencia_grupo") {
      groupArea.value = `*LAGUNA ATHLETIC - CONTROL DE ASISTENCIA [${groupName.toUpperCase()}]*\n\nEstimados padres de familia y jugadores de la categoría *${groupName}*:\nLes recordamos la importancia de la puntualidad y asistencia constante a los entrenamientos. En caso de inasistencia por motivos de salud o escolares, favor de enviar su justificante a través de la app oficial.`;
    } else if (groupType === "pago_grupo") {
      groupArea.value = `*LAGUNA ATHLETIC - RECORDATORIO DE CUOTA [${groupName.toUpperCase()}]*\n\nHola familias de la categoría *${groupName}*,\nRecordatorio para el pago de la colegiatura y cuotas correspondientes a esta categoría. Agradecemos a los tutores que ya cubrieron su aportación e invitamos a quienes tengan saldo pendiente a ponerse al corriente.`;
    } else if (groupType === "comunicado_grupo") {
      groupArea.value = `*LAGUNA ATHLETIC [${groupName.toUpperCase()}] - AVISO DE LA DIRECTIVA*\n\nEstimadas familias de la categoría *${groupName}*:\nCompartimos información importante respecto a nuestro calendario de competencias y entrenamientos especiales.`;
    } else if (groupType === "libre_grupo") {
      if (!groupArea.value.trim()) {
        groupArea.value = `*LAGUNA ATHLETIC [${groupName.toUpperCase()}]*\n\nHola plantel y familias:\n\n[Escribe aquí tu mensaje para el grupo...]`;
      }
    }
  }

  // 3. MODO PERSONALIZADO
  const playerSel = document.getElementById("noticePersonalPlayerSelect");
  const contactSel = document.getElementById("noticePersonalContactSelect");
  const personalType = document.getElementById("noticePersonalTemplateSelect")?.value || "adeudo_personal";
  const personalArea = document.getElementById("noticePersonalMessageText");

  if (personalArea && playerSel) {
    const playerId = parseInt(playerSel.value);
    const player = squadData.find((p) => p.id === playerId) || squadData[0];
    if (player) {
      ensureRegFields(player);
      const contactIdx = contactSel ? parseInt(contactSel.value) || 0 : 0;
      const contact = player.contacts[contactIdx] || player.contacts[0] || { name: "Tutor", phone: "", relation: "Tutor" };

      const playerPayments = paymentsData.filter((p) => p.playerId === player.id);
      const unpaid = playerPayments.filter((p) => p.status !== "Pagado");
      const totalUnpaid = unpaid.reduce((sum, p) => sum + (p.finalAmount || 0), 0);

      if (personalType === "adeudo_personal") {
        if (totalUnpaid > 0) {
          personalArea.value = `*LAGUNA ATHLETIC - RECORDATORIO DE SALDO PENDIENTE*\n\nEstimado(a) ${contact.name} (${contact.relation} de ${player.name}):\n\nEsperamos que se encuentre muy bien. Nos comunicamos de la directiva de Laguna Athletic para recordarle que la cuenta de *${player.name}* (#${player.number}) registra un saldo pendiente de *$${totalUnpaid.toLocaleString()} MXN*.\n\nLe agradeceremos realizar el pago correspondiente a la brevedad o ponerse en contacto si tiene alguna consulta. Muchas gracias por su apoyo.`;
        } else {
          personalArea.value = `*LAGUNA ATHLETIC - ESTADO DE CUENTA AL CORRIENTE*\n\nEstimado(a) ${contact.name} (${contact.relation} de ${player.name}):\n\nLe confirmamos que la cuenta de *${player.name}* (#${player.number}) se encuentra *al corriente* con sus colegiaturas.\n\nAgradecemos mucho su puntualidad y compromiso continuo con el club.`;
        }
      } else if (personalType === "falta_personal") {
        personalArea.value = `*LAGUNA ATHLETIC - REPORTE DE ASISTENCIA*\n\nEstimado(a) ${contact.name} (${contact.relation} de ${player.name}):\n\nLe informamos que registramos una inasistencia reciente de *${player.name}* (#${player.number}). Actualmente su balance de asistencia es del *${player.attendancePct || 0}%*.\n\nSi la falta fue por motivo de salud o escolar, le recordamos que puede registrar su justificación directamente en nuestra app oficial para no afectar su racha.`;
      } else if (personalType === "convocatoria_personal") {
        personalArea.value = `*LAGUNA ATHLETIC - CONVOCATORIA INDIVIDUAL*\n\nEstimado(a) ${contact.name}:\nNos complace informarle que *${player.name}* (#${player.number}) está convocado(a) como *${player.starter ? "Titular" : "Suplente"}* para el siguiente compromiso:\n\nEncuentro: ${nm ? nm.title : "Próximo Partido Oficial"}\nFecha: ${nm ? nm.date : "Próxima Jornada"}\nHorario: ${nm ? nm.time : "16:00 hrs"}\nLugar: ${nm ? nm.location : "Estadio Central"}\n\nFavor de confirmar de recibido. Éxito a ${player.name}.`;
      } else if (personalType === "medico_personal") {
        personalArea.value = `*LAGUNA ATHLETIC - SEGUIMIENTO MÉDICO*\n\nEstimado(a) ${contact.name} (${contact.relation} de ${player.name}):\n\nNos comunicamos del área deportiva y de acondicionamiento físico respecto al estado de salud de *${player.name}* (#${player.number}).\n\nEstado actual: ${player.injured ? "En recuperación / Lesionado" : "Apto para entrenar al 100%"}.\nSeguimos atentos a su evolución para asegurar un retorno óptimo a la cancha.`;
      } else if (personalType === "desempeno_personal") {
        personalArea.value = `*LAGUNA ATHLETIC - RECONOCIMIENTO Y DESEMPEÑO*\n\nEstimado(a) ${contact.name} (${contact.relation} de ${player.name}):\n\nQueremos felicitar a *${player.name}* (#${player.number}) por su excelente compromiso y desempeño en la cancha.\n\nEstadísticas de la temporada:\n- Asistencia: ${player.attendancePct || 0}%\n- Goles: ${player.goals || 0}\n- Asistencias: ${player.assists || 0}\n- Minutos jugados: ${player.mins || 0} min\n\nSigamos trabajando juntos por el campeonato.`;
      } else if (personalType === "libre_personal") {
        if (!personalArea.value.trim()) {
          personalArea.value = `*LAGUNA ATHLETIC*\n\nEstimado(a) ${contact.name} (${contact.relation} de ${player.name}):\n\n[Escribe aquí tu mensaje personalizado...]`;
        }
      }
    }
  }

  // Compatibilidad con selectores antiguos si existen
  const legacyArea = document.getElementById("noticeMessageText");
  if (legacyArea && genArea) {
    legacyArea.value = genArea.value;
  }
}

function sendGeneralBroadcast() {
  const text = document.getElementById("noticeGenMessageText")?.value || "";
  if (!text.trim()) {
    showToast("Escribe un mensaje para difundir.", "warning");
    return;
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  showToast("Abriendo WhatsApp con comunicado general...", "success");
}

function sendGroupBroadcast() {
  const text = document.getElementById("noticeGroupMessageText")?.value || "";
  if (!text.trim()) {
    showToast("Escribe un mensaje para el grupo.", "warning");
    return;
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  showToast("Abriendo WhatsApp con aviso del grupo...", "success");
}

function sendPersonalWhatsApp() {
  const playerSel = document.getElementById("noticePersonalPlayerSelect");
  const contactSel = document.getElementById("noticePersonalContactSelect");
  const text = document.getElementById("noticePersonalMessageText")?.value || "";

  if (!playerSel) return;
  const playerId = parseInt(playerSel.value);
  const player = squadData.find((p) => p.id === playerId);
  if (!player) return;

  ensureRegFields(player);
  const contactIdx = contactSel ? parseInt(contactSel.value) || 0 : 0;
  const contact = player.contacts[contactIdx] || player.contacts[0];
  const cleanedPhone = cleanPhoneForWhatsApp(contact.phone);

  if (!cleanedPhone) {
    showToast("El contacto no tiene un teléfono válido registrado.", "error");
    return;
  }

  window.open(`https://wa.me/${cleanedPhone}?text=${encodeURIComponent(text)}`, "_blank");
  showToast(`Abriendo WhatsApp para ${contact.name} (${contact.relation})...`, "success");
}

function sendIndividualNoticeWhatsApp(playerId, contactIndex, mode) {
  const player = squadData.find((p) => p.id === playerId);
  if (!player) return;
  ensureRegFields(player);

  const contact = player.contacts[contactIndex] || player.contacts[0];
  const cleanedPhone = cleanPhoneForWhatsApp(contact.phone);

  if (!cleanedPhone) {
    showToast("El contacto no tiene un número telefónico registrado.", "error");
    return;
  }

  let templateText = "";
  if (mode === "grupo") {
    templateText = document.getElementById("noticeGroupMessageText")?.value || "";
  } else {
    templateText = document.getElementById("noticeGenMessageText")?.value || "";
  }

  // Sustitución de etiquetas dinámicas si se usan en el mensaje
  let personalizedMessage = templateText
    .replace(/{nombre_jugador}/gi, player.name)
    .replace(/{jugador}/gi, player.name)
    .replace(/{tutor}/gi, contact.name)
    .replace(/{categoria}/gi, player.group || "Laguna Athletic");

  window.open(`https://wa.me/${cleanedPhone}?text=${encodeURIComponent(personalizedMessage)}`, "_blank");
  showToast(`Enviando a ${contact.name} (${player.name})...`, "success");
}

function copyNoticeText(textareaId) {
  const area = document.getElementById(textareaId);
  if (!area || !area.value.trim()) {
    showToast("No hay texto para copiar.", "warning");
    return;
  }
  navigator.clipboard.writeText(area.value)
    .then(() => {
      showToast("Texto copiado al portapapeles.", "success");
    })
    .catch(() => {
      area.select();
      document.execCommand("copy");
      showToast("Texto copiado al portapapeles.", "success");
    });
}

function checkAutomatedPaymentReminders() {
  const today = new Date();
  const day = today.getDate();
  const todayStr = today.toISOString().split("T")[0];
  const lastSent = localStorage.getItem("laguna_last_automated_reminder");

  if (lastSent === todayStr) return;

  if (day === 1) {
    showToast(
      "Sistema: Recordatorio de pago del mes en curso enviado automáticamente.",
      "success",
    );
    localStorage.setItem("laguna_last_automated_reminder", todayStr);
  } else if (day === 10 || day === 20 || day === 30) {
    showToast(
      "Sistema: Avisos de adeudo vencido enviados a contactos con saldo pendiente.",
      "warning",
    );
    localStorage.setItem("laguna_last_automated_reminder", todayStr);
  }
}
function simulateSendNotices() {
  sendGeneralBroadcast();
}


// --- MODULE: CHART & STATS ---
function initChart() {
  const canvas = document.getElementById("attendanceChart");
  if (!canvas || typeof Chart === "undefined") return;
  attendanceChart = new Chart(canvas.getContext("2d"), {
    type: "doughnut",
    data: {
      labels: ["Presentes", "Justificados", "Ausentes"],
      datasets: [
        {
          data: [0, 0, 0],
          backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "#94a3b8",
            font: { family: "'JetBrains Mono', monospace" },
          },
        },
      },
      cutout: "75%",
    },
  });
  updateChartData();
}

function updateChartData() {
  if (!attendanceChart) return;
  const groupSel = document.getElementById("statsGroupSelect");
  const groupFilter = groupSel ? groupSel.value : "Todos";

  let p = 0,
    j = 0,
    a = 0;
  squadData.forEach((x) => {
    if (groupFilter !== "Todos" && x.group !== groupFilter) return;
    x.status === "Presente" ? p++ : x.status === "Justificado" ? j++ : a++;
  });
  attendanceChart.data.datasets[0].data = [p, j, a];
  attendanceChart.update();
}

function renderRankingTable() {
  const tb = document.getElementById("rankingTableBody");
  if (!tb) return;
  tb.innerHTML = "";

  const groupSel = document.getElementById("statsGroupSelect");
  const groupFilter = groupSel ? groupSel.value : "Todos";

  let filteredData = squadData;
  if (groupFilter !== "Todos") {
    filteredData = squadData.filter((p) => p.group === groupFilter);
  }

  [...filteredData]
    .sort((a, b) => b.attendancePct - a.attendancePct)
    .slice(0, 5)
    .forEach((p, i) => {
      tb.innerHTML += `
      <tr>
        <td class="text-muted">#${i + 1}</td>
        <td><strong>${p.name}</strong></td>
        <td class="text-primary" style="font-weight:700;">${p.attendancePct}%</td>
        <td><span class="badge badge-success">${p.streak}</span></td>
      </tr>
    `;
    });
}

function populateGameInfoPlayerSelect() {
  const select = document.getElementById("gameInfoPlayerSelect");
  const filterPlayer = document.getElementById("gameInfoFilterPlayer");
  const filterGroup = document.getElementById("gameInfoFilterGroup");
  const eventSelect = document.getElementById("gameInfoEventSelect");

  if (select) {
    select.innerHTML = squadData
      .map((p) => `<option value="${p.id}">#${p.number} ${p.name} (${p.group || "Sin Cat."})</option>`)
      .join("");
  }

  if (filterPlayer) {
    const curVal = filterPlayer.value;
    filterPlayer.innerHTML = '<option value="Todos">Todos los Jugadores</option>' +
      squadData.map((p) => `<option value="${p.id}">#${p.number} ${p.name}</option>`).join("");
    if (curVal && (curVal === "Todos" || squadData.some((p) => p.id == curVal))) {
      filterPlayer.value = curVal;
    }
  }

  if (filterGroup) {
    const curGroup = filterGroup.value;
    const groups = new Set(
      squadData.map((p) => p.group).filter((g) => g && g.trim() !== "")
    );
    const uniqueGroups = Array.from(groups).sort();
    filterGroup.innerHTML = '<option value="Todos">Todas las Categorías</option>' +
      uniqueGroups.map((g) => `<option value="${g}">${g}</option>`).join("");
    if (curGroup && (curGroup === "Todos" || uniqueGroups.includes(curGroup))) {
      filterGroup.value = curGroup;
    }
  }

  if (eventSelect) {
    const matchEvents = calendarEvents.filter((e) => e.type === "partido");
    eventSelect.innerHTML = '<option value="">— Seleccionar partido del calendario o escribir manual —</option>' +
      matchEvents.map((e) => `<option value="${e.id}">${e.title} (${e.date})</option>`).join("");
  }
}

function onGameInfoEventSelect() {
  const eventSelect = document.getElementById("gameInfoEventSelect");
  if (!eventSelect || !eventSelect.value) return;

  const eventId = Number(eventSelect.value);
  const ev = calendarEvents.find((e) => e.id === eventId);
  if (ev) {
    const titleInp = document.getElementById("gameInfoTitle");
    const dateInp = document.getElementById("gameInfoDate");
    if (titleInp && !titleInp.value.trim()) {
      titleInp.value = `Resumen: ${ev.title}`;
    }
    if (dateInp) {
      dateInp.value = ev.date;
    }
  }
}

function openPlayerGameInfoModal(playerId = null, editInfoId = null) {
  if (!canViewGameInfo()) {
    showToast("Acceso restringido a entrenadores y administradores.", "error");
    return;
  }

  populateGameInfoPlayerSelect();
  const select = document.getElementById("gameInfoPlayerSelect");
  const editIdInp = document.getElementById("gameInfoEditId");
  const titleInp = document.getElementById("gameInfoTitle");
  const typeSelect = document.getElementById("gameInfoTypeSelect");
  const dateInp = document.getElementById("gameInfoDate");
  const urlInp = document.getElementById("gameInfoDownloadUrl");
  const notesInp = document.getElementById("gameInfoNotes");
  const eventSelect = document.getElementById("gameInfoEventSelect");

  if (editInfoId && playerId) {
    const player = squadData.find((p) => p.id === playerId);
    const info = player && Array.isArray(player.gameInfo) ? player.gameInfo.find((i) => i.id === editInfoId) : null;
    if (info) {
      if (editIdInp) editIdInp.value = String(info.id);
      if (select) select.value = String(playerId);
      if (titleInp) titleInp.value = info.title || "";
      if (typeSelect) typeSelect.value = info.type || "Análisis Táctico";
      if (dateInp) dateInp.value = info.date || "";
      if (urlInp) urlInp.value = info.downloadUrl || "";
      if (notesInp) notesInp.value = info.notes || "";
      if (eventSelect) eventSelect.value = "";
    }
  } else {
    if (editIdInp) editIdInp.value = "";
    document.getElementById("gameInfoForm")?.reset();
    if (playerId && select) select.value = String(playerId);
    if (dateInp) dateInp.value = new Date().toISOString().split("T")[0];
  }

  document.getElementById("gameInfoModal").classList.remove("hidden");
}

function closePlayerGameInfoModal() {
  const modal = document.getElementById("gameInfoModal");
  if (modal) modal.classList.add("hidden");
  document.getElementById("gameInfoForm")?.reset();
  const editIdInp = document.getElementById("gameInfoEditId");
  if (editIdInp) editIdInp.value = "";
}

function savePlayerGameInfo(e) {
  if (e) e.preventDefault();
  if (!canViewGameInfo()) {
    showToast("Acceso denegado: solo directiva y cuerpo técnico.", "error");
    return;
  }

  const playerId = Number(document.getElementById("gameInfoPlayerSelect").value);
  const editId = document.getElementById("gameInfoEditId")?.value;
  const title = document.getElementById("gameInfoTitle").value.trim();
  const type = document.getElementById("gameInfoTypeSelect")?.value || "Análisis Táctico";
  const date = document.getElementById("gameInfoDate").value;
  const downloadUrl = document.getElementById("gameInfoDownloadUrl").value.trim();
  const notes = document.getElementById("gameInfoNotes").value.trim();

  if (!playerId || !title || !date) {
    showToast("Completa el jugador, título y fecha del partido.", "error");
    return;
  }

  const player = squadData.find((p) => p.id === playerId);
  if (!player) {
    showToast("No se encontró al jugador seleccionado.", "error");
    return;
  }

  if (!Array.isArray(player.gameInfo)) player.gameInfo = [];

  if (editId) {
    const existingIndex = player.gameInfo.findIndex((i) => String(i.id) === String(editId));
    if (existingIndex !== -1) {
      player.gameInfo[existingIndex] = {
        id: Number(editId),
        title,
        type,
        date,
        downloadUrl,
        notes,
      };
      showToast(`Reporte actualizado para ${player.name}.`, "success");
    }
  } else {
    player.gameInfo.unshift({
      id: Date.now(),
      title,
      type,
      date,
      downloadUrl,
      notes,
    });
    showToast(`Se enlazó la información del partido a ${player.name}.`, "success");
  }

  saveData();
  renderPlayerGameInfo();
  closePlayerGameInfoModal();
}

function deletePlayerGameInfo(playerId, infoId) {
  if (!canViewGameInfo()) {
    showToast("Solo entrenadores y administradores pueden eliminar reportes.", "error");
    return;
  }

  const player = squadData.find((p) => p.id === playerId);
  if (!player || !Array.isArray(player.gameInfo)) return;

  player.gameInfo = player.gameInfo.filter((i) => i.id !== infoId);
  saveData();
  renderPlayerGameInfo();
  showToast("Enlace de información eliminado.", "info");
}

function copyGameInfoUrl(url) {
  if (!url) return;
  navigator.clipboard.writeText(url)
    .then(() => showToast("Enlace de descarga copiado al portapapeles.", "success"))
    .catch(() => showToast("URL: " + url, "info"));
}

function renderPlayerGameInfo() {
  const container = document.getElementById("playerGameInfoList");
  if (!container) return;

  if (!canViewGameInfo()) {
    container.innerHTML = `
      <div class="player-game-info-locked">
        <i class="fa-solid fa-lock" style="font-size: 1.3rem;"></i>
        <div>
          <strong>Acceso Confidencial Restringido</strong>
          <div style="font-size: 0.82rem; opacity: 0.85;">Esta información y descarga de partidos solo la pueden ver el administrador y entrenadores.</div>
        </div>
      </div>
    `;
    return;
  }

  const groupFilter = document.getElementById("gameInfoFilterGroup")?.value || "Todos";
  const playerFilter = document.getElementById("gameInfoFilterPlayer")?.value || "Todos";

  let filteredSquad = squadData;
  if (groupFilter !== "Todos") {
    filteredSquad = filteredSquad.filter((p) => p.group === groupFilter);
  }
  if (playerFilter !== "Todos") {
    filteredSquad = filteredSquad.filter((p) => p.id == playerFilter);
  }

  const playersWithGameInfo = filteredSquad.filter(
    (p) => Array.isArray(p.gameInfo) && p.gameInfo.length > 0,
  );

  if (playersWithGameInfo.length === 0) {
    container.innerHTML = `
      <div class="glass-panel text-center" style="padding: 2rem 1rem; border-radius: var(--radius-md); color: var(--text-muted);">
        <i class="fa-solid fa-folder-open" style="font-size: 2rem; margin-bottom: 0.5rem; color: var(--accent-gold); opacity: 0.6;"></i>
        <p style="margin-bottom: 0.5rem; font-weight: 600;">No hay información ni descargas de partidos vinculadas.</p>
        <button class="btn btn-outline btn-sm role-admin-trainer-only" onclick="openPlayerGameInfoModal()">
          <i class="fa-solid fa-plus"></i> Enlazar primer reporte
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = playersWithGameInfo
    .map((p) => {
      const items = p.gameInfo
        .map((info) => {
          const formattedDate = info.date
            ? new Date(info.date + "T00:00:00").toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "Sin fecha";

          const safeUrl = info.downloadUrl ? encodeURI(info.downloadUrl) : "";
          const linkHtml = info.downloadUrl
            ? `
              <a class="btn btn-whatsapp-sm" href="${safeUrl}" target="_blank" rel="noopener noreferrer" style="background: var(--accent-primary);" title="Abrir archivo o enlace de descarga">
                <i class="fa-solid fa-download"></i> Descargar / Abrir
              </a>
              <button class="reg-action-btn" onclick="copyGameInfoUrl('${info.downloadUrl.replace(/'/g, "\\'")}')" title="Copiar enlace">
                <i class="fa-regular fa-copy"></i>
              </button>
            `
            : `<span class="badge badge-outline" style="font-size:0.72rem;">Sin enlace web</span>`;

          const notesHtml = info.notes
            ? `<p class="text-muted margin-top-sm" style="font-size:0.83rem; background: rgba(0,0,0,0.2); padding: 0.5rem; border-radius: 6px; margin-bottom: 0.5rem;">${info.notes}</p>`
            : "";

          return `
            <div class="player-game-info-entry">
              <div class="flex-between gap-2 align-start">
                <div>
                  <div style="font-weight: 600; font-size: 0.95rem; color: var(--text-main);">${info.title}</div>
                  <div class="text-muted mono-text" style="font-size:0.75rem; margin-top:0.15rem;">
                    <i class="fa-regular fa-calendar"></i> ${formattedDate}
                  </div>
                </div>
                <div class="flex-center gap-1">
                  <span class="badge badge-outline" style="font-size:0.7rem;">${info.type || "Partido"}</span>
                  <button class="reg-action-btn edit" onclick="openPlayerGameInfoModal(${p.id}, ${info.id})" title="Editar reporte">
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button class="reg-action-btn delete" onclick="deletePlayerGameInfo(${p.id}, ${info.id})" title="Eliminar reporte">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>
              ${notesHtml}
              <div class="margin-top-sm flex-between align-center" style="flex-wrap: wrap; gap: 0.5rem;">
                <div style="display: flex; gap: 0.4rem; align-items: center;">${linkHtml}</div>
              </div>
            </div>
          `;
        })
        .join("");

      return `
        <div class="player-game-info-card">
          <div class="flex-between align-center margin-bottom-sm">
            <div class="player-mini">
              <img src="${p.photo || "LAGUNA.jpg"}" alt="${p.name}" />
              <div>
                <strong>#${p.number} ${p.name}</strong>
                <small>${p.position} · ${p.group || "Sin Cat."}</small>
              </div>
            </div>
            <button class="btn btn-outline btn-sm role-admin-trainer-only" onclick="openPlayerGameInfoModal(${p.id})">
              <i class="fa-solid fa-plus"></i> Enlazar Reporte
            </button>
          </div>
          <div class="player-game-info-items">${items}</div>
        </div>
      `;
    })
    .join("");
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
  const pitch = document.getElementById("tacticalPitch");
  if (!pitch) return;

  // Load saved positions from localStorage
  try {
    const saved = localStorage.getItem("laguna_pitch_positions");
    if (saved) savedPositions = JSON.parse(saved);
  } catch (e) {}

  const markers = pitch.querySelectorAll(".player-marker");
  markers.forEach((marker) => {
    const slot = marker.getAttribute("data-slot");
    // Restore saved positions
    if (savedPositions[slot]) {
      marker.style.left = savedPositions[slot].left;
      marker.style.top = savedPositions[slot].top;
    }
    // Attach events
    marker.addEventListener("mousedown", onDragStart);
    marker.addEventListener("touchstart", onDragStart, { passive: false });
  });

  document.addEventListener("mousemove", onDragMove, { passive: false });
  document.addEventListener("touchmove", onDragMove, { passive: false });
  document.addEventListener("mouseup", onDragEnd);
  document.addEventListener("touchend", onDragEnd);
}

function onDragStart(e) {
  const marker = e.currentTarget.closest(".player-marker");
  if (!marker) return;

  // Se permite manipular jugadores sin importar el rol
  draggedMarker = marker;
  isDragging = false;

  const client = e.touches ? e.touches[0] : e;
  dragStartX = client.clientX;
  dragStartY = client.clientY;

  // offsetLeft/offsetTop are already the centre-point (we use left/top + transform:-50%)
  dragInitialLeft = marker.offsetLeft;
  dragInitialTop = marker.offsetTop;

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
    draggedMarker.classList.add("is-dragging");

    const pitch = document.getElementById("tacticalPitch");
    const pw = pitch.offsetWidth;
    const ph = pitch.offsetHeight;

    let newLeft = dragInitialLeft + dx;
    let newTop = dragInitialTop + dy;

    // Clamp within pitch boundaries
    newLeft = Math.max(0, Math.min(newLeft, pw));
    newTop = Math.max(0, Math.min(newTop, ph));

    draggedMarker.style.left = ((newLeft / pw) * 100).toFixed(2) + "%";
    draggedMarker.style.top = ((newTop / ph) * 100).toFixed(2) + "%";

    if (e.cancelable) e.preventDefault();
  }
}

function onDragEnd() {
  if (!draggedMarker) return;
  draggedMarker.classList.remove("is-dragging");

  if (isDragging) {
    // Persist new position
    const slot = draggedMarker.getAttribute("data-slot");
    savedPositions[slot] = {
      left: draggedMarker.style.left,
      top: draggedMarker.style.top,
    };
    try {
      localStorage.setItem(
        "laguna_pitch_positions",
        JSON.stringify(savedPositions),
      );
    } catch (e) {}
    showToast("Posición guardada.", "success");
  } else {
    // It was a plain click → open the substitution modal
    const slot = draggedMarker.getAttribute("data-slot");
    if (slot) changePitchSlot(slot);
  }

  draggedMarker = null;
  isDragging = false;
}

// ==========================================================================
// MODULE: REGISTRO DE JUGADORES, FOTOGRAFÍAS Y EXPEDIENTES
// ==========================================================================

let regFilter = "todos"; // filtro activo de estatus
let regEditingId = null; // id del jugador en edición (null = nuevo)
let currentSelectedPhoto = "LAGUNA.jpg"; // photo temp

function ensureRegFields(player) {
  if (!player.regStatus) player.regStatus = "Activo";
  if (!player.birthdate) player.birthdate = "";
  // Retrocompatibilidad: si tiene phone/tutorName sueltos, migrar a contacts[]
  if (
    !player.contacts ||
    !Array.isArray(player.contacts) ||
    player.contacts.length === 0
  ) {
    player.contacts = [
      {
        name:
          player.tutorName || "Familia " + (player.name || "").split(" ").pop(),
        phone: player.phone || "+52 844 000 0000",
        relation: "Tutor",
      },
    ];
  }
  // Alias de compatibilidad para código antiguo que usa tutorName/phone directos
  player.tutorName = player.contacts[0].name;
  player.phone = player.contacts[0].phone;
  if (!player.email) player.email = "";
  if (!player.regNotes) player.regNotes = "";
  if (!player.photo) player.photo = "LAGUNA.jpg";
  if (!player.group) player.group = "";
  if (!player.positionAlt) player.positionAlt = "";
  if (!player.linkedSiblingId) player.linkedSiblingId = null;
  if (player.docActa === undefined) player.docActa = true;
  if (player.docCURP === undefined) player.docCURP = true;
  if (player.docMedico === undefined) player.docMedico = true;
  if (player.docINE === undefined) player.docINE = true;
  if (player.docEscolar === undefined) player.docEscolar = false;
  return player;
}

/** Handles photo selection and converts to DataURL */
function handlePhotoSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (evt) {
    currentSelectedPhoto = evt.target.result;
    document.getElementById("regPhotoPreview").src = currentSelectedPhoto;
  };
  reader.readAsDataURL(file);
}

/** Renders the registration table with current filter + search */
function renderRegTable() {
  const tbody = document.getElementById("regTableBody");
  const countEl = document.getElementById("regSquadCount");
  const searchVal = (
    document.getElementById("regSearchInput")?.value || ""
  ).toLowerCase();
  if (!tbody) return;
  tbody.innerHTML = "";

  squadData.forEach(ensureRegFields);

  const filtered = squadData.filter((p) => {
    const matchFilter = regFilter === "todos" || p.regStatus === regFilter;
    const matchSearch =
      !searchVal ||
      p.name.toLowerCase().includes(searchVal) ||
      String(p.number).includes(searchVal) ||
      (p.tutorName && p.tutorName.toLowerCase().includes(searchVal)) ||
      p.position.toLowerCase().includes(searchVal);
    return matchFilter && matchSearch;
  });

  if (countEl)
    countEl.textContent = `${squadData.length} Niño${squadData.length !== 1 ? "s" : ""}`;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted" style="padding:2rem;">Sin niños registrados con ese criterio.</td></tr>`;
    return;
  }

  const isDT = currentRole === "dt";

  filtered
    .sort((a, b) => a.number - b.number)
    .forEach((p) => {
      const statusKey = (p.regStatus || "Activo")
        .toLowerCase()
        .replace(/ /g, "");
      const badgeClass = `badge badge-status-${statusKey}`;

      // Contar documentos cargados (máx 5)
      const docCount =
        (p.docActa ? 1 : 0) +
        (p.docCURP ? 1 : 0) +
        (p.docMedico ? 1 : 0) +
        (p.docINE ? 1 : 0) +
        (p.docEscolar ? 1 : 0);
      const docBadge =
        docCount === 5
          ? '<span class="badge badge-neon" style="font-size:0.65rem;">Docs: 5/5 Complete</span>'
          : `<span class="badge badge-warning" style="font-size:0.65rem;">Docs: ${docCount}/5</span>`;

      const actionsCells = isDT
        ? `
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
      </td>`
        : `<td>
        <button class="reg-action-btn doc" title="Ver Expediente / Descargar" onclick="openDocModal(${p.id})">
          <i class="fa-solid fa-folder-open"></i> Ver Expediente
        </button>
      </td>`;

      tbody.innerHTML += `
      <tr>
        <td class="mono-text text-primary" style="font-weight:700;">#${p.number}</td>
        <td>
          <div style="display:flex; align-items:center; gap:0.8rem;">
            <img src="${p.photo || "LAGUNA.jpg"}" alt="${p.name}" style="width:36px; height:36px; border-radius:50%; object-fit:cover; border:1px solid var(--accent-primary);" />
            <div>
              <strong>${p.name}</strong>
              <br><small class="text-muted">Tutor: ${p.tutorName || "N/A"}</small>
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
  document
    .querySelectorAll(".reg-filter-btn")
    .forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  renderRegTable();
}

function filterRegTable() {
  renderRegTable();
}

/** UI helpers for contact rows */
function addNextContact() {
  const row2 = document.getElementById("contactRow2");
  const row3 = document.getElementById("contactRow3");
  const btn = document.getElementById("addContactBtn");
  if (row2.classList.contains("hidden")) {
    row2.classList.remove("hidden");
  } else if (row3.classList.contains("hidden")) {
    row3.classList.remove("hidden");
    btn.style.display = "none"; // ya hay 3
  }
}

function removeContact(num) {
  const row = document.getElementById(`contactRow${num}`);
  if (!row) return;
  row.classList.add("hidden");
  // Limpiar campos
  const nameEl = document.getElementById(`contact${num}Name`);
  const phoneEl = document.getElementById(`contact${num}Phone`);
  if (nameEl) nameEl.value = "";
  if (phoneEl) phoneEl.value = "";
  // Mostrar botón agregar otra vez
  document.getElementById("addContactBtn").style.display = "";
}

/** Populates the sibling-linking select with current squad members */
function populateSiblingSelect(excludeId) {
  const sel = document.getElementById("regLinkedSibling");
  if (!sel) return;
  sel.innerHTML = '<option value="">Sin vinculación manual</option>';
  squadData.forEach((p) => {
    if (p.id === excludeId) return;
    sel.innerHTML += `<option value="${p.id}">#${p.number} ${p.name}</option>`;
  });
}

function handlePlayerRegSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("regName").value.trim();
  const number = parseInt(document.getElementById("regNumber").value);
  const group = document.getElementById("regGroup").value;
  const linkedId = document.getElementById("regLinkedSibling").value
    ? parseInt(document.getElementById("regLinkedSibling").value)
    : null;
  const position = document.getElementById("regPosition").value;
  const positionAlt = document.getElementById("regPositionAlt").value;
  const birthdate = document.getElementById("regBirthdate").value;
  const email = document.getElementById("regEmail").value.trim();
  const regStatus = document.getElementById("regStatus").value;
  const starter = document.getElementById("regStarter").value === "true";
  const regNotes = document.getElementById("regNotes").value.trim();

  // Recopilar contactos
  const contacts = [];
  const c1Name = document.getElementById("contact1Name").value.trim();
  const c1Phone = document.getElementById("contact1Phone").value.trim();
  const c1Rel = document.getElementById("contact1Relation").value;
  if (c1Name) contacts.push({ name: c1Name, phone: c1Phone, relation: c1Rel });

  const c2Name = document.getElementById("contact2Name").value.trim();
  const c2Phone = document.getElementById("contact2Phone").value.trim();
  const c2Rel = document.getElementById("contact2Relation").value;
  if (
    c2Name &&
    !document.getElementById("contactRow2").classList.contains("hidden")
  ) {
    contacts.push({ name: c2Name, phone: c2Phone, relation: c2Rel });
  }

  const c3Name = document.getElementById("contact3Name").value.trim();
  const c3Phone = document.getElementById("contact3Phone").value.trim();
  const c3Rel = document.getElementById("contact3Relation").value;
  if (
    c3Name &&
    !document.getElementById("contactRow3").classList.contains("hidden")
  ) {
    contacts.push({ name: c3Name, phone: c3Phone, relation: c3Rel });
  }

  // Documentos
  const docActa = document.getElementById("docActa").checked;
  const docCURP = document.getElementById("docCURP").checked;
  const docMedico = document.getElementById("docMedico").checked;
  const docINE = document.getElementById("docINE").checked;
  const docEscolar = document.getElementById("docEscolar").checked;

  const dorsalTaken = squadData.find(
    (p) => p.number === number && p.id !== regEditingId,
  );
  if (dorsalTaken) {
    showToast(
      `El dorsal #${number} ya pertenece a ${dorsalTaken.name}.`,
      "error",
    );
    return;
  }

  // Alias de compatibilidad
  const tutorName = contacts[0]?.name || "";
  const phone = contacts[0]?.phone || "";

  if (regEditingId !== null) {
    const p = squadData.find((x) => x.id === regEditingId);
    if (p) {
      p.name = name;
      p.number = number;
      p.group = group;
      p.linkedSiblingId = linkedId;
      p.contacts = contacts;
      p.tutorName = tutorName;
      p.phone = phone;
      p.position = position;
      p.positionAlt = positionAlt;
      p.birthdate = birthdate;
      p.email = email;
      p.regStatus = regStatus;
      p.starter = starter;
      p.regNotes = regNotes;
      p.photo = currentSelectedPhoto;
      p.docActa = docActa;
      p.docCURP = docCURP;
      p.docMedico = docMedico;
      p.docINE = docINE;
      p.docEscolar = docEscolar;
      saveData();
      showToast(`Información y documentos de ${name} actualizados.`, "success");
    }
  } else {
    const newId = Date.now();
    squadData.push({
      id: newId,
      number,
      name,
      position,
      positionAlt,
      group,
      linkedSiblingId: linkedId,
      contacts,
      tutorName,
      phone,
      birthdate,
      email,
      regStatus,
      starter,
      regNotes,
      photo: currentSelectedPhoto,
      docActa,
      docCURP,
      docMedico,
      docINE,
      docEscolar,
      attendancePct: 100,
      streak: "1 A",
      status: "Ausente",
      checkinTime: "-",
      injured: false,
      goals: 0,
      assists: 0,
      mins: 0,
      cards: 0,
    });
    saveData();
    showToast(
      `Niño ${name} registrado correctamente con su expediente.`,
      "success",
    );
  }

  resetRegForm();
  renderRegTable();
  renderSquadCallupList();
  populateQuickPlayerSelect();
  populatePaymentPlayerSelect();
  populateDynamicGroups();
  updatePaymentSummaryStats();
}

function openEditPlayer(id) {
  const p = squadData.find((x) => x.id === id);
  if (!p) return;
  ensureRegFields(p);

  regEditingId = id;
  currentSelectedPhoto = p.photo || "LAGUNA.jpg";

  document.getElementById("regEditId").value = id;
  document.getElementById("regName").value = p.name;
  document.getElementById("regNumber").value = p.number;
  document.getElementById("regGroup").value = p.group || "";
  document.getElementById("regPosition").value = p.position;
  document.getElementById("regPositionAlt").value = p.positionAlt || "";
  document.getElementById("regBirthdate").value = p.birthdate || "";
  document.getElementById("regEmail").value = p.email || "";
  document.getElementById("regStatus").value = p.regStatus || "Activo";
  document.getElementById("regStarter").value = p.starter ? "true" : "false";
  document.getElementById("regNotes").value = p.regNotes || "";
  document.getElementById("regPhotoPreview").src = currentSelectedPhoto;

  // Cargar contactos
  const contacts = p.contacts || [];
  const fillContact = (num, c) => {
    const row = document.getElementById(`contactRow${num}`);
    document.getElementById(`contact${num}Name`).value = c ? c.name : "";
    document.getElementById(`contact${num}Phone`).value = c ? c.phone : "";
    document.getElementById(`contact${num}Relation`).value = c
      ? c.relation
      : "Tutor";
    if (num > 1) {
      if (c && c.name) {
        row.classList.remove("hidden");
      } else {
        row.classList.add("hidden");
      }
    }
  };
  fillContact(1, contacts[0]);
  fillContact(2, contacts[1]);
  fillContact(3, contacts[2]);
  document.getElementById("addContactBtn").style.display =
    contacts.length >= 3 ? "none" : "";

  // Vinculación de hermano
  populateSiblingSelect(id);
  document.getElementById("regLinkedSibling").value = p.linkedSiblingId
    ? String(p.linkedSiblingId)
    : "";

  // Documentos
  document.getElementById("docActa").checked = !!p.docActa;
  document.getElementById("docCURP").checked = !!p.docCURP;
  document.getElementById("docMedico").checked = !!p.docMedico;
  document.getElementById("docINE").checked = !!p.docINE;
  document.getElementById("docEscolar").checked = !!p.docEscolar;

  document.getElementById("regFormTitle").innerHTML =
    `<i class="fa-solid fa-pen text-primary"></i> Editando: ${p.name}`;
  document.getElementById("regSubmitBtn").innerHTML =
    `<i class="fa-solid fa-cloud-arrow-up"></i> GUARDAR CAMBIOS`;
  document.getElementById("regCancelBtn").style.display = "";

  document
    .getElementById("playerRegForm")
    .scrollIntoView({ behavior: "smooth", block: "start" });
}

function cancelPlayerEdit() {
  resetRegForm();
}

function resetRegForm() {
  regEditingId = null;
  currentSelectedPhoto = "LAGUNA.jpg";
  document.getElementById("playerRegForm").reset();
  document.getElementById("regPhotoPreview").src = "LAGUNA.jpg";
  document.getElementById("regEditId").value = "";
  // Ocultar contactos 2 y 3
  document.getElementById("contactRow2").classList.add("hidden");
  document.getElementById("contactRow3").classList.add("hidden");
  document.getElementById("addContactBtn").style.display = "";
  // Repoblar selector de hermano
  populateSiblingSelect(null);
  document.getElementById("regFormTitle").innerHTML =
    `<i class="fa-solid fa-user-plus text-primary"></i> Nuevo Jugador`;
  document.getElementById("regSubmitBtn").innerHTML =
    `<i class="fa-solid fa-user-plus"></i> REGISTRAR JUGADOR`;
  document.getElementById("regCancelBtn").style.display = "none";
}

function confirmDeletePlayer(id) {
  const p = squadData.find((x) => x.id === id);
  if (!p) return;

  if (
    !confirm(`¿Eliminar permanentemente a ${p.name} (#${p.number}) del equipo?`)
  )
    return;

  squadData = squadData.filter((x) => x.id !== id);
  injuredData = injuredData.filter((x) => x.playerId !== id);
  saveData();
  showToast(`${p.name} eliminado de la plantilla.`, "warning");
  renderRegTable();
  renderSquadCallupList();
  populateQuickPlayerSelect();
  populatePaymentPlayerSelect();
  updatePaymentSummaryStats();
}

// --- MODAL EXPEDIENTE DOCUMENTAL DEL NIÑO ---
let currentDocPlayerId = null;

function openDocModal(playerId) {
  const p = squadData.find((x) => x.id === playerId);
  if (!p) return;
  ensureRegFields(p);

  currentDocPlayerId = playerId;

  document.getElementById("docModalPhoto").src = p.photo || "LAGUNA.jpg";
  document.getElementById("docModalName").innerText = p.name;

  const groupLabel = p.group ? ` · ${p.group}` : "";
  const altPos = p.positionAlt ? ` / ${p.positionAlt}` : "";
  document.getElementById("docModalSub").innerText =
    `Dorsal #${p.number} · ${p.position}${altPos}${groupLabel} · ${p.regStatus}`;

  // Mostrar contactos
  const contacts = p.contacts || [
    { name: p.tutorName, phone: p.phone, relation: "Tutor" },
  ];
  const contactsHtml = contacts
    .map(
      (c, i) =>
        `<div><i class="fa-solid fa-${i === 0 ? "user-group" : "phone"}"></i> ${c.relation}: <strong>${c.name}</strong> — ${c.phone}</div>`,
    )
    .join("");
  document.getElementById("docModalTutor").innerHTML =
    contactsHtml || `<i class="fa-solid fa-user-group"></i> Sin contactos`;
  document.getElementById("docModalPhone").innerHTML = "";

  // Vinculación de hermano
  const phoneEl = document.getElementById("docModalPhone");
  if (p.linkedSiblingId) {
    const sib = squadData.find((x) => x.id === p.linkedSiblingId);
    if (sib) {
      phoneEl.innerHTML = `<i class="fa-solid fa-link text-warning"></i> Precio Hermano vinculado con: <strong>#${sib.number} ${sib.name}</strong>`;
    }
  }

  const container = document.getElementById("docModalItems");
  container.innerHTML = "";

  const docs = [
    { title: "Acta de Nacimiento", key: "docActa" },
    { title: "CURP Oficial", key: "docCURP" },
    { title: "Certificado Médico", key: "docMedico" },
    { title: "Identificación del Tutor", key: "docINE" },
    { title: "Certificado Escolar / Credencial", key: "docEscolar" },
  ];

  docs.forEach((d) => {
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

  document.getElementById("playerDocModal").classList.remove("hidden");
}

function closeDocModal() {
  document.getElementById("playerDocModal").classList.add("hidden");
}

function printOrDownloadDoc() {
  showToast("Generando Ficha Oficial en PDF para impresión...", "info");
  window.print();
}

// ==========================================================================
// MODULE: SISTEMA DE PAGOS Y HERMANOS
// ==========================================================================

function populatePaymentPlayerSelect() {
  const select = document.getElementById("payPlayerSelect");
  const familySelect = document.getElementById("payFamilySelect");
  if (!select) return;

  select.innerHTML =
    '<option value="" disabled selected>Selecciona un alumno...</option>';
  if (familySelect)
    familySelect.innerHTML =
      '<option value="" disabled selected>Selecciona una familia...</option>';

  const familiesMap = {};

  squadData.forEach((p) => {
    ensureRegFields(p);
    const siblings = detectSiblings(p.id);
    const sibLabel =
      siblings.length > 0
        ? ` (Hermano: ${siblings.map((s) => "#" + s.number + " " + s.name).join(", ")})`
        : "";
    select.innerHTML += `<option value="${p.id}">#${p.number} ${p.name} - Tutor: ${p.tutorName}${sibLabel}</option>`;

    // Agrupar por tutor/familia
    const tName = p.tutorName || "Sin Tutor";
    if (!familiesMap[tName]) familiesMap[tName] = [];
    familiesMap[tName].push(p);
  });

  if (familySelect) {
    Object.keys(familiesMap).forEach((famName) => {
      const children = familiesMap[famName];
      const tag =
        children.length > 1
          ? ` (${children.length} Hermanos - PLAN FAMILIA)`
          : ` (1 Hijo)`;
      familySelect.innerHTML += `<option value="${famName}">${famName}${tag}</option>`;
    });
  }

  document.getElementById("payDate").value = new Date()
    .toISOString()
    .split("T")[0];
}

function togglePaymentScope(mode) {
  const btnInd = document.getElementById("btnModeIndividual");
  const btnFam = document.getElementById("btnModeFamily");
  const groupInd = document.getElementById("groupPlayerSelect");
  const groupFam = document.getElementById("groupFamilySelect");
  const scopeInput = document.getElementById("payScopeMode");
  const bundleCard = document.getElementById("familyBundleCard");
  const siblingAlert = document.getElementById("siblingAlertBox");

  scopeInput.value = mode;

  if (mode === "family") {
    btnFam.classList.add("active");
    btnInd.classList.remove("active");
    groupFam.classList.remove("hidden");
    groupInd.classList.add("hidden");
    siblingAlert.classList.add("hidden");
    populatePaymentFamilySelect();
  } else {
    btnInd.classList.add("active");
    btnFam.classList.remove("active");
    groupInd.classList.remove("hidden");
    groupFam.classList.add("hidden");
    bundleCard.classList.add("hidden");
  }
}

function onPaymentFamilyChange() {
  const familyName = document.getElementById("payFamilySelect").value;
  const children = squadData.filter(
    (p) =>
      p.tutorName &&
      p.tutorName.trim().toLowerCase() === familyName.trim().toLowerCase(),
  );

  const bundleCard = document.getElementById("familyBundleCard");
  const cardTitle = document.getElementById("famCardTitle");
  const cardBadge = document.getElementById("famCardBadge");
  const childrenList = document.getElementById("famChildrenList");
  const grandTotalEl = document.getElementById("famGrandTotalDisplay");

  if (children.length === 0) return;

  cardTitle.innerHTML = `<i class="fa-solid fa-people-roof text-warning"></i> PAQUETE: ${familyName.toUpperCase()}`;
  cardBadge.innerText = `${children.length} HERMANO${children.length > 1 ? "S" : ""}`;
  childrenList.innerHTML = "";

  const conceptSelect = document.getElementById("payConcept");
  const basePrice =
    parseFloat(
      conceptSelect.options[conceptSelect.selectedIndex].getAttribute(
        "data-amount",
      ),
    ) || 1200;

  let grandTotal = 0;
  let totalDiscounts = 0;

  children.forEach((child, index) => {
    let childPrice = basePrice;
    let discTag = "";

    if (index > 0) {
      // 2º Hermano en adelante tiene 20% de descuento
      const disc = basePrice * 0.2;
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
          <img src="${child.photo || "LAGUNA.jpg"}" alt="${child.name}" style="width:36px; height:36px; border-radius:50%; object-fit:cover; border:1px solid var(--accent-primary);" />
          <div>
            <strong>#${child.number} ${child.name}</strong>
            <br><small class="text-muted">${child.position}</small>
          </div>
        </div>
        <div class="fam-child-price-col">
          ${discTag}
          <div class="mono-text font-bold text-success mt-1">$${childPrice.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN</div>
        </div>
      </div>
    `;
  });

  grandTotalEl.innerText = `$${grandTotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN`;
  document.getElementById("payBaseAmount").value = basePrice * children.length;
  document.getElementById("payDiscountPct").value = (
    (totalDiscounts / (basePrice * children.length)) *
    100
  ).toFixed(0);
  document.getElementById("payFinalAmount").value = grandTotal.toFixed(2);

  bundleCard.classList.remove("hidden");
}

/** Detecta si un niño tiene hermanos registrados compartiendo el mismo tutorName */
function detectSiblings(playerId) {
  const player = squadData.find((p) => p.id === playerId);
  if (!player) return [];

  const results = new Map();

  // 1. Por nombre de tutor compartido
  const tutorClean = (player.tutorName || "").trim().toLowerCase();
  if (tutorClean) {
    squadData.forEach((p) => {
      if (
        p.id !== playerId &&
        p.tutorName &&
        p.tutorName.trim().toLowerCase() === tutorClean
      ) {
        results.set(p.id, p);
      }
    });
  }

  // 2. Por vinculación manual bidireccional
  if (player.linkedSiblingId) {
    const linked = squadData.find((p) => p.id === player.linkedSiblingId);
    if (linked) results.set(linked.id, linked);
  }
  // Buscar si algún otro jugador lo vincula a él
  squadData.forEach((p) => {
    if (p.id !== playerId && p.linkedSiblingId === playerId) {
      results.set(p.id, p);
    }
  });

  return Array.from(results.values());
}

function onPaymentPlayerChange() {
  const select = document.getElementById("payPlayerSelect");
  const playerId = parseInt(select.value);
  const siblings = detectSiblings(playerId);

  const alertBox = document.getElementById("siblingAlertBox");
  const alertTitle = document.getElementById("siblingAlertTitle");
  const alertDesc = document.getElementById("siblingAlertDesc");
  const discountInput = document.getElementById("payDiscountPct");

  if (siblings.length > 0) {
    const sibNames = siblings.map((s) => s.name).join(", ");
    alertTitle.innerHTML = `<i class="fa-solid fa-people-roof"></i> ¡Hermanos en el club! (${siblings.length + 1} inscritos)`;
    alertDesc.innerText = `Hermano(s): ${sibNames}. Se aplicará automáticamente 20% de descuento.`;
    alertBox.classList.remove("hidden");

    discountInput.value = 20; // 20% descuento por hermano
  } else {
    alertBox.classList.add("hidden");
    discountInput.value = 0;
  }

  recalculatePaymentTotals();
}

function onPaymentConceptChange() {
  const select = document.getElementById("payConcept");
  const selectedOption = select.options[select.selectedIndex];
  const defaultAmount =
    parseFloat(selectedOption.getAttribute("data-amount")) || 0;
  document.getElementById("payBaseAmount").value = defaultAmount;
  recalculatePaymentTotals();
}

function recalculatePaymentTotals() {
  const base = parseFloat(document.getElementById("payBaseAmount").value) || 0;
  const pct = parseFloat(document.getElementById("payDiscountPct").value) || 0;

  const discountVal = base * (pct / 100);
  const finalVal = Math.max(0, base - discountVal);

  document.getElementById("payFinalAmount").value = finalVal.toFixed(2);
}

function setPaymentType(type) {
  const cardTransfer = document.getElementById("payCardTransfer");
  const cardManual = document.getElementById("payCardManual");
  const inputMethod = document.getElementById("payMethodSelected");
  const labelNotes = document.getElementById("payNotesLabel");
  const inputNotes = document.getElementById("payNotes");

  if (type === "Transferencia SPEI") {
    cardTransfer.classList.add("active");
    cardManual.classList.remove("active");
    inputMethod.value = "Transferencia SPEI";
    labelNotes.innerText = "Folio / Clave de Rastrèo SPEI *";
    inputNotes.placeholder = "Ej. SPEI 94827110293";
  } else {
    cardManual.classList.add("active");
    cardTransfer.classList.remove("active");
    inputMethod.value = "Manual Efectivo";
    labelNotes.innerText = "Cajero / Entregado En Caja *";
    inputNotes.placeholder = "Ej. Recibido por Admin / Caja Central";
  }
}

function renderMonthlyMatrix() {
  const tbody = document.getElementById("monthlyMatrixBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  squadData.forEach((p) => {
    ensureRegFields(p);

    // Buscar mensualidad pagada para Agosto 2026
    const hasAugustPaid = paymentsData.some(
      (pay) =>
        pay.playerId === p.id &&
        pay.concept.includes("Colegiatura") &&
        (pay.notes.includes("Agosto") || pay.month === "Agosto 2026") &&
        pay.status === "Pagado",
    );
    const statusBadge = hasAugustPaid
      ? '<span class="badge badge-success"><i class="fa-solid fa-check-circle"></i> AGOSTO PAGADO</span>'
      : '<span class="badge badge-warning"><i class="fa-solid fa-clock"></i> AGOSTO PENDIENTE</span>';

    const siblings = detectSiblings(p.id);
    const sibTag =
      siblings.length > 0
        ? `<br><small class="text-warning"><i class="fa-solid fa-users"></i> Descuento Hermano Active (-20%)</small>`
        : "";

    tbody.innerHTML += `
      <tr>
        <td>
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <img src="${p.photo || "LAGUNA.jpg"}" style="width:30px; height:30px; border-radius:50%; object-fit:cover;" />
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
  const select = document.getElementById("payPlayerSelect");
  select.value = playerId;
  onPaymentPlayerChange();

  document.getElementById("payConcept").value = "Colegiatura Mensual";
  onPaymentConceptChange();

  const monthSelect = document.getElementById("payMonthSelect");
  if (monthSelect) monthSelect.value = monthName;

  document
    .getElementById("paymentForm")
    .scrollIntoView({ behavior: "smooth", block: "start" });
  showToast(`Registrando cobro de ${monthName}...`, "info");
}

function handlePaymentSubmit(e) {
  e.preventDefault();

  const scopeMode = document.getElementById("payScopeMode").value;
  const conceptSelect = document.getElementById("payConcept").value;
  const monthSelect = document.getElementById("payMonthSelect")?.value || "";
  const concept =
    conceptSelect === "Colegiatura Mensual"
      ? `Colegiatura Mensual (${monthSelect})`
      : conceptSelect;
  const method = document.getElementById("payMethodSelected").value;
  const date = document.getElementById("payDate").value;
  const status = document.getElementById("payStatus").value;
  const notes = document.getElementById("payNotes").value.trim();

  const baseAmount =
    parseFloat(document.getElementById("payBaseAmount").value) || 0;
  const discountPct =
    parseFloat(document.getElementById("payDiscountPct").value) || 0;
  const discountAmount = baseAmount * (discountPct / 100);
  const finalAmount =
    parseFloat(document.getElementById("payFinalAmount").value) || 0;

  const newId = Date.now();
  const folio = `LA-PAGO-${Math.floor(1000 + Math.random() * 9000)}`;

  if (scopeMode === "family") {
    const familyName = document.getElementById("payFamilySelect").value;
    const children = squadData.filter(
      (p) =>
        p.tutorName &&
        p.tutorName.trim().toLowerCase() === familyName.trim().toLowerCase(),
    );

    if (children.length === 0)
      return showToast("Selecciona una familia válida.", "error");

    const namesStr = children.map((c) => `#${c.number} ${c.name}`).join(", ");

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
      notes:
        notes ||
        (method === "Transferencia SPEI"
          ? "Pago Único SPEI Familia"
          : "Pago Efectivo Caja Familia"),
    };

    paymentsData.unshift(newPayment);
    saveData();

    showToast(
      `Cobro Unificado ${folio} por $${finalAmount.toFixed(2)} registrado para ${familyName}.`,
      "success",
    );
  } else {
    const playerId = parseInt(document.getElementById("payPlayerSelect").value);
    const player = squadData.find((p) => p.id === playerId);
    if (!player) return showToast("Selecciona un niño válido.", "error");

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
      notes:
        notes ||
        (method === "Transferencia SPEI"
          ? "Comprobante SPEI"
          : "Pago Efectivo Caja"),
    };

    paymentsData.unshift(newPayment);
    saveData();

    showToast(`Pago ${folio} por ${method} registrado con éxito.`, "success");
  }

  renderPaymentsTable();
  renderMonthlyMatrix();
  updatePaymentSummaryStats();

  openReceiptModal(newId);
}

function renderPaymentsTable() {
  const tbody = document.getElementById("paymentsTableBody");
  const searchVal = (
    document.getElementById("paySearchInput")?.value || ""
  ).toLowerCase();
  if (!tbody) return;
  tbody.innerHTML = "";

  const filtered = paymentsData.filter((p) => {
    return (
      !searchVal ||
      p.folio.toLowerCase().includes(searchVal) ||
      p.playerName.toLowerCase().includes(searchVal) ||
      p.tutorName.toLowerCase().includes(searchVal) ||
      p.concept.toLowerCase().includes(searchVal) ||
      (p.method && p.method.toLowerCase().includes(searchVal))
    );
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding:2rem;">Sin registros de pagos en el historial.</td>8/tr>`;
    return;
  }

  filtered.forEach((p) => {
    const badgeStatus =
      p.status === "Pagado" ? "badge-success" : "badge-warning";
    const hasDiscount = p.discountPct > 0;
    const discountBadge = hasDiscount
      ? `<span class="badge badge-warning" style="font-size:0.65rem;"><i class="fa-solid fa-tag"></i> -${p.discountPct}% Hermano</span>`
      : "";
    const methodBadge =
      p.method === "Transferencia SPEI"
        ? '<span class="badge badge-neon" style="font-size:0.65rem;"><i class="fa-solid fa-building-columns"></i> SPEI</span>'
        : '<span class="badge" style="font-size:0.65rem; border-color:var(--border-strong);"><i class="fa-solid fa-money-bill"></i> Efectivo</span>';

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

  paymentsData.forEach((p) => {
    if (p.status === "Pagado") {
      paidTotal += p.finalAmount;
    } else {
      pendingTotal += p.finalAmount;
    }
    totalDiscounts += p.discountAmount || 0;

    if (p.discountPct > 0) {
      siblingFamiliesSet.add(p.tutorName);
    }
  });

  const totalCollectedEl = document.getElementById("payTotalCollected");
  const paidEl = document.getElementById("statTotalPaid");
  const pendingEl = document.getElementById("statTotalPending");
  const sibEl = document.getElementById("statSiblingsCount");
  const discEl = document.getElementById("statTotalDiscounts");

  if (totalCollectedEl)
    totalCollectedEl.innerText = `$${paidTotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;
  if (paidEl)
    paidEl.innerText = `$${paidTotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;
  if (pendingEl)
    pendingEl.innerText = `$${pendingTotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;
  if (sibEl) sibEl.innerText = `${siblingFamiliesSet.size} Familias`;
  if (discEl)
    discEl.innerText = `$${totalDiscounts.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;
}

// --- MODAL RECIBO DE PAGO ---
let currentReceiptPaymentId = null;

function openReceiptModal(paymentId) {
  const p = paymentsData.find((x) => x.id === paymentId);
  if (!p) return;

  currentReceiptPaymentId = paymentId;

  document.getElementById("receiptFolio").innerText = `FOLIO: #${p.folio}`;
  document.getElementById("receiptDate").innerText = p.date;
  document.getElementById("receiptStudent").innerText = p.playerName;
  document.getElementById("receiptTutor").innerText = p.tutorName;
  document.getElementById("receiptConcept").innerText = p.concept;
  document.getElementById("receiptMethod").innerText = p.method;

  document.getElementById("receiptBase").innerText =
    `$${p.baseAmount.toFixed(2)}`;

  const discountRow = document.getElementById("receiptDiscountRow");
  if (p.discountPct > 0) {
    discountRow.style.display = "flex";
    document.getElementById("receiptDiscount").innerText =
      `-$${p.discountAmount.toFixed(2)} (${p.discountPct}% Hermanos)`;
  } else {
    discountRow.style.display = "none";
  }

  document.getElementById("receiptTotal").innerText =
    `$${p.finalAmount.toFixed(2)} MXN`;

  document.getElementById("paymentReceiptModal").classList.remove("hidden");
}

function closeReceiptModal() {
  document.getElementById("paymentReceiptModal").classList.add("hidden");
}

function printReceipt() {
  window.print();
}
// --- TACTICAL PITCH FULLSCREEN LOGIC ---
document.addEventListener("DOMContentLoaded", () => {
  const btnFullscreen = document.getElementById("btnFullscreenPitch");
  const tacticalBoardCard = document.getElementById("tacticalBoardCard");
  const tacticalPitch = document.getElementById("tacticalPitch");

  if (btnFullscreen && tacticalBoardCard && tacticalPitch) {
    let isPseudoFullscreen = false;

    btnFullscreen.addEventListener("click", () => {
      // iOS Safari and some tablets do not support requestFullscreen on standard Divs.
      const hasNativeAPI =
        tacticalBoardCard.requestFullscreen ||
        tacticalBoardCard.webkitRequestFullscreen ||
        tacticalBoardCard.msRequestFullscreen;

      if (hasNativeAPI) {
        // Use Native Fullscreen API
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
          if (tacticalBoardCard.requestFullscreen) {
            tacticalBoardCard.requestFullscreen().catch(() => {
              // Si falla (por ej. en algunas tablets), usar fallback
              togglePseudoFullscreen();
            });
          } else if (tacticalBoardCard.webkitRequestFullscreen) {
            tacticalBoardCard.webkitRequestFullscreen();
          } else if (tacticalBoardCard.msRequestFullscreen) {
            tacticalBoardCard.msRequestFullscreen();
          }
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
          }
        }
      } else {
        // Fallback para dispositivos que no soportan la API nativa (iPad, iOS)
        togglePseudoFullscreen();
      }
    });

    function togglePseudoFullscreen() {
      isPseudoFullscreen = !isPseudoFullscreen;
      const icon = btnFullscreen.querySelector("i");

      if (isPseudoFullscreen) {
        tacticalBoardCard.classList.add("tactical-fullscreen-mode");
        icon.classList.remove("fa-expand");
        icon.classList.add("fa-compress");
        btnFullscreen.title = "Salir de pantalla completa";
      } else {
        tacticalBoardCard.classList.remove("tactical-fullscreen-mode");
        icon.classList.remove("fa-compress");
        icon.classList.add("fa-expand");
        btnFullscreen.title = "Ver en pantalla completa";
      }
    }

    // Listener para la API Nativa
    document.addEventListener("fullscreenchange", handleNativeFullscreenChange);
    document.addEventListener(
      "webkitfullscreenchange",
      handleNativeFullscreenChange,
    );
    document.addEventListener(
      "msfullscreenchange",
      handleNativeFullscreenChange,
    );

    function handleNativeFullscreenChange() {
      const icon = btnFullscreen.querySelector("i");
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        icon.classList.remove("fa-expand");
        icon.classList.add("fa-compress");
        btnFullscreen.title = "Salir de pantalla completa";

        tacticalBoardCard.style.backgroundColor = "var(--bg-dark)";
        tacticalBoardCard.style.overflow = "auto";
        tacticalBoardCard.style.display = "flex";
        tacticalBoardCard.style.flexDirection = "column";

        tacticalPitch.style.flex = "1";
        tacticalPitch.style.height = "auto";
        tacticalPitch.style.minHeight = "600px";
      } else {
        icon.classList.remove("fa-compress");
        icon.classList.add("fa-expand");
        btnFullscreen.title = "Ver en pantalla completa";

        tacticalBoardCard.style.backgroundColor = "";
        tacticalBoardCard.style.overflow = "";
        tacticalBoardCard.style.display = "";
        tacticalBoardCard.style.flexDirection = "";

        tacticalPitch.style.flex = "";
        tacticalPitch.style.height = "500px";
        tacticalPitch.style.minHeight = "";
      }
    }
  }
});
