# Implementation Plan: Joalheria Virtual — AR Try-On SDK

## Overview

O projeto JEWELRY tem duas camadas: **produto B2B** (widget AR Try-On vendido para joalherias) e **vitrine demo B2C** (o site JEWELRY que demonstra a tecnologia). O foco atual é a página de produto com o componente AR Try-On funcional — o core differentiator do negócio.

**Regra de ouro:** Ao iniciar qualquer tarefa → criar branch → desenvolver → criar testes → commit → PR → merge para main → documentar issue resolvida.

## Task Dependency Graph

```json
{
  "waves": [
    {
      "wave": 1,
      "tasks": ["T1.1", "T1.2", "T1.3", "T1.4", "T1.5"]
    },
    {
      "wave": 2,
      "tasks": ["T2.1", "T2.2", "T3.1", "T3.2", "T3.3", "T3.4", "T8.1"]
    },
    {
      "wave": 3,
      "tasks": ["T4.1", "T4.2", "T4.3", "T4.4"]
    },
    {
      "wave": 4,
      "tasks": ["T4.5", "T4.6", "T4.7", "T5.1", "T5.2"]
    },
    {
      "wave": 5,
      "tasks": ["T6.1", "T7.1", "T8.2", "T9.1", "T10.1", "T11.1"]
    }
  ]
}
```

---

## Tasks

### T1 — Correções Críticas de JavaScript

**Prioridade:** 🔴 Máxima | **Branch:** `fix/T1-critical-js-bugs`  
**Refs:** Issues #001 #002 #004 #005

#### T1.1 — Converter variáveis DOM de `const` para `let` em `script.js`
- [ ] 1. Criar branch `fix/001-const-reassignment`
- [ ] 2. Converter `wishlistIcon`, `wishlistModal`, `wishlistItems`, `wishlistCount`, `shareWishlistBtn`, `clearWishlistBtn`, `cartIcon`, `cartModal`, `closeBtn`, `cartItems`, `cartCount`, `totalAmount`, `checkoutBtn` de `const` para `let`
- [ ] 3. Verificar que `ensureElements()` funciona corretamente após a mudança
- [ ] 4. **Criar teste CT-SCRIPT-01:** `ensureElements()` em página sem elementos DOM não lança TypeError
- [ ] 5. Atualizar `docs/ISSUES.md` marcando #001 como resolvido
- [ ] 6. Commit: `[T1.1] fix: converter variáveis DOM para let em script.js`
- [ ] 7. PR → merge para main

#### T1.2 — Implementar `closeCartModal` e `closeWishlistModal` como funções globais
- [ ] 1. Criar branch `fix/004-close-modal-functions`
- [ ] 2. Definir funções nomeadas e expor via `window.closeCartModal` e `window.closeWishlistModal`
- [ ] 3. Remover `onclick` inline do HTML e substituir por addEventListener
- [ ] 4. **Criar teste CT-SCRIPT-02:** `closeCartModal()` sem `#cart-modal` no DOM não lança exceção
- [ ] 5. Atualizar #004 em `docs/ISSUES.md`
- [ ] 6. Commit: `[T1.2] fix: implementar closeCartModal e closeWishlistModal globais`
- [ ] 7. PR → merge para main

#### T1.3 — Corrigir `variantKey` no `addToCart`
- [ ] 1. Criar branch `fix/005-variant-key-cart`
- [ ] 2. Em `addToCart()`, adicionar `variantKey: \`${product.id}-${product.selectedSize || ''}-${product.selectedMetal || ''}\`` ao objeto item
- [ ] 3. Garantir que `removeFromCart(variantKey)` usa o mesmo padrão
- [ ] 4. **Criar teste CT-CART-01:** adicionar item e depois remover pelo variantKey → carrinho vazio
- [ ] 5. Atualizar #005 em `docs/ISSUES.md`
- [ ] 6. Commit: `[T1.3] fix: incluir variantKey no item ao adicionar ao carrinho`
- [ ] 7. PR → merge para main

