/* ==========================================================================
   LAGUNA ATHLETIC 2026 — js/main.js
   Punto de entrada principal (Orquestador ES6)
   ========================================================================== */

import {
  squadData,
  calendarEvents,
  justificationsData,
  injuredData,
  paymentsData,
  currentRole,
  loggedInUser,
  profilePlayerId,
  setSquadData,
  setCalendarEvents,
  setJustificationsData,
  setInjuredData,
  setPaymentsData,
  loadData,
  saveData,
} from "./state.js";

import {
  showToast,
  showModuleTab,
  toggleNavGroup,
  toggleSidebar,
  triggerAppLoading,
  initModalDismiss,
  showConfirmModal,
  closeConfirmModal,
  executeConfirmModal,
  triggerStatefulButton,
} from "./ui.js";

import {
  initSupabase,
  cloudConnected,
  supabaseClient,
  syncAllFromCloud,
  queueCloudSync,
  openSupabaseConfigModal,
  closeSupabaseConfigModal,
  testSupabaseConnection,
  saveAndConnectSupabase,
  disconnectSupabase,
  injectCallbacks as injectSupabaseCallbacks,
} from "./supabase.js";

import {
  handleLogin,
  handleDemoParentLogin,
  logout,
  applyRolePermissions,
  canViewGameInfo,
  isStaffRole,
  injectPostLogin,
} from "./auth.js";

import {
  simulateQRCheckIn,
  markManualAttendance,
  confirmResetAttendance,
  renderAttendanceTable,
  populateQuickPlayerSelect,
  openAttendanceReportModal,
  closeAttendanceReportModal,
  printAttendanceReportArea,
  exportAttendancePrint,
  renderAttendanceReportTable,
  toggleQRScannerMode,
  startCameraScanner,
  flipCamera,
  stopCameraScanner,
  injectAttendanceCallbacks,
} from "./attendance.js";

import {
  updatePitchDisplay,
  changePitchSlot,
  closePlayerModal,
  confirmPlayerSelection,
  autoLineup,
  changeFormation,
  resetPitchPositions,
  setSquadCallupFilter,
  saveLineup,
  renderSquadCallupList,
  initDragAndDrop,
  initTacticalFullscreen,
  slotAssignments,
  saveSlotAssignments,
  injectTacticalCallbacks,
} from "./tactical.js";

import {
  reportInjury,
  dischargePlayer,
  renderInjuredTable,
  injectMedicalCallbacks,
} from "./medical.js";

import {
  setCalView,
  renderCalendarEvents,
  deleteCalendarEvent,
  openAddEventModal,
  closeEventModal,
  saveNewEvent,
  openMatchResultModal,
  closeMatchResultModal,
  addScorerRow,
  removeScorerRow,
  stepScorerVal,
  updateScorerGoalCount,
  saveMatchResult,
  injectCalendarCallbacks,
} from "./calendar.js";

import {
  submitJustification,
  reviewJustification,
  renderJustifications,
  injectJustificationsCallbacks,
} from "./justifications.js";

import {
  switchNoticeMode,
  onNoticeGroupChange,
  onNoticePlayerChange,
  onNoticeContactChange,
  updateNoticeTemplate,
  sendGeneralBroadcast,
  sendGroupBroadcast,
  sendPersonalWhatsApp,
  sendIndividualNoticeWhatsApp,
  copyNoticeText,
  checkAutomatedPaymentReminders,
  simulateSendNotices,
  populateNoticeControls,
} from "./notices.js";

import {
  initChart,
  updateChartData,
  renderRankingTable,
  populateGameInfoPlayerSelect,
  onGameInfoEventSelect,
  openPlayerGameInfoModal,
  closePlayerGameInfoModal,
  savePlayerGameInfo,
  deletePlayerGameInfo,
  copyGameInfoUrl,
  renderPlayerGameInfo,
  injectStatsCallbacks,
} from "./stats.js";

