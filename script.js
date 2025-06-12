const mensajes = [
    "🌐 IP obtenida correctamente",
    "📡 Dirección habilitada",
    "🔗 Conexión establecida",
    "🚀 Servidor sincronizado",
    "🔐 Acceso verificado",
    "⚡ Canal optimizado",
    "🎯 Enlace configurado",
    "🛡️ Protocolo activado",
    "🌟 Señal estabilizada",
    "🔥 Transmisión lista",
    "💫 Red configurada",
    "🎬 Stream habilitado",
    "📺 Fuente conectada",
    "🌊 Flujo de datos activo",
    "⭐ Sistema operativo"
];

function mostrarNotificacion(mensaje) {
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.className = 'notification-overlay';
    document.body.appendChild(overlay);

    // Crear notificación
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = mensaje;
    document.body.appendChild(notification);

    // Mostrar con animación
    setTimeout(() => {
        overlay.classList.add('show');
        notification.classList.add('show');
    }, 10);

    // Ocultar después de 2 segundos
    setTimeout(() => {
        overlay.classList.remove('show');
        notification.classList.remove('show');

        // Remover elementos después de la animación
        setTimeout(() => {
            document.body.removeChild(overlay);
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

function obtenerMensajeAleatorio() {
    return mensajes[Math.floor(Math.random() * mensajes.length)];
}

// Funciones de control con notificaciones
function verabri() {
    console.log("verVideo()");
    mostrarNotificacion(obtenerMensajeAleatorio());
}

function reproducir() {
    console.log("reproducir()");
    mostrarNotificacion(obtenerMensajeAleatorio());
}

function pausar() {
    console.log("pausar()");
    mostrarNotificacion(obtenerMensajeAleatorio());
}

function detener() {
    console.log("detener()");
    mostrarNotificacion(obtenerMensajeAleatorio());
}

function configurar() {
    console.log("configurar()");
    mostrarNotificacion(obtenerMensajeAleatorio());
}

function descargar() {
    console.log("descargar()");
    mostrarNotificacion(obtenerMensajeAleatorio());
}

function compartir() {
    console.log("compartir()");
    mostrarNotificacion(obtenerMensajeAleatorio());
}

function favoritos() {
    console.log("favoritos()");
    mostrarNotificacion(obtenerMensajeAleatorio());
}

function buscar() {
    console.log("buscar()");
    mostrarNotificacion(obtenerMensajeAleatorio());
}

function filtrar() {
    console.log("filtrar()");
    mostrarNotificacion(obtenerMensajeAleatorio());
}

// Auto-ocultar controles después de 3 segundos de inactividad
let hideTimeout;
const controlsOverlay = document.getElementById('controls');

function resetHideTimer() {
    clearTimeout(hideTimeout);
    controlsOverlay.classList.remove('auto-hide');

    hideTimeout = setTimeout(() => {
        controlsOverlay.classList.add('auto-hide');
    }, 3000);
}

// Reiniciar timer cuando el mouse se mueve
document.addEventListener('mousemove', resetHideTimer);
document.addEventListener('click', resetHideTimer);

// Inicializar
resetHideTimer();