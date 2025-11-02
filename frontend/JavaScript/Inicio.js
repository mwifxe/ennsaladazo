// ======================
//    CONFIGURACIÓN
// ======================

// URL del backend - CAMBIA ESTO según tu configuración
const API_URL = 'http://localhost:3050';  // Backend NestJS
// const API_URL = 'https://tu-app.onrender.com';  // Para producción

// ======================
//    INICIALIZACIÓN
// ======================

// Generar o recuperar ID de sesión del usuario
function getUserSession() {
    let session = localStorage.getItem('user_session');
    if (!session) {
        session = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('user_session', session);
    }
    return session;
}

// Inicializar cuando la página cargue
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Ensaladazo! Frontend iniciado');
    console.log('📡 Backend URL:', API_URL);
    console.log('👤 User Session:', getUserSession());

    // Inicializar iconos de Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Actualizar badge del carrito
    updateCartBadge();

    // Verificar conexión con backend
    checkBackendConnection();
});

// ======================
//    VERIFICAR BACKEND
// ======================

async function checkBackendConnection() {
    try {
        const response = await fetch(`${API_URL}/health`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });

        if (response.ok) {
            console.log('✅ Backend conectado correctamente');
        } else {
            console.warn('⚠️ Backend respondió pero con error:', response.status);
        }
    } catch (error) {
        console.error('❌ No se pudo conectar al backend:', error);
        console.log('💡 Asegúrate de que el backend esté corriendo en:', API_URL);
        console.log('💡 Ejecuta: npm run start:dev');
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

// Agregar producto al carrito
async function addToCart(productName, price) {
    const userSession = getUserSession();

    console.log('🛒 Agregando al carrito:', { productName, price });

    try {
        const response = await fetch(`${API_URL}/api/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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

        showNotification(`${productName} agregado al carrito`, 'success');
        updateCartBadge();

    } catch (error) {
        console.error('❌ Error:', error);
        showNotification('Error al agregar producto. Verifica que el backend esté corriendo.', 'error');
    }
}

// Actualizar badge del carrito
async function updateCartBadge() {
    const userSession = getUserSession();

    try {
        // Endpoint correcto del backend NestJS
        const response = await fetch(`${API_URL}/api/cart?user_session=${userSession}`);

        if (!response.ok) return;

        const data = await response.json();

        // Actualizar badge en el header
        let badge = document.getElementById('cart-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.id = 'cart-badge';
            badge.className = 'cart-badge';

            const cartButton = document.querySelector('.cta-button');
            if (cartButton) {
                cartButton.style.position = 'relative';
                cartButton.appendChild(badge);
            }
        }

        // data.count es el número total de items en el carrito
        if (data.count > 0) {
            badge.textContent = data.count;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }

    } catch (error) {
        console.error('Error al actualizar badge:', error);
    }
}

// Ver carrito completo
async function viewCart() {
    const userSession = getUserSession();

    try {
        const response = await fetch(`${API_URL}/api/cart?user_session=${userSession}`);

        if (!response.ok) {
            throw new Error('Error al obtener el carrito');
        }

        const cart = await response.json();

        console.log('🛒 Carrito:', cart);
        console.log('Total items:', cart.count);
        console.log('Total price: $', cart.total);
        console.log('Items:', cart.items);

        // Aquí puedes mostrar el carrito en un modal o página
        // Por ahora solo lo mostramos en consola
        showNotification(`Carrito: ${cart.count} items - Total: $${cart.total}`, 'info');

        return cart;

    } catch (error) {
        console.error('Error al ver carrito:', error);
        showNotification('Error al obtener el carrito', 'error');
    }
}

// Limpiar carrito
async function clearCart() {
    const userSession = getUserSession();

    try {
        const response = await fetch(`${API_URL}/api/cart/clear/all?user_session=${userSession}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Error al limpiar el carrito');
        }

        console.log('✅ Carrito limpiado');
        showNotification('Carrito vaciado', 'success');
        updateCartBadge();

    } catch (error) {
        console.error('Error al limpiar carrito:', error);
        showNotification('Error al limpiar el carrito', 'error');
    }
}

// ======================
//    FORMULARIO DE CONTACTO
// ======================

const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = {
            name: this.querySelector('input[type="text"]').value,
            email: this.querySelector('input[type="email"]').value,
            message: this.querySelector('textarea').value,
        };

        console.log('📧 Enviando mensaje de contacto...');

        // Por ahora solo mostramos un mensaje de éxito
        // El backend no tiene endpoint de contacto todavía
        console.log('Datos del formulario:', formData);
        showNotification('¡Mensaje enviado! Te contactaremos pronto.', 'success');
        this.reset();

        // TODO: Cuando se implemente el endpoint de contacto, descomentar esto:
        /*
        try {
            const response = await fetch(`${API_URL}/api/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al enviar mensaje');
            }

            const data = await response.json();
            console.log('✅ Mensaje enviado:', data);

            showNotification('¡Mensaje enviado exitosamente! Te contactaremos pronto.', 'success');
            this.reset();

        } catch (error) {
            console.error('❌ Error:', error);
            showNotification('Error al enviar el mensaje. Intenta de nuevo.', 'error');
        }
        */
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
        margin-bottom: 10px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    notification.textContent = message;

    container.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ======================
//    ESTILOS
// ======================

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
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
    }
`;
document.head.appendChild(style);

// ======================
//    BOTÓN "ORDENAR AHORA"
// ======================

const ctaButton = document.querySelector('.cta-button');
if (ctaButton) {
    ctaButton.addEventListener('click', function() {
        const menuSection = document.getElementById('menu');
        if (menuSection) {
            menuSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// ======================
//    EVENT LISTENERS PARA BOTONES DE AGREGAR AL CARRITO
// ======================

// Agregar event listeners a todos los botones "Agregar al Carrito"
document.addEventListener('DOMContentLoaded', function() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productName = this.getAttribute('data-product');
            const price = parseFloat(this.getAttribute('data-price'));

            addToCart(productName, price);
        });
    });
});

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

💡 Abre la consola (F12) para ver los logs de todas las operaciones.
💡 Si hay errores de conexión, asegúrate de que el backend esté corriendo.
`);