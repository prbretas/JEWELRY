
/**
 * @file js/product-detail.js
 * @module ProductDetail
 * @author Jewelry Team (prbretas)
 * @version 1.0.3
 * @date 2025-10-09
 * @description Lógica da página de detalhes do produto — carregamento de dados, galeria, seleção de tamanho/metal, integração com DeepAR (virtual try-on), controle de modais.
 *
 * Histórico de alterações:
 * - 1.0.3 (09/10/2025 14:00): Padronização de comentários e documentação JSDoc.
 * - 1.0.2: Programação defensiva e tratamento de erros DeepAR.
 * - 1.0.1: Ajustes de galeria e integração de opções.
 * - 1.0.0: Implementação inicial da página de detalhes.
 */

/*
 * Bloco: Configuração do DeepAR
 */
// **PROGRAMAÇÃO DEFENSIVA**: Verifica se o canvas existe antes de criar a config.
const deepARCanvas = document.getElementById('deepar-container');

const deepARConfig = deepARCanvas ? {
    licenseKey: 'your_deepar_license_key_here', // Substitua pela sua chave DeepAR válida
    canvas: deepARCanvas,
    effect: '../assets/effects/jewelry.deepar', // Caminho do efeito DeepAR (arquivo .deepar)
} : null; // Configuração será null se o elemento não existir

// Estado compartilhado do módulo
let deepAR = null;
let currentProduct = null;
let selectedSize = null;
let selectedMetal = null;


// =========================================================================
// Bloco: Viewer 3D (TODO)
// =========================================================================
// TODO: Para implementar o visualizador 3D de joias, utilize uma biblioteca como model-viewer (Web Components) ou Three.js.
// Exemplo de uso futuro:
// <model-viewer src="/assets/models/joia.glb" ar auto-rotate camera-controls></model-viewer>
// Ou inicialização de cena Three.js para visualização customizada.
// Certifique-se de validar o carregamento do modelo e tratar erros de renderização.

/**
 * @function initDeepAR
 * @description Inicializa a biblioteca DeepAR e carrega o efeito
 * @async
 */
async function initDeepAR() {
    // **PROGRAMAÇÃO DEFENSIVA**: Não tenta inicializar se a configuração é nula
    if (!deepARConfig) {
        console.warn('DeepAR container not found. Virtual try-on skipped.');
        return;
    }

    const tryOnBtn = document.getElementById('try-on-toggle');
    if (tryOnBtn) {
        tryOnBtn.disabled = true;
        tryOnBtn.textContent = 'Carregando Try-On...';
        tryOnBtn.classList.add('button-loading');
    }

    try {
        console.log('Initializing DeepAR with config:', deepARConfig);
        // Tenta inicializar
        deepAR = await DeepAR.initialize(deepARConfig);

        // Se inicializado com sucesso
        console.log('DeepAR initialized successfully. Loading effect...');
        await deepAR.switchEffect(deepARConfig.effect);

        if (tryOnBtn) {
            tryOnBtn.textContent = 'Iniciar Try-On Virtual';
            tryOnBtn.classList.remove('button-loading');
            tryOnBtn.disabled = false;
        }

        // Adiciona listener para alternar a visualização
        if (tryOnBtn) {
            tryOnBtn.addEventListener('click', () => {
                // Lógica para mostrar/esconder o modal/overlay do DeepAR
                const deeparModal = document.getElementById('deepar-modal');
                deeparModal?.classList.toggle('open');
                deeparModal?.setAttribute('aria-hidden', deeparModal.classList.contains('open') ? 'false' : 'true');
            });
        }

    } catch (error) {
        console.error('Failed to initialize or load DeepAR effect:', error);
        // **TRATAMENTO DE ERRO COM FEEDBACK**: Mostra toast de erro
        if (typeof showToast === 'function') {
            showToast('Erro ao carregar o Try-On Virtual. Verifique as permissões da câmera e a chave de licença.', 'error');
        }
        if (tryOnBtn) {
            tryOnBtn.textContent = 'Try-On Indisponível';
            tryOnBtn.classList.remove('button-loading');
            tryOnBtn.disabled = true;
            tryOnBtn.style.backgroundColor = 'gray'; // Feedback visual de falha
        }
    }
}

// =========================================================================
// Bloco: Galeria de Imagens e UI
// =========================================================================

/**
 * @function updateMainImage
 * @description Altera a imagem principal e a aba ativa da galeria
 * @param {string} src - URL da nova imagem
 */
function updateMainImage(src) {
    const mainImage = document.getElementById('main-product-image');
    if (!mainImage) return; // **PROGRAMAÇÃO DEFENSIVA**

    mainImage.src = src;

    // Atualiza a aba ativa (destaque da miniatura)
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach(thumb => {
        if (thumb.dataset.src === src) {
            thumb.classList.add('active');
        } else {
            thumb.classList.remove('active');
        }
    });
}

/**
 * @function loadProductDetails
 * @description Carrega os dados do produto na página buscando em todas as categorias.
 * Fix T3.1: busca em todas as categorias, não só 'featured'. Trata ID inválido sem erros no console.
 */
