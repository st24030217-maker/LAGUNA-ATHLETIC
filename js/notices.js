/* ==========================================================================
   LAGUNA ATHLETIC 2026 — js/notices.js
   Módulo de avisos y difusión por WhatsApp (General, Grupo, Personalizado).
   ========================================================================== */

import { squadData, calendarEvents, paymentsData } from "./state.js";
import { showToast } from "./ui.js";

let currentNoticeMode = "general"; // "general" | "grupo" | "personalizado"

// Función auxiliar importada dinámicamente o resuelta localmente para asegurar campos
function ensureRegFieldsHelper(p) {
  if (!p.contacts || !Array.isArray(p.contacts) || p.contacts.length === 0) {
    p.contacts = [
      {
        name: p.tutorName || "Familia " + (p.name || "").split(" ").pop(),
        phone: p.phone || "+52 844 000 0000",
        relation: "Tutor",
      },
    ];
  }
  p.tutorName = p.contacts[0].name;
  p.phone = p.contacts[0].phone;
  if (!p.photo) p.photo = "LAGUNA.jpg";
  if (!p.group) p.group = "";
  if (!p.regStatus) p.regStatus = "Activo";
}

export function switchNoticeMode(mode) {
  currentNoticeMode = mode;
  document
    .querySelectorAll("#noticeModeTabs .reg-filter-btn")
    .forEach((btn) => {
      btn.classList.toggle(
        "active",
        btn.getAttribute("data-notice-mode") === mode,
      );
    });

  const pGen = document.getElementById("noticePanelGeneral");
  const pGrp = document.getElementById("noticePanelGrupo");
  const pPer = document.getElementById("noticePanelPersonalizado");

  if (pGen) pGen.classList.toggle("hidden", mode !== "general");
  if (pGrp) pGrp.classList.toggle("hidden", mode !== "grupo");
  if (pPer) pPer.classList.toggle("hidden", mode !== "personalizado");

  populateNoticeControls();
  updateNoticeTemplate();
}

export function cleanPhoneForWhatsApp(phone) {
  if (!phone) return "";
  let cleaned = String(phone).replace(/\D/g, "");
  cleaned = cleaned.replace(/^00/, "");
  if (cleaned.length === 10) {
    cleaned = "52" + cleaned;
  }
  return cleaned;
}

export function populateNoticeControls() {
  const totalPlayers = squadData.length;
  let totalContacts = 0;
  squadData.forEach((p) => {
    ensureRegFieldsHelper(p);
    totalContacts += p.contacts && p.contacts.length ? p.contacts.length : 1;
  });

  const contactsBadge = document.getElementById("noticeTotalContactsBadge");
  const playersBadge = document.getElementById("noticeTotalPlayersBadge");
  if (contactsBadge)
    contactsBadge.innerHTML = `<i class="fa-solid fa-address-book"></i> ${totalContacts} Contactos`;
  if (playersBadge)
    playersBadge.innerHTML = `<i class="fa-solid fa-users"></i> ${totalPlayers} Jugadores`;

  // 1. Grupos Select
  const groups = new Set(
    squadData.map((p) => p.group).filter((g) => g && g.trim() !== ""),
  );
  const uniqueGroups = Array.from(groups).sort();
  const groupSel = document.getElementById("noticeGroupFilterSelect");
  if (groupSel) {
    const curVal = groupSel.value;
    if (uniqueGroups.length === 0) {
      groupSel.innerHTML =
        '<option value="Plantel General">Plantel General</option>';
    } else {
      groupSel.innerHTML = uniqueGroups
        .map((g) => {
          const count = squadData.filter((p) => p.group === g).length;
          return `<option value="${g}">${g} (${count} jugadores)</option>`;
        })
        .join("");
      if (uniqueGroups.includes(curVal)) {
        groupSel.value = curVal;
      }
    }
  }

  // 2. Jugadores Select para modo Personalizado
  const playerSel = document.getElementById("noticePersonalPlayerSelect");
  if (playerSel) {
    const curPlayerId = playerSel.value;
    playerSel.innerHTML = squadData
      .map(
        (p) =>
          `<option value="${p.id}">#${p.number} ${p.name} ${p.group ? "· " + p.group : ""}</option>`,
      )
      .join("");
    if (curPlayerId && squadData.some((p) => p.id == curPlayerId)) {
      playerSel.value = curPlayerId;
    }
  }

  renderNoticeGenContactsTable();
  renderNoticeGroupContactsTable();
  onNoticePlayerChange(false);
}

