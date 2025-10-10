// Utilitário para mapear o metal do produto para o valor do filtro
function mapMetalToFilterValue(metal) {
    if (!metal) return '';
    const m = metal.toLowerCase();
    if (m.includes('amarelo')) return 'yellow-gold';
    if (m.includes('branco')) return 'white-gold';
    if (m.includes('ros')) return 'rose-gold';
    if (m.includes('prata')) return 'silver';
    return '';
}
/**
 * @function logError
 * @description Logging centralizado para erros críticos e eventos importantes.
 * Registra no console, pode ser expandido para integração com serviços externos.
 * @param {string|Error} error - Mensagem ou objeto de erro
 * @param {Object} [context] - Contexto adicional do erro
 */
function logError(error, context = {}) {
    const timestamp = new Date().toISOString();
    let message = '[LOG][ERRO][' + timestamp + '] ';
    if (typeof error === 'string') {
        message += error;
    } else if (error instanceof Error) {
        message += error.message;
    } else {
        message += JSON.stringify(error);
    }
    if (Object.keys(context).length > 0) {
        message += ' | Contexto: ' + JSON.stringify(context);
    }
    // Fallback: console, mas pode ser enviado para backend/serviço externo
    if (window && window.console && typeof window.console.error === 'function') {
        window.console.error(message);
    }
    // Futuro: enviar para endpoint externo, Sentry, etc.
}
window.logError = logError;

/**
 * @file js/script.js
 * @module JewelryStore
 * @author Jewelry Team (prbretas)
 * @version 1.2.1
 * @date 2025-10-09
 * @description Lógica central do site — catálogo de produtos, carrinho, wishlist, filtros, theming e integrações de UI comuns.
 * @copyright Copyright (c) 2025
 *
 * Histórico de alterações:
 * - 1.2.1 (09/10/2025 14:00): Padronização de logging centralizado (logError), revisão de comentários e documentação.
 * - 1.2.0 (09/10/2025): Padronização de feedback visual (showToast), loading states, guards de seletores DOM.
 * - 1.1.0: Persistência de carrinho/wishlist, integração auth, melhorias de UX.
 * - 1.0.0: Estrutura inicial do catálogo, carrinho, wishlist e filtros.
 */

/**
 * @function showToast
 * @description Exibe uma notificação temporária para o usuário
 * @param {string} message - Mensagem a ser exibida
 * @param {string} [type='info'] - Tipo da notificação (success, info, warning, error)
 */
function showToast(message, type = 'info') {
    // Remove toasts anteriores se existirem
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Cria o elemento toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Determina o ícone baseado no tipo
    const icons = {
        success: 'check-circle',
        error: 'times-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };

    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-${icons[type] || icons.info}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Anima entrada
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });
    
    // Remove após delay
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Expõe showToast globalmente
window.showToast = showToast;

/**
 * @namespace JewelryStore
 * @description Módulo central da loja virtual que gerencia o catálogo de produtos,
 * carrinho de compras, lista de desejos, filtros de busca e temas visuais.
 * Implementa funcionalidades essenciais compartilhadas entre todas as páginas.
 * * @version 1.1.0
 * @author Jewelry Team
 * @since 2025-10-09
 */

/** @type {Object.<string, Array>} Catálogo de produtos por categoria */
const products = {
    featured: [
        {
            id: 1,
            name: "Anel de Diamante Solitário",
            price: 5999.99,
            image: "assets/images/JOIAS/joia-1 (1).jpeg",
            category: "aneis",
            description: "Elegante anel solitário com diamante de corte brilhante de 1 quilate, montado em ouro 18k.",
            details: {
                material: "Ouro 18k",
                pedra: "Diamante Natural",
                quilate: "1.0ct",
                pureza: "VS1",
                cor: "F",
                certificacao: "GIA"
            }
        },
        {
            id: 2,
            name: "Colar de Pérolas",
            price: 2999.99,
            image: "assets/images/JOIAS/joia-1 (2).jpeg",
            category: "colares",
            description: "Belíssimo colar de pérolas naturais com fecho em ouro branco 18k.",
            details: {
                material: "Ouro Branco 18k",
                pedra: "Pérolas Naturais",
                comprimento: "45cm"
            }
        },
        {
            id: 3,
            name: "Brincos de Ouro Rosé",
            price: 1599.99,
            image: "assets/images/JOIAS/joia-1 (3).jpeg",
            category: "brincos",
            description: "Brincos elegantes em ouro rosé 18k com design moderno e sofisticado.",
            details: {
                material: "Ouro Rosé 18k",
                estilo: "Contemporâneo",
                comprimento: "2.5cm"
            }
        },
        {
            id: 4,
            name: "Pulseira de Ouro 18k",
            price: 3999.99,
            image: "assets/images/JOIAS/joia-1 (4).jpeg",
            category: "pulseiras",
            description: "Pulseira clássica em ouro 18k com acabamento polido.",
            details: {
                material: "Ouro 18k",
                peso: "12g",
                comprimento: "19cm"
            }
        },
        {
            id: 5,
            name: "Anel de Safira",
            price: 4599.99,
            image: "assets/images/JOIAS/joia-1 (5).jpeg",
            category: "aneis",
            description: "Anel luxuoso com safira azul cercada por diamantes.",
            details: {
                material: "Ouro Branco 18k",
                pedra: "Safira e Diamantes",
                quilate: "Safira 1.5ct, Diamantes 0.5ct total"
            }
        }
    ],
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

/*
 * Persistência e Estado Global (Melhoria 1.1.0)
 */
const WISHLIST_KEY = 'wishlist';
let wishlist = JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];

