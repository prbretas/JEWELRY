/**
 * @file js/product-detail.js
 * @module ProductDetail
 * @author Jewelry Team (prbretas)
 * @version 2.0.0
 * @date 2026-08-04
 * @description Lógica da página de detalhes do produto.
 * - Carregamento de produto por URL em todas as categorias (T3.1)
 * - Galeria Swiper com thumbnails (T3.2)
 * - Seleção de variante com evento productVariantChanged (T3.3)
 * - Estrutura HTML do modal Try-On com deepar-canvas (T3.4)
 * - Integração com módulo ARTryOn (T4.7)
 * - Visualizador 3D model-viewer (T5.1, T5.2)
 */

// Estado do módulo
let currentProduct = null;
let selectedSize    = null;
let selectedMetal   = 'yellow'; // default
let arInstance      = null;     // instância de ARTryOn (T4.7)
let mainSwiperRef   = null;

// =========================================================================
// T3.1 — Carregamento de produto por URL (busca em todas as categorias)
// =========================================================================

/**
 * @function loadProductDetails
 * @description Carrega produto por ?id= buscando em TODAS as categorias.
 * Trata ID inválido sem erros no console.
 */
function loadProductDetails() {
    const params    = new URLSearchParams(window.location.search);
    const productId = parseInt(params.get('id'));

    if (isNaN(productId) || typeof products === 'undefined') {
        showProductError('ID de produto inválido ou catálogo indisponível.');
        return;
    }

    // Buscar em todas as categorias
    let found = null;
    for (const key of Object.keys(products)) {
        const arr = products[key];
        if (Array.isArray(arr)) {
            const match = arr.find(p => p.id === productId);
            if (match) { found = match; break; }
        }
    }
    currentProduct = found;

    if (!currentProduct) {
        showProductError(`Produto #${productId} não encontrado.`);
        return;
    }

    // Breadcrumb
    const breadcrumb = document.getElementById('product-breadcrumb');
    if (breadcrumb) breadcrumb.textContent = currentProduct.name;
    const catLink = document.querySelector('.breadcrumb a:last-of-type');
    if (catLink && currentProduct.category) {
        const names = { aneis: 'Anéis', colares: 'Colares', brincos: 'Brincos', pulseiras: 'Pulseiras' };
        catLink.textContent = names[currentProduct.category] || currentProduct.category;
        catLink.href = `${currentProduct.category}.html`;
    }

    // DOM principal
    const nameEl = document.getElementById('product-name');
    const priceEl = document.getElementById('product-price');
    const descEl  = document.getElementById('product-description');
    if (nameEl)  nameEl.textContent  = currentProduct.name;
    if (priceEl) priceEl.textContent = `R$ ${currentProduct.price.toFixed(2).replace('.', ',')}`;
    if (descEl)  descEl.textContent  = currentProduct.description;
    document.title = `${currentProduct.name} - Joalheria Virtual`;

    // Specs
    const specsEl = document.getElementById('product-specs');
    if (specsEl && currentProduct.details) {
        specsEl.innerHTML = Object.entries(currentProduct.details)
            .filter(([, v]) => v)
            .map(([k, v]) => `<li><strong>${k[0].toUpperCase() + k.slice(1)}:</strong> ${v}</li>`)
            .join('');
    }

    // Tamanhos
    const sizeOptEl = document.getElementById('size-options');
    if (sizeOptEl) {
        if (Array.isArray(currentProduct.sizes) && currentProduct.sizes.length > 0) {
            sizeOptEl.innerHTML = currentProduct.sizes
                .map(s => `<button class="size-option btn btn-ghost" data-size="${s}">${s}</button>`)
                .join('');
        } else {
            sizeOptEl.closest('.size-selection')?.style.setProperty('display', 'none');
        }
    }

    // Botões de metal: mostrar só os disponíveis
    document.querySelectorAll('.metal-option').forEach(btn => {
        const m = btn.dataset.metal;
        btn.style.display = (currentProduct.metals && currentProduct.metals[m]) ? '' : 'none';
    });

    // Definir metal padrão (primeiro disponível)
    const firstMetal = currentProduct.metals ? Object.keys(currentProduct.metals)[0] : 'yellow';
    selectedMetal = firstMetal || 'yellow';

    // Marcar o botão de metal padrão como ativo
    const defaultMetalBtn = document.querySelector(`.metal-option[data-metal="${selectedMetal}"]`);
    if (defaultMetalBtn) defaultMetalBtn.classList.add('active');

    // Galeria
    initializeGallery(currentProduct);

    // Botão 3D
    const btn3d = document.getElementById('view-3d');
    if (btn3d) {
        const has3d = currentProduct.models3d && Object.keys(currentProduct.models3d).length > 0;
        btn3d.style.display = has3d ? '' : 'none';
    }

    // Botão Try-On
    const btnTryOn = document.getElementById('try-on');
    if (btnTryOn) {
        const hasAR = currentProduct.arEffects && Object.keys(currentProduct.arEffects).length > 0;
        btnTryOn.style.display = hasAR ? '' : 'none';
    }
}

