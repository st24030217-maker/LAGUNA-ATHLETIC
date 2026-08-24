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
    const savedInjured = localStorage.getItem("laguna_injured_v3");

    squadData = savedSquad ? JSON.parse(savedSquad) : [...defaultSquadData];
    calendarEvents = savedEvents
      ? JSON.parse(savedEvents)
      : [...defaultCalendarEvents];
    justificationsData = savedJust
      ? JSON.parse(savedJust)
      : [...defaultJustifications];
    injuredData = savedInjured ? JSON.parse(savedInjured) : [];
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
    localStorage.setItem("laguna_injured_v3", JSON.stringify(injuredData));
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

// --- LOGIN MODULE & ROLES ---
const ROLE_PINS = {
  dt: "1234",
  auxiliar: "1111",
  preparador: "2222",
  jugador: "0000"
};

function handleLogin(e) {
  e.preventDefault();
  const role = document.getElementById("loginRole").value;
  const pinInput = document.getElementById("loginPinInput") ? document.getElementById("loginPinInput").value.trim() : "";

  if (!role) {
    showToast("Selecciona tu rol de acceso.", "warning");
    return;
  }

  const expectedPin = ROLE_PINS[role] || "1234";
  if (pinInput && pinInput !== expectedPin) {
    showToast("PIN incorrecto para este perfil.", "error");
    const pinEl = document.getElementById("loginPinInput");
    if (pinEl) pinEl.value = "";
    return;
  }

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
  updatePitchDisplay();

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

  renderDashboard();
  showModuleTab("mod-home");
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
    const parentGroup = tabBtn.closest(".nav-group");
    if (parentGroup && !parentGroup.classList.contains("open")) {
      parentGroup.classList.add("open");
    }
  }

  if (tabId === "mod-home" && typeof renderDashboard === "function") {
    renderDashboard();
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

function recalculateAttendancePct() {
  squadData.forEach(p => {
    if (p.status === "Presente") {
      if ((p.attendancePct || 0) < 100) {
        p.attendancePct = Math.min(100, (p.attendancePct || 90) + 1);
      }
    }
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
  recalculateAttendancePct();
  saveData();

  const alertBox = document.getElementById("lastCheckinAlert");
  if (alertBox) {
    document.getElementById("lastCheckinText").innerText =
      `Asistencia de ${player.name} (${timeStr})`;
    alertBox.classList.remove("hidden");
    setTimeout(() => alertBox.classList.add("hidden"), 3000);
  }

  renderAttendanceTable();
  renderRankingTable();
  updateChartData();
  if (typeof renderDashboard === "function") renderDashboard();
}

function markManualAttendance(playerId, newStatus) {
  const player = squadData.find((p) => p.id === playerId);
  if (!player) return;
  player.status = newStatus;
  player.checkinTime = newStatus === "Presente" ? "Manual DT" : "-";
  if (newStatus === "Presente") recalculateAttendancePct();
  saveData();
  renderAttendanceTable();
  updateChartData();
  if (typeof renderDashboard === "function") renderDashboard();
}

function renderAttendanceTable() {
  const tbody = document.getElementById("attendanceTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";
  let presentCount = 0;

  // Ordenar por número de dorsal
  const sortedSquad = [...squadData].sort((a, b) => (a.number || 0) - (b.number || 0));

  sortedSquad.forEach((p) => {
    if (p.status === "Presente") presentCount++;
    const tr = document.createElement("tr");
    let badgeClass =
      p.status === "Presente"
        ? "badge-success"
        : p.status === "Justificado"
          ? "badge-warning"
          : "badge-danger";

    tr.innerHTML = `
      <td>
        <strong>#${p.number}</strong> ${p.name}
        <br><small class="text-muted">${p.position} ${p.group ? '· ' + p.group : ''}</small>
      </td>
      <td><span class="badge ${badgeClass}">${p.status}</span></td>
      <td class="mono-text text-muted">${p.checkinTime}</td>
      <td class="role-dt-only">
          <button class="btn btn-ghost" style="padding:0.4rem; font-size:0.8rem;" onclick="markManualAttendance(${p.id}, 'Presente')"><i class="fa-solid fa-check text-success"></i></button>
          <button class="btn btn-ghost" style="padding:0.4rem; font-size:0.8rem;" onclick="markManualAttendance(${p.id}, 'Ausente')"><i class="fa-solid fa-xmark text-danger"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  const countEl = document.getElementById("attendanceCount");
  if (countEl) countEl.innerText = `${presentCount}/${squadData.length} Presentes`;
  applyRolePermissions();
}

// --- MODULE: ALINEACION, PIZARRA TÁCTICA & PERFILES ---
let currentSlotForModal = null;
let currentSquadFilter = "todos"; // 'todos' | 'titulares' | 'suplentes' | 'lesionados'

let slotAssignments = {
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

// Cargar asignaciones guardadas
try {
  const savedSlots = localStorage.getItem("laguna_slot_assignments");
  if (savedSlots) slotAssignments = JSON.parse(savedSlots);
} catch (e) {}

function saveSlotAssignments() {
  try {
    localStorage.setItem("laguna_slot_assignments", JSON.stringify(slotAssignments));
  } catch (e) {}
}

function updatePitchDisplay() {
  const pitch = document.getElementById("tacticalPitch");
  if (!pitch) return;

  let startersCount = 0;

  Object.keys(slotAssignments).forEach((slotKey) => {
    const marker = pitch.querySelector(`[data-slot="${slotKey}"]`);
    if (!marker) return;

    const assignedVal = slotAssignments[slotKey];
    // assignedVal puede ser el ID del jugador o su número de dorsal
    const player = squadData.find((p) => p.id === assignedVal || p.number === assignedVal);
    const nameSpan = document.getElementById(`slot-${slotKey}`);
    const shirt = marker.querySelector(".marker-shirt");

    if (player && !player.injured) {
      startersCount++;
      marker.classList.add("is-assigned");
      if (shirt) {
        shirt.textContent = player.number;
        shirt.dataset.customNumber = player.number;
      }
      if (nameSpan) {
        // Nombre corto: Primer nombre + inicial o apellido
        const parts = player.name.split(" ");
        const shortName = parts.length > 1 ? `${parts[0][0]}. ${parts[1]}` : player.name;
        nameSpan.textContent = shortName;
        nameSpan.title = `#${player.number} ${player.name} (${player.position})`;
      }
    } else {
      marker.classList.remove("is-assigned");
      if (shirt) delete shirt.dataset.customNumber;
      if (nameSpan) {
        const formation = document.getElementById("formationSelect")?.value || "4-3-3";
        const formConfig = FORMATIONS[formation]?.find((f) => f.slot === slotKey);
        nameSpan.textContent = formConfig ? formConfig.label : slotKey;
      }
    }
  });

  const badgeEl = document.getElementById("tacticalStartersBadge");
  if (badgeEl) {
    badgeEl.textContent = `${startersCount} Titulares Listos`;
    badgeEl.className = startersCount === 11 ? "badge badge-neon" : "badge badge-warning";
  }
}

function changePitchSlot(slotPos) {
  if (currentRole !== "dt") return;
  currentSlotForModal = slotPos;
  const select = document.getElementById("modalPlayerSelect");
  if (!select) return;
  select.innerHTML = "";

  const groupFilter = document.getElementById("tacticalGroupSelect")
    ? document.getElementById("tacticalGroupSelect").value
    : "Todos";

  const available = squadData.filter((p) => {
    if (p.injured) return false;
    if (groupFilter !== "Todos" && p.group !== groupFilter) return false;
    return true;
  });

  if (available.length === 0) {
    showToast("No hay jugadores disponibles en esta categoría.", "warning");
    return;
  }

  available.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.id;
    const isCurrent = slotAssignments[slotPos] === p.id || slotAssignments[slotPos] === p.number;
    opt.textContent = `#${p.number} ${p.name} — ${p.position}${isCurrent ? " (Actual)" : ""}`;
    if (isCurrent) opt.selected = true;
    select.appendChild(opt);
  });

  const modalTitle = document.getElementById("modalPositionTitle");
  if (modalTitle) modalTitle.innerText = `Asignar Titular en Posición [${slotPos}]`;
  document.getElementById("playerSelectModal")?.classList.remove("hidden");
}

function closePlayerModal() {
  document.getElementById("playerSelectModal")?.classList.add("hidden");
  currentSlotForModal = null;
}

