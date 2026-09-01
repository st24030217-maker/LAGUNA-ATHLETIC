/* ==========================================================================
   LAGUNA ATHLETIC 2026 — js/payments.js
   Módulo de pagos, plan familiar (hermanos), matriz mensual y recibos.
   ========================================================================== */

import { squadData, paymentsData } from "./state.js";
import { showToast } from "./ui.js";
import { ensureRegFields } from "./registration.js";

export let currentReceiptPaymentId = null;

let _saveData = () => {};
export function injectPaymentsCallbacks({ saveData }) {
  _saveData = saveData || _saveData;
}

export function populatePaymentPlayerSelect() {
  const select = document.getElementById("payPlayerSelect");
  const familySelect = document.getElementById("payFamilySelect");
  if (!select) return;

  select.innerHTML =
    '<option value="" disabled selected>Selecciona un alumno...</option>';
  if (familySelect)
    familySelect.innerHTML =
      '<option value="" disabled selected>Selecciona una familia...</option>';

  const familiesMap = {};

  squadData.forEach((p) => {
    ensureRegFields(p);
    const siblings = detectSiblings(p.id);
    const sibLabel =
      siblings.length > 0
        ? ` (Hermano: ${siblings.map((s) => "#" + s.number + " " + s.name).join(", ")})`
        : "";
    select.innerHTML += `<option value="${p.id}">#${p.number} ${p.name} - Tutor: ${p.tutorName}${sibLabel}</option>`;

    const tName = p.tutorName || "Sin Tutor";
    if (!familiesMap[tName]) familiesMap[tName] = [];
    familiesMap[tName].push(p);
  });

  if (familySelect) {
    Object.keys(familiesMap).forEach((famName) => {
      const children = familiesMap[famName];
      const tag =
        children.length > 1
          ? ` (${children.length} Hermanos - PLAN FAMILIA)`
          : ` (1 Hijo)`;
      familySelect.innerHTML += `<option value="${famName}">${famName}${tag}</option>`;
    });
  }

  const payDateInp = document.getElementById("payDate");
  if (payDateInp) {
    payDateInp.value = new Date().toISOString().split("T")[0];
  }
}

export function populateSiblingSelect(currentPlayerId) {
  const select = document.getElementById("regLinkedSibling");
  if (!select) return;
  select.innerHTML = '<option value="">— Ninguno / Sin Hermanos —</option>';
  squadData.forEach((p) => {
    if (p.id !== currentPlayerId) {
      select.innerHTML += `<option value="${p.id}">#${p.number} ${p.name} (${p.tutorName || "Tutor"})</option>`;
    }
  });
}

export function togglePaymentScope(mode) {
  const btnInd = document.getElementById("btnModeIndividual");
  const btnFam = document.getElementById("btnModeFamily");
  const groupInd = document.getElementById("groupPlayerSelect");
  const groupFam = document.getElementById("groupFamilySelect");
  const scopeInput = document.getElementById("payScopeMode");
  const bundleCard = document.getElementById("familyBundleCard");
  const siblingAlert = document.getElementById("siblingAlertBox");

  if (scopeInput) scopeInput.value = mode;

  if (mode === "family") {
    btnFam?.classList.add("active");
    btnInd?.classList.remove("active");
    groupFam?.classList.remove("hidden");
    groupInd?.classList.add("hidden");
    siblingAlert?.classList.add("hidden");
    populatePaymentPlayerSelect();
  } else {
    btnInd?.classList.add("active");
    btnFam?.classList.remove("active");
    groupInd?.classList.remove("hidden");
    groupFam?.classList.add("hidden");
    bundleCard?.classList.add("hidden");
  }
}

