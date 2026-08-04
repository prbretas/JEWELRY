# Issues — Joalheria Virtual

**Data de criação:** 2026-08-04  
**Baseado em:** Análise completa do repositório + REVIEW_REPORT.md

Legenda: 🔴 Crítico | 🟡 Importante | 🟢 Melhoria | 💡 Inovação | 🌟 Diferencial

---

## 🔴 BUGS CRÍTICOS (Correções imediatas)

### #001 — `const` reatribuídas em `ensureElements()` causam TypeError
**Arquivo:** `js/script.js`  
**Problema:** Variáveis DOM como `wishlistIcon`, `cartModal` são declaradas como `const` mas `ensureElements()` tenta reatribuí-las, causando `TypeError: Assignment to constant variable`.  
**Solução:** Converter para `let` ou remover `ensureElements()` e usar queries inline.

✅ **Resolvido em 2026-08-04 via branch `fix/wave1-critical-js-bugs` — T1.1**

---

### #002 — HTML inválido no card de produto (aspas extras)
**Arquivo:** `js/script.js` (função `displayProducts`)  
**Problema:** A linha `<button class="wishlist-btn" ${...}" ` tem aspas extras que geram HTML inválido e podem causar erros visuais ou de parsing.  
**Solução:** Remover o `"` extra após o atributo condicional.

✅ **Resolvido em 2026-08-04 via branch `fix/wave1-critical-js-bugs` — T1.4**

---

### #003 — Link quebrado em `collections.html`
**Arquivo:** `pages/collections.html`  
**Problema:** `href="../'pages/colares.html"` — apóstrofo indevido no caminho gera 404.  
**Solução:** Corrigir para `href="../pages/colares.html"`.

✅ **Resolvido em 2026-08-04 — link já estava correto na versão atual do arquivo (T1.5)**

---

### #004 — `closeCartModal` não definida globalmente
**Arquivo:** `js/script.js`, `index.html`  
**Problema:** `index.html` chama `onclick="closeCartModal()"` mas a função não é definida explicitamente como named function exposta no `window`.  
**Solução:** Adicionar `window.closeCartModal = function() { if(cartModal) cartModal.style.display = 'none'; };`

✅ **Resolvido em 2026-08-04 via branch `fix/wave1-critical-js-bugs` — T1.2**  
- `closeCartModal` e `closeWishlistModal` adicionadas como funções nomeadas  
- Expostas via `window.closeCartModal` e `window.closeWishlistModal`  
- `onclick` inline removidos do `index.html`

---

### #005 — `variantKey` não incluído no item ao adicionar ao carrinho
**Arquivo:** `js/script.js` (função `addToCart`)  
**Problema:** `removeFromCart(variantKey)` busca por `item.variantKey`, mas ao adicionar ao carrinho o objeto não inclui esse campo, tornando a remoção inoperante.  
**Solução:** Incluir `variantKey: \`${product.id}-${product.selectedSize}-${product.selectedMetal}\`` ao fazer push no array `cart`.

✅ **Resolvido em 2026-08-04 — variantKey já estava sendo incluído corretamente no addToCart (T1.3)**

---

### #006 — DeepAR sem chave de licença válida
**Arquivo:** `js/product-detail.js`  
**Problema:** `licenseKey: 'your_deepar_license_key_here'` — o AR Try-On não funciona sem chave real.  
**Solução:** Criar `js/config.js` com a chave real e adicionar ao `.gitignore`; documentar no README como obter chave em developer.deepar.ai.

---

## 🟡 BUGS IMPORTANTES (Correção a curto prazo)

### #007 — Filtro de pedras não funciona
**Arquivo:** `js/script.js`  
**Problema:** `product.details?.stones` não existe na estrutura atual do produto — nenhum produto tem o campo `stones[]`, então o filtro nunca filtra nada.  
**Solução:** Adicionar `stones: ['diamond']` (ou similar) nos dados de produto e corrigir a lógica de filtragem.

---

### #008 — Catálogo vazio nas páginas de categoria
**Arquivos:** `pages/aneis.html`, `colares.html`, `brincos.html`, `pulseiras.html`  
**Problema:** `products.aneis`, `products.colares` etc. são arrays vazios `[]`; as páginas de categoria não exibem nenhum produto.  
**Solução:** Popular o catálogo com produtos por categoria.

