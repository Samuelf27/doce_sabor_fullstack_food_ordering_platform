# Plano de Ação — Melhorias de UI/UX
## Doce Sabor · Sorveteria Online

**Criado em:** 02/05/2026
**Última atualização:** 02/05/2026 (sessão 3)
**Responsável:** Samuel Ferreira
**Status geral:** 🟡 Em andamento (14 de 19 concluídos)

---

## Como usar este documento

- Cada melhoria tem um **ID**, **prioridade**, **estimativa de esforço** e **status**
- Atualize o status conforme for executando: `🔴 Não iniciado` → `🟡 Em andamento` → `🟢 Concluído`
- As fases são ordenadas por impacto no negócio — execute de cima para baixo

---

## Visão Geral das Fases

| Fase | Tema | Itens | Status |
|------|------|-------|--------|
| 1 | Estrutura e Navegação | 3 | 🟢 Concluída |
| 2 | Cardápio e Produtos | 4 | 🟢 Concluída |
| 3 | Carrinho e Checkout | 4 | 🟢 Concluída |
| 4 | Mobile e Performance | 3 | 🟢 Concluída |
| 5 | Funcionalidades Extras | 5 | 🔴 |

**Total de melhorias:** 19

---

---

# FASE 1 — Estrutura e Navegação

> **Objetivo:** Eliminar a fricção entre o cliente e os produtos. A entrada do site deve ser o cardápio.

---

### [F1-01] Transformar a homepage no cardápio de vendas

**Prioridade:** 🔴 Crítico
**Esforço:** Médio (2–4h)
**Status:** 🟢 Concluído — 02/05/2026

**Problema:**
A `index.html` atual é uma landing page institucional (hero + sobre + como pedir). O cliente precisa clicar em "Ver Cardápio" para chegar aos produtos, adicionando uma etapa desnecessária no funil de compra.

**Solução:**
- Fundir o conteúdo da `cardapio.html` com a `index.html`
- A página inicial deve abrir diretamente com filtros de categoria e grid de produtos
- Manter um banner compacto no topo (não 100vh) com nome da marca e slogan
- Mover as seções "Sobre" e "Como Pedir" para o rodapé ou uma página separada `/sobre.html`

**Arquivos afetados:**
- `public/index.html`
- `public/cardapio.html`
- `public/js/main.js`
- `public/js/cardapio.js`
- `public/css/style.css`

**Critério de conclusão:**
- [x] Acessar `localhost:3000` exibe o cardápio diretamente
- [x] Banner topo ocupa no máximo 200px de altura
- [x] Filtros de categoria funcionam na homepage
- [x] Links de navegação atualizados em todos os arquivos HTML

---

### [F1-02] Reduzir o hero para um banner compacto

**Prioridade:** 🔴 Crítico
**Esforço:** Pequeno (1h)
**Status:** 🟢 Concluído — 02/05/2026

**Problema:**
O hero atual ocupa `100vh` (tela cheia), empurrando todos os produtos para baixo da dobra. Em um e-commerce de delivery, produtos visíveis imediatamente aumentam conversão.

**Solução:**
- Reduzir o banner para `160px–200px` de altura
- Manter logo, nome da marca e slogan
- Remover o botão "Ver Cardápio" (desnecessário se já está no cardápio)
- Adicionar campo de busca diretamente no banner

**Arquivos afetados:**
- `public/css/style.css` (seção `.hero`)
- `public/index.html`

**Critério de conclusão:**
- [x] Banner visível e compacto no topo
- [x] Produtos aparecem sem precisar rolar
- [x] Responsivo em mobile (banner não quebra em 375px)

---

### [F1-03] Atualizar links de navegação globais

**Prioridade:** 🟠 Alto
**Esforço:** Pequeno (30min)
**Status:** 🟢 Concluído — 02/05/2026

**Problema:**
Todos os arquivos HTML têm links hardcoded para `cardapio.html`. Com a fusão das páginas, esses links precisam apontar para `index.html` ou `/`.

