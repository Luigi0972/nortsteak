// Lista de productos disponibles
const productos = [
  'Corte New York',
  'Tomahawk',
  'Filete Mignon',
  'Lomo de res',
  'Ribeye',
  'Picaña',
  'T-Bone',
  'Brisket',
  'Churrasco'
];

// Función para normalizar nombres
function normalizarNombre(nombre) {
  return nombre.toLowerCase()
    .replace(/á/g, 'a')
    .replace(/é/g, 'e')
    .replace(/í/g, 'i')
    .replace(/ó/g, 'o')
    .replace(/ú/g, 'u')
    .replace(/n/g, 'ñ')
    .trim();
}

// Función para filtrar productos
function filtrarProductos(busqueda) {
  if (!busqueda || busqueda.trim() === '') return [];
  
  const busquedaNormalizada = normalizarNombre(busqueda);
  
  return productos.filter(producto => {
    const productoNormalizado = normalizarNombre(producto);
    return productoNormalizado.includes(busquedaNormalizada);
  });
}

// Función para crear HTML de sugerencias
function crearSugerenciasHTML(resultados) {
  if (resultados.length === 0) return '';
  
  let html = '<ul class="sugerencias-lista">';
  resultados.forEach(producto => {
    html += `<li class="sugerencia-item">${producto}</li>`;
  });
  html += '</ul>';
  return html;
}

// Función para mostrar sugerencias
function mostrarSugerencias(resultados) {
  const contenedor = document.getElementById('sugerencias-container');
  console.log('📦 Mostrar sugerencias:', resultados, 'Contenedor:', contenedor);
  
  if (!contenedor) {
    console.warn('⚠️ No se encontró el contenedor de sugerencias');
    return;
  }
  
  if (resultados.length === 0) {
    console.log('No hay resultados, ocultando contenedor');
    contenedor.style.display = 'none';
    return;
  }
  
  contenedor.innerHTML = crearSugerenciasHTML(resultados);
  contenedor.style.display = 'block';
  console.log('✅ Sugerencias mostradas');
  
  // Agregar eventos a los items de sugerencias
  const items = contenedor.querySelectorAll('.sugerencia-item');
  items.forEach(item => {
    item.addEventListener('click', () => {
      const producto = item.textContent;
      document.getElementById('search-input').value = producto;
      document.getElementById('search-form').submit();
    });
  });
}

// Función para verificar si el producto existe
function productoExiste(busqueda) {
  const busquedaNormalizada = normalizarNombre(busqueda);
  
  return productos.some(producto => {
    const productoNormalizado = normalizarNombre(producto);
    
    // Comparación exacta (case-insensitive)
    if (productoNormalizado === busquedaNormalizada) {
      return true;
    }
    
    // También verificar si el producto contiene la búsqueda o viceversa
    if (productoNormalizado.includes(busquedaNormalizada) || 
        busquedaNormalizada.includes(productoNormalizado)) {
      return true;
    }
    
    return false;
  });
}

// Función para mostrar mensaje de error
function mostrarError(mensaje) {
  // Remover mensaje anterior si existe
  const mensajeAnterior = document.querySelector('.mensaje-error');
  if (mensajeAnterior) {
    mensajeAnterior.remove();
  }
  
  // Crear nuevo mensaje de error centrado
  const mensajeError = document.createElement('div');
  mensajeError.className = 'mensaje-error';
  mensajeError.innerHTML = `
    <i class="fas fa-exclamation-triangle"></i>
    <span>${mensaje}</span>
  `;
  
  // Insertar al inicio del body o después del header
  const headerContainer = document.querySelector('.header-container');
  if (headerContainer) {
    headerContainer.insertAdjacentElement('afterend', mensajeError);
  } else {
    document.body.insertBefore(mensajeError, document.body.firstChild);
  }
  
  // Scroll suave al mensaje de error
  mensajeError.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
  // Remover mensaje después de 5 segundos
  setTimeout(() => {
    mensajeError.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => {
      if (mensajeError.parentNode) {
        mensajeError.remove();
      }
    }, 300);
  }, 5000);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  const searchForm = document.getElementById('search-form');
  const sugerenciasContainer = document.getElementById('sugerencias-container');
  
  console.log('🔍 Buscador inicializado');
  
  if (!searchInput || !searchForm) {
    console.error('❌ No se encontraron elementos de búsqueda');
    return;
  }
  
  // Evento para mostrar sugerencias mientras escribe
  searchInput.addEventListener('input', (e) => {
    const busqueda = e.target.value;
    const resultados = filtrarProductos(busqueda);
    console.log('Búsqueda:', busqueda, '-> Resultados:', resultados);
    mostrarSugerencias(resultados);
  });
  
  // Evento para ocultar sugerencias cuando pierde el foco
  searchInput.addEventListener('blur', () => {
    setTimeout(() => {
      if (sugerenciasContainer) {
        sugerenciasContainer.style.display = 'none';
      }
    }, 200);
  });
  
  // Evento para validar antes de enviar el formulario
  searchForm.addEventListener('submit', (e) => {
    const busqueda = searchInput.value.trim();
    
    if (busqueda === '') {
      e.preventDefault();
      return;
    }
    
    // Verificar si el producto existe
    if (!productoExiste(busqueda)) {
      e.preventDefault();
      mostrarError('El producto "' + busqueda + '" no existe en nuestro catálogo.');
      searchInput.focus();
    }
  });
  
  // Mostrar sugerencias cuando el input recibe foco
  searchInput.addEventListener('focus', () => {
    const busqueda = searchInput.value;
    if (busqueda.length > 0) {
      const resultados = filtrarProductos(busqueda);
      mostrarSugerencias(resultados);
    }
  });
});

