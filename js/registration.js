/* ==========================================================================
   LAGUNA ATHLETIC 2026 — js/registration.js
   Módulo de registro de jugadores, fotos, expedientes y credenciales.
   ========================================================================== */

import { squadData, currentRole } from "./state.js";
import { showToast, showConfirmModal } from "./ui.js";
import { pushPlayerToCloud, deletePlayerFromCloud } from "./supabase.js";
import { openChildFolderModal } from "./expedientes.js";

export let regFilter = "todos"; // filtro activo de estatus
export let regEditingId = null; // id del jugador en edición (null = nuevo)
export let currentSelectedPhoto = "LAGUNA.jpg"; // photo temp
export let currentDocPlayerId = null;
export let currentCredentialPlayer = null;
export let currentProfilePlayerId = null;

let _saveData = () => {};
let _refreshModules = () => {};
export function injectRegCallbacks({ saveData, refreshAllModules }) {
  _saveData = saveData || _saveData;
  _refreshModules = refreshAllModules || _refreshModules;
}

export function generateFolio() {
  const year = new Date().getFullYear();
  const existing = squadData
    .map((p) => p.folio)
    .filter((f) => f && f.startsWith(`LA-${year}-`))
    .map((f) => parseInt(f.split("-")[2]) || 0);
  const next = existing.length > 0 ? Math.max(...existing) + 1 : 1;
  return `LA-${year}-${String(next).padStart(4, "0")}`;
}

export function ensureRegFields(player) {
  if (!player.regStatus) player.regStatus = "Activo";
  if (!player.birthdate) player.birthdate = "";
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
  player.tutorName = player.contacts[0].name;
  player.phone = player.contacts[0].phone;
  if (!player.email) player.email = "";
  if (!player.regNotes) player.regNotes = "";
  if (!player.photo) player.photo = "LAGUNA.jpg";
  if (!player.group) player.group = "";
  if (!player.positionAlt) player.positionAlt = "";
  if (!player.linkedSiblingId) player.linkedSiblingId = null;
  if (player.docActa === undefined) player.docActa = false;
  if (player.docCURP === undefined) player.docCURP = false;
  if (player.docMedico === undefined) player.docMedico = false;
  if (player.docINE === undefined) player.docINE = false;
  if (player.docEscolar === undefined) player.docEscolar = false;
  if (!player.docFiles || typeof player.docFiles !== "object") player.docFiles = {};
  return player;
}

export function handlePhotoSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (evt) {
    currentSelectedPhoto = evt.target.result;
    const preview = document.getElementById("regPhotoPreview");
    if (preview) preview.src = currentSelectedPhoto;
  };
  reader.readAsDataURL(file);
}

