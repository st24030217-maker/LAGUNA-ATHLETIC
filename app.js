/* ==========================================================================
   LAGUNA ATHLETIC 2026 - SIMPLIFIED LOGIC & INTERACTIVE MODULES
   ========================================================================== */

let squadData = [
    { id: 1, number: 1, name: "Mateo Silva", position: "Portero", attendancePct: 96, streak: "12 A", status: "Presente", checkinTime: "08:15 AM", starter: true },
    { id: 2, number: 2, name: "Lucas Sánchez", position: "Lateral Derecho", attendancePct: 92, streak: "8 A", status: "Presente", checkinTime: "08:22 AM", starter: true },
    { id: 3, number: 3, name: "Gabriel Gómez", position: "Lateral Izquierdo", attendancePct: 100, streak: "15 A", status: "Presente", checkinTime: "08:10 AM", starter: true },
    { id: 4, number: 4, name: "Nicolás Ramos", position: "Defensa Central", attendancePct: 88, streak: "4 A", status: "Presente", checkinTime: "08:28 AM", starter: true },
    { id: 5, number: 5, name: "Santiago Pérez", position: "Defensa Central", attendancePct: 94, streak: "10 A", status: "Presente", checkinTime: "08:18 AM", starter: true },
    { id: 6, number: 6, name: "Carlos Alcaraz", position: "Medio Defensivo", attendancePct: 91, streak: "7 A", status: "Ausente", checkinTime: "-", starter: true },
    { id: 7, number: 7, name: "Joaquín Torres", position: "Extremo Derecho", attendancePct: 85, streak: "2 A", status: "Presente", checkinTime: "08:30 AM", starter: true },
    { id: 8, number: 8, name: "Diego Valdés", position: "Mediocampista", attendancePct: 95, streak: "11 A", status: "Presente", checkinTime: "08:12 AM", starter: true },
    { id: 9, number: 9, name: "Javier Martínez", position: "Delantero Centro", attendancePct: 98, streak: "14 A", status: "Presente", checkinTime: "08:05 AM", starter: true },
    { id: 10, number: 10, name: "Emilio Suárez", position: "Medio Ofensivo", attendancePct: 90, streak: "6 A", status: "Justificado", checkinTime: "-", starter: true },
    { id: 11, number: 11, name: "Tomás López", position: "Extremo Izquierdo", attendancePct: 89, streak: "5 A", status: "Presente", checkinTime: "08:25 AM", starter: true },
    { id: 12, number: 12, name: "Adrián Fernández", position: "Portero", attendancePct: 93, streak: "9 A", status: "Presente", checkinTime: "08:20 AM", starter: false },
    { id: 13, number: 13, name: "Rodrigo Morales", position: "Defensa Central", attendancePct: 82, streak: "1 A", status: "Ausente", checkinTime: "-", starter: false },
    { id: 14, number: 14, name: "Bautista Castro", position: "Mediocampista", attendancePct: 87, streak: "3 A", status: "Presente", checkinTime: "08:29 AM", starter: false }
];

let calendarEvents = [
    { id: 1, type: "entrenamiento", title: "Entrenamiento Táctico", date: "2026-08-07", time: "08:00 AM", location: "Cancha 1" },
    { id: 2, type: "partido", title: "Partido vs Real San Luis", date: "2026-08-09", time: "16:00 PM", location: "Estadio Central" },
    { id: 3, type: "concentracion", title: "Concentración en Hotel Plaza", date: "2026-08-08", time: "20:00 PM", location: "Hotel Plaza" }
];

let justificationsData = [
    { id: 1, player: "Emilio Suárez (#10)", date: "2026-08-06", reason: "Examen Académico", detail: "Examen final universitario.", status: "Aprobada" },
    { id: 2, player: "Gonzalo Díaz (#17)", date: "2026-08-06", reason: "Médico / Lesión", detail: "Esguince leve de tobillo.", status: "Pendiente" }
];

let currentRole = "dt";
let attendanceChart = null;

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    populateQuickPlayerSelect();
    renderAttendanceTable();
    renderSquadCallupList();
    renderCalendarEvents();
    renderJustifications();
    renderRankingTable();
    initChart();
    generateQRCodes("SESION-LAGUNA-2026-08-06");
    updateNoticeTemplate();
    applyRolePermissions();
});

// --- NAVIGATION & TABS ---
function showModuleTab(tabId) {
    document.querySelectorAll(".module-panel").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(el => el.classList.remove("active"));

    const targetPanel = document.getElementById(tabId);
    if (targetPanel) {
        targetPanel.classList.add("active");
    }
    
    const tabBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    if (tabBtn) {
        tabBtn.classList.add("active");
    }

    if (tabId === 'mod-estadisticas' && attendanceChart) {
        setTimeout(() => { attendanceChart.resize(); }, 100);
    }

    window.scrollTo({ top: 250, behavior: 'smooth' });
}

// --- ROLE SYSTEM ---
function changeUserRole(newRole) {
    currentRole = newRole;
    applyRolePermissions();
}