function confirmPlayerSelection() {
  const select = document.getElementById("modalPlayerSelect");
  if (!select) return;
  const playerId = parseInt(select.value);
  const player = squadData.find((p) => p.id === playerId);

  if (player && currentSlotForModal) {
    if (player.injured) {
      showToast("Este jugador tiene baja médica activa.", "error");
      return;
    }

    const prevAssignedId = slotAssignments[currentSlotForModal];
    slotAssignments[currentSlotForModal] = player.id;

    // Si el jugador anterior ya no está en ningún slot, pasa a suplente
    if (prevAssignedId && prevAssignedId !== player.id) {
      const stillAssigned = Object.values(slotAssignments).some((id) => id === prevAssignedId);
      const prevPlayer = squadData.find((p) => p.id === prevAssignedId || p.number === prevAssignedId);
      if (prevPlayer && !stillAssigned) prevPlayer.starter = false;
    }

    player.starter = true;

    saveData();
    saveSlotAssignments();
    updatePitchDisplay();
    renderSquadCallupList();
    showToast(`${player.name} (#${player.number}) asignado en ${currentSlotForModal}.`, "success");
  }
  closePlayerModal();
}

function autoLineup() {
  const groupFilter = document.getElementById("tacticalGroupSelect")?.value || "Todos";
  const available = squadData.filter((p) => {
    if (p.injured) return false;
    if (groupFilter !== "Todos" && p.group !== groupFilter) return false;
    return true;
  });

  if (available.length < 11) {
    showToast(`Plantilla insuficiente: se requieren al menos 11 disponibles (hay ${available.length}).`, "warning");
  }

  // Desmarcar a todos como titulares
  squadData.forEach((p) => { p.starter = false; });

  const assignedSet = new Set();
  const slots = Object.keys(slotAssignments);

  // 1. Asignar portero (preferencia: 'Portero' o 'POR')
  const gk = available.find((p) => p.position.toLowerCase().includes("porter") || p.position === "POR") || available[0];
  if (gk) {
    slotAssignments["GK"] = gk.id;
    gk.starter = true;
    assignedSet.add(gk.id);
  }

  // 2. Asignar resto de slots con los mejores disponibles
  const remaining = available.filter((p) => !assignedSet.has(p.id));
  let rIdx = 0;

  slots.forEach((slot) => {
    if (slot === "GK") return;
    if (rIdx < remaining.length) {
      const p = remaining[rIdx];
      slotAssignments[slot] = p.id;
      p.starter = true;
      assignedSet.add(p.id);
      rIdx++;
    }
  });

  saveData();
  saveSlotAssignments();
  updatePitchDisplay();
  renderSquadCallupList();
  showToast("11 Titular autocompletado con éxito.", "success");
}

function resetPitchPositions() {
  const formation = document.getElementById("formationSelect")?.value || "4-3-3";
  const config = FORMATIONS[formation];
  const pitch = document.getElementById("tacticalPitch");
  if (!pitch || !config) return;

  config.forEach((pos) => {
    const marker = pitch.querySelector(`[data-slot="${pos.slot}"]`);
    if (!marker) return;
    marker.style.top = pos.top;
    marker.style.left = pos.left;
  });

  savedPositions = {};
  try { localStorage.removeItem("laguna_pitch_positions"); } catch (e) {}

  updatePitchDisplay();
  showToast("Posiciones reglamentarias restablecidas.", "info");
}

function setSquadCallupFilter(filter, btn) {
  currentSquadFilter = filter;
  document.querySelectorAll(".tactical-filter-btn").forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  renderSquadCallupList();
}

function toggleStarterDirect(playerId, e) {
  if (e) e.stopPropagation();
  if (currentRole !== "dt") return;

  const player = squadData.find((p) => p.id === playerId);
  if (!player) return;

  if (player.injured) {
    showToast("No se puede alinear a un jugador en baja médica.", "error");
    return;
  }

  player.starter = !player.starter;

  if (!player.starter) {
    // Quitar de slotAssignments si estaba
    Object.keys(slotAssignments).forEach((slot) => {
      if (slotAssignments[slot] === player.id || slotAssignments[slot] === player.number) {
        delete slotAssignments[slot];
      }
    });
  } else {
    // Si se activa y hay algún slot vacío, asignarlo
    const slots = Object.keys(FORMATIONS[document.getElementById("formationSelect")?.value || "4-3-3"] || {});
    const emptySlot = slots.find((s) => !slotAssignments[s]);
    if (emptySlot) slotAssignments[emptySlot] = player.id;
  }

  saveData();
  saveSlotAssignments();
  updatePitchDisplay();
  renderSquadCallupList();
  showToast(`${player.name}: ${player.starter ? "Alineado como Titular" : "En Banquillo"}`, "info");
}

function saveLineup() {
  saveData();
  saveSlotAssignments();
  showToast("¡Alineación oficial y convocatoria publicadas exitosamente!", "success");
}