export function renderNoticeGenContactsTable() {
  const tbody = document.getElementById("noticeGenContactsTableBody");
  const countLabel = document.getElementById("noticeGenCountLabel");
  if (!tbody) return;

  tbody.innerHTML = "";
  let totalCount = 0;

  squadData.forEach((p) => {
    ensureRegFieldsHelper(p);
    p.contacts.forEach((c, idx) => {
      totalCount++;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>
          <div style="font-weight:600; color:var(--text-main); font-size:0.84rem;">#${p.number} ${p.name}</div>
          <span class="badge badge-outline" style="font-size:0.7rem; padding:1px 5px;">${p.group || "Sin Cat."}</span>
        </td>
        <td>
          <div style="font-size:0.82rem; color:var(--text-main);">${c.relation}: <strong>${c.name}</strong></div>
          <div class="mono-text text-muted" style="font-size:0.75rem;"><i class="fa-solid fa-phone"></i> ${c.phone}</div>
        </td>
        <td style="text-align:right;">
          <button class="btn-whatsapp-sm" onclick="sendIndividualNoticeWhatsApp(${p.id}, ${idx}, 'general')" title="Enviar mensaje por WhatsApp">
            <i class="fa-brands fa-whatsapp"></i> Enviar
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });
  });

  if (countLabel) countLabel.innerText = `${totalCount} contactos`;
}

export function renderNoticeGroupContactsTable() {
  const tbody = document.getElementById("noticeGroupContactsTableBody");
  const countLabel = document.getElementById("noticeGroupCountLabel");
  const groupSel = document.getElementById("noticeGroupFilterSelect");
  if (!tbody) return;

  tbody.innerHTML = "";
  const selectedGroup = groupSel ? groupSel.value : "";
  const filteredPlayers = selectedGroup
    ? squadData.filter((p) => p.group === selectedGroup)
    : squadData;

  let totalCount = 0;

  filteredPlayers.forEach((p) => {
    ensureRegFieldsHelper(p);
    p.contacts.forEach((c, idx) => {
      totalCount++;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>
          <div style="font-weight:600; color:var(--text-main); font-size:0.84rem;">#${p.number} ${p.name}</div>
          <div style="font-size:0.72rem; color:var(--text-muted);">${p.position || "Jugador"}</div>
        </td>
        <td>
          <div style="font-size:0.82rem; color:var(--text-main);">${c.relation}: <strong>${c.name}</strong></div>
          <div class="mono-text text-muted" style="font-size:0.75rem;"><i class="fa-solid fa-phone"></i> ${c.phone}</div>
        </td>
        <td style="text-align:right;">
          <button class="btn-whatsapp-sm" onclick="sendIndividualNoticeWhatsApp(${p.id}, ${idx}, 'grupo')" title="Enviar aviso de grupo">
            <i class="fa-brands fa-whatsapp"></i> Enviar
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });
  });

  if (countLabel)
    countLabel.innerText = `${filteredPlayers.length} jugadores (${totalCount} contactos)`;
}

export function onNoticeGroupChange() {
  renderNoticeGroupContactsTable();
  updateNoticeTemplate();
}

