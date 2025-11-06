// ===================================
// CART.JS - Versión conectada al BACKEND
// ===================================

console.log('🛒 Cart.js cargado');

// API_URL ya está definido en Inicio.js
// const API_URL = 'http://localhost:3050';

// Variables globales
let cartItems = [];
let cartTotal = 0;
let appliedPromo = null;

// ======================
//  INICIALIZACIÓN
// ======================

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🔄 Inicializando carrito...');

    // Cargar carrito desde el backend
    await loadCartFromBackend();

    // Inicializar eventos
    setupEventListeners();

    // Inicializar iconos de Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

// ======================
//  CARGAR CARRITO DESDE BACKEND
// ======================

async function loadCartFromBackend() {
    try {
        const userSession = getUserSession();
        console.log('📡 Obteniendo carrito para sesión:', userSession);

        const response = await fetch(`${API_URL}/api/cart?user_session=${userSession}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar carrito');
        }

        const data = await response.json();
        console.log('✅ Carrito cargado:', data);

        cartItems = data.items || [];
        cartTotal = parseFloat(data.total) || 0;

        // Renderizar carrito
        renderCart();
        updateCartSummary();

    } catch (error) {
        console.error('❌ Error al cargar carrito:', error);
        showEmptyCart();
    }
}

// ======================
//  RENDERIZAR CARRITO
// ======================

function renderCart() {
    const cartContainer = document.getElementById('cart-items');
    const emptyCartDiv = document.getElementById('empty-cart');

    if (!cartItems || cartItems.length === 0) {
        showEmptyCart();
        return;
    }

    // Ocultar mensaje de carrito vacío
    emptyCartDiv.style.display = 'none';

    // Limpiar contenedor
    cartContainer.innerHTML = '';

    // Renderizar cada producto
    cartItems.forEach(item => {
        const cartItem = createCartItemElement(item);
        cartContainer.appendChild(cartItem);
    });

    // Reinicializar iconos
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// ======================
//  CREAR ELEMENTO DE PRODUCTO
// ======================

function createCartItemElement(item) {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.setAttribute('data-cart-item-id', item.id);

    const product = item.product;
    const itemTotal = parseFloat(item.unit_price) * item.quantity;

    // Mapeo de imágenes
    const imageMap = {
        'Ensalada CobbFit': 'Images/Ensaladas/cobbfit.jpeg',
        'Ensalada César': 'Images/Ensaladas/cesar.jpeg',
        'Ensalada Tropical': 'Images/Ensaladas/tropical.jpeg',
        'Ensalada Mediterránea': 'Images/Ensaladas/mediterranea.jpeg',
        'Smoothie Verde': 'Images/Extras/smoothie-verde.jpeg',
        'Aderezos Extra': 'Images/Extras/aderezos-extra.jpeg',
        'Aderezo Extra': 'Images/Extras/aderezos-extra.jpeg',
        'Proteína Extra': 'Images/Extras/proteina-extra.jpeg'
    };

    const imageSrc = product.image_url || imageMap[product.name] || 'Images/default.jpeg';

    div.innerHTML = `
        <div class="cart-item-image">
            <img src="${imageSrc}" alt="${product.name}">
        </div>
        
        <div class="cart-item-details">
            <h4 class="cart-item-name">${product.name}</h4>
            <p class="cart-item-description">${product.description || ''}</p>
            <div class="cart-item-meta">
                <span class="cart-item-price">$${parseFloat(item.unit_price).toFixed(2)}</span>
                <span class="cart-item-category">${product.category || 'Producto'}</span>
            </div>
        </div>
        
        <div class="cart-item-actions">
            <div class="quantity-controls">
                <button class="quantity-btn decrease" data-item-id="${item.id}">
                    <i data-lucide="minus" size="16"></i>
                </button>
                <span class="quantity-value">${item.quantity}</span>
                <button class="quantity-btn increase" data-item-id="${item.id}">
                    <i data-lucide="plus" size="16"></i>
                </button>
            </div>
            
            <div class="cart-item-total">
                <span class="item-total-label">Subtotal:</span>
                <span class="item-total-amount">$${itemTotal.toFixed(2)}</span>
            </div>
            
            <button class="remove-item-btn" data-item-id="${item.id}">
                <i data-lucide="trash-2" size="18"></i>
                Eliminar
            </button>
        </div>
    `;

    // Agregar eventos a los botones
    setupItemEventListeners(div, item);

    return div;
}

// ======================
//  EVENTOS DE CADA ITEM
// ======================

function setupItemEventListeners(element, item) {
    // Botón de aumentar cantidad
    const increaseBtn = element.querySelector('.quantity-btn.increase');
    increaseBtn.addEventListener('click', () => updateQuantity(item.id, item.quantity + 1));

    // Botón de disminuir cantidad
    const decreaseBtn = element.querySelector('.quantity-btn.decrease');
    decreaseBtn.addEventListener('click', () => {
        if (item.quantity > 1) {
            updateQuantity(item.id, item.quantity - 1);
        } else {
            removeItem(item.id);
        }
    });

    // Botón de eliminar
    const removeBtn = element.querySelector('.remove-item-btn');
    removeBtn.addEventListener('click', () => removeItem(item.id));
}

// ======================
//  ACTUALIZAR CANTIDAD
// ======================

async function updateQuantity(cartItemId, newQuantity) {
    try {
        console.log(`🔄 Actualizando cantidad del item ${cartItemId} a ${newQuantity}`);

        const response = await fetch(`${API_URL}/api/cart/${cartItemId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ quantity: newQuantity })
        });

        if (!response.ok) {
            throw new Error('Error al actualizar cantidad');
        }

        console.log('✅ Cantidad actualizada');

        // Recargar carrito
        await loadCartFromBackend();
        updateCartBadge();

    } catch (error) {
        console.error('❌ Error al actualizar cantidad:', error);
        showNotification('Error al actualizar cantidad', 'error');
    }
}

