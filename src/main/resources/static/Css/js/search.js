// Lista de productos prospects
const productos = [
    "Corte New York",
    "Tomahawk",
    "Filete Mignon",
    "Lomo de res",
    "Ribeye",
    "Picaña",
    "T-Bone",
    "Brisket",
    "Churrasco"
];

// Función para mostrar mensaje de error
function showErrorMessage(message) {
    // Remover mensaje anterior si existe
    const existingMessage = document.querySelector('.search-error-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Crear nuevo mensaje
    const errorMessage = document.createElement('div');
    errorMessage.className = 'search-error-message';
    errorMessage.innerHTML = `
        <div class="search-error-content">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
        </div>
    `;

    // Agregar al body
    document.body.appendChild(errorMessage);

    // Animación de entrada
    setTimeout(() => {
        errorMessage.classList.add('show');
    }, 10);

    // Remover después de 3 segundos
    setTimeout(() => {
        errorMessage.classList.remove('show');
        setTimeout(() => {
            errorMessage.remove();
        }, 300);
    }, 3000);
}

// Función para inicializar la búsqueda
function initSearch() {
    const searchInputs = document.querySelectorAll('.search-input');
    
    searchInputs.forEach(input => {
        setupAutocomplete(input);
        
        // Si se envía el formulario, evitar el comportamiento por defecto
        const form = input.closest('.search-form');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                handleSearch(input.value);
            });
        }
    });
}

function setupAutocomplete(input) {
    let suggestionsContainer = createSuggestionsContainer(input);
    let currentFocus = -1;

    input.addEventListener('input', function() {
        const value = this.value.toLowerCase().trim();
        
        if (value.length === 0) {
            suggestionsContainer.style.display = 'none';
            return;
        }

        // Filtrar productos que coincidan
        const matches = productos.filter(producto => 
            producto.toLowerCase().includes(value)
        );

        displaySuggestions(matches, suggestionsContainer, input);

        // Si hay coincidencias, mostrar el contenedor
        if (matches.length > 0) {
            suggestionsContainer.style.display = 'block';
        } else {
            suggestionsContainer.style.display = 'none';
        }
    });

    input.addEventListener('keydown', function(e) {
        const suggestions = suggestionsContainer.querySelectorAll('.suggestion-item');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentFocus++;
            if (currentFocus >= suggestions.length) currentFocus = 0;
            highlightSuggestion(suggestions, currentFocus);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentFocus--;
            if (currentFocus < 0) currentFocus = suggestions.length - 1;
            highlightSuggestion(suggestions, currentFocus);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            suggestionsContainer.style.display = 'none';
            if (currentFocus >= 0 && suggestions[currentFocus]) {
                suggestions[currentFocus].click();
            } else {
                handleSearch(this.value);
            }
        } else if (e.key === 'Escape') {
            suggestionsContainer.style.display = 'none';
        }
    });

    // Cerrar sugerencias al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!input.parentElement.contains(e.target)) {
            suggestionsContainer.style.display = 'none';
        }
    });
}

function createSuggestionsContainer(input) {
    // Verificar si ya existe
    let container = input.parentElement.querySelector('.suggestions-container');
    
    if (!container) {
        container = document.createElement('div');
        container.className = 'suggestions-container';
        
        // Asegurar que el contenedor padre tenga position relative
        const searchForm = input.closest('.search-form');
        if (searchForm) {
            searchForm.style.position = 'relative';
        }
        
        input.parentElement.appendChild(container);
    }
    
    return container;
}

function displaySuggestions(matches, container, input) {
    container.innerHTML = '';
    
    matches.forEach(match => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.textContent = match;
        
        item.addEventListener('click', function() {
            handleSearch(match);
        });
        
        container.appendChild(item);
    });
}

function highlightSuggestion(suggestions, index) {
    suggestions.forEach((item, i) => {
        if (i === index) {
            item.classList.add('highlighted');
        } else {
            item.classList.remove('highlighted');
        }
    });
}

function handleSearch(query) {
    // Normalizar el nombre del producto para buscar coincidencias
    const normalizedQuery = query.trim();
    
    // Validación: Si está vacío, no hacer nada
    if (normalizedQuery.length === 0) {
        return;
    }
    
    let productoMatch = null;
    
    // Buscar coincidencia exacta o parcial
    for (const producto of productos) {
        if (producto.toLowerCase().includes(normalizedQuery.toLowerCase())) {
            productoMatch = producto;
            break;
        }
    }
    
    // Redirigir al catálogo con el parámetro del producto
    if (productoMatch) {
        window.location.href = `/catalogo?producto=${encodeURIComponent(productoMatch)}`;
    } else {
        // Mostrar mensaje de error si no hay coincidencias
        showErrorMessage('No se encontró ningún producto con ese nombre.');
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initSearch);

