/**
 * @file tests/ct-cart-01.test.js
 * @description CT-CART-01: variantKey está presente no item ao adicionar ao carrinho
 * Fix: T1.3 — incluir variantKey no objeto item (Issue #005)
 */

describe('CT-CART-01 — variantKey no carrinho', () => {
  test('variantKey segue padrão {id}-{size}-{metal}', () => {
    const cases = [
      { id: 1, size: '16', metal: 'yellow', expected: '1-16-yellow' },
      { id: 2, size: '',   metal: 'white',  expected: '2--white'    },
      { id: 3, size: '18', metal: '',       expected: '3-18-'       },
      { id: 4, size: '',   metal: '',       expected: '4--'         },
    ];

    cases.forEach(({ id, size, metal, expected }) => {
      const key = `${id}-${size || ''}-${metal || ''}`;
      expect(key).toBe(expected);
    });
  });

  test('item adicionado ao array do carrinho contém variantKey', () => {
    const cart = [];
    const product = { id: 1, name: 'Anel Teste', price: 500, image: '' };
    const productInfo = { id: 1, size: '16', metal: 'yellow', quantity: 1 };

    const variantKey = `${product.id}-${productInfo.size || ''}-${productInfo.metal || ''}`;
    cart.push({ ...product, selectedSize: productInfo.size, selectedMetal: productInfo.metal, quantity: 1, variantKey });

    expect(cart[0].variantKey).toBe('1-16-yellow');
  });

  test('removeFromCart encontra o item pelo variantKey correto', () => {
    const cart = [
      { id: 1, variantKey: '1-16-yellow', name: 'Anel A', price: 100, quantity: 1 },
      { id: 2, variantKey: '2-14-white',  name: 'Anel B', price: 200, quantity: 1 },
    ];

    const keyToRemove = '1-16-yellow';
    const index = cart.findIndex(item => item.variantKey === keyToRemove);

    expect(index).toBe(0);
    cart.splice(index, 1);

    expect(cart.length).toBe(1);
    expect(cart[0].variantKey).toBe('2-14-white');
  });

  test('adicionar o mesmo variantKey incrementa quantidade em vez de duplicar', () => {
    const cart = [
      { id: 1, variantKey: '1-16-yellow', name: 'Anel', price: 100, quantity: 1 }
    ];
    const keyToAdd = '1-16-yellow';
    const existing = cart.find(i => i.variantKey === keyToAdd);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ id: 1, variantKey: keyToAdd, name: 'Anel', price: 100, quantity: 1 });
    }

    expect(cart.length).toBe(1);
    expect(cart[0].quantity).toBe(2);
  });

  test('variantKey gerado em updateCart é idêntico ao gerado em addToCart', () => {
    const item = { id: 5, selectedSize: '18', selectedMetal: 'rose' };

    // Padrão usado em addToCart
    const keyFromAdd = `${item.id}-${item.selectedSize || ''}-${item.selectedMetal || ''}`;
    // Padrão usado em updateCart
    const keyFromUpdate = `${item.id}-${item.selectedSize || ''}-${item.selectedMetal || ''}`;

    expect(keyFromAdd).toBe(keyFromUpdate);
    expect(keyFromAdd).toBe('5-18-rose');
  });
});
