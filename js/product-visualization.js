
/**
 * @file js/product-visualization.js
 * @module ProductVisualization
 * @author Jewelry Team (prbretas)
 * @version 1.0.1
 * @date 2025-10-09
 * @description Ferramentas de visualização do produto — zoom, 360-degree view, hotspots e carregamento de imagens em alta resolução.
 *
 * Histórico de alterações:
 * - 1.0.1 (09/10/2025 14:00): Padronização de comentários e documentação JSDoc.
 * - 1.0.0: Implementação inicial de zoom, 360 view e hotspots.
 */

/**
 * @namespace ProductVisualization
 * @description Módulo responsável por fornecer funcionalidades interativas de
 * visualização de produtos, incluindo zoom, visualização 360 graus e hotspots.
 * Todas as funções são defensivas e verificam a existência dos elementos DOM
 * antes de operar.
 * 
 * @example
 * import { initializeProductVisualization } from './product-visualization.js';
 * initializeProductVisualization();
 * 
 * @version 1.0.0
 * @author Jewelry Team
 * @since 2025-10-09
 */

/** @type {number} Rotação atual da imagem em graus */
let currentRotation = 0;
/** @type {boolean} Flag indicando se está ocorrendo arrasto */
/** @type {number} Posição X inicial do arrasto */
let startX = 0;
/** @type {number} Última posição X registrada */
let lastX = 0;
let isDragging = false;

/**
 * @memberof ProductVisualization
 * @function initializeZoom
 * @description Inicializa a funcionalidade de zoom para a imagem principal do produto.
 * Cria uma lente de zoom e uma área de resultado para exibir a imagem ampliada.
 * 
 * @example
 * initializeZoom();
 * 
 * @requires DOM
 * - #main-product-image: Imagem principal do produto
 * - .zoom-container: Contêiner para exibir o resultado do zoom
 * 
 * @private
 */
function initializeZoom() {
    const mainImage = document.getElementById('main-product-image');
    const zoomContainer = document.querySelector('.zoom-container');
    
    if (!mainImage || !zoomContainer) return;

    // Create zoom lens
    const lens = document.createElement('div');
    lens.setAttribute('class', 'img-zoom-lens');
    mainImage.parentElement.insertBefore(lens, mainImage);

    // Create zoom result area
    const result = document.createElement('div');
    result.setAttribute('class', 'img-zoom-result');
    zoomContainer.appendChild(result);

    // Calculate ratio between result and lens (guard guard against zero)
    const cx = lens.offsetWidth ? (result.offsetWidth / lens.offsetWidth) : 1;
    const cy = lens.offsetHeight ? (result.offsetHeight / lens.offsetHeight) : 1;

    // Set background properties for result
    result.style.backgroundImage = `url('${mainImage.src}')`;
    result.style.backgroundSize = (mainImage.width * cx) + "px " + (mainImage.height * cy) + "px";

    // Add event listeners for zoom
    // Attach events only if the elements still exist
    if (lens) lens.addEventListener("mousemove", moveLens);
    if (mainImage) mainImage.addEventListener("mousemove", moveLens);
    if (lens) lens.addEventListener("touchmove", moveLens);
    if (mainImage) mainImage.addEventListener("touchmove", moveLens);

    function moveLens(e) {
        e.preventDefault();
        const pos = getCursorPos(e);
        let x = pos.x - (lens.offsetWidth / 2);
        let y = pos.y - (lens.offsetHeight / 2);

        // Prevent lens from moving outside the image
        if (x > mainImage.width - lens.offsetWidth) x = mainImage.width - lens.offsetWidth;
        if (x < 0) x = 0;
        if (y > mainImage.height - lens.offsetHeight) y = mainImage.height - lens.offsetHeight;
        if (y < 0) y = 0;

        // Set lens position
        lens.style.left = x + "px";
        lens.style.top = y + "px";

        // Set result background position
        result.style.backgroundPosition = "-" + (x * cx) + "px -" + (y * cy) + "px";
    }

    function getCursorPos(e) {
        let x = 0, y = 0;
        e = e || window.event;
        const bounds = mainImage.getBoundingClientRect();
        // Normalize for mouse or touch events
        const pageX = (e.pageX !== undefined) ? e.pageX : (e.touches && e.touches[0] && e.touches[0].pageX) || 0;
        const pageY = (e.pageY !== undefined) ? e.pageY : (e.touches && e.touches[0] && e.touches[0].pageY) || 0;
        x = pageX - bounds.left - window.pageXOffset;
        y = pageY - bounds.top - window.pageYOffset;
        return { x, y };
    }
}

/**
 * @memberof ProductVisualization
 * @function initialize360View
 * @description Inicializa a visualização 360 graus do produto.
 * Configura eventos de mouse e toque para rotação da imagem.
 * 
 * @example
 * initialize360View();
 * 
 * @requires DOM
 * - #view-360-container: Contêiner da visualização 360
 * - #view-360-image: Imagem para rotação
 * - #rotate-left: Botão de rotação anti-horária (opcional)
 * - #rotate-right: Botão de rotação horária (opcional)
 * 
 * @private
 */
function initialize360View() {
    const container = document.getElementById('view-360-container');
    const image = document.getElementById('view-360-image');
    
    if (!container || !image) return;

    // Add event listeners for drag rotation (mouse)
    // Attach mouse events if container exists
    container.addEventListener('mousedown', startDragging);
    container.addEventListener('mousemove', drag);
    container.addEventListener('mouseup', stopDragging);
    container.addEventListener('mouseleave', stopDragging);

    // Touch events for mobile (safely access touches)
    // Touch events for mobile (use the original event but guard inside handlers)
    container.addEventListener('touchstart', (e) => startDragging(e));
    container.addEventListener('touchmove', (e) => drag(e));
    container.addEventListener('touchend', stopDragging);

    // Control buttons (guard existence)
    document.getElementById('rotate-left')?.addEventListener('click', () => rotateImage(-45));
    document.getElementById('rotate-right')?.addEventListener('click', () => rotateImage(45));
}

