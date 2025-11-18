// Selectores y elementos del DOM
const productos = document.querySelectorAll(".producto");
const modal = document.getElementById("modal");
const cerrar = document.querySelector(".cerrar");
const modalContenido = document.querySelector(".modal-contenido");
const modalImagen = document.getElementById("modal-imagen");
const modalNombre = document.getElementById("modal-nombre");
const modalPrecioUnitario = document.getElementById("modal-precio-unitario");
const modalCantidad = document.getElementById("modal-cantidad");
const modalPrecioTotal = document.getElementById("modal-precio-total");
const modalAgregarCarrito = document.getElementById("modal-agregar-carrito");
const modalComprar = document.getElementById("modal-comprar");
const carritoToast = document.getElementById("cart-toast");

let precioUnitario = 0;
let productoSeleccionado = null;

// Función para formatear precio en pesos (ej: 1.234.567)
function formatearPesos(n) {
  return new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0 }).format(n) + " $";
}

function obtenerProductoDesdeCard(productoCard) {
  if (!productoCard) return null;
  const precioTexto = productoCard.querySelector(".precio")?.innerText;
  const precio = parseFloat(productoCard.dataset.precio || extraerPrecioDesdeTexto(precioTexto));
  const stock = Number(productoCard.dataset.stock ?? productoCard.dataset.Stock ?? 0);
  return {
    id: productoCard.dataset.id ? Number(productoCard.dataset.id) : null,
    nombre: productoCard.dataset.nombre || productoCard.querySelector("h3")?.innerText || "Producto",
    imagen: productoCard.dataset.imagen || productoCard.querySelector("img")?.src || "",
    precio: precio || 0,
    stock: Number.isFinite(stock) ? stock : 0
  };
}

function abrirModal(productoCard) {
  const producto = obtenerProductoDesdeCard(productoCard);
  if (!producto || !modal) return;
  if (producto.stock <= 0) {
    mostrarToast("Este producto no tiene stock disponible.", true);
    return;
  }
  productoSeleccionado = producto;
  precioUnitario = producto.precio || 0;

  modalImagen.src = producto.imagen;
  modalNombre.innerText = producto.nombre;
  modalPrecioUnitario.innerText = formatearPesos(precioUnitario);
  modalCantidad.value = 1;
  modalCantidad.setAttribute("max", obtenerMaxCantidadPermitida());
  modalPrecioTotal.innerText = formatearPesos(precioUnitario);

  modal.style.display = "flex";
  setTimeout(() => modalCantidad.focus(), 100);
}

function obtenerMaxCantidadPermitida() {
  if (!productoSeleccionado || !Number.isFinite(productoSeleccionado.stock)) {
    return 99;
  }
  if (productoSeleccionado.stock <= 0) {
    return 1;
  }
  return Math.min(99, productoSeleccionado.stock);
}

function obtenerCantidadSeleccionada() {
  const max = obtenerMaxCantidadPermitida();
  let valor = parseInt(modalCantidad.value, 10);
  if (Number.isNaN(valor) || valor < 1) valor = 1;
  if (valor > max) valor = max;
  modalCantidad.value = valor;
  return valor;
}

// Abrir modal con datos del producto
productos.forEach(producto => {
  producto.addEventListener("click", (event) => {
    if (event.target.closest(".carrito")) {
      return;
    }
    abrirModal(producto);
  });
});

// Cerrar modal con la X
if (cerrar) {
  cerrar.addEventListener("click", () => {
    modal.style.display = "none";
  });
}

// Cerrar modal al hacer clic fuera del contenido
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

// Evitar que la rueda del ratón cambie el número mientras el input tiene foco
modalCantidad.addEventListener('wheel', (e) => {
  if (document.activeElement === modalCantidad) {
    e.preventDefault();
  }
}, { passive: false });

// Manejo del input: limpiar no dígitos, limitar inmediatamente a 1..99 y actualizar total
modalCantidad.addEventListener("input", () => {
  const raw = modalCantidad.value.trim();

  // Permitir campo vacío temporalmente para que el usuario pueda borrar y escribir
  if (raw === "") {
    // Muestra precio unitario mientras está vacío
    modalPrecioTotal.innerText = formatearPesos(precioUnitario);
    return;
  }

  // Quitar todo lo que no sea dígito
  const cleaned = raw.replace(/\D/g, "");
  if (cleaned === "") {
    modalCantidad.value = "";
    modalPrecioTotal.innerText = formatearPesos(precioUnitario);
    return;
  }

  let n = parseInt(cleaned, 10);
  const max = obtenerMaxCantidadPermitida();

  // Limitar inmediatamente
  if (n > max) n = max;
  if (n < 1) n = 1;

  // Escribir el valor limpio y limitado de vuelta en el input
  modalCantidad.value = n;

  // Actualizar total
  const total = n * precioUnitario;
  modalPrecioTotal.innerText = formatearPesos(total);
});

// Validar y normalizar al perder el foco (blur)
modalCantidad.addEventListener("blur", () => {
  const raw = modalCantidad.value.trim();
  if (raw === "" || isNaN(parseInt(raw, 10))) {
    modalCantidad.value = 1;
  } else {
    let v = parseInt(raw, 10);
    if (v < 1) v = 1;
    const max = obtenerMaxCantidadPermitida();
    if (v > max) v = max;
    modalCantidad.value = v;
  }

  const final = parseInt(modalCantidad.value, 10) || 1;
  modalPrecioTotal.innerText = formatearPesos(final * precioUnitario);
});