#### T1.4 — Corrigir HTML inválido em `displayProducts()`
- [ ] 1. Criar branch `fix/002-invalid-html-card`
- [ ] 2. Corrigir aspas duplicadas: `<button class="wishlist-btn" ${...}" ` → remover `"` extra
- [ ] 3. **Criar teste CT-SCRIPT-03:** card gerado é parseável sem atributos duplicados
- [ ] 4. Atualizar #002 em `docs/ISSUES.md`
- [ ] 5. Commit: `[T1.4] fix: corrigir HTML inválido no wishlist-btn do card de produto`
- [ ] 6. PR → merge para main

#### T1.5 — Corrigir link quebrado em `collections.html`
- [ ] 1. Criar branch `fix/003-broken-link-collections`
- [ ] 2. Corrigir `href="../'pages/colares.html"` → `href="../pages/colares.html"`
- [ ] 3. Auditar todos os hrefs de `collections.html`
- [ ] 4. Atualizar #003 em `docs/ISSUES.md`
- [ ] 5. Commit: `[T1.5] fix: corrigir link para colares em collections.html`
- [ ] 6. PR → merge para main

---

### T2 — Catálogo e Cards de Produto

**Prioridade:** 🔴 Alta | **Depende de:** T1

#### T2.1 — Expandir estrutura de dados dos produtos
- [ ] 1. Criar branch `feature/T2.1-product-data-structure`
- [ ] 2. Adicionar campos `stones[]`, `metals{}`, `arEffects{}`, `models3d{}`, `sizes[]` nos produtos existentes
- [ ] 3. Adicionar no mínimo 3 produtos por categoria além do `featured`
- [ ] 4. Incluir `arEffects` e `models3d` com caminhos placeholder
- [ ] 5. **Criar teste PBT-P1:** todo produto tem `id` único, `price > 0`, `name` não vazio
- [ ] 6. Commit: `[T2.1] feat: expandir produtos com campos de variantes AR e 3D`
- [ ] 7. PR → merge para main

#### T2.2 — Implementar `createProductCard()` reutilizável
- [ ] 1. Criar branch `feature/T2.2-product-card`
- [ ] 2. Função retorna DOM com: imagem lazy, nome, preço, botão carrinho, botão wishlist, link para detalhe
- [ ] 3. `onerror` handler para imagens quebradas → placeholder
- [ ] 4. **Criar teste CT-CARD-01:** card com campos obrigatórios contém todos os elementos esperados
- [ ] 5. **Criar teste CT-CARD-02:** imagem inválida → elemento de placeholder visível
- [ ] 6. Commit: `[T2.2] feat: implementar createProductCard reutilizável`
- [ ] 7. PR → merge para main

---

### T3 — Página de Produto (Base para Try-On)

**Prioridade:** 🔴 Máxima | **Depende de:** T1, T2

#### T3.1 — Corrigir carregamento de produto por URL
- [ ] 1. Criar branch `fix/T3.1-product-loading`
- [ ] 2. `loadProductDetails()` busca em todas as categorias, não só `featured`
- [ ] 3. ID inválido → mensagem de erro + link para catálogo (sem exceção no console)
- [ ] 4. Popular breadcrumb dinamicamente
- [ ] 5. **Criar teste CT-PRODUCT-01:** ID inexistente → mensagem de erro no DOM, sem console.error
- [ ] 6. **Criar teste CT-PRODUCT-02:** ID válido → todos os elementos populados corretamente
- [ ] 7. Commit: `[T3.1] fix: buscar produto em todas as categorias, tratar ID inválido`
- [ ] 8. PR → merge para main

#### T3.2 — Implementar galeria Swiper com thumbnails
- [ ] 1. Criar branch `feature/T3.2-swiper-gallery`
- [ ] 2. Inicializar Swiper principal + thumbs com slides dinâmicos
- [ ] 3. **Criar teste CT-GALLERY-01:** galeria com 1 imagem não exibe botões prev/next
- [ ] 4. **Criar teste CT-GALLERY-02:** galeria com 3+ imagens exibe thumbnails
- [ ] 5. Commit: `[T3.2] feat: galeria Swiper principal + thumbnails sincronizados`
- [ ] 6. PR → merge para main

