// Product Zoom and 360-degree view functionality
let currentRotation = 0;
let isDragging = false;
let startX = 0;
let lastX = 0;

// Initialize zoom functionality
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

    // Calculate ratio between result and lens
    const cx = result.offsetWidth / lens.offsetWidth;
    const cy = result.offsetHeight / lens.offsetHeight;

    // Set background properties for result
    result.style.backgroundImage = `url('${mainImage.src}')`;
    result.style.backgroundSize = (mainImage.width * cx) + "px " + (mainImage.height * cy) + "px";

    // Add event listeners for zoom
    lens.addEventListener("mousemove", moveLens);
    mainImage.addEventListener("mousemove", moveLens);
    lens.addEventListener("touchmove", moveLens);
    mainImage.addEventListener("touchmove", moveLens);

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
        x = e.pageX - bounds.left;
        y = e.pageY - bounds.top;
        x = x - window.pageXOffset;
        y = y - window.pageYOffset;
        return { x, y };
    }
}

// Initialize 360-degree view
function initialize360View() {
    const container = document.getElementById('view-360-container');
    const image = document.getElementById('view-360-image');
    
    if (!container || !image) return;

    // Add event listeners for drag rotation
    container.addEventListener('mousedown', startDragging);
    container.addEventListener('mousemove', drag);
    container.addEventListener('mouseup', stopDragging);
    container.addEventListener('mouseleave', stopDragging);

    // Touch events for mobile
    container.addEventListener('touchstart', startDragging);
    container.addEventListener('touchmove', drag);
    container.addEventListener('touchend', stopDragging);

    // Control buttons
    document.getElementById('rotate-left')?.addEventListener('click', () => rotateImage(-45));
    document.getElementById('rotate-right')?.addEventListener('click', () => rotateImage(45));
}

function startDragging(e) {
    isDragging = true;
    startX = e.type === 'mousedown' ? e.pageX : e.touches[0].pageX;
    lastX = startX;
}

function drag(e) {
    if (!isDragging) return;

    e.preventDefault();
    const currentX = e.type === 'mousemove' ? e.pageX : e.touches[0].pageX;
    const diff = currentX - lastX;
    lastX = currentX;

    rotateImage(diff);
}

function stopDragging() {
    isDragging = false;
}

function rotateImage(degrees) {
    currentRotation = (currentRotation + degrees) % 360;
    const image = document.getElementById('view-360-image');
    if (image) {
        image.style.transform = `rotate(${currentRotation}deg)`;
    }
}

// Load high-resolution image
function loadHighResImage(imageUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = imageUrl;
    });
}

// Update product images
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

// Initialize hotspots for 360-degree view
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

// Initialize all product visualization features
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