# Design Document

## Overview

O projeto JEWELRY é estruturado em duas camadas técnicas que se complementam:

**1. Widget/SDK de AR Try-On (produto B2B):** Um Web Component (`<jewelry-tryon>`) auto-contido que qualquer joalheria inclui no site com uma linha de código. Usa DeepAR para AR em tempo real, efeitos .deepar criados pelo ourives parceiro, e é completamente isolado do site host (Shadow DOM ou iframe).

**2. Vitrine Demo (B2C):** O site JEWELRY que demonstra a tecnologia, construído com HTML/CSS/JS vanilla, Bootstrap 5 e hospedado no GitHub Pages. Usa o próprio widget para mostrar a experiência que as joalherias clientes terão.

**Foco imediato:** Implementar a página de produto (`product-detail.html`) com o Try-On funcional — esse é o core demo que será mostrado para prospects.

---

## Architecture

### Visão Geral do Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                    VITRINE DEMO (GitHub Pages)                   │
│                                                                  │
│  index.html ──→ pages/product-detail.html                        │
│                         │                                        │
│                         ▼                                        │
│          ┌──────────────────────────────┐                        │
│          │   <jewelry-tryon> Widget     │  ◄── FOCO PRINCIPAL    │
│          │                              │                        │
│          │  ┌──────────┐ ┌──────────┐   │                        │
│          │  │ DeepAR   │ │ Camera   │   │                        │
│          │  │ Engine   │ │ Stream   │   │                        │
│          │  └──────────┘ └──────────┘   │                        │
│          │  ┌──────────────────────┐     │                        │
│          │  │  Effects (.deepar)   │     │                        │
│          │  │  [criados pelo       │     │                        │
│          │  │   ourives parceiro]  │     │                        │
│          │  └──────────────────────┘     │                        │
│          └──────────────────────────────┘                        │
│                                                                  │
│  js/script.js ─── catálogo, carrinho, wishlist, filtros          │
│  js/product-detail.js ─── galeria, variantes, 3D viewer          │
│  js/auth.js ─── autenticação simulada                            │
└─────────────────────────────────────────────────────────────────┘
          │
          │ (mesmo widget embarcado em sites de clientes)
          ▼
┌─────────────────────────────────┐
│  SITE DA JOALHERIA CLIENTE       │
│  (ex: prataeprara.com.br)        │
│                                  │
│  <script src="jewelry-sdk.js">   │
│  <jewelry-tryon                  │
│    product-id="anel-001"         │
│    api-key="xyz123">             │
│  </jewelry-tryon>                │
└─────────────────────────────────┘
```

### Arquitetura da Página de Produto

```
product-detail.html
      │
      ├── [1] Galeria Swiper (imagens por metal)
      │         └── Swiper thumbs + main
      │
      ├── [2] Seleção de Variante
      │         ├── Botões de metal → dispara 'productVariantChanged'
      │         └── Botões de tamanho
      │
      ├── [3] Modal AR Try-On
      │         ├── <canvas id="deepar-canvas">
      │         ├── Controles: trocar câmera, foto, fechar
      │         └── js/ar-tryon.js (módulo AR isolado)
      │
      ├── [4] Modal 3D Viewer
      │         ├── <model-viewer src="product.model3d">
      │         └── Controles nativos do model-viewer
      │
      └── [5] Evento: 'productVariantChanged'
                ├── Galeria → atualiza src da imagem principal
                ├── AR Module → deepAR.switchEffect(newEffect)
                └── 3D Module → model-viewer.src = newModel
```

---

## Components and Interfaces

### Módulo: `js/ar-tryon.js` (novo — foco principal)

**Responsabilidade:** Toda a lógica de AR Try-On, isolada em módulo próprio para reutilização como widget.

```javascript
// Interface pública
export class ARTryOn {
  constructor(container, config)    // container: HTMLElement, config: ARConfig
  async init()                      // solicita câmera, inicializa DeepAR
  async loadEffect(effectPath)      // carrega efeito .deepar
  async switchEffect(effectPath)    // troca efeito sem reinicializar câmera
  async switchCamera()              // alterna frontal/traseira
  async takeScreenshot()            // retorna blob/dataURL da captura
  destroy()                         // para câmera, libera recursos
  on(event, handler)                // 'ready' | 'error' | 'cameraPermissionDenied'
}