/**
 * @function showProductError
 */
function showProductError(message) {
    const container = document.querySelector('.product-container') || document.querySelector('main');
    if (container) {
        container.innerHTML = `
            <div class="product-not-found" style="text-align:center;padding:4rem 2rem;">
                <i class="fas fa-search" style="font-size:3rem;color:var(--accent-color);margin-bottom:1rem;"></i>
                <h2>Produto não encontrado</h2>
                <p>${message}</p>
                <a href="../index.html" class="btn btn-primary" style="margin-top:1rem;">
                    <i class="fas fa-arrow-left"></i> Voltar ao Catálogo
                </a>
            </div>
        `;
    }
}

// =========================================================================
// T3.2 — Galeria Swiper
// =========================================================================

/**
 * @function initializeGallery
 */
function initializeGallery(product) {
    const images = (product.images && product.images.length) ? product.images : [product.image];
    const placeholder = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22%3E%3Crect fill=%22%23f5f0e8%22 width=%22400%22 height=%22400%22/%3E%3Ctext fill=%22%23c4a86e%22 font-family=%22Arial%22 font-size=%2260%22 text-anchor=%22middle%22 x=%22200%22 y=%22220%22%3E✨%3C/text%3E%3C/svg%3E';

    const mainWrapper  = document.querySelector('.product-main-slider .swiper-wrapper');
    const thumbWrapper = document.querySelector('.product-thumbs .swiper-wrapper');

    if (mainWrapper) {
        mainWrapper.innerHTML = images.map(src => `
            <div class="swiper-slide">
                <img src="${src}" alt="${product.name}" loading="lazy"
                     onerror="this.onerror=null;this.src='${placeholder}'">
            </div>`).join('');
    }

    if (thumbWrapper) {
        thumbWrapper.innerHTML = images.map(src => `
            <div class="swiper-slide">
                <img src="${src}" alt="${product.name}" loading="lazy"
                     onerror="this.onerror=null;this.src='${placeholder}'">
            </div>`).join('');
    }

    if (typeof Swiper !== 'undefined' && mainWrapper) {
        const thumbsSwiper = thumbWrapper ? new Swiper('.product-thumbs', {
            spaceBetween: 8,
            slidesPerView: 4,
            watchSlidesProgress: true,
        }) : null;

        mainSwiperRef = new Swiper('.product-main-slider', {
            spaceBetween: 10,
            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
            thumbs: thumbsSwiper ? { swiper: thumbsSwiper } : undefined,
        });
    }
}

// =========================================================================
// T3.3 — Seleção de variante com evento productVariantChanged
// =========================================================================

/**
 * @function initializeVariantSelection
 * @description Configura botões de metal e tamanho.
 * Ao mudar variante dispara evento customizado 'productVariantChanged'.
 */
