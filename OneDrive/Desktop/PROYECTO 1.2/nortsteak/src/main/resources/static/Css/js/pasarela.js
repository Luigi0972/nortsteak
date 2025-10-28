// Diccionario de enlaces por producto
const linksProductos = {
  "Corte New York": "https://mpago.li/1jT1gdx",
  "Tomahawk": "https://mpago.li/2XFB646",
  "Filete Mignon": "https://mpago.li/2eUaTag",
  "Lomo de res": "https://mpago.li/1aNKfto",
  "Ribeye": "https://mpago.li/1FQ8RqJ",
  "Picaña": "https://mpago.li/2vRWDnq",
  "T-Bone": "https://mpago.li/1fE6vEd",
  "Brisket": "https://mpago.li/1BHcy7m",
  "Churrasco": "https://mpago.li/1QZCSAV"
};

let productoSeleccionado = null;

// Mostrar sección de pago Nequi o Tarjeta
function mostrarSeccion(seccion) {
  document.getElementById('seccionNequi').style.display = seccion === 'nequi' ? 'block' : 'none';
  document.getElementById('seccionTarjeta').style.display = seccion === 'tarjeta' ? 'block' : 'none';

  // Ocultar QR al cambiar de sección
  document.getElementById('qrNequi').style.display = 'none';

  // Ocultar alertas
  document.getElementById('alertaProductoNequi').style.display = 'none';
  document.getElementById('alertaProductoTarjeta').style.display = 'none';

  // Actualizar visibilidad de datos y producto
  actualizarVisibilidadDatosCliente();
}

// Mostrar el producto y su imagen en ambas secciones
function seleccionarProducto(nombre, precio, imagen) {
  productoSeleccionado = nombre;

  const texto = `${nombre} - $${precio.toLocaleString('es-CO')}`;
  document.getElementById('productoNequi').textContent = texto;
  document.getElementById('productoTarjeta').textContent = texto;

  const imagenHTML = `<img src="${imagen}" alt="${nombre}" class="imagen-producto">`;
  document.getElementById('imagenNequi').innerHTML = imagenHTML;
  document.getElementById('imagenTarjeta').innerHTML = imagenHTML;

  document.getElementById('seleccionarNequi').style.display = 'none';
  document.getElementById('seleccionarTarjeta').style.display = 'none';

  actualizarVisibilidadDatosCliente();
}

// Mostrar u ocultar campos y producto según si hay producto seleccionado
function actualizarVisibilidadDatosCliente() {
  const display = productoSeleccionado ? 'block' : 'none';

  // Campos cliente
  document.querySelectorAll('#seccionNequi .datos-cliente').forEach(div => {
    div.style.display = display;
  });
  document.querySelectorAll('#seccionTarjeta .datos-cliente').forEach(div => {
    div.style.display = display;
  });

  // Producto seleccionado e imagen
  document.getElementById('productoNequi').style.display = display;
  document.getElementById('productoTarjeta').style.display = display;
  document.getElementById('imagenNequi').style.display = display;
  document.getElementById('imagenTarjeta').style.display = display;
}

// Validar campos cliente
function validarCampos(seccion) {
  const campos = ['nombre', 'cedula', 'telefono', 'correo', 'direccion'].map(c => {
    return document.getElementById(`${c}${capitalize(seccion)}`);
  });

  for (let campo of campos) {
    if (!campo.value.trim()) {
      alert('Por favor, completa todos los campos obligatorios.');
      campo.focus();
      return false;
    }
  }

  return true;
}

// Capitalizar primera letra (nequi -> Nequi)
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Mostrar QR Nequi
function generarQR() {
  if (!productoSeleccionado) {
    document.getElementById('alertaProductoNequi').style.display = 'block';
    return;
  }

  if (!validarCampos('nequi')) return;

  document.getElementById('qrNequi').style.display = 'block';
}

// Redirigir a Mercado Pago
function redirigirALink() {
  if (!productoSeleccionado || !linksProductos[productoSeleccionado]) {
    document.getElementById('alertaProductoTarjeta').style.display = 'block';
    return;
  }

  if (!validarCampos('tarjeta')) return;

  window.location.href = linksProductos[productoSeleccionado];
}

// Recuperar producto desde localStorage
document.addEventListener('DOMContentLoaded', () => {
  const guardado = localStorage.getItem('producto');
  if (guardado) {
    const { nombre, precio, imagen } = JSON.parse(guardado);
    seleccionarProducto(nombre, precio, imagen);
    localStorage.removeItem('producto');
  } else {
    actualizarVisibilidadDatosCliente();
  }
});