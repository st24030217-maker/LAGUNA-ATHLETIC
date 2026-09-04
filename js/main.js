/* ==========================================================================
   LAGUNA ATHLETIC 2026 — js/main.js
   Punto de entrada principal (Orquestador ES6)
   ========================================================================== */

import {
  squadData, calendarEvents, justificationsData, injuredData, paymentsData,
  currentRole, loggedInUser, profilePlayerId,
  setSquadData, setCalendarEvents, setJustificationsData, setInjuredData, setPaymentsData,
  loadData, saveData
} from "./state.js";

import {
  showToast, showModuleTab, toggleNavGroup, toggleSidebar,
  triggerAppLoading, initLoginCarousel, initModalDismiss,
  showConfirmModal, closeConfirmModal, executeConfirmModal
} from "./ui.js";

import {
  initSupabase, cloudConnected, supabaseClient,
  syncAllFromCloud, queueCloudSync,
  openSupabaseConfigModal, closeSupabaseConfigModal,
  testSupabaseConnection, saveAndConnectSupabase, disconnectSupabase,
  injectCallbacks as injectSupabaseCallbacks
} from "./supabase.js";

import {
  handleLogin, logout, applyRolePermissions, canViewGameInfo, isStaffRole,
  injectPostLogin
} from "./auth.js";

import {
  simulateQRCheckIn, markManualAttendance, confirmResetAttendance,
  renderAttendanceTable, populateQuickPlayerSelect,
  openAttendanceReportModal, closeAttendanceReportModal,
  printAttendanceReportArea, exportAttendancePrint,
  toggleQRScannerMode, startCameraScanner, flipCamera, stopCameraScanner,
  injectAttendanceCallbacks
} from "./attendance.js";

import {
  updatePitchDisplay, changePitchSlot, closePlayerModal,
  confirmPlayerSelection, autoLineup, changeFormation,
  initDragAndDrop, initTacticalFullscreen,
  slotAssignments, saveSlotAssignments,
  injectTacticalCallbacks
} from "./tactical.js";

import {
  reportInjury, dischargePlayer, renderInjuredTable,
  injectMedicalCallbacks
} from "./medical.js";

import {
  setCalView, renderCalendarEvents, deleteCalendarEvent,
  openAddEventModal, closeEventModal, saveNewEvent,
  openMatchResultModal, closeMatchResultModal,
  addScorerRow, removeScorerRow, stepScorerVal, updateScorerGoalCount, saveMatchResult,
  injectCalendarCallbacks
} from "./calendar.js";

import {
  submitJustification, reviewJustification, renderJustifications,
  injectJustificationsCallbacks
} from "./justifications.js";

import {
  switchNoticeMode, onNoticeGroupChange, onNoticePlayerChange,
  onNoticeContactChange, updateNoticeTemplate, sendGeneralBroadcast,
  sendGroupBroadcast, sendPersonalWhatsApp, sendIndividualNoticeWhatsApp,
  copyNoticeText, checkAutomatedPaymentReminders, simulateSendNotices,
  populateNoticeControls
} from "./notices.js";

import {
  initChart, updateChartData, renderRankingTable,
  populateGameInfoPlayerSelect, onGameInfoEventSelect,
  openPlayerGameInfoModal, closePlayerGameInfoModal, savePlayerGameInfo,
  deletePlayerGameInfo, copyGameInfoUrl, renderPlayerGameInfo,
  injectStatsCallbacks
} from "./stats.js";

import {
  renderRegTable, openNewPlayerModal, openEditPlayer, closeRegModal,
  savePlayerRegistration, confirmDeletePlayer, handlePhotoSelect,
  openDocModal, closeDocModal, printOrDownloadDoc,
  openCredentialModal, closeCredentialModal, openAllCredentialsModal,
  closeAllCredentialsModal, printCredential, printAllPlayerCredentials,
  injectRegCallbacks
} from "./registration.js";

import {
  populatePaymentPlayerSelect, populateSiblingSelect, togglePaymentScope,
  onPaymentFamilyChange, onPaymentPlayerChange, onPaymentConceptChange,
  setPaymentType, renderMonthlyMatrix, quickChargeMonth, handlePaymentSubmit,
  renderPaymentsTable, updatePaymentSummaryStats, openReceiptModal,
  closeReceiptModal, printReceipt, exportPaymentsPrint,
  injectPaymentsCallbacks
} from "./payments.js";