function renderSquadCallupList() {
  const container = document.getElementById("squadCallupList");
  if (!container) return;
  container.innerHTML = "";

  const groupFilter = document.getElementById("tacticalGroupSelect")?.value || "Todos";

  let filtered = squadData.filter((p) => {
    if (groupFilter !== "Todos" && p.group !== groupFilter) return false;
    if (currentSquadFilter === "titulares") return p.starter && !p.injured;
    if (currentSquadFilter === "suplentes") return !p.starter && !p.injured;
    if (currentSquadFilter === "lesionados") return p.injured;
    return true;
  });

  const availableCount = squadData.filter((p) => !p.injured && (groupFilter === "Todos" || p.group === groupFilter)).length;
  const rosterBadge = document.getElementById("rosterCountBadge");
  if (rosterBadge) rosterBadge.textContent = `${availableCount} Disponibles`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="text-center text-muted" style="padding: 2rem 1rem;">
        <i class="fa-solid fa-users-slash" style="font-size: 1.8rem; opacity: 0.5; margin-bottom: 0.5rem; display: block;"></i>
        <span style="font-size: 0.85rem;">Sin jugadores con este criterio.</span>
      </div>
    `;
    return;
  }

  // Ordenar: Titulares primero, luego por dorsal
  filtered
    .sort((a, b) => {
      if (a.starter !== b.starter) return a.starter ? -1 : 1;
      return (a.number || 0) - (b.number || 0);
    })
    .forEach((p) => {
      const item = document.createElement("div");
      item.className = `squad-player-item ${p.starter ? "is-starter" : ""}`;
      item.onclick = () => openProfileModal(p.id);

      let statusBadge = "";
      if (p.injured) {
        statusBadge = `<span class="badge badge-danger" style="font-size:0.68rem;"><i class="fa-solid fa-briefcase-medical"></i> BAJA</span>`;
      } else if (p.starter) {
        statusBadge = `
          <button class="badge badge-neon" onclick="toggleStarterDirect(${p.id}, event)" title="Clic para pasar a banquillo" style="cursor:pointer; border:none;">
            <i class="fa-solid fa-shirt"></i> TITULAR
          </button>
        `;
      } else {
        statusBadge = `
          <button class="badge" onclick="toggleStarterDirect(${p.id}, event)" title="Clic para alinear de titular" style="border-color:var(--border-strong); cursor:pointer; background:transparent; color:var(--text-muted);">
            SUPLENTE
          </button>
        `;
      }

      item.innerHTML = `
        <div style="display:flex; align-items:center; gap:0.75rem;">
          <img src="${p.photo || "LAGUNA.jpg"}" alt="${p.name}" style="width:34px; height:34px; border-radius:50%; object-fit:cover; border:1.5px solid ${p.starter ? "var(--accent-gold)" : "var(--border-glass)"};" />
          <div>
            <div style="font-weight:700; font-size:0.88rem; color:${p.injured ? "var(--accent-danger)" : "var(--text-main)"}">
              #${p.number} ${p.name}
            </div>
            <small class="text-muted" style="font-size:0.75rem;">${p.position} · ${p.group || "Sin Cat."}</small>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          ${statusBadge}
          <i class="fa-solid fa-chevron-right text-muted" style="font-size:0.7rem; opacity:0.6;"></i>
        </div>
      `;
      container.appendChild(item);
    });
}

let currentProfilePlayerId = null;

function openProfileModal(id) {
  const p = squadData.find((x) => x.id === id);
  if (!p) return;
  ensureRegFields(p);
  currentProfilePlayerId = id;

  // Foto
  const photoEl = document.getElementById("profilePhoto");
  if (photoEl) photoEl.src = p.photo || "LAGUNA.jpg";

  // Info básica
  const numEl = document.getElementById("profileNumber");
  if (numEl) numEl.textContent = p.number;

  const nameEl = document.getElementById("profileName");
  if (nameEl) nameEl.textContent = p.name;

  const posEl = document.getElementById("profilePosition");
  if (posEl) posEl.textContent = p.position + (p.positionAlt ? " / " + p.positionAlt : "");

  const badge = document.getElementById("profileStatusBadge");
  if (badge) {
    if (p.injured) {
      badge.className = "badge badge-danger";
      badge.textContent = "Baja Médica";
    } else {
      const sc = (p.regStatus || "Activo").toLowerCase();
      badge.className = `badge badge-status-${sc}`;
      badge.textContent = p.regStatus || "Activo";
    }
  }

  const groupBadge = document.getElementById("profileGroupBadge");
  if (groupBadge) groupBadge.textContent = p.group || "Sin Cat.";

  // Edad
  const ageBadge = document.getElementById("profileAgeBadge");
  if (ageBadge) {
    if (p.birthdate) {
      const bd = new Date(p.birthdate);
      const age = Math.floor((Date.now() - bd) / (365.25 * 24 * 60 * 60 * 1000));
      ageBadge.textContent = age + " años";
    } else {
      ageBadge.textContent = "— años";
    }
  }

  // Estadísticas
  const gEl = document.getElementById("profileGoals");
  const aEl = document.getElementById("profileAssists");
  const mEl = document.getElementById("profileMins");
  const cEl = document.getElementById("profileCards");

  if (gEl) gEl.textContent = p.goals || 0;
  if (aEl) aEl.textContent = p.assists || 0;
  if (mEl) mEl.textContent = (p.mins || 0) + "'";
  if (cEl) cEl.textContent = p.cards || 0;

  // Asistencia
  const attEl = document.getElementById("profileAttendancePct");
  if (attEl) attEl.textContent = (p.attendancePct || 0) + "%";

  // Pagos
  const payEl = document.getElementById("profilePaymentStatus");
  if (payEl) {
    const playerPays = paymentsData.filter(pay => pay.playerId === p.id);
    const unpaid = playerPays.filter(pay => pay.status !== "Pagado");
    if (unpaid.length > 0) {
      const total = unpaid.reduce((s, pay) => s + (pay.finalAmount || 0), 0);
      payEl.innerHTML = `<span style="color:var(--accent-danger); font-weight:700;">Adeudo: $${total.toLocaleString("es-MX")} MXN</span>`;
    } else {
      payEl.innerHTML = `<span style="color:var(--accent-neon); font-weight:700;">Al corriente ✓</span>`;
    }
  }

  // Documentación
  const docsEl = document.getElementById("profileDocs");
  if (docsEl) {
    const docList = [
      { key: "docActa", label: "Acta Nac." },
      { key: "docCURP", label: "CURP" },
      { key: "docMedico", label: "Cert. Médico" },
      { key: "docINE", label: "ID Tutor" },
      { key: "docEscolar", label: "Cert. Escolar" },
    ];
    docsEl.innerHTML = docList.map(d =>
      p[d.key]
        ? `<span class="badge badge-neon" style="font-size:0.7rem;"><i class="fa-solid fa-check"></i> ${d.label}</span>`
        : `<span class="badge badge-danger" style="font-size:0.7rem; opacity:0.75;"><i class="fa-solid fa-xmark"></i> ${d.label}</span>`
    ).join("");
  }

  // Contactos
  const contEl = document.getElementById("profileContacts");
  if (contEl) {
    contEl.innerHTML = (p.contacts || []).map((c, i) => `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:0.4rem 0; ${i>0?'border-top:1px solid var(--border-glass);':''}">
        <div style="font-size:0.85rem;">
          <i class="fa-solid fa-user-check text-primary"></i> ${c.relation}: <strong>${c.name}</strong>
          <span class="mono-text text-muted" style="font-size:0.75rem; margin-left:0.5rem;">${c.phone}</span>
        </div>
        <button class="btn-whatsapp-sm" onclick="openWADirect('${c.phone}','${p.name.replace(/'/g,"\\'")}')" title="WhatsApp">
          <i class="fa-brands fa-whatsapp"></i>
        </button>
      </div>
    `).join("");
  }

  document.getElementById("playerProfileModal").classList.remove("hidden");
}

function profileSendWA() {
  const p = squadData.find(x => x.id === currentProfilePlayerId);
  if (!p) return;
  ensureRegFields(p);
  const c = p.contacts[0];
  if (!c) return;
  const msg = encodeURIComponent(`*LAGUNA ATHLETIC*\n\nHola ${c.name}, te contactamos respecto a ${p.name} (#${p.number}).\n\n`);
  window.open(`https://wa.me/${cleanPhoneForWhatsApp(c.phone)}?text=${msg}`, "_blank");
}

