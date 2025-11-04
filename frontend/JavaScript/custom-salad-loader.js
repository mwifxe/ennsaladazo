// ===================================
// CUSTOM SALAD BUILDER - Carga ingredientes desde el backend
// Versión CORREGIDA sin conflictos
// ===================================

// NO declaramos API_URL aquí porque ya existe en Inicio.js
// Usamos la variable global que ya está definida

// Estado global para el constructor de ensaladas
let selectedIngredients = [];
let availableIngredients = {};
let currentCategory = 'bases';

// ======================
//  CARGAR INGREDIENTES DEL BACKEND
// ======================

async function loadIngredientsFromBackend() {
    try {
        console.log('🔄 Cargando ingredientes desde el backend...');

        // Usamos API_URL que ya está definida en Inicio.js
        const response = await fetch(`${API_URL}/api/custom-salads/ingredients`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const ingredients = await response.json();
        console.log('✅ Ingredientes cargados:', ingredients);

        availableIngredients = ingredients;
        return ingredients;

    } catch (error) {
        console.error('❌ Error al cargar ingredientes:', error);
        console.log('💡 Asegúrate de que el backend esté corriendo en:', API_URL);

        showCustomSaladNotification('Error al cargar ingredientes. Verifica el backend.', 'error');

        return null;
    }
}

// ======================
//  INICIALIZAR BUILDER
// ======================

async function initializeSaladBuilder() {
    console.log('🥗 Inicializando constructor de ensaladas...');

    // Cargar ingredientes del backend
    const ingredients = await loadIngredientsFromBackend();

    if (!ingredients) {
        console.error('❌ No se pudieron cargar los ingredientes');
        return;
    }

    // Mostrar ingredientes de la categoría inicial
    displayIngredients(currentCategory);

    // Configurar navegación de categorías
    setupCategoryNavigation();

    // Configurar botón de agregar al carrito
    setupAddToCartButton();

    // Inicializar iconos de Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    console.log('✅ Constructor de ensaladas inicializado');
}

// ======================
//  MOSTRAR INGREDIENTES POR CATEGORÍA
// ======================

function displayIngredients(category) {
    const ingredientsGrid = document.getElementById('ingredients-grid');

    if (!ingredientsGrid) {
        console.error('❌ No se encontró #ingredients-grid');
        return;
    }

    // Limpiar grid
    ingredientsGrid.innerHTML = '';

    // Obtener ingredientes de la categoría
    const categoryIngredients = availableIngredients[category] || [];

    if (categoryIngredients.length === 0) {
        ingredientsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">
                <p>No hay ingredientes disponibles en esta categoría</p>
            </div>
        `;
        return;
    }

    // Crear tarjeta para cada ingrediente
    categoryIngredients.forEach(ingredient => {
        const ingredientCard = createIngredientCard(ingredient, category);
        ingredientsGrid.appendChild(ingredientCard);
    });

    // Reinicializar iconos
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// ======================
//  CREAR TARJETA DE INGREDIENTE
// ======================

function createIngredientCard(ingredient, category) {
    const card = document.createElement('div');
    card.className = 'ingredient-card';

    if (!ingredient.available) {
        card.classList.add('unavailable');
    }

    // Verificar si ya está seleccionado
    const isSelected = selectedIngredients.some(item =>
        item.name === ingredient.name && item.category === category
    );

    if (isSelected) {
        card.classList.add('selected');
    }

    // Obtener icono según categoría
    const icon = getCategoryIcon(category, ingredient.name);

    card.innerHTML = `
        <div class="ingredient-icon">
            <i data-lucide="${icon}" size="32"></i>
        </div>
        <div class="ingredient-info">
            <h4 class="ingredient-name">${ingredient.name}</h4>
            <p class="ingredient-price">
                ${ingredient.price === 0 ? 'Incluido' : `+$${ingredient.price.toFixed(2)}`}
            </p>
        </div>
        <div class="ingredient-status">
            ${isSelected ? '<i data-lucide="check-circle" size="20"></i>' : ''}
        </div>
    `;

    // Evento de clic
    if (ingredient.available) {
        card.addEventListener('click', () => {
            toggleIngredient(ingredient, category, card);
        });
    }

    return card;
}

// ======================
//  ALTERNAR SELECCIÓN DE INGREDIENTE
// ======================

function toggleIngredient(ingredient, category, cardElement) {
    const index = selectedIngredients.findIndex(item =>
        item.name === ingredient.name && item.category === category
    );

    if (index !== -1) {
        // Remover ingrediente
        selectedIngredients.splice(index, 1);
        cardElement.classList.remove('selected');
        cardElement.querySelector('.ingredient-status').innerHTML = '';
    } else {
        // Agregar ingrediente
        selectedIngredients.push({
            ...ingredient,
            category: category
        });
        cardElement.classList.add('selected');
        cardElement.querySelector('.ingredient-status').innerHTML =
            '<i data-lucide="check-circle" size="20"></i>';
    }

    // Actualizar resumen y progreso
    updateSummary();
    updateProgress();

    // Reinicializar iconos
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// ======================
//  ACTUALIZAR RESUMEN
// ======================

function updateSummary() {
    const selectedContainer = document.getElementById('selected-ingredients');
    const totalPriceElement = document.getElementById('total-price');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const saladPreview = document.getElementById('salad-preview');

    if (!selectedContainer || !totalPriceElement) return;

    // Si no hay ingredientes seleccionados
    if (selectedIngredients.length === 0) {
        selectedContainer.innerHTML = `
            <div class="empty-state">
                <p style="text-align: center; color: var(--text-gray);">
                    Selecciona ingredientes para ver tu ensalada
                </p>
            </div>
        `;
        totalPriceElement.textContent = '$0.00';
        if (addToCartBtn) addToCartBtn.disabled = true;
        if (saladPreview) {
            saladPreview.innerHTML = '<i data-lucide="salad" size="60"></i>';
        }
        return;
    }

    // Agrupar por categoría
    const grouped = {};
    selectedIngredients.forEach(item => {
        if (!grouped[item.category]) {
            grouped[item.category] = [];
        }
        grouped[item.category].push(item);
    });

    // Crear HTML del resumen
    let summaryHTML = '';

    Object.keys(grouped).forEach(category => {
        const categoryName = getCategoryDisplayName(category);
        summaryHTML += `
            <div class="summary-category">
                <h4 class="summary-category-title">${categoryName}</h4>
                <div class="summary-items">
        `;

        grouped[category].forEach(item => {
            summaryHTML += `
                <div class="summary-item">
                    <span>${item.name}</span>
                    <span class="summary-item-price">
                        ${item.price === 0 ? 'Incluido' : `$${item.price.toFixed(2)}`}
                    </span>
                    <button class="remove-item-btn" onclick="removeIngredient('${escapeQuotesForHTML(item.name)}', '${category}')">
                        <i data-lucide="x" size="14"></i>
                    </button>
                </div>
            `;
        });

        summaryHTML += `
                </div>
            </div>
        `;
    });

    selectedContainer.innerHTML = summaryHTML;

    // Calcular total
    const total = selectedIngredients.reduce((sum, item) => sum + item.price, 0);
    totalPriceElement.textContent = `$${total.toFixed(2)}`;

    // Habilitar botón de agregar al carrito
    if (addToCartBtn) {
        addToCartBtn.disabled = false;
    }

    // Actualizar preview visual
    if (saladPreview) {
        if (selectedIngredients.length >= 5) {
            saladPreview.innerHTML = '<i data-lucide="heart" size="60" style="color: #e91e63;"></i>';
        } else if (selectedIngredients.length >= 3) {
            saladPreview.innerHTML = '<i data-lucide="star" size="60" style="color: #ff9800;"></i>';
        } else {
            saladPreview.innerHTML = '<i data-lucide="salad" size="60"></i>';
        }
    }

    // Reinicializar iconos
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// ======================
//  REMOVER INGREDIENTE
// ======================

function removeIngredient(name, category) {
    const index = selectedIngredients.findIndex(item =>
        item.name === name && item.category === category
    );

    if (index !== -1) {
        selectedIngredients.splice(index, 1);
    }

    // Actualizar vista
    displayIngredients(currentCategory);
    updateSummary();
    updateProgress();
}

// ======================
//  ACTUALIZAR BARRA DE PROGRESO
// ======================

function updateProgress() {
    const progressFill = document.getElementById('progress-fill');
    const selectedCount = document.getElementById('selected-count');

    if (!progressFill || !selectedCount) return;

    const maxIngredients = 8;
    const current = Math.min(selectedIngredients.length, maxIngredients);
    const percentage = (current / maxIngredients) * 100;

    progressFill.style.width = `${percentage}%`;
    selectedCount.textContent = `${current}/${maxIngredients}`;

    // Cambiar color según progreso
    if (percentage < 33) {
        progressFill.style.backgroundColor = '#ff9800';
    } else if (percentage < 66) {
        progressFill.style.backgroundColor = '#2196f3';
    } else {
        progressFill.style.backgroundColor = '#4caf50';
    }
}

// ======================
//  CONFIGURAR NAVEGACIÓN DE CATEGORÍAS
// ======================

function setupCategoryNavigation() {
    const categoryButtons = document.querySelectorAll('.category-btn');

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remover clase active de todos los botones
            categoryButtons.forEach(btn => btn.classList.remove('active'));

            // Agregar clase active al botón clickeado
            button.classList.add('active');

            // Obtener categoría
            const category = button.getAttribute('data-category');
            currentCategory = category;

            // Mostrar ingredientes de la categoría
            displayIngredients(category);
        });
    });
}

// ======================
//  CONFIGURAR BOTÓN DE AGREGAR AL CARRITO
// ======================

function setupAddToCartButton() {
    const addToCartBtn = document.getElementById('add-to-cart-btn');

    if (!addToCartBtn) return;

    addToCartBtn.addEventListener('click', async () => {
        if (selectedIngredients.length === 0) {
            showCustomSaladNotification('Selecciona al menos un ingrediente', 'warning');
            return;
        }

        // Preparar datos para enviar al backend
        const customSaladData = {
            user_session: getUserSession(),
            name: 'Ensalada Personalizada',
            ingredients: selectedIngredients.map(item => ({
                name: item.name,
                category: item.category,
                price: item.price
            })),
            total_price: selectedIngredients.reduce((sum, item) => sum + item.price, 0)
        };

        try {
            // Enviar ensalada personalizada al backend
            const response = await fetch(`${API_URL}/api/custom-salads`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(customSaladData)
            });

            if (!response.ok) {
                throw new Error('Error al crear ensalada personalizada');
            }

            const result = await response.json();
            console.log('✅ Ensalada personalizada creada:', result);

            // Agregar al carrito
            const productName = 'Ensalada Personalizada: ' +
                selectedIngredients.map(i => i.name).slice(0, 3).join(', ') +
                (selectedIngredients.length > 3 ? '...' : '');

            await addToCart(productName, customSaladData.total_price);

            // Mostrar mensaje de éxito
            showCustomSaladNotification('¡Tu ensalada personalizada se agregó al carrito! 🎉', 'success');

            // Resetear builder
            selectedIngredients = [];
            displayIngredients(currentCategory);
            updateSummary();
            updateProgress();

        } catch (error) {
            console.error('❌ Error:', error);
            showCustomSaladNotification('Error al crear la ensalada. Intenta de nuevo.', 'error');
        }
    });
}

// ======================
//  FUNCIONES AUXILIARES
// ======================

function getCategoryIcon(category, ingredientName) {
    const iconMap = {
        bases: 'leaf',
        proteins: 'egg',
        vegetables: 'carrot',
        toppings: 'nut',
        dressings: 'droplets',
        extras: 'sparkles'
    };

    // Iconos especiales para ingredientes específicos
    if (ingredientName.includes('Pollo')) return 'drumstick';
    if (ingredientName.includes('Atún')) return 'fish';
    if (ingredientName.includes('Queso')) return 'cheese';
    if (ingredientName.includes('Tocino')) return 'beef';
    if (ingredientName.includes('Huevo')) return 'egg';

    return iconMap[category] || 'circle';
}

function getCategoryDisplayName(category) {
    const names = {
        bases: 'Bases',
        proteins: 'Proteínas',
        vegetables: 'Vegetales',
        toppings: 'Toppings',
        dressings: 'Aderezos',
        extras: 'Extras'
    };

    return names[category] || category;
}

function escapeQuotesForHTML(str) {
    return str.replace(/'/g, '&#39;').replace(/"/g, '&quot;');
}

function showCustomSaladNotification(message, type = 'info') {
    // Usar la función de notificación global si existe, si no, crear una propia
    if (typeof showNotification === 'function') {
        showNotification(message, type);
    } else {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;

        const colors = {
            success: '#4caf50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196f3'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// ======================
//  AUTO-INICIALIZACIÓN
// ======================

document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname;

    if (currentPage.includes('armar-ensalada') || currentPage.includes('armarensaladazo')) {
        console.log('📄 Página de armar ensalada detectada');
        initializeSaladBuilder();
    }
});