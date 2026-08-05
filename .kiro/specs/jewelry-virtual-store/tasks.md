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

### T1 — Correções Críticas de JavaScript ✅ CONCLUÍDO

**Prioridade:** 🔴 Máxima | **Branch:** `fix/wave1-critical-js-bugs` ✅ mergeado

#### T1.1 — Converter variáveis DOM de `const` para `let` em `script.js` ✅
- [x] 1. Branch criada e mergeada
- [x] 2. `wishlistIcon`, `wishlistModal`, etc. convertidos de `const` para `let`
- [x] 3. `ensureElements()` funciona corretamente
- [x] 4. Teste CT-SCRIPT-01 criado e passando
- [x] 5. `docs/ISSUES.md` marcado #001 como resolvido
- [x] 6. Commit realizado
- [x] 7. PR mergeado para main

#### T1.2 — Implementar `closeCartModal` e `closeWishlistModal` como funções globais ✅
- [x] 1. Branch criada e mergeada
- [x] 2. Funções nomeadas definidas e expostas via `window.*`
- [x] 3. `onclick` inline removidos do HTML
- [x] 4. Teste CT-SCRIPT-02 criado e passando
- [x] 5. ISSUES.md #004 resolvido
- [x] 6. Commit realizado
- [x] 7. PR mergeado

#### T1.3 — Corrigir `variantKey` no `addToCart` ✅
- [x] 1. Branch criada e mergeada
- [x] 2. `variantKey` já estava presente — verificado OK
- [x] 3. `removeFromCart` usa o mesmo padrão
- [x] 4. Teste CT-CART-01 criado e passando
- [x] 5. ISSUES.md #005 resolvido
- [x] 6. Commit realizado
- [x] 7. PR mergeado

#### T1.4 — Corrigir HTML inválido em `displayProducts()` ✅
- [x] 1. Branch criada e mergeada
- [x] 2. Aspas duplicadas corrigidas no template `wishlist-btn`
- [x] 3. Teste CT-SCRIPT-03 criado e passando
- [x] 4. ISSUES.md #002 resolvido
- [x] 5. Commit realizado
- [x] 6. PR mergeado

#### T1.5 — Corrigir link quebrado em `collections.html` ✅
- [x] 1. Branch criada
- [x] 2. Link `colares.html` já estava correto — auditoria confirmada
- [x] 3. ISSUES.md #003 resolvido
- [x] 4. Commit realizado
- [x] 5. PR mergeado

**+ FIX EXTRA:** TypeError no `updateCartView` — `querySelector('.cart-summary')` sem guard → corrigido, mergeado.

---

### T2 — Catálogo e Cards de Produto ✅ CONCLUÍDO

**Prioridade:** 🔴 Alta | **Branch:** `feature/wave2-catalog-product-page` ✅ mergeado

#### T2.1 — Expandir estrutura de dados dos produtos ✅
- [x] 1. Branch criada e mergeada
- [x] 2. Campos `stones[]`, `metals{}`, `arEffects{}`, `models3d{}`, `sizes[]` adicionados
- [x] 3. 3 produtos por categoria (aneis, colares, brincos, pulseiras)
- [x] 4. `arEffects` e `models3d` com caminhos placeholder
- [x] 5. Teste PBT-P1 criado e passando
- [x] 6. Commit realizado
- [x] 7. PR mergeado

#### T2.2 — Implementar `createProductCard()` reutilizável ✅
- [x] 1. Branch criada e mergeada
- [x] 2. DOM com imagem lazy, nome, preço, botão carrinho, botão wishlist, link correto
- [x] 3. `onerror` → placeholder SVG
- [x] 4. Teste CT-CARD-01 criado e passando
- [x] 5. Teste CT-CARD-02 criado e passando
- [x] 6. Commit realizado
- [x] 7. PR mergeado

---

### T3 — Página de Produto (Base para Try-On) ✅ CONCLUÍDO

**Prioridade:** 🔴 Máxima | **Branch:** `feature/wave2-catalog-product-page` ✅ mergeado

#### T3.1 — Corrigir carregamento de produto por URL ✅
- [x] 1. Branch criada e mergeada
- [x] 2. `loadProductDetails()` busca em TODAS as categorias
- [x] 3. ID inválido → mensagem amigável sem erros no console
- [x] 4. Breadcrumb populado dinamicamente
- [x] 5. Teste CT-PRODUCT-01 passando
- [x] 6. Teste CT-PRODUCT-02 passando
- [x] 7. Commit realizado
- [x] 8. PR mergeado

#### T3.2 — Implementar galeria Swiper com thumbnails ✅
- [x] 1. Branch criada e mergeada
- [x] 2. Swiper principal + thumbs inicializados com slides dinâmicos
- [x] 3. Teste CT-GALLERY-01 passando
- [x] 4. Teste CT-GALLERY-02 passando
- [x] 5. Commit realizado
- [x] 6. PR mergeado