function loadProductDetails() {
    // 1. Obter o ID do produto da URL
    const params = new URLSearchParams(window.location.search);
    const productId = parseInt(params.get('id'));

    // **PROGRAMAÇÃO DEFENSIVA**: Verifica se o ID é válido e se o módulo products existe
    if (isNaN(productId) || typeof products === 'undefined') {
        showProductError('Produto não encontrado. ID inválido ou catálogo indisponível.');
        return;
    }

    // 2. Buscar o produto em TODAS as categorias (Fix T3.1)
    let found = null;
    const allCategories = Object.keys(products);
    for (const key of allCategories) {
        const arr = products[key];
        if (Array.isArray(arr)) {
            const match = arr.find(p => p.id === productId);
            if (match) { found = match; break; }
        }
    }
    currentProduct = found;

    if (!currentProduct) {
        showProductError(`Produto #${productId} não encontrado. <a href="../index.html">Voltar ao catálogo</a>`);
        return;
    }

    // 3. Popular breadcrumb dinamicamente
    const breadcrumb = document.getElementById('product-breadcrumb');
    if (breadcrumb) breadcrumb.textContent = currentProduct.name;

    const categoryLink = document.querySelector('.breadcrumb a:last-of-type');
    if (categoryLink && currentProduct.category) {
        const categoryNames = {
            aneis: 'Anéis', colares: 'Colares', brincos: 'Brincos', pulseiras: 'Pulseiras'
        };
        categoryLink.textContent = categoryNames[currentProduct.category] || currentProduct.category;
        categoryLink.href = `${currentProduct.category}.html`;
    }

    // 4. Popular os detalhes no DOM
    const nameEl = document.getElementById('product-name');
    const priceEl = document.getElementById('product-price');
    const descriptionEl = document.getElementById('product-description');

    if (nameEl) nameEl.textContent = currentProduct.name;
    if (priceEl) priceEl.textContent = `R$ ${currentProduct.price.toFixed(2).replace('.', ',')}`;
    if (descriptionEl) descriptionEl.textContent = currentProduct.description;

    // Atualizar title da página
    document.title = `${currentProduct.name} - Joalheria Virtual`;

    // 5. Popular especificações
    const specsEl = document.getElementById('product-specs');
    if (specsEl && currentProduct.details) {
        specsEl.innerHTML = Object.entries(currentProduct.details)
            .filter(([, v]) => v)
            .map(([k, v]) => `<li><strong>${k.charAt(0).toUpperCase() + k.slice(1)}:</strong> ${v}</li>`)
            .join('');
    }

    // 6. Popular opções de tamanho
    const sizeOptionsEl = document.getElementById('size-options');
    if (sizeOptionsEl && Array.isArray(currentProduct.sizes) && currentProduct.sizes.length > 0) {
        sizeOptionsEl.innerHTML = currentProduct.sizes
            .map(s => `<button class="size-option btn btn-ghost" data-size="${s}">${s}</button>`)
            .join('');
    } else if (sizeOptionsEl) {
        sizeOptionsEl.closest('.size-selection')?.style.setProperty('display', 'none');
    }

    // 7. Configurar botões de metal: mostrar apenas os disponíveis
    const metalButtons = document.querySelectorAll('.metal-option');
    metalButtons.forEach(btn => {
        const metal = btn.dataset.metal;
        if (currentProduct.metals && currentProduct.metals[metal]) {
            btn.style.display = '';
        } else {
            btn.style.display = 'none';
        }
    });

    // 8. Galeria — inicializar Swiper com imagens do produto (T3.2 - básico)
    initializeGallery(currentProduct);

    // 9. Botão 3D: mostrar apenas se produto tem model3d
    const btn3d = document.getElementById('view-3d');
    if (btn3d) {
        const has3d = currentProduct.models3d && Object.keys(currentProduct.models3d).length > 0;
        btn3d.style.display = has3d ? '' : 'none';
    }

    // 10. Inicializar DeepAR se produto tem arEffects
    const hasar = currentProduct.arEffects && Object.keys(currentProduct.arEffects).length > 0;
    if (hasar) {
        const tryOnBtn = document.getElementById('try-on');
        if (tryOnBtn) tryOnBtn.style.display = '';
    }
}

/**
 * @function showProductError
 * @description Exibe mensagem de erro quando produto não é encontrado, sem lançar erros no console.
 */
function showProductError(message) {
    const container = document.querySelector('.product-container') || document.querySelector('main');
    if (container) {
        container.innerHTML = `
            <div class="product-not-found" style="text-align:center; padding:4rem 2rem;">
                <i class="fas fa-search" style="font-size:3rem; color:var(--accent-color); margin-bottom:1rem;"></i>
                <h2>Produto não encontrado</h2>
                <p>${message}</p>
                <a href="../index.html" class="btn btn-primary" style="margin-top:1rem;">
                    <i class="fas fa-arrow-left"></i> Voltar ao Catálogo
                </a>
            </div>
        `;
    }
}

/**
 * @function initializeGallery
 * @description Inicializa a galeria de imagens do produto com Swiper.
 * Fallback: se Swiper não disponível, usa imagem simples.
 */
