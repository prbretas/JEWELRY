// DeepAR configuration
const deepARConfig = {
    licenseKey: 'your_deepar_license_key_here', // Replace with your actual DeepAR license key
    canvas: document.getElementById('deepar-container'),
    effect: '../assets/effects/jewelry.deepar', // Path to your DeepAR effect file
    // Additional DeepAR configuration options
};

let deepAR = null;
let currentProduct = null;
let selectedSize = null;
let selectedMetal = 'yellow';

// Initialize DeepAR
async function initializeDeepAR() {
    try {
        deepAR = await deepar.initialize(deepARConfig);
        await deepAR.startCamera();
        // Load the jewelry effect
        await deepAR.loadEffect(deepARConfig.effect);
    } catch (error) {
        console.error('Error initializing DeepAR:', error);
        alert('Failed to initialize virtual try-on. Please try again later.');
    }
}

// Load product details
function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    
    // Find product in our data
    const allProducts = [
        ...products.featured,
        ...products.aneis,
        ...products.colares,
        ...products.brincos,
        ...products.pulseiras
    ];
    
    currentProduct = allProducts.find(p => p.id === productId);
    
    if (!currentProduct) {
        window.location.href = '../index.html';
        return;
    }

    // Update page content
    document.getElementById('product-name').textContent = currentProduct.name;
    document.getElementById('product-price').textContent = `R$ ${currentProduct.price.toFixed(2)}`;
    document.getElementById('product-description').textContent = currentProduct.description;
    document.getElementById('main-product-image').src = currentProduct.images[0];
    document.getElementById('detailed-description').textContent = currentProduct.description;

    // Load thumbnails
    const thumbnailContainer = document.querySelector('.thumbnail-container');
    thumbnailContainer.innerHTML = '';
    currentProduct.images.forEach((image, index) => {
        const thumbnail = document.createElement('img');
        thumbnail.src = image;
        thumbnail.alt = `${currentProduct.name} - View ${index + 1}`;
        thumbnail.className = 'thumbnail';
        if (index === 0) thumbnail.classList.add('active');
        thumbnail.addEventListener('click', () => updateMainImage(image, index));
        thumbnailContainer.appendChild(thumbnail);
    });

    // Load product specifications
    const specsList = document.getElementById('specifications');
    specsList.innerHTML = '';
    for (const [key, value] of Object.entries(currentProduct.details)) {
        const li = document.createElement('li');
        li.textContent = `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`;
        specsList.appendChild(li);
    }

    // Load size options
    const sizeOptions = document.getElementById('size-options');
    sizeOptions.innerHTML = '';
    currentProduct.details.tamanhos.forEach(size => {
        const button = document.createElement('button');
        button.className = 'size-option';
        button.textContent = size;
        button.addEventListener('click', () => selectSize(size));
        sizeOptions.appendChild(button);
    });
}

// Update main image when thumbnail is clicked
function updateMainImage(src, index) {
    document.getElementById('main-product-image').src = src;
    document.querySelectorAll('.thumbnail').forEach(thumb => thumb.classList.remove('active'));
    document.querySelectorAll('.thumbnail')[index].classList.add('active');
}

// Size selection
function selectSize(size) {
    selectedSize = size;
    document.querySelectorAll('.size-option').forEach(btn => {
        btn.classList.toggle('active', btn.textContent === size);
    });
}

// Metal selection
document.querySelectorAll('.metal-option').forEach(btn => {
    btn.addEventListener('click', () => {
        selectedMetal = btn.dataset.metal;
        document.querySelectorAll('.metal-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateProductVisuals();
    });
});

// Update product visuals based on metal selection
function updateProductVisuals() {
    // Update 3D model or AR experience based on selected metal
    if (deepAR) {
        deepAR.switchEffect(`../assets/effects/jewelry_${selectedMetal}.deepar`);
    }
}

// Quantity controls
document.getElementById('decrease-quantity').addEventListener('click', () => {
    const input = document.getElementById('quantity');
    if (input.value > 1) input.value = parseInt(input.value) - 1;
});

document.getElementById('increase-quantity').addEventListener('click', () => {
    const input = document.getElementById('quantity');
    input.value = parseInt(input.value) + 1;
});

// Virtual Try-On
document.getElementById('try-on').addEventListener('click', async () => {
    const modal = document.getElementById('try-on-modal');
    modal.style.display = 'block';
    
    if (!deepAR) {
        await initializeDeepAR();
    }
});

// 3D Viewer
document.getElementById('view-3d').addEventListener('click', () => {
    const modal = document.getElementById('viewer-3d-modal');
    modal.style.display = 'block';
    
    // Initialize 3D viewer
    // Add your 3D viewer implementation here
});

// Modal controls
document.querySelectorAll('.modal .close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        closeBtn.closest('.modal').style.display = 'none';
        if (deepAR) {
            deepAR.stopCamera();
        }
    });
});

// Camera controls
document.getElementById('switch-camera').addEventListener('click', () => {
    if (deepAR) {
        deepAR.switchCamera();
    }
});

document.getElementById('take-photo').addEventListener('click', () => {
    if (deepAR) {
        deepAR.takeScreenshot();
    }
});

// Add to cart
document.getElementById('add-to-cart-btn').addEventListener('click', () => {
    if (!selectedSize) {
        alert('Por favor, selecione um tamanho');
        return;
    }

    const quantity = parseInt(document.getElementById('quantity').value);
    const productToAdd = {
        ...currentProduct,
        selectedSize,
        selectedMetal,
        quantity
    };

    // Add to cart using the existing cart functionality
    for (let i = 0; i < quantity; i++) {
        addToCart(productToAdd.id);
    }
});

// Accordion functionality
document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
        const content = header.nextElementSibling;
        content.classList.toggle('active');
        const icon = header.querySelector('i');
        icon.classList.toggle('fa-chevron-down');
        icon.classList.toggle('fa-chevron-up');
    });
});

// Initialize page
document.addEventListener('DOMContentLoaded', loadProductDetails);