export function renderRegTable() {
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
          <i class="fa-solid fa-folder-open"></i>
        </button>
      </td>`;

      tbody.innerHTML += `
      <tr>
        <td>
          <div class="player-mini">
            <img src="${p.photo || "LAGUNA.jpg"}" alt="${p.name}" />
            <div>
              <strong>#${p.number} ${p.name}</strong>
              <br><small class="text-muted">${p.position} · ${p.group || "Sin Cat."}</small>
            </div>
          </div>
        </td>
        <td>
          <strong>${p.tutorName || "Sin Tutor"}</strong>
          <br><small class="text-muted">${p.phone || "-"}</small>
        </td>
        <td>
          <span class="badge ${badgeClass}">${p.regStatus || "Activo"}</span>
        </td>
        <td>${docBadge}</td>
        ${actionsCells}
      </tr>`;
    });
}

export function resetRegForm() {
  regEditingId = null;
  currentSelectedPhoto = "LAGUNA.jpg";

  const form = document.getElementById("regPlayerForm");
  if (form) form.reset();

  const preview = document.getElementById("regPhotoPreview");
  if (preview) preview.src = "LAGUNA.jpg";

  const submitBtn = document.getElementById("regSubmitBtn");
  if (submitBtn) {
    submitBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> REGISTRAR JUGADOR';
  }

  const cancelBtn = document.getElementById("regCancelBtn");
  if (cancelBtn) {
    cancelBtn.style.display = "none";
  }

  // Ocultar filas de contacto opcionales
  document.getElementById("contactRow2")?.classList.add("hidden");
  document.getElementById("contactRow3")?.classList.add("hidden");
}

export function openNewPlayerModal() {
  resetRegForm();
  document.getElementById("regPlayerForm")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function cancelPlayerEdit() {
  resetRegForm();
  showToast("Edición cancelada.", "info");
}

export function addNextContact() {
  const row2 = document.getElementById("contactRow2");
  const row3 = document.getElementById("contactRow3");
  if (row2 && row2.classList.contains("hidden")) {
    row2.classList.remove("hidden");
  } else if (row3 && row3.classList.contains("hidden")) {
    row3.classList.remove("hidden");
  } else {
    showToast("Máximo 3 contactos permitidos por alumno.", "info");
  }
}

export function removeContact(num) {
  if (num === 2) {
    const row2 = document.getElementById("contactRow2");
    if (row2) row2.classList.add("hidden");
    const n = document.getElementById("contact2Name");
    const p = document.getElementById("contact2Phone");
    if (n) n.value = "";
    if (p) p.value = "";
  } else if (num === 3) {
    const row3 = document.getElementById("contactRow3");
    if (row3) row3.classList.add("hidden");
    const n = document.getElementById("contact3Name");
    const p = document.getElementById("contact3Phone");
    if (n) n.value = "";
    if (p) p.value = "";
  }
}

export function setRegFilter(filter, btn) {
  regFilter = filter;
  if (btn) {
    document.querySelectorAll(".reg-filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  }
  renderRegTable();
}

export function filterRegTable() {
  renderRegTable();
}

export function openEditPlayer(id) {
  const p = squadData.find((x) => x.id === id);
  if (!p) return;
  ensureRegFields(p);
  regEditingId = id;
  currentSelectedPhoto = p.photo || "LAGUNA.jpg";

  const numInp = document.getElementById("regNumber");
  const nameInp = document.getElementById("regName");
  const posInp = document.getElementById("regPosition");
  const posAltInp = document.getElementById("regPositionAlt");
  const groupInp = document.getElementById("regGroup");
  const bdateInp = document.getElementById("regBirthdate");
  const emailInp = document.getElementById("regEmail");
  const statusInp = document.getElementById("regStatus");
  const starterInp = document.getElementById("regStarter");
  const notesInp = document.getElementById("regNotes");
  const siblingInp = document.getElementById("regLinkedSibling");
  const preview = document.getElementById("regPhotoPreview");

  if (numInp) numInp.value = p.number;
  if (nameInp) nameInp.value = p.name;
  if (posInp) posInp.value = p.position || "";
  if (posAltInp) posAltInp.value = p.positionAlt || "";
  if (groupInp) groupInp.value = p.group || "";
  if (bdateInp) bdateInp.value = p.birthdate || "";
  if (emailInp) emailInp.value = p.email || "";
  if (statusInp) statusInp.value = p.regStatus || "Activo";
  if (starterInp) starterInp.value = String(!!p.starter);
  if (notesInp) notesInp.value = p.regNotes || "";
  if (siblingInp) siblingInp.value = p.linkedSiblingId || "";
  if (preview) preview.src = currentSelectedPhoto;

  // Cargar contactos
  const contacts = p.contacts || [{ name: p.tutorName, phone: p.phone, relation: "Tutor" }];

  const c1Name = document.getElementById("contact1Name");
  const c1Phone = document.getElementById("contact1Phone");
  const c1Rel = document.getElementById("contact1Relation");
  if (c1Name) c1Name.value = contacts[0]?.name || p.tutorName || "";
  if (c1Phone) c1Phone.value = contacts[0]?.phone || p.phone || "";
  if (c1Rel) c1Rel.value = contacts[0]?.relation || "Tutor";

  const row2 = document.getElementById("contactRow2");
  const c2Name = document.getElementById("contact2Name");
  const c2Phone = document.getElementById("contact2Phone");
  const c2Rel = document.getElementById("contact2Relation");
  if (contacts[1]) {
    if (row2) row2.classList.remove("hidden");
    if (c2Name) c2Name.value = contacts[1].name || "";
    if (c2Phone) c2Phone.value = contacts[1].phone || "";
    if (c2Rel) c2Rel.value = contacts[1].relation || "Tutor";
  } else {
    if (row2) row2.classList.add("hidden");
    if (c2Name) c2Name.value = "";
    if (c2Phone) c2Phone.value = "";
  }

  const row3 = document.getElementById("contactRow3");
  const c3Name = document.getElementById("contact3Name");
  const c3Phone = document.getElementById("contact3Phone");
  const c3Rel = document.getElementById("contact3Relation");
  if (contacts[2]) {
    if (row3) row3.classList.remove("hidden");
    if (c3Name) c3Name.value = contacts[2].name || "";
    if (c3Phone) c3Phone.value = contacts[2].phone || "";
    if (c3Rel) c3Rel.value = contacts[2].relation || "Tutor";
  } else {
    if (row3) row3.classList.add("hidden");
    if (c3Name) c3Name.value = "";
    if (c3Phone) c3Phone.value = "";
  }

  // Checkboxes de documentación
  const docActa = document.getElementById("docActa");
  const docCURP = document.getElementById("docCURP");
  const docMedico = document.getElementById("docMedico");
  const docINE = document.getElementById("docINE");
  const docEscolar = document.getElementById("docEscolar");

  if (docActa) docActa.checked = !!p.docActa;
  if (docCURP) docCURP.checked = !!p.docCURP;
  if (docMedico) docMedico.checked = !!p.docMedico;
  if (docINE) docINE.checked = !!p.docINE;
  if (docEscolar) docEscolar.checked = !!p.docEscolar;

  const submitBtn = document.getElementById("regSubmitBtn");
  if (submitBtn) {
    submitBtn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> GUARDAR CAMBIOS DE ${p.name.toUpperCase()}`;
  }

  const cancelBtn = document.getElementById("regCancelBtn");
  if (cancelBtn) {
    cancelBtn.style.display = "inline-flex";
  }

  document.getElementById("regPlayerForm")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function closeRegModal() {
  // Función mantenida por compatibilidad
}

