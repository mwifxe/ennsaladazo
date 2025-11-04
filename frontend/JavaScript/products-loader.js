// ===================================
// PRODUCTS LOADER - Versión ULTRA CORREGIDA
// Manejo de eventos mejorado sin problemas de comillas
// ===================================

// NO declaramos API_URL aquí porque ya existe en Inicio.js

// ======================
//  CARGAR PRODUCTOS DEL BACKEND
// ======================

async function loadProducts() {
    try {
        console.log('🔄 Cargando productos desde el backend...');

        const response = await fetch(`${API_URL}/api/products`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const products = await response.json();
        console.log('✅ Productos cargados:', products);

        return products;

    } catch (error) {
        console.error('❌ Error al cargar productos:', error);
        console.log('💡 Asegúrate de que el backend esté corriendo en:', API_URL);

        if (typeof showNotification === 'function') {
            showNotification('Error al cargar productos. Verifica el backend.', 'error');
        }

        return [];
    }
}

// ======================
//  RENDERIZAR PRODUCTOS EN LA PÁGINA DE INICIO (index.html)
// ======================

async function renderProductsHome() {
    const products = await loadProducts();

    if (products.length === 0) return;

    const menuGrid = document.querySelector('.menu-grid');

    if (!menuGrid) {
        console.warn('⚠️ No se encontró .menu-grid en esta página');
        return;
    }

    menuGrid.innerHTML = '';

    const ensaladas = products
        .filter(p => p.category === 'ensaladas')
        .slice(0, 3);

    ensaladas.forEach(product => {
        const productCard = createProductCard(product);
        menuGrid.appendChild(productCard);
    });

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    console.log('✅ Productos renderizados en página de inicio');
}

// ======================
//  RENDERIZAR PRODUCTOS EN LA PÁGINA DE MENÚ (menu.html)
// ======================

async function renderProductsMenu() {
    const products = await loadProducts();

    if (products.length === 0) return;

    const categorias = {
        ensaladas: products.filter(p => p.category === 'ensaladas'),
        bebidas: products.filter(p => p.category === 'bebidas'),
        extras: products.filter(p => p.category === 'extras')
    };

    renderCategory('ensaladas', categorias.ensaladas, '.menu-items');
    renderCategory('bebidas', categorias.bebidas, '.extras-grid');
    renderCategory('extras', categorias.extras, '.extras-grid', true);

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    console.log('✅ Productos renderizados en página de menú');
}

// ======================
//  RENDERIZAR CATEGORÍA
// ======================

function renderCategory(category, products, containerSelector, append = false) {
    const container = document.querySelector(containerSelector);

    if (!container) {
        console.warn(`⚠️ No se encontró contenedor: ${containerSelector}`);
        return;
    }

    if (!append) {
        container.innerHTML = '';
    }

    products.forEach(product => {
        let productElement;

        if (category === 'ensaladas') {
            productElement = createSaladCard(product);
        } else {
            productElement = createExtraCard(product);
        }

        container.appendChild(productElement);
    });
}

// ======================
//  CREAR TARJETA DE PRODUCTO (Para index.html)
// ======================

function createProductCard(product) {
    const article = document.createElement('article');
    article.className = 'menu-item';

    const icon = getProductIcon(product.name);

    article.innerHTML = `
        <div class="menu-image">
            <i data-lucide="${icon}" size="60"></i>
        </div>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="price">$${product.price.toFixed(2)}</div>
        <button class="add-to-cart" 
                data-product-name="${product.name}" 
                data-product-price="${product.price}">
            Agregar al Carrito
        </button>
    `;

    // ✅ AGREGAR EVENTO CON JAVASCRIPT (sin onclick en HTML)
    const button = article.querySelector('.add-to-cart');
    button.addEventListener('click', function() {
        const productName = this.getAttribute('data-product-name');
        const productPrice = parseFloat(this.getAttribute('data-product-price'));

        console.log('🛒 Click en agregar:', productName, productPrice);

        if (typeof addToCart === 'function') {
            addToCart(productName, productPrice);
        } else {
            console.error('❌ Función addToCart no está definida');
        }
    });

    return article;
}

// ======================
//  CREAR TARJETA DE ENSALADA (Para menu.html)
// ======================

function createSaladCard(product) {
    const article = document.createElement('article');
    article.className = 'menu-item salad-card';

    const icon = getProductIcon(product.name);

    article.innerHTML = `
        <div class="salad-image">
            <div class="image-glow"></div>
            <i data-lucide="${icon}" size="80"></i>
        </div>
        <div class="salad-details">
            <h3 class="salad-name">${product.name}</h3>
            <p class="salad-description">${product.description}</p>
            <div class="salad-meta">
                <span class="salad-badge">
                    <i data-lucide="leaf" size="16"></i>
                    Fresco
                </span>
                ${product.stock > 0 ?
        `<span class="stock-info">
                        <i data-lucide="check-circle" size="16"></i>
                        Disponible
                    </span>` :
        `<span class="stock-info out-of-stock">
                        <i data-lucide="x-circle" size="16"></i>
                        Agotado
                    </span>`
    }
            </div>
        </div>
        <div class="salad-footer">
            <span class="salad-price">$${product.price.toFixed(2)}</span>
            <button class="salad-btn ${product.stock === 0 ? 'disabled' : ''}" 
                    data-product-name="${product.name}"
                    data-product-price="${product.price}"
                    ${product.stock === 0 ? 'disabled' : ''}>
                <i data-lucide="shopping-cart" size="18"></i>
                ${product.stock > 0 ? 'Agregar' : 'Agotado'}
            </button>
        </div>
    `;

    // ✅ AGREGAR EVENTO CON JAVASCRIPT
    const button = article.querySelector('.salad-btn');
    if (!button.disabled) {
        button.addEventListener('click', function() {
            const productName = this.getAttribute('data-product-name');
            const productPrice = parseFloat(this.getAttribute('data-product-price'));

            console.log('🛒 Click en agregar:', productName, productPrice);

            if (typeof addToCart === 'function') {
                addToCart(productName, productPrice);
            } else {
                console.error('❌ Función addToCart no está definida');
            }
        });
    }

    return article;
}

// ======================
//  CREAR TARJETA DE EXTRA (Para menu.html - bebidas y extras)
// ======================

function createExtraCard(product) {
    const article = document.createElement('article');
    article.className = 'extra-item';

    const icon = getProductIcon(product.name);

    article.innerHTML = `
        <i data-lucide="${icon}" size="50"></i>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <span class="extra-price">$${product.price.toFixed(2)}</span>
        <button class="extra-btn" 
                data-product-name="${product.name}"
                data-product-price="${product.price}"
                ${product.stock === 0 ? 'disabled' : ''}>
            ${product.stock > 0 ? 'Agregar' : 'Agotado'}
        </button>
    `;

    // ✅ AGREGAR EVENTO CON JAVASCRIPT
    const button = article.querySelector('.extra-btn');
    if (!button.disabled) {
        button.addEventListener('click', function() {
            const productName = this.getAttribute('data-product-name');
            const productPrice = parseFloat(this.getAttribute('data-product-price'));

            console.log('🛒 Click en agregar:', productName, productPrice);

            if (typeof addToCart === 'function') {
                addToCart(productName, productPrice);
            } else {
                console.error('❌ Función addToCart no está definida');
            }
        });
    }

    return article;
}

// ======================
//  OBTENER ICONO SEGÚN PRODUCTO
// ======================

function getProductIcon(productName) {
    const iconMap = {
        'CobbFit': 'leaf',
        'Ensalada César': 'salad',
        'Ensalada Mediterránea': 'fish',
        'Ensalada Tropical': 'sun',
        'Smoothie Verde': 'glass-water',
        'Smoothie de Frutas': 'cherry',
        'Jugo Natural': 'citrus',
        'Aderezo Extra': 'sparkles',
        'Proteína Extra': 'beef',
        'Pan Tostado': 'wheat'
    };

    return iconMap[productName] || 'leaf';
}

// ======================
//  AUTO-INICIALIZACIÓN
// ======================

document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname;

    if (currentPage.includes('index.html') || currentPage === '/' || currentPage === '/frontend/' || currentPage.endsWith('/')) {
        console.log('📄 Página de inicio detectada');
        renderProductsHome();
    }
    else if (currentPage.includes('menu.html')) {
        console.log('📄 Página de menú detectada');
        renderProductsMenu();
    }
});