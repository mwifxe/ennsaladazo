// ===================================
// CONTACTO.JS - VERSIÓN CORREGIDA
// Conectado al backend
// ===================================

console.log('📧 Contacto.js cargado');

// NO declarar API_URL aquí, ya existe en Inicio.js

document.addEventListener('DOMContentLoaded', function() {
    // Buscar el formulario de contacto
    const contactForm = document.getElementById('contact-form') ||
        document.querySelector('.contact-form') ||
        document.querySelector('form');

    if (!contactForm) {
        console.warn('⚠️ No se encontró el formulario de contacto');
        return;
    }

    console.log('✅ Formulario de contacto encontrado');

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        console.log('📧 Enviando formulario de contacto...');

        // Obtener datos del formulario
        const formData = new FormData(this);

        // Crear objeto con los datos (acepta múltiples nombres de campos)
        const data = {
            name: formData.get('nombre') || formData.get('name') || formData.get('names'),
            email: formData.get('email'),
            phone: formData.get('telefono') || formData.get('phone') || '',
            message: formData.get('mensaje') || formData.get('message') || formData.get('comments')
        };

        console.log('📋 Datos a enviar:', data);

        // Validar campos requeridos
        if (!data.name || !data.email || !data.message) {
            console.error('❌ Faltan campos requeridos');
            showContactNotification('Por favor completa todos los campos requeridos', 'warning');
            return;
        }

        try {
            console.log('🔄 Enviando a:', `${API_URL}/api/contact`);

            const response = await fetch(`${API_URL}/api/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            console.log('📨 Respuesta recibida:', response.status);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al enviar mensaje');
            }

            const result = await response.json();
            console.log('✅ Mensaje enviado exitosamente:', result);

            showContactNotification('¡Mensaje enviado exitosamente! Te contactaremos pronto. 📧', 'success');

            // Limpiar formulario
            this.reset();

        } catch (error) {
            console.error('❌ Error al enviar mensaje:', error);
            showContactNotification('Error al enviar el mensaje. Por favor intenta de nuevo.', 'error');
        }
    });
});

// Función de notificación
function showContactNotification(message, type = 'info') {
    // Usar la función global si existe
    if (typeof showNotification === 'function') {
        showNotification(message, type);
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
        max-width: 400px;
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

// Agregar estilos de animación si no existen
if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
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
    `;
    document.head.appendChild(style);
}