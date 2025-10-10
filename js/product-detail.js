
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
 * @description Carrega os dados do produto na página.
 */
function loadProductDetails() {
    // 1. Obter o ID do produto da URL
    const params = new URLSearchParams(window.location.search);
    const productId = parseInt(params.get('id'));
    const categoryKey = params.get('category') || 'featured';

    // **PROGRAMAÇÃO DEFENSIVA**: Verifica se o ID é válido e se o módulo products existe
    if (isNaN(productId) || typeof products === 'undefined') {
        document.getElementById('product-details-container').innerHTML = '<p class="text-danger">Produto não encontrado ou catálogo indisponível.</p>';
        return;
    }

    // 2. Buscar o produto no catálogo (exportado de script.js)
    const categoryProducts = products[categoryKey] || products.featured;
    currentProduct = categoryProducts.find(p => p.id === productId);

    if (!currentProduct) {
        document.getElementById('product-details-container').innerHTML = '<p class="text-danger">Produto não encontrado no catálogo.</p>';
        return;
    }

    // 3. Popular os detalhes
    const mainImage = document.getElementById('main-product-image');
    const nameEl = document.getElementById('product-name');
    const priceEl = document.getElementById('product-price');
    const descriptionEl = document.getElementById('product-description');
    const thumbnailContainer = document.querySelector('.thumbnail-container');

    // **PROGRAMAÇÃO DEFENSIVA**: Garante que os elementos existem antes de popular.
    if (mainImage) mainImage.src = currentProduct.image;
    if (nameEl) nameEl.textContent = currentProduct.name;
    if (priceEl) priceEl.textContent = `R$ ${currentProduct.price.toFixed(2).replace('.', ',')}`;
    if (descriptionEl) descriptionEl.textContent = currentProduct.description;

    // 4. Montar a galeria de miniaturas
    if (thumbnailContainer && currentProduct.images) {
        thumbnailContainer.innerHTML = '';
        currentProduct.images.forEach((imgSrc, index) => {
            const thumb = document.createElement('img');
            thumb.src = imgSrc;
            thumb.className = `thumbnail ${index === 0 ? 'active' : ''}`;
            thumb.dataset.src = imgSrc; // Usado para updateMainImage
            thumb.addEventListener('click', () => updateMainImage(imgSrc));
            thumbnailContainer.appendChild(thumb);
        });
    }

    // 5. Inicializar o DeepAR (só se o produto for do tipo Try-On)
    // Assumindo que DeepAR só deve inicializar se o container existir (DeepARConfig não for null)
    if (deepARConfig) {
        initDeepAR();
    }
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