// ======================
//  ELIMINAR ITEM
// ======================

async function removeItem(cartItemId) {
    if (!confirm('¿Eliminar este producto del carrito?')) {
        return;
    }

    try {
        console.log(`🗑️ Eliminando item ${cartItemId}`);

        const response = await fetch(`${API_URL}/api/cart/${cartItemId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Error al eliminar producto');
        }

        console.log('✅ Producto eliminado');
        showNotification('Producto eliminado del carrito', 'success');

        // Recargar carrito
        await loadCartFromBackend();
        updateCartBadge();

    } catch (error) {
        console.error('❌ Error al eliminar producto:', error);
        showNotification('Error al eliminar producto', 'error');
    }
}

// ======================
//  VACIAR CARRITO
// ======================

async function clearCart() {
    if (!confirm('¿Vaciar todo el carrito?')) {
        return;
    }

    try {
        const userSession = getUserSession();
        console.log('🗑️ Vaciando carrito...');

        const response = await fetch(`${API_URL}/api/cart/clear/all?user_session=${userSession}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Error al vaciar carrito');
        }

        console.log('✅ Carrito vaciado');
        showNotification('Carrito vaciado', 'success');

        // Recargar carrito
        await loadCartFromBackend();
        updateCartBadge();

    } catch (error) {
        console.error('❌ Error al vaciar carrito:', error);
        showNotification('Error al vaciar carrito', 'error');
    }
}

// ======================
//  ACTUALIZAR RESUMEN
// ======================

function updateCartSummary() {
    const subtotalElement = document.getElementById('cart-subtotal');
    const discountElement = document.getElementById('cart-discount');
    const shippingElement = document.getElementById('cart-shipping');
    const totalElement = document.getElementById('cart-total');
    const modalTotalElement = document.getElementById('modal-total');

    const subtotal = cartTotal;
    const discount = appliedPromo ? appliedPromo.discount : 0;
    const shipping = 0; // Envío gratis por ahora
    const total = subtotal - discount + shipping;

    if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    if (discountElement) discountElement.textContent = discount > 0 ? `-$${discount.toFixed(2)}` : '$0.00';
    if (shippingElement) shippingElement.textContent = shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
    if (modalTotalElement) modalTotalElement.textContent = `$${total.toFixed(2)}`;
}

// ======================
//  MOSTRAR CARRITO VACÍO
// ======================

function showEmptyCart() {
    const cartContainer = document.getElementById('cart-items');
    const emptyCartDiv = document.getElementById('empty-cart');

    if (cartContainer) cartContainer.innerHTML = '';
    if (emptyCartDiv) emptyCartDiv.style.display = 'flex';

    updateCartSummary();
}

// ======================
//  SETUP EVENT LISTENERS
// ======================