function openWADirect(phone, playerName) {
  const cleaned = cleanPhoneForWhatsApp(phone);
  if (!cleaned) { showToast("Número no válido.", "error"); return; }
  window.open(`https://wa.me/${cleaned}?text=${encodeURIComponent('*LAGUNA ATHLETIC*\n\nHola, te contactamos de parte del club Laguna Athletic.\n')}`, "_blank");
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
let calView = "lista"; // 'lista' | 'mes'

function setCalView(view) {
  calView = view;
  document.getElementById("calViewListBtn")?.classList.toggle("active", view === "lista");
  document.getElementById("calViewMonthBtn")?.classList.toggle("active", view === "mes");
  renderCalendarEvents();
}

function renderCalendarEvents() {
  const grid = document.getElementById("calendarEventsGrid");
  if (!grid) return;

  const typeFilter = document.getElementById("calTypeFilter")?.value || "todos";
  const filteredEvents = typeFilter === "todos"
    ? calendarEvents
    : calendarEvents.filter(e => e.type === typeFilter);

  if (calView === "mes") {
    renderCalendarMonth(grid, filteredEvents);
  } else {
    renderCalendarList(grid, filteredEvents);
  }
}

function renderCalendarList(grid, events) {
  grid.innerHTML = "";
  grid.className = "calendar-grid";

  if (events.length === 0) {
    grid.innerHTML = `<div class="text-center text-muted" style="padding:2rem; grid-column: 1/-1;"><i class="fa-solid fa-calendar-xmark" style="font-size:2rem; margin-bottom: 0.5rem; display:block;"></i><p>Sin eventos programados para este filtro.</p></div>`;
    return;
  }

  events
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

      const deleteBtn = isDT
        ? `<button class="btn btn-ghost" style="padding:0.2rem 0.5rem; font-size:0.75rem; color:var(--accent-danger);" onclick="deleteCalendarEvent(${ev.id})" title="Eliminar evento"><i class="fa-solid fa-trash"></i></button>`
        : "";

      card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div class="event-date">${dFormatted} - ${ev.time}</div>
        ${deleteBtn}
      </div>
      <div class="event-title">${ev.title}</div>
      <div class="subtitle-text"><i class="fa-solid fa-location-dot"></i> ${ev.location}</div>
      ${resultHtml}
    `;
      grid.appendChild(card);
    });
}

function renderCalendarMonth(grid, events) {
  grid.className = "calendar-month-grid";
  grid.innerHTML = "";

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay(); // 0=Dom

  const monthName = today.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  grid.innerHTML = `
    <div class="cal-month-header">
      <span style="text-transform:capitalize; font-size:1.05rem; font-weight:700; color:var(--accent-gold);">
        <i class="fa-regular fa-calendar-days"></i> ${monthName}
      </span>
    </div>
    <div class="cal-month-dow-row">
      ${["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"].map(d => `<div class="cal-dow-label">${d}</div>`).join("")}
    </div>
    <div class="cal-month-days" id="calMonthDays"></div>
  `;

  const daysContainer = grid.querySelector("#calMonthDays");
  for (let i = 0; i < startDow; i++) {
    daysContainer.innerHTML += `<div class="cal-day cal-day-empty"></div>`;
  }

  const todayStr = today.toISOString().split("T")[0];

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    const dayEvents = events.filter(e => e.date === dateStr);
    const isToday = dateStr === todayStr;

    let dotHtml = "";
    dayEvents.forEach(e => {
      const color = e.type === "partido" ? "var(--accent-danger)" : e.type === "entrenamiento" ? "var(--accent-neon)" : "var(--accent-gold)";
      dotHtml += `<span class="cal-day-dot" style="background:${color};"></span>`;
    });

    daysContainer.innerHTML += `
      <div class="cal-day ${isToday ? "cal-day-today" : ""} ${dayEvents.length > 0 ? "cal-day-has-event" : ""}" title="${dayEvents.map(e=>e.title).join(", ")}">
        <div class="cal-day-num">${d}</div>
        <div class="cal-day-dots">${dotHtml}</div>
        ${dayEvents.length > 0 ? `<div class="cal-day-evtname">${dayEvents[0].title.substring(0,10)}${dayEvents[0].title.length > 10 ? "…" : ""}</div>` : ""}
      </div>
    `;
  }
}

function deleteCalendarEvent(eventId) {
  const ev = calendarEvents.find(e => e.id === eventId);
  if (!ev) return;
  showConfirmModal(
    `¿Eliminar "${ev.title}"?`,
    `Se eliminará este evento del calendario permanentemente.`,
    "Eliminar",
    "btn-danger-style",
    () => {
      calendarEvents = calendarEvents.filter(e => e.id !== eventId);
      saveData();
      renderCalendarEvents();
      if (typeof renderDashboard === "function") renderDashboard();
      showToast("Evento eliminado del calendario.", "info");
    }
  );
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
        <i class="fa-solid fa-folder-open" style="font-size: 2rem; margin-bottom: 0.5rem; color: var(--accent-primary); opacity: 0.6;"></i>
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
// FORMACIONES TÁCTICAS DINÁMICAS
// ==========================================================================
const FORMATIONS = {
  "4-3-3": [
    { slot: "GK",  top: "50%", left: "8%",  num: 1,  label: "POR" },
    { slot: "LB",  top: "15%", left: "25%", num: 3,  label: "LTI" },
    { slot: "CB1", top: "35%", left: "22%", num: 4,  label: "DFC" },
    { slot: "CB2", top: "65%", left: "22%", num: 5,  label: "DFC" },
    { slot: "RB",  top: "85%", left: "25%", num: 2,  label: "LTD" },
    { slot: "MC1", top: "25%", left: "50%", num: 8,  label: "MC" },
    { slot: "MCD", top: "50%", left: "45%", num: 6,  label: "MCD" },
    { slot: "MC2", top: "75%", left: "50%", num: 10, label: "MCO" },
    { slot: "EI",  top: "20%", left: "75%", num: 11, label: "EI" },
    { slot: "DC",  top: "50%", left: "82%", num: 9,  label: "DC" },
    { slot: "ED",  top: "80%", left: "75%", num: 7,  label: "ED" },
  ],
  "4-4-2": [
    { slot: "GK",  top: "50%", left: "8%",  num: 1,  label: "POR" },
    { slot: "LB",  top: "10%", left: "25%", num: 3,  label: "LTI" },
    { slot: "CB1", top: "33%", left: "22%", num: 4,  label: "DFC" },
    { slot: "CB2", top: "67%", left: "22%", num: 5,  label: "DFC" },
    { slot: "RB",  top: "90%", left: "25%", num: 2,  label: "LTD" },
    { slot: "MC1", top: "15%", left: "50%", num: 7,  label: "MI" },
    { slot: "MCD", top: "38%", left: "48%", num: 6,  label: "MC" },
    { slot: "MC2", top: "62%", left: "48%", num: 8,  label: "MC" },
    { slot: "EI",  top: "85%", left: "50%", num: 11, label: "MD" },
    { slot: "DC",  top: "35%", left: "80%", num: 9,  label: "DC" },
    { slot: "ED",  top: "65%", left: "80%", num: 10, label: "DC" },
  ],
  "4-2-3-1": [
    { slot: "GK",  top: "50%", left: "8%",  num: 1,  label: "POR" },
    { slot: "LB",  top: "12%", left: "25%", num: 3,  label: "LTI" },
    { slot: "CB1", top: "35%", left: "22%", num: 4,  label: "DFC" },
    { slot: "CB2", top: "65%", left: "22%", num: 5,  label: "DFC" },
    { slot: "RB",  top: "88%", left: "25%", num: 2,  label: "LTD" },
    { slot: "MCD", top: "38%", left: "42%", num: 6,  label: "MCD" },
    { slot: "MC1", top: "62%", left: "42%", num: 8,  label: "MCD" },
    { slot: "MC2", top: "50%", left: "62%", num: 10, label: "MCO" },
    { slot: "EI",  top: "20%", left: "62%", num: 11, label: "MI" },
    { slot: "ED",  top: "80%", left: "62%", num: 7,  label: "MD" },
    { slot: "DC",  top: "50%", left: "82%", num: 9,  label: "DC" },
  ],
  "3-5-2": [
    { slot: "GK",  top: "50%", left: "8%",  num: 1,  label: "POR" },
    { slot: "CB1", top: "25%", left: "22%", num: 4,  label: "DFC" },
    { slot: "CB2", top: "50%", left: "20%", num: 5,  label: "LIB" },
    { slot: "RB",  top: "75%", left: "22%", num: 6,  label: "DFC" },
    { slot: "LB",  top: "10%", left: "48%", num: 3,  label: "CARI" },
    { slot: "MCD", top: "35%", left: "46%", num: 8,  label: "MC" },
    { slot: "MC1", top: "50%", left: "44%", num: 7,  label: "MCD" },
    { slot: "MC2", top: "65%", left: "46%", num: 10, label: "MCO" },
    { slot: "EI",  top: "90%", left: "48%", num: 11, label: "CARD" },
    { slot: "DC",  top: "35%", left: "78%", num: 9,  label: "DC" },
    { slot: "ED",  top: "65%", left: "78%", num: 2,  label: "DC" },
  ],
  "5-3-2": [
    { slot: "GK",  top: "50%", left: "8%",  num: 1,  label: "POR" },
    { slot: "LB",  top: "10%", left: "25%", num: 3,  label: "LTI" },
    { slot: "CB1", top: "28%", left: "22%", num: 4,  label: "DFC" },
    { slot: "CB2", top: "50%", left: "20%", num: 5,  label: "LIB" },
    { slot: "RB",  top: "72%", left: "22%", num: 2,  label: "DFC" },
    { slot: "EI",  top: "90%", left: "25%", num: 11, label: "LTD" },
    { slot: "MCD", top: "25%", left: "50%", num: 8,  label: "MC" },
    { slot: "MC1", top: "50%", left: "48%", num: 6,  label: "MCD" },
    { slot: "MC2", top: "75%", left: "50%", num: 10, label: "MC" },
    { slot: "DC",  top: "35%", left: "80%", num: 9,  label: "DC" },
    { slot: "ED",  top: "65%", left: "80%", num: 7,  label: "DC" },
  ],
};

function changeFormation() {
  const sel = document.getElementById("formationSelect");
  if (!sel) return;
  const formation = sel.value;
  const config = FORMATIONS[formation];
  if (!config) return;

  const pitch = document.getElementById("tacticalPitch");
  if (!pitch) return;

  config.forEach((pos) => {
    const marker = pitch.querySelector(`[data-slot="${pos.slot}"]`);
    if (!marker) return;
    marker.style.top = pos.top;
    marker.style.left = pos.left;
    const shirt = marker.querySelector(".marker-shirt");
    if (shirt && !shirt.dataset.customNumber) {
      shirt.textContent = pos.num;
    }
  });

  savedPositions = {};
  try {
    localStorage.removeItem("laguna_pitch_positions");
  } catch (e) {}

  updatePitchDisplay();
  showToast(`Esquema táctico cambiado a ${formation}.`, "success");
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
        <button class="reg-action-btn doc" title="Ver Credencial Oficial con QR" onclick="openCredentialModal(${p.id})" style="color: var(--accent-gold); border-color: rgba(245, 158, 11, 0.4);">
          <i class="fa-solid fa-id-card"></i>
        </button>
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
        <button class="reg-action-btn doc" title="Ver Credencial Oficial con QR" onclick="openCredentialModal(${p.id})" style="color: var(--accent-gold); border-color: rgba(245, 158, 11, 0.4);">
          <i class="fa-solid fa-id-card"></i> Credencial
        </button>
        <button class="reg-action-btn doc" title="Ver Expediente / Descargar" onclick="openDocModal(${p.id})">
          <i class="fa-solid fa-folder-open"></i> Expediente
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

  showConfirmModal(
    `¿Eliminar a ${p.name}?`,
    `Se dará de baja permanentemente a ${p.name} (#${p.number}) del plantel oficial.`,
    "Eliminar Jugador",
    "btn-danger-style",
    () => {
      squadData = squadData.filter((x) => x.id !== id);
      injuredData = injuredData.filter((x) => x.playerId !== id);
      saveData();
      showToast(`${p.name} eliminado de la plantilla.`, "warning");
      renderRegTable();
      renderSquadCallupList();
      populateQuickPlayerSelect();
      populatePaymentPlayerSelect();
      updatePaymentSummaryStats();
      if (typeof renderDashboard === "function") renderDashboard();
    }
  );
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

// ==========================================================================
// MÓDULO: DASHBOARD HOME
// ==========================================================================
function renderDashboard() {
  const totalPlayers = squadData.length;
  const presentToday = squadData.filter(p => p.status === "Presente").length;
  const pct = totalPlayers > 0 ? Math.round((presentToday / totalPlayers) * 100) : 0;
  const pendingPayments = paymentsData.filter(p => p.status !== "Pagado").reduce((s, p) => s + (p.finalAmount || 0), 0);
  const injuredCount = injuredData.length;

  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setEl("dashTotalPlayers", totalPlayers);
  setEl("dashPresentToday", presentToday);
  setEl("dashAttendancePct", pct + "%");
  setEl("dashPendingPayments", "$" + pendingPayments.toLocaleString("es-MX", { minimumFractionDigits: 0 }));
  setEl("dashInjuredCount", injuredCount);

  // Próximo evento
  const today = new Date().toISOString().split("T")[0];
  const nextEvent = calendarEvents
    .filter(e => e.date >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  if (nextEvent) {
    const badgeEl = document.getElementById("dashEventBadge");
    const titleEl = document.getElementById("dashEventTitle");
    const subEl = document.getElementById("dashEventSub");
    const dateEl = document.getElementById("dashEventDate");

    if (badgeEl) badgeEl.textContent = nextEvent.type === "partido" ? "⚽ PARTIDO PRÓXIMO" : nextEvent.type === "entrenamiento" ? "🏃 ENTRENAMIENTO" : "📅 EVENTO";
    if (titleEl) titleEl.textContent = nextEvent.title;
    if (subEl) subEl.textContent = `${nextEvent.location} · ${nextEvent.time || "Ver horario"}`;

    const d = new Date(nextEvent.date + "T00:00:00");
    const daysDiff = Math.ceil((d - new Date(today)) / 86400000);
    if (dateEl) dateEl.textContent = daysDiff === 0 ? "¡HOY!" : daysDiff === 1 ? "Mañana" : `En ${daysDiff} días (${d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })})`;
  } else {
    setEl("dashEventTitle", "Sin eventos próximos programados");
    setEl("dashEventSub", "Agrega fechas desde el módulo Calendario");
    setEl("dashEventDate", "—");
  }

  // Top 5 racha
  const tbody = document.getElementById("dashTopAttendance");
  if (tbody) {
    const sorted = [...squadData].sort((a, b) => (b.attendancePct || 0) - (a.attendancePct || 0)).slice(0, 5);
    tbody.innerHTML = sorted.map((p, i) => `
      <tr>
        <td class="text-muted">#${i + 1}</td>
        <td><strong>${p.name}</strong><br><small class="text-muted">${p.group || p.position}</small></td>
        <td class="text-primary" style="font-weight:700;">${p.attendancePct || 0}%</td>
        <td><span class="badge badge-neon" style="font-size:0.7rem;">${p.streak || "1 A"}</span></td>
      </tr>
    `).join("");
  }

  renderDashAlerts();
}

function renderDashAlerts() {
  const cont = document.getElementById("dashAlerts");
  if (!cont) return;
  const alerts = [];
  const today = new Date().toISOString().split("T")[0];

  if (injuredData.length > 0) {
    alerts.push({
      type: "danger",
      icon: "fa-briefcase-medical",
      msg: `${injuredData.length} jugador(es) en enfermería: ${injuredData.map(i => i.player).join(", ")}.`,
    });
  }

  const unpaidCount = paymentsData.filter(pay => pay.status !== "Pagado").length;
  if (unpaidCount > 0) {
    alerts.push({
      type: "warning",
      icon: "fa-coins",
      msg: `${unpaidCount} registro(s) con colegiaturas o cuotas pendientes de pago.`,
    });
  }

  const soon = calendarEvents.filter(e => {
    const diff = (new Date(e.date + "T00:00:00") - new Date(today + "T00:00:00")) / 86400000;
    return diff >= 0 && diff <= 3;
  });
  if (soon.length > 0) {
    soon.forEach(e => {
      const d = new Date(e.date + "T00:00:00");
      const daysDiff = Math.round((d - new Date(today + "T00:00:00")) / 86400000);
      const when = daysDiff === 0 ? "¡HOY!" : daysDiff === 1 ? "Mañana" : `En ${daysDiff} días`;
      alerts.push({
        type: "info",
        icon: "fa-calendar-check",
        msg: `${when}: ${e.title} (${e.location}) a las ${e.time || "–"}.`,
      });
    });
  }

  if (alerts.length === 0) {
    cont.innerHTML = `<div class="dash-alert dash-alert-success"><i class="fa-solid fa-circle-check"></i> <span>Todo al día. No hay alertas críticas para hoy.</span></div>`;
    return;
  }

  cont.innerHTML = alerts.map(a => `
    <div class="dash-alert dash-alert-${a.type}">
      <i class="fa-solid ${a.icon}"></i>
      <span>${a.msg}</span>
    </div>
  `).join("");
}

function confirmResetAttendance() {
  showConfirmModal(
    "¿Resetear Asistencia del Día?",
    "Esto marcará a todo el plantel como 'Ausente' y limpiará las horas de escaneo de hoy. ¿Deseas continuar?",
    "Resetear Asistencia",
    "btn-danger-style",
    () => {
      squadData.forEach(p => {
        p.status = "Ausente";
        p.checkinTime = "-";
      });
      saveData();
      renderAttendanceTable();
      updateChartData();
      renderDashboard();
      showToast("Asistencia del día reiniciada.", "info");
    }
  );
}

// ==========================================================================
// MODAL DE CONFIRMACIÓN PERSONALIZADO
// ==========================================================================
let confirmCallback = null;

function showConfirmModal(title, message, confirmLabel, confirmClass, callback) {
  confirmCallback = callback;
  const modal = document.getElementById("customConfirmModal");
  const titleEl = document.getElementById("confirmModalTitle");
  const msgEl = document.getElementById("confirmModalMessage");
  const btn = document.getElementById("confirmModalBtn");

  if (titleEl) titleEl.textContent = title;
  if (msgEl) msgEl.textContent = message;
  if (btn) {
    btn.textContent = confirmLabel || "Confirmar";
    btn.className = `btn btn-primary ${confirmClass || ""}`;
    if (confirmClass === "btn-danger-style") {
      btn.style.background = "var(--accent-danger)";
      btn.style.borderColor = "var(--accent-danger)";
    } else {
      btn.style.background = "";
      btn.style.borderColor = "";
    }
  }
  if (modal) modal.classList.remove("hidden");
}

function closeConfirmModal() {
  const modal = document.getElementById("customConfirmModal");
  if (modal) modal.classList.add("hidden");
  confirmCallback = null;
}

function executeConfirmModal() {
  const cb = confirmCallback;
  closeConfirmModal();
  if (typeof cb === "function") cb();
}

// ==========================================================================
// MÓDULO: EXPORTACIÓN Y REPORTE OFICIAL DE ASISTENCIA (CON LOGO Y NAVEGACIÓN)
// ==========================================================================
function openAttendanceReportModal() {
  renderAttendanceReportTable();
  document.getElementById("attendanceReportModal")?.classList.remove("hidden");
}

function closeAttendanceReportModal() {
  document.getElementById("attendanceReportModal")?.classList.add("hidden");
}

function renderAttendanceReportTable() {
  const tbody = document.getElementById("attReportTableBody");
  const statsEl = document.getElementById("attReportStatsSummary");
  const dateSub = document.getElementById("attReportDateSub");
  const searchVal = (document.getElementById("attReportSearchInput")?.value || "").toLowerCase().trim();
  const groupFilter = document.getElementById("attReportGroupFilter")?.value || "Todos";

  if (!tbody) return;
  tbody.innerHTML = "";

  const now = new Date();
  const dateStr = now.toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  if (dateSub) dateSub.textContent = `${dateStr} · Sesión Laguna Athletic 2026`;

  const filtered = squadData.filter((p) => {
    ensureRegFields(p);
    const matchGroup = groupFilter === "Todos" || p.group === groupFilter;
    const matchSearch = !searchVal || 
      p.name.toLowerCase().includes(searchVal) || 
      String(p.number).includes(searchVal) || 
      p.position.toLowerCase().includes(searchVal);
    return matchGroup && matchSearch;
  });

  const presentCount = filtered.filter(p => p.status === "Presente").length;
  const justCount = filtered.filter(p => p.status === "Justificado").length;
  const absentCount = filtered.filter(p => p.status !== "Presente" && p.status !== "Justificado").length;
  const pct = filtered.length > 0 ? Math.round((presentCount / filtered.length) * 100) : 0;

  if (statsEl) {
    statsEl.innerHTML = `
      <strong>${presentCount}</strong> Presentes · 
      <strong>${justCount}</strong> Justificados · 
      <strong>${absentCount}</strong> Ausentes · 
      <span style="color:var(--accent-neon); font-weight:bold;">${pct}% Asistencia</span> 
      <span class="text-muted">(${filtered.length} jugadores listados)</span>
    `;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted" style="padding:2rem;">Sin registros con ese filtro.</td></tr>`;
    return;
  }

  filtered
    .sort((a, b) => (a.number || 0) - (b.number || 0))
    .forEach((p) => {
      const statusColor = p.status === "Presente" ? "var(--accent-neon)" : p.status === "Justificado" ? "var(--accent-gold)" : "var(--accent-danger)";
      tbody.innerHTML += `
        <tr>
          <td class="mono-text text-primary" style="font-weight:700;">#${p.number}</td>
          <td>
            <div style="display:flex; align-items:center; gap:0.6rem;">
              <img src="${p.photo || "LAGUNA.jpg"}" alt="${p.name}" style="width:28px; height:28px; border-radius:50%; object-fit:cover; border:1px solid var(--border-glass);" />
              <strong>${p.name}</strong>
            </div>
          </td>
          <td class="text-muted">${p.position}</td>
          <td><span class="badge badge-outline" style="font-size:0.75rem;">${p.group || "Sin Cat."}</span></td>
          <td><span style="color:${statusColor}; font-weight:bold;"><i class="fa-solid fa-circle" style="font-size:0.55rem; margin-right:4px;"></i>${p.status}</span></td>
          <td class="mono-text text-muted">${p.checkinTime || "—"}</td>
        </tr>
      `;
    });
}

function printAttendanceReportArea() {
  showToast("Generando vista de impresión oficial...", "info");
  setTimeout(() => {
    window.print();
  }, 250);
}

function exportAttendancePrint() {
  openAttendanceReportModal();
}

function exportPaymentsPrint() {
  const today = new Date().toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  let total = 0;
  const rows = paymentsData.map(p => {
    if (p.status === "Pagado") total += (p.finalAmount || 0);
    return `
      <tr>
        <td><strong>${p.folio}</strong></td>
        <td>${p.date}</td>
        <td>${p.playerName}</td>
        <td>${p.concept}</td>
        <td>${p.method}</td>
        <td style="font-weight:bold;">$${(p.finalAmount || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</td>
        <td style="color:${p.status === "Pagado" ? "#16a34a" : "#d97706"}; font-weight:bold;">${p.status}</td>
      </tr>
    `;
  }).join("");

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Reporte Financiero - Laguna Athletic</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 25px; color: #1e293b; }
    .header-box { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 15px; }
    .header-left { display: flex; align-items: center; gap: 12px; }
    .club-logo { width: 55px; height: 55px; border-radius: 50%; border: 2px solid #f59e0b; }
    h1 { font-size: 1.35rem; margin: 0; color: #1e3a8a; }
    p { color: #64748b; font-size: 0.85rem; margin: 2px 0 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; font-size: 0.85rem; }
    th { background: #f1f5f9; font-weight: 700; color: #334155; }
    tr:nth-child(even) { background: #f8fafc; }
    .total-row td { font-weight:bold; background: #ecfdf5; border-top: 2px solid #10b981; }
    .footer { margin-top: 2.5rem; font-size: 0.75rem; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 0.75rem; }
  </style></head><body>
  <div class="header-box">
    <div class="header-left">
      <img src="LAGUNA.jpg" alt="Logo" class="club-logo" />
      <div>
        <h1>LAGUNA ATHLETIC CLUB</h1>
        <p>REPORTE GENERAL DE COBRANZA Y ESTADO FINANCIERO · 2026</p>
      </div>
    </div>
    <div style="text-align:right;"><span style="background:#1e3a8a; color:#fff; padding:3px 8px; border-radius:4px; font-size:0.75rem; font-weight:bold;">FINANZAS</span><p style="font-size:0.8rem; color:#64748b; margin-top:3px;">${today}</p></div>
  </div>
  <p>${paymentsData.length} movimientos registrados · Total Recaudado: <strong>$${total.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN</strong></p>
  <table>
    <thead><tr><th>Folio</th><th>Fecha</th><th>Alumno / Familia</th><th>Concepto</th><th>Método</th><th>Monto Neto</th><th>Estado</th></tr></thead>
    <tbody>${rows}
    <tr class="total-row"><td colspan="5">TOTAL CONFIRMADO</td><td>$${total.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN</td><td></td></tr>
    </tbody>
  </table>
  <div class="footer">Laguna Athletic 2026 · Administración y Finanzas · Impreso el ${new Date().toLocaleString("es-ES")}</div>
  </body></html>`;

  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 400);
  }
}

// ==========================================================================
// MÓDULO: ESCÁNER QR ULTRA FLUIDO (60 FPS + GPU ACCELERATED)
// ==========================================================================
let cameraStream = null;
let cameraScanLoopActive = false;
let currentFacingMode = "environment"; // 'environment' (trasera) o 'user' (frontal)
let lastScannedCode = null;
let lastScanTime = 0;
let barcodeDetectorInstance = null;

// Inicializar BarcodeDetector si está soportado nativamente por el navegador
if ("BarcodeDetector" in window) {
  try {
    barcodeDetectorInstance = new BarcodeDetector({ formats: ["qr_code"] });
  } catch (e) {}
}

function playSuccessBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime); // Tono A5
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {}
}

function toggleQRScannerMode(mode) {
  const camBtn = document.getElementById("qrModeCamBtn");
  const simBtn = document.getElementById("qrModeSimBtn");
  const camCont = document.getElementById("qrCameraContainer");
  const simCont = document.getElementById("qrSimContainer");

  if (mode === "cam") {
    if (camBtn) camBtn.classList.add("active");
    if (simBtn) simBtn.classList.remove("active");
    if (camCont) camCont.classList.remove("hidden");
    if (simCont) simCont.classList.add("hidden");
  } else {
    if (simBtn) simBtn.classList.add("active");
    if (camBtn) camBtn.classList.remove("active");
    if (simCont) simCont.classList.remove("hidden");
    if (camCont) camCont.classList.add("hidden");
    stopCameraScanner();
  }
}

async function startCameraScanner() {
  stopCameraScanner();

  const video = document.getElementById("qrLiveVideo");
  const placeholder = document.getElementById("qrCameraPlaceholder");
  const overlay = document.getElementById("qrScannerOverlay");
  const activeBar = document.getElementById("qrCameraActiveBar");
  const statusPill = document.getElementById("qrStatusPill");

  if (!video) return;

  if (statusPill) statusPill.innerHTML = `<span class="pulse-dot"></span> Conectando cámara...`;

  const constraints = {
    audio: false,
    video: {
      facingMode: { ideal: currentFacingMode },
      width: { ideal: 1280, min: 640 },
      height: { ideal: 720, min: 480 },
    },
  };

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = cameraStream;
    video.setAttribute("playsinline", "true");

    await video.play();

    cameraScanLoopActive = true;
    if (placeholder) placeholder.classList.add("hidden");
    if (overlay) overlay.classList.remove("hidden");
    if (activeBar) activeBar.classList.remove("hidden");
    if (statusPill) statusPill.innerHTML = `<span class="pulse-dot"></span> Buscando credencial en el visor...`;

    showToast("Cámara conectada en vivo.", "info");
    requestAnimationFrame(scanVideoFrame);
  } catch (err) {
    console.warn("Error con cámara requerida, probando configuración básica:", err);
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      video.srcObject = cameraStream;
      video.setAttribute("playsinline", "true");
      await video.play();

      cameraScanLoopActive = true;
      if (placeholder) placeholder.classList.add("hidden");
      if (overlay) overlay.classList.remove("hidden");
      if (activeBar) activeBar.classList.remove("hidden");
      if (statusPill) statusPill.innerHTML = `<span class="pulse-dot"></span> Buscando credencial...`;

      showToast("Cámara activada.", "info");
      requestAnimationFrame(scanVideoFrame);
    } catch (err2) {
      console.error("No se pudo iniciar la cámara:", err2);
      showToast("No se pudo acceder a la cámara. Revisa los permisos en tu navegador.", "error");
      stopCameraScanner();
    }
  }
}

async function flipCamera() {
  currentFacingMode = currentFacingMode === "environment" ? "user" : "environment";
  showToast(`Cambiando a cámara ${currentFacingMode === "environment" ? "trasera" : "frontal"}...`, "info");
  await startCameraScanner();
}

function stopCameraScanner() {
  cameraScanLoopActive = false;

  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
  }

  const video = document.getElementById("qrLiveVideo");
  if (video) video.srcObject = null;

  const placeholder = document.getElementById("qrCameraPlaceholder");
  const overlay = document.getElementById("qrScannerOverlay");
  const activeBar = document.getElementById("qrCameraActiveBar");

  if (placeholder) placeholder.classList.remove("hidden");
  if (overlay) overlay.classList.add("hidden");
  if (activeBar) activeBar.classList.add("hidden");
}

async function scanVideoFrame() {
  if (!cameraScanLoopActive) return;

  const video = document.getElementById("qrLiveVideo");
  const canvas = document.getElementById("qrScanCanvas");

  if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
    const now = Date.now();

    // 1. Intentar con BarcodeDetector nativo (GPU acelerada a 60fps)
    if (barcodeDetectorInstance) {
      try {
        const barcodes = await barcodeDetectorInstance.detect(video);
        if (barcodes && barcodes.length > 0) {
          const rawVal = barcodes[0].rawValue;
          if (rawVal && (rawVal !== lastScannedCode || now - lastScanTime > 2200)) {
            lastScannedCode = rawVal;
            lastScanTime = now;
            handleScannedQRCode(rawVal);
          }
        }
      } catch (e) {}
    } else if (typeof jsQR !== "undefined" && canvas) {
      // 2. Fallback a jsQR con canvas
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code && code.data) {
          if (code.data !== lastScannedCode || now - lastScanTime > 2200) {
            lastScannedCode = code.data;
            lastScanTime = now;
            handleScannedQRCode(code.data);
          }
        }
      }
    }
  }

  if (cameraScanLoopActive) {
    requestAnimationFrame(scanVideoFrame);
  }
}

function handleScannedQRCode(qrText) {
  if (!qrText) return;
  
  // Formatos soportados: "LAGUNA-10", "ID:10", "10", o JSON
  let playerId = null;

  if (qrText.startsWith("LAGUNA-")) {
    playerId = parseInt(qrText.replace("LAGUNA-", ""));
  } else if (qrText.startsWith("ID:")) {
    playerId = parseInt(qrText.replace("ID:", ""));
  } else {
    playerId = parseInt(qrText);
  }

  const player = squadData.find((p) => p.id === playerId || p.number === playerId);

  const statusPill = document.getElementById("qrStatusPill");

  if (!player) {
    if (statusPill) {
      statusPill.innerHTML = `<span style="color:var(--accent-danger);"><i class="fa-solid fa-xmark"></i> QR no reconocido (${qrText})</span>`;
      setTimeout(() => {
        if (statusPill && cameraScanLoopActive) statusPill.innerHTML = `<span class="pulse-dot"></span> Buscando credencial...`;
      }, 2000);
    }
    showToast(`Código QR no reconocido: "${qrText}".`, "warning");
    return;
  }

  if (player.status === "Presente") {
    if (statusPill) {
      statusPill.innerHTML = `<span style="color:var(--accent-gold);"><i class="fa-solid fa-check"></i> ${player.name} ya registrado</span>`;
      setTimeout(() => {
        if (statusPill && cameraScanLoopActive) statusPill.innerHTML = `<span class="pulse-dot"></span> Buscando credencial...`;
      }, 2000);
    }
    showToast(`${player.name} (#${player.number}) ya tiene asistencia hoy.`, "info");
    return;
  }

  const now = new Date();
  const timeStr = now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

  player.status = "Presente";
  player.checkinTime = timeStr;
  recalculateAttendancePct();
  saveData();

  playSuccessBeep();

  if (statusPill) {
    statusPill.innerHTML = `<span style="color:var(--accent-neon); font-weight:bold;"><i class="fa-solid fa-circle-check"></i> ¡Asistencia: ${player.name}!</span>`;
    setTimeout(() => {
      if (statusPill && cameraScanLoopActive) statusPill.innerHTML = `<span class="pulse-dot"></span> Buscando credencial...`;
    }, 2500);
  }

  const alertBox = document.getElementById("lastCheckinAlert");
  if (alertBox) {
    document.getElementById("lastCheckinText").innerText = `✓ Asistencia confirmada: #${player.number} ${player.name} (${timeStr})`;
    alertBox.classList.remove("hidden");
    setTimeout(() => alertBox.classList.add("hidden"), 4000);
  }

  renderAttendanceTable();
  renderRankingTable();
  updateChartData();
  if (typeof renderDashboard === "function") renderDashboard();

  showToast(`¡Asistencia de ${player.name} registrada con éxito!`, "success");
}

// ==========================================================================
// MÓDULO: CREDENCIALES OFICIALES CON CÓDIGO QR
// ==========================================================================
let currentCredentialPlayer = null;

function openCredentialModal(playerId) {
  const p = squadData.find(x => x.id === playerId);
  if (!p) return;
  ensureRegFields(p);
  currentCredentialPlayer = p;

  const photoEl = document.getElementById("credPhoto");
  if (photoEl) photoEl.src = p.photo || "LAGUNA.jpg";

  const numEl = document.getElementById("credNumber");
  if (numEl) numEl.textContent = `#${p.number}`;

  const nameEl = document.getElementById("credName");
  if (nameEl) nameEl.textContent = p.name;

  const posEl = document.getElementById("credPosition");
  if (posEl) posEl.textContent = p.position;

  const groupEl = document.getElementById("credGroup");
  if (groupEl) groupEl.textContent = p.group || "Plantel Oficial";

  const idCodeEl = document.getElementById("credIdCode");
  if (idCodeEl) idCodeEl.textContent = `LA-2026-${String(p.id).padStart(3, "0")}`;

  // Generar QR interactivo
  const qrContainer = document.getElementById("credQRCode");
  if (qrContainer) {
    qrContainer.innerHTML = "";
    if (typeof QRCode !== "undefined") {
      new QRCode(qrContainer, {
        text: `LAGUNA-${p.id}`,
        width: 66,
        height: 66,
        colorDark: "#0b132b",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M
      });
    }
  }

  document.getElementById("playerCredentialModal")?.classList.remove("hidden");
}

function openCredentialFromProfile() {
  if (currentProfilePlayerId) {
    openCredentialModal(currentProfilePlayerId);
  }
}

function closeCredentialModal() {
  document.getElementById("playerCredentialModal")?.classList.add("hidden");
}

function openAllCredentialsModal() {
  renderAllCredentialsGrid();
  document.getElementById("allCredentialsModal")?.classList.remove("hidden");
}

function closeAllCredentialsModal() {
  document.getElementById("allCredentialsModal")?.classList.add("hidden");
}

function renderAllCredentialsGrid() {
  const container = document.getElementById("allCredentialsGrid");
  const countText = document.getElementById("allCredCountText");
  const searchVal = (document.getElementById("allCredSearchInput")?.value || "").toLowerCase().trim();
  const groupFilter = document.getElementById("allCredGroupFilter")?.value || "Todos";

  if (!container) return;
  container.innerHTML = "";

  const filtered = squadData.filter((p) => {
    ensureRegFields(p);
    const matchesGroup = groupFilter === "Todos" || p.group === groupFilter;
    const matchesSearch = !searchVal || 
      p.name.toLowerCase().includes(searchVal) || 
      String(p.number).includes(searchVal) || 
      (p.tutorName && p.tutorName.toLowerCase().includes(searchVal)) ||
      p.position.toLowerCase().includes(searchVal);
    return matchesGroup && matchesSearch;
  });

  if (countText) {
    countText.textContent = `Mostrando ${filtered.length} de ${squadData.length} credenciales`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="text-center text-muted" style="padding: 3rem 1rem; grid-column: 1 / -1;">
        <i class="fa-solid fa-id-card-clip" style="font-size: 2.2rem; opacity: 0.4; margin-bottom: 0.5rem; display: block;"></i>
        <p style="font-size: 0.9rem;">No se encontraron credenciales con los filtros seleccionados.</p>
      </div>
    `;
    return;
  }

  filtered.forEach((p) => {
    const item = document.createElement("div");
    item.className = "cred-archive-item";
    
    item.innerHTML = `
      <div style="display: flex; gap: 0.75rem; align-items: center;">
        <div style="position: relative; flex-shrink: 0;">
          <img src="${p.photo || "LAGUNA.jpg"}" alt="${p.name}" style="width: 58px; height: 70px; border-radius: 6px; object-fit: cover; border: 1.5px solid #fff;" />
          <div style="position: absolute; bottom: -4px; right: -4px; background: var(--accent-gold); color: #000; font-weight: 800; font-size: 0.68rem; padding: 1px 4px; border-radius: 6px;">#${p.number}</div>
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 700; font-size: 0.92rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.name}</div>
          <div style="font-size: 0.74rem; color: var(--text-muted);">${p.position} · <strong style="color: var(--accent-gold);">${p.group || "Sin Cat."}</strong></div>
          <div class="mono-text" style="font-size: 0.68rem; color: #94a3b8; margin-top: 2px;">ID: LA-2026-${String(p.id).padStart(3, "0")}</div>
          <div style="font-size: 0.7rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Tutor: ${p.tutorName || "N/A"}</div>
        </div>
        <div style="flex-shrink: 0; text-align: center;">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=LAGUNA-${p.id}" width="54" height="54" style="background: #fff; border-radius: 4px; padding: 2px; display: block;" alt="QR" />
          <span style="font-size: 0.55rem; color: var(--accent-gold); font-family: var(--font-mono); font-weight: 700;">QR OFICIAL</span>
        </div>
      </div>
      <div class="cred-archive-actions">
        <button class="btn btn-ghost btn-sm" onclick="openCredentialModal(${p.id})" style="font-size: 0.72rem; padding: 0.2rem 0.5rem;">
          <i class="fa-solid fa-eye text-primary"></i> Ver Ampliada
        </button>
        <button class="btn btn-outline btn-sm" onclick="openProfileModal(${p.id})" style="font-size: 0.72rem; padding: 0.2rem 0.5rem;">
          <i class="fa-solid fa-user"></i> Ver Ficha
        </button>
      </div>
    `;
    container.appendChild(item);
  });
}

// Cierre global e intuitivo de cualquier modal al hacer clic en el fondo o presionar ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal-overlay:not(.hidden)").forEach((m) => {
      m.classList.add("hidden");
    });
  }
});

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.classList.add("hidden");
  }
});

function printCredential() {
  const p = currentCredentialPlayer;
  if (!p) return;

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Credencial Oficial - ${p.name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f8fafc; }
    .card { width: 340px; background: linear-gradient(135deg, #0b132b 0%, #1c2541 100%); border: 2px solid #f59e0b; border-radius: 12px; padding: 16px; color: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .header { display: flex; align-items: center; gap: 10px; border-bottom: 1px solid rgba(245,158,11,0.3); padding-bottom: 8px; margin-bottom: 12px; }
    .header img { width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid #f59e0b; }
    .header h2 { font-size: 1rem; margin: 0; color: #f59e0b; }
    .header span { font-size: 0.6rem; color: #94a3b8; }
    .body { display: flex; gap: 12px; align-items: center; }
    .photo-wrap { position: relative; }
    .photo { width: 75px; height: 88px; border-radius: 6px; object-fit: cover; border: 2px solid #fff; }
    .dorsal { position: absolute; bottom: -5px; right: -5px; background: #f59e0b; color: #000; font-weight: bold; font-size: 0.75rem; padding: 1px 5px; border-radius: 8px; }
    .info h3 { font-size: 0.95rem; margin: 0 0 4px; }
    .info p { font-size: 0.72rem; color: #cbd5e1; margin: 2px 0; }
    .qr-wrap { text-align: center; margin-left: auto; }
    .footer { margin-top: 10px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; font-size: 0.6rem; color: #94a3b8; }
    @media print { body { background: none; } }
  </style></head><body>
  <div class="card">
    <div class="header">
      <img src="LAGUNA.jpg" alt="Logo" />
      <div><h2>LAGUNA ATHLETIC</h2><span>CREDENCIAL OFICIAL · 2026</span></div>
    </div>
    <div class="body">
      <div class="photo-wrap">
        <img src="${p.photo || "LAGUNA.jpg"}" class="photo" />
        <div class="dorsal">#${p.number}</div>
      </div>
      <div class="info">
        <h3>${p.name}</h3>
        <p><strong>Pos:</strong> ${p.position}</p>
        <p><strong>Cat:</strong> ${p.group || "Plantel"}</p>
        <p><strong>ID:</strong> LA-2026-${String(p.id).padStart(3, "0")}</p>
      </div>
      <div class="qr-wrap">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=LAGUNA-${p.id}" width="70" height="70" style="border-radius:4px; background:#fff; padding:2px;" />
      </div>
    </div>
    <div class="footer"><span>TEMPORADA 2026</span><span>CLUB LAGUNA ATHLETIC</span></div>
  </div>
  </body></html>`;

  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 400);
  }
}

function printAllPlayerCredentials() {
  const cardsHtml = squadData.map(p => `
    <div style="width: 320px; background: #0b132b; border: 2px solid #f59e0b; border-radius: 10px; padding: 12px; color: #fff; page-break-inside: avoid; margin-bottom: 15px;">
      <div style="display:flex; align-items:center; gap:8px; border-bottom:1px solid rgba(245,158,11,0.3); padding-bottom:6px; margin-bottom:8px;">
        <img src="LAGUNA.jpg" style="width:30px; height:30px; border-radius:50%;" />
        <div><strong style="color:#f59e0b; font-size:0.85rem;">LAGUNA ATHLETIC 2026</strong><div style="font-size:0.58rem; color:#94a3b8;">CREDENCIAL OFICIAL</div></div>
      </div>
      <div style="display:flex; gap:10px; align-items:center;">
        <img src="${p.photo || "LAGUNA.jpg"}" style="width:65px; height:78px; border-radius:5px; object-fit:cover; border:1.5px solid #fff;" />
        <div style="font-size:0.75rem; flex:1;">
          <div style="font-weight:bold; font-size:0.88rem; margin-bottom:2px;">#${p.number} ${p.name}</div>
          <div style="color:#cbd5e1;">${p.position}</div>
          <div style="color:#f59e0b; font-weight:bold;">${p.group || "Sin Cat."}</div>
        </div>
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=65x65&data=LAGUNA-${p.id}" width="65" height="65" style="background:#fff; border-radius:4px; padding:2px;" />
      </div>
    </div>
  `).join("");

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Credenciales del Plantel - Laguna Athletic</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 20px; }
    .grid { display: flex; flex-wrap: wrap; gap: 15px; justify-content: center; }
    @media print { .no-print { display: none; } }
  </style></head><body>
  <div class="no-print" style="margin-bottom: 20px; text-align: center;">
    <h2>🏆 Laguna Athletic — Carnets de Identificación</h2>
    <p>Imprime en hoja gruesa o papel fotográfico para recortar y enmicar.</p>
    <button onclick="window.print()" style="padding: 8px 18px; font-size: 1rem; cursor: pointer; background: #2563eb; color: #fff; border: none; border-radius: 6px;">Imprimir Todo</button>
  </div>
  <div class="grid">${cardsHtml}</div>
  </body></html>`;

  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 500);
  }
}

// ==========================================================================
// MÓDULO: CENTRO DE RESPALDO Y SEGURIDAD DE DATOS (BACKUP / RESTORE)
// ==========================================================================
function exportDatabaseBackup() {
  const backupData = {
    version: "2.6-enterprise",
    timestamp: new Date().toISOString(),
    clubName: "Laguna Athletic",
    squadData,
    calendarEvents,
    paymentsData,
    justificationsData,
    injuredData,
    slotAssignments
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
  const downloadAnchor = document.createElement("a");
  const dateStr = new Date().toISOString().split("T")[0];
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `Laguna_Athletic_Backup_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  showToast("Copia de seguridad descargada exitosamente.", "success");
}

function importDatabaseBackup(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);
      if (!data.squadData || !Array.isArray(data.squadData)) {
        throw new Error("Formato de backup no válido.");
      }

      showConfirmModal(
        "¿Restaurar Base de Datos?",
        `Se reemplazarán los datos actuales con el respaldo del archivo (${data.squadData.length} jugadores encontrados).`,
        "Restaurar",
        "btn-danger-style",
        () => {
          squadData = data.squadData || [];
          calendarEvents = data.calendarEvents || [];
          paymentsData = data.paymentsData || [];
          justificationsData = data.justificationsData || [];
          injuredData = data.injuredData || [];
          if (data.slotAssignments) slotAssignments = data.slotAssignments;

          saveData();
          saveSlotAssignments();
          postLoginInit();
          showToast("¡Base de datos restaurada correctamente!", "success");
        }
      );
    } catch (err) {
      showToast("Error al leer el archivo de respaldo: " + err.message, "error");
    }
  };
  reader.readAsText(file);
  e.target.value = "";
}

function confirmResetFactoryData() {
  showConfirmModal(
    "¿Restablecer Datos de Fábrica?",
    "Esta acción borrará todas las modificaciones locales y cargará la plantilla y datos de demostración originales. ¿Continuar?",
    "Reiniciar de Fábrica",
    "btn-danger-style",
    () => {
      localStorage.clear();
      sessionStorage.clear();
      showToast("Datos restablecidos. Recargando plataforma...", "info");
      setTimeout(() => { location.reload(); }, 1000);
    }
  );
}

// ==========================================================================
// REGISTRO DE SERVICE WORKER (PWA PARA CELULARES)
// ==========================================================================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .then(() => console.log("Laguna Athletic PWA Service Worker activo."))
      .catch((err) => console.log("PWA Service Worker:", err));
  });
}
