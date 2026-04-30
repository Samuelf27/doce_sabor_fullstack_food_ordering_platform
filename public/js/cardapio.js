let allProducts = [];
let currentCategory = null;

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('categoria')) currentCategory = Number(params.get('categoria'));

  await loadCategories();
  await loadProducts();
});

async function loadCategories() {
  const tabs = document.getElementById('categoryTabs');
  if (!tabs) return;
  try {
    const cats = await API.get('/produtos/categorias');
    tabs.innerHTML = `
      <button class="tab-btn ${!currentCategory ? 'active' : ''}" onclick="filterCategory(null)">
        🍦 Todos
      </button>
      ${cats.map(c => `
        <button class="tab-btn ${currentCategory === c.id ? 'active' : ''}" onclick="filterCategory(${c.id})">
          ${c.icone} ${c.nome}
        </button>
      `).join('')}
    `;
  } catch (e) {
    console.error(e);
  }
}

async function loadProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  grid.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  try {
    allProducts = await API.get('/produtos');
    renderProducts();
  } catch {
    grid.innerHTML = '<p style="text-align:center;padding:60px;color:var(--danger)">Erro ao carregar produtos.</p>';
  }
}

function filterCategory(catId) {
  currentCategory = catId;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  renderProducts();
}

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  const filtered = currentCategory
    ? allProducts.filter(p => p.categoria_id === currentCategory)
    : allProducts;

  if (!filtered.length) {
    grid.innerHTML = '<p style="text-align:center;padding:60px;color:var(--gray)">Nenhum produto nesta categoria.</p>';
    return;
  }

  grid.innerHTML = filtered.map(p => `
    <div class="product-card">
      <div class="product-card-img">
        <span>${p.imagem_emoji || '🍨'}</span>
        ${p.destaque ? '<span class="badge-destaque">⭐ Destaque</span>' : ''}
      </div>
      <div class="product-card-body">
        <div class="product-card-cat">${p.categoria_icone || ''} ${p.categoria_nome || ''}</div>
        <div class="product-card-name">${p.nome}</div>
        <div class="product-card-desc">${p.descricao || ''}</div>
        <div class="product-card-footer">
          <div class="product-price">${formatCurrency(p.preco)}</div>
          <button class="btn btn-primary btn-sm" onclick="addToCart(${p.id},'${p.nome.replace(/'/g,"\\'")}',${p.preco},'${p.imagem_emoji || '🍨'}')">
            + Carrinho
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function addToCart(id, nome, preco, emoji) {
  Cart.add({ id, nome, preco, imagem_emoji: emoji });
  showToast(`${nome} adicionado! 🛒`, 'success');
}
