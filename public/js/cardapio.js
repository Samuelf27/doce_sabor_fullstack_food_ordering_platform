let allProducts = [];
let currentCategory = null;
let searchQuery = '';
let searchTimeout = null;

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('categoria')) currentCategory = Number(params.get('categoria'));

  await Promise.all([loadCategories(), loadProducts()]);

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        searchQuery = e.target.value.trim().toLowerCase();
        if (searchQuery) {
          currentCategory = null;
          document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
          const allBtn = document.querySelector('.tab-btn[data-cat="all"]');
          if (allBtn) allBtn.classList.add('active');
        }
        renderProducts();
      }, 300);
    });
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeProductModal();
  });
});

/* ── Categorias ─────────────────────────────────────────── */

async function loadCategories() {
  const tabs = document.getElementById('categoryTabs');
  if (!tabs) return;
  try {
    const cats = await API.get('/produtos/categorias');
    tabs.innerHTML = `
      <button class="tab-btn ${!currentCategory ? 'active' : ''}" data-cat="all" onclick="filterCategory(null, this)">
        🍦 Todos
      </button>
      ${cats.map(c => `
        <button class="tab-btn ${currentCategory === c.id ? 'active' : ''}" data-cat="${c.id}" onclick="filterCategory(${c.id}, this)">
          ${c.icone} ${c.nome}
        </button>
      `).join('')}
    `;
  } catch (e) {
    console.error(e);
  }
}

/* ── Produtos ───────────────────────────────────────────── */

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

function filterCategory(catId, btn) {
  currentCategory = catId;
  searchQuery = '';
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderProducts();
}

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  let filtered = allProducts;

  if (searchQuery) {
    filtered = filtered.filter(p =>
      p.nome.toLowerCase().includes(searchQuery) ||
      (p.descricao && p.descricao.toLowerCase().includes(searchQuery))
    );
  } else if (currentCategory) {
    filtered = filtered.filter(p => p.categoria_id === currentCategory);
  }

  if (!filtered.length) {
    const msg = searchQuery
      ? `Nenhum produto encontrado para "<strong>${searchQuery}</strong>".`
      : 'Nenhum produto nesta categoria.';
    grid.innerHTML = `<div style="text-align:center;padding:60px;color:var(--gray);grid-column:1/-1">${msg}</div>`;
    return;
  }

  grid.innerHTML = filtered.map(p => productCard(p)).join('');
}

function productCard(p) {
  const cartItem = Cart.getItems().find(i => i.id === p.id);
  const qty = cartItem ? cartItem.quantidade : 0;
  const nomeEscaped = p.nome.replace(/'/g, "\\'");
  const emojiEscaped = (p.imagem_emoji || '🍨').replace(/'/g, "\\'");

  const actionBtn = qty > 0
    ? `<div class="qty-controls" onclick="event.stopPropagation()">
         <button class="qty-btn" onclick="changeQty(${p.id}, -1)">−</button>
         <span class="qty-value">${qty}</span>
         <button class="qty-btn" onclick="changeQty(${p.id}, 1)">+</button>
       </div>`
    : `<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();addToCart(${p.id},'${nomeEscaped}',${p.preco},'${emojiEscaped}')">
         + Carrinho
       </button>`;

  return `
    <div class="product-card" onclick="openProductModal(${p.id})">
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
          ${actionBtn}
        </div>
      </div>
    </div>`;
}

function addToCart(id, nome, preco, emoji) {
  Cart.add({ id, nome, preco, imagem_emoji: emoji });
  showToast(`${nome} adicionado! 🛒`, 'success');
  renderProducts();
}

function changeQty(id, delta) {
  const item = Cart.getItems().find(i => i.id === id);
  if (!item) return;
  const newQty = item.quantidade + delta;
  if (newQty <= 0) Cart.remove(id); else Cart.setQty(id, newQty);
  renderProducts();
}

/* ── Modal de Produto ───────────────────────────────────── */

function openProductModal(id) {
  const p = allProducts.find(p => p.id === id);
  if (!p) return;

  document.getElementById('modalEmoji').textContent = p.imagem_emoji || '🍨';
  document.getElementById('modalName').textContent  = p.nome;
  document.getElementById('modalCat').textContent   = `${p.categoria_icone || ''} ${p.categoria_nome || ''}`;
  document.getElementById('modalDesc').textContent  = p.descricao || '';
  document.getElementById('modalPrice').textContent = formatCurrency(p.preco);

  refreshModalAction(id);
  document.getElementById('productModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeProductModal() {
  document.getElementById('productModal')?.classList.remove('active');
  document.body.style.overflow = '';
}

function refreshModalAction(id) {
  const p = allProducts.find(p => p.id === id);
  if (!p) return;
  const cartItem = Cart.getItems().find(i => i.id === id);
  const qty = cartItem ? cartItem.quantidade : 0;
  const nomeEscaped = p.nome.replace(/'/g, "\\'");
  const emojiEscaped = (p.imagem_emoji || '🍨').replace(/'/g, "\\'");

  const actionEl = document.getElementById('modalAction');
  if (!actionEl) return;

  if (qty > 0) {
    actionEl.innerHTML = `
      <div class="qty-controls">
        <button class="qty-btn" onclick="modalChangeQty(${p.id}, -1)">−</button>
        <span class="qty-value">${qty}</span>
        <button class="qty-btn" onclick="modalChangeQty(${p.id}, 1)">+</button>
      </div>`;
  } else {
    actionEl.innerHTML = `
      <button class="btn btn-primary" onclick="modalAddToCart(${p.id},'${nomeEscaped}',${p.preco},'${emojiEscaped}')">
        + Adicionar ao Carrinho
      </button>`;
  }
}

function modalAddToCart(id, nome, preco, emoji) {
  Cart.add({ id, nome, preco, imagem_emoji: emoji });
  showToast(`${nome} adicionado! 🛒`, 'success');
  renderProducts();
  refreshModalAction(id);
}

function modalChangeQty(id, delta) {
  const item = Cart.getItems().find(i => i.id === id);
  if (!item) return;
  const newQty = item.quantidade + delta;
  if (newQty <= 0) Cart.remove(id); else Cart.setQty(id, newQty);
  renderProducts();
  refreshModalAction(id);
}
