document.addEventListener('DOMContentLoaded', async () => {
  await loadFeaturedProducts();
  await loadCategories();
});

async function loadFeaturedProducts() {
  const grid = document.getElementById('featuredProducts');
  if (!grid) return;
  try {
    const produtos = await API.get('/produtos?destaque=true');
    if (!produtos.length) { grid.innerHTML = '<p style="text-align:center;color:var(--gray)">Nenhum destaque no momento.</p>'; return; }
    grid.innerHTML = produtos.slice(0, 4).map(p => productCard(p)).join('');
  } catch (e) {
    grid.innerHTML = '<p style="text-align:center;color:var(--danger)">Erro ao carregar produtos.</p>';
  }
}

async function loadCategories() {
  const grid = document.getElementById('categoriesGrid');
  if (!grid) return;
  try {
    const cats = await API.get('/produtos/categorias');
    grid.innerHTML = cats.map(c => `
      <a href="/cardapio.html?categoria=${c.id}" class="cat-card">
        <span class="cat-icon">${c.icone}</span>
        <span class="cat-name">${c.nome}</span>
      </a>
    `).join('');
  } catch {
    grid.innerHTML = '';
  }
}

function productCard(p) {
  return `
    <div class="product-card" onclick="addToCartFromCard(${p.id},'${p.nome}',${p.preco},'${p.imagem_emoji || '🍨'}')">
      <div class="product-card-img">
        <span>${p.imagem_emoji || '🍨'}</span>
        ${p.destaque ? '<span class="badge-destaque">⭐ Destaque</span>' : ''}
      </div>
      <div class="product-card-body">
        <div class="product-card-cat">${p.categoria_icone || ''} ${p.categoria_nome || 'Produto'}</div>
        <div class="product-card-name">${p.nome}</div>
        <div class="product-card-desc">${p.descricao || ''}</div>
        <div class="product-card-footer">
          <div class="product-price">${formatCurrency(p.preco)}</div>
          <button class="btn btn-primary btn-sm">+ Carrinho</button>
        </div>
      </div>
    </div>`;
}

function addToCartFromCard(id, nome, preco, emoji) {
  Cart.add({ id, nome, preco, imagem_emoji: emoji });
  showToast(`${nome} adicionado ao carrinho! 🛒`, 'success');
}
