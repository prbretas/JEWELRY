# Contributing — Joalheria Virtual

## Fluxo Git Obrigatório

**Nunca desenvolver diretamente na `main`.** Todo trabalho segue este fluxo:

### 1. Criar branch

```bash
# Sempre partir da main atualizada
git checkout main
git pull origin main

# Criar branch com padrão
git checkout -b feature/T4.2-camera-permission-ux
# ou
git checkout -b fix/001-const-reassignment
# ou
git checkout -b docs/update-readme
```

**Convenção de nomes:**
| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Feature | `feature/T{id}-{slug}` | `feature/T4.3-deepar-integration` |
| Bug fix | `fix/{issue-id}-{slug}` | `fix/001-const-reassignment` |
| Documentação | `docs/{slug}` | `docs/update-contributing` |
| Refactor | `refactor/{slug}` | `refactor/ar-module-isolation` |

---

### 2. Desenvolver

- Trabalhar na branch criada
- Manter commits pequenos e atômicos
- **Criar casos de teste antes de abrir o PR**

---

### 3. Criar testes

**Obrigatório antes de qualquer PR.** Toda feature deve ter:
- Pelo menos 1 teste de caminho feliz
- Pelo menos 1 teste de erro/falha
- Pelo menos 1 teste de edge case

```bash
npm test              # rodar todos os testes
npm test -- --watch   # modo watch durante desenvolvimento
```

Os testes ficam em `tests/`. Nomear com prefixo `CT` (Caso de Teste):
```javascript
// CT-AR-01: inicialização com câmera disponível emite evento ready
// CT-CART-03: remover item com variantKey inexistente não lança exceção
```

---

### 4. Commit

```bash
git add .
git commit -m "[T4.2] feat: implementar UX de permissão de câmera"
```

**Padrão de mensagem:** `[T{task-id}] {tipo}: {descrição curta em português}`

| Tipo | Quando usar |
|------|-------------|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `refactor` | Refatoração sem mudança de comportamento |
| `test` | Apenas adição/correção de testes |
| `docs` | Documentação |
| `chore` | Configuração, dependências, build |

---

### 5. Pull Request

```bash
git push -u origin feature/T4.2-camera-permission-ux
```

Abrir PR no GitHub com:
- **Título:** `[T4.2] feat: implementar UX de permissão de câmera`
- **Descrição:**
  ```
  ## O que mudou
  - Criado modal de permissão de câmera negada com link de ajuda por browser
  - Detecta NotAllowedError vs NotFoundError com mensagens específicas
  - Botão "Tentar novamente" re-executa getUserMedia

  ## Como testar
  1. Abrir product-detail.html?id=1
  2. Clicar "Experimentar Virtual"
  3. Negar a permissão de câmera no browser
  4. Verificar que o modal de permissão aparece com as instruções

  ## Screenshots
  [screenshot do modal de permissão negada]

  ## Referências
  - Closes #006 (DeepAR sem configuração)
  - Related to T4.2
  ```

---

### 6. Merge

Após aprovação do PR, fazer merge para `main`. Preferencialmente **squash merge** para manter histórico limpo.

---

### 7. Documentar a issue

Após o merge, abrir `docs/ISSUES.md` e marcar a issue correspondente como resolvida:

```markdown
### #006 — DeepAR sem chave de licença válida
✅ Resolvido em 2026-08-12 via PR #15
```

---

## Como adicionar novos produtos ao catálogo

Em `js/script.js`, na estrutura `products`, adicionar objeto seguindo o schema:

```javascript
{
  id: 99,                          // único, inteiro
  name: "Nome da Joia",
  price: 2500.00,                  // BRL sem formatação
  image: "assets/images/JOIAS/joia-99-yellow.jpeg",
  images: [
    "assets/images/JOIAS/joia-99-yellow.jpeg",
    "assets/images/JOIAS/joia-99-white.jpeg",
    "assets/images/JOIAS/joia-99-rose.jpeg"
  ],
  category: "aneis",               // aneis | colares | brincos | pulseiras
  description: "Descrição da joia.",
  details: {
    material: "Ouro 18k",
    pedra: "Diamante Natural",
    quilate: "0.5ct"
  },
  sizes: ['12', '14', '16', '18'],
  stones: ['diamond'],
  metals: {
    yellow: "assets/images/JOIAS/joia-99-yellow.jpeg",
    white:  "assets/images/JOIAS/joia-99-white.jpeg",
    rose:   "assets/images/JOIAS/joia-99-rose.jpeg"
  },
  arEffects: {
    yellow: "assets/effects/aneis/joia-99-yellow.deepar",
    white:  "assets/effects/aneis/joia-99-white.deepar",
    rose:   "assets/effects/aneis/joia-99-rose.deepar"
  },
  models3d: {
    yellow: "assets/models/aneis/joia-99-yellow.glb",
    white:  "assets/models/aneis/joia-99-white.glb"
  }
}
```

---

## Como criar efeitos DeepAR (.deepar)

Ver `.kiro/steering/ar-tryon-guide.md` para o guia completo.

Resumo:
1. Obter chave em https://developer.deepar.ai/
2. Criar efeito no DeepAR Studio com o modelo 3D da joia
3. Exportar como `.deepar` e adicionar em `assets/effects/{categoria}/`
4. Mapear no campo `arEffects` do produto

---

## Padrões de código

Ver `.kiro/steering/project-standards.md` para todos os padrões obrigatórios.

Resumo:
- Sempre usar `let` para variáveis DOM (não `const` se reatribuídas)
- Guard em todo `getElementById` antes de usar
- `logError()` em vez de `console.error`
- `showToast()` em vez de `alert()`
- JSDoc em todas as funções públicas