export function savePlayerRegistration(e) {
  if (e) e.preventDefault();

  const number = parseInt(document.getElementById("regNumber")?.value) || 0;
  const name = document.getElementById("regName")?.value.trim();
  const position = document.getElementById("regPosition")?.value || "Jugador";
  const positionAlt = document.getElementById("regPositionAlt")?.value || "";
  const group = document.getElementById("regGroup")?.value.trim() || "Sin Cat.";
  const birthdate = document.getElementById("regBirthdate")?.value || "";
  const email = document.getElementById("regEmail")?.value.trim() || "";
  const regStatus = document.getElementById("regStatus")?.value || "Activo";
  const starter = document.getElementById("regStarter")?.value === "true";
  const regNotes = document.getElementById("regNotes")?.value.trim() || "";
  const linkedSiblingId = parseInt(document.getElementById("regLinkedSibling")?.value) || null;

  const docActa = !!document.getElementById("docActa")?.checked;
  const docCURP = !!document.getElementById("docCURP")?.checked;
  const docMedico = !!document.getElementById("docMedico")?.checked;
  const docINE = !!document.getElementById("docINE")?.checked;
  const docEscolar = !!document.getElementById("docEscolar")?.checked;

  if (!name || !number) {
    showToast("Por favor ingresa al menos Nombre y Dorsal.", "warning");
    return;
  }

  // Validación de Dorsal duplicado
  const duplicate = squadData.find((p) => p.number === number && p.id !== regEditingId);
  if (duplicate) {
    showToast(`El dorsal #${number} ya pertenece a ${duplicate.name}. Por favor elige otro número.`, "warning");
    return;
  }

  // Extraer contactos
  const contacts = [];
  const c1Name = document.getElementById("contact1Name")?.value.trim();
  const c1Phone = document.getElementById("contact1Phone")?.value.trim();
  const c1Rel = document.getElementById("contact1Relation")?.value || "Tutor";
  if (c1Name || c1Phone) {
    contacts.push({ name: c1Name || `Familia ${name.split(" ").pop()}`, phone: c1Phone || "", relation: c1Rel });
  }

  const c2Name = document.getElementById("contact2Name")?.value.trim();
  const c2Phone = document.getElementById("contact2Phone")?.value.trim();
  const c2Rel = document.getElementById("contact2Relation")?.value || "Tutor";
  if (c2Name || c2Phone) {
    contacts.push({ name: c2Name, phone: c2Phone, relation: c2Rel });
  }

  const c3Name = document.getElementById("contact3Name")?.value.trim();
  const c3Phone = document.getElementById("contact3Phone")?.value.trim();
  const c3Rel = document.getElementById("contact3Relation")?.value || "Tutor";
  if (c3Name || c3Phone) {
    contacts.push({ name: c3Name, phone: c3Phone, relation: c3Rel });
  }

  if (contacts.length === 0) {
    contacts.push({ name: `Familia ${name.split(" ").pop()}`, phone: "", relation: "Tutor" });
  }

  const tutorName = contacts[0].name;
  const phone = contacts[0].phone;

  if (regEditingId) {
    const p = squadData.find((x) => x.id === regEditingId);
    if (p) {
      p.number = number;
      p.name = name;
      p.position = position;
      p.positionAlt = positionAlt;
      p.group = group;
      p.birthdate = birthdate;
      p.email = email;
      p.tutorName = tutorName;
      p.phone = phone;
      p.regStatus = regStatus;
      p.starter = starter;
      p.regNotes = regNotes;
      p.linkedSiblingId = linkedSiblingId;
      p.photo = currentSelectedPhoto;
      p.docActa = docActa;
      p.docCURP = docCURP;
      p.docMedico = docMedico;
      p.docINE = docINE;
      p.docEscolar = docEscolar;
      p.contacts = contacts;

      pushPlayerToCloud(p);
      showToast(`Jugador ${p.name} actualizado con éxito.`, "success");
    }
  } else {
    const newPlayer = {
      id: Date.now(),
      number,
      name,
      position,
      positionAlt,
      group,
      birthdate,
      email,
      tutorName,
      phone,
      regStatus,
      starter,
      regNotes,
      linkedSiblingId,
      photo: currentSelectedPhoto,
      docActa,
      docCURP,
      docMedico,
      docINE,
      docEscolar,
      docFiles: {},
      attendancePct: 100,
      streak: "0 A",
      status: "Ausente",
      checkinTime: "-",
      injured: false,
      goals: 0,
      assists: 0,
      mins: 0,
      cards: 0,
      folio: generateFolio(),
      contacts: contacts,
      gameInfo: [],
    };
    squadData.push(newPlayer);
    pushPlayerToCloud(newPlayer);
    showToast(`¡Nuevo alumno ${name} registrado con éxito!`, "success");
  }

  _saveData();
  resetRegForm();
  renderRegTable();
  _refreshModules();
}

