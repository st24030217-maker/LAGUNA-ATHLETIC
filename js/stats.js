/* ==========================================================================
   LAGUNA ATHLETIC 2026 — js/stats.js
   Módulo de estadísticas, gráficos Chart.js, rankings y reportes de partido.
   ========================================================================== */

import { squadData, calendarEvents } from "./state.js";
import { showToast } from "./ui.js";
import { canViewGameInfo } from "./auth.js";

export let attendanceChart = null;

let _saveData = () => {};
export function injectStatsCallbacks({ saveData }) {
  _saveData = saveData || _saveData;
}

export function initChart() {
  const canvas = document.getElementById("attendanceChart");
  if (!canvas || typeof Chart === "undefined") return;
  const centerLabelPlugin = {
    id: "centerLabel",
    afterDraw(chart) {
      const values = chart.data.datasets[0].data;
      const total = values.reduce((sum, v) => sum + v, 0);
      const pct = total ? Math.round((values[0] / total) * 100) : 0;
      const { ctx, chartArea } = chart;
      const x = (chartArea.left + chartArea.right) / 2;
      const y = (chartArea.top + chartArea.bottom) / 2;
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "700 26px 'JetBrains Mono', monospace";
      ctx.fillStyle = total ? "#10b981" : "#94a3b8";
      ctx.fillText(total ? `${pct}%` : "—", x, y - 10);
      ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(total ? "presentes hoy" : "sin registros", x, y + 14);
      ctx.restore();
    },
  };
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
    plugins: [centerLabelPlugin],
  });
  updateChartData();
}

export function updateChartData() {
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

export function renderRankingTable() {
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

export function populateGameInfoPlayerSelect() {
  const select = document.getElementById("gameInfoPlayerSelect");
  const filterPlayer = document.getElementById("gameInfoFilterPlayer");
  const filterGroup = document.getElementById("gameInfoFilterGroup");
  const eventSelect = document.getElementById("gameInfoEventSelect");

  if (select) {
    select.innerHTML = squadData
      .map(
        (p) =>
          `<option value="${p.id}">#${p.number} ${p.name} (${p.group || "Sin Cat."})</option>`,
      )
      .join("");
  }

  if (filterPlayer) {
    const curVal = filterPlayer.value;
    filterPlayer.innerHTML =
      '<option value="Todos">Todos los Jugadores</option>' +
      squadData
        .map((p) => `<option value="${p.id}">#${p.number} ${p.name}</option>`)
        .join("");
    if (
      curVal &&
      (curVal === "Todos" || squadData.some((p) => p.id == curVal))
    ) {
      filterPlayer.value = curVal;
    }
  }

  if (filterGroup) {
    const curGroup = filterGroup.value;
    const groups = new Set(
      squadData.map((p) => p.group).filter((g) => g && g.trim() !== ""),
    );
    const uniqueGroups = Array.from(groups).sort();
    filterGroup.innerHTML =
      '<option value="Todos">Todas las Categorías</option>' +
      uniqueGroups.map((g) => `<option value="${g}">${g}</option>`).join("");
    if (curGroup && (curGroup === "Todos" || uniqueGroups.includes(curGroup))) {
      filterGroup.value = curGroup;
    }
  }

  if (eventSelect) {
    const matchEvents = calendarEvents.filter((e) => e.type === "partido");
    eventSelect.innerHTML =
      '<option value="">— Seleccionar partido del calendario o escribir manual —</option>' +
      matchEvents
        .map((e) => `<option value="${e.id}">${e.title} (${e.date})</option>`)
        .join("");
  }
}

export function onGameInfoEventSelect() {
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

export function openPlayerGameInfoModal(playerId = null, editInfoId = null) {
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
    const info =
      player && Array.isArray(player.gameInfo)
        ? player.gameInfo.find((i) => i.id === editInfoId)
        : null;
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

  document.getElementById("gameInfoModal")?.classList.remove("hidden");
}

export function closePlayerGameInfoModal() {
  const modal = document.getElementById("gameInfoModal");
  if (modal) modal.classList.add("hidden");
  document.getElementById("gameInfoForm")?.reset();
  const editIdInp = document.getElementById("gameInfoEditId");
  if (editIdInp) editIdInp.value = "";
}

export function savePlayerGameInfo(e) {
  if (e) e.preventDefault();
  if (!canViewGameInfo()) {
    showToast("Acceso denegado: solo directiva y cuerpo técnico.", "error");
    return;
  }

  const playerId = Number(
    document.getElementById("gameInfoPlayerSelect")?.value,
  );
  const editId = document.getElementById("gameInfoEditId")?.value;
  const title = document.getElementById("gameInfoTitle")?.value.trim();
  const type =
    document.getElementById("gameInfoTypeSelect")?.value || "Análisis Táctico";
  const date = document.getElementById("gameInfoDate")?.value;
  const downloadUrl = document
    .getElementById("gameInfoDownloadUrl")
    ?.value.trim();
  const notes = document.getElementById("gameInfoNotes")?.value.trim();

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
    const existingIndex = player.gameInfo.findIndex(
      (i) => String(i.id) === String(editId),
    );
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
    showToast(
      `Se enlazó la información del partido a ${player.name}.`,
      "success",
    );
  }

  _saveData();
  renderPlayerGameInfo();
  closePlayerGameInfoModal();
}

export function deletePlayerGameInfo(playerId, infoId) {
  if (!canViewGameInfo()) {
    showToast(
      "Solo entrenadores y administradores pueden eliminar reportes.",
      "error",
    );
    return;
  }

  const player = squadData.find((p) => p.id === playerId);
  if (!player || !Array.isArray(player.gameInfo)) return;

  player.gameInfo = player.gameInfo.filter((i) => i.id !== infoId);
  _saveData();
  renderPlayerGameInfo();
  showToast("Enlace de información eliminado.", "info");
}

export function copyGameInfoUrl(url) {
  if (!url) return;
  navigator.clipboard
    .writeText(url)
    .then(() =>
      showToast("Enlace de descarga copiado al portapapeles.", "success"),
    )
    .catch(() => showToast("URL: " + url, "info"));
}

export function renderPlayerGameInfo() {
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

  const groupFilter =
    document.getElementById("gameInfoFilterGroup")?.value || "Todos";
  const playerFilter =
    document.getElementById("gameInfoFilterPlayer")?.value || "Todos";

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