#### T3.3 — Implementar seleção de variante com evento customizado
- [ ] 1. Criar branch `feature/T3.3-variant-selection`
- [ ] 2. Botões de metal → marcar `.active` + atualizar imagem + disparar `productVariantChanged`
- [ ] 3. Controles de quantidade: `+`, `-` (mín 1), input com validação
- [ ] 4. **Criar teste CT-VARIANT-01:** selecionar metal 'white' dispara evento com `detail.metal === 'white'`
- [ ] 5. **Criar teste CT-VARIANT-02:** quantidade não pode ser < 1
- [ ] 6. Commit: `[T3.3] feat: seleção de variante com evento productVariantChanged`
- [ ] 7. PR → merge para main

#### T3.4 — Corrigir estrutura HTML do modal Try-On
- [ ] 1. Criar branch `fix/T3.4-tryon-modal-structure`
- [ ] 2. Adicionar `<canvas id="deepar-canvas">` dentro de `#try-on-modal`
- [ ] 3. Remover conflito de IDs entre `deepar-container` e o canvas
- [ ] 4. Adicionar `role="dialog"`, `aria-modal="true"`, `aria-label` nos controles
- [ ] 5. **Criar teste CT-MODAL-01:** após abrir modal, `#deepar-canvas` existe no DOM
- [ ] 6. Commit: `[T3.4] fix: estrutura HTML do modal Try-On com canvas DeepAR`
- [ ] 7. PR → merge para main

---

### T4 — AR Try-On — Módulo Principal 🎯

**Prioridade:** 🔴 MÁXIMA — Core do Produto | **Depende de:** T3

#### T4.1 — Criar módulo `js/ar-tryon.js` com classe `ARTryOn`
- [ ] 1. Criar branch `feature/T4.1-ar-tryon-class`
- [ ] 2. Implementar: `constructor(container, config)`, `init()`, `loadEffect()`, `switchEffect()`, `switchCamera()`, `takeScreenshot()`, `destroy()`, `on(event, handler)`
- [ ] 3. EventEmitter interno para: `ready`, `error`, `cameraPermissionDenied`
- [ ] 4. Exportar como módulo ES6
- [ ] 5. **Criar teste CT-AR-01:** init com câmera mockada → evento `ready` emitido
- [ ] 6. **Criar teste CT-AR-02:** NotAllowedError → evento `cameraPermissionDenied`, sem throw
- [ ] 7. **Criar teste CT-AR-03:** NotFoundError → evento `error` com code `no-camera`
- [ ] 8. Commit: `[T4.1] feat: criar classe ARTryOn com interface pública completa`
- [ ] 9. PR → merge para main

#### T4.2 — Implementar UX de permissão de câmera
- [ ] 1. Criar branch `feature/T4.2-camera-permission-ux`
- [ ] 2. Criar `css/ar-tryon.css` com estilos do componente
- [ ] 3. UI de "permissão necessária" com instrução por browser (Chrome, Firefox, Safari, iOS)
- [ ] 4. UI de "câmera não encontrada" com alternativa
- [ ] 5. **Criar teste CT-AR-02 (UX):** após negação, UI de permissão é renderizada com botão retry
- [ ] 6. Commit: `[T4.2] feat: UX completa de permissão de câmera por browser`
- [ ] 7. PR → merge para main

#### T4.3 — Integrar DeepAR SDK com efeitos por metal
- [ ] 1. Criar branch `feature/T4.3-deepar-integration`
- [ ] 2. Criar `js/config.js` (no `.gitignore`) + `js/config.example.js` (versionado)
- [ ] 3. Após câmera disponível → `DeepAR.initialize({ licenseKey, canvas })` + `loadEffect(effects[defaultMetal])`
- [ ] 4. **Criar teste CT-AR-04:** `switchEffect` não reinicializa câmera (stream é o mesmo)
- [ ] 5. **Criar teste:** falha no DeepAR.initialize → evento `error` code `sdk-init-failed`
- [ ] 6. Commit: `[T4.3] feat: integrar DeepAR SDK com carregamento de efeitos por metal`
- [ ] 7. PR → merge para main

#### T4.4 — Implementar fallback gracioso
- [ ] 1. Criar branch `feature/T4.4-ar-fallback`
- [ ] 2. Qualquer falha → exibir `config.fallbackImage` ou galeria do produto, sem quebrar página
- [ ] 3. Toast com mensagem amigável (sem jargão técnico)
- [ ] 4. **Criar teste CT-AR-03 (fallback):** após erro, fallback visível no DOM, sem exceção
- [ ] 5. Commit: `[T4.4] feat: fallback gracioso para falhas do AR Try-On`
- [ ] 6. PR → merge para main

