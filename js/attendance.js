/* ==========================================================================
   LAGUNA ATHLETIC 2026 — js/attendance.js
   Módulo de asistencia: check-in QR, manual, reporte y escáner.
   ========================================================================== */

import { squadData, currentRole } from "./state.js";
import { showToast, showConfirmModal } from "./ui.js";
import { pushAttendanceLog } from "./supabase.js";

// Callbacks inyectados
let _saveData      = () => {};
let _renderDash    = () => {};
let _updateChart   = () => {};
let _renderRanking = () => {};
export function injectAttendanceCallbacks({ saveData, renderDashboard, updateChartData, renderRankingTable }) {
  _saveData      = saveData      || _saveData;
  _renderDash    = renderDashboard  || _renderDash;
  _updateChart   = updateChartData  || _updateChart;
  _renderRanking = renderRankingTable || _renderRanking;
}

export function populateQuickPlayerSelect() {
  const select       = document.getElementById("quickPlayerSelect");
  const injurySelect = document.getElementById("injuryPlayerSelect");
  if (!select && !injurySelect) return;
  if (select) select.innerHTML = "";
  if (injurySelect) injurySelect.innerHTML = "";
  squadData.forEach((p) => {
    const opt = `<option value="${p.id}">#${p.number} ${p.name}</option>`;
    if (select) select.innerHTML += opt;
    if (injurySelect && !p.injured) injurySelect.innerHTML += opt;
  });
}

export function recalculateAttendancePct() {
  squadData.forEach((p) => {
    if (p.status === "Presente") {
      if ((p.attendancePct || 0) < 100) {
        p.attendancePct = Math.min(100, (p.attendancePct || 90) + 1);
      }
    }
  });
}

export function simulateQRCheckIn() {
  const select   = document.getElementById("quickPlayerSelect");
  if (!select) return;
  const playerId = parseInt(select.value);
  const player   = squadData.find((p) => p.id === playerId);
  if (!player) return;
  if (player.status === "Presente") { showToast(`${player.name} ya registró asistencia.`, "warning"); return; }
  const now     = new Date();
  const timeStr = now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  player.status      = "Presente";
  player.checkinTime = timeStr;
  recalculateAttendancePct();
  _saveData();
  pushAttendanceLog(player, "Presente", timeStr);
  const alertBox = document.getElementById("lastCheckinAlert");
  if (alertBox) {
    document.getElementById("lastCheckinText").innerText = `Asistencia de ${player.name} (${timeStr})`;
    alertBox.classList.remove("hidden");
    setTimeout(() => alertBox.classList.add("hidden"), 3000);
  }
  renderAttendanceTable();
  _renderRanking();
  _updateChart();
  _renderDash();
}

export function markManualAttendance(playerId, newStatus) {
  const player = squadData.find((p) => p.id === playerId);
  if (!player) return;
  player.status      = newStatus;
  player.checkinTime = newStatus === "Presente" ? "Manual DT" : "-";
  if (newStatus === "Presente") recalculateAttendancePct();
  _saveData();
  pushAttendanceLog(player, newStatus, player.checkinTime);
  renderAttendanceTable();
  _updateChart();
  _renderDash();
}

