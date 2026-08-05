# Guia DeepAR — Como configurar para testar o AR Try-On
**Data:** 2026-08-04

---

## O que você já tem
- Conta criada no DeepAR ✅
- Módulo `ARTryOn` implementado e testado ✅
- Estrutura HTML do modal pronta ✅

## O que você precisa fazer na plataforma DeepAR

### Passo 1 — Obter a License Key

1. Acesse **https://developer.deepar.ai/**
2. Faça login na sua conta
3. Vá em **"Projects"** → **"Create new project"** (ou clique no projeto existente)
4. Em **"Platforms"**, adicione:
   - `localhost` (para testes locais)
   - `prbretas.github.io` (para o site publicado no GitHub Pages)
5. Copie a **License Key** gerada — parece com: `abc123xyz...` (string longa)

### Passo 2 — Criar o arquivo de configuração local

Na pasta do projeto (`c:\Users\philippe.bretas\Documents\GitHub\JEWELRY\js\`), crie um arquivo chamado **`config.js`** com o conteúdo:

```javascript
// js/config.js — NÃO commitar este arquivo (está no .gitignore)
const DEEPAR_LICENSE_KEY = 'SUA_LICENSE_KEY_AQUI';
```

> ⚠️ Este arquivo já está no `.gitignore`. Ele não vai para o GitHub.

### Passo 3 — Referenciar o config.js na página de produto

Abra `pages/product-detail.html` e adicione **antes** dos outros scripts:

```html
<!-- Adicionar antes de script.js -->
<script src="../js/config.js"></script>
<script src="../js/script.js"></script>
```

### Passo 4 — Testar localmente

```bash
# No PowerShell, na pasta do projeto:
python -m http.server 8000

# Ou com Node.js:
npx http-server -p 8000
```

Acesse: **http://localhost:8000/pages/product-detail.html?id=3**

(ID 3 = Brincos de Ouro Rosé — bom para testar rastreamento facial)

Clique em **"✨ Experimentar Virtual"** → autorize a câmera.

---

## O que acontece SEM os arquivos .deepar

**Com a chave configurada mas sem efeitos reais:**
- O DeepAR inicializa ✅
- A câmera abre ✅
- **Nenhum efeito é aplicado** — a câmera mostra apenas o feed sem a joia
- O sistema exibe o fallback graciosamente

**Isso é esperado.** O AR com a joia sobreposta só funciona com os arquivos `.deepar` criados pelo seu ourives parceiro.

---

## O que são os arquivos .deepar e como obtê-los

### O que é um arquivo .deepar
É um arquivo criado no **DeepAR Studio** (ferramenta gratuita da DeepAR) que contém:
- O modelo 3D da joia (ou uma referência a ele)
- As configurações de tracking (facial para brincos/colares, mão para anéis/pulseiras)
- Os materiais e texturas

### Como criar — Opção 1: DeepAR Studio (você mesmo)
1. Baixe o **DeepAR Studio**: https://www.deepar.ai/ar-studio
2. Importe o modelo 3D da joia (formato `.obj`, `.fbx` ou `.glb`)
3. Configure o tipo de tracking:
   - Brincos/Colares → **Face tracking** → posicionar nos ouvidos/pescoço
   - Anéis/Pulseiras → **Hand tracking** → posicionar nos dedos/pulso
4. Exporte como `.deepar`

### Como criar — Opção 2: Pedir ao Ourives Parceiro (recomendado)
Envie para o ourives:
- O modelo 3D da joia (que ele já vai criar em `.glb`)
- As dimensões reais da peça
- A categoria (anel, brinco, colar, pulseira)

O ourives cria o `.deepar` junto com o `.glb` — são complementares.

### Onde colocar os arquivos
```
JEWELRY/
└── assets/
    └── effects/
        ├── aneis/
        │   ├── anel-diamante-yellow.deepar   ← ouro amarelo
        │   ├── anel-diamante-white.deepar    ← ouro branco
        │   └── anel-diamante-rose.deepar     ← ouro rosé
        ├── brincos/
        │   ├── brinco-argola-yellow.deepar
        │   └── ...
        ├── colares/
        └── pulseiras/
```

---

## Como atualizar o produto para usar o efeito real

Em `js/script.js`, no objeto do produto, substitua o placeholder pelo caminho real:

```javascript
// ANTES (placeholder):
arEffects: {
    yellow: "assets/effects/aneis/anel-diamante-yellow.deepar",
    white:  "assets/effects/aneis/anel-diamante-white.deepar",
    rose:   "assets/effects/aneis/anel-diamante-rose.deepar"
}

// DEPOIS (arquivo real do ourives):
arEffects: {
    yellow: "assets/effects/aneis/anel-diamante-yellow.deepar",  // mesmo caminho, mas arquivo existe
    white:  "assets/effects/aneis/anel-diamante-white.deepar",
    rose:   "assets/effects/aneis/anel-diamante-rose.deepar"
}
```

---

## Fluxo completo para testar hoje (sem efeito real)

1. ✅ Criar `js/config.js` com sua License Key
2. ✅ Adicionar `<script src="../js/config.js">` no product-detail.html
3. ✅ Rodar: `python -m http.server 8000`
4. ✅ Abrir: `http://localhost:8000/pages/product-detail.html?id=3`
5. ✅ Clicar "Experimentar Virtual"
6. ✅ Autorizar câmera
7. 🎯 A câmera vai abrir — sem o `.deepar` vai mostrar só o feed de câmera
8. 📍 Quando o ourives entregar o primeiro `.deepar`, colocar na pasta certa e testar

---

## Links úteis DeepAR

| Recurso | URL |
|---------|-----|
| Dashboard | https://developer.deepar.ai/ |
| Documentação SDK Web | https://docs.deepar.ai/deepar-sdk/platforms/web |
| DeepAR Studio (criar efeitos) | https://www.deepar.ai/ar-studio |
| Exemplos de efeitos | https://github.com/DeepARSDK/quickstart-web-js |
| Suporte | https://help.deepar.ai/ |

---

## Dúvidas frequentes

**P: Preciso pagar para testar?**
R: Não. A chave gratuita funciona em localhost sem limite de tempo.

**P: A chave gratuita funciona no GitHub Pages?**
R: Sim, desde que você adicione `prbretas.github.io` como domínio autorizado no projeto do DeepAR.

**P: Posso ter uma chave para cada joalheria cliente?**
R: Sim. Cada joalheria terá seu próprio projeto e chave no DeepAR. Isso é parte do modelo B2B do produto.

**P: O DeepAR tem tracking de mão para anéis?**
R: Sim, a partir da versão 5.x do SDK. O arquivo `ar-tryon.js` já está configurado para usar `facingMode: 'environment'` (câmera traseira) para anéis e pulseiras, que é o melhor para hand tracking.
