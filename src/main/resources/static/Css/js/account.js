const STEP_LABELS = ["Confirmado", "Preparación", "En camino", "Entregado"];

const heroNameEl = document.getElementById("accountHeroName");
const heroEmailEl = document.getElementById("accountHeroEmail");
const form = document.getElementById("accountForm");
const formStatus = document.getElementById("accountFormStatus");
const logoutBtn = document.getElementById("accountLogout");
const refreshBtn = document.getElementById("refreshOrders");
const ordersListEl = document.getElementById("ordersList");
const ordersEmptyEl = document.getElementById("ordersEmpty");

let currentSession = null;
let ordersData = [];
const ORDER_KEY_PREFIX = "nortsteak:pedidos:";

document.addEventListener("DOMContentLoaded", async () => {
  currentSession = await obtenerSesion();
  if (!currentSession) return;

  poblarFormulario(currentSession);
  ordersData = obtenerPedidos(currentSession);
  renderizarPedidos();

  form?.addEventListener("submit", manejarEnvioFormulario);
  logoutBtn?.addEventListener("click", cerrarSesion);
  refreshBtn?.addEventListener("click", () => {
  ordersData = obtenerPedidos(currentSession, true);
    renderizarPedidos();
  });
});

async function obtenerSesion() {
  try {
    const res = await fetch("/api/auth/session", {
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      window.location.href = "/login2";
      return null;
    }
    const data = await res.json();
    if (!data?.loggedIn) {
      window.location.href = "/login2";
      return null;
    }
    return data;
  } catch (error) {
    console.error("No fue posible validar la sesión", error);
    window.location.href = "/login2";
    return null;
  }
}

function poblarFormulario(session) {
  const nombre = session?.userNombre || "Visitante NortSteak";
  const correo = session?.userEmail || session?.userCorreo || "";

  if (heroNameEl) heroNameEl.textContent = nombre;
  if (heroEmailEl) heroEmailEl.textContent = correo || "Sin correo";

  const nameInput = form?.querySelector("#accountName");
  const emailInput = form?.querySelector("#accountEmail");
  if (nameInput) nameInput.value = nombre;
  if (emailInput) emailInput.value = correo;

  const storedProfile = obtenerPerfilGuardado(correo);
  if (storedProfile) {
    form.querySelector("#accountPhone").value = storedProfile.telefono || "";
    form.querySelector("#accountAddress").value = storedProfile.direccion || "";
    form.querySelector("#accountPreference").value =
      storedProfile.preferencia || "ESTANDAR";
  }
}

function obtenerPerfilGuardado(email) {
  if (!email) return null;
  try {
    const raw = localStorage.getItem(`nortsteak:perfil:${email}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function manejarEnvioFormulario(event) {
  event.preventDefault();
  if (!form) return;
  const payload = {
    nombre: form.querySelector("#accountName").value.trim(),
    correo: form.querySelector("#accountEmail").value.trim(),
    telefono: form.querySelector("#accountPhone").value.trim(),
    direccion: form.querySelector("#accountAddress").value.trim(),
    preferencia: form.querySelector("#accountPreference").value,
  };

  if (!payload.nombre || !payload.correo) {
    mostrarMensajeFormulario("Completa tus datos antes de guardar.", true);
    return;
  }

  try {
    localStorage.setItem(
      `nortsteak:perfil:${payload.correo}`,
      JSON.stringify(payload)
    );
    mostrarMensajeFormulario("Guardamos tus cambios correctamente.");
  } catch (error) {
    console.warn("No fue posible guardar el perfil", error);
    mostrarMensajeFormulario("No se pudo guardar tu información.", true);
  }
}

function mostrarMensajeFormulario(mensaje, esError = false) {
  if (!formStatus) return;
  formStatus.textContent = mensaje;
  formStatus.style.color = esError ? "#c20808" : "#0d6a32";
  setTimeout(() => (formStatus.textContent = ""), 3800);
}

async function cerrarSesion() {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    });
  } catch (error) {
    console.warn("No fue posible cerrar sesión", error);
  } finally {
    window.dispatchEvent(new CustomEvent("auth:refresh"));
    window.location.href = "/";
  }
}

function obtenerPedidos(session) {
  const email = session?.userEmail || session?.userCorreo;
  if (!email) return [];
  const storageKey = `${ORDER_KEY_PREFIX}${email}`;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const lista = JSON.parse(raw);
    if (Array.isArray(lista)) {
      return lista;
    }
    return [];
  } catch {
    return [];
  }
}

function renderizarPedidos() {
  if (!ordersListEl) return;

  ordersListEl.innerHTML = "";
  if (!ordersData.length) {
    ordersEmptyEl?.removeAttribute("hidden");
    return;
  }
  ordersEmptyEl?.setAttribute("hidden", "hidden");

  ordersData.forEach((pedido) => {
    const card = document.createElement("div");
    card.className = "order-card";
    const progreso = Math.min(
      pedido.step || 0,
      STEP_LABELS.length - 1
    );
    const progresoPorcentaje = (progreso / (STEP_LABELS.length - 1)) * 100;

    card.innerHTML = `
      <div class="order-card-head">
        <div>
          <span class="order-code">${pedido.codigo}</span>
          <h3>${pedido.resumen || "Pedido en seguimiento"}</h3>
          <p class="order-meta">${formatearFechaPedido(pedido.fecha)} • ${pedido.direccion || "Sin dirección"}</p>
        </div>
        <div class="order-status" data-status="${pedido.estado}">
          <i class="fas fa-location-arrow"></i> ${formatearEstado(pedido.estado)}
        </div>
      </div>
      <div class="order-progress">
        <div class="order-progress-bar">
          <span style="width:${progresoPorcentaje}%"></span>
        </div>
        <div class="order-steps">
          ${STEP_LABELS.map((step, index) => {
            const active = index <= progreso ? "active" : "";
            return `<span class="${active}">${step}</span>`;
          }).join("")}
        </div>
      </div>
      <div class="order-footer">
        <span>Total <strong>${pedido.total || "$0"}</strong></span>
      </div>
    `;
    ordersListEl.appendChild(card);
  });
}

function formatearEstado(estado) {
  switch (estado) {
    case "COMPLETADO":
      return "Entregado";
    case "EN_CAMINO":
      return "En camino";
    case "PREPARACION":
      return "Preparando";
    default:
      return "Confirmado";
  }
}

function formatearFechaPedido(fechaIso) {
  if (!fechaIso) return "Fecha no disponible";
  try {
    const fecha = new Date(fechaIso);
    return fecha.toLocaleString("es-CO", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return fechaIso;
  }
}

