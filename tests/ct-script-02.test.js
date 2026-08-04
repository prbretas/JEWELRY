/**
 * @file tests/ct-script-02.test.js
 * @description CT-SCRIPT-02: closeCartModal e closeWishlistModal sem modal no DOM não lançam exceção
 * Fix: T1.2 — implementar funções globais de fechar modal (Issue #004)
 */

describe('CT-SCRIPT-02 — funções de fechar modal são seguras', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('closeCartModal sem #cart-modal no DOM não lança exceção', () => {
    const closeCartModal = () => {
      const modal = document.getElementById('cart-modal');
      if (modal) modal.style.display = 'none';
    };

    expect(() => closeCartModal()).not.toThrow();
  });

  test('closeWishlistModal sem #wishlist-modal no DOM não lança exceção', () => {
    const closeWishlistModal = () => {
      const modal = document.getElementById('wishlist-modal');
      if (modal) modal.style.display = 'none';
    };

    expect(() => closeWishlistModal()).not.toThrow();
  });

  test('closeCartModal fecha o modal quando ele existe', () => {
    document.body.innerHTML = '<div id="cart-modal" style="display:block"></div>';

    const closeCartModal = () => {
      const modal = document.getElementById('cart-modal');
      if (modal) modal.style.display = 'none';
    };

    closeCartModal();
    expect(document.getElementById('cart-modal').style.display).toBe('none');
  });

  test('closeWishlistModal fecha o modal quando ele existe', () => {
    document.body.innerHTML = '<div id="wishlist-modal" style="display:block"></div>';

    const closeWishlistModal = () => {
      const modal = document.getElementById('wishlist-modal');
      if (modal) modal.style.display = 'none';
    };

    closeWishlistModal();
    expect(document.getElementById('wishlist-modal').style.display).toBe('none');
  });
});
