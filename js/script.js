// Product data
const products = {
    featured: [
        {
            id: 1,
            name: "Anel de Diamante Solitário",
            price: 5999.99,
            image: "assets/images/anel-diamante.jpg",
            images: [
                "assets/images/anel-diamante.jpg",
                "assets/images/anel-diamante-2.jpg",
                "assets/images/anel-diamante-3.jpg"
            ],
            category: "aneis",
            description: "Elegante anel solitário com diamante de corte brilhante de 1 quilate, montado em ouro 18k.",
            details: {
                material: "Ouro 18k",
                pedra: "Diamante Natural",
                quilate: "1.0ct",
                pureza: "VS1",
                cor: "F",
                certificacao: "GIA",
                tamanhos: ["14", "15", "16", "17", "18", "19"]
            },
            modelo3d: "assets/3d/anel-solitario.glb",
            arModel: "assets/ar/anel-solitario.usdz",
        },
        {
            id: 2,
            name: "Colar de Pérolas",
            price: 2999.99,
            image: "assets/images/colar-perolas.jpg",
            category: "colares"
        },
        {
            id: 3,
            name: "Brincos de Ouro Rosé",
            price: 1599.99,
            image: "assets/images/brincos-rose.jpg",
            category: "brincos"
        },
        {
            id: 4,
            name: "Pulseira de Ouro 18k",
            price: 3999.99,
            image: "assets/images/pulseira-ouro.jpg",
            category: "pulseiras"
        }
    ],
    // Provide empty collections for other categories so code that expects them won't throw
    aneis: [],
    colares: [],
    brincos: [],
    pulseiras: []
};

// Helper to safely aggregate all products
function getAllProducts() {
    return [
        ...(products.featured || []),
        ...(products.aneis || []),
        ...(products.colares || []),
        ...(products.brincos || []),
        ...(products.pulseiras || [])
    ];
}

// Wishlist functionality
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
const wishlistIcon = document.getElementById('wishlist-icon');
const wishlistModal = document.getElementById('wishlist-modal');
const wishlistItems = document.getElementById('wishlist-items');
const wishlistCount = document.getElementById('wishlist-count');
const shareWishlistBtn = document.getElementById('share-wishlist');
const clearWishlistBtn = document.getElementById('clear-wishlist');

// Cart functionality
let cart = [];
const cartIcon = document.getElementById('cart-icon');
const cartModal = document.getElementById('cart-modal');
const closeBtn = document.querySelector('.close');
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const totalAmount = document.getElementById('total-amount');
const checkoutBtn = document.getElementById('checkout-btn');

// Display featured products
function displayProducts() {
    const featuredItems = document.getElementById('featured-items');
    products.featured.forEach(product => {
        const productCard = createProductCard(product);
        featuredItems.appendChild(productCard);
    });
}

// (removed simple duplicate createProductCard - a richer version is defined later)

// (addToCart implementation is defined later with wishlist/auth handling; removed duplicate)