const CART_KEY = 'cart';
let cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; // IMPLEMENTED CART PERSISTENCE

// DOM elements - Usando const e consultando defensivamente (Melhoria 1.1.0)
const wishlistIcon = document.getElementById('wishlist-icon');
const wishlistModal = document.getElementById('wishlist-modal');
const wishlistItems = document.getElementById('wishlist-items');
const wishlistCount = document.getElementById('wishlist-count');
const shareWishlistBtn = document.getElementById('share-wishlist');
const clearWishlistBtn = document.getElementById('clear-wishlist');

const cartIcon = document.getElementById('cart-icon');
const cartModal = document.getElementById('cart-modal');
const closeBtn = document.querySelector('.close');
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const totalAmount = document.getElementById('total-amount');
const checkoutBtn = document.getElementById('checkout-btn');


// Helper to safely get DOM elements that may not exist yet
function ensureElements() {
    // Re-query elements that weren't found on first load
    if (!wishlistIcon) wishlistIcon = document.getElementById('wishlist-icon');
    if (!wishlistModal) wishlistModal = document.getElementById('wishlist-modal');
    if (!wishlistItems) wishlistItems = document.getElementById('wishlist-items');
    if (!wishlistCount) wishlistCount = document.getElementById('wishlist-count');
    if (!shareWishlistBtn) shareWishlistBtn = document.getElementById('share-wishlist');
    if (!clearWishlistBtn) clearWishlistBtn = document.getElementById('clear-wishlist');
    
    if (!cartIcon) cartIcon = document.getElementById('cart-icon');
    if (!cartModal) cartModal = document.getElementById('cart-modal');
    if (!closeBtn) closeBtn = document.querySelector('.close');
    if (!cartItems) cartItems = document.getElementById('cart-items');
    if (!cartCount) cartCount = document.getElementById('cart-count');
    if (!totalAmount) totalAmount = document.getElementById('total-amount');
    if (!checkoutBtn) checkoutBtn = document.getElementById('checkout-btn');
}

/**
 * displayProducts
 * Versão: 1.0.0
 * Data: 2025-10-09
 * Descrição: Renderiza os produtos em `products.featured` dentro do elemento
 * `#featured-items`. É defensiva: se a página não possuir o container, não faz nada.
 */
/**
 * displayProducts
 * Versão: 1.0.1
 * Data: 2025-10-09
 * Descrição: Renderiza os produtos em `products.featured` dentro do elemento
 * `#featured-items`. É defensiva: se a página não possuir o container ou
 * não houver produtos, não faz nada.
 */