// Config
interface ARConfig {
  licenseKey: string;
  productCategory: 'ring' | 'earring' | 'necklace' | 'bracelet';
  effects: { yellow?: string, white?: string, rose?: string, silver?: string };
  fallbackImage?: string;           // URL de imagem para fallback
}
```

**Fluxo interno:**
```
ARTryOn.init()
  ├── navigator.mediaDevices.getUserMedia()
  │     ├── [NotAllowedError] → emit('cameraPermissionDenied') → exibe UI de permissão
  │     ├── [NotFoundError]   → emit('error', 'no-camera') → exibe fallback
  │     └── [OK]              → DeepAR.initialize({ licenseKey, canvas })
  │           ├── [ERRO SDK]  → emit('error', 'sdk-init-failed') → exibe fallback
  │           └── [OK]        → loadEffect(config.effects[currentMetal])
  │                               └── emit('ready')
  │
  └── [Após pronto]
        ├── switchCamera() → para stream atual, reinicia com facingMode oposto
        ├── switchEffect(path) → deepAR.switchEffect(path) — não reinicia câmera
        └── takeScreenshot() → canvas.toDataURL('image/png') → retorna dataURL
```

---

### Módulo: `js/product-detail.js` (refatorar)

**Responsabilidades:**
- Carregar produto por `?id=&category=` da URL
- Inicializar Swiper galeria (main + thumbs)
- Gerenciar seleção de variante → dispatchar `productVariantChanged`
- Coordenar abertura/fechamento do modal AR e do modal 3D
- Integrar `ARTryOn` module
- Integrar `<model-viewer>`

**Eventos customizados:**
```javascript
// Disparado ao mudar variante de metal ou tamanho
document.dispatchEvent(new CustomEvent('productVariantChanged', {
  detail: {
    metal: 'yellow',    // 'yellow' | 'white' | 'rose' | 'silver'
    size: '16',
    product: currentProduct
  }
}));
```

---

### Módulo: `js/script.js` (manter, corrigir bugs)

Mantém responsabilidade de: catálogo, carrinho, wishlist, filtros, toasts, logError.

**Correções necessárias:**
- Converter variáveis DOM de `const` para `let` (fix #001)
- Adicionar `variantKey` ao item no `addToCart` (fix #005)
- Corrigir HTML inválido em `displayProducts` (fix #002)
- Implementar `closeCartModal` e `closeWishlistModal` como funções nomeadas (fix #004)

---

### Componente: `<model-viewer>` para 3D

```html
<!-- Inserido dinamicamente quando produto tem model3d -->
<model-viewer
  id="jewelry-3d-viewer"
  src=""
  alt=""
  auto-rotate
  camera-controls
  shadow-intensity="1"
  exposure="0.75"
  environment-image="neutral"
  ar
  ar-modes="webxr scene-viewer quick-look"
  loading="lazy">