export function confirmDeletePlayer(id) {
  const p = squadData.find((x) => x.id === id);
  if (!p) return;

  showConfirmModal(
    `¿Eliminar a ${p.name}?`,
    `Esta acción eliminará al jugador #${p.number} de forma permanente del plantel local y de la nube.`,
    "Eliminar Jugador",
    "btn-danger-style",
    () => {
      const idx = squadData.findIndex((x) => x.id === id);
      if (idx !== -1) {
        squadData.splice(idx, 1);
        deletePlayerFromCloud(id);
        _saveData();
        renderRegTable();
        _refreshModules();
        showToast("Jugador eliminado con éxito.", "info");
      }
    },
  );
}

// ---------------------------------------------------------------------------
// MODALES DE DOCUMENTACIÓN Y EXPEDIENTES
// ---------------------------------------------------------------------------
export function openDocModal(playerId) {
  openChildFolderModal(playerId);
}

export function closeDocModal() {
  document.getElementById("playerDocModal")?.classList.add("hidden");
}

export function printOrDownloadDoc() {
  showToast("Generando Ficha Oficial en PDF para impresión...", "info");
  window.print();
}

// ---------------------------------------------------------------------------
// CREDENCIALES
// ---------------------------------------------------------------------------
export function openCredentialModal(playerId) {
  const p = squadData.find((x) => x.id === playerId);
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
  if (idCodeEl)
    idCodeEl.textContent = p.folio || `LA-2026-${String(p.id).padStart(4, "0")}`;

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
        correctLevel: QRCode.CorrectLevel.M,
      });
    }
  }

  document.getElementById("playerCredentialModal")?.classList.remove("hidden");
}

export function closeCredentialModal() {
  document.getElementById("playerCredentialModal")?.classList.add("hidden");
}

export function openAllCredentialsModal() {
  renderAllCredentialsGrid();
  document.getElementById("allCredentialsModal")?.classList.remove("hidden");
}

export function closeAllCredentialsModal() {
  document.getElementById("allCredentialsModal")?.classList.add("hidden");
}

export function renderAllCredentialsGrid() {
  const container = document.getElementById("allCredentialsGrid");
  const countText = document.getElementById("allCredCountText");
  const searchVal = (document.getElementById("allCredSearchInput")?.value || "")
    .toLowerCase()
    .trim();
  const groupFilter =
    document.getElementById("allCredGroupFilter")?.value || "Todos";

  if (!container) return;
  container.innerHTML = "";

  const filtered = squadData.filter((p) => {
    ensureRegFields(p);
    const matchesGroup = groupFilter === "Todos" || p.group === groupFilter;
    const matchesSearch =
      !searchVal ||
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
      </div>
    `;
    container.appendChild(item);
  });
}

export function printCredential() {
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

export function printAllPlayerCredentials() {
  const cardsHtml = squadData
    .map(
      (p) => `
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
  `,
    )
    .join("");

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