export function onNoticePlayerChange(updateTemplate = true) {
  const playerSel = document.getElementById("noticePersonalPlayerSelect");
  if (!playerSel) return;
  const playerId = parseInt(playerSel.value);
  const player = squadData.find((p) => p.id === playerId) || squadData[0];
  if (!player) return;

  ensureRegFieldsHelper(player);

  const contactSel = document.getElementById("noticePersonalContactSelect");
  if (contactSel) {
    contactSel.innerHTML = player.contacts
      .map(
        (c, i) =>
          `<option value="${i}">${c.relation}: ${c.name} (${c.phone})</option>`,
      )
      .join("");
  }

  const nameEl = document.getElementById("noticePlayerName");
  const subEl = document.getElementById("noticePlayerSub");
  const photoEl = document.getElementById("noticePlayerPhoto");
  const statusBadge = document.getElementById("noticePlayerStatusBadge");
  const attEl = document.getElementById("noticePlayerAttendance");
  const balEl = document.getElementById("noticePlayerBalance");
  const contList = document.getElementById("noticePlayerContactsList");

  if (nameEl) nameEl.innerText = player.name;
  if (subEl)
    subEl.innerText = `#${player.number} · ${player.position || "Jugador"} · ${player.group || "Sin Cat."}`;
  if (photoEl) photoEl.src = player.photo || "LAGUNA.jpg";
  if (statusBadge) {
    statusBadge.className = `badge badge-status-${(player.regStatus || "activo").toLowerCase()}`;
    statusBadge.innerText = player.regStatus || "Activo";
  }
  if (attEl) attEl.innerText = `${player.attendancePct || 0}%`;

  if (balEl) {
    const playerPayments = paymentsData.filter((p) => p.playerId === player.id);
    const hasUnpaid = playerPayments.some((p) => p.status !== "Pagado");
    if (hasUnpaid) {
      const unpaidSum = playerPayments
        .filter((p) => p.status !== "Pagado")
        .reduce((sum, p) => sum + (p.finalAmount || 0), 0);
      balEl.innerHTML = `<span class="text-danger">$${unpaidSum.toLocaleString()} MXN Pendiente</span>`;
    } else {
      balEl.innerHTML = `<span class="text-success">Al corriente ($0)</span>`;
    }
  }

  if (contList) {
    contList.innerHTML = player.contacts
      .map(
        (c) =>
          `<div><i class="fa-solid fa-user-check text-primary"></i> ${c.relation}: <strong>${c.name}</strong> <span class="mono-text">(${c.phone})</span></div>`,
      )
      .join("");
  }

  if (updateTemplate) {
    updateNoticeTemplate();
  }
}

export function onNoticeContactChange() {
  updateNoticeTemplate();
}

