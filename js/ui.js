/* ==========================================================================
   LAGUNA ATHLETIC 2026 — js/ui.js
   Módulo de interfaz: toasts, navegación, loading screen, carousel login.
   ========================================================================== */

import { currentRole, isTabAllowedForGuardian } from "./state.js";

// ---------------------------------------------------------------------------
// TOASTS
// ---------------------------------------------------------------------------
export function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  let icon = "fa-circle-info";
  if (type === "success") icon = "fa-circle-check";
  if (type === "warning") icon = "fa-triangle-exclamation";
  if (type === "error")   icon = "fa-circle-xmark";
  // `message` puede venir de entradas de usuario, QR o servicios remotos.  No
  // lo interpoles como HTML: un toast no necesita aceptar marcado.
  const iconEl = document.createElement("i");
  iconEl.className = `fa-solid ${icon} toast-icon`;
  const messageEl = document.createElement("span");
  messageEl.textContent = String(message ?? "");
  toast.append(iconEl, messageEl);
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ---------------------------------------------------------------------------
// LOADING SCREEN
// ---------------------------------------------------------------------------
export function triggerAppLoading(message = "Cargando plataforma...", durationMs = 1100, callback = null) {
  const loadingOverlay = document.getElementById("appLoadingScreen");
  const barFill        = document.getElementById("loadingBarFill");
  const percentText    = document.getElementById("loadingPercent");
  const statusText     = document.getElementById("loadingStatusText");

  if (!loadingOverlay) { if (callback) callback(); return; }

  barFill.style.width    = "0%";
  percentText.innerText  = "0%";
  statusText.innerText   = "Iniciando sesión segura...";
  loadingOverlay.classList.remove("hidden");
  loadingOverlay.style.opacity = "1";

  const startTime = Date.now();
  const interval  = setInterval(() => {
    const elapsed  = Date.now() - startTime;
    const progress = Math.min(100, Math.floor((elapsed / durationMs) * 100));

    barFill.style.width   = `${progress}%`;
    percentText.innerText = `${progress}%`;

    if      (progress < 30)  statusText.innerText = "Verificando credenciales oficiales...";
    else if (progress < 65)  statusText.innerText = "Cargando expedientes del plantel y calendario...";
    else if (progress < 90)  statusText.innerText = "Sincronizando registros y estadísticas...";
    else                     statusText.innerText = "Panel listo. Bienvenido al sistema.";

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        loadingOverlay.style.opacity = "0";
        setTimeout(() => {
          loadingOverlay.classList.add("hidden");
          if (callback) callback();
        }, 250);
      }, 200);
    }
  }, 30);
}

// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// NAVEGACIÓN DE MÓDULOS
// ---------------------------------------------------------------------------
export function showModuleTab(tabId, { onHomeRender, onStatsResize, onNoticesInit, onExpedientesRender } = {}) {
  // Si el usuario activo es padre/tutor (guardian), restringir a solo sus secciones autorizadas
  if (currentRole === "guardian" && !isTabAllowedForGuardian(tabId)) {
    showToast("Esta sección es de uso exclusivo del cuerpo técnico y directiva.", "warning");
    tabId = "mod-home";
  }

  document.querySelectorAll(".module-panel").forEach((el) => el.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach((el) => el.classList.remove("active"));
  document.querySelectorAll(".dock-item").forEach((el) => el.classList.remove("active"));

  const targetPanel = document.getElementById(tabId);
  if (targetPanel) targetPanel.classList.add("active");

  const tabBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
  if (tabBtn) {
    tabBtn.classList.add("active");
    const parentGroup = tabBtn.closest(".nav-group");
    if (parentGroup && !parentGroup.classList.contains("open")) parentGroup.classList.add("open");
  }

  document.querySelectorAll(".notch-nav-pill").forEach((el) => {
    const isTarget = el.getAttribute("onclick")?.includes(tabId);
    el.classList.toggle("active", Boolean(isTarget));
  });

  if (tabId === "mod-home"         && typeof onHomeRender        === "function") onHomeRender();
  if (tabId === "mod-estadisticas" && typeof onStatsResize      === "function") onStatsResize();
  if (tabId === "mod-avisos"       && typeof onNoticesInit       === "function") onNoticesInit();
  if (tabId === "mod-expedientes"  && typeof onExpedientesRender === "function") onExpedientesRender();

  if (window.innerWidth <= 900) {
    document.getElementById("mainSidebar")?.classList.remove("open");
    document.getElementById("sidebarBackdrop")?.classList.remove("active");
  }
}

export function toggleNavGroup(groupId) {
  document.getElementById(groupId)?.classList.toggle("open");
}

export function toggleSidebar() {
  const sidebar = document.getElementById("mainSidebar");
  const backdrop = document.getElementById("sidebarBackdrop");
  if (!sidebar) return;
  const isOpen = sidebar.classList.toggle("open");
  if (backdrop) {
    backdrop.classList.toggle("active", isOpen);
  }
}

// ---------------------------------------------------------------------------
// MODAL DE CONFIRMACIÓN PERSONALIZADO
// ---------------------------------------------------------------------------
let confirmCallback = null;

export function showConfirmModal(title, message, confirmLabel, confirmClass, callback) {
  confirmCallback    = callback;
  const modal        = document.getElementById("customConfirmModal");
  const titleEl      = document.getElementById("confirmModalTitle");
  const msgEl        = document.getElementById("confirmModalMessage");
  const btn          = document.getElementById("confirmModalBtn");

  if (titleEl) titleEl.textContent = title;
  if (msgEl)   msgEl.textContent   = message;
  if (btn) {
    btn.textContent = confirmLabel || "Confirmar";
    btn.className   = `btn btn-primary ${confirmClass || ""}`;
    if (confirmClass === "btn-danger-style") {
      btn.style.background   = "var(--accent-danger)";
      btn.style.borderColor  = "var(--accent-danger)";
    } else {
      btn.style.background   = "";
      btn.style.borderColor  = "";
    }
  }
  modal?.classList.remove("hidden");
}

export function closeConfirmModal() {
  document.getElementById("customConfirmModal")?.classList.add("hidden");
  confirmCallback = null;
}

export function executeConfirmModal() {
  const cb = confirmCallback;
  closeConfirmModal();
  if (typeof cb === "function") cb();
}

// ---------------------------------------------------------------------------
// ESCUCHA DE ESC Y CLIC EN FONDO DE MODALES
// ---------------------------------------------------------------------------
export function initModalDismiss() {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal-overlay:not(.hidden)").forEach((m) => m.classList.add("hidden"));
    }
  });
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      e.target.classList.add("hidden");
    }
  });
}

