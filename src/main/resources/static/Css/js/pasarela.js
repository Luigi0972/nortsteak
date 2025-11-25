const listaCarrito = document.getElementById("carrito-lista");
const resumenVacio = document.getElementById("resumen-empty");
const totalElemento = document.getElementById("total-pagar");
const estadoPago = document.getElementById("estado-pago");
const formPago = document.getElementById("form-pago");
const btnSimular = document.getElementById("btn-simular");
const metodoRadios = document.querySelectorAll('input[name="metodo"]');
const metodoOptions = document.querySelectorAll(".metodo-option");
const panelesMetodo = document.querySelectorAll(".panel-metodo");

let carritoActual = [];
let sesionActual = null;
const ORDER_KEY_PREFIX = "nortsteak:pedidos:";
const LOGIN_URL = "/login2";

document.addEventListener("DOMContentLoaded", () => {
  renderizarResumen();
  configurarMetodos();
  cargarSesion();
  formPago?.addEventListener("submit", manejarEnvio);
});

window.addEventListener("storage", (event) => {
  if (event.key === "carrito") {
    renderizarResumen();
  }
});

function obtenerCarrito() {
  try {
    const almacenado = localStorage.getItem("carrito");
    if (!almacenado) return [];
    const parsed = JSON.parse(almacenado);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(item => ({
      ...item,
      id: item.id != null ? Number(item.id) : null,
      cantidad: Number(item.cantidad ?? 1),
      precioUnitario: Number(item.precioUnitario ?? item.precio ?? 0),
      imagen: item.imagen || "/img2/newyork.jpg"
    }));
  } catch (error) {
    console.error("No se pudo leer el carrito", error);
    return [];
  }
}

function renderizarResumen() {
  carritoActual = obtenerCarrito();
  if (!listaCarrito || !totalElemento) return;

  listaCarrito.innerHTML = "";
  const hayProductos = carritoActual.length > 0;
  if (resumenVacio) {
    resumenVacio.style.display = hayProductos ? "none" : "block";
  }
  if (!hayProductos) {
    totalElemento.textContent = "$0";
    btnSimular?.setAttribute("disabled", "disabled");
    return;
  }

  btnSimular?.removeAttribute("disabled");
  let total = 0;

  carritoActual.forEach(item => {
    const cantidad = Math.max(item.cantidad || 1, 1);
    const subtotal = item.precioUnitario * cantidad;
    total += subtotal;

    const contenedor = document.createElement("div");
    contenedor.className = "resumen-item";
    contenedor.innerHTML = `
      <img src="${item.imagen}" alt="${item.nombre}">
      <div class="item-info">
        <strong>${item.nombre}</strong>
        <small>Cantidad: ${cantidad}</small>
      </div>
      <div class="item-precio">${formatearPesos(subtotal)}</div>
    `;
    listaCarrito.appendChild(contenedor);
  });

  totalElemento.textContent = formatearPesos(total);
}

function configurarMetodos() {
  metodoRadios.forEach(radio => {
    radio.addEventListener("change", actualizarPanelMetodo);
  });
  actualizarPanelMetodo();
}

function actualizarPanelMetodo() {
  const metodo = obtenerMetodoSeleccionado();
  metodoOptions.forEach(option => {
    option.classList.toggle("active", option.dataset.metodo === metodo);
  });
  panelesMetodo.forEach(panel => {
    panel.classList.toggle("active", panel.dataset.panel === metodo);
  });
}

function obtenerMetodoSeleccionado() {
  return document.querySelector('input[name="metodo"]:checked')?.value || "NEQUI";
}

async function manejarEnvio(event) {
  event.preventDefault();

  if (!formPago?.reportValidity()) {
    return;
  }

  const puedeContinuar = await asegurarSesionActiva();
  if (!puedeContinuar) {
    return;
  }

  if (!carritoActual.length) {
    setEstado("Tu carrito está vacío. Vuelve al catálogo para agregar productos.", "error");
    return;
  }

  const productosSinId = carritoActual.filter(item => item.id == null);
  if (productosSinId.length) {
    setEstado("Algunos productos no tienen referencia válida. Agrégalos nuevamente desde el catálogo.", "error");
    return;
  }

  const metodo = obtenerMetodoSeleccionado();

  let referencia;
  try {
    referencia = obtenerReferenciaMetodo(metodo);
  } catch (error) {
    setEstado(error.message, "error");
    return;
  }

  const payload = {
    metodo,
    referencia,
    nombre: formPago.nombre.value.trim(),
    cedula: formPago.cedula.value.trim(),
    telefono: formPago.telefono.value.trim(),
    correo: formPago.correo.value.trim(),
    direccion: formPago.direccion.value.trim(),
    totalEsperado: calcularTotal(),
    items: carritoActual.map(item => ({
      productoId: item.id,
      cantidad: Math.max(item.cantidad || 1, 1)
    }))
  };

  enviarPago(payload);
}