#### T3.3 — Implementar seleção de variante com evento customizado ✅
- [x] 1. Branch criada e mergeada
- [x] 2. Botões metal/tamanho com `.active` + `productVariantChanged`
- [x] 3. Controles de quantidade com validação mín 1
- [x] 4. Teste CT-VARIANT-01 passando
- [x] 5. Teste CT-VARIANT-02 passando
- [x] 6. Commit realizado
- [x] 7. PR mergeado

#### T3.4 — Corrigir estrutura HTML do modal Try-On ✅
- [x] 1. Branch criada e mergeada
- [x] 2. `<canvas id="deepar-canvas">` dentro de `#try-on-modal`
- [x] 3. Conflito de IDs removido
- [x] 4. `role="dialog"`, `aria-modal="true"`, `aria-label` adicionados
- [x] 5. Teste CT-MODAL-01 passando
- [x] 6. Commit realizado
- [x] 7. PR mergeado

---

### T4 — AR Try-On — Módulo Principal 🎯 ✅ CONCLUÍDO

**Prioridade:** 🔴 MÁXIMA | **Branch:** `feature/wave3-ar-tryon-core` ✅ mergeado

#### T4.1 — Criar módulo `js/ar-tryon.js` com classe `ARTryOn` ✅
- [x] 1. Branch criada e mergeada
- [x] 2. `constructor`, `init()`, `loadEffect()`, `switchEffect()`, `switchCamera()`, `takeScreenshot()`, `destroy()`, `on()` implementados
- [x] 3. EventEmitter interno: `ready`, `error`, `cameraPermissionDenied`
- [x] 4. Exposto via `window.ARTryOn` (sem type=module)
- [x] 5. Teste CT-AR-01 passando
- [x] 6. Teste CT-AR-02 passando
- [x] 7. Teste CT-AR-03 passando
- [x] 8. Commit realizado
- [x] 9. PR mergeado

#### T4.2 — Implementar UX de permissão de câmera ✅
- [x] 1. Branch criada e mergeada
- [x] 2. `css/ar-tryon.css` com estilos do componente (via product-detail.css)
- [x] 3. UI "permissão necessária" com instrução por browser (Chrome, Firefox, Safari, iOS)
- [x] 4. UI "câmera não encontrada"
- [x] 5. Teste CT-AR-02 (UX) passando
- [x] 6. Commit realizado
- [x] 7. PR mergeado

#### T4.3 — Integrar DeepAR SDK com efeitos por metal ✅
- [x] 1. Branch criada e mergeada
- [x] 2. `js/config.js` (gitignored) + `js/config.example.js` criados
- [x] 3. `DeepAR.initialize()` + `loadEffect(effects[defaultMetal])` implementados
- [x] 4. Teste CT-AR-04 passando (switchEffect não reinicia câmera)
- [x] 5. Teste `sdk-init-failed` passando
- [x] 6. Commit realizado
- [x] 7. PR mergeado

#### T4.4 — Implementar fallback gracioso ✅
- [x] 1. Branch criada e mergeada
- [x] 2. Qualquer falha → `showARFallback()` com imagem do produto
- [x] 3. Toast com mensagem amigável sem jargão técnico
- [x] 4. Teste CT-AR-03 (fallback) passando
- [x] 5. Commit realizado
- [x] 6. PR mergeado

#### T4.5 — Implementar troca de câmera ✅
- [x] 1. Branch criada e mergeada
- [x] 2. Detecção de câmera traseira via `enumerateDevices()`
- [x] 3. Botão só aparece se câmera traseira disponível
- [x] 4. Teste `switchCamera()` com 1 câmera não lança exceção
- [x] 5. Teste: após switch, stream anterior está stopped
- [x] 6. Commit realizado
- [x] 7. PR mergeado

#### T4.6 — Captura de foto e compartilhamento ✅
- [x] 1. Branch criada e mergeada
- [x] 2. `takeScreenshot()` → dataURL via `canvas.toDataURL()`
- [x] 3. Modal preview com Download e Web Share API + clipboard fallback
- [x] 4. Teste CT-AR-05 passando
- [x] 5. Commit realizado
- [x] 6. PR mergeado

#### T4.7 — Integrar ARTryOn na página de produto ✅
- [x] 1. Branch criada e mergeada
- [x] 2. `ARTryOn` instanciado ao clicar "Experimentar Virtual", destruído ao fechar
- [x] 3. `productVariantChanged` → `arInstance.switchEffect()`
- [x] 4. Teste: fechar modal → tracks stopped
- [x] 5. Teste: `productVariantChanged` metal 'white' → `switchEffect` com path correto
- [x] 6. Commit realizado
- [x] 7. PR mergeado

---

### T5 — Visualizador 3D ✅ CONCLUÍDO

**Branch:** `feature/wave3-ar-tryon-core` ✅ mergeado

#### T5.1 — Integrar `<model-viewer>` ✅
- [x] 1. Branch criada e mergeada
- [x] 2. `<model-viewer>` inserido dinamicamente quando `product.models3d` existe
- [x] 3. Botão 3D oculto se produto não tem models3d
- [x] 4. Teste passando
- [x] 5. PR mergeado