**Solução:**
- Substituir todas as referências a `cardapio.html` por `/` ou `index.html`
- Verificar navbar, footer, botões CTA e redirecionamentos em JavaScript

**Arquivos afetados:**
- Todos os arquivos em `public/`
- `public/js/auth.js`
- `public/js/carrinho.js`
- `public/js/checkout.js`

**Critério de conclusão:**
- [x] Nenhum link quebrado após a fusão das páginas
- [x] "Cardápio" na navbar leva para a homepage
- [x] Botão "Continuar Comprando" no carrinho leva para a homepage

---

---

# FASE 2 — Cardápio e Produtos

> **Objetivo:** Facilitar a descoberta e escolha dos produtos.

---

### [F2-01] Adicionar busca por nome de produto

**Prioridade:** 🔴 Crítico
**Esforço:** Pequeno (1–2h)
**Status:** 🟢 Concluído — 02/05/2026

**Problema:**
Não existe campo de busca. O cliente que quer um "milkshake de ovomaltine" precisa rolar todo o cardápio ou saber em qual categoria está.

**Solução:**
- Adicionar input de busca no topo do cardápio (abaixo do banner)
- Filtrar `allProducts` em memória pelo `nome` e `descricao` enquanto o usuário digita (debounce 300ms)
- Ao buscar, desmarcar o filtro de categoria ativo
- Mostrar mensagem "Nenhum produto encontrado para 'X'" quando vazio

**Arquivos afetados:**
- `public/index.html` (adicionar `<input>`)
- `public/js/cardapio.js` (lógica de filtro)
- `public/css/style.css` (estilo do campo)

**Critério de conclusão:**
- [x] Campo de busca visível no topo do cardápio (no banner)
- [x] Resultados filtram em tempo real ao digitar (debounce 300ms)
- [x] Busca limpa o filtro de categoria ativo automaticamente
- [x] Estado vazio com mensagem clara

---

### [F2-02] Modal de detalhe do produto

**Prioridade:** 🟠 Alto
**Esforço:** Médio (3–4h)
**Status:** 🟢 Concluído — 02/05/2026

**Problema:**
A descrição do produto é cortada em 2 linhas no card. Não há forma de ver a descrição completa, informações adicionais ou uma foto/emoji maior antes de adicionar ao carrinho.

**Solução:**
- Ao clicar no card (fora do botão de adicionar), abrir um modal
- Modal contém: emoji grande, nome, categoria, descrição completa, preço e botão "Adicionar ao Carrinho" com controle de quantidade
- Reutilizar o componente `.modal` já existente no CSS

**Arquivos afetados:**
- `public/index.html` (template do modal)
- `public/js/cardapio.js` (lógica de abertura e renderização)
- `public/css/style.css` (ajuste fino do modal)

**Critério de conclusão:**
- [x] Clique no card abre o modal
- [x] Modal exibe todas as informações do produto
- [x] Botão de adicionar e controles +/− funcionam dentro do modal
- [x] Modal fecha com ESC e clique no overlay
- [x] Scroll da página travado enquanto modal está aberto

---

### [F2-03] Indicador de quantidade no card do produto

**Prioridade:** 🟠 Alto
**Esforço:** Pequeno (1–2h)
**Status:** 🟢 Concluído — 02/05/2026

**Problema:**
Após adicionar um produto ao carrinho, o card não muda visualmente. O cliente não tem feedback de quantos itens já adicionou sem abrir o carrinho.

**Solução:**
- Ao adicionar um produto, substituir o botão "Adicionar ao Carrinho" por controles `−` `2` `+` no próprio card
- Sincronizar com o `localStorage` na renderização inicial do cardápio
- Se quantidade chegar a 0, voltar ao botão original

**Arquivos afetados:**
- `public/js/cardapio.js`
- `public/css/style.css`

**Critério de conclusão:**
- [x] Card mostra controles −/qty/+ quando produto já está no carrinho
- [x] Botões +/− funcionam sem precisar abrir o carrinho
- [x] Quantidade sincroniza com o badge da navbar
- [x] Estado correto ao recarregar a página