#### T4.5 — Implementar troca de câmera
- [ ] 1. Criar branch `feature/T4.5-camera-switch`
- [ ] 2. Detectar câmera traseira via `enumerateDevices()`
- [ ] 3. Botão aparece apenas se câmera traseira disponível
- [ ] 4. **Criar teste:** `switchCamera()` com 1 câmera não lança exceção
- [ ] 5. **Criar teste:** após `switchCamera()`, stream anterior está stopped
- [ ] 6. Commit: `[T4.5] feat: troca de câmera frontal/traseira`
- [ ] 7. PR → merge para main

#### T4.6 — Captura de foto e compartilhamento
- [ ] 1. Criar branch `feature/T4.6-photo-capture`
- [ ] 2. `takeScreenshot()` → dataURL via `canvas.toDataURL()`
- [ ] 3. Modal preview com botão Download e botão Compartilhar (Web Share API + clipboard fallback)
- [ ] 4. **Criar teste CT-AR-05:** `takeScreenshot()` retorna string com `data:image/`
- [ ] 5. Commit: `[T4.6] feat: captura de foto com download e compartilhamento Web Share API`
- [ ] 6. PR → merge para main

#### T4.7 — Integrar ARTryOn na página de produto
- [ ] 1. Criar branch `feature/T4.7-tryon-product-integration`
- [ ] 2. Instanciar `ARTryOn` ao clicar "Experimentar Virtual"; destruir ao fechar modal
- [ ] 3. Escutar `productVariantChanged` → `arInstance.switchEffect(product.arEffects[metal])`
- [ ] 4. **Criar teste:** fechar modal → todos os tracks do stream estão stopped
- [ ] 5. **Criar teste:** `productVariantChanged` metal 'white' → `switchEffect` chamado com path correto
- [ ] 6. Commit: `[T4.7] feat: integrar ARTryOn na página de produto com sync de variantes`
- [ ] 7. PR → merge para main

---

### T5 — Visualizador 3D

**Prioridade:** 🟡 Alta | **Depende de:** T3

#### T5.1 — Integrar `<model-viewer>`
- [ ] 1. Criar branch `feature/T5.1-model-viewer`
- [ ] 2. Inserir dinamicamente quando `product.models3d` existe; ocultar botão se não existe
- [ ] 3. **Criar teste:** produto sem `models3d` → botão "Visualizar em 3D" não renderizado
- [ ] 4. Commit: `[T5.1] feat: integrar model-viewer para visualização 3D`
- [ ] 5. PR → merge para main

#### T5.2 — Sincronizar variante de metal no 3D
- [ ] 1. Criar branch `feature/T5.2-3d-metal-sync`
- [ ] 2. `productVariantChanged` → atualizar `model-viewer.src`
- [ ] 3. **Criar teste:** evento com metal disponível atualiza `src` do model-viewer
- [ ] 4. Commit: `[T5.2] feat: sincronizar metal com modelo 3D via productVariantChanged`
- [ ] 5. PR → merge para main

---

### T6 — Busca e Filtros

**Prioridade:** 🟡 Média | **Depende de:** T2

#### T6.1 — Debounce, filtro de pedras e limpar filtros
- [ ] 1. Criar branch `feature/T6.1-search-filters`
- [ ] 2. Debounce 300ms no search-input
- [ ] 3. Adicionar `stones[]` nos produtos e corrigir lógica de filtro
- [ ] 4. Botão "Limpar Filtros"
- [ ] 5. **Criar teste PBT-P3:** filtragem sempre correta (produto satisfaz filtro ↔ aparece no resultado)
- [ ] 6. Commit: `[T6.1] feat: debounce busca, filtro de pedras e limpar filtros`
- [ ] 7. PR → merge para main

---

### T7 — Integração Final AR + 3D + Variantes

**Prioridade:** 🟡 Média | **Depende de:** T4, T5

