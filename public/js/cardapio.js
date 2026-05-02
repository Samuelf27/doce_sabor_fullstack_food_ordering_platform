let allProducts     = [];
let currentCategory = null;
let searchQuery     = '';
let searchTimeout   = null;
let visibleCount    = 12;
let currentSort     = 'relevancia';
let showFavorites   = false;

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('categoria')) currentCategory = Number(params.get('categoria'));

  await Promise.all([loadCategories(), loadProducts()]);

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        searchQuery     = e.target.value.trim().toLowerCase();
        visibleCount    = 12;
        showFavorites   = false;
        if (searchQuery) {
          currentCategory = null;
          document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
          document.querySelector('.tab-btn[data-cat="all"]')?.classList.add('active');
        }
        renderProducts();
      }, 300);
    });
  }

  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeProductModal(); });
});

/* ── Favoritos (localStorage) ───────────────────────────── */

function getFavorites()         { return JSON.parse(localStorage.getItem('favoritos') || '[]'); }
function saveFavorites(ids)     { localStorage.setItem('favoritos', JSON.stringify(ids)); }
function isFavorite(id)         { return getFavorites().includes(id); }

function toggleFavorite(id, e) {
  e.stopPropagation();
  const favs = getFavorites();
  const idx  = favs.indexOf(id);
  if (idx === -1) favs.push(id); else favs.splice(idx, 1);
  saveFavorites(favs);
  renderProducts();
  if (showFavorites && favs.length === 0) {
    showFavorites = false;
    document.querySelector('.tab-btn[data-cat="all"]')?.click();
  }
}

function toggleFavoritesFilter(btn) {
  showFavorites   = !showFavorites;
  currentCategory = null;
  searchQuery     = '';
  visibleCount    = 12;
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  if (showFavorites) btn.classList.add('active');
  else document.querySelector('.tab-btn[data-cat="all"]')?.classList.add('active');
  renderProducts();
}

/* ── Ordenação ──────────────────────────────────────────── */

function changeSort(value) {
  currentSort  = value;
  visibleCount = 12;
  renderProducts();
}

function sortProducts(list) {
  const sorted = [...list];
  switch (currentSort) {
    case 'menor_preco': return sorted.sort((a, b) => a.preco - b.preco);
    case 'maior_preco': return sorted.sort((a, b) => b.preco - a.preco);
    case 'az':          return sorted.sort((a, b) => a.nome.localeCompare(b.nome));
    default:            return sorted.sort((a, b) => b.destaque - a.destaque);
  }
}

/* ── Categorias ─────────────────────────────────────────── */

async function loadCategories() {
  const tabs = document.getElementById('categoryTabs');
  if (!tabs) return;
  try {
    const cats = await API.get('/produtos/categorias');
    tabs.innerHTML = `
      <button class="tab-btn ${!currentCategory && !showFavorites ? 'active' : ''}" data-cat="all" onclick="filterCategory(null, this)">
        🍦 Todos
      </button>
      ${cats.map(c => `
        <button class="tab-btn ${currentCategory === c.id ? 'active' : ''}" data-cat="${c.id}" onclick="filterCategory(${c.id}, this)">
          ${c.icone} ${c.nome}
        </button>
      `).join('')}
      <button class="tab-btn tab-btn-fav ${showFavorites ? 'active' : ''}" data-cat="fav" onclick="toggleFavoritesFilter(this)">
        ❤️ Favoritos
      </button>
    `;
  } catch (e) { console.error(e); }
}

/* ── Produtos ───────────────────────────────────────────── */

async function loadProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  grid.innerHTML = skeletonGrid(8);
  try {
    allProducts = await API.get('/produtos');
    renderProducts();
  } catch {
    grid.innerHTML = '<p style="text-align:center;padding:60px;color:var(--danger)">Erro ao carregar produtos.</p>';
  }
}

function skeletonGrid(count) {
  return Array(count).fill(0).map(() => `
    <div class="product-card skeleton-card">
      <div class="skeleton-img skeleton-pulse"></div>
      <div class="product-card-body">
        <div class="skeleton-line skeleton-pulse" style="width:55%;height:11px;margin-bottom:10px"></div>
        <div class="skeleton-line skeleton-pulse" style="width:85%;height:17px;margin-bottom:10px"></div>
        <div class="skeleton-line skeleton-pulse" style="width:100%;height:11px;margin-bottom:5px"></div>
        <div class="skeleton-line skeleton-pulse" style="width:65%;height:11px;margin-bottom:18px"></div>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px">
          <div class="skeleton-line skeleton-pulse" style="width:72px;height:26px"></div>
          <div class="skeleton-line skeleton-pulse" style="width:100px;height:36px;border-radius:var(--border-radius-full)"></div>
        </div>
      </div>
    </div>`).join('');
}

function filterCategory(catId, btn) {
  currentCategory = catId;
  searchQuery     = '';
  showFavorites   = false;
  visibleCount    = 12;
  document.getElementById('searchInput') && (document.getElementById('searchInput').value = '');
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderProducts();
}

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  let filtered = allProducts;

  if (showFavorites) {
    const favs = getFavorites();
    filtered   = filtered.filter(p => favs.includes(p.id));
  } else if (searchQuery) {
    filtered = filtered.filter(p =>
      p.nome.toLowerCase().includes(searchQuery) ||
      (p.descricao && p.descricao.toLowerCase().includes(searchQuery))
    );
  } else if (currentCategory) {
    filtered = filtered.filter(p => p.categoria_id === currentCategory);
  }

  filtered = sortProducts(filtered);

  if (!filtered.length) {
    const msg = showFavorites
      ? 'Nenhum favorito ainda. Clique no ❤️ dos produtos para salvar!'
      : searchQuery
        ? `Nenhum produto encontrado para "<strong>${searchQuery}</strong>".`
        : 'Nenhum produto nesta categoria.';
    grid.innerHTML = `<div style="text-align:center;padding:60px;color:var(--gray);grid-column:1/-1">${msg}</div>`;
    return;
  }

  const page      = filtered.slice(0, visibleCount);
  const remaining = filtered.length - visibleCount;

  grid.innerHTML = page.map(p => productCard(p)).join('');

  if (remaining > 0) {
    const moreDiv = document.createElement('div');
    moreDiv.style.cssText = 'grid-column:1/-1;text-align:center;padding:24px 0 8px';
    moreDiv.innerHTML = `<button class="btn btn-outline" onclick="loadMore()">Ver mais ${remaining} produto${remaining !== 1 ? 's' : ''} →</button>`;
    grid.appendChild(moreDiv);
  }
}

function loadMore() { visibleCount += 12; renderProducts(); }

/* ── Card de produto ────────────────────────────────────── */

function productCard(p) {
  const cartItem     = Cart.getItems().find(i => i.id === p.id);
  const qty          = cartItem ? cartItem.quantidade : 0;
  const fav          = isFavorite(p.id);
  const nomeEscaped  = p.nome.replace(/'/g, "\\'");
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
        <button class="fav-btn ${fav ? 'active' : ''}" onclick="toggleFavorite(${p.id}, event)" title="${fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">
          ${fav ? '❤️' : '🤍'}
        </button>
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

/* ── Modal de produto ───────────────────────────────────── */

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
  const cartItem     = Cart.getItems().find(i => i.id === id);
  const qty          = cartItem ? cartItem.quantidade : 0;
  const nomeEscaped  = p.nome.replace(/'/g, "\\'");
  const emojiEscaped = (p.imagem_emoji || '🍨').replace(/'/g, "\\'");
  const actionEl     = document.getElementById('modalAction');
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