---

### #009 — `processCheckout` declarado como inline no HTML
**Arquivo:** `index.html`  
**Problema:** `onclick="processCheckout()"` no botão de checkout — mistura comportamento no HTML, difícil de manter e pode gerar erros em páginas onde `processCheckout` não está definido.  
**Solução:** Remover o inline e usar apenas o listener no JS.

✅ **Resolvido em 2026-08-04 via branch `fix/wave1-critical-js-bugs` — T1.2**  
- `onclick="processCheckout()"` removido do `index.html`  
- Listener adicionado via `checkoutBtnEl.addEventListener('click', processCheckout)` no DOMContentLoaded

---

### #010 — Métodos vazios em `auth.js`
**Arquivo:** `js/auth.js`  
**Problema:** `updateProfile()`, `changePassword()`, `resetPassword()` são stubs sem implementação real.  
**Solução:** Implementar lógica completa (mesmo que simulada) conforme T8.1 nas tasks.

---

### #011 — 3D Viewer não implementado
**Arquivo:** `js/product-detail.js`, `pages/product-detail.html`  
**Problema:** Botão "Visualizar em 3D" existe na UI mas não tem implementação — apenas um TODO no código.  
**Solução:** Integrar `<model-viewer>` (ver T7 nas tasks).

---

### #012 — Sem menu hamburger no mobile
**Arquivos:** todos os `.html`  
**Problema:** Em telas < 768px, o menu de navegação transborda ou fica inacessível — nenhum botão hamburger implementado.  
**Solução:** Implementar hamburger menu (ver T9.1 nas tasks).

---

### #013 — `id="deepar-container"` e `id="try-on-modal"` inconsistentes
**Arquivo:** `pages/product-detail.html`, `js/product-detail.js`  
**Problema:** O JS cria config com `canvas: document.getElementById('deepar-container')` mas o modal usa `id="try-on-modal"` e o canvas DeepAR deveria estar dentro do modal.  
**Solução:** Padronizar — criar `<canvas id="deepar-canvas">` dentro do `#try-on-modal`.

---

## 🟢 MELHORIAS DE QUALIDADE

### #014 — Debounce na busca
**Arquivo:** `js/script.js`  
**Problema:** A cada tecla digitada na busca, `applyFiltersAndSearch()` pode ser chamada, causando re-renders desnecessários.  
**Solução:** Aplicar debounce de 300ms no listener do `search-input`.

---

### #015 — Sem controle de quantidade no modal do carrinho
**Arquivo:** `js/script.js`, `index.html`  
**Problema:** O usuário não pode alterar a quantidade de um item no carrinho depois de adicionado — só pode remover.  
**Solução:** Adicionar botões `+` e `-` por item no modal do carrinho.

---

### #016 — Sem botão "Limpar Filtros"
**Arquivo:** `index.html`  
**Problema:** Uma vez que filtros são aplicados, não há como resetar para o estado inicial sem recarregar a página.  
**Solução:** Adicionar botão "Limpar Filtros" que reseta `activeFilters` e reexibe todos os produtos.

---

### #017 — `alert()` residual em `contact.html`
**Arquivo:** `pages/contact.html`  
**Problema:** Formulário de contato ainda usa `alert()` nativo para feedback, inconsistente com o padrão `showToast()`.  
**Solução:** Substituir por `showToast()`.

---

### #018 — Imagens sem lazy loading
**Arquivos:** todos os HTMLs com imagens de produto  
**Problema:** Imagens de produto carregam todas de uma vez, impactando performance inicial.  
**Solução:** Adicionar `loading="lazy"` em todas as imagens fora do viewport inicial.

---

### #019 — Sem timeout de sessão de autenticação
**Arquivo:** `js/auth.js`  
**Problema:** A sessão em `sessionStorage` nunca expira — um usuário "logado" meses atrás ainda aparece como logado se a aba não for fechada.  
**Solução:** Verificar `loggedInAt` e fazer logout automático após 24h (T8.3).

---

