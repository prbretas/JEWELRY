---
inclusion: manual
---

# Guia de Implementação — AR Try-On (DeepAR)

## Visão Geral

O diferencial principal da Joalheria Virtual é a **prova virtual de joias via câmera** usando o SDK DeepAR. Este guia cobre toda a implementação, desde a configuração da chave até os efeitos por categoria de produto.

## 1. Obter Chave de Licença DeepAR

1. Acessar https://developer.deepar.ai/
2. Criar conta gratuita
3. Criar novo projeto para `localhost` e para o domínio de produção `prbretas.github.io`
4. Copiar a licença e substituir `'your_deepar_license_key_here'` em `js/product-detail.js`

> A chave gratuita permite desenvolvimento ilimitado em localhost. Para produção, verificar os planos em https://deepar.ai/pricing

## 2. Estrutura de Arquivos de Efeito

```
assets/
  effects/
    brincos/
      argola-ouro-amarelo.deepar
      argola-ouro-branco.deepar
      argola-ouro-rose.deepar
    colares/
      colar-perolas.deepar
      colar-diamantes.deepar
    aneis/
      anel-solitario-amarelo.deepar
      anel-solitario-branco.deepar
      anel-solitario-rose.deepar
    pulseiras/
      pulseira-ouro.deepar
```

## 3. Mapeamento Efeito ↔ Produto

No objeto de produto em `script.js`, definir:

```javascript
{
  id: 1,
  name: "Anel de Diamante Solitário",
  // ...
  arEffect: {
    yellow: 'assets/effects/aneis/anel-solitario-amarelo.deepar',
    white:  'assets/effects/aneis/anel-solitario-branco.deepar',
    rose:   'assets/effects/aneis/anel-solitario-rose.deepar'
  }
}
```

## 4. Inicialização do DeepAR

```javascript
// js/product-detail.js

async function initDeepAR(product, selectedMetal = 'yellow') {
  // 1. Pedir permissão de câmera
  try {
    await navigator.mediaDevices.getUserMedia({ video: true });
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      showCameraPermissionModal();
      return;
    }
    if (err.name === 'NotFoundError') {
      showToast('Câmera não encontrada neste dispositivo.', 'error');
      return;
    }
  }

  // 2. Inicializar DeepAR
  const canvas = document.getElementById('deepar-canvas');
  try {
    deepAR = await DeepAR.initialize({
      licenseKey: DEEPAR_LICENSE_KEY,
      canvas: canvas,
    });
    
    // 3. Carregar efeito da joia
    const effectPath = product.arEffect[selectedMetal];
    await deepAR.switchEffect(effectPath);
    
  } catch (error) {
    logError('Falha ao inicializar DeepAR', { error });
    showARFallback(product);
  }
}
```

## 5. Troca de Efeito ao Mudar Metal

```javascript
// Escuta o evento customizado emitido pela seleção de metal
document.addEventListener('productVariantChanged', async (e) => {
  const { metal } = e.detail;
  if (deepAR && currentProduct?.arEffect?.[metal]) {
    await deepAR.switchEffect(currentProduct.arEffect[metal]);
  }
});
```

## 6. Captura de Foto

```javascript
async function takeARPhoto() {
  if (!deepAR) return;
  
  // DeepAR retorna base64 ou blob
  const photo = await deepAR.takeScreenshot();
  
  // Exibir preview
  const img = document.getElementById('photo-preview');
  img.src = photo;
  document.getElementById('photo-modal').style.display = 'block';
  
  // Botão de download
  document.getElementById('download-photo').href = photo;
  document.getElementById('download-photo').download = `joia-tryon-${Date.now()}.png`;
  
  // Compartilhar (se disponível)
  if (navigator.share) {
    const blob = await (await fetch(photo)).blob();
    const file = new File([blob], 'joia-tryon.png', { type: 'image/png' });
    await navigator.share({ files: [file], title: 'Minha joia virtual!' });
  }
}
```

## 7. Fallback sem DeepAR

Se o DeepAR falhar (sem licença, sem câmera, erro de rede), exibir:

```html
<div id="ar-fallback" class="ar-fallback">
  <img src="${product.image}" alt="${product.name}" class="ar-fallback-image">
  <div class="ar-fallback-overlay">
    <p>🔴 Prova Virtual não disponível</p>
    <p>Veja como a joia fica usando nossas fotos de modelo</p>
    <a href="#gallery">Ver Galeria</a>
  </div>
</div>
```

## 8. Tipos de Detecção por Categoria

| Categoria | Região Detectada | Configuração DeepAR |
|-----------|-----------------|---------------------|
| Brincos | Rosto / orelhas | Face tracking |
| Colares | Pescoço / decote | Face + neck tracking |
| Anéis | Mãos / dedos | Hand tracking |
| Pulseiras | Pulso | Hand tracking |

> Configurar o tipo de detecção no efeito `.deepar` ao criar no DeepAR Studio.

## 9. Considerações Mobile

- **Câmera padrão mobile:** usar `facingMode: 'user'` (frontal) para brincos/colares, `facingMode: 'environment'` (traseira) para anéis/pulseiras
- **Interface fullscreen:** usar `element.requestFullscreen()` ao iniciar AR no mobile
- **Performance:** DeepAR roda bem em iOS 14+ e Android 8+; abaixo disso, exibir fallback automaticamente

## 10. Checklist de Implementação

- [ ] Chave de licença configurada
- [ ] Arquivos `.deepar` criados para cada produto/metal
- [ ] Permissão de câmera solicitada antes de inicializar
- [ ] Fallback implementado para todos os cenários de erro
- [ ] Troca de metal atualiza efeito em tempo real
- [ ] Captura de foto com download/compartilhamento
- [ ] Troca de câmera (frontal/traseira)
- [ ] Interface acessível com ARIA labels
- [ ] Testado em Chrome mobile e Safari iOS
