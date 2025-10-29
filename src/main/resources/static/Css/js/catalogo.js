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

  let precioUnitario = 0;

  // Función para formatear precio en pesos (ej: 1.234.567)
  function formatearPesos(n) {
    return new Intl.NumberFormat('es-CO').format(n) + " $";
  }

  // Abrir modal con datos del producto
  productos.forEach(producto => {
    producto.addEventListener("click", () => {
      const imagen = producto.querySelector("img").src;
      const nombre = producto.querySelector("h3").innerText;
      const precioTexto = producto.querySelector(".precio").innerText;

      // Convertir "130.000 $" -> 130000 (number)
      precioUnitario = parseFloat(precioTexto.replace(/\./g, "").replace(/\s*\$/g, "").trim()) || 0;

      modalImagen.src = imagen;
      modalNombre.innerText = nombre;
      modalPrecioUnitario.innerText = precioTexto;
      modalCantidad.value = 1;
      modalPrecioTotal.innerText = formatearPesos(precioUnitario);

      // Mostrar modal
      modal.style.display = "flex";

      // Asegurarse de que el input tenga foco para mejor UX
      setTimeout(() => modalCantidad.focus(), 100);
    });
  });

  // Cerrar modal con la X
  cerrar.addEventListener("click", () => {
    modal.style.display = "none";
  });

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

    // Limitar inmediatamente
    if (n > 99) n = 99;
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
      if (v > 99) v = 99;
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
    if (num > 99) {
      e.preventDefault();
      modalCantidad.value = 99;
      modalPrecioTotal.innerText = formatearPesos(99 * precioUnitario);
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

  // Opcional: botón de comprar (puedes enlazar con tu lógica de carrito)
  const btnComprar = document.getElementById("modal-comprar");
  if (btnComprar) {
    btnComprar.addEventListener("click", () => {

    });
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