---

### [F2-04] Indicador visual de scroll nas abas de categoria

**Prioridade:** 🟡 Médio
**Esforço:** Pequeno (30min)
**Status:** 🟢 Concluído — 02/05/2026

**Problema:**
As abas de categoria fazem scroll horizontal em mobile, mas não há nenhuma indicação visual disso. Muitos usuários não descobrem as categorias que ficam fora da tela.

**Solução:**
- Adicionar `fade` gradiente nas bordas esquerda/direita do container de abas
- O gradiente some quando o scroll chega na extremidade
- Opcional: setas `‹` `›` clicáveis nas bordas

**Arquivos afetados:**
- `public/css/style.css`
- `public/index.html` (wrapper das abas)

**Critério de conclusão:**
- [x] Gradiente visível na borda direita indicando mais abas
- [x] Funciona em mobile e tablet

---

---

# FASE 3 — Carrinho e Checkout

> **Objetivo:** Reduzir abandono e tornar o processo de compra mais claro.

---

### [F3-01] Aumentar área dos botões de quantidade no carrinho

**Prioridade:** 🟠 Alto
**Esforço:** Pequeno (30min)
**Status:** 🟢 Concluído — 02/05/2026

**Problema:**
Os botões `−` e `+` de quantidade no carrinho têm 30px de diâmetro — abaixo do mínimo recomendado de 44px para touch (padrão Apple HIG e WCAG).

**Solução:**
- Aumentar os botões de quantidade para `44px × 44px`
- Ajustar font-size e espaçamento do número entre eles
- Verificar que o layout não quebra em mobile

**Arquivos afetados:**
- `public/css/style.css` (`.qty-btn`, `.qty-controls`)

**Critério de conclusão:**
- [ ] Botões têm mínimo 44px em largura e altura
- [ ] Fácil de pressionar em touch screen
- [ ] Layout do carrinho não quebra

---

### [F3-02] Adicionar stepper de progresso no checkout

**Prioridade:** 🟠 Alto
**Esforço:** Médio (2–3h)
**Status:** 🟢 Concluído — 02/05/2026

**Problema:**
O checkout é uma página única sem indicação de etapas. O usuário não sabe se está no começo, meio ou fim do processo — isso aumenta a ansiedade e o abandono.

**Solução:**
- Adicionar stepper visual no topo do checkout: `Entrega → Pagamento → Confirmar`
- Dividir o formulário em 3 etapas com navegação `Anterior` / `Próximo`
- Etapa 1: Endereço de entrega
- Etapa 2: Forma de pagamento
- Etapa 3: Revisão do pedido + confirmar

**Arquivos afetados:**
- `public/checkout.html`
- `public/js/checkout.js`
- `public/css/style.css`

**Critério de conclusão:**
- [ ] Stepper visível no topo com 3 etapas
- [ ] Etapa atual destacada visualmente
- [ ] Navegação entre etapas funciona
- [ ] Validação antes de avançar (endereço preenchido, pagamento selecionado)
- [ ] Revisão final antes de confirmar

---

### [F3-03] Estruturar campo de endereço com CEP

**Prioridade:** 🟡 Médio
**Esforço:** Médio (2–3h)
**Status:** 🔴 Não iniciado

**Problema:**
O endereço de entrega é um único `<textarea>` livre, sem validação ou estrutura. Isso gera erros de entrega e dificulta o processamento dos pedidos.

**Solução:**
- Substituir o textarea por campos separados: CEP, Rua, Número, Complemento, Bairro, Cidade
- Integrar com a API pública ViaCEP (`viacep.com.br/ws/{cep}/json/`) para preenchimento automático
- Ao digitar o CEP e sair do campo, preencher Rua, Bairro e Cidade automaticamente

**Arquivos afetados:**
- `public/checkout.html`
- `public/js/checkout.js`