</model-viewer>
```

**Troca de metal no 3D:**
```javascript
// Opção preferida: modelos separados por metal (mais simples)
viewer.src = product.metals3d[selectedMetal]; // ex: 'assets/models/anel-001-yellow.glb'
```

---

## Data Models

### Produto (estrutura completa)

```typescript
interface Product {
  id: number;
  name: string;
  price: number;                        // BRL, ex: 5999.99
  image: string;                        // URL imagem principal (ouro amarelo por padrão)
  images: string[];                     // galeria completa
  category: 'aneis' | 'colares' | 'brincos' | 'pulseiras';
  description: string;
  details: {
    material?: string;                  // ex: "Ouro 18k"
    pedra?: string;                     // ex: "Diamante Natural"
    quilate?: string;
    pureza?: string;
    cor?: string;
    certificacao?: string;              // ex: "GIA"
    comprimento?: string;
    peso?: string;
    estilo?: string;
  };
  sizes?: string[];                     // ex: ['12', '14', '16', '18', '20']
  stones?: string[];                    // ex: ['diamond', 'sapphire']
  metals?: {                            // imagens por variante de metal
    yellow?: string;
    white?: string;
    rose?: string;
    silver?: string;
  };
  arEffects?: {                         // paths para arquivos .deepar
    yellow?: string;
    white?: string;
    rose?: string;
    silver?: string;
  };
  models3d?: {                          // paths para arquivos .glb
    yellow?: string;
    white?: string;
    rose?: string;
    silver?: string;
  };
}
```

### Item do Carrinho

```typescript
interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  selectedSize: string;
  selectedMetal: string;
  quantity: number;
  variantKey: string;   // `${id}-${selectedSize}-${selectedMetal}`
}
```

---

## File Structure

```
JEWELRY/
├── index.html
├── assets/
│   ├── images/
│   │   ├── JOIAS/                      # Fotos das joias por produto/metal
│   │   └── modelos/                    # Fotos lifestyle/modelos
│   ├── effects/                        # Arquivos .deepar (ourives parceiro)
│   │   ├── aneis/
│   │   ├── colares/
│   │   ├── brincos/
│   │   └── pulseiras/
│   └── models/                         # Arquivos .glb (ourives parceiro)
│       ├── aneis/
│       ├── colares/
│       ├── brincos/
│       └── pulseiras/
├── css/
│   ├── style.css                       # Tokens globais + layout
│   ├── loading-states.css              # Toasts, spinners, overlays
│   ├── product-detail.css              # Estilos da página de produto
│   └── ar-tryon.css                    # NOVO: estilos do componente Try-On
├── js/
│   ├── script.js                       # Core: catálogo, carrinho, wishlist
│   ├── ar-tryon.js                     # NOVO: módulo AR Try-On isolado
│   ├── product-detail.js               # Página de produto (galeria, variantes)
│   ├── product-visualization.js        # Zoom, 360-view
│   ├── auth.js
│   ├── faq.js
│   ├── stores.js
│   └── password-strength.js
├── pages/
│   ├── product-detail.html             # FOCO PRINCIPAL
│   ├── aneis.html / colares.html / brincos.html / pulseiras.html
│   ├── collections.html
│   └── [demais páginas]
├── tests/
│   ├── pbt.test.js                     # Property-based tests
│   ├── ar-tryon.test.js                # Testes unitários do AR module
│   └── setup.js                        # Mock de localStorage, MediaDevices
├── docs/
│   ├── PRODUCT.md
│   ├── TECH.md
│   └── ISSUES.md
├── .kiro/
│   ├── specs/jewelry-virtual-store/
│   │   ├── requirements.md
│   │   ├── design.md
│   │   └── tasks.md
│   └── steering/
│       ├── project-standards.md
│       └── ar-tryon-guide.md
├── package.json                        # Jest + fast-check
├── jest.config.js
├── .gitignore                          # inclui js/config.js
├── README.md
└── CONTRIBUTING.md
```

---

## Technology Stack

| Camada | Tecnologia | Motivo |
|--------|-----------|--------|
| HTML | HTML5 semântico | Compatibilidade, GitHub Pages |
| CSS | CSS3 + Custom Properties | Design tokens, sem build step |
| JS | ES6+ modules | Modularidade sem bundler |
| Layout | Bootstrap 5.3.8 | Grid responsivo rápido |
| Ícones | Font Awesome 6 | Cobertura completa |
| Galeria | Swiper 10 | Touch-friendly, thumbs nativo |
| AR | DeepAR SDK | Melhor rastreamento facial/mãos para joias |
| 3D | `<model-viewer>` Google | GLTF/WebXR, zero config |
| Testes | Jest + fast-check | PBT para propriedades formais |
| Hospedagem | GitHub Pages | Gratuito, CI via push |

---

## Testing Strategy

### Casos de Teste por Funcionalidade

#### AR Try-On (`ar-tryon.test.js`)

```javascript
// CT-AR-01: Inicialização com câmera disponível
// Dado: câmera disponível + DeepAR SDK carregado
// Quando: ARTryOn.init() é chamado
// Então: evento 'ready' é emitido e canvas tem stream ativo

// CT-AR-02: Câmera negada
// Dado: getUserMedia lança NotAllowedError
// Quando: ARTryOn.init() é chamado
// Então: evento 'cameraPermissionDenied' é emitido, sem exceção lançada

// CT-AR-03: Câmera não encontrada
// Dado: getUserMedia lança NotFoundError
// Quando: ARTryOn.init() é chamado
// Então: evento 'error' com code 'no-camera' é emitido

// CT-AR-04: Troca de efeito sem reinicializar câmera
// Dado: ARTryOn inicializado e ativo
// Quando: switchEffect('novo-efeito.deepar') é chamado
// Então: deepAR.switchEffect é chamado, stream de câmera continua ativo

// CT-AR-05: Captura de foto
// Dado: ARTryOn ativo com canvas renderizando
// Quando: takeScreenshot() é chamado
// Então: retorna string não-vazia iniciando com 'data:image/'

// CT-AR-06: Destruição limpa recursos
// Dado: ARTryOn ativo
// Quando: destroy() é chamado
// Então: todos os tracks do MediaStream são parados
```

#### Propriedades PBT (`pbt.test.js`)

```javascript
// P1: Invariância do total do carrinho
// P2: Persistência bidirecional localStorage
// P3: Filtragem sempre correta
// P4: Idempotência da wishlist
// P5: Widget inicializável em qualquer DOM válido
// P6: Widget não polui variáveis globais
```

---

## Git Workflow

Todo desenvolvimento segue obrigatoriamente o fluxo:

```
1. Criar branch a partir de main:
   git checkout main && git pull
   git checkout -b feature/T6.2-camera-permission
   (ou fix/T1.1-close-cart-modal)

2. Desenvolver + criar testes

3. Commit com padrão:
   git commit -m "[T6.2] feat: implementar solicitação de permissão de câmera"
   
   Prefixos: feat | fix | refactor | test | docs | chore

