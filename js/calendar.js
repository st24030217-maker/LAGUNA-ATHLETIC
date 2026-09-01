/* ==========================================================================
   LAGUNA ATHLETIC 2026 — js/calendar.js
   Módulo de calendario, eventos, resultados y goleadores.
   ========================================================================== */

import { squadData, calendarEvents, setCalendarEvents, currentRole } from "./state.js";
import { showToast, showConfirmModal } from "./ui.js";
import { deleteFromCloud } from "./supabase.js";

let currentEventForResult = null;
let calView = "lista"; // 'lista' | 'mes'

let _saveData = () => {};
let _renderDash = () => {};
let _renderReg = () => {};
let _updateNoticeTemplate = () => {};

export function injectCalendarCallbacks({ saveData, renderDashboard, renderRegTable, updateNoticeTemplate }) {
  _saveData = saveData || _saveData;
  _renderDash = renderDashboard || _renderDash;
  _renderReg = renderRegTable || _renderReg;
  _updateNoticeTemplate = updateNoticeTemplate || _updateNoticeTemplate;
}

export function setCalView(view) {
  calView = view;
  document
    .getElementById("calViewListBtn")
    ?.classList.toggle("active", view === "lista");
  document
    .getElementById("calViewMonthBtn")
    ?.classList.toggle("active", view === "mes");
  renderCalendarEvents();
}

export function renderCalendarEvents() {
  const grid = document.getElementById("calendarEventsGrid");
  if (!grid) return;

  const typeFilter = document.getElementById("calTypeFilter")?.value || "todos";
  const filteredEvents =
    typeFilter === "todos"
      ? calendarEvents
      : calendarEvents.filter((e) => e.type === typeFilter);

  if (calView === "mes") {
    renderCalendarMonth(grid, filteredEvents);
  } else {
    renderCalendarList(grid, filteredEvents);
  }
}

export function renderCalendarList(grid, events) {
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
              if (s.goals > 0)
                parts.push(`Gol: ${s.goals > 1 ? s.goals + " " : ""}${pName}`);
              if (s.assists > 0)
                parts.push(
                  `Asist: ${s.assists > 1 ? s.assists + " " : ""}${pName}`,
                );
              return parts.length
                ? `<span class="chip">${parts.join(" · ")}</span>`
                : "";
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

export function renderCalendarMonth(grid, events) {
  grid.className = "calendar-month-grid";
  grid.innerHTML = "";

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay(); // 0=Dom

  const monthName = today.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });
  grid.innerHTML = `
    <div class="cal-month-header">
      <span style="text-transform:capitalize; font-size:1.05rem; font-weight:700; color:var(--accent-gold);">
        <i class="fa-regular fa-calendar-days"></i> ${monthName}
      </span>
    </div>
    <div class="cal-month-dow-row">
      ${["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => `<div class="cal-dow-label">${d}</div>`).join("")}
    </div>
    <div class="cal-month-days" id="calMonthDays"></div>
  `;

  const daysContainer = grid.querySelector("#calMonthDays");
  for (let i = 0; i < startDow; i++) {
    daysContainer.innerHTML += `<div class="cal-day cal-day-empty"></div>`;
  }

  const todayStr = today.toISOString().split("T")[0];

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dayEvents = events.filter((e) => e.date === dateStr);
    const isToday = dateStr === todayStr;

    let dotHtml = "";
    dayEvents.forEach((e) => {
      const color =
        e.type === "partido"
          ? "var(--accent-danger)"
          : e.type === "entrenamiento"
            ? "var(--accent-neon)"
            : "var(--accent-gold)";
      dotHtml += `<span class="cal-day-dot" style="background:${color};"></span>`;
    });

    daysContainer.innerHTML += `
      <div class="cal-day ${isToday ? "cal-day-today" : ""} ${dayEvents.length > 0 ? "cal-day-has-event" : ""}" title="${dayEvents.map((e) => e.title).join(", ")}">
        <div class="cal-day-num">${d}</div>
        <div class="cal-day-dots">${dotHtml}</div>
        ${dayEvents.length > 0 ? `<div class="cal-day-evtname">${dayEvents[0].title.substring(0, 10)}${dayEvents[0].title.length > 10 ? "…" : ""}</div>` : ""}
      </div>
    `;
  }
}