**Critério de conclusão:**
- [ ] Campos separados para cada parte do endereço
- [ ] CEP dispara busca automática na ViaCEP
- [ ] Campos preenchidos automaticamente após busca
- [ ] Validação: CEP inválido mostra erro
- [ ] Número e Complemento ficam para preenchimento manual

---

### [F3-04] Comunicar frete grátis e política de entrega

**Prioridade:** 🟡 Médio
**Esforço:** Pequeno (1h)
**Status:** 🟢 Concluído — 02/05/2026

**Problema:**
O frete de R$ 5,00 é cobrado sem nenhuma explicação. O cliente não sabe se existe frete grátis, qual o prazo de entrega ou a área de cobertura.

**Solução:**
- Adicionar banner no carrinho: "Frete R$ 5,00 · Entrega em até 45 min"
- Se houver valor mínimo para frete grátis no futuro, mostrar barra de progresso: "Faltam R$ X para frete grátis"
- Adicionar link "Ver área de entrega" (mesmo que seja um tooltip por enquanto)

**Arquivos afetados:**
- `public/carrinho.html`
- `public/js/carrinho.js`
- `public/css/style.css`

**Critério de conclusão:**
- [ ] Informação de frete visível no carrinho
- [ ] Prazo estimado de entrega exibido
- [ ] Design consistente com o restante da página

---

---

# FASE 4 — Mobile e Performance

> **Objetivo:** Garantir uma experiência fluida em smartphones.

---

### [F4-01] Corrigir layout do carrinho em mobile

**Prioridade:** 🟠 Alto
**Esforço:** Pequeno (1–2h)
**Status:** 🔴 Não iniciado

**Problema:**
Em mobile, o layout de 2 colunas do carrinho colapsa para 1 coluna, jogando o resumo do pedido (e o botão "Finalizar") para depois de toda a lista de itens. Em um carrinho com muitos itens, o botão fica muito longe.

**Solução:**
- Em mobile, fixar o resumo + botão "Finalizar Pedido" no rodapé da tela (`position: sticky; bottom: 0`)
- A lista de itens fica com scroll normal acima
- O resumo fixo mostra: total e botão de finalizar

**Arquivos afetados:**
- `public/css/style.css`
- `public/carrinho.html`

**Critério de conclusão:**
- [ ] Em mobile, botão "Finalizar" sempre visível na tela
- [ ] Lista de itens com scroll independente
- [ ] Não sobrepõe itens importantes

---

### [F4-02] Skeleton loader nos cards de produto

**Prioridade:** 🟡 Médio
**Esforço:** Pequeno (1–2h)
**Status:** 🔴 Não iniciado

**Problema:**
Enquanto os produtos carregam da API, aparece apenas um spinner centralizado. Em conexões lentas, a página parece vazia ou quebrada.

**Solução:**
- Substituir o spinner por skeleton loaders no formato dos cards de produto
- Exibir 6 cards "fantasma" com animação de pulso enquanto a API responde
- Substituir pelos cards reais quando os dados chegarem

**Arquivos afetados:**
- `public/css/style.css` (animação skeleton)
- `public/js/cardapio.js` (renderização dos skeletons)

**Critério de conclusão:**
- [ ] 6 skeleton cards aparecem enquanto a API carrega
- [ ] Animação de pulso suave
- [ ] Transição limpa do skeleton para o card real

---

### [F4-03] Lazy loading e limite inicial de produtos

**Prioridade:** 🟡 Médio
**Esforço:** Médio (2–3h)
**Status:** 🔴 Não iniciado

**Problema:**
Todos os produtos são carregados de uma vez na memória. Com 17 produtos isso não é problema, mas conforme o catálogo crescer, vai impactar performance e tempo de carregamento.

**Solução:**
- Carregar inicialmente 12 produtos
- Adicionar botão "Ver mais" ou scroll infinito para carregar os próximos
- Manter o filtro de categoria funcionando com paginação

**Arquivos afetados:**
- `public/js/cardapio.js`
- `public/css/style.css` (botão "Ver mais")

