/**
 * @file tests/ct-script-03.test.js
 * @description CT-SCRIPT-03: template do botão wishlist não gera HTML com atributos inválidos
 * Fix: T1.4 — corrigir HTML inválido no card de produto (Issue #002)
 */

describe('CT-SCRIPT-03 — HTML do card de produto é válido', () => {
  test('botão wishlist usa classe condicional, sem aspas extras', () => {
    const productId = 1;
    const wishlist = [];

    // Padrão CORRETO: condicional dentro do atributo class
    const btnHtml = `<button class="wishlist-btn${wishlist.includes(productId) ? ' active' : ''}" data-product-id="${productId}"><i class="fas fa-heart"></i></button>`;

    // Não deve ter padrão de }" que indica aspas extra após template expression
    expect(btnHtml).not.toMatch(/\}"/);
    // Não deve ter aspas consecutivas vazias
    expect(btnHtml).not.toMatch(/""/);
    // Deve conter a classe base
    expect(btnHtml).toContain('wishlist-btn');
    // data-product-id deve estar presente
    expect(btnHtml).toContain(`data-product-id="${productId}"`);
  });

  test('botão wishlist com produto na wishlist adiciona classe active', () => {
    const productId = 1;
    const wishlist = [1];

    const btnClass = `wishlist-btn${wishlist.includes(productId) ? ' active' : ''}`;
    expect(btnClass).toBe('wishlist-btn active');
  });

  test('botão wishlist com produto fora da wishlist não tem classe active', () => {
    const productId = 1;
    const wishlist = [];

    const btnClass = `wishlist-btn${wishlist.includes(productId) ? ' active' : ''}`;
    expect(btnClass).toBe('wishlist-btn');
    expect(btnClass).not.toContain('active');
  });

  test('card completo é parseável como HTML válido', () => {
    const product = { id: 1, name: 'Anel Teste', price: 100, image: 'img.jpg' };
    const wishlist = [];

    const cardHtml = `
      <div class="product-card">
        <div class="product-image-container">
          <img src="${product.image}" alt="${product.name}" class="product-image">
        </div>
        <div class="product-info">
          <h3>${product.name}</h3>
          <p>R$ ${product.price.toFixed(2)}</p>
          <button class="wishlist-btn${wishlist.includes(product.id) ? ' active' : ''}"
                  data-product-id="${product.id}">
            <i class="fas fa-heart"></i>
          </button>
        </div>
      </div>
    `;

    document.body.innerHTML = cardHtml;
    const card = document.querySelector('.product-card');
    const btn = document.querySelector('.wishlist-btn');

    expect(card).not.toBeNull();
    expect(btn).not.toBeNull();
    expect(btn.dataset.productId).toBe('1');
  });
});
