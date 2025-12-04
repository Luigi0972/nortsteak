(() => {
  const accountIcons = () =>
    Array.from(document.querySelectorAll("[data-user-account-icon]"));
  const initialBadges = () =>
    Array.from(document.querySelectorAll("[data-user-account-initial]"));
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
      } else {
        ocultarIconos();
        mostrarIconoRegistro();
      }
    } catch (error) {
      console.warn("No fue posible verificar la sesión", error);
      ocultarIconos();
      mostrarIconoRegistro();
    }
  }

  function mostrarIconos(data) {
    const inicial =
      (data?.userNombre || data?.userEmail || "U").trim().charAt(0).toUpperCase() ||
      "U";
    const title = data?.userNombre
      ? `Mi cuenta (${data.userNombre})`
      : "Ir a mi cuenta";

    accountIcons().forEach((icon) => {
      icon.hidden = false;
      icon.classList.add("visible");
      icon.setAttribute("title", title);
      icon.setAttribute("aria-label", title);
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

  document.addEventListener("DOMContentLoaded", obtenerSesion);
  window.addEventListener("auth:refresh", obtenerSesion);
})();