function applyRolePermissions() {
    const isDT = currentRole === 'dt' || currentRole === 'directiva';
    document.querySelectorAll(".role-dt-only").forEach(el => {
        el.style.display = isDT ? "" : "none";
    });
}

// --- MODULE 01: UNIFORM 100% PERFECT QR CODE GENERATOR ---
function generateQRCodes(text) {
    const imgElem = document.getElementById("qrDisplayImage");
    if (!imgElem) return;
    imgElem.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}&color=050c1a&bgcolor=ffffff`;
}

function populateQuickPlayerSelect() {
    const select = document.getElementById("quickPlayerSelect");
    if (!select) return;
    select.innerHTML = "";
    squadData.forEach(p => {
        const option = document.createElement("option");
        option.value = p.id;
        option.textContent = `#${p.number} ${p.name} (${p.position}) - ${p.status}`;
        select.appendChild(option);
    });
}

function simulateQRCheckIn() {
    const select = document.getElementById("quickPlayerSelect");
    if (!select) return;
    const playerId = parseInt(select.value);
    const player = squadData.find(p => p.id === playerId);
    if (!player) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString("es-ES", { hour: '2-digit', minute: '2-digit' });

    player.status = "Presente";
    player.checkinTime = timeStr;

    const alertBox = document.getElementById("lastCheckinAlert");
    if (alertBox) {
        document.getElementById("lastCheckinText").innerText = `¡Asistencia confirmada para ${player.name} (${timeStr})!`;
        alertBox.classList.remove("hidden");
        setTimeout(() => { alertBox.classList.add("hidden"); }, 3500);
    }

    renderAttendanceTable();
    populateQuickPlayerSelect();
    renderRankingTable();
    updateChartData();
}

function markManualAttendance(playerId, newStatus) {
    const player = squadData.find(p => p.id === playerId);
    if (!player) return;
    player.status = newStatus;
    player.checkinTime = newStatus === 'Presente' ? 'Manual DT' : '-';

    renderAttendanceTable();
    populateQuickPlayerSelect();
    updateChartData();
}

