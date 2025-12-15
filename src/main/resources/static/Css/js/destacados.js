// Script para manejar los productos destacados en la página principal
(function() {
  'use strict';

  const CART_USER_KEY = "cart:user";
  const cartOwner = () => localStorage.getItem(CART_USER_KEY) || "anon";
  const cartKey = () => `carrito:${cartOwner()}`;

  // Funciones del carrito (alineadas con catálogo)
  function obtenerCarrito() {
    try {
      const almacenado = localStorage.getItem(cartKey());
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
    localStorage.setItem(cartKey(), JSON.stringify(carrito));
    notificarCambioCarrito();
  }

  function notificarCambioCarrito() {
    window.dispatchEvent(
      new CustomEvent("carrito:sync", {
        detail: { updatedAt: Date.now() }
      })
    );
  }

  function obtenerProductoDesdeCard(tarjeta) {
    if (!tarjeta) return null;
    const precio = parseFloat(tarjeta.dataset.precio || 0);
    const stock = Number(tarjeta.dataset.stock ?? 0);
    return {
      elemento: tarjeta,
      id: tarjeta.dataset.id ? Number(tarjeta.dataset.id) : null,
      nombre: tarjeta.dataset.nombre || tarjeta.querySelector("h3")?.innerText?.trim() || "Producto",
      imagen: tarjeta.dataset.imagen || tarjeta.querySelector("img")?.src || "",
      precio: precio || 0,
      stock: Number.isFinite(stock) ? stock : 0
    };
  }

  function cantidadEnCarrito(producto) {
    if (!producto?.id) return 0;
    const carrito = obtenerCarrito();
    const existente = carrito.find(item => item.id != null && Number(item.id) === Number(producto.id));
    return existente ? Math.max(0, Number(existente.cantidad) || 0) : 0;
  }

  function stockDisponible(producto) {
    const base = Number(producto?.stock ?? 0);
    if (!Number.isFinite(base)) return 0;
    return Math.max(0, base - cantidadEnCarrito(producto));
  }

  function agregarProductoAlCarrito(producto, cantidad = 1) {
    if (!producto.precio) {
      mostrarToast("No se pudo agregar el producto.", true);
      return;
    }

    const disponible = stockDisponible(producto);
    if (disponible <= 0) {
      mostrarToast("Este producto no tiene stock disponible.", true);
      return;
    }

    const carrito = obtenerCarrito();
    const existente = carrito.find(item => {
      if (producto.id != null && item.id != null) {
        return Number(item.id) === Number(producto.id);
      }
      return item.nombre === producto.nombre;
    });

    let cantidadAgregar = Math.max(1, cantidad);
    const yaEnCarrito = existente ? Math.max(0, existente.cantidad || 0) : 0;
    if (yaEnCarrito >= disponible) {
      mostrarToast("Alcanzaste el stock disponible de este producto.", true);
      return;
    }
    if (cantidadAgregar > disponible - yaEnCarrito) {
      cantidadAgregar = disponible - yaEnCarrito;
      mostrarToast(`Solo quedan ${cantidadAgregar} disponibles.`, true);
    }

    if (existente) {
      existente.cantidad = yaEnCarrito + cantidadAgregar;
      existente.precioUnitario = Number(existente.precioUnitario || producto.precio);
    } else {
      carrito.push({
        id: producto.id ?? null,
        nombre: producto.nombre,
        precioUnitario: producto.precio,
        cantidad: cantidadAgregar,
        imagen: producto.imagen
      });
    }

    guardarCarrito(carrito);
    if (producto.elemento) {
      animarTarjeta(producto.elemento);
    }
    mostrarToast(`${producto.nombre} se agregó al carrito.`);
  }

  function mostrarToast(mensaje, esError = false) {
    let toast = document.getElementById("cart-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "cart-toast";
      toast.className = "cart-toast";
      document.body.appendChild(toast);
    }

    const iconClass = esError ? "fa-circle-exclamation" : "fa-circle-check";
    toast.classList.remove("visible", "error", "success");
    void toast.offsetWidth;
    toast.innerHTML = `
      <span class="toast-icon">
        <i class="fa-solid ${iconClass}"></i>
      </span>
      <span class="toast-message">${mensaje}</span>
    `;
    toast.classList.add(esError ? "error" : "success");
    toast.classList.add("visible");

    setTimeout(() => {
      toast.classList.remove("visible");
    }, 2400);
  }

  function animarTarjeta(tarjeta) {
    if (!tarjeta) return;
    tarjeta.style.transform = 'scale(0.95)';
    setTimeout(() => {
      tarjeta.style.transform = '';
    }, 200);
  }

  function animarFlyToCart(tarjeta) {
    const imagen = tarjeta?.querySelector("img");
    const iconoCarrito = document.querySelector('.icon[title="Carrito de compras"] i, .icon-cart i');
    if (!imagen || !iconoCarrito) return;

    const clone = imagen.cloneNode(true);
    const imgRect = imagen.getBoundingClientRect();
    const cartRect = iconoCarrito.getBoundingClientRect();

    clone.style.cssText = `
      position: fixed;
      left: ${imgRect.left}px;
      top: ${imgRect.top}px;
      width: ${imgRect.width}px;
      height: ${imgRect.height}px;
      opacity: 1;
      pointer-events: none;
      z-index: 9999;
      border-radius: 15px;
      transition: transform 0.75s cubic-bezier(.7,-0.15,.3,1.15), opacity 0.75s ease, width 0.75s ease, height 0.75s ease;
    `;

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

  // Inicializar cuando el DOM esté listo
  document.addEventListener("DOMContentLoaded", function() {
    const iconosCarrito = document.querySelectorAll(".tarjeta-corte .destacado-carrito");
    
    iconosCarrito.forEach(icono => {
      icono.addEventListener("click", function(event) {
        event.stopPropagation();
        const tarjeta = icono.closest(".tarjeta-corte");
        if (!tarjeta) return;

        const producto = obtenerProductoDesdeCard(tarjeta);
        if (!producto) {
          mostrarToast("No se pudo obtener la información del producto.", true);
          return;
        }

        if (producto.stock <= 0) {
          mostrarToast("Este producto no tiene stock disponible.", true);
          return;
        }

        // Agregar directamente al carrito con cantidad 1
        agregarProductoAlCarrito(producto, 1);
        if (tarjeta) {
          animarFlyToCart(tarjeta);
        }
      });
    });
  });
})();