function setupEventListeners() {
    // Botón de vaciar carrito
    const clearCartBtn = document.getElementById('clear-cart-btn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }

    // Botón de checkout
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cartItems.length === 0) {
                showNotification('Tu carrito está vacío', 'warning');
                return;
            }

            // Abrir modal de checkout
            const modal = new bootstrap.Modal(document.getElementById('checkoutModal'));
            modal.show();
        });
    }

    // Formulario de checkout
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckout);
    }

    // Aplicar código promocional
    const applyPromoBtn = document.getElementById('apply-promo-btn');
    if (applyPromoBtn) {
        applyPromoBtn.addEventListener('click', applyPromoCode);
    }

    // Mostrar/ocultar detalles de tarjeta
    const paymentInputs = document.querySelectorAll('input[name="payment"]');
    paymentInputs.forEach(input => {
        input.addEventListener('change', function() {
            const cardDetails = document.getElementById('card-details');
            if (this.value === 'card') {
                cardDetails.style.display = 'block';
            } else {
                cardDetails.style.display = 'none';
            }
        });
    });
}

// ======================
//  APLICAR CÓDIGO PROMOCIONAL
// ======================

function applyPromoCode() {
    const promoInput = document.getElementById('promo-code-input');
    const promoMessage = document.getElementById('promo-message');
    const promoCode = promoInput.value.trim().toUpperCase();

    if (!promoCode) {
        promoMessage.textContent = 'Ingresa un código';
        promoMessage.className = 'promo-message error';
        return;
    }

    // Códigos de ejemplo
    const promoCodes = {
        'ENSALADA10': { discount: cartTotal * 0.10, message: '10% de descuento aplicado' },
        'SALUDABLE15': { discount: cartTotal * 0.15, message: '15% de descuento aplicado' },
        'FRESH20': { discount: cartTotal * 0.20, message: '20% de descuento aplicado' }
    };

    if (promoCodes[promoCode]) {
        appliedPromo = promoCodes[promoCode];
        promoMessage.textContent = appliedPromo.message;
        promoMessage.className = 'promo-message success';

        updateCartSummary();
        showNotification(appliedPromo.message, 'success');
    } else {
        promoMessage.textContent = 'Código inválido';
        promoMessage.className = 'promo-message error';
    }
}

// ======================
//  PROCESAR CHECKOUT
// ======================

async function handleCheckout(e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        deliveryTime: document.getElementById('delivery-time').value,
        notes: document.getElementById('notes').value,
        paymentMethod: document.querySelector('input[name="payment"]:checked').value,
        total: cartTotal,
        items: cartItems
    };

    console.log('📦 Procesando pedido:', formData);

    // TODO: Enviar al backend cuando tengas endpoint de orders
    /*
    try {
        const response = await fetch(`${API_URL}/api/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error('Error al crear orden');
        }

        const order = await response.json();
        console.log('✅ Orden creada:', order);

        // Limpiar carrito
        await clearCart();

        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('checkoutModal'));
        modal.hide();

        // Mostrar confirmación
        showOrderConfirmation(order);

    } catch (error) {
        console.error('❌ Error al procesar pedido:', error);
        showNotification('Error al procesar pedido', 'error');
    }
    */

    // Por ahora, solo mostrar confirmación
    showNotification('¡Pedido confirmado! (Simulado)', 'success');

    // Cerrar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('checkoutModal'));
    modal.hide();

    // Limpiar formulario
    document.getElementById('checkout-form').reset();
}

// ======================
//  FUNCIÓN DE NOTIFICACIÓN
// ======================

function showNotification(message, type = 'info') {
    // Verificar si existe la función global de Inicio.js (pero NO la de cart.js)
    if (typeof window.globalShowNotification === 'function') {
        window.globalShowNotification(message, type);
        return;
    }

    // Si no existe, crear notificación propia
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 10px;
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

// ======================
//  FUNCIONES AUXILIARES
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
    let sessionId = localStorage.getItem('user_session');
    if (!sessionId) {
        sessionId = 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('user_session', sessionId);
    }
    return sessionId;
}

// Nueva función para migrar carrito al hacer login
async function migrateCartOnLogin(userId) {
    try {
        const tempSession = localStorage.getItem('ensaladazo_session');

        if (!tempSession || tempSession.startsWith('user_')) {
            return; // No hay carrito temporal para migrar
        }

        console.log('🔄 Migrando carrito temporal al usuario...');

        const response = await fetch(`${API_URL}/api/cart/migrate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                temp_session: tempSession,
                user_id: userId
            })
        });

        if (response.ok) {
            console.log('✅ Carrito migrado exitosamente');
            // Limpiar sesión temporal
            localStorage.removeItem('ensaladazo_session');
            // Recargar carrito con la nueva sesión
            await loadCartFromBackend();
            updateCartBadge();
        }
    } catch (error) {
        console.error('❌ Error al migrar carrito:', error);
    }
}

// Exponer función globalmente para usarla desde Inicio.js
window.migrateCartOnLogin = migrateCartOnLogin;