// Update cart display
function updateCart() {
    cartCount.textContent = cart.length;
    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <span>${item.name}</span>
            <span>R$ ${item.price.toFixed(2)}</span>
            <button onclick="removeFromCart(${index})">Remover</button>
        `;
        cartItems.appendChild(cartItem);
        total += item.price;
    });

    totalAmount.textContent = total.toFixed(2);
}

// Remove item from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

// Show cart modal
function showCartModal() {
    if (cartModal) cartModal.style.display = 'block';
}

// Close modal handlers (works for cart and wishlist)
document.querySelectorAll('.modal .close').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const modal = btn.closest('.modal');
        if (modal) modal.style.display = 'none';
    });
});

// Close when clicking outside modal content
window.addEventListener('click', (event) => {
    document.querySelectorAll('.modal').forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

checkoutBtn.addEventListener('click', () => {
    if (cart.length > 0) {
        alert('Obrigado pela sua compra! Em breve você receberá mais informações por email.');
        cart = [];
        updateCart();
        closeCartModal();
    } else {
        alert('Seu carrinho está vazio!');
    }
});

// Search and Filter functionality
let activeFilters = {
    priceMin: 0,
    priceMax: 10000,
    metals: [],
    stones: [],
    searchQuery: ''
};

function initializeSearchAndFilters() {
    const filterButton = document.getElementById('filter-button');
    const filtersSection = document.getElementById('filters-section');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const priceMinRange = document.getElementById('price-min');
    const priceMaxRange = document.getElementById('price-max');
    const priceMinInput = document.getElementById('price-min-input');
    const priceMaxInput = document.getElementById('price-max-input');

    // Toggle filters section
    filterButton?.addEventListener('click', () => {
        filtersSection?.classList.toggle('active');
    });

    // Search functionality
    searchButton?.addEventListener('click', () => {
        activeFilters.searchQuery = searchInput.value;
        applyFiltersAndSearch();
    });

    searchInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            activeFilters.searchQuery = searchInput.value;
            applyFiltersAndSearch();
        }
    });

    // Price range functionality
    priceMinRange?.addEventListener('input', (e) => {
        priceMinInput.value = e.target.value;
        activeFilters.priceMin = parseInt(e.target.value);
    });

    priceMaxRange?.addEventListener('input', (e) => {
        priceMaxInput.value = e.target.value;
        activeFilters.priceMax = parseInt(e.target.value);
    });

    priceMinInput?.addEventListener('change', (e) => {
        priceMinRange.value = e.target.value;
        activeFilters.priceMin = parseInt(e.target.value);
    });

    priceMaxInput?.addEventListener('change', (e) => {
        priceMaxRange.value = e.target.value;
        activeFilters.priceMax = parseInt(e.target.value);
    });

    // Metal and stone checkboxes
    document.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateActiveFilters();
        });
    });

    // Apply filters button
    applyFiltersBtn?.addEventListener('click', applyFiltersAndSearch);
}

function updateActiveFilters() {
    // Update metals
    activeFilters.metals = Array.from(document.querySelectorAll('.filter-group:nth-child(2) input[type="checkbox"]:checked'))
        .map(cb => cb.value);

    // Update stones
    activeFilters.stones = Array.from(document.querySelectorAll('.filter-group:nth-child(3) input[type="checkbox"]:checked'))
        .map(cb => cb.value);
}

function applyFiltersAndSearch() {
    const allProducts = getAllProducts();

    const filteredProducts = allProducts.filter(product => {
        // Price filter
        if (product.price < activeFilters.priceMin || product.price > activeFilters.priceMax) {
            return false;
        }

        // Metal filter
        if (activeFilters.metals.length > 0 && !activeFilters.metals.includes(product.details?.metal)) {
            return false;
        }

        // Stone filter
        if (activeFilters.stones.length > 0 && !activeFilters.stones.some(stone => product.details?.stones?.includes(stone))) {
            return false;
        }

        // Search query
        if (activeFilters.searchQuery) {
            const searchLower = activeFilters.searchQuery.toLowerCase();
            return product.name.toLowerCase().includes(searchLower) ||
                   product.description.toLowerCase().includes(searchLower);
        }

        return true;
    });

    displayFilteredProducts(filteredProducts);
}

function displayFilteredProducts(filteredProducts) {
    const featuredItems = document.getElementById('featured-items');
    if (!featuredItems) return;

    featuredItems.innerHTML = '';
    
    if (filteredProducts.length === 0) {
        featuredItems.innerHTML = `
            <div class="no-results">
                <h3>Nenhum produto encontrado</h3>
                <p>Tente ajustar seus filtros ou fazer uma nova busca.</p>
            </div>
        `;
        return;
    }

    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        featuredItems.appendChild(productCard);
    });
}

// Wishlist functionality (update and rendering use safe product list)
function updateWishlistDisplay() {
    wishlistCount.textContent = wishlist.length;
    if (!wishlistItems) return;
    wishlistItems.innerHTML = '';

    const allProducts = getAllProducts();

    wishlist.forEach(productId => {
        const product = allProducts.find(p => p.id === productId);
        if (product) {
            const wishlistItem = document.createElement('div');
            wishlistItem.className = 'wishlist-item';
            wishlistItem.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <div class="wishlist-item-info">
                    <h3>${product.name}</h3>
                    <p>R$ ${product.price.toFixed(2)}</p>
                </div>
                <div class="wishlist-item-actions">
                    <button onclick="addToCart(${product.id})" class="add-to-cart-btn">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                    <button onclick="toggleWishlist(${product.id})" class="remove-from-wishlist-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            wishlistItems.appendChild(wishlistItem);
        }
    });
}

function updateProductWishlistButtons(productId) {
    const wishlistButtons = document.querySelectorAll(`.wishlist-btn[data-product-id="${productId}"]`);
    const isInWishlist = wishlist.includes(productId);
    
    wishlistButtons.forEach(button => {
        button.classList.toggle('in-wishlist', isInWishlist);
        button.innerHTML = `<i class="fas fa-heart"></i>`;
    });
}

function shareWishlist() {
    const allProducts = getAllProducts();
    const wishlistItemsText = wishlist.map(productId => {
        const product = allProducts.find(p => p.id === productId);
        return product ? product.name : '';
    }).filter(name => name);

    const shareText = `Minha Lista de Desejos:\n${wishlistItems.join('\n')}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Minha Lista de Desejos - Joalheria Virtual',
            text: shareText,
            url: window.location.origin
        });
    } else {
        // Fallback for browsers that don't support Web Share API
        const tempInput = document.createElement('textarea');
        tempInput.value = shareText;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        alert('Lista de desejos copiada para a área de transferência!');
    }
}

