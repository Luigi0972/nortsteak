(() => {
  const badges = document.querySelectorAll("[data-cart-count]");
  if (!badges.length) return;

  function obtenerCarritoSeguro() {
    try {
      const raw = localStorage.getItem("carrito");
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn("No se pudo leer el carrito para el contador", error);
      return [];
    }
  }

  function contarProductos(carrito) {
    return carrito.reduce((total, item) => {
      const cantidad = Number(item?.cantidad ?? 1);
      return total + (Number.isFinite(cantidad) ? Math.max(1, cantidad) : 1);
    }, 0);
  }

  function renderizar(totalProductos) {
    const texto = totalProductos > 99 ? "99+" : `${totalProductos}`;
    badges.forEach((badge) => {
      if (totalProductos > 0) {
        badge.textContent = texto;
        badge.classList.add("visible");
        badge.setAttribute("aria-hidden", "false");
      } else {
        badge.textContent = "0";
        badge.classList.remove("visible");
        badge.setAttribute("aria-hidden", "true");
      }
    });
  }

  function refrescar() {
    renderizar(contarProductos(obtenerCarritoSeguro()));
  }

  window.addEventListener("storage", (event) => {
    if (event.key === "carrito") {
      refrescar();
    }
  });

  window.addEventListener("carrito:sync", refrescar);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      refrescar();
    }
  });

  window.cartBadge = {
    refresh: refrescar
  };

  refrescar();
})();