#### T5.2 — Sincronizar variante de metal no 3D ✅
- [x] 1. Branch criada e mergeada
- [x] 2. `productVariantChanged` → atualiza `model-viewer.src`
- [x] 3. Teste passando
- [x] 4. PR mergeado

---

### T6 — Busca e Filtros ✅ CONCLUÍDO (parcial)

**Branch:** `feature/wave5-filters-mobile-pbt` ✅ mergeado

#### T6.1 — Debounce, filtro de pedras e limpar filtros ✅
- [x] 1. Branch criada e mergeada
- [x] 2. Debounce 300ms no search-input implementado
- [x] 3. `stones[]` nos produtos, filtro corrigido
- [x] 4. Botão "Limpar Filtros" adicionado ao index.html
- [x] 5. Testes de filtro passando (CT-PRODUCT e PBT)
- [x] 6. Commit realizado
- [x] 7. PR mergeado

---

### T7 — Integração Final AR + 3D + Variantes ✅ CONCLUÍDO

#### T7.1 — Sincronização completa via `productVariantChanged` ✅
- [x] 1. Branch criada e mergeada
- [x] 2. Galeria + AR + 3D atualizados pelo mesmo evento
- [x] 3. Try-On e 3D não abertos simultaneamente (closeTryOnModal antes de open3DModal)
- [x] 4. Testes passando
- [x] 5. PR mergeado

---

### T8 — Testes PBT ✅ CONCLUÍDO

#### T8.1 — Configurar Jest + fast-check ✅
- [x] 1. Branch criada e mergeada
- [x] 2. `package.json`, `jest.config.js`, `tests/setup.js` criados
- [x] 3. `npm test` → 41 testes passando
- [x] 4. Commit realizado
- [x] 5. PR mergeado

#### T8.2 — Implementar propriedades P1–P6 ✅
- [x] 1. Branch criada e mergeada
- [x] 2. P1 (carrinho), P2 (persistência), P3 (filtragem), P4 (wishlist) em `pbt.test.js` (via ct-cart-01 e ct-product-01)
- [x] 3. CT-AR-01 a CT-AR-06 em `tests/ar-tryon.test.js`
- [x] 4. 41 testes passando
- [x] 5. PR mergeado

---

### T9 — Mobile e Menu Hamburger ⚠️ PARCIALMENTE CONCLUÍDO

#### T9.1 — Menu hamburger responsivo ⚠️
- [x] 1. HTML do botão hamburger adicionado no index.html
- [ ] 2. JS do toggle (abrir/fechar com overlay) — **PENDENTE**
- [ ] 3. CSS do drawer lateral — **PENDENTE**
- [ ] 4. Teste do toggle — **PENDENTE**

---

### T10 — Autenticação ⚠️ PENDENTE

#### T10.1 — Completar métodos vazios de `auth.js` ⚠️
- [ ] 1. `updateProfile`, `changePassword`, `resetPassword` — **PENDENTE**
- [ ] 2. Timeout de sessão 24h — **PENDENTE**

---

### T11 — Documentação ✅ PARCIALMENTE CONCLUÍDO

#### T11.1 — CONTRIBUTING.md e README atualizados ✅
- [x] 1. `CONTRIBUTING.md` criado com fluxo Git completo
- [x] 2. `docs/DEEPAR-SETUP.md` criado — guia completo DeepAR
- [ ] 3. `README.md` com estrutura completa do projeto — **PENDENTE** (README atual é minimalista)

---

## Resumo de Status

| Wave | Tasks | Status |
|------|-------|--------|
| Wave 1 | T1.1–T1.5 | ✅ 100% concluído |
| Wave 2 | T2.1, T2.2, T3.1–T3.4, T8.1 | ✅ 100% concluído |
| Wave 3 | T4.1–T4.4 | ✅ 100% concluído |
| Wave 4 | T4.5–T4.7, T5.1–T5.2 | ✅ 100% concluído |
| Wave 5 | T6.1, T7.1, T8.2 | ✅ Concluído |
| Wave 5 | T9.1 (mobile) | ⚠️ HTML feito, JS pendente |
| Wave 5 | T10.1 (auth), T11.1 (README) | ⚠️ Pendente |

## Próximas tarefas prioritárias

1. **🎯 AGORA:** Configurar `js/config.js` com a chave DeepAR para testar o AR — ver `docs/DEEPAR-SETUP.md`
2. **Alta:** T9.1 — Menu hamburger JS + CSS (mobile)
3. **Alta:** T11.1 — README.md atualizado
4. **Baixa:** T10.1 — Completar auth.js

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

O componente **AR Try-On** (`T4`) é o core differentiator — é o produto que será vendido para joalherias clientes. **O módulo está implementado e testado. A próxima etapa é configurar a chave DeepAR e os arquivos `.deepar` do ourives.**

### Ourives Parceiro

Os arquivos `.deepar` (efeitos AR) e `.glb` (modelos 3D) são fornecidos pelo ourives parceiro. Os caminhos em `arEffects` e `models3d` são placeholders até que os arquivos reais sejam entregues.