export function onPaymentFamilyChange() {
  const familySelect = document.getElementById("payFamilySelect");
  if (!familySelect) return;
  const familyName = familySelect.value;
  const children = squadData.filter(
    (p) =>
      p.tutorName &&
      p.tutorName.trim().toLowerCase() === familyName.trim().toLowerCase(),
  );

  const bundleCard = document.getElementById("familyBundleCard");
  const cardTitle = document.getElementById("famCardTitle");
  const cardBadge = document.getElementById("famCardBadge");
  const childrenList = document.getElementById("famChildrenList");
  const grandTotalEl = document.getElementById("famGrandTotalDisplay");

  if (children.length === 0) return;

  if (cardTitle)
    cardTitle.innerHTML = `<i class="fa-solid fa-people-roof text-warning"></i> PAQUETE: ${familyName.toUpperCase()}`;
  if (cardBadge)
    cardBadge.innerText = `${children.length} HERMANO${children.length > 1 ? "S" : ""}`;
  if (childrenList) childrenList.innerHTML = "";

  const conceptSelect = document.getElementById("payConcept");
  const basePrice =
    parseFloat(
      conceptSelect?.options[conceptSelect.selectedIndex]?.getAttribute(
        "data-amount",
      ),
    ) || 1200;

  let grandTotal = 0;
  let totalDiscounts = 0;

  children.forEach((child, index) => {
    let childPrice = basePrice;
    let discTag = "";

    if (index > 0) {
      const disc = basePrice * 0.2;
      childPrice = basePrice - disc;
      totalDiscounts += disc;
      discTag = `<span class="badge badge-warning"><i class="fa-solid fa-tag"></i> 2º Hermano (-20%)</span>`;
    } else {
      discTag = `<span class="badge badge-neon"><i class="fa-solid fa-user-check"></i> 1er Hijo (Normal)</span>`;
    }

    grandTotal += childPrice;

    if (childrenList) {
      childrenList.innerHTML += `
        <div class="fam-child-row">
          <div class="fam-child-info">
            <img src="${child.photo || "LAGUNA.jpg"}" alt="${child.name}" style="width:36px; height:36px; border-radius:50%; object-fit:cover; border:1px solid var(--accent-primary);" />
            <div>
              <strong>#${child.number} ${child.name}</strong>
              <br><small class="text-muted">${child.position}</small>
            </div>
          </div>
          <div class="fam-child-price-col">
            ${discTag}
            <div class="mono-text font-bold text-success mt-1">$${childPrice.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN</div>
          </div>
        </div>
      `;
    }
  });

  if (grandTotalEl)
    grandTotalEl.innerText = `$${grandTotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN`;
  const baseInp = document.getElementById("payBaseAmount");
  const discInp = document.getElementById("payDiscountPct");
  const finalInp = document.getElementById("payFinalAmount");

  if (baseInp) baseInp.value = basePrice * children.length;
  if (discInp)
    discInp.value = (
      (totalDiscounts / (basePrice * children.length)) *
      100
    ).toFixed(0);
  if (finalInp) finalInp.value = grandTotal.toFixed(2);

  bundleCard?.classList.remove("hidden");
}

export function detectSiblings(playerId) {
  const player = squadData.find((p) => p.id === playerId);
  if (!player) return [];

  const results = new Map();

  const tutorClean = (player.tutorName || "").trim().toLowerCase();
  if (tutorClean) {
    squadData.forEach((p) => {
      if (
        p.id !== playerId &&
        p.tutorName &&
        p.tutorName.trim().toLowerCase() === tutorClean
      ) {
        results.set(p.id, p);
      }
    });
  }

  if (player.linkedSiblingId) {
    const linked = squadData.find((p) => p.id === player.linkedSiblingId);
    if (linked) results.set(linked.id, linked);
  }
  squadData.forEach((p) => {
    if (p.id !== playerId && p.linkedSiblingId === playerId) {
      results.set(p.id, p);
    }
  });

  return Array.from(results.values());
}

export function onPaymentPlayerChange() {
  const select = document.getElementById("payPlayerSelect");
  if (!select) return;
  const playerId = parseInt(select.value);
  const siblings = detectSiblings(playerId);

  const alertBox = document.getElementById("siblingAlertBox");
  const alertTitle = document.getElementById("siblingAlertTitle");
  const alertDesc = document.getElementById("siblingAlertDesc");
  const discountInput = document.getElementById("payDiscountPct");

  if (siblings.length > 0) {
    const sibNames = siblings.map((s) => s.name).join(", ");
    if (alertTitle)
      alertTitle.innerHTML = `<i class="fa-solid fa-people-roof"></i> ¡Hermanos en el club! (${siblings.length + 1} inscritos)`;
    if (alertDesc)
      alertDesc.innerText = `Hermano(s): ${sibNames}. Se aplicará automáticamente 20% de descuento.`;
    alertBox?.classList.remove("hidden");

    if (discountInput) discountInput.value = 20;
  } else {
    alertBox?.classList.add("hidden");
    if (discountInput) discountInput.value = 0;
  }

  recalculatePaymentTotals();
}