function obtenerReferenciaMetodo(metodo) {
  if (metodo === "NEQUI") {
    const telefono = document.getElementById("nequi-telefono")?.value.trim();
    const codigo = document.getElementById("nequi-codigo")?.value.trim();
    if (!telefono || !codigo) {
      throw new Error("Completa los datos del pago con Nequi.");
    }
    return `NEQUI-${telefono}-${codigo}`;
  }

  if (metodo === "BANCOLOMBIA") {
    const cuenta = document.getElementById("bancolombia-cuenta")?.value.trim();
    const aprobacion = document.getElementById("bancolombia-aprobacion")?.value.trim();
    if (!cuenta || !aprobacion) {
      throw new Error("Completa los datos de la transferencia Bancolombia.");
    }
    return `BANCOLOMBIA-${cuenta}-${aprobacion}`;
  }

  if (metodo === "FALABELLA") {
    const tarjeta = document.getElementById("falabella-tarjeta")?.value.trim();
    const autorizacion = document.getElementById("falabella-autorizacion")?.value.trim();
    if (!tarjeta || !autorizacion) {
      throw new Error("Completa los datos de la tarjeta Falabella.");
    }
    return `FALABELLA-${tarjeta}-${autorizacion}`;
  }

  throw new Error("Selecciona un método de pago válido.");
}

function enviarPago(payload) {
  toggleCargando(true);
  setEstado("Procesando pago simulado...", null);

  fetch("/api/pago/simulado", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })
    .then(async (response) => {
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.mensaje || "No se pudo completar el pago.");
      }
      return response.json();
    })
    .then((data) => {
      setEstado("¡Pago confirmado! Actualizamos el inventario en tiempo real.", "success");
      registrarPedidoUsuario(payload, carritoActual);
      localStorage.removeItem("carrito");
      notificarCambioCarrito();
      setTimeout(() => {
        window.location.href = "/catalogo";
      }, 2500);
    })
    .catch((error) => {
      console.error(error);
      setEstado(error.message || "Ocurrió un error inesperado.", "error");
    })
    .finally(() => toggleCargando(false));
}

function toggleCargando(estaCargando) {
  if (!btnSimular) return;
  btnSimular.disabled = estaCargando;
  btnSimular.textContent = estaCargando ? "Procesando..." : "Confirmar pago simulado";
}

function setEstado(mensaje, tipo) {
  if (!estadoPago) return;
  estadoPago.innerHTML = mensaje || "";
  estadoPago.classList.remove("error", "success");
  if (tipo === "error") {
    estadoPago.classList.add("error");
  } else if (tipo === "success") {
    estadoPago.classList.add("success");
  }
}

function formatearPesos(valor) {
  return "$" + new Intl.NumberFormat("es-CO", { minimumFractionDigits: 0 }).format(valor || 0);
}

function calcularTotal() {
  return carritoActual.reduce((acc, item) => {
    const cantidad = Math.max(item.cantidad || 1, 1);
    return acc + item.precioUnitario * cantidad;
  }, 0);
}

function notificarCambioCarrito() {
  window.dispatchEvent(
    new CustomEvent("carrito:sync", {
      detail: { updatedAt: Date.now() }
    })
  );
}

async function registrarPedidoUsuario(payload, items) {
  try {
    const sessionRes = await fetch("/api/auth/session", {
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    });
    if (!sessionRes.ok) return;
    const session = await sessionRes.json();
    if (!session?.loggedIn) return;

    const email = session.userEmail || session.userCorreo;
    if (!email) return;

    const storageKey = `${ORDER_KEY_PREFIX}${email}`;
    const existentes = JSON.parse(localStorage.getItem(storageKey) || "[]");

    const nuevoPedido = {
      codigo: generarCodigoPedido(),
      fecha: new Date().toISOString(),
      direccion: payload.direccion,
      total: formatearPesos(payload.totalEsperado),
      step: 1,
      estado: "PREPARACION",
      resumen: `Pago con ${payload.metodo}`,
      items: items.map((item) => ({
        nombre: item.nombre,
        cantidad: item.cantidad,
        subtotal: formatearPesos(item.precioUnitario * item.cantidad),
      })),
    };

    existentes.unshift(nuevoPedido);
    localStorage.setItem(storageKey, JSON.stringify(existentes.slice(0, 20)));
  } catch (error) {
    console.warn("No se pudo registrar el pedido", error);
  }
}

function generarCodigoPedido() {
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `NS-${random}`;
}

async function cargarSesion() {
  try {
    const res = await fetch("/api/auth/session", {
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      sesionActual = null;
      return;
    }
    const data = await res.json();
    sesionActual = data?.loggedIn ? data : null;
  } catch (error) {
    sesionActual = null;
  }
}

async function asegurarSesionActiva() {
  if (sesionActual?.loggedIn) {
    return true;
  }
  await cargarSesion();
  if (!sesionActual?.loggedIn) {
    informarInicioSesionRequerido();
    return false;
  }
  return true;
}

function informarInicioSesionRequerido() {
  setEstado(
    `Debes iniciar sesión para completar tu compra. <a href="${LOGIN_URL}">Inicia sesión</a> y vuelve a intentarlo.`,
    "error"
  );
  estadoPago?.scrollIntoView({ behavior: "smooth", block: "center" });
}
