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
let currentProfile = null;
let ordersData = [];
const ORDER_KEY_PREFIX = "nortsteak:pedidos:";
const currentOrderKey = () => {
  const email =
    currentSession?.userEmail || currentSession?.userCorreo || currentProfile?.correo;
  return email ? `${ORDER_KEY_PREFIX}${email}` : null;
};

document.addEventListener("DOMContentLoaded", async () => {
  currentSession = await obtenerSesion();
  if (!currentSession) return;

  currentProfile = await obtenerPerfilServidor();
  poblarFormulario(currentProfile || currentSession);
  limpiarPedidosLocales();
  ordersData = await obtenerPedidos();
  renderizarPedidos();

  form?.addEventListener("submit", manejarEnvioFormulario);
  logoutBtn?.addEventListener("click", cerrarSesion);
  refreshBtn?.addEventListener("click", async () => {
    ordersData = await obtenerPedidos();
    renderizarPedidos();
  });

  document.addEventListener("visibilitychange", async () => {
    if (!document.hidden) {
      ordersData = await obtenerPedidos();
      renderizarPedidos();
    }
  });

  setInterval(async () => {
    ordersData = await obtenerPedidos();
    renderizarPedidos();
  }, 20000);
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

async function obtenerPerfilServidor() {
  try {
    const res = await fetch("/api/auth/profile", {
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.warn("No fue posible obtener el perfil", error);
    return null;
  }
}

function poblarFormulario(data) {
  const nombre =
    data?.nombre || currentSession?.userNombre || "Visitante NortSteak";
  const correo =
    data?.correo || currentSession?.userEmail || currentSession?.userCorreo || "";
  const telefono = data?.telefono || "";
  const direccion = data?.direccion || "";
  if (heroNameEl) heroNameEl.textContent = nombre;
  if (heroEmailEl) heroEmailEl.textContent = correo || "Sin correo";

  const nameInput = form?.querySelector("#accountName");
  const emailInput = form?.querySelector("#accountEmail");
  const phoneInput = form?.querySelector("#accountPhone");
  const addressInput = form?.querySelector("#accountAddress");
  if (nameInput) nameInput.value = nombre;
  if (emailInput) emailInput.value = correo;
  if (phoneInput) phoneInput.value = telefono;
  if (addressInput) addressInput.value = direccion;
}

async function manejarEnvioFormulario(event) {
  event.preventDefault();
  if (!form) return;
  const payload = {
    nombre: form.querySelector("#accountName").value.trim(),
    correo: form.querySelector("#accountEmail").value.trim(),
    telefono: form.querySelector("#accountPhone").value.trim() || null,
    direccion: form.querySelector("#accountAddress").value.trim() || null,
  };

  if (!payload.nombre || !payload.correo) {
    mostrarMensajeFormulario("Completa tus datos antes de guardar.", true);
    return;
  }

  try {
    const res = await fetch("/api/auth/profile", {
      method: "PUT",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const message =
        data?.message || "No pudimos guardar tus datos, intenta más tarde.";
      mostrarMensajeFormulario(message, true);
      return;
    }

    currentProfile = data;
    poblarFormulario(currentProfile);
    if (currentSession) {
      currentSession.userNombre = data.nombre;
      currentSession.userEmail = data.correo;
    }
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

async function obtenerPedidos() {
  try {
    const res = await fetch(`/api/auth/orders?t=${Date.now()}`, {
      credentials: "same-origin",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      console.warn("No fue posible obtener los pedidos del servidor");
      return [];
    }
    const pedidos = await res.json();
    return Array.isArray(pedidos) ? pedidos : [];
  } catch (error) {
    console.warn("Error al obtener pedidos del servidor", error);
    return [];
  }
}

function limpiarPedidosLocales() {
  const key = currentOrderKey();
  if (!key) return;
  try {
    localStorage.removeItem(key);
  } catch (e) {
    // ignorar
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
  if (!estado) return "Confirmado";
  const estadoUpper = estado.toUpperCase();
  switch (estadoUpper) {
    case "COMPLETADO":
    case "ENTREGADO":
      return "Entregado";
    case "EN_CAMINO":
      return "En camino";
    case "PREPARACION":
      return "Preparando";
    case "PENDIENTE":
      return "Pendiente";
    case "CONFIRMADO":
      return "Confirmado";
    default:
      return estado;
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

