# Product Document — Joalheria Virtual (AR Try-On SDK)

**Versão:** 2.0  
**Data:** 2026-08-04  
**Status:** Em desenvolvimento ativo — foco no AR Try-On

---

## 1. Modelo de Negócio

### Produto Principal — SDK/Widget de AR Try-On (B2B)

O core do negócio é **vender a tecnologia de prova virtual para outras joalherias.** Uma loja como a "Prata e Prata" inclui 2 linhas de código no site dela e os clientes dela passam a poder experimentar as joias via câmera.

**Como funciona para a joalheria cliente:**
1. Contrata o serviço → recebe chave de API
2. Adiciona `<script src="https://cdn.jewelry.io/tryon.js">` no site
3. Adiciona `<jewelry-tryon product-id="anel-001" api-key="xyz">` na página do produto
4. Pronto — o widget renderiza com a joia da loja em AR

**O que a JEWELRY entrega:**
- Widget embarcável auto-contido
- Efeitos AR (.deepar) criados pelo **ourives parceiro** para cada produto
- Modelos 3D (.glb) do ourives parceiro para o visualizador 3D
- Suporte e atualização de efeitos

### Produto Secundário — Vitrine Demo (B2C)

O site JEWELRY serve como **vitrine de demonstração** da tecnologia. Quando a JEWELRY prospecta uma joalheria cliente, mostra o próprio site como demo. O ourives parceiro cria joias físicas E seus modelos 3D para essa vitrine.

---

## 2. Diferencial Competitivo

| Feature | JEWELRY SDK | Joalheria comum online | Concorrente AR genérico |
|---------|-------------|------------------------|------------------------|
| AR Try-On em tempo real | ✅ | ❌ | ✅ |
| Efeitos criados por ourives real | ✅ | ❌ | ❌ (efeitos genéricos) |
| Troca de metal em tempo real | ✅ | ❌ | ❌ |
| Captura e compartilhamento | ✅ | ❌ | Parcial |
| Visualizador 3D integrado | ✅ | ❌ | ❌ |
| Embarcável em 2 linhas de código | ✅ | — | ❌ (setup complexo) |
| Custo para joalheria | SaaS acessível | — | Caro |

**O ourives parceiro é um diferencial técnico crítico:** efeitos AR feitos por quem conhece joias de verdade resultam em fidelidade visual impossível de obter com soluções genéricas.

---

## 3. Personas

### Joalheria Cliente (B2B) — quem paga
- **Quem:** Dono/gerente de joalheria física ou e-commerce de joias (médio porte)
- **Dor:** Perde vendas online porque clientes não confiam em comprar sem experimentar
- **O que quer:** Tecnologia impressionante sem complicação técnica, preço justo
- **Como decidir:** Ver a demo no site JEWELRY e se impressionar com o Try-On

### Cliente Final da Joalheria (B2C) — quem usa
- **Quem:** Mulher, 25–45 anos, compra online com frequência, usa Instagram
- **Dor:** Não sabe como a joia vai ficar antes de comprar
- **O que quer:** Experimentar sem sair de casa, compartilhar com amigos antes de decidir

---

## 4. Roadmap por Fase

### Fase 1 — Demo Funcional (Atual)
**Objetivo:** Ter o Try-On funcionando na vitrine JEWELRY para mostrar para prospects

| Entregável | Status |
|-----------|--------|
| Correções críticas de JS | 🔲 T1 |
| Página de produto reestruturada | 🔲 T3 |
| Módulo `ARTryOn` isolado | 🔲 T4 |
| AR funcionando com DeepAR + efeito real | 🔲 T4.3 |
| Foto + compartilhamento | 🔲 T4.6 |
| 3D Viewer | 🔲 T5 |
| Testes PBT | 🔲 T8 |

### Fase 2 — Widget Embarcável
**Objetivo:** Empacotar o `ARTryOn` como Web Component `<jewelry-tryon>` pronto para vender

- Web Component com Shadow DOM (isolado do CSS do site host)
- CDN própria para distribuição
- Chave de API + validação de domínio
- Documentação de integração para devs de joalherias clientes
- Dashboard de gerenciamento de produtos/efeitos

### Fase 3 — Escala
**Objetivo:** Onboarding de múltiplas joalherias clientes

- Painel de admin para cadastrar joalherias e produtos
- Pipeline de criação de efeitos com o ourives parceiro
- Analytics: quantos usuários usaram o Try-On, taxa de conversão
- SLA e suporte técnico

---

## 5. Fluxo do Ourives Parceiro

```
1. Joalheria cliente contrata a JEWELRY SDK
2. JEWELRY coleta fotos/medidas das joias do cliente
3. Ourives parceiro recebe briefing
4. Ourives cria modelos 3D (.glb) das joias
5. Ourives cria efeitos AR (.deepar) por categoria e metal
6. JEWELRY integra os efeitos no widget para aquela joalheria
7. Joalheria cliente embarca o widget com product-id das suas peças
```

---

## 6. KPIs de Sucesso

| Métrica | Meta Fase 1 |
|---------|-------------|
| Try-On funcionando na vitrine | ✅ Sim/Não |
| Taxa de uso do Try-On (vitrine) | > 40% das visitas ao produto |
| Tempo de sessão no Try-On | > 1 minuto |
| Fotos capturadas e compartilhadas | > 20% das sessões AR |
| Joalherias clientes contatadas após ver demo | > 5 no primeiro mês |
