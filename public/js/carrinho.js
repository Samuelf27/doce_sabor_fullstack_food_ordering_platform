let cupomAtivo = null;

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  document.getElementById('cupomInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') aplicarCupom();
  });
});

function renderCart() {
  const items   = Cart.getItems();
  const list    = document.getElementById('cartList');
  const summary = document.getElementById('cartSummary');
  if (!list) return;

  if (!items.length) {
    cupomAtivo = null;
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
  const subtotal = Cart.getTotal();
  const entrega  = subtotal > 0 ? 5 : 0;
  const desconto = cupomAtivo ? Math.min(cupomAtivo.desconto, subtotal) : 0;
  const total    = subtotal - desconto + entrega;

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

  const descontoRow = document.getElementById('descontoRow');
  if (descontoRow) {
    if (cupomAtivo && desconto > 0) {
      descontoRow.style.display = 'flex';
      document.getElementById('cupomCodigo').textContent  = `(${cupomAtivo.codigo})`;
      document.getElementById('descontoValor').textContent = `− ${formatCurrency(desconto)}`;
    } else {
      descontoRow.style.display = 'none';
    }
  }
}

async function aplicarCupom() {
  const input  = document.getElementById('cupomInput');
  const msgEl  = document.getElementById('cupomMsg');
  const codigo = input?.value.trim().toUpperCase();
  if (!codigo) return;

  const subtotal = Cart.getTotal();

  msgEl.style.display = 'block';
  msgEl.style.color   = 'var(--gray)';
  msgEl.textContent   = 'Validando...';

  try {
    const res = await API.post('/cupons/validar', { codigo, subtotal });
    cupomAtivo          = res;
    msgEl.style.color   = 'var(--success)';
    msgEl.textContent   = `✅ Cupom "${res.codigo}" aplicado! ${
      res.tipo === 'percentual' ? `${res.valor}% de desconto` : `R$ ${res.valor.toFixed(2)} de desconto`
    }`;
    updateSummary();
  } catch (err) {
    cupomAtivo          = null;
    msgEl.style.color   = 'var(--danger)';
    msgEl.textContent   = `❌ ${err.message}`;
    updateSummary();
  }
}

function changeQty(id, qty) {
  if (qty <= 0) { Cart.remove(id); }
  else          { Cart.setQty(id, qty); }
  renderCart();
}

function removeItem(id) {
  Cart.remove(id);
  renderCart();
  showToast('Item removido.', 'warning');
}

function clearCart() {
  if (confirm('Limpar todo o carrinho?')) {
    Cart.clear();
    cupomAtivo = null;
    renderCart();
  }
}