// Update createProductCard function to include wishlist button
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    const isInWishlist = wishlist.includes(product.id);
    
    card.innerHTML = `
        <a href="pages/product-detail.html?id=${product.id}" class="product-link">
            <div class="product-image-container">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-overlay">
                    <span class="view-details">
                        <i class="fas fa-search"></i>
                        Ver Detalhes
                    </span>
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-price">R$ ${product.price.toFixed(2)}</p>
                <div class="product-actions">
                    <button class="btn btn-primary add-to-cart" onclick="addToCart(${product.id}); event.preventDefault();">
                        <i class="fas fa-shopping-cart"></i>
                        Adicionar ao Carrinho
                    </button>
                    <button class="btn-ghost wishlist-btn ${isInWishlist ? 'in-wishlist' : ''}" 
                            data-product-id="${product.id}"
                            onclick="toggleWishlist(${product.id}); event.preventDefault();">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        </a>
    `;
    return card;
}

// Event Listeners for Wishlist
wishlistIcon?.addEventListener('click', () => {
    wishlistModal.style.display = 'block';
    updateWishlistDisplay();
});

shareWishlistBtn?.addEventListener('click', shareWishlist);

clearWishlistBtn?.addEventListener('click', () => {
    if (confirm('Tem certeza que deseja limpar sua lista de desejos?')) {
        wishlist = [];
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        updateWishlistDisplay();
    }
});

// Authentication Integration
import auth from './auth.js';

function updateAuthUI() {
    const userMenu = document.getElementById('user-menu');
    const loginButton = document.getElementById('login-button');

    if (auth.isAuthenticated) {
        if (userMenu) {
            userMenu.innerHTML = `
                <button class="user-menu-button">
                    <i class="fas fa-user"></i>
                    ${auth.currentUser.name}
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="user-menu-dropdown">
                    <a href="pages/profile.html">Meu Perfil</a>
                    <a href="pages/orders.html">Meus Pedidos</a>
                    <a href="pages/addresses.html">Endereços</a>
                    <button onclick="auth.logout()">Sair</button>
                </div>
            `;
            userMenu.style.display = 'block';
        }
        if (loginButton) {
            loginButton.style.display = 'none';
        }
    } else {
        if (userMenu) {
            userMenu.style.display = 'none';
        }
        if (loginButton) {
            loginButton.innerHTML = `
                <a href="pages/login.html" class="btn-login">
                    <i class="fas fa-user"></i>
                    Entrar
                </a>
            `;
            loginButton.style.display = 'block';
        }
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    displayProducts();
    initializeSearchAndFilters();
    updateWishlistDisplay();
    updateAuthUI();
});

// Centralized, safe addToCart implementation — works with or without authentication
function addToCart(productId) {
    // find product across all collections
    const product = getAllProducts().find(p => p.id === productId);
    if (!product) return;

    // Allow adding to cart even if user is not authenticated (store locally)
    cart.push(product);
    updateCart();
    showCartModal();
}

