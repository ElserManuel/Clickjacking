// Configuración de la API de YouTube
const API_KEY = 'AIzaSyDnG883jcAYJrLMbyJ27Rh44NsglTQU01A';
const API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Estado de la aplicación
let currentCategory = 'music';
let currentVideos = [];

// Elementos del DOM
const videoGrid = document.getElementById('videoGrid');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const searchInput = document.getElementById('searchInput');
const announcement = document.getElementById("announcement");
const videoModal = document.getElementById('videoModal');
const testOverlay = document.getElementById('testOverlay');
const testMessage = document.getElementById('testMessage');

// TU FUNCIÓN PERSONALIZADA
function showTestMessage() {
    // Ocultar el overlay
    testOverlay.style.display = 'none';
    
    // Mostrar el mensaje de test
    testMessage.classList.remove('hidden');
    
    // Ocultar el mensaje después de 3 segundos
    setTimeout(() => {
        testMessage.classList.add('hidden');
    }, 3000);
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    loadDefaultVideos();
    setupEventListeners();
});

// Configurar event listeners
function setupEventListeners() {
    // Enter en búsqueda
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchVideos();
        }
    });
    
    // Cerrar modal con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    // Cerrar modal al hacer clic fuera
    videoModal.addEventListener('click', (e) => {
        if (e.target === videoModal) {
            closeModal();
        }
    });

    // Toggle sidebar en móvil
    const menuBtn = document.querySelector('.menu-btn');
    const sidebar = document.querySelector('.sidebar');
    
    menuBtn.addEventListener('click', () => {
        sidebar.style.transform = sidebar.style.transform === 'translateX(0px)' ? 'translateX(-100%)' : 'translateX(0px)';
    });
}

// Cargar videos por defecto
async function loadDefaultVideos() {
    await loadCategory('music');
}

// Cargar videos por categoría
async function loadCategory(category) {
    currentCategory = category;
    
    // Actualizar chips activos
    document.querySelectorAll('.chip').forEach(chip => {
        chip.classList.remove('active');
    });
    
    // Encontrar y activar el chip correcto
    const chips = document.querySelectorAll('.chip');
    chips.forEach(chip => {
        if (chip.textContent.toLowerCase().includes(getCategoryName(category).toLowerCase())) {
            chip.classList.add('active');
        }
    });
    
    // Búsquedas predefinidas por categoría
    const categoryQueries = {
        music: 'música popular 2024',
        gaming: 'gaming highlights',
        sports: 'deportes highlights',
        technology: 'tecnología 2024',
        cooking: 'recetas cocina',
        travel: 'viajes destinos'
    };
    
    const query = categoryQueries[category] || category;
    await performSearch(query);
}

// Obtener nombre de categoría en español
function getCategoryName(category) {
    const names = {
        music: 'Música',
        gaming: 'Gaming',
        sports: 'Deportes',
        technology: 'Tecnología',
        cooking: 'Cocina',
        travel: 'Viajes'
    };
    return names[category] || category;
}

// Buscar videos
async function searchVideos() {
    const query = searchInput.value.trim();
    if (!query) return;
    
    await performSearch(query);
}

// Realizar búsqueda en la API
async function performSearch(query) {
    showLoading();
    hideError();
    
    try {
        const searchUrl = `${API_BASE_URL}/search?` +
            `part=snippet&` +
            `maxResults=12&` +
            `q=${encodeURIComponent(query)}&` +
            `key=${API_KEY}&` +
            `type=video&` +
            `videoEmbeddable=true&` +
            `order=relevance`;
        
        const response = await fetch(searchUrl);
        
        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('API key inválida o cuota excedida');
            }
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            // Obtener estadísticas de los videos
            const videoIds = data.items.map(item => item.id.videoId).join(',');
            const statsData = await getVideoStats(videoIds);
            
            // Combinar datos de búsqueda con estadísticas
            const videosWithStats = data.items.map(item => {
                const stats = statsData.items.find(stat => stat.id === item.id.videoId);
                return {
                    ...item,
                    statistics: stats ? stats.statistics : {},
                    contentDetails: stats ? stats.contentDetails : {}
                };
            });
            
            currentVideos = videosWithStats;
            displayVideos(videosWithStats);
        } else {
            showError('No se encontraron videos para esta búsqueda.');
        }
    } catch (error) {
        console.error('Error al buscar videos:', error);
        showError(`Error al cargar videos: ${error.message}`);
    } finally {
        hideLoading();
    }
}