import {
  renderExpedientesModule, openChildFolderModal, closeChildFolderModal,
  setExpedientesFilter, onExpedientesSearch, handleDocFileUpload,
  removeDocFile, togglePlayerDocStatus, openDocumentViewerModal,
  closeDocumentViewerModal, printChildDossier, injectExpedientesCallbacks
} from "./expedientes.js";

// ---------------------------------------------------------------------------
// CONEXIÓN DE CALLBACKS CRUZADOS
// ---------------------------------------------------------------------------
function appSaveData() {
  saveData(() => queueCloudSync(currentRole));
}

function refreshAllModules() {
  renderAttendanceTable();
  renderRankingTable();
  renderDashboard();
  renderRegTable();
  renderExpedientesModule();
  updateChartData();
}

function renderSquadCallupList() {
  // Función auxiliar de refresco visual táctico / lista de convocados
  renderAttendanceTable();
}

// Inyección a los submódulos
injectSupabaseCallbacks({ showToast, refreshAllModules, renderPaymentsModule: renderPaymentsTable });
injectAttendanceCallbacks({ saveData: appSaveData, renderDashboard, updateChartData, renderRankingTable });
injectMedicalCallbacks({ saveData: appSaveData, populateQuickPlayerSelect, renderSquadCallupList });
injectCalendarCallbacks({ saveData: appSaveData, renderDashboard, renderRegTable, updateNoticeTemplate });
injectJustificationsCallbacks({ saveData: appSaveData });
injectStatsCallbacks({ saveData: appSaveData });
injectRegCallbacks({ saveData: appSaveData, refreshAllModules });
injectPaymentsCallbacks({ saveData: appSaveData });
injectExpedientesCallbacks({ saveData: appSaveData, refreshAllModules });
injectTacticalCallbacks({ saveData: appSaveData, renderSquadCallupList });
injectPostLogin(postLoginInit);

// ---------------------------------------------------------------------------
// DINÁMICAS DE GRUPOS
// ---------------------------------------------------------------------------
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

  populateNoticeControls();
  populateGameInfoPlayerSelect();
}