export function renderAttendanceTable() {
  const tbody = document.getElementById("attendanceTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";
  let presentCount = 0;
  const sortedSquad = [...squadData].sort((a, b) => (a.number || 0) - (b.number || 0));
  sortedSquad.forEach((p) => {
    if (p.status === "Presente") presentCount++;
    const tr = document.createElement("tr");
    let badgeClass = p.status === "Presente" ? "badge-success" : p.status === "Justificado" ? "badge-warning" : "badge-danger";
    tr.innerHTML = `
      <td>
        <strong>#${p.number}</strong> ${p.name}
        <br><small class="text-muted">${p.position} ${p.group ? "· " + p.group : ""}</small>
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
}

export function confirmResetAttendance() {
  showConfirmModal(
    "¿Resetear Asistencia del Día?",
    "Esto marcará a todo el plantel como 'Ausente' y limpiará las horas de escaneo de hoy. ¿Deseas continuar?",
    "Resetear Asistencia", "btn-danger-style",
    () => {
      squadData.forEach((p) => { p.status = "Ausente"; p.checkinTime = "-"; });
      _saveData();
      renderAttendanceTable();
      _updateChart();
      _renderDash();
      showToast("Asistencia del día reiniciada.", "info");
    },
  );
}

// ---------------------------------------------------------------------------
// REPORTE DE ASISTENCIA (MODAL Y EXPORTACIÓN)
// ---------------------------------------------------------------------------
export function openAttendanceReportModal() {
  renderAttendanceReportTable();
  document.getElementById("attendanceReportModal")?.classList.remove("hidden");
}

export function closeAttendanceReportModal() {
  document.getElementById("attendanceReportModal")?.classList.add("hidden");
}

export function renderAttendanceReportTable() {
  const tbody = document.getElementById("attReportTableBody");
  const statsEl = document.getElementById("attReportStatsSummary");
  const dateSub = document.getElementById("attReportDateSub");
  const searchVal = (
    document.getElementById("attReportSearchInput")?.value || ""
  )
    .toLowerCase()
    .trim();
  const groupFilter =
    document.getElementById("attReportGroupFilter")?.value || "Todos";

  if (!tbody) return;
  tbody.innerHTML = "";

  const now = new Date();
  const dateStr = now.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  if (dateSub) dateSub.textContent = `${dateStr} · Sesión Laguna Athletic 2026`;

  const filtered = squadData.filter((p) => {
    const matchGroup = groupFilter === "Todos" || p.group === groupFilter;
    const matchSearch =
      !searchVal ||
      p.name.toLowerCase().includes(searchVal) ||
      String(p.number).includes(searchVal) ||
      p.position.toLowerCase().includes(searchVal);
    return matchGroup && matchSearch;
  });

  const presentCount = filtered.filter((p) => p.status === "Presente").length;
  const justCount = filtered.filter((p) => p.status === "Justificado").length;
  const absentCount = filtered.filter(
    (p) => p.status !== "Presente" && p.status !== "Justificado",
  ).length;
  const pct =
    filtered.length > 0
      ? Math.round((presentCount / filtered.length) * 100)
      : 0;

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
      const statusColor =
        p.status === "Presente"
          ? "var(--accent-neon)"
          : p.status === "Justificado"
            ? "var(--accent-gold)"
            : "var(--accent-danger)";
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

export function printAttendanceReportArea() {
  showToast("Generando vista de impresión oficial...", "info");
  setTimeout(() => {
    window.print();
  }, 250);
}

export function exportAttendancePrint() {
  openAttendanceReportModal();
}

// ---------------------------------------------------------------------------
// ESCÁNER QR EN VIVO
// ---------------------------------------------------------------------------
let cameraStream = null;
let cameraScanLoopActive = false;
let currentFacingMode = "environment";
let lastScannedCode = null;
let lastScanTime = 0;
let barcodeDetectorInstance = null;

if ("BarcodeDetector" in window) {
  try {
    barcodeDetectorInstance = new BarcodeDetector({ formats: ["qr_code"] });
  } catch (e) {}
}

export function playSuccessBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {}
}

export function toggleQRScannerMode(mode) {
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

export async function startCameraScanner() {
  stopCameraScanner();

  const video = document.getElementById("qrLiveVideo");
  const placeholder = document.getElementById("qrCameraPlaceholder");
  const overlay = document.getElementById("qrScannerOverlay");
  const activeBar = document.getElementById("qrCameraActiveBar");
  const statusPill = document.getElementById("qrStatusPill");

  if (!video) return;

  if (statusPill)
    statusPill.innerHTML = `<span class="pulse-dot"></span> Conectando cámara...`;

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
    const offBar = document.getElementById("qrCameraOffBar");
    if (offBar) offBar.classList.add("hidden");
    if (activeBar) activeBar.classList.remove("hidden");
    if (statusPill)
      statusPill.innerHTML = `<span class="pulse-dot"></span> Buscando credencial en el visor...`;

    showToast("Cámara conectada en vivo.", "info");
    requestAnimationFrame(scanVideoFrame);
  } catch (err) {
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      video.srcObject = cameraStream;
      video.setAttribute("playsinline", "true");
      await video.play();

      cameraScanLoopActive = true;
      if (placeholder) placeholder.classList.add("hidden");
      if (overlay) overlay.classList.remove("hidden");
      const offBar = document.getElementById("qrCameraOffBar");
      if (offBar) offBar.classList.add("hidden");
      if (activeBar) activeBar.classList.remove("hidden");
      if (statusPill)
        statusPill.innerHTML = `<span class="pulse-dot"></span> Buscando credencial...`;

      showToast("Cámara activada.", "info");
      requestAnimationFrame(scanVideoFrame);
    } catch (err2) {
      showToast(
        "No se pudo acceder a la cámara. Revisa los permisos en tu navegador.",
        "error",
      );
      stopCameraScanner();
    }
  }
}

export async function flipCamera() {
  currentFacingMode =
    currentFacingMode === "environment" ? "user" : "environment";
  showToast(
    `Cambiando a cámara ${currentFacingMode === "environment" ? "trasera" : "frontal"}...`,
    "info",
  );
  await startCameraScanner();
}

export function stopCameraScanner() {
  cameraScanLoopActive = false;

  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
  }

  const video = document.getElementById("qrLiveVideo");
  if (video) video.srcObject = null;

  const placeholder = document.getElementById("qrCameraPlaceholder");
  const overlay = document.getElementById("qrScannerOverlay");
  const offBar = document.getElementById("qrCameraOffBar");
  const activeBar = document.getElementById("qrCameraActiveBar");

  if (placeholder) placeholder.classList.remove("hidden");
  if (overlay) overlay.classList.add("hidden");
  if (offBar) offBar.classList.remove("hidden");
  if (activeBar) activeBar.classList.add("hidden");
}

export async function scanVideoFrame() {
  if (!cameraScanLoopActive) return;

  const video = document.getElementById("qrLiveVideo");
  const canvas = document.getElementById("qrScanCanvas");

  if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
    const now = Date.now();

    if (barcodeDetectorInstance) {
      try {
        const barcodes = await barcodeDetectorInstance.detect(video);
        if (barcodes && barcodes.length > 0) {
          const rawVal = barcodes[0].rawValue;
          if (
            rawVal &&
            (rawVal !== lastScannedCode || now - lastScanTime > 2200)
          ) {
            lastScannedCode = rawVal;
            lastScanTime = now;
            handleScannedQRCode(rawVal);
          }
        }
      } catch (e) {}
    } else if (typeof jsQR !== "undefined" && canvas) {
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

export function handleScannedQRCode(qrText) {
  if (!qrText) return;

  let playerId = null;

  if (qrText.startsWith("LAGUNA-")) {
    playerId = parseInt(qrText.replace("LAGUNA-", ""));
  } else if (qrText.startsWith("ID:")) {
    playerId = parseInt(qrText.replace("ID:", ""));
  } else {
    playerId = parseInt(qrText);
  }

  const player = squadData.find(
    (p) => p.id === playerId || p.number === playerId,
  );

  const statusPill = document.getElementById("qrStatusPill");

  if (!player) {
    if (statusPill) {
      statusPill.innerHTML = `<span style="color:var(--accent-danger);"><i class="fa-solid fa-xmark"></i> QR no reconocido (${qrText})</span>`;
      setTimeout(() => {
        if (statusPill && cameraScanLoopActive)
          statusPill.innerHTML = `<span class="pulse-dot"></span> Buscando credencial...`;
      }, 2000);
    }
    showToast(`Código QR no reconocido: "${qrText}".`, "warning");
    return;
  }

  if (player.status === "Presente") {
    if (statusPill) {
      statusPill.innerHTML = `<span style="color:var(--accent-gold);"><i class="fa-solid fa-check"></i> ${player.name} ya registrado</span>`;
      setTimeout(() => {
        if (statusPill && cameraScanLoopActive)
          statusPill.innerHTML = `<span class="pulse-dot"></span> Buscando credencial...`;
      }, 2000);
    }
    showToast(
      `${player.name} (#${player.number}) ya tiene asistencia hoy.`,
      "info",
    );
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
  _saveData();

  playSuccessBeep();

  if (statusPill) {
    statusPill.innerHTML = `<span style="color:var(--accent-neon); font-weight:bold;"><i class="fa-solid fa-circle-check"></i> ¡Asistencia: ${player.name}!</span>`;
    setTimeout(() => {
      if (statusPill && cameraScanLoopActive)
        statusPill.innerHTML = `<span class="pulse-dot"></span> Buscando credencial...`;
    }, 2500);
  }

  const alertBox = document.getElementById("lastCheckinAlert");
  if (alertBox) {
    document.getElementById("lastCheckinText").innerText =
      `✓ Asistencia confirmada: #${player.number} ${player.name} (${timeStr})`;
    alertBox.classList.remove("hidden");
    setTimeout(() => alertBox.classList.add("hidden"), 4000);
  }

  renderAttendanceTable();
  _renderRanking();
  _updateChart();
  _renderDash();

  showToast(`¡Asistencia de ${player.name} registrada con éxito!`, "success");
}