// Obtener estadísticas de videos
async function getVideoStats(videoIds) {
    try {
        const statsUrl = `${API_BASE_URL}/videos?` +
            `part=statistics,contentDetails&` +
            `id=${videoIds}&` +
            `key=${API_KEY}`;
        
        const response = await fetch(statsUrl);
        
        if (!response.ok) {
            throw new Error(`Error al obtener estadísticas: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        return { items: [] };
    }
}

// Mostrar anuncio
function showAnnouncement(message = "🛎️ ¡Estás viendo un video destacado!") {
    const announcement = document.getElementById("announcement");
    announcement.innerHTML = `<p>${message}</p>`;
    announcement.classList.remove("hidden");

    setTimeout(() => {
        announcement.classList.add("hidden");
    }, 2000); // se oculta después de 2 segundos
}

// Mostrar videos en la grilla
function displayVideos(videos) {
    videoGrid.innerHTML = '';
    
    if (!videos || videos.length === 0) {
        showError('No hay videos para mostrar.');
        return;
    }
    
    videos.forEach(video => {
        const videoCard = createVideoCard(video);
        videoGrid.appendChild(videoCard);
    });
}

// Crear tarjeta de video
function createVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.onclick = () => openVideoModal(video);
    
    const thumbnail = video.snippet.thumbnails?.medium || 
                     video.snippet.thumbnails?.high || 
                     video.snippet.thumbnails?.default;
    
    const duration = video.contentDetails ? formatDuration(video.contentDetails.duration) : '';
    const views = video.statistics ? formatViews(video.statistics.viewCount) : '';
    const publishedDate = formatDate(video.snippet.publishedAt);
    
    // Generar avatar de canal
    const channelInitial = video.snippet.channelTitle.charAt(0).toUpperCase();
    const avatarUrl = `https://ui-avatars.com/api/?name=${channelInitial}&background=666&color=fff&size=24`;
    
    card.innerHTML = `
        <div class="video-thumbnail">
            <img src="${thumbnail?.url || 'https://via.placeholder.com/320x180/333/fff?text=Video'}" 
                 alt="${escapeHtml(video.snippet.title)}"
                 onerror="this.src='https://via.placeholder.com/320x180/333/fff?text=Video'">
            ${duration ? `<span class="video-duration">${duration}</span>` : ''}
        </div>
        <div class="video-info">
            <h3 class="video-title">${escapeHtml(video.snippet.title)}</h3>
            <div class="video-metadata">
                <img src="${avatarUrl}" 
                     alt="${escapeHtml(video.snippet.channelTitle)}" 
                     class="channel-avatar"
                     onerror="this.src='https://via.placeholder.com/24x24/666/fff?text=${channelInitial}'">
                <a href="#" class="channel-name">${escapeHtml(video.snippet.channelTitle)}</a>
            </div>
            <div class="video-stats">
                ${views ? `<span>${views} visualizaciones</span>` : ''}
                <span>${publishedDate}</span>
            </div>
        </div>
    `;
    
    return card;
}

// Abrir modal de video
function openVideoModal(video) {
    const modal = document.getElementById('videoModal');
    const player = document.getElementById('videoPlayer');
    const title = document.getElementById('modalTitle');
    const views = document.getElementById('modalViews');
    const date = document.getElementById('modalDate');
    const channelImage = document.getElementById('modalChannelImage');
    const channelName = document.getElementById('modalChannelName');
    const subscribers = document.getElementById('modalSubscribers');
    const description = document.getElementById('modalDescription');
    
    // Obtener ID del video
    const videoId = video.id?.videoId || video.id;
    
    // Configurar reproductor
    player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    
    // Configurar información del video
    title.textContent = video.snippet.title;
    views.textContent = video.statistics ? formatViews(video.statistics.viewCount) + ' visualizaciones' : '';
    date.textContent = formatDate(video.snippet.publishedAt);
    
    // Configurar canal
    const channelInitial = video.snippet.channelTitle.charAt(0).toUpperCase();
    const channelAvatarUrl = `https://ui-avatars.com/api/?name=${channelInitial}&background=666&color=fff&size=48`;
    
    channelImage.src = channelAvatarUrl;
    channelImage.alt = video.snippet.channelTitle;
    channelName.textContent = video.snippet.channelTitle;
    subscribers.textContent = 'Canal de YouTube';
    
    // Configurar descripción
    const desc = video.snippet.description || 'Sin descripción disponible.';
    description.textContent = desc.substring(0, 300) + (desc.length > 300 ? '...' : '');
    
    // Mostrar modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Mostrar anuncio
    showAnnouncement();
}

// Cerrar modal
function closeModal() {
    const modal = document.getElementById('videoModal');
    const player = document.getElementById('videoPlayer');
    
    // Detener video
    player.src = '';
    
    // Ocultar modal
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Mostrar loading
function showLoading() {
    loading.classList.remove('hidden');
    videoGrid.innerHTML = '';
}

// Ocultar loading
function hideLoading() {
    loading.classList.add('hidden');
}

// Mostrar error
function showError(message) {
    errorMessage.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <p>${message}</p>
    `;
    errorMessage.classList.remove('hidden');
}

// Ocultar error
function hideError() {
    errorMessage.classList.add('hidden');
}

// Formatear duración
function formatDuration(duration) {
    if (!duration) return '';
    
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return '';
    
    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');
    
    let formatted = '';
    
    if (hours) {
        formatted += hours + ':';
        formatted += (minutes || '0').padStart(2, '0') + ':';
        formatted += (seconds || '0').padStart(2, '0');
    } else if (minutes) {
        formatted += minutes + ':';
        formatted += (seconds || '0').padStart(2, '0');
    } else {
        formatted = '0:' + (seconds || '0').padStart(2, '0');
    }
    
    return formatted;
}

// Formatear número de vistas
function formatViews(views) {
    if (!views) return '';
    
    const num = parseInt(views);
    
    if (num >= 1000000) {
        return Math.floor(num / 1000000) + 'M';
    } else if (num >= 1000) {
        return Math.floor(num / 1000) + 'K';
    }
    
    return num.toString();
}

// Formatear fecha
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
        return 'hace 1 día';
    } else if (diffDays < 7) {
        return `hace ${diffDays} días`;
    } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
    } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `hace ${months} mes${months > 1 ? 'es' : ''}`;
    } else {
        const years = Math.floor(diffDays / 365);
        return `hace ${years} año${years > 1 ? 's' : ''}`;
    }
}

// Escapar HTML
function escapeHtml(text) {
    if (!text) return '';
    
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}