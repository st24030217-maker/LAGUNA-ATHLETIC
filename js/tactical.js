/* ==========================================================================
   LAGUNA ATHLETIC 2026 — js/tactical.js
   Módulo de pizarra táctica, alineaciones, formaciones y drag & drop.
   ========================================================================== */

import { squadData, currentRole } from "./state.js";
import { showToast } from "./ui.js";

export let currentSlotForModal = null;
export let currentSquadFilter = "todos"; // 'todos' | 'titulares' | 'suplentes' | 'lesionados'

export let slotAssignments = {
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

export function saveSlotAssignments() {
  try {
    localStorage.setItem(
      "laguna_slot_assignments",
      JSON.stringify(slotAssignments),
    );
  } catch (e) {}
}

let _saveData = () => {};
let _renderSquadCallupList = () => {};
export function injectTacticalCallbacks({ saveData, renderSquadCallupList }) {
  _saveData = saveData || _saveData;
  _renderSquadCallupList = renderSquadCallupList || _renderSquadCallupList;
}

export function updatePitchDisplay() {
  const pitch = document.getElementById("tacticalPitch");
  if (!pitch) return;

  let startersCount = 0;

  Object.keys(slotAssignments).forEach((slotKey) => {
    const marker = pitch.querySelector(`[data-slot="${slotKey}"]`);
    if (!marker) return;

    const assignedVal = slotAssignments[slotKey];
    const player = squadData.find(
      (p) => p.id === assignedVal || p.number === assignedVal,
    );
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
        const parts = player.name.split(" ");
        const shortName =
          parts.length > 1 ? `${parts[0][0]}. ${parts[1]}` : player.name;
        nameSpan.textContent = shortName;
        nameSpan.title = `#${player.number} ${player.name} (${player.position})`;
      }
    } else {
      marker.classList.remove("is-assigned");
      if (shirt) delete shirt.dataset.customNumber;
      if (nameSpan) {
        const formation =
          document.getElementById("formationSelect")?.value || "4-3-3";
        const formConfig = FORMATIONS[formation]?.find(
          (f) => f.slot === slotKey,
        );
        nameSpan.textContent = formConfig ? formConfig.label : slotKey;
      }
    }
  });

  const badgeEl = document.getElementById("tacticalStartersBadge");
  if (badgeEl) {
    badgeEl.textContent = `${startersCount} Titulares Listos`;
    badgeEl.className =
      startersCount === 11 ? "badge badge-neon" : "badge badge-warning";
  }
}

export function changePitchSlot(slotPos) {
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
    const isCurrent =
      slotAssignments[slotPos] === p.id ||
      slotAssignments[slotPos] === p.number;
    opt.textContent = `#${p.number} ${p.name} — ${p.position}${isCurrent ? " (Actual)" : ""}`;
    if (isCurrent) opt.selected = true;
    select.appendChild(opt);
  });

  const modalTitle = document.getElementById("modalPositionTitle");
  if (modalTitle)
    modalTitle.innerText = `Asignar Titular en Posición [${slotPos}]`;
  document.getElementById("playerSelectModal")?.classList.remove("hidden");
}

export function closePlayerModal() {
  document.getElementById("playerSelectModal")?.classList.add("hidden");
  currentSlotForModal = null;
}

export function confirmPlayerSelection() {
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

    if (prevAssignedId && prevAssignedId !== player.id) {
      const stillAssigned = Object.values(slotAssignments).some(
        (id) => id === prevAssignedId,
      );
      const prevPlayer = squadData.find(
        (p) => p.id === prevAssignedId || p.number === prevAssignedId,
      );
      if (prevPlayer && !stillAssigned) prevPlayer.starter = false;
    }

    player.starter = true;

    _saveData();
    saveSlotAssignments();
    updatePitchDisplay();
    _renderSquadCallupList();
    showToast(
      `${player.name} (#${player.number}) asignado en ${currentSlotForModal}.`,
      "success",
    );
  }
  closePlayerModal();
}

