const listaCarrito = document.getElementById("carrito-lista");
const totalElemento = document.getElementById("total");
const vacioMensaje = document.getElementById("carrito-vacio");
const btnVaciar = document.getElementById("btnVaciarCarrito");
const btnIrPasarela = document.getElementById("btnIrPasarela");

function initCarrito() {
  renderizarCarrito();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCarrito);
} else {
  initCarrito();
}

window.addEventListener("storage", (event) => {
  if (event.key === "carrito") {
    renderizarCarrito();
  }
});

listaCarrito?.addEventListener("click", (event) => {
  const botonMas = event.target.closest(".mas");
  const botonMenos = event.target.closest(".menos");
  const botonEliminar = event.target.closest(".eliminar");

  if (botonMas) {
    modificarCantidad(Number(botonMas.dataset.index), 1);
  } else if (botonMenos) {
    modificarCantidad(Number(botonMenos.dataset.index), -1);
  } else if (botonEliminar) {
    eliminarProducto(Number(botonEliminar.dataset.index));
  }
});

btnVaciar?.addEventListener("click", () => {
  localStorage.removeItem("carrito");
  renderizarCarrito();
});

btnIrPasarela?.addEventListener("click", () => {
  window.location.href = "/pasarela";
});

function obtenerCarrito() {
  try {
    const almacenado = localStorage.getItem("carrito");
    if (!almacenado) return [];
    const parsed = JSON.parse(almacenado);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(item => ({
      ...item,
    id: item.id != null && !Number.isNaN(Number(item.id)) ? Number(item.id) : null,
      precioUnitario: Number(item.precioUnitario ?? item.precio ?? 0),
      cantidad: Number(item.cantidad ?? 1),
      imagen: item.imagen || ""
    }));
  } catch (error) {
    console.error("No se pudo obtener el carrito", error);
    return [];
  }
}

function guardarCarrito(carrito) {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

function formatearPesos(valor) {
  return "$" + new Intl.NumberFormat("es-CO", { minimumFractionDigits: 0 }).format(valor);
}

function renderizarCarrito() {
  const carrito = obtenerCarrito();

  if (!listaCarrito || !totalElemento || !vacioMensaje) return;

  listaCarrito.innerHTML = "";

  if (carrito.length === 0) {
    vacioMensaje.style.display = "block";
    totalElemento.textContent = "$0";
    return;
  }

  vacioMensaje.style.display = "none";
  let total = 0;

  carrito.forEach((item, index) => {
    const subtotal = item.precioUnitario * item.cantidad;
    total += subtotal;

    const html = document.createElement("div");
    html.className = "item";
    html.innerHTML = `
      <div class="item-info">
        <img src="${item.imagen || "/img2/newyork.jpg"}" alt="${item.nombre}">
        <div class="detalles">
          <span class="nombre-producto">${item.nombre}</span>
          <div class="cantidad">
            <button class="menos" data-index="${index}" type="button">
              <i class="fas fa-minus"></i>
            </button>
            <span class="valor">${item.cantidad}</span>
            <button class="mas" data-index="${index}" type="button">
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>
      </div>
      <div class="precio">${formatearPesos(subtotal)}</div>
      <button class="eliminar" data-index="${index}" type="button" aria-label="Eliminar ${item.nombre}">
        <i class="fas fa-trash"></i>
      </button>
    `;
    listaCarrito.appendChild(html);
  });

  totalElemento.textContent = formatearPesos(total);
}

function modificarCantidad(index, delta) {
  const carrito = obtenerCarrito();
  const producto = carrito[index];
  if (!producto) return;

  producto.cantidad = Math.min(Math.max((producto.cantidad || 1) + delta, 1), 99);
  carrito[index] = producto;
  guardarCarrito(carrito);
  renderizarCarrito();
}

function eliminarProducto(index) {
  const carrito = obtenerCarrito();
  carrito.splice(index, 1);
  guardarCarrito(carrito);
  renderizarCarrito();
}

