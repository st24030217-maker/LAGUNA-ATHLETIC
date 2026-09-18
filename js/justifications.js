/* ==========================================================================
   LAGUNA ATHLETIC 2026 — js/justifications.js
   Módulo de justificaciones de ausencias (Jugador y Tutor).
   ========================================================================== */

import { squadData, justificationsData, loggedInUser, currentRole } from "./state.js";
import { showToast } from "./ui.js";

let _saveData = () => {};
export function injectJustificationsCallbacks({ saveData }) {
  _saveData = saveData || _saveData;
}

export function submitJustification(e) {
  if (e) e.preventDefault();
  const loggedPlayerName = loggedInUser
    ? `${loggedInUser.name} (#${loggedInUser.number})`
    : "Jugador (Web)";

  const dateEl = document.getElementById("justDate");
  const reasonEl = document.getElementById("justReason");
  const detailEl = document.getElementById("justDetail");

  justificationsData.push({
    id: Date.now(),
    playerId: loggedInUser?.id || null,
    player: loggedPlayerName,
    date: dateEl ? dateEl.value : new Date().toISOString().split("T")[0],
    reason: reasonEl ? reasonEl.value : "Salud",
    detail: detailEl ? detailEl.value : "",
    status: "Pendiente",
  });

  _saveData();
  renderJustifications();
  showToast("Justificación enviada.", "success");
  document.getElementById("justificationForm")?.reset();
}

// ---------------------------------------------------------------------------
// GESTIÓN DE JUSTIFICACIONES PARA PADRES / TUTORES (MODAL OFICIAL)
// ---------------------------------------------------------------------------

export function openGuardianJustificationModal() {
  const modal = document.getElementById("guardianJustificationModal");
  if (!modal) return;

  // Determinar alumno activo para el tutor
  const activeStudent =
    (typeof window._getActiveGuardianStudent === "function" ? window._getActiveGuardianStudent() : null) ||
    squadData.find((p) => p.id === loggedInUser?.id) ||
    squadData.find((p) => p.id === 10) ||
    squadData[0];

  const childInput = document.getElementById("guardianJustChildName");
  if (childInput && activeStudent) {
    childInput.value = `${activeStudent.name} (#${activeStudent.number})`;
  }

  // Prellenar fecha con hoy si está vacía
  const dateInput = document.getElementById("guardianJustDate");
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split("T")[0];
  }

  modal.classList.remove("hidden");
}

export function closeGuardianJustificationModal() {
  const modal = document.getElementById("guardianJustificationModal");
  if (modal) modal.classList.add("hidden");
  document.getElementById("guardianJustForm")?.reset();
}

export function submitGuardianJustification(e) {
  if (e) e.preventDefault();

  const childInput = document.getElementById("guardianJustChildName");
  const dateEl = document.getElementById("guardianJustDate");
  const reasonEl = document.getElementById("guardianJustReason");
  const detailEl = document.getElementById("guardianJustDetail");

  const playerName = childInput?.value || (loggedInUser ? `${loggedInUser.name} (#${loggedInUser.number})` : "Alumno");
  const dateVal = dateEl?.value || new Date().toISOString().split("T")[0];
  const reasonVal = reasonEl?.value || "Salud / Enfermedad";
  const detailVal = detailEl?.value?.trim() || "";

  justificationsData.unshift({
    id: Date.now(),
    playerId: loggedInUser?.id || null,
    player: playerName,
    date: dateVal,
    reason: reasonVal,
    detail: detailVal,
    status: "Pendiente",
    createdAt: new Date().toISOString(),
  });

  _saveData();
  renderJustifications();
  closeGuardianJustificationModal();

  showToast("Justificación registrada con éxito en la plataforma.", "success");

  // Notificación opcional por WhatsApp directamente al DT
  const msg = encodeURIComponent(
    `*LAGUNA ATHLETIC - AVISO DE INASISTENCIA*\n\nEstimado Coach Zúñiga, informo la ausencia de *${playerName}*:\n- 📅 Fecha: ${dateVal}\n- 📌 Motivo: ${reasonVal}\n- 📝 Detalle: ${detailVal || "Sin observaciones adicionales"}`
  );
  setTimeout(() => {
    if (confirm("¿Deseas enviar también la copia de la justificación al DT por WhatsApp?")) {
      window.open(`https://wa.me/528711234567?text=${msg}`, "_blank");
    }
  }, 300);
}

export function reviewJustification(id, status) {
  const item = justificationsData.find((j) => j.id === id);
  if (!item) return;
  item.status = status;
  _saveData();
  renderJustifications();
}

export function renderJustifications() {
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
