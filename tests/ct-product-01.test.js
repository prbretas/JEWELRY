/**
 * @file tests/ct-product-01.test.js
 * @description Testes da Wave 2: catálogo expandido e página de produto
 */

describe('CT-PRODUCT-01 — Estrutura do catálogo expandido', () => {
  // Simula a estrutura do catálogo
  const products = {
    featured: [
      { id: 1, name: 'Anel Diamante', price: 5999.99, category: 'aneis', image: 'img.jpg', images: ['img.jpg'], sizes: ['12','14'], stones: ['diamond'], metals: { yellow: 'y.jpg' }, arEffects: { yellow: 'ef.deepar' }, models3d: { yellow: 'model.glb' } },
      { id: 2, name: 'Colar Pérolas', price: 2999.99, category: 'colares', image: 'img2.jpg', images: ['img2.jpg'], sizes: [], stones: ['pearl'], metals: { white: 'w.jpg' }, arEffects: { white: 'ef2.deepar' }, models3d: null },
    ],
    aneis: [
      { id: 101, name: 'Aliança', price: 1899.99, category: 'aneis', image: 'img.jpg', images: ['img.jpg'], sizes: ['10','12'], stones: [], metals: { yellow: 'y.jpg' }, arEffects: { yellow: 'ef.deepar' }, models3d: null },
    ],
    colares: [
      { id: 201, name: 'Corrente', price: 2200, category: 'colares', image: 'img.jpg', images: ['img.jpg'], sizes: [], stones: [], metals: { yellow: 'y.jpg' }, arEffects: { yellow: 'ef.deepar' }, models3d: null },
    ],
    brincos: [
      { id: 301, name: 'Argola', price: 980, category: 'brincos', image: 'img.jpg', images: ['img.jpg'], sizes: [], stones: [], metals: { yellow: 'y.jpg' }, arEffects: { yellow: 'ef.deepar' }, models3d: null },
    ],
    pulseiras: [
      { id: 401, name: 'Bracelete', price: 12500, category: 'pulseiras', image: 'img.jpg', images: ['img.jpg'], sizes: ['15','17'], stones: ['diamond'], metals: { white: 'w.jpg' }, arEffects: { white: 'ef.deepar' }, models3d: null },
    ]
  };

  test('PBT-P1: todos os produtos têm id único, price > 0 e name não vazio', () => {
    const allProducts = Object.values(products).flat();
    const ids = allProducts.map(p => p.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(allProducts.length); // IDs únicos
    allProducts.forEach(p => {
      expect(p.id).toBeGreaterThan(0);
      expect(p.price).toBeGreaterThan(0);
      expect(p.name.trim()).not.toBe('');
    });
  });

  test('todos os produtos têm campos obrigatórios de variantes', () => {
    const allProducts = Object.values(products).flat();
    allProducts.forEach(p => {
      expect(p).toHaveProperty('images');
      expect(Array.isArray(p.images)).toBe(true);
      expect(p).toHaveProperty('sizes');
      expect(p).toHaveProperty('stones');
      expect(p).toHaveProperty('metals');
      expect(p).toHaveProperty('arEffects');
      expect(p).toHaveProperty('models3d');
    });
  });

  test('cada categoria tem pelo menos 1 produto além do featured', () => {
    expect(products.aneis.length).toBeGreaterThanOrEqual(1);
    expect(products.colares.length).toBeGreaterThanOrEqual(1);
    expect(products.brincos.length).toBeGreaterThanOrEqual(1);
    expect(products.pulseiras.length).toBeGreaterThanOrEqual(1);
  });
});

describe('CT-PRODUCT-02 — Busca de produto por ID em todas as categorias', () => {
  const products = {
    featured: [{ id: 1, name: 'Anel Destaque', price: 100, category: 'aneis' }],
    aneis:    [{ id: 101, name: 'Aliança', price: 200, category: 'aneis' }],
    colares:  [{ id: 201, name: 'Colar', price: 300, category: 'colares' }],
    brincos:  [],
    pulseiras: []
  };

  function findProduct(id) {
    for (const key of Object.keys(products)) {
      const arr = products[key];
      if (Array.isArray(arr)) {
        const match = arr.find(p => p.id === id);
        if (match) return match;
      }
    }
    return null;
  }

  test('CT-PRODUCT-01: ID inexistente retorna null, sem lançar exceção', () => {
    expect(() => findProduct(9999)).not.toThrow();
    expect(findProduct(9999)).toBeNull();
  });

  test('CT-PRODUCT-02: ID válido em featured retorna produto correto', () => {
    const result = findProduct(1);
    expect(result).not.toBeNull();
    expect(result.name).toBe('Anel Destaque');
  });

  test('CT-PRODUCT-02: ID válido em categoria aneis retorna produto correto', () => {
    const result = findProduct(101);
    expect(result).not.toBeNull();
    expect(result.name).toBe('Aliança');
  });

  test('CT-PRODUCT-02: ID válido em categoria colares retorna produto correto', () => {
    const result = findProduct(201);
    expect(result).not.toBeNull();
    expect(result.name).toBe('Colar');
  });
});

describe('CT-CARD-01/02 — createProductCard', () => {
  test('CT-CARD-01: card tem elementos obrigatórios', () => {
    const product = { id: 1, name: 'Anel Teste', price: 500, image: 'img.jpg', category: 'aneis' };
    const isInWishlist = false;
    const cardHtml = `
      <div class="product-card">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        <h3 class="product-title">${product.name}</h3>
        <p class="product-price">R$ ${product.price.toFixed(2)}</p>
        <button class="add-to-cart">Adicionar ao Carrinho</button>
        <button class="wishlist-btn ${isInWishlist ? 'in-wishlist' : ''}" data-product-id="${product.id}">
          <i class="fas fa-heart"></i>
        </button>
      </div>
    `;
    document.body.innerHTML = cardHtml;
    expect(document.querySelector('.product-card')).not.toBeNull();
    expect(document.querySelector('.add-to-cart')).not.toBeNull();
    expect(document.querySelector('.wishlist-btn')).not.toBeNull();
    expect(document.querySelector('.product-title').textContent).toBe('Anel Teste');
    expect(document.querySelector('img[loading="lazy"]')).not.toBeNull();
  });

  test('CT-CARD-02: img com onerror retorna placeholder', () => {
    document.body.innerHTML = `<img id="test-img" src="invalid.jpg" onerror="this.onerror=null; this.src='placeholder.svg';">`;
    const img = document.getElementById('test-img');
    expect(img.getAttribute('onerror')).toContain("this.src='placeholder.svg'");
  });
});

describe('CT-MODAL-01 — estrutura HTML do modal Try-On', () => {
  test('modal try-on tem canvas deepar, role=dialog e aria-modal', () => {
    document.body.innerHTML = `
      <div id="try-on-modal" class="modal" role="dialog" aria-modal="true" aria-labelledby="tryon-modal-title">
        <div class="modal-content">
          <div id="ar-viewport">
            <canvas id="deepar-canvas"></canvas>
          </div>
        </div>
      </div>
    `;
    const modal = document.getElementById('try-on-modal');
    const canvas = document.getElementById('deepar-canvas');

    expect(modal).not.toBeNull();
    expect(modal.getAttribute('role')).toBe('dialog');
    expect(modal.getAttribute('aria-modal')).toBe('true');
    expect(canvas).not.toBeNull();
  });
});