// Evitar pegar texto no numérico o mayor a 99
modalCantidad.addEventListener("paste", (e) => {
  const paste = (e.clipboardData || window.clipboardData).getData('text').trim();
  if (!/^\d+$/.test(paste)) {
    e.preventDefault();
    return;
  }
  const num = parseInt(paste, 10);
  const max = obtenerMaxCantidadPermitida();
  if (num > max) {
    e.preventDefault();
    modalCantidad.value = max;
    modalPrecioTotal.innerText = formatearPesos(max * precioUnitario);
  }
});

// Permitir solo dígitos y teclas funcionales
modalCantidad.addEventListener("keydown", (e) => {
  const allowedKeys = [
    "Backspace", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Delete", "Tab", "Home", "End"
  ];
  if (allowedKeys.includes(e.key)) return;
  if (/^\d$/.test(e.key)) return;
  e.preventDefault();
});

// Manejo del carrito desde el catálogo
const iconosCarrito = document.querySelectorAll(".producto .carrito");

iconosCarrito.forEach(icono => {
  icono.addEventListener("click", (event) => {
    event.stopPropagation();
    const productoCard = icono.closest(".producto");
    if (!productoCard) return;
    abrirModal(productoCard);
  });
});

function extraerPrecioDesdeTexto(texto = "") {
  return parseFloat(texto.replace(/\./g, "").replace(/\s*\$/g, "").trim()) || 0;
}

function obtenerCarrito() {
  try {
    const almacenado = localStorage.getItem("carrito");
    if (!almacenado) return [];
    const parsed = JSON.parse(almacenado);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(item => ({
      ...item,
      precioUnitario: Number(item.precioUnitario ?? item.precio ?? 0),
      cantidad: Number(item.cantidad ?? 1),
      imagen: item.imagen || ""
    }));
  } catch (error) {
    console.warn("No se pudo leer el carrito", error);
    return [];
  }
}

function guardarCarrito(carrito) {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

function agregarProductoAlCarrito(producto, cantidad = 1, opciones = {}) {
  if (!producto.precio) {
    mostrarToast("No se pudo agregar el producto.", true);
    return;
  }

  const carrito = obtenerCarrito();
  const existente = carrito.find(item => {
    if (producto.id != null && item.id != null) {
      return Number(item.id) === Number(producto.id);
    }
    return item.nombre === producto.nombre;
  });

  const cantidadAgregar = Math.max(1, cantidad);
  if (existente) {
    existente.cantidad = Math.min(99, (existente.cantidad || 1) + cantidadAgregar);
    existente.precioUnitario = Number(existente.precioUnitario || producto.precio);
  } else {
    carrito.push({
      id: producto.id ?? null,
      nombre: producto.nombre,
      precioUnitario: producto.precio,
      cantidad: Math.max(1, Math.min(99, cantidadAgregar)),
      imagen: producto.imagen
    });
  }

  guardarCarrito(carrito);
  if (!opciones?.silenciarToast) {
    const mensaje = opciones?.mensajeToast || `${producto.nombre} se agregó al carrito.`;
    mostrarToast(mensaje);
  }
}

modalAgregarCarrito?.addEventListener("click", () => {
  if (!productoSeleccionado) return;
  const cantidad = obtenerCantidadSeleccionada();
  agregarProductoAlCarrito(productoSeleccionado, cantidad);
  modal.style.display = "none";
});

modalComprar?.addEventListener("click", () => {
  if (!productoSeleccionado) return;
  const cantidad = obtenerCantidadSeleccionada();
  agregarProductoAlCarrito(productoSeleccionado, cantidad, { silenciarToast: true });
  modal.style.display = "none";
  window.location.href = "/pasarela";
});

function mostrarToast(mensaje, esError = false) {
  if (!carritoToast) return;
  carritoToast.textContent = mensaje;
  carritoToast.style.backgroundColor = esError ? "rgba(153, 0, 0, 0.92)" : "rgba(15, 15, 15, 0.92)";
  carritoToast.classList.add("visible");
  setTimeout(() => carritoToast.classList.remove("visible"), 2000);
}

// Función para resaltar producto desde la búsqueda
function highlightProductoFromSearch() {
  // Obtener parámetro de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const productoName = urlParams.get('producto');

  if (productoName) {
    // Buscar el producto que coincida
    productos.forEach(producto => {
      const nombreProducto = producto.querySelector('h3').innerText.trim();
      if (nombreProducto === productoName) {
        // Agregar clase de resaltado
        producto.classList.add('highlighted');

        // Scroll suave hasta el producto
        setTimeout(() => {
          producto.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);

        // Remover el resaltado después de 3 segundos
        setTimeout(() => {
          producto.classList.remove('highlighted');
          // Limpiar el parámetro de la URL sin recargar la página
          if (window.history.replaceState) {
            window.history.replaceState({}, '', window.location.pathname);
          }
        }, 3000);
      }
    });
  }
}

// Ejecutar cuando la página cargue
highlightProductoFromSearch();