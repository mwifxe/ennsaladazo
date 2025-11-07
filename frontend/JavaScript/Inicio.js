// ======================
//    CONFIGURACIÓN
// ======================

const API_URL = 'https://ennsaladazo.onrender.com';  // Backend NestJS

// ======================
//    SESIÓN DE USUARIO
// ======================

function getUserSession() {
    // Primero verificar si hay un usuario logueado
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    if (token && username) {
        // Si hay usuario logueado, usar su username como sesión
        return `user_${username}`;
    }

    // Si no hay usuario, usar sesión temporal
    let session = localStorage.getItem('user_session');
    if (!session) {
        session = 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('user_session', session);
    }
    return session;
}

// ======================
//    INICIALIZACIÓN
// ======================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Ensaladazo! Frontend iniciado');
    console.log('📡 Backend URL:', API_URL);
    console.log('👤 User Session:', getUserSession());

    if (typeof lucide !== 'undefined') lucide.createIcons();

    updateUIForLoggedInUser();
    updateCartBadge();
    checkBackendConnection();
    initAddToCartButtons();
});

// ======================
//    VERIFICAR BACKEND
// ======================

async function checkBackendConnection() {
    try {
        const response = await fetch(`${API_URL}/health`);
        console.log(response.ok ? '✅ Backend conectado correctamente' : '⚠️ Backend respondió con error');
    } catch {
        console.error('❌ No se pudo conectar al backend.');
    }
}

// ======================
//    NAVEGACIÓN SUAVE
// ======================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ======================
//    CARRITO DE COMPRAS
// ======================