export function onPaymentConceptChange() {
  const select = document.getElementById("payConcept");
  if (!select) return;
  const selectedOption = select.options[select.selectedIndex];
  const defaultAmount =
    parseFloat(selectedOption?.getAttribute("data-amount")) || 0;
  const baseInp = document.getElementById("payBaseAmount");
  if (baseInp) baseInp.value = defaultAmount;
  recalculatePaymentTotals();
}

export function recalculatePaymentTotals() {
  const base = parseFloat(document.getElementById("payBaseAmount")?.value) || 0;
  const pct = parseFloat(document.getElementById("payDiscountPct")?.value) || 0;

  const discountVal = base * (pct / 100);
  const finalVal = Math.max(0, base - discountVal);

  const finalInp = document.getElementById("payFinalAmount");
  if (finalInp) finalInp.value = finalVal.toFixed(2);
}

export function setPaymentType(type) {
  const cardTransfer = document.getElementById("payCardTransfer");
  const cardManual = document.getElementById("payCardManual");
  const inputMethod = document.getElementById("payMethodSelected");
  const labelNotes = document.getElementById("payNotesLabel");
  const inputNotes = document.getElementById("payNotes");

  if (type === "Transferencia SPEI") {
    cardTransfer?.classList.add("active");
    cardManual?.classList.remove("active");
    if (inputMethod) inputMethod.value = "Transferencia SPEI";
    if (labelNotes) labelNotes.innerText = "Folio / Clave de Rastreo SPEI *";
    if (inputNotes) inputNotes.placeholder = "Ej. SPEI 94827110293";
  } else {
    cardManual?.classList.add("active");
    cardTransfer?.classList.remove("active");
    if (inputMethod) inputMethod.value = "Manual Efectivo";
    if (labelNotes) labelNotes.innerText = "Cajero / Entregado En Caja *";
    if (inputNotes) inputNotes.placeholder = "Ej. Recibido por Admin / Caja Central";
  }
}

export function renderMonthlyMatrix() {
  const tbody = document.getElementById("monthlyMatrixBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  squadData.forEach((p) => {
    ensureRegFields(p);

    const hasAugustPaid = paymentsData.some(
      (pay) =>
        pay.playerId === p.id &&
        pay.concept.includes("Colegiatura") &&
        (pay.notes.includes("Agosto") || pay.month === "Agosto 2026") &&
        pay.status === "Pagado",
    );
    const statusBadge = hasAugustPaid
      ? '<span class="badge badge-success"><i class="fa-solid fa-check-circle"></i> PAGADO</span>'
      : '<span class="badge badge-warning"><i class="fa-solid fa-clock"></i> PENDIENTE</span>';

    const siblings = detectSiblings(p.id);
    const sibTag =
      siblings.length > 0
        ? `<br><small class="text-warning"><i class="fa-solid fa-users"></i> Desc. Hermano (-20%)</small>`
        : "";

    tbody.innerHTML += `
      <tr>
        <td>
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <img src="${p.photo || "LAGUNA.jpg"}" style="width:30px; height:30px; border-radius:50%; object-fit:cover;" />
            <div>
              <strong>#${p.number} ${p.name}</strong>
              <br><small class="text-muted">${p.tutorName}</small>
              ${sibTag}
            </div>
          </div>
        </td>
        <td style="white-space:nowrap;">${statusBadge}</td>
        <td style="white-space:nowrap;">
          <button class="btn btn-ghost" style="padding:0.3rem 0.6rem; font-size:0.75rem;" onclick="quickChargeMonth(${p.id}, 'Agosto 2026')" title="Cobrar Agosto 2026">
            <i class="fa-solid fa-cash-register text-success"></i> Cobrar
          </button>
        </td>
      </tr>
    `;
  });
}