import {
  renderRegTable,
  openNewPlayerModal,
  openEditPlayer,
  closeRegModal,
  savePlayerRegistration,
  handlePlayerRegSubmit,
  openPlayerProfile,
  closeProfileModal,
  openCredentialFromProfile,
  profileSendWA,
  confirmDeletePlayer,
  handlePhotoSelect,
  openDocModal,
  closeDocModal,
  printOrDownloadDoc,
  openCredentialModal,
  closeCredentialModal,
  openAllCredentialsModal,
  closeAllCredentialsModal,
  renderAllCredentialsGrid,
  printCredential,
  printAllPlayerCredentials,
  cancelPlayerEdit,
  addNextContact,
  removeContact,
  setRegFilter,
  filterRegTable,
  injectRegCallbacks,
} from "./registration.js";

import {
  populatePaymentPlayerSelect,
  populateSiblingSelect,
  togglePaymentScope,
  onPaymentFamilyChange,
  onPaymentPlayerChange,
  onPaymentConceptChange,
  setPaymentType,
  recalculatePaymentTotals,
  renderMonthlyMatrix,
  quickChargeMonth,
  handlePaymentSubmit,
  renderPaymentsTable,
  updatePaymentSummaryStats,
  openReceiptModal,
  closeReceiptModal,
  printReceipt,
  exportPaymentsPrint,
  copyCoachCardNumber,
  sendPaymentReceiptWA,
  renderGuardianPaymentsView,
  injectPaymentsCallbacks,
} from "./payments.js";

import {
  renderExpedientesModule,
  openChildFolderModal,
  closeChildFolderModal,
  setExpedientesFilter,
  onExpedientesSearch,
  handleDocFileUpload,
  removeDocFile,
  togglePlayerDocStatus,
  openDocumentViewerModal,
  closeDocumentViewerModal,
  printChildDossier,
  injectExpedientesCallbacks,
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
  renderSquadCallupList();
}

// Inyección a los submódulos
injectSupabaseCallbacks({
  showToast,
  refreshAllModules,
  renderPaymentsModule: renderPaymentsTable,
});
injectAttendanceCallbacks({
  saveData: appSaveData,
  renderDashboard,
  updateChartData,
  renderRankingTable,
});
injectMedicalCallbacks({
  saveData: appSaveData,
  populateQuickPlayerSelect,
  renderSquadCallupList,
});
injectCalendarCallbacks({
  saveData: appSaveData,
  renderDashboard,
  renderRegTable,
  updateNoticeTemplate,
});
injectJustificationsCallbacks({ saveData: appSaveData });
injectStatsCallbacks({ saveData: appSaveData });
injectRegCallbacks({ saveData: appSaveData, refreshAllModules });
injectPaymentsCallbacks({ saveData: appSaveData });
injectExpedientesCallbacks({ saveData: appSaveData, refreshAllModules });
injectTacticalCallbacks({ saveData: appSaveData, renderSquadCallupList });
injectPostLogin(postLoginInit);

// Si Supabase conserva una sesión válida, evita obligar al usuario a iniciar
// sesión otra vez. El evento se emite solo después de validar el perfil/RLS.
window.addEventListener("laguna-session-restored", () => {
  document.getElementById("loginScreen")?.classList.add("hidden");
  const appLayout = document.getElementById("appLayout");
  if (appLayout) appLayout.style.display = "grid";
  postLoginInit();
});

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
  renderGuardianHomeProfile();
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
      if (activeUserEl)
        activeUserEl.innerText = `${user.name} (#${user.number})`;
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
  } else if (currentRole === "guardian") {
    displayName = "Familia Suárez";
    displayRole = "Padre de familia · Modo demo";
    const activeUserEl = document.getElementById("activeUserName");
    if (activeUserEl) activeUserEl.innerText = "Familia Suárez (Demo)";
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
    onNoticesInit: populateNoticeControls,
  });
}