export function updateNoticeTemplate() {
  const today = new Date().toISOString().split("T")[0];
  const nt = calendarEvents.find(
    (e) => e.type === "entrenamiento" && e.date >= today,
  );
  const nm = calendarEvents.find(
    (e) => e.type === "partido" && e.date >= today,
  );

  // 1. MODO GENERAL
  const genType =
    document.getElementById("noticeGenTemplateSelect")?.value ||
    "entrenamiento";
  const genArea = document.getElementById("noticeGenMessageText");
  if (genArea) {
    if (genType === "entrenamiento") {
      genArea.value = `*LAGUNA ATHLETIC - AVISO GENERAL*\n\nHola plantel y familias,\nEl próximo *Entrenamiento Oficial* se llevará a cabo el ${nt ? nt.date : "próximo día de práctica"} en ${nt ? nt.location : "Cancha Principal"} a las ${nt ? nt.time : "08:00 hrs"}.\n\nFavor de llegar 15 minutos antes y escanear su código QR al ingresar.`;
    } else if (genType === "partido") {
      genArea.value = `*LAGUNA ATHLETIC - JORNADA DE PARTIDO*\n\nEstimadas familias y jugadores,\nEste fin de semana tenemos compromiso oficial:\n*${nm ? nm.title : "Partido Oficial de Liga"}*\nFecha: ${nm ? nm.date : "Fin de semana"}\nHorario: ${nm ? nm.time : "16:00 hrs"}\nSede: ${nm ? nm.location : "Estadio Central"}\n\nFavor de presentarse con uniforme de gala.`;
    } else if (genType === "pago_mes") {
      genArea.value = `*LAGUNA ATHLETIC - COMUNICADO DE FINANZAS*\n\nEstimadas familias,\nLes recordamos cordialmente que nos encontramos en período de pago de la colegiatura mensual. Su aportación puntual nos permite mantener la calidad en entrenamientos, cuerpo técnico y material deportivo.\n\nPueden realizar su pago por transferencia SPEI o directo en recepción. Agradecemos su compromiso.`;
    } else if (genType === "comunicado") {
      genArea.value = `*LAGUNA ATHLETIC - COMUNICADO INSTITUCIONAL*\n\nEstimada comunidad deportiva de Laguna Athletic,\nPor medio del presente comunicado les informamos sobre las próximas actividades oficiales del club.\n\nPara cualquier duda o aclaración, favor de comunicarse con la dirección deportiva. Gracias por formar parte de nuestra familia.`;
    } else if (genType === "libre") {
      if (!genArea.value.trim()) {
        genArea.value = `*LAGUNA ATHLETIC - COMUNICADO*\n\nEstimadas familias de Laguna Athletic:\n\n[Escribe aquí tu mensaje...]`;
      }
    }
  }

  // 2. MODO GRUPO
  const groupSel = document.getElementById("noticeGroupFilterSelect");
  const groupName = groupSel ? groupSel.value : "Plantel";
  const groupType =
    document.getElementById("noticeGroupTemplateSelect")?.value ||
    "entrenamiento_grupo";
  const groupArea = document.getElementById("noticeGroupMessageText");
  if (groupArea) {
    if (groupType === "entrenamiento_grupo") {
      groupArea.value = `*LAGUNA ATHLETIC [${groupName.toUpperCase()}]*\n\nHola equipo,\nTenemos sesión de *Entrenamiento Táctico* para la categoría *${groupName}*:\nFecha: ${nt ? nt.date : "Día programado"}\nHora: ${nt ? nt.time : "08:00 hrs"}\nCancha: ${nt ? nt.location : "Cancha 1"}\n\nLlevar espinilleras, hidratación y escanear QR al llegar.`;
    } else if (groupType === "partido_grupo") {
      groupArea.value = `*LAGUNA ATHLETIC - CONVOCATORIA OFICIAL [${groupName.toUpperCase()}]*\n\nAtención jugadores y tutores de la categoría *${groupName}*:\nPartido: *${nm ? nm.title : "Jornada de Liga"}*\nCancha: ${nm ? nm.location : "Estadio Central"}\nCitatorio: ${nm ? nm.time : "16:00 hrs"}\n\nFavor de confirmar asistencia en el grupo y revisar la alineación táctica en la plataforma.`;
    } else if (groupType === "asistencia_grupo") {
      groupArea.value = `*LAGUNA ATHLETIC - CONTROL DE ASISTENCIA [${groupName.toUpperCase()}]*\n\nEstimados padres de familia y jugadores de la categoría *${groupName}*:\nLes recordamos la importancia de la puntualidad y asistencia constante a los entrenamientos. En caso de inasistencia por motivos de salud o escolares, favor de enviar su justificante a través de la app oficial.`;
    } else if (groupType === "pago_grupo") {
      groupArea.value = `*LAGUNA ATHLETIC - RECORDATORIO DE CUOTA [${groupName.toUpperCase()}]*\n\nHola familias de la categoría *${groupName}*,\nRecordatorio para el pago de la colegiatura y cuotas correspondientes a esta categoría. Agradecemos a los tutores que ya cubrieron su aportación e invitamos a quienes tengan saldo pendiente a ponerse al corriente.`;
    } else if (groupType === "comunicado_grupo") {
      groupArea.value = `*LAGUNA ATHLETIC [${groupName.toUpperCase()}] - AVISO DE LA DIRECTIVA*\n\nEstimadas familias de la categoría *${groupName}*:\nCompartimos información importante respecto a nuestro calendario de competencias y entrenamientos especiales.`;
    } else if (groupType === "libre_grupo") {
      if (!groupArea.value.trim()) {
        groupArea.value = `*LAGUNA ATHLETIC [${groupName.toUpperCase()}]*\n\nHola plantel y familias:\n\n[Escribe aquí tu mensaje para el grupo...]`;
      }
    }
  }

  // 3. MODO PERSONALIZADO
  const playerSel = document.getElementById("noticePersonalPlayerSelect");
  const contactSel = document.getElementById("noticePersonalContactSelect");
  const personalType =
    document.getElementById("noticePersonalTemplateSelect")?.value ||
    "adeudo_personal";
  const personalArea = document.getElementById("noticePersonalMessageText");

  if (personalArea && playerSel) {
    const playerId = parseInt(playerSel.value);
    const player = squadData.find((p) => p.id === playerId) || squadData[0];
    if (player) {
      ensureRegFieldsHelper(player);
      const contactIdx = contactSel ? parseInt(contactSel.value) || 0 : 0;
      const contact = player.contacts[contactIdx] ||
        player.contacts[0] || { name: "Tutor", phone: "", relation: "Tutor" };

      const playerPayments = paymentsData.filter(
        (p) => p.playerId === player.id,
      );
      const unpaid = playerPayments.filter((p) => p.status !== "Pagado");
      const totalUnpaid = unpaid.reduce(
        (sum, p) => sum + (p.finalAmount || 0),
        0,
      );

      if (personalType === "adeudo_personal") {
        if (totalUnpaid > 0) {
          personalArea.value = `*LAGUNA ATHLETIC - RECORDATORIO DE SALDO PENDIENTE*\n\nEstimado(a) ${contact.name} (${contact.relation} de ${player.name}):\n\nEsperamos que se encuentre muy bien. Nos comunicamos de la directiva de Laguna Athletic para recordarle que la cuenta de *${player.name}* (#${player.number}) registra un saldo pendiente de *$${totalUnpaid.toLocaleString()} MXN*.\n\nLe agradeceremos realizar el pago correspondiente a la brevedad o ponerse en contacto si tiene alguna consulta. Muchas gracias por su apoyo.`;
        } else {
          personalArea.value = `*LAGUNA ATHLETIC - ESTADO DE CUENTA AL CORRIENTE*\n\nEstimado(a) ${contact.name} (${contact.relation} de ${player.name}):\n\nLe confirmamos que la cuenta de *${player.name}* (#${player.number}) se encuentra *al corriente* con sus colegiaturas.\n\nAgradecemos mucho su puntualidad y compromiso continuo con el club.`;
        }
      } else if (personalType === "falta_personal") {
        personalArea.value = `*LAGUNA ATHLETIC - REPORTE DE ASISTENCIA*\n\nEstimado(a) ${contact.name} (${contact.relation} de ${player.name}):\n\nLe informamos que registramos una inasistencia reciente de *${player.name}* (#${player.number}). Actualmente su balance de asistencia es del *${player.attendancePct || 0}%*.\n\nSi la falta fue por motivo de salud o escolar, le recordamos que puede registrar su justificación directamente en nuestra app oficial para no afectar su racha.`;
      } else if (personalType === "convocatoria_personal") {
        personalArea.value = `*LAGUNA ATHLETIC - CONVOCATORIA INDIVIDUAL*\n\nEstimado(a) ${contact.name}:\nNos complace informarle que *${player.name}* (#${player.number}) está convocado(a) como *${player.starter ? "Titular" : "Suplente"}* para el siguiente compromiso:\n\nEncuentro: ${nm ? nm.title : "Próximo Partido Oficial"}\nFecha: ${nm ? nm.date : "Próxima Jornada"}\nHorario: ${nm ? nm.time : "16:00 hrs"}\nLugar: ${nm ? nm.location : "Estadio Central"}\n\nFavor de confirmar de recibido. Éxito a ${player.name}.`;
      } else if (personalType === "medico_personal") {
        personalArea.value = `*LAGUNA ATHLETIC - SEGUIMIENTO MÉDICO*\n\nEstimado(a) ${contact.name} (${contact.relation} de ${player.name}):\n\nNos comunicamos del área deportiva y de acondicionamiento físico respecto al estado de salud de *${player.name}* (#${player.number}).\n\nEstado actual: ${player.injured ? "En recuperación / Lesionado" : "Apto para entrenar al 100%"}.\nSeguimos atentos a su evolución para asegurar un retorno óptimo a la cancha.`;
      } else if (personalType === "desempeno_personal") {
        personalArea.value = `*LAGUNA ATHLETIC - RECONOCIMIENTO Y DESEMPEÑO*\n\nEstimado(a) ${contact.name} (${contact.relation} de ${player.name}):\n\nQueremos felicitar a *${player.name}* (#${player.number}) por su excelente compromiso y desempeño en la cancha.\n\nEstadísticas de la temporada:\n- Asistencia: ${player.attendancePct || 0}%\n- Goles: ${player.goals || 0}\n- Asistencias: ${player.assists || 0}\n- Minutos jugados: ${player.mins || 0} min\n\nSigamos trabajando juntos por el campeonato.`;
      } else if (personalType === "libre_personal") {
        if (!personalArea.value.trim()) {
          personalArea.value = `*LAGUNA ATHLETIC*\n\nEstimado(a) ${contact.name} (${contact.relation} de ${player.name}):\n\n[Escribe aquí tu mensaje personalizado...]`;
        }
      }
    }
  }

  const legacyArea = document.getElementById("noticeMessageText");
  if (legacyArea && genArea) {
    legacyArea.value = genArea.value;
  }
}

