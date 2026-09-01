/* ==========================================================================
   LAGUNA ATHLETIC 2026 — js/medical.js
   Módulo médico: lesiones y altas.
   ========================================================================== */

import { squadData, injuredData, setInjuredData } from "./state.js";
import { showToast } from "./ui.js";
import { deleteFromCloud } from "./supabase.js";

// Callbacks inyectados
let _saveData              = () => {};
let _populateQuickSelect   = () => {};
let _renderSquadCallupList = () => {};
export function injectMedicalCallbacks({ saveData, populateQuickPlayerSelect, renderSquadCallupList }) {
  _saveData              = saveData              || _saveData;
  _populateQuickSelect   = populateQuickPlayerSelect || _populateQuickSelect;
  _renderSquadCallupList = renderSquadCallupList || _renderSquadCallupList;
}

export function reportInjury(e) {
  if (e) e.preventDefault();
  const select = document.getElementById("injuryPlayerSelect");
  if (!select) return;
  const playerId = parseInt(select.value);
  const type     = document.getElementById("injuryType")?.value || "Sobrecarga";
  const time     = document.getElementById("injuryTime")?.value || "1 semana";
  const p        = squadData.find((x) => x.id === playerId);
  if (!p) return;
  p.injured = true;
  p.starter = false;
  injuredData.push({ id: Date.now(), player: p.name, number: p.number, type, time, playerId: p.id });
  _saveData();
  showToast(`${p.name} enviado a enfermería.`, "warning");
  document.getElementById("injuryForm")?.reset();
  renderInjuredTable();
  _renderSquadCallupList();
  _populateQuickSelect();
}

export function dischargePlayer(injuryId) {
  const inj = injuredData.find((x) => x.id === injuryId);
  if (!inj) return;
  const p = squadData.find((x) => x.id === inj.playerId);
  if (p) p.injured = false;
  setInjuredData(injuredData.filter((x) => x.id !== injuryId));
  _saveData();
  deleteFromCloud("injuries", injuryId);
  showToast(`${p?.name || "Jugador"} tiene el alta médica.`, "success");
  renderInjuredTable();
  _renderSquadCallupList();
  _populateQuickSelect();
}

export function renderInjuredTable() {
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
}
