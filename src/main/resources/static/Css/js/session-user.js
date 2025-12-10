(() => {
  const accountIcons = () =>
    Array.from(document.querySelectorAll("[data-user-account-icon]"));
  const initialBadges = () =>
    Array.from(document.querySelectorAll("[data-user-account-initial]"));
  const adminIcons = () =>
    Array.from(document.querySelectorAll("[data-admin-icon]"));

  const CART_USER_KEY = "cart:user";

  const sanitizarCorreo = (correo = "") =>
    correo.replace(/[^a-zA-Z0-9._-]/g, "_").toLowerCase();

  async function obtenerSesion() {
    try {
      const res = await fetch("/api/auth/session", {
        credentials: "same-origin",
        headers: { "Accept": "application/json" },
      });

      if (!res.ok) {
        ocultarIconos();
        mostrarIconoRegistro();
        return;
      }

      const data = await res.json();
      if (data?.loggedIn) {
        mostrarIconos(data);
        ocultarIconoRegistro();
        actualizarUsuarioCarrito(data.userEmail || data.userCorreo || null);
      } else {
        ocultarIconos();
        mostrarIconoRegistro();
        actualizarUsuarioCarrito(null);
      }
    } catch (error) {
      console.warn("No fue posible verificar la sesión", error);
      ocultarIconos();
      mostrarIconoRegistro();
      actualizarUsuarioCarrito(null);
    }
  }

  function mostrarIconos(data) {
    const inicial =
      (data?.userNombre || data?.userEmail || "U").trim().charAt(0).toUpperCase() ||
      "U";
    const nombre = (data?.userNombre || "").trim();
    const title = nombre
      ? `${nombre}${data?.isAdmin ? " (admin)" : ""}`
      : "Ir a mi cuenta";

    accountIcons().forEach((icon) => {
      icon.hidden = false;
      icon.classList.add("visible");
      icon.setAttribute("title", title);
      icon.setAttribute("aria-label", title);
    });

    adminIcons().forEach((icon) => {
      const esAdmin = !!data?.isAdmin;
      const adminTitle = esAdmin
        ? `Panel admin • ${title}`
        : "Panel admin";
      icon.hidden = !esAdmin;
      icon.classList.toggle("visible", esAdmin);
      icon.style.display = esAdmin ? "" : "none";
      icon.setAttribute("title", esAdmin ? adminTitle : "");
      icon.setAttribute("aria-label", esAdmin ? adminTitle : "");
    });

    initialBadges().forEach((badge) => {
      badge.textContent = inicial;
    });
  }

  function ocultarIconos() {
    accountIcons().forEach((icon) => {
      icon.hidden = true;
      icon.classList.remove("visible");
    });

    adminIcons().forEach((icon) => {
      icon.hidden = true;
      icon.classList.remove("visible");
      icon.style.display = "none";
    });
  }

  function ocultarIconoRegistro() {
    // Buscar todos los iconos de registro buscando el icono fa-user-plus dentro de un enlace
    const iconos = document.querySelectorAll('a.icon');
    iconos.forEach((icon) => {
      const iconElement = icon.querySelector('i.fa-user-plus');
      if (iconElement) {
        icon.style.display = 'none';
        icon.setAttribute('data-registro-hidden', 'true');
      }
    });
  }

  function mostrarIconoRegistro() {
    // Mostrar todos los iconos de registro que fueron ocultados
    const iconos = document.querySelectorAll('a.icon[data-registro-hidden="true"]');
    iconos.forEach((icon) => {
      // Remover el estilo inline para restaurar el display original
      icon.style.display = '';
      icon.removeAttribute('data-registro-hidden');
    });
  }

  function actualizarUsuarioCarrito(email) {
    const valor = email && typeof email === "string"
      ? sanitizarCorreo(email.trim())
      : "anon";
    try {
      localStorage.setItem(CART_USER_KEY, valor);
      window.dispatchEvent(new CustomEvent("carrito:owner", { detail: { email: valor } }));
    } catch (e) {
      // si localStorage falla, simplemente seguimos
    }
  }

  document.addEventListener("DOMContentLoaded", obtenerSesion);
  window.addEventListener("auth:refresh", obtenerSesion);
})();