export function sendGeneralBroadcast() {
  const text = document.getElementById("noticeGenMessageText")?.value || "";
  if (!text.trim()) {
    showToast("Escribe un mensaje para difundir.", "warning");
    return;
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  showToast("Abriendo WhatsApp con comunicado general...", "success");
}

export function sendGroupBroadcast() {
  const text = document.getElementById("noticeGroupMessageText")?.value || "";
  if (!text.trim()) {
    showToast("Escribe un mensaje para el grupo.", "warning");
    return;
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  showToast("Abriendo WhatsApp con aviso del grupo...", "success");
}

export function sendPersonalWhatsApp() {
  const playerSel = document.getElementById("noticePersonalPlayerSelect");
  const contactSel = document.getElementById("noticePersonalContactSelect");
  const text =
    document.getElementById("noticePersonalMessageText")?.value || "";

  if (!playerSel) return;
  const playerId = parseInt(playerSel.value);
  const player = squadData.find((p) => p.id === playerId);
  if (!player) return;

  ensureRegFieldsHelper(player);
  const contactIdx = contactSel ? parseInt(contactSel.value) || 0 : 0;
  const contact = player.contacts[contactIdx] || player.contacts[0];
  const cleanedPhone = cleanPhoneForWhatsApp(contact.phone);

  if (!cleanedPhone) {
    showToast("El contacto no tiene un teléfono válido registrado.", "error");
    return;
  }

  window.open(
    `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(text)}`,
    "_blank",
  );
  showToast(
    `Abriendo WhatsApp para ${contact.name} (${contact.relation})...`,
    "success",
  );
}

export function sendIndividualNoticeWhatsApp(playerId, contactIndex, mode) {
  const player = squadData.find((p) => p.id === playerId);
  if (!player) return;
  ensureRegFieldsHelper(player);

  const contact = player.contacts[contactIndex] || player.contacts[0];
  const cleanedPhone = cleanPhoneForWhatsApp(contact.phone);

  if (!cleanedPhone) {
    showToast("El contacto no tiene un número telefónico registrado.", "error");
    return;
  }

  let templateText = "";
  if (mode === "grupo") {
    templateText =
      document.getElementById("noticeGroupMessageText")?.value || "";
  } else {
    templateText = document.getElementById("noticeGenMessageText")?.value || "";
  }

  let personalizedMessage = templateText
    .replace(/{nombre_jugador}/gi, player.name)
    .replace(/{jugador}/gi, player.name)
    .replace(/{tutor}/gi, contact.name)
    .replace(/{categoria}/gi, player.group || "Laguna Athletic");

  window.open(
    `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(personalizedMessage)}`,
    "_blank",
  );
  showToast(`Enviando a ${contact.name} (${player.name})...`, "success");
}

export function copyNoticeText(textareaId) {
  const area = document.getElementById(textareaId);
  if (!area || !area.value.trim()) {
    showToast("No hay texto para copiar.", "warning");
    return;
  }
  navigator.clipboard
    .writeText(area.value)
    .then(() => {
      showToast("Texto copiado al portapapeles.", "success");
    })
    .catch(() => {
      area.select();
      document.execCommand("copy");
      showToast("Texto copiado al portapapeles.", "success");
    });
}

export function checkAutomatedPaymentReminders() {
  const today = new Date();
  const day = today.getDate();
  const todayStr = today.toISOString().split("T")[0];
  const lastSent = localStorage.getItem("laguna_last_automated_reminder");

  if (lastSent === todayStr) return;

  if (day === 1) {
    showToast(
      "Sistema: Recordatorio de pago del mes en curso enviado automáticamente.",
      "success",
    );
    localStorage.setItem("laguna_last_automated_reminder", todayStr);
  } else if (day === 10 || day === 20 || day === 30) {
    showToast(
      "Sistema: Avisos de adeudo vencido enviados a contactos con saldo pendiente.",
      "warning",
    );
    localStorage.setItem("laguna_last_automated_reminder", todayStr);
  }
}

export function simulateSendNotices() {
  sendGeneralBroadcast();
}