export function renderGuardianHomeProfile() {
  const activeStudent =
    squadData.find((player) => player.id === profilePlayerId) ||
    loggedInUser ||
    squadData[0];

  if (!activeStudent || currentRole !== "guardian") return;

  const welcomeEl = document.getElementById("guardianFamilyWelcome");
  const subtitleEl = document.getElementById("guardianFamilySubtitle");
  const statusEl = document.getElementById("guardianChildStatusTag");
  const nameEl = document.getElementById("guardianChildName");
  const avatarEl = document.getElementById("guardianChildPhoto");
  const numberEl = document.getElementById("guardianChildNumber");
  const categoryEl = document.getElementById("guardianChildCategory");
  const badgeEl = document.getElementById("guardianChildStarterBadge");
  const folioEl = document.getElementById("guardianChildFolio");
  const medicalEl = document.getElementById("guardianMedicalPill");
  const attEl = document.getElementById("guardianMetricAtt");
  const goalsEl = document.getElementById("guardianMetricGoals");
  const assistsEl = document.getElementById("guardianMetricAssists");
  const minsEl = document.getElementById("guardianMetricMins");
  const lanyardFrameEl = document.getElementById("guardianLanyardFrame");

  if (welcomeEl) {
    const tutorName = activeStudent.tutorName || "Familia";
    welcomeEl.textContent = `¡Bienvenido(a), ${tutorName}!`;
  }
  if (subtitleEl) {
    subtitleEl.textContent = `Seguimiento deportivo, convocatorias, pagos y avisos oficiales de ${activeStudent.name}.`;
  }
  if (statusEl) {
    statusEl.textContent = activeStudent.injured
      ? "Rehabilitación"
      : "Plantel Oficial";
  }
  if (nameEl) nameEl.textContent = activeStudent.name;
  if (avatarEl) avatarEl.src = activeStudent.photo || "LAGUNA.jpg";
  if (numberEl) numberEl.textContent = `#${activeStudent.number}`;
  if (categoryEl) {
    const categoryLabel = activeStudent.position || "Jugador";
    categoryEl.textContent = `${categoryLabel}${activeStudent.starter ? " · Titular" : " · Suplente"}`;
  }
  if (badgeEl) {
    badgeEl.textContent = activeStudent.starter
      ? `Titular · #${activeStudent.number}`
      : `Suplente · #${activeStudent.number}`;
  }
  if (folioEl)
    folioEl.textContent = `LA-2026-${String(activeStudent.number).padStart(4, "0")}`;
  if (medicalEl) {
    medicalEl.textContent = activeStudent.injured
      ? "Fuera de juego"
      : "Apto Físicamente";
    medicalEl.className = activeStudent.injured
      ? "badge badge-warning"
      : "badge badge-success";
  }
  if (attEl)
    attEl.textContent = `${Math.max(0, Math.min(100, Number(activeStudent.attendancePct) || 0))}%`;
  if (goalsEl) goalsEl.textContent = String(activeStudent.goals || 0);
  if (assistsEl) assistsEl.textContent = String(activeStudent.assists || 0);
  if (minsEl) minsEl.textContent = `${activeStudent.mins || 0}'`;

  // Poblar selector de hermanos si la familia tiene más de 1 alumno
  const switchGroupEl = document.getElementById("guardianStudentSwitchGroup");
  if (switchGroupEl) {
    const familyStudents = squadData.filter(
      (p) => p.tutorName && p.tutorName === activeStudent.tutorName,
    );
    if (familyStudents.length > 1) {
      switchGroupEl.classList.remove("hidden");
      switchGroupEl.innerHTML = familyStudents
        .map(
          (p) =>
            `<button type="button" class="btn-student-tab ${p.id === activeStudent.id ? "active" : ""}" data-sid="${p.id}"><i class="fa-solid fa-id-card"></i> ${p.name.split(" ")[0]} (#${p.number})</button>`
        )
        .join("");

      switchGroupEl.querySelectorAll(".btn-student-tab").forEach((btn) => {
        btn.onclick = () => {
          const sid = Number(btn.getAttribute("data-sid"));
          setProfilePlayerId(sid);
          renderGuardianHomeProfile();
        };
      });
    } else {
      switchGroupEl.classList.add("hidden");
    }
  }

  // Controles de interacción 3D: Voltear y Re-centrar
  const flipBtn = document.getElementById("btnFlipLanyard");
  if (flipBtn && !flipBtn.dataset.bound) {
    flipBtn.dataset.bound = "true";
    flipBtn.addEventListener("click", () => {
      const frame = document.getElementById("guardianLanyardFrame");
      frame?.contentWindow?.postMessage({ action: "flip" }, "*");
      const badge = document.getElementById("lanyardSideBadge");
      if (badge) {
        const isReverso = badge.dataset.side === "reverso";
        badge.dataset.side = isReverso ? "frente" : "reverso";
        badge.innerHTML = isReverso
          ? '<i class="fa-solid fa-id-badge"></i> Frente'
          : '<i class="fa-solid fa-arrows-rotate"></i> Reverso';
        badge.className = isReverso ? "badge badge-gold" : "badge badge-neon";
      }
    });
  }

  const resetBtn = document.getElementById("btnResetLanyard");
  if (resetBtn && !resetBtn.dataset.bound) {
    resetBtn.dataset.bound = "true";
    resetBtn.addEventListener("click", () => {
      const frame = document.getElementById("guardianLanyardFrame");
      frame?.contentWindow?.postMessage({ action: "reset" }, "*");
      const badge = document.getElementById("lanyardSideBadge");
      if (badge) {
        badge.dataset.side = "frente";
        badge.innerHTML = '<i class="fa-solid fa-id-badge"></i> Frente';
        badge.className = "badge badge-gold";
      }
    });
  }

  // Listener para sincronizar estado de rotación desde el iframe 3D
  if (!window._lanyardMessageBound) {
    window._lanyardMessageBound = true;
    window.addEventListener("message", (e) => {
      if (e.data && e.data.type === "lanyard-flipped") {
        const badge = document.getElementById("lanyardSideBadge");
        if (badge) {
          badge.dataset.side = e.data.isFlipped ? "reverso" : "frente";
          badge.innerHTML = e.data.isFlipped
            ? '<i class="fa-solid fa-arrows-rotate"></i> Reverso'
            : '<i class="fa-solid fa-id-badge"></i> Frente';
          badge.className = e.data.isFlipped ? "badge badge-neon" : "badge badge-gold";
        }
      }
    });
  }

  if (lanyardFrameEl) {
    const photoParam = activeStudent.photo
      ? (activeStudent.photo.startsWith("assets/") ? `./${activeStudent.photo}` : `./${activeStudent.photo}`)
      : "./LAGUNA.jpg";

    const cardParams = new URLSearchParams({
      embed: "guardian",
      name: activeStudent.name || "Jugador",
      number: String(activeStudent.number || "10"),
      position: activeStudent.position || "Jugador",
      category: activeStudent.category || "Sub-10",
      status: activeStudent.injured ? "Rehabilitacion" : (activeStudent.starter ? "Plantel Oficial" : "Suplente"),
      starter: activeStudent.starter !== false ? "true" : "false",
      attendance: `${Math.max(0, Math.min(100, Number(activeStudent.attendancePct) || 0))}%`,
      goals: String(activeStudent.goals || 0),
      assists: String(activeStudent.assists || 0),
      minutes: `${activeStudent.mins || 0}'`,
      folio: `LA-2026-${String(activeStudent.number || 10).padStart(4, "0")}`,
      tutor: activeStudent.tutorName || "Familia",
      photo: photoParam,
    });
    const targetSrc = `frontend/dist/index.html?${cardParams.toString()}`;
    if (lanyardFrameEl.dataset.currentSrc !== targetSrc) {
      lanyardFrameEl.dataset.currentSrc = targetSrc;
      lanyardFrameEl.src = targetSrc;
    }
  }
}

