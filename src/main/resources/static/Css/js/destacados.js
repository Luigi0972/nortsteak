// Script para manejar los productos destacados en la página principal
(function() {
  'use strict';

  // Funciones del carrito (reutilizadas del catálogo)
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

  function agregarProductoAlCarrito(producto, cantidad = 1) {
    if (!producto.precio) {
      mostrarMensaje("No se pudo agregar el producto.", true);
      return;
    }

    if (producto.stock <= 0) {
      mostrarMensaje("Este producto no tiene stock disponible.", true);
      return;
    }

    const carrito = obtenerCarrito();
    const existente = carrito.find(item => {
      if (producto.id != null && item.id != null) {
        return Number(item.id) === Number(producto.id);
      }
      return item.nombre === producto.nombre;
    });

    const cantidadAgregar = Math.max(1, Math.min(cantidad, producto.stock));
    if (existente) {
      const nuevaCantidad = (existente.cantidad || 1) + cantidadAgregar;
      if (nuevaCantidad > producto.stock) {
        mostrarMensaje(`Solo hay ${producto.stock} unidades disponibles.`, true);
        return;
      }
      existente.cantidad = nuevaCantidad;
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
    mostrarMensaje(`${producto.nombre} se agregó al carrito.`);
  }

  function mostrarMensaje(mensaje, esError = false) {
    // Crear un toast simple si no existe
    let toast = document.getElementById("destacado-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "destacado-toast";
      toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${esError ? '#f8d7da' : '#d1e7dd'};
        color: ${esError ? '#842029' : '#0f5132'};
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-size: 14px;
        display: none;
        animation: slideIn 0.3s ease-out;
      `;
      document.body.appendChild(toast);
    }

    toast.textContent = mensaje;
    toast.style.display = 'block';

    setTimeout(() => {
      toast.style.display = 'none';
    }, 3000);
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
          mostrarMensaje("No se pudo obtener la información del producto.", true);
          return;
        }

        if (producto.stock <= 0) {
          mostrarMensaje("Este producto no tiene stock disponible.", true);
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