function initializeVariantSelection() {
    // --- Botões de metal ---
    const metalButtons = document.querySelectorAll('.metal-option');
    if (metalButtons.length > 0) {
        metalButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                metalButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedMetal = btn.dataset.metal;

                // Atualizar imagem principal da galeria (T3.3 criterio 4)
                if (currentProduct && currentProduct.metals && currentProduct.metals[selectedMetal]) {
                    updateGalleryForMetal(currentProduct.metals[selectedMetal]);
                }

                // Disparar evento customizado (T3.3 criterio 2)
                dispatchVariantChanged();
            });
        });
    }

    // --- Botões de tamanho ---
    const sizeButtons = document.querySelectorAll('.size-option');
    if (sizeButtons.length > 0) {
        selectedSize = sizeButtons[0]?.dataset.size || null;
        sizeButtons[0]?.classList.add('active');

        sizeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                sizeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedSize = btn.dataset.size;
                dispatchVariantChanged();
            });
        });
    }

    // --- Controles de quantidade (T3.3 criterio 3) ---
    const qtyInput    = document.getElementById('quantity');
    const qtyDecrease = document.getElementById('decrease-quantity');
    const qtyIncrease = document.getElementById('increase-quantity');

    if (qtyDecrease && qtyInput) {
        qtyDecrease.addEventListener('click', () => {
            const val = parseInt(qtyInput.value) || 1;
            if (val > 1) qtyInput.value = val - 1;
        });
    }
    if (qtyIncrease && qtyInput) {
        qtyIncrease.addEventListener('click', () => {
            const val = parseInt(qtyInput.value) || 1;
            qtyInput.value = val + 1;
        });
    }
    if (qtyInput) {
        qtyInput.addEventListener('change', () => {
            const val = parseInt(qtyInput.value);
            // CT-VARIANT-02: quantidade não pode ser < 1
            if (isNaN(val) || val < 1) qtyInput.value = 1;
        });
    }

    // --- Botão Adicionar ao Carrinho ---
    const addToCartBtn = document.getElementById('add-to-cart');
    if (addToCartBtn && typeof addToCart === 'function') {
        addToCartBtn.addEventListener('click', () => {
            if (!currentProduct) return;
            const qty = Math.max(1, parseInt(document.getElementById('quantity')?.value) || 1);
            addToCart({
                id:       currentProduct.id,
                size:     selectedSize   || '',
                metal:    selectedMetal  || '',
                quantity: qty
            });
        });
    }
}

/**
 * @function dispatchVariantChanged
 * @description Dispara evento customizado com metal e tamanho atuais.
 * Ouvido por AR module, 3D module e galeria.
 */
function dispatchVariantChanged() {
    document.dispatchEvent(new CustomEvent('productVariantChanged', {
        detail: { metal: selectedMetal, size: selectedSize, product: currentProduct }
    }));
}

/**
 * @function updateGalleryForMetal
 * @description Atualiza o slide principal do Swiper para a imagem do metal selecionado.
 */
function updateGalleryForMetal(imageUrl) {
    if (!mainSwiperRef) return;
    const slides = document.querySelectorAll('.product-main-slider .swiper-slide img');
    // Tenta encontrar o slide que corresponde ao metal e navegar para ele
    slides.forEach((img, idx) => {
        if (img.src.includes(imageUrl.split('/').pop())) {
            mainSwiperRef.slideTo(idx);
        }
    });
}

// =========================================================================
// T4.7 — Modais Try-On e 3D (abertura, fechamento, listeners)
// =========================================================================

/**
 * @function initializeModals
 * @description Configura os botões de abrir/fechar modais Try-On e 3D.
 */
function initializeModals() {
    // Try-On modal
    const tryOnBtn    = document.getElementById('try-on');
    const tryOnModal  = document.getElementById('try-on-modal');
    const closeButtons = document.querySelectorAll('#try-on-modal .close, #viewer-3d-modal .close');

    if (tryOnBtn && tryOnModal) {
        tryOnBtn.addEventListener('click', () => openTryOnModal());
    }

    // 3D viewer modal
    const btn3d      = document.getElementById('view-3d');
    const modal3d    = document.getElementById('viewer-3d-modal');
    if (btn3d && modal3d) {
        btn3d.addEventListener('click', () => {
            // Fechar Try-On se aberto (não rodar os dois simultâneos)
            closeTryOnModal();
            open3DModal();
        });
    }

    // Botões de fechar modais
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            closeTryOnModal();
            close3DModal();
        });
    });

    // Fechar ao clicar fora
    window.addEventListener('click', (e) => {
        if (e.target === tryOnModal)  closeTryOnModal();
        if (e.target === modal3d)     close3DModal();
    });

    // Fechar com Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeTryOnModal();
            close3DModal();
        }
    });
}

function openTryOnModal() {
    const modal = document.getElementById('try-on-modal');
    if (modal) {
        modal.style.display = 'flex';
        // Inicializar AR se disponível (T4.7 — ARTryOn)
        if (typeof ARTryOn !== 'undefined' && currentProduct?.arEffects) {
            startARTryOn();
        }
    }
}