// ---------------------------------------------------------------------------
// STATEFUL BUTTON (ESTILO ACETERNITY UI ADAPTADO A VANILLA JS)
// ---------------------------------------------------------------------------
export async function triggerStatefulButton(btn, asyncFn, options = {}) {
  if (!btn || btn.classList.contains("is-loading")) return;
  const originalHtml = btn.innerHTML;
  const loadingText = options.loadingText !== undefined ? options.loadingText : null;
  const successText = options.successText !== undefined ? options.successText : null;

  btn.disabled = true;
  btn.classList.add("btn-stateful-active", "is-loading");
  btn.innerHTML = `
    <span class="stateful-wrap">
      <svg class="stateful-loader" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M12 3a9 9 0 1 0 9 9" stroke-linecap="round" />
      </svg>
      <span class="stateful-text">${loadingText || btn.textContent.trim()}</span>
    </span>
  `;

  try {
    const result = await asyncFn();
    btn.classList.remove("is-loading");
    btn.classList.add("is-success");
    btn.innerHTML = `
      <span class="stateful-wrap">
        <svg class="stateful-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <span class="stateful-text">${successText || "¡Listo!"}</span>
      </span>
    `;
    await new Promise((r) => setTimeout(r, options.successDuration || 900));
    return result;
  } catch (err) {
    btn.classList.remove("is-loading");
    btn.classList.add("is-error");
    await new Promise((r) => setTimeout(r, 600));
    throw err;
  } finally {
    btn.classList.remove("btn-stateful-active", "is-loading", "is-success", "is-error");
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
}

// ---------------------------------------------------------------------------
// FLIP-TEXT RENDERER (VengeanceUI / shadcn) — Animación 3D de caracteres
// ---------------------------------------------------------------------------
export function renderFlipText(text, options = {}) {
  if (!text) return "";
  const duration = options.duration ?? 2.6;
  const delay = options.delay ?? 0;
  const loop = options.loop !== false;
  const together = options.together ?? false;
  const separator = options.separator ?? " ";
  const customClass = options.className || "";

  const words = String(text).split(separator);
  const totalChars = String(text).length || 1;

  let globalIndex = 0;
  const wordsHtml = words
    .map((word, wordIndex) => {
      const chars = Array.from(word);
      const charsHtml = chars
        .map((char) => {
          let calculatedDelay = delay;
          if (!together) {
            const normalizedIndex = globalIndex / totalChars;
            const sineValue = Math.sin(normalizedIndex * (Math.PI / 2));
            calculatedDelay = sineValue * (duration * 0.22) + delay;
          }
          globalIndex++;
          const safeChar = char === " " ? "&nbsp;" : char;
          return `<span class="flip-char" data-char="${char}" style="--flip-duration: ${duration}s; --flip-delay: ${calculatedDelay.toFixed(3)}s; --flip-iteration: ${loop ? "infinite" : "1"};">${safeChar}</span>`;
        })
        .join("");

      if (separator === " ") globalIndex++;

      const sepSpan =
        wordIndex < words.length - 1
          ? `<span class="whitespace inline-block">&nbsp;</span>`
          : "";
      return `<span class="word">${charsHtml}</span>${sepSpan}`;
    })
    .join("");

  return `<span class="flip-text-wrapper ${customClass}">${wordsHtml}</span>`;
}
