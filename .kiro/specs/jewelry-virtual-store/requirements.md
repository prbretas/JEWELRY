# Requirements Document

## Introduction

O **Projeto JEWELRY** tem duas camadas de negócio:

**Camada 1 — Produto principal (B2B): SDK/Widget de AR Try-On para joalherias**
O core do negócio é vender a tecnologia de prova virtual para outras joalherias (ex: Prata e Prata, Vivara, etc.). A empresa oferece um widget/SDK embarcável que qualquer loja pode incluir no próprio site, permitindo que os clientes delas experimentem as joias via câmera. O diferencial: modelos 3D e efeitos AR são criados pelo ourives parceiro, com qualidade real de produção.

**Camada 2 — Loja própria (B2C): Vitrine de demonstração**
O site JEWELRY funciona como vitrine/demo da tecnologia para convencer joalherias a contratar o serviço. O ourives parceiro cria as joias físicas e seus modelos 3D para essa demonstração.

**Foco atual de desenvolvimento:** A página de produto com o componente Try-On funcional — este é o coração do produto que será vendido para outras lojas.

---

## Glossary

| Termo | Definição |
|---|---|
| AR Try-On | Componente de Realidade Aumentada que sobrepõe uma joia sobre a câmera do usuário em tempo real |
| DeepAR | SDK de AR utilizado para rastreamento facial/de mãos e renderização de efeitos |
| Widget/SDK | Código embarcável que uma joalheria cliente inclui no próprio site para ativar o Try-On |
| Efeito (.deepar) | Arquivo de efeito AR que representa uma joia específica para uso no DeepAR |
| Modelo 3D (.glb) | Arquivo de geometria 3D da joia criado pelo ourives parceiro |
| Ourives Parceiro | Profissional responsável por criar as joias físicas e seus modelos 3D |
| Joalheria Cliente | Empresa que contrata o widget de Try-On para incluir no site dela (ex: Prata e Prata) |
| Vitrine Demo | A loja JEWELRY usada para demonstrar a tecnologia para joalherias clientes |
| PBT | Property-Based Testing — testes que validam propriedades formais do código |
| variantKey | Identificador único de variante: `{productId}-{tamanho}-{metal}` |
| Metal | Tipo de material da joia: ouro amarelo, ouro branco, ouro rosé, prata |

---

## Requirements

---

### Requirement 1: Componente AR Try-On Embarcável

**User Story:** Como joalheria cliente (ex: Prata e Prata), quero incluir um widget de Try-On no meu site com pouquíssimas linhas de código, para que meus clientes possam experimentar minhas joias via câmera sem eu precisar desenvolver nada.

#### Acceptance Criteria

1. WHEN uma joalheria cliente adiciona a tag `<script src="jewelry-tryon.js">` e o elemento `<jewelry-tryon product-id="123">` ao seu HTML, THE SYSTEM SHALL renderizar o componente completo de Try-On sem dependências adicionais.
2. WHEN o componente é inicializado com um `product-id` válido, THE SYSTEM SHALL carregar o efeito AR correspondente da CDN.
3. WHEN o componente é inicializado, THE SYSTEM SHALL solicitar permissão de câmera ao usuário de forma clara e não-bloqueante.
4. IF o usuário nega a permissão de câmera, THE SYSTEM SHALL exibir uma mensagem amigável explicando como conceder acesso, sem travar a página da joalheria cliente.
5. WHEN a câmera é autorizada, THE SYSTEM SHALL inicializar o DeepAR e aplicar o efeito AR da joia em tempo real sobre o feed de câmera.
6. WHERE o produto é brinco ou colar, THE SYSTEM SHALL usar rastreamento facial; WHERE o produto é anel ou pulseira, THE SYSTEM SHALL usar rastreamento de mão.
7. WHEN o DeepAR falha (chave inválida, sem rede, erro de SDK), THE SYSTEM SHALL exibir um fallback gracioso sem quebrar o layout da joalheria cliente.
8. WHEN o componente está ativo, THE SYSTEM SHALL oferecer controles de: trocar câmera (frontal/traseira), tirar foto, e fechar/minimizar.
9. WHEN o usuário tira uma foto durante o Try-On, THE SYSTEM SHALL gerar preview com botão de download e opção de compartilhamento (Web Share API).
10. WHEN o usuário troca a variante de metal no componente, THE SYSTEM SHALL atualizar o efeito AR em tempo real sem reinicializar a câmera.

---