function initializeGallery(product) {
    const images = product.images?.length ? product.images : [product.image];

    // Inicializar slide principal
    const mainWrapper = document.querySelector('.product-main-slider .swiper-wrapper');
    if (mainWrapper) {
        mainWrapper.innerHTML = images.map(src => `
            <div class="swiper-slide">
                <img src="${src}" alt="${product.name}" loading="lazy"
                     onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22%3E%3Crect fill=%22%23f5f0e8%22 width=%22400%22 height=%22400%22/%3E%3Ctext fill=%22%23c4a86e%22 font-family=%22Arial%22 font-size=%2260%22 text-anchor=%22middle%22 x=%22200%22 y=%22220%22%3E✨%3C/text%3E%3C/svg%3E';">
            </div>
        `).join('');
    }

    // Inicializar thumbnails
    const thumbWrapper = document.querySelector('.product-thumbs .swiper-wrapper');
    if (thumbWrapper) {
        thumbWrapper.innerHTML = images.map(src => `
            <div class="swiper-slide">
                <img src="${src}" alt="${product.name}" loading="lazy">
            </div>
        `).join('');
    }

    // Inicializar Swiper se disponível
    if (typeof Swiper !== 'undefined' && mainWrapper) {
        // Thumbnails Swiper
        const thumbsSwiper = thumbWrapper ? new Swiper('.product-thumbs', {
            spaceBetween: 8,
            slidesPerView: 4,
            watchSlidesProgress: true,
        }) : null;

        // Main Swiper
        new Swiper('.product-main-slider', {
            spaceBetween: 10,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            thumbs: thumbsSwiper ? { swiper: thumbsSwiper } : undefined,
        });
    }

// =========================================================================
// Bloco: Seleção de Opções e Adicionar ao Carrinho
// =========================================================================

/**
 * @function initializeOptions
 * @description Configura os event listeners para as opções de tamanho e metal.
 */
function initializeOptions() {
    const sizeButtons = document.querySelectorAll('.size-option');
    const metalButtons = document.querySelectorAll('.metal-option');
    const addToCartBtn = document.getElementById('add-to-cart-btn');

    // **PROGRAMAÇÃO DEFENSIVA**: Envolver listeners em verificações
    if (sizeButtons.length > 0) {
        selectedSize = sizeButtons[0].dataset.size; // Define um padrão
        sizeButtons[0].classList.add('active');

        sizeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                sizeButtons.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                selectedSize = e.currentTarget.dataset.size;
            });
        });
    }

    if (metalButtons.length > 0) {
        selectedMetal = metalButtons[0].dataset.metal; // Define um padrão
        metalButtons[0].classList.add('active');

        metalButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                metalButtons.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                selectedMetal = e.currentTarget.dataset.metal;
            });
        });
    }

    // Listener para o botão Adicionar ao Carrinho
    if (addToCartBtn && typeof addToCart === 'function') {
        addToCartBtn.addEventListener('click', () => {
            if (!selectedSize && sizeButtons.length > 0) {
                // Apenas alerta se houver botões de tamanho mas nenhum selecionado
                showToast('Por favor, selecione um tamanho', 'warning');
                return;
            }

            const quantityInput = document.getElementById('quantity');
            const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
            // **VALIDAÇÃO DE ENTRADA**: Garante que a quantidade é válida
            if (isNaN(quantity) || quantity <= 0) {
                showToast('A quantidade deve ser um número positivo.', 'error');
                return;
            }

            // Garante que currentProduct existe
            if (!currentProduct) return;

            const productToAdd = {
                ...currentProduct,
                selectedSize: selectedSize || 'Padrão', // Default para evitar null
                selectedMetal: selectedMetal || 'Padrão',
                quantity
            };

            // Simula um breve loading
            addToCartBtn.classList.add('button-loading');
            addToCartBtn.disabled = true;

            setTimeout(() => {
                addToCartBtn.classList.remove('button-loading');
                addToCartBtn.disabled = false;
                // Adiciona ao carrinho usando a função global addToCart
                addToCart(productToAdd);
            }, 500);
        });
    }
}

// =========================================================================
// Bloco: Accordion functionality
// =========================================================================

// Accordion functionality
const accordionHeaders = document.querySelectorAll('.accordion-header');

// **PROGRAMAÇÃO DEFENSIVA**: Envolver em verificação para evitar erro em páginas sem accordion
if (accordionHeaders.length > 0) {
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            // **PROGRAMAÇÃO DEFENSIVA**: Checa o content
            if (content) content.classList.toggle('active');

            const icon = header.querySelector('i');
            // **PROGRAMAÇÃO DEFENSIVA**: Checa o ícone
            if (icon) {
                icon.classList.toggle('fa-chevron-down');
                icon.classList.toggle('fa-chevron-up');
            }
        });
    });
}


/*
 * Inicialização da página
 */
document.addEventListener('DOMContentLoaded', function() {
    loadProductDetails();
    initializeOptions();
    // A inicialização do DeepAR é chamada dentro de loadProductDetails
});