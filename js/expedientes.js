/* ==========================================================================
   LAGUNA ATHLETIC 2026 — js/expedientes.js
   Módulo de Expedientes Digitales y Carpetas de Alumnos por Año
   ========================================================================== */

import { squadData, currentRole } from "./state.js";
import { showToast, showConfirmModal } from "./ui.js";
import { pushPlayerToCloud } from "./supabase.js";

export let expSelectedYear = "Todos";
export let expSelectedStatus = "Todos";
export let expSearchQuery = "";
export let currentExpPlayerId = null;

let _saveData = () => {};
let _refreshModules = () => {};

export function injectExpedientesCallbacks({ saveData, refreshAllModules }) {
  _saveData = saveData || _saveData;
  _refreshModules = refreshAllModules || _refreshModules;
}

/**
 * Obtiene el año de nacimiento o categoría de un jugador
 */
export function getPlayerBirthYear(player) {
  if (player.birthdate && player.birthdate.length >= 4) {
    const y = player.birthdate.substring(0, 4);
    if (!isNaN(parseInt(y))) return y;
  }
  if (player.group) {
    const match = player.group.match(/\b(20\d{2}|19\d{2})\b/);
    if (match) return match[1];
  }
  return "Sin Año";
}

/**
 * Retorna todos los años únicos de nacimiento ordenados
 */
export function getUniqueBirthYears() {
  const years = new Set();
  squadData.forEach((p) => {
    years.add(getPlayerBirthYear(p));
  });
  const list = Array.from(years);
  const numericYears = list.filter((y) => y !== "Sin Año").sort((a, b) => b - a);
  if (list.includes("Sin Año")) numericYears.push("Sin Año");
  return numericYears;
}

/**
 * Garantiza que la estructura docFiles exista en el jugador
 */
export function ensureDocFiles(player) {
  if (!player.docFiles || typeof player.docFiles !== "object") {
    player.docFiles = {};
  }
  if (player.docActa === undefined) player.docActa = false;
  if (player.docCURP === undefined) player.docCURP = false;
  if (player.docMedico === undefined) player.docMedico = false;
  if (player.docINE === undefined) player.docINE = false;
  if (player.docEscolar === undefined) player.docEscolar = false;
  return player;
}

/**
 * Calcula el total de documentos entregados de un jugador (de 5)
 */
export function getPlayerDocCount(p) {
  ensureDocFiles(p);
  return (
    (p.docActa ? 1 : 0) +
    (p.docCURP ? 1 : 0) +
    (p.docMedico ? 1 : 0) +
    (p.docINE ? 1 : 0) +
    (p.docEscolar ? 1 : 0)
  );
}

/**
 * Renderiza el módulo principal de Expedientes por Año
 */