export function quickChargeMonth(playerId, monthName) {
  const select = document.getElementById("payPlayerSelect");
  if (select) {
    select.value = playerId;
    onPaymentPlayerChange();
  }

  const conceptSel = document.getElementById("payConcept");
  if (conceptSel) {
    conceptSel.value = "Colegiatura Mensual";
    onPaymentConceptChange();
  }

  const monthSelect = document.getElementById("payMonthSelect");
  if (monthSelect) monthSelect.value = monthName;

  document
    .getElementById("paymentForm")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
  showToast(`Registrando cobro de ${monthName}...`, "info");
}

export function handlePaymentSubmit(e) {
  if (e) e.preventDefault();

  const scopeMode = document.getElementById("payScopeMode")?.value || "individual";
  const conceptSelect = document.getElementById("payConcept")?.value || "Colegiatura Mensual";
  const monthSelect = document.getElementById("payMonthSelect")?.value || "";
  const concept =
    conceptSelect === "Colegiatura Mensual"
      ? `Colegiatura Mensual (${monthSelect})`
      : conceptSelect;
  const method = document.getElementById("payMethodSelected")?.value || "Transferencia SPEI";
  const date = document.getElementById("payDate")?.value || new Date().toISOString().split("T")[0];
  const status = document.getElementById("payStatus")?.value || "Pagado";
  const notes = document.getElementById("payNotes")?.value.trim() || "";

  const baseAmount =
    parseFloat(document.getElementById("payBaseAmount")?.value) || 0;
  const discountPct =
    parseFloat(document.getElementById("payDiscountPct")?.value) || 0;
  const discountAmount = baseAmount * (discountPct / 100);
  const finalAmount =
    parseFloat(document.getElementById("payFinalAmount")?.value) || 0;

  const newId = Date.now();
  const folio = `LA-PAGO-${Math.floor(1000 + Math.random() * 9000)}`;

  if (scopeMode === "family") {
    const familyName = document.getElementById("payFamilySelect")?.value;
    const children = squadData.filter(
      (p) =>
        p.tutorName &&
        p.tutorName.trim().toLowerCase() === familyName.trim().toLowerCase(),
    );

    if (children.length === 0)
      return showToast("Selecciona una familia válida.", "error");

    const namesStr = children.map((c) => `#${c.number} ${c.name}`).join(", ");

    const newPayment = {
      id: newId,
      folio,
      playerId: children[0].id,
      playerName: `PLAN FAMILIA (${children.length} Hermanos: ${namesStr})`,
      tutorName: familyName,
      concept: `PAQUETE FAMILIAR - ${concept}`,
      month: monthSelect,
      baseAmount,
      discountPct,
      discountAmount,
      finalAmount,
      method,
      date,
      status,
      isFamilyBundle: true,
      childrenNames: namesStr,
      notes:
        notes ||
        (method === "Transferencia SPEI"
          ? "Pago Único SPEI Familia"
          : "Pago Efectivo Caja Familia"),
    };

    paymentsData.unshift(newPayment);
    _saveData();

    showToast(
      `Cobro Unificado ${folio} por $${finalAmount.toFixed(2)} registrado para ${familyName}.`,
      "success",
    );
  } else {
    const playerId = parseInt(document.getElementById("payPlayerSelect")?.value);
    const player = squadData.find((p) => p.id === playerId);
    if (!player) return showToast("Selecciona un niño válido.", "error");

    const newPayment = {
      id: newId,
      folio,
      playerId: player.id,
      playerName: `${player.name} (#${player.number})`,
      tutorName: player.tutorName,
      concept,
      month: monthSelect,
      baseAmount,
      discountPct,
      discountAmount,
      finalAmount,
      method,
      date,
      status,
      isFamilyBundle: false,
      notes:
        notes ||
        (method === "Transferencia SPEI"
          ? "Comprobante SPEI"
          : "Pago Efectivo Caja"),
    };

    paymentsData.unshift(newPayment);
    _saveData();

    showToast(`Pago ${folio} por ${method} registrado con éxito.`, "success");
  }

  renderPaymentsTable();
  renderMonthlyMatrix();
  updatePaymentSummaryStats();
  openReceiptModal(newId);
}

