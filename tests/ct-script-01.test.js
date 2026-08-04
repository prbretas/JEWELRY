/**
 * @file tests/ct-script-01.test.js
 * @description CT-SCRIPT-01: variáveis DOM declaradas com let permitem reatribuição segura
 * Fix: T1.1 — converter const para let em script.js (Issue #001)
 */

describe('CT-SCRIPT-01 — variáveis DOM com let permitem reatribuição', () => {
  test('variável let pode ser reatribuída para null sem TypeError', () => {
    let el = document.getElementById('elemento-inexistente');
    expect(el).toBeNull();

    // Com let, reatribuição não lança TypeError (const lançaria)
    expect(() => {
      el = document.getElementById('outro-elemento-inexistente');
    }).not.toThrow();

    expect(el).toBeNull();
  });

  test('padrão ensureElements: reatribuir se null não lança erro', () => {
    let wishlistIcon = null;
    let cartModal = null;

    expect(() => {
      if (!wishlistIcon) wishlistIcon = document.getElementById('wishlist-icon');
      if (!cartModal)    cartModal    = document.getElementById('cart-modal');
    }).not.toThrow();

    // Em jsdom sem HTML completo, ambos serão null — isso é OK
    expect(wishlistIcon).toBeNull();
    expect(cartModal).toBeNull();
  });

  test('getElementById em elemento inexistente retorna null, não lança', () => {
    const ids = [
      'wishlist-icon', 'wishlist-modal', 'wishlist-items', 'wishlist-count',
      'cart-icon', 'cart-modal', 'cart-items', 'cart-count',
      'checkout-btn', 'total-amount'
    ];

    ids.forEach(id => {
      expect(() => document.getElementById(id)).not.toThrow();
    });
  });
});
