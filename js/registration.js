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

export function openNewPlayerModal() {
  regEditingId = null;
  currentSelectedPhoto = "LAGUNA.jpg";
  document.getElementById("regPlayerForm")?.reset();
  const preview = document.getElementById("regPhotoPreview");
  if (preview) preview.src = "LAGUNA.jpg";
  const title = document.getElementById("regModalTitle");
  if (title) title.innerText = "Registrar Nuevo Alumno";
  document.getElementById("regPlayerModal")?.classList.remove("hidden");
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
  const groupInp = document.getElementById("regGroup");
  const bdateInp = document.getElementById("regBirthdate");
  const tutorInp = document.getElementById("regTutor");
  const phoneInp = document.getElementById("regPhone");
  const statusInp = document.getElementById("regStatus");
  const preview = document.getElementById("regPhotoPreview");

  if (numInp) numInp.value = p.number;
  if (nameInp) nameInp.value = p.name;
  if (posInp) posInp.value = p.position;
  if (groupInp) groupInp.value = p.group || "";
  if (bdateInp) bdateInp.value = p.birthdate || "";
  if (tutorInp) tutorInp.value = p.tutorName || "";
  if (phoneInp) phoneInp.value = p.phone || "";
  if (statusInp) statusInp.value = p.regStatus || "Activo";
  if (preview) preview.src = currentSelectedPhoto;

  const docActa = document.getElementById("regDocActa");
  const docCURP = document.getElementById("regDocCURP");
  const docMedico = document.getElementById("regDocMedico");
  const docINE = document.getElementById("regDocINE");
  const docEscolar = document.getElementById("regDocEscolar");

  if (docActa) docActa.checked = !!p.docActa;
  if (docCURP) docCURP.checked = !!p.docCURP;
  if (docMedico) docMedico.checked = !!p.docMedico;
  if (docINE) docINE.checked = !!p.docINE;
  if (docEscolar) docEscolar.checked = !!p.docEscolar;

  const title = document.getElementById("regModalTitle");
  if (title) title.innerText = `Editar Alumno: ${p.name}`;
  document.getElementById("regPlayerModal")?.classList.remove("hidden");
}

export function closeRegModal() {
  document.getElementById("regPlayerModal")?.classList.add("hidden");
}

export function savePlayerRegistration(e) {
  if (e) e.preventDefault();

  const number = parseInt(document.getElementById("regNumber")?.value) || 0;
  const name = document.getElementById("regName")?.value.trim();
  const position = document.getElementById("regPosition")?.value;
  const group = document.getElementById("regGroup")?.value.trim() || "Sin Cat.";
  const birthdate = document.getElementById("regBirthdate")?.value || "";
  const tutorName = document.getElementById("regTutor")?.value.trim();
  const phone = document.getElementById("regPhone")?.value.trim();
  const regStatus = document.getElementById("regStatus")?.value || "Activo";

  const docActa = !!document.getElementById("regDocActa")?.checked;
  const docCURP = !!document.getElementById("regDocCURP")?.checked;
  const docMedico = !!document.getElementById("regDocMedico")?.checked;
  const docINE = !!document.getElementById("regDocINE")?.checked;
  const docEscolar = !!document.getElementById("regDocEscolar")?.checked;

  if (!name || !number) {
    showToast("Por favor ingresa al menos Nombre y Dorsal.", "warning");
    return;
  }

  if (regEditingId) {
    const p = squadData.find((x) => x.id === regEditingId);
    if (p) {
      p.number = number;
      p.name = name;
      p.position = position;
      p.group = group;
      p.birthdate = birthdate;
      p.tutorName = tutorName;
      p.phone = phone;
      p.regStatus = regStatus;
      p.photo = currentSelectedPhoto;
      p.docActa = docActa;
      p.docCURP = docCURP;
      p.docMedico = docMedico;
      p.docINE = docINE;
      p.docEscolar = docEscolar;

      if (!p.contacts || p.contacts.length === 0) {
        p.contacts = [{ name: tutorName, phone: phone, relation: "Tutor" }];
      } else {
        p.contacts[0].name = tutorName;
        p.contacts[0].phone = phone;
      }

      pushPlayerToCloud(p);
      showToast(`Jugador ${p.name} actualizado con éxito.`, "success");
    }
  } else {
    const newPlayer = {
      id: Date.now(),
      number,
      name,
      position,
      group,
      birthdate,
      tutorName,
      phone,
      regStatus,
      photo: currentSelectedPhoto,
      docActa,
      docCURP,
      docMedico,
      docINE,
      docEscolar,
      attendancePct: 100,
      streak: "0 A",
      status: "Ausente",
      checkinTime: "-",
      starter: false,
      injured: false,
      goals: 0,
      assists: 0,
      mins: 0,
      cards: 0,
      folio: generateFolio(),
      contacts: [{ name: tutorName, phone: phone, relation: "Tutor" }],
      gameInfo: [],
    };
    squadData.push(newPlayer);
    pushPlayerToCloud(newPlayer);
    showToast(`Nuevo alumno ${name} registrado.`, "success");
  }

  _saveData();
  closeRegModal();
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
