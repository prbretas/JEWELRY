# Tech Document — Joalheria Virtual

**Versão:** 1.0  
**Data:** 2026-08-04  
**Tipo:** Referência técnica para desenvolvimento

---

## 1. Stack Tecnológica

```
Frontend
├── HTML5 (semântico, acessível)
├── CSS3
│   ├── Custom Properties (design tokens)
│   ├── Flexbox + CSS Grid
│   └── Bootstrap 5.3.8 (grid e utilitários apenas)
├── JavaScript ES6+
│   ├── Módulos ES6 (type="module")
│   ├── Async/Await
│   └── Web APIs (Camera, Storage, Share, Clipboard)
└── SDKs Externos
    ├── DeepAR SDK — AR Try-On
    ├── model-viewer 3.x — 3D Web Component
    ├── Swiper 10 — Galeria
    └── Font Awesome 6 — Ícones

Testes
├── Jest — Test Runner
└── fast-check — Property-Based Testing

Hospedagem
└── GitHub Pages (estático)
```

---

## 2. Arquitetura de Módulos JS

### Grafo de Dependências

```
script.js (core)
  ├── expõe: window.addToCart, window.showToast, window.logError, window.products
  ├── importado por: product-detail.js, auth.js, faq.js, stores.js
  └── depende de: nenhum módulo local

auth.js
  ├── expõe: window.AuthModule
  └── depende de: script.js (showToast)

product-detail.js
  ├── importa: script.js (produtos, addToCart, showToast)
  ├── importa: product-visualization.js (initializeProductVisualization)
  └── usa SDKs: DeepAR, model-viewer

product-visualization.js
  ├── expõe: initializeProductVisualization, updateProductImages, rotateImage
  └── depende de: nenhum módulo local

password-strength.js
  └── depende de: nenhum módulo local

faq.js / stores.js
  └── depende de: script.js (showToast)
```

### Padrão de Carregamento nas Páginas
```html
<!-- Páginas simples (homepage, categorias) -->
<script src="../js/script.js"></script>

<!-- Páginas de detalhe de produto -->
<script defer src="../js/script.js" type="module"></script>
<script defer src="../js/product-visualization.js" type="module"></script>
<script defer src="../js/product-detail.js" type="module"></script>

<!-- Páginas de auth -->
<script defer src="../js/script.js" type="module"></script>
<script defer src="../js/password-strength.js" type="module"></script>
<script defer src="../js/auth.js" type="module"></script>
```

---

## 3. Estrutura de Dados

### Produto Completo
```typescript
interface Product {
  id: number;
  name: string;
  price: number;                    // BRL sem formatação
  image: string;                    // URL imagem principal
  images: string[];                 // Galeria completa
  category: 'aneis' | 'colares' | 'brincos' | 'pulseiras';
  description: string;
  details: {
    material?: string;
    pedra?: string;
    quilate?: string;
    pureza?: string;
    cor?: string;
    certificacao?: string;
    comprimento?: string;
    peso?: string;
    estilo?: string;
  };
  sizes?: string[];                 // ['12', '14', '16', '18']
  metals?: {
    yellow?: string;                // URL imagem ouro amarelo
    white?: string;                 // URL imagem ouro branco
    rose?: string;                  // URL imagem ouro rosé
  };
  arEffect?: {
    yellow?: string;                // path .deepar ouro amarelo
    white?: string;
    rose?: string;
  } | string;                       // ou path único
  model3d?: string;                 // path .glb ou null
  stones?: string[];                // ['diamond', 'sapphire', 'ruby', 'emerald', 'pearl']
}
```

### Item do Carrinho
```typescript
interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  selectedSize: string;
  selectedMetal: string;
  quantity: number;
  variantKey: string;               // `${id}-${selectedSize}-${selectedMetal}`
}
```

### Estado de Autenticação
```typescript
// sessionStorage['auth_session']
interface AuthSession {
  user: {
    name: string;
    email: string;
    createdAt: string;
  };
  loggedInAt: string;               // ISO 8601
}

// localStorage['users']
interface StoredUser {
  name: string;
  email: string;
  passwordHash: string;             // Simples para demo; usar bcrypt em prod
}
```

---

## 4. Web APIs Utilizadas

### Camera API (MediaDevices)
```javascript
// Solicitar câmera
navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: 'user',            // 'environment' para câmera traseira
    width: { ideal: 1280 },
    height: { ideal: 720 }
  }
});

// Listar dispositivos (para botão troca câmera)
navigator.mediaDevices.enumerateDevices()
  .then(devices => devices.filter(d => d.kind === 'videoinput'));
```

### Web Storage
```javascript
// localStorage: persiste entre sessões
localStorage.setItem('cart', JSON.stringify(cart));
localStorage.getItem('cart');

// sessionStorage: persiste na aba, limpa ao fechar
sessionStorage.setItem('auth_session', JSON.stringify(session));
```

### Web Share API
```javascript
if (navigator.share) {
  await navigator.share({
    title: 'Minha joia virtual',
    text: 'Olha como ficou!',
    url: window.location.href,
    files: [photoFile]             // se disponível
  });
}
```

### Clipboard API
```javascript
// Fallback para Web Share
await navigator.clipboard.writeText(url);
```

---

## 5. Integração DeepAR

### Ciclo de Vida
```
1. Página carrega produto
2. Usuário clica "Experimentar Virtual"
3. getUserMedia() → permissão câmera
4. DeepAR.initialize({ licenseKey, canvas })
5. deepAR.switchEffect(product.arEffect[metal])
6. Loop de render AR (automático pelo SDK)
7. Evento 'productVariantChanged' → deepAR.switchEffect(newEffect)
8. deepAR.takeScreenshot() → preview/download
9. Usuário fecha → deepAR.stopCamera() → deepAR.dispose()
```