// ---------------------------------------------------------------------------
// DASHBOARD HOME
// ---------------------------------------------------------------------------
export function renderDashboard() {
  const totalPlayers = squadData.length;
  const presentToday = squadData.filter((p) => p.status === "Presente").length;
  const pct =
    totalPlayers > 0 ? Math.round((presentToday / totalPlayers) * 100) : 0;
  const pendingPayments = paymentsData
    .filter((p) => p.status !== "Pagado")
    .reduce((s, p) => s + (p.finalAmount || 0), 0);
  const injuredCount = injuredData.length;

  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setEl("dashTotalPlayers", totalPlayers);
  setEl("dashPresentToday", presentToday);
  setEl("dashAttendancePct", pct + "%");
  setEl(
    "dashPendingPayments",
    "$" + pendingPayments.toLocaleString("es-MX", { minimumFractionDigits: 0 }),
  );
  setEl("dashInjuredCount", injuredCount);

  // Próximo evento
  const today = new Date().toISOString().split("T")[0];
  const nextEvent = calendarEvents
    .filter((e) => e.date >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  if (nextEvent) {
    const badgeEl = document.getElementById("dashEventBadge");
    const titleEl = document.getElementById("dashEventTitle");
    const subEl = document.getElementById("dashEventSub");
    const dateEl = document.getElementById("dashEventDate");

    if (badgeEl)
      badgeEl.textContent =
        nextEvent.type === "partido"
          ? "⚽ PARTIDO PRÓXIMO"
          : nextEvent.type === "entrenamiento"
            ? "🏃 ENTRENAMIENTO"
            : "📅 EVENTO";
    if (titleEl) titleEl.textContent = nextEvent.title;
    if (subEl)
      subEl.textContent = `${nextEvent.location} · ${nextEvent.time || "Ver horario"}`;

    const d = new Date(nextEvent.date + "T00:00:00");
    const daysDiff = Math.ceil((d - new Date(today)) / 86400000);
    if (dateEl)
      dateEl.textContent =
        daysDiff === 0
          ? "¡HOY!"
          : daysDiff === 1
            ? "Mañana"
            : `En ${daysDiff} días (${d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })})`;
  } else {
    setEl("dashEventTitle", "Sin eventos próximos programados");
    setEl("dashEventSub", "Agrega fechas desde el módulo Calendario");
    setEl("dashEventDate", "—");
  }

  // Top 5 racha
  const tbody = document.getElementById("dashTopAttendance");
  if (tbody) {
    const sorted = [...squadData]
      .sort((a, b) => (b.attendancePct || 0) - (a.attendancePct || 0))
      .slice(0, 5);
    tbody.innerHTML = sorted
      .map(
        (p, i) => `
      <tr>
        <td class="text-muted">#${i + 1}</td>
        <td><strong>${p.name}</strong><br><small class="text-muted">${p.group || p.position}</small></td>
        <td class="text-primary" style="font-weight:700;">${p.attendancePct || 0}%</td>
        <td><span class="badge badge-neon" style="font-size:0.7rem;">${p.streak || "1 A"}</span></td>
      </tr>
    `,
      )
      .join("");
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
      msg: `${injuredData.length} jugador(es) en enfermería: ${injuredData.map((i) => i.player).join(", ")}.`,
    });
  }

  const unpaidCount = paymentsData.filter(
    (pay) => pay.status !== "Pagado",
  ).length;
  if (unpaidCount > 0) {
    alerts.push({
      type: "warning",
      icon: "fa-coins",
      msg: `${unpaidCount} registro(s) con colegiaturas o cuotas pendientes de pago.`,
    });
  }

  const soon = calendarEvents.filter((e) => {
    const diff =
      (new Date(e.date + "T00:00:00") - new Date(today + "T00:00:00")) /
      86400000;
    return diff >= 0 && diff <= 3;
  });
  if (soon.length > 0) {
    soon.forEach((e) => {
      const d = new Date(e.date + "T00:00:00");
      const daysDiff = Math.round(
        (d - new Date(today + "T00:00:00")) / 86400000,
      );
      const when =
        daysDiff === 0
          ? "¡HOY!"
          : daysDiff === 1
            ? "Mañana"
            : `En ${daysDiff} días`;
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

  cont.innerHTML = alerts
    .map(
      (a) => `
    <div class="dash-alert dash-alert-${a.type}">
      <i class="fa-solid ${a.icon}"></i>
      <span>${a.msg}</span>
    </div>
  `,
    )
    .join("");
}

// ---------------------------------------------------------------------------
// INICIALIZACIÓN POST LOGIN
// ---------------------------------------------------------------------------
export function postLoginInit() {
  applyRolePermissions();
  populateQuickPlayerSelect();
  populateGameInfoPlayerSelect();
  renderAttendanceTable();
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

  checkAutomatedPaymentReminders();
  populateDynamicGroups();

  let displayName = "";
  let displayRole = "";
  if (currentRole === "jugador") {
    const user =
      squadData.find((p) => p.id === profilePlayerId) || loggedInUser;
    if (user) {
      displayName = user.name;
      displayRole = `Jugador · #${user.number} · ${user.position}`;
      const activeUserEl = document.getElementById("activeUserName");
      if (activeUserEl) activeUserEl.innerText = `${user.name} (#${user.number})`;
    } else {
      displayName = "Jugador";
      displayRole = "Jugador · Sin ficha vinculada";
      const activeUserEl = document.getElementById("activeUserName");
      if (activeUserEl) activeUserEl.innerText = "Jugador";
    }
  } else if (currentRole === "dt") {
    displayName = "Coach Zúñiga";
    displayRole = "Director Técnico · Admin";
    const activeUserEl = document.getElementById("activeUserName");
    if (activeUserEl) activeUserEl.innerText = "Coach Zúñiga (Admin)";
  } else {
    displayName = "Directiva";
    displayRole = "Acceso de Solo Lectura";
    const activeUserEl = document.getElementById("activeUserName");
    if (activeUserEl) activeUserEl.innerText = "Directiva Club";
  }

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
  showModuleTab("mod-home", {
    onHomeRender: renderDashboard,
    onStatsResize: () => {
      if (typeof updateChartData === "function") updateChartData();
    },
    onNoticesInit: populateNoticeControls
  });
}

// ---------------------------------------------------------------------------
// BACKUP Y RESTORE
// ---------------------------------------------------------------------------
export function exportDatabaseBackup() {
  const backupData = {
    version: "2.6-enterprise",
    timestamp: new Date().toISOString(),
    clubName: "Laguna Athletic",
    squadData,
    calendarEvents,
    paymentsData,
    justificationsData,
    injuredData,
    slotAssignments,
  };

  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(backupData, null, 2));
  const downloadAnchor = document.createElement("a");
  const dateStr = new Date().toISOString().split("T")[0];
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute(
    "download",
    `Laguna_Athletic_Backup_${dateStr}.json`,
  );
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  showToast("Copia de seguridad descargada exitosamente.", "success");
}

export function importDatabaseBackup(e) {
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
          setSquadData(data.squadData || []);
          setCalendarEvents(data.calendarEvents || []);
          setPaymentsData(data.paymentsData || []);
          setJustificationsData(data.justificationsData || []);
          setInjuredData(data.injuredData || []);
          if (data.slotAssignments) Object.assign(slotAssignments, data.slotAssignments);

          appSaveData();
          saveSlotAssignments();
          postLoginInit();
          showToast("¡Base de datos restaurada correctamente!", "success");
        },
      );
    } catch (err) {
      showToast(
        "Error al leer el archivo de respaldo: " + err.message,
        "error",
      );
    }
  };
  reader.readAsText(file);
  e.target.value = "";
}