export function renderPaymentsTable() {
  const tbody = document.getElementById("paymentsTableBody");
  const searchVal = (
    document.getElementById("paySearchInput")?.value || ""
  ).toLowerCase();
  if (!tbody) return;
  tbody.innerHTML = "";

  const filtered = paymentsData.filter((p) => {
    return (
      !searchVal ||
      p.folio.toLowerCase().includes(searchVal) ||
      p.playerName.toLowerCase().includes(searchVal) ||
      p.tutorName.toLowerCase().includes(searchVal) ||
      p.concept.toLowerCase().includes(searchVal) ||
      (p.method && p.method.toLowerCase().includes(searchVal))
    );
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding:2rem;">Sin registros de pagos en el historial.</td></tr>`;
    return;
  }

  filtered.forEach((p) => {
    const badgeStatus =
      p.status === "Pagado" ? "badge-success" : "badge-warning";
    const hasDiscount = p.discountPct > 0;
    const discountBadge = hasDiscount
      ? `<span class="badge badge-warning" style="font-size:0.65rem;"><i class="fa-solid fa-tag"></i> -${p.discountPct}% Hermano</span>`
      : "";
    const methodBadge =
      p.method === "Transferencia SPEI"
        ? '<span class="badge badge-neon" style="font-size:0.65rem;"><i class="fa-solid fa-building-columns"></i> SPEI</span>'
        : '<span class="badge" style="font-size:0.65rem; border-color:var(--border-strong);"><i class="fa-solid fa-money-bill"></i> Efectivo</span>';

    tbody.innerHTML += `
      <tr>
        <td class="mono-text" style="white-space:nowrap;">
          <strong>${p.folio}</strong>
          <br><small class="text-muted">${p.date}</small>
        </td>
        <td>
          <strong>${p.playerName}</strong>
          <br><small class="text-muted">Tutor: ${p.tutorName}</small>
        </td>
        <td>${p.concept}</td>
        <td style="white-space:nowrap;">${methodBadge}</td>
        <td class="mono-text text-success font-bold" style="white-space:nowrap;">
          $${p.finalAmount.toFixed(2)}
          <br>${discountBadge}
        </td>
        <td style="white-space:nowrap;"><span class="badge ${badgeStatus}">${p.status}</span></td>
        <td style="white-space:nowrap;">
          <button class="btn btn-ghost" style="padding:0.4rem 0.6rem; font-size:0.8rem;" onclick="openReceiptModal(${p.id})">
            <i class="fa-solid fa-receipt text-primary"></i> Recibo
          </button>
        </td>
      </tr>
    `;
  });
}

export function updatePaymentSummaryStats() {
  let paidTotal = 0;
  let pendingTotal = 0;
  let totalDiscounts = 0;
  const siblingFamiliesSet = new Set();

  paymentsData.forEach((p) => {
    if (p.status === "Pagado") {
      paidTotal += p.finalAmount;
    } else {
      pendingTotal += p.finalAmount;
    }
    totalDiscounts += p.discountAmount || 0;

    if (p.discountPct > 0) {
      siblingFamiliesSet.add(p.tutorName);
    }
  });

  const totalCollectedEl = document.getElementById("payTotalCollected");
  const paidEl = document.getElementById("statTotalPaid");
  const pendingEl = document.getElementById("statTotalPending");
  const sibEl = document.getElementById("statSiblingsCount");
  const discEl = document.getElementById("statTotalDiscounts");

  if (totalCollectedEl)
    totalCollectedEl.innerText = `$${paidTotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;
  if (paidEl)
    paidEl.innerText = `$${paidTotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;
  if (pendingEl)
    pendingEl.innerText = `$${pendingTotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;
  if (sibEl) sibEl.innerText = `${siblingFamiliesSet.size} Familias`;
  if (discEl)
    discEl.innerText = `$${totalDiscounts.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;
}

export function openReceiptModal(paymentId) {
  const p = paymentsData.find((x) => x.id === paymentId);
  if (!p) return;

  currentReceiptPaymentId = paymentId;

  const receiptFolio = document.getElementById("receiptFolio");
  const receiptDate = document.getElementById("receiptDate");
  const receiptStudent = document.getElementById("receiptStudent");
  const receiptTutor = document.getElementById("receiptTutor");
  const receiptConcept = document.getElementById("receiptConcept");
  const receiptMethod = document.getElementById("receiptMethod");
  const receiptBase = document.getElementById("receiptBase");
  const receiptTotal = document.getElementById("receiptTotal");

  if (receiptFolio) receiptFolio.innerText = `FOLIO: #${p.folio}`;
  if (receiptDate) receiptDate.innerText = p.date;
  if (receiptStudent) receiptStudent.innerText = p.playerName;
  if (receiptTutor) receiptTutor.innerText = p.tutorName;
  if (receiptConcept) receiptConcept.innerText = p.concept;
  if (receiptMethod) receiptMethod.innerText = p.method;
  if (receiptBase) receiptBase.innerText = `$${p.baseAmount.toFixed(2)}`;

  const discountRow = document.getElementById("receiptDiscountRow");
  if (discountRow) {
    if (p.discountPct > 0) {
      discountRow.style.display = "flex";
      const discEl = document.getElementById("receiptDiscount");
      if (discEl) discEl.innerText = `-$${p.discountAmount.toFixed(2)} (${p.discountPct}% Hermanos)`;
    } else {
      discountRow.style.display = "none";
    }
  }

  if (receiptTotal) receiptTotal.innerText = `$${p.finalAmount.toFixed(2)} MXN`;
  document.getElementById("paymentReceiptModal")?.classList.remove("hidden");
}

export function closeReceiptModal() {
  document.getElementById("paymentReceiptModal")?.classList.add("hidden");
}

export function printReceipt() {
  window.print();
}

export function exportPaymentsPrint() {
  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  let total = 0;
  const rows = paymentsData
    .map((p) => {
      if (p.status === "Pagado") total += p.finalAmount || 0;
      return `
      <tr>
        <td><strong>${p.folio}</strong></td>
        <td>${p.date}</td>
        <td>${p.playerName}</td>
        <td>${p.concept}</td>
        <td>${p.method}</td>
        <td style="font-weight:bold;">$${(p.finalAmount || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</td>
        <td style="color:${p.status === "Pagado" ? "#16a34a" : "#d97706"}; font-weight:bold;">${p.status}</td>
      </tr>
    `;
    })
    .join("");

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Reporte Financiero - Laguna Athletic</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 25px; color: #1e293b; }
    .header-box { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 15px; }
    .header-left { display: flex; align-items: center; gap: 12px; }
    .club-logo { width: 55px; height: 55px; border-radius: 50%; border: 2px solid #f59e0b; }
    h1 { font-size: 1.35rem; margin: 0; color: #1e3a8a; }
    p { color: #64748b; font-size: 0.85rem; margin: 2px 0 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; font-size: 0.85rem; }
    th { background: #f1f5f9; font-weight: 700; color: #334155; }
    tr:nth-child(even) { background: #f8fafc; }
    .total-row td { font-weight:bold; background: #ecfdf5; border-top: 2px solid #10b981; }
    .footer { margin-top: 2.5rem; font-size: 0.75rem; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 0.75rem; }
  </style></head><body>
  <div class="header-box">
    <div class="header-left">
      <img src="LAGUNA.jpg" alt="Logo" class="club-logo" />
      <div>
        <h1>LAGUNA ATHLETIC CLUB</h1>
        <p>REPORTE GENERAL DE COBRANZA Y ESTADO FINANCIERO · 2026</p>
      </div>
    </div>
    <div style="text-align:right;"><span style="background:#1e3a8a; color:#fff; padding:3px 8px; border-radius:4px; font-size:0.75rem; font-weight:bold;">FINANZAS</span><p style="font-size:0.8rem; color:#64748b; margin-top:3px;">${today}</p></div>
  </div>
  <p>${paymentsData.length} movimientos registrados · Total Recaudado: <strong>$${total.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN</strong></p>
  <table>
    <thead><tr><th>Folio</th><th>Fecha</th><th>Alumno / Familia</th><th>Concepto</th><th>Método</th><th>Monto Neto</th><th>Estado</th></tr></thead>
    <tbody>${rows}
    <tr class="total-row"><td colspan="5">TOTAL CONFIRMADO</td><td>$${total.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN</td><td></td></tr>
    </tbody>
  </table>
  <div class="footer">Laguna Athletic 2026 · Administración y Finanzas · Impreso el ${new Date().toLocaleString("es-ES")}</div>
  </body></html>`;

  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 400);
  }
}