### Tratamento de Erros
```javascript
const AR_ERRORS = {
  NotAllowedError: 'Permissão de câmera negada. Verifique as configurações do navegador.',
  NotFoundError: 'Câmera não encontrada neste dispositivo.',
  DEEPAR_INIT_FAILED: 'Falha ao inicializar a prova virtual. Verifique sua conexão.',
  EFFECT_LOAD_FAILED: 'Efeito da joia não pôde ser carregado.'
};
```

---

## 6. Integração model-viewer (3D)

### HTML
```html
<script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>

<model-viewer
  id="jewelry-3d-viewer"
  src="/assets/models/anel-diamante.glb"
  alt="Anel de Diamante em 3D"
  auto-rotate
  camera-controls
  shadow-intensity="1"
  exposure="0.8"
  environment-image="neutral"
  ar
  ar-modes="webxr scene-viewer quick-look">
</model-viewer>
```

### Troca de textura por metal
```javascript
const viewer = document.getElementById('jewelry-3d-viewer');
// Opção 1: trocar o src do modelo (modelo separado por metal)
viewer.src = `/assets/models/anel-${selectedMetal}.glb`;

// Opção 2: usar materials API (se modelos usam o mesmo mesh com texturas diferentes)
const [material] = await viewer.model.materials;
material.pbrMetallicRoughness.setBaseColorFactor([r, g, b, 1]);
```

---

## 7. Evento Customizado para Sincronização de Variante

```javascript
// Emitido ao mudar metal ou tamanho
document.dispatchEvent(new CustomEvent('productVariantChanged', {
  detail: {
    metal: 'yellow',              // 'yellow' | 'white' | 'rose'
    size: '16',
    product: currentProduct
  }
}));

// Escutado pelos módulos AR e 3D
document.addEventListener('productVariantChanged', (e) => {
  const { metal, product } = e.detail;
  if (deepAR && product.arEffect?.[metal]) {
    deepAR.switchEffect(product.arEffect[metal]);
  }
});
```

---

## 8. Sistema de Testes PBT

### Setup
```bash
npm init -y
npm install --save-dev jest fast-check @babel/core @babel/preset-env babel-jest
```

### `jest.config.js`
```javascript
module.exports = {
  transform: { '^.+\\.js$': 'babel-jest' },
  testEnvironment: 'jsdom',
  setupFiles: ['./tests/setup.js']
};
```

### `tests/setup.js`
```javascript
// Mock localStorage e sessionStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (k) => store[k] || null,
    setItem: (k, v) => { store[k] = v; },
    removeItem: (k) => { delete store[k]; },
    clear: () => { store = {}; }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
```

### Exemplo de Teste PBT
```javascript
// tests/pbt.test.js
import fc from 'fast-check';
import { addToCart, getCart, getCartTotal, clearCart } from '../js/cart.module.js';

describe('P1 — Invariância do Carrinho', () => {
  it('total deve ser soma de preço × quantidade', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          id: fc.integer({ min: 1, max: 100 }),
          price: fc.float({ min: 1, max: 50000 }),
          quantity: fc.integer({ min: 1, max: 10 }),
          selectedSize: fc.string(),
          selectedMetal: fc.constantFrom('yellow', 'white', 'rose')
        }), { minLength: 1 }),
        (items) => {
          clearCart();
          items.forEach(item => addToCart({ ...item, name: 'Test', image: '' }));
          const expected = items.reduce((s, i) => s + i.price * i.quantity, 0);
          expect(getCartTotal()).toBeCloseTo(expected, 1);
        }
      )
    );
  });
});
```

---

## 9. Checklist de Deploy (GitHub Pages)

- [ ] Todos os caminhos de assets são relativos (não absolutos)
- [ ] Não há dependências de backend (tudo client-side)
- [ ] Imagens otimizadas (< 200KB por imagem de produto)
- [ ] CSS e JS minificados (opcional para Pages, mas recomendado)
- [ ] `index.html` na raiz do projeto
- [ ] Chave DeepAR configurada para o domínio `prbretas.github.io`
- [ ] Testar em Chrome mobile + Safari iOS antes de publicar

---

## 10. Variáveis de Ambiente (Configuração)

Como o projeto é estático (sem Node.js em runtime), as configurações são feitas diretamente no código. Para um fluxo mais seguro:

```javascript
// js/config.js — NÃO commitar com chaves reais
const CONFIG = {
  DEEPAR_LICENSE_KEY: 'sua_chave_aqui',
  // No futuro, injetar via CI/CD ou dotenv durante build
};
export default CONFIG;
```

Adicionar `js/config.js` ao `.gitignore` e documentar no README como configurar localmente.

---

## 11. Known Issues e Débito Técnico

| Issue | Arquivo | Prioridade |
|-------|---------|------------|
| `const` reatribuídas em `ensureElements()` | script.js | 🔴 Alta |
| HTML inválido no card de produto (aspas extras) | script.js L~310 | 🔴 Alta |
| Link quebrado `../'pages/colares.html` | collections.html | 🔴 Alta |
| `closeCartModal` não definida globalmente | script.js | 🔴 Alta |
| DeepAR com chave placeholder | product-detail.js | 🔴 Alta |
| 3D Viewer não implementado (TODO) | product-detail.js | 🟡 Média |
| `auth.js` métodos vazios (updateProfile, etc.) | auth.js | 🟡 Média |
| Sem menu hamburger mobile | todas as páginas | 🔴 Alta |
| Filtro de pedras não funcional | script.js | 🟡 Média |
| Sem testes automatizados | — | 🟡 Média |