export function autoLineup() {
  const groupFilter =
    document.getElementById("tacticalGroupSelect")?.value || "Todos";
  const available = squadData.filter((p) => {
    if (p.injured) return false;
    if (groupFilter !== "Todos" && p.group !== groupFilter) return false;
    return true;
  });

  if (available.length < 11) {
    showToast(
      `Plantilla insuficiente: se requieren al menos 11 disponibles (hay ${available.length}).`,
      "warning",
    );
  }

  squadData.forEach((p) => {
    p.starter = false;
  });

  const assignedSet = new Set();
  const slots = Object.keys(slotAssignments);

  const gk =
    available.find(
      (p) =>
        p.position.toLowerCase().includes("porter") || p.position === "POR",
    ) || available[0];
  if (gk) {
    slotAssignments["GK"] = gk.id;
    gk.starter = true;
    assignedSet.add(gk.id);
  }

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

  _saveData();
  saveSlotAssignments();
  updatePitchDisplay();
  _renderSquadCallupList();
  showToast("11 Titular autocompletado con éxito.", "success");
}

export const FORMATIONS = {
  "4-3-3": [
    { slot: "GK", top: "50%", left: "8%", num: 1, label: "POR" },
    { slot: "LB", top: "15%", left: "25%", num: 3, label: "LTI" },
    { slot: "CB1", top: "35%", left: "22%", num: 4, label: "DFC" },
    { slot: "CB2", top: "65%", left: "22%", num: 5, label: "DFC" },
    { slot: "RB", top: "85%", left: "25%", num: 2, label: "LTD" },
    { slot: "MC1", top: "25%", left: "50%", num: 8, label: "MC" },
    { slot: "MCD", top: "50%", left: "45%", num: 6, label: "MCD" },
    { slot: "MC2", top: "75%", left: "50%", num: 10, label: "MCO" },
    { slot: "EI", top: "20%", left: "75%", num: 11, label: "EI" },
    { slot: "DC", top: "50%", left: "82%", num: 9, label: "DC" },
    { slot: "ED", top: "80%", left: "75%", num: 7, label: "ED" },
  ],
  "4-4-2": [
    { slot: "GK", top: "50%", left: "8%", num: 1, label: "POR" },
    { slot: "LB", top: "10%", left: "25%", num: 3, label: "LTI" },
    { slot: "CB1", top: "33%", left: "22%", num: 4, label: "DFC" },
    { slot: "CB2", top: "67%", left: "22%", num: 5, label: "DFC" },
    { slot: "RB", top: "90%", left: "25%", num: 2, label: "LTD" },
    { slot: "MC1", top: "15%", left: "50%", num: 7, label: "MI" },
    { slot: "MCD", top: "38%", left: "48%", num: 6, label: "MC" },
    { slot: "MC2", top: "62%", left: "48%", num: 8, label: "MC" },
    { slot: "EI", top: "85%", left: "50%", num: 11, label: "MD" },
    { slot: "DC", top: "35%", left: "80%", num: 9, label: "DC" },
    { slot: "ED", top: "65%", left: "80%", num: 10, label: "DC" },
  ],
  "4-2-3-1": [
    { slot: "GK", top: "50%", left: "8%", num: 1, label: "POR" },
    { slot: "LB", top: "12%", left: "25%", num: 3, label: "LTI" },
    { slot: "CB1", top: "35%", left: "22%", num: 4, label: "DFC" },
    { slot: "CB2", top: "65%", left: "22%", num: 5, label: "DFC" },
    { slot: "RB", top: "88%", left: "25%", num: 2, label: "LTD" },
    { slot: "MCD", top: "38%", left: "42%", num: 6, label: "MCD" },
    { slot: "MC1", top: "62%", left: "42%", num: 8, label: "MCD" },
    { slot: "MC2", top: "50%", left: "62%", num: 10, label: "MCO" },
    { slot: "EI", top: "20%", left: "62%", num: 11, label: "MI" },
    { slot: "ED", top: "80%", left: "62%", num: 7, label: "MD" },
    { slot: "DC", top: "50%", left: "82%", num: 9, label: "DC" },
  ],
  "3-5-2": [
    { slot: "GK", top: "50%", left: "8%", num: 1, label: "POR" },
    { slot: "CB1", top: "25%", left: "22%", num: 4, label: "DFC" },
    { slot: "CB2", top: "50%", left: "20%", num: 5, label: "LIB" },
    { slot: "RB", top: "75%", left: "22%", num: 6, label: "DFC" },
    { slot: "LB", top: "10%", left: "48%", num: 3, label: "CARI" },
    { slot: "MCD", top: "35%", left: "46%", num: 8, label: "MC" },
    { slot: "MC1", top: "50%", left: "44%", num: 7, label: "MCD" },
    { slot: "MC2", top: "65%", left: "46%", num: 10, label: "MCO" },
    { slot: "EI", top: "90%", left: "48%", num: 11, label: "CARD" },
    { slot: "DC", top: "35%", left: "78%", num: 9, label: "DC" },
    { slot: "ED", top: "65%", left: "78%", num: 2, label: "DC" },
  ],
  "5-3-2": [
    { slot: "GK", top: "50%", left: "8%", num: 1, label: "POR" },
    { slot: "LB", top: "10%", left: "25%", num: 3, label: "LTI" },
    { slot: "CB1", top: "28%", left: "22%", num: 4, label: "DFC" },
    { slot: "CB2", top: "50%", left: "20%", num: 5, label: "LIB" },
    { slot: "RB", top: "72%", left: "22%", num: 2, label: "DFC" },
    { slot: "EI", top: "90%", left: "25%", num: 11, label: "LTD" },
    { slot: "MCD", top: "25%", left: "50%", num: 8, label: "MC" },
    { slot: "MC1", top: "50%", left: "48%", num: 6, label: "MCD" },
    { slot: "MC2", top: "75%", left: "50%", num: 10, label: "MC" },
    { slot: "DC", top: "35%", left: "80%", num: 9, label: "DC" },
    { slot: "ED", top: "65%", left: "80%", num: 7, label: "DC" },
  ],
};

