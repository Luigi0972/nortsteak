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
        return;
      }

      const data = await res.json();
      if (data?.loggedIn) {
        mostrarIconos(data);
      } else {
        ocultarIconos();
      }
    } catch (error) {
      console.warn("No fue posible verificar la sesión", error);
      ocultarIconos();
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

  document.addEventListener("DOMContentLoaded", obtenerSesion);
  window.addEventListener("auth:refresh", obtenerSesion);
})();