export function renderExpedientesModule() {
  const gridContainer = document.getElementById("expedientesYearGrid");
  const statsTotal = document.getElementById("expStatTotal");
  const statsComplete = document.getElementById("expStatComplete");
  const statsPending = document.getElementById("expStatPending");
  const statsPct = document.getElementById("expStatPct");
  const yearFilterSelect = document.getElementById("expYearFilter");

  if (!gridContainer) return;

  // Asegurar campos
  squadData.forEach(ensureDocFiles);

  // Métricas globales
  const total = squadData.length;
  let completeCount = 0;
  let pendingCount = 0;
  let totalDocsPossible = total * 5;
  let totalDocsDelivered = 0;

  squadData.forEach((p) => {
    const c = getPlayerDocCount(p);
    totalDocsDelivered += c;
    if (c === 5) completeCount++;
    else pendingCount++;
  });

  const pctGlobal = totalDocsPossible > 0 ? Math.round((totalDocsDelivered / totalDocsPossible) * 100) : 0;

  if (statsTotal) statsTotal.textContent = total;
  if (statsComplete) statsComplete.textContent = completeCount;
  if (statsPending) statsPending.textContent = pendingCount;
  if (statsPct) statsPct.textContent = `${pctGlobal}%`;

  // Popular selector de Años si existe
  const uniqueYears = getUniqueBirthYears();
  if (yearFilterSelect) {
    const currentVal = yearFilterSelect.value || "Todos";
    yearFilterSelect.innerHTML = '<option value="Todos">📅 Todos los Años / Categorías</option>';
    uniqueYears.forEach((y) => {
      yearFilterSelect.innerHTML += `<option value="${y}">Año ${y}</option>`;
    });
    if (uniqueYears.includes(currentVal) || currentVal === "Todos") {
      yearFilterSelect.value = currentVal;
    }
  }

  // Filtrado de jugadores
  const searchVal = (expSearchQuery || document.getElementById("expSearchInput")?.value || "").toLowerCase().trim();
  const yearVal = expSelectedYear !== "Todos" ? expSelectedYear : (yearFilterSelect?.value || "Todos");
  const statusVal = expSelectedStatus;

  const filteredSquad = squadData.filter((p) => {
    const playerYear = getPlayerBirthYear(p);
    const matchYear = yearVal === "Todos" || playerYear === yearVal;
    
    const docCount = getPlayerDocCount(p);
    const matchStatus =
      statusVal === "Todos" ||
      (statusVal === "completos" && docCount === 5) ||
      (statusVal === "incompletos" && docCount < 5);

    const matchSearch =
      !searchVal ||
      p.name.toLowerCase().includes(searchVal) ||
      String(p.number).includes(searchVal) ||
      (p.tutorName && p.tutorName.toLowerCase().includes(searchVal)) ||
      (p.position && p.position.toLowerCase().includes(searchVal));

    return matchYear && matchStatus && matchSearch;
  });

  gridContainer.innerHTML = "";

  if (filteredSquad.length === 0) {
    gridContainer.innerHTML = `
      <div class="empty-state-box" style="grid-column: 1 / -1; padding: 3rem; text-align: center;">
        <i class="fa-solid fa-folder-open" style="font-size: 3rem; color: var(--text-muted); opacity: 0.4;"></i>
        <h3 style="margin-top: 1rem; color: #fff;">No se encontraron expedientes</h3>
        <p class="text-muted">No hay alumnos que coincidan con el año o filtro seleccionado.</p>
      </div>
    `;
    return;
  }

  // Agrupar filtrados por Año
  const groupedByYear = {};
  filteredSquad.forEach((p) => {
    const y = getPlayerBirthYear(p);
    if (!groupedByYear[y]) groupedByYear[y] = [];
    groupedByYear[y].push(p);
  });

  const sortedYearsKeys = Object.keys(groupedByYear).sort((a, b) => {
    if (a === "Sin Año") return 1;
    if (b === "Sin Año") return -1;
    return b - a;
  });

  sortedYearsKeys.forEach((yearKey) => {
    const playersInYear = groupedByYear[yearKey];
    playersInYear.sort((a, b) => a.number - b.number);

    let yearDocsCount = 0;
    playersInYear.forEach((p) => (yearDocsCount += getPlayerDocCount(p)));
    const yearDocsMax = playersInYear.length * 5;
    const yearPct = yearDocsMax > 0 ? Math.round((yearDocsCount / yearDocsMax) * 100) : 0;

    const yearSection = document.createElement("div");
    yearSection.className = "year-folder-group margin-bottom fade-in-up";

    let yearCardsHtml = "";
    playersInYear.forEach((p) => {
      const docCount = getPlayerDocCount(p);
      const isComplete = docCount === 5;
      const badgeClass = isComplete ? "badge-success" : "badge-warning";
      const badgeIcon = isComplete ? "fa-circle-check" : "fa-clock";
      const pctBar = (docCount / 5) * 100;

      const cleanPhone = (p.phone || "").replace(/\D/g, "");
      const waLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hola ${p.tutorName || "Tutor"}, le contactamos del Club Laguna Athletic respecto al expediente de ${p.name}.`)}` : "#";

      yearCardsHtml += `
        <div class="child-folder-card">
          <div class="folder-card-header">
            <div class="child-avatar-wrap">
              <img src="${p.photo || "LAGUNA.jpg"}" alt="${p.name}" class="child-avatar" />
              <span class="child-number-badge">#${p.number}</span>
            </div>
            <div class="child-meta">
              <h4 class="child-name">${p.name}</h4>
              <div class="child-subtext">
                <span class="badge badge-gold" style="font-size:0.65rem;">Año ${yearKey}</span>
                <span>${p.position || "Jugador"}</span>
              </div>
              <div class="tutor-info">
                <i class="fa-solid fa-user-shield"></i> ${p.tutorName || "Sin Tutor registrado"}
                ${cleanPhone ? `<a href="${waLink}" target="_blank" class="wa-quick-btn" title="Contactar por WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>` : ""}
              </div>
            </div>
          </div>

          <div class="folder-card-body">
            <div class="doc-progress-wrap">
              <div class="flex-between align-center mb-1">
                <span class="text-muted" style="font-size: 0.75rem;">Documentación entregada</span>
                <span class="badge ${badgeClass}" style="font-size: 0.68rem;">
                  <i class="fa-solid ${badgeIcon}"></i> ${docCount}/5
                </span>
              </div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill ${isComplete ? "complete" : ""}" style="width: ${pctBar}%;"></div>
              </div>
            </div>

            <div class="doc-quick-chips">
              <span class="chip ${p.docActa ? "chip-ok" : "chip-off"}" title="Acta de Nacimiento">Acta</span>
              <span class="chip ${p.docCURP ? "chip-ok" : "chip-off"}" title="CURP">CURP</span>
              <span class="chip ${p.docMedico ? "chip-ok" : "chip-off"}" title="Certificado Médico">Médico</span>
              <span class="chip ${p.docINE ? "chip-ok" : "chip-off"}" title="INE Tutor">INE</span>
              <span class="chip ${p.docEscolar ? "chip-ok" : "chip-off"}" title="Certificado Escolar">Escolar</span>
            </div>
          </div>

          <div class="folder-card-footer">
            <button class="btn btn-primary btn-sm btn-block" onclick="openChildFolderModal(${p.id})">
              <i class="fa-solid fa-folder-open"></i> Abrir Carpeta Digital
            </button>
            <div class="folder-card-actions mt-2">
              <button class="btn btn-ghost btn-sm" onclick="openCredentialModal(${p.id})" title="Credencial QR">
                <i class="fa-solid fa-id-card text-gold"></i> Credencial
              </button>
              <button class="btn btn-ghost btn-sm" onclick="printChildDossier(${p.id})" title="Imprimir Ficha Oficial">
                <i class="fa-solid fa-print text-primary"></i> Ficha
              </button>
            </div>
          </div>
        </div>
      `;
    });

    yearSection.innerHTML = `
      <div class="year-folder-header">
        <div class="year-title-box">
          <i class="fa-solid fa-folder-tree text-gold"></i>
          <h3>Categoría / Año ${yearKey}</h3>
          <span class="badge badge-outline">${playersInYear.length} Alumno${playersInYear.length !== 1 ? "s" : ""}</span>
        </div>
        <div class="year-stat-pill">
          <span class="text-muted" style="font-size: 0.78rem;">Cumplimiento:</span>
          <strong style="color: ${yearPct === 100 ? "var(--accent-neon)" : "var(--accent-gold)"};">${yearPct}%</strong>
        </div>
      </div>
      <div class="year-folder-grid">
        ${yearCardsHtml}
      </div>
    `;

    gridContainer.appendChild(yearSection);
  });
}

/**
 * Evento al cambiar filtro de año o estatus
 */
export function setExpedientesFilter(year, status) {
  if (year !== undefined) expSelectedYear = year;
  if (status !== undefined) expSelectedStatus = status;
  renderExpedientesModule();
}

/**
 * Evento al buscar en expedientes
 */
export function onExpedientesSearch(query) {
  expSearchQuery = query;
  renderExpedientesModule();
}

/**
 * Abre el Modal Ampliado de Carpeta Digital del Alumno
 */
export function openChildFolderModal(playerId) {
  const p = squadData.find((x) => x.id === playerId);
  if (!p) return;
  ensureDocFiles(p);
  currentExpPlayerId = playerId;

  const modal = document.getElementById("expChildFolderModal");
  if (!modal) return;

  const photo = document.getElementById("expFolderPhoto");
  const name = document.getElementById("expFolderName");
  const sub = document.getElementById("expFolderSub");
  const yearBadge = document.getElementById("expFolderYearBadge");
  const tutorBox = document.getElementById("expFolderTutorBox");
  const progFill = document.getElementById("expFolderProgFill");
  const progText = document.getElementById("expFolderProgText");

  if (photo) photo.src = p.photo || "LAGUNA.jpg";
  if (name) name.textContent = p.name;
  if (sub) sub.textContent = `#${p.number} · ${p.position || "Jugador"} · Estatus: ${p.regStatus || "Activo"}`;
  if (yearBadge) yearBadge.textContent = `Categoría Año ${getPlayerBirthYear(p)}`;

  const cleanPhone = (p.phone || "").replace(/\D/g, "");
  const waLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hola ${p.tutorName || "Tutor"}, le contactamos del Club Laguna Athletic sobre el expediente de ${p.name}.`)}` : "#";

  if (tutorBox) {
    tutorBox.innerHTML = `
      <div><i class="fa-solid fa-user-shield text-gold"></i> Tutor Responsable: <strong>${p.tutorName || "Sin registrar"}</strong></div>
      <div><i class="fa-solid fa-phone text-primary"></i> Teléfono: <strong>${p.phone || "Sin registrar"}</strong> ${cleanPhone ? `<a href="${waLink}" target="_blank" class="badge badge-success ml-2"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a>` : ""}</div>
      <div><i class="fa-solid fa-hashtag text-muted"></i> Folio Oficial: <strong class="mono-text">${p.folio || `LA-${new Date().getFullYear()}-${String(p.id).padStart(4, "0")}`}</strong></div>
    `;
  }

  const docCount = getPlayerDocCount(p);
  const pct = Math.round((docCount / 5) * 100);
  if (progFill) progFill.style.width = `${pct}%`;
  if (progText) progText.textContent = `${docCount} de 5 Documentos Entregados (${pct}%)`;

  renderDocCardsInModal(p);

  modal.classList.remove("hidden");
}

/**
 * Cierra el modal de Carpeta Digital
 */
export function closeChildFolderModal() {
  document.getElementById("expChildFolderModal")?.classList.add("hidden");
}

/**
 * Renderiza los 5 contenedores de documentos en el modal de carpeta
 */
function renderDocCardsInModal(p) {
  const container = document.getElementById("expFolderDocsContainer");
  if (!container) return;
  container.innerHTML = "";

  const docTypes = [
    { key: "docActa", title: "Acta de Nacimiento", desc: "Documento oficial probatorio de nacimiento del alumno", icon: "fa-certificate" },
    { key: "docCURP", title: "CURP Oficial", desc: "Clave Única de Registro de Población oficial en PDF o Imagen", icon: "fa-id-card" },
    { key: "docMedico", title: "Certificado Médico", desc: "Certificado de aptitud física expedido por médico titulado", icon: "fa-notes-medical" },
    { key: "docINE", title: "Identificación del Tutor (INE)", desc: "Credencial de elector o identificación oficial del padre/tutor", icon: "fa-address-card" },
    { key: "docEscolar", title: "Certificado / Credencial Escolar", desc: "Constancia de estudios o credencial escolar vigente", icon: "fa-graduation-cap" },
  ];

  docTypes.forEach((doc) => {
    const isChecked = !!p[doc.key];
    const fileData = p.docFiles ? p.docFiles[doc.key] : null;
    const hasFile = !!(fileData && fileData.url);

    const card = document.createElement("div");
    card.className = `doc-file-card ${isChecked ? "verified" : "pending"}`;

    let filePreviewHtml = "";
    if (hasFile) {
      const isPdf = fileData.type && fileData.type.includes("pdf");
      if (isPdf) {
        filePreviewHtml = `
          <div class="doc-preview-thumb pdf-thumb" onclick="openDocumentViewerModal('${fileData.url}', '${doc.title}', 'pdf')">
            <i class="fa-solid fa-file-pdf"></i>
            <span>Ver PDF</span>
          </div>
        `;
      } else {
        filePreviewHtml = `
          <div class="doc-preview-thumb" onclick="openDocumentViewerModal('${fileData.url}', '${doc.title}', 'image')">
            <img src="${fileData.url}" alt="${doc.title}" />
            <div class="thumb-hover-overlay"><i class="fa-solid fa-magnifying-glass-plus"></i> Ampliar</div>
          </div>
        `;
      }
    } else {
      filePreviewHtml = `
        <div class="doc-preview-placeholder">
          <i class="fa-solid fa-cloud-arrow-up"></i>
          <span>Sin archivo digital</span>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="doc-card-top">
        <div class="doc-card-icon">
          <i class="fa-solid ${doc.icon}"></i>
        </div>
        <div class="doc-card-info">
          <h4>${doc.title}</h4>
          <p>${doc.desc}</p>
          ${fileData ? `<small class="text-muted"><i class="fa-solid fa-paperclip"></i> ${fileData.fileName || "Archivo adjunto"} (${fileData.date || "Reciente"})</small>` : ""}
        </div>
        <div class="doc-card-status">
          <label class="custom-switch-check">
            <input type="checkbox" ${isChecked ? "checked" : ""} onchange="togglePlayerDocStatus(${p.id}, '${doc.key}', this.checked)" />
            <span class="switch-slider"></span>
            <span class="switch-label">${isChecked ? "VERIFICADO" : "PENDIENTE"}</span>
          </label>
        </div>
      </div>

      <div class="doc-card-bottom">
        ${filePreviewHtml}
        <div class="doc-card-actions">
          <label class="btn btn-secondary btn-sm file-upload-btn">
            <i class="fa-solid fa-upload"></i> ${hasFile ? "Reemplazar Archivo" : "Subir Documento"}
            <input type="file" accept="image/*,application/pdf" style="display:none;" onchange="handleDocFileUpload(${p.id}, '${doc.key}', event)" />
          </label>
          ${hasFile ? `
            <button class="btn btn-ghost btn-sm text-danger" onclick="removeDocFile(${p.id}, '${doc.key}')" title="Eliminar archivo digital">
              <i class="fa-solid fa-trash-can"></i> Borrar
            </button>
            <button class="btn btn-ghost btn-sm text-primary" onclick="openDocumentViewerModal('${fileData.url}', '${doc.title}', '${fileData.type && fileData.type.includes("pdf") ? "pdf" : "image"}')">
              <i class="fa-solid fa-eye"></i> Ver Ampliado
            </button>
          ` : ""}
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

/**
 * Alterna el check de verificación de un documento
 */
export function togglePlayerDocStatus(playerId, docKey, isChecked) {
  const p = squadData.find((x) => x.id === playerId);
  if (!p) return;
  ensureDocFiles(p);
  p[docKey] = isChecked;

  pushPlayerToCloud(p);
  _saveData();
  renderDocCardsInModal(p);
  renderExpedientesModule();
  _refreshModules();
  showToast(`Estatus de ${docKey} actualizado.`, "info");
}

/**
 * Maneja la subida de un archivo digital (DataURL) para un documento
 */
export function handleDocFileUpload(playerId, docKey, event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 8 * 1024 * 1024) { // límite 8MB
    showToast("El archivo es demasiado grande. El límite máximo es 8MB.", "warning");
    return;
  }

  const p = squadData.find((x) => x.id === playerId);
  if (!p) return;
  ensureDocFiles(p);

  const reader = new FileReader();
  reader.onload = function (e) {
    const fileUrl = e.target.result;
    const now = new Date().toLocaleDateString("es-MX");

    p.docFiles[docKey] = {
      url: fileUrl,
      fileName: file.name,
      type: file.type,
      size: file.size,
      date: now,
    };
    p[docKey] = true; // Auto-marcar como entregado al subir archivo

    pushPlayerToCloud(p);
    _saveData();
    renderDocCardsInModal(p);
    renderExpedientesModule();
    _refreshModules();
    showToast(`Archivo "${file.name}" cargado exitosamente.`, "success");
  };
  reader.readAsDataURL(file);
}

/**
 * Elimina un archivo digital de la carpeta del alumno
 */
export function removeDocFile(playerId, docKey) {
  const p = squadData.find((x) => x.id === playerId);
  if (!p || !p.docFiles || !p.docFiles[docKey]) return;

  showConfirmModal(
    "¿Eliminar Archivo Digital?",
    `Se borrará el archivo de "${docKey}" del expediente. El estado volverá a pendiente.`,
    "Eliminar Archivo",
    "btn-danger-style",
    () => {
      delete p.docFiles[docKey];
      p[docKey] = false;
      pushPlayerToCloud(p);
      _saveData();
      renderDocCardsInModal(p);
      renderExpedientesModule();
      _refreshModules();
      showToast("Archivo digital eliminado.", "info");
    }
  );
}

/**
 * Modal Visualizador de Documentos Ampliado
 */
export function openDocumentViewerModal(url, title, type) {
  const modal = document.getElementById("documentViewerModal");
  const titleEl = document.getElementById("docViewerTitle");
  const bodyEl = document.getElementById("docViewerBody");
  const downloadBtn = document.getElementById("docViewerDownloadBtn");

  if (!modal || !bodyEl) return;

  if (titleEl) titleEl.textContent = title || "Visualizador de Documento";

  if (type === "pdf" || (url && url.startsWith("data:application/pdf"))) {
    bodyEl.innerHTML = `
      <iframe src="${url}" style="width: 100%; height: 75vh; border: none; border-radius: 8px;"></iframe>
    `;
  } else {
    bodyEl.innerHTML = `
      <div style="text-align: center; max-height: 75vh; overflow: auto;">
        <img src="${url}" alt="${title}" style="max-width: 100%; max-height: 70vh; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);" />
      </div>
    `;
  }

  if (downloadBtn) {
    downloadBtn.onclick = () => {
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/\s+/g, "_")}_${Date.now()}`;
      a.click();
    };
  }

  modal.classList.remove("hidden");
}

export function closeDocumentViewerModal() {
  document.getElementById("documentViewerModal")?.classList.add("hidden");
}

/**
 * Imprimir Ficha Oficial y Expediente del Alumno
 */
export function printChildDossier(playerId) {
  const p = squadData.find((x) => x.id === playerId);
  if (!p) return;
  ensureDocFiles(p);

  const docCount = getPlayerDocCount(p);
  const birthYear = getPlayerBirthYear(p);

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
  <title>Expediente Oficial Alumno - ${p.name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 30px; background: #fff; color: #1e293b; }
    .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #d4af37; padding-bottom: 15px; margin-bottom: 25px; }
    .logo-area { display: flex; align-items: center; gap: 15px; }
    .logo-area img { width: 55px; height: 55px; border-radius: 50%; }
    .logo-title h1 { margin: 0; font-size: 1.4rem; color: #0b132b; }
    .logo-title p { margin: 0; font-size: 0.85rem; color: #64748b; font-weight: bold; }
    .folio-box { text-align: right; font-family: monospace; font-size: 0.85rem; background: #f8fafc; padding: 8px 12px; border-radius: 6px; border: 1px solid #e2e8f0; }
    .profile-grid { display: flex; gap: 20px; background: #f8fafc; border-radius: 10px; padding: 20px; margin-bottom: 25px; border: 1px solid #e2e8f0; }
    .photo { width: 110px; height: 130px; border-radius: 8px; object-fit: cover; border: 2px solid #d4af37; }
    .info-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    .info-table td { padding: 6px 10px; border-bottom: 1px solid #e2e8f0; }
    .info-table td.label { font-weight: bold; color: #475569; width: 30%; }
    .doc-section { margin-top: 25px; }
    .doc-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .doc-table th { background: #0b132b; color: #fff; padding: 8px 12px; text-align: left; font-size: 0.85rem; }
    .doc-table td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 0.88rem; }
    .badge-ok { background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 0.75rem; }
    .badge-off { background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 0.75rem; }
    .footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; font-size: 0.75rem; color: #64748b; }
    @media print { body { padding: 0; } }
  </style></head><body>
  
  <div class="header">
    <div class="logo-area">
      <img src="LAGUNA.jpg" alt="Logo" />
      <div class="logo-title">
        <h1>CLUB LAGUNA ATHLETIC</h1>
        <p>EXPEDIENTE OFICIAL DE REGISTRO · TEMPORADA 2026</p>
      </div>
    </div>
    <div class="folio-box">
      <strong>FOLIO:</strong> ${p.folio || `LA-2026-${String(p.id).padStart(4, "0")}`}<br>
      <strong>FECHA:</strong> ${new Date().toLocaleDateString("es-MX")}
    </div>
  </div>

  <div class="profile-grid">
    <img src="${p.photo || "LAGUNA.jpg"}" class="photo" alt="${p.name}" />
    <table class="info-table">
      <tr><td class="label">Nombre del Alumno:</td><td><strong>${p.name}</strong></td></tr>
      <tr><td class="label">Dorsal / Posición:</td><td>#${p.number} · ${p.position || "Jugador"}</td></tr>
      <tr><td class="label">Año de Nacimiento:</td><td>Año ${birthYear} (${p.birthdate || "Sin fecha registrada"})</td></tr>
      <tr><td class="label">Categoría / Grupo:</td><td>${p.group || "Plantel General"}</td></tr>
      <tr><td class="label">Tutor Responsable:</td><td>${p.tutorName || "Sin tutor"}</td></tr>
      <tr><td class="label">Teléfono de Contacto:</td><td>${p.phone || "Sin teléfono"}</td></tr>
      <tr><td class="label">Estatus en Registro:</td><td>${p.regStatus || "Activo"}</td></tr>
    </table>
  </div>

  <div class="doc-section">
    <h3 style="color:#0b132b; border-bottom: 2px solid #0b132b; padding-bottom: 5px;">ESTADO DE EXPEDIENTE DIGITAL (${docCount}/5 COMPLETADO)</h3>
    <table class="doc-table">
      <thead>
        <tr>
          <th>Documento Oficial</th>
          <th>Estado de Verificación</th>
          <th>Archivo Digital Adjunto</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Acta de Nacimiento</strong></td>
          <td>${p.docActa ? '<span class="badge-ok">VERIFICADO</span>' : '<span class="badge-off">PENDIENTE</span>'}</td>
          <td>${p.docFiles && p.docFiles.docActa ? `✓ ${p.docFiles.docActa.fileName}` : "Sin archivo adjunto"}</td>
        </tr>
        <tr>
          <td><strong>CURP Oficial</strong></td>
          <td>${p.docCURP ? '<span class="badge-ok">VERIFICADO</span>' : '<span class="badge-off">PENDIENTE</span>'}</td>
          <td>${p.docFiles && p.docFiles.docCURP ? `✓ ${p.docFiles.docCURP.fileName}` : "Sin archivo adjunto"}</td>
        </tr>
        <tr>
          <td><strong>Certificado Médico</strong></td>
          <td>${p.docMedico ? '<span class="badge-ok">VERIFICADO</span>' : '<span class="badge-off">PENDIENTE</span>'}</td>
          <td>${p.docFiles && p.docFiles.docMedico ? `✓ ${p.docFiles.docMedico.fileName}` : "Sin archivo adjunto"}</td>
        </tr>
        <tr>
          <td><strong>Identificación Tutor (INE)</strong></td>
          <td>${p.docINE ? '<span class="badge-ok">VERIFICADO</span>' : '<span class="badge-off">PENDIENTE</span>'}</td>
          <td>${p.docFiles && p.docFiles.docINE ? `✓ ${p.docFiles.docINE.fileName}` : "Sin archivo adjunto"}</td>
        </tr>
        <tr>
          <td><strong>Certificado Escolar / Credencial</strong></td>
          <td>${p.docEscolar ? '<span class="badge-ok">VERIFICADO</span>' : '<span class="badge-off">PENDIENTE</span>'}</td>
          <td>${p.docFiles && p.docFiles.docEscolar ? `✓ ${p.docFiles.docEscolar.fileName}` : "Sin archivo adjunto"}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="footer">
    <span>LAGUNA ATHLETIC CLUB · COORDINACIÓN DEPORTIVA</span>
    <span>DOCUMENTO INTERNO DE VALIDEZ OFICIAL</span>
  </div>

  </body></html>`;

  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 450);
  }
}