export function openGuardianChildCredential() {
  const activeStudent =
    squadData.find((p) => p.id === profilePlayerId) ||
    squadData.find((p) => p.id === 10) ||
    squadData[0];
  if (activeStudent) {
    openCredentialModal(activeStudent.id);
  }
}

export function openGuardianChildFolder() {
  const activeStudent =
    squadData.find((p) => p.id === profilePlayerId) ||
    squadData.find((p) => p.id === 10) ||
    squadData[0];
  if (activeStudent) {
    openChildFolderModal(activeStudent.id);
  }
}

export function contactCoachWA() {
  const activeStudent =
    squadData.find((p) => p.id === profilePlayerId) ||
    squadData.find((p) => p.id === 10) ||
    squadData[0];
  const studentName = activeStudent ? activeStudent.name : "mi hijo(a)";
  const studentNum = activeStudent ? `#${activeStudent.number}` : "";
  const text = encodeURIComponent(
    `Hola Coach Zúñiga, le escribo respecto al alumno ${studentName} ${studentNum} de Laguna Athletic.`
  );
  window.open(`https://wa.me/528711234567?text=${text}`, "_blank");
}

export function openMatchGoogleMaps() {
  const locationEl = document.getElementById("guardianMatchLocation");
  const venue = locationEl ? locationEl.textContent.trim() : "Complejo Deportivo Laguna Athletic";
  window.open(
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue)}`,
    "_blank"
  );
}

export function openGuardianJustificationModal() {
  showToast("Para justificar la ausencia de tu alumno(a), envía aviso al DT por WhatsApp.", "info");
  contactCoachWA();
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
          if (data.slotAssignments)
            Object.assign(slotAssignments, data.slotAssignments);

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
window.handleDemoParentLogin = handleDemoParentLogin;
window.logout = logout;
window.showModuleTab = (tabId) =>
  showModuleTab(tabId, {
    onHomeRender: renderDashboard,
    onStatsResize: () => {
      if (typeof updateChartData === "function") updateChartData();
      populateGameInfoPlayerSelect();
      renderPlayerGameInfo();
    },
    onNoticesInit: populateNoticeControls,
    onExpedientesRender: renderExpedientesModule,
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
window.renderPlayerGameInfo = renderPlayerGameInfo;
window.openNewPlayerModal = openNewPlayerModal;
window.openEditPlayer = openEditPlayer;
window.closeRegModal = closeRegModal;
window.savePlayerRegistration = savePlayerRegistration;
window.handlePlayerRegSubmit = handlePlayerRegSubmit;
window.openPlayerProfile = openPlayerProfile;
window.closeProfileModal = closeProfileModal;
window.openCredentialFromProfile = openCredentialFromProfile;
window.profileSendWA = profileSendWA;
window.cancelPlayerEdit = cancelPlayerEdit;
window.addNextContact = addNextContact;
window.removeContact = removeContact;
window.setRegFilter = setRegFilter;
window.filterRegTable = filterRegTable;
window.confirmDeletePlayer = confirmDeletePlayer;
window.handlePhotoSelect = handlePhotoSelect;
window.openDocModal = openDocModal;
window.closeDocModal = closeDocModal;
window.printOrDownloadDoc = printOrDownloadDoc;
window.openCredentialModal = openCredentialModal;
window.closeCredentialModal = closeCredentialModal;
window.openAllCredentialsModal = openAllCredentialsModal;
window.closeAllCredentialsModal = closeAllCredentialsModal;
window.renderAllCredentialsGrid = renderAllCredentialsGrid;
window.printCredential = printCredential;
window.printAllPlayerCredentials = printAllPlayerCredentials;
window.renderAttendanceReportTable = renderAttendanceReportTable;
window.renderSquadCallupList = renderSquadCallupList;
window.resetPitchPositions = resetPitchPositions;
window.setSquadCallupFilter = setSquadCallupFilter;
window.saveLineup = saveLineup;
window.renderCalendarEvents = renderCalendarEvents;
window.populatePaymentPlayerSelect = populatePaymentPlayerSelect;
window.populateSiblingSelect = populateSiblingSelect;
window.togglePaymentScope = togglePaymentScope;
window.onPaymentFamilyChange = onPaymentFamilyChange;
window.onPaymentPlayerChange = onPaymentPlayerChange;
window.onPaymentConceptChange = onPaymentConceptChange;
window.setPaymentType = setPaymentType;
window.recalculatePaymentTotals = recalculatePaymentTotals;
window.renderMonthlyMatrix = renderMonthlyMatrix;
window.quickChargeMonth = quickChargeMonth;
window.handlePaymentSubmit = handlePaymentSubmit;
window.renderPaymentsTable = renderPaymentsTable;
window.updatePaymentSummaryStats = updatePaymentSummaryStats;
window.openReceiptModal = openReceiptModal;
window.closeReceiptModal = closeReceiptModal;
window.printReceipt = printReceipt;
window.exportPaymentsPrint = exportPaymentsPrint;
window.copyCoachCardNumber = copyCoachCardNumber;
window.sendPaymentReceiptWA = sendPaymentReceiptWA;
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
window.triggerStatefulButton = triggerStatefulButton;
window.openGuardianChildCredential = openGuardianChildCredential;
window.openGuardianChildFolder = openGuardianChildFolder;
window.contactCoachWA = contactCoachWA;
window.openMatchGoogleMaps = openMatchGoogleMaps;
window.openGuardianJustificationModal = openGuardianJustificationModal;

// ---------------------------------------------------------------------------
// INICIALIZACIÓN AL CARGAR EL DOCUMENTO
// ---------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  loadData();
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
