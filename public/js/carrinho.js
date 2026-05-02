document.addEventListener('DOMContentLoaded', () => renderCart());

function renderCart() {
  const items   = Cart.getItems();
  const list    = document.getElementById('cartList');
  const summary = document.getElementById('cartSummary');
  if (!list) return;

  if (!items.length) {
    list.innerHTML = `
      <div class="cart-empty">
        <span class="icon">🛒</span>
        <h3>Seu carrinho está vazio</h3>
        <p>Adicione produtos do cardápio para continuar</p>
        <a href="/" class="btn btn-primary">Ver Cardápio</a>
      </div>`;
    if (summary) summary.style.display = 'none';
    return;
  }

  if (summary) summary.style.display = 'block';

  list.innerHTML = items.map(item => `
    <div class="cart-item">
      <div class="cart-item-emoji">${item.imagem_emoji || '🍨'}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.nome}</div>
        <div class="cart-item-price">${formatCurrency(item.preco)} un.</div>
      </div>
      <div class="cart-item-qty">
        <button class="qty-btn" onclick="changeQty(${item.id}, ${item.quantidade - 1})">−</button>
        <span class="qty-value">${item.quantidade}</span>
        <button class="qty-btn" onclick="changeQty(${item.id}, ${item.quantidade + 1})">+</button>
      </div>
      <div class="cart-item-sub">${formatCurrency(item.preco * item.quantidade)}</div>
      <button class="remove-btn" onclick="removeItem(${item.id})">✕</button>
    </div>
  `).join('');

  updateSummary();
}

function updateSummary() {
  const items    = Cart.getItems();
  const subtotal = Cart.getTotal();
  const entrega  = subtotal > 0 ? 5 : 0;
  const total    = subtotal + entrega;

  document.getElementById('subtotal')?.replaceWith(
    Object.assign(document.createElement('span'), { id:'subtotal', textContent: formatCurrency(subtotal) })
  );

  const elSub  = document.getElementById('subtotal');
  const elFret = document.getElementById('frete');
  const elTot  = document.getElementById('totalFinal');
  const elQty  = document.getElementById('totalQty');

  if (elSub)  elSub.textContent  = formatCurrency(subtotal);
  if (elFret) elFret.textContent = entrega > 0 ? formatCurrency(entrega) : 'Grátis';
  if (elTot)  elTot.textContent  = formatCurrency(total);
  if (elQty)  elQty.textContent  = Cart.getCount();
}

function changeQty(id, qty) { Cart.setQty(id, qty); renderCart(); }
function removeItem(id)     { Cart.remove(id); renderCart(); showToast('Item removido.', 'warning'); }
function clearCart()        { if(confirm('Limpar todo o carrinho?')) { Cart.clear(); renderCart(); } }
