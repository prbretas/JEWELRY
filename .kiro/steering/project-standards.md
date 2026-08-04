---
inclusion: auto
---

# Padrões de Desenvolvimento — Joalheria Virtual

## Modelo de Negócio (Sempre lembrar)

- **Produto principal (B2B):** Widget/SDK de AR Try-On vendido para joalherias (ex: Prata e Prata)
- **Vitrine demo (B2C):** O site JEWELRY demonstra a tecnologia; joias criadas pelo ourives parceiro
- **Core a desenvolver:** Componente AR Try-On — é o coração do produto que será licenciado

---

## Fluxo Git Obrigatório

**TODA tarefa deve seguir este fluxo sem exceção:**

```bash
# 1. Criar branch a partir de main (NUNCA desenvolver direto na main)
git checkout main && git pull origin main
git checkout -b feature/T{id}-{slug-descritivo}
# ex: feature/T4.2-camera-permission-ux
# ex: fix/001-const-reassignment

# 2. Desenvolver + criar testes

# 3. Garantir que testes passam
npm test

# 4. Commit com padrão
git commit -m "[T{id}] {tipo}: {descrição curta em português}"
# Tipos: feat | fix | refactor | test | docs | chore
# ex: "[T4.2] feat: implementar UX de permissão de câmera"

# 5. Push e abrir PR
git push -u origin feature/T4.2-camera-permission-ux
# Abrir PR no GitHub com:
# - Título: [T4.2] feat: implementar UX de permissão de câmera
# - Descrição: o que mudou + como testar
# - Screenshot/GIF se mudança visual
# - "Closes #002" ou "Related to T4.2"

# 6. Após merge: atualizar docs/ISSUES.md marcando a issue como resolvida
```

### Convenção de nomes de branch

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Nova feature | `feature/T{id}-{slug}` | `feature/T4.3-deepar-integration` |
| Bug fix | `fix/{issue-id}-{slug}` | `fix/001-const-reassignment` |
| Documentação | `docs/{slug}` | `docs/update-contributing` |
| Refactor | `refactor/{slug}` | `refactor/ar-module-isolation` |

---

## Criação de Casos de Teste (Obrigatório antes do PR)

**Toda feature deve ter pelo menos:**
- 1 teste de caminho feliz (funciona como esperado)
- 1 teste de caminho triste (erro ou estado inválido não quebra)
- 1 teste de edge case (valor vazio, null, limite)

**Nomear testes com prefixo CT (Caso de Teste):**
```javascript
// CT-AR-01: nome descritivo do que está sendo testado
// CT-CART-03: nome descritivo
```

**Rodar testes antes de qualquer commit:**
```bash
npm test             # todos os testes
npm test -- --watch  # modo watch durante desenvolvimento
```

---

## Documentação de Issues (Obrigatório após PR)

Ao resolver qualquer bug ou implementar feature:
1. Abrir `docs/ISSUES.md`
2. Localizar a issue correspondente
3. Marcar como `✅ Resolvido` com data e número do PR:
   ```
   ✅ Resolvido em 2026-08-10 via PR #42
   ```

---

## Stack e Tecnologias

- **Frontend:** HTML5, CSS3 (custom properties), JavaScript ES6+ (módulos)
- **CSS Framework:** Bootstrap 5.3 (apenas layout/grid; estilos customizados prevalecem)
- **Ícones:** Font Awesome 6
- **Slider/Galeria:** Swiper 10 (NÃO usar Splide.js — foi removido)
- **AR Try-On:** DeepAR SDK (cdn.deepar.ai)
- **3D Viewer:** `<model-viewer>` Web Component (Google)
- **Testes:** Jest + fast-check (PBT)
- **Hospedagem:** GitHub Pages

---

## Regras Obrigatórias de Código JavaScript

1. **Todo `getElementById` e `querySelector` DEVE ter guard** — verificar existência antes de usar
2. **NUNCA usar `alert()` ou `confirm()` nativos** — usar `showToast()` ou modal Bootstrap
3. **Erros DEVEM ser logados com `logError(error, context)`** — não `console.error` direto
4. **Funções públicas DEVEM ser documentadas com JSDoc**
5. **Variáveis DOM compartilhadas DEVEM ser `let`** (não `const` se reatribuídas)
6. **Feedback de loading DEVE usar classes `.button-loading` e `.loading-overlay`**
7. **Ao criar módulo AR:** usar `export class ARTryOn` e nunca poluir `window.*`

---

## Globals Expostos no `window` (script.js)

```javascript
window.addToCart(product)
window.toggleWishlist(id, btn)
window.closeCartModal()
window.closeWishlistModal()
window.processCheckout()
window.showToast(message, type)   // 'success' | 'error' | 'warning' | 'info'
window.logError(error, context)
window.products                    // catálogo completo
```

---

## Estrutura de Produto (Obrigatório)

```javascript
{
  id: Number,
  name: String,
  price: Number,
  image: String,
  images: String[],
  category: 'aneis' | 'colares' | 'brincos' | 'pulseiras',
  description: String,
  details: Object,
  sizes: String[],
  stones: String[],          // ['diamond', 'sapphire', etc.]
  metals: {                  // imagens por metal
    yellow?: String, white?: String, rose?: String, silver?: String
  },
  arEffects: {               // paths .deepar por metal
    yellow?: String, white?: String, rose?: String, silver?: String
  },
  models3d: {                // paths .glb por metal
    yellow?: String, white?: String, rose?: String, silver?: String
  }
}
```

---

## Padrões de Nomenclatura

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Funções | camelCase | `loadProductDetails()` |
| Classes | PascalCase | `ARTryOn` |
| Constantes | UPPER_SNAKE | `CART_KEY` |
| CSS classes | kebab-case | `.product-card` |
| IDs HTML | kebab-case | `#cart-modal` |
| Arquivos | kebab-case | `ar-tryon.js` |
| Branches Git | kebab-case | `feature/T4.2-camera-ux` |
| Commits | prefixo padrão | `[T4.2] feat: ...` |