### Requirement 2: Painel de Gerenciamento de Efeitos (Back-office)

**User Story:** Como administrador do produto, quero gerenciar os produtos e efeitos AR de cada joalheria cliente, para que eu possa onboarding novos clientes e adicionar novas joias sem tocar no código do site deles.

#### Acceptance Criteria

1. WHEN um novo produto é cadastrado com imagem, categoria e arquivo de efeito (.deepar), THE SYSTEM SHALL armazenar os dados e disponibilizá-los via API/CDN para o widget.
2. WHEN um efeito é atualizado para um produto existente, THE SYSTEM SHALL refletir a mudança em todos os sites clientes que usam aquele produto, na próxima inicialização do componente.
3. WHEN uma joalheria cliente é cadastrada com domínio autorizado, THE SYSTEM SHALL gerar uma chave de API exclusiva para aquele cliente.
4. IF o widget for carregado em um domínio não autorizado para aquela chave, THE SYSTEM SHALL recusar a inicialização e exibir mensagem de domínio não autorizado.

---

### Requirement 3: Página de Produto na Vitrine Demo

**User Story:** Como visitante da vitrine JEWELRY, quero ver uma página de produto completa com Try-On, visualização 3D e informações detalhadas, para entender o que é possível fazer com a tecnologia antes de contratar para minha loja.

#### Acceptance Criteria

1. WHEN o usuário acessa `product-detail.html?id={id}`, THE SYSTEM SHALL exibir: nome, preço, descrição, galeria de imagens, especificações técnicas e opções de variante (metal, tamanho).
2. WHEN o usuário acessa com `id` inválido ou ausente, THE SYSTEM SHALL exibir "Produto não encontrado" com link para o catálogo, sem erro no console.
3. WHEN o usuário clica em "Experimentar Virtual", THE SYSTEM SHALL abrir o modal de Try-On com o componente AR inicializado para aquele produto.
4. WHEN o usuário seleciona uma variante de metal, THE SYSTEM SHALL atualizar: (a) imagem principal da galeria, (b) efeito AR se o Try-On estiver ativo, (c) modelo 3D se o viewer estiver aberto.
5. WHEN o usuário clica em "Visualizar em 3D", THE SYSTEM SHALL abrir o modal com o modelo 3D da joia carregado via `<model-viewer>`, com rotação e zoom interativos.
6. IF o modelo 3D não está disponível para o produto, THE SYSTEM SHALL ocultar o botão "Visualizar em 3D" em vez de mostrar um viewer vazio.
7. WHEN o usuário clica em uma thumbnail da galeria, THE SYSTEM SHALL atualizar a imagem principal com transição suave.
8. WHEN o usuário abre as seções do accordion (Descrição Detalhada, Especificações, Cuidados), THE SYSTEM SHALL expandir/recolher com animação suave e ícone de chevron animado.

---

### Requirement 4: Catálogo e Navegação da Vitrine

**User Story:** Como visitante da vitrine, quero navegar pelo catálogo de joias por categoria e buscar produtos, para explorar o que o ourives parceiro produziu.

#### Acceptance Criteria

1. WHEN o usuário acessa a homepage, THE SYSTEM SHALL exibir produtos em destaque de `products.featured` com imagem, nome e preço.
2. WHEN o usuário navega para uma categoria (Anéis, Colares, Brincos, Pulseiras), THE SYSTEM SHALL exibir apenas produtos daquela categoria.
3. WHEN uma imagem de produto falha ao carregar, THE SYSTEM SHALL substituir por uma imagem placeholder sem quebrar o layout.
4. WHEN o usuário busca por um termo, THE SYSTEM SHALL filtrar produtos por nome e descrição (case-insensitive) com debounce de 300ms.
5. WHEN o usuário aplica filtros de preço, metal e pedras, THE SYSTEM SHALL exibir apenas produtos que satisfazem todos os filtros ativos simultaneamente.
6. WHEN nenhum produto satisfaz os filtros, THE SYSTEM SHALL exibir "Nenhum produto encontrado" e botão "Limpar Filtros".

---

### Requirement 5: Experiência Mobile do Try-On

**User Story:** Como usuário final de uma joalheria cliente, quero experimentar joias pelo celular de forma fluida e intuitiva, pois é onde a maioria das compras acontece.

#### Acceptance Criteria