/**
 * @memberof ProductVisualization
 * @function startDragging
 * @description Inicia o processo de arrasto para rotação da imagem
 * @param {Event} e - Evento de mouse ou toque
 * @private
 */
function startDragging(e) {
    isDragging = true;
    // e may be a normalized touch event with touches array or a mouse event
    const pageX = (e && ((e.pageX !== undefined && e.pageX) || (e.touches && e.touches[0] && e.touches[0].pageX))) || 0;
    startX = pageX;
    lastX = startX;
}

/**
 * @memberof ProductVisualization
 * @function drag
 * @description Processa o movimento de arrasto para rotação da imagem
 * @param {Event} e - Evento de mouse ou toque
 * @private
 */
function drag(e) {
    if (!isDragging) return;

    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const currentX = (e && ((e.pageX !== undefined && e.pageX) || (e.touches && e.touches[0] && e.touches[0].pageX))) || lastX;
    const diff = currentX - lastX;
    lastX = currentX;

    rotateImage(diff);
}

/**
 * @memberof ProductVisualization
 * @function stopDragging
 * @description Finaliza o processo de arrasto
 * @private
 */
function stopDragging() {
    isDragging = false;
}

/**
 * @memberof ProductVisualization
 * @function rotateImage
 * @description Rotaciona a imagem em um número específico de graus
 * @param {number} degrees - Quantidade de graus para rotacionar
 * @public
 */
function rotateImage(degrees) {
    currentRotation = (currentRotation + degrees) % 360;
    const image = document.getElementById('view-360-image');
    if (image) {
        image.style.transform = `rotate(${currentRotation}deg)`;
    }
}

/**
 * @memberof ProductVisualization
 * @function loadHighResImage
 * @description Carrega uma imagem em alta resolução de forma assíncrona
 * @param {string} imageUrl - URL da imagem a ser carregada
 * @returns {Promise<HTMLImageElement>} Promessa resolvida com o elemento de imagem
 * @private
 */
function loadHighResImage(imageUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = imageUrl;
    });
}

/**
 * @memberof ProductVisualization
 * @function updateProductImages
 * @description Atualiza as imagens do produto, incluindo a principal e miniaturas
 * @param {Object} product - Objeto contendo informações do produto
 * @param {string[]} product.images - Array de URLs das imagens do produto
 * @param {string} product.name - Nome do produto para alt text
 * @returns {Promise<void>} Promessa resolvida após atualização das imagens
 * @public
 */
async function updateProductImages(product) {
    const mainImage = document.getElementById('main-product-image');
    const thumbnailContainer = document.querySelector('.thumbnail-container');
    
    if (!mainImage || !thumbnailContainer) return;

    // Clear existing thumbnails
    thumbnailContainer.innerHTML = '';

    // Load and display main image
    try {
        const highResImage = await loadHighResImage(product.images[0]);
        mainImage.src = highResImage.src;
        
        // Create thumbnails
        product.images.forEach((image, index) => {
            const thumbnail = document.createElement('img');
            thumbnail.src = image;
            thumbnail.alt = `${product.name} - View ${index + 1}`;
            thumbnail.className = 'thumbnail';
            if (index === 0) thumbnail.classList.add('active');
            
            thumbnail.addEventListener('click', async () => {
                const highResImage = await loadHighResImage(image);
                mainImage.src = highResImage.src;
                document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                thumbnail.classList.add('active');
            });
            
            thumbnailContainer.appendChild(thumbnail);
        });

        // Initialize zoom after loading images
        initializeZoom();
    } catch (error) {
        console.error('Error loading product images:', error);
    }
}

/**
 * @memberof ProductVisualization
 * @function initializeHotspots
 * @description Inicializa os pontos interativos (hotspots) na visualização 360 graus
 * 
 * @example
 * initializeHotspots();
 * 
 * @requires DOM
 * - #view-360-container: Contêiner da visualização 360
 * - .hotspot: Elementos de hotspot com data-info
 * 
 * @private
 */
function initializeHotspots() {
    const container = document.getElementById('view-360-container');
    const hotspots = document.querySelectorAll('.hotspot');
    
    if (!container || !hotspots) return;

    hotspots.forEach(hotspot => {
        hotspot.addEventListener('click', () => {
            const info = hotspot.dataset.info;
            const tooltip = document.createElement('div');
            tooltip.className = 'hotspot-tooltip';
            tooltip.textContent = info;
            
            // Position tooltip
            const rect = hotspot.getBoundingClientRect();
            tooltip.style.left = rect.right + 10 + 'px';
            tooltip.style.top = rect.top + 'px';
            
            // Remove existing tooltips
            document.querySelectorAll('.hotspot-tooltip').forEach(t => t.remove());
            
            // Add new tooltip
            document.body.appendChild(tooltip);
            
            // Remove tooltip after delay
            setTimeout(() => tooltip.remove(), 3000);
        });
    });
}

/**
 * @memberof ProductVisualization
 * @function initializeProductVisualization
 * @description Inicializa todas as funcionalidades de visualização do produto
 * 
 * @example
 * // Em qualquer página que utilize visualização de produto
 * import { initializeProductVisualization } from './product-visualization.js';
 * initializeProductVisualization();
 * 
 * @public
 */
function initializeProductVisualization() {
    initializeZoom();
    initialize360View();
    initializeHotspots();
}

// Export functions
export {
    initializeProductVisualization,
    updateProductImages,
    rotateImage
};