function closeTryOnModal() {
    const modal = document.getElementById('try-on-modal');
    if (modal) {
        modal.style.display = 'none';
        // Destruir sessão AR ao fechar (libera câmera) — T4.7
        if (arInstance) {
            arInstance.destroy();
            arInstance = null;
        }
    }
}

function open3DModal() {
    const modal = document.getElementById('viewer-3d-modal');
    if (!modal || !currentProduct) return;
    modal.style.display = 'flex';
    // Inicializar model-viewer se produto tem 3D (T5.1)
    initialize3DViewer();
}

function close3DModal() {
    const modal = document.getElementById('viewer-3d-modal');
    if (modal) modal.style.display = 'none';
}

// =========================================================================
// T5.1 — Visualizador 3D com model-viewer
// =========================================================================

/**
 * @function initialize3DViewer
 * @description Insere <model-viewer> no container quando produto tem models3d.
 */
function initialize3DViewer() {
    const container = document.getElementById('model-viewer-container');
    if (!container || !currentProduct?.models3d) return;

    const modelSrc = currentProduct.models3d[selectedMetal] || Object.values(currentProduct.models3d)[0];
    if (!modelSrc) return;

    // Remover viewer anterior se existir
    container.innerHTML = '';

    // Inserir model-viewer dinamicamente
    const viewer = document.createElement('model-viewer');
    viewer.id            = 'jewelry-3d-viewer';
    viewer.setAttribute('src', modelSrc);
    viewer.setAttribute('alt', `${currentProduct.name} em 3D`);
    viewer.setAttribute('auto-rotate', '');
    viewer.setAttribute('camera-controls', '');
    viewer.setAttribute('shadow-intensity', '1');
    viewer.setAttribute('exposure', '0.75');
    viewer.setAttribute('environment-image', 'neutral');
    viewer.setAttribute('ar', '');
    viewer.setAttribute('loading', 'lazy');
    viewer.style.width  = '100%';
    viewer.style.height = '400px';

    container.appendChild(viewer);

    // Ouvir productVariantChanged para atualizar modelo (T5.2)
    document.addEventListener('productVariantChanged', (e) => {
        const { metal } = e.detail;
        if (currentProduct?.models3d?.[metal]) {
            viewer.setAttribute('src', currentProduct.models3d[metal]);
        }
    });
}

// =========================================================================
// T4.7 — Integração ARTryOn
// =========================================================================

/**
 * @function startARTryOn
 * @description Instancia ARTryOn e inicia a sessão de prova virtual.
 * Depende do módulo js/ar-tryon.js (T4.1).
 */
async function startARTryOn() {
    if (typeof ARTryOn === 'undefined') {
        // AR module não carregado ainda — exibir fallback
        showARFallback('Módulo AR não carregado.');
        return;
    }

    const canvas  = document.getElementById('deepar-canvas');
    const config  = getARConfig();

    if (!canvas || !config) {
        showARFallback('Configuração de AR indisponível.');
        return;
    }

    try {
        arInstance = new ARTryOn(canvas.closest('#ar-viewport'), config);

        arInstance.on('ready', () => {
            document.getElementById('camera-permission-ui')?.style.setProperty('display', 'none');
            document.getElementById('switch-camera')?.style.setProperty('display', '');
        });

        arInstance.on('cameraPermissionDenied', () => {
            showCameraPermissionUI();
        });

        arInstance.on('error', (code) => {
            showARFallback(`Erro AR: ${code}`);
        });

        await arInstance.init();

        // Ouvir troca de variante para atualizar efeito AR (T4.7 criterio 3)
        document.addEventListener('productVariantChanged', async (e) => {
            const { metal } = e.detail;
            const effectPath = currentProduct?.arEffects?.[metal];
            if (arInstance && effectPath) {
                await arInstance.switchEffect(effectPath);
            }
        });

        // Botão tirar foto (T4.6)
        const photoBtn = document.getElementById('take-photo');
        if (photoBtn) {
            photoBtn.addEventListener('click', async () => {
                if (!arInstance) return;
                const dataUrl = await arInstance.takeScreenshot();
                showPhotoPreview(dataUrl);
            });
        }

        // Botão trocar câmera (T4.5)
        const switchBtn = document.getElementById('switch-camera');
        if (switchBtn) {
            switchBtn.addEventListener('click', () => arInstance?.switchCamera());
        }

    } catch (err) {
        showARFallback(err.message);
    }
}

