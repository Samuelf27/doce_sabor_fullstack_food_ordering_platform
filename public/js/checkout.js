let selectedPayment = 'pix';
let currentStep     = 1;

const PAYMENT_LABELS = {
  pix:            '📱 PIX',
  dinheiro:       '💵 Dinheiro',
  cartao_credito: '💳 Cartão de Crédito',
  cartao_debito:  '💳 Cartão de Débito'
};

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
});

/* ── CEP ────────────────────────────────────── */

function mascaraCEP(input) {
  let v = input.value.replace(/\D/g, '').slice(0, 8);
  if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5);
  input.value = v;
}

async function buscaCEP() {
  const cepEl = document.getElementById('cep');
  if (!cepEl) return;
  const cep = cepEl.value.replace(/\D/g, '');
  if (cep.length !== 8) return;

  cepEl.disabled = true;
  cepEl.placeholder = 'Buscando...';

  try {
    const res  = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await res.json();

    if (data.erro) { showToast('CEP não encontrado.', 'warning'); return; }

    document.getElementById('rua').value    = data.logradouro || '';
    document.getElementById('bairro').value = data.bairro     || '';
    document.getElementById('cidade').value = data.localidade && data.uf
      ? `${data.localidade} - ${data.uf}` : '';

    document.getElementById('numero').focus();
    showToast('Endereço preenchido!', 'success');
  } catch {
    showToast('Erro ao buscar CEP. Preencha manualmente.', 'error');
  } finally {
    cepEl.disabled    = false;
    cepEl.placeholder = '00000-000';
  }
}

function buildEndereco() {
  return [
    document.getElementById('rua')?.value.trim(),
    document.getElementById('numero')?.value.trim(),
    document.getElementById('complemento')?.value.trim(),
    document.getElementById('bairro')?.value.trim(),
    document.getElementById('cidade')?.value.trim(),
    document.getElementById('cep')?.value.trim()
  ].filter(Boolean).join(', ');
}

/* ── Stepper ────────────────────────────────── */

function goToStep(step) {
  if (step < 1 || step > 3) return;
  if (step > currentStep && !validateStep(currentStep)) return;

  currentStep = step;

  document.querySelectorAll('.checkout-step-content').forEach((el, i) => {
    el.style.display = (i + 1 === currentStep) ? 'block' : 'none';
  });

  document.querySelectorAll('.step-item').forEach((el, i) => {
    el.classList.toggle('active', i + 1 === currentStep);
    el.classList.toggle('done',   i + 1 < currentStep);
  });

  document.getElementById('conn1').classList.toggle('done', currentStep > 1);
  document.getElementById('conn2').classList.toggle('done', currentStep > 2);

  document.getElementById('btnPrev').style.display   = currentStep > 1 ? 'flex' : 'none';
  document.getElementById('btnNext').style.display   = currentStep < 3 ? 'flex' : 'none';
  document.getElementById('btnSubmit').style.display = currentStep === 3 ? 'flex' : 'none';

  if (currentStep === 3) renderReview();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateStep(step) {
  if (step === 1) {
    const rua    = document.getElementById('rua')?.value.trim();
    const numero = document.getElementById('numero')?.value.trim();
    const cidade = document.getElementById('cidade')?.value.trim();

    if (!rua || !numero || !cidade) {
      showToast('Preencha rua, número e cidade.', 'warning');
      (document.getElementById('rua') || document.getElementById('numero')).focus();
      return false;
    }
  }
  return true;
}

function renderReview() {
  const items    = Cart.getItems();
  const subtotal = Cart.getTotal();
  const obs      = document.getElementById('observacoes')?.value.trim();
  const endereco = buildEndereco();

  const reviewEl = document.getElementById('reviewContent');
  if (!reviewEl) return;

  reviewEl.innerHTML = `
    <div class="review-block">
      <div class="review-label">📍 Endereço</div>
      <div class="review-value">${endereco}</div>
      ${obs ? `<div class="review-value" style="margin-top:4px;font-style:italic;color:var(--gray)">"${obs}"</div>` : ''}
    </div>
    <div class="review-block">
      <div class="review-label">💳 Pagamento</div>
      <div class="review-value">${PAYMENT_LABELS[selectedPayment]}</div>
    </div>
    <div class="review-block">
      <div class="review-label">🛒 Itens (${Cart.getCount()})</div>
      ${items.map(i => `
        <div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--gray-lighter);font-size:.85rem">
          <span>${i.imagem_emoji} ${i.nome} ×${i.quantidade}</span>
          <span style="font-weight:600">${formatCurrency(i.preco * i.quantidade)}</span>
        </div>
      `).join('')}
      <div style="display:flex;justify-content:space-between;padding:10px 0 0;font-weight:700;color:var(--primary)">
        <span>Total</span>
        <span>${formatCurrency(subtotal + 5)}</span>
      </div>
    </div>
  `;
}

/* ── Resumo lateral ─────────────────────────── */

function renderOrderItems() {
  const items = Cart.getItems();
  if (!items.length) { window.location.href = '/carrinho.html'; return; }

  const list     = document.getElementById('checkoutItems');
  const subtotal = Cart.getTotal();

  if (list) {
    list.innerHTML = items.map(i => `
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--gray-lighter)">
        <span style="font-size:.85rem">${i.imagem_emoji} ${i.nome} ×${i.quantidade}</span>
        <span style="font-weight:600;font-size:.85rem">${formatCurrency(i.preco * i.quantidade)}</span>
      </div>
    `).join('');
  }

  const elSub  = document.getElementById('checkSubtotal');
  const elFret = document.getElementById('checkFrete');
  const elTot  = document.getElementById('checkTotal');
  if (elSub)  elSub.textContent  = formatCurrency(subtotal);
  if (elFret) elFret.textContent = formatCurrency(5);
  if (elTot)  elTot.textContent  = formatCurrency(subtotal + 5);
}

async function loadUserAddress() {
  try {
    const user = await API.get('/auth/perfil');
    if (user.endereco) {
      const ruaEl = document.getElementById('rua');
      if (ruaEl && !ruaEl.value) ruaEl.value = user.endereco;
    }
  } catch { /* sem endereço salvo */ }
}

/* ── Envio ──────────────────────────────────── */

async function submitOrder(e) {
  e.preventDefault();
  const btn = document.getElementById('btnSubmit');
  btn.disabled    = true;
  btn.textContent = '⏳ Processando...';

  try {
    const endereco = buildEndereco();
    const obs      = document.getElementById('observacoes')?.value.trim();

    if (!endereco) { showToast('Endereço inválido.', 'warning'); return; }

    await API.post('/pedidos', {
      itens:            Cart.getItems().map(i => ({ produto_id: i.id, quantidade: i.quantidade })),
      endereco_entrega: endereco,
      observacoes:      obs,
      tipo_pagamento:   selectedPayment
    });

    Cart.clear();
    showToast('Pedido realizado com sucesso! 🎉', 'success');
    setTimeout(() => window.location.href = '/pedidos.html', 1500);
  } catch (err) {
    showToast(err.message, 'error');
    btn.disabled    = false;
    btn.textContent = '✅ Confirmar Pedido';
  }
}
