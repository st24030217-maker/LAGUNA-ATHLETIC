/* ==========================================================================
   LAGUNA ATHLETIC 2026 — js/auth.js
   Login, logout, roles y postLoginInit.
   ========================================================================== */

import {
  squadData,
  calendarEvents,
  paymentsData,
  currentRole,
  loggedInUser,
  profilePlayerId,
  defaultSquadData,
  defaultCalendarEvents,
  defaultPayments,
  loadData,
  setCurrentRole,
  setLoggedInUser,
  setSquadData,
  setCalendarEvents,
  setPaymentsData,
} from "./state.js";
import { setProfilePlayerId } from "./state.js";
import { showToast, triggerStatefulButton } from "./ui.js";
import {
  supabaseClient,
  cloudConnected,
  applySupabaseProfile,
  syncAllFromCloud,
  queueCloudSync,
} from "./supabase.js";

// Callback inyectado desde main.js
let _postLoginInit = () => {};
export function injectPostLogin(fn) {
  _postLoginInit = fn;
}

// ---------------------------------------------------------------------------
// LOGIN
// ---------------------------------------------------------------------------
export async function handleLogin(e) {
  if (e) e.preventDefault();
  const loginBtn = document.getElementById("btnLoginSubmit");
  const username = (
    document.getElementById("loginUsernameInput")?.value || ""
  ).trim();
  const pinInput = document.getElementById("loginPinInput")
    ? document.getElementById("loginPinInput").value.trim()
    : "";
  const authEmail = username.includes("@")
    ? username
    : `${username}@laguna.local`;

  if (!username) {
    showToast("Escribe tu usuario.", "warning");
    return;
  }
  if (!authEmail || !pinInput) {
    showToast("Escribe tu usuario y contraseña.", "warning");
    return;
  }

  if (!cloudConnected) {
    showToast(
      "La nube no está configurada. Contacta al administrador para activar Supabase.",
      "error",
    );
    return;
  }

  const performLogin = async () => {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: authEmail,
      password: pinInput,
    });
    if (error) {
      await supabaseClient.auth.signOut();
      const errorMessage =
        error.message === "Invalid login credentials"
          ? "Usuario o contraseña incorrectos."
          : "No se pudo iniciar sesión: " + error.message;
      showToast(errorMessage, "error");
      const pinEl = document.getElementById("loginPinInput");
      if (pinEl) pinEl.value = "";
      throw new Error(errorMessage);
    }
    localStorage.setItem("laguna_auth_username", username);
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("role, player_id")
      .eq("id", data.user.id)
      .single();
    if (profileError || !profile) {
      showToast(
        "Tu usuario no tiene un perfil configurado en Supabase.",
        "error",
      );
      await supabaseClient.auth.signOut();
      throw new Error("Sin perfil");
    }
    applySupabaseProfile(data.user, profile);
    await syncAllFromCloud();
    queueCloudSync(currentRole);
    document.getElementById("loginScreen").classList.add("hidden");
    document.getElementById("appLayout").style.display = "grid";
    _postLoginInit();
    showToast("Sesión segura iniciada correctamente.", "success");
  };

  if (loginBtn) {
    try {
      await triggerStatefulButton(loginBtn, performLogin, {
        loadingText: "Verificando...",
        successText: "¡Bienvenido!",
      });
    } catch (_) {
      // Error ya manejado con toast
    }
  } else {
    try {
      await performLogin();
    } catch (_) {}
  }
}

export function handleDemoParentLogin(e) {
  if (e) e.preventDefault();

  loadData();
  if (!squadData.length) setSquadData([...defaultSquadData]);
  if (!calendarEvents.length) setCalendarEvents([...defaultCalendarEvents]);
  if (!paymentsData.length) setPaymentsData([...defaultPayments]);
  const demoPlayer =
    squadData.find((player) => player.id === 10) || squadData[0];
  setProfilePlayerId(demoPlayer?.id || null);
  setLoggedInUser(demoPlayer || null);
  setCurrentRole("guardian");
  sessionStorage.setItem("laguna_active_role", "guardian");
  sessionStorage.setItem("laguna_auth_user", "demo-guardian");
  localStorage.setItem("laguna_auth_username", "padre.demo");

  document.getElementById("loginScreen")?.classList.add("hidden");
  const appLayout = document.getElementById("appLayout");
  if (appLayout) appLayout.style.display = "grid";
  _postLoginInit();
  showToast("Modo demo: sesión de padre activada.", "success");
}

export function logout() {
  if (supabaseClient) supabaseClient.auth.signOut();
  sessionStorage.removeItem("laguna_active_role");
  location.reload();
}

// ---------------------------------------------------------------------------
// PERMISOS POR ROL
// ---------------------------------------------------------------------------
export function canViewGameInfo() {
  return ["dt", "auxiliar", "preparador", "directiva"].includes(currentRole);
}

export function isStaffRole() {
  return currentRole === "dt" || currentRole === "auxiliar";
}

export function applyRolePermissions() {
  const isDT = currentRole === "dt";
  const canViewSensitive = canViewGameInfo();
  const isGuardian = currentRole === "guardian";

  document.querySelectorAll(".role-dt-only").forEach((el) => {
    el.style.display = isDT ? "" : "none";
  });
  document.querySelectorAll(".role-admin-trainer-only").forEach((el) => {
    el.style.display = canViewSensitive ? "" : "none";
  });
  document.querySelectorAll(".guardian-payment-card").forEach((el) => {
    el.classList.toggle("hidden", !isGuardian);
  });
  if (isGuardian) {
    const student =
      squadData.find((p) => p.id === profilePlayerId) || loggedInUser;
    const conceptEl = document.getElementById("coachConceptText");
    const statusEl = document.querySelector(".guardian-payment-status");
    if (student) {
      if (conceptEl) {
        conceptEl.textContent = `Colegiatura · #${student.number} ${student.name}`;
      }
      const hasPending = paymentsData.some(
        (pay) => pay.playerId === student.id && pay.status === "Pendiente",
      );
      if (statusEl) {
        statusEl.innerHTML = hasPending
          ? '<i class="fa-solid fa-clock" style="color:var(--accent-warning);"></i> Tienes una colegiatura pendiente'
          : '<i class="fa-solid fa-circle-check" style="color:#6ee7b7;"></i> Mensualidad al día (Sin adeudo)';
      }
    }

    const allowedTabs = new Set([
      "mod-home",
      "mod-avisos",
      "mod-calendario",
      "mod-pagos",
      "mod-expedientes",
    ]);
    document.querySelectorAll(".tab-btn[data-tab]").forEach((el) => {
      el.style.display = allowedTabs.has(el.dataset.tab) ? "" : "none";
    });
    [
      "mod-qr",
      "mod-justificaciones",
      "mod-registro",
      "mod-alineacion",
      "mod-medico",
      "mod-estadisticas",
    ].forEach((id) => {
      document.getElementById(id)?.classList.add("guardian-hidden-module");
    });
    document.querySelectorAll(".nav-group-header").forEach((el) => {
      const group = el.parentElement;
      if (
        group &&
        !group.querySelector('.tab-btn:not([style*="display: none"])')
      ) {
        group.style.display = "none";
      }
    });
  }
  document.querySelectorAll(".player-marker").forEach((el) => {
    el.classList.add("role-editable");
    el.style.cursor = "grab";
  });
}