// Centralized toggleWishlist — will not force redirect to login; stores locally
function toggleWishlist(productId) {
    const index = wishlist.indexOf(productId);
    if (index === -1) {
        wishlist.push(productId);
    } else {
        wishlist.splice(index, 1);
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistDisplay();
    updateProductWishlistButtons(productId);
}

/* Theme picker runtime controls */
function setTheme(vars) {
    const root = document.documentElement;
    if (vars.primary) root.style.setProperty('--primary-color', vars.primary);
    if (vars.accent) root.style.setProperty('--accent-color', vars.accent);
    if (vars.navText) root.style.setProperty('--nav-text-color', vars.navText);
    if (vars.bg) root.style.setProperty('--background-color', vars.bg);
}

function saveTheme(vars) {
    localStorage.setItem('site-theme', JSON.stringify(vars));
}

function loadTheme() {
    try {
        const raw = localStorage.getItem('site-theme');
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

function resetThemeToDefaults() {
    const defaults = {
        primary: getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#b89a70',
        accent: getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#d4af37',
        navText: getComputedStyle(document.documentElement).getPropertyValue('--nav-text-color').trim() || '#ffffff',
        bg: getComputedStyle(document.documentElement).getPropertyValue('--background-color').trim() || '#fbfaf8'
    };
    saveTheme(defaults);
    setTheme(defaults);
    return defaults;
}

// Wire up theme UI if present
document.addEventListener('DOMContentLoaded', () => {
    const panel = document.getElementById('theme-panel');
    const toggle = document.getElementById('theme-toggle');
    const primaryInput = document.getElementById('theme-primary');
    const accentInput = document.getElementById('theme-accent');
    const navTextInput = document.getElementById('theme-nav-text');
    const bgInput = document.getElementById('theme-bg');
    const applyBtn = document.getElementById('theme-apply');
    const resetBtn = document.getElementById('theme-reset');

    // Load saved theme
    const saved = loadTheme();
    if (saved) {
        setTheme(saved);
        if (primaryInput) primaryInput.value = saved.primary;
        if (accentInput) accentInput.value = saved.accent;
        if (navTextInput) navTextInput.value = saved.navText;
        if (bgInput) bgInput.value = saved.bg;
    }

    if (toggle && panel) {
        toggle.addEventListener('click', () => {
            panel.classList.toggle('open');
            panel.setAttribute('aria-hidden', panel.classList.contains('open') ? 'false' : 'true');
        });
    }

    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            const vars = {
                primary: primaryInput ? primaryInput.value : null,
                accent: accentInput ? accentInput.value : null,
                navText: navTextInput ? navTextInput.value : null,
                bg: bgInput ? bgInput.value : null
            };
            setTheme(vars);
            saveTheme(vars);
            if (panel) { panel.classList.remove('open'); panel.setAttribute('aria-hidden', 'true'); }
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            const defaults = resetThemeToDefaults();
            if (primaryInput) primaryInput.value = defaults.primary;
            if (accentInput) accentInput.value = defaults.accent;
            if (navTextInput) navTextInput.value = defaults.navText;
            if (bgInput) bgInput.value = defaults.bg;
            if (panel) { panel.classList.remove('open'); panel.setAttribute('aria-hidden', 'true'); }
        });
    }
});

// Inject theme panel markup on pages that don't include it (keeps UI site-wide)
(function injectThemePanel() {
    function makePanelHtml() {
        return `
        <button id="theme-toggle" class="theme-toggle-btn" aria-label="Abrir painel de tema">Tema</button>
        <div id="theme-panel" class="theme-panel" aria-hidden="true">
            <h4>Personalizar Tema</h4>
            <div class="theme-row"><label class="small">Primário</label><input type="color" id="theme-primary" value="${getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#b89a70'}"/></div>
            <div class="theme-row"><label class="small">Accent</label><input type="color" id="theme-accent" value="${getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#d4af37'}"/></div>
            <div class="theme-row"><label class="small">Texto do Nav</label><input type="color" id="theme-nav-text" value="${getComputedStyle(document.documentElement).getPropertyValue('--nav-text-color').trim() || '#ffffff'}"/></div>
            <div class="theme-row"><label class="small">Fundo</label><input type="color" id="theme-bg" value="${getComputedStyle(document.documentElement).getPropertyValue('--background-color').trim() || '#fbfaf8'}"/></div>
            <div style="display:flex; gap:8px; margin-top:8px;"><button id="theme-apply" class="btn-primary">Aplicar</button><button id="theme-reset" class="btn-secondary">Reset</button></div>
        </div>
        `;
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (!document.getElementById('theme-panel')) {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = makePanelHtml();
            document.body.appendChild(wrapper);
            // After insertion, re-run the wiring block above by dispatching a small event.
            const evt = new Event('theme-panel-injected');
            document.dispatchEvent(evt);
        }
    });
})();