4. Push e abrir PR:
   - Título: [T6.2] feat: implementar solicitação de permissão de câmera
   - Descrição: o que mudou, por que, como testar
   - Screenshots/GIF se mudança visual
   - Referência: "Closes #002" ou "Related to T6.2"

5. Após aprovação: merge para main
   Preferencialmente: squash merge

6. Atualizar docs/ISSUES.md marcando a issue como resolvida
```

**Convenção de nomes de branch:**
| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Nova feature | `feature/{task-id}-{slug}` | `feature/T6.2-camera-permission` |
| Correção de bug | `fix/{issue-id}-{slug}` | `fix/001-const-reassignment` |
| Documentação | `docs/{slug}` | `docs/update-readme` |
| Refactor | `refactor/{slug}` | `refactor/ar-module-isolation` |

---

## Correctness Properties

### Property 1: Invariância do Total do Carrinho
Para qualquer sequência de adições/remoções, `getCartTotal()` DEVE ser igual à soma de `item.price * item.quantity` para todos os itens distintos no carrinho.

**Validates: Requirements 6.1, 6.2, 6.4**

### Property 2: Persistência Bidirecional
Para qualquer estado de carrinho/wishlist salvo, `JSON.parse(localStorage.getItem(KEY))` DEVE ser deep-equal ao estado original antes do recarregamento.

**Validates: Requirements 6.3**

### Property 3: Filtragem Sempre Correta
Para qualquer produto P e filtros F ativos: se P satisfaz F então P DEVE estar no resultado; se P não satisfaz F então P NÃO DEVE estar no resultado.

**Validates: Requirements 4.5**

### Property 4: Idempotência da Wishlist
Chamar `addToWishlist(id)` N vezes (N ≥ 1) DEVE resultar em exatamente 1 ocorrência de `id` na wishlist.

**Validates: Requirements 6.5**

### Property 5: Inicialização Segura do Widget AR
`ARTryOn.init()` NUNCA deve lançar exceção não capturada — todos os erros devem ser emitidos via evento `error` ou `cameraPermissionDenied`.

**Validates: Requirements 1.7, 5.5**

### Property 6: Isolamento do Módulo AR
O módulo `ARTryOn` NÃO DEVE escrever em `window.*` nem modificar CSS fora do seu próprio container DOM.

**Validates: Requirements 1.1, 1.7**

Ver `requirements.md` → seção "Correctness Properties" para o contexto completo de PBT.

Resumo das propriedades críticas para o design:

- **P5 — Inicialização Segura do Widget:** `ARTryOn.init()` NUNCA deve lançar exceção não capturada, mesmo em DOM incompleto. Todos os erros devem ser emitidos via `on('error', handler)`.
- **P6 — Isolamento do Widget:** O módulo `ARTryOn` NÃO DEVE escrever em `window.*` nem modificar CSS fora do seu container. Interface pública via instância de classe apenas.
- **P4 — Idempotência da Wishlist:** `addToWishlist(id)` chamado N vezes resulta em exatamente 1 ocorrência.

---

## Error Handling

### Estratégia geral

Todos os erros são capturados, logados via `logError()` e comunicados ao usuário via `showToast()` — nunca via `alert()` ou `throw` não capturado.

### Erros do AR Try-On (`js/ar-tryon.js`)

| Erro | Causa | Tratamento |
|------|-------|-----------|
| `NotAllowedError` | Usuário negou câmera | Emitir `cameraPermissionDenied`; exibir UI de permissão com instruções por browser |
| `NotFoundError` | Sem câmera no dispositivo | Emitir `error` code `no-camera`; exibir fallback com galeria de fotos |
| `sdk-init-failed` | DeepAR.initialize() falhou | Emitir `error` code `sdk-init-failed`; exibir fallback; mostrar toast genérico |
| `effect-load-failed` | switchEffect() falhou | Log interno; manter efeito anterior; toast de aviso |
| `screenshot-failed` | canvas.toDataURL() falhou | Toast de erro; não travar a interface |

### Erros do Carrinho

| Erro | Causa | Tratamento |
|------|-------|-----------|
| `localStorage` indisponível | Navegador privado/bloqueado | `logError()` + continuar sem persistência (sem crash) |
| `JSON.parse` falha no carrinho | Dado corrompido | Resetar carrinho para `[]` + `logError()` |

### Erros de Carregamento de Produto

| Erro | Causa | Tratamento |
|------|-------|-----------|
| `id` inválido na URL | URL manipulada manualmente | Exibir "Produto não encontrado" + link para catálogo |
| Imagem não encontrada | Asset ausente | `onerror` handler substitui por placeholder |
| Modelo 3D não encontrado | GLB ausente | Ocultar botão "Visualizar em 3D"; log de aviso |