function renderAttendanceTable() {
    const tbody = document.getElementById("attendanceTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    let presentCount = 0;

    squadData.forEach(p => {
        if (p.status === "Presente") presentCount++;

        const tr = document.createElement("tr");
        let badgeClass = "badge-danger";
        if (p.status === "Presente") badgeClass = "badge-success";
        if (p.status === "Justificado") badgeClass = "badge-warning";

        tr.innerHTML = `
            <td><strong>#${p.number}</strong></td>
            <td>${p.name}</td>
            <td><small>${p.position}</small></td>
            <td><span class="badge ${badgeClass}">${p.status}</span></td>
            <td>${p.checkinTime}</td>
            <td class="role-dt-only">
                <button class="btn btn-sm btn-primary" onclick="markManualAttendance(${p.id}, 'Presente')">✔</button>
                <button class="btn btn-sm btn-accent" onclick="markManualAttendance(${p.id}, 'Ausente')">✖</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    const countElem = document.getElementById("attendanceCount");
    if (countElem) {
        countElem.innerText = `${presentCount}/${squadData.length} Presentes`;
    }
}

// --- MODULE 02: TACTICAL LINEUP ---
function changePitchSlot(slotPos) {
    const choice = prompt(`Selecciona el número de dorsal para la posición [${slotPos}]:`);
    if (!choice) return;
    const dorsal = parseInt(choice);
    const selectedPlayer = squadData.find(p => p.number === dorsal);

    if (selectedPlayer) {
        const slotElem = document.getElementById(`slot-${slotPos}`);
        if (slotElem) {
            slotElem.innerText = `${slotPos} (${selectedPlayer.name.split(' ')[1] || selectedPlayer.name})`;
        }
        alert(`¡${selectedPlayer.name} asignado en posición ${slotPos}!`);
    } else {
        alert("Número de dorsal no encontrado.");
    }
}

function saveLineup() {
    alert("¡Convocatoria guardada exitosamente!");
}

function renderSquadCallupList() {
    const container = document.getElementById("squadCallupList");
    if (!container) return;
    container.innerHTML = "";

    squadData.forEach(p => {
        const item = document.createElement("div");
        item.className = "squad-player-item";
        item.innerHTML = `
            <div>
                <strong>#${p.number} ${p.name}</strong>
                <br><small class="text-secondary">${p.position}</small>
            </div>
            <div>
                ${p.starter ? '<span class="badge badge-accent">TITULAR</span>' : '<span class="badge badge-outline">SUPLENTE</span>'}
            </div>
        `;
        container.appendChild(item);
    });
}

// --- MODULE 03: WHATSAPP NOTICES ---
function updateNoticeTemplate() {
    const typeElem = document.getElementById("noticeTypeSelect");
    const textarea = document.getElementById("noticeMessageText");
    if (!typeElem || !textarea) return;

    const type = typeElem.value;
    let text = "";
    if (type === "entrenamiento") {
        text = `*LAGUNA ATHLETIC - RECORDATORIO*\n\nHola plantel,\nMañana tenemos *Entrenamiento Táctico* en Cancha 1 a las 08:00 AM.\n\nFavor de escanear su código QR a la llegada. ⚽`;
    } else if (type === "partido") {
        text = `*LAGUNA ATHLETIC - CONVOCATORIA*\n\nConvocatoria oficial vs *Real San Luis*.\n📍 Estadio Central\n⏰ Citación: 14:30 PM\nUniforme Titular.`;
    } else {
        text = `*LAGUNA ATHLETIC - AVISO DE AUSENCIA*\n\nRegistramos una falta en el entrenamiento de hoy. Favor de justificar en la plataforma.`;
    }

    textarea.value = text;
}

function simulateSendNotices() {
    alert("¡Avisos enviados con éxito por WhatsApp!");
}

// --- MODULE 04: CALENDAR ---
function renderCalendarEvents() {
    const grid = document.getElementById("calendarEventsGrid");
    if (!grid) return;
    grid.innerHTML = "";

    calendarEvents.forEach(ev => {
        const card = document.createElement("div");
        card.className = "event-card";
        card.innerHTML = `
            <div class="event-date">${ev.date} @ ${ev.time}</div>
            <div class="event-title">${ev.title}</div>
            <div class="subtitle-text"><i class="fa-solid fa-location-dot"></i> ${ev.location}</div>
        `;
        grid.appendChild(card);
    });
}

function openAddEventModal() {
    const title = prompt("Nombre del Evento:");
    if (!title) return;
    const date = prompt("Fecha (AAAA-MM-DD):", "2026-08-15");

    calendarEvents.push({
        id: Date.now(),
        type: 'entrenamiento',
        title: title,
        date: date || '2026-08-15',
        time: '09:00 AM',
        location: 'Cancha Laguna'
    });

    renderCalendarEvents();
}

// --- MODULE 05: JUSTIFICATIONS ---
function submitJustification(e) {
    e.preventDefault();
    const date = document.getElementById("justDate").value;
    const reason = document.getElementById("justReason").value;
    const detail = document.getElementById("justDetail").value;

    justificationsData.push({
        id: Date.now(),
        player: "Mateo Silva (#1)",
        date: date,
        reason: reason,
        detail: detail,
        status: "Pendiente"
    });

    renderJustifications();
    alert("¡Justificación enviada al Director Técnico!");
    document.getElementById("justificationForm").reset();
}

function reviewJustification(id, newStatus) {
    const item = justificationsData.find(j => j.id === id);
    if (!item) return;
    item.status = newStatus;
    renderJustifications();
}

function renderJustifications() {
    const container = document.getElementById("justificationsList");
    if (!container) return;
    container.innerHTML = "";

    justificationsData.forEach(j => {
        const card = document.createElement("div");
        card.className = "just-card";

        let badgeClass = "badge-warning";
        if (j.status === "Aprobada") badgeClass = "badge-success";
        if (j.status === "Rechazada") badgeClass = "badge-danger";

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong>${j.player}</strong>
                <span class="badge ${badgeClass}">${j.status}</span>
            </div>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.3rem;">Ausencia: ${j.date} | ${j.reason}</p>
            <p style="font-size:0.85rem;"><em>"${j.detail}"</em></p>
            ${j.status === 'Pendiente' ? `
                <div class="margin-top role-dt-only" style="display:flex; gap:0.5rem;">
                    <button class="btn btn-sm btn-success" onclick="reviewJustification(${j.id}, 'Aprobada')">Aprobar</button>
                    <button class="btn btn-sm btn-accent" onclick="reviewJustification(${j.id}, 'Rechazada')">Rechazar</button>
                </div>
            ` : ''}
        `;
        container.appendChild(card);
    });
}

// --- MODULE 06: STATISTICS & CHART ---
function initChart() {
    const chartCanvas = document.getElementById("attendanceChart");
    if (!chartCanvas || typeof Chart === 'undefined') return;
    const ctx = chartCanvas.getContext("2d");
    attendanceChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Presentes', 'Justificados', 'Faltas'],
            datasets: [{
                data: [11, 1, 2],
                backgroundColor: ['#0066ff', '#f59e0b', '#ef4444'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#ffffff' } }
            }
        }
    });
}

function updateChartData() {
    if (!attendanceChart) return;
    let present = 0, just = 0, absent = 0;
    squadData.forEach(p => {
        if (p.status === 'Presente') present++;
        else if (p.status === 'Justificado') just++;
        else absent++;
    });

    attendanceChart.data.datasets[0].data = [present, just, absent];
    attendanceChart.update();
}

function renderRankingTable() {
    const tbody = document.getElementById("rankingTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const sorted = [...squadData].sort((a, b) => b.attendancePct - a.attendancePct);

    sorted.slice(0, 6).forEach((p, idx) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>#${idx + 1}</strong></td>
            <td>#${p.number} ${p.name}</td>
            <td><strong class="color-accent">${p.attendancePct}%</strong></td>
            <td><span class="badge badge-success">${p.streak}</span></td>
        `;
        tbody.appendChild(tr);
    });
}