**Critério de conclusão:**
- [ ] Máximo 12 produtos na carga inicial
- [ ] Botão "Ver mais" carrega próximos 12
- [ ] Filtro de categoria reseta a paginação
- [ ] Busca funciona sobre todos os produtos (não só os carregados)

---

---

# FASE 5 — Funcionalidades Extras

> **Objetivo:** Agregar valor e fidelizar o cliente.

---

### [F5-01] Cupom de desconto no carrinho

**Prioridade:** 🟡 Médio
**Esforço:** Alto (4–6h — requer backend)
**Status:** 🔴 Não iniciado

**Problema:**
Não existe mecanismo de promoções ou descontos. Cupons são uma ferramenta importante para campanhas de marketing e retenção.

**Solução:**
- Adicionar campo "Código de cupom" no resumo do carrinho
- Backend: nova tabela `cupons` (código, tipo, valor, validade, limite de uso)
- Nova rota `POST /api/cupons/validar` que retorna o desconto
- Frontend: aplicar desconto no total e mostrar linha "Desconto: −R$ X"

**Arquivos afetados:**
- `public/carrinho.html`
- `public/js/carrinho.js`
- `database/schema.sql` (nova tabela)
- `src/routes/` e `src/controllers/` (nova rota)

**Critério de conclusão:**
- [ ] Campo de cupom visível no carrinho
- [ ] Validação retorna erro claro para cupom inválido/expirado
- [ ] Desconto aparece como linha separada no resumo
- [ ] Total final já com desconto aplicado

---

### [F5-02] Status do pedido em tempo real

**Prioridade:** 🟡 Médio
**Esforço:** Alto (4–6h — requer backend)
**Status:** 🔴 Não iniciado

**Problema:**
Após fazer o pedido, o cliente é redirecionado para `pedidos.html` mas não há atualização automática do status. Precisa recarregar a página manualmente.

**Solução:**
- Implementar polling a cada 30 segundos na página de pedidos (`setInterval`)
- Exibir linha do tempo visual do pedido: `Confirmado → Preparando → Saiu → Entregue`
- Badge colorido por status (amarelo, laranja, azul, verde)

**Arquivos afetados:**
- `public/pedidos.html`
- `public/js/pedidos.js`
- `public/css/style.css`

**Critério de conclusão:**
- [ ] Status atualiza automaticamente sem reload
- [ ] Linha do tempo visual por pedido
- [ ] Badge de cor por status
- [ ] Para o polling quando pedido está "Entregue" ou "Cancelado"

---

### [F5-03] Favoritos / Lista de desejos

**Prioridade:** 🟢 Baixo
**Esforço:** Médio (2–3h)
**Status:** 🔴 Não iniciado

**Problema:**
Não há como salvar produtos favoritos. Clientes recorrentes precisam encontrar os mesmos produtos toda vez do zero.

**Solução:**
- Ícone de coração `♡` em cada card de produto
- Salvar favoritos no `localStorage` (sem necessidade de login)
- Aba "Favoritos" no cardápio filtra apenas os produtos curtidos

**Arquivos afetados:**
- `public/js/cardapio.js`
- `public/css/style.css`

**Critério de conclusão:**
- [ ] Ícone de coração no card
- [ ] Clique adiciona/remove dos favoritos
- [ ] Aba "Favoritos" funciona no filtro de categorias
- [ ] Persiste após recarregar a página

---

### [F5-04] Avaliação de produto com estrelas

**Prioridade:** 🟢 Baixo
**Esforço:** Alto (5–7h — requer backend)
**Status:** 🔴 Não iniciado

**Problema:**
Não há social proof nos produtos. Avaliações aumentam a confiança do cliente e auxiliam na decisão de compra.

**Solução:**
- Adicionar média de estrelas (1–5) abaixo do nome do produto no card
- No modal de detalhe, exibir avaliações com nome e comentário
- Após receber um pedido, exibir CTA para avaliar os produtos comprados

**Arquivos afetados:**
- `database/schema.sql` (tabela `avaliacoes`)
- `src/routes/` e `src/controllers/` (rotas de avaliação)
- `public/js/cardapio.js`
- `public/pedidos.html`

