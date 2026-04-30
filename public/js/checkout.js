let selectedPayment = 'pix';

document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.requireLogin()) return;
  renderOrderItems();
  loadUserAddress();

  document.querySelectorAll('.payment-option').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.payment-option').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedPayment = btn.dataset.value;
    });
  });

  document.getElementById('checkoutForm')?.addEventListener('submit', submitOrder);
});

function renderOrderItems() {
  const items = Cart.getItems();
  if (!items.length) { window.location.href = '/carrinho.html'; return; }

  const list     = document.getElementById('checkoutItems');
  const subtotal = Cart.getTotal();
  const entrega  = 5;

  if (list) {
    list.innerHTML = items.map(i => `
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--gray-lighter);">
        <span style="font-size:.88rem">${i.imagem_emoji} ${i.nome} ×${i.quantidade}</span>
        <span style="font-weight:600;font-size:.88rem">${formatCurrency(i.preco * i.quantidade)}</span>
      </div>
    `).join('');
  }

  const elSub  = document.getElementById('checkSubtotal');
  const elFret = document.getElementById('checkFrete');
  const elTot  = document.getElementById('checkTotal');
  if (elSub)  elSub.textContent  = formatCurrency(subtotal);
  if (elFret) elFret.textContent = formatCurrency(entrega);
  if (elTot)  elTot.textContent  = formatCurrency(subtotal + entrega);
}

async function loadUserAddress() {
  try {
    const user = await API.get('/auth/perfil');
    if (user.endereco) {
      document.getElementById('endereco').value = user.endereco;
    }
  } catch { /* sem endereço salvo */ }
}

async function submitOrder(e) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  btn.disabled   = true;
  btn.textContent = '⏳ Processando...';

  try {
    const items    = Cart.getItems();
    const endereco = document.getElementById('endereco').value.trim();
    const obs      = document.getElementById('observacoes').value.trim();

    if (!endereco) { showToast('Informe o endereço de entrega.', 'warning'); return; }

    const res = await API.post('/pedidos', {
      itens:            items.map(i => ({ produto_id: i.id, quantidade: i.quantidade })),
      endereco_entrega: endereco,
      observacoes:      obs,
      tipo_pagamento:   selectedPayment
    });

    Cart.clear();
    showToast('Pedido realizado com sucesso! 🎉', 'success');
    setTimeout(() => window.location.href = '/pedidos.html', 1500);
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled   = false;
    btn.textContent = '✅ Confirmar Pedido';
  }
}