// ➕ Agregar producto al carrito
async function addToCart(productName, price) {
    const userSession = getUserSession();
    console.log('🛒 Agregando al carrito:', { productName, price, userSession });

    try {
        const response = await fetch(`${API_URL}/api/cart/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_session: userSession,
                product_name: productName,
                quantity: 1,
                unit_price: price
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al agregar al carrito');
        }

        const data = await response.json();
        console.log('✅ Producto agregado:', data);

        showNotification(`${productName} agregado al carrito 🥗`, 'success');
        updateCartBadge();
    } catch (error) {
        console.error('❌ Error:', error);
        showNotification('Error al agregar producto. Verifica el backend.', 'error');
    }
}

// 🔁 Actualizar número del carrito (badge)
async function updateCartBadge() {
    const userSession = getUserSession();

    try {
        const response = await fetch(`${API_URL}/api/cart?user_session=${userSession}`);
        if (!response.ok) return;

        const data = await response.json();
        let badge = document.getElementById('cart-count');
        const cartIcon = document.querySelector('.cart-icon');

        if (!badge) {
            badge = document.createElement('span');
            badge.id = 'cart-count';
            badge.className = 'cart-badge';
        }

        // Asegurar que el badge esté dentro del ícono del carrito
        if (cartIcon && !cartIcon.contains(badge)) {
            cartIcon.appendChild(badge);
        }

        const count = data.count || 0;
        badge.textContent = count > 0 ? count : '';
        badge.style.display = count > 0 ? 'flex' : 'none';

    } catch (error) {
        console.error('Error al actualizar badge:', error);
    }
}

// 🔍 Ver carrito completo
async function viewCart() {
    const userSession = getUserSession();
    try {
        const response = await fetch(`${API_URL}/api/cart?user_session=${userSession}`);
        if (!response.ok) throw new Error('Error al obtener el carrito');
        const cart = await response.json();
        console.log('🛒 Carrito:', cart);
        return cart;
    } catch (error) {
        console.error('Error al ver carrito:', error);
        showNotification('Error al obtener el carrito', 'error');
    }
}

// 🗑️ Vaciar carrito
async function clearCart() {
    const userSession = getUserSession();
    try {
        const response = await fetch(`${API_URL}/api/cart/clear/all?user_session=${userSession}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Error al limpiar carrito');
        showNotification('Carrito vaciado 🧹', 'success');
        updateCartBadge();
    } catch (error) {
        console.error('Error al limpiar carrito:', error);
    }
}

// ======================
//    GESTIÓN DE SESIÓN DE USUARIO
// ======================

// Función para migrar carrito cuando el usuario hace login
async function migrateCartOnLogin(username) {
    try {
        const tempSession = localStorage.getItem('user_session');

        // Si no hay sesión temporal o ya es de usuario, no hay nada que migrar
        if (!tempSession || tempSession.startsWith('user_')) {
            console.log('📦 No hay carrito temporal para migrar');
            return;
        }

        console.log('🔄 Migrando carrito temporal al usuario...');
        console.log('   Desde:', tempSession);
        console.log('   Hacia:', `user_${username}`);

        const response = await fetch(`${API_URL}/api/cart/migrate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                temp_session: tempSession,
                new_session: `user_${username}`
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Carrito migrado exitosamente:', result);

            // Limpiar sesión temporal
            localStorage.removeItem('user_session');

            // Actualizar badge del carrito
            updateCartBadge();

            return true;
        } else {
            console.warn('⚠️ No se pudo migrar el carrito, pero continuando...');
            return false;
        }
    } catch (error) {
        console.error('❌ Error al migrar carrito:', error);
        return false;
    }
}

// Función para actualizar UI cuando el usuario está logueado
function updateUIForLoggedInUser() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    if (token && username) {
        console.log('👤 Usuario logueado:', username);

        const userGreeting = document.querySelector('.user-greeting');
        if (userGreeting) {
            userGreeting.textContent = `¡Hola, ${username}!`;
        }

        updateCartBadge();
    }
}

// Exponer funciones globalmente
window.migrateCartOnLogin = migrateCartOnLogin;
window.updateUIForLoggedInUser = updateUIForLoggedInUser;

// ======================
//    FORMULARIO DE CONTACTO
// ======================

const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', e => {
        e.preventDefault();
        showNotification('📬 ¡Mensaje enviado! Te contactaremos pronto.', 'success');
        contactForm.reset();
    });
}

// ======================
//    SISTEMA DE NOTIFICACIONES
// ======================

function showNotification(message, type = 'info') {
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
    }

    const notification = document.createElement('div');
    notification.style.cssText = `
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        animation: slideIn 0.3s ease;
        max-width: 300px;
        font-weight: 500;
    `;
    notification.textContent = message;

    container.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2500);
}

// Exponer globalmente
window.globalShowNotification = showNotification;

// ======================
//    ESTILOS ANIMADOS
// ======================

const style = document.createElement('style');
style.textContent = `
@keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}
@keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
}
.cart-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background: #ff4444;
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    animation: pulse 2s infinite;
}
@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
}`;
document.head.appendChild(style);

// ======================
//    BOTÓN "ORDENAR AHORA"
// ======================

const ctaButton = document.querySelector('.cta-button');
if (ctaButton) {
    ctaButton.addEventListener('click', () => {
        const menuSection = document.getElementById('menu');
        if (menuSection) menuSection.scrollIntoView({ behavior: 'smooth' });
    });
}

// ======================
//    BOTONES DE "AGREGAR AL CARRITO"
// ======================

function initAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll('.order-btn, .extra-btn, .add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productName = this.getAttribute('data-product-name') || this.getAttribute('data-product');
            const price = parseFloat(this.getAttribute('data-product-price') || this.getAttribute('data-price'));
            if (productName && !isNaN(price)) {
                addToCart(productName, price);
            }
        });
    });
}

// ======================
//    LOG INICIAL
// ======================

console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║            🥗 ENSALADAZO! - Frontend Cargado              ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

📡 Backend: ${API_URL}
👤 Sesión: ${getUserSession()}

💡 Funciones disponibles:
   - addToCart(productName, price)
   - viewCart()
   - clearCart()
   - updateCartBadge()
   - migrateCartOnLogin(username)
`);