**Critério de conclusão:**
- [ ] Estrelas visíveis nos cards
- [ ] Avaliações exibidas no modal do produto
- [ ] Cliente pode avaliar após receber pedido
- [ ] Admin pode moderar avaliações no painel

---

### [F5-05] Ordenação dos produtos no cardápio

**Prioridade:** 🟢 Baixo
**Esforço:** Pequeno (1h)
**Status:** 🔴 Não iniciado

**Problema:**
Os produtos são exibidos sempre na mesma ordem (destaques primeiro, depois alfabético). Não há controle do cliente sobre a ordenação.

**Solução:**
- Adicionar dropdown "Ordenar por" ao lado das abas de categoria
- Opções: Relevância (padrão), Menor preço, Maior preço, Nome A→Z

**Arquivos afetados:**
- `public/index.html`
- `public/js/cardapio.js`
- `public/css/style.css`

**Critério de conclusão:**
- [ ] Dropdown visível e estilizado
- [ ] Ordenação aplicada em tempo real
- [ ] Mantém o filtro de categoria ativo ao ordenar

---

---

## Resumo Executivo

| ID | Melhoria | Prioridade | Esforço | Status |
|----|----------|-----------|---------|--------|
| F1-01 | Homepage = Cardápio | 🔴 Crítico | Médio | 🟢 02/05 |
| F1-02 | Banner compacto (não 100vh) | 🔴 Crítico | Pequeno | 🟢 02/05 |
| F1-03 | Atualizar links de navegação | 🟠 Alto | Pequeno | 🟢 02/05 |
| F2-01 | Busca por nome de produto | 🔴 Crítico | Pequeno | 🟢 02/05 |
| F2-02 | Modal de detalhe do produto | 🟠 Alto | Médio | 🟢 02/05 |
| F2-03 | Indicador de quantidade no card | 🟠 Alto | Pequeno | 🟢 02/05 |
| F2-04 | Indicador de scroll nas abas | 🟡 Médio | Pequeno | 🟢 02/05 |
| F3-01 | Botões de quantidade maiores | 🟠 Alto | Pequeno | 🟢 02/05 |
| F3-02 | Stepper de progresso no checkout | 🟠 Alto | Médio | 🟢 02/05 |
| F3-03 | Campo de endereço com CEP | 🟡 Médio | Médio | 🟢 02/05 |
| F3-04 | Comunicar frete e prazo de entrega | 🟡 Médio | Pequeno | 🟢 02/05 |
| F4-01 | Carrinho fixo no rodapé em mobile | 🟠 Alto | Pequeno | 🟢 02/05 |
| F4-02 | Skeleton loader nos cards | 🟡 Médio | Pequeno | 🟢 02/05 |
| F4-03 | Lazy loading de produtos | 🟡 Médio | Médio | 🟢 02/05 |
| F5-01 | Cupom de desconto | 🟡 Médio | Alto | 🔴 |
| F5-02 | Status do pedido em tempo real | 🟡 Médio | Alto | 🔴 |
| F5-03 | Favoritos / Lista de desejos | 🟢 Baixo | Médio | 🔴 |
| F5-04 | Avaliação com estrelas | 🟢 Baixo | Alto | 🔴 |
| F5-05 | Ordenação dos produtos | 🟢 Baixo | Pequeno | 🔴 |

---

## Ordem de Execução Recomendada

```
Semana 1 — Estrutura base
  → F1-01 · F1-02 · F1-03 · F2-01

Semana 2 — Produto e carrinho
  → F2-02 · F2-03 · F3-01 · F4-01

Semana 3 — Checkout e polimento
  → F3-02 · F3-03 · F3-04 · F2-04

Semana 4 — Performance e extras simples
  → F4-02 · F4-03 · F5-05 · F5-03

Futuro — Funcionalidades com backend
  → F5-01 · F5-02 · F5-04
```

---

*Documento gerado em 02/05/2026 — Doce Sabor*