export function changeFormation() {
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

// ---------------------------------------------------------------------------
// DRAG & DROP
// ---------------------------------------------------------------------------
let draggedMarker = null;
let dragStartX = 0;
let dragStartY = 0;
let dragInitialLeft = 0;
let dragInitialTop = 0;
let isDragging = false;
let savedPositions = {};

export function initDragAndDrop() {
  const pitch = document.getElementById("tacticalPitch");
  if (!pitch) return;

  try {
    const saved = localStorage.getItem("laguna_pitch_positions");
    if (saved) savedPositions = JSON.parse(saved);
  } catch (e) {}

  const markers = pitch.querySelectorAll(".player-marker");
  markers.forEach((marker) => {
    const slot = marker.getAttribute("data-slot");
    if (savedPositions[slot]) {
      marker.style.left = savedPositions[slot].left;
      marker.style.top = savedPositions[slot].top;
    }
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

  draggedMarker = marker;
  isDragging = false;

  const client = e.touches ? e.touches[0] : e;
  dragStartX = client.clientX;
  dragStartY = client.clientY;

  dragInitialLeft = marker.offsetLeft;
  dragInitialTop = marker.offsetTop;

  if (e.cancelable) e.preventDefault();
}

function onDragMove(e) {
  if (!draggedMarker) return;

  const client = e.touches ? e.touches[0] : e;
  const dx = client.clientX - dragStartX;
  const dy = client.clientY - dragStartY;

  if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
    isDragging = true;
    draggedMarker.classList.add("is-dragging");

    const pitch = document.getElementById("tacticalPitch");
    const pw = pitch.offsetWidth;
    const ph = pitch.offsetHeight;

    let newLeft = dragInitialLeft + dx;
    let newTop = dragInitialTop + dy;

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
    const slot = draggedMarker.getAttribute("data-slot");
    if (slot) changePitchSlot(slot);
  }

  draggedMarker = null;
  isDragging = false;
}

// ---------------------------------------------------------------------------
// PANTALLA COMPLETA EN PIZARRA
// ---------------------------------------------------------------------------
export function initTacticalFullscreen() {
  const btnFullscreen = document.getElementById("btnFullscreenPitch");
  const tacticalBoardCard = document.getElementById("tacticalBoardCard");
  const tacticalPitch = document.getElementById("tacticalPitch");

  if (btnFullscreen && tacticalBoardCard && tacticalPitch) {
    let isPseudoFullscreen = false;

    btnFullscreen.addEventListener("click", () => {
      const hasNativeAPI =
        tacticalBoardCard.requestFullscreen ||
        tacticalBoardCard.webkitRequestFullscreen ||
        tacticalBoardCard.msRequestFullscreen;

      if (hasNativeAPI) {
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
          if (tacticalBoardCard.requestFullscreen) {
            tacticalBoardCard.requestFullscreen().catch(() => {
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

    document.addEventListener("fullscreenchange", handleNativeFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleNativeFullscreenChange);
    document.addEventListener("msfullscreenchange", handleNativeFullscreenChange);

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
}