### #020 — Accordion na página de produto sem animação suave
**Arquivo:** `css/product-detail.css`  
**Problema:** O accordion abre/fecha sem transição de altura, experiência abrupta.  
**Solução:** Implementar transição CSS com `max-height` ou usar `<details>/<summary>` nativos.

---

## 💡 NOVAS FUNCIONALIDADES

### #021 — Página de Perfil do Usuário
**Descrição:** Criar `pages/profile.html` com formulário de edição de dados, histórico de pedidos simulado e wishlist sincronizada.  
**Prioridade:** 🟡 Média

---

### #022 — Compartilhamento da Wishlist via Web Share API
**Descrição:** Implementar botão "Compartilhar Lista" usando `navigator.share()` (mobile) com fallback para copiar link no clipboard.  
**Prioridade:** 🟡 Média

---

### #023 — Sistema de Newsletter funcional
**Descrição:** O formulário de newsletter no footer atual não faz nada. Integrar com um serviço gratuito (ex: Mailchimp API ou Formspree).  
**Prioridade:** 🟢 Baixa

---

### #024 — Mapa de lojas funcional
**Arquivo:** `pages/stores.html`  
**Descrição:** Integrar mapa real (Google Maps Embed API gratuito) com marcadores das lojas físicas.  
**Prioridade:** 🟢 Baixa

---

### #025 — Sistema de avaliações de produto
**Descrição:** Adicionar seção de reviews/avaliações na página de detalhe do produto, com estrelas e comentários (simulados inicialmente).  
**Prioridade:** 🟡 Média

---

### #026 — Rastreamento de pedido funcional
**Arquivo:** `pages/track-order.html`  
**Descrição:** A página existe mas não tem funcionalidade. Implementar busca por código simulado com status de pedido.  
**Prioridade:** 🟡 Média

---

## 🌟 INOVAÇÕES E DIFERENCIAIS

### #027 — AR Try-On com DeepAR — Implementação Real
**Descrição:** Principal diferencial do produto. Efeitos AR reais para todas as categorias (brincos, colares, anéis, pulseiras) por variante de metal, com captura e compartilhamento de foto.  
**Impacto:** Altíssimo — é o core differentiator  
**Prioridade:** 🔴 Crítico  
**Ref:** T6 no tasks.md, ar-tryon-guide.md

---

### #028 — 3D Viewer com model-viewer
**Descrição:** Integrar `<model-viewer>` para visualização 3D interativa de joias, com rotação, zoom e AR nativo em dispositivos compatíveis (WebXR).  
**Impacto:** Alto — diferencial de experiência de produto  
**Prioridade:** 🟡 Média  
**Ref:** T7 no tasks.md

---

### #029 — Foto com joia AR para compartilhamento social
**Descrição:** Capturar foto durante o AR Try-On e oferecer compartilhamento nativo (Instagram Stories, WhatsApp, etc.) via Web Share API. Gerar engajamento orgânico.  
**Impacto:** Alto — viral loop de marketing  
**Prioridade:** 🟡 Média  
**Ref:** T6.5 no tasks.md

---

### #030 — Personalização de joias (Fase futura)
**Descrição:** Permitir que o usuário escolha pedras, gravação e acabamento personalizado antes de comprar. Visualização em tempo real da peça customizada.  
**Impacto:** Altíssimo — experiência única no mercado  
**Prioridade:** 🟢 Fase 5 do roadmap

---

### #031 — Recomendações por IA
**Descrição:** Com base no histórico de navegação e wishlist, sugerir produtos similares ou complementares. Implementar com filtro colaborativo simples inicialmente.  
**Impacto:** Alto — aumenta conversão e ticket médio  
**Prioridade:** 🟢 Fase futura

---

## Resumo por Prioridade

| Prioridade | Qtd | Issues |
|-----------|-----|--------|
| 🔴 Crítico | 7 | #001 a #006, #027 |
| 🟡 Importante | 10 | #007 a #013, #021, #025, #026 |
| 🟢 Melhoria | 7 | #014 a #020 |
| 💡 Nova Feature | 4 | #022, #023, #024, #029 |
| 🌟 Inovação | 3 | #028, #030, #031 |

**Total: 31 issues identificadas**
