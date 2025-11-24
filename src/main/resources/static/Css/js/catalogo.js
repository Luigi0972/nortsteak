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

let toastTimeout;

let precioUnitario = 0;
let productoSeleccionado = null;
const ULTIMO_AGREGADO_KEY = "carrito:lastAdded";

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
    elemento: productoCard,
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
  persistirUltimoAgregado(producto, cantidadAgregar);
  animarProductoEnCatalogo(producto);
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
  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }

  const iconClass = esError ? "fa-circle-exclamation" : "fa-circle-check";
  carritoToast.classList.remove("visible", "error", "success");
  void carritoToast.offsetWidth;
  carritoToast.innerHTML = `
    <span class="toast-icon">
      <i class="fa-solid ${iconClass}"></i>
    </span>
    <span class="toast-message">${mensaje}</span>
  `;
  carritoToast.classList.add(esError ? "error" : "success");
  carritoToast.classList.add("visible");

  toastTimeout = setTimeout(() => {
    carritoToast.classList.remove("visible");
  }, 2400);
}

function animarProductoEnCatalogo(producto) {
  const card = obtenerCardDelProducto(producto);
  if (!card) return;
  card.classList.remove("producto-adding");
  void card.offsetWidth;
  card.classList.add("producto-adding");
  setTimeout(() => {
    card.classList.remove("producto-adding");
  }, 900);
  animarFlyToCart(card);
}

function obtenerCardDelProducto(producto) {
  if (producto?.elemento instanceof HTMLElement) {
    return producto.elemento;
  }
  if (producto?.id != null) {
    return document.querySelector(`.producto[data-id="${producto.id}"]`);
  }
  if (producto?.nombre) {
    return Array.from(document.querySelectorAll(".producto")).find(card => {
      const dataNombre = card.dataset.nombre;
      const titulo = card.querySelector("h3")?.innerText?.trim();
      return dataNombre === producto.nombre || titulo === producto.nombre;
    }) || null;
  }
  return null;
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

function persistirUltimoAgregado(producto, cantidad) {
  try {
    const info = {
      id: producto.id ?? null,
      nombre: producto.nombre ?? "",
      cantidad: Math.max(1, cantidad),
      timestamp: Date.now()
    };
    localStorage.setItem(ULTIMO_AGREGADO_KEY, JSON.stringify(info));
  } catch (error) {
    console.warn("No se pudo guardar el último producto agregado", error);
  }
}

function animarFlyToCart(card) {
  const imagen = card?.querySelector("img");
  const iconoCarrito = document.querySelector('.icon[title="Carrito de compras"] i');
  if (!imagen || !iconoCarrito) return;

  const clone = imagen.cloneNode(true);
  const imgRect = imagen.getBoundingClientRect();
  const cartRect = iconoCarrito.getBoundingClientRect();

  clone.classList.add("fly-to-cart");
  Object.assign(clone.style, {
    position: "fixed",
    left: `${imgRect.left}px`,
    top: `${imgRect.top}px`,
    width: `${imgRect.width}px`,
    height: `${imgRect.height}px`,
    opacity: "1",
    transform: "translate(0, 0)",
     pointerEvents: "none",
     zIndex: "9999",
    transition: "transform 0.75s cubic-bezier(.7,-0.15,.3,1.15), opacity 0.75s ease, width 0.75s ease, height 0.75s ease"
  });

  document.body.appendChild(clone);

  requestAnimationFrame(() => {
    const translateX = cartRect.left + cartRect.width / 2 - (imgRect.left + imgRect.width / 2);
    const translateY = cartRect.top + cartRect.height / 2 - (imgRect.top + imgRect.height / 2);
    clone.style.transform = `translate(${translateX}px, ${translateY}px) scale(0.2)`;
    clone.style.opacity = "0";
    clone.style.width = "40px";
    clone.style.height = "40px";
  });

  clone.addEventListener("transitionend", () => {
    clone.remove();
  }, { once: true });

  iconoCarrito.classList.add("cart-icon-pulse");
  setTimeout(() => iconoCarrito.classList.remove("cart-icon-pulse"), 600);
}