1. WHEN o usuário acessa o Try-On em dispositivo mobile, THE SYSTEM SHALL abrir a interface em modo fullscreen para maximizar a área da câmera.
2. WHEN disponível, THE SYSTEM SHALL usar câmera frontal por padrão para brincos e colares, e câmera traseira para anéis e pulseiras.
3. WHEN o Try-On está ativo no mobile, THE SYSTEM SHALL exibir botões de controle com área mínima de 56×56px e ícones legíveis.
4. WHEN o usuário tira uma foto no mobile, THE SYSTEM SHALL oferecer compartilhamento via Web Share API (WhatsApp, Instagram Stories, etc.).
5. WHEN o dispositivo não suporta WebRTC ou AR, THE SYSTEM SHALL detectar antes de inicializar e exibir mensagem de incompatibilidade com alternativa (galeria de fotos modelo).

---

### Requirement 6: Carrinho e Wishlist da Vitrine Demo

**User Story:** Como visitante da vitrine, quero adicionar joias ao carrinho e lista de desejos para simular uma experiência de compra completa.

#### Acceptance Criteria

1. WHEN o usuário adiciona um produto ao carrinho, THE SYSTEM SHALL incluir o item com `variantKey` correto (`{id}-{size}-{metal}`), exibir toast de confirmação e atualizar o contador com animação.
2. WHEN o usuário remove um item do carrinho, THE SYSTEM SHALL animar a saída, recalcular o total e persistir no localStorage.
3. WHEN o usuário fecha e reabre o navegador, THE SYSTEM SHALL restaurar carrinho e wishlist do localStorage.
4. WHEN o usuário clica "Finalizar Compra" com carrinho não-vazio, THE SYSTEM SHALL simular processamento (1,5s), limpar carrinho, exibir toast de sucesso.
5. WHEN o usuário adiciona o mesmo produto à wishlist múltiplas vezes, THE SYSTEM SHALL garantir que ele aparece exatamente uma vez (idempotência).

---

### Requirement 7: Fluxo de Desenvolvimento — Branch, PR e Merge

**User Story:** Como desenvolvedor do projeto, quero seguir um fluxo Git estruturado para garantir rastreabilidade, qualidade e histórico limpo do código.

#### Acceptance Criteria

1. WHEN uma nova tarefa é iniciada, THE DEVELOPER SHALL criar uma branch com o padrão `feature/{task-id}-{descricao-curta}` ou `fix/{task-id}-{descricao-curta}` a partir da `main`.
2. WHEN o desenvolvimento de uma tarefa está completo, THE DEVELOPER SHALL criar casos de teste para a funcionalidade desenvolvida antes de abrir o PR.
3. WHEN os testes passam, THE DEVELOPER SHALL fazer commit com mensagem no padrão: `[T{id}] tipo: descrição curta` (ex: `[T6.2] feat: implementar solicitação de permissão de câmera`).
4. WHEN o commit está pronto, THE DEVELOPER SHALL abrir um Pull Request com: título descritivo, lista de mudanças, prints/GIFs se houver mudança visual, e referência à issue/task correspondente.
5. WHEN o PR é aprovado, THE DEVELOPER SHALL fazer merge para `main` via squash ou merge commit (nunca rebase forçado).
6. AFTER merge, THE DEVELOPER SHALL documentar a issue correspondente em `docs/ISSUES.md` como resolvida com a data e número do PR.

---

## Correctness Properties (Para PBT)

### P1 — Invariância do Carrinho
> Para qualquer sequência de adições/remoções, `getCartTotal()` DEVE ser igual a `sum(item.price * item.quantity)` para todos os itens distintos.

### P2 — Persistência Bidirecional
> Para qualquer estado de carrinho/wishlist, `JSON.parse(localStorage.getItem(KEY))` DEVE ser deep-equal ao estado original antes de recarregar a página.

### P3 — Filtragem Correta
> Para qualquer produto P e filtros F: se P satisfaz F, P DEVE estar no resultado; se P não satisfaz F, P NÃO DEVE estar no resultado.

### P4 — Idempotência da Wishlist
> Chamar `addToWishlist(id)` N vezes (N ≥ 1) DEVE resultar em exatamente 1 ocorrência de `id` na wishlist.

### P5 — Inicialização Segura do Widget
> O widget de Try-On DEVE ser inicializável em qualquer DOM que contenha o elemento `<jewelry-tryon>`, sem lançar exceções, mesmo que outros elementos esperados estejam ausentes.

### P6 — Isolamento do Widget
> O widget Try-On NÃO DEVE modificar variáveis globais (`window.*`) nem sobrescrever CSS do site host além do seu próprio shadow DOM / container.
