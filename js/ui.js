/* ==========================================================================
   LAGUNA ATHLETIC 2026 — js/ui.js
   Módulo de interfaz: toasts, navegación, loading screen, carousel login.
   ========================================================================== */

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
  toast.innerHTML = `<i class="fa-solid ${icon} toast-icon"></i><span>${message}</span>`;
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
// CAROUSEL DE LOGIN
// ---------------------------------------------------------------------------
export function initLoginCarousel() {
  const carousel       = document.querySelector(".login-image-carousel");
  const dotsContainer  = document.querySelector(".login-carousel-dots");
  if (!carousel || !dotsContainer) return;

  const slides = [...carousel.querySelectorAll(".login-slide")];
  if (slides.length < 2) return;

  let activeIndex = 0;
  let timerId;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const showSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === activeIndex));
    dotsContainer.querySelectorAll(".login-carousel-dot").forEach((dot, i) => {
      dot.classList.toggle("is-active", i === activeIndex);
      dot.setAttribute("aria-current", i === activeIndex ? "true" : "false");
    });
  };

  slides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type      = "button";
    dot.className = "login-carousel-dot";
    dot.setAttribute("aria-label", `Ver imagen ${index + 1}`);
    dot.addEventListener("click", () => {
      showSlide(index);
      if (!prefersReducedMotion) {
        clearInterval(timerId);
        timerId = setInterval(() => showSlide(activeIndex + 1), 5200);
      }
    });
    dotsContainer.appendChild(dot);
  });

  showSlide(0);
  if (!prefersReducedMotion) {
    timerId = setInterval(() => showSlide(activeIndex + 1), 5200);
  }
}

// ---------------------------------------------------------------------------
// NAVEGACIÓN DE MÓDULOS
// ---------------------------------------------------------------------------
export function showModuleTab(tabId, { onHomeRender, onStatsResize, onNoticesInit, onExpedientesRender } = {}) {
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

  const dockItem = document.querySelector(`.dock-item[data-tab="${tabId}"]`);
  if (dockItem) dockItem.classList.add("active");

  if (tabId === "mod-home"         && typeof onHomeRender        === "function") onHomeRender();
  if (tabId === "mod-estadisticas" && typeof onStatsResize      === "function") onStatsResize();
  if (tabId === "mod-avisos"       && typeof onNoticesInit       === "function") onNoticesInit();
  if (tabId === "mod-expedientes"  && typeof onExpedientesRender === "function") onExpedientesRender();

  if (window.innerWidth <= 900) {
    document.getElementById("mainSidebar")?.classList.remove("open");
  }
}

export function initFloatingDock() {
  const dockDesktop = document.querySelector(".floating-dock-desktop");
  if (!dockDesktop) return;

  const items = dockDesktop.querySelectorAll(".dock-item");

  dockDesktop.addEventListener("mousemove", (e) => {
    const mouseX = e.clientX;

    items.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const itemCenterX = rect.left + rect.width / 2;
      const distance = Math.abs(mouseX - itemCenterX);
      const maxDistance = 130;

      if (distance < maxDistance) {
        const factor = Math.cos((distance / maxDistance) * (Math.PI / 2));
        const scale = 1 + factor * 0.4; // magnificación hasta 1.4x
        const translateY = -factor * 10;
        item.style.transform = `scale(${scale}) translateY(${translateY}px)`;
      } else {
        item.style.transform = "scale(1) translateY(0px)";
      }
    });
  });

  dockDesktop.addEventListener("mouseleave", () => {
    items.forEach((item) => {
      item.style.transform = "scale(1) translateY(0px)";
    });
  });
}

export function toggleDockMobileMenu() {
  const menu = document.getElementById("dockMobileMenu");
  const icon = document.getElementById("dockMobileTriggerIcon");
  if (!menu) return;
  menu.classList.toggle("hidden");
  if (icon) {
    if (menu.classList.contains("hidden")) {
      icon.className = "fa-solid fa-bars-staggered";
    } else {
      icon.className = "fa-solid fa-xmark";
    }
  }
}

export function toggleNavGroup(groupId) {
  document.getElementById(groupId)?.classList.toggle("open");
}

export function toggleSidebar() {
  document.getElementById("mainSidebar")?.classList.toggle("open");
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
