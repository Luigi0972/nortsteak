// Al cargar la página, mostrar el carrito
document.addEventListener("DOMContentLoaded", () => {
  mostrarCarrito();
  configurarBotones();
});

//  Mostrar Carrito
function mostrarCarrito() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const contenedor = document.getElementById("carrito-lista");
  const totalDiv = document.getElementById("total");

  if (carrito.length === 0) {
    contenedor.innerHTML = "<p>No hay productos seleccionados.</p>";
    totalDiv.innerHTML = "";
    return;
  }

  let total = 0;
  contenedor.innerHTML = "";

  carrito.forEach((producto, index) => {
    const item = document.createElement("div");
    item.classList.add("producto-item");
    item.innerHTML = `
      <div class="producto-info">
        <img src="${producto.imagen || 'img/default.png'}" alt="${producto.nombre}" class="producto-imagen">
        <div>
          <h4>${producto.nombre}</h4>
          <p>$${producto.precio.toLocaleString()}</p>
        </div>
      </div>
      <button class="eliminar-btn" data-index="${index}">Eliminar</button>
    `;
    contenedor.appendChild(item);
    total += producto.precio;
  });

  totalDiv.innerHTML = `<strong>Total: $${total.toLocaleString()}</strong>`;

  // Añadir eventos a los botones de eliminar
  document.querySelectorAll(".eliminar-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      eliminarProducto(e.target.dataset.index);
    });
  });
}

//  Eliminar Producto del Carrito
function eliminarProducto(index) {
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  carrito.splice(index, 1);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  mostrarCarrito();
}

//  Configurar Botones de Pago
function configurarBotones() {
  const btnNequi = document.getElementById("btnNequi");
  const btnTarjeta = document.getElementById("btnTarjeta");
  const seccionNequi = document.getElementById("qrNequi");
  const seccionTarjeta = document.getElementById("bancos");


  if (btnNequi && btnTarjeta && seccionNequi && seccionTarjeta) {
    btnNequi.addEventListener("click", () => {
      seccionNequi.style.display = "block";
      seccionTarjeta.style.display = "none";
    });

    btnTarjeta.addEventListener("click", () => {
      seccionTarjeta.style.display = "block";
      seccionNequi.style.display = "none";
    });
  }

  const btnPagar = document.getElementById("btnPagar");
  if (btnPagar) btnPagar.addEventListener("click", procesarPago);
}

//procesar pago

function procesarPago() {
  const nombre = document.getElementById("nombre")?.value.trim();
  const cedula = document.getElementById("cedula")?.value.trim();
  const correo = document.getElementById("correo")?.value.trim();
  const telefono = document.getElementById("telefono")?.value.trim();
  const direccion = document.getElementById("direccion")?.value.trim();
  const mensajeDiv = document.getElementById("mensaje");
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const total = carrito.reduce((acc, p) => acc + p.precio, 0);

  if (!nombre || !cedula || !correo) {
    mostrarMensaje("Por favor, completa todos los campos obligatorios.", true);
    return;
  }

  if (carrito.length === 0) {
    mostrarMensaje("Tu carrito está vacío.", true);
    return;
  }

  const datos = {
    nombre,
    cedula,
    correo,
    telefono,
    direccion,
    total,
    productos: carrito.map(p => p.nombre)
  };

  mostrarMensaje("Procesando pago...", false);

  fetch("http://localhost:8080/api/pago", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  })
    .then(res => res.json())
    .then(data => {
      mostrarMensaje("Pago procesado correctamente ✅", false);
      console.log("Respuesta del servidor:", data);
      localStorage.removeItem("carrito");
      setTimeout(() => (window.location.href = "catalogo.html"), 2000);
    })
    .catch(err => {
      console.error("Error al procesar el pago:", err);
      mostrarMensaje("Ocurrió un error al procesar el pago.", true);
    });
}

//  Mostrar Mensajes de Estad
function mostrarMensaje(texto, error = false) {
  const mensajeDiv = document.getElementById("mensaje");
  if (!mensajeDiv) return;

  mensajeDiv.textContent = texto;
  mensajeDiv.style.color = error ? "red" : "green";
}