export function confirmResetFactoryData() {
  showConfirmModal(
    "¿Restablecer Datos de Fábrica?",
    "Esta acción borrará todas las modificaciones locales y cargará la plantilla y datos de demostración originales. ¿Continuar?",
    "Reiniciar de Fábrica",
    "btn-danger-style",
    () => {
      localStorage.clear();
      sessionStorage.clear();
      showToast("Datos restablecidos. Recargando plataforma...", "info");
      setTimeout(() => {
        location.reload();
      }, 1000);
    },
  );
}

// ---------------------------------------------------------------------------
// EXPOSICIÓN GLOBAL AL WINDOW (COMPATIBILIDAD CON HANDLERS INLINE DEL HTML)
// ---------------------------------------------------------------------------
window.showToast = showToast;
window.handleLogin = handleLogin;
window.logout = logout;
window.showModuleTab = (tabId) => showModuleTab(tabId, {
  onHomeRender: renderDashboard,
  onStatsResize: () => {
    if (typeof updateChartData === "function") updateChartData();
    populateGameInfoPlayerSelect();
    renderPlayerGameInfo();
  },
  onNoticesInit: populateNoticeControls,
  onExpedientesRender: renderExpedientesModule
});
window.renderExpedientesModule = renderExpedientesModule;
window.openChildFolderModal = openChildFolderModal;
window.closeChildFolderModal = closeChildFolderModal;
window.setExpedientesFilter = setExpedientesFilter;
window.onExpedientesSearch = onExpedientesSearch;
window.handleDocFileUpload = handleDocFileUpload;
window.removeDocFile = removeDocFile;
window.togglePlayerDocStatus = togglePlayerDocStatus;
window.openDocumentViewerModal = openDocumentViewerModal;
window.closeDocumentViewerModal = closeDocumentViewerModal;
window.printChildDossier = printChildDossier;
window.toggleNavGroup = toggleNavGroup;
window.toggleSidebar = toggleSidebar;
window.simulateQRCheckIn = simulateQRCheckIn;
window.markManualAttendance = markManualAttendance;
window.confirmResetAttendance = confirmResetAttendance;
window.openAttendanceReportModal = openAttendanceReportModal;
window.closeAttendanceReportModal = closeAttendanceReportModal;
window.printAttendanceReportArea = printAttendanceReportArea;
window.exportAttendancePrint = exportAttendancePrint;
window.toggleQRScannerMode = toggleQRScannerMode;
window.startCameraScanner = startCameraScanner;
window.flipCamera = flipCamera;
window.stopCameraScanner = stopCameraScanner;
window.changePitchSlot = changePitchSlot;
window.closePlayerModal = closePlayerModal;
window.confirmPlayerSelection = confirmPlayerSelection;
window.autoLineup = autoLineup;
window.changeFormation = changeFormation;
window.reportInjury = reportInjury;
window.dischargePlayer = dischargePlayer;
window.setCalView = setCalView;
window.deleteCalendarEvent = deleteCalendarEvent;
window.openAddEventModal = openAddEventModal;
window.closeEventModal = closeEventModal;
window.saveNewEvent = saveNewEvent;
window.openMatchResultModal = openMatchResultModal;
window.closeMatchResultModal = closeMatchResultModal;
window.addScorerRow = addScorerRow;
window.removeScorerRow = removeScorerRow;
window.stepScorerVal = stepScorerVal;
window.updateScorerGoalCount = updateScorerGoalCount;
window.saveMatchResult = saveMatchResult;
window.submitJustification = submitJustification;
window.reviewJustification = reviewJustification;
window.switchNoticeMode = switchNoticeMode;
window.onNoticeGroupChange = onNoticeGroupChange;
window.onNoticePlayerChange = onNoticePlayerChange;
window.onNoticeContactChange = onNoticeContactChange;
window.updateNoticeTemplate = updateNoticeTemplate;
window.sendGeneralBroadcast = sendGeneralBroadcast;
window.sendGroupBroadcast = sendGroupBroadcast;
window.sendPersonalWhatsApp = sendPersonalWhatsApp;
window.sendIndividualNoticeWhatsApp = sendIndividualNoticeWhatsApp;
window.copyNoticeText = copyNoticeText;
window.simulateSendNotices = simulateSendNotices;
window.openPlayerGameInfoModal = openPlayerGameInfoModal;
window.closePlayerGameInfoModal = closePlayerGameInfoModal;
window.savePlayerGameInfo = savePlayerGameInfo;
window.deletePlayerGameInfo = deletePlayerGameInfo;
window.copyGameInfoUrl = copyGameInfoUrl;
window.onGameInfoEventSelect = onGameInfoEventSelect;
window.openNewPlayerModal = openNewPlayerModal;
window.openEditPlayer = openEditPlayer;
window.closeRegModal = closeRegModal;
window.savePlayerRegistration = savePlayerRegistration;
window.confirmDeletePlayer = confirmDeletePlayer;
window.handlePhotoSelect = handlePhotoSelect;
window.openDocModal = openDocModal;
window.closeDocModal = closeDocModal;
window.printOrDownloadDoc = printOrDownloadDoc;
window.openCredentialModal = openCredentialModal;
window.closeCredentialModal = closeCredentialModal;
window.openAllCredentialsModal = openAllCredentialsModal;
window.closeAllCredentialsModal = closeAllCredentialsModal;
window.printCredential = printCredential;
window.printAllPlayerCredentials = printAllPlayerCredentials;
window.populatePaymentPlayerSelect = populatePaymentPlayerSelect;
window.populateSiblingSelect = populateSiblingSelect;
window.togglePaymentScope = togglePaymentScope;
window.onPaymentFamilyChange = onPaymentFamilyChange;
window.onPaymentPlayerChange = onPaymentPlayerChange;
window.onPaymentConceptChange = onPaymentConceptChange;
window.setPaymentType = setPaymentType;
window.renderMonthlyMatrix = renderMonthlyMatrix;
window.quickChargeMonth = quickChargeMonth;
window.handlePaymentSubmit = handlePaymentSubmit;
window.renderPaymentsTable = renderPaymentsTable;
window.updatePaymentSummaryStats = updatePaymentSummaryStats;
window.openReceiptModal = openReceiptModal;
window.closeReceiptModal = closeReceiptModal;
window.printReceipt = printReceipt;
window.exportPaymentsPrint = exportPaymentsPrint;
window.openSupabaseConfigModal = openSupabaseConfigModal;
window.closeSupabaseConfigModal = closeSupabaseConfigModal;
window.testSupabaseConnection = testSupabaseConnection;
window.saveAndConnectSupabase = saveAndConnectSupabase;
window.disconnectSupabase = disconnectSupabase;
window.showConfirmModal = showConfirmModal;
window.closeConfirmModal = closeConfirmModal;
window.executeConfirmModal = executeConfirmModal;
window.exportDatabaseBackup = exportDatabaseBackup;
window.importDatabaseBackup = importDatabaseBackup;
window.confirmResetFactoryData = confirmResetFactoryData;
window.initChart = initChart;
window.updateChartData = updateChartData;

// ---------------------------------------------------------------------------
// INICIALIZACIÓN AL CARGAR EL DOCUMENTO
// ---------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  initLoginCarousel();
  initModalDismiss();
  initTacticalFullscreen();
  initSupabase();

  const savedUsername = localStorage.getItem("laguna_auth_username");
  const usernameInput = document.getElementById("loginUsernameInput");
  if (savedUsername && usernameInput) usernameInput.value = savedUsername;
});

// Registro de Service Worker (PWA)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then((reg) => {
        console.log("Laguna Athletic PWA Service Worker activo.");
        reg.addEventListener("updatefound", () => {
          const newSW = reg.installing;
          if (!newSW) return;
          newSW.addEventListener("statechange", () => {
            if (
              newSW.state === "activated" &&
              navigator.serviceWorker.controller
            ) {
              location.reload();
            }
          });
        });
      })
      .catch((err) => console.log("PWA Service Worker:", err));
  });
}