export function deleteCalendarEvent(eventId) {
  const ev = calendarEvents.find((e) => e.id === eventId);
  if (!ev) return;
  showConfirmModal(
    `¿Eliminar "${ev.title}"?`,
    `Se eliminará este evento del calendario permanentemente.`,
    "Eliminar",
    "btn-danger-style",
    () => {
      setCalendarEvents(calendarEvents.filter((e) => e.id !== eventId));
      _saveData();
      deleteFromCloud("calendar_events", eventId);
      renderCalendarEvents();
      _renderDash();
      showToast("Evento eliminado del calendario.", "info");
    },
  );
}

export function openAddEventModal() {
  document.getElementById("addEventModal")?.classList.remove("hidden");
}

export function closeEventModal() {
  document.getElementById("addEventModal")?.classList.add("hidden");
}

export function saveNewEvent() {
  const title = document.getElementById("newEvent-title")?.value;
  const date = document.getElementById("newEvent-date")?.value;
  if (!title || !date) return showToast("Falta título o fecha.", "error");

  calendarEvents.push({
    id: Date.now(),
    type: document.getElementById("newEvent-type")?.value || "entrenamiento",
    title,
    date,
    time: document.getElementById("newEvent-time")?.value || "08:00",
    location:
      document.getElementById("newEvent-location")?.value || "Por definir",
    result: null,
    matchStats: [],
  });

  _saveData();
  renderCalendarEvents();
  closeEventModal();
  showToast("Evento creado correctamente.", "success");
}

export function openMatchResultModal(eventId, title) {
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
  document.getElementById("matchResultModal")?.classList.remove("hidden");
}

export function closeMatchResultModal() {
  document.getElementById("matchResultModal")?.classList.add("hidden");
}

export function addScorerRow(
  selectedPlayerId = null,
  initialGoals = 1,
  initialAssists = 0,
) {
  const container = document.getElementById("matchScorersContainer");
  if (!container) return;

  const rowId =
    "scorer_row_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
  const row = document.createElement("div");
  row.className = "match-scorer-row";
  row.id = rowId;

  const playerOptions = squadData
    .map(
      (p) =>
        `<option value="${p.id}" ${selectedPlayerId == p.id ? "selected" : ""}>#${p.number} ${p.name} (${p.position || "Jugador"})</option>`,
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

export function removeScorerRow(rowId) {
  const row = document.getElementById(rowId);
  if (row) {
    row.remove();
    updateScorerGoalCount();
  }
}

export function stepScorerVal(rowId, field, delta) {
  const row = document.getElementById(rowId);
  if (!row) return;
  const input = row.querySelector(
    field === "goals" ? ".scorer-goals-input" : ".scorer-assists-input",
  );
  if (!input) return;
  let val = parseInt(input.value) || 0;
  val = Math.max(0, val + delta);
  input.value = val;
  if (field === "goals") {
    updateScorerGoalCount();
  }
}

export function updateScorerGoalCount() {
  const scoreL = parseInt(document.getElementById("scoreLaguna")?.value) || 0;
  const goalInputs = document.querySelectorAll(
    "#matchScorersContainer .scorer-goals-input",
  );
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

export function saveMatchResult() {
  const l = parseInt(document.getElementById("scoreLaguna")?.value) || 0;
  const r = parseInt(document.getElementById("scoreRival")?.value) || 0;
  const ev = calendarEvents.find((x) => x.id === currentEventForResult);

  if (!ev) {
    closeMatchResultModal();
    return;
  }

  // 1. Revertir estadísticas anteriores si existían
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
  const rows = document.querySelectorAll(
    "#matchScorersContainer .match-scorer-row",
  );
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

  _saveData();
  renderCalendarEvents();
  _renderReg();
  _updateNoticeTemplate();

  showToast(
    `Resultado guardado: LA ${l} - ${r} RIV con estadísticas.`,
    "success",
  );
  closeMatchResultModal();
}