#### T7.1 — Sincronização completa via `productVariantChanged`
- [ ] 1. Criar branch `feature/T7.1-full-variant-sync`
- [ ] 2. Galeria + AR + 3D todos atualizados pelo mesmo evento
- [ ] 3. Try-On e 3D não podem estar abertos simultaneamente
- [ ] 4. **Criar teste:** `productVariantChanged` → 3 módulos recebem atualização
- [ ] 5. Commit: `[T7.1] feat: sincronização completa galeria+AR+3D via productVariantChanged`
- [ ] 6. PR → merge para main

---

### T8 — Testes PBT

**Prioridade:** 🟡 Média | **Depende de:** T1

#### T8.1 — Configurar Jest + fast-check
- [ ] 1. Criar branch `feature/T8.1-test-environment`
- [ ] 2. Criar `package.json`, `jest.config.js`, `tests/setup.js` (mock localStorage + MediaDevices)
- [ ] 3. `npm test` passando com placeholder
- [ ] 4. Commit: `[T8.1] chore: configurar Jest + fast-check para PBT`
- [ ] 5. PR → merge para main

#### T8.2 — Implementar propriedades P1–P6
- [ ] 1. Criar branch `feature/T8.2-pbt-properties`
- [ ] 2. P1 (carrinho), P2 (persistência), P3 (filtragem), P4 (wishlist idempotente) em `tests/pbt.test.js`
- [ ] 3. CT-AR-01 a CT-AR-06 em `tests/ar-tryon.test.js`
- [ ] 4. Todos passando com `npm test`
- [ ] 5. Commit: `[T8.2] test: propriedades PBT P1-P4 e testes unitários AR CT-AR-01 a 06`
- [ ] 6. PR → merge para main

---

### T9 — Mobile e Menu Hamburger

**Prioridade:** 🟡 Alta | **Depende de:** T1

#### T9.1 — Menu hamburger responsivo
- [ ] 1. Criar branch `feature/T9.1-hamburger-menu`
- [ ] 2. Botão hamburger visível em < 768px, toggle com overlay
- [ ] 3. **Criar teste:** viewport < 768px → menu oculto por padrão; clicar hamburger → menu visível
- [ ] 4. Commit: `[T9.1] feat: menu hamburger responsivo`
- [ ] 5. PR → merge para main

---

### T10 — Autenticação

**Prioridade:** 🟢 Baixa | **Depende de:** T1

#### T10.1 — Completar métodos vazios de `auth.js`
- [ ] 1. Criar branch `feature/T10.1-auth-methods`
- [ ] 2. Implementar `updateProfile`, `changePassword`, `resetPassword`
- [ ] 3. Timeout de sessão de 24h
- [ ] 4. **Criar teste PBT-P4:** sessionStorage nunca contém senha em texto plano
- [ ] 5. Commit: `[T10.1] feat: completar métodos auth e timeout de sessão`
- [ ] 6. PR → merge para main

---

### T11 — Documentação

**Prioridade:** 🟢 Média | **Depende de:** T4

#### T11.1 — CONTRIBUTING.md e README atualizados
- [ ] 1. Criar branch `docs/T11.1-contributing-readme`
- [ ] 2. `CONTRIBUTING.md` com fluxo Git completo, padrões, como adicionar produtos e efeitos DeepAR
- [ ] 3. `README.md` com como executar localmente, configurar DeepAR, estrutura do projeto
- [ ] 4. Commit: `[T11.1] docs: CONTRIBUTING.md completo e README atualizado`
- [ ] 5. PR → merge para main

---

## Notes

### Fluxo Git Obrigatório em Toda Task

```
1. git checkout main && git pull
2. git checkout -b feature/T{id}-{slug}
3. Desenvolver + criar testes
4. npm test (todos passando)
5. git commit -m "[T{id}] {tipo}: {descrição}"
6. Abrir PR com descrição + screenshots
7. Merge para main
8. Atualizar docs/ISSUES.md
```

### Foco do Projeto

O componente **AR Try-On** (`T4`) é o core differentiator — é o produto que será vendido para joalherias clientes. Toda a arquitetura deve suportar que este módulo seja embarcável de forma isolada em sites de terceiros no futuro.

### Ourives Parceiro

Os arquivos `.deepar` (efeitos AR) e `.glb` (modelos 3D) são fornecidos pelo ourives parceiro. Os caminhos em `arEffects` e `models3d` são placeholders até que os arquivos reais sejam entregues.