/**
 * @function getARConfig
 * @description Monta a configuração para ARTryOn baseada no produto atual.
 */
function getARConfig() {
    if (!currentProduct?.arEffects) return null;

    const categoryMap = {
        aneis:     'ring',
        pulseiras: 'bracelet',
        colares:   'necklace',
        brincos:   'earring'
    };

    return {
        licenseKey:      typeof DEEPAR_LICENSE_KEY !== 'undefined' ? DEEPAR_LICENSE_KEY : '',
        productCategory: categoryMap[currentProduct.category] || 'ring',
        effects:         currentProduct.arEffects,
        fallbackImage:   currentProduct.image
    };
}

/**
 * @function showCameraPermissionUI
 * @description Exibe UI de permissão de câmera negada com instruções por browser.
 */
function showCameraPermissionUI() {
    const ui = document.getElementById('camera-permission-ui');
    if (!ui) return;
    ui.style.display = 'flex';

    // Detectar browser para instrução específica
    const ua = navigator.userAgent.toLowerCase();
    let helpText = '';
    if (ua.includes('chrome'))  helpText = 'No Chrome: clique no 🔒 na barra de endereço → Câmera → Permitir.';
    else if (ua.includes('firefox')) helpText = 'No Firefox: clique no ícone de câmera na barra de endereço.';
    else if (ua.includes('safari'))  helpText = 'No Safari: vá em Ajustes > Safari > Câmera > Permitir.';
    else helpText = 'Ative a câmera nas configurações do seu navegador.';

    const helpEl = document.getElementById('camera-help-text');
    if (helpEl) helpEl.textContent = helpText;

    // Botão retry
    const retryBtn = document.getElementById('request-camera-btn');
    if (retryBtn) {
        retryBtn.onclick = async () => {
            ui.style.display = 'none';
            await startARTryOn();
        };
    }
}

/**
 * @function showARFallback
 * @description Exibe imagem estática como fallback quando AR falha.
 */
function showARFallback(reason) {
    if (typeof window.showToast === 'function') {
        window.showToast('Prova virtual não disponível no momento.', 'warning');
    }
    const fallback = document.getElementById('ar-fallback');
    const fallbackImg = document.getElementById('ar-fallback-image');
    if (fallback) fallback.style.display = 'flex';
    if (fallbackImg && currentProduct?.image) fallbackImg.src = currentProduct.image;
}

/**
 * @function showPhotoPreview
 * @description Exibe preview da foto capturada com botões de download e compartilhamento.
 */
function showPhotoPreview(dataUrl) {
    // Criar modal de preview
    const existing = document.getElementById('photo-preview-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id        = 'photo-preview-modal';
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `
        <div class="modal-content" style="max-width:400px;text-align:center;">
            <button class="close" aria-label="Fechar preview">&times;</button>
            <h3>Sua foto com a joia!</h3>
            <img src="${dataUrl}" alt="Foto com joia virtual" style="width:100%;border-radius:8px;margin:1rem 0;">
            <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
                <a href="${dataUrl}" download="joia-tryon-${Date.now()}.png" class="btn btn-primary">
                    <i class="fas fa-download"></i> Download
                </a>
                <button id="share-photo-btn" class="btn btn-secondary">
                    <i class="fas fa-share-alt"></i> Compartilhar
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('.close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    // Compartilhar via Web Share API
    const shareBtn = modal.querySelector('#share-photo-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            if (navigator.share) {
                try {
                    const blob = await (await fetch(dataUrl)).blob();
                    const file = new File([blob], 'joia-tryon.png', { type: 'image/png' });
                    await navigator.share({ files: [file], title: `${currentProduct?.name} — Try-On Virtual` });
                } catch { /* usuário cancelou */ }
            } else {
                await navigator.clipboard.writeText(window.location.href);
                window.showToast?.('Link copiado para compartilhamento!', 'success');
            }
        });
    }
}

// =========================================================================
// Accordion
// =========================================================================

function initializeAccordion() {
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            if (content) content.classList.toggle('active');
            const icon = header.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-chevron-down');
                icon.classList.toggle('fa-chevron-up');
            }
        });
    });
}

// =========================================================================
// Inicialização
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
    loadProductDetails();
    initializeVariantSelection();
    initializeModals();
    initializeAccordion();
});