function displayProducts() {
    console.log('Iniciando displayProducts');
    const featuredItems = document.getElementById('featured-items');
    if (!featuredItems) {
        console.warn('Container featured-items não encontrado');
        return;
    }

    // Garantir que temos produtos para exibir
    if (!Array.isArray(products.featured) || products.featured.length === 0) {
        console.warn('Nenhum produto encontrado em products.featured');
        featuredItems.innerHTML = `
            <div class="no-products">
                <p>Nenhum produto em destaque no momento.</p>
            </div>
        `;
        return;
    }

    console.log('Produtos encontrados:', products.featured.length);

    // Limpar container antes de adicionar produtos
    featuredItems.innerHTML = '';

    // Renderizar cada produto com tratamento de erro
    products.featured.forEach(product => {
        try {
            if (!product || typeof product !== 'object') {
                console.warn('Produto inválido encontrado na lista featured:', product);
                return;
            }
            console.log('Criando card para produto:', product.name);
            
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
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
                        <button class="add-to-cart" onclick="addToCart({id: ${product.id}})">
                            <i class="fas fa-shopping-cart"></i>
                            Adicionar ao Carrinho
                        </button>
                        <button class="wishlist-btn ${wishlist.includes(product.id) ? 'in-wishlist' : ''}" 
                                onclick="toggleWishlist(${product.id}, this)">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
            `;
            
            featuredItems.appendChild(card);
            console.log('Card criado com sucesso para:', product.name);
        } catch (error) {
            logError('Erro ao renderizar produto', { error, product });
        }
    });
}

// (removed simple duplicate createProductCard - a richer version is defined later)

// (addToCart implementation is defined later with wishlist/auth handling; removed duplicate)

/*
 * Cart functionality (Update 1.2.0)
 * Improved cart with quantity controls, animations and better UX
 */
function updateCart() {
    if (cartCount) {
        // Recalcula total de itens (incluindo quantidade por variante)
        const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0); 
        cartCount.textContent = totalItems;
        // Icone recebe a classe 'has-items' se houver itens
        cartIcon?.classList.toggle('has-items', totalItems > 0);
        
        // Animate badge update
        if (totalItems > 0) {
            cartCount.style.animation = 'none';
            cartCount.offsetHeight; // Trigger reflow
            cartCount.style.animation = 'cartBadgePop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        }
    }

    if (cartItems) {
        cartItems.innerHTML = ''; // Limpa itens existentes
        let total = 0;

        if (cart.length === 0) {
            cartItems.innerHTML = '<li class="empty-message">Seu carrinho está vazio.</li>';
        } else {
            cart.forEach(item => {
                // Cria uma chave de variante para remoção e exibição detalhada
                const variantKey = `${item.id}-${item.selectedSize || ''}-${item.selectedMetal || ''}`;
                const li = document.createElement('li');
                li.className = 'cart-item';
                li.innerHTML = `
                    <div class="item-details">
                        <span class="item-name">${item.name}</span>
                        <span class="item-variant">${item.selectedSize ? 'Tam: ' + item.selectedSize : ''} ${item.selectedMetal ? ' | Metal: ' + item.selectedMetal : ''}</span>
                        <span class="item-price">R$ ${item.price.toFixed(2)} x ${item.quantity || 1}</span>
                    </div>
                    <button class="remove-from-cart" data-variant-key="${variantKey}">&times;</button>
                `;
                cartItems.appendChild(li);
                total += item.price * (item.quantity || 1);
            });
            
            // Listener para remoção
            cartItems.querySelectorAll('.remove-from-cart').forEach(button => {
                button.addEventListener('click', (e) => {
                    const variantKey = e.currentTarget.dataset.variantKey;
                    removeFromCart(variantKey);
                });
            });
        }

        if (totalAmount) totalAmount.textContent = total.toFixed(2);
    }
    
    saveState(); // Salva estado após atualização
}

// Helper function to save cart/wishlist state
function saveState() {
    try {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {
        logError("Erro ao salvar estado no localStorage", { error: e });
    }
}

/**
 * @function removeFromCart
 * @description Remove uma variante exata do carrinho usando a chave de variante.
 * @param {string} variantKey - Chave única do item (ID-Size-Metal)
 */
async function removeFromCart(variantKey) {
    const index = cart.findIndex(item => item.variantKey === variantKey);
    if (index > -1) {
        const item = cart[index];
        const cartItem = document.querySelector(`.cart-item button[data-variant-key="${variantKey}"]`)?.closest('.cart-item');
        
        if (cartItem) {
            // Animate item removal
            cartItem.style.transition = 'all 0.3s ease';
            cartItem.style.transform = 'translateX(100%)';
            cartItem.style.opacity = '0';
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        cart.splice(index, 1);
        updateCart();
        
        const itemDescription = item.quantity > 1 
            ? `${item.quantity}x ${item.name}`
            : item.name;
        
        window.showToast?.(`"${itemDescription}" removido do carrinho.`, 'info');
    }
}

/**
 * showCartModal
 * Versão: 1.0.0
 * Data: 2025-10-09
 * Descrição: Abre o modal do carrinho quando existente.
 */
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

// Guard: attach checkout handler only if element exists
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', async () => {
        if (cart.length === 0) {
            showToast('Seu carrinho está vazio!', 'warning');
            return;
        }

        checkoutBtn.disabled = true;
        checkoutBtn.classList.add('button-loading');
        checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';

        try {
            // Simula o processamento do pedido
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            cart = [];
            localStorage.removeItem(CART_KEY);
            updateCart();
            
            showToast('Pedido realizado com sucesso! Em breve você receberá mais informações por email.', 'success');
            
            if (typeof closeCartModal === 'function') {
                closeCartModal();
            }
        } catch (error) {
            logError('Erro ao processar pedido', { error });
            showToast('Erro ao processar pedido. Tente novamente.', 'error');
        } finally {
            checkoutBtn.disabled = false;
            checkoutBtn.classList.remove('button-loading');
            checkoutBtn.innerHTML = 'Finalizar Compra';
        }
    });
}

// Search and Filter functionality
let activeFilters = {
    priceMin: 0,
    priceMax: 10000,
    metals: [],
    stones: [],
    searchQuery: ''
};

/**
 * initializeSearchAndFilters
 * Versão: 1.0.1
 * Data: 2025-10-09
 * Descrição: Inicializa todos os controles de busca e filtro do catálogo.
 * É defensiva: cada elemento é verificado antes do uso e listeners são
 * adicionados de forma segura.
 */
function initializeSearchAndFilters() {
    console.log('Iniciando setup de busca e filtros');
    // Guardar elementos em estado do módulo para reuso
    const elements = {
        filterButton: document.getElementById('filter-button'),
        filtersSection: document.getElementById('filters-section'),
        searchInput: document.getElementById('search-input'),
        searchButton: document.getElementById('search-button'),
        applyFiltersBtn: document.getElementById('apply-filters'),
        priceMinRange: document.getElementById('price-min'),
        priceMaxRange: document.getElementById('price-max'),
        priceMinInput: document.getElementById('price-min-input'),
        priceMaxInput: document.getElementById('price-max-input')
    };

    // Log dos elementos encontrados/não encontrados
    Object.entries(elements).forEach(([key, element]) => {
        console.log(`Elemento ${key}: ${element ? 'encontrado' : 'não encontrado'}`);
    });

    // Se nenhum elemento de filtro existe, provavelmente estamos em uma página
    // que não usa filtros - podemos retornar cedo
    if (!elements.filterButton && !elements.searchInput) {
        console.warn('Nenhum elemento de filtro encontrado na página');
        return;
    }

    // Toggle filters section - usa optional chaining para segurança
    if (elements.filterButton) {
        elements.filterButton.addEventListener('click', () => {
            console.log('Botão de filtro clicado');
            if (elements.filtersSection) {
                elements.filtersSection.classList.toggle('active');
                console.log('Estado do filtro:', elements.filtersSection.classList.contains('active'));
            }
        });
    }

    // Search functionality - protege contra searchInput undefined
    if (elements.searchButton && elements.searchInput) {
        elements.searchButton.addEventListener('click', () => {
            console.log('Botão de busca clicado');
            activeFilters.searchQuery = elements.searchInput.value;
            applyFiltersAndSearch();
        });

        elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                console.log('Tecla Enter pressionada na busca');
                activeFilters.searchQuery = elements.searchInput.value;
                applyFiltersAndSearch();
            }
        });
    }

    // Price range functionality - protege todos os acessos a elementos
    if (elements.priceMinRange && elements.priceMinInput) {
        elements.priceMinRange.addEventListener('input', (e) => {
            elements.priceMinInput.value = e.target.value;
            activeFilters.priceMin = parseInt(e.target.value) || 0;
        });

        elements.priceMinInput.addEventListener('change', (e) => {
            elements.priceMinRange.value = e.target.value;
            activeFilters.priceMin = parseInt(e.target.value) || 0;
        });
    }

    if (elements.priceMaxRange && elements.priceMaxInput) {
        elements.priceMaxRange.addEventListener('input', (e) => {
            elements.priceMaxInput.value = e.target.value;
            activeFilters.priceMax = parseInt(e.target.value) || 10000;
        });

        elements.priceMaxInput.addEventListener('change', (e) => {
            elements.priceMaxRange.value = e.target.value;
            activeFilters.priceMax = parseInt(e.target.value) || 10000;
        });
    }

    // Metal and stone checkboxes - usa try/catch para proteger contra erros de seletor
    try {
        document.querySelectorAll('.checkbox-group input[type="checkbox"]')
            .forEach(checkbox => {
                checkbox.addEventListener('change', updateActiveFilters);
            });
    } catch (error) {
        logError('Checkboxes de filtro não encontrados', { error });
    }

    // Apply filters button
    elements.applyFiltersBtn?.addEventListener('click', () => {
        try {
            applyFiltersAndSearch();
        } catch (error) {
            logError('Erro ao aplicar filtros (applyFiltersBtn)', { error });
        }
    });
}

function updateActiveFilters() {
    // Update metals
    activeFilters.metals = Array.from(document.querySelectorAll('.filter-group:nth-child(2) input[type="checkbox"]:checked'))
        .map(cb => cb.value);

    // Update stones
    activeFilters.stones = Array.from(document.querySelectorAll('.filter-group:nth-child(3) input[type="checkbox"]:checked'))
        .map(cb => cb.value);
}

/**
 * @function applyFiltersAndSearch
 * @description Aplica filtros e busca aos produtos com feedback visual
 * @param {HTMLElement} [buttonElement] - Elemento do botão que disparou a ação
 * @returns {Promise<void>}
 */
async function applyFiltersAndSearch(buttonElement) {
    console.log('Aplicando filtros e busca', { activeFilters });
    
    // Adiciona overlay de loading no grid de produtos
    const featuredItems = document.getElementById('featured-items');
    if (featuredItems) {
        console.log('Adicionando overlay de loading');
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = '<div class="loading-spinner"></div>';
        featuredItems.style.position = 'relative';
        featuredItems.appendChild(loadingOverlay);
    }

    // Se temos o botão, atualizamos seu estado
    if (buttonElement) {
        buttonElement.disabled = true;
        buttonElement.classList.add('button-loading');
        const originalContent = buttonElement.innerHTML;
        buttonElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Aplicando...';
    }

    try {
        const allProducts = getAllProducts();

        // Simula uma pequena latência para feedback visual
        await new Promise(resolve => setTimeout(resolve, 500));

        const filteredProducts = allProducts.filter(product => {
            // Price filter
            if (product.price < activeFilters.priceMin || product.price > activeFilters.priceMax) {
                return false;
            }

            // Metal filter (corrigido para mapear valores)
            if (activeFilters.metals.length > 0) {
                const metalValue = mapMetalToFilterValue(product.details?.material || product.details?.metal || '');
                if (!activeFilters.metals.includes(metalValue)) {
                    return false;
                }
            }

            // Stone filter (mantém lógica original)
            if (activeFilters.stones.length > 0 && !activeFilters.stones.some(stone => product.details?.stones?.includes(stone))) {
                return false;
            }

            // Search query
            if (activeFilters.searchQuery) {
                const searchLower = activeFilters.searchQuery.toLowerCase();
                return product.name.toLowerCase().includes(searchLower) ||
                       product.description?.toLowerCase().includes(searchLower);
            }

            return true;
        });

        displayFilteredProducts(filteredProducts);

        // Mostra feedback do resultado
        const totalResults = filteredProducts.length;
        const searchTerm = activeFilters.searchQuery;
        const hasFilters = activeFilters.metals.length > 0 || activeFilters.stones.length > 0;
        
        let message;
        if (totalResults === 0) {
            message = 'Nenhum produto encontrado. Tente ajustar seus filtros.';
            showToast(message, 'warning');
        } else {
            message = `${totalResults} produto${totalResults > 1 ? 's' : ''} encontrado${totalResults > 1 ? 's' : ''}`;
            if (searchTerm) message += ` para "${searchTerm}"`;
            if (hasFilters) message += ' com os filtros selecionados';
            showToast(message, 'success');
        }

    } catch (error) {
        logError('Erro ao aplicar filtros', { error, activeFilters });
        showToast('Erro ao aplicar filtros. Tente novamente.', 'error');
    } finally {
        // Restaura estado do botão
        if (buttonElement) {
            buttonElement.disabled = false;
            buttonElement.classList.remove('button-loading');
            buttonElement.innerHTML = 'Aplicar Filtros';
        }

        // Remove overlay de loading
        if (featuredItems) {
            const overlay = featuredItems.querySelector('.loading-overlay');
            if (overlay) {
                overlay.remove();
                featuredItems.style.position = '';
            }
        }
    }
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

// Wishlist functionality (updateWishlist remains the same, ensuring defensive checks with '?.' and saveState)
function updateWishlist() {
    if (wishlistCount) {
        wishlistCount.textContent = wishlist.length.toString();
    }
    if (wishlistIcon) {
        wishlistIcon.classList.toggle('has-items', wishlist.length > 0);
    }
    
    // Renderiza a lista de itens
    if (wishlistItems) {
        wishlistItems.innerHTML = '';
        if (wishlist.length === 0) {
            wishlistItems.innerHTML = '<li class="empty-message">Sua lista de desejos está vazia.</li>';
        } else {
            const allProducts = getAllProducts();
            wishlist.forEach(productId => {
                const product = allProducts.find(p => p.id === productId);
                if (product) {
                    const li = document.createElement('li');
                    li.className = 'wishlist-item';
                    li.innerHTML = `
                        <img src="${product.image}" alt="${product.name}">
                        <div class="wishlist-item-info">
                            <h3>${product.name}</h3>
                            <p>R$ ${product.price.toFixed(2)}</p>
                            <div class="wishlist-item-actions">
                                <button class="add-to-cart-btn" onclick="addToCart({id: ${product.id}})">
                                    <i class="fas fa-shopping-cart"></i> Adicionar ao Carrinho
                                </button>
                                <button class="remove-from-wishlist-btn" onclick="toggleWishlist(${product.id})">
                                    <i class="fas fa-trash"></i> Remover
                                </button>
                            </div>
                        </div>
                    `;
                    wishlistItems.appendChild(li);
                }
            });
        }
    }
    
    saveState();
}

// Função auxiliar para atualizar o display da wishlist
function updateWishlistDisplay() {
    if (wishlistModal && wishlistItems) {
        updateWishlist();
    }
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

    const shareText = `Minha Lista de Desejos:\n${wishlistItemsText.join('\n')}`;
    
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
        showToast('Lista de desejos copiada para a área de transferência!', 'success');
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

// Event Listeners for Wishlist (attach only if elements exist)
if (wishlistIcon && wishlistModal) {
    wishlistIcon.addEventListener('click', () => {
        wishlistModal.style.display = 'block';
        updateWishlistDisplay();
    });
}

if (shareWishlistBtn) {
    shareWishlistBtn.addEventListener('click', shareWishlist);
}

if (clearWishlistBtn) {
    clearWishlistBtn.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja limpar sua lista de desejos?')) {
            wishlist = [];
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            updateWishlistDisplay();
        }
    });
}

// Authentication Integration
// Use a fallback `auth` object and load the real module dynamically at runtime.
let auth = {
    isAuthenticated: false,
    currentUser: { name: 'Visitante' },
    logout: () => {
        auth.isAuthenticated = false;
        auth.currentUser = { name: 'Visitante' };
        updateAuthUI();
        localStorage.removeItem('auth');
        window.location.href = 'index.html';
    }
};

function updateAuthUI() {
    const userMenu = document.getElementById('user-menu');
    const loginButton = document.getElementById('login-button');

    // Load saved auth state
    try {
        const savedAuth = localStorage.getItem('auth');
        if (savedAuth) {
            const authData = JSON.parse(savedAuth);
            auth.isAuthenticated = authData.isAuthenticated;
            auth.currentUser = authData.currentUser;
        }
    } catch (e) {
        console.warn('Erro ao carregar estado de autenticação:', e);
    }

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
            const isIndex = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');
            const loginPath = isIndex ? 'pages/login.html' : '../pages/login.html';
            
            loginButton.innerHTML = `
                <a href="${loginPath}" class="btn-login">
                    <i class="fas fa-user"></i>
                    Entrar
                </a>
            `;
            loginButton.style.display = 'block';
        }
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOMContentLoaded - Iniciando setup da página');
    displayProducts();
    initializeSearchAndFilters();
    updateWishlistDisplay();
    console.log('Setup da página concluído');

    // Try to dynamically import the auth module if available (avoids parse errors
    // when this file is included without type="module"). If import fails, keep
    // using the fallback `auth` object.
    try {
        const module = await import('./auth.js');
        auth = module.default || module;
    } catch (e) {
        // If dynamic import isn't available or file not found, continue with fallback.
        console.warn('auth module could not be loaded dynamically:', e);
    }

    // Update UI now that auth is resolved (either real module or fallback)
    updateAuthUI();
});

/**
 * @function addToCart
 * @description Adiciona um produto com variante e quantidade ao carrinho.
 * @param {object} productInfo - Objeto contendo { id, size, metal, quantity }
 */
/**
 * @function addToCart
 * @description Adiciona um produto ao carrinho com tratamento de estados de loading
 * @param {object} productInfo - Objeto com informações do produto
 * @param {HTMLElement} [buttonElement] - Elemento do botão que disparou a ação (opcional)
 */
async function addToCart(productInfo, buttonElement) {
    // Se temos o botão, atualizamos seu estado
    if (buttonElement) {
        const originalContent = buttonElement.innerHTML;
        buttonElement.disabled = true;
        buttonElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adicionando...';
    }

    try {
        const product = getAllProducts().find(p => p.id === productInfo.id);
        if (!product) {
            throw new Error('Produto não encontrado');
        }

        // Cria uma chave única para a variante
        const variantKey = `${product.id}-${productInfo.size || ''}-${productInfo.metal || ''}`;

        // Simula uma pequena latência para feedback visual
        await new Promise(resolve => setTimeout(resolve, 300));

        // Tenta encontrar a variante exata no carrinho
        const existingItem = cart.find(item => item.variantKey === variantKey);
        const quantityToAdd = productInfo.quantity || 1;

        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + quantityToAdd;
            showToast(`+${quantityToAdd} de "${product.name}" adicionado ao carrinho!`, 'success');
        } else {
            cart.push({
                ...product,
                selectedSize: productInfo.size,
                selectedMetal: productInfo.metal,
                quantity: quantityToAdd,
                variantKey: variantKey
            });
            showToast(`"${product.name}" adicionado ao carrinho!`, 'success');
        }

        updateCart();

        // Adiciona classe de feedback visual temporário
        if (buttonElement) {
            buttonElement.classList.add('success-feedback');
            setTimeout(() => buttonElement.classList.remove('success-feedback'), 1000);
        }

    } catch (error) {
        logError('Erro ao adicionar ao carrinho', { error, productInfo });
        showToast('Erro ao adicionar produto ao carrinho. Tente novamente.', 'error');
    } finally {
        // Restaura o estado original do botão
        if (buttonElement) {
            buttonElement.disabled = false;
            buttonElement.innerHTML = '<i class="fas fa-shopping-cart"></i> Adicionar ao Carrinho';
        }
    }
}

async function toggleWishlist(productId, buttonElement) {
    if (buttonElement) {
        buttonElement.disabled = true;
        buttonElement.classList.add('button-loading');
    }

    try {
        const product = getAllProducts().find(p => p.id === productId);
        if (!product) {
            throw new Error('Produto não encontrado');
        }

        // Simula uma pequena latência para feedback visual
        await new Promise(resolve => setTimeout(resolve, 300));

        const index = wishlist.indexOf(productId);

        if (index > -1) {
            wishlist.splice(index, 1);
            showToast(`"${product.name}" removido da Wishlist.`, 'info');
            buttonElement?.classList.remove('in-wishlist');
        } else {
            wishlist.push(productId);
            showToast(`"${product.name}" adicionado à Wishlist!`, 'success');
            buttonElement?.classList.add('in-wishlist');
            
            if (buttonElement) {
                buttonElement.classList.add('success-feedback');
                setTimeout(() => buttonElement.classList.remove('success-feedback'), 1000);
            }
        }

        localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
        updateWishlist();

    } catch (error) {
        logError('Erro ao atualizar wishlist', { error, productId });
        showToast('Erro ao atualizar lista de desejos. Tente novamente.', 'error');
    } finally {
        if (buttonElement) {
            buttonElement.disabled = false;
            buttonElement.classList.remove('button-loading');
        }
    }
}

// Expose a small, safe public surface to pages that load modules in different orders.
// Muitas páginas incluem scripts com type="module" — para compatibilidade com
// os módulos atuais que não usam import/export, expomos as funções/objetos
// essenciais no objeto global `window`.
window.products = products;
window.addToCart = addToCart;
window.toggleWishlist = toggleWishlist;
// Expose internal collections for debugging/testing in the browser console.
window.cart = cart;
window.wishlist = wishlist;

/*
 * Função: closeCartModal
 * Versão: 1.0.0
 * Data: 2025-10-09
 * Descrição: Fecha o modal do carrinho de forma segura (verifica existência).
 */
// Adiciona função para atualizar quantidade
async function updateItemQuantity(variantKey, increase = true) {
    const item = cart.find(item => item.variantKey === variantKey);
    if (!item) return;

    const oldQuantity = item.quantity || 1;
    if (increase) {
        item.quantity = oldQuantity + 1;
        window.showToast?.(`Quantidade de "${item.name}" atualizada para ${item.quantity}`, 'success');
    } else if (oldQuantity > 1) {
        item.quantity = oldQuantity - 1;
        window.showToast?.(`Quantidade de "${item.name}" atualizada para ${item.quantity}`, 'info');
    }

    // Animate the quantity change
    const quantitySpan = document.querySelector(`[data-variant-key="${variantKey}"]`)?.parentElement?.querySelector('span');
    if (quantitySpan) {
        quantitySpan.style.animation = 'none';
        quantitySpan.offsetHeight; // Trigger reflow
        quantitySpan.style.animation = 'totalUpdate 0.3s ease';
    }

    updateCart();
}

// Função para abrir o modal do carrinho
function openCartModal() {
    const modal = document.getElementById('cart-modal');
    if (modal) {
        modal.style.display = 'flex';
        modal.style.opacity = '0';
        modal.style.backdropFilter = 'blur(0px)';
        setTimeout(() => {
            modal.style.opacity = '1';
            modal.style.backdropFilter = 'blur(4px)';
        }, 50);
    }
}

// Função para fechar o modal do carrinho
function closeCartModal() {
    const modal = document.getElementById('cart-modal');
    if (modal) {
        modal.style.opacity = '0';
        modal.style.backdropFilter = 'blur(0px)';
        setTimeout(() => {
            modal.style.display = 'none';
            modal.style.opacity = '1';
            modal.style.backdropFilter = 'blur(4px)';
        }, 300);
    }
}

// Remove item do carrinho
function removeFromCart(variantKey) {
    const itemIndex = cart.findIndex(item => item.variantKey === variantKey);
    if (itemIndex > -1) {
        const item = cart[itemIndex];
        cart.splice(itemIndex, 1);
        window.showToast?.(`"${item.name}" removido do carrinho`, 'info');
        updateCart();
    }
}

// Função para atualizar a visualização do carrinho
function updateCartView() {
    const cartContainer = document.getElementById('cart-items');
    if (!cartContainer) return;

    cartContainer.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const quantity = item.quantity || 1;
        const itemTotal = item.price * quantity;
        total += itemTotal;

        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.dataset.variantKey = item.variantKey;
        
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p>R$ ${item.price.toFixed(2)}</p>
                <div class="quantity-controls">
                    <button onclick="updateItemQuantity('${item.variantKey}', false)">-</button>
                    <span>${quantity}</span>
                    <button onclick="updateItemQuantity('${item.variantKey}', true)">+</button>
                </div>
                <button class="remove-item" onclick="removeFromCart('${item.variantKey}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        cartContainer.appendChild(itemElement);
    });

    const totalElement = document.getElementById('cart-total');
    if (totalElement) {
        totalElement.innerHTML = `Total: R$ ${total.toFixed(2)}`;
        totalElement.style.animation = 'none';
        totalElement.offsetHeight; // Trigger reflow
        totalElement.style.animation = 'totalUpdate 0.3s ease';
    }

    // Atualiza o contador do carrinho
    const cartCount = document.getElementById('cart-count');
    const itemCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    if (cartCount) {
        cartCount.textContent = itemCount;
        cartCount.style.display = itemCount > 0 ? 'block' : 'none';
    }
}

// Função principal para atualizar o carrinho
function updateCart() {
    updateCartView();
    localStorage.setItem('cart', JSON.stringify(cart));
}

window.openCartModal = openCartModal;
window.closeCartModal = closeCartModal;
window.updateItemQuantity = updateItemQuantity;
window.removeFromCart = removeFromCart;


// Função para processar o checkout
async function processCheckout() {
    const button = document.getElementById('checkout-btn');
    
    if (cart.length === 0) {
        window.showToast?.('Seu carrinho está vazio!', 'warning');
        return;
    }

    if (button) {
        button.disabled = true;
        button.classList.add('button-loading');
    }

    try {
        // Simula o processamento do pedido
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Limpa o carrinho
        cart = [];
        localStorage.removeItem('cart');
        updateCart();

        window.showToast?.('Pedido realizado com sucesso! Em breve você receberá mais informações por email.', 'success');
        closeCartModal();
    } catch (error) {
        logError('Erro ao processar pedido', { error });
        window.showToast?.('Erro ao processar pedido. Tente novamente.', 'error');
    } finally {
        if (button) {
            button.disabled = false;
            button.classList.remove('button-loading');
        }
    }
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
})