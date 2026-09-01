/* ==========================================================================
   LAGUNA ATHLETIC 2026 — js/justifications.js
   Módulo de justificaciones de ausencias.
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
